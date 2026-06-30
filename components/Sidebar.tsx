"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  role: "pasien" | "medis" | "admin";
}

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const links = {
    pasien: [
      {
        group: "MENU UTAMA",
        items: [
          { href: "/pasien/dashboard", label: "Beranda", icon: "squares" },
          { href: "/pasien/ambil-antrean", label: "Ambil Antrian", icon: "calendar" },
          { href: "/pasien/riwayat", label: "Riwayat Antrian", icon: "history" },
          { href: "/pasien/rekam-medis", label: "Rekam Medis", icon: "person" },
        ]
      },
      {
        group: "AKUN",
        items: [
          { href: "/pasien/profile", label: "Data pasien", icon: "person" },
        ]
      }
    ],
    medis: [
      {
        group: "MENU UTAMA",
        items: [
          { href: "/medis/dashboard", label: "Beranda", icon: "squares" },
          { href: "/medis/antrean", label: "Kelola Antrian", icon: "calendar" },
          { href: "/medis/rekam-medis", label: "Rekam Medis", icon: "person" },
        ]
      },
      {
        group: "ADMINISTRASI",
        items: [
          { href: "/medis/kelola-pasien", label: "Kelola Data Pasien", icon: "person" },
        ]
      }
    ],
    admin: [
      {
        group: "MENU UTAMA",
        items: [
          { href: "/admin/dashboard", label: "Beranda", icon: "squares" },
          { href: "/admin/antrean", label: "Kelola Antrian", icon: "calendar" },
          { href: "/admin/rekam-medis", label: "Rekam Medis", icon: "person" },
          { href: "/admin/jadwal-dokter", label: "Jadwal Dokter", icon: "calendar" },
        ]
      },
      {
        group: "ADMINISTRASI",
        items: [
          { href: "/admin/kelola-pasien", label: "Kelola Data Pasien", icon: "person" },
          { href: "/admin/kelola-medis", label: "Kelola Akun Dokter", icon: "person" },
          { href: "/admin/laporan", label: "Laporan", icon: "person" },
        ]
      }
    ]
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "squares":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: '10px' }}>
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        );
      case "calendar":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: '10px' }}>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        );
      case "history":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: '10px' }}>
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        );
      case "person":
        return (
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" style={{ marginRight: '10px' }}>
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        );
      default:
        return null;
    }
  };

  const navGroups = links[role] || [];

  const getSidebarStyle = () => {
    switch (role) {
      case "pasien": return { backgroundColor: 'var(--primary)' }; // Brand Primary Teal-green
      case "medis": return { backgroundColor: 'var(--primary-dark)' }; // Brand Dark Teal-green
      case "admin": return { backgroundColor: '#163030' }; // Brand Deep Dark Teal
      default: return { backgroundColor: 'var(--primary-dark)' };
    }
  };

  const sidebarStyle = getSidebarStyle();

  return (
    <aside className={styles.sidebar} style={{ ...sidebarStyle, padding: '2rem 1rem' }}>
      <div className={styles.logo} style={{ color: 'white', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: '24px', height: '24px', marginRight: '10px' }}>
          <path d="M50 10L10 40V90H35V60H65V90H90V40L50 10Z" stroke="white" strokeWidth="6" strokeLinejoin="round"/>
          <circle cx="50" cy="55" r="15" stroke="white" strokeWidth="6"/>
          <path d="M50 45V65M40 55H60" stroke="white" strokeWidth="6" strokeLinecap="round"/>
        </svg>
        <span style={{ fontSize: '1.25rem', fontWeight: 800 }}>AMEDICTU</span>
      </div>

      <nav className={styles.nav}>
        {navGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '0.5rem', paddingLeft: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {group.group}
            </div>
            {group.items.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.75rem 1rem',
                    color: isActive ? sidebarStyle.backgroundColor : 'rgba(255,255,255,0.8)',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    borderRadius: 'var(--radius-md)',
                    textDecoration: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    marginBottom: '0.25rem',
                    transition: 'all 0.2s'
                  }}
                >
                  {renderIcon(link.icon)}
                  {link.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className={styles.logout} style={{ marginTop: 'auto', paddingTop: '2rem' }}>
        <button
          className={styles.logoutBtn}
          onClick={async () => {
            await signOut({ redirect: false });
            window.location.href = "/";
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.8)',
            cursor: 'pointer',
            padding: '0.75rem 1rem',
            width: '100%',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          <span style={{ marginRight: '10px', fontSize: '1.2em' }}>🚪</span> Keluar
        </button>
      </div>
    </aside>
  );
}
