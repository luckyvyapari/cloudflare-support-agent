export type Severity = "low" | "medium" | "high" | "critical";

export interface EscalationEvent {
	ticketId: string;
	severity: string;
	category: string;
	confidence: number;
	userEmail: string;
	timestamp: number;
}

export interface KBArticle {
	id: string;
	title: string;
	url: string;
	category: string;
	score: number;
	excerpt: string;
}

export interface Message {
	role: "customer" | "agent" | "system";
	content: string;
	ts: number;
}

export interface AnalysisResult {
	category: string;
	severity: Severity;
	summary: string;
	proposedFix: string;
	escalate: boolean;
	confidence: number;
	similarTickets: { id: string; score: number; summary: string }[];
	kbArticles: KBArticle[];
	modelUsed: string;
	injectionFlags: string[];
	redactions: string[];
	guardrails: string[];
}

export type JsonValue = string | number | boolean | null;

export interface ToolStep {
	tool: string;
	arguments: Record<string, JsonValue>;
	output: Record<string, JsonValue>;
}

export interface InvestigationResult {
	recommendation: string;
	steps: ToolStep[];
	modelUsed: string;
}

export interface TicketState {
	ticketId: string;
	status: "open" | "analyzed" | "escalated" | "resolved";
	messages: Message[];
	lastAnalysis?: AnalysisResult;
}
