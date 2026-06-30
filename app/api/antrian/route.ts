// app/api/antrian/route.ts
import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const today = new Date().toISOString().split("T")[0];
    const conn = await pool.getConnection();

    try {
      if (session!.user.role === "pasien") {
        const [rows] = await conn.query<any[]>(
          "SELECT * FROM antrian WHERE id_pasien = ? ORDER BY tanggal DESC, nomor_antrian DESC",
          [session!.user.id_pasien]
        );
        return apiSuccess(rows);
      }

      const tanggal = searchParams.get("tanggal") || today;
      const poli = searchParams.get("poli");

      let query = `SELECT a.*, CONCAT(p.nama_depan, ' ', p.nama_belakang) as nama_pasien, p.no_rekam_medis
                   FROM antrian a JOIN pasien p ON a.id_pasien = p.id_pasien
                   WHERE DATE(a.tanggal) = ?`;
      const params: any[] = [tanggal];

      if (poli) { query += " AND a.poli = ?"; params.push(poli); }
      query += " ORDER BY a.nomor_antrian ASC";

      const [rows] = await conn.query<any[]>(query, params);
      return apiSuccess(rows);
    } finally {
      conn.release();
    }
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth(["pasien"]);
    if (error) return error;

    const body = await req.json();
    const { poli, tanggal, keluhan } = body;

    if (!poli || !tanggal) return apiError("Poli dan tanggal wajib dipilih");

    const conn = await pool.getConnection();
    try {
      const [sudahAntri] = await conn.query<any[]>(
        "SELECT id_antrian, nomor_antrian FROM antrian WHERE id_pasien = ? AND poli = ? AND DATE(tanggal) = ? AND status IN ('menunggu','dipanggil')",
        [session!.user.id_pasien, poli, tanggal]
      );
      if (sudahAntri.length > 0) {
        return apiError(`Anda sudah punya nomor antrian ${sudahAntri[0].nomor_antrian} di ${poli} untuk tanggal ini`, 409);
      }

      const [lastAntrian] = await conn.query<any[]>(
        "SELECT MAX(nomor_antrian) as last FROM antrian WHERE poli = ? AND DATE(tanggal) = ?",
        [poli, tanggal]
      );
      const nomor_baru = (lastAntrian[0].last || 0) + 1;

      const [countMenunggu] = await conn.query<any[]>(
        "SELECT COUNT(*) as total FROM antrian WHERE poli = ? AND DATE(tanggal) = ? AND status = 'menunggu'",
        [poli, tanggal]
      );
      const estimasi = countMenunggu[0].total * 10;

      await conn.query(
        "INSERT INTO antrian (nomor_antrian, poli, tanggal, keluhan, status, waktu_daftar, estimasi_tunggu, id_pasien) VALUES (?, ?, ?, ?, 'menunggu', NOW(), ?, ?)",
        [nomor_baru, poli, tanggal, keluhan || null, estimasi, session!.user.id_user]
      );

      // Simpan notifikasi ke database
      await conn.query(
        "INSERT INTO notifikasi (id_user, pesan, jenis, createdAt) VALUES (?, ?, 'antrian_dibuat', NOW())",
        [session!.user.id_user, `Antrian #${nomor_baru} di ${poli} berhasil dibuat untuk tanggal ${tanggal}.`]
      );

      return apiSuccess({ nomor_antrian: nomor_baru, poli, estimasi_tunggu_menit: estimasi }, `Nomor antrian ${nomor_baru} berhasil diambil!`, 201);
    } finally {
      conn.release();
    }
  });
}
