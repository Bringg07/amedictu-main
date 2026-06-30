"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./medis-login.module.css";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function MedisLoginPage() {
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
        role: "tenaga_medis"
      });

      if (result?.error) {
        setError("ID Medis atau Staff Key salah!");
      } else {
        router.push("/medis/dashboard");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.formWrapper}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '8px', height: '24px', backgroundColor: 'var(--primary)', borderRadius: '4px' }}></div>
            <span style={{ fontWeight: 800, letterSpacing: '0.1em', color: 'var(--primary)', fontSize: '0.75rem' }}>PORTAL TENAGA MEDIS</span>
          </div>

          <h2 className={styles.title} style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--primary-dark)', marginBottom: '0.5rem' }}>Staff Verification</h2>
          <p className={styles.subtitle} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>Masuk untuk akses sistem pelayanan medis terpadu</p>
          
          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem', fontWeight: 500, border: '1px solid #f87171' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className={styles.formGroup} style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="username" className={styles.label} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>MEDICAL ID</label>
              <input 
                type="text" 
                id="username" 
                className={styles.input} 
                placeholder="ID Petugas Anda" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ backgroundColor: 'var(--secondary)', border: 'none', padding: '0.875rem 1.25rem' }}
              />
            </div>
            
            <div className={styles.formGroup} style={{ marginBottom: '2rem' }}>
              <label htmlFor="password" className={styles.label} style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.5rem', display: 'block' }}>STAFF KEY</label>
              <div className={styles.passwordField}>
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  className={styles.input} 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ backgroundColor: 'var(--secondary)', border: 'none', padding: '0.875rem 1.25rem' }}
                />
                <span className={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  )}
                </span>
              </div>
            </div>
            
            <button type="submit" className={styles.button} style={{ backgroundColor: 'var(--primary)', padding: '1rem', fontWeight: 700, letterSpacing: '0.025em', borderRadius: '0.5rem' }} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Authorize Staff"}
            </button>
          </form>
          
          <p className={styles.linkText} style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link href="/" className={styles.link} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>&larr; Kembali ke Beranda</Link>
          </p>
        </div>
      </div>
      
      <div className={styles.rightPanel} style={{ backgroundColor: 'var(--primary)', background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ border: '4px solid white', borderRadius: '1.5rem', padding: '1.5rem', marginBottom: '2rem' }}>
             <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
              <line x1="12" y1="10" x2="12" y2="14"></line>
              <line x1="10" y1="12" x2="14" y2="12"></line>
            </svg>
          </div>
          <h1 className={styles.logo} style={{ fontSize: '3.5rem', letterSpacing: '0.05em', marginBottom: '1rem' }}>AMEDICTU</h1>
          <p className={styles.welcomeText} style={{ fontSize: '1rem', opacity: 0.8, maxWidth: '350px' }}>
            Portal Tenaga Medis untuk mengelola antrean pasien dan rekam medis secara terpadu.
          </p>
        </div>
      </div>
    </div>
  );
}


