"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nama_depan: "",
    nama_belakang: "",
    nik: "",
    username: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          konfirmasi_password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Registrasi gagal");
        return;
      }

      alert("Pendaftaran berhasil! Silakan login.");
      router.push("/login");
    } catch (error) {
      console.error("REGISTER ERROR:", error);
      alert("Terjadi kesalahan saat registrasi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <svg
          className={styles.logoIcon}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M50 10L10 40V90H35V60H65V90H90V40L50 10Z"
            stroke="white"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <circle
            cx="50"
            cy="55"
            r="15"
            stroke="white"
            strokeWidth="4"
          />
          <path
            d="M50 45V65M40 55H60"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        <h1 className={styles.logo}>AMEDICTU</h1>

        <p className={styles.welcomeText}>
          Bergabunglah dengan AMEDICTU untuk pengalaman layanan kesehatan yang
          lebih baik.
        </p>
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.formWrapper}>
          <h2 className={styles.title}>Daftar Pasien</h2>

          <p className={styles.subtitle}>
            Lengkapi data diri Anda di bawah ini
          </p>

          <form onSubmit={handleRegister}>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "1.25rem",
              }}
            >
              <div style={{ flex: 1 }}>
                <label
                  htmlFor="nama_depan"
                  className={styles.label}
                >
                  NAMA DEPAN
                </label>

                <input
                  type="text"
                  id="nama_depan"
                  className={styles.input}
                  placeholder="Nama depan"
                  value={formData.nama_depan}
                  onChange={handleChange}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  htmlFor="nama_belakang"
                  className={styles.label}
                >
                  NAMA BELAKANG
                </label>

                <input
                  type="text"
                  id="nama_belakang"
                  className={styles.input}
                  placeholder="Nama belakang"
                  value={formData.nama_belakang}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nik" className={styles.label}>
                NIK (NOMOR INDUK KEPENDUDUKAN)
              </label>

              <input
                type="text"
                id="nik"
                className={styles.input}
                placeholder="Masukkan 16 digit NIK"
                value={formData.nik}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>
                USERNAME (bebas)
              </label>

              <input
                type="text"
                id="username"
                className={styles.input}
                placeholder="Contoh: budi123 atau budi_santoso"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.4rem' }}>
                Username bebas, tidak perlu mengikuti format khusus.
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>
                PASSWORD
              </label>

              <div className={styles.passwordField}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className={styles.input}
                  placeholder="Buat password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />

                <span
                  className={styles.eyeIcon}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>

                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>

                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className={styles.button}
              disabled={loading}
            >
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
            </button>
          </form>

          <p className={styles.linkText}>
            Sudah punya akun?{" "}
            <Link href="/login" className={styles.link}>
              Login di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}