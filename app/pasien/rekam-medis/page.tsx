"use client";

import { useEffect, useState } from "react";
import styles from "../../../components/UI.module.css";
import { useSession } from "next-auth/react";

export default function RekamMedisPasien() {
  const { data: session } = useSession();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/rekam-medis")
        .then(res => res.json())
        .then(res => {
          if (res.success) setRecords(res.data);
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat rekam medis...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Rekam Medis Saya</h1>
        <p className={styles.subtitle}>Riwayat kesehatan, diagnosa, dan resep obat Anda.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {records.length > 0 ? (
          records.map((record) => (
            <div key={record.id_rekam_medis} className={styles.card} style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>
                    Pemeriksaan Tanggal {new Date(record.tanggal_periksa).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No. RM: {record.no_rekam_medis}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className={styles.badge} style={{ backgroundColor: '#e6fffa', color: '#2c7a7b' }}>SELESAI</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Keluhan</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{record.keluhan || "-"}</p>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Diagnosa</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>{record.diagnosa || "-"}</p>
                  </div>
                </div>
                <div>
                  <div style={{ marginBottom: '1.25rem', backgroundColor: '#f7fafc', padding: '1rem', borderRadius: '8px' }}>
                    <h4 style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Resep Obat</h4>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', fontWeight: 600 }}>{record.resep_obat || "-"}</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{record.aturan_minum}</p>
                  </div>
                </div>
              </div>
              
              {(record.tekanan_darah || record.suhu || record.berat_badan) && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', backgroundColor: '#ebf8ff', padding: '0.75rem 1rem', borderRadius: '8px' }}>
                  {record.tekanan_darah && <div style={{ fontSize: '0.75rem' }}><span style={{ color: '#2b6cb0', fontWeight: 700 }}>TD:</span> {record.tekanan_darah} mmHg</div>}
                  {record.suhu && <div style={{ fontSize: '0.75rem' }}><span style={{ color: '#2b6cb0', fontWeight: 700 }}>Suhu:</span> {record.suhu} °C</div>}
                  {record.berat_badan && <div style={{ fontSize: '0.75rem' }}><span style={{ color: '#2b6cb0', fontWeight: 700 }}>BB:</span> {record.berat_badan} kg</div>}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.card} style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Belum ada catatan rekam medis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
