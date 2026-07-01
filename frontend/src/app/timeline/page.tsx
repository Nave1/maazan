"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface Milestone {
  id: string;
  name: string;
  icon: string;
  targetDate: string;
  estimatedCost: number;
  priority: "high" | "medium" | "low";
  recurringCost: number;
  progress: number;
  monthlySavingsNeeded: number;
  feasible: boolean;
}

const MOCK_MILESTONES: Milestone[] = [
  { id: "1", name: "חתונה", icon: "💒", targetDate: "2026-09", estimatedCost: 120000, priority: "high", recurringCost: 0, progress: 45, monthlySavingsNeeded: 5500, feasible: true },
  { id: "2", name: "קרן חירום", icon: "🛡️", targetDate: "2027-03", estimatedCost: 30000, priority: "high", recurringCost: 0, progress: 60, monthlySavingsNeeded: 2000, feasible: true },
  { id: "3", name: "רכישת דירה", icon: "🏠", targetDate: "2029-01", estimatedCost: 400000, priority: "high", recurringCost: 4500, progress: 12, monthlySavingsNeeded: 8500, feasible: false },
  { id: "4", name: "ילד ראשון", icon: "👶", targetDate: "2031-06", estimatedCost: 50000, priority: "medium", recurringCost: 3500, progress: 0, monthlySavingsNeeded: 1200, feasible: true },
  { id: "5", name: "סיום משכנתא", icon: "🏦", targetDate: "2045-01", estimatedCost: 0, priority: "medium", recurringCost: 0, progress: 5, monthlySavingsNeeded: 0, feasible: true },
  { id: "6", name: "פרישה", icon: "🌴", targetDate: "2060-01", estimatedCost: 2500000, priority: "low", recurringCost: 0, progress: 3, monthlySavingsNeeded: 4200, feasible: true },
];

