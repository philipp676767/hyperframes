// ElevenLabs voiceover + word timings for this project.
//   ELEVENLABS_API_KEY=... node scripts/tts.mjs [voice_id] [speed]
// Writes assets/voiceover.mp3 and assets/words.js, then runs sync-html.mjs.
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
const voice = process.argv[2] || process.env.ELEVENLABS_VOICE_ID || "onwK4e9ZLuTAKqWW03F9";
const speed = Number(process.argv[3] || 1.0);

const script = fs
  .readFileSync(new URL("script.txt", root), "utf8")
  .trim()
  .replace(/\s*\n\s*/g, " ");

const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voice}/with-timestamps?output_format=mp3_44100_128`,
  {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: script,
      model_id: "eleven_multilingual_v2",
      language_code: "de",
      voice_settings: { stability: 0.5, similarity_boost: 0.8, style: 0.15, speed },
    }),
  },
);
if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
const data = await res.json();
fs.writeFileSync(new URL("assets/voiceover.mp3", root), Buffer.from(data.audio_base64, "base64"));

// Map each script token back to its character span in the alignment.
const al = data.alignment;
const chars = al.characters.join("");
const words = [];
const re = /\S+/g;
let m;
while ((m = re.exec(chars))) {
  const raw = m[0];
  const w = raw.replace(/[.,:!?]/g, "");
  if (!w || w === "–") continue;
  const a = m.index;
  const b = m.index + raw.replace(/[.,:!?]+$/, "").length - 1;
  words.push({
    w,
    start: +al.character_start_times_seconds[a].toFixed(3),
    end: +al.character_end_times_seconds[b].toFixed(3),
  });
}
fs.writeFileSync(
  new URL("assets/words.js", root),
  "window.HF_WORDS = " + JSON.stringify(words) + ";\n",
);

console.log(`${words.length} words, voiceover ${words[words.length - 1].end.toFixed(2)}s`);
await import("./sync-html.mjs");
