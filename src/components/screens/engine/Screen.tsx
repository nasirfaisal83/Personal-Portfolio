"use client";

import { Component, useEffect, useId, useState, type ReactNode } from "react";
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

/** R11.2 — below 768px a screen uses its narrow scene rather than a shrunk one. */
export function useResponsiveScene(scene: Scene): Scene {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(max-width: 767px)");
    setNarrow(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  if (!narrow || !scene.narrow) return scene;
  return { ...scene, viewBox: scene.narrow.viewBox, nodes: scene.narrow.nodes };
}
