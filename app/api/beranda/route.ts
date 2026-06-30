// app/api/beranda/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;

    const conn = await pool.getConnection();
    const today = new Date().toISOString().split("T")[0];

    try {
      if (session!.user.role === "pasien") {
        const id_pasien = session!.user.id_pasien;

        const [antrian] = await conn.query<any[]>(
          "SELECT * FROM antrian WHERE id_pasien = ? AND tanggal = ? AND status = 'menunggu' LIMIT 1",
          [id_pasien, today]
        );

        const [dipanggil] = await conn.query<any[]>(
          "SELECT nomor_antrian FROM antrian WHERE poli = ? AND tanggal = ? AND status = 'dipanggil' LIMIT 1",
          [antrian[0]?.poli || "poli_umum", today]
        );

        return apiSuccess({
          role: "pasien",
          nama: session!.user.nama,
          antrian_aktif: antrian[0] || null,
          sedang_dipanggil: dipanggil[0]?.nomor_antrian || null,
        });
      }

      const [total] = await conn.query<any[]>("SELECT COUNT(*) as total FROM antrian WHERE tanggal = ?", [today]);
      const [selesai] = await conn.query<any[]>("SELECT COUNT(*) as total FROM antrian WHERE tanggal = ? AND status = 'selesai'", [today]);
      const [menunggu] = await conn.query<any[]>("SELECT COUNT(*) as total FROM antrian WHERE tanggal = ? AND status = 'menunggu'", [today]);
      const [dipanggil] = await conn.query<any[]>(
        `SELECT a.nomor_antrian, a.poli, CONCAT(p.nama_depan, ' ', p.nama_belakang) as nama_pasien
         FROM antrian a JOIN pasien p ON a.id_pasien = p.id_pasien
         WHERE a.tanggal = ? AND a.status = 'dipanggil' LIMIT 1`,
        [today]
      );

      return apiSuccess({
        role: session!.user.role,
        nama: session!.user.username,
        statistik: {
          total_antrian: total[0].total,
          pasien_selesai: selesai[0].total,
          pasien_menunggu: menunggu[0].total,
        },
        sedang_dipanggil: dipanggil[0] || null,
      });
    } finally {
      conn.release();
    }
  });
}
