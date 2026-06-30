// lib/api-helpers.ts
// Helper functions untuk API Routes: auth check, response format, error handling

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// ── Tipe Response Standar ────────────────────────────────
export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

// ── Response Helper ──────────────────────────────────────
export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data, message },
    { status }
  );
}

export function apiError(error: string, status = 400) {
  return NextResponse.json<ApiResponse>(
    { success: false, error },
    { status }
  );
}

// ── Auth Guard ───────────────────────────────────────────
// Gunakan di awal setiap API route yang butuh autentikasi
export async function requireAuth(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      session: null,
      error: apiError("Silakan login terlebih dahulu", 401),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      session: null,
      error: apiError("Anda tidak memiliki akses ke halaman ini", 403),
    };
  }

  return { session, error: null };
}

// ── Try-Catch Wrapper ────────────────────────────────────
// Membungkus handler agar error tidak perlu di-catch manual
export async function withErrorHandler(
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error: any) {
    console.error("[API Error]", error);

    // Prisma unique constraint violation
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] ?? "field";
      return apiError(`${field} sudah digunakan`, 409);
    }

    // Prisma record not found
    if (error.code === "P2025") {
      return apiError("Data tidak ditemukan", 404);
    }

    return apiError(
      process.env.NODE_ENV === "development"
        ? error.message
        : "Terjadi kesalahan server",
      500
    );
  }
}
