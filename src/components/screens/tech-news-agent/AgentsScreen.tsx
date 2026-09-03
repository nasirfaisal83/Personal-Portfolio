"use client";

import { ScenarioScreen } from "../engine/ScenarioScreen";
import { Caption, Gauge, Identifier } from "../engine/Primitives";
import { nodeRect } from "../engine/geometry";
import type { ScreenState } from "../engine/schedule";
import type { Scene } from "../engine/types";
import { CONFIDENCE_THRESHOLD, MARKERS, scene } from "./scene";
import { scenarios } from "./scenarios";

const TITLE = "tech-news-agent";

function overlay(state: ScreenState, currentScene: Scene) {
  const narrow = currentScene.viewBox[0] < 500;
  const nodes = new Map(currentScene.nodes.map((n) => [n.id, n]));
  const orchestrator = nodes.get("orchestrator");
  const factchecker = nodes.get("factchecker");
  const topicNode = nodes.get("topic");
  const reporter = nodes.get("reporter");
  const postNode = nodes.get("post");

  const topic = state.values["topic.text"];
  const spin = Number(state.values["orchestrator.spin"] ?? 0);
  const facts = Number(state.values["facts"] ?? 0);
  const confidence = Number(state.values["confidence"] ?? 0);
  const illustrative = state.values["confidence.illustrative"] === true;
  const postReady = state.values["post.ready"] === true;

  const orchRect = orchestrator ? nodeRect(orchestrator, state.layout) : null;
  const factRect = factchecker ? nodeRect(factchecker, state.layout) : null;
  const postRect = postNode ? nodeRect(postNode, state.layout) : null;

  return (
    <g>
      {/* The ReAct ring: reason, act, observe. It turns once per pass. */}
      {orchRect ? (
        <g>
          <ellipse
            cx={orchRect.cx}
            cy={orchRect.cy}
            rx={orchRect.w / 2 + 22}
            ry={orchRect.h / 2 + 18}
            fill="none"
            stroke={spin > 0 ? "var(--signal)" : "var(--screen-muted)"}
            strokeWidth={1}
            strokeDasharray="6 6"
            opacity={0.8}
            style={{ transition: "stroke 300ms ease-out" }}
          />
          <Identifier
            x={orchRect.cx}
            y={orchRect.y - 26}
            anchor="middle"
            tone={spin > 0 ? "signal" : "muted"}
          >
            reason → act → observe
          </Identifier>
          {spin > 1 ? (
            <Caption x={orchRect.cx} y={orchRect.y + orchRect.h + 34} anchor="middle">
              second pass
            </Caption>
          ) : null}
        </g>
      ) : null}

      {topicNode && topic ? (
        <Identifier
          x={nodeRect(topicNode, state.layout).x}
          y={nodeRect(topicNode, state.layout).y - 8}
          tone="signal"
        >
          {String(topic)}
        </Identifier>
      ) : null}

      {reporter && facts > 0 ? (
        <Identifier
          x={nodeRect(reporter, state.layout).x}
          y={nodeRect(reporter, state.layout).y + nodeRect(reporter, state.layout).h + 16}
          tone="signal"
        >
          {`facts ${facts}`}
        </Identifier>
      ) : null}

      {/* The fact-check gauge with its documented 0.6 threshold tick. */}
      {factRect ? (
        <g>
          <Gauge
            x={factRect.x}
            y={factRect.y + factRect.h + 24}
            w={narrow ? 150 : 140}
            value={confidence}
            threshold={CONFIDENCE_THRESHOLD}
            label="fact-check confidence"
          />
          {illustrative ? (
            <Caption x={factRect.x} y={factRect.y + factRect.h + 66} tone="fault">
              illustrative failing score
            </Caption>
          ) : null}
          {illustrative ? (
            <Caption x={factRect.x} y={factRect.y + factRect.h + 82}>
              retry decided by the model, not by hardcoded Java
            </Caption>
          ) : null}
        </g>
      ) : null}

      {/* The output card, with the README's markers. */}
      {postRect && postReady ? (
        <g>
          <rect
            x={postRect.x}
            y={postRect.y + postRect.h + 12}
            width={narrow ? 336 : 260}
            height={64}
            rx={4}
            fill="var(--screen)"
            stroke="var(--signal)"
            strokeWidth={1}
          />
          {MARKERS.map((marker, i) => (
            <Identifier
              key={marker}
              x={postRect.x + 10 + i * (narrow ? 100 : 84)}
              y={postRect.y + postRect.h + 34}
              tone="signal"
            >
              {marker}
            </Identifier>
          ))}
          <Caption x={postRect.x + 10} y={postRect.y + postRect.h + 58}>
            example response from the README, ~63 s
          </Caption>
        </g>
      ) : null}
    </g>
  );
}

export default function AgentsScreen({ systemSummary }: { systemSummary: string }) {
  return (
    <ScenarioScreen
      title={TITLE}
      systemSummary={systemSummary}
      scene={scene}
      scenarios={scenarios}
      autoplay="run"
      overlay={overlay}
    />
  );
}
