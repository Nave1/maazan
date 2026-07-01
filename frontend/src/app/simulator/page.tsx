"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface Scenario {
  id: string;
  name: string;
  icon: string;
  variables: Record<string, string | number>;
  impact: { savings: number; netWorth: number; goalDelay: number; riskScore: number };
}

const SCENARIO_TEMPLATES = [
  { value: "salary_up", label: "העלאת שכר", icon: "💰" },
  { value: "job_loss", label: "אובדן עבודה", icon: "⚠️" },
  { value: "mortgage", label: "לקיחת משכנתא", icon: "🏠" },
  { value: "new_car", label: "רכישת רכב", icon: "🚗" },
  { value: "child", label: "ילד חדש", icon: "👶" },
  { value: "business", label: "פתיחת עסק", icon: "🏢" },
  { value: "vacation", label: "חופשה גדולה", icon: "✈️" },
  { value: "emergency", label: "הוצאה לא צפויה", icon: "🚨" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

export default function SimulatorPage() {
  const router = useRouter();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderForm, setBuilderForm] = useState({
    template: "salary_up",
    salary: 18000,
    monthlySavings: 5000,
    debt: 0,
    monthlyExpenses: 12000,
    timePeriod: 24,
    inflation: 3,
  });
  const [simResult, setSimResult] = useState<Scenario | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const runSimulation = () => {
    const template = SCENARIO_TEMPLATES.find(t => t.value === builderForm.template);
    const newScenario: Scenario = {
      id: Date.now().toString(),
      name: template?.label || "תרחיש",
      icon: template?.icon || "🔮",
      variables: { ...builderForm },
      impact: {
        savings: builderForm.template === "salary_up" ? builderForm.monthlySavings * builderForm.timePeriod * 1.3 : builderForm.monthlySavings * builderForm.timePeriod * 0.6,
        netWorth: builderForm.template === "salary_up" ? 450000 : builderForm.template === "job_loss" ? -120000 : 180000,
        goalDelay: builderForm.template === "new_car" ? 18 : builderForm.template === "child" ? 12 : builderForm.template === "salary_up" ? -6 : 8,
        riskScore: builderForm.template === "job_loss" ? 85 : builderForm.template === "emergency" ? 70 : 25,
      },
    };
    setSimResult(newScenario);
    setScenarios(prev => [...prev, newScenario]);
  };

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar active="/simulator" />
      <main className="flex-1 mr-64">
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">🔮 סימולטור מה-אם</h1>
              <p className="text-slate-500">בדוק תרחישים פיננסיים וקבל תחזיות מבוססות AI</p>
            </div>
            <button onClick={() => setShowBuilder(true)} className="btn-primary flex items-center gap-2">
              <span>+</span> תרחיש חדש
            </button>
          </div>

          {/* SECTION 1 — Scenario Templates */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">בחר תרחיש לסימולציה</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {SCENARIO_TEMPLATES.map((t) => (
                <button key={t.value} onClick={() => { setBuilderForm(f => ({ ...f, template: t.value })); setShowBuilder(true); }}
                  className="p-5 rounded-2xl border border-slate-100 bg-white hover:border-amber-200 hover:shadow-md transition-all text-center group">
                  <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">{t.icon}</span>
                  <p className="font-bold text-sm text-slate-900">{t.label}</p>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3 — Latest Simulation Result */}
          {simResult && (
            <div className="space-y-6 mb-8">
              <div className="card-subtle p-6">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{simResult.icon}</span>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">תוצאות סימולציה: {simResult.name}</h2>
                    <p className="text-xs text-slate-400">תקופה: {builderForm.timePeriod} חודשים</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 mb-1">חיסכון צפוי</p>
                    <p className={`text-xl font-bold ${simResult.impact.savings >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(simResult.impact.savings)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 mb-1">שווי נקי</p>
                    <p className={`text-xl font-bold ${simResult.impact.netWorth >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(simResult.impact.netWorth)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 mb-1">השפעה על יעדים</p>
                    <p className={`text-xl font-bold ${simResult.impact.goalDelay <= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {simResult.impact.goalDelay <= 0 ? `הקדמה ${Math.abs(simResult.impact.goalDelay)} חודשים` : `דחייה ${simResult.impact.goalDelay} חודשים`}
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center">
                    <p className="text-[10px] text-slate-500 mb-1">ציון סיכון</p>
                    <p className={`text-xl font-bold ${simResult.impact.riskScore < 40 ? "text-emerald-600" : simResult.impact.riskScore < 60 ? "text-amber-600" : "text-red-500"}`}>{simResult.impact.riskScore}/100</p>
                  </div>
                </div>

                {/* Projection chart */}
                <div className="h-40 bg-slate-50 rounded-xl p-4 flex items-end justify-between gap-1 mb-4">
                  {Array.from({ length: 12 }, (_, i) => {
                    const baseline = 80 + i * 3;
                    const scenario = simResult.impact.goalDelay > 0 ? 80 - i * 2 : 80 + i * 5;
                    return (
                      <div key={i} className="flex-1 flex gap-0.5 items-end h-full">
                        <div className="flex-1 bg-slate-300 rounded-t opacity-50" style={{ height: `${Math.min(baseline, 100)}%` }} />
                        <div className={`flex-1 rounded-t ${scenario > baseline ? "bg-emerald-400" : "bg-red-400"}`} style={{ height: `${Math.min(Math.max(scenario, 10), 100)}%` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center gap-4 justify-center">
                  <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-slate-300" />מצב נוכחי</span>
                  <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-400" />אחרי תרחיש</span>
                </div>
              </div>

              {/* SECTION 4 — AI Analysis */}
              <div className="card-subtle p-5 bg-gradient-to-l from-purple-50 to-indigo-50 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"><span>🤖</span></div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 mb-2">ניתוח AI</p>
                    {simResult.impact.goalDelay > 0 ? (
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>⚠️ <strong>סיכון:</strong> {simResult.name} תגרום לדחיית יעד רכישת הדירה ב-{simResult.impact.goalDelay} חודשים.</p>
                        <p>💡 <strong>המלצה:</strong> אם תגדיל חיסכון ב-{formatCurrency(1500)}/חודש, תוכל לצמצם את הדחייה ל-6 חודשים בלבד.</p>
                        <p>🔄 <strong>חלופה:</strong> שקול {builderForm.template === "new_car" ? "רכב יד שנייה או ליסינג" : "לפרוס את ההוצאה על תקופה ארוכה יותר"}.</p>
                      </div>
                    ) : (
                      <div className="space-y-2 text-sm text-slate-700">
                        <p>✅ <strong>הזדמנות:</strong> {simResult.name} תקדם את היעדים שלך ב-{Math.abs(simResult.impact.goalDelay)} חודשים!</p>
                        <p>💡 <strong>המלצה:</strong> נצל את התוספת להגדלת קרן החירום ולאחר מכן להשקעות.</p>
                        <p>📈 <strong>פוטנציאל:</strong> אם תשקיע את העודף ב-7% תשואה, תוסיף {formatCurrency(35000)} לשווי הנקי תוך שנתיים.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5 — Scenario Comparison */}
          {scenarios.length > 1 && (
            <div className="card-subtle p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">השוואת תרחישים</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right border-b border-slate-100">
                      <th className="pb-3 font-medium text-slate-500">תרחיש</th>
                      <th className="pb-3 font-medium text-slate-500">חיסכון</th>
                      <th className="pb-3 font-medium text-slate-500">שווי נקי</th>
                      <th className="pb-3 font-medium text-slate-500">השפעה על יעדים</th>
                      <th className="pb-3 font-medium text-slate-500">סיכון</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarios.map((s) => (
                      <tr key={s.id} className="border-b border-slate-50">
                        <td className="py-3 font-medium">{s.icon} {s.name}</td>
                        <td className={`py-3 font-bold ${s.impact.savings >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(s.impact.savings)}</td>
                        <td className={`py-3 font-bold ${s.impact.netWorth >= 0 ? "text-emerald-600" : "text-red-500"}`}>{formatCurrency(s.impact.netWorth)}</td>
                        <td className={`py-3 ${s.impact.goalDelay <= 0 ? "text-emerald-600" : "text-red-500"}`}>{s.impact.goalDelay <= 0 ? `הקדמה ${Math.abs(s.impact.goalDelay)} חודשים` : `+${s.impact.goalDelay} חודשים`}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${s.impact.riskScore < 40 ? "bg-emerald-100 text-emerald-700" : s.impact.riskScore < 60 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>
                            {s.impact.riskScore}/100
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!simResult && scenarios.length === 0 && (
            <div className="card-subtle p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4"><span className="text-3xl">🔮</span></div>
              <h3 className="font-bold text-slate-900 text-lg mb-2">עדיין אין סימולציות</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">בחר תרחיש מלמעלה או צור תרחיש מותאם אישית כדי לראות את ההשפעה על העתיד הפיננסי שלך.</p>
            </div>
          )}
        </div>
      </main>

      {/* Builder Modal */}
      {showBuilder && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowBuilder(false)}>
          <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto page-enter" dir="rtl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">בניית תרחיש</h2>
              <button onClick={() => setShowBuilder(false)} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">✕</button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">סוג תרחיש</label>
                <select value={builderForm.template} onChange={(e) => setBuilderForm(f => ({ ...f, template: e.target.value }))} className="input-field">
                  {SCENARIO_TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">שכר חודשי</label>
                  <input type="number" value={builderForm.salary} onChange={(e) => setBuilderForm(f => ({ ...f, salary: +e.target.value }))} className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">חיסכון חודשי</label>
                  <input type="number" value={builderForm.monthlySavings} onChange={(e) => setBuilderForm(f => ({ ...f, monthlySavings: +e.target.value }))} className="input-field" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">הוצאות חודשיות</label>
                  <input type="number" value={builderForm.monthlyExpenses} onChange={(e) => setBuilderForm(f => ({ ...f, monthlyExpenses: +e.target.value }))} className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">חוב קיים</label>
                  <input type="number" value={builderForm.debt} onChange={(e) => setBuilderForm(f => ({ ...f, debt: +e.target.value }))} className="input-field" dir="ltr" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">תקופה (חודשים)</label>
                  <input type="number" value={builderForm.timePeriod} onChange={(e) => setBuilderForm(f => ({ ...f, timePeriod: +e.target.value }))} className="input-field" dir="ltr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">הנחת אינפלציה (%)</label>
                  <input type="number" step="0.1" value={builderForm.inflation} onChange={(e) => setBuilderForm(f => ({ ...f, inflation: +e.target.value }))} className="input-field" dir="ltr" />
                </div>
              </div>
              <button onClick={() => { runSimulation(); setShowBuilder(false); }} className="btn-primary w-full py-3">🔮 הרץ סימולציה</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
