-- ============================================================
-- Damrooh Database Schema
-- Target: PostgreSQL 15+
-- ORM: Prisma (recommended)
-- ============================================================

-- ── Users ──────────────────────────────────────────────────

CREATE TABLE users (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name         TEXT,
  email        TEXT        UNIQUE,
  phone        TEXT        UNIQUE,
  coins        INTEGER     NOT NULL DEFAULT 20,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);

-- ── Generation Sessions ────────────────────────────────────

CREATE TYPE generation_mode   AS ENUM ('dedicate', 'studio', 'sfx');
CREATE TYPE session_status    AS ENUM ('queued', 'lyrics', 'generating', 'covers', 'completed', 'partial', 'failed');
CREATE TYPE music_model       AS ENUM ('ace-1.5', 'lyria', 'elevenlabs');
CREATE TYPE model_mode        AS ENUM ('auto', 'manual');

CREATE TABLE generation_sessions (
  id               TEXT           PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id          TEXT           REFERENCES users(id) ON DELETE SET NULL,
  mode             generation_mode NOT NULL,
  status           session_status  NOT NULL DEFAULT 'queued',
  progress         SMALLINT        NOT NULL DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  -- Model selection
  selected_model   music_model     NOT NULL,
  model_mode       model_mode      NOT NULL DEFAULT 'auto',
  model_reason     TEXT,
  -- Payload
  input            JSONB           NOT NULL DEFAULT '{}',
  lyrics           JSONB,          -- LyricVariation[]
  tracks           JSONB           NOT NULL DEFAULT '[]', -- SessionTrack[]
  error            TEXT,
  created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id  ON generation_sessions(user_id);
CREATE INDEX idx_sessions_status   ON generation_sessions(status);
CREATE INDEX idx_sessions_mode     ON generation_sessions(mode);
CREATE INDEX idx_sessions_created  ON generation_sessions(created_at DESC);

-- ── Songs ──────────────────────────────────────────────────

CREATE TYPE song_mode AS ENUM ('dedicate', 'studio', 'sfx');

CREATE TABLE songs (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id  TEXT        NOT NULL REFERENCES generation_sessions(id) ON DELETE CASCADE,
  user_id     TEXT        REFERENCES users(id) ON DELETE SET NULL,
  title       TEXT        NOT NULL,
  mode        song_mode   NOT NULL,
  model       music_model NOT NULL,
  audio_url   TEXT        NOT NULL,
  cover_url   TEXT,
  duration    SMALLINT,   -- seconds
  lyrics      TEXT,
  tags        TEXT[]      NOT NULL DEFAULT '{}',
  is_public   BOOLEAN     NOT NULL DEFAULT FALSE,
  plays       INTEGER     NOT NULL DEFAULT 0,
  shares      INTEGER     NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_songs_user_id   ON songs(user_id);
CREATE INDEX idx_songs_is_public ON songs(is_public) WHERE is_public = TRUE;
CREATE INDEX idx_songs_mode      ON songs(mode);
CREATE INDEX idx_songs_created   ON songs(created_at DESC);

-- Full-text search on title + lyrics
CREATE INDEX idx_songs_fts ON songs
  USING GIN(to_tsvector('english', coalesce(title, '') || ' ' || coalesce(lyrics, '')));

-- ── Transactions ───────────────────────────────────────────

CREATE TYPE tx_type   AS ENUM ('purchase', 'spend', 'refund', 'bonus');
CREATE TYPE tx_status AS ENUM ('completed', 'pending', 'failed');

CREATE TABLE transactions (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coins         INTEGER     NOT NULL,
  amount_paise  INTEGER,    -- INR paise (1 INR = 100 paise)
  type          tx_type     NOT NULL,
  source        TEXT        NOT NULL, -- 'generate', 'unlock', 'download', 'signup', 'admin', 'payment'
  status        tx_status   NOT NULL DEFAULT 'completed',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- ── Queue Jobs ────────────────────────────────────────────

CREATE TYPE job_status AS ENUM ('queued', 'running', 'done', 'failed');

CREATE TABLE queue_jobs (
  id           TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  session_id   TEXT        NOT NULL REFERENCES generation_sessions(id) ON DELETE CASCADE,
  status       job_status  NOT NULL DEFAULT 'queued',
  error        TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  started_at   TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

CREATE INDEX idx_queue_jobs_status     ON queue_jobs(status);
CREATE INDEX idx_queue_jobs_session_id ON queue_jobs(session_id);

-- ── Helpers ────────────────────────────────────────────────

-- Auto-update updated_at via trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_sessions_updated_at
  BEFORE UPDATE ON generation_sessions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
