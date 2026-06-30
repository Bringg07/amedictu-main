// app/api/jadwal-dokter/route.ts
import { NextRequest } from "next/server";
import { prisma } from "../../../lib/prisma";

import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const rows = await (prisma as any).jadwalDokter.findMany({
      orderBy: [
        { hari: 'asc' }, 
        { jam_mulai: 'asc' }
      ]
    });

    
    // Sort manual untuk hari agar sesuai urutan kalender
    const hariOrder = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const sorted = rows.sort((a: any, b: any) => hariOrder.indexOf(a.hari) - hariOrder.indexOf(b.hari));


    return apiSuccess(sorted);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const body = await req.json();
    const { nama_dokter, spesialis, hari, jam_mulai, jam_selesai } = body;

    if (!nama_dokter || !hari || !jam_mulai || !jam_selesai) {
      return apiError("Data jadwal tidak lengkap");
    }

    const newJadwal = await (prisma as any).jadwalDokter.create({
      data: {
        nama_dokter,
        spesialis: spesialis || "Umum",
        hari,
        jam_mulai,
        jam_selesai
      }
    });


    return apiSuccess(newJadwal, "Jadwal berhasil ditambahkan", 201);
  });
}

