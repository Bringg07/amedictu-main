"use client";

import { useEffect, useState } from "react";
import styles from "../../../components/UI.module.css";
import { useSession } from "next-auth/react";

export default function RiwayatAntrean() {
  const { data: session } = useSession();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/antrean")
        .then(res => res.json())
        .then(res => {
          if (res.success) setHistory(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat riwayat...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Riwayat Antrean</h1>
        <p className={styles.subtitle}>Catatan kunjungan Anda di klinik kami.</p>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>No. Antrean</th>
              <th>Poli</th>
              <th>Keluhan</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id_antrian}>
                <td>{new Date(item.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                <td><strong style={{ color: 'var(--primary)' }}>A-{String(item.nomor_antrian).padStart(3, '0')}</strong></td>
                <td>{item.nama_poli}</td>
                <td>{item.keluhan || "-"}</td>
                <td>
                  <span className={`${styles.badge}`} style={{ 
                    backgroundColor: item.status === 'selesai' ? '#e2e8f0' : item.status === 'dipanggil' ? '#bee3f8' : '#fff5f5',
                    color: item.status === 'selesai' ? '#475569' : item.status === 'dipanggil' ? '#2b6cb0' : '#c53030'
                  }}>
                    {item.status.toUpperCase()}
                  </span>
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada riwayat antrean.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

