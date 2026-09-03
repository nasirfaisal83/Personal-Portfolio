// Locked to PRD v2 §5.4 and the five repository READMEs (R4.1, R15.5).
// `summary` and `stack` are quoted verbatim. `highlights` are the READMEs'
// "Key Design" points. `howItWorks` only recombines those same statements —
// it introduces no fact that is not already above it in this file.

export type ScreenId = "order-saga" | "rag" | "agents" | "stomp" | "detection";

export interface StackRow {
  layer: string;
  tech: string;
}

export interface Project {
  slug: string;
  title: string;
  github: string;
  screen: ScreenId;
  /** One sentence used as the screen's accessible name (design §6.5). */
  systemSummary: string;
  summary: string;
  stack: string[];
  stackTable: StackRow[];
  howItWorks: string[];
  highlights: string[];
}

export const projects: Project[] = [
  {
    slug: "order-saga",
    title: "Order-Saga",
    screen: "order-saga",
    github: "https://github.com/nasirfaisal83/Order-Saga",
    systemSummary:
      "five Spring Boot services coordinating an order through Kafka events, with compensation when a step fails",
    summary:
      "Order-processing system across 5 microservices (order, inventory, payment, shipping, notification) using the Choreography Saga pattern — no central orchestrator, services coordinate purely through Kafka events, with automatic compensation logic if a step fails (e.g. releasing reserved stock on payment failure). Spring Boot 3.4.3, Java 17, Kafka, PostgreSQL, Spring Cloud (Eureka, Gateway, OpenFeign), Docker Compose.",
    stack: [
      "Spring Boot 3.4.3",
      "Java 17",
      "Apache Kafka 7.5.0",
      "PostgreSQL 15 (one per service)",
      "Spring Cloud Eureka",
      "Spring Cloud Gateway",
      "Spring Cloud OpenFeign",
      "Spring Cloud 2024.0.1",
      "Spring Data JPA",
      "Maven",
      "Docker",
      "Docker Compose",
      "Kafka UI",
      "Zookeeper",
    ],
    stackTable: [
      { layer: "Language", tech: "Java 17" },
      { layer: "Framework", tech: "Spring Boot 3.4.3, Spring Data JPA" },
      { layer: "Service discovery", tech: "Spring Cloud Eureka, Spring Cloud 2024.0.1" },
      { layer: "Edge", tech: "Spring Cloud Gateway" },
      { layer: "Service-to-service", tech: "Spring Cloud OpenFeign" },
      { layer: "Messaging", tech: "Apache Kafka 7.5.0, Zookeeper, Kafka UI" },
      { layer: "Storage", tech: "PostgreSQL 15 (one per service)" },
      { layer: "Build and run", tech: "Maven, Docker, Docker Compose" },
    ],
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
  },
  {
    slug: "rag-document-qa",
    title: "rag-document-qa",
    screen: "rag",
    github: "https://github.com/nasirfaisal83/rag-document-qa",
    systemSummary:
      "a document ingestion pipeline and a question-answering flow grounded in retrieved chunks",
    summary:
      "Full-stack RAG (Retrieval-Augmented Generation) application: upload documents, ask natural-language questions, get streamed answers grounded in the source text. Spring Boot 3.3 + Spring AI 1.0, OpenAI GPT-4o, PostgreSQL + pgvector for vector search, with a 3-strategy PDF extraction pipeline (PDFBox → Tesseract OCR → GPT-4o Vision) and SSE token streaming with source citations.",
    stack: [
      "Spring Boot 3.3",
      "Spring MVC",
      "Spring AI 1.0",
      "OpenAI GPT-4o",
      "text-embedding-3-small (1536 dimensions)",
      "PostgreSQL 16",
      "pgvector",
      "Spring Data JPA (Hibernate)",
      "Flyway",
      "Project Reactor",
      "Spring WebFlux",
      "Apache PDFBox",
      "Tesseract via Tess4J",
      "GPT-4o Vision",
      "Apache POI",
      "JTokkit",
      "Lombok",
      "SpringDoc OpenAPI",
      "Vanilla HTML/CSS/JS",
      "Docker Compose",
      "Java 21",
    ],
    stackTable: [
      { layer: "Language", tech: "Java 21" },
      { layer: "Framework", tech: "Spring Boot 3.3, Spring MVC, Spring AI 1.0" },
      { layer: "Models", tech: "OpenAI GPT-4o, text-embedding-3-small (1536 dimensions)" },
      { layer: "Vector store", tech: "PostgreSQL 16 with pgvector" },
      { layer: "Persistence", tech: "Spring Data JPA (Hibernate), Flyway" },
      { layer: "Streaming", tech: "Project Reactor, Spring WebFlux" },
      {
        layer: "Extraction",
        tech: "Apache PDFBox, Tesseract via Tess4J, GPT-4o Vision, Apache POI",
      },
      { layer: "Tokenization", tech: "JTokkit" },
      { layer: "API and tooling", tech: "SpringDoc OpenAPI, Lombok" },
      { layer: "Frontend", tech: "Vanilla HTML/CSS/JS" },
      { layer: "Build and run", tech: "Docker Compose" },
    ],
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
  },
  {
    slug: "tech-news-agent",
    title: "tech-news-agent",
    screen: "agents",
    github: "https://github.com/nasirfaisal83/tech-news-agent",
    systemSummary:
      "an orchestrator running a ReAct loop over five specialist agents and two tools, with a fact-check retry",
    summary:
      "Multi-agent pipeline that turns a tech topic into a fact-checked, LinkedIn-ready post: an OrchestratorAgent runs a ReAct loop coordinating five specialized agents (Scout, Reporter, Editor, FactChecker, LinkedInWriter), with an automatic retry if the fact-check confidence score is too low. Spring Boot, Spring AI, OpenAI GPT-4o-mini, Tavily Search API, GitHub MCP Server, Java 21.",
    stack: [
      "Spring Boot 3.5.0",
      "Spring AI 1.0.0",
      "OpenAI gpt-4o-mini",
      "Tavily Search API",
      "GitHub MCP Server v0.6.2",
      "Spring WebFlux (WebClient)",
      "Java 21",
      "Maven",
    ],
    stackTable: [
      { layer: "Language", tech: "Java 21" },
      { layer: "Framework", tech: "Spring Boot 3.5.0, Spring AI 1.0.0" },
      { layer: "Model", tech: "OpenAI gpt-4o-mini" },
      { layer: "Tools", tech: "Tavily Search API, GitHub MCP Server v0.6.2" },
      { layer: "HTTP client", tech: "Spring WebFlux (WebClient)" },
      { layer: "Build", tech: "Maven" },
    ],
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
  },
  {
    slug: "emergency-alert-system",
    title: "Emergency-Alert-System",
    screen: "stomp",
    github: "https://github.com/nasirfaisal83/Emergency-Alert-System",
    systemSummary:
      "a STOMP server in two threading models broadcasting channel events to subscribed clients",
    summary:
      "Distributed publish-subscribe alert broadcasting system built on the STOMP protocol: a Java 8 server (switchable between a thread-per-client model and a non-blocking reactor/NIO model) paired with a C++11 command-line client (Boost ASIO) for real-time channel subscription and event broadcast.",
    stack: [
      "Java 8",
      "Maven",
      "STOMP",
      "Java NIO selector (reactor mode)",
      "C++11",
      "Make",
      "Boost ASIO",
      "Boost Thread",
    ],
    stackTable: [
      { layer: "Server language", tech: "Java 8" },
      { layer: "Protocol", tech: "STOMP" },
      { layer: "Concurrency", tech: "Thread-per-client; Java NIO selector (reactor mode)" },
      { layer: "Client language", tech: "C++11" },
      { layer: "Client libraries", tech: "Boost ASIO, Boost Thread" },
      { layer: "Build", tech: "Maven (server), Make (client)" },
    ],
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
  },
  {
    slug: "con-detection",
    title: "con-Detection",
    screen: "detection",
    github: "https://github.com/nasirfaisal83/con-Detection",
    systemSummary: "a YOLOv5 detection loop drawing bounding boxes on traffic cones frame by frame",
    summary:
      "Cone-detection system built on YOLOv5, processing video frame-by-frame to identify and bound traffic cones — aimed at applications like autonomous-driving tests and robotics navigation. Python, built and run in Google Colab.",
    stack: [
      "Python 3.7+",
      "YOLOv5",
      "PyTorch (torch, torchvision, torchaudio)",
      "OpenCV (opencv-python-headless 4.5.2.52)",
      "Jupyter Notebook",
      "Google Colab",
    ],
    stackTable: [
      { layer: "Language", tech: "Python 3.7+" },
      { layer: "Model", tech: "YOLOv5" },
      { layer: "Framework", tech: "PyTorch (torch, torchvision, torchaudio)" },
      { layer: "Video", tech: "OpenCV (opencv-python-headless 4.5.2.52)" },
      { layer: "Environment", tech: "Jupyter Notebook, Google Colab" },
    ],
    howItWorks: [
      "The notebook loads YOLOv5 and reads a video file with OpenCV, then walks it frame by frame rather than sampling it.",
      "Each frame goes through the model, and the detections come back as bounding boxes drawn around the traffic cones found in that frame.",
      "It is built for Google Colab's hosted, Linux-based notebook environment, so there is no local setup beyond cloning the repository and installing the dependencies.",
      "The sample video is kept out of the repository because of its size; the notebook expects it on the local machine.",
    ],
    highlights: [
      "Runs the YOLOv5 object detection model over a video file frame by frame, drawing bounding boxes around detected cones.",
      "Built for Google Colab's hosted, Linux-based notebook environment; no local setup beyond cloning and installing dependencies.",
      "The sample video is kept out of the repository because of size; the notebook expects it on the local machine.",
    ],
  },
];

export const projectSlugs = projects.map((p) => p.slug);

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}
