# 📋 PERINTAH SETUP AMEDICTU BACKEND
# Jalankan satu per satu di terminal VS Code (Ctrl+`)

# ════════════════════════════════════════
# LANGKAH 1 — Install semua library
# ════════════════════════════════════════
npm install

# ════════════════════════════════════════
# LANGKAH 2 — Generate Prisma Client
# ════════════════════════════════════════
npx prisma generate

# ════════════════════════════════════════
# LANGKAH 3 — Buat tabel di database
# (Pastikan XAMPP MySQL sudah ON dulu!)
# ════════════════════════════════════════
npx prisma db push

# ════════════════════════════════════════
# LANGKAH 4 — Isi data awal
# ════════════════════════════════════════
node prisma/seed.js

# ════════════════════════════════════════
# LANGKAH 5 — Jalankan server
# ════════════════════════════════════════
npm run dev

# Buka browser → http://localhost:3000

# ════════════════════════════════════════
# AKUN UNTUK TESTING
# ════════════════════════════════════════
# Admin        → username: admin        | password: admin123
# Tenaga Medis → username: dr.sari      | password: dokter123
# Pasien       → username: budi_santoso | password: pasien123
