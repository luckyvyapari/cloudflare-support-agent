// D1 data access layer: ticket index, sessions, agent replies, KB metadata

export interface SessionRow {
	id: string;
	email: string;
	role: "customer" | "support";
	created_at: number;
}

export interface TicketMetaRow {
	id: string;
	user_email: string;
	routed_category: string | null;
	specialist_id: string | null;
	status: string;
	severity: string | null;
	resolved_at: number | null;
	created_at: number;
	updated_at: number;
}

export interface AgentReplyRow {
	id: string;
	ticket_id: string;
	author_email: string;
	content: string;
	is_auto_draft: number;
	created_at: number;
}

export async function createSession(db: D1Database, email: string, role: "customer" | "support"): Promise<string> {
	const id = crypto.randomUUID();
	await db.prepare(
		"INSERT INTO sessions (id, email, role, created_at) VALUES (?, ?, ?, ?)"
	).bind(id, email, role, Date.now()).run();
	return id;
}

export async function getSession(db: D1Database, token: string): Promise<SessionRow | null> {
	const row = await db.prepare(
		"SELECT * FROM sessions WHERE id = ?"
	).bind(token).first<SessionRow>();
	return row ?? null;
}

export async function upsertTicketMeta(
	db: D1Database,
	id: string,
	userEmail: string,
	category?: string,
	specialistId?: string,
	status = "open",
	severity?: string,
): Promise<void> {
	const now = Date.now();
	await db.prepare(`
		INSERT INTO tickets_meta (id, user_email, routed_category, specialist_id, status, severity, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
		  routed_category = excluded.routed_category,
		  specialist_id = excluded.specialist_id,
		  status = excluded.status,
		  severity = COALESCE(excluded.severity, severity),
		  updated_at = excluded.updated_at
	`).bind(id, userEmail, category ?? null, specialistId ?? null, status, severity ?? null, now, now).run();
}

export async function updateTicketStatus(db: D1Database, id: string, status: string): Promise<void> {
	const now = Date.now();
	await db.prepare(
		"UPDATE tickets_meta SET status = ?, updated_at = ?, resolved_at = CASE WHEN ? = 'resolved' THEN ? ELSE resolved_at END WHERE id = ?"
	).bind(status, now, status, now, id).run();
}

export interface MetricsResult {
	totals: { total: number; resolved: number; escalated: number; open: number };
	byStatus: { status: string; count: number }[];
	byCategory: { category: string; count: number }[];
	bySeverity: { severity: string; count: number }[];
	avgResolutionHours: number | null;
}

export async function getMetrics(db: D1Database): Promise<MetricsResult> {
	const [statusRes, categoryRes, severityRes, resolutionRes] = await db.batch([
		db.prepare("SELECT status, COUNT(*) as count FROM tickets_meta GROUP BY status ORDER BY count DESC"),
		db.prepare("SELECT COALESCE(routed_category,'unknown') as category, COUNT(*) as count FROM tickets_meta GROUP BY routed_category ORDER BY count DESC"),
		db.prepare("SELECT COALESCE(severity,'unknown') as severity, COUNT(*) as count FROM tickets_meta WHERE severity IS NOT NULL GROUP BY severity ORDER BY count DESC"),
		db.prepare("SELECT AVG(CAST(resolved_at - created_at AS REAL) / 3600000.0) as avg_hours FROM tickets_meta WHERE status='resolved' AND resolved_at IS NOT NULL"),
	]);

	const byStatus = statusRes.results as { status: string; count: number }[];
	const byCategory = categoryRes.results as { category: string; count: number }[];
	const bySeverity = severityRes.results as { severity: string; count: number }[];
	const resRow = resolutionRes.results[0] as { avg_hours: number | null } | undefined;

	const get = (key: string) => byStatus.find((r) => r.status === key)?.count ?? 0;
	const total = byStatus.reduce((s, r) => s + r.count, 0);

	return {
		totals: { total, resolved: get("resolved"), escalated: get("escalated"), open: get("open") },
		byStatus,
		byCategory,
		bySeverity,
		avgResolutionHours: resRow?.avg_hours ?? null,
	};
}

export async function listTicketsForUser(db: D1Database, email: string): Promise<TicketMetaRow[]> {
	const result = await db.prepare(
		"SELECT * FROM tickets_meta WHERE user_email = ? ORDER BY created_at DESC LIMIT 50"
	).bind(email).all<TicketMetaRow>();
	return result.results;
}

export async function listAllTickets(db: D1Database, limit = 100): Promise<TicketMetaRow[]> {
	const result = await db.prepare(
		"SELECT * FROM tickets_meta ORDER BY created_at DESC LIMIT ?"
	).bind(limit).all<TicketMetaRow>();
	return result.results;
}

export async function addAgentReply(
	db: D1Database,
	ticketId: string,
	authorEmail: string,
	content: string,
	isAutoDraft = false,
): Promise<string> {
	const id = crypto.randomUUID();
	await db.prepare(
		"INSERT INTO agent_replies (id, ticket_id, author_email, content, is_auto_draft, created_at) VALUES (?, ?, ?, ?, ?, ?)"
	).bind(id, ticketId, authorEmail, content, isAutoDraft ? 1 : 0, Date.now()).run();
	return id;
}

export async function getRepliesForTicket(db: D1Database, ticketId: string): Promise<AgentReplyRow[]> {
	const result = await db.prepare(
		"SELECT * FROM agent_replies WHERE ticket_id = ? ORDER BY created_at ASC"
	).bind(ticketId).all<AgentReplyRow>();
	return result.results;
}

export async function upsertKbArticle(
	db: D1Database,
	id: string,
	title: string,
	url: string,
	category: string,
): Promise<void> {
	await db.prepare(`
		INSERT INTO kb_articles (id, title, url, category, created_at)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(id) DO NOTHING
	`).bind(id, title, url, category, Date.now()).run();
}
