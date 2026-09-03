"use client";

import { Fragment, useId } from "react";
import { edgePoints, nodeRect, pathD, pointAt, isVisible, type Point } from "./geometry";
import { packetProgress, type ActivePacket, type ChipState, type ScreenState } from "./schedule";
import {
  PULSE_MS,
  type ChipTone,
  type Scene,
  type SceneEdge,
  type SceneNode,
  type Tone,
} from "./types";

const TONE_COLOR: Record<Tone, string> = {
  signal: "var(--signal)",
  fault: "var(--fault)",
};

const CHIP_COLOR: Record<ChipTone, string> = {
  idle: "var(--screen-muted)",
  signal: "var(--signal)",
  fault: "var(--fault)",
};

/* ------------------------------------------------------------------ grid */

/** design §2.3 — an 8px grid at 6% opacity is the diagram canvas. */
export function SceneGrid({ width, height }: { width: number; height: number }) {
  // Several screens share one document, so the pattern id has to be unique.
  const id = `screen-grid-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <>
      <defs>
        <pattern id={id} width={8} height={8} patternUnits="userSpaceOnUse">
          <path d="M8 0H0V8" fill="none" stroke="var(--screen-grid)" strokeWidth={1} />
        </pattern>
      </defs>
      <rect x={0} y={0} width={width} height={height} fill={`url(#${id})`} />
    </>
  );
}

/* ------------------------------------------------------------------ edge */

