-- GED Math Academy / Profesor Cristóbal
-- Initial schema: no real student records should be entered until authentication and
-- organization-level access controls are implemented and reviewed.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS learners (
  id TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  preferred_language TEXT NOT NULL DEFAULT 'es' CHECK (preferred_language IN ('es','en')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS organization_memberships (
  organization_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('student','teacher','admin')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (organization_id, learner_id)
);

CREATE TABLE IF NOT EXISTS assessment_attempts (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  assessment_version TEXT NOT NULL,
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  total_answers INTEGER NOT NULL DEFAULT 0 CHECK (total_answers >= 0),
  CHECK (correct_answers <= total_answers)
);

CREATE TABLE IF NOT EXISTS assessment_responses (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES assessment_attempts(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  selected_answer TEXT NOT NULL,
  is_correct INTEGER NOT NULL CHECK (is_correct IN (0,1)),
  answered_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS skill_progress (
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  mastery_level INTEGER NOT NULL DEFAULT 0 CHECK (mastery_level BETWEEN 0 AND 4),
  last_practiced_at TEXT,
  verified_at TEXT,
  PRIMARY KEY (learner_id, skill_id)
);

CREATE TABLE IF NOT EXISTS lesson_attempts (
  id TEXT PRIMARY KEY,
  learner_id TEXT NOT NULL REFERENCES learners(id) ON DELETE CASCADE,
  skill_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed_at TEXT,
  practice_correct INTEGER NOT NULL DEFAULT 0 CHECK (practice_correct >= 0),
  practice_total INTEGER NOT NULL DEFAULT 0 CHECK (practice_total >= 0),
  CHECK (practice_correct <= practice_total)
);

CREATE INDEX IF NOT EXISTS idx_memberships_learner ON organization_memberships(learner_id);
CREATE INDEX IF NOT EXISTS idx_assessments_learner ON assessment_attempts(learner_id, started_at);
CREATE INDEX IF NOT EXISTS idx_responses_attempt ON assessment_responses(attempt_id);
CREATE INDEX IF NOT EXISTS idx_lessons_learner ON lesson_attempts(learner_id, completed_at);
