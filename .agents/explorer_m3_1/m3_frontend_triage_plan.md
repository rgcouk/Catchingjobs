# Milestone 3: Automated Triage & Passwordless Auth Flow — Frontend Implementation Plan

**Author**: explorer_m3_1 (teamwork_preview_explorer)  
**Date**: 2026-08-14  
**Milestone**: Milestone 3 (Ticket 3 / Issue #9)  
**Target Repository**: `/Users/Dev/Projects/Catchingjobs`  
**Relevant Files**:
- `src/components/triage/HeroTriageForm.tsx` (New component)
- `src/components/triage/PasswordlessOTPModal.tsx` (New component)
- `src/pages/landers/RegionLander.tsx` (Modified to embed `HeroTriageForm` above the fold)
- `src/types.ts` (Extended with Triage and Draft Application DTO types)

---

## 1. Executive Summary & Funnel Architecture

Milestone 3 transforms the Catchingjobs candidate intake funnel from a traditional multi-step registration form into an **Inline Hero Automated Triage & Passwordless Authentication** pipeline directly above the fold on all localized Town landing pages (`/chickens/:town`, `/turkeys/:town`).

### Funnel Progression Flowchart

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. Town SSR Page Loaded (/chickens/boston, /turkeys/sleaford)              │
│    - Pre-rendered SSR HTML delivered over the wire                          │
│    - Hero displays localized copy, pickup point, and Inline Triage Form     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ 2. Hero Triage Form (Above the Fold)                                        │
│    - Candidate enters Name, UK Phone, Email                                 │
│    - Town & Sector pre-filled from page context                             │
│    - Candidate sets Right to Work (RTW) toggle/checkbox                     │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                 ┌─────────────────────┴─────────────────────┐
                 │                                           │
         [RTW == false]                              [RTW == true]
                 │                                           │
                 ▼                                           ▼
┌─────────────────────────────────┐   ┌───────────────────────────────────────┐
│ 3A. Inline Friendly Stoppage    │   │ 3B. Draft Application Creation        │
│     - Immediate explanatory box │   │     - POST /api/applications/draft    │
│     - No API draft created      │   │     - Persists Application (status:   │
│     - No Clerk account/SMS cost │   │       "Draft", unique rosterRef)      │
│     - Option to reset/change    │   └──────────────────┬────────────────────┘
└─────────────────────────────────┘                      │
                                                         ▼
                                      ┌───────────────────────────────────────┐
                                      │ 4. Clerk Passwordless OTP Step        │
                                      │    - Email OTP code sent (Primary)    │
                                      │    - SMS OTP fallback available       │
                                      │    - Zero password/social clutter     │
                                      │    - 6-digit verification code input  │
                                      └──────────────────┬────────────────────┘
                                                         │
                                                         ▼
                                      ┌───────────────────────────────────────┐
                                      │ 5. Session Verified & Transition      │
                                      │    - Clerk session activated          │
                                      │    - User linked with Draft DB record │
                                      │    - Instant navigation to Step 1 of  │
                                      │      Onboarding Wizard (/wizard)      │
                                      └───────────────────────────────────────┘
```

---

## 2. Component Hierarchy & File Structure

```
src/
├── components/
│   ├── triage/
│   │   ├── HeroTriageForm.tsx          # Inline triage form component (Hero above-the-fold)
│   │   └── PasswordlessOTPModal.tsx    # Passwordless Clerk OTP dialog & verification state
│   └── ui/                             # shadcn/ui base primitives (Button, Input, Checkbox, Dialog)
├── pages/
│   └── landers/
│       └── RegionLander.tsx            # Embeds HeroTriageForm in Hero section
└── types.ts                            # TypeScript interfaces for triage and draft DTOs
```

---

## 3. Inline Hero Automated Triage Form Specification

### 3.1 Form Fields & Data Contract

| Field Name | Type | UI Control | Validation Rules | Default / Source |
|---|---|---|---|---|
| `name` | `string` | Text `<Input />` | Required, min 2 chars, trimmed | `""` |
| `phone` | `string` | Tel `<Input />` | Required, valid UK phone regex (`^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$` or loose 10-15 digits) | `""` |
| `email` | `string` | Email `<Input />` | Required, valid email regex for OTP delivery | `""` |
| `town` | `string` | Hidden / Readonly badge | Required | Pre-filled from `town.name` |
| `sector` | `'chicken' \| 'turkey'` | Hidden / Readonly badge | Required | Pre-filled from `sectorId` |
| `hasRightToWork` | `boolean` | Segmented Switch / Checkbox | Required boolean (`true` or `false`) | `null` / unselected initially or default `true` |

### 3.2 Zod Validation Schema

```typescript
import { z } from 'zod';

export const triageFormSchema = z.object({
  name: z.string().trim().min(2, { message: 'Please enter your full name (minimum 2 characters).' }),
  phone: z
    .string()
    .trim()
    .min(10, { message: 'Please enter a valid UK phone number.' })
    .regex(/^(\+44|0)[1-9]\d{8,12}$/, {
      message: 'Please enter a valid UK mobile or landline number.',
    }),
  email: z.string().trim().email({ message: 'Please enter a valid email address for your verification code.' }),
  town: z.string().min(1),
  sector: z.enum(['chicken', 'turkey', 'chickens', 'turkeys']),
  hasRightToWork: z.boolean({
    required_error: 'Please confirm your Right to Work status in the UK.',
  }),
});

export type TriageFormData = z.infer<typeof triageFormSchema>;
```

### 3.3 Form State Machine

The component operates as a finite state machine with 5 discrete states:

```typescript
export type TriageState = 
  | 'IDLE'               // Normal form input state
  | 'STOPPED'            // Right to Work = false, friendly rejection banner displayed
  | 'SUBMITTING_DRAFT'   // Calling POST /api/applications/draft
  | 'OTP_VERIFYING'      // Draft created; Clerk OTP modal/step is active
  | 'AUTHENTICATED'      // Clerk session established; transitioning to wizard
  | 'ERROR';             // Backend draft creation error or network failure
```

### 3.4 Right to Work Stopping Logic & UI

When the applicant selects `hasRightToWork === false` (or toggles "No"):
1. The form immediately transitions to `'STOPPED'` state.
2. The form submission is halted.
3. No backend API request is dispatched to `/api/applications/draft`.
4. No Clerk user or OTP code is triggered.
5. An inline friendly stoppage alert is rendered with Hallmark styling:
   - **Icon**: `AlertCircle` in `var(--color-accent)`
   - **Title**: *"Right to Work in the UK Required"*
   - **Message**: *"All agricultural poultry harvesting positions with Pullum Ltd legally require verified UK Right to Work (British/Irish citizenship, Settled/Pre-Settled status, or a valid work visa with agricultural endorsement). We are unable to proceed with your application at this time. Thank you for your interest."*
   - **Actions**:
     - `"Change Answer / Check Details"` button (resets state back to `IDLE` so the user can correct an accidental click).
     - `"Return to National Directory"` link to `/`.

### 3.5 Draft Application Submission (`POST /api/applications/draft`)

When `hasRightToWork === true` and all form fields validate:
1. State changes to `'SUBMITTING_DRAFT'`.
2. A `POST` request is sent to `/api/applications/draft` (or `/api/applications` with `status: "Draft"`):
   ```json
   {
     "name": "Jane Smith",
     "phone": "07700900123",
     "email": "jane.smith@example.co.uk",
     "town": "Boston",
     "sector": "chicken",
     "hasRightToWork": true
   }
   ```
3. Backend responds with `201 Created`:
   ```json
   {
     "success": true,
     "application": {
       "id": 142,
       "rosterRef": "PL-CHI-8492",
       "name": "Jane Smith",
       "phone": "07700900123",
       "email": "jane.smith@example.co.uk",
       "town": "Boston",
       "sector": "chicken",
       "status": "Draft",
       "createdAt": "2026-08-14T21:45:00.000Z"
     }
   }
   ```
4. On success:
   - `rosterRef` and `applicationId` are stored in React component state and `sessionStorage` (`"catchingjobs_active_draft"`).
   - Component transitions to `'OTP_VERIFYING'` and opens the Passwordless OTP flow.

---

## 4. Passwordless Clerk OTP Authentication Specification

### 4.1 Zero-Distraction Philosophy

The candidate must experience zero friction or extraneous choices:
- ❌ No password inputs
- ❌ No "Confirm Password"
- ❌ No Google / Apple / Facebook OAuth buttons
- ❌ No marketing sidebar distractions

The UI focuses 100% on **instant verification code delivery and entry**.

### 4.2 Dual-Strategy Clerk Flow: Email OTP (Primary) & SMS OTP (Fallback)

#### Step 1: Initiate Clerk Verification (Email OTP Primary)

```typescript
const { isLoaded: isSignUpLoaded, signUp, setActive } = useSignUp();
const { isLoaded: isSignInLoaded, signIn } = useSignIn();

const startPasswordlessVerification = async (data: TriageFormData) => {
  try {
    const nameParts = data.name.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Applicant';
    const lastName = nameParts.slice(1).join(' ') || 'Candidate';

    // 1. Attempt Sign Up with Clerk
    try {
      await signUp.create({
        emailAddress: data.email,
        firstName,
        lastName,
      });

      // Prepare Email OTP
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setOtpStrategy('email_code');
      setOtpDestination(data.email);
    } catch (signUpErr: any) {
      // 2. If user already exists in Clerk ('form_identifier_exists'), initiate Sign In OTP flow
      if (signUpErr.errors?.[0]?.code === 'form_identifier_exists') {
        const signInAttempt = await signIn.create({ identifier: data.email });
        const emailFactor = signInAttempt.supportedFirstFactors?.find(
          (f: any) => f.strategy === 'email_code'
        );
        if (emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId,
          });
          setOtpStrategy('email_code');
          setOtpDestination(data.email);
          setIsExistingUser(true);
        }
      } else {
        throw signUpErr;
      }
    }
  } catch (err: any) {
    console.error('Clerk OTP initialization failed:', err);
    setAuthError(err.errors?.[0]?.longMessage || 'Unable to send verification code. Please try again.');
  }
};
```

#### Step 2: SMS OTP Fallback Option

If the applicant is in a rural area or has trouble receiving emails, they can click `"Send code via SMS to [phone] instead"`:

```typescript
const handleSwitchToSmsOtp = async () => {
  try {
    setIsSwitchingStrategy(true);
    setAuthError('');

    // Format phone to E.164 (+44...)
    const formattedPhone = formatUkPhoneToE164(formData.phone);

    if (!isExistingUser) {
      await signUp.update({ phoneNumber: formattedPhone });
      await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
    } else {
      const phoneFactor = signIn.supportedFirstFactors?.find(
        (f: any) => f.strategy === 'phone_code'
      );
      if (phoneFactor) {
        await signIn.prepareFirstFactor({
          strategy: 'phone_code',
          phoneNumberId: phoneFactor.phoneNumberId,
        });
      }
    }

    setOtpStrategy('phone_code');
    setOtpDestination(formData.phone);
    setResendCountdown(30);
  } catch (err: any) {
    console.error('Failed to switch to SMS OTP:', err);
    setAuthError(err.errors?.[0]?.longMessage || 'Failed to send SMS code. Please verify your phone number.');
  } finally {
    setIsSwitchingStrategy(false);
  }
};
```

#### Step 3: Verify 6-Digit OTP Code

```typescript
const handleVerifyOtp = async (code: string) => {
  try {
    setIsVerifying(true);
    setAuthError('');

    let completeSessionId: string | null = null;

    if (!isExistingUser) {
      if (otpStrategy === 'email_code') {
        const res = await signUp.attemptEmailAddressVerification({ code });
        if (res.status === 'complete') completeSessionId = res.createdSessionId;
      } else {
        const res = await signUp.attemptPhoneNumberVerification({ code });
        if (res.status === 'complete') completeSessionId = res.createdSessionId;
      }
    } else {
      const res = await signIn.attemptFirstFactor({
        strategy: otpStrategy,
        code,
      });
      if (res.status === 'complete') completeSessionId = res.createdSessionId;
    }

    if (completeSessionId) {
      // 1. Activate Clerk session
      await setActive({ session: completeSessionId });

      // 2. Link Clerk user with the Draft Application record
      if (draftApplication?.rosterRef) {
        try {
          await fetch(`/api/applications/${draftApplication.rosterRef}/link-user`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rosterRef: draftApplication.rosterRef }),
          });
        } catch (linkErr) {
          console.warn('Draft user linkage notification error:', linkErr);
        }
      }

      // 3. Smooth transition to Onboarding Wizard (Ticket 4)
      toast.success('Identity verified! Transferring to Onboarding Wizard...');
      navigate('/user-portal?flow=wizard');
    } else {
      setAuthError('Verification incomplete. Please re-enter the code.');
    }
  } catch (err: any) {
    console.error('OTP Verification error:', err);
    setAuthError(err.errors?.[0]?.longMessage || 'Invalid or expired verification code.');
  } finally {
    setIsVerifying(false);
  }
};
```

---

## 5. Design System & Styling Tokens Matrix

### 5.1 Token Compliance Reference (Hallmark OKLCH on Landers)

Per `AGENTS.md` and `.agents/AGENTS.md`:
- **Public Landers (`/`, `/:sector/:town`)**: Must strictly use Hallmark OKLCH tokens (`var(--color-paper)`, `var(--color-ink)`, `var(--color-rule)`, `var(--color-accent)`).
- **Dashboards & Portals (`/admin`, `/user-portal`, `/portal`)**: Use `shadcn/ui` tokens (`--background`, `--foreground`, `--card`, `--sidebar`).

### 5.2 Token Mapping for Hero Triage Component

| Component Element | Hallmark OKLCH Token | Tailwind CSS Class / Variable | Fallback Color |
|---|---|---|---|
| Triage Form Container | `var(--color-paper)` | `bg-[var(--color-paper)]` | `oklch(98% 0.01 90)` |
| Card Border | `var(--color-rule)` | `border border-[var(--color-rule)]` | `oklch(85% 0.01 240)` |
| Section Headings | `var(--color-ink)` + `var(--font-display)` | `text-[var(--color-ink)] font-display` | `oklch(15% 0.02 240)` |
| Field Labels | `var(--color-ink)` + `var(--font-mono)` | `text-[var(--color-ink)] font-mono text-xs uppercase tracking-wider` | `oklch(15% 0.02 240)` |
| Input Background | `var(--color-paper-2)` | `bg-[var(--color-paper-2)]` | `oklch(95% 0.015 90)` |
| Input Text & Focus Ring | `var(--color-ink)` & `var(--color-focus)` | `text-[var(--color-ink)] focus:ring-[var(--color-focus)]` | `oklch(65% 0.2 45)` |
| Helper / Description Text | `var(--color-ink-2)` | `text-[var(--color-ink-2)] text-xs` | `oklch(45% 0.01 240)` |
| Primary CTA Button | `var(--color-accent)` | `bg-[var(--color-accent)] text-[var(--color-paper)] hover:opacity-90` | `oklch(50% 0.15 40)` |
| Stoppage Alert Banner | `var(--color-paper-2)` + `var(--color-accent)` | `bg-[var(--color-paper-2)] border-[var(--color-accent)] text-[var(--color-ink)]` | `oklch(95% 0.015 90)` |
| OTP Digit Input Box | `var(--color-paper-2)` & `var(--color-rule)` | `bg-[var(--color-paper-2)] border-[var(--color-rule)] text-[var(--color-ink)] font-mono` | `oklch(95% 0.015 90)` |

### 5.3 Utilitarian Copy Rules

In alignment with Issue #12 and domain rules:
- ✅ Emphasize: *"Door-to-door transit provided"*, *"Friendly local crew"*, *"AHVLA & Lantra certified"*, *"Guaranteed weekly direct deposit"*.
- ❌ Strictly FORBIDDEN: Specific hourly wage rates (e.g. "£13.50/hr") or specific shift hours on public landers.

---

## 6. Concrete Implementation Blueprints

### 6.1 `src/components/triage/HeroTriageForm.tsx`

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Mail,
  Phone,
  User,
} from 'lucide-react';
import { TownData } from '@/types';
import PasswordlessOTPModal from './PasswordlessOTPModal';

export const triageSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Full name must be at least 2 characters.' }),
  phone: z
    .string()
    .trim()
    .min(10, { message: 'Please enter a valid UK phone number.' })
    .regex(/^(\+44|0)[1-9]\d{8,12}$/, {
      message: 'Enter a valid UK phone format (e.g. 07700 900123).',
    }),
  email: z
    .string()
    .trim()
    .email({ message: 'Valid email address is required for OTP code.' }),
  hasRightToWork: z.boolean({
    required_error: 'Right to Work selection is required.',
  }),
});

export type TriageFormData = z.infer<typeof triageSchema>;

interface HeroTriageFormProps {
  town: TownData;
  sectorId: 'chicken' | 'turkey';
  className?: string;
}

export default function HeroTriageForm({ town, sectorId, className = '' }: HeroTriageFormProps) {
  const [isStopped, setIsStopped] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false);
  const [draftResult, setDraftResult] = useState<{ id: number; rosterRef: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TriageFormData>({
    resolver: zodResolver(triageSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      hasRightToWork: true,
    },
  });

  const watchRtw = watch('hasRightToWork');

  const onFormSubmit = async (values: TriageFormData) => {
    setSubmitError('');

    // Check Right to Work gate
    if (!values.hasRightToWork) {
      setIsStopped(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Submit Draft Application to Backend
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          phone: values.phone,
          email: values.email,
          town: town.name,
          sector: sectorId,
          hasRightToWork: true,
          status: 'Draft',
          shiftAvailability: 'Any',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to create draft application');
      }

      const createdApp = await res.json();
      setDraftResult({
        id: createdApp.id,
        rosterRef: createdApp.rosterRef,
      });

      // Save draft info to session storage for recovery
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(
          'cj_active_draft',
          JSON.stringify({
            id: createdApp.id,
            rosterRef: createdApp.rosterRef,
            email: values.email,
            phone: values.phone,
            name: values.name,
          })
        );
      }

      // 2. Open Clerk Passwordless OTP Modal
      setShowOtpModal(true);
    } catch (err: any) {
      console.error('Triage draft submission error:', err);
      setSubmitError(err.message || 'Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetStoppage = () => {
    setIsStopped(false);
    setValue('hasRightToWork', true);
  };

  return (
    <div
      data-testid="hero-triage-card"
      className={`bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] p-6 sm:p-7 w-full md:w-[380px] shrink-0 shadow-xl relative ${className}`}
    >
      {/* Header */}
      <div className="space-y-1.5 pb-4 border-b border-[var(--color-rule)]">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--color-accent)] bg-[var(--color-paper-2)] px-2 py-0.5 border border-[var(--color-rule)]">
            Fast-Track Triage
          </span>
          <span className="text-xs font-mono text-[var(--color-ink-2)]">
            {town.name} Roster
          </span>
        </div>
        <h3 className="font-display text-2xl text-[var(--color-ink)] leading-tight">
          Join {town.name} Crew
        </h3>
        <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
          Door-to-door transit provided. Enter your details to start onboarding.
        </p>
      </div>

      {/* Right to Work Stopped State Banner */}
      {isStopped ? (
        <div
          data-testid="triage-stoppage-banner"
          className="mt-5 p-4 bg-[var(--color-paper-2)] border-l-2 border-[var(--color-accent)] space-y-3"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[var(--color-accent)] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-[var(--color-ink)]">
                Right to Work in UK Required
              </h4>
              <p className="text-xs text-[var(--color-ink-2)] leading-relaxed">
                Catching positions require verified UK Right to Work (UK/Irish passport, Settled/Pre-Settled status, or valid work visa). We cannot proceed without valid Right to Work.
              </p>
            </div>
          </div>
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetStoppage}
              className="text-xs font-mono font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)] flex items-center gap-1.5 underline cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Change Answer
            </button>
            <a
              href="/"
              className="text-xs font-mono text-[var(--color-ink-2)] hover:text-[var(--color-ink)]"
            >
              National Hub
            </a>
          </div>
        </div>
      ) : (
        /* Active Triage Form */
        <form
          data-testid="hero-triage-form"
          onSubmit={handleSubmit(onFormSubmit)}
          className="mt-5 space-y-4"
        >
          {submitError && (
            <div className="p-2.5 text-xs text-red-600 bg-red-50 border border-red-200">
              {submitError}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] font-medium flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="e.g. Arthur King"
              {...register('name')}
              className="w-full px-3 py-2 text-sm bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-2)]/50 focus:outline-none focus:border-[var(--color-ink)] font-sans"
            />
            {errors.name && (
              <p className="text-[11px] text-red-600 font-mono">{errors.name.message}</p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              UK Mobile Number
            </label>
            <input
              type="tel"
              placeholder="07700 900123"
              {...register('phone')}
              className="w-full px-3 py-2 text-sm bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-2)]/50 focus:outline-none focus:border-[var(--color-ink)] font-mono"
            />
            {errors.phone && (
              <p className="text-[11px] text-red-600 font-mono">{errors.phone.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-2)] font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[var(--color-accent)]" />
              Email Address (for Code)
            </label>
            <input
              type="email"
              placeholder="name@example.co.uk"
              {...register('email')}
              className="w-full px-3 py-2 text-sm bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] placeholder:text-[var(--color-ink-2)]/50 focus:outline-none focus:border-[var(--color-ink)] font-sans"
            />
            {errors.email && (
              <p className="text-[11px] text-red-600 font-mono">{errors.email.message}</p>
            )}
          </div>

          {/* Right to Work Toggle */}
          <div className="pt-2 border-t border-[var(--color-rule)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--color-ink)]">
                UK Right to Work?
              </span>
              <div className="flex items-center gap-1 bg-[var(--color-paper-2)] p-1 border border-[var(--color-rule)]">
                <button
                  type="button"
                  onClick={() => setValue('hasRightToWork', true)}
                  className={`px-2.5 py-1 text-xs font-mono uppercase transition-colors cursor-pointer ${
                    watchRtw === true
                      ? 'bg-[var(--color-ink)] text-[var(--color-paper)] font-semibold'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('hasRightToWork', false);
                    setIsStopped(true);
                  }}
                  className={`px-2.5 py-1 text-xs font-mono uppercase transition-colors cursor-pointer ${
                    watchRtw === false
                      ? 'bg-[var(--color-accent)] text-[var(--color-paper)] font-semibold'
                      : 'text-[var(--color-ink-2)] hover:text-[var(--color-ink)]'
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            {errors.hasRightToWork && (
              <p className="text-[11px] text-red-600 font-mono">
                {errors.hasRightToWork.message}
              </p>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              id="btn-triage-submit"
              className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] disabled:opacity-50 text-[var(--color-paper)] font-medium py-3 px-4 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
                  <span>Checking Roster...</span>
                </>
              ) : (
                <>
                  <span>Fast-Track Application</span>
                  <ArrowRight className="w-4 h-4 text-[var(--color-accent)]" />
                </>
              )}
            </button>
          </div>

          <p className="text-[10px] text-center text-[var(--color-ink-2)] font-mono leading-tight">
            Passwordless instant verification via Email/SMS code.
          </p>
        </form>
      )}

      {/* Passwordless Clerk OTP Modal */}
      {showOtpModal && (
        <PasswordlessOTPModal
          isOpen={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          formData={watch()}
          draftApplication={draftResult}
        />
      )}
    </div>
  );
}
```

---

### 6.2 `src/components/triage/PasswordlessOTPModal.tsx`

```tsx
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useSignIn, useSignUp } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import {
  ShieldCheck,
  Mail,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  RotateCcw,
} from 'lucide-react';
import { TriageFormData } from './HeroTriageForm';

interface PasswordlessOTPModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: TriageFormData;
  draftApplication: { id: number; rosterRef: string } | null;
}

export default function PasswordlessOTPModal({
  isOpen,
  onClose,
  formData,
  draftApplication,
}: PasswordlessOTPModalProps) {
  const navigate = useNavigate();
  const { isLoaded: isSignUpLoaded, signUp, setActive: setSignUpActive } = useSignUp();
  const { isLoaded: isSignInLoaded, signIn, setActive: setSignInActive } = useSignIn();

  const [otpCode, setOtpCode] = useState<string>('');
  const [strategy, setStrategy] = useState<'email_code' | 'phone_code'>('email_code');
  const [isExistingUser, setIsExistingUser] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(30);

  // Countdown timer for code resend
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Initiate Clerk Passwordless flow upon mounting
  useEffect(() => {
    let isMounted = true;

    async function initClerkOtp() {
      if (!isSignUpLoaded || !isSignInLoaded) return;
      setIsInitializing(true);
      setErrorMessage('');

      try {
        const nameParts = formData.name.trim().split(/\s+/);
        const firstName = nameParts[0] || 'Applicant';
        const lastName = nameParts.slice(1).join(' ') || 'Candidate';

        // 1. Attempt Sign-Up with Email
        try {
          await signUp.create({
            emailAddress: formData.email,
            firstName,
            lastName,
          });

          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
          if (isMounted) {
            setStrategy('email_code');
            setIsExistingUser(false);
            setCountdown(30);
          }
        } catch (signUpErr: any) {
          // If user already exists in Clerk, switch to Sign-In OTP
          if (
            signUpErr.errors?.[0]?.code === 'form_identifier_exists' ||
            signUpErr.errors?.[0]?.message?.includes('already exists')
          ) {
            const signInAttempt = await signIn.create({ identifier: formData.email });
            const emailFactor = signInAttempt.supportedFirstFactors?.find(
              (f: any) => f.strategy === 'email_code'
            );

            if (emailFactor && 'emailAddressId' in emailFactor) {
              await signIn.prepareFirstFactor({
                strategy: 'email_code',
                emailAddressId: emailFactor.emailAddressId as string,
              });
              if (isMounted) {
                setStrategy('email_code');
                setIsExistingUser(true);
                setCountdown(30);
              }
            } else {
              throw new Error('Email verification factor not configured for existing account.');
            }
          } else {
            throw signUpErr;
          }
        }
      } catch (err: any) {
        console.error('Clerk OTP init error:', err);
        if (isMounted) {
          setErrorMessage(
            err.errors?.[0]?.longMessage ||
              err.message ||
              'Unable to send verification code. Please check your email.'
          );
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    initClerkOtp();

    return () => {
      isMounted = false;
    };
  }, [isSignUpLoaded, isSignInLoaded, formData.email, formData.name]);

  // Verify entered 6-digit code
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMessage('Please enter the full 6-digit verification code.');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      let createdSessionId: string | null = null;

      if (!isExistingUser) {
        if (strategy === 'email_code') {
          const res = await signUp.attemptEmailAddressVerification({ code: otpCode.trim() });
          if (res.status === 'complete') createdSessionId = res.createdSessionId;
        } else {
          const res = await signUp.attemptPhoneNumberVerification({ code: otpCode.trim() });
          if (res.status === 'complete') createdSessionId = res.createdSessionId;
        }
        if (createdSessionId && setSignUpActive) {
          await setSignUpActive({ session: createdSessionId });
        }
      } else {
        const res = await signIn.attemptFirstFactor({
          strategy,
          code: otpCode.trim(),
        });
        if (res.status === 'complete') createdSessionId = res.createdSessionId;
        if (createdSessionId && setSignInActive) {
          await setSignInActive({ session: createdSessionId });
        }
      }

      if (createdSessionId) {
        // Successful OTP verification -> route to wizard
        onClose();
        navigate('/user-portal?wizard=active');
      } else {
        setErrorMessage('Verification is incomplete. Please try entering the code again.');
      }
    } catch (err: any) {
      console.error('Clerk OTP attempt error:', err);
      setErrorMessage(
        err.errors?.[0]?.longMessage ||
          'Invalid verification code. Please check and re-enter.'
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend code action
  const handleResend = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    setErrorMessage('');

    try {
      if (!isExistingUser) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      } else {
        const signInAttempt = await signIn.create({ identifier: formData.email });
        const emailFactor = signInAttempt.supportedFirstFactors?.find(
          (f: any) => f.strategy === 'email_code'
        );
        if (emailFactor && 'emailAddressId' in emailFactor) {
          await signIn.prepareFirstFactor({
            strategy: 'email_code',
            emailAddressId: emailFactor.emailAddressId as string,
          });
        }
      }
      setCountdown(30);
    } catch (err: any) {
      console.error('Failed to resend code:', err);
      setErrorMessage(err.errors?.[0]?.longMessage || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      data-testid="passwordless-otp-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
    >
      <div className="bg-[var(--color-paper)] text-[var(--color-ink)] border border-[var(--color-rule)] max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[var(--color-ink-2)] hover:text-[var(--color-ink)] p-1 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-[var(--color-paper-2)] border border-[var(--color-rule)] flex items-center justify-center mx-auto text-[var(--color-accent)]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-display text-2xl text-[var(--color-ink)]">
            Verify Your Application
          </h3>
          <p className="text-xs text-[var(--color-ink-2)] leading-relaxed max-w-xs mx-auto">
            We sent a 6-digit verification code to{' '}
            <strong className="text-[var(--color-ink)] font-mono">{formData.email}</strong>.
          </p>
          {draftApplication?.rosterRef && (
            <div className="inline-block bg-[var(--color-paper-2)] border border-[var(--color-rule)] px-2.5 py-0.5 text-[10px] font-mono text-[var(--color-ink-2)]">
              Draft Ref: <span className="text-[var(--color-ink)] font-semibold">{draftApplication.rosterRef}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner during Clerk Initialization */}
        {isInitializing ? (
          <div className="py-8 text-center space-y-3">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-[var(--color-accent)]" />
            <p className="text-xs font-mono text-[var(--color-ink-2)]">
              Dispatching secure verification code...
            </p>
          </div>
        ) : (
          /* Code Input Form */
          <form onSubmit={handleVerify} className="space-y-4">
            {errorMessage && (
              <div
                data-testid="otp-error-message"
                className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-2)] block text-center">
                Enter 6-Digit Code
              </label>
              <input
                data-testid="otp-input"
                type="text"
                maxLength={6}
                autoFocus
                placeholder="123456"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                className="w-full text-center tracking-[0.4em] text-2xl py-3 px-4 bg-[var(--color-paper-2)] border border-[var(--color-rule)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-ink)] font-mono font-bold"
              />
            </div>

            <button
              data-testid="btn-verify-otp"
              type="submit"
              disabled={isVerifying || otpCode.length < 6}
              className="w-full bg-[var(--color-ink)] hover:bg-[var(--color-ink-2)] disabled:opacity-50 text-[var(--color-paper)] font-medium py-3 px-4 text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--color-accent)]" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                <span>Confirm & Continue</span>
              )}
            </button>

            {/* Resend and Fallback Controls */}
            <div className="pt-3 border-t border-[var(--color-rule)] flex items-center justify-between text-xs font-mono">
              <button
                type="button"
                onClick={handleResend}
                disabled={countdown > 0 || isResending}
                className="text-[var(--color-ink-2)] hover:text-[var(--color-ink)] disabled:opacity-40 transition-colors cursor-pointer"
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Code'}
              </button>
              <span className="text-[10px] text-[var(--color-ink-2)]">
                Passwordless Auth
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
```

---

### 6.3 Integrating `HeroTriageForm` into `src/pages/landers/RegionLander.tsx`

In `src/pages/landers/RegionLander.tsx`:
Replace lines 318–348 (the placeholder Action Box) with the `HeroTriageForm`:

```tsx
import HeroTriageForm from '../../components/triage/HeroTriageForm';

// Inside RegionLander JSX Hero Section:
{/* Hero Section */}
<section className="relative bg-[var(--color-ink)] text-[var(--color-paper)] overflow-hidden min-h-[42vh] flex items-center border-b border-[var(--color-rule)]">
  <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10 flex flex-col md:flex-row gap-8 justify-between items-center">
    
    {/* Left Column: Localized SEO Copy & Guarantees */}
    <div className="space-y-6 flex-1 text-center md:text-left">
      <div>
        <button
          onClick={onBackToSector}
          className="text-xs font-mono font-medium text-[var(--color-accent)] hover:text-white flex items-center gap-1.5 p-1 -ml-1 transition-colors cursor-pointer mb-3 mx-auto md:mx-0"
          id="btn-region-back"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to {tenant.title}
        </button>

        <div className="inline-flex items-center gap-2 text-xs font-mono font-medium text-[var(--color-paper)] bg-white/10 px-3 py-1 border border-white/20 uppercase tracking-wider mx-auto md:mx-0">
          <MapPin className="w-3.5 h-3.5 text-[var(--color-accent)]" />
          <span>
            {town.name} Catching Area • {town.region.name}
          </span>
        </div>
      </div>

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display text-white leading-tight tracking-tight">
        Join our professional catching crews in {town.name}.
      </h1>

      <p className="text-base text-white/80 leading-relaxed font-normal max-w-xl mx-auto md:mx-0">
        {town.localizedCopy}
      </p>

      {/* Value Props & Guarantees */}
      <div className="flex flex-wrap justify-center md:justify-start gap-6 pt-4 border-t border-white/15">
        <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
          <Users className="w-4 h-4 text-[var(--color-accent)]" />
          <span>{town.region.activeCrews} Active Local Crews</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
          <ShieldCheck className="w-4 h-4 text-[var(--color-accent)]" />
          <span>AHVLA Licensed</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/90 font-medium font-mono">
          <Clock className="w-4 h-4 text-[var(--color-accent)]" />
          <span>Guaranteed Weekly Pay</span>
        </div>
      </div>
    </div>

    {/* Right Column: Hero Automated Triage Form (Ticket 3) */}
    <HeroTriageForm town={town} sectorId={sectorId} />
  </div>
</section>
```

---

## 7. Edge Cases & Resilience Matrix

| # | Edge Case / Scenario | Mechanism / Behavior | Verified By |
|---|---|---|---|
| 1 | Candidate selects "No" for Right to Work | Form stops immediately; shows explanatory stoppage banner; prevents API call and Clerk account creation. | TC-TA-002 |
| 2 | Candidate accidentally toggles RTW="No" and wants to fix | "Change Answer" button resets state back to `IDLE` with `hasRightToWork=true`, allowing instant re-entry. | TC-TA-002 |
| 3 | Candidate enters invalid UK phone format | Zod client validation highlights field with clear inline guidance without submitting. | TC-TA-003 |
| 4 | Candidate enters existing email in Clerk | Component catches `form_identifier_exists` and seamlessly prepares Sign-In OTP instead of throwing error. | TC-TA-004 |
| 5 | Candidate enters invalid or expired 6-digit OTP | Clerk throws error; UI displays clear message in `red` banner; keeps input active. | TC-TA-004 |
| 6 | Candidate clicks Resend before 30s timer | Resend button is disabled with countdown timer (`Resend in 24s`) to prevent rate limit spam. | TC-TA-004 |
| 7 | Zero-JS crawler loads `/chickens/boston` | SSR delivers full HTML including the triage form container, title, inputs, and pickup points. | TC-TA-001 |
| 8 | National Hub (`/`) Isolation | Root directory contains ZERO triage forms; intake forms exist strictly on dynamic town pages. | TC-TA-005 |

---

## 8. Implementation Steps & Delegation Sequence

1. **Step 1**: Create `src/components/triage/HeroTriageForm.tsx` with Zod schema and Right to Work gate.
2. **Step 2**: Create `src/components/triage/PasswordlessOTPModal.tsx` integrating `@clerk/clerk-react` (`useSignUp`, `useSignIn`).
3. **Step 3**: Update `src/pages/landers/RegionLander.tsx` to mount `<HeroTriageForm town={town} sectorId={sectorId} />` above the fold.
4. **Step 4**: Run `npm run quality-check` (format, lint, build) to ensure zero compilation or styling errors.
5. **Step 5**: Execute Playwright suite (`npx playwright test tests/triage_auth.spec.ts`) to verify end-to-end triage flow and auth trigger.
