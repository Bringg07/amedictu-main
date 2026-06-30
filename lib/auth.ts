// lib/auth.ts
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username dan password wajib diisi");
        }

        const conn = await pool.getConnection();
        try {
          // Cari user
          const [rows] = await conn.query<RowDataPacket[]>(
            `SELECT u.*, p.id_pasien, p.nama_depan, p.nama_belakang 
             FROM users u 
             LEFT JOIN pasien p ON u.id_user = p.id_user
             WHERE u.username = ? OR p.no_telp = ?
             LIMIT 1`,
            [credentials.username, credentials.username]
          );

          const user = rows[0];
          if (!user) throw new Error("Username atau password salah");

          // Cek role
          if (credentials.role && credentials.role !== user.role) {
            throw new Error("Username atau password salah");
          }

          // Verifikasi password
          const valid = await bcrypt.compare(credentials.password, user.password);
          if (!valid) throw new Error("Username atau password salah");

          return {
            id: user.id_user.toString(),
            username: user.username,
            role: user.role,
            id_pasien: user.id_pasien ?? null,
            id_poli: user.id_poli ?? null,
            nama: user.nama_depan
              ? `${user.nama_depan} ${user.nama_belakang}`
              : user.username,
          } as any;
        } finally {
          conn.release();
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id_user = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.id_pasien = (user as any).id_pasien;
        token.id_poli = (user as any).id_poli;
        token.nama = (user as any).nama;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id_user = token.id_user as string;
      session.user.username = token.username as string;
      session.user.role = token.role as string;
      session.user.id_pasien = token.id_pasien as number | null;
      session.user.id_poli = token.id_poli as number | null;
      session.user.nama = token.nama as string;
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
