import type { PrismaClient, Application } from '@prisma/client';
import {
  DomainError,
  ApplicationNotFoundError,
  RightToWorkRequiredError,
  ValidationError,
} from './exceptions';

export interface CreateDraftApplicationInput {
  name: string;
  phone: string;
  email?: string | null;
  town: string;
  sector: 'chickens' | 'turkeys' | 'chicken' | 'turkey' | string;
  hasRightToWork: boolean;
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
    const randDigits = Math.floor(1000 + Math.random() * 9000);
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

    // 3. Check for existing active Draft to prevent duplicate entries / support resumption
    if (cleanEmail || cleanPhone) {
      const existingDraft = await this.prisma.application.findFirst({
        where: {
          status: 'Draft',
          OR: [...(cleanEmail ? [{ email: cleanEmail }] : []), { phone: cleanPhone }],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingDraft) {
        const updated = await this.prisma.application.update({
          where: { id: existingDraft.id },
          data: {
            name: cleanName,
            town: cleanTown,
            sector: cleanSector,
            timestamp,
          },
        });
        return this.toDTO(updated);
      }
    }

    // 4. Generate unique collision-free roster reference
    let rosterRef = this.generateRosterRef(cleanSector);
    let attempts = 0;
    while (attempts < 5) {
      const collision = await this.prisma.application.findUnique({
        where: { rosterRef },
      });
      if (!collision) break;
      rosterRef = this.generateRosterRef(cleanSector);
      attempts++;
    }

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
    const application = await this.prisma.application.findUnique({
      where: { rosterRef },
    });

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    // Upsert the user in database
    await this.prisma.user.upsert({
      where: { id: clerkUserId },
      update: {
        applicationId: application.id,
        ...(userEmail ? { email: userEmail } : {}),
      },
      create: {
        id: clerkUserId,
        email: userEmail || application.email || `${clerkUserId}@placeholder.com`,
        passwordHash: '',
        role: 'WORKER',
        applicationId: application.id,
      },
    });

    // Update email on application if missing
    if (!application.email && userEmail) {
      const updated = await this.prisma.application.update({
        where: { id: application.id },
        data: { email: userEmail },
      });
      return this.toDTO(updated);
    }

    return this.toDTO(application);
  }

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

    return this.prisma.application.update({
      where: { id: user.applicationId },
      data,
    });
  }

  /**
   * Submits the authenticated user's Draft Application, changing status to NEW
   */
  async submitMyDraftApplication(clerkUserId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: clerkUserId },
    });

    if (!user || !user.applicationId) {
      throw new ApplicationNotFoundError();
    }

    const application = await this.prisma.application.findUnique({
      where: { id: user.applicationId },
    });

    if (!application || application.status !== 'Draft') {
      throw new DomainError('Application is not in Draft status or does not exist', 400);
    }

    // Final update to set status to NEW
    return this.prisma.application.update({
      where: { id: user.applicationId },
      data: {
        status: 'NEW',
        profileFormCompleted: true,
        declarationSigned: true,
      },
    });
  }
}
