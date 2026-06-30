"use client";

import { useState, useEffect } from "react";
import styles from "../../../components/UI.module.css";

export default function KelolaMedisPage() {
  const [medisList, setMedisList] = useState<any[]>([]);
  const [poliList, setPoliList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ username: "", password: "", id_poli: "", nama_lengkap: "" });

  const fetchData = async () => {
    try {
      const [resMedis, resPoli] = await Promise.all([
        fetch("/api/admin/medis"),
        fetch("/api/poli")
      ]);
      
      const dataMedis = await resMedis.json();
      const dataPoli = await resPoli.json();
      
      if (dataMedis.success) setMedisList(dataMedis.data);
      if (dataPoli.success) setPoliList(dataPoli.data);
    } catch (err) {
      console.error("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/medis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert("Akun dokter berhasil dibuat!");
        setFormData({ username: "", password: "", id_poli: "", nama_lengkap: "" });
        setShowForm(false);
        fetchData();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan");
    }
  };

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>;

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Kelola Akun Dokter</h1>
          <p style={{ color: 'var(--text-muted)' }}>Buat dan kelola akses untuk tenaga medis per poliklinik.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className={styles.button}>
          {showForm ? "Batal" : "Tambah Dokter Baru"}
        </button>
      </div>

      {showForm && (
        <div className={styles.card} style={{ maxWidth: '500px', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700 }}>Registrasi Akun Medis</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nama Lengkap Dokter</label>
              <input 
                type="text" 
                required 
                placeholder="Contoh: dr. Sari Madani, Sp.A"
                value={formData.nama_lengkap} 
                onChange={e => setFormData({...formData, nama_lengkap: e.target.value})} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Username (ID Login)</label>
              <input 
                type="text" 
                required 
                placeholder="Contoh: dr_sari"
                value={formData.username} 
                onChange={e => setFormData({...formData, username: e.target.value})} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Penugasan Poliklinik</label>
              <select 
                required 
                value={formData.id_poli} 
                onChange={e => setFormData({...formData, id_poli: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }}
              >
                <option value="">-- Pilih Poliklinik --</option>
                {poliList.map(p => (
                  <option key={p.id_poli} value={p.id_poli}>{p.nama_poli}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password Akun</label>
              <input 
                type="password" 
                required 
                placeholder="Minimal 6 karakter"
                value={formData.password} 
                onChange={e => setFormData({...formData, password: e.target.value})} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #ddd' }} 
              />
            </div>
            <button type="submit" className={styles.button} style={{ width: '100%' }}>Buat Akun Sekarang</button>
          </form>
        </div>
      )}

      <div className={styles.card} style={{ padding: '0', overflow: 'hidden' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID Petugas</th>
              <th>Nama Lengkap</th>
              <th>Username</th>
              <th>Poli</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {medisList.map((medis) => (
              <tr key={medis.id_user}>
                <td><code style={{ backgroundColor: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>{medis.id_petugas}</code></td>
                <td style={{ fontWeight: 700 }}>{medis.nama_lengkap || "-"}</td>
                <td>{medis.username}</td>
                <td><span className={styles.badge} style={{ backgroundColor: '#ebf8ff', color: '#2b6cb0' }}>{medis.nama_poli || "Umum"}</span></td>
                <td><span className={styles.badge} style={{ backgroundColor: '#c6f6d5', color: '#276749' }}>Aktif</span></td>
              </tr>
            ))}
            {medisList.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>Belum ada akun dokter yang dibuat.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>


    </div>
  );
}
