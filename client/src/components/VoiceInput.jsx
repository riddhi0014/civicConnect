import React, { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { useTranslation } from "react-i18next";

const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

/**
 * Speech-to-text button using the browser Web Speech API.
 * Speaks in Hindi (hi-IN) or Indian English (en-IN) depending on the selected language,
 * and appends each finished phrase via onTranscript(text).
 */
export default function VoiceInput({ onTranscript }) {
  const { t, i18n } = useTranslation();
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState("");
  const recognitionRef = useRef(null);

  const isHindi = i18n.language?.startsWith("hi");
  const langLabel = isHindi ? "हिन्दी" : "English";

  useEffect(() => {
    return () => recognitionRef.current?.abort();
  }, []);

  const start = () => {
    setError("");
    const recognition = new SpeechRecognition();
    recognition.lang = isHindi ? "hi-IN" : "en-IN";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          onTranscript(result[0].transcript.trim());
        } else {
          pending += result[0].transcript;
        }
      }
      setInterim(pending);
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted" || event.error === "no-speech") return;
      setError(event.error === "not-allowed" ? t("voice.denied") : t("voice.error"));
    };
    recognition.onend = () => {
      setListening(false);
      setInterim("");
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const stop = () => recognitionRef.current?.stop();

  if (!SpeechRecognition) {
    return (
      <span className="voice-hint" title={t("voice.unsupported")}>
        <Mic size={12} /> {t("voice.unsupported")}
      </span>
    );
  }

  return (
    <div className="voice-input">
      <button
        type="button"
        onClick={listening ? stop : start}
        className={`voice-btn ${listening ? "listening" : ""}`}
        aria-pressed={listening}
      >
        {listening ? <Square size={12} /> : <Mic size={13} />}
        {listening ? t("voice.stop") : t("voice.start")}
      </button>
      {listening && (
        <span className="voice-hint">
          <span className="voice-dot" />
          {interim || t("voice.listening", { lang: langLabel })}
        </span>
      )}
      {error && <span className="voice-hint voice-error">{error}</span>}
    </div>
  );
}
