---
name: auto-quality-gate
description: Automated Quality Gate for Orca ADE — runs pre-flight linting, build verification, and deployment readiness checks.
---

# Automated Quality Gate Skill

Use this skill to execute a 4-step automated quality verification pass across the Catchingjobs application.

## Quality Gate Workflow

### 1. Code Style & Formatting Verification
Run Prettier and ESLint:
```bash
npm run format && npm run lint
```
- Verify zero ESLint warnings and zero errors.

### 2. Prisma Database Schema Sync
Generate Prisma client:
```bash
npx prisma generate
```
- Ensure client types are synced with `prisma/schema.prisma`.

### 3. Production Build Compilation
Test production build:
```bash
npm run build
```
- Ensure Vite bundle and TypeScript compilation pass with zero errors.

### 4. Git & Vercel Readiness Check
Check repository state:
```bash
git status
```
- Confirm all working changes are committed cleanly before deployment.
