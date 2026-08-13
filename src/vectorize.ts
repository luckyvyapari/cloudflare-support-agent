import type { ModelBackend } from "./model";
import type { KBArticle } from "./types";

export interface StoredTicket {
	id: string;
	summary: string;
	category: string;
	severity: string;
	resolution: string;
}

export async function upsertResolvedTicket(
	env: Env,
	model: ModelBackend,
	ticket: StoredTicket,
) {
	const embedding = await model.embed(
		`${ticket.summary}\n${ticket.category}\n${ticket.resolution}`,
	);
	await env.VECTORIZE.upsert([
		{
			id: ticket.id,
			values: embedding,
			metadata: {
				type: "ticket",
				summary: ticket.summary,
				category: ticket.category,
				severity: ticket.severity,
				resolution: ticket.resolution,
			},
		},
	]);
}

// Cosine similarity on short support text is a weak relevance signal on its own.
// "I want to work at Cloudflare" and "Setting up 2FA" both mention "Cloudflare" and
// land at 0.3-0.5 cosine score despite being unrelated. Retrieve a wide candidate set
// by vector search (cheap, recall-focused), then rerank with a cross-encoder that scores
// query and document together (precision-focused), and drop anything below threshold.
// This is the standard retrieve-then-rerank / corrective-RAG pattern.
const RERANK_CANDIDATES = 8;
const TICKET_RERANK_THRESHOLD = 0.3;
const KB_RERANK_THRESHOLD = 0.4;

export async function findSimilarTickets(
	env: Env,
	model: ModelBackend,
	text: string,
	topK = 3,
) {
	const embedding = await model.embed(text);
	const result = await env.VECTORIZE.query(embedding, {
		topK: RERANK_CANDIDATES,
		returnMetadata: true,
		filter: { type: "ticket" },
	});
	if (!result.matches.length) return [];

	const candidates = result.matches.map((m) => ({
		id: m.id,
		summary: (m.metadata?.summary as string) ?? "",
		resolution: (m.metadata?.resolution as string) ?? "",
	}));
	const reranked = await model.rerank(text, candidates.map((c) => c.summary));

	return reranked
		.filter((r) => r.score > TICKET_RERANK_THRESHOLD)
		.slice(0, topK)
		.map((r) => ({ ...candidates[r.index], score: r.score }));
}

export async function findKBArticles(
	env: Env,
	model: ModelBackend,
	text: string,
	topK = 3,
): Promise<KBArticle[]> {
	const embedding = await model.embed(text);
	const result = await env.VECTORIZE.query(embedding, {
		topK: RERANK_CANDIDATES,
		returnMetadata: true,
		filter: { type: "kb" },
	});
	if (!result.matches.length) return [];

	const candidates = result.matches.map((m) => ({
		id: m.id,
		title: (m.metadata?.title as string) ?? "Cloudflare Help Article",
		url: (m.metadata?.url as string) ?? "https://support.cloudflare.com",
		category: (m.metadata?.category as string) ?? "general",
		excerpt: (m.metadata?.excerpt as string) ?? "",
	}));
	const reranked = await model.rerank(text, candidates.map((c) => `${c.title}: ${c.excerpt}`));

	return reranked
		.filter((r) => r.score > KB_RERANK_THRESHOLD)
		.slice(0, topK)
		.map((r) => ({ ...candidates[r.index], score: r.score }));
}

export async function upsertKBArticle(
	env: Env,
	model: ModelBackend,
	article: { id: string; title: string; url: string; category: string; content: string },
) {
	const embedding = await model.embed(`${article.title}\n${article.content}`);
	await env.VECTORIZE.upsert([{
		id: `kb-${article.id}`,
		values: embedding,
		metadata: {
			type: "kb",
			title: article.title,
			url: article.url,
			category: article.category,
			excerpt: article.content.slice(0, 200),
		},
	}]);
}
