import type { PrismaClient } from '@prisma/client';

export class ManageUsers {
  constructor(private prisma: PrismaClient) {}

  async getUsers() {
    return this.prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true, application: true },
    });
  }

  async inviteUser(email: string, role?: string) {
    return this.prisma.user.create({
      data: {
        email,
        role: role || 'WORKER',
        passwordHash: 'TODO_INVITE_MOCK_HASH',
      },
    });
  }
}
