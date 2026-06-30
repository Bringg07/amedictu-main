// app/api/seed/route.ts
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET() {
  const defaultDoctors = [
    ['dr. Budi Santoso', 'Dokter Umum', 'Senin', '08:00', '12:00'],
    ['dr. Ahmad Basuki', 'Dokter Umum', 'Selasa', '08:00', '12:00'],
    ['dr. Faradilla Aulia', 'Dokter Umum', 'Rabu', '13:00', '17:00'],
    ['dr. Dhinara', 'Dokter Gigi', 'Senin', '13:00', '17:00'],
    ['dr. Nur Hasna', 'Bidan / Sp.OG', 'Kamis', '13:00', '17:00'],
    ['dr. Bima', 'Dokter Umum / Sp.A', 'Jumat', '13:00', '17:00'],
  ];

  const conn = await pool.getConnection();
  try {
    // Bersihkan data lama agar tidak dobel
    await conn.query("DELETE FROM jadwal_dokter");

    for (const doc of defaultDoctors) {
      await conn.query(
        "INSERT INTO jadwal_dokter (nama_dokter, spesialis, hari, jam_mulai, jam_selesai, updatedAt) VALUES (?, ?, ?, ?, ?, NOW())",
        doc
      );
    }
    return NextResponse.json({ success: true, message: "Cleanup and Seeding complete" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
}