const EVENT_TYPES = [
  { value: "wedding", label: "חתונה", icon: "💒" },
  { value: "house", label: "רכישת דירה", icon: "🏠" },
  { value: "vehicle", label: "רכב חדש", icon: "🚗" },
  { value: "child", label: "ילד", icon: "👶" },
  { value: "retirement", label: "פרישה", icon: "🌴" },
  { value: "custom", label: "אירוע מותאם", icon: "⭐" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

export default function TimelinePage() {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(MOCK_MILESTONES);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: Math.ceil(40 / zoomLevel) }, (_, i) => currentYear + i * zoomLevel);

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar active="/timeline" />
      <main className="flex-1 mr-64">
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">📅 ציר זמן פיננסי</h1>
              <p className="text-slate-500">תכנן את העתיד הפיננסי שלך עם אבני דרך ותחזיות חכמות</p>
            </div>
            <button onClick={() => setShowAddEvent(true)} className="btn-primary flex items-center gap-2">
              <span>+</span> הוסף אירוע
            </button>
          </div>

          {/* SECTION 1 — Interactive Timeline */}
          <div className="card-subtle p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">ציר הזמן שלי</h2>
              <div className="flex items-center gap-2">
                <button onClick={() => setZoomLevel(Math.min(zoomLevel + 1, 5))} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors text-sm font-bold">−</button>
                <span className="text-xs text-slate-400 w-16 text-center">{zoomLevel === 1 ? "שנתי" : `כל ${zoomLevel} שנים`}</span>
                <button onClick={() => setZoomLevel(Math.max(zoomLevel - 1, 1))} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors text-sm font-bold">+</button>
              </div>
            </div>

            <div className="overflow-x-auto pb-4">
              <div className="relative min-w-[900px] h-32">
                {/* Timeline line */}
                <div className="absolute top-10 right-4 left-4 h-0.5 bg-gradient-to-l from-amber-400 via-slate-200 to-slate-100" />
                
                {/* Year markers */}
                <div className="flex justify-between px-4 relative">
                  {years.slice(0, 12).map((year) => (
                    <div key={year} className="flex flex-col items-center">
                      <span className="text-[10px] text-slate-400 mb-2">{year}</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300 z-10" />
                    </div>
                  ))}
                </div>

                {/* Milestone markers */}
                {milestones.map((m) => {
                  const mYear = parseInt(m.targetDate.split("-")[0]);
                  const endYear = years[Math.min(11, years.length - 1)];
                  const position = Math.min(((mYear - currentYear) / (endYear - currentYear)) * 92 + 4, 96);
                  return (
                    <div
                      key={m.id}
                      className="absolute cursor-pointer group"
                      style={{ right: `${position}%`, top: "48px", transform: "translateX(50%)" }}
                      onClick={() => setSelectedMilestone(m)}
                    >
                      <div className={`flex flex-col items-center transition-transform group-hover:scale-110 ${selectedMilestone?.id === m.id ? "scale-110" : ""}`}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shadow-sm border-2 ${
                          m.priority === "high" ? "bg-amber-50 border-amber-300" :
                          m.priority === "medium" ? "bg-blue-50 border-blue-300" :
                          "bg-slate-50 border-slate-200"
                        } ${!m.feasible ? "ring-2 ring-red-200" : ""}`}>
                          {m.icon}
                        </div>
                        <span className="text-[9px] font-medium text-slate-600 mt-1 whitespace-nowrap">{m.name}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* SECTION 2 — Life Events list */}
            <div className="lg:col-span-1">
              <div className="card-subtle p-5">
                <h2 className="text-lg font-bold text-slate-900 mb-4">אבני דרך</h2>
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {milestones.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMilestone(m)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                        selectedMilestone?.id === m.id ? "border-amber-300 bg-amber-50/50" : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{m.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-slate-900">{m.name}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                              m.priority === "high" ? "bg-red-100 text-red-700" :
                              m.priority === "medium" ? "bg-amber-100 text-amber-700" :
                              "bg-slate-100 text-slate-600"
                            }`}>
                              {m.priority === "high" ? "גבוה" : m.priority === "medium" ? "בינוני" : "נמוך"}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(m.targetDate + "-01").toLocaleDateString("he-IL", { year: "numeric", month: "long" })}
                            {m.estimatedCost > 0 && ` · ${formatCurrency(m.estimatedCost)}`}
                          </p>
                          <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${m.progress}%`, background: m.progress >= 70 ? "#10b981" : m.progress >= 30 ? "#f59e0b" : "#ef4444" }} />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{m.progress}% הושלם</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 3 & 5 — AI Projection & Recommendations */}
            <div className="lg:col-span-2 space-y-6">
              {selectedMilestone ? (
                <div className="card-subtle p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-2xl">{selectedMilestone.icon}</span>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900">{selectedMilestone.name}</h2>
                      <p className="text-sm text-slate-500">ניתוח AI ותחזית</p>
                    </div>
                    <div className="mr-auto">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedMilestone.feasible ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {selectedMilestone.feasible ? "✓ ריאלי" : "⚠ דרוש שיפור"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 mb-1">עלות משוערת</p>
                      <p className="font-bold text-slate-900 text-sm">{formatCurrency(selectedMilestone.estimatedCost)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 mb-1">חיסכון חודשי נדרש</p>
                      <p className="font-bold text-amber-600 text-sm">{formatCurrency(selectedMilestone.monthlySavingsNeeded)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 mb-1">יעד</p>
                      <p className="font-bold text-slate-900 text-sm">{new Date(selectedMilestone.targetDate + "-01").toLocaleDateString("he-IL", { year: "numeric", month: "short" })}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-[10px] text-slate-500 mb-1">עלות שוטפת</p>
                      <p className="font-bold text-slate-900 text-sm">{selectedMilestone.recurringCost > 0 ? `${formatCurrency(selectedMilestone.recurringCost)}/חודש` : "—"}</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-l from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">🤖</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 mb-1">המלצת AI</p>
                        {selectedMilestone.feasible ? (
                          <p className="text-sm text-slate-700">
                            בקצב החיסכון הנוכחי שלך, תגיע ליעד &quot;{selectedMilestone.name}&quot; בזמן.
                            {selectedMilestone.monthlySavingsNeeded > 3000 && " כדאי לשקול הגדלת החיסכון החודשי ב-500 ₪ כדי ליצור כרית ביטחון."}
                          </p>
                        ) : (
                          <p className="text-sm text-slate-700">
                            בקצב הנוכחי, היעד &quot;{selectedMilestone.name}&quot; ידחה ב-14 חודשים. כדי לעמוד בזמן, יש להגדיל חיסכון חודשי ב-{formatCurrency(2500)} או לדחות ב-8 חודשים.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="card-subtle p-10 text-center">
                  <p className="text-slate-400 text-sm">בחר אבן דרך מהרשימה לצפייה בניתוח AI</p>
                </div>
              )}

              {/* SECTION 4 — Forecast Graph */}
              <div className="card-subtle p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">תחזית שווי נקי</h2>
                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div className="bg-emerald-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-600 mb-1">שווי נקי 2030</p>
                    <p className="text-lg font-bold text-emerald-700">{formatCurrency(850000)}</p>
                  </div>
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-blue-600 mb-1">חיסכון 2030</p>
                    <p className="text-lg font-bold text-blue-700">{formatCurrency(420000)}</p>
                  </div>
                  <div className="bg-red-50 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-red-600 mb-1">חוב 2030</p>
                    <p className="text-lg font-bold text-red-600">{formatCurrency(680000)}</p>
                  </div>
                </div>
                <div className="h-40 bg-slate-50 rounded-xl p-4 flex items-end justify-between gap-1">
                  {[25, 35, 42, 55, 62, 70, 78, 85, 90, 95, 100, 108].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full rounded-t bg-gradient-to-t from-emerald-500 to-emerald-300 transition-all duration-500" style={{ height: `${h * 0.85}%` }} />
                      <span className="text-[8px] text-slate-400">{currentYear + i}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Event Modal */}
      {showAddEvent && <AddEventModal onClose={() => setShowAddEvent(false)} onAdd={(m) => { setMilestones([...milestones, m]); setShowAddEvent(false); }} />}
    </div>
  );
}

function AddEventModal({ onClose, onAdd }: { onClose: () => void; onAdd: (m: Milestone) => void }) {
  const [form, setForm] = useState({ name: "", type: "custom", targetDate: "", estimatedCost: "", priority: "medium" as "high" | "medium" | "low", recurringCost: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const eventType = EVENT_TYPES.find((t) => t.value === form.type);
    onAdd({
      id: Date.now().toString(),
      name: form.name || eventType?.label || "אירוע",
      icon: eventType?.icon || "⭐",
      targetDate: form.targetDate,
      estimatedCost: parseFloat(form.estimatedCost) || 0,
      priority: form.priority,
      recurringCost: parseFloat(form.recurringCost) || 0,
      progress: 0,
      monthlySavingsNeeded: 0,
      feasible: true,
    });
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto page-enter" dir="rtl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">הוסף אירוע חיים</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">סוג אירוע</label>
            <div className="grid grid-cols-3 gap-2">
              {EVENT_TYPES.map((t) => (
                <button key={t.value} type="button" onClick={() => setForm({ ...form, type: t.value, name: t.label })}
                  className={`p-3 rounded-xl border text-center transition-all ${form.type === t.value ? "border-amber-300 bg-amber-50" : "border-slate-100 hover:border-slate-200"}`}>
                  <span className="text-xl block mb-1">{t.icon}</span>
                  <span className="text-xs text-slate-700">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">שם האירוע</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="למשל: חתונה" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">תאריך יעד</label>
              <input type="month" required value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">עלות משוערת (₪)</label>
              <input type="number" value={form.estimatedCost} onChange={(e) => setForm({ ...form, estimatedCost: e.target.value })} className="input-field" dir="ltr" placeholder="0" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">עדיפות</label>
              <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as "high" | "medium" | "low" })} className="input-field">
                <option value="high">גבוהה</option>
                <option value="medium">בינונית</option>
                <option value="low">נמוכה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">עלות חודשית שוטפת</label>
              <input type="number" value={form.recurringCost} onChange={(e) => setForm({ ...form, recurringCost: e.target.value })} className="input-field" dir="ltr" placeholder="0" />
            </div>
          </div>
          <button type="submit" className="btn-primary w-full py-3">הוסף אירוע</button>
        </form>
      </div>
    </div>
  );
}
