# SAKTI - Sistem Administrasi Koperasi Terintegrasi

Sistem pendaftaran anggota koperasi berbasis web dengan integrasi RFID reader dan database kependudukan. Dibuat untuk **Hackathon Koperasi Desa Merah Putih**.

## 🎯 Fitur Utama

- **RFID Scanner** - Tap kartu RFID untuk membaca data KTP warga secara otomatis
- **Database Kependudukan** - Data KTP tersimpan di database PostgreSQL, terintegrasi dengan RFID UID
- **Foto Digital** - Ambil foto anggota langsung dari webcam terintegrasi
- **Kartu Kopdes** - Tautkan UID kartu anggota Kopdes fisik pasca-pendaftaran, dipakai untuk verifikasi anggota ke depannya (menggantikan scan KTP berulang)
- **Simulasi Sidik Jari Cloud Run** - Enrol dan verifikasi alur sidik jari tanpa raw image atau template biometrik; menyimpan hanya status, jumlah tap, dan hash kode simulasi
- **Multi-Tenant** - Setiap koperasi memiliki akun admin dan data anggota terpisah
- **Dashboard** - Statistik dan ringkasan data anggota per koperasi
- **Manajemen Anggota** - Daftar, cari, filter, lihat detail, **edit**, dan **hapus** data anggota
- **Kartu Anggota (Print-Ready)** - Cetak kartu fisik ukuran CR80 (54 × 85.6 mm) langsung dari browser atau unduh sebagai PDF siap cetak

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Backend | Next.js API Routes (Route Handlers) |
| Database | PostgreSQL 17 + Prisma ORM 5 |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Icons | Lucide React |

## 🏗️ Arsitektur

```
Browser
  |
  +-- Server Components (Dashboard, Anggota, Detail)
  |     |-- Query PostgreSQL langsung via Prisma
  |     |-- Render HTML di server
  |     |-- Filter by koperasiId (dari JWT cookie)
  |
  +-- Client Components (Pendaftaran, Login)
  |     |-- RFID Scanner (USB HID)
  |     |-- Webcam Capture
  |     |-- Fetch ke API Routes
  |
  +-- API Routes
        |-- /api/auth/*       - Autentikasi (login, me)
        |-- /api/members/*    - CRUD anggota (GET/PUT/DELETE per-anggota)
        |-- /api/members/[id]/card - Generate PDF kartu anggota (CR80)
        |-- /api/members/[id]/card-uid - Tautkan UID kartu Kopdes fisik
        |-- /api/members/[id]/fingerprint/tap - Simulasi enrol satu tap (atau agent stasiun bila diaktifkan)
        |-- /api/members/[id]/fingerprint/verify - Verifikasi kode simulasi tanpa data biometrik
        |-- /api/ktp/lookup   - Lookup KTP by RFID UID
        |-- /api/rfid/scan    - Simulasi scan RFID
        |
        +-- PostgreSQL (koperasi_db)
              |-- Koperasi    - Data koperasi
              |-- User        - Admin/petugas koperasi
              |-- KtpRecord   - Database kependudukan (global)
              |-- Member      - Anggota koperasi (per koperasi)
```

## 📁 Struktur Folder

