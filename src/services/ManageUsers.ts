import type { PrismaClient } from '@prisma/client';
import { createClerkClient } from '@clerk/backend';

export class ManageUsers {
  constructor(private prisma: PrismaClient) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, application: true },
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
