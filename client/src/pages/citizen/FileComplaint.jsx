import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiRequest } from "../../services/api";
import PhotoUpload from "../../components/PhotoUpload";
import {
  MapPin,
  Compass,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Loader2,
  FileCheck
} from "lucide-react";
import { motion } from "framer-motion";
import CategoryIcon from "../../components/CategoryIcon";

export default function FileComplaint({ onSuccess }) {
  const { profile } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [ward, setWard] = useState(profile?.ward || "Ward 1");
  const [photoUrl, setPhotoUrl] = useState("");

  const [liveDuplicates, setLiveDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  const [detectingGps, setDetectingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await apiRequest("/complaints/categories");
        setCategories(data.categories || []);
        if (data.categories?.length > 0) {
          setSelectedCategoryId(data.categories[0].id);
        }
      } catch (err) {
        console.error("Error loading categories:", err);
        setError("Failed to load municipal grievance categories.");
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const subcategories = selectedCategory?.subcategories || [];

  useEffect(() => {
    if (subcategories.length > 0) {
      setSubcategoryId(subcategories[0].id);
    } else {
      setSubcategoryId("");
    }
  }, [selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategoryId || !ward) return;

    let isMounted = true;
    async function checkDuplicates() {
      try {
        setCheckingDuplicates(true);
        const data = await apiRequest(
          "/complaints/check-duplicate?category_id=" + selectedCategoryId + "&ward=" + encodeURIComponent(ward)
        );
        if (isMounted) {
          setLiveDuplicates(data.duplicates || []);
        }
      } catch (err) {
        console.error("Duplicate check error:", err);
      } finally {
        if (isMounted) setCheckingDuplicates(false);
      }
    }

    const timer = setTimeout(() => {
      checkDuplicates();
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [selectedCategoryId, ward]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        setLat(latitude);
        setLng(longitude);
        if (!locationText) {
          setLocationText("GPS Pin: " + latitude.toFixed(5) + ", " + longitude.toFixed(5));
        }
        setDetectingGps(false);
      },
      (err) => {
        console.error("GPS error:", err);
        setDetectingGps(false);
        alert("Could not retrieve GPS coordinates. Please enter your address or landmark manually.");
      },
      { timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!selectedCategoryId) {
      setError("Please select a complaint category.");
      return;
    }
    if (!title.trim() || !description.trim() || !locationText.trim()) {
      setError("Please fill in the title, description, and location.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await apiRequest("/complaints", {
        method: "POST",
        body: JSON.stringify({
          category_id: selectedCategoryId,
          subcategory_id: subcategoryId || null,
          title,
          description,
          location_text: locationText,
          lat,
          lng,
          ward,
          photo_url: photoUrl
        })
      });

      setSuccessResult(response);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to submit complaint. Please check your network.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingCategories) {
    return (
      <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-light)" }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--blue-primary)", margin: "0 auto 12px auto" }} />
        <p style={{ fontSize: "0.875rem" }}>Loading municipal categories and departments...</p>
      </div>
    );
  }

  if (successResult) {
    const hasDuplicates = successResult.potential_duplicates?.length > 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="card"
        style={{ maxWidth: "36rem", margin: "0 auto", textAlign: "center", padding: "2rem" }}
      >
        <div style={{ width: "3.5rem", height: "3.5rem", borderRadius: "var(--radius-full)", backgroundColor: "var(--color-success-bg)", color: "var(--color-success)", display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: "1rem" }}>
          <FileCheck size={28} />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--text-dark)", marginBottom: "0.5rem" }}>
          Grievance Logged Successfully
        </h2>
        <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.25rem" }}>
          Your ticket <b>#{successResult.complaint.id.slice(0, 8)}</b> is recorded with status <b>Submitted</b>.
        </p>

        {hasDuplicates ? (
          <div className="alert alert-warning" style={{ display: "block", textAlign: "left", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
              <ShieldAlert size={15} /> Duplicate Check Notice (7-day window)
            </div>
            <p style={{ marginBottom: "8px" }}>
              There is already <b>{successResult.potential_duplicates.length} open grievance(s)</b> in <b>{ward}</b> under <b>{selectedCategory?.name}</b>:
            </p>
            <ul style={{ paddingLeft: "1.25rem" }}>
              {successResult.potential_duplicates.map((dup) => (
                <li key={dup.id}>
                  <b>#{dup.id.slice(0, 8)}</b>: "{dup.title}" — Status: <i>{dup.status}</i>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="alert alert-success" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "1.5rem" }}>
            <CheckCircle2 size={15} /> Duplicate check: No identical grievances detected in this ward.
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onSuccess && onSuccess(successResult.complaint)}
          className="btn btn-pin-red"
        >
          Proceed to My Complaints
          <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Step 1: Category Picker */}
      <div className="card">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--pin-dark)", marginBottom: "4px" }}>
          1. Select Grievance Category
        </h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          Pick the municipal category best matching your issue
        </p>

        <div className="file-category-grid">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`file-category-btn ${isSelected ? "selected" : ""}`}
              >
                <div
                  style={{
                    width: "2.75rem",
                    height: "2.75rem",
                    borderRadius: "var(--radius-md)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: isSelected ? "var(--blue-primary)" : "var(--blue-light)",
                    color: isSelected ? "#ffffff" : "var(--blue-primary)"
                  }}
                >
                  <CategoryIcon name={cat.name} icon={cat.icon} size={22} />
                </div>
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: isSelected ? 800 : 700,
                    color: isSelected ? "var(--blue-primary)" : "var(--text-dark)"
                  }}
                >
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Grievance Form */}
      <div className="card">
        <h2 style={{ fontSize: "1.25rem", fontWeight: 900, color: "var(--pin-dark)", marginBottom: "4px" }}>
          2. Describe the Problem
        </h2>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "1.25rem" }}>
          Selected Category: <b style={{ color: "var(--pin-dark)" }}>{selectedCategory?.name}</b>
        </p>

        {error && (
          <div className="alert alert-danger">
            <AlertCircle size={15} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {subcategories.length > 0 && (
            <div className="form-group">
              <label className="form-label" htmlFor="subcategory">
                Specific Sub-type
              </label>
              <select
                id="subcategory"
                className="form-select"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
              >
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="title">
              Title / Summary
            </label>
            <input
              id="title"
              type="text"
              className="form-input"
              required
              placeholder="e.g. Deep pothole causing accidents near Market Gate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">
              Detailed Description
            </label>
            <textarea
              id="description"
              className="form-textarea"
              required
              placeholder="Provide exact details (duration of issue, safety risks, landmark references)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <label className="form-label" htmlFor="locationText" style={{ margin: 0 }}>
                  Location / Landmark
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingGps}
                  style={{ background: "none", border: "none", color: "var(--pin-red)", fontSize: "0.75rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px", cursor: "pointer" }}
                >
                  <Compass size={13} />
                  {detectingGps ? "Locating..." : "Use My GPS"}
                </button>
              </div>
              <input
                id="locationText"
                type="text"
                className="form-input"
                required
                placeholder="e.g. Main Road, opposite Green Park Gate 2"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
              {lat && lng && (
                <div style={{ fontSize: "11px", color: "var(--color-success-text)", marginTop: "4px", fontWeight: 600 }}>
                  ✓ GPS Tagged: {lat.toFixed(5)}, {lng.toFixed(5)}
                </div>
              )}
            </div>

            <div>
              <label className="form-label" htmlFor="ward">
                Ward
              </label>
              <select
                id="ward"
                className="form-select"
                value={ward}
                onChange={(e) => setWard(e.target.value)}
              >
                {Array.from({ length: 20 }, (_, i) => "Ward " + (i + 1)).map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
          </div>

          <PhotoUpload
            onPhotoUploaded={(url) => setPhotoUrl(url)}
            label="Upload Proof Photo (Optional, recommended for faster dispatch)"
          />

          {/* Duplicate Alert Notice */}
          <div className={`alert ${liveDuplicates.length > 0 ? "alert-warning" : "alert-success"}`} style={{ display: "block" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700 }}>
                {liveDuplicates.length > 0 ? (
                  <>
                    <ShieldAlert size={15} />
                    <span>Potential Duplicate Alert ({liveDuplicates.length} open issue in {ward})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>Duplicate Check: No similar open complaints in {ward}</span>
                  </>
                )}
              </div>
              {checkingDuplicates && (
                <span style={{ fontSize: "11px", color: "var(--text-light)" }}>Checking...</span>
              )}
            </div>

            {liveDuplicates.length > 0 && (
              <div style={{ marginTop: "8px", fontSize: "11px" }}>
                <p>The municipal board already has open complaints recorded under <b>{selectedCategory?.name}</b> in <b>{ward}</b>:</p>
                <div style={{ backgroundColor: "rgba(255, 255, 255, 0.8)", padding: "8px", borderRadius: "6px", marginTop: "4px" }}>
                  {liveDuplicates.map((dup) => (
                    <div key={dup.id} style={{ display: "flex", justifyContent: "space-between", margin: "2px 0" }}>
                      <span>• <b>#{dup.id.slice(0, 8)}</b>: "{dup.title}"</span>
                      <span style={{ fontWeight: 600, textTransform: "capitalize" }}>({dup.status})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", marginTop: "1rem" }}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting Grievance...
              </>
            ) : (
              <>
                Submit Complaint
                <ArrowRight size={15} />
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
