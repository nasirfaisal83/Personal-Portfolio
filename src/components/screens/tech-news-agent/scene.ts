/**
 * tech-news-agent scene — design §7.3.
 * Agent names, tool names, the 0.6 confidence threshold, the example topic and
 * the [HIGH]/[MEDIUM]/[UNVERIFIED] markers are all the README's.
 */
import type { Scene } from "../engine/types";

export const CONFIDENCE_THRESHOLD = 0.6;
export const PASSING_CONFIDENCE = 0.83;
/** Not a documented figure — labelled "illustrative" on screen (design §7.3). */
export const RETRY_CONFIDENCE = 0.52;
export const MARKERS = ["[HIGH]", "[MEDIUM]", "[UNVERIFIED]"] as const;

export const scene: Scene = {
  viewBox: [720, 420],
  nodes: [
    { id: "topic", label: "topic", x: 16, y: 24, w: 130, h: 32, kind: "client" },
    {
      id: "orchestrator",
      label: "OrchestratorAgent",
      x: 250,
      y: 24,
      w: 200,
      h: 44,
      kind: "agent",
    },
    { id: "scout", label: "ScoutAgent", x: 16, y: 148, w: 128, h: 38, kind: "agent" },
    { id: "reporter", label: "ReporterAgent", x: 160, y: 148, w: 128, h: 38, kind: "agent" },
    { id: "editor", label: "EditorAgent", x: 304, y: 148, w: 128, h: 38, kind: "agent" },
    {
      id: "factchecker",
      label: "FactCheckerAgent",
      x: 448,
      y: 148,
      w: 140,
      h: 38,
      kind: "agent",
    },
    {
      id: "writer",
      label: "LinkedInWriterAgent",
      x: 448,
      y: 300,
      w: 160,
      h: 38,
      kind: "agent",
    },
    { id: "tavily", label: "Tavily", x: 16, y: 246, w: 100, h: 30, kind: "tool" },
    { id: "mcp", label: "GitHub MCP", x: 16, y: 288, w: 110, h: 30, kind: "tool" },
    { id: "post", label: "post", x: 224, y: 300, w: 130, h: 38, kind: "stage" },
  ],
  edges: [
    { id: "topic-orch", from: "topic", to: "orchestrator" },
    { id: "orch-scout", from: "orchestrator", to: "scout" },
    { id: "scout-tavily", from: "scout", to: "tavily", dashed: true },
    { id: "tavily-scout", from: "tavily", to: "scout", dashed: true },
    { id: "scout-mcp", from: "scout", to: "mcp", dashed: true },
    { id: "mcp-scout", from: "mcp", to: "scout", dashed: true },
    { id: "scout-reporter", from: "scout", to: "reporter" },
    { id: "reporter-editor", from: "reporter", to: "editor" },
    { id: "editor-fact", from: "editor", to: "factchecker" },
    { id: "fact-reporter", from: "factchecker", to: "reporter" },
    { id: "fact-writer", from: "factchecker", to: "writer" },
    { id: "writer-post", from: "writer", to: "post" },
  ],
  narrow: {
    viewBox: [360, 700],
    nodes: [
      { id: "topic", label: "topic", x: 12, y: 20, w: 150, h: 32, kind: "client" },
      {
        id: "orchestrator",
        label: "OrchestratorAgent",
        x: 92,
        y: 84,
        w: 190,
        h: 42,
        kind: "agent",
      },
      { id: "scout", label: "ScoutAgent", x: 12, y: 186, w: 150, h: 36, kind: "agent" },
      { id: "tavily", label: "Tavily", x: 196, y: 176, w: 150, h: 28, kind: "tool" },
      { id: "mcp", label: "GitHub MCP", x: 196, y: 212, w: 150, h: 28, kind: "tool" },
      { id: "reporter", label: "ReporterAgent", x: 12, y: 274, w: 150, h: 36, kind: "agent" },
      { id: "editor", label: "EditorAgent", x: 12, y: 350, w: 150, h: 36, kind: "agent" },
      {
        id: "factchecker",
        label: "FactCheckerAgent",
        x: 12,
        y: 426,
        w: 168,
        h: 36,
        kind: "agent",
      },
      {
        id: "writer",
        label: "LinkedInWriterAgent",
        x: 12,
        y: 540,
        w: 190,
        h: 36,
        kind: "agent",
      },
      { id: "post", label: "post", x: 220, y: 540, w: 126, h: 36, kind: "stage" },
    ],
  },
};
