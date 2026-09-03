"use client";

import { useEffect, useRef, useState } from "react";
import { Screen, ScreenBoundary, useResponsiveScene } from "../engine/Screen";
import { useInView, usePageVisible, useRafLoop, useReducedMotionPref } from "../engine/hooks";
import type { Scene } from "../engine/types";
import { CAPTION, CONES, FIRST_FRAME, FRAME_COUNT, FRAME_MS, PIPELINE } from "./scene";

const TITLE = "con-Detection";

/** The engine's Scene type is reused only so the narrow/wide switch is shared. */
const geometry: Scene = {
  viewBox: [720, 405],
  nodes: [],
  edges: [],
  narrow: { viewBox: [360, 300], nodes: [] },
};

const NARRATION = [
  "The notebook reads the video file with OpenCV and walks it frame by frame.",
  "Each frame is passed to the YOLOv5 model.",
  "The model returns the traffic cones it found in that frame.",
  "A bounding box is drawn around each detected cone and the loop moves to the next frame.",
];

function RoadScene({ frame, width, height }: { frame: number; width: number; height: number }) {
  const horizon = height * 0.32;
  const vanishX = width / 2;

  return (
    <g>
      {/* One-point perspective road: two converging verges and a centre line. */}
      <path
        d={`M${vanishX} ${horizon} L${width * 0.02} ${height} L${width * 0.26} ${height} Z`}
        fill="var(--screen-muted)"
        opacity={0.08}
      />
      <path
        d={`M${vanishX} ${horizon} L${width * 0.98} ${height} L${width * 0.74} ${height} Z`}
        fill="var(--screen-muted)"
        opacity={0.08}
      />
      <line
        x1={vanishX}
        y1={horizon}
        x2={width * 0.02}
        y2={height}
        stroke="var(--screen-muted)"
        strokeWidth={1.5}
      />
      <line
        x1={vanishX}
        y1={horizon}
        x2={width * 0.98}
        y2={height}
        stroke="var(--screen-muted)"
        strokeWidth={1.5}
      />
      <line
        x1={vanishX}
        y1={horizon}
        x2={vanishX}
        y2={height}
        stroke="var(--screen-muted)"
        strokeWidth={1}
        strokeDasharray="10 16"
        opacity={0.6}
      />
      <line
        x1={0}
        y1={horizon}
        x2={width}
        y2={horizon}
        stroke="var(--screen-muted)"
        strokeWidth={1}
        opacity={0.4}
      />

      {CONES.map((cone, i) => {
        const depth = Math.min(1, cone.depth + frame * cone.speed);
        const y = horizon + (height - horizon) * depth;
        const spread = 0.02 + 0.46 * depth;
        const x = vanishX + cone.lane * width * spread;
        const size = 8 + 46 * depth;
        const halfBase = size * 0.36;

        return (
          <g key={i}>
            <path
              d={`M${x} ${y - size} L${x + halfBase} ${y} L${x - halfBase} ${y} Z`}
              fill="var(--screen-muted)"
              opacity={0.5}
            />
            <rect
              x={x - halfBase - 1}
              y={y - size * 0.55}
              width={halfBase * 2 + 2}
              height={size * 0.2}
              fill="var(--screen)"
              opacity={0.6}
            />
            <BracketBox x={x - halfBase - 5} y={y - size - 5} w={halfBase * 2 + 10} h={size + 10} />
          </g>
        );
      })}
    </g>
  );
}

