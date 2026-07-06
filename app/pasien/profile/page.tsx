"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "../../../components/UI.module.css";

export default function DataPasien() {
  const { data: session } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    nama_depan: "",
    nama_belakang: "",
    nik: "",
    tgl_lahir: "",
    jenis_kelamin: "",
    gol_darah: "",
    no_telp: "",
    alamat: "",
    password_lama: "",
    password_baru: "",
    konfirmasi_password_baru: ""
  });

  useEffect(() => {
    if (session?.user?.id_pasien) {
      fetch(`/api/pasien/${session.user.id_pasien}`)
        .then(res => res.json())
        .then(res => {
          if (res.success) {
            setFormData(prev => ({
              ...prev,
              ...res.data,
              tgl_lahir: res.data.tgl_lahir ? res.data.tgl_lahir.split('T')[0] : "",
              password_lama: "",
              password_baru: "",
              konfirmasi_password_baru: ""
            }));
          }
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password_baru && formData.password_baru !== formData.konfirmasi_password_baru) {
      alert("Password baru dan konfirmasi password tidak cocok!");
      return;
    }
    
    try {
      const res = await fetch(`/api/pasien/${session?.user?.id_pasien}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        alert("Profil berhasil diperbarui!");
        setIsEditing(false);
      } else {
        alert(data.error || "Gagal memperbarui profil");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat data...</div>;

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>Data Pasien</h1>
        <p className={styles.subtitle}>Informasi pribadi dan rekam medis dasar Anda.</p>
      </div>

      {!isEditing ? (
        <div className={styles.card} style={{ maxWidth: '800px', padding: '0', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', color: 'white', padding: '2rem', position: 'relative' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{formData.nama_depan} {formData.nama_belakang}</h2>
            <p style={{ opacity: 0.9 }}>Pasien Terdaftar AMEDICTU</p>
            <div style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'rgba(255,255,255,0.2)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-lg)' }}>
              <strong>Golongan Darah:</strong> <span style={{ fontSize: '1.2rem', fontWeight: 800 }}>{formData.gol_darah}</span>
            </div>
          </div>
          <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>NIK</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formData.nik}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Tanggal Lahir</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{new Date(formData.tgl_lahir).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Jenis Kelamin</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                {formData.jenis_kelamin === 'laki_laki' ? 'Laki-laki' : 
                 formData.jenis_kelamin === 'perempuan' ? 'Perempuan' : '-'}
              </p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Nomor Telepon</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formData.no_telp}</p>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Alamat</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>{formData.alamat}</p>
            </div>
          </div>
          <div style={{ padding: '1.5rem 2rem', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setIsEditing(true)} className={styles.button}>Edit Data</button>
          </div>
        </div>
      ) : (
        <div className={styles.card} style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nama Depan</label>
                <input type="text" name="nama_depan" value={formData.nama_depan} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nama Belakang</label>
                <input type="text" name="nama_belakang" value={formData.nama_belakang} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>NIK</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nomor Telepon</label>
                <input type="text" name="no_telp" value={formData.no_telp} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Tanggal Lahir</label>
                <input type="date" name="tgl_lahir" value={formData.tgl_lahir} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Jenis Kelamin</label>
                <select name="jenis_kelamin" value={formData.jenis_kelamin || ""} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }}>
                  <option value="" disabled>-- Pilih Jenis Kelamin --</option>
                  <option value="laki_laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Golongan Darah</label>
                <select name="gol_darah" value={formData.gol_darah || ""} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }}>
                  <option value="" disabled>-- Pilih Golongan Darah --</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="AB">AB</option>
                  <option value="O">O</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Alamat</label>
              <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={3} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit', resize: 'vertical' }} />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid #e2e8f0', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-main)' }}>Keamanan Akun</h3>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Password Lama</label>
                  <input type="password" placeholder="Wajib jika ubah password" name="password_lama" value={formData.password_lama} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Password Baru</label>
                  <input type="password" placeholder="Kosongkan jika tidak ingin mengubah" name="password_baru" value={formData.password_baru} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>Konfirmasi Password Baru</label>
                  <input type="password" placeholder="Ulangi password baru" name="konfirmasi_password_baru" value={formData.konfirmasi_password_baru} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #e2e8f0', fontFamily: 'inherit' }} />
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button type="submit" className={styles.button}>Simpan Perubahan</button>
              <button type="button" onClick={() => setIsEditing(false)} className={`${styles.button} ${styles.buttonOutline}`}>Batal</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
