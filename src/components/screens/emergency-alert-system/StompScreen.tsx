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
        <Identifier x={rect.x + 46} y={rect.y + 116} anchor="middle" tone="signal">
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

/** Drawn over the server box: the mode tag in its corner and the internals. */
function makeForeground(mode: Mode) {
  return function foreground(state: ScreenState, currentScene: Scene) {
    const server = currentScene.nodes.find((n) => n.id === "server");
    if (!server) return null;
    const rect = nodeRect(server, state.layout);
    return (
      <g>
        <Identifier x={rect.x + rect.w - 10} y={rect.y + 20} anchor="end">
          {mode}
        </Identifier>
        <ServerInternals state={state} currentScene={currentScene} mode={mode} />
      </g>
    );
  };
}

function overlay(state: ScreenState, currentScene: Scene) {
  const narrow = currentScene.viewBox[0] < 500;
  const nodes = new Map(currentScene.nodes.map((n) => [n.id, n]));
  const server = nodes.get("server");
  const serverRect = server ? nodeRect(server, state.layout) : null;
  const event = state.values["event"];

  // Wide: the event card sits right of the server. Narrow: there is no room
  // beside it, so the card is centred under client C.
  const card = serverRect
    ? narrow
      ? { x: (currentScene.viewBox[0] - 168) / 2, y: 484 }
      : { x: serverRect.x + serverRect.w + 20, y: serverRect.y }
    : null;

  return (
    <g>
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

      {card && event ? (
        <g>
          <rect
            x={card.x}
            y={card.y}
            width={168}
            height={44}
            rx={4}
            fill="var(--screen)"
            stroke="var(--signal)"
            strokeWidth={1}
          />
          <Identifier x={card.x + 10} y={card.y + 20} tone="signal">
            {String(event)}
          </Identifier>
          <Caption x={card.x + 10} y={card.y + 36}>
            example from the README
          </Caption>
        </g>
      ) : null}

      {serverRect ? (
        // Narrow: the server is near the left edge, so the channel name goes above it.
        <Identifier
          x={narrow ? serverRect.x : serverRect.x - 12}
          y={narrow ? serverRect.y - 8 : serverRect.y - 12}
          anchor={narrow ? "start" : "end"}
        >
          {CHANNEL}
        </Identifier>
      ) : null}
    </g>
  );
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
      overlay={overlay}
      foreground={makeForeground(mode)}
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
