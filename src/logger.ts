interface LogFields {
	[key: string]: unknown;
}

export function log(
	level: "info" | "warn" | "error",
	traceId: string,
	event: string,
	fields: LogFields = {},
) {
	console.log(
		JSON.stringify({
			ts: new Date().toISOString(),
			level,
			traceId,
			event,
			...fields,
		}),
	);
}

export function newTraceId(): string {
	return crypto.randomUUID();
}

/**
 * Persist a trace event to D1 so the admin UI can render a live timeline.
 * console.log only reaches wrangler tail / the CF dashboard, not our own API.
 * Fire-and-forget: observability must never fail the request it's observing.
 */
export function recordTrace(
	db: D1Database,
	traceId: string,
	event: string,
	level: "info" | "warn" | "error" = "info",
	fields: LogFields = {},
	ticketId?: string,
): void {
	db.prepare(
		"INSERT INTO trace_events (id, trace_id, ticket_id, level, event, fields, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
	)
		.bind(crypto.randomUUID(), traceId, ticketId ?? null, level, event, JSON.stringify(fields), Date.now())
		.run()
		.catch(() => {});
}
