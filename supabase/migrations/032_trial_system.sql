-- ─── Trial system ────────────────────────────────────────────────────────────
-- Adds trial_started_at / trial_expires_at to profiles.
-- Trial starts when the user creates their FIRST project (not on signup).
-- The 7-day window is set by the application at that moment.
-- During an active trial, billing.ts returns avancado limits.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS trial_started_at  timestamptz,
  ADD COLUMN IF NOT EXISTS trial_expires_at  timestamptz;

COMMENT ON COLUMN profiles.trial_started_at IS
  'Timestamp when the user created their first project and the trial began. NULL means trial has not started yet.';

COMMENT ON COLUMN profiles.trial_expires_at IS
  'Timestamp when the 7-day free trial ends. NULL while trial has not started.';
