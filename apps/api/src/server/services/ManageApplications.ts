import { serializable } from '../db-transaction.js';
import { validateDocumentReferences } from '../integrations/document-references.js';
import { EmailService, enqueueOnboardingEmails } from './EmailService.js';
import { randomBytes } from 'node:crypto';
import {
  workerProfileSchema,
  employmentApplicationSchema,
  adminApplicationSchema,
  paginationSchema,
} from '@catchingjobs/shared/validation';
import type { PrismaClient, Application } from '@prisma/client';
import {
  DomainError,
  ApplicationNotFoundError,
  RightToWorkRequiredError,
  ValidationError,
  ForbiddenError,
} from './exceptions.js';

export interface CreateDraftApplicationInput {
  name: string;
  phone: string;
  email?: string | null;
  town: string;
  sector: 'chickens' | 'turkeys' | 'chicken' | 'turkey' | string;
  hasRightToWork: boolean;
  jobPostingId?: number | null;
}

export interface ApplicationDTO {
  id: number;
  rosterRef: string;
  name: string;
  email?: string | null;
  phone: string;
  town: string;
  sector: string;
  status: 'Draft' | 'NEW' | 'REVIEWING' | 'APPROVED' | 'HIRED' | 'REJECTED' | string;
  hasRightToWork: boolean | null;
  shiftAvailability?: string;
  timestamp?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ManageApplications {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generates a unique roster reference code (e.g., PL-CHI-4821)
   */
  private generateRosterRef(sector: string): string {
    const normSector = sector.toLowerCase().includes('turk') ? 'TUR' : 'CHI';
    const randDigits = randomBytes(12).toString('hex').toUpperCase();
    return `PL-${normSector}-${randDigits}`;
  }

  /**
   * Maps an Application database entity to clean ApplicationDTO
   */
  private toDTO(app: any): ApplicationDTO {
    return {
      id: app.id,
      rosterRef: app.rosterRef,
      name: app.name,
      email: app.email ?? null,
      phone: app.phone,
      town: app.town,
      sector: app.sector,
      status: app.status,
      hasRightToWork: app.hasRightToWork ?? true,
      shiftAvailability: app.shiftAvailability || 'Any',
      timestamp: app.timestamp,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
    };
  }

  /**
   * Creates an initial Draft Application record after automated triage pass.
   * Throws RightToWorkRequiredError if hasRightToWork is false.
   */
  async createDraftApplication(input: CreateDraftApplicationInput): Promise<ApplicationDTO> {
    // 1. Enforce Right to Work invariant
    if (input.hasRightToWork !== true) {
      throw new RightToWorkRequiredError();
    }

    // 2. Validate mandatory fields
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Candidate name is required (minimum 2 characters).');
    }
    if (!input.phone || input.phone.trim().length === 0) {
      throw new ValidationError('Phone number is required.');
    }
    if (!input.town || input.town.trim().length === 0) {
      throw new ValidationError('Town is required.');
    }

    const secLower = typeof input.sector === 'string' ? input.sector.trim().toLowerCase() : '';
    if (!secLower || (!secLower.startsWith('chick') && !secLower.startsWith('turk'))) {
      throw new ValidationError('Valid sector is required.');
    }

    const cleanName = input.name.trim();
    const cleanPhone = input.phone.trim();
    const cleanEmail = input.email ? input.email.trim().toLowerCase() : null;
    const cleanTown = input.town.trim();
    const cleanSector = secLower.startsWith('turk') ? 'turkey' : 'chicken';
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Public contact details do not prove ownership. Resume only after authenticated claiming.
    const rosterRef = this.generateRosterRef(cleanSector);

    // 5. Persist Draft Application
    const application = await this.prisma.application.create({
      data: {
        rosterRef,
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        town: cleanTown,
        sector: cleanSector,
        hasRightToWork: true,
        rightToWorkUK: true,
        shiftAvailability: 'Any',
        status: 'Draft',
        timestamp,
        contacted: false,
        safetyResourcesSent: false,
        safetyTasksCompleted: false,
        declarationSigned: false,
        profileFormCompleted: false,
        ...(input.jobPostingId ? { jobPostingId: Number(input.jobPostingId) } : {}),
      },
    });

    return this.toDTO(application);
  }

  /**
   * Links an authenticated Clerk user to an existing Draft Application
   */
  async linkUserToDraft(
    rosterRef: string,
    clerkUserId: string,
    userEmail?: string,
  ): Promise<ApplicationDTO> {
    return serializable(this.prisma, async (tx) => {
      const application = await tx.application.findUnique({
        where: { rosterRef },
        include: { user: { select: { id: true } } },
      });
      if (!application) throw new ApplicationNotFoundError();
      if (
        !userEmail ||
        !application.email ||
        application.email.trim().toLowerCase() !== userEmail.trim().toLowerCase()
      ) {
        throw new ForbiddenError('Application ownership could not be verified.');
      }
      if (application.user && application.user.id !== clerkUserId)
        throw new ForbiddenError('Application is already linked.');
      const existingUser = await tx.user.findUnique({ where: { id: clerkUserId } });
      if (existingUser?.applicationId && existingUser.applicationId !== application.id)
        throw new ForbiddenError('Account already has a linked application.');
      if (application.status !== 'Draft' && application.user?.id !== clerkUserId)
        throw new ForbiddenError('Application cannot be claimed.');
      await tx.user.upsert({
        where: { id: clerkUserId },
        update: { applicationId: application.id, email: userEmail },
        create: {
          id: clerkUserId,
          email: userEmail,
          passwordHash: '',
          role: 'WORKER',
          applicationId: application.id,
        },
      });
      return this.toDTO(application);
    });
  }