export function Edge({
  points,
  dashed,
  tone,
}: {
  points: Point[];
  dashed?: boolean;
  tone?: Tone | null;
}) {
  if (points.length < 2) return null;
  return (
    <path
      d={pathD(points)}
      fill="none"
      stroke={tone ? TONE_COLOR[tone] : "var(--screen-muted)"}
      strokeWidth={tone ? 2 : 1.5}
      strokeDasharray={dashed ? "4 4" : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={tone ? 1 : 0.6}
    />
  );
}

/* ------------------------------------------------------------------- bus */

/** A 6px band standing in for the Kafka topic bus (design §6.3). */
export function Bus({ node, layout }: { node: SceneNode; layout: string | null }) {
  const rect = nodeRect(node, layout);
  const horizontal =
    (node.orientation ?? (rect.w >= rect.h ? "horizontal" : "vertical")) === "horizontal";
  return (
    <g>
      <rect
        x={horizontal ? rect.x : rect.cx - 3}
        y={horizontal ? rect.cy - 3 : rect.y}
        width={horizontal ? rect.w : 6}
        height={horizontal ? 6 : rect.h}
        rx={3}
        fill="var(--screen-muted)"
        opacity={0.35}
      />
      <text
        x={horizontal ? rect.x : rect.cx + 10}
        y={horizontal ? rect.cy - 10 : rect.y - 6}
        fill="var(--screen-muted)"
        fontFamily="var(--font-mono)"
        fontSize={12}
        textAnchor="start"
      >
        {node.label}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ chip */

/** R12.4 — every chip carries its text; colour never carries state alone. */
export function StatusChip({ x, y, chip }: { x: number; y: number; chip: ChipState }) {
  const width = Math.max(52, chip.value.length * 7 + 14);
  return (
    <g style={{ transition: `opacity var(--t-status) ease-out` }}>
      <rect
        x={x}
        y={y}
        width={width}
        height={18}
        rx={3}
        fill="none"
        stroke={CHIP_COLOR[chip.tone]}
        strokeWidth={1}
      />
      <text
        x={x + width / 2}
        y={y + 13}
        fill={CHIP_COLOR[chip.tone]}
        fontFamily="var(--font-mono)"
        fontSize={11}
        textAnchor="middle"
      >
        {chip.value}
      </text>
    </g>
  );
}

/* ------------------------------------------------------------------ node */

export interface NodeProps {
  node: SceneNode;
  layout: string | null;
  chip?: ChipState;
  pulse?: { tone: Tone; at: number };
  elapsed: number;
  /** Hero map nodes are buttons (R2.5); everything else is inert artwork. */
  onActivate?: (id: string) => void;
  ariaLabel?: string;
}

export function Node({ node, layout, chip, pulse, elapsed, onActivate, ariaLabel }: NodeProps) {
  const rect = nodeRect(node, layout);
  const pulsing = pulse !== undefined && elapsed - pulse.at < PULSE_MS;
  const stroke = pulsing ? TONE_COLOR[pulse.tone] : "var(--screen-muted)";
  const interactive = typeof onActivate === "function";

  const body = (
    <>
      <rect
        x={rect.x}
        y={rect.y}
        width={rect.w}
        height={rect.h}
        rx={4}
        fill="var(--screen)"
        stroke={stroke}
        strokeWidth={pulsing ? 2 : 1}
        style={{ transition: "stroke 300ms ease-out, stroke-width 300ms ease-out" }}
      />
      <text
        x={rect.cx}
        y={node.sub ? rect.cy : rect.cy + 4}
        fill="var(--screen-ink)"
        fontFamily="var(--font-sans)"
        fontSize={13}
        textAnchor="middle"
      >
        {node.label}
      </text>
      {node.sub ? (
        <text
          x={rect.cx}
          y={rect.cy + 15}
          fill="var(--screen-muted)"
          fontFamily="var(--font-mono)"
          fontSize={11}
          textAnchor="middle"
        >
          {node.sub}
        </text>
      ) : null}
      {chip ? <StatusChip x={rect.cx - 30} y={rect.y + rect.h + 6} chip={chip} /> : null}
    </>
  );

  if (!interactive) return <g>{body}</g>;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={ariaLabel ?? node.label}
      style={{ cursor: "pointer" }}
      onClick={() => onActivate?.(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onActivate?.(node.id);
        }
      }}
    >
      {body}
    </g>
  );
}

/* ---------------------------------------------------------------- packet */

/** 8px marker with a two-ghost trail; trails are dropped on slow devices. */
export function Packet({
  packet,
  points,
  elapsed,
  trails = true,
}: {
  packet: ActivePacket;
  points: Point[];
  elapsed: number;
  trails?: boolean;
}) {
  if (points.length < 2) return null;
  const progress = packetProgress(packet, elapsed);
  const head = pointAt(points, progress);
  const color = TONE_COLOR[packet.tone];
  const ghosts = trails
    ? [
        { p: pointAt(points, Math.max(0, progress - 0.05)), o: 0.4 },
        { p: pointAt(points, Math.max(0, progress - 0.1)), o: 0.15 },
      ]
    : [];

  return (
    <g aria-hidden="true">
      {ghosts.map((ghost, i) => (
        <circle key={i} cx={ghost.p.x} cy={ghost.p.y} r={4} fill={color} opacity={ghost.o} />
      ))}
      <circle cx={head.x} cy={head.y} r={4} fill={color} stroke="var(--screen)" strokeWidth={2} />
      {packet.label ? (
        <text
          x={head.x}
          y={head.y - 10}
          fill={color}
          fontFamily="var(--font-mono)"
          fontSize={12}
          textAnchor="middle"
        >
          {packet.label}
        </text>
      ) : null}
    </g>
  );
}

/* ----------------------------------------------------------------- gauge */

export function Gauge({
  x,
  y,
  w = 140,
  value,
  threshold,
  label,
}: {
  x: number;
  y: number;
  w?: number;
  value: number;
  threshold: number;
  label?: string;
}) {
  const clamped = Math.min(Math.max(value, 0), 1);
  const below = clamped < threshold;
  const color = below ? "var(--fault)" : "var(--signal)";
  return (
    <g>
      <rect x={x} y={y} width={w} height={8} rx={4} fill="var(--screen-muted)" opacity={0.25} />
      <rect
        x={x}
        y={y}
        width={w * clamped}
        height={8}
        rx={4}
        fill={color}
        style={{ transition: "width 300ms ease-out, fill 300ms ease-out" }}
      />
      <line
        x1={x + w * threshold}
        y1={y - 4}
        x2={x + w * threshold}
        y2={y + 12}
        stroke="var(--screen-ink)"
        strokeWidth={1}
      />
      <text
        x={x + w * threshold}
        y={y + 26}
        fill="var(--screen-muted)"
        fontFamily="var(--font-mono)"
        fontSize={11}
        textAnchor="middle"
      >
        {threshold}
      </text>
      <text
        x={x + w + 10}
        y={y + 9}
        fill={color}
        fontFamily="var(--font-mono)"
        fontSize={12}
        textAnchor="start"
      >
        {clamped.toFixed(2)}
      </text>
      {label ? (
        <text
          x={x}
          y={y - 10}
          fill="var(--screen-muted)"
          fontFamily="var(--font-sans)"
          fontSize={12}
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}

/* -------------------------------------------------------------- terminal */

/** A three-line monospaced strip for streamed text (design §6.3). */
export function Terminal({
  x,
  y,
  w = 260,
  lines,
}: {
  x: number;
  y: number;
  w?: number;
  lines: string[];
}) {
  const shown = lines.slice(-3);
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={58}
        rx={4}
        fill="var(--screen)"
        stroke="var(--screen-muted)"
        strokeWidth={1}
      />
      {shown.map((line, i) => (
        <text
          key={i}
          x={x + 10}
          y={y + 18 + i * 16}
          fill="var(--screen-ink)"
          fontFamily="var(--font-mono)"
          fontSize={12}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/* -------------------------------------------------------- caption + text */

export function Caption({
  x,
  y,
  children,
  anchor = "start",
  tone,
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  tone?: Tone;
}) {
  return (
    <text
      x={x}
      y={y}
      fill={tone ? TONE_COLOR[tone] : "var(--screen-muted)"}
      fontFamily="var(--font-sans)"
      fontSize={12}
      textAnchor={anchor}
    >
      {children}
    </text>
  );
}

export function Identifier({
  x,
  y,
  children,
  anchor = "start",
  tone,
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  tone?: Tone | "muted";
}) {
  const fill =
    tone === "muted" || tone === undefined ? "var(--screen-muted)" : TONE_COLOR[tone as Tone];
  return (
    <text x={x} y={y} fill={fill} fontFamily="var(--font-mono)" fontSize={12} textAnchor={anchor}>
      {children}
    </text>
  );
}

/* ----------------------------------------------------------------- scene */

export interface SceneLayerProps {
  scene: Scene;
  state: ScreenState;
  trails?: boolean;
  onNodeActivate?: (id: string) => void;
  nodeAriaLabel?: (node: SceneNode) => string;
  /** Extra artwork drawn between the edges and the packets. */
  children?: React.ReactNode;
}

/** Renders the whole scene: grid, edges, buses, nodes, then packets on top. */
export function SceneLayer({
  scene,
  state,
  trails = true,
  onNodeActivate,
  nodeAriaLabel,
  children,
}: SceneLayerProps) {
  const [width, height] = scene.viewBox;
  const layout = state.layout;
  const activeEdgeTones = new Map<string, Tone>();
  for (const packet of state.packets) activeEdgeTones.set(packet.edge, packet.tone);

  const visibleNodes = scene.nodes.filter((n) => isVisible(n, layout));
  const buses = visibleNodes.filter((n) => n.kind === "bus");
  const plain = visibleNodes.filter((n) => n.kind !== "bus");

  const edgeGeometry = (edge: SceneEdge) => edgePoints(scene, edge, layout);

  return (
    <g>
      <SceneGrid width={width} height={height} />
      <g>
        {scene.edges.map((edge) => (
          <Edge
            key={edge.id}
            points={edgeGeometry(edge)}
            dashed={edge.dashed}
            tone={activeEdgeTones.get(edge.id) ?? null}
          />
        ))}
      </g>
      <g>
        {buses.map((node) => (
          <Bus key={node.id} node={node} layout={layout} />
        ))}
      </g>
      {children}
      <g>
        {plain.map((node) => (
          <Node
            key={node.id}
            node={node}
            layout={layout}
            chip={state.status[node.id]}
            pulse={state.pulses[node.id]}
            elapsed={state.elapsed}
            onActivate={onNodeActivate}
            ariaLabel={nodeAriaLabel?.(node)}
          />
        ))}
      </g>
      <g>
        {state.packets.map((packet) => {
          const edge = scene.edges.find((e) => e.id === packet.edge);
          if (!edge) return <Fragment key={packet.key} />;
          return (
            <Packet
              key={packet.key}
              packet={packet}
              points={edgeGeometry(edge)}
              elapsed={state.elapsed}
              trails={trails}
            />
          );
        })}
      </g>
    </g>
  );
}
