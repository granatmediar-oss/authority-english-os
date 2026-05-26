# Language Goal OS — Supabase MVP

This version adds the database foundation for scaling:

- saves selected interface language, target language, goal and level;
- saves training attempts and scores;
- reloads progress from Supabase when the same browser opens the app again;
- falls back to browser localStorage if Supabase env variables are not configured.

## 1. Create Supabase tables

Open Supabase → SQL Editor → paste and run the contents of:

```text
supabase/schema.sql
```

## 2. Add Vercel environment variables

Vercel → Project → Settings → Environment Variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then redeploy.

## 3. Test

1. Select a language, goal and level.
2. Complete one training attempt.
3. Click Analyze / Проверить ответ.
4. Open Progress / Прогресс.
5. Refresh the page: the route and attempts should remain.

## Note

This is an MVP sync model using a browser device key. For production, replace it with Supabase Auth and RLS policies based on `auth.uid()`.
