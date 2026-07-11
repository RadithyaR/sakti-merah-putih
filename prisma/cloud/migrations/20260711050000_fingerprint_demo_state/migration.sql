ALTER TABLE app_member_profile
  ADD COLUMN IF NOT EXISTS fingerprint_mode varchar(16) NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS fingerprint_enrollment_taps integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS fingerprint_enrolled_at timestamptz,
  ADD COLUMN IF NOT EXISTS fingerprint_demo_secret_hash varchar(64);

DO $$
BEGIN
  ALTER TABLE app_member_profile
    ADD CONSTRAINT app_member_profile_fingerprint_mode_check
    CHECK (fingerprint_mode IN ('none', 'demo', 'station'));
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE app_member_profile
    ADD CONSTRAINT app_member_profile_fingerprint_taps_check
    CHECK (fingerprint_enrollment_taps >= 0 AND fingerprint_enrollment_taps <= 15);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
