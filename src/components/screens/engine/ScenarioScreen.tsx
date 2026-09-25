"use client";

import { useMemo, type ReactNode } from "react";
import {
  ResponsiveStage,
  Screen,
  ScreenBoundary,
  ScreenControls,
  narrowOf,
  useNarrow,
} from "./Screen";
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
  /** Artwork drawn over the nodes, for anything that sits inside a node's box. */
  foreground?: (state: ScreenState, scene: Scene) => ReactNode;
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
 * scene, their scenarios, and the artwork they draw in `overlay` and `foreground`.
 */
export function ScenarioScreen({
  title,
  systemSummary,
  note,
  scene: wideScene,
  scenarios,
  autoplay,
  overlay,
  foreground,
  extraControls,
  onNodeActivate,
  nodeAriaLabel,
}: ScenarioScreenProps) {
  const narrow = useNarrow();
  const scene = useMemo(() => (narrow ? narrowOf(wideScene) : wideScene), [narrow, wideScene]);
  const { ref, inView } = useInView<HTMLDivElement>(0.5);
  const controller = useScenario(scene, scenarios, { autoplay, inView });
  const { state, activeId, play, reduced, motionOptIn, slowDevice, enableMotion } = controller;

  const active = useMemo(
    () => scenarios.find((s) => s.id === activeId) ?? scenarios[0],
    [scenarios, activeId],
  );

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
            scene={wideScene}
            scenario={active}
            overlay={overlay}
            foreground={foreground}
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
          <ResponsiveStage
            scene={wideScene}
            narrow={narrow}
            role="img"
            aria-hidden="true"
            focusable="false"
            draw={(variant) => (
              <SceneLayer
                scene={variant}
                state={state}
                trails={!slowDevice}
                onNodeActivate={onNodeActivate}
                nodeAriaLabel={nodeAriaLabel}
                foreground={foreground?.(state, variant)}
              >
                {overlay?.(state, variant)}
              </SceneLayer>
            )}
          />
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
  foreground,
  atEnd = true,
}: {
  title: string;
  systemSummary: string;
  note?: string;
  /** The wide scene; its narrow layout is picked the same way as on the live screen. */
  scene: Scene;
  scenario?: Scenario;
  overlay?: (state: ScreenState, scene: Scene) => ReactNode;
  foreground?: (state: ScreenState, scene: Scene) => ReactNode;
  atEnd?: boolean;
}) {
  const narrow = useNarrow();
  const state = atEnd && scenario ? endState(scene, scenario) : initialState(scene);

  return (
    <Screen
      title={title}
      systemSummary={systemSummary}
      note={note}
      narration={scenario?.narration ?? []}
      say={null}
    >
      <ResponsiveStage
        scene={scene}
        narrow={narrow}
        aria-hidden="true"
        focusable="false"
        draw={(variant) => (
          <SceneLayer
            scene={variant}
            state={state}
            trails={false}
            foreground={foreground?.(state, variant)}
          >
            {overlay?.(state, variant)}
          </SceneLayer>
        )}
      />
    </Screen>
  );
}
