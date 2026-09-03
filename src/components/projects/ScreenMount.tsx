"use client";

import dynamic from "next/dynamic";
import type { ScreenId } from "@/content/projects";

/**
 * R13.3, design §12 — each screen is its own chunk, pulled in as its section
 * approaches. `ssr: true` keeps the first frame in the static export so the
 * diagram is visible before hydration and with JavaScript off.
 */
const screens = {
  "order-saga": dynamic(() => import("../screens/order-saga/OrderSagaScreen")),
  rag: dynamic(() => import("../screens/rag-document-qa/RagScreen")),
  agents: dynamic(() => import("../screens/tech-news-agent/AgentsScreen")),
  stomp: dynamic(() => import("../screens/emergency-alert-system/StompScreen")),
  detection: dynamic(() => import("../screens/con-detection/DetectionScreen")),
} as const;

export function ScreenMount({
  screen,
  systemSummary,
}: {
  screen: ScreenId;
  systemSummary: string;
}) {
  const Component = screens[screen];
  return <Component systemSummary={systemSummary} />;
}
