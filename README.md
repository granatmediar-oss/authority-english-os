# Authority English OS

A deploy-ready Next.js MVP for daily English speaking practice focused on Product Architecture, founder calls, no-code, AI risk, and conference-level speaking.

## What works now

- Start Here / 7-day beginner plan
- Daily founder-call scenario practice
- Browser voice recognition via Web Speech API
- Manual mode fallback
- Transcript box
- Basic score: vocabulary, authority, clarity
- Stronger authority version
- Listen button using browser speech synthesis
- Scenario library
- Phrase bank
- Conference track
- Session-based saved attempts

## Best browser

Use Google Chrome on desktop.

Voice recognition works best when the app is deployed on HTTPS, for example on Vercel.

## Local setup

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Deploy to Vercel

1. Create a new GitHub repository.
2. Upload all project files.
3. Go to Vercel.
4. Import the GitHub repository.
5. Click Deploy.
6. Open the HTTPS link in Google Chrome.
7. Allow microphone access.

## Next product layer

To turn this into a full learning system, add:

- Supabase for users, attempts, phrases, and progress
- OpenAI Whisper for accurate transcription
- OpenAI feedback for real authority-based analysis
- Spaced repetition scheduler
- 90-day learning plan
- Login and personal dashboard
