import React, { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPinned, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../services/api";
import ResolvedGallery from "../components/ResolvedGallery";

const STATUS_GROUPS = {
  open: { statuses: ["submitted", "assigned", "reopened"], color: "#dc2626" },
  inProgress: { statuses: ["in_progress"], color: "#d97706" },
  resolved: { statuses: ["resolved", "closed"], color: "#16a34a" }
};

const INDIA_CENTER = [22.5, 79];

function groupOf(status) {
  return Object.keys(STATUS_GROUPS).find((g) => STATUS_GROUPS[g].statuses.includes(status)) || "open";
}

// Zooms the map to fit whatever pins are currently shown
function FitToPins({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 1) {
      map.setView(points[0], 15);
    } else if (points.length > 1) {
      map.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
    }
  }, [map, points]);
  return null;
}

export default function PublicMap() {
  const { t, i18n } = useTranslation();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiRequest("/public/map")
      .then((data) => {
        setComplaints(data.complaints || []);
        setStats(data.stats || null);
      })
      .catch(() => setError(t("map.error")))
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(
    () => complaints.filter((c) => filter === "all" || groupOf(c.status) === filter),
    [complaints, filter]
  );
  const points = useMemo(() => visible.map((c) => [c.lat, c.lng]), [visible]);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(i18n.language?.startsWith("hi") ? "hi-IN" : "en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });

  const statCards = [
    { key: "all", label: t("map.total"), value: stats?.total, color: "var(--blue-primary)" },
    { key: "open", label: t("map.open"), value: stats?.open, color: STATUS_GROUPS.open.color },
    { key: "inProgress", label: t("map.inProgress"), value: stats?.inProgress, color: STATUS_GROUPS.inProgress.color },
    { key: "resolved", label: t("map.resolved"), value: stats?.resolved, color: STATUS_GROUPS.resolved.color }
  ];

  return (
    <div style={{ width: "100%" }}>
      <section className="map-page">
        <div className="map-page-header">
          <div>
            <h1 className="map-page-title">
              <MapPinned size={26} style={{ color: "var(--pin-red)" }} />
              {t("map.title")}
            </h1>
            <p className="map-page-subtitle">{t("map.subtitle")}</p>
          </div>
        </div>

        <div className="map-stats-grid">
          {statCards.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setFilter(s.key)}
              className={`map-stat-card ${filter === s.key ? "active" : ""}`}
              style={{ "--stat-color": s.color }}
            >
              <span className="map-stat-value">{s.value ?? "–"}</span>
              <span className="map-stat-label">
                {s.key !== "all" && <span className="map-legend-dot" />}
                {s.label}
              </span>
            </button>
          ))}
        </div>

        <div className="map-frame">
          {loading && (
            <div className="map-overlay">
              <Loader2 size={22} className="animate-spin" /> {t("map.loading")}
            </div>
          )}
          {error && <div className="map-overlay">{error}</div>}
          {!loading && !error && visible.length === 0 && (
            <div className="map-overlay map-overlay-soft">{t("map.noPins")}</div>
          )}

          <MapContainer center={INDIA_CENTER} zoom={5} scrollWheelZoom={false} className="map-canvas">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitToPins points={points} />
            {visible.map((c) => {
              const color = STATUS_GROUPS[groupOf(c.status)].color;
              const affected = (c.supporter_count || 0) + 1;
              return (
                <CircleMarker
                  key={c.id}
                  center={[c.lat, c.lng]}
                  radius={Math.min(8 + c.supporter_count * 2, 18)}
                  pathOptions={{ color: "#ffffff", weight: 2, fillColor: color, fillOpacity: 0.9 }}
                >
                  <Popup>
                    <div className="map-popup">
                      <div className="map-popup-cat">
                        {c.category?.icon} {c.category?.name} · {c.ward}
                      </div>
                      <div className="map-popup-title">{c.title}</div>
                      <div className="map-popup-row">
                        <span className="map-popup-status" style={{ background: color }}>
                          {t(`complaint.status.${c.status}`, c.status)}
                        </span>
                        {affected > 1 && (
                          <span className="map-popup-affected">
                            <Users size={11} /> {t("map.affected", { count: affected })}
                          </span>
                        )}
                      </div>
                      <div className="map-popup-date">{t("map.reported", { date: formatDate(c.created_at) })}</div>
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>
      </section>

      <ResolvedGallery limit={6} showMapLink={false} />
    </div>
  );
}
