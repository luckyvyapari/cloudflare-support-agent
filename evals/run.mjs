#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.EVAL_BASE_URL ?? "https://support-triage-agent.support-triage-agent.workers.dev";
const SEVERITY_RANK = { low: 0, medium: 1, high: 2, critical: 3 };

const cases = JSON.parse(readFileSync(join(__dirname, "cases.json"), "utf8"));

async function runCase(testCase) {
	const ticketId = `eval-${testCase.id}-${Date.now()}`;
	const checks = [];

	await fetch(`${BASE}/api/tickets/${ticketId}/message`, {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ role: "customer", content: testCase.message }),
	});

	const res = await fetch(`${BASE}/api/tickets/${ticketId}/triage?cb=${Date.now()}`, { method: "POST" });
	if (!res.ok) {
		return { id: testCase.id, error: `HTTP ${res.status}`, checks: [], passed: 0, total: 1 };
	}
	const result = await res.json();
	const expect = testCase.expect;

	if (expect.category !== undefined) {
		checks.push({ name: "category", pass: result.category === expect.category, got: result.category, want: expect.category });
	}
	if (expect.escalate !== undefined) {
		checks.push({ name: "escalate", pass: result.escalate === expect.escalate, got: result.escalate, want: expect.escalate });
	}
	if (expect.minSeverity !== undefined) {
		const pass = SEVERITY_RANK[result.severity] >= SEVERITY_RANK[expect.minSeverity];
		checks.push({ name: "minSeverity", pass, got: result.severity, want: `>= ${expect.minSeverity}` });
	}
	if (expect.maxSeverity !== undefined) {
		const pass = SEVERITY_RANK[result.severity] <= SEVERITY_RANK[expect.maxSeverity];
		checks.push({ name: "maxSeverity", pass, got: result.severity, want: `<= ${expect.maxSeverity}` });
	}
	if (expect.injectionDetected !== undefined) {
		const detected = (result.injectionFlags ?? []).length > 0;
		checks.push({ name: "injectionDetected", pass: detected === expect.injectionDetected, got: result.injectionFlags, want: expect.injectionDetected });
	}
	if (expect.redactionsInclude !== undefined) {
		const got = result.redactions ?? [];
		const pass = expect.redactionsInclude.every((r) => got.includes(r));
		checks.push({ name: "redactions", pass, got, want: expect.redactionsInclude });
	}

	const passed = checks.filter((c) => c.pass).length;
	return { id: testCase.id, checks, passed, total: checks.length };
}

const results = [];
for (const testCase of cases) {
	const r = await runCase(testCase);
	results.push(r);
	const status = r.error ? "ERROR" : r.passed === r.total ? "PASS" : "FAIL";
	console.log(`${status.padEnd(5)} ${r.id.padEnd(24)} ${r.passed}/${r.total}`);
	for (const c of r.checks.filter((c) => !c.pass)) {
		console.log(`      ${c.name}: got ${JSON.stringify(c.got)}, want ${JSON.stringify(c.want)}`);
	}
}

const totalChecks = results.reduce((n, r) => n + r.total, 0);
const totalPassed = results.reduce((n, r) => n + r.passed, 0);
const casesPassed = results.filter((r) => !r.error && r.passed === r.total).length;
const accuracy = ((totalPassed / totalChecks) * 100).toFixed(1);

console.log("");
console.log(`Cases:  ${casesPassed}/${results.length} fully passed`);
console.log(`Checks: ${totalPassed}/${totalChecks} (${accuracy}%)`);

const THRESHOLD = Number(process.env.EVAL_THRESHOLD ?? 75);
if (Number(accuracy) < THRESHOLD) {
	console.error(`\nQuality gate FAILED: ${accuracy}% < ${THRESHOLD}% threshold`);
	process.exit(1);
}
console.log(`\nQuality gate passed: ${accuracy}% >= ${THRESHOLD}% threshold`);
