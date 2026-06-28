"use client";

import { useState, useEffect, useCallback } from "react";

interface A11ySettings {
  fontSize: number;       // 0 = normal, 1 = large, 2 = x-large
  highContrast: boolean;
  grayscale: boolean;
  highlightLinks: boolean;
  readableFont: boolean;
  reducedMotion: boolean;
}

const DEFAULT: A11ySettings = {
  fontSize: 0,
  highContrast: false,
  grayscale: false,
  highlightLinks: false,
  readableFont: false,
  reducedMotion: false,
};

const STORAGE_KEY = "maazan_a11y";

export default function AccessibilityMenu() {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<A11ySettings>(DEFAULT);

  // Load persisted settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<A11ySettings>;
        setSettings({ ...DEFAULT, ...parsed });
      }
    } catch {
      // ignore
    }
  }, []);

  // Apply settings to <html>
  useEffect(() => {
    const html = document.documentElement;

    // Font size
    const sizes = ["100%", "115%", "130%"];
    html.style.fontSize = sizes[settings.fontSize] || "100%";

    // High contrast
    html.classList.toggle("a11y-high-contrast", settings.highContrast);

    // Grayscale
    html.classList.toggle("a11y-grayscale", settings.grayscale);

    // Highlight links
    html.classList.toggle("a11y-highlight-links", settings.highlightLinks);

    // Readable font
    html.classList.toggle("a11y-readable-font", settings.readableFont);

    // Reduced motion
    html.classList.toggle("a11y-reduced-motion", settings.reducedMotion);

    // Persist
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const update = useCallback(
    (patch: Partial<A11ySettings>) =>
      setSettings((prev) => ({ ...prev, ...patch })),
    []
  );

  const reset = useCallback(() => setSettings(DEFAULT), []);

  const fontLabel = ["רגיל", "גדול", "גדול מאוד"][settings.fontSize];

  const isModified = JSON.stringify(settings) !== JSON.stringify(DEFAULT);

  return (
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen((p) => !p)}
        aria-label="תפריט נגישות"
        aria-expanded={open}
        className="fixed left-4 bottom-4 z-[60] w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="4.5" r="2.5" />
          <path d="M12 7v5" />
          <path d="m8 21 4-9 4 9" />
          <path d="M6 12h12" />
        </svg>
        {isModified && (
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-amber-400 rounded-full border-2 border-white" />
        )}
      </button>

      {/* Panel overlay */}
      {open && (
        <div
          className="fixed inset-0 z-[59] bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      <div
        role="dialog"
        aria-label="הגדרות נגישות"
        aria-modal={open}
        className={`fixed left-4 bottom-20 z-[60] w-80 rounded-2xl bg-white shadow-2xl transition-all duration-300 origin-bottom-left ${
          open
            ? "opacity-100 scale-100 translate-y-0"
            : "opacity-0 scale-95 translate-y-4 pointer-events-none"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="4.5" r="2.5" />
                <path d="M12 7v5" />
                <path d="m8 21 4-9 4 9" />
                <path d="M6 12h12" />
              </svg>
            </div>
            <h2 className="font-bold text-slate-900">נגישות</h2>
          </div>
          <button
            onClick={() => setOpen(false)}
            aria-label="סגור תפריט נגישות"
            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2.5">
          {/* Font size */}
          <button
            onClick={() => update({ fontSize: ((settings.fontSize + 1) % 3) as 0 | 1 | 2 })}
            className={`a11y-option ${settings.fontSize > 0 ? "a11y-option-active" : ""}`}
          >
            <span className="a11y-option-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 7V4h16v3" />
                <path d="M9 20h6" />
                <path d="M12 4v16" />
              </svg>
            </span>
            <span className="flex-1 text-right">
              <span className="block text-sm font-medium">גודל טקסט</span>
              <span className="block text-xs text-slate-400">{fontLabel}</span>
            </span>
          </button>

          {/* High contrast */}
          <ToggleOption
            active={settings.highContrast}
            onToggle={() => update({ highContrast: !settings.highContrast })}
            label="ניגודיות גבוהה"
            description="הגברת ניגודיות הצבעים"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20z" fill="currentColor" />
              </svg>
            }
          />

          {/* Grayscale */}
          <ToggleOption
            active={settings.grayscale}
            onToggle={() => update({ grayscale: !settings.grayscale })}
            label="גווני אפור"
            description="הצגה בשחור-לבן"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 3v18" />
                <path d="M3 12h9" fill="currentColor" opacity="0.3" />
              </svg>
            }
          />

          {/* Highlight links */}
          <ToggleOption
            active={settings.highlightLinks}
            onToggle={() => update({ highlightLinks: !settings.highlightLinks })}
            label="הדגשת קישורים"
            description="סימון קישורים בקו תחתון"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            }
          />

          {/* Readable font */}
          <ToggleOption
            active={settings.readableFont}
            onToggle={() => update({ readableFont: !settings.readableFont })}
            label="גופן קריא"
            description="גופן ברור יותר לקריאה"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
              </svg>
            }
          />

          {/* Reduced motion */}
          <ToggleOption
            active={settings.reducedMotion}
            onToggle={() => update({ reducedMotion: !settings.reducedMotion })}
            label="הפחתת אנימציות"
            description="ביטול תנועה ואנימציה"
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M12 12h.01" />
              </svg>
            }
          />
        </div>

        {/* Reset */}
        {isModified && (
          <div className="px-4 pb-4">
            <button
              onClick={reset}
              className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
            >
              איפוס הגדרות
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function ToggleOption({
  active,
  onToggle,
  label,
  description,
  icon,
}: {
  active: boolean;
  onToggle: () => void;
  label: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={active}
      className={`a11y-option ${active ? "a11y-option-active" : ""}`}
    >
      <span className="a11y-option-icon">{icon}</span>
      <span className="flex-1 text-right">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-slate-400">{description}</span>
      </span>
      {/* Toggle indicator */}
      <span
        className={`w-9 h-5 rounded-full flex items-center transition-colors duration-200 ${
          active ? "bg-amber-400 justify-end" : "bg-slate-200 justify-start"
        }`}
      >
        <span className="w-4 h-4 mx-0.5 rounded-full bg-white shadow-sm transition-transform" />
      </span>
    </button>
  );
}
