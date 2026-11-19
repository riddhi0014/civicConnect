import React, { useState } from "react";
import { supabase } from "../services/supabase";
import { UploadCloud, X, Loader2 } from "lucide-react";

export default function PhotoUpload({ onPhotoUploaded, label = "Attach Photo (Optional)" }) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (PNG, JPG, WebP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size exceeds 5MB limit.");
      return;
    }

    setError("");
    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `grievances/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("complaint-photos")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("complaint-photos")
        .getPublicUrl(filePath);

      setPreviewUrl(publicUrl);
      onPhotoUploaded(publicUrl);
    } catch (err) {
      console.error("Photo upload error:", err);
      setError(
        err.message === "Failed to fetch"
          ? "Cannot reach Supabase Storage from this browser. Check your internet connection."
          : err.message || "Failed to upload photo."
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreviewUrl("");
    setError("");
    onPhotoUploaded("");
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <label className="form-label">{label}</label>

      {error && (
        <div className="alert alert-danger" style={{ padding: "0.5rem 0.75rem", fontSize: "0.75rem" }}>
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="photo-preview-wrap">
          <img
            src={previewUrl}
            alt="Upload Preview"
            className="photo-preview-img"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="photo-remove-btn"
            title="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="photo-upload-drop">
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            disabled={uploading}
            onChange={handleFileChange}
          />
          {uploading ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
              <Loader2 size={18} className="animate-spin" style={{ color: "var(--blue-primary)" }} />
              <span>Uploading to municipal storage...</span>
            </div>
          ) : (
            <>
              <UploadCloud size={24} style={{ color: "var(--text-light)" }} />
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dark)" }}>
                Click to attach site photo
              </span>
              <span style={{ fontSize: "0.6875rem", color: "var(--text-light)" }}>
                Supports JPG, PNG up to 5MB (speeds up officer triage)
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
