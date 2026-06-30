"use client";

import styles from "../../../components/UI.module.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function PasienDashboard() {
  const { data: session } = useSession();
  const [myAntrean, setMyAntrean] = useState<any>(null);
  const [sedangDipanggil, setSedangDipanggil] = useState<string>("-");
  const [loading, setLoading] = useState(true);
  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Ambil antrean saya
        const resMy = await fetch("/api/antrean");
        const dataMy = await resMy.json();
        if (dataMy.success && dataMy.data.length > 0) {
          // Cari antrean yang masih menunggu atau dipanggil
          const active = dataMy.data.find((a: any) => a.status === "menunggu" || a.status === "dipanggil");
          setMyAntrean(active || null); // Hanya tampilkan jika sedang aktif
        }


        // 2. Ambil status global (siapa yang dipanggil)
        const resGlobal = await fetch("/api/antrean"); // Sementara pakai endpoint yang sama
        const dataGlobal = await resGlobal.json();
        if (dataGlobal.success) {
          const dipanggil = dataGlobal.data.find((a: any) => a.status === "dipanggil");
          if (dipanggil) {
            setSedangDipanggil(`A-${String(dipanggil.nomor_antrian).padStart(3, '0')}`);
          }
        }
      } catch (err) {
        console.error("Gagal memuat data dashboard");
      } finally {
        setLoading(false);
      }
    };

    if (session) fetchData();
  }, [session]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Beranda</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Selamat datang di AMEDICTU</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {currentDate}
        </div>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', 
        borderRadius: 'var(--radius-lg)', 
        padding: '2rem', 
        color: 'white',
        marginBottom: '2rem',
        boxShadow: 'var(--shadow-md)'
      }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.5px' }}>
          Selamat pagi, {session?.user?.nama?.toUpperCase() || "PASIEN"}!
        </h2>
        <p style={{ fontSize: '1rem', opacity: 0.9 }}>
          Kelola antrian klinik Anda dengan mudah
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NOMOR ANTRIAN SAYA</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            {myAntrean ? `A-${String(myAntrean.nomor_antrian).padStart(3, '0')}` : "-"}
          </div>
          {myAntrean && <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>{myAntrean.nama_poli}</p>}
        </div>
        <div className={styles.card} style={{ textAlign: 'center', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>SEDANG DIPANGGIL</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>{sedangDipanggil}</div>
        </div>
        <div className={styles.card} style={{ textAlign: 'center', padding: '1.5rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>ESTIMASI DIPANGGIL</p>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>
            {myAntrean && myAntrean.status === 'menunggu' ? `±${myAntrean.estimasi_tunggu || 15} menit` : "-"}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>LAYANAN CEPAT</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Link href="/pasien/ambil-antrean" style={{ textDecoration: 'none' }}>
          <div className={styles.card} style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#e6fffa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', color: 'var(--primary)' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Ambil Nomor Antrian</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Dapatkan nomor antrian digital untuk poli yang Anda tuju</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Ambil Sekarang &rarr;</p>
          </div>
        </Link>

        <Link href="/pasien/jadwal-dokter" style={{ textDecoration: 'none' }}>
          <div className={styles.card} style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#ebf8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', color: '#3182ce' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Jadwal Dokter</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Lihat jadwal dokter di sini sebelum periksa</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Lihat Sekarang &rarr;</p>
          </div>
        </Link>

        <Link href="/pasien/riwayat" style={{ textDecoration: 'none' }}>
          <div className={styles.card} style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', color: '#e53e3e' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Riwayat Antrian</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Cek histori kunjungan dan nomor antrian sebelumnya</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Lihat Sekarang &rarr;</p>
          </div>
        </Link>

        <Link href="/pasien/profile" style={{ textDecoration: 'none' }}>
          <div className={styles.card} style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', color: '#805ad5' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Profil Pasien</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Kelola data pribadi dan informasi akun Anda</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Lihat Sekarang &rarr;</p>
          </div>
        </Link>

        <Link href="/pasien/rekam-medis" style={{ textDecoration: 'none' }}>
          <div className={styles.card} style={{ transition: 'transform 0.2s', cursor: 'pointer', height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#fffaf0', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '1rem', color: '#dd6b20' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>
                </svg>
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)' }}>Rekam Medis</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>Lihat riwayat diagnosa dan resep obat dari dokter</p>
            <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 600 }}>Lihat Sekarang &rarr;</p>
          </div>
        </Link>
      </div>
    </div>
  );
}

