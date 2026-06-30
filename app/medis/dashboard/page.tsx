"use client";

import { useState, useEffect } from "react";
import styles from "../../../components/UI.module.css";
import Link from "next/link";
import { useRouter } from "next/navigation";

type StatusAntrian = "menunggu" | "dipanggil" | "diperiksa" | "selesai" | "dibatalkan";

interface Antrean {
  id_antrian: number;
  nomor_antrian: number;
  nama_depan: string;
  nama_belakang: string;
  keluhan: string;
  status: StatusAntrian;
  nama_poli: string;
  waktu_dipanggil: string | null;
}

export default function MedisDashboard() {
  const [antreanList, setAntreanList] = useState<Antrean[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [now, setNow] = useState(new Date().getTime());
  const router = useRouter();

  // Timer untuk update UI tombol Batal secara real-time
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date().getTime()), 10000);
    return () => clearInterval(timer);
  }, []);

  const fetchAntrean = async () => {
    try {
      const res = await fetch("/api/antrean");
      const data = await res.json();
      if (data.success) {
        // Urutkan: diperiksa (1), dipanggil (2), menunggu (3), selesai/dibatalkan (4)
        const sorted = data.data.sort((a: Antrean, b: Antrean) => {
          const priority: any = { diperiksa: 1, dipanggil: 2, menunggu: 3, selesai: 4, dibatalkan: 5 };
          return priority[a.status] - priority[b.status];
        });
        setAntreanList(sorted);
      }
    } catch (err) {
      console.error("Gagal memuat antrean");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAntrean();
    // Refresh setiap 30 detik
    const interval = setInterval(fetchAntrean, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: StatusAntrian) => {
    try {
      const res = await fetch(`/api/antrean/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        fetchAntrean(); // Refresh data
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal memperbarui status");
    }
  };

  const getStatusBadge = (status: StatusAntrian) => {
    switch(status) {
      case "menunggu": return <span className={`${styles.badge} ${styles.badgeMenunggu}`}>Menunggu</span>;
      case "dipanggil": return <span className={`${styles.badge}`} style={{ backgroundColor: '#fff3cd', color: '#856404', border: '1px solid #ffeeba' }}>Pasien Dipanggil</span>;
      case "diperiksa": return <span className={`${styles.badge}`} style={{ backgroundColor: '#c6f6d5', color: '#22543d', border: '1px solid #9ae6b4' }}>Sedang Diperiksa</span>;
      case "selesai": return <span className={`${styles.badge} ${styles.badgeAktif}`}>Selesai</span>;
      case "dibatalkan": return <span className={`${styles.badge}`} style={{ backgroundColor: '#fed7d7', color: '#c53030' }}>Dibatalkan</span>;
      default: return null;
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data antrean...</div>;

  const totalPasien = antreanList.length;
  const menunggu = antreanList.filter(a => a.status === 'menunggu' || a.status === 'dipanggil').length;
  const selesai = antreanList.filter(a => a.status === 'selesai').length;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard Tenaga Medis</h1>
        <p className={styles.subtitle}>Ringkasan antrean dan pasien hari ini.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Total Pasien</h3>
          </div>
          <div className={styles.statValue}>{totalPasien}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Sedang Menunggu</h3>
            <span className={`${styles.badge} ${styles.badgeMenunggu}`}>Antre</span>
          </div>
          <div className={styles.statValue}>{menunggu}</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Selesai Diperiksa</h3>
            <span className={`${styles.badge} ${styles.badgeAktif}`}>Selesai</span>
          </div>
          <div className={styles.statValue}>{selesai}</div>
        </div>
      </div>

      <div className={styles.header} style={{ marginTop: '3rem', marginBottom: '1.5rem' }}>
        <h2 className={styles.title} style={{ fontSize: '1.5rem' }}>Daftar Antrean Real-time</h2>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No. Antrean</th>
              <th>Nama Pasien</th>
              <th>Poli</th>
              <th>Keluhan</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {antreanList
              .filter(a => ['menunggu', 'dipanggil', 'diperiksa'].includes(a.status)) // Tampilkan yang aktif saja
              .map((antrean) => (
              <tr key={antrean.id_antrian}>
                <td><strong style={{ color: 'var(--primary)', fontSize: '1.2rem' }}>A-{String(antrean.nomor_antrian).padStart(3, '0')}</strong></td>
                <td>{antrean.nama_depan} {antrean.nama_belakang}</td>
                <td>{antrean.nama_poli}</td>
                <td>{antrean.keluhan || "-"}</td>
                <td>{getStatusBadge(antrean.status)}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {antrean.status === 'menunggu' && (
                      <button onClick={() => handleUpdateStatus(antrean.id_antrian, "dipanggil")} className={styles.button} style={{ backgroundColor: '#3182ce' }}>Panggil</button>
                    )}
                    {antrean.status === 'dipanggil' && (
                      <>
                        <button onClick={() => handleUpdateStatus(antrean.id_antrian, "diperiksa")} className={styles.button} style={{ backgroundColor: 'var(--primary)' }}>Pasien Datang</button>
                        
                        {(() => {
                          if (!antrean.waktu_dipanggil) return (
                            <button onClick={() => handleUpdateStatus(antrean.id_antrian, "dibatalkan")} className={styles.button} style={{ backgroundColor: '#e53e3e' }}>Batal (Manual)</button>
                          );
                          const diff = (now - new Date(antrean.waktu_dipanggil).getTime()) / 60000;
                          if (diff >= 5) {
                            return (
                              <button onClick={() => handleUpdateStatus(antrean.id_antrian, "dibatalkan")} className={styles.button} style={{ backgroundColor: '#e53e3e' }}>Batal (Tidak Hadir)</button>
                            );
                          }
                          return <span style={{ fontSize: '0.7rem', color: '#856404', fontStyle: 'italic', backgroundColor: '#fff3cd', padding: '2px 8px', borderRadius: '4px' }}>Bisa batal {Math.ceil(5 - diff)}m lagi</span>;
                        })()}
                      </>
                    )}
                    {antrean.status === 'diperiksa' && (
                      <button onClick={() => router.push('/medis/antrean')} className={styles.button} style={{ backgroundColor: 'var(--success)' }}>Input Rekam Medis</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {antreanList.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada antrean hari ini.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

