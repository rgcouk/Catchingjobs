import type { PrismaClient } from '@prisma/client';
import { ForbiddenError } from './exceptions.js';

export class ManageJobPostings {
  constructor(private prisma: PrismaClient) {}

  async getJobPostings() {
    return this.prisma.jobPosting.findMany({
      include: {
        _count: {
          select: { applications: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createJobPosting(userId: string, body: any) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== 'ADMIN') {
      throw new ForbiddenError('Forbidden: Admin role required');
    }

    return this.prisma.jobPosting.create({
      data: body,
    });
  }

  async updateJobPostingStatus(id: number, status: string) {
    return this.prisma.jobPosting.update({
      where: { id },
      data: { status },
    });
  }

  async deleteJobPosting(id: number) {
    return this.prisma.jobPosting.delete({
      where: { id },
    });
  }
}
