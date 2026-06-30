"use client";

import styles from "../../../components/UI.module.css";

export default function LaporanPage() {
  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100%', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Laporan Sistem AMEDICTU</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Laporan data antrian dan rekam medis</p>
        </div>
        <div style={{ backgroundColor: '#e5e7eb', padding: '0.5rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
          Senin, 22 April 2026
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* REKAPITULASI ANTRIAN */}
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem 1.5rem', fontWeight: 600, fontSize: '1rem' }}>
            Rekapitulasi Antrian
          </div>
          <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>Total antrian hari ini</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>10</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>Selesai Diperiksa</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>Menunggu</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>8</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>Sedang Dipanggil</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>1</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>Dirujuk</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>0</span>
            </div>
          </div>
        </div>

        {/* DAFTAR DIAGNOSA TERCATAT */}
        <div style={{ flex: 1, backgroundColor: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '1rem 1.5rem', fontWeight: 600, fontSize: '1rem' }}>
            Daftar Diagnosa Tercatat
          </div>
          <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 500 }}>Asam Lambung</span>
              <span style={{ fontSize: '1rem', color: 'var(--text-main)', fontWeight: 800 }}>10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
