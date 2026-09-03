/**
 * Pure scheduler — design §6.2. No DOM, no React: a timeline of typed steps
 * mapped onto a state object, so step ordering, pause/resume math, packet
 * queueing and reduced-motion stepping are all unit-testable (design §15).
 */
import {
  DEFAULT_PACKET_MS,
  PULSE_MS,
  type ChipTone,
  type NodeId,
  type Scenario,
  type Scene,
  type Step,
  type Tone,
} from "./types";

export const MAX_CONCURRENT_PACKETS = 6;
export const SLOW_DEVICE_PACKETS = 3;
/** Reduced motion advances one non-packet step per crossfade (R3.5). */
export const REDUCED_STEP_MS = 150;

export interface ActivePacket {
  key: string;
  edge: string;
  label?: string;
  tone: Tone;
  /** Elapsed-time origin, in ms from scenario start. */
  start: number;
  duration: number;
}

export interface ChipState {
  value: string;
  tone: ChipTone;
}

export interface ScreenState {
  status: Record<NodeId, ChipState>;
  values: Record<string, string | number | boolean>;
  layout: string | null;
  /** node id -> elapsed time the pulse began. */
  pulses: Record<NodeId, { tone: Tone; at: number }>;
  packets: ActivePacket[];
  queue: Extract<Step, { kind: "packet" }>[];
  /** How many steps of the scenario have been applied. */
  applied: number;
  say: string | null;
  sayIndex: number;
  elapsed: number;
  done: boolean;
}

export interface TickOptions {
  maxConcurrent?: number;
  /** Skip packet travel entirely and step states in order (R3.5). */
  reducedMotion?: boolean;
}

export function initialState(scene: Scene): ScreenState {
  const status: Record<NodeId, ChipState> = {};
  for (const node of scene.nodes) {
    if (node.status !== undefined) status[node.id] = { value: node.status, tone: "idle" };
  }
  return {
    status,
    values: {},
    layout: null,
    pulses: {},
    packets: [],
    queue: [],
    applied: 0,
    say: null,
    sayIndex: -1,
    elapsed: 0,
    done: false,
  };
}

function applyStep(
  state: ScreenState,
  step: Step,
  at: number,
  reducedMotion: boolean,
): ScreenState {
  switch (step.kind) {
    case "status":
      return {
        ...state,
        status: {
          ...state.status,
          [step.node]: { value: step.value, tone: step.tone ?? "signal" },
        },
      };
    case "set":
      return { ...state, values: { ...state.values, [step.target]: step.value } };
    case "morph":
      return { ...state, layout: step.layout };
    case "say":
      return { ...state, say: step.text, sayIndex: state.sayIndex + 1 };
    case "pulse":
      return {
        ...state,
        pulses: { ...state.pulses, [step.node]: { tone: step.tone ?? "signal", at } },
      };
    case "packet": {
      if (reducedMotion) return state;
      return { ...state, queue: [...state.queue, step] };
    }
    default:
      return state;
  }
}

/** Number of packet steps a scenario contains — used by the "6 in flight" cap tests. */
export function packetSteps(scenario: Scenario): Extract<Step, { kind: "packet" }>[] {
  return scenario.steps.filter((s): s is Extract<Step, { kind: "packet" }> => s.kind === "packet");
}

function launchQueued(state: ScreenState, elapsed: number, max: number): ScreenState {
  if (state.queue.length === 0) return state;
  const room = max - state.packets.length;
  if (room <= 0) return state;
  const launching = state.queue.slice(0, room);
  const rest = state.queue.slice(room);
  const packets = [...state.packets];
  launching.forEach((step, i) => {
    packets.push({
      key: `${step.edge}-${step.t}-${elapsed.toFixed(0)}-${i}`,
      edge: step.edge,
      label: step.label,
      tone: step.tone ?? "signal",
      start: elapsed,
      duration: step.duration ?? DEFAULT_PACKET_MS,
    });
  });
  return { ...state, packets, queue: rest };
}

function retirePackets(state: ScreenState, elapsed: number): ScreenState {
  const live = state.packets.filter((p) => elapsed < p.start + p.duration);
  if (live.length === state.packets.length) return state;
  return { ...state, packets: live };
}

function retirePulses(state: ScreenState, elapsed: number): ScreenState {
  const entries = Object.entries(state.pulses).filter(([, p]) => elapsed < p.at + PULSE_MS);
  if (entries.length === Object.keys(state.pulses).length) return state;
  return { ...state, pulses: Object.fromEntries(entries) };
}

/**
 * Advance to `elapsed`. Steps are applied in array order, every step whose
 * `t` has passed and which has not been applied yet — so a pause simply stops
 * `elapsed` from growing and a resume continues from the same index.
 */
export function tick(
  state: ScreenState,
  scenario: Scenario,
  elapsed: number,
  options: TickOptions = {},
): ScreenState {
  const max = options.maxConcurrent ?? MAX_CONCURRENT_PACKETS;
  const reduced = options.reducedMotion ?? false;

  let next: ScreenState = { ...state, elapsed };

  if (reduced) {
    // One step per crossfade, in order, ignoring the authored timings.
    const target = Math.min(scenario.steps.length, Math.floor(elapsed / REDUCED_STEP_MS) + 1);
    while (next.applied < target) {
      const step = scenario.steps[next.applied];
      next = applyStep(next, step, elapsed, true);
      next = { ...next, applied: next.applied + 1 };
    }
  } else {
    while (next.applied < scenario.steps.length && scenario.steps[next.applied].t <= elapsed) {
      const step = scenario.steps[next.applied];
      next = applyStep(next, step, elapsed, false);
      next = { ...next, applied: next.applied + 1 };
    }
    next = retirePackets(next, elapsed);
    next = launchQueued(next, elapsed, max);
  }

  next = retirePulses(next, elapsed);

  const allApplied = next.applied >= scenario.steps.length;
  next.done = allApplied && next.packets.length === 0 && next.queue.length === 0;
  return next;
}

/** Total runtime of a scenario, including the tail of its last packet. */
export function scenarioDuration(scenario: Scenario): number {
  return scenario.steps.reduce((max, step) => {
    const tail = step.kind === "packet" ? (step.duration ?? DEFAULT_PACKET_MS) : PULSE_MS;
    return Math.max(max, step.t + tail);
  }, 0);
}

/** Every state a scenario ends on, with no packets in flight (R4.8, R3.5). */
export function endState(scene: Scene, scenario: Scenario): ScreenState {
  let state = initialState(scene);
  for (const step of scenario.steps) {
    state = applyStep(state, step, 0, true);
    state = { ...state, applied: state.applied + 1 };
  }
  return { ...state, packets: [], queue: [], pulses: {}, done: true };
}

/** Eased progress of one packet at the current elapsed time, clamped to 0..1. */
export function packetProgress(packet: ActivePacket, elapsed: number): number {
  const raw = (elapsed - packet.start) / packet.duration;
  const t = raw <= 0 ? 0 : raw >= 1 ? 1 : raw;
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}
