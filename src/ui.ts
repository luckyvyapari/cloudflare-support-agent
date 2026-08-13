export const UI_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Cloudflare Support Agent</title>
<style>
  :root {
    --bg: #f6f6f7;
    --surface: #fff;
    --border: #e2e2e7;
    --text: #1d1d1f;
    --muted: #6e6e73;
    --accent: #f6821f;
    --accent-soft: #fff3e8;
    --blue: #0071e3;
    --blue-soft: #e8f1fb;
    --red: #d93025;
    --red-soft: #fce8e6;
    --green: #34a853;
    --green-soft: #e8f5e9;
    --yellow: #fbbc04;
    --yellow-soft: #fef9e7;
    --radius: 10px;
    --shadow: 0 2px 12px rgba(0,0,0,.07);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  .app { display: flex; flex-direction: column; min-height: 100vh; }
  .nav { background: #fff; border-bottom: 1px solid var(--border); padding: 0 24px; height: 52px; display: flex; align-items: center; gap: 16px; }
  .nav-logo { display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 15px; }
  .nav-logo svg { width: 28px; height: 28px; }
  .nav-right { margin-left: auto; display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--muted); }
  .nav-email { font-weight: 500; color: var(--text); }
  .btn-logout { background: none; border: 1px solid var(--border); padding: 4px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; color: var(--muted); }
  .btn-logout:hover { background: var(--bg); }

  .main { flex: 1; padding: 24px; max-width: 1100px; margin: 0 auto; width: 100%; }

  .login-wrap { display: flex; align-items: center; justify-content: center; min-height: 100vh; }
  .login-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 40px; width: 100%; max-width: 420px; box-shadow: var(--shadow); }
  .login-title { font-size: 22px; font-weight: 700; margin-bottom: 6px; }
  .login-sub { color: var(--muted); font-size: 14px; margin-bottom: 28px; }
  .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
  .tab-btn { padding: 8px 16px; border: none; background: none; cursor: pointer; font-size: 14px; color: var(--muted); border-bottom: 2px solid transparent; margin-bottom: -1px; }
  .tab-btn.active { color: var(--accent); border-color: var(--accent); font-weight: 600; }

  label { font-size: 13px; font-weight: 500; display: block; margin-bottom: 5px; }
  input[type=email], input[type=text], input[type=password], textarea {
    width: 100%; padding: 9px 12px; border: 1px solid var(--border); border-radius: 8px;
    font-size: 14px; outline: none; background: var(--bg); color: var(--text);
  }
  input:focus, textarea:focus { border-color: var(--blue); background: #fff; }
  .form-group { margin-bottom: 16px; }
  .btn { padding: 9px 18px; border-radius: 8px; border: none; cursor: pointer; font-size: 14px; font-weight: 600; transition: opacity .15s; }
  .btn:disabled { opacity: .5; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover:not(:disabled) { opacity: .88; }
  .btn-secondary { background: var(--bg); border: 1px solid var(--border); color: var(--text); }
  .btn-secondary:hover:not(:disabled) { background: #ececec; }
  .btn-blue { background: var(--blue); color: #fff; }
  .btn-blue:hover:not(:disabled) { opacity: .88; }
  .btn-sm { padding: 5px 12px; font-size: 12px; }
  .btn-full { width: 100%; }
  .error-msg { color: var(--red); font-size: 13px; margin-top: 8px; }

  .split { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
  .panel { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
  .panel-head { padding: 14px 16px; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; }
  .panel-title { font-weight: 600; font-size: 14px; }
  .panel-body { padding: 16px; }

  .ticket-list { list-style: none; }
  .ticket-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; border: 1px solid transparent; margin-bottom: 4px; }
  .ticket-item:hover { background: var(--bg); }
  .ticket-item.active { background: var(--accent-soft); border-color: var(--accent); }
  .ticket-id { font-size: 11px; font-family: monospace; color: var(--muted); }
  .ticket-cat { font-size: 12px; font-weight: 600; margin-top: 2px; text-transform: capitalize; }
  .ticket-status { font-size: 11px; }
  .new-ticket-btn { width: 100%; margin-bottom: 12px; }

  .nav-tabs { display: flex; gap: 2px; margin-left: 28px; }
  .nav-tab { padding: 6px 14px; border-radius: 7px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--muted); border: none; background: none; }
  .nav-tab:hover { color: var(--text); background: var(--bg); }
  .nav-tab.active { color: var(--accent); background: var(--accent-soft); font-weight: 600; }

  .ticket-filters { display: flex; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); flex-wrap: wrap; }
  .ticket-filters input, .ticket-filters select { padding: 6px 10px; font-size: 13px; border: 1px solid var(--border); border-radius: 7px; background: var(--bg); color: var(--text); }
  .ticket-filters input { flex: 1; min-width: 160px; }
  .ticket-filters select { min-width: 130px; }
  .ticket-count { font-size: 12px; color: var(--muted); padding: 0 16px; margin-top: 8px; }

  .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 40; }
  .modal-panel { position: fixed; top: 0; right: -600px; width: 600px; max-width: 94vw; height: 100vh; background: var(--surface); box-shadow: -12px 0 32px rgba(0,0,0,.18); z-index: 41; transition: right .22s ease; display: flex; flex-direction: column; }
  .modal-panel.open { right: 0; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 12px 16px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .modal-title { font-weight: 600; font-size: 14px; }
  .modal-actions { display: flex; gap: 6px; }
  .modal-icon-btn { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 7px; border: 1px solid var(--border); background: var(--bg); color: var(--muted); cursor: pointer; font-size: 15px; text-decoration: none; line-height: 1; }
  .modal-icon-btn:hover { background: var(--border); color: var(--text); }
  .modal-body { flex: 1; overflow-y: auto; padding: 16px; }

  .fullpage-wrap { max-width: 760px; margin: 0 auto; }

  table.data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.data-table thead th { text-align: left; padding: 9px 16px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); border-bottom: 1px solid var(--border); background: var(--bg); }
  table.data-table tbody tr { cursor: pointer; border-bottom: 1px solid var(--border); }
  table.data-table tbody tr:hover { background: var(--bg); }
  table.data-table tbody tr.active { background: var(--accent-soft); }
  table.data-table tbody tr:last-child { border-bottom: none; }
  table.data-table td { padding: 10px 16px; vertical-align: middle; }
  .td-id { font-family: monospace; font-size: 11.5px; color: var(--muted); }
  .td-email { font-size: 12.5px; color: var(--muted); }
  .td-cat { text-transform: capitalize; font-weight: 500; }
  .td-time { font-size: 12px; color: var(--muted); white-space: nowrap; }
  .sev-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; margin-right: 6px; }
  .sev-dot-low { background: var(--green); }
  .sev-dot-medium { background: #b5860a; }
  .sev-dot-high { background: #c75100; }
  .sev-dot-critical { background: var(--red); }
  .sev-dot-none { background: var(--border); }

  .chat-wrap { display: flex; flex-direction: column; height: 480px; }
  .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 10px; }
  .msg { max-width: 80%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
  .msg.customer { align-self: flex-end; background: var(--blue); color: #fff; border-bottom-right-radius: 4px; }
  .msg.agent { align-self: flex-start; background: var(--bg); color: var(--text); border-bottom-left-radius: 4px; }
  .msg.system { align-self: center; background: var(--yellow-soft); color: var(--muted); font-size: 12px; padding: 6px 12px; border-radius: 20px; }
  .msg-meta { font-size: 10px; opacity: .6; margin-top: 3px; }
  .chat-input { display: flex; gap: 8px; padding: 12px 16px; border-top: 1px solid var(--border); }
  .chat-input textarea { flex: 1; resize: none; height: 38px; font-size: 14px; }
  .chat-status { font-size: 12px; color: var(--muted); padding: 4px 16px; }

  .analysis-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px; margin-bottom: 14px; }
  .analysis-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
  .badge { padding: 3px 9px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
  .badge-low { background: var(--green-soft); color: var(--green); }
  .badge-medium { background: var(--yellow-soft); color: #b5860a; }
  .badge-high { background: #fff0e0; color: #c75100; }
  .badge-critical { background: var(--red-soft); color: var(--red); }
  .badge-escalated { background: var(--red-soft); color: var(--red); }
  .analysis-row { display: flex; gap: 10px; font-size: 13px; margin-bottom: 8px; }
  .analysis-label { color: var(--muted); min-width: 100px; }
  .conf-bar-wrap { flex: 1; background: var(--border); border-radius: 4px; height: 8px; margin-top: 4px; }
  .conf-bar { height: 8px; border-radius: 4px; background: var(--green); }

  .kb-section { margin-top: 14px; }
  .kb-title { font-size: 12px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; margin-bottom: 8px; }
  .kb-article { background: var(--blue-soft); border: 1px solid #cce0f7; border-radius: 8px; padding: 10px 12px; margin-bottom: 6px; }
  .kb-article-title { font-size: 13px; font-weight: 600; color: var(--blue); text-decoration: none; }
  .kb-article-title:hover { text-decoration: underline; }
  .kb-article-meta { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .kb-article-excerpt { font-size: 12px; color: var(--text); margin-top: 5px; line-height: 1.4; }
  .kb-score-bar { height: 3px; background: var(--blue); border-radius: 2px; margin-top: 5px; }

  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .chip { padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
  .chip-inject { background: var(--red-soft); color: var(--red); }
  .chip-pii { background: var(--yellow-soft); color: #b5860a; }
  .chip-guard { background: #f0e8ff; color: #7600c2; }

  .reply-area { margin-top: 14px; }
  .reply-area textarea { width: 100%; min-height: 80px; max-height: 260px; resize: none; overflow-y: auto; padding: 10px 12px; font-size: 13px; border: 1px solid var(--border); border-radius: 8px; transition: height .1s; }
  .reply-actions { display: flex; gap: 8px; margin-top: 8px; }

  .sim-ticket { background: var(--bg); border-radius: 8px; padding: 8px 10px; margin-bottom: 6px; font-size: 12px; }
  .sim-score { font-weight: 700; color: var(--accent); }

  .mt8 { margin-top: 8px; }
  .mt12 { margin-top: 12px; }
  .text-muted { color: var(--muted); font-size: 13px; }
  .text-center { text-align: center; }

  .flag-switch { position: relative; display: inline-block; width: 40px; height: 22px; flex-shrink: 0; }
  .flag-switch input { opacity: 0; width: 0; height: 0; }
  .flag-slider { position: absolute; cursor: pointer; inset: 0; background: var(--border); border-radius: 22px; transition: .15s; }
  .flag-slider::before { content: ""; position: absolute; height: 16px; width: 16px; left: 3px; bottom: 3px; background: #fff; border-radius: 50%; transition: .15s; }
  .flag-switch input:checked + .flag-slider { background: var(--accent); }
  .flag-switch input:checked + .flag-slider::before { transform: translateX(18px); }

  .trace-row { padding: 10px 16px; border-bottom: 1px solid var(--border); font-size: 12px; }
  .trace-row:last-child { border-bottom: none; }
  .trace-head { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
  .trace-event { font-weight: 600; font-family: monospace; font-size: 11.5px; }
  .trace-level { font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 8px; text-transform: uppercase; }
  .trace-level-info { background: var(--blue-soft); color: var(--blue); }
  .trace-level-warn { background: var(--yellow-soft); color: #b5860a; }
  .trace-level-error { background: var(--red-soft); color: var(--red); }
  .trace-ts { color: var(--muted); font-size: 10.5px; margin-left: auto; }
  .trace-fields { color: var(--muted); font-size: 11px; font-family: monospace; word-break: break-all; }
  .trace-ticket { color: var(--muted); font-size: 10.5px; }

  .eval-row { display: flex; align-items: center; gap: 10px; padding: 8px 16px; border-bottom: 1px solid var(--border); font-size: 12px; }
  .eval-status { font-size: 10px; font-weight: 800; padding: 2px 7px; border-radius: 4px; width: 40px; text-align: center; flex-shrink: 0; }
  .eval-status-pass { background: var(--green-soft); color: var(--green); }
  .eval-status-fail { background: var(--red-soft); color: var(--red); }
  .eval-id { font-family: monospace; font-weight: 600; flex-shrink: 0; width: 140px; }
  .eval-detail { color: var(--muted); font-size: 11px; }

  .tool-step { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 10px 12px; margin-bottom: 8px; }
  .tool-step-name { font-family: monospace; font-weight: 700; font-size: 12px; color: var(--blue); margin-bottom: 4px; }
  .tool-step-io { font-family: monospace; font-size: 11px; color: var(--muted); white-space: pre-wrap; word-break: break-all; }

  .ops-hero { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; margin-bottom: 16px; }
  .ops-hero-title { font-size: 16px; font-weight: 700; margin-bottom: 5px; }
  .ops-hero-sub { font-size: 13px; color: var(--muted); line-height: 1.55; max-width: 780px; }
  .ops-explain { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: 16px; }
  .ops-ex { background: var(--bg); border: 1px solid var(--border); border-radius: 9px; padding: 12px 13px; }
  .ops-ex-h { font-size: 12px; font-weight: 700; margin-bottom: 4px; }
  .ops-ex-b { font-size: 11.5px; color: var(--muted); line-height: 1.5; }

  .flag-state { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; }
  .flag-state-on { background: var(--accent-soft); color: #b8560f; }
  .flag-state-off { background: var(--bg); color: var(--muted); border: 1px solid var(--border); }
  .flag-effect { background: var(--bg); border-radius: 8px; padding: 10px 12px; margin-top: 12px; font-size: 12px; line-height: 1.55; color: var(--muted); }
  .flag-effect strong { color: var(--text); font-weight: 600; }
  .flag-meta { font-size: 11px; color: var(--muted); margin-top: 9px; line-height: 1.5; }

  .seg { display: inline-flex; background: var(--bg); border-radius: 8px; padding: 2px; gap: 2px; }
  .seg-btn { border: none; background: none; padding: 5px 13px; border-radius: 6px; font-size: 12px; font-weight: 600; color: var(--muted); cursor: pointer; }
  .seg-btn.active { background: var(--surface); color: var(--text); box-shadow: 0 1px 3px rgba(0,0,0,.09); }

  .trace-group { border-bottom: 1px solid var(--border); }
  .trace-group:last-child { border-bottom: none; }
  .trace-group-head { display: flex; align-items: center; gap: 9px; padding: 11px 16px; background: var(--bg); cursor: pointer; }
  .trace-group-head:hover { background: #ededf0; }
  .trace-group-title { font-size: 12px; font-weight: 700; }
  .trace-group-meta { font-size: 11px; color: var(--muted); }
  .trace-chevron { margin-left: auto; color: var(--muted); font-size: 10px; }
  .trace-spans { padding: 8px 16px 14px 18px; }
  .span { position: relative; padding: 7px 0 7px 22px; }
  .span::before { content: ""; position: absolute; left: 4px; top: 0; bottom: 0; width: 1px; background: var(--border); }
  .span:last-child::before { bottom: auto; height: 14px; }
  .span-dot { position: absolute; left: 0; top: 11px; width: 9px; height: 9px; border-radius: 50%; box-shadow: 0 0 0 2px var(--surface); }
  .span-dot-info { background: var(--blue); }
  .span-dot-warn { background: #d99400; }
  .span-dot-error { background: var(--red); }
  .span-head { display: flex; align-items: baseline; gap: 8px; }
  .span-name { font-family: monospace; font-size: 12px; font-weight: 700; }
  .span-desc { font-size: 11.5px; color: var(--muted); }
  .span-off { font-size: 10.5px; color: var(--muted); margin-left: auto; white-space: nowrap; }
  .span-fields { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 6px; }
  .fpill { background: var(--bg); border: 1px solid var(--border); border-radius: 5px; padding: 2px 7px; font-size: 10.5px; font-family: monospace; color: var(--muted); }
  .fpill b { color: var(--text); font-weight: 600; }
  .fpill-warn { background: var(--yellow-soft); border-color: #f0e2ad; color: #8a6400; }
  .fpill-bad { background: var(--red-soft); border-color: #f5cac6; color: var(--red); }

  .eval-head-bar { padding: 12px 16px; border-bottom: 1px solid var(--border); background: var(--bg); }

  @media (max-width: 900px) { .ops-explain { grid-template-columns: 1fr; } }
  @media (max-width: 700px) { .split { grid-template-columns: 1fr; } }
</style>
</head>
<body>
<div class="app" id="app">
  <div class="login-wrap" id="login-screen">
    <div class="login-card">
      <div class="nav-logo" style="margin-bottom:16px">
        <svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="#f6821f"/><path d="M44 36c0 6.627-5.373 12-12 12S20 42.627 20 36c0-3.8 1.777-7.185 4.55-9.4L24 24l16 4-1.55 2.6C41.088 31.905 44 33.8 44 36z" fill="#fff"/></svg>
        Cloudflare Support Agent
      </div>
      <div id="quick-login">
        <button class="btn btn-primary btn-full" onclick="quickLoginCustomer()">Login as Customer</button>
        <p class="text-muted text-center" style="font-size:11.5px;margin-top:4px">demo@example.com &middot; no password</p>
        <button class="btn btn-blue btn-full mt12" onclick="quickLoginSupport()">Login as Support Agent</button>
        <p class="text-muted text-center" style="font-size:11.5px;margin-top:4px">key auto-filled &middot; demo access</p>
        <div class="error-msg text-center" id="quick-login-error"></div>
        <p class="text-center mt12"><a href="#" onclick="event.preventDefault();showLoginTab('advanced')" style="font-size:12px;color:var(--muted)">Use a different email or key</a></p>
      </div>
      <div id="advanced-login" style="display:none">
        <div class="tabs">
          <button class="tab-btn active" onclick="showLoginTab('customer')">Customer</button>
          <button class="tab-btn" onclick="showLoginTab('support')">Support Agent</button>
        </div>
        <div id="customer-login">
          <div class="form-group">
            <label>Email address</label>
            <input type="email" id="login-email" placeholder="you@example.com" onkeydown="if(event.key==='Enter')loginCustomer()" />
          </div>
          <button class="btn btn-primary btn-full" onclick="loginCustomer()">Continue</button>
          <div class="error-msg" id="login-error"></div>
          <p class="text-muted mt12 text-center" style="font-size:12px">No password needed. Enter your email to open a ticket</p>
        </div>
        <div id="support-login" style="display:none">
          <div class="form-group">
            <label>Support access key</label>
            <input type="password" id="support-key" placeholder="cf-support-2026" onkeydown="if(event.key==='Enter')loginSupport()" />
          </div>
          <button class="btn btn-blue btn-full" onclick="loginSupport()">Sign in as Support Agent</button>
          <div class="error-msg" id="support-error"></div>
        </div>
        <p class="text-center mt12"><a href="#" onclick="event.preventDefault();showLoginTab('quick')" style="font-size:12px;color:var(--muted)">&larr; Back to quick login</a></p>
      </div>
    </div>
  </div>

  <div id="main-screen" style="display:none">
    <nav class="nav">
      <div class="nav-logo">
        <svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="32" fill="#f6821f"/><path d="M44 36c0 6.627-5.373 12-12 12S20 42.627 20 36c0-3.8 1.777-7.185 4.55-9.4L24 24l16 4-1.55 2.6C41.088 31.905 44 33.8 44 36z" fill="#fff"/></svg>
        Cloudflare Support
      </div>
      <div class="nav-tabs" id="nav-tabs" style="display:none">
        <button class="nav-tab active" onclick="location.hash='#/tickets'">All Tickets</button>
        <button class="nav-tab" onclick="location.hash='#/kb'">Knowledge Base</button>
        <button class="nav-tab" onclick="location.hash='#/metrics'">Metrics</button>
        <button class="nav-tab" onclick="location.hash='#/ops'">Ops</button>
      </div>
      <div class="nav-right">
        <span class="nav-email" id="nav-email"></span>
        <button class="btn-logout" onclick="logout()">Sign out</button>
      </div>
    </nav>

    <div class="main">
      <!-- Customer view -->
      <div id="customer-view">
        <div class="split">
          <div>
            <button class="btn btn-primary new-ticket-btn" onclick="newTicket()">+ New Ticket</button>
            <div class="panel">
              <div class="panel-head"><span class="panel-title">My Tickets</span></div>
              <div class="panel-body" style="padding:8px">
                <ul class="ticket-list" id="customer-ticket-list">
                  <li class="text-muted text-center" style="padding:20px;font-size:13px">No tickets yet</li>
                </ul>
              </div>
            </div>
          </div>
          <div>
            <div class="panel" id="chat-panel">
              <div class="panel-head">
                <span class="panel-title" id="chat-title">New Ticket</span>
                <span id="chat-status-badge"></span>
              </div>
              <div class="chat-wrap">
                <div class="chat-messages" id="chat-messages">
                  <div class="msg system">Describe your issue to open a support ticket. Powered by Workers AI + Vectorize.</div>
                </div>
                <div class="chat-status" id="chat-status-text"></div>
                <div class="chat-input">
                  <textarea id="chat-input" placeholder="Describe your issue…" onkeydown="chatKeydown(event)"></textarea>
                  <button class="btn btn-primary" onclick="sendMessage()" id="send-btn">Send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Support agent view -->
      <div id="support-view" style="display:none">
        <div id="support-tickets-tab">
          <div id="tickets-table-view">
            <div class="panel">
              <div class="ticket-filters">
                <input type="text" id="tf-search" placeholder="Search email or ticket ID…" oninput="renderTicketTable()" />
                <select id="tf-status" onchange="renderTicketTable()">
                  <option value="">All statuses</option>
                  <option value="open">Open</option>
                  <option value="analyzed">Analyzed</option>
                  <option value="escalated">Escalated</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select id="tf-category" onchange="renderTicketTable()">
                  <option value="">All categories</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="account">Account</option>
                  <option value="security">Security</option>
                  <option value="feature-request">Feature request</option>
                  <option value="other">Other</option>
                </select>
                <button class="btn btn-secondary btn-sm" onclick="loadAllTickets()">Refresh</button>
              </div>
              <div class="ticket-count" id="ticket-count"></div>
              <div style="overflow-x:auto">
                <table class="data-table">
                  <thead><tr><th>Ticket</th><th>Customer</th><th>Category</th><th>Severity</th><th>Status</th><th>Created</th></tr></thead>
                  <tbody id="support-ticket-tbody">
                    <tr><td colspan="6" class="text-muted text-center" style="padding:24px">Loading…</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div id="ticket-fullpage-view" style="display:none" class="fullpage-wrap">
            <button class="btn btn-secondary btn-sm" style="margin-bottom:14px" onclick="location.hash='#/tickets'">&larr; Back to all tickets</button>
            <div id="fullpage-detail-body"></div>
          </div>
        </div>

        <div id="support-metrics-tab" style="display:none">
          <div id="metrics-content">
            <div class="text-muted text-center" style="padding:40px">Loading metrics…</div>
          </div>
        </div>

        <div id="support-kb-tab" style="display:none">
          <div class="panel">
            <div class="panel-head">
              <span class="panel-title">Knowledge Base (15 articles, limited for demo)</span>
              <button class="btn btn-secondary btn-sm" onclick="loadKBArticles()">Refresh</button>
            </div>
            <div class="panel-body">
              <p class="text-muted" style="font-size:13px;margin-bottom:16px">
                Articles from <a href="https://support.cloudflare.com" target="_blank" style="color:var(--blue)">support.cloudflare.com</a>,
                embedded into Vectorize with <code>type:"kb"</code> metadata filter.
                Analysis auto-retrieves top-3 relevant articles per ticket. Production: incremental scrape via Cron Worker.
              </p>
              <div id="kb-article-list">
                <div class="text-muted">Loading…</div>
              </div>
            </div>
          </div>
        </div>

        <div id="support-ops-tab" style="display:none">
          <div class="ops-hero">
            <div class="ops-hero-title">Ops Console</div>
            <div class="ops-hero-sub">
              LLM agents are non-deterministic. The same ticket can be classified differently run to run.
              You cannot ship that safely with deploys alone. This page is the safety net: change behavior
              without redeploying, replay exactly what the agent did, and measure quality on a fixed test set.
            </div>
            <div class="ops-explain">
              <div class="ops-ex">
                <div class="ops-ex-h">1 &middot; Ship behind a KV flag</div>
                <div class="ops-ex-b">New behavior deploys turned <b>off</b>. Flip a KV key to enable it, live in ~60s across every edge location, no redeploy. Bad outcome? Flip it back in one click instead of a rollback.</div>
              </div>
              <div class="ops-ex">
                <div class="ops-ex-h">2 &middot; Traces</div>
                <div class="ops-ex-b">One customer message = one <b>trace ID</b> spanning every step: retrieval, guardrails, model call, escalation. When the analysis looks wrong, you replay the trace to find which step broke.</div>
              </div>
              <div class="ops-ex">
                <div class="ops-ex-h">3 &middot; Evals</div>
                <div class="ops-ex-b">A fixed set of 12 tickets with known-correct answers. Run it after every prompt or model change to catch regressions before customers do.</div>
              </div>
            </div>
          </div>

          <div class="split" style="grid-template-columns: 340px 1fr">
            <div style="display:flex;flex-direction:column;gap:16px">
              <div class="panel">
                <div class="panel-head">
                  <span class="panel-title">Feature Flag &middot; KV</span>
                  <span id="flag-state-pill" class="flag-state flag-state-off">Loading</span>
                </div>
                <div class="panel-body">
                  <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px">
                    <div>
                      <div style="font-weight:700;font-size:13px;font-family:monospace">AUTO_ESCALATE</div>
                      <div class="text-muted" style="font-size:11.5px;margin-top:2px">Controls when a ticket is forced to a human</div>
                    </div>
                    <label class="flag-switch">
                      <input type="checkbox" id="flag-auto-escalate" onchange="toggleFlag(this)" />
                      <span class="flag-slider"></span>
                    </label>
                  </div>

                  <div class="flag-effect" id="flag-effect">Loading current value from KV…</div>

                  <div class="flag-meta">
                    <strong style="color:var(--text)">Try it:</strong> flip the switch, open any ticket, press
                    <em>Re-analyze</em>, then come back here. The new trace shows the flag&rsquo;s effect on
                    <code>escalate</code>. No deploy in between.
                  </div>
                  <div class="flag-meta" id="flag-status">&nbsp;</div>
                </div>
              </div>

              <div class="panel">
                <div class="panel-head">
                  <span class="panel-title">Eval Suite</span>
                  <button class="btn btn-primary btn-sm" onclick="runEvals()" id="run-evals-btn">Run Suite</button>
                </div>
                <div class="panel-body">
                  <p class="text-muted" style="font-size:12px;line-height:1.55;margin-bottom:10px">
                    12 tickets with known-correct answers. Each runs through the <em>real</em> <code>analyze()</code>
                    path: same model, same retrieval, same guardrails as production.
                  </p>
                  <div class="flag-effect" style="margin-top:0">
                    <strong>Checks:</strong> category match &middot; severity bounds &middot; escalation decision
                    &middot; prompt-injection caught &middot; PII redacted
                  </div>
                  <div id="eval-summary" class="text-muted" style="font-size:12px;margin-top:10px">Not run yet.</div>
                </div>
              </div>
            </div>

            <div class="panel">
              <div class="panel-head">
                <div class="seg">
                  <button class="seg-btn active" id="seg-traces" onclick="showOpsView('traces')">Traces</button>
                  <button class="seg-btn" id="seg-evals" onclick="showOpsView('evals')">Eval Results</button>
                </div>
                <button class="btn btn-secondary btn-sm" onclick="loadTraces()">Refresh</button>
              </div>
              <div class="panel-body" style="padding:0">
                <div id="ops-traces-view">
                  <div id="trace-list"><div class="text-muted" style="padding:16px">Loading…</div></div>
                </div>
                <div id="ops-evals-view" style="display:none">
                  <div id="eval-results"><div class="text-muted" style="padding:16px">Press <strong>Run Suite</strong> to execute the 12 test cases.</div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div id="ticket-modal-backdrop" class="modal-backdrop" style="display:none" onclick="if(event.target===this) location.hash='#/tickets'"></div>
    <div id="ticket-modal-panel" class="modal-panel">
      <div class="modal-header">
        <span class="modal-title">Ticket Details</span>
        <div class="modal-actions">
          <a href="#" id="modal-open-fullpage" class="modal-icon-btn" title="Open in full page">&#8599;</a>
          <button class="modal-icon-btn" onclick="location.hash='#/tickets'" title="Close">&times;</button>
        </div>
      </div>
      <div class="modal-body" id="modal-detail-body"></div>
    </div>
  </div>
</div>

<script>
var token = localStorage.getItem('cf_token') || '';
var role = localStorage.getItem('cf_role') || '';
var email = localStorage.getItem('cf_email') || '';
var activeTicketId = null;
var activeSpecialistId = null;
var currentDetail = { ticketId: '', specialistId: '' };

async function boot() {
  if (!token) { showScreen('login'); return; }
  try {
    var me = await api('GET', '/api/auth/me');
    email = me.email; role = me.role;
    localStorage.setItem('cf_email', email);
    localStorage.setItem('cf_role', role);
    showScreen('main');
    document.getElementById('nav-email').textContent = email + (role === 'support' ? ' (Support)' : '');
    if (role === 'support') {
      document.getElementById('customer-view').style.display = 'none';
      document.getElementById('support-view').style.display = 'block';
      document.getElementById('nav-tabs').style.display = 'flex';
      await loadAllTickets();
      route();
    } else {
      loadMyTickets();
    }
  } catch(e) { logout(); }
}

window.addEventListener('hashchange', route);

function route() {
  if (role !== 'support') return;
  var hash = location.hash;
  if (hash.charAt(0) === '#') hash = hash.slice(1);
  if (hash.charAt(0) === '/') hash = hash.slice(1);
  var parts = hash.split('/').filter(Boolean);
  var top = parts[0] || 'tickets';

  if (top === 'ticket' && parts[1]) {
    showSupportTab('tickets');
    closeModal();
    document.getElementById('tickets-table-view').style.display = 'none';
    document.getElementById('ticket-fullpage-view').style.display = '';
    openFullPage(parts[1]);
    return;
  }

  document.getElementById('ticket-fullpage-view').style.display = 'none';
  document.getElementById('tickets-table-view').style.display = '';

  var validTabs = ['tickets', 'kb', 'metrics', 'ops'];
  var tab = validTabs.indexOf(top) !== -1 ? top : 'tickets';
  showSupportTab(tab);

  if (tab === 'tickets' && parts[1]) {
    openModalForTicket(parts[1]);
  } else {
    closeModal();
  }
}

function showScreen(s) {
  document.getElementById('login-screen').style.display = s === 'login' ? '' : 'none';
  document.getElementById('main-screen').style.display = s === 'main' ? '' : 'none';
}

function showLoginTab(t) {
  if (t === 'quick' || t === 'advanced') {
    document.getElementById('quick-login').style.display = t === 'quick' ? '' : 'none';
    document.getElementById('advanced-login').style.display = t === 'advanced' ? '' : 'none';
    return;
  }
  document.getElementById('customer-login').style.display = t === 'customer' ? '' : 'none';
  document.getElementById('support-login').style.display = t === 'support' ? '' : 'none';
  document.querySelectorAll('.tab-btn').forEach(function(b, i) {
    b.classList.toggle('active', (t === 'customer' && i === 0) || (t === 'support' && i === 1));
  });
}

async function completeLogin(promise, errEl) {
  try {
    var r = await promise;
    token = r.token; role = r.role; email = r.email;
    localStorage.setItem('cf_token', token);
    localStorage.setItem('cf_role', role);
    localStorage.setItem('cf_email', email);
    boot();
  } catch(e) { document.getElementById(errEl).textContent = e.message; }
}

function quickLoginCustomer() {
  completeLogin(
    api('POST', '/api/auth/login', { email: 'demo@example.com' }).then(function(r) { r.email = 'demo@example.com'; return r; }),
    'quick-login-error'
  );
}

function quickLoginSupport() {
  completeLogin(
    api('POST', '/api/auth/support', { key: 'cf-support-2026' }).then(function(r) { r.email = 'support@cloudflare.internal'; return r; }),
    'quick-login-error'
  );
}

function loginCustomer() {
  var emailVal = document.getElementById('login-email').value.trim();
  if (!emailVal) { document.getElementById('login-error').textContent = 'Email required'; return; }
  completeLogin(
    api('POST', '/api/auth/login', { email: emailVal }).then(function(r) { r.email = emailVal; return r; }),
    'login-error'
  );
}

function loginSupport() {
  var key = document.getElementById('support-key').value.trim();
  completeLogin(
    api('POST', '/api/auth/support', { key: key }).then(function(r) { r.email = 'support@cloudflare.internal'; return r; }),
    'support-error'
  );
}

function logout() {
  localStorage.clear();
  token = ''; role = ''; email = ''; activeTicketId = null; activeSpecialistId = null;
  showScreen('login');
}

function newTicket() {
  activeTicketId = null; activeSpecialistId = null;
  document.getElementById('chat-messages').innerHTML = '<div class="msg system">Describe your issue to open a support ticket. Powered by Workers AI + Vectorize.</div>';
  document.getElementById('chat-input').value = '';
  document.getElementById('chat-title').textContent = 'New Ticket';
  document.getElementById('chat-status-badge').innerHTML = '';
  document.getElementById('chat-status-text').textContent = '';
  document.querySelectorAll('.ticket-item').forEach(function(el) { el.classList.remove('active'); });
}

async function loadMyTickets() {
  var list = document.getElementById('customer-ticket-list');
  try {
    var data = await api('GET', '/api/tickets');
    var tickets = data.tickets;
    if (!tickets.length) { list.innerHTML = '<li class="text-muted text-center" style="padding:20px;font-size:13px">No tickets yet</li>'; return; }
    list.innerHTML = tickets.map(function(t) {
      return '<li class="ticket-item" data-id="' + escHtml(t.id) + '" data-sid="' + escHtml(t.specialist_id || t.id) + '" onclick="openTicketFromEl(this)">' +
        '<div class="ticket-id">#' + t.id.slice(0,8) + '</div>' +
        '<div class="ticket-cat">' + (t.routed_category || 'general') + '</div>' +
        '<div class="ticket-status">' + statusBadge(t.status) + '</div>' +
        '</li>';
    }).join('');
  } catch(e) {}
}

async function sendMessage() {
  var input = document.getElementById('chat-input');
  var msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  var btn = document.getElementById('send-btn');
  btn.disabled = true;
  appendMsg('customer', msg);
  setStatus('Routing ticket via RouterAgent…');
  try {
    if (!activeTicketId) {
      var r = await api('POST', '/api/tickets', { message: msg });
      activeTicketId = r.ticketId;
      activeSpecialistId = r.specialistId;
      document.getElementById('chat-title').textContent = 'Ticket #' + r.ticketId.slice(0,8) + ' · ' + r.category;
      setStatus('AI analysis running…');
      try {
        var analysis = await api('POST', '/api/tickets/' + activeSpecialistId + '/analyze');
        showStatusBanner(analysis);
        if (analysis.kbArticles && analysis.kbArticles.length) {
          appendMsg('system', 'Found ' + analysis.kbArticles.length + ' relevant KB article(s): ' + analysis.kbArticles.map(function(a){return a.title;}).join(', '));
        }
      } catch(te) {}
      setStatus('');
      loadMyTickets();
    } else {
      await api('POST', '/api/tickets/' + activeSpecialistId + '/message', { role: 'customer', content: msg });
      setStatus('');
    }
  } catch(e) { setStatus('Error: ' + e.message); }
  btn.disabled = false;
}

function chatKeydown(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function openTicketFromEl(el) {
  openCustomerTicket(el.dataset.id, el.dataset.sid || el.dataset.id, el);
}

async function openCustomerTicket(ticketId, specialistId, el) {
  activeTicketId = ticketId;
  activeSpecialistId = specialistId || ticketId;
  document.querySelectorAll('.ticket-item').forEach(function(e) { e.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('chat-title').textContent = 'Ticket #' + ticketId.slice(0,8);
  document.getElementById('chat-status-text').textContent = '';
  try {
    var state = await api('GET', '/api/tickets/' + activeSpecialistId);
    var chatEl = document.getElementById('chat-messages');
    chatEl.innerHTML = '';
    (state.messages || []).forEach(function(m) { appendMsg(m.role, m.content, m.ts); });
    if (state.lastAnalysis) showStatusBanner(state.lastAnalysis);
  } catch(e) {}
}

function appendMsg(msgRole, content, ts) {
  var el = document.createElement('div');
  el.className = 'msg ' + msgRole;
  el.innerHTML = escHtml(content) + (ts ? '<div class="msg-meta">' + new Date(ts).toLocaleTimeString() + '</div>' : '');
  var chat = document.getElementById('chat-messages');
  chat.appendChild(el);
  chat.scrollTop = chat.scrollHeight;
}

function setStatus(s) { document.getElementById('chat-status-text').textContent = s; }

function showStatusBanner(analysis) {
  var s = analysis.escalate ? 'escalated' : analysis.severity;
  var labels = { low: 'Self-service likely', medium: 'Agent reviewing', high: 'Priority review', critical: 'Critical, escalated', escalated: 'Specialist assigned' };
  document.getElementById('chat-status-badge').innerHTML =
    '<span class="badge badge-' + s + '">' + (labels[s] || s) + '</span>';
}

function showSupportTab(tab) {
  document.getElementById('support-tickets-tab').style.display = tab === 'tickets' ? '' : 'none';
  document.getElementById('support-kb-tab').style.display = tab === 'kb' ? '' : 'none';
  document.getElementById('support-metrics-tab').style.display = tab === 'metrics' ? '' : 'none';
  document.getElementById('support-ops-tab').style.display = tab === 'ops' ? '' : 'none';
  document.querySelectorAll('.nav-tab').forEach(function(b, i) {
    b.classList.toggle('active',
      (tab === 'tickets' && i === 0) || (tab === 'kb' && i === 1) || (tab === 'metrics' && i === 2) || (tab === 'ops' && i === 3));
  });
  if (tab === 'metrics') loadMetrics();
  if (tab === 'kb') loadKBArticles();
  if (tab === 'ops') { loadFlags(); loadTraces(); }
}

function showOpsView(v) {
  document.getElementById('ops-traces-view').style.display = v === 'traces' ? '' : 'none';
  document.getElementById('ops-evals-view').style.display = v === 'evals' ? '' : 'none';
  document.getElementById('seg-traces').classList.toggle('active', v === 'traces');
  document.getElementById('seg-evals').classList.toggle('active', v === 'evals');
}

function renderFlagState(on) {
  var pill = document.getElementById('flag-state-pill');
  pill.textContent = on ? 'On' : 'Off';
  pill.className = 'flag-state ' + (on ? 'flag-state-on' : 'flag-state-off');
  document.getElementById('flag-effect').innerHTML = on
    ? '<strong>On &mdash; strict mode.</strong> Every ticket analyzed as <code>high</code> or <code>critical</code> is forced to <code>escalate: true</code>, even when the model is confident it can be auto-resolved. Fewer bad auto-resolutions, more human load.'
    : '<strong>Off &mdash; model decides.</strong> Escalation comes from the model&rsquo;s own judgement plus guardrails (low confidence, too little detail, prompt injection). High severity alone does not force a human.';
}

async function loadFlags() {
  var box = document.getElementById('flag-auto-escalate');
  var status = document.getElementById('flag-status');
  try {
    var data = await api('GET', '/api/admin/flags');
    var on = !!data.flags.AUTO_ESCALATE;
    box.checked = on;
    renderFlagState(on);
    status.innerHTML = 'KV key <code>AUTO_ESCALATE</code> = <code>' + on + '</code>';
  } catch(e) { status.textContent = 'Error: ' + e.message; }
}

async function toggleFlag(el) {
  var status = document.getElementById('flag-status');
  var newVal = el.checked;
  el.disabled = true;
  status.textContent = 'Writing to KV…';
  try {
    await api('POST', '/api/admin/flags', { key: 'AUTO_ESCALATE', value: newVal });
    renderFlagState(newVal);
    status.innerHTML = 'KV key <code>AUTO_ESCALATE</code> = <code>' + newVal + '</code> &middot; propagating to all edge locations (~60s)';
    loadTraces();
  } catch(e) { status.textContent = 'Error: ' + e.message; el.checked = !newVal; renderFlagState(!newVal); }
  el.disabled = false;
}

// Plain-English label for each instrumented step in the agent pipeline
var SPAN_DESC = {
  'analyze.start': 'Agent begins classifying the ticket',
  'analyze.complete': 'Classification finished',
  'queue.escalation_published': 'Escalation pushed to Cloudflare Queue',
  'investigate.tool_called': 'Model called a tool to look up a fact',
};

// Fields worth highlighting when they signal a problem
function fieldClass(key, val) {
  if (key === 'escalate' && val === true) return 'fpill fpill-warn';
  if (key === 'guardrails' && Array.isArray(val) && val.length) return 'fpill fpill-warn';
  if (key === 'injectionFlags' && Array.isArray(val) && val.length) return 'fpill fpill-bad';
  if (key === 'severity' && (val === 'high' || val === 'critical')) return 'fpill fpill-warn';
  if (key === 'confidence' && typeof val === 'number' && val < 0.5) return 'fpill fpill-warn';
  return 'fpill';
}

function fmtVal(v) {
  if (v === null || v === undefined) return '-';
  if (Array.isArray(v)) return v.length ? v.join(', ') : 'none';
  if (typeof v === 'object') return JSON.stringify(v);
  var s = String(v);
  return s.length > 90 ? s.slice(0, 90) + '…' : s;
}

var collapsedTraces = {};

function toggleTraceGroup(id) {
  collapsedTraces[id] = !collapsedTraces[id];
  loadTracesRender();
}

var lastTraces = [];

async function loadTraces() {
  var el = document.getElementById('trace-list');
  try {
    var data = await api('GET', '/api/admin/traces');
    lastTraces = data.traces || [];
    loadTracesRender();
  } catch(e) { el.innerHTML = '<div class="error-msg" style="padding:16px">' + e.message + '</div>'; }
}

function loadTracesRender() {
  var el = document.getElementById('trace-list');
  if (!lastTraces.length) {
    el.innerHTML = '<div class="text-muted" style="padding:20px;font-size:13px;line-height:1.6">' +
      'No traces yet. Open any ticket and press <strong>Re-analyze</strong>. Every step of that run appears here, grouped under one trace ID.</div>';
    return;
  }

  var order = [];
  var map = {};
  lastTraces.forEach(function(t) {
    if (!map[t.trace_id]) { map[t.trace_id] = []; order.push(t.trace_id); }
    map[t.trace_id].push(t);
  });

  el.innerHTML = order.map(function(tid) {
    var evs = map[tid].slice().sort(function(a, b) { return a.created_at - b.created_at; });
    var t0 = evs[0].created_at;
    var span = evs[evs.length - 1].created_at - t0;
    var ticket = evs[0].ticket_id || '';
    var worst = evs.some(function(e) { return e.level === 'error'; }) ? 'error'
      : evs.some(function(e) { return e.level === 'warn'; }) ? 'warn' : 'info';
    var collapsed = collapsedTraces[tid];

    var head = '<div class="trace-group-head" onclick="toggleTraceGroup(' + JSON.stringify(tid) + ')">' +
      '<span class="trace-level trace-level-' + worst + '">' + worst + '</span>' +
      '<span class="trace-group-title">' + (ticket ? escHtml(ticket.slice(0, 34)) : 'system') + '</span>' +
      '<span class="trace-group-meta">' + evs.length + ' step' + (evs.length === 1 ? '' : 's') +
        ' &middot; ' + span + 'ms &middot; ' + new Date(t0).toLocaleTimeString() + '</span>' +
      '<span class="trace-chevron">' + (collapsed ? '&#9654;' : '&#9660;') + '</span>' +
      '</div>';

    if (collapsed) return '<div class="trace-group">' + head + '</div>';

    var spans = evs.map(function(e) {
      var fields = {};
      try { fields = JSON.parse(e.fields || '{}'); } catch(err) {}
      var pills = Object.keys(fields).map(function(k) {
        return '<span class="' + fieldClass(k, fields[k]) + '"><b>' + escHtml(k) + '</b> ' + escHtml(fmtVal(fields[k])) + '</span>';
      }).join('');
      return '<div class="span">' +
        '<span class="span-dot span-dot-' + e.level + '"></span>' +
        '<div class="span-head">' +
          '<span class="span-name">' + escHtml(e.event) + '</span>' +
          '<span class="span-desc">' + escHtml(SPAN_DESC[e.event] || '') + '</span>' +
          '<span class="span-off">+' + (e.created_at - t0) + 'ms</span>' +
        '</div>' +
        (pills ? '<div class="span-fields">' + pills + '</div>' : '') +
        '</div>';
    }).join('');

    return '<div class="trace-group">' + head + '<div class="trace-spans">' + spans + '</div></div>';
  }).join('');
}

async function runEvals() {
  var btn = document.getElementById('run-evals-btn');
  var summary = document.getElementById('eval-summary');
  var results = document.getElementById('eval-results');
  btn.disabled = true;
  btn.textContent = 'Running…';
  summary.textContent = 'Running 12 cases against live analyze()…';
  showOpsView('evals');
  results.innerHTML = '<div class="text-muted" style="padding:16px">Running 12 cases. Each one hits the real model, so this takes ~20-40s…</div>';
  try {
    var data = await api('POST', '/api/admin/evals/run');
    var good = data.accuracy >= 75;
    summary.innerHTML = '<strong style="color:' + (good ? 'var(--green)' : 'var(--red)') + ';font-size:15px">' +
      data.accuracy + '%</strong> of checks passed<br>' +
      '<span style="font-size:11.5px">' + data.casesPassed + '/' + data.totalCases + ' cases fully clean &middot; ' +
      data.totalPassed + '/' + data.totalChecks + ' individual checks</span>';

    var bar = '<div class="eval-head-bar">' +
      '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">' +
        '<span><strong>' + data.totalPassed + '</strong> of <strong>' + data.totalChecks + '</strong> checks passed</span>' +
        '<span style="font-weight:700;color:' + (good ? 'var(--green)' : 'var(--red)') + '">' + data.accuracy + '%</span>' +
      '</div>' +
      '<div style="background:var(--border);border-radius:4px;height:8px">' +
        '<div style="width:' + data.accuracy + '%;height:8px;border-radius:4px;background:' + (good ? 'var(--green)' : 'var(--red)') + '"></div>' +
      '</div></div>';

    results.innerHTML = bar + data.results.map(function(r) {
      var allPass = !r.error && r.passed === r.total;
      var detail;
      if (r.error) {
        detail = 'ERROR: ' + r.error;
      } else {
        detail = r.checks.map(function(c) {
          return c.pass
            ? c.name + ' ok'
            : c.name + ': got ' + JSON.stringify(c.got) + ', want ' + JSON.stringify(c.want);
        }).join(' · ');
      }
      return '<div class="eval-row">' +
        '<span class="eval-status ' + (allPass ? 'eval-status-pass' : 'eval-status-fail') + '">' + (allPass ? 'PASS' : 'FAIL') + '</span>' +
        '<span class="eval-id">' + escHtml(r.id) + '</span>' +
        '<span class="eval-detail">' + escHtml(detail) + '</span>' +
        '</div>';
    }).join('');
    loadTraces();
  } catch(e) {
    summary.textContent = 'Error: ' + e.message;
    results.innerHTML = '<div class="error-msg" style="padding:16px">' + e.message + '</div>';
  }
  btn.disabled = false;
  btn.textContent = 'Run Suite';
}

async function loadKBArticles() {
  var el = document.getElementById('kb-article-list');
  if (!el) return;
  el.innerHTML = '<div class="text-muted">Loading…</div>';
  try {
    var data = await api('GET', '/api/kb');
    var articles = data.articles || [];
    if (!articles.length) { el.innerHTML = '<div class="text-muted">No articles yet. Run <code>npm run seed-kb</code></div>'; return; }
    var catColors = { billing: 'var(--accent)', technical: 'var(--blue)', account: 'var(--green)', security: 'var(--red)' };
    var grouped = {};
    articles.forEach(function(a) {
      if (!grouped[a.category]) grouped[a.category] = [];
      grouped[a.category].push(a);
    });
    var html = '';
    Object.keys(grouped).sort().forEach(function(cat) {
      html += '<div style="margin-bottom:20px">' +
        '<div class="kb-title" style="color:' + (catColors[cat] || 'var(--muted)') + '">' + cat.toUpperCase() + ' (' + grouped[cat].length + ')</div>';
      grouped[cat].forEach(function(a) {
        html += '<div class="kb-article">' +
          '<a class="kb-article-title" href="' + escHtml(a.url) + '" target="_blank">' + escHtml(a.title) + '</a>' +
          '<div class="kb-article-meta">Embedded in Vectorize &middot; queried on every analysis</div>' +
          '</div>';
      });
      html += '</div>';
    });
    el.innerHTML = html;
  } catch(e) { el.innerHTML = '<div class="error-msg">' + e.message + '</div>'; }
}

async function loadMetrics() {
  var el = document.getElementById('metrics-content');
  el.innerHTML = '<div class="text-muted text-center" style="padding:40px">Loading…</div>';
  try {
    var m = await api('GET', '/api/admin/metrics');
    el.innerHTML = renderMetrics(m);
  } catch(e) { el.innerHTML = '<div class="error-msg" style="padding:16px">' + e.message + '</div>'; }
}

function renderMetrics(m) {
  var t = m.totals;
  var resHours = m.avgResolutionHours != null ? m.avgResolutionHours.toFixed(1) + 'h' : 'N/A';
  var resolveRate = t.total > 0 ? Math.round(t.resolved / t.total * 100) : 0;

  function statCard(label, value, color) {
    return '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:16px 20px;text-align:center">' +
      '<div style="font-size:28px;font-weight:700;color:' + color + '">' + value + '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + label + '</div>' +
      '</div>';
  }

  function barRow(label, count, total, color) {
    var pct = total > 0 ? Math.round(count / total * 100) : 0;
    return '<div style="margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px">' +
      '<span>' + label + '</span><span style="font-weight:600">' + count + ' (' + pct + '%)</span></div>' +
      '<div style="background:var(--border);border-radius:4px;height:10px">' +
      '<div style="width:' + pct + '%;height:10px;border-radius:4px;background:' + color + '"></div></div></div>';
  }

  var catColors = { billing: '#f6821f', technical: '#0071e3', account: '#34a853', security: '#d93025', 'feature-request': '#7600c2', other: '#6e6e73', unknown: '#aaa' };
  var sevColors = { low: '#34a853', medium: '#fbbc04', high: '#f6821f', critical: '#d93025', unknown: '#aaa' };

  var html = '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin-bottom:20px">' +
    statCard('Total Tickets', t.total, 'var(--text)') +
    statCard('Open', t.open, 'var(--blue)') +
    statCard('Escalated', t.escalated, 'var(--red)') +
    statCard('Resolved', t.resolved, 'var(--green)') +
    statCard('Resolve Rate', resolveRate + '%', 'var(--green)') +
    statCard('Avg Resolution', resHours, 'var(--accent)') +
    '</div>';

  html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">';

  html += '<div class="panel"><div class="panel-head"><span class="panel-title">By Category</span></div><div class="panel-body">';
  m.byCategory.forEach(function(r) {
    html += barRow(r.category, r.count, t.total, catColors[r.category] || '#0071e3');
  });
  html += '</div></div>';

  html += '<div class="panel"><div class="panel-head"><span class="panel-title">By Severity</span></div><div class="panel-body">';
  m.bySeverity.forEach(function(r) {
    html += barRow(r.severity, r.count, t.total, sevColors[r.severity] || '#aaa');
  });
  if (!m.bySeverity.length) html += '<div class="text-muted">No severity data yet. Analyze tickets first.</div>';
  html += '</div></div>';

  html += '</div>';

  html += '<div class="panel" style="margin-top:16px"><div class="panel-head"><span class="panel-title">Queue</span></div>' +
    '<div class="panel-body"><p class="text-muted" style="font-size:13px">' +
    'Escalation events published to <code>escalation-events</code> Cloudflare Queue. ' +
    'Consumer processes each batch (max 10 messages, 5s timeout). ' +
    'Production: fan out to Salesforce case creation, Slack/PagerDuty, SLA timer.' +
    '</p></div></div>';

  return html;
}

var allTicketsRaw = [];

async function loadAllTickets() {
  var tbody = document.getElementById('support-ticket-tbody');
  tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center" style="padding:24px">Loading…</td></tr>';
  try {
    var data = await api('GET', '/api/tickets');
    allTicketsRaw = data.tickets || [];
    renderTicketTable();
  } catch(e) { tbody.innerHTML = '<tr><td colspan="6" class="error-msg" style="padding:16px">' + e.message + '</td></tr>'; }
}

function renderTicketTable() {
  var tbody = document.getElementById('support-ticket-tbody');
  var countEl = document.getElementById('ticket-count');
  var search = (document.getElementById('tf-search').value || '').toLowerCase().trim();
  var statusFilter = document.getElementById('tf-status').value;
  var catFilter = document.getElementById('tf-category').value;

  var filtered = allTicketsRaw.filter(function(t) {
    if (statusFilter && t.status !== statusFilter) return false;
    if (catFilter && t.routed_category !== catFilter) return false;
    if (search && t.id.toLowerCase().indexOf(search) === -1 && (t.user_email || '').toLowerCase().indexOf(search) === -1) return false;
    return true;
  });

  countEl.textContent = filtered.length + ' of ' + allTicketsRaw.length + ' tickets';

  if (!filtered.length) {
    tbody.innerHTML = '<tr><td colspan="6" class="text-muted text-center" style="padding:24px">No tickets match these filters</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(function(t) {
    var sev = t.severity || 'none';
    var created = new Date(t.created_at);
    var timeStr = created.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + created.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return '<tr data-id="' + escHtml(t.id) + '" data-sid="' + escHtml(t.specialist_id || t.id) + '" onclick="openDetailFromEl(this)">' +
      '<td class="td-id">#' + t.id.slice(0,8) + '</td>' +
      '<td class="td-email">' + escHtml(t.user_email) + '</td>' +
      '<td class="td-cat">' + escHtml(t.routed_category || 'general') + '</td>' +
      '<td><span class="sev-dot sev-dot-' + sev + '"></span>' + sev + '</td>' +
      '<td>' + statusBadge(t.status) + '</td>' +
      '<td class="td-time">' + timeStr + '</td>' +
      '</tr>';
  }).join('');

  if (currentDetail.ticketId) {
    var activeRow = document.querySelector('#support-ticket-tbody tr[data-id="' + currentDetail.ticketId + '"]');
    if (activeRow && document.getElementById('ticket-modal-panel').classList.contains('open')) activeRow.classList.add('active');
  }
}

function openDetailFromEl(el) {
  var id = el.dataset.id;
  if (location.hash === '#/tickets/' + id) { openModalForTicket(id); }
  else { location.hash = '#/tickets/' + id; }
}

function findTicketMeta(ticketId) {
  return allTicketsRaw.filter(function(t) { return t.id === ticketId; })[0];
}

function openModal() {
  document.getElementById('ticket-modal-backdrop').style.display = 'block';
  document.getElementById('ticket-modal-panel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('ticket-modal-backdrop').style.display = 'none';
  document.getElementById('ticket-modal-panel').classList.remove('open');
  document.body.style.overflow = '';
  document.querySelectorAll('#support-ticket-tbody tr.active').forEach(function(e) { e.classList.remove('active'); });
}

async function openModalForTicket(ticketId) {
  var meta = findTicketMeta(ticketId);
  var sid = meta ? (meta.specialist_id || meta.id) : ticketId;
  currentDetail.ticketId = ticketId;
  currentDetail.specialistId = sid;
  document.getElementById('modal-open-fullpage').setAttribute('href', '#/ticket/' + ticketId);
  openModal();
  document.querySelectorAll('#support-ticket-tbody tr.active').forEach(function(e) { e.classList.remove('active'); });
  var row = document.querySelector('#support-ticket-tbody tr[data-id="' + ticketId + '"]');
  if (row) row.classList.add('active');
  await loadDetailInto('modal-detail-body', ticketId, sid);
}

async function openFullPage(ticketId) {
  var meta = findTicketMeta(ticketId);
  var sid = meta ? (meta.specialist_id || meta.id) : ticketId;
  currentDetail.ticketId = ticketId;
  currentDetail.specialistId = sid;
  await loadDetailInto('fullpage-detail-body', ticketId, sid);
}

async function loadDetailInto(containerId, ticketId, specialistId) {
  var detail = document.getElementById(containerId);
  detail.innerHTML = '<div class="text-muted text-center" style="padding:20px">Loading…</div>';
  try {
    var results = await Promise.all([
      api('GET', '/api/tickets/' + specialistId),
      api('GET', '/api/tickets/' + specialistId + '/replies'),
    ]);
    var state = results[0];
    var replies = results[1].replies || [];
    detail.innerHTML = renderSupportDetail(ticketId, specialistId, state, state.lastAnalysis, replies);
  } catch(e) { detail.innerHTML = '<div class="error-msg" style="padding:16px">' + e.message + '</div>'; }
}

function renderSupportDetail(ticketId, specialistId, state, t, replies) {
  var sev = t ? (t.escalate ? 'escalated' : t.severity) : 'medium';
  var conf = t ? Math.round(t.confidence * 100) : 0;
  var html = '<div class="analysis-card">' +
    '<div class="analysis-header">' +
    '<span class="badge badge-' + sev + '">' + sev + '</span>' +
    (t && t.escalate ? '<span class="badge badge-escalated">ESCALATED</span>' : '') +
    '<strong style="font-size:14px">' + escHtml(t ? t.category : 'Not analyzed yet') + '</strong>' +
    '</div>' +
    '<div class="analysis-row"><span class="analysis-label">Summary</span><span>' + escHtml(t ? t.summary : 'Run analysis to see a summary') + '</span></div>' +
    '<div class="analysis-row"><span class="analysis-label">Proposed fix</span><span>' + escHtml(t ? (t.proposedFix || 'n/a') : 'n/a') + '</span></div>' +
    '<div class="analysis-row"><span class="analysis-label">Confidence</span><div style="flex:1"><div>' + conf + '%</div>' +
    '<div class="conf-bar-wrap"><div class="conf-bar" style="width:' + conf + '%"></div></div></div></div>' +
    '<div class="analysis-row"><span class="analysis-label">Model</span><span style="font-size:12px;font-family:monospace">' + escHtml(t ? (t.modelUsed || 'n/a') : 'n/a') + '</span></div>';

  if (t && (t.guardrails && t.guardrails.length || t.injectionFlags && t.injectionFlags.length || t.redactions && t.redactions.length)) {
    html += '<div class="chips">';
    (t.guardrails || []).forEach(function(g) { html += '<span class="chip chip-guard">guardrail:' + escHtml(g) + '</span>'; });
    (t.injectionFlags || []).forEach(function(f) { html += '<span class="chip chip-inject">injection:' + escHtml(f) + '</span>'; });
    (t.redactions || []).forEach(function(r) { html += '<span class="chip chip-pii">PII:' + escHtml(r) + '</span>'; });
    html += '</div>';
  }
  html += '</div>';

  // KB articles retrieved by RAG for this ticket, shows the source of the suggestion
  if (t && t.kbArticles && t.kbArticles.length) {
    html += '<div class="kb-section"><div class="kb-title">Knowledge Base Articles Used (' + t.kbArticles.length + ')</div>';
    t.kbArticles.forEach(function(a) {
      html += '<div class="kb-article">' +
        '<a class="kb-article-title" href="' + escHtml(a.url) + '" target="_blank">' + escHtml(a.title) + '</a>' +
        '<div class="kb-article-meta">' + escHtml(a.category) + ' &middot; relevance ' + Math.round(a.score * 100) + '%</div>' +
        (a.excerpt ? '<div class="kb-article-excerpt">' + escHtml(a.excerpt.slice(0, 140)) + '…</div>' : '') +
        '<div class="kb-score-bar" style="width:' + Math.round(a.score * 100) + '%"></div>' +
        '</div>';
    });
    html += '</div>';
  }

  if (t && t.similarTickets && t.similarTickets.length) {
    html += '<div class="kb-section"><div class="kb-title">Similar Past Tickets</div>';
    t.similarTickets.forEach(function(s) {
      html += '<div class="sim-ticket"><span class="sim-score">' + Math.round(s.score * 100) + '%</span> ' + escHtml(s.summary) + '</div>';
    });
    html += '</div>';
  }

  // Conversation thread
  html += '<div class="kb-section"><div class="kb-title">Conversation</div>' +
    '<div style="background:var(--bg);border-radius:8px;padding:12px;max-height:200px;overflow-y:auto">';
  (state.messages || []).forEach(function(m) {
    html += '<div style="margin-bottom:8px"><strong style="font-size:11px;color:var(--muted);text-transform:capitalize">' + escHtml(m.role) + '</strong>' +
      '<div style="font-size:13px">' + escHtml(m.content) + '</div></div>';
  });
  replies.forEach(function(r) {
    html += '<div style="margin-bottom:8px;background:#fff3e8;border-radius:6px;padding:6px 8px">' +
      '<strong style="font-size:11px;color:var(--accent)">' + escHtml(r.author_email) + ' (support)</strong>' +
      '<div style="font-size:13px">' + escHtml(r.content) + '</div></div>';
  });
  html += '</div></div>';

  // Reply area. Buttons read currentDetail so there are no quoted args to worry about escaping
  html += '<div class="reply-area"><div class="kb-title">Reply to Customer</div>' +
    '<textarea id="reply-input" placeholder="Write your reply…" oninput="autoGrow(this)"></textarea>' +
    '<div class="reply-actions">' +
    '<button class="btn btn-secondary btn-sm" onclick="draftReply()">AI Draft</button>' +
    '<button class="btn btn-blue btn-sm" onclick="sendReply()">Send Reply</button>' +
    '</div></div>';

  html += '<div class="reply-actions mt8">' +
    '<button class="btn btn-secondary btn-sm" onclick="triggerAnalyze()">Re-analyze</button>' +
    '<button class="btn btn-secondary btn-sm" onclick="triggerInvestigate()">Investigate</button>' +
    '</div>' +
    '<div id="investigate-results"></div>';

  return html;
}

async function draftReply() {
  var sid = currentDetail.specialistId;
  var input = document.getElementById('reply-input');
  if (!input || !sid) return;
  input.value = 'Generating draft…';
  input.disabled = true;
  try {
    var r = await api('POST', '/api/tickets/' + sid + '/draft');
    input.value = r.draft || '';
    autoGrow(input);
  } catch(e) { input.value = ''; alert('Draft failed: ' + e.message); }
  input.disabled = false;
}

async function refreshCurrentDetail() {
  var id = currentDetail.ticketId;
  if (!id) return;
  await loadAllTickets();
  if (document.getElementById('ticket-modal-panel').classList.contains('open')) {
    openModalForTicket(id);
  } else if (document.getElementById('ticket-fullpage-view').style.display !== 'none') {
    openFullPage(id);
  }
}

async function sendReply() {
  var sid = currentDetail.specialistId;
  var input = document.getElementById('reply-input');
  if (!input || !sid) return;
  var content = input.value.trim();
  if (!content) return;
  try {
    await api('POST', '/api/tickets/' + sid + '/reply', { content: content });
    input.value = '';
    await refreshCurrentDetail();
  } catch(e) { alert('Reply failed: ' + e.message); }
}

async function triggerAnalyze() {
  var sid = currentDetail.specialistId;
  if (!sid) return;
  try {
    await api('POST', '/api/tickets/' + sid + '/analyze');
    await refreshCurrentDetail();
  } catch(e) { alert('Analysis failed: ' + e.message); }
}

async function triggerInvestigate() {
  var sid = currentDetail.specialistId;
  var box = document.getElementById('investigate-results');
  if (!sid || !box) return;
  box.innerHTML = '<div class="kb-section"><div class="kb-title">Tool Calling: Investigation</div>' +
    '<div class="text-muted" style="font-size:12px">Calling tools (lookup_order, lookup_account, get_refund_policy)…</div></div>';
  try {
    var r = await api('POST', '/api/tickets/' + sid + '/investigate');
    var steps = r.steps || [];
    var html = '<div class="kb-section"><div class="kb-title">Tool Calling: Investigation (' + steps.length + ' call' + (steps.length === 1 ? '' : 's') + ')</div>';
    if (!steps.length) {
      html += '<div class="text-muted" style="font-size:12px">Model answered directly, no tool calls needed.</div>';
    }
    steps.forEach(function(s, i) {
      html += '<div class="tool-step">' +
        '<div class="tool-step-name">#' + (i + 1) + ' ' + escHtml(s.tool) + '(' + escHtml(JSON.stringify(s.arguments)) + ')</div>' +
        '<div class="tool-step-io">→ ' + escHtml(JSON.stringify(s.output)) + '</div>' +
        '</div>';
    });
    html += '<div style="background:var(--blue-soft);border-radius:8px;padding:10px 12px;margin-top:6px">' +
      '<div style="font-size:11px;font-weight:700;color:var(--blue);text-transform:uppercase;letter-spacing:.04em;margin-bottom:4px">Recommendation</div>' +
      '<div style="font-size:13px">' + escHtml(r.recommendation || '') + '</div>' +
      '</div></div>';
    box.innerHTML = html;
  } catch(e) {
    var msg = e.message || '';
    var friendly = msg.indexOf('no messages') !== -1
      ? 'No conversation data in current session. Create a new ticket and run Investigate on it to demo tool calling.'
      : 'Investigation failed: ' + msg;
    box.innerHTML = '<div class="text-muted" style="padding:8px 0;font-size:12px">' + friendly + '</div>';
  }
}

async function resolveTicket() {
  var sid = currentDetail.specialistId;
  if (!sid) return;
  var note = prompt('Resolution note:');
  if (note === null) return;
  try {
    await api('POST', '/api/tickets/' + sid + '/resolve', { note: note || 'Resolved by support agent' });
    await refreshCurrentDetail();
  } catch(e) { alert('Resolve failed: ' + e.message); }
}

async function api(method, path, body) {
  var res = await fetch(path, {
    method: method,
    headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + token },
    body: body ? JSON.stringify(body) : undefined,
  });
  var ct = res.headers.get('content-type') || '';
  if (ct.indexOf('application/json') === -1) {
    throw new Error('Server error ' + res.status + '. Check Worker logs.');
  }
  var data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed (' + res.status + ')');
  return data;
}

function statusBadge(s) {
  var colors = { open: 'var(--blue)', analyzed: 'var(--accent)', escalated: 'var(--red)', resolved: 'var(--green)' };
  return '<span style="color:' + (colors[s] || 'var(--muted)') + ';font-weight:600">' + s + '</span>';
}

function escHtml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function autoGrow(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 260) + 'px';
}

boot();
</script>
</body>
</html>`;
