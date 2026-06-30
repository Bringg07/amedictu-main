"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import styles from "../../../components/UI.module.css";
import { useRouter } from "next/navigation";

export default function AmbilAntrean() {
  const { data: session } = useSession();
  const [polis, setPolis] = useState<any[]>([]);
  const [selectedPoli, setSelectedPoli] = useState<number | null>(null);
  const [keluhan, setKeluhan] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [antreanResult, setAntreanResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/poli")
      .then(res => res.json())
      .then(res => {
        if (res.success) setPolis(res.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPoli) {
      alert("Silakan pilih poli tujuan");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/antrean", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_poli: selectedPoli,
          keluhan,
          tanggal
        })
      });
      const data = await res.json();
      if (data.success) {
        setAntreanResult(data.data);
        setIsSubmitted(true);
        alert("Antrean berhasil diambil!");
      } else {
        alert(data.error || "Gagal mengambil antrean");
      }
    } catch (err) {
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Memuat layanan...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)' }}>Ambil Antrian</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Ambil nomor antrian secara online</p>
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 500 }}>
          {currentDate}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* LEFT COLUMN - FORM */}
        <div className={styles.card} style={{ flex: 2, padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-main)' }}>Ambil Nomor Antrian Baru</h2>
          
          <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <span style={{ color: '#3b82f6' }}>ℹ️</span>
            <p style={{ fontSize: '0.875rem', color: '#1e3a8a' }}>Data nama dan nomor rekam medis diisi otomatis dari profil Anda. Pilih poli dan tanggal kunjungan.</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NAMA PASIEN</label>
              <input type="text" value={session?.user?.nama || ""} readOnly style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'inherit', outline: 'none', cursor: 'default' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>NOMOR REKAM MEDIS</label>
              <input type="text" value={session?.user?.id_pasien ? `RM-${String(session.user.id_pasien).padStart(6, '0')}` : "-"} readOnly style={{ width: '100%', padding: '0.875rem', backgroundColor: '#f3f4f6', border: '1px solid #e5e7eb', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'inherit', outline: 'none', cursor: 'default' }} />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PILIH POLI LAYANAN</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                {polis.map((poli) => (
                  <div 
                    key={poli.id_poli} 
                    onClick={() => setSelectedPoli(poli.id_poli)}
                    style={{ 
                      padding: '1rem', 
                      border: selectedPoli === poli.id_poli ? '2px solid var(--primary)' : '1px solid #e5e7eb',
                      borderRadius: 'var(--radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: selectedPoli === poli.id_poli ? '#ebf8f8' : 'white'
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{poli.nama_poli}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{poli.deskripsi || "Layanan Aktif"}</p>
                    </div>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: selectedPoli === poli.id_poli ? '4px solid var(--primary)' : '1px solid #d1d5db', backgroundColor: 'white' }}></div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TANGGAL KUNJUNGAN</label>
              <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} style={{ width: '100%', padding: '0.875rem', border: '1px solid #d1d5db', borderRadius: 'var(--radius-md)', fontFamily: 'inherit', fontWeight: 500 }} />
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KELUHAN (OPSIONAL)</label>
              <textarea 
                value={keluhan}
                onChange={(e) => setKeluhan(e.target.value)}
                rows={3}
                placeholder="Deskripsikan keluhan Anda secara singkat..."
                style={{ width: '100%', padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid #d1d5db', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>

            <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '1rem', background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', color: 'white', fontWeight: 700, borderRadius: 'var(--radius-md)', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1rem', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? "Memproses..." : "Ambil Nomor Antrian"}
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN - STATUS CARDS */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ background: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 100%)', padding: '1.5rem', textAlign: 'center', color: 'white' }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>Nomor Antrian Anda</p>
              <h2 style={{ fontSize: '3rem', fontWeight: 800 }}>{isSubmitted ? `A-${String(antreanResult?.nomor_antrian).padStart(3, '0')}` : '-'}</h2>
              <p style={{ fontSize: '1rem', opacity: 0.9 }}>{polis.find(p => p.id_poli === selectedPoli)?.nama_poli || "Pilih Poli"}</p>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Tanggal Kunjungan</span>
                <strong style={{ color: 'var(--text-main)', fontSize: '0.875rem' }}>{new Date(tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Status</span>
                <strong style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>{isSubmitted ? "MENUNGGU" : "-"}</strong>
              </div>
              {isSubmitted && antreanResult?.estimasi_tunggu && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Estimasi Dilayani</span>
                  <strong style={{ color: 'var(--primary)', fontSize: '0.875rem' }}>±{antreanResult.estimasi_tunggu} menit</strong>
                </div>
              )}
            </div>
          </div>

          <div className={styles.card} style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ backgroundColor: 'var(--primary-dark)', padding: '1rem 1.5rem', color: 'white' }}>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em' }}>INFORMASI PENTING</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <ol style={{ fontSize: '0.75rem', color: 'var(--text-muted)', paddingLeft: '1rem', margin: 0, lineHeight: 1.6 }}>
                <li>Hadir 15 menit sebelum estimasi waktu panggil</li>
                <li>Bawa kartu identitas & kartu rekam medis</li>
                <li>Nomor hangus jika tidak hadir saat dipanggil</li>
              </ol>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

