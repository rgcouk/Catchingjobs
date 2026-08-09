import type { PrismaClient } from '@prisma/client';
import { DomainError, ApplicationNotFoundError } from './exceptions';

export class ManageApplications {
  constructor(private prisma: PrismaClient) {}

  async getApplications(skip: number, take: number) {
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        skip,
        take,
        include: { user: true, jobPosting: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count(),
    ]);
    return { data: applications, total, skip, take };
  }

  async getApplication(id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { user: true, jobPosting: true },
    });
    if (!application) {
      throw new ApplicationNotFoundError();
    }
    return application;
  }

  async updateApplication(id: number, body: any) {
    const { id: _id, createdAt, updatedAt, user, jobPosting, ...updateData } = body;

    return this.prisma.application.update({
      where: { id },
      data: updateData,
    });
  }

  async getAllApplicationsDesc() {
    return this.prisma.application.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async createApplication(body: any) {
    return this.prisma.application.create({
      data: body,
    });
  }

  async updateApplicationByRosterRef(rosterRef: string, body: any) {
    return this.prisma.application.update({
      where: { rosterRef },
      data: body,
    });
  }

  async deleteApplicationByRosterRef(rosterRef: string) {
    await this.prisma.application.delete({
      where: { rosterRef },
    });
  }
}
