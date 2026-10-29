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
      <div className="text-center py-12 text-slate-400">
        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-sm">Loading municipal categories and departments...</p>
      </div>
    );
  }

  if (successResult) {
    const hasDuplicates = successResult.potential_duplicates?.length > 0;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white border border-emerald-200 rounded-2xl p-8 text-center shadow-sm max-w-xl mx-auto"
      >
        <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 inline-flex items-center justify-center mb-4">
          <FileCheck size={28} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Grievance Logged Successfully
        </h2>
        <p className="text-sm text-slate-600 mb-5">
          Your ticket <b>#{successResult.complaint.id.slice(0, 8)}</b> is recorded with status <b>Submitted</b>.
        </p>

        {hasDuplicates ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left text-xs text-amber-900 mb-6">
            <div className="font-bold flex items-center gap-1.5 mb-1.5 text-amber-800">
              <ShieldAlert size={15} className="text-amber-600" /> Duplicate Check Notice (7-day window)
            </div>
            <p className="mb-2 leading-relaxed">
              There is already <b>{successResult.potential_duplicates.length} open grievance(s)</b> in <b>{ward}</b> under <b>{selectedCategory?.name}</b>:
            </p>
            <ul className="pl-4 list-disc space-y-1 text-amber-800">
              {successResult.potential_duplicates.map((dup) => (
                <li key={dup.id}>
                  <b>#{dup.id.slice(0, 8)}</b>: "{dup.title}" — Status: <i>{dup.status}</i>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-center gap-2 mb-6">
            <CheckCircle2 size={15} /> Duplicate check: No identical grievances detected in this ward.
          </div>
        )}

        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={() => onSuccess && onSuccess(successResult.complaint)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold bg-pin-red hover:bg-pin-redHover text-white shadow-xs cursor-pointer transition-colors"
        >
          Proceed to My Complaints
          <ArrowRight size={15} />
        </motion.button>
      </motion.div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Step 1: Category Picker */}
      <div className="bg-white border border-pin-border rounded-2xl p-6 sm:p-7 shadow-xs">
        <h2 className="text-xl font-black text-pin-dark mb-1">
          1. Select Grievance Category
        </h2>
        <p className="text-xs text-pin-gray mb-5">
          Pick the municipal category best matching your issue
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {categories.map((cat) => {
            const isSelected = cat.id === selectedCategoryId;
            return (
              <motion.button
                key={cat.id}
                type="button"
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={"p-4 sm:p-5 rounded-2xl border flex flex-col items-center text-center justify-between gap-3 transition-all cursor-pointer group shadow-sm hover:shadow-md " +
                  (isSelected
                    ? "bg-white border-blue-600 ring-2 ring-blue-500/20 text-slate-900 shadow-md"
                    : "bg-white border-slate-200 hover:border-blue-400 text-slate-800")}
              >
                <div
                  className={"w-11 h-11 rounded-xl flex items-center justify-center transition-all group-hover:scale-110 " +
                    (isSelected
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-blue-50 text-blue-700")}
                >
                  <CategoryIcon name={cat.name} icon={cat.icon} size={22} />
                </div>
                <span
                  className={"text-xs font-bold transition-colors " +
                    (isSelected ? "text-blue-700 font-extrabold" : "text-slate-800 group-hover:text-blue-600")}
                >
                  {cat.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Grievance Form */}
      <div className="bg-white border border-pin-border rounded-2xl p-6 sm:p-7 shadow-xs">
        <h2 className="text-xl font-black text-pin-dark mb-1">
          2. Describe the Problem
        </h2>
        <p className="text-xs text-pin-gray mb-5">
          Selected Category: <b className="text-pin-dark">{selectedCategory?.name}</b>
        </p>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex gap-2 items-center mb-5">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {subcategories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-pin-dark mb-1.5" htmlFor="subcategory">
                Specific Sub-type
              </label>
              <select
                id="subcategory"
                className="w-full px-3.5 py-2.5 text-xs text-pin-dark bg-white border border-pin-border rounded-lg outline-none focus:border-pin-red"
                value={subcategoryId}
                onChange={(e) => setSubcategoryId(e.target.value)}
              >
                {subcategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-pin-dark mb-1.5" htmlFor="title">
              Title / Summary
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-3.5 py-2.5 text-xs text-pin-dark bg-white border border-pin-border rounded-lg outline-none focus:border-pin-red"
              required
              placeholder="e.g. Deep pothole causing accidents near Market Gate"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-pin-dark mb-1.5" htmlFor="description">
              Detailed Description
            </label>
            <textarea
              id="description"
              className="w-full px-3.5 py-2.5 text-xs text-pin-dark bg-white border border-pin-border rounded-lg outline-none focus:border-pin-red min-h-[90px]"
              required
              placeholder="Provide exact details (duration of issue, safety risks, landmark references)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-pin-dark" htmlFor="locationText">
                  Location / Landmark
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detectingGps}
                  className="text-xs font-semibold text-pin-red hover:text-pin-redHover inline-flex items-center gap-1 cursor-pointer"
                >
                  <Compass size={13} />
                  {detectingGps ? "Locating..." : "Use My GPS"}
                </button>
              </div>
              <input
                id="locationText"
                type="text"
                className="w-full px-3.5 py-2.5 text-xs text-pin-dark bg-white border border-pin-border rounded-lg outline-none focus:border-pin-red"
                required
                placeholder="e.g. Main Road, opposite Green Park Gate 2"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
              {lat && lng && (
                <div className="text-[11px] text-emerald-600 mt-1 font-medium">
                  ✓ GPS Tagged: {lat.toFixed(5)}, {lng.toFixed(5)}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-pin-dark mb-1.5" htmlFor="ward">
                Ward
              </label>
              <select
                id="ward"
                className="w-full px-3.5 py-2.5 text-xs text-pin-dark bg-white border border-pin-border rounded-lg outline-none focus:border-pin-red"
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
          <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50 text-xs text-amber-900 mt-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-bold">
                {liveDuplicates.length > 0 ? (
                  <>
                    <ShieldAlert size={15} className="text-amber-600" />
                    <span>Potential Duplicate Alert ({liveDuplicates.length} open issue in {ward})</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-600" />
                    <span className="text-emerald-800">Duplicate Check: No similar open complaints in {ward}</span>
                  </>
                )}
              </div>
              {checkingDuplicates && (
                <span className="text-[11px] text-slate-400">Checking...</span>
              )}
            </div>

            {liveDuplicates.length > 0 && (
              <div className="mt-2 text-[11px] text-amber-800 space-y-1">
                <p>The municipal board already has open complaints recorded under <b>{selectedCategory?.name}</b> in <b>{ward}</b>:</p>
                <div className="bg-white/80 p-2 rounded-lg border border-amber-200 space-y-0.5">
                  {liveDuplicates.map((dup) => (
                    <div key={dup.id} className="flex justify-between">
                      <span>• <b>#{dup.id.slice(0, 8)}</b>: "{dup.title}"</span>
                      <span className="font-semibold text-amber-700 capitalize">({dup.status})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            type="submit"
            className="w-full mt-4 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-400 text-white shadow-xs cursor-pointer disabled:opacity-60 transition-colors"
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
