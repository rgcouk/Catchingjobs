import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from '../EmailService';

describe('EmailService', () => {
  let emailService: EmailService;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService();
  });

  it('should format and mock send application receipt without crashing when no API key', async () => {
    const result = await emailService.sendApplicationReceipt({
      name: 'James Wilson',
      email: 'james.wilson@example.com',
      rosterRef: 'PL-CHI-1234',
      town: 'Boston',
      sector: 'chicken',
    });

    expect(result.success).toBe(true);
    expect(result.id).toBeDefined();
  });

  it('should format and mock send admin new application alert', async () => {
    const result = await emailService.sendAdminNewApplicationAlert({
      id: 42,
      rosterRef: 'PL-TUR-5678',
      name: 'Sarah Connor',
      email: 'sarah.connor@example.com',
      phone: '07700900123',
      town: 'Norwich',
      sector: 'turkey',
    });

    expect(result.success).toBe(true);
  });

  it('should format and send status change emails for APPROVED, HIRED, and REJECTED', async () => {
    const applicant = {
      name: 'Arthur King',
      email: 'arthur@example.com',
      rosterRef: 'PL-CHI-9999',
      town: 'Lincoln',
      sector: 'chicken',
    };

    const resApproved = await emailService.sendStatusChangeEmail(applicant, 'APPROVED');
    expect(resApproved.success).toBe(true);

    const resHired = await emailService.sendStatusChangeEmail(applicant, 'HIRED');
    expect(resHired.success).toBe(true);

    const resRejected = await emailService.sendStatusChangeEmail(applicant, 'REJECTED');
    expect(resRejected.success).toBe(true);
  });

  it('should format and send staff invitation emails', async () => {
    const result = await emailService.sendStaffInvitation('recruiter@pullum.co.uk', 'ADMIN');
    expect(result.success).toBe(true);
  });

  it('should format and send campaign broadcast emails', async () => {
    const result = await emailService.sendCampaignEmail({
      name: 'David Miller',
      email: 'david@example.com',
      town: 'Spalding',
      sector: 'chicken',
      template: 'reengage',
    });

    expect(result.success).toBe(true);
  });

  it('should gracefully skip invalid email addresses', async () => {
    const result = await emailService.sendApplicationReceipt({
      name: 'Bad Email',
      email: 'invalid-email-string',
      rosterRef: 'PL-CHI-0000',
    });

    expect(result.success).toBe(false);
  });
});
