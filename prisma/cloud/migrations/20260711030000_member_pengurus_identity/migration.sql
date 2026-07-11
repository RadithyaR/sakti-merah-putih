-- Application-owned identity data for the hackathon Cloud SQL dataset.
-- Existing organizer tables and anonymized historical rows remain unchanged.

ALTER TABLE pengurus_koperasi
  ADD CONSTRAINT pengurus_koperasi_ref_koperasi_key UNIQUE (pengurus_ref, koperasi_ref);

ALTER TABLE anggota_koperasi
  ADD CONSTRAINT anggota_koperasi_ref_koperasi_key UNIQUE (anggota_ref, koperasi_ref);

CREATE TABLE app_pengurus_login (
  pengurus_ref text PRIMARY KEY,
  koperasi_ref text NOT NULL,
  username text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  role text NOT NULL DEFAULT 'Admin',
  dibuat_pada timestamp without time zone NOT NULL DEFAULT now(),
  diperbarui_pada timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT app_pengurus_login_pengurus_koperasi_fk
    FOREIGN KEY (pengurus_ref, koperasi_ref)
    REFERENCES pengurus_koperasi (pengurus_ref, koperasi_ref)
    ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE app_member_profile (
  anggota_ref text PRIMARY KEY,
  koperasi_ref text NOT NULL,
  phone text NOT NULL,
  email text,
  foto text NOT NULL,
  dibuat_pada timestamp without time zone NOT NULL DEFAULT now(),
  diperbarui_pada timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT app_member_profile_anggota_koperasi_fk
    FOREIGN KEY (anggota_ref, koperasi_ref)
    REFERENCES anggota_koperasi (anggota_ref, koperasi_ref)
    ON UPDATE CASCADE ON DELETE CASCADE
);

-- Historical NIK values are masked and duplicated. This protects only real
-- 16-digit NIK values created by the application, across every koperasi.
CREATE UNIQUE INDEX anggota_koperasi_real_nik_unique
  ON anggota_koperasi (nik)
  WHERE nik ~ '^[0-9]{16}$';
