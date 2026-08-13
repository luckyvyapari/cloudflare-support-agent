/**
 * Seeds Cloudflare knowledge base articles into Vectorize.
 * Articles sourced from https://support.cloudflare.com — limited set for interview demo.
 * In production: scrape incrementally, run as a cron Worker.
 *
 * Usage: CLOUDFLARE_ACCOUNT_ID=xxx node scripts/seed-kb.mjs
 * Or via: npm run seed-kb
 */

const BASE_URL = process.env.AGENT_URL ?? "https://support-triage-agent.support-triage-agent.workers.dev";
const ADMIN_KEY = process.env.ADMIN_KEY ?? "dev-local-key";

// 15 representative Cloudflare support articles (limited for demo — note this in interview)
const KB_ARTICLES = [
	{
		id: "kb-billing-upgrade",
		title: "How to upgrade or downgrade your Cloudflare plan",
		url: "https://support.cloudflare.com/hc/en-us/articles/360016481471",
		category: "billing",
		content: "To change your plan, log in to the Cloudflare dashboard, select your domain, click Overview, then Change Plan. Free, Pro, Business, and Enterprise plans are available. Plan changes take effect immediately. Billing is prorated for mid-cycle changes. Enterprise plans require sales team contact. Downgrades may disable features exceeding the lower plan's limits.",
	},
	{
		id: "kb-billing-invoice",
		title: "Understanding Cloudflare invoices and billing cycles",
		url: "https://support.cloudflare.com/hc/en-us/articles/200170466",
		category: "billing",
		content: "Cloudflare bills monthly on the anniversary of your subscription start date. Invoices are sent via email and available in the dashboard under Billing. Charges appear for base plan fees plus add-ons like Workers, Stream, and Images. Failed payments result in a grace period before service downgrade. Update payment methods in Account > Billing > Payment Info.",
	},
	{
		id: "kb-billing-refund",
		title: "Cloudflare refund policy",
		url: "https://support.cloudflare.com/hc/en-us/articles/200172316",
		category: "billing",
		content: "Cloudflare offers refunds for accidental duplicate charges and technical issues preventing service use. Refund requests must be submitted within 30 days of the charge. Contact support with your account email, invoice number, and reason. Refunds typically process within 5-10 business days. Annual plan refunds are prorated for unused months.",
	},
	{
		id: "kb-ssl-setup",
		title: "Understanding Cloudflare SSL/TLS modes",
		url: "https://support.cloudflare.com/hc/en-us/articles/200170416",
		category: "technical",
		content: "Cloudflare offers four SSL modes: Off (no encryption), Flexible (encrypts browser-to-Cloudflare only), Full (encrypts both hops, accepts self-signed origin certs), and Full (Strict) which requires a valid CA-signed origin certificate. Full Strict is recommended for maximum security. Universal SSL is free for all plans. ACM (Advanced Certificate Manager) supports custom certificates and multi-level subdomains.",
	},
	{
		id: "kb-dns-setup",
		title: "Managing DNS records in Cloudflare",
		url: "https://support.cloudflare.com/hc/en-us/articles/360019093151",
		category: "technical",
		content: "Add, edit, or delete DNS records from the Cloudflare dashboard under DNS > Records. Supported types: A, AAAA, CNAME, MX, TXT, NS, SRV, CAA. Orange-cloud (proxied) records route through Cloudflare's network. Grey-cloud records bypass Cloudflare. TTL is auto-managed for proxied records. Propagation typically takes minutes but can take up to 24-48 hours with some ISPs.",
	},
	{
		id: "kb-ddos-protection",
		title: "Understanding Cloudflare DDoS protection",
		url: "https://support.cloudflare.com/hc/en-us/articles/200172676",
		category: "technical",
		content: "Cloudflare provides automatic DDoS mitigation at Layers 3, 4, and 7. Under Attack Mode enables I'm Under Attack protection by presenting a JavaScript challenge. Security Level controls bot sensitivity from Essentially Off to I'm Under Attack. WAF (Web Application Firewall) blocks common attack patterns. Rate limiting prevents abuse. Analytics shows attack traffic in the Security > Events log.",
	},
	{
		id: "kb-cache-rules",
		title: "Configuring Cloudflare caching behavior",
		url: "https://support.cloudflare.com/hc/en-us/articles/202775670",
		category: "technical",
		content: "Cloudflare caches static assets by default. Cache Rules let you customize caching for any URL pattern. Cache-Control headers from your origin take precedence. To bypass cache for a path, create a Cache Rule with Cache Status: Bypass. Edge Cache TTL sets how long Cloudflare caches assets regardless of origin headers. Purge cache from the Dashboard under Caching > Configuration > Purge Cache.",
	},
	{
		id: "kb-workers-limits",
		title: "Cloudflare Workers limits and pricing",
		url: "https://developers.cloudflare.com/workers/platform/limits/",
		category: "technical",
		content: "Workers free plan: 100,000 requests/day, 10ms CPU time per request. Workers Paid: 10 million requests/month included, then $0.30 per million. CPU limit: 30s on paid plans with Smart Placement. Memory: 128MB per Worker. KV: 100,000 reads/day free. Durable Objects require paid plan. D1: 5 million reads/day free. Vectorize: 30 million queried vectors/month free.",
	},
	{
		id: "kb-account-2fa",
		title: "Setting up two-factor authentication on your Cloudflare account",
		url: "https://support.cloudflare.com/hc/en-us/articles/200167906",
		category: "account",
		content: "Enable 2FA in My Profile > Authentication. Cloudflare supports TOTP authenticator apps (Google Authenticator, Authy) and security keys (FIDO2/WebAuthn). Backup codes are provided when enabling 2FA — store them securely. If locked out, use backup codes or contact support with account verification. Enterprise accounts can enforce 2FA for all team members via Account > Members settings.",
	},
	{
		id: "kb-account-members",
		title: "Managing team members and permissions in Cloudflare",
		url: "https://support.cloudflare.com/hc/en-us/articles/205065067",
		category: "account",
		content: "Invite team members from Account > Members. Roles: Super Administrator (full access), Administrator (full except billing), Administrator (read-only), and custom roles on Enterprise. Members can be scoped to specific domains. Remove members from the Members list. API tokens can be scoped per-member for automated access. Audit logs track all member actions.",
	},
	{
		id: "kb-security-api-token",
		title: "Creating and managing Cloudflare API tokens",
		url: "https://developers.cloudflare.com/fundamentals/api/get-started/create-token/",
		category: "security",
		content: "Create API tokens at dash.cloudflare.com/profile/api-tokens. Tokens support fine-grained permissions per resource and zone. Always use tokens instead of the Global API Key for security. Tokens can be restricted by IP address and TTL. Rotate tokens immediately if compromised. Audit token usage via the Audit Log. Token permissions: Read (list/view), Edit (create/update/delete), Run (execute-only, e.g. AI Gateway).",
	},
	{
		id: "kb-security-firewall",
		title: "Cloudflare WAF and firewall rules",
		url: "https://developers.cloudflare.com/waf/",
		category: "security",
		content: "The Cloudflare WAF blocks malicious traffic automatically using managed rulesets. Custom rules let you create allow/block/challenge actions based on IP, country, user agent, URI path, headers, and more. Rate limiting rules prevent brute force attacks. Bot Fight Mode identifies and challenges automated traffic. WAF events appear in Security > Events with full request details for investigation.",
	},
	{
		id: "kb-workers-routes",
		title: "Deploying Cloudflare Workers with custom routes",
		url: "https://developers.cloudflare.com/workers/configuration/routing/routes/",
		category: "technical",
		content: "Workers run on routes matching URL patterns like example.com/api/*. Add routes in the Workers & Pages dashboard or via wrangler.toml. Workers run on every request matching the route before your origin receives it. Use addEventListener('fetch') or export default { fetch() } syntax. Wrangler deploy pushes code globally in seconds. Use wrangler dev for local testing with --remote for live bindings.",
	},
	{
		id: "kb-pages-deploy",
		title: "Deploying to Cloudflare Pages",
		url: "https://developers.cloudflare.com/pages/get-started/",
		category: "technical",
		content: "Cloudflare Pages auto-deploys from GitHub/GitLab on push. Supports Next.js, React, Vue, Hugo, Jekyll, and static sites. Each PR gets a unique preview URL. Build output directory and commands configurable per project. Pages Functions add server-side logic. Environment variables set per environment (production/preview). Custom domains added from the Pages project dashboard.",
	},
	{
		id: "kb-r2-storage",
		title: "Cloudflare R2 object storage overview",
		url: "https://developers.cloudflare.com/r2/",
		category: "technical",
		content: "R2 is S3-compatible object storage with zero egress fees. Free tier: 10GB storage, 1M Class A operations, 10M Class B operations per month. Buckets created in the Cloudflare dashboard under R2. Access via Workers bindings, S3-compatible API, or public buckets. CORS configurable per bucket. R2 stores data in APAC, EU, or USDOC regions. Pairs with Cloudflare Workers for edge-computed responses.",
	},
];

async function seedKB() {
	console.log(`Seeding ${KB_ARTICLES.length} KB articles into Vectorize...`);
	console.log(`Target: ${BASE_URL}/admin/seed-kb`);

	const res = await fetch(`${BASE_URL}/admin/seed-kb`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			"x-admin-key": ADMIN_KEY,
		},
		body: JSON.stringify({ articles: KB_ARTICLES }),
	});

	if (!res.ok) {
		const text = await res.text();
		console.error(`Failed: ${res.status} ${text}`);
		process.exit(1);
	}

	const result = await res.json();
	console.log("Done:", JSON.stringify(result, null, 2));
}

seedKB().catch((err) => {
	console.error(err);
	process.exit(1);
});
