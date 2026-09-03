import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Name } from "@/components/hero/Name";
import { About } from "@/components/sections/About";
import { Community } from "@/components/sections/Community";
import { CopyButton } from "@/components/ui/CopyButton";
import { Screen } from "@/components/screens/engine/Screen";
import { StaticScreen } from "@/components/screens/engine/ScenarioScreen";
import { scene } from "@/components/screens/order-saga/scene";
import { scenarios } from "@/components/screens/order-saga/scenarios";

describe("Name", () => {
  it("hides the Arabic and Hebrew spans while they are placeholders", () => {
    render(<Name />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Faisal Nasir");
    expect(document.querySelector('[lang="ar"]')).toBeNull();
    expect(document.querySelector('[lang="he"]')).toBeNull();
  });
});

describe("About", () => {
  it("omits the date column while the periods are placeholders", () => {
    render(<About />);
    expect(screen.getByText("Teaching Assistant")).toBeInTheDocument();
    expect(screen.queryByText(/TODO_/)).toBeNull();
    expect(document.querySelector(".log__period")).toBeNull();
  });
});

describe("Community", () => {
  it("renders the role and the three activities and nothing more", () => {
    const { container } = render(<Community />);
    expect(screen.getByText("On-Campus Community Manager, Hasoub")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Organizes talks, industry events, and a hackathon for the tech community in Israel.",
      ),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });
});

describe("CopyButton", () => {
  it("copies and announces, then returns to its label", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(<CopyButton value="a@b.c" label="Copy email" />);
    await user.click(screen.getByRole("button", { name: "Copy email" }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument());
    expect(writeText).toHaveBeenCalledWith("a@b.c");

    vi.advanceTimersByTime(2100);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Copy email" })).toBeInTheDocument(),
    );
    vi.useRealTimers();
  });
});

describe("Screen", () => {
  it("names the figure and reveals the narration on request", async () => {
    const user = userEvent.setup();
    render(
      <Screen
        title="Order-Saga"
        systemSummary="five services coordinating through Kafka"
        narration={["First step", "Second step"]}
        say="Order created"
      >
        <svg />
      </Screen>,
    );

    expect(
      screen.getByRole("group", {
        name: "Order-Saga: five services coordinating through Kafka",
      }),
    ).toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Show as text" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(screen.getByRole("button", { name: "Hide text" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByText("First step")).toBeInTheDocument();
  });

  it("keeps a JavaScript-off note in the markup", () => {
    render(
      <Screen title="t" systemSummary="s" narration={[]} say={null}>
        <svg />
      </Screen>,
    );
    expect(screen.getByText("Turn on JavaScript to run the scenarios.")).toBeInTheDocument();
  });
});

describe("StaticScreen", () => {
  it("renders the scenario's end state so the export shows a resolved diagram", () => {
    const { container } = render(
      <StaticScreen
        title="Order-Saga"
        systemSummary="five services"
        scene={scene}
        scenario={scenarios[0]}
      />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });
});
