import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.logo}>AMEDICTU</h1>
      <p className={styles.subtitle}>
        Antrean Medik Tunggu — Sistem Manajemen Antrean Klinik dan Rekam Medis Terpadu.
      </p>

      <div className={styles.cardContainer}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Pasien</h2>
          <p className={styles.cardText}>
            Daftar, ambil antrean, dan pantau riwayat kesehatan Anda dengan mudah.
          </p>
          <Link href="/login" className={styles.button}>
            Login Pasien
          </Link>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Tenaga Medis</h2>
          <p className={styles.cardText}>
            Kelola antrean pasien dan input rekam medis secara real-time.
          </p>
          <Link href="/medis/login" className={styles.button}>
            Login Tenaga Medis
          </Link>
        </div>

        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Admin</h2>
          <p className={styles.cardText}>
            Kelola sistem, poli, laporan, dan jadwal dokter dengan akses penuh.
          </p>
          <Link href="/admin/login" className={styles.button}>
            Login Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
