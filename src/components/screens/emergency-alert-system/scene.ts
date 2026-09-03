/**
 * Emergency-Alert-System scene — design §7.4.
 * Frames, both threading models, the "germany" channel and the "Fire in Berlin"
 * event are the README's. The two server internals are `morph` layouts.
 */
import type { Scene } from "../engine/types";

export const CHANNEL = "germany";
export const EVENT = "Fire in Berlin";
export const MODES = ["tpc", "reactor"] as const;
export type Mode = (typeof MODES)[number];

/** Frames the screen never animates but must still list (R4.24). */
export const OTHER_FRAMES = ["UNSUBSCRIBE", "DISCONNECT", "ERROR"] as const;

export const scene: Scene = {
  viewBox: [720, 400],
  nodes: [
    { id: "server", label: "StompServer", x: 250, y: 120, w: 220, h: 160, kind: "service" },
    { id: "clientA", label: "client A", x: 40, y: 40, w: 128, h: 38, kind: "client" },
    { id: "clientB", label: "client B", x: 40, y: 176, w: 128, h: 38, kind: "client" },
    { id: "clientC", label: "client C", sub: "C++", x: 40, y: 312, w: 128, h: 38, kind: "client" },
  ],
  edges: [
    { id: "a-server", from: "clientA", to: "server" },
    { id: "server-a", from: "server", to: "clientA" },
    { id: "b-server", from: "clientB", to: "server" },
    { id: "server-b", from: "server", to: "clientB" },
    { id: "c-server", from: "clientC", to: "server" },
    { id: "server-c", from: "server", to: "clientC" },
  ],
  narrow: {
    viewBox: [360, 560],
    nodes: [
      { id: "server", label: "StompServer", x: 60, y: 24, w: 240, h: 150, kind: "service" },
      { id: "clientA", label: "client A", x: 12, y: 260, w: 150, h: 36, kind: "client" },
      { id: "clientB", label: "client B", x: 196, y: 260, w: 150, h: 36, kind: "client" },
      {
        id: "clientC",
        label: "client C",
        sub: "C++",
        x: 104,
        y: 400,
        w: 150,
        h: 36,
        kind: "client",
      },
    ],
  },
};
