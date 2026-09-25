import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});

// jsdom implements neither matchMedia nor the SVG geometry APIs the screen
// engine relies on. Both are stubbed here so component tests can mount screens.
if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

if (!("IntersectionObserver" in window)) {
  class MockIntersectionObserver {
    constructor(private readonly cb: IntersectionObserverCallback) {}
    observe() {
      this.cb(
        [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      );
    }
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
  }
  // stubGlobal also sets it on jsdom's window; assigning window.IntersectionObserver
  // directly fails to type-check because the `in` guard narrows window to never.
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
}

// jsdom defines SVGElement but not SVGPathElement, so guard on the subclass itself.
if (typeof SVGPathElement !== "undefined") {
  const proto = SVGPathElement.prototype as unknown as Record<string, unknown>;
  if (!proto.getTotalLength) {
    proto.getTotalLength = () => 100;
    proto.getPointAtLength = (l: number) => ({ x: l, y: 0 });
  }
}

vi.stubGlobal("scrollTo", () => {});
