// app/api/rekam-medis/route.ts
// GET  → daftar rekam medis
// POST → tambah rekam medis baru (sesuai modul: termasuk data vital & resep)

import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const id_pasien =
      session!.user.role === "pasien"
        ? session!.user.id_pasien
        : searchParams.get("id_pasien");

    if (!id_pasien) return apiError("id_pasien wajib disertakan");

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        `SELECT r.*, CONCAT(p.nama_depan, ' ', p.nama_belakang) as nama_pasien, 
                p.no_rekam_medis
         FROM rekam_medis r 
         JOIN pasien p ON r.id_pasien = p.id_pasien
         WHERE r.id_pasien = ? 
         ORDER BY r.tanggal_periksa DESC`,
        [id_pasien]
      );
      return apiSuccess(rows);
    } finally {
      conn.release();
    }
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["tenaga_medis", "admin"]);
    if (error) return error;

    const body = await req.json();
    const {
      id_pasien,
      tanggal_periksa,
      // Data vital (sesuai modul)
      tekanan_darah,
      suhu,
      denyut_nadi,
      berat_badan,
      tinggi_badan,
      saturasi,
      // Hasil pemeriksaan
      keluhan,
      diagnosa,
      tindakan,
      catatan,
      // Resep obat (sesuai modul)
      resep_obat,
      aturan_minum,
    } = body;

    if (!id_pasien || !keluhan) {
      return apiError("id_pasien dan keluhan wajib diisi");
    }

    const conn = await pool.getConnection();
    try {
      const tgl = tanggal_periksa || new Date().toISOString().split("T")[0];

      await conn.query(
        `INSERT INTO rekam_medis 
          (id_pasien, tanggal_periksa, tekanan_darah, suhu, denyut_nadi, 
           berat_badan, tinggi_badan, saturasi, keluhan, diagnosa, tindakan, 
           catatan, resep_obat, aturan_minum, createdAt, updatedAt) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          id_pasien,
          tgl,
          tekanan_darah || null,
          suhu || null,
          denyut_nadi || null,
          berat_badan || null,
          tinggi_badan || null,
          saturasi || null,
          keluhan,
          diagnosa || null,
          tindakan || null,
          catatan || null,
          resep_obat || null,
          aturan_minum || null,
        ]
      );

      return apiSuccess(null, "Rekam medis berhasil disimpan", 201);
    } finally {
      conn.release();
    }
  });
}
