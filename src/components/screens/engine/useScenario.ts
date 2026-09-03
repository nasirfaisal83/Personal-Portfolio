"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_CONCURRENT_PACKETS,
  REDUCED_STEP_MS,
  SLOW_DEVICE_PACKETS,
  initialState,
  scenarioDuration,
  tick,
  type ScreenState,
} from "./schedule";
import { useEvent, usePageVisible, useRafLoop, useReducedMotionPref, useSlowDevice } from "./hooks";
import type { Scenario, Scene } from "./types";

export interface UseScenarioOptions {
  /** Scenario id played once when the screen first becomes visible (R4.3). */
  autoplay?: string;
  /** The screen is at least 50% on screen. */
  inView: boolean;
}

export interface ScenarioController {
  state: ScreenState;
  activeId: string;
  playing: boolean;
  /** True while the OS asks for reduced motion and the visitor has not opted in. */
  reduced: boolean;
  motionOptIn: boolean;
  slowDevice: boolean;
  maxConcurrent: number;
  play: (id: string) => void;
  pause: () => void;
  reset: () => void;
  enableMotion: () => void;
}

/**
 * One rAF loop per mounted screen (design §6.2, §12). The loop is only started
 * while the screen is in view, the tab is visible, and a scenario is running,
 * so resting screens hold no timers at all.
 */
export function useScenario(
  scene: Scene,
  scenarios: Scenario[],
  { autoplay, inView }: UseScenarioOptions,
): ScenarioController {
  const first = scenarios[0];
  const defaultId = autoplay ?? first?.id ?? "";

  const [activeId, setActiveId] = useState(defaultId);
  const [state, setState] = useState<ScreenState>(() => initialState(scene));
  const [playing, setPlaying] = useState(false);
  const [motionOptIn, setMotionOptIn] = useState(false);

  const prefersReduced = useReducedMotionPref();
  const pageVisible = usePageVisible();
  const slowDevice = useSlowDevice();
  const reduced = prefersReduced && !motionOptIn;

  const elapsed = useRef(0);
  const autoplayed = useRef(false);

  const scenario = useMemo(
    () => scenarios.find((s) => s.id === activeId) ?? first,
    [scenarios, activeId, first],
  );

  const maxConcurrent = slowDevice ? SLOW_DEVICE_PACKETS : MAX_CONCURRENT_PACKETS;

  const total = useMemo(() => {
    if (!scenario) return 0;
    return reduced ? scenario.steps.length * REDUCED_STEP_MS : scenarioDuration(scenario);
  }, [scenario, reduced]);

  const play = useEvent((id: string) => {
    setActiveId(id);
    elapsed.current = 0;
    setState(initialState(scene));
    setPlaying(true);
  });

  const pause = useCallback(() => setPlaying(false), []);

  const reset = useEvent(() => {
    elapsed.current = 0;
    setState(initialState(scene));
    setPlaying(false);
  });

  const enableMotion = useCallback(() => {
    setMotionOptIn(true);
  }, []);

  // R4.3 — autoplay the default scenario exactly once, never on a loop.
  useEffect(() => {
    if (!inView || autoplayed.current || !scenario) return;
    autoplayed.current = true;
    elapsed.current = 0;
    setState(initialState(scene));
    setPlaying(true);
  }, [inView, scenario, scene]);

  // R4.7 — leaving the viewport or hiding the tab pauses; returning resumes.
  const active = playing && inView && pageVisible;

  // The loop reads and writes through a ref so two frames landing before a
  // re-render still advance from the newest state rather than a stale closure.
  const stateRef = useRef(state);
  stateRef.current = state;

  useRafLoop(active, (delta) => {
    if (!scenario) return;
    elapsed.current += delta;
    const next = tick(stateRef.current, scenario, elapsed.current, {
      maxConcurrent,
      reducedMotion: reduced,
    });
    stateRef.current = next;
    setState(next);
    if (elapsed.current >= total && next.done) setPlaying(false);
  });

  return {
    state,
    activeId,
    playing: active,
    reduced,
    motionOptIn,
    slowDevice,
    maxConcurrent,
    play,
    pause,
    reset,
    enableMotion,
  };
}
