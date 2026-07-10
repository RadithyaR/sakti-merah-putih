# SAKTI - Sistem Administrasi Koperasi Terintegrasi

Sistem pendaftaran anggota koperasi berbasis web dengan integrasi RFID reader dan database kependudukan. Dibuat untuk **Hackathon Koperasi Desa Merah Putih**.

## 🎯 Fitur Utama

- **RFID Scanner** - Tap kartu RFID untuk membaca data KTP warga secara otomatis
- **Database Kependudukan** - Data KTP tersimpan di database PostgreSQL, terintegrasi dengan RFID UID
- **Foto Digital** - Ambil foto anggota langsung dari webcam terintegrasi
- **Multi-Tenant** - Setiap koperasi memiliki akun admin dan data anggota terpisah
- **Dashboard** - Statistik dan ringkasan data anggota per koperasi
- **Manajemen Anggota** - Daftar, cari, filter, dan lihat detail anggota
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
        |-- /api/members/*    - CRUD anggota
        |-- /api/members/[id]/card - Generate PDF kartu anggota (CR80)
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
│   │   │   └── anggota/       # Daftar, detail & kartu anggota
│   │   │       └── [id]/kartu/ # Halaman preview + cetak kartu anggota
│   │   └── api/               # API Routes
│   │       ├── auth/          # Login & me
│   │       ├── members/       # CRUD anggota
│   │       │   └── [id]/card/ # Generate PDF kartu anggota
│   │       ├── ktp/           # Lookup KTP
│   │       └── rfid/          # Simulasi RFID
│   ├── components/
│   │   ├── Layout/            # Sidebar, Navbar
│   │   ├── RfidScanner.tsx    # Komponen RFID scanner
│   │   ├── KtpCard.tsx        # Card data KTP
│   │   ├── WebcamCapture.tsx  # Komponen webcam
│   │   ├── SearchFilter.tsx   # Search & filter
│   │   ├── Pagination.tsx     # Pagination
│   │   ├── MemberCard.tsx     # Kartu anggota depan/belakang (CR80)
│   │   └── CardPrintActions.tsx # Tombol Cetak & Download PDF
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

1. Login sebagai admin koperasi
2. Buka menu **Pendaftaran Anggota**
3. Tap kartu RFID ke reader, atau klik **Simulasi** untuk demo
4. Data KTP otomatis tampil dari database kependudukan
5. Ambil foto anggota via webcam
6. Isi nomor telepon dan email (opsional)
7. Klik **Daftarkan Anggota**
8. Nomor anggota otomatis digenerate (format: `KPR-YYYYMMDD-XXX`)

### 2. RFID Reader

Aplikasi mendukung RFID reader USB dengan mode **HID Keyboard Emulation**:
- UID kartu otomatis terketik ke input field
- Tekan **Enter** untuk trigger lookup
- Input field auto-focus untuk menerima input dari reader

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

## 🗄️ Database

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
| `0013910654` | Ahmad Suryadi |
| `0013624776` | Siti Nurhaliza |
| `4167398946` | Budi Santoso |
| `4167372726` | Dewi Lestari |

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
