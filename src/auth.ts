import { createSession, getSession } from "./db";

export interface AuthResult {
	ok: boolean;
	email: string;
	role: "customer" | "support";
	token: string;
}

export async function loginCustomer(db: D1Database, email: string): Promise<string> {
	const trimmed = email.toLowerCase().trim();
	if (!trimmed || !trimmed.includes("@")) throw new Error("invalid email");
	return createSession(db, trimmed, "customer");
}

export async function verifySupportKey(env: Env, key: string): Promise<boolean> {
	if (!key) return false;
	const stored = await env.FEATURE_FLAGS.get("SUPPORT_KEY");
	const expected = stored ?? env.SUPPORT_KEY;
	if (!expected) return false;
	return key === expected;
}

export async function getSessionFromRequest(db: D1Database, request: Request): Promise<AuthResult | null> {
	const auth = request.headers.get("authorization") ?? "";
	const cookie = request.headers.get("cookie") ?? "";

	let token = "";
	if (auth.startsWith("Bearer ")) {
		token = auth.slice(7).trim();
	} else {
		const match = cookie.match(/session=([^;]+)/);
		if (match) token = match[1];
	}

	if (!token) return null;

	const row = await getSession(db, token);
	if (!row) return null;

	return { ok: true, email: row.email, role: row.role as "customer" | "support", token };
}