```
koperasi-merah-putih/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── seed.js                # Seed data (koperasi, admin, KTP)
│   └── migrations/            # Database migrations
├── public/
│   ├── photos/                # Foto anggota (dari webcam)
│   ├── card/                  # Assets templat kartu anggota (logo, back, ribbon)
│   └── logo.png               # Logo aplikasi
├── src/
│   ├── app/
│   │   ├── globals.css        # Design system (tema merah-putih)
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Landing page
│   │   ├── login/page.tsx     # Login
│   │   ├── (dashboard)/       # Dashboard group
│   │   │   ├── layout.tsx     # Sidebar + Navbar
│   │   │   ├── dashboard/     # Halaman dashboard
│   │   │   ├── pendaftaran/   # Pendaftaran anggota (RFID + foto)
│   │   │   └── anggota/       # Daftar, detail, edit & kartu anggota
│   │   │       ├── [id]/edit/  # Form edit data anggota
│   │   │       └── [id]/kartu/ # Halaman preview + cetak kartu anggota
│   │   └── api/               # API Routes
│   │       ├── auth/          # Login & me
│   │       ├── members/       # CRUD anggota
│   │       │   ├── [id]/card/     # Generate PDF kartu anggota
│   │       │   └── [id]/card-uid/ # Tautkan UID kartu Kopdes fisik
│   │       ├── ktp/           # Lookup KTP
│   │       └── rfid/          # Simulasi RFID
│   ├── components/
│   │   ├── Layout/            # Sidebar, Navbar
│   │   ├── RfidScanner.tsx    # Komponen RFID scanner (KTP)
│   │   ├── KopdesCardScanner.tsx # Komponen scan/tautkan UID kartu Kopdes
│   │   ├── KtpCard.tsx        # Card data KTP
│   │   ├── WebcamCapture.tsx  # Komponen webcam
│   │   ├── SearchFilter.tsx   # Search & filter
│   │   ├── Pagination.tsx     # Pagination
│   │   ├── MemberCard.tsx     # Kartu anggota depan/belakang (CR80)
│   │   ├── CardPrintActions.tsx # Tombol Cetak & Download PDF
│   │   ├── EditMemberForm.tsx # Form edit data anggota
│   │   └── DeleteMemberButton.tsx # Tombol hapus anggota + konfirmasi
│   └── lib/
│       ├── prisma.ts          # Prisma Client singleton
│       ├── auth.ts            # JWT & bcrypt helpers
│       └── utils.ts           # Utility functions
├── .env                       # Environment variables
└── package.json
```

## 📋 Prasyarat

- **Node.js** v18+
- **PostgreSQL** v14+
- **npm** v9+

## 🚀 Instalasi

### 1. Clone dan Install Dependencies

```bash
cd koperasi-merah-putih
npm install
```

### 2. Konfigurasi Environment

Edit file `.env`:

```env
DATABASE_URL="postgresql://postgres:PASSWORD@localhost:5432/koperasi_db"
JWT_SECRET="ganti-dengan-secret-key-anda"
# Opsional. Gunakan `station` hanya di workstation yang menjalankan agent CS9711.
FINGERPRINT_MODE="demo"
FINGERPRINT_AGENT_URL="http://127.0.0.1:7373"
```

Untuk Cloud Run, data KTP **mock** dan mapping `rfid_uid` berada di tabel Cloud SQL `app_ktp_mock`, bukan di database Prisma lokal. Setelah migration Cloud SQL, salin seed lokal dengan:

```bash
set -a; source <(rg '^DATABASE_URL=|^CLOUDSQL_DATABASE_URL=' .env); set +a
npm run cloud:seed-ktp-mock
```

### 3. Setup Database

```bash
# Buat database PostgreSQL
psql -U postgres -c "CREATE DATABASE koperasi_db;"

# Jalankan migration
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Seed data (koperasi, admin, KTP)
npx prisma db seed
```

### 4. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser: **http://localhost:3000**

## 🔐 Akun Login

Setelah seed, tersedia 3 akun admin untuk 3 koperasi berbeda:

| Username | Password | Koperasi |
|----------|----------|----------|
| `admin1` | `admin123` | Koperasi Desa Merah Putih |
| `admin2` | `admin123` | Koperasi Sejahtera |
| `admin3` | `admin123` | Koperasi Makmur |

## 📖 Cara Penggunaan

### 1. Pendaftaran Anggota Baru

Alur pendaftaran terdiri dari 5 langkah:

1. **Scan RFID** — Login sebagai admin koperasi, buka menu **Pendaftaran Anggota**, lalu tap kartu RFID KTP ke reader (atau klik **Simulasi** untuk demo). Data KTP otomatis tampil dari database kependudukan.
2. **Data & Foto** — Ambil foto anggota via webcam, isi nomor telepon dan email (opsional), lalu klik **Daftarkan Anggota**. Nomor anggota otomatis digenerate (format: `KODE-YYYYMMDD-XXXX`).
3. **Kartu Kopdes** — Masukkan atau tap UID kartu anggota Kopdes fisik (bukan KTP) dengan format tepat 10 digit, atau klik **Lewati untuk Saat Ini** jika kartu fisik belum tersedia. Kartu ini dipakai untuk verifikasi anggota ke depannya.
4. **Sidik Jari** — Untuk Cloud Run, klik **Simulasikan Tap** empat kali. Sistem menyimpan status enrol, jumlah tap, dan hash kode simulasi saja; tidak ada citra, vektor, minutiae, atau template sidik jari. Setelah selesai, kode enam digit dapat dipakai untuk menguji verifikasi.
5. **Selesai** — Ringkasan nomor anggota dan tombol cetak/unduh kartu.

