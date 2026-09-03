/**
 * The hero navigation map — design §5.1. Edges mean "built by" and nothing
 * more. Each project carries one true fragment of its own system, which is what
 * the ambient packets are labelled with.
 */
import type { Scene } from "../screens/engine/types";

export interface HeroNodeMeta {
  id: string;
  slug: string;
  /** A real identifier from that project's README. */
  fragment: string;
}

export const heroNodes: HeroNodeMeta[] = [
  { id: "rag-document-qa", slug: "rag-document-qa", fragment: "event: token" },
  { id: "order-saga", slug: "order-saga", fragment: "order.created" },
  { id: "tech-news-agent", slug: "tech-news-agent", fragment: "ScoutAgent" },
  { id: "emergency-alert-system", slug: "emergency-alert-system", fragment: "MESSAGE" },
  { id: "con-detection", slug: "con-detection", fragment: "frame 0412" },
];

export const heroScene: Scene = {
  viewBox: [560, 400],
  nodes: [
    { id: "rag-document-qa", label: "rag-document-qa", x: 196, y: 26, w: 168, h: 36 },
    { id: "order-saga", label: "order-saga", x: 12, y: 126, w: 140, h: 36 },
    { id: "tech-news-agent", label: "tech-news-agent", x: 392, y: 126, w: 156, h: 36 },
    { id: "portfolio", label: "portfolio", x: 224, y: 182, w: 112, h: 36 },
    {
      id: "emergency-alert-system",
      label: "emergency-alert-system",
      x: 6,
      y: 320,
      w: 214,
      h: 36,
    },
    { id: "con-detection", label: "con-detection", x: 386, y: 320, w: 162, h: 36 },
  ],
  edges: [
    { id: "e-rag", from: "rag-document-qa", to: "portfolio" },
    { id: "e-saga", from: "order-saga", to: "portfolio" },
    { id: "e-agent", from: "tech-news-agent", to: "portfolio" },
    { id: "e-stomp", from: "emergency-alert-system", to: "portfolio" },
    { id: "e-detect", from: "con-detection", to: "portfolio" },
  ],
  narrow: {
    viewBox: [360, 420],
    nodes: [
      { id: "rag-document-qa", label: "rag-document-qa", x: 96, y: 16, w: 168, h: 34 },
      { id: "order-saga", label: "order-saga", x: 8, y: 110, w: 140, h: 34 },
      { id: "tech-news-agent", label: "tech-news-agent", x: 200, y: 110, w: 152, h: 34 },
      { id: "portfolio", label: "portfolio", x: 124, y: 190, w: 112, h: 34 },
      {
        id: "emergency-alert-system",
        label: "emergency-alert-system",
        x: 8,
        y: 300,
        w: 214,
        h: 34,
      },
      { id: "con-detection", label: "con-detection", x: 190, y: 360, w: 162, h: 34 },
    ],
  },
};

/** The README state of the same map, drawn in box-drawing characters (R2.1). */
export const heroAscii = `                  rag-document-qa
                        │
   order-saga ──────────┼────────── tech-news-agent
                        │
                   ┌────┴────┐
                   │portfolio│
                   └────┬────┘
                        │
 emergency-alert-system ┴──────────── con-detection`;
