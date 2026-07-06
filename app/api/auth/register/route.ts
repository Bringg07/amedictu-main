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

    const sanitizedUsername = String(username || "").trim();
    const sanitizedPassword = String(password || "");

    if (!sanitizedUsername || !sanitizedPassword || !nama_depan || !nama_belakang) {
      return apiError(
        "Username, password, nama depan, dan nama belakang wajib diisi"
      );
    }

    if (sanitizedPassword !== konfirmasi_password) {
      return apiError("Konfirmasi password tidak cocok");
    }

    if (sanitizedPassword.length < 8) {
      return apiError("Password minimal 8 karakter");
    }

    if (nik && !/^[0-9]{16}$/.test(String(nik))) {
      return apiError("NIK harus 16 digit angka");
    }

    const conn = await pool.getConnection();

    try {
      const [existing] = await conn.query<any[]>(
        "SELECT id_user FROM users WHERE username = ?",
        [sanitizedUsername]
      );

      if (existing.length > 0) {
        return apiError("Username sudah digunakan", 409);
      }

      if (nik) {
        const [existingNik] = await conn.query<any[]>(
          "SELECT id_pasien FROM pasien WHERE nik = ?",
          [nik]
        );

        if (existingNik.length > 0) {
          return apiError("NIK sudah digunakan", 409);
        }
      }

      const hashedPassword = await bcrypt.hash(sanitizedPassword, 12);

      const [userResult] = await conn.query<any>(
        `INSERT INTO users 
        (username, password, role, createdAt, updatedAt) 
        VALUES (?, ?, 'pasien', NOW(), NOW())`,
        [sanitizedUsername, hashedPassword]
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
          tgl_lahir ? new Date(tgl_lahir) : null,
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