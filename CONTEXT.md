# Catchingjobs Domain Glossary

A recruitment platform connecting poultry workers with jobs via localized SEO hubs and a secure onboarding portal.

## Architecture

**Route Loaders**:
Functions that fetch data at the network boundary before a React component mounts, serving as the translation layer between API payloads and UI interfaces.

**Use-Case Services**:
Deep modules in the backend that encapsulate business logic (e.g., `ProcessApplication`), isolating it from the HTTP layer.

**Domain Exceptions**:
Custom errors thrown by the service layer (e.g., `ApplicationNotFoundError`) that are agnostic to the transport layer.

## Components

**Kanban Column / Task**:
Strongly typed interfaces defining the UI requirements for rendering the Kanban board, strictly decoupled from the backend Application database model.

## Domain Entities

**Application**:
The core database record representing a candidate's submission. A Draft Application is created instantly upon a user passing triage and creating a Clerk account. Admins only review fully submitted applications.
_Avoid_: Lead, Profile, Half-finished Lead

**Automated Triage**:
The instant validation step on public landing pages (e.g., checking Right to Work). Passing this step immediately triggers passwordless Clerk account creation so the user can complete the Full Application in the same session.
_Avoid_: Manual Review, Lead Capture Form

**Passwordless Auth**:
Workers authenticate exclusively via passwordless magic links and OTPs provided by Clerk. Email OTP is the primary method for reliability (works on Wi-Fi), with SMS OTP as a fallback for users without reliable data plans.
_Avoid_: Passwords, Social Login for Workers

## Landing Page Rules

**Primary Hook**:
The marketing copy must emphasize "Door-to-door pickup" and "Friendly teams". It must NEVER mention specific pay rates or work times.

**Intake Form Placement**:
To maximize conversion, the Triage/Intake form must be placed directly above the fold in the Hero section, not hidden behind an "Apply Now" button.

**Imagery**:
Landing pages will use flat, clean illustrations inspired by high-end, smooth vector animation aesthetics (e.g., fluid, conceptual, or geometric styles like 'Earth Exponential'). Avoid generic photography, real photos of poultry catching, or generic "Corporate Memphis" human characters.

**Index Page Strategy**:
The root homepage (`/`) acts exclusively as a "National Hub" showcasing both sectors (Chickens and Turkeys). It does not contain an intake form. Its primary call-to-action is routing users to a specific local town page where the intake form lives.

## Content Management

**SEO Hub Customization**:
Local SEO pages (e.g. `/chickens/boston`) are fully data-driven. Admins must have a rich, customizable editor (like a Markdown or block editor) within the Admin Panel to manage and tweak the content for every Town page without requiring developer intervention or code changes.
