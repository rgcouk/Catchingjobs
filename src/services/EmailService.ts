import { Resend } from 'resend';
import { getPrisma } from '../../server/db.js';

export interface EmailApplicantPayload {
  name: string;
  email: string;
  rosterRef: string;
  town?: string;
  sector?: string;
}

export interface EmailAdminAlertPayload {
  id: number | string;
  rosterRef: string;
  name: string;
  email?: string;
  phone?: string;
  town?: string;
  sector?: string;
}

export interface EmailCampaignPayload {
  name: string;
  email: string;
  town?: string;
  sector?: string;
  template: 'reengage' | 'urgent' | 'peak' | 'rtw' | 'custom';
  customSubject?: string;
  customBody?: string;
}

export interface CustomEmailPayload {
  to: string | string[];
  recipientName?: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  template?: string;
  metadata?: any;
}

export class EmailService {
  private resend: Resend | null = null;
  private fromEmail: string;
  private adminEmail: string;
  private appUrl: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      this.resend = new Resend(apiKey);
    }
    this.fromEmail = process.env.EMAIL_FROM || 'Catchingjobs <notifications@catchingjobs.co.uk>';
    this.adminEmail = process.env.ADMIN_ALERT_EMAIL || 'dispatch@pullum.co.uk';
    this.appUrl = process.env.APP_URL || 'https://catchingjobs.co.uk';
  }

  getSettings() {
    return {
      hasApiKey: !!process.env.RESEND_API_KEY,
      fromEmail: this.fromEmail,
      adminEmail: this.adminEmail,
      appUrl: this.appUrl,
      provider: process.env.RESEND_API_KEY ? 'Resend (Live)' : 'Mock / Console (Dev Mode)',
    };
  }

  /**
   * Base responsive HTML email template wrapper
   */
  private wrapEmailHtml(title: string, contentHtml: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    .header { background-color: #0f172a; padding: 24px; text-align: center; }
    .header-logo { color: #ffffff; font-size: 24px; font-weight: bold; letter-spacing: -0.5px; text-decoration: none; }
    .header-logo span { color: #059669; }
    .badge { display: inline-block; background: #ecfdf5; color: #065f46; font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 9999px; margin-top: 8px; border: 1px solid #a7f3d0; }
    .content { padding: 32px 24px; line-height: 1.6; }
    .title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 0; margin-bottom: 16px; }
    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin: 20px 0; }
    .btn { display: inline-block; background-color: #059669; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; margin: 20px 0 10px; text-align: center; }
    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
    .footer a { color: #059669; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${this.appUrl}" class="header-logo">Catching<span>jobs</span></a>
      <br />
      <span class="badge">GLAA Licence: PULL0001 · Pullum Ltd</span>
    </div>
    <div class="content">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>Catchingjobs is operated by Pullum Ltd · UK GLAA Licensed Gangmaster</p>
      <p>Guaranteed Friday Payroll · Heated Door-to-Door Transit · Lantra Level 2 Animal Welfare</p>
      <p>© ${new Date().getFullYear()} Pullum Ltd. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * Helper to send or fallback to console log, with persistent database logging
   */
  private async dispatchEmail(
    to: string,
    subject: string,
    html: string,
    options: {
      recipientName?: string;
      template?: string;
      metadata?: any;
    } = {},
  ): Promise<{ success: boolean; id?: string }> {
    const { recipientName, template = 'custom', metadata } = options;

    if (!to || !to.includes('@')) {
      console.warn(`[EmailService] Invalid recipient email address: "${to}". Skipping dispatch.`);
      return { success: false };
    }

    const snippet = html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);

    if (!this.resend) {
      console.log(`\n================== [EmailService - MOCK SEND] ==================`);
      console.log(`To:        ${to} (${recipientName || 'No Name'})`);
      console.log(`From:      ${this.fromEmail}`);
      console.log(`Subject:   ${subject}`);
      console.log(`Template:  ${template}`);
      console.log(`Status:    Resend API key not set in environment. Mocking successful delivery.`);
      console.log(`=================================================================\n`);

      const mockId = `mock-${Date.now()}`;
      try {
        const prisma = getPrisma();
        await prisma.emailLog.create({
          data: {
            recipient: to,
            recipientName: recipientName || null,
            subject,
            template,
            status: 'MOCKED',
            resendId: mockId,
            bodySnippet: snippet,
            metadata: metadata || null,
          },
        });
      } catch (logErr) {
        console.error('[EmailService] Failed to create EmailLog record:', logErr);
      }

      return { success: true, id: mockId };
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (response.error) {
        console.error(`[EmailService] Resend API error sending to ${to}:`, response.error);

        try {
          const prisma = getPrisma();
          await prisma.emailLog.create({
            data: {
              recipient: to,
              recipientName: recipientName || null,
              subject,
              template,
              status: 'FAILED',
              bodySnippet: snippet,
              metadata: { error: response.error, ...(metadata || {}) },
            },
          });
        } catch (logErr) {
          console.error('[EmailService] Failed to log email error:', logErr);
        }

        return { success: false };
      }

      const resendId = response.data?.id;

      try {
        const prisma = getPrisma();
        await prisma.emailLog.create({
          data: {
            recipient: to,
            recipientName: recipientName || null,
            subject,
            template,
            status: 'SENT',
            resendId: resendId || null,
            bodySnippet: snippet,
            metadata: metadata || null,
          },
        });
      } catch (logErr) {
        console.error('[EmailService] Failed to create EmailLog record:', logErr);
      }

      return { success: true, id: resendId };
    } catch (err: any) {
      console.error(`[EmailService] Exception during email delivery to ${to}:`, err);

      try {
        const prisma = getPrisma();
        await prisma.emailLog.create({
          data: {
            recipient: to,
            recipientName: recipientName || null,
            subject,
            template,
            status: 'FAILED',
            bodySnippet: snippet,
            metadata: { error: err?.message || String(err), ...(metadata || {}) },
          },
        });
      } catch (logErr) {
        console.error('[EmailService] Failed to log email exception:', logErr);
      }

      return { success: false };
    }
  }

  /**
   * 1. Send Application Receipt to Applicant
   */
  async sendApplicationReceipt(applicant: EmailApplicantPayload) {
    const sectorName =
      applicant.sector === 'turkey'
        ? 'Commercial Turkey Loading'
        : 'Broiler & Breeder Chicken Catching';
    const town = applicant.town || 'your local hub';

    const subject = `Application Received: ${applicant.rosterRef} - Pullum Ltd Harvesting Squads`;
    const content = `
      <h1 class="title">Application Received — Roster Ref: ${applicant.rosterRef}</h1>
      <p>Hello <strong>${applicant.name || 'Operative'}</strong>,</p>
      <p>Thank you for submitting your onboarding compliance details for the <strong>${sectorName}</strong> squad in <strong>${town}</strong>.</p>
      
      <div class="card">
        <p style="margin: 0 0 8px;"><strong>Roster Reference:</strong> <span style="color: #059669; font-family: monospace; font-size: 16px;">${applicant.rosterRef}</span></p>
        <p style="margin: 0 0 8px;"><strong>Division:</strong> ${sectorName}</p>
        <p style="margin: 0 0 8px;"><strong>Transit Hub:</strong> ${town} Area (Door-to-door minibus pickup)</p>
        <p style="margin: 0;"><strong>Payroll Standard:</strong> Guaranteed Friday weekly BACS payments</p>
      </div>

      <p>Our dispatch coordinators are reviewing your documents and right-to-work details. You can check your shift availability and transit status at any time in the Employee Portal.</p>

      <div style="text-align: center;">
        <a href="${this.appUrl}/employee" class="btn">View Employee Portal</a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">Need urgent assistance or shift details? Contact our 24/7 Operations Desk at <strong>01522 504311</strong>.</p>
    `;

    const html = this.wrapEmailHtml(subject, content);
    return this.dispatchEmail(applicant.email, subject, html, {
      recipientName: applicant.name,
      template: 'receipt',
      metadata: { rosterRef: applicant.rosterRef, town, sector: applicant.sector },
    });
  }

  /**
   * 2. Send New Application Alert to Admin Team
   */
  async sendAdminNewApplicationAlert(application: EmailAdminAlertPayload) {
    const sectorName = application.sector === 'turkey' ? 'Turkey Harvesting' : 'Chicken Catching';
    const subject = `[New Candidate] ${application.name} (${application.rosterRef}) - ${application.town || 'UK Hub'}`;

    const content = `
      <h1 class="title" style="color: #059669;">New Candidate Application Submitted</h1>
      <p>A candidate has submitted their compliance induction details and is ready for recruiter review:</p>

      <div class="card">
        <p style="margin: 0 0 6px;"><strong>Candidate:</strong> ${application.name}</p>
        <p style="margin: 0 0 6px;"><strong>Roster Ref:</strong> <span style="font-family: monospace;">${application.rosterRef}</span></p>
        <p style="margin: 0 0 6px;"><strong>Email:</strong> ${application.email || 'N/A'}</p>
        <p style="margin: 0 0 6px;"><strong>Phone:</strong> ${application.phone || 'N/A'}</p>
        <p style="margin: 0 0 6px;"><strong>Town / Hub:</strong> ${application.town || 'Unassigned'}</p>
        <p style="margin: 0;"><strong>Sector:</strong> ${sectorName}</p>
      </div>

      <div style="text-align: center;">
        <a href="${this.appUrl}/admin/applicants" class="btn">Inspect in Admin Hub</a>
      </div>
    `;

    const html = this.wrapEmailHtml(subject, content);
    return this.dispatchEmail(this.adminEmail, subject, html, {
      recipientName: 'Pullum Dispatch Desk',
      template: 'alert',
      metadata: { rosterRef: application.rosterRef, candidateId: application.id },
    });
  }

  /**
   * 3. Send Application Status Change Notification
   */
  async sendStatusChangeEmail(applicant: EmailApplicantPayload, newStatus: string) {
    if (!applicant.email) return { success: false };

    let subject = `Update on your application (${applicant.rosterRef}) - Pullum Ltd`;
    let messageBody: string;
    let ctaText = 'Access Employee Portal';
    let ctaUrl = `${this.appUrl}/employee`;

    switch (newStatus.toUpperCase()) {
      case 'APPROVED':
        subject = `Application Approved: Welcome to Pullum Ltd (${applicant.rosterRef})`;
        messageBody = `
          <p>Great news! Your compliance induction for the <strong>${applicant.town || 'UK'}</strong> catching squad has been <strong>APPROVED</strong>.</p>
          <p>Your details have been verified for squad deployment. Please ensure your transit pickup address and phone number are up-to-date in your portal so your minibus driver can coordinate with you.</p>
        `;
        break;

      case 'HIRED':
        subject = `Squad Assignment Confirmed (${applicant.rosterRef}) - Pullum Ltd`;
        messageBody = `
          <p>Congratulations! You are now officially registered as an active crew operative for <strong>Pullum Ltd</strong>.</p>
          <p>Our dispatch desk will notify you of upcoming night shift collections. Reminder: all door-to-door transit is free of deductions and weekly payroll is deposited every Friday.</p>
        `;
        break;

      case 'REVIEWING':
        subject = `Application Under Review (${applicant.rosterRef}) - Pullum Ltd`;
        messageBody = `
          <p>Your application is currently under active review by our recruitment team for upcoming shift rotas in <strong>${applicant.town || 'your region'}</strong>.</p>
          <p>A dispatch coordinator may reach out to you via WhatsApp or phone for a quick introductory briefing.</p>
        `;
        break;

      case 'REJECTED':
        subject = `Update Regarding Your Application (${applicant.rosterRef}) - Pullum Ltd`;
        messageBody = `
          <p>Thank you for your interest in joining Pullum Ltd's harvesting crews in <strong>${applicant.town || 'your area'}</strong>.</p>
          <p>At this time, we are unable to advance your application for immediate placement. However, your contact details remain in our verified pool, and we will notify you when new seasonal harvesting positions or peak rate bonuses become available.</p>
        `;
        ctaText = 'View National Vacancies';
        ctaUrl = `${this.appUrl}/`;
        break;

      default:
        messageBody = `<p>Your application status has been updated to: <strong>${newStatus}</strong>.</p>`;
    }

    const content = `
      <h1 class="title">${subject}</h1>
      <p>Hello <strong>${applicant.name || 'Operative'}</strong>,</p>
      ${messageBody}
      
      <div style="text-align: center;">
        <a href="${ctaUrl}" class="btn">${ctaText}</a>
      </div>
    `;

    const html = this.wrapEmailHtml(subject, content);
    return this.dispatchEmail(applicant.email, subject, html, {
      recipientName: applicant.name,
      template: 'status_change',
      metadata: { rosterRef: applicant.rosterRef, newStatus },
    });
  }

  /**
   * 4. Send Staff / Recruiter Invitation Email
   */
  async sendStaffInvitation(email: string, role: string, inviteUrl?: string) {
    const targetUrl = inviteUrl || `${this.appUrl}/admin`;
    const subject = `Invitation to join Pullum Ltd Catchingjobs Operations Hub (${role})`;

    const content = `
      <h1 class="title">Staff Operations Hub Invitation</h1>
      <p>You have been invited to join the Catchingjobs administrative operations team as a <strong>${role}</strong>.</p>
      
      <div class="card">
        <p style="margin: 0 0 6px;"><strong>Invited Email:</strong> ${email}</p>
        <p style="margin: 0;"><strong>Assigned Role:</strong> ${role}</p>
      </div>

      <p>Click the button below to accept your invitation and access the admin dashboard, applicant pipeline, and location CMS:</p>

      <div style="text-align: center;">
        <a href="${targetUrl}" class="btn">Accept Invitation & Sign In</a>
      </div>
    `;

    const html = this.wrapEmailHtml(subject, content);
    return this.dispatchEmail(email, subject, html, {
      recipientName: email.split('@')[0],
      template: 'invitation',
      metadata: { role },
    });
  }

  /**
   * 5. Send Direct Campaign / Re-Engagement Email
   */
  async sendCampaignEmail(payload: EmailCampaignPayload) {
    const {
      name,
      email,
      town = 'your area',
      sector = 'chicken',
      template,
      customSubject,
      customBody,
    } = payload;
    const sectorName =
      sector === 'turkey' ? 'Commercial Turkey Harvesting' : 'Broiler Chicken Catching';

    let subject = customSubject || `Immediate Harvesting Squad Vacancies in ${town} - Pullum Ltd`;
    let bodyText = customBody;

    if (!bodyText) {
      switch (template) {
        case 'reengage':
          subject = `Immediate Harvesting Opportunities near ${town} — Guaranteed Friday Pay`;
          bodyText = `Pullum Ltd has immediate start poultry harvesting vacancies near <strong>${town}</strong> with guaranteed Friday weekly pay (£750–£950/wk) and door-to-door heated minibus collection. Are you available for active squad placement?`;
          break;
        case 'urgent':
          subject = `[Urgent Shift Notification] Immediate Openings for ${sectorName} in ${town}`;
          bodyText = `Urgent shift notification: We have immediate squad openings for <strong>${sectorName}</strong> in <strong>${town}</strong>. Minibus pickup is provided direct from your door. Contact Pullum Ltd now to claim your shift.`;
          break;
        case 'peak':
          subject = `Peak Season Bonus Rates Active: Earn up to £1,100+/week in ${town}`;
          bodyText = `Peak season harvesting bonus rates are now active for <strong>${sectorName}</strong> teams in <strong>${town}</strong>! Earn up to £1,100+/week with weekly Friday BACS payroll. Reply or log in to secure your spot.`;
          break;
        case 'rtw':
          subject = `Pullum Ltd Compliance: Complete your Right-to-Work verification`;
          bodyText = `We are preparing our upcoming squad manifests in <strong>${town}</strong>. Please upload or share your UK Right-to-Work document or share code so we can finalize your deployment.`;
          break;
        default:
          bodyText = `New poultry harvesting opportunities are available in <strong>${town}</strong> with Pullum Ltd.`;
      }
    }

    const content = `
      <h1 class="title">${subject}</h1>
      <p>Hello <strong>${name || 'Operative'}</strong>,</p>
      <p>${bodyText}</p>
      
      <div class="card">
        <p style="margin: 0 0 6px;"><strong>Location:</strong> ${town} & Surrounding Corridors</p>
        <p style="margin: 0 0 6px;"><strong>Transit:</strong> Free door-to-door collection provided</p>
        <p style="margin: 0;"><strong>Payroll:</strong> Every Friday without deduction</p>
      </div>

      <div style="text-align: center;">
        <a href="${this.appUrl}/employee" class="btn">View & Claim Shifts</a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-top: 24px;">To speak directly with dispatch, call our hotline at <strong>01522 504311</strong>.</p>
    `;

    const html = this.wrapEmailHtml(subject, content);
    return this.dispatchEmail(email, subject, html, {
      recipientName: name,
      template: `campaign_${template}`,
      metadata: { town, sector },
    });
  }

  /**
   * 6. Send Custom Email from Admin Composer
   */
  async sendCustomEmail(payload: CustomEmailPayload): Promise<{ success: boolean; count: number }> {
    const {
      to,
      recipientName,
      subject,
      body,
      isHtml = false,
      template = 'custom',
      metadata,
    } = payload;
    const recipients = Array.isArray(to) ? to : [to];

    let successCount = 0;
    for (const recipient of recipients) {
      if (!recipient || !recipient.includes('@')) continue;

      const formattedBody = isHtml ? body : `<p style="white-space: pre-wrap;">${body}</p>`;
      const html = this.wrapEmailHtml(
        subject,
        `
        <h1 class="title">${subject}</h1>
        ${formattedBody}
        <div style="text-align: center; margin-top: 24px;">
          <a href="${this.appUrl}/employee" class="btn">Open Employee Portal</a>
        </div>
      `,
      );

      const res = await this.dispatchEmail(recipient, subject, html, {
        recipientName: recipientName || recipient.split('@')[0],
        template,
        metadata,
      });

      if (res.success) successCount++;
    }

    return { success: successCount > 0, count: successCount };
  }

  /**
   * 7. Query Email Logs
   */
  async getEmailLogs(options: { skip?: number; take?: number; search?: string; status?: string }) {
    const prisma = getPrisma();
    const { skip = 0, take = 50, search, status } = options;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { recipient: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { subject: { contains: search, mode: 'insensitive' } },
        { template: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.emailLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emailLog.count({ where }),
    ]);

    return { data: logs, total, skip, take };
  }
}

export const emailService = new EmailService();
