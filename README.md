# 🏥 AMEDICTU — Backend Setup Guide

**Antrian Medic Tunggu** | Proyek Kelompok 28 | Teknik Komputer Undip 2026

---

## 📁 Struktur Folder Backend

```
amedictu/
├── prisma/
│   ├── schema.prisma        ← Skema database (EDIT DI SINI)
│   └── seed.ts              ← Data awal untuk testing
│
├── lib/
│   ├── prisma.ts            ← Singleton Prisma Client
│   ├── auth.ts              ← Konfigurasi NextAuth.js
│   ├── api-helpers.ts       ← Helper: auth guard, response format
│   └── socket-server.ts     ← Setup Socket.io real-time
│
├── app/api/
│   ├── auth/
│   │   ├── [...nextauth]/route.ts   ← Handler NextAuth (jangan diubah)
│   │   └── register/route.ts        ← POST: Registrasi pasien baru
│   │
│   ├── beranda/route.ts             ← GET: Data dashboard per role
│   │
│   ├── antrian/
│   │   ├── route.ts                 ← GET: list | POST: ambil antrian
│   │   └── [id]/route.ts            ← GET/PATCH/DELETE satu antrian
│   │
│   ├── rekam-medis/
│   │   ├── route.ts                 ← GET: list | POST: tambah
│   │   └── [id]/route.ts            ← GET/PUT/DELETE satu rekam medis
│   │
│   ├── pasien/
│   │   ├── route.ts                 ← GET: semua pasien / profil sendiri
│   │   └── [id]/route.ts            ← GET/PUT/DELETE satu pasien
│   │
│   ├── laporan/route.ts             ← GET: statistik & laporan
│   └── notifikasi/route.ts          ← GET: notif | PATCH: tandai dibaca
│
├── types/
│   └── next-auth.d.ts               ← Extend tipe NextAuth
│
├── server.ts                        ← Custom server + Socket.io
├── package.json
└── .env.example                     ← Template environment variables
```

---

## 🚀 Cara Setup (Langkah demi Langkah)

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Environment

```bash
# Salin file template
cp .env.example .env

# Edit file .env:
# - Ganti DATABASE_URL dengan koneksi MySQL kamu
# - Generate NEXTAUTH_SECRET dengan: openssl rand -base64 32
```

### 3. Setup Database MySQL

```bash
# Buat database baru di MySQL
mysql -u root -p
CREATE DATABASE amedictu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
```

### 4. Jalankan Prisma Migration

```bash
# Push skema ke database
npm run db:push

# Atau gunakan migration (lebih proper untuk production)
npm run db:migrate
```

### 5. Isi Data Awal (Seed)

```bash
npm run db:seed
```

Setelah seed, akun tersedia:
| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Tenaga Medis | dr.sari | dokter123 |
| Pasien | budi_santoso | pasien123 |

### 6. Jalankan Server

```bash
# Development
npm run dev

# Production
npm run build
npm run start
```

Server berjalan di: `http://localhost:3000`

---

## 📡 Daftar API Endpoint

### Auth
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/api/auth/register` | Public | Registrasi pasien baru |
| POST | `/api/auth/signin` | Public | Login (NextAuth) |
| POST | `/api/auth/signout` | Auth | Logout |

### Beranda
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/beranda` | Auth | Data dashboard sesuai role |

### Antrian
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/antrian` | Auth | Daftar antrian |
| POST | `/api/antrian` | Pasien | Ambil nomor antrian |
| GET | `/api/antrian/[id]` | Auth | Detail satu antrian |
| PATCH | `/api/antrian/[id]` | Auth | Update status antrian |
| DELETE | `/api/antrian/[id]` | Admin | Hapus antrian |

### Rekam Medis
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/rekam-medis?id_pasien=X` | Auth | Daftar rekam medis |
| POST | `/api/rekam-medis` | Tenaga Medis | Tambah rekam medis |
| GET | `/api/rekam-medis/[id]` | Auth | Detail rekam medis |
| PUT | `/api/rekam-medis/[id]` | Tenaga Medis | Edit rekam medis |
| DELETE | `/api/rekam-medis/[id]` | Admin | Hapus rekam medis |

### Pasien
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/pasien` | Auth | Semua pasien / profil sendiri |
| GET | `/api/pasien/[id]` | Auth | Detail pasien |
| PUT | `/api/pasien/[id]` | Auth | Update data pasien |
| DELETE | `/api/pasien/[id]` | Admin | Hapus pasien |

### Laporan
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/laporan?periode=hari_ini` | Admin/Medis | Statistik & laporan |

Query params `periode`: `hari_ini` \| `minggu_ini` \| `bulan_ini` \| `custom`

### Notifikasi
| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/api/notifikasi` | Auth | Daftar notifikasi |
| PATCH | `/api/notifikasi` | Auth | Tandai semua dibaca |

---

## 🔴 Socket.io Events (Real-time)

### Client → Server (emit)
```javascript
// Bergabung ke room poli untuk update antrian
socket.emit("join:poli", "poli_umum")

// Bergabung ke room user untuk notifikasi personal
socket.emit("join:user", "123")
```

### Server → Client (listen)
```javascript
// Update status antrian (dipanggil, selesai, dll)
socket.on("antrian:update", (data) => {
  console.log(data) // { nomor_antrian, status, poli, ... }
})

// Notifikasi baru masuk
socket.on("notifikasi:baru", (data) => {
  console.log(data) // { pesan, jenis, ... }
})
```

---

## 🗄️ Struktur Database

```
users          ← Akun semua pengguna (id_user, username, password, role)
  └── pasien   ← Data identitas pasien (one-to-one dengan users)
        ├── antrian      ← Riwayat nomor antrian (one-to-many)
        └── rekam_medis  ← Riwayat pemeriksaan (one-to-many)

notifikasi     ← Notifikasi per user (many-to-one dengan users)
```

---

## ⚠️ Catatan untuk Koordinasi dengan Frontend (Programmer 2)

1. **Semua response API** menggunakan format: `{ success, data, message, error }`
2. **Auth**: Gunakan `useSession()` dari `next-auth/react` di frontend
3. **Socket**: Import `socket.io-client` dan connect ke `/api/socket`
4. **Role check**: Cek `session.user.role` untuk tampilkan UI berbeda
5. Ini Colin
