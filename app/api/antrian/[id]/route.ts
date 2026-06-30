// app/api/antrian/[id]/route.ts
import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";
import Pusher from "pusher";

const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

const pesanNotif: Record<string, string> = {
  dipanggil: "Nomor antrian Anda sedang dipanggil! Segera menuju loket.",
  selesai: "Antrian Anda telah selesai. Terima kasih sudah berkunjung.",
  dibatalkan: "Antrian Anda telah dibatalkan.",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;
    const { id } = await params;
    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        `SELECT a.*, CONCAT(p.nama_depan, ' ', p.nama_belakang) as nama_pasien
         FROM antrian a JOIN pasien p ON a.id_pasien = p.id_pasien
         WHERE a.id_antrian = ?`,
        [id]
      );
      if (!rows[0]) return apiError("Antrian tidak ditemukan", 404);
      return apiSuccess(rows[0]);
    } finally {
      conn.release();
    }
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth();
    if (error) return error;
    const { id } = await params;
    const body = await req.json();
    const { status } = body;
    const validStatus = ["dipanggil", "selesai", "dibatalkan"];
    if (!validStatus.includes(status)) return apiError("Status tidak valid");

    const conn = await pool.getConnection();
    try {
      const [rows] = await conn.query<any[]>(
        "SELECT a.*, p.id_user FROM antrian a JOIN pasien p ON a.id_pasien = p.id_pasien WHERE a.id_antrian = ?", 
        [id]
      );
      if (!rows[0]) return apiError("Antrian tidak ditemukan", 404);

      if (status === "dipanggil") {
        await conn.query("UPDATE antrian SET status = ?, waktu_dipanggil = NOW() WHERE id_antrian = ?", [status, id]);
      } else {
        await conn.query("UPDATE antrian SET status = ? WHERE id_antrian = ?", [status, id]);
      }

      // Simpan notifikasi ke database
      const jenisNotif = `antrian_${status}`;
      await conn.query(
        "INSERT INTO notifikasi (id_user, pesan, jenis, createdAt) VALUES (?, ?, ?, NOW())",
        [rows[0].id_user, pesanNotif[status] || "", jenisNotif]
      );

      // Trigger Pusher real-time notification
      await pusherServer.trigger(
        `antrian-${rows[0].id_pasien}`,
        "status-update",
        {
          id_antrian: id,
          status: status,
          nomor_antrian: rows[0].nomor_antrian,
          poli: rows[0].poli,
          pesan: pesanNotif[status] || "",
        }
      );

      // Trigger juga ke channel poli untuk update daftar antrian
      await pusherServer.trigger(
        `poli-${rows[0].poli}`,
        "antrian-update",
        {
          id_antrian: id,
          status: status,
          nomor_antrian: rows[0].nomor_antrian,
        }
      );

      return apiSuccess({ id_antrian: id, status }, `Status berhasil diubah ke ${status}`);
    } finally {
      conn.release();
    }
  });
}