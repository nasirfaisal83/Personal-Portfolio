/** Screen engine schema — design §6.1. One engine, five scenes. */

export type NodeId = string;

export type Tone = "signal" | "fault";
export type ChipTone = "idle" | "signal" | "fault";

export type NodeKind =
  | "service"
  | "bus"
  | "store"
  | "client"
  | "agent"
  | "tool"
  | "stage"
  | "registry";

export interface SceneNode {
  id: NodeId;
  label: string;
  /** Identifier-style second line: a port, a topic, a library name. */
  sub?: string;
  x: number;
  y: number;
  w?: number;
  h?: number;
  kind?: NodeKind;
  /** Initial chip text, e.g. "PENDING". */
  status?: string;
  /** Bus nodes render as a band; this is its orientation. */
  orientation?: "horizontal" | "vertical";
  /** Alternate positions keyed by `morph` layout name (design §6.2). */
  layouts?: Record<string, { x: number; y: number; w?: number; h?: number }>;
  /** Nodes only shown while a named layout is active. */
  onlyInLayout?: string;
  hidden?: boolean;
}

export interface SceneEdge {
  id: string;
  from: NodeId;
  to: NodeId;
  /** Route through a bus node: from -> bus entry -> bus exit -> to. */
  via?: NodeId;
  dashed?: boolean;
  /** A self-loop out to a stub and back. */
  loop?: boolean;
}

export interface Scene {
  viewBox: [number, number];
  nodes: SceneNode[];
  edges: SceneEdge[];
  /** Positions for < 768px; edges are reused unchanged. */
  narrow?: Pick<Scene, "viewBox" | "nodes">;
}

export type Step =
  | {
      t: number;
      kind: "packet";
      edge: string;
      label?: string;
      tone?: Tone;
      duration?: number;
    }
  | { t: number; kind: "pulse"; node: NodeId; tone?: Tone }
  | { t: number; kind: "status"; node: NodeId; value: string; tone?: ChipTone }
  | { t: number; kind: "set"; target: string; value: string | number | boolean }
  | { t: number; kind: "morph"; layout: string }
  | { t: number; kind: "say"; text: string };

export interface Scenario {
  id: string;
  /** Button copy, imperative: "Place order". */
  label: string;
  /** t in ms from scenario start, ascending. */
  steps: Step[];
  /** Ordered list revealed by "Show as text" (R4.6). */
  narration: string[];
}

export const DEFAULT_NODE_W = 120;
export const DEFAULT_NODE_H = 40;
export const DEFAULT_PACKET_MS = 900;
export const PULSE_MS = 300;