/** Bracket-corner bounding box labelled `cone`. No numeric confidence (R4.27). */
function BracketBox({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const arm = Math.min(10, w / 3, h / 3);
  const corner = (cx: number, cy: number, dx: number, dy: number) =>
    `M${cx + dx * arm} ${cy} L${cx} ${cy} L${cx} ${cy + dy * arm}`;
  return (
    <g>
      <path
        d={[
          corner(x, y, 1, 1),
          corner(x + w, y, -1, 1),
          corner(x, y + h, 1, -1),
          corner(x + w, y + h, -1, -1),
        ].join(" ")}
        fill="none"
        stroke="var(--signal)"
        strokeWidth={1.5}
      />
      <text x={x} y={y - 5} fill="var(--signal)" fontFamily="var(--font-mono)" fontSize={11}>
        cone
      </text>
    </g>
  );
}

function PipelineStrip({ active, width, y }: { active: number; width: number; y: number }) {
  const step = width / PIPELINE.length;
  return (
    <g>
      {PIPELINE.map((stage, i) => (
        <text
          key={stage}
          x={12 + i * step}
          y={y}
          fill={i === active ? "var(--signal)" : "var(--screen-muted)"}
          fontFamily="var(--font-mono)"
          fontSize={12}
          style={{ transition: "fill 200ms ease-out" }}
        >
          {stage}
        </text>
      ))}
    </g>
  );
}

function DetectionBody({ systemSummary }: { systemSummary: string }) {
  const scene = useResponsiveScene(geometry);
  const [width, height] = scene.viewBox;
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const pageVisible = usePageVisible();
  const reduced = useReducedMotionPref();

  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const started = useRef(false);
  const accumulator = useRef(0);

  // One cycle on first view, then a rest on the last frame (design §7.5).
  useEffect(() => {
    if (!inView || started.current || reduced) return;
    started.current = true;
    setFrame(0);
    setPlaying(true);
  }, [inView, reduced]);

  const frameRef = useRef(0);
  frameRef.current = frame;

  useRafLoop(playing && inView && pageVisible, (delta) => {
    accumulator.current += delta;
    let next = frameRef.current;
    while (accumulator.current >= FRAME_MS && next < FRAME_COUNT - 1) {
      accumulator.current -= FRAME_MS;
      next += 1;
    }
    if (next !== frameRef.current) {
      frameRef.current = next;
      setFrame(next);
    }
    // R3.6 — this screen is a loop by nature, so it runs one cycle and stops.
    if (next >= FRAME_COUNT - 1) setPlaying(false);
  });

  const frameNumber = String(FIRST_FRAME + frame).padStart(4, "0");
  const stage = frame % PIPELINE.length;

  return (
    <div ref={ref}>
      <Screen
        title={TITLE}
        systemSummary={systemSummary}
        note={CAPTION}
        narration={NARRATION}
        say={playing ? null : "Detection loop finished on the last frame"}
        controls={
          <button
            type="button"
            className="screen-btn"
            aria-pressed={playing}
            onClick={() => {
              if (playing) {
                setPlaying(false);
                return;
              }
              if (frame >= FRAME_COUNT - 1) setFrame(0);
              accumulator.current = 0;
              setPlaying(true);
            }}
          >
            {playing ? "Pause" : "Play"}
          </button>
        }
      >
        <svg
          className="screen__stage"
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          focusable="false"
          preserveAspectRatio="xMidYMid meet"
        >
          <rect x={0} y={0} width={width} height={height} fill="var(--screen)" />
          <RoadScene frame={frame} width={width} height={height - 46} />
          <text
            x={width - 12}
            y={22}
            fill="var(--screen-muted)"
            fontFamily="var(--font-mono)"
            fontSize={12}
            textAnchor="end"
          >
            {`frame ${frameNumber}`}
          </text>
          <PipelineStrip active={stage} width={width - 24} y={height - 14} />
        </svg>
      </Screen>
    </div>
  );
}

export default function DetectionScreen({ systemSummary }: { systemSummary: string }) {
  return (
    <ScreenBoundary
      fallback={
        <Screen
          title={TITLE}
          systemSummary={systemSummary}
          note={CAPTION}
          narration={NARRATION}
          say={null}
        >
          <svg className="screen__stage" viewBox="0 0 720 405" aria-hidden="true" focusable="false">
            <rect x={0} y={0} width={720} height={405} fill="var(--screen)" />
            <RoadScene frame={FRAME_COUNT - 1} width={720} height={359} />
            <PipelineStrip active={PIPELINE.length - 1} width={696} y={391} />
          </svg>
        </Screen>
      }
    >
      <DetectionBody systemSummary={systemSummary} />
    </ScreenBoundary>
  );
}
