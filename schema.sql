CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer',
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS tickets_meta (
  id TEXT PRIMARY KEY,
  user_email TEXT NOT NULL,
  routed_category TEXT,
  specialist_id TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS agent_replies (
  id TEXT PRIMARY KEY,
  ticket_id TEXT NOT NULL,
  author_email TEXT NOT NULL,
  content TEXT NOT NULL,
  is_auto_draft INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS kb_articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS trace_events (
  id TEXT PRIMARY KEY,
  trace_id TEXT NOT NULL,
  ticket_id TEXT,
  level TEXT NOT NULL,
  event TEXT NOT NULL,
  fields TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_email ON tickets_meta(user_email);
CREATE INDEX IF NOT EXISTS idx_replies_ticket ON agent_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_trace_created ON trace_events(created_at);
