"use client";

import { useState, useEffect } from "react";
import styles from "../../../components/UI.module.css";

export default function JadwalDokterPage() {
  const [jadwalList, setJadwalList] = useState<any[]>([]);
  const [medisList, setMedisList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newJadwal, setNewJadwal] = useState({
    nama_dokter: "",
    spesialis: "",
    hari: "Senin",
    jam_mulai: "08:00",
    jam_selesai: "12:00"
  });

  const fetchData = async () => {
    try {
      const [resJadwal, resMedis] = await Promise.all([
        fetch("/api/jadwal-dokter"),
        fetch("/api/admin/medis")
      ]);
      const dataJadwal = await resJadwal.json();
      const dataMedis = await resMedis.json();
      
      if (dataJadwal.success) setJadwalList(dataJadwal.data);
      if (dataMedis.success) setMedisList(dataMedis.data);
    } catch (err) {
      console.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDoctorChange = (username: string) => {
    const selectedDoc = medisList.find(m => m.username === username);
    if (selectedDoc) {
      setNewJadwal({
        ...newJadwal,
        nama_dokter: selectedDoc.username,
        spesialis: selectedDoc.nama_poli || "Umum"
      });
    } else {
      setNewJadwal({ ...newJadwal, nama_dokter: "", spesialis: "" });
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJadwal.nama_dokter) {
      alert("Silakan pilih dokter terlebih dahulu");
      return;
    }
    try {
      const res = await fetch("/api/jadwal-dokter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newJadwal)
      });
      const data = await res.json();
      if (data.success) {
        alert("Jadwal berhasil ditambahkan!");
        setShowAddForm(false);
        setNewJadwal({ ...newJadwal, nama_dokter: "", spesialis: "" });
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal menambahkan jadwal");
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>;

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kelola Jadwal Dokter</h1>
          <p style={{ color: 'var(--text-muted)' }}>Sinkronisasi jadwal otomatis ke dashboard pasien.</p>
        </div>
        <button onClick={() => setShowAddForm(!showAddForm)} className={styles.button}>
          {showAddForm ? "Batal" : "Tambah Jadwal Baru"}
        </button>
      </div>

      {showAddForm && (
        <div className={styles.card} style={{ marginBottom: '2rem', maxWidth: '600px' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>Pilih Dokter & Atur Jam</h2>
          <form onSubmit={handleAdd}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Pilih Dokter</label>
              <select 
                required 
                value={newJadwal.nama_dokter} 
                onChange={e => handleDoctorChange(e.target.value)}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="">-- Pilih Dokter Terdaftar --</option>
                {medisList.map(m => (
                  <option key={m.id_user} value={m.username}>{m.username} ({m.nama_poli || "Umum"})</option>
                ))}
              </select>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Spesialis / Poli (Otomatis)</label>
              <input 
                type="text" 
                readOnly 
                value={newJadwal.spesialis} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: '#f9fafb', color: '#6b7280' }} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Hari</label>
                <select value={newJadwal.hari} onChange={e => setNewJadwal({...newJadwal, hari: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}>
                  {["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"].map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Jam Mulai</label>
                <input type="time" required value={newJadwal.jam_mulai} onChange={e => setNewJadwal({...newJadwal, jam_mulai: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Jam Selesai</label>
                <input type="time" required value={newJadwal.jam_selesai} onChange={e => setNewJadwal({...newJadwal, jam_selesai: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} />
              </div>
            </div>
            <button type="submit" className={styles.button} style={{ width: '100%' }}>Simpan Jadwal</button>
          </form>
        </div>
      )}

      <div className={styles.card} style={{ padding: '0', overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nama Dokter</th>
              <th>Spesialis</th>
              <th>Hari</th>
              <th>Jam Praktik</th>
            </tr>
          </thead>
          <tbody>
            {jadwalList.map((doc) => (
              <tr key={doc.id_jadwal}>
                <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{doc.nama_dokter}</td>
                <td>{doc.spesialis}</td>
                <td>{doc.hari}</td>
                <td>{doc.jam_mulai} - {doc.jam_selesai}</td>
              </tr>
            ))}
            {jadwalList.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>Belum ada data jadwal di database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


