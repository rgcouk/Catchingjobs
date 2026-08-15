# Milestone 3 (Ticket 3): Backend Architecture & Passwordless Auth Plan

**Author**: `explorer_m3_2` (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Target Ticket**: Ticket 3 (`Ticket 3: Automated Triage & Passwordless Auth Flow` - GitHub Issue #9 / Spec #6)  
**Scope**: Use-Case Services (`ManageApplications.ts`), Exceptions (`exceptions.ts`), Serverless Hono Endpoints (`api/triage.ts`, `api/applications.ts`, `api/webhook-clerk.ts`), Clerk Passwordless Authentication Integration, and Database Sync.

---

## 1. Executive Summary

Milestone 3 implements the recruitment intake funnel for Catchingjobs:
1. **Candidate Hero Triage**: Instant above-the-fold intake on localized town landers (`/:sector/:town`) collecting basic candidate information (`name`, `phone`, `email`, `town`, `sector`, `hasRightToWork`).
2. **Right to Work Gating**: Immediate rejection if `hasRightToWork === false` without persisting database records.
3. **Use-Case Service (`ManageApplications.createDraftApplication`)**: Encapsulated business logic validating inputs, generating unique `rosterRef` (e.g. `CJ-CHI-4821`), and persisting an `Application` record with `status: "Draft"`.
4. **Hono Serverless Endpoints**: Public `POST /api/triage` for unauthenticated draft creation and authenticated `POST /api/triage/claim` for linking Clerk user sessions.
5. **Clerk Passwordless Authentication Flow**: Seamless Email OTP (primary) and SMS OTP (fallback) onboarding for workers, linking the Clerk identity to the created Draft Application in PostgreSQL.

```
+-----------------------------------------------------------------------------------+
|                           CANDIDATE FUNNEL ARCHITECTURE                           |
+-----------------------------------------------------------------------------------+
                                          │
                  [Town Hero Inline Triage Form (Public)]
                  (name, phone, email, town, sector, RTW)
                                          │
                        ┌─────────────────┴─────────────────┐
                        │ Has Right To Work in UK?          │
                        └─────────────────┬─────────────────┘
                                          │
                     NO ┌─────────────────┴─────────────────┐ YES
                        ▼                                   ▼
          [Instant Friendly Rejection]          [POST /api/triage]
          - No DB records created               - Transport Adapter
          - No Clerk accounts created           - Maps Domain Exceptions
                                                            │
                                                            ▼
                                          [ManageApplications.createDraftApplication]
                                          - Invariant validation
                                          - Generate unique rosterRef (CJ-CHI-XXXX)
                                          - Persist Application (status: "Draft")
                                          - Return ApplicationDTO
                                                            │
                                                            ▼
                                          [Clerk Passwordless OTP Auth]
                                          - Primary: Email OTP (email_code)
                                          - Fallback: SMS OTP (phone_code)
                                          - Candidate verifies 6-digit OTP
                                          - setActive({ session })
                                                            │
                                                            ▼
                                          [Post-Auth Identity Linking]
                                          - POST /api/triage/claim
                                          - User.applicationId = Application.id
                                          - Clerk Webhook fallback sync
                                                            │
                                                            ▼
                                          [Navigate to 3-Step Wizard (M4)]
```

---

## 2. Use-Case Service Architecture: `src/services/ManageApplications.ts`

### 2.1 Interface Contracts & Data Transfer Objects (DTO)

```typescript
// src/services/ManageApplications.ts

export interface CreateDraftApplicationInput {
  name: string;
  phone: string;
  email?: string;
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
  status: 'Draft' | 'NEW' | 'REVIEWING' | 'APPROVED' | 'HIRED' | 'REJECTED';
  hasRightToWork: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.2 Domain Invariants & Exceptions (`src/services/exceptions.ts`)

Business rules enforced by `ManageApplications`:
1. **Right to Work Invariant**:
   - `hasRightToWork` MUST be strictly `true`. If `false` or undefined, throw `RightToWorkRequiredError`.
2. **Input Validation Invariants**:
   - `name`: Must be non-empty string of at least 2 characters.
   - `phone`: Must be non-empty string of at least 5 characters.
   - `town`: Must be non-empty string.
   - `sector`: Must be normalized to canonical `'chicken'` or `'turkey'`.
3. **Idempotency / Existing Draft Resumption**:
   - If an unlinked `Draft` application with identical email or phone already exists within 24 hours, update town/sector and resume the draft rather than failing with duplicate key errors.

```typescript
// src/services/exceptions.ts updates

export class DomainError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 400,
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class RightToWorkRequiredError extends DomainError {
  constructor(message: string = 'Right to work in the UK is mandatory to register an application.') {
    super(message, 400);
  }
}

export class ValidationError extends DomainError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class ApplicationNotFoundError extends NotFoundError {
  constructor() {
    super('Application not found');
  }
}
```

### 2.3 Proposed Implementation: `ManageApplications.ts`

```typescript
import type { PrismaClient, Application } from '@prisma/client';
import { 
  DomainError, 
  ApplicationNotFoundError, 
  RightToWorkRequiredError, 
  ValidationError 
} from './exceptions';

export interface CreateDraftApplicationInput {
  name: string;
  phone: string;
  email?: string;
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
  status: 'Draft' | 'NEW' | 'REVIEWING' | 'APPROVED' | 'HIRED' | 'REJECTED';
  hasRightToWork: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ManageApplications {
  constructor(private prisma: PrismaClient) {}

  /**
   * Generates a unique roster reference code (e.g., CJ-CHI-4829)
   */
  private generateRosterRef(sector: string): string {
    const normSector = sector.toLowerCase().includes('turk') ? 'TUR' : 'CHI';
    const randDigits = Math.floor(1000 + Math.random() * 9000);
    return `CJ-${normSector}-${randDigits}`;
  }

  /**
   * Maps a Prisma Application record to clean ApplicationDTO
   */
  private toDTO(app: Application): ApplicationDTO {
    return {
      id: app.id,
      rosterRef: app.rosterRef,
      name: app.name,
      email: app.email,
      phone: app.phone,
      town: app.town,
      sector: app.sector,
      status: app.status as ApplicationDTO['status'],
      hasRightToWork: !!app.hasRightToWork,
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
    if (!input.hasRightToWork) {
      throw new RightToWorkRequiredError();
    }

    // 2. Validate mandatory fields
    if (!input.name || input.name.trim().length < 2) {
      throw new ValidationError('Candidate full name is required (minimum 2 characters).');
    }
    if (!input.phone || input.phone.trim().length < 5) {
      throw new ValidationError('A valid contact phone number is required.');
    }
    if (!input.town || input.town.trim().length === 0) {
      throw new ValidationError('Town location is required.');
    }

    const cleanName = input.name.trim();
    const cleanPhone = input.phone.trim();
    const cleanEmail = input.email ? input.email.trim().toLowerCase() : null;
    const cleanTown = input.town.trim();
    const cleanSector = input.sector.toLowerCase().includes('turk') ? 'turkey' : 'chicken';
    const timestamp = new Date().toISOString();

    // 3. Check for existing active Draft to prevent duplicate entries
    if (cleanEmail || cleanPhone) {
      const existingDraft = await this.prisma.application.findFirst({
        where: {
          status: 'Draft',
          OR: [
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
            { phone: cleanPhone },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingDraft) {
        // Update existing draft with latest town/sector
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
        timestamp,
        status: 'Draft',
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
  async linkUserToDraft(rosterRef: string, clerkUserId: string, userEmail?: string): Promise<ApplicationDTO> {
    const application = await this.prisma.application.findUnique({
      where: { rosterRef },
    });

    if (!application) {
      throw new ApplicationNotFoundError();
    }

    // Upsert the user in PostgreSQL
    const user = await this.prisma.user.upsert({
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

  async getApplicationByRosterRef(rosterRef: string) {
    const application = await this.prisma.application.findUnique({
      where: { rosterRef },
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
```

---

## 3. Serverless Hono Endpoints Design (`api/triage.ts`)

### 3.1 Unauthenticated Endpoint: `POST /api/triage`
- **Path**: `POST /api/triage`
- **Auth**: None (Public)
- **Input Body**:
  ```json
  {
    "name": "Jane Smith",
    "phone": "07123456789",
    "email": "jane.smith@example.co.uk",
    "town": "Boston",
    "sector": "chickens",
    "hasRightToWork": true
  }
  ```
- **Success Response (201 Created)**:
  ```json
  {
    "success": true,
    "application": {
      "id": 142,
      "rosterRef": "CJ-CHI-4821",
      "name": "Jane Smith",
      "email": "jane.smith@example.co.uk",
      "phone": "07123456789",
      "town": "Boston",
      "sector": "chicken",
      "status": "Draft",
      "hasRightToWork": true,
      "createdAt": "2026-08-14T21:44:00.000Z",
      "updatedAt": "2026-08-14T21:44:00.000Z"
    }
  }
  ```
- **Failure Response (400 Bad Request)**:
  ```json
  {
    "success": false,
    "error": "Right to work in the UK is mandatory to register an application."
  }
  ```

### 3.2 Authenticated Endpoint: `POST /api/triage/claim`
- **Path**: `POST /api/triage/claim`
- **Auth**: Clerk Bearer Token / Session (`clerkMiddleware()` + `getAuth(c)`)
- **Input Body**:
  ```json
  {
    "rosterRef": "CJ-CHI-4821"
  }
  ```
- **Behavior**:
  1. Validates Clerk authenticated session `userId`.
  2. Calls `ManageApplications.linkUserToDraft(rosterRef, userId, userEmail)`.
  3. Returns `{ success: true, application: ApplicationDTO }`.

### 3.3 Implementation: `api/triage.ts`

```typescript
import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { getPrisma } from '../server/db';
import { ManageApplications } from '../src/services/ManageApplications';
import { DomainError } from '../src/services/exceptions';

const app = new Hono();

const handleError = (error: unknown, defaultMessage: string, c: any) => {
  if (error instanceof DomainError) {
    return c.json({ success: false, error: error.message }, error.statusCode as any);
  }
  console.error(defaultMessage, error);
  return c.json({ success: false, error: defaultMessage }, 500);
};

/**
 * Public automated triage endpoint.
 * Validates Right to Work, creates Draft Application record, returns ApplicationDTO.
 */
app.post('/api/triage', async (c) => {
  const service = new ManageApplications(getPrisma());
  try {
    const body = await c.req.json();
    const application = await service.createDraftApplication({
      name: body.name,
      phone: body.phone,
      email: body.email,
      town: body.town,
      sector: body.sector,
      hasRightToWork: body.hasRightToWork === true || body.hasRightToWork === 'true',
    });
    return c.json({ success: true, application }, 201);
  } catch (error) {
    return handleError(error, 'Failed to process triage intake', c);
  }
});

/**
 * Authenticated claim endpoint to associate Clerk user ID with Draft Application.
 */
app.post('/api/triage/claim', clerkMiddleware(), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const service = new ManageApplications(getPrisma());
  try {
    const body = await c.req.json();
    const { rosterRef, email } = body;
    if (!rosterRef) {
      return c.json({ success: false, error: 'Roster reference (rosterRef) is required' }, 400);
    }

    const application = await service.linkUserToDraft(rosterRef, auth.userId, email);
    return c.json({ success: true, application });
  } catch (error) {
    return handleError(error, 'Failed to link user to application', c);
  }
});

export { app };
export default handle(app);
```

### 3.4 Mounting in `api/index.ts`
```typescript
import { app as triageApp } from './triage';

// Mount routes
app.route('/', triageApp);
```

---

## 4. Clerk Passwordless Authentication Architecture

### 4.1 Client-Side Flow (`@clerk/clerk-react`)

Catchingjobs workers operate on mobile devices in agricultural environments. Password authentication creates high friction and forgotten credential drop-offs. We use Clerk's **Passwordless OTP (One-Time Password)** strategy:
- **Primary Strategy**: Email OTP (`strategy: 'email_code'`) — reliable over Wi-Fi and mobile data.
- **Fallback Strategy**: Phone SMS OTP (`strategy: 'phone_code'`) — works without data connection.

#### Flow Step-by-Step:
1. **Triage Pass**: User enters `{ name: "Jane Doe", phone: "07123456789", email: "jane@example.com", town: "Boston", sector: "chicken", hasRightToWork: true }` and clicks **"Start Fast-Track Application"**.
2. **Draft Created**: Hero form calls `POST /api/triage`. Returns `rosterRef: "CJ-CHI-4821"`.
3. **Clerk Sign-Up / Sign-In Initiation**:
   - Frontend calls `signUp.create({ emailAddress: "jane@example.com", firstName: "Jane", lastName: "Doe" })`.
   - Frontend calls `signUp.prepareEmailAddressVerification({ strategy: 'email_code' })`.
   - If user already exists (Clerk code: `form_identifier_exists`), the client switches seamlessly to `signIn.create({ identifier: "jane@example.com" })` and `signIn.prepareFirstFactor({ strategy: 'email_code' })`.
4. **OTP Verification Modal / Sheet**:
   - Hero form presents the 6-digit OTP code verification card (`shadcn/ui` Card + InputOTP / Input).
   - Candidate enters 6-digit code.
   - Client calls `signUp.attemptEmailAddressVerification({ code })` or `signIn.attemptFirstFactor({ strategy: 'email_code', code })`.
   - On completion: `await setActive({ session: result.createdSessionId })`.
5. **Post-Auth Linking**:
   - Client calls `POST /api/triage/claim` with `{ rosterRef: "CJ-CHI-4821", email: "jane@example.com" }`.
   - Backend links `User.applicationId = application.id`.
   - Client redirects to `/wizard` (Ticket 4).

### 4.2 Webhook Synchronization Fallback (`api/webhook-clerk.ts`)

In addition to direct client-side linking, the Svix-verified webhook handler in `api/webhook-clerk.ts` handles background reconciliation:

```typescript
// api/webhook-clerk.ts
if (evt?.type === 'user.created' || evt?.type === 'user.updated') {
  // Check if a Draft Application exists matching this email
  const existingApp = await prisma.application.findFirst({
    where: {
      email: email,
      status: 'Draft',
    },
    orderBy: { createdAt: 'desc' },
  });

  await prisma.user.upsert({
    where: { id: id as string },
    update: { 
      email: email as string,
      ...(existingApp ? { applicationId: existingApp.id } : {})
    },
    create: {
      id: id as string,
      email: email as string,
      passwordHash: '',
      role: 'WORKER',
      ...(existingApp ? { applicationId: existingApp.id } : {})
    }
  });
}
```

---

## 5. Database Schema Review & Field Mapping

All fields in `prisma/schema.prisma` are already compatible with the Draft Application lifecycle:

| Field | Type | Draft Creation Value | Notes |
|-------|------|----------------------|-------|
| `id` | `Int @id @default(autoincrement())` | Auto | Primary Key |
| `rosterRef` | `String @unique` | `CJ-CHI-XXXX` / `CJ-TUR-XXXX` | Unique candidate identifier |
| `name` | `String` | Candidate full name | Trimmed string |
| `email` | `String?` | Candidate email | Normalized lowercase |
| `phone` | `String` | Candidate phone | Trimmed string |
| `town` | `String` | Dynamic town name | E.g. "Boston", "Sleaford" |
| `sector` | `String` | "chicken" / "turkey" | Normalized sector |
| `hasRightToWork` | `Boolean?` | `true` | Invariant: must be true |
| `rightToWorkUK` | `Boolean?` | `true` | Redundant compliance flag |
| `shiftAvailability` | `String` | `"Any"` | Default shift availability |
| `timestamp` | `String` | `new Date().toISOString()` | ISO string timestamp |
| `status` | `String @default("NEW")` | `"Draft"` | Set explicitly to "Draft" |
| `contacted` | `Boolean @default(false)` | `false` | Uncontacted draft |
| `safetyResourcesSent`| `Boolean @default(false)`| `false` | Portal state |
| `safetyTasksCompleted`| `Boolean @default(false)`| `false` | Portal state |
| `declarationSigned` | `Boolean @default(false)` | `false` | Signed in Step 3 |
| `profileFormCompleted`| `Boolean @default(false)`| `false` | Completed in Step 3 |

---

## 6. Error Handling & Edge Case Matrix

| Scenario | Trigger / Condition | Expected Backend / Auth Behavior | HTTP / UI Response |
|----------|---------------------|----------------------------------|-------------------|
| **Right to Work Rejected** | `hasRightToWork === false` | Service throws `RightToWorkRequiredError`. No database write occurs. | `400 Bad Request` `{ success: false, error: "..." }`. UI shows polite message. |
| **Missing Candidate Name** | `name: ""` or missing | Service throws `ValidationError`. | `400 Bad Request` `{ success: false, error: "Candidate full name is required..." }`. |
| **Missing Phone Number** | `phone: ""` or missing | Service throws `ValidationError`. | `400 Bad Request` `{ success: false, error: "A valid contact phone number is required." }`. |
| **Duplicate Candidate Resubmission** | Candidate fills triage again with same email/phone | Service checks existing `Draft` within 24h, updates town/sector, returns existing `rosterRef`. | `201 Created` / `200 OK` with resumed `ApplicationDTO`. |
| **Clerk User Already Exists** | Email already registered in Clerk | Client catches `form_identifier_exists` and falls back to `signIn.prepareFirstFactor({ strategy: 'email_code' })`. | User receives OTP code to sign in directly without error dialog. |
| **Invalid / Expired OTP Code** | Candidate inputs wrong 6-digit code | Clerk throws verification error. | UI displays "Invalid code. Please check your email or request a new code." |
| **Unauthenticated Claim Attempt** | `POST /api/triage/claim` called without Clerk token | Clerk middleware returns 401. | `401 Unauthorized` `{ success: false, error: "Unauthorized" }`. |
| **Nonexistent RosterRef in Claim** | Invalid `rosterRef` passed to `/api/triage/claim` | Service throws `ApplicationNotFoundError`. | `404 Not Found` `{ success: false, error: "Application not found" }`. |

---

## 7. Implementation Checklist & Verification Plan

### Phase 1: Domain Exceptions & Use-Case Service
- [ ] Add `RightToWorkRequiredError` and `ValidationError` to `src/services/exceptions.ts`.
- [ ] Implement `createDraftApplication` and `linkUserToDraft` in `src/services/ManageApplications.ts`.
- [ ] Add unit tests in `tests/services/applications.test.ts` verifying:
  - Rejection and exception throwing on `hasRightToWork: false`.
  - Proper generation of `rosterRef`, `status: "Draft"`, and `ApplicationDTO` on valid input.
  - Idempotent draft resumption for existing email/phone.

### Phase 2: Hono Serverless Endpoint (`api/triage.ts`)
- [ ] Create `api/triage.ts` with `POST /api/triage` and `POST /api/triage/claim`.
- [ ] Register `triageApp` in `api/index.ts`.
- [ ] Update `api/webhook-clerk.ts` to auto-link draft applications during `user.created`.

### Phase 3: Vitest & Playwright Verification
- [ ] Run `npx vitest run tests/services/applications.test.ts` to assert 100% pass on service logic.
- [ ] Verify TypeScript compilation with `npx tsc --noEmit`.
- [ ] Verify ESLint and formatting with `npm run quality-check`.
