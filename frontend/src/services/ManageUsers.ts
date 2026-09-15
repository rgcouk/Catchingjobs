import type { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';

export class ManageUsers {
  constructor(private prisma: PrismaClient) {}

  async getUsers() {
    const [users, applications] = await Promise.all([
      this.prisma.user.findMany({
        include: {
          application: {
            include: { jobPosting: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.findMany({
        include: {
          user: true,
          jobPosting: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    // Map existing users by normalized email and ID
    const userMap = new Map<string, any>();
    const emailToUserMap = new Map<string, any>();

    for (const u of users) {
      userMap.set(u.id, { ...u, source: 'REGISTERED_USER' });
      if (u.email) {
        emailToUserMap.set(u.email.toLowerCase().trim(), u.id);
      }
    }

    // Attach or create entries for all applications (including rejected, draft, new, approved, hired)
    for (const app of applications) {
      const normalizedEmail = (app.email || '').toLowerCase().trim();

      // Check if already linked to a user via relation or email
      if (app.user && userMap.has(app.user.id)) {
        const u = userMap.get(app.user.id);
        if (!u.application) {
          u.application = app;
          u.applicationId = app.id;
        }
        continue;
      }

      if (normalizedEmail && emailToUserMap.has(normalizedEmail)) {
        const userId = emailToUserMap.get(normalizedEmail);
        const u = userMap.get(userId);
        if (u && !u.application) {
          u.application = app;
          u.applicationId = app.id;
        }
        continue;
      }

      // Candidate has an application but no user account (e.g. rejected before signup, guest applicant, or draft)
      const syntheticId = `app_${app.id}`;
      userMap.set(syntheticId, {
        id: syntheticId,
        email: app.email || `applicant-${app.rosterRef.toLowerCase()}@catchingjobs.co.uk`,
        role: 'WORKER',
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        applicationId: app.id,
        application: app,
        source: 'APPLICANT',
      });
    }

    // Return all unified CRM contacts sorted newest first
    return Array.from(userMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  async updateUserRole(userId: string, role: string) {
    const finalRole = role === 'ADMIN' ? 'ADMIN' : 'WORKER';

    if (userId.startsWith('app_')) {
      // Synthetic applicant record
      return { id: userId, role: finalRole };
    }

    // Update in Clerk if API key configured
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        await clerkClient.users.updateUserMetadata(userId, {
          publicMetadata: { role: finalRole },
        });
      } catch (err) {
        console.warn(
          'Could not update Clerk metadata directly (user might not be in Clerk yet):',
          err,
        );
      }
    }

    // Update in Prisma
    return this.prisma.user.update({
      where: { id: userId },
      data: { role: finalRole },
      include: { application: true },
    });
  }

  async deleteUser(userId: string) {
    if (userId.startsWith('app_')) {
      const appId = parseInt(userId.replace('app_', ''), 10);
      return this.prisma.application.delete({
        where: { id: appId },
      });
    }

    if (process.env.CLERK_SECRET_KEY) {
      try {
        const clerkClient = createClerkClient({
          secretKey: process.env.CLERK_SECRET_KEY,
        });
        await clerkClient.users.deleteUser(userId);
      } catch (err) {
        console.warn('Could not delete user in Clerk:', err);
      }
    }

    return this.prisma.user.delete({
      where: { id: userId },
    });
  }

  async inviteUser(email: string, role?: string) {
    const finalRole = role || 'WORKER';
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    let clerkUser;

    // Check if user already exists in Clerk
    const userList = await clerkClient.users.getUserList({ emailAddress: [email] });

    if (userList.data && userList.data.length > 0) {
      clerkUser = userList.data[0];
    } else {
      // Create a new user in Clerk
      clerkUser = await clerkClient.users.createUser({
        emailAddress: [email],
        skipPasswordRequirement: true,
      });
    }

    // Synchronize the role with Clerk's public metadata
    await clerkClient.users.updateUserMetadata(clerkUser.id, {
      publicMetadata: { role: finalRole },
    });

    // Write the synchronized user to the Prisma database
    return this.prisma.user.upsert({
      where: { id: clerkUser.id },
      update: {
        role: finalRole,
      },
      create: {
        id: clerkUser.id,
        email,
        role: finalRole,
        passwordHash: 'TODO_INVITE_MOCK_HASH',
      },
    });
  }
}
