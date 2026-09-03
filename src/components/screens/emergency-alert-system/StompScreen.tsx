"use client";

import { useState } from "react";
import { ScenarioScreen } from "../engine/ScenarioScreen";
import { Caption, Identifier } from "../engine/Primitives";
import { nodeRect } from "../engine/geometry";
import type { ScreenState } from "../engine/schedule";
import type { Scene } from "../engine/types";
import { CHANNEL, MODES, scene, type Mode } from "./scene";
import { scenarios } from "./scenarios";

const TITLE = "Emergency-Alert-System";

const MODE_NARRATION: Record<Mode, string> = {
  tpc: "Thread-per-client mode: one OS thread per connection",
  reactor: "Reactor mode: one non-blocking selector thread hands work to an actor thread pool",
};

/**
 * The server's internals are the thing the mode switch morphs (R4.23): one lane
 * per connected client in `tpc`, one selector ring plus a three-bar thread pool
 * in `reactor`.
 */
function ServerInternals({
  state,
  currentScene,
  mode,
}: {
  state: ScreenState;
  currentScene: Scene;
  mode: Mode;
}) {
  const server = currentScene.nodes.find((n) => n.id === "server");
  if (!server) return null;
  const rect = nodeRect(server, state.layout);
  const clients = (["A", "B", "C"] as const).filter(
    (id) => state.values[`connected.${id}`] === true,
  );

  // Both layouts stay mounted and crossfade, so the switch is a 600ms morph
  // rather than a cut — and collapses to nothing under reduced motion, where
  // --t-morph is 0 (design §2.4).
  const layer = (visible: boolean) => ({
    opacity: visible ? 1 : 0,
    transition: "opacity var(--t-morph) cubic-bezier(0.16, 1, 0.3, 1)",
    pointerEvents: "none" as const,
  });

  return (
    <>
      <g style={layer(mode === "tpc")} aria-hidden="true">
        {clients.map((id, i) => (
          <g key={id}>
            <rect
              x={rect.x + 16}
              y={rect.y + 40 + i * 30}
              width={rect.w - 32}
              height={20}
              rx={3}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={1}
              opacity={0.8}
            />
            <text
              x={rect.x + 24}
              y={rect.y + 54 + i * 30}
              fill="var(--screen-muted)"
              fontFamily="var(--font-mono)"
              fontSize={11}
            >
              {`thread ${i + 1} — client ${id}`}
            </text>
          </g>
        ))}
        {clients.length === 0 ? (
          <Caption x={rect.x + 16} y={rect.y + 54}>
            no connections
          </Caption>
        ) : null}
      </g>
      <g style={layer(mode === "reactor")} aria-hidden="true">
        <circle
          cx={rect.x + 46}
          cy={rect.y + 78}
          r={22}
          fill="none"
          stroke="var(--signal)"
          strokeWidth={1}
          strokeDasharray="5 5"
        />
        <Identifier x={rect.x + 46} y={rect.y + 82} anchor="middle" tone="signal">
          selector
        </Identifier>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={rect.x + 92}
            y={rect.y + 56 + i * 20}
            width={rect.w - 112}
            height={12}
            rx={2}
            fill="var(--screen-muted)"
            opacity={clients.length > i ? 0.8 : 0.3}
          />
        ))}
        <Caption x={rect.x + 92} y={rect.y + 128}>
          thread pool
        </Caption>
      </g>
    </>
  );
}

function makeOverlay(mode: Mode) {
  return function overlay(state: ScreenState, currentScene: Scene) {
    const nodes = new Map(currentScene.nodes.map((n) => [n.id, n]));
    const server = nodes.get("server");
    const event = state.values["event"];

    return (
      <g>
        {server ? (
          <Identifier
            x={nodeRect(server, state.layout).cx}
            y={nodeRect(server, state.layout).y + 24}
            anchor="middle"
          >
            {mode}
          </Identifier>
        ) : null}

        <ServerInternals state={state} currentScene={currentScene} mode={mode} />

        {(["A", "B", "C"] as const).map((id) => {
          const node = nodes.get(`client${id}`);
          if (!node) return null;
          const rect = nodeRect(node, state.layout);
          const subscribed = state.values[`subscribed.${id}`] === true;
          const delivered = state.values[`delivered.${id}`] === true;
          const receipt = state.values[`receipt.${id}`] === true;
          return (
            <g key={id}>
              {subscribed ? (
                <Identifier x={rect.x} y={rect.y + rect.h + 16} tone="signal">
                  {`subscribed ${CHANNEL}`}
                </Identifier>
              ) : null}
              {delivered ? (
                <Identifier x={rect.x} y={rect.y + rect.h + 32} tone="signal">
                  MESSAGE
                </Identifier>
              ) : null}
              {receipt ? (
                <Identifier x={rect.x} y={rect.y + rect.h + 32}>
                  RECEIPT
                </Identifier>
              ) : null}
            </g>
          );
        })}

        {server && event ? (
          <g>
            <rect
              x={nodeRect(server, state.layout).x + nodeRect(server, state.layout).w + 20}
              y={nodeRect(server, state.layout).y}
              width={168}
              height={44}
              rx={4}
              fill="var(--screen)"
              stroke="var(--signal)"
              strokeWidth={1}
            />
            <Identifier
              x={nodeRect(server, state.layout).x + nodeRect(server, state.layout).w + 30}
              y={nodeRect(server, state.layout).y + 20}
              tone="signal"
            >
              {String(event)}
            </Identifier>
            <Caption
              x={nodeRect(server, state.layout).x + nodeRect(server, state.layout).w + 30}
              y={nodeRect(server, state.layout).y + 36}
            >
              example from the README
            </Caption>
          </g>
        ) : null}

        {server ? (
          <Identifier
            x={nodeRect(server, state.layout).x - 12}
            y={nodeRect(server, state.layout).y - 12}
            anchor="end"
          >
            {CHANNEL}
          </Identifier>
        ) : null}
      </g>
    );
  };
}

export default function StompScreen({ systemSummary }: { systemSummary: string }) {
  const [mode, setMode] = useState<Mode>("tpc");

  return (
    <ScenarioScreen
      title={TITLE}
      systemSummary={systemSummary}
      note={MODE_NARRATION[mode]}
      scene={scene}
      scenarios={scenarios}
      autoplay="connect"
      overlay={makeOverlay(mode)}
      extraControls={() => (
        <>
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              className="screen-btn"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </>
      )}
    />
  );
}
