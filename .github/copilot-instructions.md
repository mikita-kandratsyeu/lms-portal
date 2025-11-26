# Project Overview

- This project uses Next.js with the App Router feature.
- Styling is done with Tailwind CSS.
- Prisma ORM is used for database access with PostgreSQL as the database.
- TypeScript is used throughout for type safety and clarity.

## Coding Style

- Use functional React components and hooks idiomatically.
- Define clear types for all function parameters and return values.
- Split complex logic into small reusable functions.

## Architecture Guidelines

- Separate database access logic (via Prisma) from business logic and UI layers.
- Use Prisma Client exclusively for all database queries and mutations.
- Organize Next.js app folder with clear routing and layout structures as per Next.js standards.
- Avoid global states unless absolutely necessary; prefer local and hook-based state management.

## Error Handling and Security

- Catch and handle errors explicitly; never ignore promise rejections.
- Do not log sensitive data such as database credentials or user secrets.
- Validate all API inputs strictly and return safe error messages.

## Copilot Behavior

- Explain briefly what code changes are being made before providing code.
- Offer alternative solutions when multiple approaches are possible.
- When editing existing files, indicate exact locations (file and function/component name) for insertions.
