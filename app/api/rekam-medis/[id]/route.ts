// app/api/rekam-medis/[id]/route.ts

import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth();
    if (error) return error;
    const { id } = await params;
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        `SELECT r.*, CONCAT(p.nama_depan, ' ', p.nama_belakang) as nama_pasien,
                p.no_rekam_medis, p.jenis_kelamin, p.tgl_lahir, p.no_telp, p.alamat
         FROM rekam_medis r 
         JOIN pasien p ON r.id_pasien = p.id_pasien
         WHERE r.id_rekam_medis = ?`,
        [id]
      );
      if (!rows[0]) return apiError("Rekam medis tidak ditemukan", 404);
      return apiSuccess(rows[0]);
    } finally {
      conn.release();
    }
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["tenaga_medis", "admin"]);
    if (error) return error;
    const { id } = await params;
    const body = await req.json();
    const {
      tanggal_periksa,
      tekanan_darah, suhu, denyut_nadi,
      berat_badan, tinggi_badan, saturasi,
      keluhan, diagnosa, tindakan, catatan,
      resep_obat, aturan_minum,
    } = body;

    const conn = await pool.getConnection();
    try {
      await conn.query(
        `UPDATE rekam_medis SET 
          tanggal_periksa=?, tekanan_darah=?, suhu=?, denyut_nadi=?,
          berat_badan=?, tinggi_badan=?, saturasi=?,
          keluhan=?, diagnosa=?, tindakan=?, catatan=?,
          resep_obat=?, aturan_minum=?, updatedAt=NOW()
         WHERE id_rekam_medis=?`,
        [
          tanggal_periksa, tekanan_darah || null, suhu || null, denyut_nadi || null,
          berat_badan || null, tinggi_badan || null, saturasi || null,
          keluhan, diagnosa || null, tindakan || null, catatan || null,
          resep_obat || null, aturan_minum || null, id,
        ]
      );
      return apiSuccess(null, "Rekam medis berhasil diperbarui");
    } finally {
      conn.release();
    }
  });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;
    const { id } = await params;
    const conn = await pool.getConnection();
    try {
      await conn.query("DELETE FROM rekam_medis WHERE id_rekam_medis = ?", [id]);
      return apiSuccess(null, "Rekam medis berhasil dihapus");
    } finally {
      conn.release();
    }
  });
}
