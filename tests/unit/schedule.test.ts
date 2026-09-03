import { describe, expect, it } from "vitest";
import {
  MAX_CONCURRENT_PACKETS,
  REDUCED_STEP_MS,
  endState,
  initialState,
  packetProgress,
  scenarioDuration,
  tick,
} from "@/components/screens/engine/schedule";
import type { Scenario, Scene } from "@/components/screens/engine/types";

const scene: Scene = {
  viewBox: [400, 200],
  nodes: [
    { id: "a", label: "A", x: 0, y: 0 },
    { id: "b", label: "B", x: 200, y: 0, status: "PENDING" },
  ],
  edges: [{ id: "a-b", from: "a", to: "b" }],
};

const scenario: Scenario = {
  id: "demo",
  label: "Demo",
  steps: [
    { t: 0, kind: "packet", edge: "a-b", label: "one", duration: 500 },
    { t: 500, kind: "status", node: "b", value: "READY", tone: "signal" },
    { t: 500, kind: "say", text: "B is ready" },
    { t: 600, kind: "set", target: "count", value: 3 },
    { t: 700, kind: "morph", layout: "reactor" },
  ],
  narration: ["A sends to B", "B is ready"],
};

describe("initialState", () => {
  it("seeds chips from the scene and nothing else", () => {
    const state = initialState(scene);
    expect(state.status).toEqual({ b: { value: "PENDING", tone: "idle" } });
    expect(state.packets).toHaveLength(0);
    expect(state.applied).toBe(0);
  });
});

describe("tick", () => {
  it("applies steps in order and only once their time has passed", () => {
    let state = initialState(scene);
    state = tick(state, scenario, 100);
    expect(state.applied).toBe(1);
    expect(state.status.b.value).toBe("PENDING");

    state = tick(state, scenario, 550);
    expect(state.applied).toBe(3);
    expect(state.status.b).toEqual({ value: "READY", tone: "signal" });
    expect(state.say).toBe("B is ready");

    state = tick(state, scenario, 750);
    expect(state.applied).toBe(5);
    expect(state.values.count).toBe(3);
    expect(state.layout).toBe("reactor");
  });

  it("keeps elapsed time across a pause and resume", () => {
    let state = initialState(scene);
    state = tick(state, scenario, 300);
    const pausedAt = state.applied;
    // A pause simply stops advancing `elapsed`; ticking at the same time again
    // must not re-apply anything.
    state = tick(state, scenario, 300);
    expect(state.applied).toBe(pausedAt);
    state = tick(state, scenario, 650);
    expect(state.applied).toBe(4);
  });

  it("retires a packet once it has finished travelling", () => {
    let state = initialState(scene);
    state = tick(state, scenario, 10);
    expect(state.packets).toHaveLength(1);
    state = tick(state, scenario, 600);
    expect(state.packets).toHaveLength(0);
  });

  it("queues launches beyond the concurrency cap", () => {
    const many: Scenario = {
      id: "many",
      label: "Many",
      steps: Array.from({ length: 10 }, () => ({
        t: 0,
        kind: "packet" as const,
        edge: "a-b",
        duration: 1000,
      })),
      narration: [],
    };
    let state = initialState(scene);
    state = tick(state, many, 1);
    expect(state.packets).toHaveLength(MAX_CONCURRENT_PACKETS);
    expect(state.queue).toHaveLength(10 - MAX_CONCURRENT_PACKETS);
  });

  it("launches queued packets as room frees up", () => {
    const many: Scenario = {
      id: "many",
      label: "Many",
      steps: Array.from({ length: 8 }, () => ({
        t: 0,
        kind: "packet" as const,
        edge: "a-b",
        duration: 500,
      })),
      narration: [],
    };
    let state = tick(initialState(scene), many, 1);
    expect(state.queue).toHaveLength(2);
    state = tick(state, many, 600);
    expect(state.packets).toHaveLength(2);
    expect(state.queue).toHaveLength(0);
  });

  it("honours a lower cap on slow devices", () => {
    const many: Scenario = {
      id: "many",
      label: "Many",
      steps: Array.from({ length: 6 }, () => ({
        t: 0,
        kind: "packet" as const,
        edge: "a-b",
        duration: 1000,
      })),
      narration: [],
    };
    const state = tick(initialState(scene), many, 1, { maxConcurrent: 3 });
    expect(state.packets).toHaveLength(3);
    expect(state.queue).toHaveLength(3);
  });

  it("steps through states with no packet travel under reduced motion", () => {
    let state = initialState(scene);
    state = tick(state, scenario, REDUCED_STEP_MS * 3, { reducedMotion: true });
    expect(state.packets).toHaveLength(0);
    expect(state.queue).toHaveLength(0);
    expect(state.applied).toBe(4);
    expect(state.status.b.value).toBe("READY");
  });

  it("reports done only once every step has been applied", () => {
    let state = initialState(scene);
    state = tick(state, scenario, 650);
    expect(state.done).toBe(false);
    state = tick(state, scenario, 2000);
    expect(state.done).toBe(true);
  });
});

describe("endState", () => {
  it("resolves every state with nothing in flight", () => {
    const state = endState(scene, scenario);
    expect(state.status.b.value).toBe("READY");
    expect(state.values.count).toBe(3);
    expect(state.layout).toBe("reactor");
    expect(state.packets).toHaveLength(0);
    expect(state.done).toBe(true);
  });
});

describe("scenarioDuration", () => {
  it("includes the tail of the last packet", () => {
    expect(scenarioDuration(scenario)).toBe(1000);
  });
});

describe("packetProgress", () => {
  const packet = { key: "k", edge: "a-b", tone: "signal" as const, start: 100, duration: 400 };

  it("clamps outside its window and eases in between", () => {
    expect(packetProgress(packet, 0)).toBe(0);
    expect(packetProgress(packet, 900)).toBe(1);
    expect(packetProgress(packet, 300)).toBeCloseTo(0.5, 5);
  });
});
