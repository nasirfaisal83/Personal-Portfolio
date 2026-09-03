import { describe, expect, it } from "vitest";
import {
  endState,
  initialState,
  scenarioDuration,
  tick,
} from "@/components/screens/engine/schedule";
import { edgePoints } from "@/components/screens/engine/geometry";
import type { Scenario, Scene } from "@/components/screens/engine/types";

import { scene as sagaScene } from "@/components/screens/order-saga/scene";
import { scenarios as sagaScenarios } from "@/components/screens/order-saga/scenarios";
import { scene as ragScene } from "@/components/screens/rag-document-qa/scene";
import { scenarios as ragScenarios } from "@/components/screens/rag-document-qa/scenarios";
import { scene as agentScene } from "@/components/screens/tech-news-agent/scene";
import { scenarios as agentScenarios } from "@/components/screens/tech-news-agent/scenarios";
import { scene as stompScene } from "@/components/screens/emergency-alert-system/scene";
import { scenarios as stompScenarios } from "@/components/screens/emergency-alert-system/scenarios";

const screens: { name: string; scene: Scene; scenarios: Scenario[] }[] = [
  { name: "order-saga", scene: sagaScene, scenarios: sagaScenarios },
  { name: "rag-document-qa", scene: ragScene, scenarios: ragScenarios },
  { name: "tech-news-agent", scene: agentScene, scenarios: agentScenarios },
  { name: "emergency-alert-system", scene: stompScene, scenarios: stompScenarios },
];

describe.each(screens)("$name", ({ scene, scenarios }) => {
  it("declares steps in ascending time order", () => {
    for (const scenario of scenarios) {
      const times = scenario.steps.map((s) => s.t);
      expect(times).toEqual([...times].sort((a, b) => a - b));
    }
  });

  it("only references edges and nodes the scene declares", () => {
    const edgeIds = new Set(scene.edges.map((e) => e.id));
    const nodeIds = new Set(scene.nodes.map((n) => n.id));
    for (const scenario of scenarios) {
      for (const step of scenario.steps) {
        if (step.kind === "packet") expect(edgeIds).toContain(step.edge);
        if (step.kind === "pulse" || step.kind === "status") expect(nodeIds).toContain(step.node);
      }
    }
  });

  it("keeps the narrow scene in step with the wide one", () => {
    if (!scene.narrow) return;
    const wide = new Set(scene.nodes.map((n) => n.id));
    const narrow = new Set(scene.narrow.nodes.map((n) => n.id));
    expect([...narrow].every((id) => wide.has(id))).toBe(true);
  });

  it("gives every scenario a narration list", () => {
    for (const scenario of scenarios) {
      expect(scenario.narration.length).toBeGreaterThan(0);
    }
  });

  it("routes every edge to a drawable path in both layouts", () => {
    const narrow = scene.narrow
      ? { ...scene, viewBox: scene.narrow.viewBox, nodes: scene.narrow.nodes }
      : null;
    for (const edge of scene.edges) {
      expect(edgePoints(scene, edge, null).length).toBeGreaterThanOrEqual(2);
      if (narrow) expect(edgePoints(narrow, edge, null).length).toBeGreaterThanOrEqual(2);
    }
  });

  it("runs every scenario to completion on the scheduler", () => {
    for (const scenario of scenarios) {
      let state = initialState(scene);
      const total = scenarioDuration(scenario);
      for (let t = 0; t <= total + 50; t += 16) state = tick(state, scenario, t);
      expect(state.done).toBe(true);
      expect(state.queue).toHaveLength(0);
      expect(state.packets).toHaveLength(0);
    }
  });
});

describe("Order-Saga", () => {
  const [place, fail, oos] = sagaScenarios;

  it("ends Place order on COMPLETED", () => {
    expect(endState(sagaScene, place).status.order.value).toBe("COMPLETED");
  });

  it("releases inventory before the order reaches FAILED", () => {
    const release = fail.steps.findIndex(
      (s) => s.kind === "set" && s.target === "inventory.stock" && s.value === "released",
    );
    const failed = fail.steps.findIndex(
      (s) => s.kind === "status" && s.node === "order" && s.value === "FAILED",
    );
    expect(release).toBeGreaterThan(-1);
    expect(failed).toBeGreaterThan(release);
    expect(endState(sagaScene, fail).status.order.value).toBe("FAILED");
  });

  it("ends Out of stock on FAILED", () => {
    expect(endState(sagaScene, oos).status.order.value).toBe("FAILED");
  });

  it("uses only the README's topic names as packet labels", () => {
    const allowed = new Set([
      "POST /api/orders",
      "payment gateway",
      "order.created",
      "inventory.reserved",
      "inventory.failed",
      "payment.succeeded",
      "payment.failed",
      "shipment.created",
    ]);
    for (const scenario of sagaScenarios) {
      for (const step of scenario.steps) {
        if (step.kind === "packet" && step.label) expect(allowed).toContain(step.label);
      }
    }
  });
});

describe("Emergency-Alert-System", () => {
  it("sends MESSAGE only to the subscribers and RECEIPT to the publisher", () => {
    const broadcast = stompScenarios.find((s) => s.id === "broadcast");
    expect(broadcast).toBeDefined();
    if (!broadcast) return;
    const labels = broadcast.steps
      .filter((s) => s.kind === "packet")
      .map((s) => (s.kind === "packet" ? `${s.edge}:${s.label}` : ""));
    expect(labels).toContain("server-a:MESSAGE");
    expect(labels).toContain("server-b:MESSAGE");
    expect(labels).toContain("server-c:RECEIPT");
    expect(labels).not.toContain("server-c:MESSAGE");
  });
});

describe("tech-news-agent", () => {
  it("drives the first fact check below the documented threshold on a retry", () => {
    const retry = agentScenarios.find((s) => s.id === "retry");
    expect(retry).toBeDefined();
    if (!retry) return;
    const confidences = retry.steps.filter((s) => s.kind === "set" && s.target === "confidence");
    expect(confidences[0]).toMatchObject({ value: 0.52 });
    expect(confidences[1]).toMatchObject({ value: 0.83 });
    expect(retry.steps.some((s) => s.kind === "packet" && s.edge === "fact-reporter")).toBe(true);
  });
});

describe("rag-document-qa", () => {
  it("falls through to Tesseract on a scanned page", () => {
    const scanned = ragScenarios.find((s) => s.id === "scanned");
    expect(scanned).toBeDefined();
    if (!scanned) return;
    const strategies = scanned.steps
      .filter((s) => s.kind === "set" && s.target === "extract.strategy")
      .map((s) => (s.kind === "set" ? s.value : null));
    expect(strategies).toEqual(["PDFBox", "Tesseract"]);
  });

  it("cites two sources after streaming the answer", () => {
    const ask = ragScenarios.find((s) => s.id === "ask");
    expect(ask).toBeDefined();
    if (!ask) return;
    expect(ask.steps.some((s) => s.kind === "set" && s.target === "answer.sources")).toBe(true);
  });
});
