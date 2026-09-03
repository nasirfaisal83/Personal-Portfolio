/** rag-document-qa scenarios — design §7.2. Values are the README's defaults. */
import type { Scenario, Step } from "../engine/types";
import { CHUNK_COUNT, TOP_K } from "./scene";

/** Eight chunks fly into the vector panel, staggered 90ms apart. */
function embedDots(from: number): Step[] {
  return Array.from({ length: CHUNK_COUNT }, (_, i) => ({
    t: from + i * 90,
    kind: "packet" as const,
    edge: "embed-vectors",
    duration: 700,
  }));
}

const ANSWER_WORDS = [
  "Payment",
  "is",
  "due",
  "within",
  "30",
  "days",
  "of",
  "the",
  "invoice",
  "date.",
];

export const scenarios: Scenario[] = [
  {
    id: "ingest",
    label: "Ingest a document",
    steps: [
      { t: 0, kind: "packet", edge: "upload-doc", label: "202 Accepted", duration: 700 },
      { t: 700, kind: "status", node: "document", value: "PROCESSING" },
      { t: 700, kind: "say", text: "Upload accepted, 202, processing in the background" },
      { t: 900, kind: "packet", edge: "doc-pdfbox", duration: 700 },
      { t: 1600, kind: "pulse", node: "pdfbox" },
      { t: 1600, kind: "set", target: "extract.strategy", value: "PDFBox" },
      { t: 1800, kind: "packet", edge: "pdfbox-chunk", duration: 800 },
      { t: 2600, kind: "pulse", node: "chunk" },
      { t: 2600, kind: "set", target: "chunk.blocks", value: CHUNK_COUNT },
      { t: 2800, kind: "packet", edge: "chunk-embed", duration: 700 },
      { t: 3500, kind: "pulse", node: "embed" },
      ...embedDots(3600),
      { t: 5000, kind: "set", target: "vectors.dots", value: CHUNK_COUNT },
      { t: 5000, kind: "packet", edge: "vectors-store", duration: 700 },
      { t: 5700, kind: "pulse", node: "store" },
      { t: 5700, kind: "status", node: "document", value: "READY", tone: "signal" },
      { t: 5700, kind: "set", target: "document.chunks", value: CHUNK_COUNT },
      { t: 5700, kind: "say", text: "Chunks embedded and stored, document READY" },
    ],
    narration: [
      "The upload returns 202 Accepted with a document ID and the work continues in the background.",
      "The document status is PROCESSING while extraction runs.",
      "PDFBox pulls the digital text out of the page.",
      "The text is split into 500-token chunks with 50 tokens of overlap.",
      "Each chunk is embedded with text-embedding-3-small and placed in the vector space.",
      "The vectors are stored in PostgreSQL with pgvector behind an IVFFlat index; the document is READY.",
    ],
  },
  {
    id: "scanned",
    label: "Ingest a scanned page",
    steps: [
      { t: 0, kind: "packet", edge: "upload-doc", label: "202 Accepted", duration: 700 },
      { t: 700, kind: "status", node: "document", value: "PROCESSING" },
      { t: 700, kind: "say", text: "Upload accepted, 202, processing in the background" },
      { t: 900, kind: "packet", edge: "doc-pdfbox", duration: 700 },
      { t: 1600, kind: "pulse", node: "pdfbox" },
      { t: 1600, kind: "set", target: "extract.strategy", value: "PDFBox" },
      { t: 1600, kind: "set", target: "extract.note", value: "< min text" },
      { t: 2000, kind: "packet", edge: "pdfbox-tesseract", duration: 600 },
      { t: 2600, kind: "pulse", node: "tesseract" },
      { t: 2600, kind: "set", target: "extract.strategy", value: "Tesseract" },
      {
        t: 2600,
        kind: "say",
        text: "Digital text too short; OCR fallback produced the page text",
      },
      { t: 2900, kind: "packet", edge: "tesseract-chunk", duration: 800 },
      { t: 3700, kind: "pulse", node: "chunk" },
      { t: 3700, kind: "set", target: "chunk.blocks", value: CHUNK_COUNT },
      { t: 3900, kind: "packet", edge: "chunk-embed", duration: 700 },
      ...embedDots(4600),
      { t: 6000, kind: "set", target: "vectors.dots", value: CHUNK_COUNT },
      { t: 6000, kind: "packet", edge: "vectors-store", duration: 700 },
      { t: 6700, kind: "status", node: "document", value: "READY", tone: "signal" },
      { t: 6700, kind: "set", target: "document.chunks", value: CHUNK_COUNT },
      { t: 6700, kind: "say", text: "Chunks embedded and stored, document READY" },
    ],
    narration: [
      "The upload returns 202 Accepted and the document status is PROCESSING.",
      "PDFBox runs first and finds too little digital text on the page.",
      "The waterfall falls through to Tesseract OCR, which produces the page text.",
      "GPT-4o Vision stays in reserve as the last resort, so no page is silently skipped.",
      "The OCR text is chunked, embedded, and stored; the document is READY.",
    ],
  },
  {
    id: "ask",
    label: "Ask a question",
    steps: [
      { t: 0, kind: "set", target: "question.text", value: "What are the payment terms?" },
      { t: 0, kind: "set", target: "vectors.dots", value: CHUNK_COUNT },
      { t: 200, kind: "packet", edge: "question-qembed", duration: 700 },
      { t: 900, kind: "pulse", node: "qembed" },
      { t: 1100, kind: "packet", edge: "qembed-vectors", duration: 800 },
      { t: 1900, kind: "set", target: "vectors.query", value: true },
      { t: 2100, kind: "set", target: "vectors.topk", value: TOP_K },
      { t: 2100, kind: "say", text: "Question embedded; five nearest chunks retrieved" },
      { t: 2400, kind: "packet", edge: "vectors-prompt", duration: 800 },
      { t: 3200, kind: "pulse", node: "prompt" },
      { t: 3400, kind: "packet", edge: "prompt-answer", duration: 600 },
      ...ANSWER_WORDS.map((_word, i) => ({
        t: 4000 + i * 240,
        kind: "set" as const,
        target: "answer.words",
        value: i + 1,
      })),
      { t: 6500, kind: "set", target: "answer.sources", value: true },
      { t: 6500, kind: "pulse", node: "answer" },
      {
        t: 6500,
        kind: "say",
        text: "Answer streamed with two cited sources and a confidence of 0.87",
      },
    ],
    narration: [
      "The question “What are the payment terms?” is embedded the same way the chunks were.",
      "Cosine similarity in pgvector returns the five nearest chunks (top-k 5).",
      "Those chunks are placed in the prompt.",
      "The answer streams back token by token over Server-Sent Events.",
      "Two sources are cited — Chunk 12, page 4 and Chunk 7, page 2 — with a confidence of 0.87 (example from the README).",
    ],
  },
];

export { ANSWER_WORDS };
