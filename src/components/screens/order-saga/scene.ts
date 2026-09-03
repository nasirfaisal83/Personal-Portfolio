/**
 * Order-Saga scene — design §7.1.
 * Every node, port, topic and state below is named in the repository README
 * (services and ports from "Services"; topics from "Kafka Topics"; the status
 * enum from "Order Status Lifecycle"; Eureka and the mock providers from
 * "Key Design"). See docs/readme-trace.md.
 */
import type { Scene } from "../engine/types";

export const STATUS_TIMELINE = [
  "PENDING",
  "INVENTORY_RESERVED",
  "PAYMENT_PROCESSING",
  "COMPLETED",
] as const;

export const SIDE_STATES = ["FAILED", "COMPENSATING"] as const;

export const SERVICE_IDS = [
  "gateway",
  "order",
  "inventory",
  "payment",
  "shipping",
  "notification",
] as const;

export const scene: Scene = {
  viewBox: [720, 400],
  nodes: [
    { id: "gateway", label: "Gateway", sub: "8080", x: 24, y: 44, w: 126, h: 40, kind: "client" },
    { id: "order", label: "Order", sub: "8081", x: 230, y: 44, w: 126, h: 40, kind: "service" },
    {
      id: "inventory",
      label: "Inventory",
      sub: "8082",
      x: 436,
      y: 44,
      w: 126,
      h: 40,
      kind: "service",
    },
    { id: "eureka", label: "eureka", x: 596, y: 44, w: 100, h: 30, kind: "registry" },
    {
      id: "kafka",
      label: "kafka",
      x: 24,
      y: 150,
      w: 672,
      h: 20,
      kind: "bus",
      orientation: "horizontal",
    },
    { id: "payment", label: "Payment", sub: "8083", x: 24, y: 222, w: 126, h: 40, kind: "service" },
    {
      id: "shipping",
      label: "Shipping",
      sub: "8084",
      x: 230,
      y: 222,
      w: 126,
      h: 40,
      kind: "service",
    },
    {
      id: "notification",
      label: "Notification",
      sub: "8085",
      x: 436,
      y: 222,
      w: 126,
      h: 40,
      kind: "service",
    },
    { id: "mockpay", label: "mock payment", x: 24, y: 296, w: 126, h: 30, kind: "tool" },
  ],
  edges: [
    { id: "gw-order", from: "gateway", to: "order" },
    { id: "order-inv", from: "order", to: "inventory", via: "kafka" },
    { id: "inv-order", from: "inventory", to: "order", via: "kafka" },
    { id: "inv-pay", from: "inventory", to: "payment", via: "kafka" },
    { id: "inv-notif", from: "inventory", to: "notification", via: "kafka" },
    { id: "pay-out", from: "payment", to: "mockpay" },
    { id: "pay-back", from: "mockpay", to: "payment" },
    { id: "pay-order", from: "payment", to: "order", via: "kafka" },
    { id: "pay-ship", from: "payment", to: "shipping", via: "kafka" },
    { id: "pay-inv", from: "payment", to: "inventory", via: "kafka" },
    { id: "pay-notif", from: "payment", to: "notification", via: "kafka" },
    { id: "ship-order", from: "shipping", to: "order", via: "kafka" },
    { id: "ship-notif", from: "shipping", to: "notification", via: "kafka" },
    { id: "eureka-gateway", from: "eureka", to: "gateway", dashed: true },
    { id: "eureka-order", from: "eureka", to: "order", dashed: true },
    { id: "eureka-inventory", from: "eureka", to: "inventory", dashed: true },
    { id: "eureka-payment", from: "eureka", to: "payment", dashed: true },
    { id: "eureka-shipping", from: "eureka", to: "shipping", dashed: true },
    { id: "eureka-notification", from: "eureka", to: "notification", dashed: true },
  ],
  narrow: {
    viewBox: [360, 560],
    nodes: [
      { id: "gateway", label: "Gateway", sub: "8080", x: 8, y: 40, w: 132, h: 38, kind: "client" },
      { id: "order", label: "Order", sub: "8081", x: 8, y: 128, w: 132, h: 38, kind: "service" },
      {
        id: "inventory",
        label: "Inventory",
        sub: "8082",
        x: 8,
        y: 226,
        w: 132,
        h: 38,
        kind: "service",
      },
      { id: "mockpay", label: "mock payment", x: 8, y: 316, w: 132, h: 28, kind: "tool" },
      { id: "eureka", label: "eureka", x: 8, y: 372, w: 132, h: 28, kind: "registry" },
      {
        id: "kafka",
        label: "kafka",
        x: 166,
        y: 40,
        w: 20,
        h: 380,
        kind: "bus",
        orientation: "vertical",
      },
      {
        id: "payment",
        label: "Payment",
        sub: "8083",
        x: 212,
        y: 40,
        w: 132,
        h: 38,
        kind: "service",
      },
      {
        id: "shipping",
        label: "Shipping",
        sub: "8084",
        x: 212,
        y: 150,
        w: 132,
        h: 38,
        kind: "service",
      },
      {
        id: "notification",
        label: "Notification",
        sub: "8085",
        x: 212,
        y: 260,
        w: 132,
        h: 38,
        kind: "service",
      },
    ],
  },
};
