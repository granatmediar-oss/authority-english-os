# Language Goal OS — Pronunciation Hint Fix

This version fixes missing reading hints for AI-generated English phrases.

What changed:
- generated/stronger phrases now receive an approximate Russian reading hint instead of the placeholder;
- AI feedback strongerVersion now gets a dynamic hint based on the actual displayed phrase;
- beginner phrases from AI routes also use safe generated hints when OpenAI did not return pronunciationRu;
- existing hand-written hints are preserved.

Replace at minimum:
- app/page.tsx

If Vercel has dependency issues, also replace:
- .npmrc
- package-lock.json
