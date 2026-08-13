/**
 * RouterAgent. a2a (agent-to-agent) orchestrator.
 *
 * Pattern borrowed from production-rag-system/AdaptiveRouter:
 * classify intent, dispatch to specialist TicketSession, record in D1.
 *
 * Demonstrates multi-agent coordination via getAgentByName.
 */
import { Agent, callable, getAgentByName } from "agents";
import { getModelBackend } from "./model";
import { upsertTicketMeta } from "./db";
import { log, newTraceId } from "./logger";

export interface RouterState {
	routedCount: number;
}

const ROUTE_SYSTEM = `You are a support ticket router.
Given a customer message, respond with ONLY one of these category words:
billing | technical | account | security | feature-request | other
No explanation. Just the category word.`;

export class RouterAgent extends Agent<Env, RouterState> {
	initialState: RouterState = { routedCount: 0 };

	@callable()
	async route(ticketId: string, userEmail: string, message: string): Promise<{
		ticketId: string;
		specialistId: string;
		category: string;
	}> {
		const traceId = newTraceId();
		const model = getModelBackend(this.env);

		log("info", traceId, "router.classify_start", { ticketId, userEmail });

		// Classify intent (fast, cheap: use 3b model)
		const raw = await model.generate(message, ROUTE_SYSTEM);
		const validCategories = ["billing", "technical", "account", "security", "feature-request", "other"];
		const category = validCategories.find((c) => raw.toLowerCase().includes(c)) ?? "other";

		// a2a: get specialist TicketSession by composed name
		// specialist id = category + ticket id for isolation
		const specialistId = `${category}-${ticketId}`;
		const specialist = await getAgentByName(this.env.TICKET_SESSION, specialistId);

		// Forward message to specialist (a2a call)
		await specialist.addMessage("customer", message);

		// Persist routing decision in D1
		await upsertTicketMeta(this.env.DB, ticketId, userEmail, category, specialistId, "open");

		this.setState({ routedCount: this.state.routedCount + 1 });

		log("info", traceId, "router.routed", { ticketId, category, specialistId });

		return { ticketId, specialistId, category };
	}
}
