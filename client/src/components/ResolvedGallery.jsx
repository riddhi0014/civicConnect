import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, MapPin, ArrowRight, ImageOff } from "lucide-react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { apiRequest } from "../services/api";
import CategoryIcon from "./CategoryIcon";

/**
 * "Recently fixed" before/after gallery of resolved complaints (public).
 */
export default function ResolvedGallery({ limit = 6, showMapLink = true }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest("/public/gallery")
      .then((data) => setItems((data.items || []).slice(0, limit)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [limit]);

  return (
    <section className="gallery-section">
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
        <div className="section-intro">
          <span className="section-pill-tag" style={{ background: "var(--color-success-bg)", color: "var(--color-success-text)", border: "1px solid var(--color-success-border)" }}>
            {t("gallery.tag")}
          </span>
          <h2 className="section-heading">{t("gallery.title")}</h2>
          <p className="section-subtext">{t("gallery.subtitle")}</p>
        </div>

        {!loading && items.length === 0 && (
          <div className="gallery-empty">{t("gallery.empty")}</div>
        )}

        <div className="gallery-grid">
          {items.map((item) => (
            <motion.article
              key={item.id}
              className="gallery-card"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
            >
              <div className="gallery-photos">
                <figure className="gallery-photo">
                  {item.before_photo_url ? (
                    <img src={item.before_photo_url} alt={`${t("gallery.before")}: ${item.title}`} loading="lazy" />
                  ) : (
                    <div className="gallery-photo-placeholder">
                      <CategoryIcon name={item.category?.name} icon={item.category?.icon} size={28} />
                      <span><ImageOff size={11} /> {t("gallery.noBefore")}</span>
                    </div>
                  )}
                  <figcaption className="gallery-label before">{t("gallery.before")}</figcaption>
                </figure>
                <figure className="gallery-photo">
                  <img src={item.after_photo_url} alt={`${t("gallery.after")}: ${item.title}`} loading="lazy" />
                  <figcaption className="gallery-label after">{t("gallery.after")}</figcaption>
                </figure>
              </div>

              <div className="gallery-body">
                <div className="gallery-meta">
                  <CategoryIcon name={item.category?.name} icon={item.category?.icon} size={13} />
                  <span>{item.category?.name}</span>
                  {item.ward && (
                    <>
                      <span>·</span>
                      <MapPin size={11} />
                      <span>{item.ward}</span>
                    </>
                  )}
                </div>
                <h3 className="gallery-title">{item.title}</h3>
                {item.resolution_note && (
                  <p className="gallery-note">&ldquo;{item.resolution_note}&rdquo;</p>
                )}
                {item.days_to_fix !== null && (
                  <span className="gallery-fixed-badge">
                    <CheckCircle2 size={12} />
                    {item.days_to_fix === 0 ? t("gallery.fixedSameDay") : t("gallery.fixedIn", { count: item.days_to_fix })}
                  </span>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        {showMapLink && (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <Link to="/map" className="btn btn-secondary">
              {t("gallery.viewMap")} <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
