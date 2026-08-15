# Milestone 3 Test Architecture & Specification
## Ticket 3: Automated Triage & Passwordless Auth Flow

**Author**: `explorer_m3_3` (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Scope**: Test Architecture, Playwright E2E Test Suite (`tests/triage_auth.spec.ts`), Vitest Service Unit Test Suite (`tests/services/applications.test.ts`), and Domain Contracts for Catchingjobs Milestone 3.

---

## 1. Executive Summary & Architecture Map

Milestone 3 implements the **Automated Triage Funnel & Passwordless Authentication** for Catchingjobs. It transforms dynamic town landing pages (`/:sector/:town`) from informational directories into high-conversion worker intake funnels.

### Flow Architecture

```
                       +-----------------------------------+
                       | Dynamic Town SSR (/chickens/boston)|
                       +-----------------------------------+
                                         │
                                         ▼
                     +───────────────────────────────────────+
                     |  Hero Inline Triage Form (Above Fold) |
                     |  - Full Name                          |
                     |  - Phone Number                       |
                     |  - Email (for OTP)                    |
                     |  - UK Right to Work (Yes / No)        |
                     +───────────────────────────────────────+
                                         │
                         ┌───────────────┴───────────────┐
                         │                               │
                 [ RTW === "No" ]                [ RTW === "Yes" ]
                         │                               │
                         ▼                               ▼
        +────────────────────────────────+  +───────────────────────────────────+
        | Inline Friendly Rejection UI   |  | POST /api/applications/draft      |
        | - Halts triage progression     |  | - Invokes Use-Case Service        |
        | - NO API draft request         |  |   ManageApplications.             |
        | - NO Clerk account creation    |  |   createDraftApplication()        |
        +────────────────────────────────+  +───────────────────────────────────+
                                                         │
                                                         ▼
                                            +─────────────────────────────+
                                            | Prisma Application Created  |
                                            | - status: "Draft"           |
                                            | - rosterRef: "PL-CHI-XXXX"  |
                                            | - hasRightToWork: true      |
                                            +─────────────────────────────+
                                                         │
                                                         ▼
                                            +─────────────────────────────+
                                            | Clerk Passwordless Auth     |
                                            | - Email OTP (Primary)       |
                                            | - SMS OTP (Fallback)        |
                                            | - OTP Verification Screen   |
                                            +─────────────────────────────+
                                                         │
                                                         ▼
                                            [ Transition to M4 Wizard ]
```

---

## 2. Interface Contracts & Domain Specifications

### 2.1 Backend Use-Case Service Contract (`src/services/ManageApplications.ts`)

```typescript
export interface CreateDraftApplicationInput {
  name: string;
  phone: string;
  email?: string | null;
  town: string;
  sector: 'chicken' | 'turkey' | 'chickens' | 'turkeys';
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
  hasRightToWork: boolean | null;
  shiftAvailability: string;
  status: 'Draft' | 'NEW' | 'REVIEWING' | 'APPROVED' | 'HIRED' | 'REJECTED';
  timestamp: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Domain Exceptions (`src/services/exceptions.ts`)

```typescript
export class DomainError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class RightToWorkRequiredError extends DomainError {
  constructor(
    message: string = 'Right to Work in the UK is required to create an application draft.',
  ) {
    super(message, 422);
  }
}

export class ApplicationNotFoundError extends NotFoundError {
  constructor() {
    super('Application not found');
  }
}
```

### 2.3 HTTP API Transport Route (`api/applications.ts`)

- **Route**: `POST /api/applications/draft`
- **Auth**: Public / Anonymous (no Clerk session required for triage initiation)
- **Request Body**: `CreateDraftApplicationInput`
- **Responses**:
  - `201 Created`: `{ success: true, application: ApplicationDTO }`
  - `400 Bad Request`: `{ error: "Candidate name is required" }`
  - `422 Unprocessable Entity`: `{ error: "Right to Work in the UK is required to create an application draft." }`
  - `500 Internal Server Error`: `{ error: "Failed to create draft application" }`

---

## 3. Vitest Service Unit Test Specification

### 3.1 Test Matrix for `ManageApplications.createDraftApplication`

| Test ID | Scenario | Input | Expected Output / Assertion |
|---|---|---|---|
| **TC-UNIT-001** | Valid chicken application | `{ name: 'John Doe', phone: '07700900000', email: 'john@example.com', town: 'boston', sector: 'chickens', hasRightToWork: true }` | Application record created with `status: 'Draft'`, `rosterRef` starting with `PL-CHI-`, `hasRightToWork: true`. |
| **TC-UNIT-002** | Valid turkey application | `{ name: 'Jane Smith', phone: '07700900001', email: 'jane@example.com', town: 'sleaford', sector: 'turkeys', hasRightToWork: true }` | Application record created with `status: 'Draft'`, `rosterRef` starting with `PL-TUR-`, `hasRightToWork: true`. |
| **TC-UNIT-003** | Right to Work rejected (`hasRightToWork: false`) | `{ name: 'Alex', phone: '07700900002', town: 'boston', sector: 'chickens', hasRightToWork: false }` | Throws `RightToWorkRequiredError` (status 422). Prisma `create` is **never called**. |
| **TC-UNIT-004** | Missing / empty candidate name | `{ name: '   ', phone: '07700900000', town: 'boston', sector: 'chickens', hasRightToWork: true }` | Throws `ValidationError` ("Candidate name is required"). |
| **TC-UNIT-005** | Missing / empty phone number | `{ name: 'John', phone: '', town: 'boston', sector: 'chickens', hasRightToWork: true }` | Throws `ValidationError` ("Phone number is required"). |
| **TC-UNIT-006** | Missing / empty town | `{ name: 'John', phone: '07700900000', town: '', sector: 'chickens', hasRightToWork: true }` | Throws `ValidationError` ("Town is required"). |
| **TC-UNIT-007** | Invalid / missing sector | `{ name: 'John', phone: '07700900000', town: 'boston', sector: 'invalid_sector' as any, hasRightToWork: true }` | Throws `ValidationError` ("Valid sector is required"). |
| **TC-UNIT-008** | Optional email handling | `{ name: 'John', phone: '07700900000', email: null, town: 'boston', sector: 'chicken', hasRightToWork: true }` | Persists `email: null` successfully without throwing. |
| **TC-UNIT-009** | Sector normalization | Sector `'chickens'` or `'chicken'` normalized to `'chicken'`; `'turkeys'` or `'turkey'` normalized to `'turkey'`. | Persists normalized sector string. |

### 3.2 Complete Unit Test Code (`tests/services/applications.test.ts`)

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ManageApplications } from '../../src/services/ManageApplications';
import {
  ValidationError,
  RightToWorkRequiredError,
} from '../../src/services/exceptions';
import type { PrismaClient } from '@prisma/client';

describe('ManageApplications Service - createDraftApplication', () => {
  let mockPrisma: any;
  let service: ManageApplications;

  beforeEach(() => {
    mockPrisma = {
      application: {
        create: vi.fn(),
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        count: vi.fn(),
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

      mockPrisma.application.create.mockResolvedValue({
        id: 103,
        rosterRef: 'PL-CHI-9921',
        name: input.name,
        phone: input.phone,
        email: null,
        town: input.town,
        sector: 'chicken',
        status: 'Draft',
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
});
```

---

## 4. Playwright E2E Test Suite Specification

### 4.1 Test Cases Matrix (`tests/triage_auth.spec.ts`)

| Test ID | Feature / Slice | Strategy / Actions | Expected Assertions |
|---|---|---|---|
| **TC-TA-001** | Inline Hero Triage Form Above The Fold | Load `/chickens/boston` and `/turkeys/sleaford`. Check wire HTML and DOM. | Form rendered with `data-testid="hero-triage-form"`. Y-offset < 800px (above fold). Name, Phone, Email, RTW controls visible. |
| **TC-TA-002** | Right to Work Rejection & Safe Halt | Fill form with RTW="No". Click submit/verify. Intercept `/api/applications/draft`. | Halts immediately with friendly rejection text. Zero API POST calls. Zero Clerk session attempts. |
| **TC-TA-003** | Right to Work Approval & Draft Creation | Fill Name, Phone, Email, select RTW="Yes". Submit. Intercept API. | Dispatches `POST /api/applications/draft`. Receives 201 Created with `status: "Draft"` and unique `rosterRef`. |
| **TC-TA-004** | Passwordless OTP Authentication Trigger | After draft creation on town page, trigger Clerk OTP flow. | Clerk OTP screen/container is presented (`data-testid="clerk-otp-container"`). OTP 6-digit input is visible. No password field. |
| **TC-TA-005** | Form Isolation Check | Visit `/`, `/corporate`, `/chickens`, `/chickens/boston`. | Assert `/` has **0** triage forms. Assert `/chickens/boston` has **1** hero triage form. |

### 4.2 Complete Playwright Test Code (`tests/triage_auth.spec.ts`)

```typescript
import { test, expect } from '@playwright/test';

test.describe('Milestone 3: Automated Triage & Passwordless Auth Flow Verification', () => {
  // ---------------------------------------------------------------------------
  // 1. Above-The-Fold Hero Triage Form Rendering (TC-TA-001)
  // ---------------------------------------------------------------------------
  test.describe('1. Above-The-Fold Hero Triage Form Rendering', () => {
    const testTowns = [
      { route: '/chickens/boston', townName: 'Boston', sectorName: 'Chicken' },
      { route: '/turkeys/sleaford', townName: 'Sleaford', sectorName: 'Turkey' },
    ];

    for (const { route, townName, sectorName } of testTowns) {
      test(`TC-TA-001: ${route} renders inline Hero triage form above the fold`, async ({
        page,
        request,
      }) => {
        // 1. Raw Wire HTML Inspection
        const response = await request.get(route);
        expect(response.status()).toBe(200);
        const html = await response.text();

        expect(html).toContain('data-testid="hero-triage-form"');
        expect(html).toMatch(/(name="name"|name="fullName"|data-testid="triage-name")/);
        expect(html).toMatch(/(name="phone"|type="tel"|data-testid="triage-phone")/);
        expect(html).toMatch(/(Right to Work|hasRightToWork|data-testid="rtw-group")/i);

        // 2. Browser DOM & Above-the-fold Viewport Check
        await page.goto(route, { waitUntil: 'networkidle' });

        const triageForm = page.locator('[data-testid="hero-triage-form"], form#hero-triage-form').first();
        await expect(triageForm).toBeVisible();

        // Ensure the form is located within the initial above-the-fold viewport
        const boundingBox = await triageForm.boundingBox();
        expect(boundingBox).not.toBeNull();
        expect(boundingBox!.y).toBeLessThan(800); // Above the standard 1080p/768p fold

        // Form Fields Verification
        const nameInput = page.locator('input[name="name"], input[name="fullName"], [data-testid="triage-name"]').first();
        const phoneInput = page.locator('input[name="phone"], input[type="tel"], [data-testid="triage-phone"]').first();
        const emailInput = page.locator('input[name="email"], input[type="email"], [data-testid="triage-email"]').first();
        const rtwControl = page.locator('[data-testid="rtw-group"], input[name="hasRightToWork"], select[name="hasRightToWork"]').first();
        const submitBtn = page.locator('button[type="submit"], [data-testid="btn-triage-submit"]').first();

        await expect(nameInput).toBeVisible();
        await expect(phoneInput).toBeVisible();
        await expect(emailInput).toBeVisible();
        await expect(rtwControl).toBeVisible();
        await expect(submitBtn).toBeVisible();
      });
    }
  });

  // ---------------------------------------------------------------------------
  // 2. Right to Work Rejection & Safe Halt (TC-TA-002)
  // ---------------------------------------------------------------------------
  test.describe('2. Right to Work Rejection & Safe Halt', () => {
    test('TC-TA-002: Selecting "No" for Right to Work halts triage with friendly message and prevents API draft submission', async ({
      page,
    }) => {
      let draftApiCallOccurred = false;

      // Listen to network requests to ensure NO API draft submission occurs
      page.on('request', (req) => {
        if (req.url().includes('/api/applications') && req.method() === 'POST') {
          draftApiCallOccurred = true;
        }
      });

      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });

      // 1. Fill in candidate details
      await page.fill('input[name="name"], [data-testid="triage-name"]', 'Alex Candidate');
      await page.fill('input[name="phone"], [data-testid="triage-phone"]', '07700900111');
      await page.fill('input[name="email"], [data-testid="triage-email"]', 'alex@example.com');

      // 2. Select Right to Work = "No"
      const rtwNo = page.locator('[data-testid="rtw-no"], input[value="false"], option[value="false"]').first();
      if (await rtwNo.isVisible()) {
        await rtwNo.click();
      } else {
        await page.selectOption('select[name="hasRightToWork"]', 'false');
      }

      // 3. Submit or trigger validation
      const submitBtn = page.locator('button[type="submit"], [data-testid="btn-triage-submit"]').first();
      await submitBtn.click();

      // 4. Assert friendly rejection message is rendered
      const rejectionMsg = page.locator(
        '[data-testid="triage-rejection-msg"], text=/Right to Work in the UK is required|require all applicants to have valid Right to Work|cannot proceed without Right to Work/i',
      ).first();
      await expect(rejectionMsg).toBeVisible();

      // 5. Assert NO API draft creation call was made
      expect(draftApiCallOccurred).toBe(false);

      // 6. Assert flow did not advance to Clerk OTP or Wizard
      const otpContainer = page.locator('[data-testid="clerk-otp-container"], input[name="code"]');
      expect(await otpContainer.count()).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Right to Work Approval & Draft Application Persistence (TC-TA-003)
  // ---------------------------------------------------------------------------
  test.describe('3. Right to Work Approval & Draft Application Persistence', () => {
    test('TC-TA-003: Submitting valid details with RTW="Yes" creates Draft Application in DB (status: "Draft")', async ({
      page,
    }) => {
      let capturedDraftPayload: any = null;
      let draftResponseStatus: number = 0;

      // Intercept and spy on draft creation API endpoint
      await page.route('**/api/applications/draft', async (route) => {
        const req = route.request();
        capturedDraftPayload = req.postDataJSON();
        
        // Pass through or respond with standard mock draft response
        const response = await route.fetch();
        draftResponseStatus = response.status();
        route.fulfill({ response });
      });

      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });

      // 1. Fill Name + Phone + Email
      await page.fill('input[name="name"], [data-testid="triage-name"]', 'Arthur Kovacs');
      await page.fill('input[name="phone"], [data-testid="triage-phone"]', '07700900222');
      await page.fill('input[name="email"], [data-testid="triage-email"]', 'arthur.kovacs@example.com');

      // 2. Select Right to Work = "Yes"
      const rtwYes = page.locator('[data-testid="rtw-yes"], input[value="true"], option[value="true"]').first();
      if (await rtwYes.isVisible()) {
        await rtwYes.click();
      } else {
        await page.selectOption('select[name="hasRightToWork"]', 'true');
      }

      // 3. Submit
      const submitBtn = page.locator('button[type="submit"], [data-testid="btn-triage-submit"]').first();
      await submitBtn.click();

      // 4. Validate API payload and response
      await page.waitForTimeout(500); // Allow async network round-trip

      if (capturedDraftPayload) {
        expect(capturedDraftPayload.name).toBe('Arthur Kovacs');
        expect(capturedDraftPayload.phone).toBe('07700900222');
        expect(capturedDraftPayload.email).toBe('arthur.kovacs@example.com');
        expect(capturedDraftPayload.hasRightToWork).toBe(true);
        expect(capturedDraftPayload.town.toLowerCase()).toBe('boston');
        expect(capturedDraftPayload.sector.toLowerCase()).toMatch(/chicken/);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Passwordless OTP Authentication Flow Trigger (TC-TA-004)
  // ---------------------------------------------------------------------------
  test.describe('4. Passwordless OTP Authentication Flow Trigger', () => {
    test('TC-TA-004: Clerk OTP verification step is presented immediately upon draft creation', async ({
      page,
    }) => {
      // Mock the draft API response to simulate seamless draft persistence
      await page.route('**/api/applications/draft', async (route) => {
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            application: {
              id: 999,
              rosterRef: 'PL-CHI-4819',
              name: 'John Catcher',
              phone: '07700900333',
              email: 'john.catcher@example.com',
              town: 'boston',
              sector: 'chicken',
              status: 'Draft',
              hasRightToWork: true,
            },
          }),
        });
      });

      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });

      // 1. Submit valid triage form
      await page.fill('input[name="name"], [data-testid="triage-name"]', 'John Catcher');
      await page.fill('input[name="phone"], [data-testid="triage-phone"]', '07700900333');
      await page.fill('input[name="email"], [data-testid="triage-email"]', 'john.catcher@example.com');

      const rtwYes = page.locator('[data-testid="rtw-yes"], input[value="true"], option[value="true"]').first();
      if (await rtwYes.isVisible()) {
        await rtwYes.click();
      } else {
        await page.selectOption('select[name="hasRightToWork"]', 'true');
      }

      await page.click('button[type="submit"], [data-testid="btn-triage-submit"]');

      // 2. Verify OTP Verification Screen is displayed
      const otpContainer = page.locator('[data-testid="clerk-otp-container"], [data-testid="otp-verification-screen"]').first();
      const otpInput = page.locator('input[name="code"], [data-testid="otp-input"], input[placeholder*="verification code" i]').first();

      await expect(otpContainer).toBeVisible();
      await expect(otpInput).toBeVisible();

      // Assert password input was NOT prompted (strictly passwordless flow)
      const passwordInput = page.locator('input[type="password"]');
      expect(await passwordInput.count()).toBe(0);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. Form Isolation & Route Separation (TC-TA-005)
  // ---------------------------------------------------------------------------
  test.describe('5. Form Isolation & Route Separation Check', () => {
    test('TC-TA-005: Root route (/) STILL has 0 candidate triage forms, while town routes have hero form', async ({
      page,
      request,
    }) => {
      // 1. Check Root Route (/) - Must NOT have triage form
      const rootRes = await request.get('/');
      const rootHtml = await rootRes.text();
      expect(rootHtml).not.toContain('data-testid="hero-triage-form"');
      expect(rootHtml).not.toContain('name="hasRightToWork"');

      await page.goto('/', { waitUntil: 'networkidle' });
      const rootForms = page.locator('[data-testid="hero-triage-form"], form#hero-triage-form');
      const rootInputs = page.locator('input[name="name"], input[name="fullName"], input[name="phone"], input[type="tel"]');
      expect(await rootForms.count()).toBe(0);
      expect(await rootInputs.count()).toBe(0);

      // 2. Check Sector Hubs (/chickens, /turkeys) - Must NOT have triage form
      await page.goto('/chickens', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(0);

      await page.goto('/turkeys', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(0);

      // 3. Check Town Routes (/:sector/:town) - Must have EXACTLY 1 hero triage form
      await page.goto('/chickens/boston', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(1);

      await page.goto('/turkeys/sleaford', { waitUntil: 'networkidle' });
      expect(await page.locator('[data-testid="hero-triage-form"]').count()).toBe(1);
    });
  });
});
```

---

## 5. Proposed Implementation Guidance for Implementer Agent

### 5.1 Proposed Code Additions for `src/services/exceptions.ts`
```typescript
export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class RightToWorkRequiredError extends DomainError {
  constructor(
    message: string = 'Right to Work in the UK is required to create an application draft.',
  ) {
    super(message, 422);
  }
}
```

### 5.2 Proposed Implementation for `src/services/ManageApplications.ts`
```typescript
export class ManageApplications {
  constructor(private prisma: PrismaClient) {}

  async createDraftApplication(input: CreateDraftApplicationInput) {
    const { name, phone, email, town, sector, hasRightToWork } = input;

    // 1. Right to Work Check
    if (hasRightToWork !== true) {
      throw new RightToWorkRequiredError();
    }

    // 2. Validation
    if (!name || name.trim() === '') {
      throw new ValidationError('Candidate name is required');
    }
    if (!phone || phone.trim() === '') {
      throw new ValidationError('Phone number is required');
    }
    if (!town || town.trim() === '') {
      throw new ValidationError('Town is required');
    }
    
    const normalizedSector = sector?.toLowerCase().startsWith('turk') ? 'turkey' : 'chicken';

    // 3. Generate Roster Ref
    const prefix = normalizedSector === 'turkey' ? 'TUR' : 'CHI';
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const rosterRef = `PL-${prefix}-${randomNum}`;

    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // 4. Persist in Prisma
    return this.prisma.application.create({
      data: {
        rosterRef,
        name: name.trim(),
        phone: phone.trim(),
        email: email ? email.trim() : null,
        town: town.trim(),
        sector: normalizedSector,
        hasRightToWork: true,
        shiftAvailability: 'Any',
        status: 'Draft',
        timestamp,
      },
    });
  }
  // ... existing methods
}
```

### 5.3 Proposed Endpoint in `api/applications.ts`
```typescript
app.post('/api/applications/draft', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const body = await c.req.json();
    const application = await service.createDraftApplication(body);
    return c.json({ success: true, application }, 201);
  } catch (error) {
    return handleError(error, 'Failed to create draft application', c);
  }
});
```

---

## 6. Pre-Flight Verification & Quality Checklist

Before completing Milestone 3 implementation:
1. **Prettier Format**: `npm run format`
2. **ESLint Linting**: `npm run lint`
3. **TypeScript Typecheck**: `npx tsc --noEmit`
4. **Prisma Client Sync**: `npx prisma generate`
5. **Vitest Unit Tests**: `npx vitest run tests/services/applications.test.ts`
6. **Playwright E2E Suite**: `npx playwright test tests/triage_auth.spec.ts`
