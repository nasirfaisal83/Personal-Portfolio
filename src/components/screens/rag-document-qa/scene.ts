/**
 * rag-document-qa scene — design §7.2.
 * Ingestion lane and query lane, both named in the README: the three-strategy
 * extraction waterfall (PDFBox, Tesseract, GPT-4o Vision), 500-token chunks
 * with 50 overlap, text-embedding-3-small at 1536 dimensions, pgvector with an
 * IVFFlat index, top-k 5, and the PROCESSING / READY / FAILED document status.
 */
import type { Scene } from "../engine/types";

export const CHUNK_COUNT = 8;
export const TOP_K = 5;

export const scene: Scene = {
  viewBox: [720, 420],
  nodes: [
    { id: "upload", label: "upload", x: 16, y: 40, w: 96, h: 36, kind: "client" },
    { id: "document", label: "Document", x: 140, y: 40, w: 110, h: 36, kind: "store" },
    { id: "pdfbox", label: "PDFBox", x: 282, y: 20, w: 118, h: 26, kind: "stage" },
    { id: "tesseract", label: "Tesseract", x: 282, y: 52, w: 118, h: 26, kind: "stage" },
    { id: "vision", label: "GPT-4o Vision", x: 282, y: 84, w: 118, h: 26, kind: "stage" },
    { id: "chunk", label: "chunk", sub: "500 / 50", x: 430, y: 40, w: 104, h: 36, kind: "stage" },
    { id: "embed", label: "embed", x: 564, y: 40, w: 104, h: 36, kind: "stage" },
    { id: "vectors", label: "vector space", x: 470, y: 150, w: 198, h: 96, kind: "store" },
    {
      id: "store",
      label: "PostgreSQL + pgvector",
      sub: "ivfflat",
      x: 236,
      y: 168,
      w: 190,
      h: 44,
      kind: "store",
    },
    { id: "question", label: "question", x: 16, y: 288, w: 110, h: 36, kind: "client" },
    { id: "qembed", label: "embed", x: 154, y: 288, w: 96, h: 36, kind: "stage" },
    { id: "prompt", label: "prompt", x: 278, y: 288, w: 104, h: 36, kind: "stage" },
    { id: "answer", label: "answer", x: 410, y: 288, w: 96, h: 36, kind: "agent" },
  ],
  edges: [
    { id: "upload-doc", from: "upload", to: "document" },
    { id: "doc-pdfbox", from: "document", to: "pdfbox" },
    { id: "pdfbox-tesseract", from: "pdfbox", to: "tesseract", dashed: true },
    { id: "tesseract-vision", from: "tesseract", to: "vision", dashed: true },
    { id: "pdfbox-chunk", from: "pdfbox", to: "chunk" },
    { id: "tesseract-chunk", from: "tesseract", to: "chunk" },
    { id: "chunk-embed", from: "chunk", to: "embed" },
    { id: "embed-vectors", from: "embed", to: "vectors" },
    { id: "vectors-store", from: "vectors", to: "store" },
    { id: "question-qembed", from: "question", to: "qembed" },
    { id: "qembed-vectors", from: "qembed", to: "vectors" },
    { id: "vectors-prompt", from: "vectors", to: "prompt" },
    { id: "prompt-answer", from: "prompt", to: "answer" },
  ],
  narrow: {
    viewBox: [360, 660],
    nodes: [
      { id: "upload", label: "upload", x: 12, y: 24, w: 96, h: 34, kind: "client" },
      { id: "document", label: "Document", x: 136, y: 24, w: 110, h: 34, kind: "store" },
      { id: "pdfbox", label: "PDFBox", x: 12, y: 84, w: 106, h: 24, kind: "stage" },
      { id: "tesseract", label: "Tesseract", x: 126, y: 84, w: 106, h: 24, kind: "stage" },
      { id: "vision", label: "GPT-4o Vision", x: 240, y: 84, w: 110, h: 24, kind: "stage" },
      { id: "chunk", label: "chunk", sub: "500 / 50", x: 12, y: 140, w: 150, h: 34, kind: "stage" },
      { id: "embed", label: "embed", x: 190, y: 140, w: 150, h: 34, kind: "stage" },
      { id: "vectors", label: "vector space", x: 96, y: 204, w: 176, h: 92, kind: "store" },
      {
        id: "store",
        label: "PostgreSQL + pgvector",
        sub: "ivfflat",
        x: 84,
        y: 324,
        w: 200,
        h: 40,
        kind: "store",
      },
      { id: "question", label: "question", x: 12, y: 412, w: 150, h: 34, kind: "client" },
      { id: "qembed", label: "embed", x: 190, y: 412, w: 150, h: 34, kind: "stage" },
      { id: "prompt", label: "prompt", x: 12, y: 470, w: 150, h: 34, kind: "stage" },
      { id: "answer", label: "answer", x: 190, y: 470, w: 150, h: 34, kind: "agent" },
    ],
  },
};
