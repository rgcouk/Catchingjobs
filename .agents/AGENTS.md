# Catchingjobs Agent Instructions

## Tech Stack
- **Framework**: Vite + React
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database**: Prisma with SQLite
- **Backend**: Express (via `server.js` or Vite middleware)

## Coding Standards
- **Formatting**: Always run `npm run format` (Prettier) after making significant changes to ensure code style consistency.
- **Linting**: Ensure `npm run lint` passes without errors. Fix all ESLint warnings.
- **Database**: When changing Prisma schema, run `npx prisma db push` (or migrate) to update the SQLite database, and restart any running development server.

## Commands
- `npm run dev` - Starts the development server.
- `npm run build` - Builds the application for production.
- `npm run lint` - Runs ESLint.
- `npm run format` - Formats the code using Prettier.
