// app/api/laporan/route.ts
// Sesuai modul: rekapitulasi antrian hari ini + daftar diagnosa terbanyak

export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin", "tenaga_medis"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const tanggal = searchParams.get("tanggal") || new Date().toISOString().split("T")[0];

    const conn = await pool.getConnection();
    try {
      // Total antrian hari ini (QUE-26)
      const [total] = await conn.query<any[]>(
        "SELECT COUNT(*) as total FROM antrian WHERE DATE(tanggal) = ?",
        [tanggal]
      );

      // Jumlah per status (QUE-27)
      const [perStatus] = await conn.query<any[]>(
        "SELECT status, COUNT(*) as jumlah FROM antrian WHERE DATE(tanggal) = ? GROUP BY status",
        [tanggal]
      );

      // Konversi ke object per status
      const statusMap: Record<string, number> = {
        menunggu: 0,
        dipanggil: 0,
        selesai: 0,
        dibatalkan: 0,
      };
      perStatus.forEach((s: any) => {
        statusMap[s.status] = parseInt(s.jumlah);
      });

      // Diagnosa terbanyak hari ini (QUE-28)
      const [diagnosa] = await conn.query<any[]>(
        `SELECT diagnosa, COUNT(*) as jumlah 
         FROM rekam_medis 
         WHERE DATE(tanggal_periksa) = ? AND diagnosa IS NOT NULL AND diagnosa != ''
         GROUP BY diagnosa 
         ORDER BY jumlah DESC 
         LIMIT 10`,
        [tanggal]
      );

      return apiSuccess({
        tanggal,
        rekapitulasi_antrian: {
          total_antrian: parseInt(total[0].total),
          selesai_diperiksa: statusMap.selesai,
          menunggu: statusMap.menunggu,
          sedang_dipanggil: statusMap.dipanggil,
          dibatalkan: statusMap.dibatalkan,
        },
        daftar_diagnosa_tercatat: diagnosa,
      });
    } finally {
      conn.release();
    }
  });
}
