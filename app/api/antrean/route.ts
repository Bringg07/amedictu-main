// app/api/antrean/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth(["admin", "tenaga_medis", "pasien"]);
    if (error) return error;

    const { searchParams } = new URL(req.url);
    const poliIdParam = searchParams.get("id_poli");

    let where: any = {};

    console.log(`[API Antrean] User: ${session.user.username}, Role: ${session.user.role}, Poli ID: ${session.user.id_poli}`);

    // Filter berdasarkan role
    if (session.user.role === "pasien") {
      where.id_pasien = session.user.id_pasien;
    } else if (session.user.role === "tenaga_medis") {
      if (session.user.id_poli) {
        where.id_poli = session.user.id_poli;
      } else {
        return apiError("Akses ditolak: Anda belum ditugaskan ke poliklinik manapun. Hubungi Admin.", 403);
      }
    } else if (session.user.role === "admin" && poliIdParam) {
      where.id_poli = parseInt(poliIdParam);
    }

    const rows = await prisma.antrian.findMany({
      where,
      include: {
        pasien: true,
        poli: true
      },
      orderBy: [
        { tanggal: 'desc' },
        { nomor_antrian: 'asc' }
      ]
    });

    // Format data agar sesuai UI (dukung nama_pasien dan nama_depan/belakang)
    const formatted = await Promise.all(rows.map(async r => {
      let estimasi_menit = 15;
      if (r.status === "menunggu") {
        const countAhead = await prisma.antrian.count({
          where: {
            id_poli: r.id_poli,
            tanggal: r.tanggal,
            status: { in: ["menunggu", "dipanggil", "diperiksa"] },
            nomor_antrian: { lt: r.nomor_antrian }
          }
        });
        estimasi_menit = (countAhead + 1) * 15;
      } else if (r.status === "dipanggil" || r.status === "diperiksa") {
        estimasi_menit = 0;
      }

      return {
        ...r,
        nama_pasien: `${r.pasien.nama_depan} ${r.pasien.nama_belakang}`,
        nama_depan: r.pasien.nama_depan,
        nama_belakang: r.pasien.nama_belakang,
        nama_poli: r.poli.nama_poli,
        estimasi_tunggu: estimasi_menit
      };
    }));

    return apiSuccess(formatted);
  });
}


export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const { session, error } = await requireAuth(["pasien"]);
    if (error) return error;

    const body = await req.json();
    const { id_poli, keluhan, tanggal } = body;

    if (!id_poli) return apiError("Poli tujuan wajib dipilih");

    const tgl = tanggal ? new Date(tanggal) : new Date();
    tgl.setHours(0, 0, 0, 0);

    // 1. Cari nomor antrian terakhir
    const lastAntrian = await prisma.antrian.findFirst({
      where: {
        id_poli: parseInt(id_poli),
        tanggal: tgl
      },
      orderBy: { nomor_antrian: 'desc' }
    });

    const nextNo = (lastAntrian?.nomor_antrian || 0) + 1;

    // 2. Buat antrian baru
    const newAntrian = await prisma.antrian.create({
      data: {
        nomor_antrian: nextNo,
        tanggal: tgl,
        keluhan: keluhan || "",
        id_pasien: session.user.id_pasien as number,
        id_poli: parseInt(id_poli)
      }
    });


    // 3. Notifikasi untuk Dokter di poli tersebut
    try {
        const doctors = await prisma.user.findMany({
            where: { id_poli: parseInt(id_poli), role: 'tenaga_medis' }
        });
        
        const Pusher = require("pusher");
        const pusher = new Pusher({
          appId: process.env.PUSHER_APP_ID,
          key: process.env.PUSHER_KEY,
          secret: process.env.PUSHER_SECRET,
          cluster: process.env.PUSHER_CLUSTER,
          useTLS: true,
        });

        for (const doc of doctors) {
            await prisma.notifikasi.create({
                data: {
                    id_user: doc.id_user,
                    pesan: `Pasien baru telah mendaftar di poli Anda. No. Antrian: A-${String(nextNo).padStart(3, '0')}`,
                    jenis: 'info'
                }
            });

            // Trigger Pusher untuk dokter
            await pusher.trigger(`antrian-${doc.id_user}`, "status-update", {
                pesan: `Pasien baru: A-${String(nextNo).padStart(3, '0')}`,
            });
        }
    } catch (err) {
        console.error("Gagal mengirim notif ke dokter:", err);
    }

    // Hitung estimasi tunggu untuk antrian baru ini
    let estimasi_menit = 15;
    try {
      const countAhead = await prisma.antrian.count({
        where: {
          id_poli: parseInt(id_poli),
          tanggal: tgl,
          status: { in: ["menunggu", "dipanggil", "diperiksa"] },
          nomor_antrian: { lt: nextNo }
        }
      });
      estimasi_menit = (countAhead + 1) * 15;
    } catch (e) {
      console.error(e);
    }

    return apiSuccess({ 
      id_antrian: newAntrian.id_antrian, 
      nomor_antrian: nextNo, 
      estimasi_tunggu: estimasi_menit 
    }, "Antrean berhasil diambil");
  });
}

