"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifikasi");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifikasi);
        setUnreadCount(data.data.belum_dibaca);
      }
    } catch (err) {
      console.error("Gagal memuat notifikasi");
    }
  };

  useEffect(() => {
    if (session?.user?.id_user) {
      fetchNotifications();

      const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      });

      const channel = pusher.subscribe(`antrian-${session.user.id_pasien || session.user.id_user}`);
      channel.bind("status-update", (data: any) => {
        // Tampilkan notifikasi real-time
        if (Notification.permission === "granted") {
          new Notification("AMEDICTU", { body: data.pesan });
        }
        fetchNotifications();
      });

      return () => {
        pusher.unsubscribe(`antrian-${session.user.id_pasien || session.user.id_user}`);
      };
    }
  }, [session]);

  useEffect(() => {
    if (typeof window !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async () => {
    try {
      await fetch("/api/notifikasi", { method: "PATCH" });
      setUnreadCount(0);
    } catch (err) {
      console.error("Gagal menandai notifikasi");
    }
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      markAsRead();
    }
  };

  return (
    <div style={{ position: "relative" }} ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          position: "relative",
          padding: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          transition: "background 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#f3f4f6")}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "var(--text-main)" }}
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        {unreadCount > 0 && (
          <span
            style={{
              position: "absolute",
              top: "4px",
              right: "4px",
              backgroundColor: "#ef4444",
              color: "white",
              fontSize: "10px",
              fontWeight: 800,
              padding: "2px 5px",
              borderRadius: "10px",
              border: "2px solid white",
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            right: 0,
            marginTop: "10px",
            width: "320px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 1000,
            overflow: "hidden",
            border: "1px solid #e5e7eb",
          }}
        >
          <div style={{ padding: "12px 16px", borderBottom: "1px solid #f3f4f6", fontWeight: 700, fontSize: "0.875rem", display: "flex", justifyContent: "space-between" }}>
            <span>Notifikasi</span>
            {unreadCount > 0 && <span style={{ color: "#ef4444", fontSize: "0.75rem" }}>Baru</span>}
          </div>
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id_notifikasi}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f3f4f6",
                    fontSize: "0.875rem",
                    backgroundColor: notif.is_read ? "transparent" : "#f0f9ff",
                    transition: "background 0.2s",
                  }}
                >
                  <p style={{ margin: 0, color: "var(--text-main)", fontWeight: notif.is_read ? 400 : 600 }}>{notif.pesan}</p>
                  <p style={{ margin: "4px 0 0 0", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                    {new Date(notif.createdAt).toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" })}
                  </p>
                </div>
              ))
            ) : (
              <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: "0.875rem" }}>
                Tidak ada notifikasi
              </div>
            )}
          </div>
          <div style={{ padding: "10px", textAlign: "center", backgroundColor: "#f9fafb", borderTop: "1px solid #f3f4f6" }}>
            <button style={{ background: "none", border: "none", color: "var(--primary)", fontSize: "0.75rem", fontWeight: 600, cursor: "pointer" }}>
              Lihat Semua
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
