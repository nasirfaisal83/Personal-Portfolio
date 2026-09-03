/** Emergency-Alert-System scenarios — design §7.4. Frame names are the README's. */
import type { Scenario } from "../engine/types";
import { CHANNEL, EVENT, OTHER_FRAMES } from "./scene";

export const scenarios: Scenario[] = [
  {
    id: "connect",
    label: "Connect clients",
    steps: [
      { t: 0, kind: "packet", edge: "a-server", label: "CONNECT", duration: 700 },
      { t: 700, kind: "pulse", node: "server" },
      { t: 800, kind: "packet", edge: "server-a", label: "CONNECTED", duration: 700 },
      { t: 1500, kind: "set", target: "connected.A", value: true },
      { t: 1600, kind: "packet", edge: "b-server", label: "CONNECT", duration: 700 },
      { t: 2400, kind: "packet", edge: "server-b", label: "CONNECTED", duration: 700 },
      { t: 3100, kind: "set", target: "connected.B", value: true },
      { t: 3200, kind: "packet", edge: "c-server", label: "CONNECT", duration: 700 },
      { t: 4000, kind: "packet", edge: "server-c", label: "CONNECTED", duration: 700 },
      { t: 4700, kind: "set", target: "connected.C", value: true },
      { t: 4900, kind: "packet", edge: "a-server", label: `SUBSCRIBE ${CHANNEL}`, duration: 700 },
      { t: 4900, kind: "packet", edge: "b-server", label: `SUBSCRIBE ${CHANNEL}`, duration: 700 },
      { t: 5600, kind: "set", target: "subscribed.A", value: true },
      { t: 5600, kind: "set", target: "subscribed.B", value: true },
      { t: 5700, kind: "packet", edge: "server-a", label: "RECEIPT", duration: 700 },
      { t: 5700, kind: "packet", edge: "server-b", label: "RECEIPT", duration: 700 },
      {
        t: 6400,
        kind: "say",
        text: `Three clients connected; A and B subscribed to ${CHANNEL}`,
      },
    ],
    narration: [
      "Client A sends CONNECT and the server answers CONNECTED.",
      "Clients B and C connect the same way.",
      `A and B send SUBSCRIBE for the ${CHANNEL} channel.`,
      "The server answers each subscription with a RECEIPT.",
      `The protocol also carries ${OTHER_FRAMES.join(", ")}, which these scenarios do not exercise.`,
    ],
  },
  {
    id: "broadcast",
    label: "Broadcast an alert",
    steps: [
      { t: 0, kind: "set", target: "connected.A", value: true },
      { t: 0, kind: "set", target: "connected.B", value: true },
      { t: 0, kind: "set", target: "connected.C", value: true },
      { t: 0, kind: "set", target: "subscribed.A", value: true },
      { t: 0, kind: "set", target: "subscribed.B", value: true },
      { t: 200, kind: "set", target: "event", value: EVENT },
      { t: 200, kind: "packet", edge: "c-server", label: "SEND", duration: 800 },
      { t: 1000, kind: "pulse", node: "server" },
      { t: 1200, kind: "packet", edge: "server-a", label: "MESSAGE", duration: 800 },
      { t: 1200, kind: "packet", edge: "server-b", label: "MESSAGE", duration: 800 },
      { t: 1200, kind: "packet", edge: "server-c", label: "RECEIPT", duration: 800 },
      { t: 2000, kind: "set", target: "delivered.A", value: true },
      { t: 2000, kind: "set", target: "delivered.B", value: true },
      { t: 2000, kind: "set", target: "receipt.C", value: true },
      {
        t: 2000,
        kind: "say",
        text: `C published to ${CHANNEL}; A and B received MESSAGE; C received RECEIPT`,
      },
    ],
    narration: [
      `Client C sends the event “${EVENT}” to the ${CHANNEL} channel with a SEND frame.`,
      "The server fans the event out as MESSAGE frames to the channel's subscribers, A and B.",
      "C is not subscribed to the channel, so it receives only a RECEIPT and no MESSAGE.",
    ],
  },
];
