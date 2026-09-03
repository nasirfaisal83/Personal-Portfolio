# README trace

Task 2.6 (R4.2, R4.9). One line per element that appears inside a screen, and
the README section it comes from. Anything not listed here should not be on
screen; anything on screen that is not documented is marked **illustrative** in
the UI as well as here.

Reviewer sign-off: _pending_ — see task 5.2.

---

## Order-Saga — `src/components/screens/order-saga/`

| Element | Source in the README |
|---|---|
| Gateway, Order, Inventory, Payment, Shipping, Notification | Services list |
| Ports 8080–8085 as node subtitles | Services list |
| `kafka` bus | Architecture: services coordinate purely through Kafka events |
| `eureka` registry marker and its dashed edges | Spring Cloud Eureka in the stack; Eureka dashboard under observability |
| `mock payment` stub and the `payment gateway` call | Key Design: OpenFeign clients call mock payment, shipping and email providers |
| `POST /api/orders` | API entry through the gateway |
| `order.created`, `inventory.reserved`, `inventory.failed`, `payment.succeeded`, `payment.failed`, `shipment.created` | Kafka Topics |
| `PENDING`, `INVENTORY_RESERVED`, `PAYMENT_PROCESSING`, `COMPLETED`, `FAILED`, `COMPENSATING` | Order Status Lifecycle |
| `processed N` counters | Key Design: idempotent consumers record processed event IDs in a ProcessedEvent table |
| `stock reserved` / `stock released` | Key Design: a payment failure releases reserved stock |

Nothing else is drawn. No throughput, latency or volume figures appear, because
the README states none.

## rag-document-qa — `src/components/screens/rag-document-qa/`

| Element | Source in the README |
|---|---|
| upload → Document → extract → chunk → embed → store lane | Ingestion pipeline |
| `202 Accepted`, `PROCESSING`, `READY`, `FAILED` | Key Design: asynchronous ingestion and polled status |
| `PDFBox`, `Tesseract`, `GPT-4o Vision` pills, in that order | Key Design: PDF three-strategy waterfall |
| `last resort` caption on GPT-4o Vision | Key Design: GPT-4o Vision as the last resort |
| `< min text` on the fall-through | Key Design: PDFBox digital text, then Tesseract when it is too short |
| `500 tokens, 50 overlap` | Key Design: token-aware chunking with JTokkit |
| `text-embedding-3-small, 1536 dimensions` | Stack |
| `PostgreSQL + pgvector`, `ivfflat` | Key Design: IVFFlat index (100 lists) |
| `top-k 5` and the five highlighted dots | Key Design: top-k 5 by default |
| `What are the payment terms?` | README example question |
| `event: token`, `event: sources` | Key Design: Server-Sent Events |
| `Chunk 12, page 4`, `Chunk 7, page 2`, `confidence 0.87` | README example response — labelled "example from the README" on screen |

## tech-news-agent — `src/components/screens/tech-news-agent/`

| Element | Source in the README |
|---|---|
| `OrchestratorAgent` and the `reason → act → observe` ring | Key Design: the orchestrator runs a ReAct loop |
| `ScoutAgent`, `ReporterAgent`, `EditorAgent`, `FactCheckerAgent`, `LinkedInWriterAgent` | Agents list |
| `Tavily`, `GitHub MCP` tools | Key Design: Tavily web search and GitHub data through the GitHub MCP server |
| Gauge threshold tick at `0.6` | Key Design: retry when fact-check confidence falls below 0.6 |
| Passing confidence `0.83`, `facts 6`, `~63 s` | README example response |
| `[HIGH]`, `[MEDIUM]`, `[UNVERIFIED]` | README example response |
| `retry decided by the model, not by hardcoded Java` | Key Design, quoted |
| First-pass confidence `0.52` | **Illustrative.** Not documented; the README gives only the threshold and the passing score. Captioned "illustrative failing score" on screen and called out in the narration. |

## Emergency-Alert-System — `src/components/screens/emergency-alert-system/`

| Element | Source in the README |
|---|---|
| `StompServer`, three clients, client C marked `C++` | Architecture: Java server and a C++11 command-line client |
| `tpc` / `reactor` mode switch and the two internals | Key Design: thread-per-client and a non-blocking NIO selector with an actor thread pool |
| `CONNECT`, `CONNECTED`, `SUBSCRIBE`, `SEND`, `MESSAGE`, `RECEIPT` | Supported frames |
| `UNSUBSCRIBE`, `DISCONNECT`, `ERROR` | Supported frames — listed in the text alternative only, since no scenario sends them |
| `germany` channel | README example |
| `Fire in Berlin` event | README example — labelled "example from the README" on screen |

## con-Detection — `src/components/screens/con-detection/`

| Element | Source in the README |
|---|---|
| `video → frame → YOLOv5 → boxes` pipeline strip | Processes video frame-by-frame with YOLOv5 |
| Bounding boxes labelled `cone` | Draws bounding boxes around detected cones |
| Frame counter `frame 0400`–`frame 0423` | Frame-by-frame processing |
| Caption: "Illustration of the detection loop; the notebook runs the real model." | The repository is a Colab notebook; the road scene is stylised vector art, not footage |

No confidence values appear anywhere on this screen (R4.27): the README
documents none.

## Hero map — `src/components/hero/heroMap.ts`

The ambient packets carry one true fragment of each system: `order.created`
(Order-Saga topics), `event: token` (rag-document-qa SSE), `ScoutAgent`
(tech-news-agent agents), `MESSAGE` (Emergency-Alert-System frames) and
`frame 0412` (con-Detection frame-by-frame processing).
