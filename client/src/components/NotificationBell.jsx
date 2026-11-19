import React, { useEffect, useRef, useState, useCallback } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../services/api";

const POLL_INTERVAL_MS = 30000;

function readLastSeen(userId) {
  try {
    return localStorage.getItem(`cc-notifications-seen-${userId}`) || "";
  } catch {
    return "";
  }
}

function writeLastSeen(userId, iso) {
  try {
    localStorage.setItem(`cc-notifications-seen-${userId}`, iso);
  } catch {
    // storage unavailable (private mode): unread state just won't persist
  }
}

export default function NotificationBell({ userId }) {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [lastSeen, setLastSeen] = useState(() => readLastSeen(userId));
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const data = await apiRequest("/notifications");
      setNotifications(data.notifications || []);
    } catch {
      // keep the previous list on a failed poll
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const close = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const unread = notifications.filter((n) => !lastSeen || n.created_at > lastSeen);

  const markAllRead = () => {
    const newest = notifications[0]?.created_at || new Date().toISOString();
    writeLastSeen(userId, newest);
    setLastSeen(newest);
  };

  const timeAgo = (iso) => {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return t("notifications.justNow");
    if (minutes < 60) return t("notifications.minutesAgo", { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t("notifications.hoursAgo", { count: hours });
    return t("notifications.daysAgo", { count: Math.floor(hours / 24) });
  };

  return (
    <div className="notif-wrapper" ref={wrapperRef}>
      <button
        type="button"
        className="notif-bell-btn"
        onClick={() => setOpen(!open)}
        aria-label={t("nav.notifications")}
        title={t("nav.notifications")}
      >
        <Bell size={17} />
        {unread.length > 0 && <span className="notif-count">{unread.length > 9 ? "9+" : unread.length}</span>}
      </button>

      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span>{t("notifications.title")}</span>
            {unread.length > 0 && (
              <button type="button" className="notif-mark-read" onClick={markAllRead}>
                <CheckCheck size={13} /> {t("notifications.markAllRead")}
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="notif-empty">{t("notifications.empty")}</div>
          ) : (
            <ul className="notif-list">
              {notifications.map((n) => {
                const isUnread = !lastSeen || n.created_at > lastSeen;
                const statusText = t("notifications.statusTo", {
                  status: t(`complaint.status.${n.to_status}`, n.to_status)
                });
                return (
                  <li key={n.id} className={`notif-item ${isUnread ? "unread" : ""}`}>
                    <div className="notif-item-title">
                      #{n.complaint_id.slice(0, 8)} · {n.complaint_title}
                    </div>
                    <div className="notif-item-body">
                      {n.from_status !== n.to_status ? statusText : null}
                      {n.from_status !== n.to_status && n.note ? " — " : null}
                      {n.note}
                    </div>
                    <div className="notif-item-time">{timeAgo(n.created_at)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
