/**
 * Edge routing and packet positioning — design §6.2, §6.3.
 *
 * Paths are polylines, so lengths and points along them are computed here in
 * plain arithmetic rather than through `SVGPathElement.getPointAtLength`. The
 * result is identical for straight segments, it works during the static export
 * and in jsdom, and it keeps packet motion free of per-frame layout reads.
 */
import {
  DEFAULT_NODE_H,
  DEFAULT_NODE_W,
  type Scene,
  type SceneEdge,
  type SceneNode,
} from "./types";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export function nodeRect(node: SceneNode, layout: string | null): Rect {
  const override = layout ? node.layouts?.[layout] : undefined;
  const x = override?.x ?? node.x;
  const y = override?.y ?? node.y;
  const w = override?.w ?? node.w ?? DEFAULT_NODE_W;
  const h = override?.h ?? node.h ?? DEFAULT_NODE_H;
  return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 };
}

export function isVisible(node: SceneNode, layout: string | null): boolean {
  if (node.hidden) return false;
  if (node.onlyInLayout) return node.onlyInLayout === layout;
  return true;
}

/** Where a straight line from `rect`'s centre toward `target` leaves the rect. */
export function boundaryPoint(rect: Rect, target: Point): Point {
  const dx = target.x - rect.cx;
  const dy = target.y - rect.cy;
  if (dx === 0 && dy === 0) return { x: rect.cx, y: rect.cy };
  const halfW = rect.w / 2;
  const halfH = rect.h / 2;
  const scale = Math.min(
    dx === 0 ? Infinity : halfW / Math.abs(dx),
    dy === 0 ? Infinity : halfH / Math.abs(dy),
  );
  return { x: rect.cx + dx * scale, y: rect.cy + dy * scale };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function busPort(bus: Rect, orientation: "horizontal" | "vertical", from: Point): Point {
  const inset = 10;
  return orientation === "vertical"
    ? { x: bus.cx, y: clamp(from.y, bus.y + inset, bus.y + bus.h - inset) }
    : { x: clamp(from.x, bus.x + inset, bus.x + bus.w - inset), y: bus.cy };
}

export function nodeMap(scene: Scene): Map<string, SceneNode> {
  return new Map(scene.nodes.map((n) => [n.id, n]));
}

/** The polyline an edge follows, in viewBox units. */
export function edgePoints(scene: Scene, edge: SceneEdge, layout: string | null): Point[] {
  const nodes = nodeMap(scene);
  const fromNode = nodes.get(edge.from);
  const toNode = nodes.get(edge.to);
  if (!fromNode || !toNode) return [];

  const from = nodeRect(fromNode, layout);
  const to = nodeRect(toNode, layout);

  if (edge.loop) {
    // Out of the right edge, around, and back in — used for the mock payment
    // gateway call in Order-Saga and the orchestrator's own reason/act ring.
    const out = { x: from.x + from.w, y: from.cy - from.h / 4 };
    const far = { x: from.x + from.w + 46, y: from.cy };
    const back = { x: from.x + from.w, y: from.cy + from.h / 4 };
    return [out, far, back];
  }

  if (edge.via) {
    const busNode = nodes.get(edge.via);
    if (busNode) {
      const bus = nodeRect(busNode, layout);
      const orientation = busNode.orientation ?? (bus.w >= bus.h ? "horizontal" : "vertical");
      const entry = busPort(bus, orientation, { x: from.cx, y: from.cy });
      const exit = busPort(bus, orientation, { x: to.cx, y: to.cy });
      const start = boundaryPoint(from, entry);
      const end = boundaryPoint(to, exit);
      const points = [start, entry];
      if (entry.x !== exit.x || entry.y !== exit.y) points.push(exit);
      points.push(end);
      return points;
    }
  }

  return [
    boundaryPoint(from, { x: to.cx, y: to.cy }),
    boundaryPoint(to, { x: from.cx, y: from.cy }),
  ];
}

export function pathD(points: Point[]): string {
  if (points.length === 0) return "";
  return points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
}

export function polylineLength(points: Point[]): number {
  let total = 0;
  for (let i = 1; i < points.length; i += 1) {
    total += Math.hypot(points[i].x - points[i - 1].x, points[i].y - points[i - 1].y);
  }
  return total;
}

/** The point at fraction `t` (0..1) of the polyline's length. */
export function pointAt(points: Point[], t: number): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  if (points.length === 1) return points[0];
  const target = polylineLength(points) * Math.min(Math.max(t, 0), 1);
  let travelled = 0;
  for (let i = 1; i < points.length; i += 1) {
    const a = points[i - 1];
    const b = points[i];
    const segment = Math.hypot(b.x - a.x, b.y - a.y);
    if (travelled + segment >= target || i === points.length - 1) {
      const local = segment === 0 ? 0 : (target - travelled) / segment;
      const k = Math.min(Math.max(local, 0), 1);
      return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k };
    }
    travelled += segment;
  }
  return points[points.length - 1];
}
