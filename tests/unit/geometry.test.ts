import { describe, expect, it } from "vitest";
import {
  boundaryPoint,
  edgePoints,
  nodeRect,
  pathD,
  pointAt,
  polylineLength,
} from "@/components/screens/engine/geometry";
import type { Scene } from "@/components/screens/engine/types";

const scene: Scene = {
  viewBox: [400, 300],
  nodes: [
    { id: "a", label: "A", x: 0, y: 0, w: 100, h: 40 },
    { id: "b", label: "B", x: 300, y: 0, w: 100, h: 40 },
    {
      id: "bus",
      label: "bus",
      x: 0,
      y: 140,
      w: 400,
      h: 20,
      kind: "bus",
      orientation: "horizontal",
    },
    { id: "c", label: "C", x: 0, y: 240, w: 100, h: 40, layouts: { alt: { x: 200, y: 240 } } },
  ],
  edges: [
    { id: "a-b", from: "a", to: "b" },
    { id: "a-c", from: "a", to: "c", via: "bus" },
  ],
};

describe("nodeRect", () => {
  it("uses the layout override when one is active", () => {
    const node = scene.nodes[3];
    expect(nodeRect(node, null).x).toBe(0);
    expect(nodeRect(node, "alt").x).toBe(200);
  });
});

describe("boundaryPoint", () => {
  it("leaves the rect on the side facing the target", () => {
    const rect = nodeRect(scene.nodes[0], null);
    expect(boundaryPoint(rect, { x: 1000, y: 20 })).toEqual({ x: 100, y: 20 });
  });
});

describe("edgePoints", () => {
  it("joins two nodes directly", () => {
    const points = edgePoints(scene, scene.edges[0], null);
    expect(points).toHaveLength(2);
    expect(points[0].x).toBe(100);
    expect(points[1].x).toBe(300);
  });

  it("routes through the bus when `via` is set", () => {
    const points = edgePoints(scene, scene.edges[1], null);
    // start, bus entry, bus exit, end — the entry and exit share the bus centre-line.
    expect(points.length).toBeGreaterThanOrEqual(3);
    const busY = nodeRect(scene.nodes[2], null).cy;
    expect(points[1].y).toBe(busY);
  });

  it("returns nothing when a node is missing", () => {
    expect(edgePoints(scene, { id: "x", from: "nope", to: "a" }, null)).toEqual([]);
  });
});

describe("polyline maths", () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 10, y: 10 },
  ];

  it("measures total length", () => {
    expect(polylineLength(points)).toBe(20);
  });

  it("finds the point at a fraction of the length", () => {
    expect(pointAt(points, 0)).toEqual({ x: 0, y: 0 });
    expect(pointAt(points, 0.5)).toEqual({ x: 10, y: 0 });
    expect(pointAt(points, 1)).toEqual({ x: 10, y: 10 });
  });

  it("writes an SVG path", () => {
    expect(pathD(points)).toBe("M0.00 0.00 L10.00 0.00 L10.00 10.00");
  });
});
