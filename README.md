# Cloudflare Support Agent

AI support-ticket analysis agent built entirely on Cloudflare's platform. A customer describes an issue, the agent classifies it, pulls relevant knowledge base articles and past resolutions with RAG, decides whether to escalate to a human, and hands support staff a working console to review, reply, and audit every decision.

**Live demo:** https://support-triage-agent.support-triage-agent.workers.dev

- Customer login: one-click demo button, no password
- Support login: one-click demo button (access key auto-filled)

<!-- Screenshot: ticket list. Drop the image into GitHub's README editor and it'll host it automatically. -->
<!-- ![Ticket list](docs/screenshot-tickets.png) -->

<!-- Screenshot: ticket detail with AI analysis, RAG-retrieved KB articles, similar past tickets -->
<!-- ![Ticket detail](docs/screenshot-detail.png) -->

<!-- Screenshot: Ops console, KV feature flag, live trace timeline, eval suite -->
<!-- ![Ops console](docs/screenshot-ops.png) -->

## What it does

1. Customer opens a ticket by describing an issue in plain English.
2. A router agent classifies intent and hands off to a specialist session, isolated per category.
3. The specialist agent runs analysis: retrieves similar past tickets and knowledge base articles by vector search, reranks them with a cross-encoder for precision, then asks an LLM to classify category, severity, and whether to escalate.
4. Escalations publish to a Cloudflare Queue for downstream routing (Slack, PagerDuty, case creation in production).
5. Support staff get a full console: filterable ticket table, AI-drafted replies, an "Investigate" tool-calling flow that looks up order/account/refund facts before answering, and an Ops page to flip feature flags and replay exactly what the agent did on any ticket.

## Stack

| Concern | Cloudflare product |
|---|---|
| Stateful ticket sessions | Durable Objects (Agent SDK) |
| Classification, drafting, tool calling | Workers AI (`llama-3.2-3b`, `llama-3.3-70b`) |
| Semantic search over tickets + KB | Vectorize, retrieve-then-rerank with `bge-reranker-base` |
| Runtime feature flags | Workers KV |
| Ticket index, sessions, traces | D1 |
| Escalation routing | Queues |
| Observability for all model calls | AI Gateway |

## Why it's built this way

- **Retrieve-then-rerank RAG.** Cosine similarity alone on short support text is a weak signal, "I want to work at Cloudflare" and "Setting up 2FA" both land at 0.3-0.5 similarity despite being unrelated. A cross-encoder reranks the top candidates against the actual query before anything reaches the LLM, cutting irrelevant KB hits to near zero.
- **Prompt injection and PII guardrails.** Customer text is wrapped as untrusted data before it reaches the model, PII is tokenized before the model ever sees it, and model output is validated for leaked system-prompt content before it's trusted. Covers OWASP LLM01, LLM02, LLM06, LLM08.
- **KV feature flags instead of redeploys.** Risky behavior ships behind a flag that's off by default. Flip it live in ~60 seconds across every edge location, no redeploy, and flip it back just as fast if it misbehaves.
- **Full tracing.** Every analysis run writes a trace to D1: retrieval, guardrails fired, model output, escalation decision. The Ops console replays any ticket's trace step by step instead of guessing from logs.
- **Eval suite.** 12 fixed test cases covering category accuracy, severity bounds, injection detection, and PII redaction, run against the real `analyze()` path so a prompt change can't regress silently.

## Local development

```bash
npm install
cp .dev.vars.example .dev.vars   # fill in ADMIN_KEY, SUPPORT_KEY
npm run dev
```

Runs against Workers AI by default. Set `LOCAL_MODEL=true` in `.dev.vars` to run against a local Ollama instance instead.

```bash
npm run typecheck
npm test
npm run eval        # runs the eval suite against a deployed instance
```

## Deploy

```bash
npm run deploy
wrangler secret put ADMIN_KEY
wrangler secret put SUPPORT_KEY
```

Needs a D1 database, a Vectorize index (with a metadata index on `type`), and a KV namespace provisioned first, see `wrangler.jsonc` for bindings.
