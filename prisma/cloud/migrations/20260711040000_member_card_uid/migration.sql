ALTER TABLE app_member_profile
  ADD COLUMN IF NOT EXISTS member_card_uid varchar(10);

CREATE UNIQUE INDEX IF NOT EXISTS app_member_profile_member_card_uid_unique
  ON app_member_profile (member_card_uid)
  WHERE member_card_uid IS NOT NULL;

DO $$ BEGIN
  ALTER TABLE app_member_profile
    ADD CONSTRAINT app_member_profile_member_card_uid_format
    CHECK (member_card_uid IS NULL OR member_card_uid ~ '^[0-9]{10}$');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
