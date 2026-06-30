"use client";

import { useState, useEffect } from "react";
import styles from "../../../components/UI.module.css";
import Link from "next/link";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ totalPasien: 0, tenagaMedis: 0, kunjunganHariIni: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat statistik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat statistik sistem...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title} style={{ color: '#1e293b' }}>Control Center</h1>
        <p className={styles.subtitle}>Ringkasan operasional dan statistik klinik AMEDICTU secara real-time.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className={styles.card} style={{ borderLeft: '4px solid #4f46e5' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Total Pasien Terdaftar</h3>
          </div>
          <div className={styles.statValue} style={{ color: '#4f46e5' }}>{stats.totalPasien}</div>
        </div>

        <div className={styles.card} style={{ borderLeft: '4px solid #0d9488' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Tenaga Medis Aktif</h3>
          </div>
          <div className={styles.statValue} style={{ color: '#0d9488' }}>{stats.tenagaMedis}</div>
        </div>

        <div className={styles.card} style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Kunjungan Hari Ini</h3>
            <span className={styles.badge} style={{ backgroundColor: '#fef3c7', color: '#92400e' }}>Live</span>
          </div>
          <div className={styles.statValue} style={{ color: '#f59e0b' }}>{stats.kunjunganHariIni}</div>
        </div>
      </div>

      <div className={styles.card} style={{ backgroundColor: '#1e293b', color: 'white', padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>Manajemen Sistem</h2>
        <p style={{ opacity: 0.8, marginBottom: '2rem', fontSize: '0.9rem' }}>
          Gunakan pintasan di bawah untuk mengelola data operasional klinik dengan cepat.
        </p>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/admin/laporan">
            <button className={styles.button} style={{ backgroundColor: 'white', color: '#1e293b' }}>Buka Laporan</button>
          </Link>
          <Link href="/admin/kelola-medis">
            <button className={styles.button} style={{ backgroundColor: 'transparent', border: '1px solid white', color: 'white' }}>Kelola Akun Medis</button>
          </Link>
          <Link href="/admin/jadwal-dokter">
            <button className={styles.button} style={{ backgroundColor: 'transparent', border: '1px solid white', color: 'white' }}>Update Jadwal</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

