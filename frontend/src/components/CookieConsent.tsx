"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "maazan_cookies_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Show banner only if user hasn't consented yet
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) {
      // Small delay for nicer UX (don't flash immediately)
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="הסכמה לעוגיות"
      className={`fixed bottom-0 left-0 right-0 z-[55] transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <div className="mx-auto max-w-4xl px-4 pb-4">
        <div className="rounded-2xl bg-white shadow-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center gap-4">
            {/* Icon + text */}
            <div className="flex items-start gap-3 flex-1">
              <div
                className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
                style={{ background: "linear-gradient(135deg, #d4a853 0%, #c49b48 100%)" }}
              >
                <span className="text-lg">🍪</span>
              </div>
              <div>
                <p className="text-sm text-slate-700 leading-relaxed">
                  אנחנו משתמשים ב<strong>עוגיות (Cookies)</strong> כדי לשפר את חוויית השימוש שלך, לנתח תנועה באתר ולהתאים תוכן. באפשרותך לבחור האם לאשר או לסרב.
                </p>
                {showDetails && (
                  <div className="mt-3 p-4 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-2 page-enter">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">✓</span>
                      <div>
                        <strong>עוגיות הכרחיות</strong> — נדרשות לפעולה תקינה של האתר, כולל התחברות וניהול הפגישה. תמיד פעילות.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">?</span>
                      <div>
                        <strong>עוגיות אנליטיקה</strong> — מסייעות לנו להבין כיצד משתמשים באתר ולשפר את השירות.
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 rounded-md bg-slate-200 text-slate-500 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">?</span>
                      <div>
                        <strong>עוגיות העדפות</strong> — שומרות על הגדרות נגישות, שפה ותצוגה מותאמת אישית.
                      </div>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => setShowDetails((p) => !p)}
                  className="mt-1.5 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
                >
                  {showDetails ? "הסתר פרטים" : "קרא עוד ←"}
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2.5 flex-shrink-0 w-full md:w-auto">
              <button
                onClick={accept}
                className="btn-primary flex-1 md:flex-none text-center"
              >
                אישור
              </button>
              <button
                onClick={decline}
                className="flex-1 md:flex-none rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors text-center"
              >
                סירוב
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
