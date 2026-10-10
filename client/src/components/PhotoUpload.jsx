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
      setError(err.message || "Failed to upload photo.");
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
    <div>
      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{label}</label>

      {error && (
        <div className="text-xs text-rose-600 mb-2 font-medium">
          {error}
        </div>
      )}

      {previewUrl ? (
        <div className="relative inline-block rounded-xl overflow-hidden border border-slate-200">
          <img
            src={previewUrl}
            alt="Upload Preview"
            className="w-40 h-28 object-cover block"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-900/80 text-white flex items-center justify-center cursor-pointer hover:bg-slate-900 transition-colors"
            title="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl bg-slate-50 hover:bg-slate-100/50 cursor-pointer transition-colors text-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={handleFileChange}
          />
          {uploading ? (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              <span>Uploading to municipal storage...</span>
            </div>
          ) : (
            <>
              <UploadCloud size={24} className="text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">
                Click to attach site photo
              </span>
              <span className="text-[11px] text-slate-400">
                Supports JPG, PNG up to 5MB (speeds up officer triage)
              </span>
            </>
          )}
        </label>
      )}
    </div>
  );
}