Kalau langkah 3 dilewati saat pendaftaran, UID kartu Kopdes bisa ditautkan belakangan lewat halaman **Edit Anggota** (field "UID Kartu Kopdes") — juga berguna untuk mengganti kartu yang hilang/rusak.

### Mode Simulasi dan Stasiun Biometrik

Mode default `demo` aman untuk Cloud Run dan tidak membutuhkan perangkat USB. Ia tidak boleh diperlakukan sebagai autentikasi biometrik nyata. Bila nanti ada stasiun CS9711, set `FINGERPRINT_MODE=station`; jalankan matcher dan agent dari proyek `SAKTI-MerahPutih` pada workstation tersebut. Browser tetap tidak mendapat akses USB, dan frame maupun template tidak dikirim ke Cloud SQL.

### 2. RFID Reader

Aplikasi mendukung RFID reader USB dengan mode **HID Keyboard Emulation**, dipakai di dua tempat berbeda:
- **Scan KTP** (langkah 1 pendaftaran) — lookup ke database kependudukan via `/api/ktp/lookup`
- **Scan Kartu Kopdes** (langkah 3 pendaftaran, atau dari halaman edit) — hanya menautkan UID mentah ke anggota, tanpa lookup

Untuk keduanya: UID kartu otomatis terketik ke input field yang auto-focus, tekan **Enter** untuk konfirmasi.

### 3. Multi-Tenant

- Setiap koperasi memiliki data anggota terpisah
- Anggota yang sudah terdaftar di satu koperasi **tidak bisa** mendaftar di koperasi lain
- Dashboard hanya menampilkan statistik koperasi masing-masing

### 4. Cetak Kartu Anggota

Kartu fisik ukuran standar **CR80 (54 × 85.6 mm)**, tersedia dari halaman sukses pendaftaran atau halaman detail anggota:

1. Klik **Cetak Kartu Anggota** (setelah pendaftaran) atau **Cetak Kartu** (di halaman detail anggota)
2. Halaman `/anggota/[id]/kartu` menampilkan preview kartu depan (logo, nama koperasi, nama & NIK anggota) dan kartu belakang (templat KDMP Card)
3. **Cetak langsung**: tombol **Cetak Kartu** memakai `window.print()` dengan CSS `@media print` presisi mm — pastikan opsi *Background graphics* aktif dan skala **100%**
4. **Download PDF**: tombol **Download PDF** memanggil `/api/members/[id]/card`, menghasilkan PDF A4 berisi kartu depan + belakang berdampingan lengkap dengan crop mark, siap untuk dipotong dan dilaminasi

### 5. Edit & Hapus Anggota

Admin dapat mengubah atau menghapus data anggota dari halaman **Daftar Anggota** (kolom Aksi) atau halaman **Detail Anggota**:

- **Edit** (`/anggota/[id]/edit`) - ubah nama, nomor telepon, email, dan status (Aktif/Tidak Aktif). NIK dan data KTP tidak bisa diubah dari sini karena terhubung langsung ke database kependudukan.
- **Hapus** - meminta konfirmasi sebelum menghapus permanen. Hanya menghapus record `Member`; data KTP kependudukan (`KtpRecord`) tetap tersimpan untuk digunakan jika warga yang sama mendaftar kembali.
- Kedua aksi di-scope ke `koperasiId` admin yang login - admin koperasi lain tidak bisa mengedit/menghapus anggota koperasi lain meski menebak ID-nya.

## 🗄️ Database

### Anggota dan Pengurus Cloud SQL

Data operasional **pengurus** dan **anggota** memakai database Cloud SQL
`hackathon_2026`. Login aplikasi berada di `app_pengurus_login` dan memiliki
FK komposit ke `pengurus_koperasi (pengurus_ref, koperasi_ref)`. Pendaftaran
anggota menulis ke `anggota_koperasi` serta `app_member_profile`; `koperasi_ref`
selalu diambil dari JWT pengurus, bukan dari browser.

