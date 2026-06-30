// app/api/notifikasi/route.ts
import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        "SELECT * FROM notifikasi WHERE id_user = ? ORDER BY createdAt DESC LIMIT 20",
        [session!.user.id_user]
      );
      const [belumDibaca] = await conn.query<any[]>(
        "SELECT COUNT(*) as total FROM notifikasi WHERE id_user = ? AND is_read = 0",
        [session!.user.id_user]
      );
      return apiSuccess({ notifikasi: rows, belum_dibaca: belumDibaca[0].total });
    } finally { conn.release(); }
  });
}

export async function PATCH(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;
    const conn = await pool.getConnection();
    try {
      await conn.query("UPDATE notifikasi SET is_read = 1 WHERE id_user = ?", [session!.user.id_user]);
      return apiSuccess(null, "Semua notifikasi ditandai sudah dibaca");
    } finally { conn.release(); }
  });
}
