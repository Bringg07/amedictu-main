const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database AMEDICTU...");

  // ── Hapus data (urutan penting karena relasi) ──
  await prisma.notifikasi.deleteMany();
  await prisma.rekamMedis.deleteMany();
  await prisma.antrian.deleteMany();
  await prisma.pasien.deleteMany();
  await prisma.user.deleteMany();
  await prisma.poli.deleteMany();

  // ── Poli ─────────────────────────────────────
  const poli = await prisma.poli.createMany({
    data: [
      { nama_poli: "Poli Umum", deskripsi: "Layanan kesehatan umum" },
      { nama_poli: "Poli Gigi", deskripsi: "Layanan kesehatan gigi dan mulut" },
      { nama_poli: "Poli Anak", deskripsi: "Layanan kesehatan anak" },
      { nama_poli: "Poli THT", deskripsi: "Layanan telinga hidung tenggorokan" },
      { nama_poli: "Poli KIA", deskripsi: "Layanan kesehatan ibu dan anak" },
      { nama_poli: "Laboratorium", deskripsi: "Layanan laboratorium" },
    ],
  });
  console.log("✅ Data poli dibuat");

  // ── Admin ───────────────────────────────────
  const adminPass = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      username: "admin",
      password: adminPass,
      role: "admin",
    },
  });
  console.log("✅ Admin dibuat");

  // ── Tenaga Medis ────────────────────────────
  const dokterPass = await bcrypt.hash("dokter123", 10);
  await prisma.user.create({
    data: {
      username: "dr.sari",
      password: dokterPass,
      role: "tenaga_medis",
    },
  });
  console.log("✅ Tenaga medis dibuat");

  // ── Pasien + User ───────────────────────────
  const pasienPass = await bcrypt.hash("pasien123", 10);

  const userPasien = await prisma.user.create({
    data: {
      username: "budi_santoso",
      password: pasienPass,
      role: "pasien",
    },
  });

  const pasien = await prisma.pasien.create({
    data: {
      nama_depan: "Budi",
      nama_belakang: "Santoso",
      alamat: "Jl. Diponegoro No. 1, Semarang",
      no_telp: "081234567890",
      jenis_kelamin: "laki_laki",
      gol_darah: "A",
      nik: "3374010101900001",
      nama_darurat: "Siti Santoso",
      hub_darurat: "Istri",
      telp_darurat: "081234567891",
      user: {
        connect: { id_user: userPasien.id_user },
      },
    },
  });
  console.log("✅ Pasien dibuat");

  // ── Contoh Antrian ──────────────────────────
  const poliUmum = await prisma.poli.findFirst({
    where: { nama_poli: "Poli Umum" },
  });

  await prisma.antrian.create({
    data: {
      nomor_antrian: 1,
      tanggal: new Date(),
      keluhan: "Demam dan pusing",
      pasien: {
        connect: { id_pasien: pasien.id_pasien },
      },
      poli: {
        connect: { id_poli: poliUmum.id_poli },
      },
    },
  });
  console.log("✅ Antrian dibuat");

  // ── Notifikasi ──────────────────────────────
  await prisma.notifikasi.create({
    data: {
      pesan: "Antrian berhasil dibuat",
      jenis: "antrian_dibuat",
      user: {
        connect: { id_user: userPasien.id_user },
      },
    },
  });
  console.log("✅ Notifikasi dibuat");

  console.log("\n🎉 Seeding selesai!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });