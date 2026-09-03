"use client";

import { ScenarioScreen } from "../engine/ScenarioScreen";
import { Identifier } from "../engine/Primitives";
import { nodeRect } from "../engine/geometry";
import type { ScreenState } from "../engine/schedule";
import type { Scene } from "../engine/types";
import { SERVICE_IDS, SIDE_STATES, STATUS_TIMELINE, scene } from "./scene";
import { scenarios } from "./scenarios";

const TITLE = "Order-Saga";

/**
 * The idempotency counters and the status timeline strip from design §7.1.
 * `processed` is the ProcessedEvent table each service keeps; the timeline is
 * the README's order status lifecycle with the current state lit.
 */
function overlay(state: ScreenState, currentScene: Scene) {
  const narrow = currentScene.viewBox[0] < 500;
  const nodes = new Map(currentScene.nodes.map((n) => [n.id, n]));
  const current = state.status["order"]?.value;
  const stock = state.values["inventory.stock"];
  const inventory = nodes.get("inventory");

  const timelineX = (i: number) => (narrow ? 8 : 24 + i * 170);
  const timelineY = (i: number) => (narrow ? 448 + i * 16 : 350);
  const sideX = (i: number) => (narrow ? 8 : 24 + i * 170);
  const sideY = (i: number) => (narrow ? 516 + i * 16 : 376);

  return (
    <g>
      {SERVICE_IDS.map((id) => {
        const node = nodes.get(id);
        if (!node) return null;
        const rect = nodeRect(node, state.layout);
        const count = state.values[`${id}.processed`] ?? 0;
        // Counters sit above the lower row and below the upper row so the Order
        // status chip keeps the space directly under its node.
        const above = !narrow && rect.y > currentScene.viewBox[1] / 2;
        return (
          <Identifier key={id} x={rect.x + 2} y={above ? rect.y - 10 : rect.y + rect.h + 42}>
            {`processed ${count}`}
          </Identifier>
        );
      })}

      {stock && inventory ? (
        <Identifier
          x={nodeRect(inventory, state.layout).x + 2}
          y={nodeRect(inventory, state.layout).y - 10}
          tone={stock === "released" ? "fault" : "signal"}
        >
          {`stock ${String(stock)}`}
        </Identifier>
      ) : null}

      {STATUS_TIMELINE.map((status, i) => (
        <text
          key={status}
          x={timelineX(i)}
          y={timelineY(i)}
          fill={current === status ? "var(--signal)" : "var(--screen-muted)"}
          fontFamily="var(--font-mono)"
          fontSize={11}
          style={{ transition: "fill 300ms ease-out" }}
        >
          {status}
        </text>
      ))}

      {SIDE_STATES.map((status, i) => (
        <text
          key={status}
          x={sideX(i)}
          y={sideY(i)}
          fill={current === status ? "var(--fault)" : "var(--screen-muted)"}
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

export default function OrderSagaScreen({ systemSummary }: { systemSummary: string }) {
  return (
    <ScenarioScreen
      title={TITLE}
      systemSummary={systemSummary}
      scene={scene}
      scenarios={scenarios}
      autoplay="place-order"
      overlay={overlay}
    />
  );
}
