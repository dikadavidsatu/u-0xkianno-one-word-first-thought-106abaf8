// One Word, First Thought — make.fun entry
// https://make.fun/bounty/u-0xkianno-one-word-first-thought-106abaf8
//
// The whole entry is a single word: the first word that comes to mind,
// with no topic, no explanation and no second draft. The program writes
// exactly that word to entry.txt and nothing else. A judge then compares
// words two at a time on which is more interesting, so the word has to
// earn its place: surprising, vivid, specific, with a spark of wit.
//
// The word chosen here is "vellichor": the strange wistfulness of used
// bookshops — shelves of second-hand books, each one passed through
// hands and lives you will never know, their pages smelling faintly of
// dust and time. It is a word most readers have never met, it calls up
// one clear room in a handful of letters, and its soft, rolling sound
// rewards a second look. It is not a safe word, and it is not filler.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The entry itself
// ---------------------------------------------------------------------------

/** The single word this entry sends to the judge. */
const WORD = "vellichor";

// Gate limits from the competition rules (RULES.txt, "The gate"):
// entry.txt must be UTF-8 text of 1 to 24 characters, not only white space.
const MIN_CHARS = 1;
const MAX_CHARS = 24;

// Words the judge is briefed to penalise as generic filler. The chosen
// word must never be one of these; the check below guards against a
// careless edit swapping in a filler word later.
const FILLER_WORDS = new Set([
  "thing",
  "stuff",
  "something",
  "whatever",
  "word",
  "nice",
  "good",
  "cool",
]);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Count characters the way the gate does: Unicode code points, not UTF-16
 * code units, so a word with astral characters is measured honestly.
 */
function countChars(text: string): number {
  return [...text].length;
}

/**
 * True when the text is exactly one word: no spaces, tabs or line breaks
 * anywhere in it, and not empty.
 */
function isSingleWord(text: string): boolean {
  return text.length > 0 && !/\s/.test(text);
}

/**
 * True when the text is plain letters only (the judge reads words, not
 * punctuation or digits), so "vellichor" passes and "vellichor!" does not.
 */
function isLettersOnly(text: string): boolean {
  return /^[A-Za-z]+$/.test(text);
}

/**
 * The sealed gate, re-checked locally before anything is written:
 * 1 to 24 characters, not only white space. A word that fails this
 * scores Valid 0 and never reaches the judge, so fail loudly here
 * instead of shipping a silent zero.
 */
function checkGate(word: string): void {
  if (typeof word !== "string") {
    throw new Error("entry must be a string");
  }
  const chars = countChars(word);
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new Error(
      `entry must be ${MIN_CHARS} to ${MAX_CHARS} characters, got ${chars}`,
    );
  }
  if (word.trim().length === 0) {
    throw new Error("entry must not be only white space");
  }
}

/**
 * The judge's own first criteria, checked the same way: exactly one word,
 * chosen rather than generic. Surprise and vividness live in the word
 * itself, so this only guards the shape a careless edit could break.
 */
function checkJudgeFit(word: string): void {
  if (!isSingleWord(word)) {
    throw new Error("entry must be exactly one word with no spaces");
  }
  if (!isLettersOnly(word)) {
    throw new Error("entry must be a single alphabetic word");
  }
  if (FILLER_WORDS.has(word.toLowerCase())) {
    throw new Error("entry must be a chosen word, not generic filler");
  }
}

/**
 * Prove the word is clean UTF-8 before it is written: encode it once and
 * confirm the round trip is exact, so no stray byte can slip into
 * entry.txt and fail the sealed scorer's UTF-8 check.
 */
function checkUtf8RoundTrip(word: string): void {
  const encoded = new TextEncoder().encode(word);
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(encoded);
  if (decoded !== word) {
    throw new Error("entry must be clean UTF-8 text");
  }
}

/** Run every check, gate first, then judge fit, then encoding. */
function validate(word: string): void {
  checkGate(word);
  checkJudgeFit(word);
  checkUtf8RoundTrip(word);
}

/**
 * Resolve the output directory the way the harness does: the
 * MAKEFUN_OUTPUT_DIR environment variable when set, /output otherwise.
 */
function resolveOutputDir(): string {
  return process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  validate(WORD);
  const outDir = resolveOutputDir();
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), WORD, "utf8");
  console.log(
    `wrote ${countChars(WORD)}-character entry "${WORD}" to ${join(outDir, "entry.txt")}`,
  );
}

main();
