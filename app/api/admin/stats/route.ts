// app/api/admin/stats/route.ts
import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, withErrorHandler } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const conn = await pool.getConnection();
    try {
      // 1. Total Pasien
      const [pasienRows]: any = await conn.query("SELECT COUNT(*) as count FROM pasien");
      
      // 2. Tenaga Medis Aktif
      const [medisRows]: any = await conn.query("SELECT COUNT(*) as count FROM users WHERE role = 'tenaga_medis'");
      
      // 3. Kunjungan Hari Ini (Antrean hari ini)
      const [antreanRows]: any = await conn.query(
        "SELECT COUNT(*) as count FROM antrian WHERE DATE(tanggal) = CURDATE()"
      );

      return apiSuccess({
        totalPasien: pasienRows[0].count,
        tenagaMedis: medisRows[0].count,
        kunjunganHariIni: antreanRows[0].count
      });
    } finally {
      conn.release();
    }
  });
}
