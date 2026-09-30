import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Name } from "@/components/hero/Name";
import { About } from "@/components/sections/About";
import { Projects } from "@/components/sections/Projects";
import { SkillGroups } from "@/components/sections/SkillGroups";
import { CopyButton } from "@/components/ui/CopyButton";
import { Screen } from "@/components/screens/engine/Screen";
import { StaticScreen } from "@/components/screens/engine/ScenarioScreen";
import { scene } from "@/components/screens/order-saga/scene";
import { scenarios } from "@/components/screens/order-saga/scenarios";
import { about } from "@/content/experience";
import { featuredProject, gridProjects } from "@/content/projects";

// TransitionLink reads the App Router, which is not mounted under jsdom.
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

describe("Name", () => {
  it("hides the Arabic and Hebrew spans while they are placeholders", () => {
    render(<Name />);
    // The teal full stop after the name is decoration, left out of its name.
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName("Faisal Nasir");
    expect(document.querySelector('[lang="ar"]')).toBeNull();
    expect(document.querySelector('[lang="he"]')).toBeNull();
  });
});

describe("About", () => {
  it("omits the date column while the periods are placeholders", () => {
    render(<About />);
    expect(screen.getByText("Teaching Assistant")).toBeInTheDocument();
    expect(screen.queryByText(/TODO_/)).toBeNull();
    expect(document.querySelector(".about__exp-period")).toBeNull();
  });

  it("carries the Hasoub community role that used to have its own section", () => {
    render(<About />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("id", "about");
    expect(screen.getByText(about.community)).toBeInTheDocument();
    const roles = screen.getByRole("list", { name: "Experience" });
    expect(roles).toHaveTextContent("On-Campus Community Manager");
    expect(roles).toHaveTextContent("Hasoub");
    expect(roles).toHaveTextContent("Organizes talks, industry events, and a hackathon");
  });
});

describe("Projects", () => {
  it("shows the featured card first, then the grid in list order", () => {
    render(<Projects />);
    const shown = [...(featuredProject ? [featuredProject] : []), ...gridProjects];
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual(
      shown.map((p) => p.title),
    );
    for (const project of shown) {
      expect(screen.getByRole("heading", { level: 3, name: project.title })).toHaveAttribute(
        "id",
        `project-${project.slug}`,
      );
    }
  });

  it("links each grid card to its code, or says it is a private client project", () => {
    render(<Projects />);
    // jsdom has no layout, so the name may carry a space before the hidden colon.
    const named = (label: string, title: string) =>
      new RegExp(`^${label}\\s?: ${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
    for (const project of gridProjects) {
      if (project.github) {
        expect(screen.getByRole("link", { name: named("Code", project.title) })).toHaveAttribute(
          "href",
          project.github,
        );
      }
      expect(
        screen.getByRole("link", { name: named("Case study", project.title) }).getAttribute("href"),
      ).toMatch(new RegExp(`^/projects/${project.slug}/?$`));
    }
    const privateCards = gridProjects.filter((p) => !p.github).length;
    expect(screen.queryAllByText("Private client project")).toHaveLength(privateCards);
  });
});

describe("SkillGroups", () => {
  it("makes buttons only of skills with a caption, and a plain tag clears it", async () => {
    const user = userEvent.setup();
    render(
      <SkillGroups
        groups={[{ group: "Tools", items: ["Docker", "Kubernetes"] }]}
        captions={{ Tools: { Docker: "Used in Order-Saga", Kubernetes: "" } }}
      />,
    );
    expect(screen.getAllByRole("button").map((b) => b.textContent)).toEqual(["Docker"]);
    expect(screen.getByText("Kubernetes").tagName).toBe("SPAN");

    const live = document.querySelector(".skills__live");
    await user.hover(screen.getByRole("button", { name: "Docker" }));
    expect(live?.textContent).toBe("Used in Order-Saga");
    await user.hover(screen.getByText("Kubernetes"));
    expect(live?.textContent).toBe("");
  });
});

describe("CopyButton", () => {
  it("copies and announces, then returns to its label", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    // setup() installs its own navigator.clipboard stub, so spy on that one.
    const writeText = vi.spyOn(navigator.clipboard, "writeText");

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
