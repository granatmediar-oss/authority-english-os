# Language Goal OS — Managed Beta Product Layer

This package turns the prototype into a controlled beta product flow:

application → beta access → route workspace → practice → feedback → monetization decision

## What was added

1. Access gate before the app
   - Users need a beta/paid code before entering.
   - This prevents the app from being fully open to everyone.

2. Route-based access
   - A code opens only a specific route or all routes.
   - School route opens the child/parent interface.
   - Adult route opens the current adult flow.

3. My access status
   - The header shows whether the user has beta or paid access and which route is open.
   - There is a “Change access” button for testing another code.

4. Feedback loop after 3 attempts
   - After several practices, the user sees a feedback request.
   - For public beta, connect this to Make → Google Sheets → Telegram.

5. Adult and child flows remain separated
   - Adult: language → goal → level → scenarios → voice practice → feedback → progress.
   - Child: setup → mission → phrases → parent dashboard.

## Built-in test codes

Use these manually for beta testers:

- SCHOOL-BETA-001 — school route, 14 days
- WORK-BETA-001 — work/interview route, 30 days
- COUNTRY-BETA-001 — new country route, 30 days
- TALK-BETA-001 — conversation route, 30 days
- PRO-BETA-001 — professional authority route, 30 days
- ALL-BETA-001 — all routes, 30 days
- SCHOOL-PAID-001 — school route, paid mock, 30 days
- WORK-PAID-001 — work/interview route, paid mock, 30 days

## What to replace in GitHub

Replace:

- app/page.tsx

If Vercel has npm registry issues again, also replace:

- .npmrc
- package-lock.json

## Important

This is not real authentication yet. It is a controlled MVP beta access layer based on localStorage and access codes.
For production, the next step is server-side access control:

- user accounts
- payment status
- route entitlement table
- parent-child profiles
- feedback table
- admin dashboard

