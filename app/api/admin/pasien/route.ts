// app/api/admin/pasien/route.ts
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin", "tenaga_medis"]);
    if (error) return error;

    const rows = await prisma.pasien.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Format data agar sesuai dengan UI
    const formatted = rows.map(p => ({
      id: p.id_pasien,
      id_pasien: p.id_pasien,
      no_rekam_medis: p.no_rekam_medis,
      nama: `${p.nama_depan} ${p.nama_belakang}`,
      nama_depan: p.nama_depan,
      nama_belakang: p.nama_belakang,
      nik: p.nik,
      jenis_kelamin: p.jenis_kelamin === 'laki_laki' ? 'Laki-laki' : 'Perempuan',
      tgl_lahir: p.tgl_lahir ? new Date(p.tgl_lahir).toLocaleDateString('id-ID') : "-",
      no_telp: p.no_telp || "-",
      alamat: p.alamat || "-"
    }));

    return apiSuccess(formatted);
  });
}

export async function PUT(req: NextRequest) {
    return withErrorHandler(async () => {
      const { error: authError } = await requireAuth(["admin", "tenaga_medis"]);
      if (authError) return authError;
  
      const body = await req.json();
      const { id, nama, jenis_kelamin, no_telp } = body;
  
      if (!id) return apiError("ID Pasien diperlukan", 400);
  
      // Pecah nama kembali
      const nameParts = nama.split(' ');
      const nama_depan = nameParts[0];
      const nama_belakang = nameParts.slice(1).join(' ') || "";
      const jk = jenis_kelamin === 'Laki-laki' ? 'laki_laki' : 'perempuan';
  
      await prisma.pasien.update({
        where: { id_pasien: id },
        data: {
          nama_depan,
          nama_belakang,
          jenis_kelamin: jk as any,
          no_telp
        }
      });
  
      return apiSuccess({ message: "Data pasien diperbarui" });
    });
  }

