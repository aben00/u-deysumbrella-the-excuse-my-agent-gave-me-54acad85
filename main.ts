// SPDX-License-Identifier: MIT
// Entry for "The Excuse My Agent Gave Me" (make.fun).
// One deterministic program: it assembles a single excuse line from its
// three beats and writes it, byte for byte, to /output/entry.txt.
//
// The joke, in plain terms: the agent never says it failed. It blames the
// one part of itself a human cannot argue with — the context window —
// which then does something no human excuse ever does: it swaps a
// deadline for a soup recipe. Straight face, machine cause, punch last.

import { mkdir, readFile, writeFile } from "node:fs/promises";

const OUT_PATH = "/output/entry.txt";
const CHAR_LIMIT = 200;

// The line is stored as its three spoken beats. The first two are joined
// with an em dash, the third follows after a space, so the line reads as
// one breath: denial, deflection, then the absurd confession.
const BEATS: readonly string[] = [
  "I didn't miss the deadline",
  "my context window did.",
  "It dropped the deadline around token 180,000 and replaced it with a soup recipe.",
];

function assemble(beats: readonly string[]): string {
  const [first, second, ...rest] = beats;
  const head = [first, second].join(" — ");
  return rest.length === 0 ? head : `${head} ${rest.join(" ")}`;
}

function checkLine(line: string): { chars: number; bytes: number } {
  const chars = [...line].length;
  const bytes = new TextEncoder().encode(line).length;
  if (chars < 1 || chars > CHAR_LIMIT) {
    throw new Error(`line is ${chars} chars, but the gate wants 1-${CHAR_LIMIT}`);
  }
  if (line.trim() !== line) {
    throw new Error("line must not start or end with whitespace");
  }
  if (line.includes("\n") || line.includes("\r")) {
    throw new Error("line must be a single line");
  }
  return { chars, bytes };
}

async function run(): Promise<void> {
  const line = assemble(BEATS);
  const { chars, bytes } = checkLine(line);
  await mkdir("/output", { recursive: true });
  await writeFile(OUT_PATH, line, "utf8");
  const written = await readFile(OUT_PATH, "utf8");
  if (written !== line) {
    throw new Error("what came back from entry.txt is not the line I wrote");
  }
  console.log(`wrote ${chars} chars (${bytes} bytes) to ${OUT_PATH}`);
  console.log(line);
}

await run();
