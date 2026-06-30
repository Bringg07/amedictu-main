"use client";

import { useState, useEffect } from "react";
import styles from "../../../components/UI.module.css";

export default function RekamMedisPage() {
  const [activeTab, setActiveTab] = useState('riwayat');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch all patients who have medical records
    fetch('/api/admin/pasien') // Using existing patient API
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setPatients(res.data);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const [patientRecords, setPatientRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  const handleSelectPatient = async (patient: any) => {
    setSelectedPatient(patient);
    setLoadingRecords(true);
    try {
      const res = await fetch(`/api/rekam-medis?id_pasien=${patient.id_pasien}`);
      const data = await res.json();
      if (data.success) {
        setPatientRecords(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat rekam medis");
    } finally {
      setLoadingRecords(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100%', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Rekam Medis</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lihat riwayat pemeriksaan pasien</p>
        </div>
      </div>

      {!selectedPatient ? (
        <div className={styles.card}>
          <h3 className={styles.cardTitle} style={{ marginBottom: '1.5rem' }}>Daftar Seluruh Pasien</h3>
          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat data pasien...</div>
          ) : patients.length > 0 ? (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>No. RM</th>
                    <th>Nama Pasien</th>
                    <th>NIK</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p, idx) => (
                    <tr key={p.id_pasien}>
                      <td><strong style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>{p.no_rekam_medis}</strong></td>
                      <td>{p.nama_depan ? `${p.nama_depan} ${p.nama_belakang}` : p.nama}</td>
                      <td>{p.nik}</td>
                      <td>
                        <button 
                          onClick={() => handleSelectPatient(p)}
                          className={styles.button}
                        >
                          Lihat Riwayat
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
              Belum ada data pasien.
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <button 
            onClick={() => setSelectedPatient(null)} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '1rem', width: 'fit-content' }}
          >
            &larr; Kembali ke Daftar Pasien
          </button>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          
          {/* LEFT COLUMN */}
          <div style={{ width: '350px', display: 'flex', flexDirection: 'column', gap: '1.5rem', flexShrink: 0 }}>
            {/* PASIEN AKTIF CARD */}
            <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <div style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.75rem 1.25rem', fontWeight: 600, fontSize: '0.875rem', display: 'flex', justifyContent: 'space-between' }}>
                <span>Detail Pasien</span>
                <button onClick={() => setSelectedPatient(null)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 800 }}>Tutup</button>
              </div>
              <div style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.25rem' }}>
                    {(selectedPatient.nama_depan?.[0] || selectedPatient.nama?.[0] || '?').toUpperCase()}
                    {(selectedPatient.nama_belakang?.[0] || '').toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '1rem' }}>
                      {selectedPatient.nama_depan ? `${selectedPatient.nama_depan} ${selectedPatient.nama_belakang}` : selectedPatient.nama}
                    </h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No. RM: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedPatient.no_rekam_medis}</span></p>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>NIK</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedPatient.nik}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Jenis Kelamin</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedPatient.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Tempat Lahir</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{selectedPatient.tempat_lahir || '-'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Riwayat Rekam Medis</h2>
            
            {loadingRecords ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Memuat rekam medis...</div>
            ) : patientRecords.length > 0 ? (
              patientRecords.map((record) => (
                <div key={record.id_rekam_medis} className={styles.card} style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {new Date(record.tanggal_periksa).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Poli: {record.nama_poli || "Umum"}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Keluhan</p>
                      <p style={{ marginBottom: '0.75rem' }}>{record.keluhan}</p>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Diagnosa</p>
                      <p style={{ fontWeight: 600 }}>{record.diagnosa}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Resep Obat</p>
                      <p style={{ fontWeight: 600, color: 'var(--success)' }}>{record.resep_obat}</p>
                      <p style={{ fontSize: '0.875rem', fontStyle: 'italic' }}>{record.aturan_minum}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.card} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                Belum ada catatan rekam medis untuk pasien ini.
              </div>
            )}
          </div>

          </div>
        </div>
      )}
    </div>
  );
}
