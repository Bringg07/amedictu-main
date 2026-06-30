// app/api/pasien/route.ts
export const dynamic = 'force-dynamic';

import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get("q") || "";
    const conn = await pool.getConnection();

    try {
      if (session!.user.role === "pasien") {
        const [rows] = await conn.query<any[]>(
          "SELECT p.*, u.username FROM pasien p JOIN users u ON p.id_user = u.id_user WHERE p.id_pasien = ?",
          [session!.user.id_pasien]
        );
        return apiSuccess(rows[0]);
      }

      const [rows] = await conn.query<any[]>(
        `SELECT p.*, u.username FROM pasien p JOIN users u ON p.id_user = u.id_user
         WHERE p.nama_depan LIKE ? OR p.nama_belakang LIKE ? OR p.no_telp LIKE ? OR p.no_rekam_medis LIKE ?
         ORDER BY p.nama_depan ASC`,
        [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
      );
      return apiSuccess(rows);
    } finally {
      conn.release();
    }
  });
}
