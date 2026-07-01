"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

type ReportType = "monthly" | "annual" | "category" | "investment" | "goals";

interface ReportItem {
  id: string;
  type: ReportType;
  title: string;
  period: string;
  generatedAt: string;
  summary: string;
}

const MOCK_REPORTS: ReportItem[] = [
  { id: "1", type: "monthly", title: "דוח חודשי — יוני 2026", period: "06/2026", generatedAt: "2026-06-28", summary: "הוצאות ירדו ב-8% לעומת מאי" },
  { id: "2", type: "monthly", title: "דוח חודשי — מאי 2026", period: "05/2026", generatedAt: "2026-06-01", summary: "חיסכון גבוה של 42% מההכנסה" },
  { id: "3", type: "annual", title: "דוח שנתי 2025", period: "2025", generatedAt: "2026-01-02", summary: "שנה מצוינת — שווי נקי עלה ב-23%" },
  { id: "4", type: "category", title: "ניתוח קטגוריית מזון", period: "Q2 2026", generatedAt: "2026-06-15", summary: "ממוצע 3,200 ₪/חודש — 15% מההכנסה" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

export default function ReportsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"generate" | "analytics" | "history" | "schedule">("generate");
  const [selectedReport, setSelectedReport] = useState<ReportType>("monthly");
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 2000);
  };

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar active="/reports" />
      <main className="flex-1 mr-64">
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">📑 מרכז דוחות</h1>
              <p className="text-slate-500">צור דוחות מפורטים, נתח מגמות, וייצא נתונים</p>
            </div>
            <div className="flex gap-2">
              <button className="rounded-xl border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 transition-all flex items-center gap-2">
                <span>📥</span> ייצוא
              </button>
              <button onClick={handleGenerate} className="btn-primary flex items-center gap-2">
                <span>⚡</span> צור דוח חדש
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8 w-fit">
            {([["generate", "יצירת דוח"], ["analytics", "אנליטיקס"], ["history", "היסטוריה"], ["schedule", "תזמון"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* SECTION 1 — Report Generator */}
          {activeTab === "generate" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {([
                  ["monthly", "📅", "דוח חודשי", "סיכום הכנסות, הוצאות וחיסכון"],
                  ["annual", "📊", "דוח שנתי", "סיכום מקיף של השנה כולה"],
                  ["category", "🏷️", "דוח קטגוריה", "ניתוח עומק לקטגוריה בודדת"],
                  ["investment", "📈", "דוח השקעות", "ביצועי תיק ותשואות"],
                  ["goals", "🎯", "דוח יעדים", "התקדמות לעבר היעדים"],
                ] as const).map(([type, icon, title, desc]) => (
                  <button key={type} onClick={() => setSelectedReport(type)}
                    className={`p-5 rounded-2xl border-2 text-right transition-all ${selectedReport === type ? "border-amber-300 bg-amber-50/50 shadow-sm" : "border-slate-100 bg-white hover:border-slate-200"}`}>
                    <span className="text-2xl block mb-2">{icon}</span>
                    <p className="font-bold text-sm text-slate-900">{title}</p>
                    <p className="text-[11px] text-slate-500 mt-1">{desc}</p>
                  </button>
                ))}
              </div>

              {/* AI Executive Summary */}
              <div className="card-subtle p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center"><span>🤖</span></div>
                  <div>
                    <h3 className="font-bold text-slate-900">סיכום מנהלים — AI</h3>
                    <p className="text-xs text-slate-400">יוני 2026</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-5 space-y-3">
                  <p className="text-sm text-slate-700">📌 <strong>הוצאות מסעדות</strong> עלו ב-21% לעומת החודש הקודם ({formatCurrency(2100)} → {formatCurrency(2541)})</p>
                  <p className="text-sm text-slate-700">📌 <strong>אחוז החיסכון</strong> ירד מ-38% ל-34% — עדיין מעל הממוצע</p>
                  <p className="text-sm text-slate-700">📌 <strong>הכנסה נוספת</strong> של {formatCurrency(3200)} מפרילנס השפיעה חיובית</p>
                  <p className="text-sm text-slate-700">📌 <strong>יעד קרן חירום</strong> — נשארו {formatCurrency(8000)} להשלמה (צפי: 4 חודשים)</p>
                </div>
              </div>

              {generating && (
                <div className="card-subtle p-8 text-center">
                  <div className="w-10 h-10 mx-auto border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin mb-4" />
                  <p className="font-medium text-slate-900">מייצר דוח...</p>
                  <p className="text-xs text-slate-400 mt-1">הדוח כולל ניתוח AI מותאם אישית</p>
                </div>
              )}
            </div>
          )}

          {/* SECTION 2 — Visual Analytics */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Pie */}
                <div className="card-subtle p-6">
                  <h3 className="font-bold text-slate-900 mb-4">חלוקת הוצאות לפי קטגוריה</h3>
                  <div className="flex items-center gap-6">
                    <div className="w-36 h-36 rounded-full border-[20px] border-blue-400 relative" style={{ borderColor: "transparent", background: "conic-gradient(#3b82f6 0% 28%, #ef4444 28% 48%, #f59e0b 48% 63%, #10b981 63% 78%, #8b5cf6 78% 90%, #6b7280 90% 100%)" }}>
                      <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-900">{formatCurrency(14200)}</span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      {[["דיור", "28%", "#3b82f6"], ["מזון", "20%", "#ef4444"], ["תחבורה", "15%", "#f59e0b"], ["בילויים", "15%", "#10b981"], ["קניות", "12%", "#8b5cf6"], ["אחר", "10%", "#6b7280"]].map(([label, pct, color]) => (
                        <div key={label} className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                          <span className="text-slate-600">{label}</span>
                          <span className="text-slate-400 mr-auto">{pct}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monthly Trend */}
                <div className="card-subtle p-6">
                  <h3 className="font-bold text-slate-900 mb-4">מגמה חודשית</h3>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[
                      { month: "ינו", income: 18000, expense: 11500 },
                      { month: "פבר", income: 18000, expense: 12200 },
                      { month: "מרץ", income: 18500, expense: 10800 },
                      { month: "אפר", income: 18500, expense: 13100 },
                      { month: "מאי", income: 21200, expense: 11000 },
                      { month: "יוני", income: 18000, expense: 12400 },
                    ].map((d) => (
                      <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full flex gap-0.5 items-end" style={{ height: "140px" }}>
                          <div className="flex-1 bg-emerald-300 rounded-t" style={{ height: `${(d.income / 22000) * 100}%` }} />
                          <div className="flex-1 bg-red-300 rounded-t" style={{ height: `${(d.expense / 22000) * 100}%` }} />
                        </div>
                        <span className="text-[9px] text-slate-400">{d.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-4 mt-3 justify-center">
                    <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-emerald-300" />הכנסות</span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-500"><span className="w-2 h-2 rounded-full bg-red-300" />הוצאות</span>
                  </div>
                </div>

                {/* Cash Flow */}
                <div className="card-subtle p-6">
                  <h3 className="font-bold text-slate-900 mb-4">תזרים מזומנים</h3>
                  <div className="space-y-4">
                    {[
                      { label: "הכנסה נטו", amount: 18000, type: "income" },
                      { label: "הוצאות קבועות", amount: -8500, type: "expense" },
                      { label: "הוצאות משתנות", amount: -3900, type: "expense" },
                      { label: "חיסכון והשקעות", amount: -4200, type: "savings" },
                      { label: "עודף חודשי", amount: 1400, type: "surplus" },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-sm text-slate-700">{item.label}</span>
                        <span className={`font-bold text-sm ${item.type === "income" || item.type === "surplus" ? "text-emerald-600" : item.type === "savings" ? "text-blue-600" : "text-red-500"}`}>
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Savings Trend */}
                <div className="card-subtle p-6">
                  <h3 className="font-bold text-slate-900 mb-4">מגמת חיסכון</h3>
                  <div className="h-36 flex items-end justify-between gap-1 px-2">
                    {[32, 35, 38, 42, 38, 34].map((rate, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-amber-500 to-amber-300 rounded-t transition-all" style={{ height: `${rate * 2.5}%` }} />
                        <span className="text-[9px] text-slate-400">{["ינו", "פבר", "מרץ", "אפר", "מאי", "יונ"][i]}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-xs text-slate-500 mt-3">אחוז חיסכון מהכנסה</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3 — Report History */}
          {activeTab === "history" && (
            <div className="card-subtle overflow-hidden">
              {MOCK_REPORTS.map((report, i) => (
                <div key={report.id} className={`flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors ${i < MOCK_REPORTS.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                      {report.type === "monthly" ? "📅" : report.type === "annual" ? "📊" : report.type === "category" ? "🏷️" : "📈"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{report.title}</p>
                      <p className="text-xs text-slate-400">{report.summary}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">{new Date(report.generatedAt).toLocaleDateString("he-IL")}</span>
                    <div className="flex gap-1">
                      <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs hover:bg-slate-200 transition-colors" title="PDF">📄</button>
                      <button className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs hover:bg-slate-200 transition-colors" title="Excel">📊</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SECTION 5 — Scheduled Reports */}
          {activeTab === "schedule" && (
            <div className="space-y-6">
              <div className="card-subtle p-6">
                <h3 className="font-bold text-slate-900 mb-4">דוחות מתוזמנים</h3>
                <div className="space-y-3">
                  {[
                    { name: "דוח חודשי אוטומטי", freq: "כל 1 בחודש", email: true, active: true },
                    { name: "סיכום שבועי", freq: "כל יום ראשון", email: true, active: true },
                    { name: "דוח רבעוני מפורט", freq: "כל רבעון", email: false, active: false },
                  ].map((sched) => (
                    <div key={sched.name} className="flex items-center justify-between p-4 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${sched.active ? "bg-emerald-400" : "bg-slate-300"}`} />
                        <div>
                          <p className="font-medium text-sm text-slate-900">{sched.name}</p>
                          <p className="text-xs text-slate-400">{sched.freq} {sched.email && "· נשלח באימייל"}</p>
                        </div>
                      </div>
                      <button className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${sched.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {sched.active ? "פעיל" : "כבוי"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Center */}
              <div className="card-subtle p-6">
                <h3 className="font-bold text-slate-900 mb-4">מרכז ייצוא</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { format: "PDF", icon: "📄", desc: "דוח מעוצב להדפסה" },
                    { format: "Excel", icon: "📊", desc: "נתונים עם גרפים" },
                    { format: "CSV", icon: "📋", desc: "נתונים גולמיים" },
                  ].map((exp) => (
                    <button key={exp.format} className="p-5 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all text-center">
                      <span className="text-3xl block mb-2">{exp.icon}</span>
                      <p className="font-bold text-sm text-slate-900">{exp.format}</p>
                      <p className="text-[11px] text-slate-400 mt-1">{exp.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
