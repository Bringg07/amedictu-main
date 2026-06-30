// lib/api-helpers.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export function apiSuccess<T>(data: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, data, message }, { status });
}

export function apiError(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return { session: null, error: apiError("Silakan login terlebih dahulu", 401) };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return { session: null, error: apiError("Anda tidak memiliki akses", 403) };
  }

  return { session, error: null };
}

export async function withErrorHandler(handler: () => Promise<NextResponse>): Promise<NextResponse> {
  try {
    return await handler();
  } catch (error: any) {
    console.error("[API Error]", error);
    return apiError(
      process.env.NODE_ENV === "development" ? error.message : "Terjadi kesalahan server",
      500
    );
  }
}
