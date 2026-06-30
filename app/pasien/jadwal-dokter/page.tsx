"use client";

import { useEffect, useState } from "react";
import styles from "../../../components/UI.module.css";

export default function JadwalDokter() {
  const [jadwal, setJadwal] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jadwal-dokter")
      .then(res => res.json())
      .then(res => {
        if (res.success) setJadwal(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat jadwal...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Jadwal Dokter</h1>
        <p className={styles.subtitle}>Informasi jam praktik dokter di klinik kami secara real-time.</p>
      </div>

      <div className={styles.card} style={{ padding: '0', overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Hari</th>
              <th>Spesialis/Poli</th>
              <th>Nama Dokter</th>
              <th>Jam Praktik</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map((item, index) => (
              <tr key={index}>
                <td style={{ fontWeight: 700 }}>{item.hari}</td>
                <td>{item.spesialis}</td>
                <td>{item.nama_dokter}</td>
                <td>
                  <span className={styles.badge} style={{ backgroundColor: '#ebf8ff', color: '#2b6cb0' }}>
                    {item.jam_mulai} - {item.jam_selesai}
                  </span>
                </td>
              </tr>
            ))}
            {jadwal.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada jadwal dokter yang terdaftar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