  async getApplications(skip: number, take: number) {
    ({ skip, take } = paginationSchema.parse({ skip, take }));
    const [applications, total] = await Promise.all([
      this.prisma.application.findMany({
        skip,
        take,
        include: { user: { select: { id: true, email: true, role: true } }, jobPosting: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.application.count(),
    ]);
    return { data: applications, total, skip, take };
  }

  async getApplication(id: number) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: { user: { select: { id: true, email: true, role: true } }, jobPosting: true },
    });
    if (!application) {
      throw new ApplicationNotFoundError();
    }
    return application;
  }

  async updateApplication(id: number, body: any) {
    const updateData = adminApplicationSchema.parse(body);
    for (let attempt = 0; ; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const previous = await tx.application.findUnique({ where: { id } });
            if (!previous) throw new ApplicationNotFoundError();
            const application = await tx.application.update({ where: { id }, data: updateData });
            if (updateData.status && previous.status !== application.status && application.email) {
              const mail = new EmailService(
                tx,
                `status:${id}:${application.status}:${application.updatedAt.toISOString()}`,
              );
              await mail.sendStatusChangeEmail(
                {
                  name: application.name,
                  email: application.email,
                  rosterRef: application.rosterRef,
                  town: application.town,
                  sector: application.sector,
                },
                application.status,
              );
            }
            return application;
          },
          { isolationLevel: 'Serializable' },
        );
      } catch (error) {
        if (
          attempt < 2 &&
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          error.code === 'P2034'
        )
          continue;
        throw error;
      }
    }
  }

  async getAllApplicationsDesc() {
    return this.prisma.application.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
    });
  }

  async createApplication(body: any) {
    const fields = adminApplicationSchema.parse(body);
    if (!fields.name || !fields.phone || !fields.town || !fields.sector)
      throw new ValidationError('Name, phone, town and sector are required.');
    return this.prisma.application.create({
      data: {
        ...fields,
        name: fields.name,
        phone: fields.phone,
        town: fields.town,
        sector: fields.sector,
        rosterRef: this.generateRosterRef(fields.sector),
        shiftAvailability: fields.shiftAvailability || 'Any',
        timestamp: new Date().toISOString(),
      },
    });
  }

  async updateApplicationByRosterRef(rosterRef: string, body: any) {
    return this.prisma.application.update({
      where: { rosterRef },
      data: adminApplicationSchema.parse(body),
    });
  }

  async deleteApplicationByRosterRef(rosterRef: string) {
    await this.prisma.application.delete({
      where: { rosterRef },
    });
  }

  /**
   * Updates the authenticated user's Draft Application (Auto-save)
   */
  async updateMyDraftApplication(clerkUserId: string, data: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: clerkUserId },
    });

    if (!user || !user.applicationId) {
      throw new ApplicationNotFoundError();
    }

    // Only allow updating if it's still a Draft (prevent modifying after submission)
    const application = await this.prisma.application.findUnique({
      where: { id: user.applicationId },
    });

    if (!application || application.status !== 'Draft') {
      throw new DomainError(
        'Cannot update application because it is no longer in Draft status',
        400,
      );
    }

    const fields = workerProfileSchema.parse(data);
    if (
      application.applicationFormVersion === 'jotform-v1' &&
      fields.applicationFormVersion === null
    )
      throw new ValidationError('The application form version cannot be removed.');
    if (!(await validateDocumentReferences(clerkUserId, fields)))
      throw new ValidationError('Invalid document reference.');
    const updated = await this.prisma.application.updateMany({
      where: { id: user.applicationId, status: 'Draft' },
      data: fields,
    });
    if (!updated.count) throw new DomainError('Draft has already been submitted.', 409);
    return this.prisma.application.findUniqueOrThrow({ where: { id: user.applicationId } });
  }

  /**
   * Submits the authenticated user's Draft Application, changing status to NEW
   */
  async submitMyDraftApplication(clerkUserId: string) {
    return serializable(this.prisma, async (tx) => {
      const user = await tx.user.findUnique({ where: { id: clerkUserId } });
      if (!user?.applicationId) throw new ApplicationNotFoundError();
      const application = await tx.application.findUnique({ where: { id: user.applicationId } });
      if (!application) throw new ApplicationNotFoundError();
      if (application.status === 'NEW') {
        await enqueueOnboardingEmails(tx, application);
        return application;
      }
      if (application.status !== 'Draft')
        throw new DomainError('Application is not in Draft status or does not exist', 409);
      if (
        !application.declarationSigned ||
        !application.hasRightToWork ||
        !application.name ||
        !application.phone ||
        !application.town
      )
        throw new ValidationError('Complete required details and declaration before submitting.');
      const { success } = employmentApplicationSchema.safeParse(
        Object.fromEntries(
          Object.keys(workerProfileSchema.shape).map((key) => [
            key,
            application[key as keyof typeof application],
          ]),
        ),
      );
      if (!success)
        throw new ValidationError(
          'Complete the employment application details and declarations before submitting.',
        );
      const result = await tx.application.updateMany({
        where: { id: application.id, status: 'Draft' },
        data: { status: 'NEW', profileFormCompleted: true },
      });
      if (!result.count) throw new DomainError('Application changed; reload and retry.', 409);
      const submitted = await tx.application.findUniqueOrThrow({ where: { id: application.id } });
      await enqueueOnboardingEmails(tx, submitted);
      return submitted;
    });
  }
}
