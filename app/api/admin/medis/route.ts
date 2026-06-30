// app/api/admin/medis/route.ts
import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth, apiSuccess, apiError, withErrorHandler } from "@/lib/api-helpers";

import { prisma } from "@/lib/prisma";


export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const rows = await (prisma.user as any).findMany({
      where: { role: 'tenaga_medis' },
      include: { poli: true },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format agar ada ID Petugas (berdasarkan ID auto-increment tapi diformat)
    const formatted = (rows as any[]).map((u: any) => ({
      ...u,
      id_petugas: `MED-${String(u.id_user).padStart(4, '0')}`,
      nama_poli: u.poli?.nama_poli || "Umum"
    }));


    return apiSuccess(formatted);
  });
}

export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const { error } = await requireAuth(["admin"]);
    if (error) return error;

    const body = await req.json();
    const { username, password, id_poli, nama_lengkap } = body;

    if (!username || !password || !id_poli) {
      return apiError("Username, password, dan Poli wajib diisi");
    }

    const existing = await prisma.user.findUnique({
      where: { username }
    });

    if (existing) {
      return apiError("Username sudah digunakan", 409);
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        username,
        nama_lengkap,
        password: hashedPassword,
        role: 'tenaga_medis',
        id_poli: parseInt(id_poli)
      } as any
    });



    return apiSuccess(newUser, "Akun tenaga medis berhasil dibuat", 201);
  });
}


