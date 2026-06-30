// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id_user: string;
      username: string;
      role: string;
      id_pasien: number | null;
      id_poli: number | null;
      nama: string;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id_user: string;
    username: string;
    role: string;
    id_pasien: number | null;
    id_poli: number | null;
    nama: string;
  }
}
