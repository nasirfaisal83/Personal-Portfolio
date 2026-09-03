"use client";

import { useMemo, type ReactNode } from "react";
import { Screen, ScreenBoundary, ScreenControls, useResponsiveScene } from "./Screen";
import { SceneLayer } from "./Primitives";
import { useInView } from "./hooks";
import { endState, initialState, type ScreenState } from "./schedule";
import { useScenario } from "./useScenario";
import type { Scenario, Scene, SceneNode } from "./types";

export interface ScenarioScreenProps {
  title: string;
  systemSummary: string;
  note?: string;
  scene: Scene;
  scenarios: Scenario[];
  /** Scenario played once on first view (R4.3). Defaults to the first. */
  autoplay?: string;
  /** Artwork drawn under the nodes: gauges, panels, terminals, road scenes. */
  overlay?: (state: ScreenState, scene: Scene) => ReactNode;
  /** Extra buttons appended after the scenario buttons, e.g. the mode toggle. */
  extraControls?: (controller: {
    state: ScreenState;
    play: (id: string) => void;
    activeId: string;
  }) => ReactNode;
  onNodeActivate?: (id: string) => void;
  nodeAriaLabel?: (node: SceneNode) => string;
}

/**
 * The shared body of every project screen: one scheduler, one SVG stage, the
 * scenario buttons, and the text alternative. Screens differ only in their
 * scene, their scenarios, and the artwork they draw in `overlay`.
 */
export function ScenarioScreen({
  title,
  systemSummary,
  note,
  scene: wideScene,
  scenarios,
  autoplay,
  overlay,
  extraControls,
  onNodeActivate,
  nodeAriaLabel,
}: ScenarioScreenProps) {
  const scene = useResponsiveScene(wideScene);
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const controller = useScenario(scene, scenarios, { autoplay, inView });
  const { state, activeId, play, reduced, motionOptIn, slowDevice, enableMotion } = controller;

  const active = useMemo(
    () => scenarios.find((s) => s.id === activeId) ?? scenarios[0],
    [scenarios, activeId],
  );

  const [width, height] = scene.viewBox;

  // R4.5 — announcements name their position in the scenario, e.g.
  // "Step 3 of 5: inventory released".
  const sayCount = active?.steps.filter((step) => step.kind === "say").length ?? 0;
  const announcement =
    state.say && sayCount > 0
      ? `Step ${Math.min(state.sayIndex + 1, sayCount)} of ${sayCount}: ${state.say}`
      : state.say;

  return (
    <div ref={ref}>
      <ScreenBoundary
        fallback={
          <StaticScreen
            title={title}
            systemSummary={systemSummary}
            note={note}
            scene={scene}
            scenario={active}
            overlay={overlay}
          />
        }
      >
        <Screen
          title={title}
          systemSummary={systemSummary}
          note={note}
          narration={active?.narration ?? []}
          say={announcement}
          controls={
            <>
              <ScreenControls
                buttons={scenarios.map((s) => ({ id: s.id, label: s.label }))}
                activeId={activeId}
                onSelect={play}
              />
              {extraControls?.({ state, play, activeId })}
              {reduced && !motionOptIn ? (
                <button type="button" className="screen-btn" onClick={enableMotion}>
                  Play with motion
                </button>
              ) : null}
            </>
          }
        >
          <svg
            className="screen__stage"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-hidden="true"
            focusable="false"
            preserveAspectRatio="xMidYMid meet"
          >
            <SceneLayer
              scene={scene}
              state={state}
              trails={!slowDevice}
              onNodeActivate={onNodeActivate}
              nodeAriaLabel={nodeAriaLabel}
            >
              {overlay?.(state, scene)}
            </SceneLayer>
          </svg>
        </Screen>
      </ScreenBoundary>
    </div>
  );
}

/**
 * The frame rendered at build time and after a runtime failure: the scene at
 * rest, with the narration list still available (R4.8, design §8 SSR note).
 */
export function StaticScreen({
  title,
  systemSummary,
  note,
  scene,
  scenario,
  overlay,
  atEnd = true,
}: {
  title: string;
  systemSummary: string;
  note?: string;
  scene: Scene;
  scenario?: Scenario;
  overlay?: (state: ScreenState, scene: Scene) => ReactNode;
  atEnd?: boolean;
}) {
  const state = atEnd && scenario ? endState(scene, scenario) : initialState(scene);
  const [width, height] = scene.viewBox;

  return (
    <Screen
      title={title}
      systemSummary={systemSummary}
      note={note}
      narration={scenario?.narration ?? []}
      say={null}
    >
      <svg
        className="screen__stage"
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
      >
        <SceneLayer scene={scene} state={state} trails={false}>
          {overlay?.(state, scene)}
        </SceneLayer>
      </svg>
    </Screen>
  );
}
