"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Node, SceneGrid } from "../screens/engine/Primitives";
import { edgePoints, pathD, pointAt, polylineLength } from "../screens/engine/geometry";
import {
  useInView,
  usePageVisible,
  useRafLoop,
  useReducedMotionPref,
} from "../screens/engine/hooks";
import { useResponsiveScene } from "../screens/engine/Screen";
import { HeroAscii } from "./HeroAscii";
import { heroNodes, heroScene } from "./heroMap";

const SESSION_KEY = "hero-sequence-played";
const AMBIENT_INTERVAL_MS = 2500;
const AMBIENT_TRAVEL_MS = 1400;

type Phase = "hold" | "ascii" | "resolve" | "done";

/**
 * R2.1–R2.3 — one orchestrated sequence: hold to first paint, the README state,
 * then the running state. It never replays in the same session, and reduced
 * motion goes straight to the running state.
 */
function useHeroSequence(enabled: boolean): Phase {
  const [phase, setPhase] = useState<Phase>("done");

  useEffect(() => {
    if (!enabled) return;
    let alreadyPlayed = true;
    try {
      alreadyPlayed = window.sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      alreadyPlayed = false;
    }
    if (alreadyPlayed) return;

    setPhase("hold");
    const timers = [
      window.setTimeout(() => setPhase("ascii"), 200),
      window.setTimeout(() => setPhase("resolve"), 900),
      window.setTimeout(() => {
        setPhase("done");
        try {
          window.sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* private mode: the sequence simply plays again next load */
        }
      }, 1400),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [enabled]);

  return phase;
}

interface AmbientPacket {
  edge: string;
  label: string;
  start: number;
}

export function HeroScreen({ onSelectProject }: { onSelectProject: (slug: string) => void }) {
  const scene = useResponsiveScene(heroScene);
  const reduced = useReducedMotionPref();
  const { ref, inView } = useInView<HTMLDivElement>(0.3);
  const pageVisible = usePageVisible();

  const phase = useHeroSequence(!reduced);
  const resolving = phase === "resolve";
  const running = phase === "done";

  // R2.4 — one packet in flight at a time, at most one launch per 2.5s, paused
  // off-screen or behind a hidden tab, and off entirely under reduced motion.
  const [packet, setPacket] = useState<AmbientPacket | null>(null);
  const [now, setNow] = useState(0);
  const clock = useRef(0);
  const nextLaunch = useRef(AMBIENT_INTERVAL_MS);
  const cursor = useRef(0);

  const ambientActive = running && !reduced && inView && pageVisible;

  useRafLoop(ambientActive, (delta) => {
    clock.current += delta;
    setNow(clock.current);
    if (packet && clock.current - packet.start >= AMBIENT_TRAVEL_MS) setPacket(null);
    if (!packet && clock.current >= nextLaunch.current) {
      const meta = heroNodes[cursor.current % heroNodes.length];
      cursor.current += 1;
      const edge = scene.edges.find((e) => e.from === meta.id);
      if (edge) setPacket({ edge: edge.id, label: meta.fragment, start: clock.current });
      nextLaunch.current = clock.current + AMBIENT_INTERVAL_MS;
    }
  });

  const activate = useCallback(
    (id: string) => {
      if (id === "portfolio") return;
      onSelectProject(id);
    },
    [onSelectProject],
  );

  const [width, height] = scene.viewBox;

  const packetPoint = (() => {
    if (!packet) return null;
    const edge = scene.edges.find((e) => e.id === packet.edge);
    if (!edge) return null;
    const points = edgePoints(scene, edge, null);
    const t = Math.min(1, (now - packet.start) / AMBIENT_TRAVEL_MS);
    return { point: pointAt(points, t), label: packet.label };
  })();

  return (
    <div ref={ref} className="screen hero__screen">
      <div className="screen__strip">
        <span>five projects</span>
      </div>
      <div className="hero__stack">
        {phase !== "done" ? <HeroAscii visible={phase === "ascii" || phase === "hold"} /> : null}
        <svg
          className="screen__stage hero__map"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          aria-label="Map of the five projects. Each node opens that project's section."
          role="group"
        >
          <SceneGrid width={width} height={height} />
          <g>
            {scene.edges.map((edge) => {
              const points = edgePoints(scene, edge, null);
              const length = polylineLength(points);
              return (
                <path
                  key={edge.id}
                  d={pathD(points)}
                  fill="none"
                  stroke="var(--screen-muted)"
                  strokeWidth={1.5}
                  opacity={0.6}
                  className={resolving ? "hero__edge hero__edge--draw" : "hero__edge"}
                  style={
                    resolving ? { strokeDasharray: length, strokeDashoffset: length } : undefined
                  }
                />
              );
            })}
          </g>
          <g className={resolving ? "hero__nodes hero__nodes--settle" : "hero__nodes"}>
            {scene.nodes.map((node) => (
              <Node
                key={node.id}
                node={node}
                layout={null}
                elapsed={0}
                onActivate={node.id === "portfolio" ? undefined : activate}
                ariaLabel={node.id === "portfolio" ? undefined : `Go to ${node.label}`}
              />
            ))}
          </g>
          {packetPoint ? (
            <g aria-hidden="true">
              <circle
                cx={packetPoint.point.x}
                cy={packetPoint.point.y}
                r={4}
                fill="var(--signal)"
                stroke="var(--screen)"
                strokeWidth={2}
              />
              <text
                x={packetPoint.point.x}
                y={packetPoint.point.y - 10}
                fill="var(--signal)"
                fontFamily="var(--font-mono)"
                fontSize={12}
                textAnchor="middle"
              >
                {packetPoint.label}
              </text>
            </g>
          ) : null}
        </svg>
      </div>
    </div>
  );
}
