export const runtime = "nodejs";

const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "OPENAI_API_KEY is not configured in Vercel Environment Variables." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const text = typeof body.text === "string" ? body.text.trim() : "";
    const voice = typeof body.voice === "string" ? body.voice : "marin";
    const mode = typeof body.mode === "string" ? body.mode : "normal";

    if (!text) {
      return Response.json({ error: "Text is required." }, { status: 400 });
    }

    const instructions =
      mode === "slow"
        ? "Speak in clear beginner-friendly American English. Slow down, add natural pauses between phrases, and make the pronunciation easy to shadow. Sound like a calm professional language coach."
        : "Speak in natural, confident American English. Use a calm professional tone suitable for business English training and founder-call practice.";

    const response = await fetch(OPENAI_TTS_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini-tts",
        voice,
        input: text,
        instructions,
        response_format: "mp3"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json(
        { error: "OpenAI TTS request failed.", details: errorText },
        { status: response.status }
      );
    }

    const audio = await response.arrayBuffer();

    return new Response(audio, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    return Response.json(
      { error: "Unexpected TTS error.", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
