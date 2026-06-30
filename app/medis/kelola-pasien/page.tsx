"use client";

import { useState, useEffect } from "react";
import styles from "../../../components/UI.module.css";

export default function KelolaPasien() {
  const [pasienList, setPasienList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchPasien = async () => {
    try {
      const res = await fetch("/api/admin/pasien");
      const data = await res.json();
      if (data.success) {
        setPasienList(data.data);
      }
    } catch (err) {
      console.error("Gagal memuat data pasien");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPasien();
  }, []);

  const handleSave = async (id: number) => {
    const pasien = pasienList.find(p => p.id === id);
    try {
      const res = await fetch("/api/admin/pasien", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pasien)
      });
      const data = await res.json();
      if (data.success) {
        setEditingId(null);
        alert("Data pasien berhasil diperbarui!");
        fetchPasien();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Gagal memperbarui data");
    }
  };

  const handleChange = (id: number, field: string, value: string) => {
    setPasienList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data pasien...</div>;

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100%', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>Kelola Data Pasien</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Lihat dan perbarui data diri pasien dari database.</p>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>No. RM</th>
              <th>Nama Pasien</th>
              <th>Jenis Kelamin</th>
              <th>Tanggal Lahir</th>
              <th>No. Telepon</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {pasienList.map((pasien) => {
              const isEditing = editingId === pasien.id;
              return (
                <tr key={pasien.id}>
                  <td><strong>{pasien.no_rekam_medis}</strong></td>
                  <td>
                    {isEditing ? (
                      <input type="text" value={pasien.nama} onChange={(e) => handleChange(pasien.id, 'nama', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    ) : pasien.nama}
                  </td>
                  <td>
                    {isEditing ? (
                      <select value={pasien.jenis_kelamin} onChange={(e) => handleChange(pasien.id, 'jenis_kelamin', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }}>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    ) : pasien.jenis_kelamin}
                  </td>
                  <td>
                    {isEditing ? (
                      <input type="text" value={pasien.tgl_lahir} onChange={(e) => handleChange(pasien.id, 'tgl_lahir', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    ) : pasien.tgl_lahir}
                  </td>
                  <td>
                    {isEditing ? (
                      <input type="text" value={pasien.no_telp} onChange={(e) => handleChange(pasien.id, 'no_telp', e.target.value)} style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '4px' }} />
                    ) : pasien.no_telp}
                  </td>
                  <td>
                    {isEditing ? (
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => handleSave(pasien.id)} className={styles.button} style={{ backgroundColor: 'var(--success)' }}>Simpan</button>
                        <button onClick={() => setEditingId(null)} className={`${styles.button} ${styles.buttonOutline}`} style={{ padding: '0.5rem 1rem' }}>Batal</button>
                      </div>
                    ) : (
                      <button onClick={() => setEditingId(pasien.id)} className={`${styles.button} ${styles.buttonOutline}`}>Edit</button>
                    )}
                  </td>
                </tr>
              );
            })}
            {pasienList.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Belum ada data pasien di database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

