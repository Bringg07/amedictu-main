"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./page.module.css";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        username,
        password,
        role: "pasien" // Kunci agar hanya pasien yang bisa login di sini
      });

      if (result?.error) {
        setError("Username atau kata sandi salah!");
        setIsLoading(false);
      } else {
        router.push("/pasien/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }

  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel} style={{ backgroundColor: 'var(--secondary)' }}>
        <div className={styles.formWrapper}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '8px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
            <span style={{ fontWeight: 800, letterSpacing: '0.1em', color: 'var(--primary-dark)', fontSize: '0.75rem' }}>PORTAL PASIEN</span>
          </div>

          <div className={styles.switchContainer}>
            <button className={`${styles.switchButton} ${styles.active}`} style={{ color: 'var(--primary-dark)' }}>Masuk</button>
            <button className={styles.switchButton} onClick={() => router.push('/register')}>Daftar</button>
          </div>

          <h2 className={styles.title}>Selamat Datang</h2>
          <p className={styles.subtitle}>Masuk untuk mengambil antrean dan cek rekam medis</p>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #f87171' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>USERNAME / NO. HP</label>
              <input 
                type="text" 
                id="username" 
                className={styles.input} 
                placeholder="budi_santoso" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.label}>KATA SANDI</label>
              <div className={styles.passwordField}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className={styles.input} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </span>
              </div>
            </div>
            
            <button type="submit" className={styles.button} style={{ backgroundColor: 'var(--primary)' }} disabled={isLoading}>
              {isLoading ? "Sedang Masuk..." : "Masuk ke Dashboard"}
            </button>
          </form>
          
          <div className={styles.divider}>atau</div>
          
          <p className={styles.linkText}>
            Belum punya akun? <Link href="/register" className={styles.link} style={{ color: 'var(--primary)' }}>Daftar sekarang</Link>
          </p>

          <p className={styles.linkText} style={{ marginTop: '2rem' }}>
            <Link href="/" className={styles.link} style={{ color: 'var(--primary-dark)' }}>&larr; Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
      
      <div className={styles.rightPanel} style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)' }}>
        <svg className={styles.logoIcon} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
        </svg>
        <h1 className={styles.logo}>AMEDICTU</h1>
        <p className={styles.welcomeText}>
          Portal Pasien untuk pendaftaran antrean dan riwayat medis mandiri.
        </p>
      </div>
    </div>
  );
}
