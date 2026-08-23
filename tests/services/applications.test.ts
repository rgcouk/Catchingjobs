import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageApplications } from '../../src/services/ManageApplications';
import {
  ValidationError,
  RightToWorkRequiredError,
  ApplicationNotFoundError,
} from '../../src/services/exceptions';
import type { PrismaClient } from '@prisma/client';

describe('ManageApplications Service - createDraftApplication & linkUserToDraft', () => {
  let mockPrisma: any;
  let service: ManageApplications;

  beforeEach(() => {
    mockPrisma = {
      application: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
      },
      user: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    service = new ManageApplications(mockPrisma as unknown as PrismaClient);
  });

  describe('TC-UNIT-001 & TC-UNIT-002: Valid Draft Application Creation', () => {
    it('creates and persists a Draft Application for chicken sector with unique rosterRef', async () => {
      const input = {
        name: 'Arthur Kovacs',
        phone: '07700900123',
        email: 'arthur@example.com',
        town: 'boston',
        sector: 'chickens' as const,
        hasRightToWork: true,
      };

      const mockCreatedRecord = {
        id: 101,
        rosterRef: 'PL-CHI-4821',
        name: 'Arthur Kovacs',
        phone: '07700900123',
        email: 'arthur@example.com',
        town: 'boston',
        sector: 'chicken',
        hasRightToWork: true,
        shiftAvailability: 'Any',
        status: 'Draft',
        timestamp: '14/08/2026, 22:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockCreatedRecord);

      const result = await service.createDraftApplication(input);

      expect(mockPrisma.application.create).toHaveBeenCalledTimes(1);
      const callData = mockPrisma.application.create.mock.calls[0][0].data;

      expect(callData.name).toBe('Arthur Kovacs');
      expect(callData.phone).toBe('07700900123');
      expect(callData.email).toBe('arthur@example.com');
      expect(callData.town).toBe('boston');
      expect(callData.hasRightToWork).toBe(true);
      expect(callData.status).toBe('Draft');
      expect(callData.sector).toBe('chicken');
      expect(callData.rosterRef).toMatch(/^PL-CHI-\d{4}$/);

      expect(result.status).toBe('Draft');
      expect(result.id).toBe(101);
    });

    it('creates and persists a Draft Application for turkey sector with PL-TUR prefix', async () => {
      const input = {
        name: 'Sarah Connor',
        phone: '07700900999',
        email: 'sarah@example.com',
        town: 'sleaford',
        sector: 'turkeys' as const,
        hasRightToWork: true,
      };

      const mockCreatedRecord = {
        id: 102,
        rosterRef: 'PL-TUR-7732',
        name: 'Sarah Connor',
        phone: '07700900999',
        email: 'sarah@example.com',
        town: 'sleaford',
        sector: 'turkey',
        hasRightToWork: true,
        shiftAvailability: 'Any',
        status: 'Draft',
        timestamp: '14/08/2026, 22:00',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue(mockCreatedRecord);

      const result = await service.createDraftApplication(input);

      expect(mockPrisma.application.create).toHaveBeenCalledTimes(1);
      const callData = mockPrisma.application.create.mock.calls[0][0].data;
      expect(callData.sector).toBe('turkey');
      expect(callData.rosterRef).toMatch(/^PL-TUR-\d{4}$/);
      expect(result.status).toBe('Draft');
    });
  });

  describe('TC-UNIT-003: Right to Work Enforcement', () => {
    it('throws RightToWorkRequiredError when hasRightToWork is false and does NOT persist record', async () => {
      const input = {
        name: 'No RTW Applicant',
        phone: '07700900555',
        email: 'nortw@example.com',
        town: 'boston',
        sector: 'chickens' as const,
        hasRightToWork: false,
      };

      await expect(service.createDraftApplication(input)).rejects.toThrow(
        RightToWorkRequiredError,
      );
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });
  });

  describe('TC-UNIT-004 to TC-UNIT-007: Validation on Required Fields', () => {
    it('throws ValidationError when candidate name is missing or whitespace', async () => {
      const input = {
        name: '   ',
        phone: '07700900123',
        town: 'boston',
        sector: 'chickens' as const,
        hasRightToWork: true,
      };

      await expect(service.createDraftApplication(input)).rejects.toThrow(ValidationError);
      await expect(service.createDraftApplication(input)).rejects.toThrow(/name is required/i);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });

    it('throws ValidationError when phone number is missing or whitespace', async () => {
      const input = {
        name: 'John Doe',
        phone: '',
        town: 'boston',
        sector: 'chickens' as const,
        hasRightToWork: true,
      };

      await expect(service.createDraftApplication(input)).rejects.toThrow(ValidationError);
      await expect(service.createDraftApplication(input)).rejects.toThrow(/phone.*required/i);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });

    it('throws ValidationError when town is missing or whitespace', async () => {
      const input = {
        name: 'John Doe',
        phone: '07700900123',
        town: '  ',
        sector: 'chickens' as const,
        hasRightToWork: true,
      };

      await expect(service.createDraftApplication(input)).rejects.toThrow(ValidationError);
      await expect(service.createDraftApplication(input)).rejects.toThrow(/town is required/i);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });

    it('throws ValidationError when sector is invalid', async () => {
      const input = {
        name: 'John Doe',
        phone: '07700900123',
        town: 'boston',
        sector: 'invalid_crop' as any,
        hasRightToWork: true,
      };

      await expect(service.createDraftApplication(input)).rejects.toThrow(ValidationError);
      await expect(service.createDraftApplication(input)).rejects.toThrow(/sector/i);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
    });
  });

  describe('TC-UNIT-008: Optional Field Handling', () => {
    it('handles null or omitted email gracefully', async () => {
      const input = {
        name: 'Phone Only Catcher',
        phone: '07700900777',
        town: 'diss',
        sector: 'chickens' as const,
        hasRightToWork: true,
      };

      mockPrisma.application.findFirst.mockResolvedValue(null);
      mockPrisma.application.findUnique.mockResolvedValue(null);
      mockPrisma.application.create.mockResolvedValue({
        id: 103,
        rosterRef: 'PL-CHI-9921',
        name: input.name,
        phone: input.phone,
        email: null,
        town: input.town,
        sector: 'chicken',
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.createDraftApplication(input);
      expect(result).toBeDefined();
      expect(mockPrisma.application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: null,
          }),
        }),
      );
    });
  });

  describe('TC-UNIT-009: Existing Draft Resumption', () => {
    it('resumes and updates existing draft application if matching email/phone exists', async () => {
      const input = {
        name: 'Arthur Kovacs',
        phone: '07700900123',
        email: 'arthur@example.com',
        town: 'boston',
        sector: 'chickens' as const,
        hasRightToWork: true,
      };

      const existingRecord = {
        id: 50,
        rosterRef: 'PL-CHI-1111',
        name: 'Arthur K',
        phone: '07700900123',
        email: 'arthur@example.com',
        town: 'lincoln',
        sector: 'chicken',
        status: 'Draft',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.application.findFirst.mockResolvedValue(existingRecord);
      mockPrisma.application.update.mockResolvedValue({
        ...existingRecord,
        name: input.name,
        town: input.town,
      });

      const result = await service.createDraftApplication(input);

      expect(mockPrisma.application.update).toHaveBeenCalledTimes(1);
      expect(mockPrisma.application.create).not.toHaveBeenCalled();
      expect(result.id).toBe(50);
      expect(result.rosterRef).toBe('PL-CHI-1111');
    });
  });

  describe('TC-UNIT-010: linkUserToDraft', () => {
    it('links clerk user to existing draft application', async () => {
      const mockApp = {
        id: 200,
        rosterRef: 'PL-CHI-5555',
        name: 'Jane Doe',
        phone: '07700900888',
        email: 'jane@example.com',
        town: 'boston',
        sector: 'chicken',
        status: 'Draft',
        hasRightToWork: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.application.findUnique.mockResolvedValue(mockApp);
      mockPrisma.user.upsert.mockResolvedValue({
        id: 'user_clerk_123',
        email: 'jane@example.com',
        applicationId: 200,
      });

      const result = await service.linkUserToDraft('PL-CHI-5555', 'user_clerk_123', 'jane@example.com');
      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user_clerk_123' },
        update: {
          applicationId: 200,
          email: 'jane@example.com',
        },
        create: expect.objectContaining({
          id: 'user_clerk_123',
          applicationId: 200,
        }),
      });
      expect(result.id).toBe(200);
    });

    it('throws ApplicationNotFoundError if rosterRef does not exist', async () => {
      mockPrisma.application.findUnique.mockResolvedValue(null);

      await expect(
        service.linkUserToDraft('PL-CHI-NONEXISTENT', 'user_clerk_123'),
      ).rejects.toThrow(ApplicationNotFoundError);
    });
  });

  describe('TC-UNIT-011: updateMyDraftApplication (Auto-Save)', () => {
    it('successfully auto-saves fields to active Draft application', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user_123',
        email: 'test@example.com',
        applicationId: 300,
      });

      mockPrisma.application.findUnique.mockResolvedValue({
        id: 300,
        status: 'Draft',
      });

      mockPrisma.application.update.mockResolvedValue({
        id: 300,
        status: 'Draft',
        hasDrivingLicense: true,
        niNumber: 'AB123456C',
      });

      const result = await service.updateMyDraftApplication('user_123', {
        hasDrivingLicense: true,
        niNumber: 'AB123456C',
      });

      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: 300 },
        data: {
          hasDrivingLicense: true,
          niNumber: 'AB123456C',
        },
      });
      expect(result.id).toBe(300);
      expect(result.niNumber).toBe('AB123456C');
    });

    it('rejects updates if application is not in Draft status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user_123',
        applicationId: 300,
      });

      mockPrisma.application.findUnique.mockResolvedValue({
        id: 300,
        status: 'NEW',
      });

      await expect(
        service.updateMyDraftApplication('user_123', { niNumber: 'AB123456C' }),
      ).rejects.toThrow('Cannot update application because it is no longer in Draft status');
    });

    it('throws ApplicationNotFoundError if user has no linked application', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user_123',
        applicationId: null,
      });

      await expect(
        service.updateMyDraftApplication('user_123', { niNumber: 'AB123456C' }),
      ).rejects.toThrow(ApplicationNotFoundError);
    });
  });

  describe('TC-UNIT-012: submitMyDraftApplication (Final Submit)', () => {
    it('transitions status from Draft to NEW and marks profileFormCompleted & declarationSigned', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user_123',
        applicationId: 300,
      });

      mockPrisma.application.findUnique.mockResolvedValue({
        id: 300,
        status: 'Draft',
      });

      mockPrisma.application.update.mockResolvedValue({
        id: 300,
        status: 'NEW',
        profileFormCompleted: true,
        declarationSigned: true,
      });

      const result = await service.submitMyDraftApplication('user_123');

      expect(mockPrisma.application.update).toHaveBeenCalledWith({
        where: { id: 300 },
        data: {
          status: 'NEW',
          profileFormCompleted: true,
          declarationSigned: true,
        },
      });
      expect(result.status).toBe('NEW');
      expect(result.profileFormCompleted).toBe(true);
      expect(result.declarationSigned).toBe(true);
    });

    it('rejects submission if application is not in Draft status', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 'user_123',
        applicationId: 300,
      });

      mockPrisma.application.findUnique.mockResolvedValue({
        id: 300,
        status: 'APPROVED',
      });

      await expect(service.submitMyDraftApplication('user_123')).rejects.toThrow(
        'Application is not in Draft status or does not exist',
      );
    });
  });
});
