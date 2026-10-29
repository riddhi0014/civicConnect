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
    <div className="flex items-center bg-pin-pill p-1 rounded-lg border border-pin-border">
      <Globe size={13} className="text-pin-gray ml-1.5 mr-1" />
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => toggleLanguage("en")}
        className={"px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer font-bold " +
          (currentLang === "en"
            ? "bg-white text-pin-dark shadow-xs"
            : "text-pin-gray hover:text-pin-dark")}
      >
        EN
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={() => toggleLanguage("hi")}
        className={"px-2.5 py-1 rounded-md text-xs transition-all cursor-pointer font-bold " +
          (currentLang === "hi"
            ? "bg-white text-pin-dark shadow-xs"
            : "text-pin-gray hover:text-pin-dark")}
      >
        हिंदी
      </motion.button>
    </div>
  );
}
