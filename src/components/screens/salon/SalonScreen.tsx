"use client";

import { ScenarioScreen } from "../engine/ScenarioScreen";
import { Caption, Identifier } from "../engine/Primitives";
import { nodeRect } from "../engine/geometry";
import type { ScreenState } from "../engine/schedule";
import type { Scene } from "../engine/types";
import { STATE_EXITS, STATE_PATH, scene } from "./scene";
import { scenarios } from "./scenarios";

const TITLE = "Salon Appointment System";

/**
 * The §6 state strip, the exclusion-constraint tag on the database, the labels
 * each flow leaves on its customers, and the two rows a reschedule creates.
 */
function overlay(state: ScreenState, currentScene: Scene) {
  const narrow = currentScene.viewBox[0] < 500;
  const nodes = new Map(currentScene.nodes.map((n) => [n.id, n]));
  const rect = (id: string) => {
    const node = nodes.get(id);
    return node ? nodeRect(node, state.layout) : null;
  };
  const customerA = rect("customerA");
  const customerB = rect("customerB");
  const db = rect("db");
  const worker = rect("worker");

  const original = state.values["original"];
  const replacement = state.values["replacement"];
  const constraint = state.values["constraint"];
  // A reschedule has two appointments, so the strip can light two states.
  const current = new Set(
    [state.status["db"]?.value, original, replacement].filter((v) => typeof v === "string"),
  );

  const pathX = (i: number) => (narrow ? 12 + i * 112 : 24 + i * 150);
  const exitX = (i: number) => (narrow ? 12 + i * 88 : 24 + i * 150);
  const pathY = narrow ? 452 : 330;
  const exitY = pathY + 24;

  // Each customer's labels: A's cookie or availability check, B's check and
  // conflict. Narrow puts them above the customers, where no edge runs; wide
  // puts them below, A's low enough to clear its line to Next.js.
  const labelA = customerA
    ? { x: customerA.x, y: narrow ? customerA.y - 14 : customerA.y + customerA.h + 28 }
    : null;
  const labelB = customerB
    ? { x: customerB.x, y: narrow ? customerB.y - 30 : customerB.y + customerB.h + 18 }
    : null;

  return (
    <g>
      {labelA && state.values["cookie"] === true ? (
        <Identifier x={labelA.x} y={labelA.y} tone="signal">
          remembered-phone cookie
        </Identifier>
      ) : null}
      {labelA && state.values["check.A"] === true ? (
        <Identifier x={labelA.x} y={labelA.y} tone="signal">
          availability check ✓
        </Identifier>
      ) : null}
      {labelB && state.values["check.B"] === true ? (
        <Identifier x={labelB.x} y={labelB.y} tone="signal">
          availability check ✓
        </Identifier>
      ) : null}
      {labelB && state.values["conflict.B"] === true ? (
        <Identifier x={labelB.x} y={labelB.y + 16} tone="fault">
          409 SLOT_CONFLICT
        </Identifier>
      ) : null}

      {/* §9 — the constraint is the arbiter; it turns red when it refuses a row. */}
      {db ? (
        <Caption
          x={db.x}
          y={db.y + db.h + 40}
          tone={constraint === "blocked" ? "fault" : constraint === "ok" ? "signal" : undefined}
        >
          exclusion constraint
        </Caption>
      ) : null}

      {/* §7.2 — the original keeps its slot until the replacement is approved. */}
      {db && typeof original === "string" ? (
        <Identifier
          x={narrow ? 12 : 190}
          y={narrow ? db.y + db.h + 58 : db.y + 18}
          tone={original === "CANCELLED" ? "muted" : "signal"}
        >
          {`original ${original}`}
        </Identifier>
      ) : null}
      {db && typeof replacement === "string" ? (
        <Identifier x={narrow ? 12 : 190} y={narrow ? db.y + db.h + 74 : db.y + 36} tone="signal">
          {`replacement ${replacement}`}
        </Identifier>
      ) : null}

      {worker && state.values["silent"] === true ? (
        <Caption x={worker.x} y={worker.y + worker.h + 18}>
          deliberately silent
        </Caption>
      ) : null}

      {/* §6 — seven states: the happy path, then the ways a request ends early. */}
      {STATE_PATH.map((status, i) => (
        <text
          key={status}
          x={pathX(i)}
          y={pathY}
          fill={current.has(status) ? "var(--signal)" : "var(--screen-muted)"}
          fontFamily="var(--font-mono)"
          fontSize={11}
          style={{ transition: "fill 300ms ease-out" }}
        >
          {status}
        </text>
      ))}
      {STATE_EXITS.map((status, i) => (
        <text
          key={status}
          x={exitX(i)}
          y={exitY}
          fill={current.has(status) ? "var(--signal)" : "var(--screen-muted)"}
          fontFamily="var(--font-mono)"
          fontSize={11}
          style={{ transition: "fill 300ms ease-out" }}
        >
          {status}
        </text>
      ))}
    </g>
  );
}

export default function SalonScreen({ systemSummary }: { systemSummary: string }) {
  return (
    <ScenarioScreen
      title={TITLE}
      systemSummary={systemSummary}
      note="private client project"
      scene={scene}
      scenarios={scenarios}
      autoplay="book"
      overlay={overlay}
    />
  );
}
