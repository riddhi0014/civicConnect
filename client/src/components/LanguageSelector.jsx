import React from "react";
import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";
import { motion } from "framer-motion";

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language ? i18n.language.slice(0, 2) : "en";

  const toggleLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="lang-selector-box">
      <Globe size={13} style={{ color: "var(--pin-gray)", marginLeft: "6px", marginRight: "4px" }} />
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => toggleLanguage("en")}
        className={`lang-btn ${currentLang === "en" ? "active" : ""}`}
      >
        EN
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => toggleLanguage("hi")}
        className={`lang-btn ${currentLang === "hi" ? "active" : ""}`}
      >
        हिंदी
      </motion.button>
    </div>
  );
}
