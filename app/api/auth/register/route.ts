// app/api/auth/register/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import {
  apiSuccess,
  apiError,
  withErrorHandler
} from "@/lib/api-helpers";

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const body = await req.json();

    const {
      username,
      password,
      konfirmasi_password,
      nama_depan,
      nama_belakang,
      no_telp,
      alamat,
      tgl_lahir,
      jenis_kelamin,
      gol_darah,
      nik
    } = body;

    if (!username || !password || !nama_depan || !nama_belakang) {
      return apiError(
        "Username, password, nama depan, dan nama belakang wajib diisi"
      );
    }

    if (password !== konfirmasi_password) {
      return apiError("Konfirmasi password tidak cocok");
    }

    if (password.length < 8) {
      return apiError("Password minimal 8 karakter");
    }

    const conn = await pool.getConnection();

    try {
      const [existing] = await conn.query<any[]>(
        "SELECT id_user FROM users WHERE username = ?",
        [username]
      );

      if (existing.length > 0) {
        return apiError("Username sudah digunakan", 409);
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const [userResult] = await conn.query<any>(
        `INSERT INTO users 
        (username, password, role, createdAt, updatedAt) 
        VALUES (?, ?, 'pasien', NOW(), NOW())`,
        [username, hashedPassword]
      );

      if (!userResult.insertId) {
        return apiError("Gagal membuat user");
      }

      const noRekamMedis = "RM-" + Date.now();

      await conn.query(
        `INSERT INTO pasien 
        (
          no_rekam_medis,
          nama_depan,
          nama_belakang,
          no_telp,
          alamat,
          tgl_lahir,
          jenis_kelamin,
          gol_darah,
          nik,
          id_user,
          createdAt,
          updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          noRekamMedis,
          nama_depan,
          nama_belakang,
          no_telp || null,
          alamat || null,
          tgl_lahir || null,
          jenis_kelamin || null,
          gol_darah || null,
          nik || null,
          userResult.insertId
        ]
      );

      return apiSuccess(
        {
          username,
          nama: `${nama_depan} ${nama_belakang}`
        },
        "Registrasi berhasil! Silakan login.",
        201
      );
    } finally {
      conn.release();
    }
  });
}