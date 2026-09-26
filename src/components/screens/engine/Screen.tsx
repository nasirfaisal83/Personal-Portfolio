"use client";

import { Component, useEffect, useId, useState, type ReactNode, type SVGProps } from "react";
import type { Scene } from "./types";

/* ---------------------------------------------------------------- chrome */

export interface ScreenProps {
  /** Repo name, set in the title strip in Plex Mono. */
  title: string;
  /** "{repo}: {one-sentence system summary}" — the figure's accessible name. */
  systemSummary: string;
  /** Right-hand note in the title strip, e.g. a documented caption. */
  note?: string;
  controls?: ReactNode;
  narration: string[];
  say: string | null;
  children: ReactNode;
  className?: string;
}

/**
 * design §6.3, §6.5 — the SVG is decorative; the narration list is the
 * accessible content, and `say` steps are announced politely (R4.5, R4.6).
 */
export function Screen({
  title,
  systemSummary,
  note,
  controls,
  narration,
  say,
  children,
  className,
}: ScreenProps) {
  const [showText, setShowText] = useState(false);
  const textId = useId();

  return (
    <figure
      role="group"
      aria-label={`${title}: ${systemSummary}`}
      className={`screen${className ? ` ${className}` : ""}`}
      style={{ margin: 0 }}
    >
      <div className="screen__strip">
        <span>{title}</span>
        {note ? <span>{note}</span> : null}
      </div>

      <div aria-hidden="true">{children}</div>

      {/* Visibility is driven by the `has-js` body class the shell sets before
          paint, so the controls never flash in or shift the layout. */}
      <div className="js-only">
        <div className="screen__controls" role="group" aria-label={`${title} scenarios`}>
          {controls}
          <button
            type="button"
            className="screen-btn"
            aria-expanded={showText}
            aria-controls={textId}
            onClick={() => setShowText((v) => !v)}
          >
            {showText ? "Hide text" : "Show as text"}
          </button>
        </div>
        <ScreenText id={textId} narration={narration} say={say} expanded={showText} />
      </div>
      <p className="screen__note js-off-note">Turn on JavaScript to run the scenarios.</p>
    </figure>
  );
}

/* ------------------------------------------------------------- narration */

export function ScreenText({
  id,
  narration,
  say,
  expanded,
}: {
  id: string;
  narration: string[];
  say: string | null;
  expanded: boolean;
}) {
  return (
    <>
      <div aria-live="polite" className="visually-hidden">
        {say ?? ""}
      </div>
      <div id={id} className="screen__text" hidden={!expanded}>
        <ol>
          {narration.map((line, i) => (
            <li key={i}>{line}</li>
          ))}
        </ol>
      </div>
    </>
  );
}

/* -------------------------------------------------------------- controls */

export interface ScenarioButton {
  id: string;
  label: string;
  pressed?: boolean;
}

export function ScreenControls({
  buttons,
  activeId,
  onSelect,
}: {
  buttons: ScenarioButton[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {buttons.map((button) => (
        <button
          key={button.id}
          type="button"
          className="screen-btn"
          aria-pressed={button.pressed ?? button.id === activeId}
          onClick={() => onSelect(button.id)}
        >
          {button.label}
        </button>
      ))}
    </>
  );
}

/* -------------------------------------------------------------- boundary */

interface BoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface BoundaryState {
  failed: boolean;
}

/** R4.8 — a screen that throws degrades to its static end state; the page lives on. */
export class ScreenBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false };

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error): void {
    console.error("Screen failed, showing the static end state instead:", error);
  }

  render(): ReactNode {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/* ------------------------------------------------------------ responsive */

/**
 * R11.2 — below 768px a screen uses its narrow scene rather than a shrunk one.
 * Only in portrait, though: a phone held sideways fits the wide scene better
 * than a narrow one three viewports tall. Keep in step with the
 * `.screen__stage--*` rules in globals.css.
 */
export const NARROW_QUERY = "(max-width: 767px) and (orientation: portrait)";

/** The scene with its narrow positions swapped in; the edges are shared. */
export function narrowOf(scene: Scene): Scene {
  if (!scene.narrow) return scene;
  return { ...scene, viewBox: scene.narrow.viewBox, nodes: scene.narrow.nodes };
}

/** Whether NARROW_QUERY matches — `null` until hydrated, since the static export can't know. */
export function useNarrow(): boolean | null {
  const [narrow, setNarrow] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") {
      setNarrow(false);
      return;
    }
    const mql = window.matchMedia(NARROW_QUERY);
    setNarrow(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return narrow;
}

/**
 * The stage SVG for a scene. Until hydration both layouts are in the markup and
 * CSS shows the one that fits, so the static export and a phone's first paint
 * already use the narrow scene, and hydrating never changes the stage's height.
 * After that only the matching layout is rendered.
 */
export function ResponsiveStage({
  scene,
  narrow,
  draw,
  className,
  ...svg
}: {
  scene: Scene;
  narrow: boolean | null;
  draw: (scene: Scene) => ReactNode;
} & Omit<SVGProps<SVGSVGElement>, "viewBox" | "children">) {
  const variants: ["wide" | "narrow", Scene][] =
    !scene.narrow || narrow === false
      ? [["wide", scene]]
      : narrow
        ? [["narrow", narrowOf(scene)]]
        : [
            ["wide", scene],
            ["narrow", narrowOf(scene)],
          ];
  const pending = variants.length > 1;

  return (
    <>
      {variants.map(([key, variant]) => (
        <svg
          key={key}
          {...svg}
          className={["screen__stage", pending ? `screen__stage--${key}` : null, className]
            .filter(Boolean)
            .join(" ")}
          viewBox={`0 0 ${variant.viewBox[0]} ${variant.viewBox[1]}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {draw(variant)}
        </svg>
      ))}
    </>
  );
}
