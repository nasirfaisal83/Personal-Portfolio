import { describe, expect, it } from "vitest";
import { renderToString } from "react-dom/server";
import { render } from "@testing-library/react";
import { isInView } from "@/components/screens/engine/hooks";
import { chipWidth, wrapText } from "@/components/screens/engine/Primitives";
import { StaticScreen } from "@/components/screens/engine/ScenarioScreen";
import { scene } from "@/components/screens/order-saga/scene";
import { scenarios } from "@/components/screens/order-saga/scenarios";

const rect = (height: number) => ({ height }) as DOMRectReadOnly;

describe("isInView", () => {
  it("counts an element once the threshold share of it is visible", () => {
    expect(isInView({ isIntersecting: true, intersectionRatio: 0.5 }, 0.5)).toBe(true);
    expect(isInView({ isIntersecting: true, intersectionRatio: 0.49 }, 0.5)).toBe(false);
    expect(isInView({ isIntersecting: false, intersectionRatio: 0 }, 0.5)).toBe(false);
  });

  it("counts an element too tall to reach the ratio once it fills the viewport share", () => {
    // A 1,200px figure on a 375px-tall landscape phone can show at most 31%.
    const tall = { isIntersecting: true, intersectionRatio: 0.31 };
    expect(isInView({ ...tall, intersectionRect: rect(375), rootBounds: rect(375) }, 0.5)).toBe(
      true,
    );
    expect(isInView({ ...tall, intersectionRect: rect(150), rootBounds: rect(375) }, 0.5)).toBe(
      false,
    );
  });

  it("falls back to the ratio alone when the rects are missing", () => {
    expect(isInView({ isIntersecting: true, intersectionRatio: 0.2 }, 0.5)).toBe(false);
    expect(isInView({ isIntersecting: true, intersectionRatio: 0.2, rootBounds: null }, 0.5)).toBe(
      false,
    );
  });
});

describe("wrapText", () => {
  it("breaks at spaces so no line is longer than the limit", () => {
    const answer = "Payment is due within 30 days of the invoice date.";
    const lines = wrapText(answer, 43);
    expect(lines).toEqual(["Payment is due within 30 days of the", "invoice date."]);
    expect(lines.join(" ")).toBe(answer);
  });

  it("leaves a line that fits alone", () => {
    expect(wrapText("event: token", 43)).toEqual(["event: token"]);
  });
});

describe("chipWidth", () => {
  it("never goes below the minimum and grows with the text", () => {
    expect(chipWidth("READY")).toBe(52);
    expect(chipWidth("INVENTORY_RESERVED")).toBe(140);
  });
});

describe("responsive stage", () => {
  const props = {
    title: "Order-Saga",
    systemSummary: "five services",
    scene,
    scenario: scenarios[0],
  };

  it("puts both layouts in the static markup so CSS can pick before hydration", () => {
    const html = renderToString(<StaticScreen {...props} />);
    expect(html).toContain("screen__stage--wide");
    expect(html).toContain("screen__stage--narrow");
    expect(html).toContain('viewBox="0 0 720 400"');
    expect(html).toContain('viewBox="0 0 360 560"');
  });

  it("keeps only the matching layout once hydrated", () => {
    // vitest.setup stubs matchMedia to match nothing, so the wide layout wins.
    const { container } = render(<StaticScreen {...props} />);
    const stages = container.querySelectorAll("svg.screen__stage");
    expect(stages).toHaveLength(1);
    expect(stages[0].getAttribute("viewBox")).toBe("0 0 720 400");
    expect(stages[0].getAttribute("class")).toBe("screen__stage");
  });
});
