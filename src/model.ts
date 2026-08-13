import { TOOL_DEFINITIONS } from "./tools";
import type { JsonValue } from "./types";

export interface ToolCall {
	name: string;
	arguments: Record<string, JsonValue>;
}

export interface ChatMessage {
	role: "system" | "user" | "assistant" | "tool";
	content: string;
	tool_call_id?: string;
	name?: string;
}

export interface RerankResult {
	index: number;
	score: number;
}

export interface ModelBackend {
	name: string;
	embed(text: string): Promise<number[]>;
	generate(prompt: string, system?: string): Promise<string>;
	chatWithTools(messages: ChatMessage[]): Promise<{ content: string; toolCalls: ToolCall[] }>;
	/** Cross-encoder rerank. Scores each document against the query directly,
	 *  catching false positives that cosine similarity alone lets through. */
	rerank(query: string, documents: string[]): Promise<RerankResult[]>;
}

const TOOLS_PAYLOAD = TOOL_DEFINITIONS.map((t) => ({
	type: "function",
	function: { name: t.name, description: t.description, parameters: t.parameters },
}));

class WorkersAIBackend implements ModelBackend {
	name = "workers-ai";
	constructor(
		private ai: Ai,
		private gatewayId?: string,
	) {}

	private get options() {
		return this.gatewayId ? { gateway: { id: this.gatewayId } } : undefined;
	}

	async embed(text: string): Promise<number[]> {
		const r = (await this.ai.run("@cf/baai/bge-base-en-v1.5", { text: [text] }, this.options)) as {
			data: number[][];
		};
		return r.data[0];
	}

	async generate(prompt: string, system?: string): Promise<string> {
		const messages = [
			...(system ? [{ role: "system", content: system }] : []),
			{ role: "user", content: prompt },
		];
		const r = (await this.ai.run("@cf/meta/llama-3.2-3b-instruct", { messages }, this.options)) as {
			response: unknown;
		};
		return typeof r.response === "string" ? r.response : JSON.stringify(r.response);
	}

	async chatWithTools(messages: ChatMessage[]) {
		const r = (await this.ai.run(
			"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
			{ messages, tools: TOOLS_PAYLOAD },
			this.options,
		)) as { response?: unknown; tool_calls?: { name: string; arguments: Record<string, JsonValue> }[] };

		return {
			content: typeof r.response === "string" ? r.response : "",
			toolCalls: (r.tool_calls ?? []).map((t) => ({ name: t.name, arguments: t.arguments ?? {} })),
		};
	}

	async rerank(query: string, documents: string[]): Promise<RerankResult[]> {
		if (!documents.length) return [];
		const input = { query, contexts: documents.map((text) => ({ text })) } as Ai_Cf_Baai_Bge_Reranker_Base_Input;
		const r = (await this.ai.run("@cf/baai/bge-reranker-base", input, this.options)) as unknown as {
			response?: { id?: number; score?: number }[];
		};
		return [...(r.response ?? [])]
			.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
			.map((x) => ({ index: x.id ?? 0, score: x.score ?? 0 }));
	}
}

class OllamaBackend implements ModelBackend {
	name = "ollama-local";
	constructor(
		private baseUrl: string,
		private embedModel: string,
		private chatModel: string,
	) {}

	async embed(text: string): Promise<number[]> {
		const res = await fetch(`${this.baseUrl}/api/embeddings`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ model: this.embedModel, prompt: text }),
		});
		if (!res.ok) throw new Error(`ollama embed failed: ${res.status}`);
		const json = (await res.json()) as { embedding: number[] };
		return json.embedding;
	}

	async generate(prompt: string, system?: string): Promise<string> {
		const messages = [
			...(system ? [{ role: "system", content: system }] : []),
			{ role: "user", content: prompt },
		];
		const res = await fetch(`${this.baseUrl}/api/chat`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				model: this.chatModel,
				messages,
				stream: false,
			}),
		});
		if (!res.ok) throw new Error(`ollama generate failed: ${res.status}`);
		const json = (await res.json()) as { message: { content: string } };
		return json.message.content;
	}

	async chatWithTools(messages: ChatMessage[]) {
		const res = await fetch(`${this.baseUrl}/api/chat`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({
				model: this.chatModel,
				messages,
				tools: TOOLS_PAYLOAD,
				stream: false,
			}),
		});
		if (!res.ok) throw new Error(`ollama tool call failed: ${res.status}`);
		const json = (await res.json()) as {
			message: { content: string; tool_calls?: { function: { name: string; arguments: Record<string, JsonValue> } }[] };
		};
		return {
			content: json.message.content ?? "",
			toolCalls: (json.message.tool_calls ?? []).map((t) => ({
				name: t.function.name,
				arguments: t.function.arguments ?? {},
			})),
		};
	}

	// No local cross-encoder in the Ollama dev path, so pass everything through
	// unscored so local dev isn't blocked on a reranker model being pulled.
	async rerank(_query: string, documents: string[]): Promise<RerankResult[]> {
		return documents.map((_, index) => ({ index, score: 1 }));
	}
}

export function getModelBackend(env: Env): ModelBackend {
	if (env.LOCAL_MODEL === "true") {
		return new OllamaBackend(
			env.OLLAMA_URL ?? "http://localhost:11434",
			"nomic-embed-text",
			"llama3.2",
		);
	}
	return new WorkersAIBackend(env.AI, env.AI_GATEWAY_ID);
}
