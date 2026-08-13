import type { JsonValue } from "./types";

export interface ToolDefinition {
	name: string;
	description: string;
	parameters: {
		type: "object";
		properties: Record<string, { type: string; description: string }>;
		required: string[];
	};
}

export const TOOL_DEFINITIONS: ToolDefinition[] = [
	{
		name: "lookup_order",
		description: "Look up an order by its ID to get status, amount, and charge history.",
		parameters: {
			type: "object",
			properties: {
				order_id: { type: "string", description: "The order ID, e.g. ORD-1001" },
			},
			required: ["order_id"],
		},
	},
	{
		name: "lookup_account",
		description: "Look up a customer account by email to get plan, status, and signup date.",
		parameters: {
			type: "object",
			properties: {
				email: { type: "string", description: "Customer email address" },
			},
			required: ["email"],
		},
	},
	{
		name: "get_refund_policy",
		description: "Get the refund policy for a given issue category.",
		parameters: {
			type: "object",
			properties: {
				category: { type: "string", description: "Issue category, e.g. billing" },
			},
			required: ["category"],
		},
	},
];

const ORDERS: Record<string, Record<string, JsonValue>> = {
	"ORD-1001": { status: "charged_twice", amount: "$49.00", charges: 2, date: "2026-08-01", refundable: true },
	"ORD-1002": { status: "completed", amount: "$120.00", charges: 1, date: "2026-07-14", refundable: false },
	"ORD-1003": { status: "failed", amount: "$0.00", charges: 0, date: "2026-08-09", refundable: false },
};

const ACCOUNTS: Record<string, Record<string, JsonValue>> = {
	"jane@example.com": { plan: "Pro", status: "active", since: "2024-03-11", mfa: true },
	"bob@example.com": { plan: "Free", status: "suspended", since: "2025-11-02", mfa: false },
};

const REFUND_POLICIES: Record<string, string> = {
	billing: "Duplicate charges are refunded in full within 5 business days, no approval needed.",
	technical: "Service credits issued for outages over 4 hours; requires manager approval.",
	account: "No refunds for account issues; escalate to account management.",
};

export function executeTool(name: string, args: Record<string, JsonValue>): Record<string, JsonValue> {
	switch (name) {
		case "lookup_order": {
			const id = String(args.order_id ?? "").toUpperCase();
			return ORDERS[id] ?? { error: "order not found", order_id: id };
		}
		case "lookup_account": {
			const email = String(args.email ?? "").toLowerCase();
			return ACCOUNTS[email] ?? { error: "account not found", email };
		}
		case "get_refund_policy": {
			const cat = String(args.category ?? "").toLowerCase();
			return { policy: REFUND_POLICIES[cat] ?? "No specific policy; use standard discretion." };
		}
		default:
			return { error: `unknown tool: ${name}` };
	}
}
