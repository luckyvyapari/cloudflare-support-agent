import { getAgentByName, routeAgentRequest } from "agents";
import { log, newTraceId } from "./logger";
import { getModelBackend } from "./model";
import { upsertResolvedTicket, upsertKBArticle } from "./vectorize";
import { SEED_TICKETS } from "./seed-data";
import { UI_HTML } from "./ui";
import { loginCustomer, getSessionFromRequest, verifySupportKey } from "./auth";
import { isTopicRelevant } from "./guard";
import { upsertTicketMeta, listTicketsForUser, listAllTickets, getRepliesForTicket, addAgentReply, getMetrics } from "./db";
import { EVAL_CASES } from "./eval-cases";
import type { EscalationEvent } from "./types";

export { TicketSession } from "./agent";
export { RouterAgent } from "./router-agent";

function json(data: unknown, status = 200) {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: { "content-type": "application/json" },
	});
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const traceId = newTraceId();
		const start = Date.now();
		const url = new URL(request.url);

		const agentResponse = await routeAgentRequest(request, env);
		if (agentResponse) return agentResponse;

		try {
			const parts = url.pathname.split("/").filter(Boolean);

			// UI
			if (url.pathname === "/" && request.method === "GET") {
				return new Response(UI_HTML, { headers: { "content-type": "text/html; charset=utf-8" } });
			}

			// Health
			if (url.pathname === "/api/health") {
				const flag = await env.FEATURE_FLAGS.get("AUTO_ESCALATE");
				return json({ ok: true, autoEscalate: flag === "true", model: getModelBackend(env).name });
			}

			// ── Auth ─────────────────────────────────────────────────────────────

			// POST /api/auth/login  {email}
			if (url.pathname === "/api/auth/login" && request.method === "POST") {
				const body = (await request.json()) as { email?: string };
				if (!body.email) return json({ error: "email required" }, 400);
				try {
					const token = await loginCustomer(env.DB, body.email);
					return json({ token, role: "customer" });
				} catch (e) {
					return json({ error: (e as Error).message }, 400);
				}
			}

			// POST /api/auth/support  {key}
			if (url.pathname === "/api/auth/support" && request.method === "POST") {
				const body = (await request.json()) as { key?: string };
				const ok = await verifySupportKey(env, body.key ?? "");
				if (!ok) return json({ error: "invalid key" }, 401);
				const token = await loginCustomer(env.DB, "support@cloudflare.internal");
				// overwrite role to support in DB
				await env.DB.prepare("UPDATE sessions SET role='support' WHERE id=?").bind(token).run();
				return json({ token, role: "support" });
			}

			// GET /api/auth/me
			if (url.pathname === "/api/auth/me" && request.method === "GET") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session) return json({ error: "not authenticated" }, 401);
				return json({ email: session.email, role: session.role });
			}

			// ── Tickets ───────────────────────────────────────────────────────────

			// POST /api/tickets  (create + route via RouterAgent)
			if (url.pathname === "/api/tickets" && request.method === "POST") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session) return json({ error: "not authenticated" }, 401);

				const body = (await request.json()) as { message?: string; ticketId?: string };
				if (!body.message?.trim()) return json({ error: "message required" }, 400);

				const topicCheck = isTopicRelevant(body.message);
				if (!topicCheck.relevant) return json({ error: topicCheck.reason }, 400);

				const ticketId = body.ticketId ?? crypto.randomUUID();
				const router = await getAgentByName(env.ROUTER_AGENT, `router-${session.email}`);
				const routed = await router.route(ticketId, session.email, body.message);

				log("info", traceId, "api.ticket_created", { ticketId, category: routed.category });
				return json(routed);
			}

			// GET /api/tickets  (list for current user or all for support)
			if (url.pathname === "/api/tickets" && request.method === "GET") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session) return json({ error: "not authenticated" }, 401);

				const tickets = session.role === "support"
					? await listAllTickets(env.DB)
					: await listTicketsForUser(env.DB, session.email);
				return json({ tickets });
			}

			// POST /api/tickets/:id/message
			if (parts[0] === "api" && parts[1] === "tickets" && parts[3] === "message" && request.method === "POST") {
				const id = parts[2];
				const body = (await request.json()) as { role?: string; content?: string };
				if (!body.content || !body.content.trim()) return json({ error: "content is required" }, 400);
				try {
					const stub = await getAgentByName(env.TICKET_SESSION, id);
					const messages = await stub.addMessage(
						(body.role as "customer" | "agent" | "system") ?? "customer",
						body.content,
					);
					const session = await getSessionFromRequest(env.DB, request);
					await upsertTicketMeta(env.DB, id, session?.email ?? "anonymous");
					log("info", traceId, "api.message_added", { ticketId: id });
					return json({ ticketId: id, messages });
				} catch (err) {
					const msg = err instanceof Error ? err.message : String(err);
					log("error", traceId, "api.message_failed", { ticketId: id, error: msg });
					return json({ error: "failed to save message", detail: msg }, 500);
				}
			}

			// POST /api/tickets/:id/analyze
			if (parts[0] === "api" && parts[1] === "tickets" && parts[3] === "analyze" && request.method === "POST") {
				const id = parts[2];
				const stub = await getAgentByName(env.TICKET_SESSION, id);
				let result: Awaited<ReturnType<typeof stub.analyze>>;
				try {
					result = await stub.analyze();
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					if (message.includes("no messages")) return json({ error: message }, 400);
					log("error", traceId, "api.analyze_failed", { ticketId: id, message });
					return json({ error: "analysis failed", detail: message, traceId }, 500);
				}
				await upsertTicketMeta(env.DB, id, "", result.category, id, result.escalate ? "escalated" : "analyzed", result.severity);
				log("info", traceId, "api.analyzed", { ticketId: id, severity: result.severity });
				return json({ ticketId: id, traceId, ...result });
			}

			// POST /api/tickets/:id/investigate
			if (parts[0] === "api" && parts[1] === "tickets" && parts[3] === "investigate" && request.method === "POST") {
				const id = parts[2];
				const stub = await getAgentByName(env.TICKET_SESSION, id);
				try {
					const result = await stub.investigate();
					log("info", traceId, "api.investigated", { ticketId: id, toolsUsed: result.steps.length });
					return json({ ticketId: id, traceId, ...result });
				} catch (err) {
					const message = err instanceof Error ? err.message : String(err);
					if (message.includes("no messages")) return json({ error: message }, 400);
					log("error", traceId, "api.investigate_failed", { ticketId: id, message });
					return json({ error: "investigation failed", detail: message, traceId }, 500);
				}
			}

			// POST /api/tickets/:id/reply  (support agent sends reply)
			if (parts[0] === "api" && parts[1] === "tickets" && parts[3] === "reply" && request.method === "POST") {
				const id = parts[2];
				const session = await getSessionFromRequest(env.DB, request);
				if (!session || session.role !== "support") return json({ error: "support auth required" }, 401);

				const body = (await request.json()) as { content?: string };
				if (!body.content?.trim()) return json({ error: "content required" }, 400);

				const stub = await getAgentByName(env.TICKET_SESSION, id);
				const result = await stub.reply(body.content, session.email, false);
				log("info", traceId, "api.reply_sent", { ticketId: id, author: session.email });
				return json({ ticketId: id, ...result });
			}

			// POST /api/tickets/:id/draft  (AI-draft reply for support agent)
			if (parts[0] === "api" && parts[1] === "tickets" && parts[3] === "draft" && request.method === "POST") {
				const id = parts[2];
				const session = await getSessionFromRequest(env.DB, request);
				if (!session || session.role !== "support") return json({ error: "support auth required" }, 401);

				const stub = await getAgentByName(env.TICKET_SESSION, id);
				const draft = await stub.draftReply();
				return json({ draft });
			}

			// GET /api/tickets/:id/replies
			if (parts[0] === "api" && parts[1] === "tickets" && parts[3] === "replies" && request.method === "GET") {
				const id = parts[2];
				const replies = await getRepliesForTicket(env.DB, id);
				return json({ replies });
			}

			// POST /api/tickets/:id/resolve
			if (parts[0] === "api" && parts[1] === "tickets" && parts[3] === "resolve" && request.method === "POST") {
				const id = parts[2];
				const body = (await request.json()) as { note: string };
				const stub = await getAgentByName(env.TICKET_SESSION, id);
				const state = await stub.resolve(body.note);
				return json(state);
			}

			// GET /api/tickets/:id
			if (parts[0] === "api" && parts[1] === "tickets" && parts.length === 3 && request.method === "GET") {
				const id = parts[2];
				const stub = await getAgentByName(env.TICKET_SESSION, id);
				const state = await stub.getHistory();
				return json(state);
			}

			// ── Admin ──────────────────────────────────────────────────────────────

			// POST /admin/seed
			if (url.pathname === "/admin/seed" && request.method === "POST") {
				if (!env.ADMIN_KEY || request.headers.get("x-admin-key") !== env.ADMIN_KEY) {
					return json({ error: "unauthorized" }, 401);
				}
				const model = getModelBackend(env);
				for (const t of SEED_TICKETS) {
					await upsertResolvedTicket(env, model, t);
				}
				log("info", traceId, "admin.seeded", { count: SEED_TICKETS.length });
				return json({ seeded: SEED_TICKETS.length });
			}

			// POST /admin/seed-kb  (embed KB articles from seed script)
			if (url.pathname === "/admin/seed-kb" && request.method === "POST") {
				if (!env.ADMIN_KEY || request.headers.get("x-admin-key") !== env.ADMIN_KEY) {
					return json({ error: "unauthorized" }, 401);
				}
				const body = (await request.json()) as {
					articles: { id: string; title: string; url: string; category: string; content: string }[];
				};
				const model = getModelBackend(env);
				let seeded = 0;
				for (const article of body.articles) {
					await upsertKBArticle(env, model, article);
					// also store metadata in D1
					await env.DB.prepare(
						"INSERT OR IGNORE INTO kb_articles (id, title, url, category, created_at) VALUES (?, ?, ?, ?, ?)"
					).bind(article.id, article.title, article.url, article.category, Date.now()).run();
					seeded++;
				}
				log("info", traceId, "admin.kb_seeded", { count: seeded });
				return json({ seeded });
			}

			// GET /api/kb  (list all KB articles from D1)
			if (url.pathname === "/api/kb" && request.method === "GET") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session) return json({ error: "not authenticated" }, 401);
				const rows = await env.DB.prepare(
					"SELECT id, title, url, category, created_at FROM kb_articles ORDER BY category, title"
				).all();
				return json({ articles: rows.results });
			}

			// GET /api/admin/metrics
			if (url.pathname === "/api/admin/metrics" && request.method === "GET") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session || session.role !== "support") return json({ error: "support auth required" }, 401);
				const metrics = await getMetrics(env.DB);
				return json(metrics);
			}

			// ── Admin: KV feature flags ─────────────────────────────────────────

			// GET /api/admin/flags
			if (url.pathname === "/api/admin/flags" && request.method === "GET") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session || session.role !== "support") return json({ error: "support auth required" }, 401);
				const autoEscalate = await env.FEATURE_FLAGS.get("AUTO_ESCALATE");
				return json({ flags: { AUTO_ESCALATE: autoEscalate === "true" } });
			}

			// POST /api/admin/flags  {key, value}
			if (url.pathname === "/api/admin/flags" && request.method === "POST") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session || session.role !== "support") return json({ error: "support auth required" }, 401);
				const body = (await request.json()) as { key?: string; value?: boolean };
				if (body.key !== "AUTO_ESCALATE") return json({ error: "unknown flag" }, 400);
				await env.FEATURE_FLAGS.put("AUTO_ESCALATE", body.value ? "true" : "false");
				log("info", traceId, "admin.flag_changed", { key: body.key, value: body.value, by: session.email });
				return json({ ok: true, key: body.key, value: !!body.value });
			}

			// ── Admin: observability traces ─────────────────────────────────────

			// GET /api/admin/traces
			if (url.pathname === "/api/admin/traces" && request.method === "GET") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session || session.role !== "support") return json({ error: "support auth required" }, 401);
				const rows = await env.DB.prepare(
					"SELECT trace_id, ticket_id, level, event, fields, created_at FROM trace_events ORDER BY created_at DESC LIMIT 50"
				).all();
				return json({ traces: rows.results });
			}

			// ── Admin: eval harness ──────────────────────────────────────────────

			// POST /api/admin/evals/run
			if (url.pathname === "/api/admin/evals/run" && request.method === "POST") {
				const session = await getSessionFromRequest(env.DB, request);
				if (!session || session.role !== "support") return json({ error: "support auth required" }, 401);

				const SEVERITY_RANK: Record<string, number> = { low: 0, medium: 1, high: 2, critical: 3 };
				const results = [];

				for (const testCase of EVAL_CASES) {
					const ticketId = `eval-${testCase.id}-${Date.now()}`;
					const stub = await getAgentByName(env.TICKET_SESSION, ticketId);
					await stub.addMessage("customer", testCase.message);

					const checks: { name: string; pass: boolean; got: unknown; want: unknown }[] = [];
					let error: string | undefined;
					try {
						const result = await stub.analyze();
						const expect = testCase.expect;

						if (expect.category !== undefined) {
							checks.push({ name: "category", pass: result.category === expect.category, got: result.category, want: expect.category });
						}
						if (expect.escalate !== undefined) {
							checks.push({ name: "escalate", pass: result.escalate === expect.escalate, got: result.escalate, want: expect.escalate });
						}
						if (expect.minSeverity !== undefined) {
							const pass = SEVERITY_RANK[result.severity] >= SEVERITY_RANK[expect.minSeverity];
							checks.push({ name: "minSeverity", pass, got: result.severity, want: `>= ${expect.minSeverity}` });
						}
						if (expect.maxSeverity !== undefined) {
							const pass = SEVERITY_RANK[result.severity] <= SEVERITY_RANK[expect.maxSeverity];
							checks.push({ name: "maxSeverity", pass, got: result.severity, want: `<= ${expect.maxSeverity}` });
						}
						if (expect.injectionDetected !== undefined) {
							const detected = (result.injectionFlags ?? []).length > 0;
							checks.push({ name: "injectionDetected", pass: detected === expect.injectionDetected, got: result.injectionFlags, want: expect.injectionDetected });
						}
						if (expect.redactionsInclude !== undefined) {
							const got = result.redactions ?? [];
							const pass = expect.redactionsInclude.every((r) => got.includes(r));
							checks.push({ name: "redactions", pass, got, want: expect.redactionsInclude });
						}
					} catch (err) {
						error = err instanceof Error ? err.message : String(err);
					}

					const passed = checks.filter((c) => c.pass).length;
					results.push({ id: testCase.id, message: testCase.message, error, checks, passed, total: checks.length });
				}

				const totalChecks = results.reduce((n, r) => n + r.total, 0);
				const totalPassed = results.reduce((n, r) => n + r.passed, 0);
				const casesPassed = results.filter((r) => !r.error && r.passed === r.total).length;
				const accuracy = totalChecks ? Number(((totalPassed / totalChecks) * 100).toFixed(1)) : 0;

				log("info", traceId, "admin.evals_run", { casesPassed, totalCases: results.length, accuracy });
				return json({ results, casesPassed, totalCases: results.length, totalChecks, totalPassed, accuracy });
			}

			return json({ error: "not found" }, 404);
		} catch (err) {
			const msg = err instanceof Error ? err.message : String(err);
			log("error", traceId, "request.unhandled_error", { path: url.pathname, method: request.method, error: msg });
			return json({ error: "internal server error", detail: msg, traceId }, 500);
		} finally {
			log("info", traceId, "request.complete", {
				path: url.pathname,
				method: request.method,
				durationMs: Date.now() - start,
			});
		}
	},

	// Queue consumer. Processes escalation events published by TicketSession.analyze()
	// Production: fan out to Salesforce case creation, Slack/PagerDuty alerts, on-call routing
	async queue(batch: MessageBatch<unknown>, env: Env, _ctx: ExecutionContext): Promise<void> {
		const traceId = newTraceId();
		for (const msg of batch.messages) {
			const event = msg.body as EscalationEvent;
			log("info", traceId, "queue.escalation_processing", {
				ticketId: event.ticketId,
				severity: event.severity,
				category: event.category,
				confidence: event.confidence,
			});
			// TODO (production): POST to Salesforce case API, send Slack webhook,
			// trigger PagerDuty for critical severity, update SLA timer in D1
			msg.ack();
		}
		log("info", traceId, "queue.batch_complete", { count: batch.messages.length });
	},
} satisfies ExportedHandler<Env>;
