export const dynamic = 'force-dynamic';

// app/api/antrean/[id]/route.ts
import { NextRequest } from "next/server";
import pool from "@/lib/db";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin", "tenaga_medis"]);
    if (error) return error;

    const { id } = await params;
    const body = await req.json();
    const { status, rekam_medis } = body;

    if (!["menunggu", "dipanggil", "diperiksa", "selesai", "dibatalkan"].includes(status)) {
      return apiError("Status tidak valid");
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update status antrian
      if (status === "dipanggil") {
        await conn.query(
          "UPDATE antrian SET status = ?, waktu_dipanggil = NOW() WHERE id_antrian = ?",
          [status, id]
        );
      } else {
        await conn.query(
          "UPDATE antrian SET status = ? WHERE id_antrian = ?",
          [status, id]
        );
      }

      // Jika selesai dan ada data rekam medis, simpan ke tabel rekam_medis
      if (status === "selesai" && rekam_medis) {
        // Ambil id_pasien dari antrian
        const [rows]: any = await conn.query(
          "SELECT id_pasien, keluhan FROM antrian WHERE id_antrian = ?",
          [id]
        );
        
        if (rows.length > 0) {
          const { id_pasien, keluhan } = rows[0];
          await conn.query(
            `INSERT INTO rekam_medis (
              id_pasien, tanggal_periksa, keluhan, diagnosa, resep_obat, aturan_minum, createdAt, updatedAt
            ) VALUES (?, CURDATE(), ?, ?, ?, ?, NOW(), NOW())`,
            [
              id_pasien, 
              keluhan || "", 
              rekam_medis.diagnosa || "", 
              rekam_medis.resep_obat || "", 
              rekam_medis.aturan_minum || ""
            ]
          );
        }
      }

      await conn.commit();

      // --- TAMBAHAN NOTIFIKASI ---
      try {
        const [antrianRow]: any = await conn.query(
          "SELECT a.*, p.id_user FROM antrian a JOIN pasien p ON a.id_pasien = p.id_pasien WHERE a.id_antrian = ?", 
          [id]
        );
        
        if (antrianRow.length > 0) {
          const pesanNotif: Record<string, string> = {
            dipanggil: "Nomor antrian Anda sedang dipanggil! Segera menuju loket.",
            diperiksa: "Anda sedang diperiksa oleh dokter.",
            selesai: "Antrian Anda telah selesai. Terima kasih sudah berkunjung.",
            dibatalkan: "Antrian Anda telah dibatalkan.",
          };
          
          const jenisNotif = `antrian_${status}`;
          
          // 1. Simpan ke Database
          await conn.query(
            "INSERT INTO notifikasi (id_user, pesan, jenis, createdAt) VALUES (?, ?, ?, NOW())",
            [antrianRow[0].id_user, pesanNotif[status] || `Status antrean Anda berubah menjadi ${status}`, jenisNotif]
          );

          // 2. Trigger Pusher (Real-time)
          const Pusher = require("pusher");
          const pusher = new Pusher({
            appId: process.env.PUSHER_APP_ID,
            key: process.env.PUSHER_KEY,
            secret: process.env.PUSHER_SECRET,
            cluster: process.env.PUSHER_CLUSTER,
            useTLS: true,
          });

          await pusher.trigger(`antrian-${antrianRow[0].id_pasien}`, "status-update", {
            id_antrian: id,
            status: status,
            nomor_antrian: antrianRow[0].nomor_antrian,
            pesan: pesanNotif[status] || "",
          });
        }
      } catch (notifErr) {
        console.error("Gagal mengirim notifikasi:", notifErr);
      }
      // --- END NOTIFIKASI ---

      return apiSuccess(null, `Antrean berhasil diperbarui`);
    } catch (err: any) {
      await conn.rollback();
      return apiError(err.message);
    } finally {
      conn.release();
    }

  });
}
