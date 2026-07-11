CREATE TABLE IF NOT EXISTS app_ktp_mock (
  nik varchar(16) PRIMARY KEY,
  rfid_uid varchar(128) NOT NULL UNIQUE,
  nama text NOT NULL,
  tempat_lahir text NOT NULL,
  tanggal_lahir date NOT NULL,
  jenis_kelamin varchar(1) NOT NULL,
  alamat text NOT NULL,
  rt_rw varchar(32) NOT NULL,
  kelurahan text NOT NULL,
  kecamatan text NOT NULL,
  kabupaten text NOT NULL,
  provinsi text NOT NULL,
  agama text NOT NULL,
  status_perkawinan text NOT NULL,
  pekerjaan text NOT NULL,
  dibuat_pada timestamptz NOT NULL DEFAULT now(),
  diperbarui_pada timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT app_ktp_mock_nik_format CHECK (nik ~ '^[0-9]{16}$'),
  CONSTRAINT app_ktp_mock_gender_check CHECK (jenis_kelamin IN ('L', 'P'))
);

CREATE INDEX IF NOT EXISTS app_ktp_mock_rfid_uid_idx ON app_ktp_mock (rfid_uid);
