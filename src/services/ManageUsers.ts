import type { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';

export class ManageUsers {
  constructor(private prisma: PrismaClient) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        applicationId: true,
        application: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateUserRole(userId: string, role: string) {
    const finalRole = role === 'ADMIN' ? 'ADMIN' : 'WORKER';

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
