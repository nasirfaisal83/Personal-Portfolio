// Case-study pages at /projects/<slug>, restored from the old Next.js site
// (src/content/projects.ts before the redesign). The keys are the URL slugs that
// `featured` and `projects` in portfolio-data.ts link to. A project without
// `github` is a private client project.

export interface CaseStudy {
  title: string;
  kind: string;
  github?: string;
  tags: string[];
  summary: string;
  howItWorks: string[];
  highlights: string[];
  stackTable: { layer: string; tech: string }[];
}

export const caseStudies: Record<string, CaseStudy> = {
  salon: {
    title: "Salon Appointment System",
    kind: "Private client project · In production",
    tags: [
      "Spring Boot",
      "Java",
      "PostgreSQL",
      "Flyway",
      "Next.js",
      "React 19",
      "TypeScript",
      "Cloudflare R2",
      "JUnit 5",
      "Docker",
    ],
    summary:
      "A full-stack appointment booking and salon-management system, built for a real client and running in production. Customers book without creating an account — they select services, a stylist and a time, then verify ownership of their phone number with a one-time code. Every booking arrives as a request; the assigned stylist approves or declines it from a dashboard. The system handles all messaging around that lifecycle: confirmations, declines, scheduled reminders, and a cryptographically signed link that lets a customer cancel or reschedule without ever logging in.",
    howItWorks: [
      "A booking is a request, not an instant confirmation: the assigned stylist keeps the right to decline, so confirmation is a human decision. That one product rule gives the appointment a state machine of seven states — REQUESTED, CONFIRMED, DECLINED, EXPIRED, CANCELLED, COMPLETED and NO_SHOW — where every transition is a conditional UPDATE ... WHERE status = ?, so when two actors race, the one that affects zero rows gets a clean 409.",
      "A customer picks services, a stylist and a date, and availability is computed on demand as working hours minus time off minus busy appointments; there is no slot table. They verify their phone with a one-time code, and POST /booking reads the phone from the verified cookie only, takes an advisory lock on salon and phone, applies the open-request cap, resolves the least-loaded qualifying stylist, snapshots duration and price, and inserts the request. The assigned stylist is notified and approves or declines from the dashboard.",
      "Application-side availability checks are advisory only. The guarantee is a GiST exclusion constraint in PostgreSQL that physically cannot admit two overlapping active appointments for one stylist, pending and confirmed alike. When two customers tap the same slot, both pass the check, one insert commits, and the other fails with SQLSTATE 23P01, translated narrowly into 409 SLOT_CONFLICT.",
      "A reschedule never moves the appointment: it inserts a new REQUESTED row pointing at the original, which stays CONFIRMED and keeps its slot and its reminders. Approving the replacement cancels the original silently. If nobody approves, the expiry worker, running every 60 seconds, expires the request without messaging anyone, and the original booking stands.",
    ],
    highlights: [
      "The database is the arbiter: a GiST exclusion constraint over (staff_id, time range), partial on active statuses, cannot admit two overlapping appointments; application checks only produce good error messages.",
      "One product decision — every booking is a request a stylist may decline — shapes a seven-state machine, an expiry worker, a notification for every state change, and the reschedule flow.",
      "Rescheduling inserts a replacement request that points at the original, so the original holds its slot until the replacement is approved; a customer can never end up with no appointment.",
      "Notifications carry a template identifier plus ordered parameters, never rendered strings — built for WhatsApp Business templates, and proven when an SMS vendor migration left the provider class untouched.",
      "Customer photos are identified by their magic bytes and re-encoded to WebP, which strips EXIF location data as a side effect rather than as a step that can be skipped.",
      "A startup guard refuses to boot when customer links would still point at localhost, turning a silent, customer-visible outage into a deploy that does not go live.",
      "12,224 lines of tests against 11,610 lines of production code — 384 test methods across 48 classes — with integration tests that race two real threads against a real PostgreSQL 16.",
    ],
    stackTable: [
      {
        layer: "Backend",
        tech: "Spring Boot 4.1, Java 21, Spring Web MVC, Spring Data JPA, Spring Security, Bean Validation",
      },
      {
        layer: "Database",
        tech: "PostgreSQL 16 with the btree_gist extension; schema owned by Flyway",
      },
      {
        layer: "Authentication",
        tech: "Stateless HMAC-signed JWTs in httpOnly cookies — no password storage anywhere",
      },
      {
        layer: "Frontend",
        tech: "Next.js 16 (App Router), React 19, TypeScript, next-intl",
      },
      {
        layer: "Media pipeline",
        tech: "Cloudflare R2 (S3 API), Thumbnailator, WebP ImageIO",
      },
      {
        layer: "Messaging",
        tech: "SMS gateway behind a provider abstraction, with a logging stub for local development",
      },
      {
        layer: "Testing",
        tech: "JUnit 5, Mockito, AssertJ, Testcontainers",
      },
      {
        layer: "Delivery",
        tech: "Docker multi-stage builds for both services, Docker Compose, GitHub Actions CI",
      },
    ],
  },
  "order-saga": {
    title: "Order-Saga",
    kind: "Distributed systems",
    github: "https://github.com/nasirfaisal83/Order-Saga",
    tags: ["Spring Boot 3.4", "Kafka", "PostgreSQL", "Spring Cloud", "Docker"],
    summary:
      "Order-processing system across 5 microservices (order, inventory, payment, shipping, notification) using the Choreography Saga pattern — no central orchestrator, services coordinate purely through Kafka events, with automatic compensation logic if a step fails (e.g. releasing reserved stock on payment failure). Spring Boot 3.4.3, Java 17, Kafka, PostgreSQL, Spring Cloud (Eureka, Gateway, OpenFeign), Docker Compose.",
    howItWorks: [
      "A request enters through Spring Cloud Gateway and reaches the order service, which writes the order and publishes its own event. From that point nothing coordinates the flow centrally: each service reacts to an event and publishes its own result event.",
      "Inventory reserves stock and publishes the outcome. Payment reacts to the reservation, calls a mock payment provider through OpenFeign, and publishes success or failure. Shipping reacts to a successful payment, and notification reacts to whatever the saga ends on.",
      "When a step fails, the compensation path runs on the same event bus. A payment failure releases the reserved stock and fails the order; an inventory failure fails the order and notifies. The order's status chip moves through PENDING, INVENTORY_RESERVED, PAYMENT_PROCESSING, COMPLETED, FAILED, and COMPENSATING.",
      "Because Kafka delivers at least once, every service records processed event IDs in a ProcessedEvent table and ignores repeats, and the Product entity uses an @Version field so two concurrent reservations cannot double-book the same stock.",
    ],
    highlights: [
      "Choreography, not orchestration: each service reacts to events and publishes its own result event; nothing coordinates centrally.",
      "Idempotent consumers: every service records processed event IDs in a ProcessedEvent table to tolerate Kafka's at-least-once delivery.",
      "Optimistic locking with @Version on the Product entity prevents double-booking inventory under concurrency.",
      "Compensation: a payment failure automatically releases reserved stock and fails the order; an inventory failure fails the order and notifies.",
      "One PostgreSQL database per service; OpenFeign clients call mock payment, shipping, and email providers that can be switched to fail for testing.",
      "Observability through the Eureka dashboard and Kafka UI; order status lifecycle PENDING, INVENTORY_RESERVED, PAYMENT_PROCESSING, COMPLETED, FAILED, COMPENSATING.",
    ],
    stackTable: [
      {
        layer: "Language",
        tech: "Java 17",
      },
      {
        layer: "Framework",
        tech: "Spring Boot 3.4.3, Spring Data JPA",
      },
      {
        layer: "Service discovery",
        tech: "Spring Cloud Eureka, Spring Cloud 2024.0.1",
      },
      {
        layer: "Edge",
        tech: "Spring Cloud Gateway",
      },
      {
        layer: "Service-to-service",
        tech: "Spring Cloud OpenFeign",
      },
      {
        layer: "Messaging",
        tech: "Apache Kafka 7.5.0, Zookeeper, Kafka UI",
      },
      {
        layer: "Storage",
        tech: "PostgreSQL 15 (one per service)",
      },
      {
        layer: "Build and run",
        tech: "Maven, Docker, Docker Compose",
      },
    ],
  },
  "rag-document-qa": {
    title: "rag-document-qa",
    kind: "AI · Retrieval",
    github: "https://github.com/nasirfaisal83/rag-document-qa",
    tags: ["Spring AI", "GPT-4o", "pgvector", "WebFlux", "Java 21"],
    summary:
      "Full-stack RAG (Retrieval-Augmented Generation) application: upload documents, ask natural-language questions, get streamed answers grounded in the source text. Spring Boot 3.3 + Spring AI 1.0, OpenAI GPT-4o, PostgreSQL + pgvector for vector search, with a 3-strategy PDF extraction pipeline (PDFBox → Tesseract OCR → GPT-4o Vision) and SSE token streaming with source citations.",
    howItWorks: [
      "An upload returns 202 Accepted with a document ID straight away and the work continues in the background, so the frontend polls the document's status through PROCESSING, READY, and FAILED.",
      "Extraction goes through a DocumentHandler per file type. For PDFs the handler runs a three-strategy waterfall per page: PDFBox digital text first, Tesseract OCR when that comes back too short, and GPT-4o Vision as the last resort, so no page is silently skipped.",
      "The extracted text is chunked with JTokkit against OpenAI's CL100K_BASE tokenizer into 500-token chunks with 50 tokens of overlap, embedded with text-embedding-3-small, and stored in pgvector behind an IVFFlat index of 100 lists.",
      "A question is embedded the same way and matched by cosine similarity in native SQL, top-k 5 by default. The retrieved chunks go into the prompt, and the answer comes back over Server-Sent Events on a Flux<ServerSentEvent> so each token is flushed past Tomcat's 8 KB buffer and reaches the browser immediately, followed by the source citations.",
    ],
    highlights: [
      "Asynchronous ingestion: the upload returns 202 Accepted with a document ID at once and the frontend polls status (PROCESSING, READY, FAILED).",
      "Strategy pattern for extraction: one handler per file type behind a DocumentHandler interface; PDF, DOCX, PPTX, XLSX, text, and images.",
      "PDF three-strategy waterfall per page: PDFBox digital text, then Tesseract OCR, then GPT-4o Vision as the last resort, so no page is silently skipped.",
      "Token-aware chunking with JTokkit using OpenAI's CL100K_BASE tokenizer: 500-token chunks with 50-token overlap.",
      "Native SQL for cosine similarity search on pgvector with an IVFFlat index (100 lists); top-k 5 by default.",
      "Server-Sent Events over a Flux<ServerSentEvent> so each token is flushed past Tomcat's 8 KB buffer and reaches the browser immediately.",
      "Cross-document search implemented purely in SQL, with no schema change; confidence is the average cosine similarity of the retrieved chunks.",
    ],
    stackTable: [
      {
        layer: "Language",
        tech: "Java 21",
      },
      {
        layer: "Framework",
        tech: "Spring Boot 3.3, Spring MVC, Spring AI 1.0",
      },
      {
        layer: "Models",
        tech: "OpenAI GPT-4o, text-embedding-3-small (1536 dimensions)",
      },
      {
        layer: "Vector store",
        tech: "PostgreSQL 16 with pgvector",
      },
      {
        layer: "Persistence",
        tech: "Spring Data JPA (Hibernate), Flyway",
      },
      {
        layer: "Streaming",
        tech: "Project Reactor, Spring WebFlux",
      },
      {
        layer: "Extraction",
        tech: "Apache PDFBox, Tesseract via Tess4J, GPT-4o Vision, Apache POI",
      },
      {
        layer: "Tokenization",
        tech: "JTokkit",
      },
      {
        layer: "API and tooling",
        tech: "SpringDoc OpenAPI, Lombok",
      },
      {
        layer: "Frontend",
        tech: "Vanilla HTML/CSS/JS",
      },
      {
        layer: "Build and run",
        tech: "Docker Compose",
      },
    ],
  },
  "tech-news-agent": {
    title: "tech-news-agent",
    kind: "AI · Multi-agent",
    github: "https://github.com/nasirfaisal83/tech-news-agent",
    tags: ["Spring AI", "gpt-4o-mini", "Tavily", "GitHub MCP", "Java 21"],
    summary:
      "Multi-agent pipeline that turns a tech topic into a fact-checked, LinkedIn-ready post: an OrchestratorAgent runs a ReAct loop coordinating five specialized agents (Scout, Reporter, Editor, FactChecker, LinkedInWriter), with an automatic retry if the fact-check confidence score is too low. Spring Boot, Spring AI, OpenAI GPT-4o-mini, Tavily Search API, GitHub MCP Server, Java 21.",
    howItWorks: [
      "One POST to /api/news/generate starts the run. The OrchestratorAgent does not follow a fixed script: it runs a ReAct loop, reasoning about the state, calling a tool or an agent, observing the result, and deciding the next step.",
      "ScoutAgent gathers material through Tavily web search, a page-fetch tool, and GitHub data served over the GitHub MCP server. ReporterAgent extracts the facts, EditorAgent shapes them, and FactCheckerAgent scores the result.",
      "If the fact-check confidence falls below 0.6, facts are re-extracted and the loop runs again. That decision belongs to the model — nothing in the Java hardcodes it. A ContextSizeAdvisor guards against token overflow, and each agent keeps its own system prompt under resources/prompts.",
      "LinkedInWriterAgent produces the final post. The response carries the post, a verified article marked up with [HIGH], [MEDIUM], and [UNVERIFIED], the overall confidence, the fact counts, and the processing time; a run takes 30–90 seconds.",
    ],
    highlights: [
      "The orchestrator runs a ReAct loop: it reasons, calls tools, observes results, and decides the next step.",
      "The retry is decided by the model: if fact-check confidence falls below 0.6, facts are re-extracted; nothing in Java hardcodes the loop.",
      "Tools: Tavily web search, a page-fetch tool, and GitHub data through the GitHub MCP server.",
      "A ContextSizeAdvisor guards against token overflow; each agent has its own system prompt under resources/prompts.",
      "One POST /api/news/generate call returns the post, a verified article with [HIGH], [MEDIUM], and [UNVERIFIED] markers, overall confidence, fact counts, and processing time; a run takes 30–90 seconds.",
    ],
    stackTable: [
      {
        layer: "Language",
        tech: "Java 21",
      },
      {
        layer: "Framework",
        tech: "Spring Boot 3.5.0, Spring AI 1.0.0",
      },
      {
        layer: "Model",
        tech: "OpenAI gpt-4o-mini",
      },
      {
        layer: "Tools",
        tech: "Tavily Search API, GitHub MCP Server v0.6.2",
      },
      {
        layer: "HTTP client",
        tech: "Spring WebFlux (WebClient)",
      },
      {
        layer: "Build",
        tech: "Maven",
      },
    ],
  },
  "emergency-alert-system": {
    title: "Emergency-Alert-System",
    kind: "Networking · Concurrency",
    github: "https://github.com/nasirfaisal83/Emergency-Alert-System",
    tags: ["Java", "STOMP", "Java NIO", "C++11", "Boost ASIO"],
    summary:
      "Distributed publish-subscribe alert broadcasting system built on the STOMP protocol: a Java 8 server (switchable between a thread-per-client model and a non-blocking reactor/NIO model) paired with a C++11 command-line client (Boost ASIO) for real-time channel subscription and event broadcast.",
    howItWorks: [
      "The server speaks STOMP over TCP. Clients send CONNECT, SUBSCRIBE, UNSUBSCRIBE, SEND, and DISCONNECT; the server answers with CONNECTED, MESSAGE, RECEIPT, and ERROR.",
      "The same protocol logic runs under two selectable threading models. Thread-per-client gives every connection its own OS thread. Reactor mode runs a single non-blocking NIO selector that hands work to an actor thread pool.",
      "Channels are the unit of subscription. When one client sends an event to a channel, every other client subscribed to that channel receives a MESSAGE frame for it; the sender gets a RECEIPT.",
      "The C++11 client is a command-line program built on Boost ASIO. It offers login, join, exit, report, summary, and logout, and reads the events it publishes from a JSON file.",
    ],
    highlights: [
      "Two selectable server threading models: thread-per-client (one OS thread per connection) and reactor (a non-blocking NIO selector with an actor thread pool).",
      "Supported frames: CONNECT, SUBSCRIBE, UNSUBSCRIBE, SEND, DISCONNECT from clients; CONNECTED, MESSAGE, RECEIPT, ERROR from the server.",
      "The C++ client offers login, join, exit, report, summary, and logout commands, and reads events to publish from a JSON file.",
      "Subscribers on a channel receive MESSAGE frames for events other clients send to it.",
    ],
    stackTable: [
      {
        layer: "Server language",
        tech: "Java 8",
      },
      {
        layer: "Protocol",
        tech: "STOMP",
      },
      {
        layer: "Concurrency",
        tech: "Thread-per-client; Java NIO selector (reactor mode)",
      },
      {
        layer: "Client language",
        tech: "C++11",
      },
      {
        layer: "Client libraries",
        tech: "Boost ASIO, Boost Thread",
      },
      {
        layer: "Build",
        tech: "Maven (server), Make (client)",
      },
    ],
  },
};

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return Object.hasOwn(caseStudies, slug) ? caseStudies[slug] : undefined;
}
