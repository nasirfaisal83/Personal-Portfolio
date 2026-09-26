/**
 * The hero navigation map — design §5.1. Edges mean "built by" and nothing
 * more. Each project carries one true fragment of its own system, which is what
 * the ambient packets are labelled with.
 */
import type { Scene, SceneNode } from "../screens/engine/types";
import { visibleProjects } from "@/content/projects";

/** The centre node every project links to. */
const HUB = "portfolio";

export interface HeroNodeMeta {
  id: string;
  slug: string;
  /** A real identifier from that project's README. */
  fragment: string;
}

export const heroNodes: HeroNodeMeta[] = [
  { id: "salon", slug: "salon", fragment: "REQUESTED" },
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
    // Bottom centre, straight below the hub, between the other two on that row.
    { id: "salon", label: "salon", x: 238, y: 320, w: 84, h: 36 },
  ],
  edges: [
    { id: "e-rag", from: "rag-document-qa", to: "portfolio" },
    { id: "e-saga", from: "order-saga", to: "portfolio" },
    { id: "e-agent", from: "tech-news-agent", to: "portfolio" },
    { id: "e-stomp", from: "emergency-alert-system", to: "portfolio" },
    { id: "e-detect", from: "con-detection", to: "portfolio" },
    { id: "e-salon", from: "salon", to: "portfolio" },
  ],
  narrow: {
    viewBox: [360, 420],
    nodes: [
      { id: "rag-document-qa", label: "rag-document-qa", x: 96, y: 16, w: 168, h: 34 },
      { id: "order-saga", label: "order-saga", x: 8, y: 110, w: 140, h: 34 },
      { id: "tech-news-agent", label: "tech-news-agent", x: 200, y: 110, w: 152, h: 34 },
      { id: "portfolio", label: "portfolio", x: 124, y: 190, w: 112, h: 34 },
      { id: "salon", label: "salon", x: 8, y: 280, w: 110, h: 34 },
      { id: "con-detection", label: "con-detection", x: 190, y: 280, w: 162, h: 34 },
      {
        id: "emergency-alert-system",
        label: "emergency-alert-system",
        x: 73,
        y: 360,
        w: 214,
        h: 34,
      },
    ],
  },
};

/** The map with hidden projects, and their edges to the hub, taken out of both layouts. */
export function heroSceneFor(visible: ReadonlySet<string>): Scene {
  const keep = (node: SceneNode) => node.id === HUB || visible.has(node.id);
  return {
    ...heroScene,
    nodes: heroScene.nodes.filter(keep),
    edges: heroScene.edges.filter((edge) => visible.has(edge.from)),
    narrow: heroScene.narrow && {
      ...heroScene.narrow,
      nodes: heroScene.narrow.nodes.filter(keep),
    },
  };
}

/** Box-drawing glyphs keyed by the arms they join: up, down, left, right. */
const JUNCTIONS: Record<string, string> = {
  "1111": "┼",
  "1110": "┤",
  "1101": "├",
  "0111": "┬",
  "1011": "┴",
  "1100": "│",
  "0110": "┐",
  "0101": "┌",
  "1010": "┘",
  "1001": "└",
};

function junction(up: boolean, down: boolean, left: boolean, right: boolean): string {
  return JUNCTIONS[[up, down, left, right].map(Number).join("")] ?? "│";
}

const pad = (n: number) => " ".repeat(n);

/**
 * The README state of the same map, drawn in box-drawing characters (R2.1).
 * A hidden project takes its label and its line with it, and each junction is
 * redrawn for the arms that remain. With all five on the site this is the
 * original drawing, character for character.
 */
export function heroAsciiFor(visible: ReadonlySet<string>): string {
  const rag = visible.has("rag-document-qa");
  const saga = visible.has("order-saga");
  const agent = visible.has("tech-news-agent");
  const stomp = visible.has("emergency-alert-system");
  const detect = visible.has("con-detection");
  const salon = visible.has("salon");
  const above = rag || saga || agent;
  const below = stomp || detect || salon;

  const upper = `${saga ? "   order-saga ──────────" : pad(24)}${junction(rag, true, saga, agent)}${
    agent ? "────────── tech-news-agent" : ""
  }`;
  const lower = `${stomp ? " emergency-alert-system " : pad(24)}${junction(true, salon, stomp, detect)}${
    detect ? "──────────── con-detection" : ""
  }`;

  return [
    rag ? `${pad(18)}rag-document-qa` : "",
    rag ? `${pad(24)}│` : "",
    above ? upper : "",
    above ? `${pad(24)}│` : "",
    `${pad(19)}┌────${above ? "┴" : "─"}────┐`,
    `${pad(19)}│portfolio│`,
    `${pad(19)}└────${below ? "┬" : "─"}────┘`,
    below ? `${pad(24)}│` : "",
    below ? lower : "",
    salon ? `${pad(24)}│` : "",
    salon ? `${pad(22)}salon` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

/** What the hero draws: the map, its packet fragments, and its README art. */
export interface HeroMap {
  scene: Scene;
  nodes: HeroNodeMeta[];
  ascii: string;
}

const onSite = new Set(visibleProjects.map((project) => project.slug));

/**
 * The hero for the projects on the site. Built on the server and handed to the
 * hero as props, so this module — and the project list it reads — stays out of
 * the browser bundle.
 */
export const visibleHeroMap: HeroMap = {
  scene: heroSceneFor(onSite),
  nodes: heroNodes.filter((node) => onSite.has(node.slug)),
  ascii: heroAsciiFor(onSite),
};
