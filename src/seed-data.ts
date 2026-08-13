import type { StoredTicket } from "./vectorize";

export const SEED_TICKETS: StoredTicket[] = [
	{
		id: "seed-1",
		summary: "Customer charged twice for the same monthly subscription",
		category: "billing",
		severity: "high",
		resolution: "Refunded duplicate charge, deduped Stripe webhook handler to prevent double-processing.",
	},
	{
		id: "seed-2",
		summary: "Password reset email never arrives",
		category: "account",
		severity: "medium",
		resolution: "Domain was on greylist at recipient mail server; added SPF/DKIM record, resent manually.",
	},
	{
		id: "seed-3",
		summary: "API returns 500 when uploading files larger than 10MB",
		category: "technical",
		severity: "high",
		resolution: "Raised body size limit in Worker config and added chunked upload support.",
	},
	{
		id: "seed-4",
		summary: "Customer wants a dark mode toggle in settings",
		category: "feature-request",
		severity: "low",
		resolution: "Logged as backlog item, no immediate fix needed.",
	},
	{
		id: "seed-5",
		summary: "Data export missing rows compared to dashboard totals",
		category: "technical",
		severity: "critical",
		resolution: "Pagination bug in export query dropped rows past page 1; fixed cursor logic and backfilled exports.",
	},
];
