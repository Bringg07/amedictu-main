// app/api/pasien/[id]/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;
    const { id } = await params;
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        "SELECT p.*, u.username FROM pasien p JOIN users u ON p.id_user = u.id_user WHERE p.id_pasien = ?",
        [id]
      );
      if (!rows[0]) return apiError("Pasien tidak ditemukan", 404);
      return apiSuccess(rows[0]);
    } finally {
      conn.release();
    }
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;
    const { id } = await params;
    const body = await req.json();
    const {
      nama_depan, nama_belakang, alamat, no_telp, tgl_lahir,
      jenis_kelamin, gol_darah, nik, nama_darurat, hub_darurat, telp_darurat,
      password_lama, password_baru, konfirmasi_password_baru,
    } = body;

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        "SELECT p.*, u.password as user_password, u.id_user FROM pasien p JOIN users u ON p.id_user = u.id_user WHERE p.id_pasien = ?",
        [id]
      );
      if (!rows[0]) return apiError("Pasien tidak ditemukan", 404);
      const pasien = rows[0];

      if (password_baru) {
        if (!password_lama) return apiError("Password lama wajib diisi");
        const valid = await bcrypt.compare(password_lama, pasien.user_password);
        if (!valid) return apiError("Password lama tidak sesuai");
        if (password_baru !== konfirmasi_password_baru) return apiError("Konfirmasi password tidak cocok");
        const hashed = await bcrypt.hash(password_baru, 12);
        await conn.query("UPDATE users SET password = ? WHERE id_user = ?", [hashed, pasien.id_user]);
      }

      await conn.query(
        `UPDATE pasien SET nama_depan=?, nama_belakang=?, alamat=?, no_telp=?, tgl_lahir=?, 
         jenis_kelamin=?, gol_darah=?, nik=?, nama_darurat=?, hub_darurat=?, telp_darurat=?, updatedAt=NOW() 
         WHERE id_pasien=?`,
        [
          nama_depan || pasien.nama_depan,
          nama_belakang || pasien.nama_belakang,
          alamat || pasien.alamat,
          no_telp || pasien.no_telp,
          tgl_lahir || pasien.tgl_lahir,
          jenis_kelamin || pasien.jenis_kelamin,
          gol_darah || pasien.gol_darah,
          nik || pasien.nik,
          nama_darurat || pasien.nama_darurat,
          hub_darurat || pasien.hub_darurat,
          telp_darurat || pasien.telp_darurat,
          id,
        ]
      );

      return apiSuccess(null, "Data profil berhasil diperbarui");
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
      const [rows] = await conn.query<any[]>("SELECT id_user FROM pasien WHERE id_pasien = ?", [id]);
      if (!rows[0]) return apiError("Pasien tidak ditemukan", 404);
      await conn.query("DELETE FROM users WHERE id_user = ?", [rows[0].id_user]);
      return apiSuccess(null, "Data pasien berhasil dihapus");
    } finally {
      conn.release();
    }
  });
}
