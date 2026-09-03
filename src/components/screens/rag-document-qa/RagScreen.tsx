"use client";

import { ScenarioScreen } from "../engine/ScenarioScreen";
import { Caption, Identifier, Terminal } from "../engine/Primitives";
import { nodeRect } from "../engine/geometry";
import type { ScreenState } from "../engine/schedule";
import type { Scene } from "../engine/types";
import { CHUNK_COUNT, TOP_K, scene } from "./scene";
import { ANSWER_WORDS, scenarios } from "./scenarios";

const TITLE = "rag-document-qa";

/** Deterministic dot positions inside the vector panel — no randomness on rerender. */
function dotPositions(count: number, w: number, h: number) {
  return Array.from({ length: count }, (_, i) => {
    const golden = (i * 0.6180339887) % 1;
    const row = Math.floor(i / 3);
    return {
      x: 18 + golden * (w - 36),
      y: 20 + ((row * 26 + (i % 3) * 9) % (h - 40)),
    };
  });
}

function overlay(state: ScreenState, currentScene: Scene) {
  const narrow = currentScene.viewBox[0] < 500;
  const nodes = new Map(currentScene.nodes.map((n) => [n.id, n]));
  const vectors = nodes.get("vectors");
  const chunkNode = nodes.get("chunk");
  const answerNode = nodes.get("answer");
  const questionNode = nodes.get("question");
  const visionNode = nodes.get("vision");
  const pdfboxNode = nodes.get("pdfbox");

  const strategy = state.values["extract.strategy"];
  const extractNote = state.values["extract.note"];
  const blocks = Number(state.values["chunk.blocks"] ?? 0);
  const dots = Number(state.values["vectors.dots"] ?? 0);
  const query = state.values["vectors.query"] === true;
  const topK = Number(state.values["vectors.topk"] ?? 0);
  const words = Number(state.values["answer.words"] ?? 0);
  const showSources = state.values["answer.sources"] === true;
  const questionText = state.values["question.text"];

  const vectorRect = vectors ? nodeRect(vectors, state.layout) : null;
  const positions = vectorRect ? dotPositions(CHUNK_COUNT, vectorRect.w, vectorRect.h) : [];

  const answerLines: string[] = [];
  if (words > 0) answerLines.push(ANSWER_WORDS.slice(0, words).join(" "));
  if (words > 0 && words < ANSWER_WORDS.length) answerLines.push("event: token");
  if (showSources) answerLines.push("event: sources");

  return (
    <g>
      {/* The three-strategy waterfall: the active pill is lit, the rest stay idle. */}
      {(["pdfbox", "tesseract", "vision"] as const).map((id) => {
        const node = nodes.get(id);
        if (!node) return null;
        const rect = nodeRect(node, state.layout);
        const label =
          id === "pdfbox" ? "PDFBox" : id === "tesseract" ? "Tesseract" : "GPT-4o Vision";
        const active = strategy === label;
        return active ? (
          <rect
            key={id}
            x={rect.x}
            y={rect.y}
            width={rect.w}
            height={rect.h}
            rx={4}
            fill="none"
            stroke="var(--signal)"
            strokeWidth={1.5}
          />
        ) : null;
      })}
      {visionNode ? (
        <Caption
          x={nodeRect(visionNode, state.layout).x}
          y={nodeRect(visionNode, state.layout).y + (narrow ? 38 : 40)}
        >
          last resort
        </Caption>
      ) : null}
      {extractNote && pdfboxNode ? (
        <Identifier
          x={nodeRect(pdfboxNode, state.layout).x + nodeRect(pdfboxNode, state.layout).w + 6}
          y={nodeRect(pdfboxNode, state.layout).y + 17}
          tone="fault"
        >
          {String(extractNote)}
        </Identifier>
      ) : null}

      {/* Chunking: the page splits into shingled blocks. */}
      {chunkNode && blocks > 0
        ? Array.from({ length: Math.min(blocks, CHUNK_COUNT) }, (_, i) => {
            const rect = nodeRect(chunkNode, state.layout);
            return (
              <rect
                key={i}
                x={rect.x + 6 + i * ((rect.w - 16) / CHUNK_COUNT)}
                y={rect.y + rect.h + 8}
                width={(rect.w - 16) / CHUNK_COUNT - 2}
                height={10}
                rx={2}
                fill="var(--signal)"
                opacity={0.55}
              />
            );
          })
        : null}
      {chunkNode ? (
        <Caption
          x={nodeRect(chunkNode, state.layout).x}
          y={nodeRect(chunkNode, state.layout).y + nodeRect(chunkNode, state.layout).h + 34}
        >
          500 tokens, 50 overlap
        </Caption>
      ) : null}

      {/* Vector space panel with the stored chunk dots and the query dot. */}
      {vectorRect ? (
        <g>
          <rect
            x={vectorRect.x}
            y={vectorRect.y}
            width={vectorRect.w}
            height={vectorRect.h}
            rx={4}
            fill="none"
            stroke="var(--screen-muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {positions.slice(0, dots).map((p, i) => {
            const near = query && i < topK;
            return (
              <circle
                key={i}
                cx={vectorRect.x + p.x}
                cy={vectorRect.y + p.y}
                r={near ? 4 : 3}
                fill={near ? "var(--signal)" : "var(--screen-muted)"}
              />
            );
          })}
          {query ? (
            <>
              <circle
                cx={vectorRect.cx}
                cy={vectorRect.y + vectorRect.h - 16}
                r={4}
                fill="var(--signal)"
                stroke="var(--screen)"
                strokeWidth={2}
              />
              {positions.slice(0, topK).map((p, i) => (
                <line
                  key={i}
                  x1={vectorRect.cx}
                  y1={vectorRect.y + vectorRect.h - 16}
                  x2={vectorRect.x + p.x}
                  y2={vectorRect.y + p.y}
                  stroke="var(--signal)"
                  strokeWidth={1}
                  opacity={0.5}
                />
              ))}
              <Identifier x={vectorRect.x + 6} y={vectorRect.y - 8} tone="signal">
                {`top-k ${TOP_K}`}
              </Identifier>
            </>
          ) : null}
          <Caption x={vectorRect.x} y={vectorRect.y + vectorRect.h + 16}>
            text-embedding-3-small, 1536 dimensions
          </Caption>
        </g>
      ) : null}

      {questionNode && questionText ? (
        <Identifier
          x={nodeRect(questionNode, state.layout).x}
          y={nodeRect(questionNode, state.layout).y - 10}
          tone="signal"
        >
          {String(questionText)}
        </Identifier>
      ) : null}

      {/* Streamed answer and its cited sources. */}
      {answerNode && answerLines.length > 0 ? (
        <g>
          <Terminal
            x={narrow ? 12 : 16}
            y={narrow ? 528 : 344}
            w={narrow ? 336 : 400}
            lines={answerLines}
          />
          {showSources ? (
            <>
              <Identifier x={narrow ? 12 : 434} y={narrow ? 622 : 362} tone="signal">
                Chunk 12, page 4
              </Identifier>
              <Identifier x={narrow ? 12 : 434} y={narrow ? 640 : 380} tone="signal">
                Chunk 7, page 2
              </Identifier>
              <Identifier x={narrow ? 190 : 434} y={narrow ? 622 : 398}>
                confidence 0.87
              </Identifier>
              <Caption x={narrow ? 190 : 434} y={narrow ? 640 : 414}>
                example from the README
              </Caption>
            </>
          ) : null}
        </g>
      ) : null}
    </g>
  );
}

export default function RagScreen({ systemSummary }: { systemSummary: string }) {
  return (
    <ScenarioScreen
      title={TITLE}
      systemSummary={systemSummary}
      scene={scene}
      scenarios={scenarios}
      autoplay="ingest"
      overlay={overlay}
    />
  );
}
