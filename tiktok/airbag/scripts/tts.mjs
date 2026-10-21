// Fallback when the ElevenLabs connector is not available: synthesize the main
// script (script.txt minus the CTA line) straight from the API.
//   ELEVENLABS_API_KEY=... node scripts/tts.mjs [voice_id]
// Writes assets/vo_takes/main.mp3; continue with scripts/prepare-voice.sh.
import fs from "node:fs";

const root = new URL("..", import.meta.url);
const key = process.env.ELEVENLABS_API_KEY;
if (!key) throw new Error("ELEVENLABS_API_KEY is not set");
// Christian Plasa – Dynamic and Vibrant (house voice of the series)
const voice = process.argv[2] || "nsFsExJHz4xV1sOX6Kdn";

const lines = fs.readFileSync(new URL("script.txt", root), "utf8").trim().split("\n");
const main = lines
  .filter((l) => !l.startsWith("Folg mir"))
  .join(" ")
  .replace(/\s+/g, " ");

const res = await fetch(
  `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
  {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({ text: main, model_id: "eleven_multilingual_v2" }),
  },
);
if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${await res.text()}`);
fs.mkdirSync(new URL("assets/vo_takes/", root), { recursive: true });
fs.writeFileSync(new URL("assets/vo_takes/main.mp3", root), Buffer.from(await res.arrayBuffer()));
console.log("wrote assets/vo_takes/main.mp3");
