# AI Agent Instructions for Credo

This document outlines the architectural context, technologies, and conventions for the `credo` codebase. AI coding agents should read and follow these guidelines when adding features, modifying code, or writing tests to stay aligned with the project's standards.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)
- **Database**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL (`@prisma/adapter-pg`)
- **Authentication**: [NextAuth.js v5](https://authjs.dev/) (Beta)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Validation**: [Zod](https://zod.dev/)
- **Notifications**: [Sonner](https://sonner.emilkowal.ski/)

## Architecture & Boundaries

This project follows a feature-driven, modular architecture:

1. **`src/app/`**: Next.js App Router boundary.
   - Contains routes, layouts, and page components.
   - Separated into route groups: `(auth)`, `(store)`, and `admin/`.
   - Prefer keeping business logic out of components and layouts. Data fetching and mutations should delegate to `modules/`.

2. **`src/modules/`**: Feature-driven business logic.
   - Modules (e.g., `auth`, `cart`, `categories`, `orders`, `products`) encapsulate domain knowledge.
   - **`actions.ts`**: Next.js Server Actions for data mutations.
   - **`queries.ts`**: Server-side data fetching logic.
   - **`validations.ts`**: Zod schemas for strict type validation.

3. **`src/components/`**: Reusable UI.
   - `ui/`: Stateless, generic elements (primarily shadcn/ui).
   - `admin/` / `store/`: Domain-specific view components. 
   - Favor client components (`"use client"`) only when interactivity (hooks, state) is strictly needed.

4. **`prisma/`**: Database configuration.
   - Modifying data models must be done in `prisma/schema.prisma`.
   - Run `npx prisma generate` after changing the schema.
   - Test data seeding is configured in `prisma/seed.ts` (run via `npm run seed`).

## Development & Build Commands

- **Start Dev Server**: `npm run dev`
- **Type Checking & Linting**: `npm run lint` (ESLint 9 / next-lint)
- **Build**: `npm run build`
- **Database Seeding**: `npm run seed`

## Coding Conventions

1. **Server vs. Client Components**: Default to Server Components (`async function`). Only append `"use client"` at the top of a file when using `useState`, `useEffect`, `rehooks`, or DOM events (`onClick`).
2. **Server Actions Rules**: Prefix mutations exported from `modules/*/actions.ts` with `'use server'` correctly and validate incoming `FormData` or JSON inputs using the domain's Zod schemas (`validations.ts`).
3. **Database Access**: Perform database reads and writes primarily inside the `src/modules/*/queries.ts` and `src/modules/*/actions.ts` abstractions, avoiding direct `db` calls inside standard UI components or API routes when a module function already exists.
4. **Dependency Resolution**: Import standard utilities from `src/lib/utils.ts` (for classnames, tailwind-merge) over composing raw string literals for tailwind classes.

## Common Pitfalls

- **NextAuth v5 (Beta) Changes**: Imports should come from the localized auth setup (`src/lib/auth.ts`) rather than direct `next-auth` generic providers.
- **Cache Invalidation**: On data mutation, remember to strategically use `revalidatePath` and `revalidateTag` to keep the storefront and admin caches in sync.
