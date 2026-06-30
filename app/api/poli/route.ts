// app/api/poli/route.ts
// GET  → daftar semua poli
// POST → tambah poli baru (admin)

import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        "SELECT * FROM poli WHERE status = 'aktif' ORDER BY nama_poli ASC"
      );
      return apiSuccess(rows);
    } finally {
      conn.release();
    }
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const body = await req.json();
    const { nama_poli, deskripsi } = body;
    if (!nama_poli) return apiError("Nama poli wajib diisi");

    const conn = await pool.getConnection();
    try {
      await conn.query(
        "INSERT INTO poli (nama_poli, deskripsi, status) VALUES (?, ?, 'aktif')",
        [nama_poli, deskripsi || null]
      );
      return apiSuccess(null, "Poli berhasil ditambahkan", 201);
    } finally {
      conn.release();
    }
  });
}