NIK riil 16 digit dibuat unik secara lintas koperasi melalui partial unique
index. Data historis panitia yang NIK-nya sudah termask tetap tidak diubah.
UID kartu anggota bersifat opsional, numerik 10 digit, dan unik secara global
(contoh: `0013910654`). UID ini berbeda dari RFID KTP mock. Data biometrik
belum disimpan pada model ini.

Untuk development lokal, jalankan Cloud SQL Auth Proxy pada port `5434` dan
atur `CLOUDSQL_DATABASE_URL` di `.env`; `DATABASE_URL` tetap dipakai Prisma
lokal untuk KTP mock. Sesudah proxy aktif:

```bash
npm run cloud:migrate
npm run cloud:seed-admins
```

Login demo: `admin1`, `admin2`, atau `admin3`, semuanya memakai password
`admin123`.

### Melihat Database via Prisma Studio

```bash
npx prisma studio
```

Buka: **http://localhost:5555**

### Melihat Database via pgAdmin

1. Buka pgAdmin
2. Connect ke PostgreSQL (host: localhost, port: 5432)
3. Buka database `koperasi_db`
4. Lihat tabel: `Koperasi`, `User`, `KtpRecord`, `Member`

### Schema Database

```
Koperasi (Data Koperasi)
├── id, nama, alamat, kode (unique)
├── users → User[]
└── members → Member[]

KtpRecord (Database Kependudukan - Global)
├── id, nik (unique), nama, tempatLahir, tanggalLahir
├── jenisKelamin, alamat, rtRw, kelurahan, kecamatan
├── kabupaten, provinsi, agama, statusPerkawinan, pekerjaan
├── rfidUid (unique) → Mapping ke kartu RFID
└── member → Member? (1:1)

Member (Anggota Koperasi)
├── id, memberId (unique), nik (unique)
├── nama, foto, phone, email
├── tanggalDaftar, status
├── koperasiId → Koperasi (relasi)
└── ktpRecord → KtpRecord (relasi)

User (Admin/Petugas)
├── id, username (unique), password (hashed)
├── nama, role
├── koperasiId → Koperasi (relasi)
└── createdAt
```

> Skema Prisma di atas adalah skema **aplikasi ini** (disederhanakan untuk alur pendaftaran anggota). Panitia hackathon juga menyediakan dataset skala penuh terpisah (27 tabel: transaksi, produk, aset, modal, dst.) yang telah dimigrasikan ke Cloud SQL milik tim — lihat [`docs/HACKATHON_DATABASE_SCHEMA.md`](docs/HACKATHON_DATABASE_SCHEMA.md) untuk skema lengkap, relasi antar tabel, dan detail migrasinya.

## 🎫 RFID UID Kartu Fisik

Kartu RFID yang sudah terdaftar di database:

| UID | Nama |
|-----|------|
| `4173892927` | Ahmad Suryadi |
| `2976549637` | Siti Nurhaliza |
| `1671654914` | Budi Santoso |
| `2708062991` | Dewi Lestari |

## 📜 Scripts

```bash
npm run dev              # Jalankan development server
npm run build            # Build untuk production
npm run start            # Jalankan production server
npm run lint             # Run ESLint
npx prisma studio        # Buka GUI database
npx prisma db seed       # Seed database
npx prisma migrate dev   # Buat dan apply migration
npx prisma generate      # Generate Prisma Client
```

## 🌐 Deployment

### Vercel + Supabase/Neon

1. Push kode ke GitHub
2. Import ke Vercel
3. Buat PostgreSQL di Supabase atau Neon
4. Set environment variables di Vercel:
   - `DATABASE_URL` - Connection string PostgreSQL
   - `JWT_SECRET` - Secret key untuk JWT
5. Deploy

### Self-Hosted

1. Build: `npm run build`
2. Start: `npm run start`
3. Gunakan reverse proxy (nginx) untuk HTTPS

## 📝 Lisensi

Dibuat untuk Hackathon Koperasi Desa Merah Putih.

---

**Dikembangkan dengan ❤️ untuk Koperasi Desa Merah Putih**
