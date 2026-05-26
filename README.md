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


## Phase 2: AI route generator

This version adds `/api/generate-route`.

It can generate a 30-day language route with:
- scenarios
- 3 daily phrases
- emergency phrases
- dialogues
- Russian translations
- pronunciation helpers

To enable real AI generation in Vercel, add Environment Variables:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

If `OPENAI_API_KEY` is not set, the app still works and returns a safe demo route. This allows beta testing without API balance.

## Phase 3: AI feedback engine

This version adds `/api/analyze-attempt`.

The speaking loop is now:

1. User records voice or types manually.
2. Browser speech recognition creates the transcript.
3. User clicks Analyze.
4. The app sends the transcript, scenario, level, goal and target language to `/api/analyze-attempt`.
5. If `OPENAI_API_KEY` exists, OpenAI returns structured feedback.
6. If no API key or no balance, the app uses safe fallback feedback and still works.

Environment variable for real AI feedback:

```bash
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-4o-mini
```

ChatGPT Plus does not include API usage. OpenAI API billing is separate.
