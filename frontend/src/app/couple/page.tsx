"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface Partner {
  name: string;
  income: number;
  expenses: number;
  savings: number;
  avatar: string;
}

interface SharedExpense {
  id: string;
  name: string;
  amount: number;
  splitA: number;
  splitB: number;
  category: string;
  icon: string;
}

interface SharedGoal {
  id: string;
  name: string;
  icon: string;
  target: number;
  current: number;
  contributionA: number;
  contributionB: number;
}

const PARTNER_A: Partner = { name: "דני", income: 18000, expenses: 11200, savings: 6800, avatar: "👨" };
const PARTNER_B: Partner = { name: "שרה", income: 15000, expenses: 9800, savings: 5200, avatar: "👩" };

const MOCK_SHARED_EXPENSES: SharedExpense[] = [
  { id: "1", name: "שכר דירה", amount: 5500, splitA: 70, splitB: 30, category: "דיור", icon: "🏠" },
  { id: "2", name: "סופר", amount: 3200, splitA: 50, splitB: 50, category: "מזון", icon: "🛒" },
  { id: "3", name: "חשמל ומים", amount: 650, splitA: 50, splitB: 50, category: "חשבונות", icon: "💡" },
  { id: "4", name: "ביטוח בריאות", amount: 480, splitA: 50, splitB: 50, category: "ביטוח", icon: "🏥" },
  { id: "5", name: "נטפליקס + ספוטיפיי", amount: 95, splitA: 50, splitB: 50, category: "בידור", icon: "🎬" },
  { id: "6", name: "ארנונה", amount: 850, splitA: 60, splitB: 40, category: "דיור", icon: "🏛️" },
];

const MOCK_GOALS: SharedGoal[] = [
  { id: "1", name: "חתונה", icon: "💒", target: 120000, current: 54000, contributionA: 32000, contributionB: 22000 },
  { id: "2", name: "דירה - הון עצמי", icon: "🏠", target: 400000, current: 85000, contributionA: 48000, contributionB: 37000 },
  { id: "3", name: "חופשה ביוון", icon: "✈️", target: 15000, current: 8500, contributionA: 4500, contributionB: 4000 },
  { id: "4", name: "קרן חירום משותפת", icon: "🛡️", target: 50000, current: 31000, contributionA: 17000, contributionB: 14000 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

export default function CouplePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"dashboard" | "split" | "goals" | "compare">("dashboard");
  const [inviteModal, setInviteModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const combinedIncome = PARTNER_A.income + PARTNER_B.income;
  const combinedExpenses = PARTNER_A.expenses + PARTNER_B.expenses;
  const combinedSavings = PARTNER_A.savings + PARTNER_B.savings;
  const totalSharedExpenses = MOCK_SHARED_EXPENSES.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar active="/couple" />
      <main className="flex-1 mr-64">
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-1">💑 מצב זוגי</h1>
              <p className="text-slate-500">ניהול פיננסי משותף עם {PARTNER_A.name} ו{PARTNER_B.name}</p>
            </div>
            <button onClick={() => setInviteModal(true)} className="btn-primary flex items-center gap-2">
              <span>🔗</span> הזמן בן/בת זוג
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-8 w-fit">
            {([["dashboard", "דשבורד"], ["split", "חלוקת הוצאות"], ["goals", "יעדים משותפים"], ["compare", "השוואה"]] as const).map(([key, label]) => (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                {label}
              </button>
            ))}
          </div>

          {/* SECTION 1 — Shared Dashboard */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Partner cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {[PARTNER_A, PARTNER_B].map((p) => (
                  <div key={p.name} className="stat-card">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{p.avatar}</span>
                      <div>
                        <p className="font-bold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">הכנסה חודשית: {formatCurrency(p.income)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500">הכנסה</p>
                        <p className="font-bold text-emerald-600 text-sm">{formatCurrency(p.income)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500">הוצאות</p>
                        <p className="font-bold text-red-500 text-sm">{formatCurrency(p.expenses)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-lg p-2 text-center">
                        <p className="text-[10px] text-slate-500">חיסכון</p>
                        <p className="font-bold text-blue-600 text-sm">{formatCurrency(p.savings)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Combined stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">הכנסה משותפת</span>
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">💰</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(combinedIncome)}</p>
                </div>
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">הוצאות משותפות</span>
                    <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">📉</span>
                  </div>
                  <p className="text-2xl font-bold text-red-500">{formatCurrency(combinedExpenses)}</p>
                </div>
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">חיסכון משותף</span>
                    <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">🏦</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(combinedSavings)}</p>
                </div>
                <div className="stat-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-500">ציון בריאות זוגי</span>
                    <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">💯</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">78</p>
                </div>
              </div>

              {/* AI Advisor */}
              <div className="card-subtle p-5 bg-gradient-to-l from-purple-50 to-pink-50 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <span>🤖</span>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 mb-1">יועץ AI זוגי</p>
                    <p className="text-sm text-slate-700 mb-2">על בסיס הנתונים המשותפים שלכם:</p>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• אתם חוסכים 36% מההכנסה המשותפת — מצוין!</li>
                      <li>• בקצב הנוכחי תגיעו ליעד החתונה בעוד 11 חודשים</li>
                      <li>• ההוצאות על אוכל בחוץ עלו ב-18% החודש — כדאי לשים לב</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2 — Expense Split Manager */}
          {activeTab === "split" && (
            <div className="space-y-6">
              <div className="card-subtle p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900">חלוקת הוצאות משותפות</h2>
                  <div className="text-sm text-slate-500">סה&quot;כ: <span className="font-bold text-slate-900">{formatCurrency(totalSharedExpenses)}</span></div>
                </div>
                <div className="space-y-3">
                  {MOCK_SHARED_EXPENSES.map((expense) => (
                    <div key={expense.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-4">
                        <span className="text-xl">{expense.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <p className="font-semibold text-sm text-slate-900">{expense.name}</p>
                            <p className="font-bold text-slate-900">{formatCurrency(expense.amount)}</p>
                          </div>
                          {/* Split bar */}
                          <div className="flex h-2 rounded-full overflow-hidden bg-slate-100">
                            <div className="bg-blue-400 transition-all" style={{ width: `${expense.splitA}%` }} />
                            <div className="bg-pink-400 transition-all" style={{ width: `${expense.splitB}%` }} />
                          </div>
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-blue-600">{PARTNER_A.name} {expense.splitA}% ({formatCurrency(expense.amount * expense.splitA / 100)})</span>
                            <span className="text-[10px] text-pink-600">{PARTNER_B.name} {expense.splitB}% ({formatCurrency(expense.amount * expense.splitB / 100)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-2 gap-5">
                <div className="stat-card border-2 border-blue-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">👨</span>
                    <p className="font-bold text-slate-900">{PARTNER_A.name} משלם</p>
                  </div>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(MOCK_SHARED_EXPENSES.reduce((sum, e) => sum + e.amount * e.splitA / 100, 0))}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">מתוך הכנסה {Math.round(MOCK_SHARED_EXPENSES.reduce((sum, e) => sum + e.amount * e.splitA / 100, 0) / PARTNER_A.income * 100)}%</p>
                </div>
                <div className="stat-card border-2 border-pink-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">👩</span>
                    <p className="font-bold text-slate-900">{PARTNER_B.name} משלמת</p>
                  </div>
                  <p className="text-2xl font-bold text-pink-600">
                    {formatCurrency(MOCK_SHARED_EXPENSES.reduce((sum, e) => sum + e.amount * e.splitB / 100, 0))}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">מתוך הכנסה {Math.round(MOCK_SHARED_EXPENSES.reduce((sum, e) => sum + e.amount * e.splitB / 100, 0) / PARTNER_B.income * 100)}%</p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3 — Shared Goals */}
          {activeTab === "goals" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {MOCK_GOALS.map((goal) => (
                  <div key={goal.id} className="card-subtle p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{goal.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{goal.name}</p>
                        <p className="text-xs text-slate-400">{formatCurrency(goal.current)} / {formatCurrency(goal.target)}</p>
                      </div>
                      <span className="text-lg font-bold text-amber-600">{Math.round(goal.current / goal.target * 100)}%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className="h-full rounded-full flex">
                        <div className="bg-blue-400" style={{ width: `${(goal.contributionA / goal.target) * 100}%` }} />
                        <div className="bg-pink-400" style={{ width: `${(goal.contributionB / goal.target) * 100}%` }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-blue-600">👨 {PARTNER_A.name}: {formatCurrency(goal.contributionA)}</span>
                      <span className="text-pink-600">👩 {PARTNER_B.name}: {formatCurrency(goal.contributionB)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5 — Spending Comparison */}
          {activeTab === "compare" && (
            <div className="space-y-6">
              <div className="card-subtle p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5">השוואת הוצאות</h2>
                {[
                  { category: "מזון ומסעדות", iconA: "🍕", a: 3200, b: 2800 },
                  { category: "תחבורה", iconA: "🚗", a: 1800, b: 900 },
                  { category: "בילויים", iconA: "🎬", a: 1200, b: 1500 },
                  { category: "קניות", iconA: "🛍️", a: 800, b: 2200 },
                  { category: "ספורט ובריאות", iconA: "💪", a: 350, b: 450 },
                  { category: "מנויים", iconA: "📱", a: 280, b: 180 },
                ].map((item) => {
                  const max = Math.max(item.a, item.b);
                  return (
                    <div key={item.category} className="mb-4">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{item.iconA} {item.category}</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-blue-600 w-10">👨</span>
                          <div className="flex-1 h-5 bg-slate-50 rounded-md overflow-hidden">
                            <div className="h-full bg-blue-200 rounded-md flex items-center px-2" style={{ width: `${(item.a / max) * 100}%` }}>
                              <span className="text-[10px] font-semibold text-blue-700">{formatCurrency(item.a)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-pink-600 w-10">👩</span>
                          <div className="flex-1 h-5 bg-slate-50 rounded-md overflow-hidden">
                            <div className="h-full bg-pink-200 rounded-md flex items-center px-2" style={{ width: `${(item.b / max) * 100}%` }}>
                              <span className="text-[10px] font-semibold text-pink-700">{formatCurrency(item.b)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* AI Analysis */}
              <div className="card-subtle p-5 bg-gradient-to-l from-blue-50 to-indigo-50 border border-blue-100">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><span>🤖</span></div>
                  <div>
                    <p className="font-semibold text-sm text-slate-900 mb-1">ניתוח השוואתי</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• {PARTNER_A.name} מוציא יותר על תחבורה (פי 2 מ{PARTNER_B.name})</li>
                      <li>• {PARTNER_B.name} מוציאה יותר על קניות (+{formatCurrency(1400)} מ{PARTNER_A.name})</li>
                      <li>• שניכם בטווח סביר בהוצאות מזון — כל הכבוד!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {inviteModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setInviteModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl mx-4 page-enter" dir="rtl">
            <h2 className="text-xl font-bold text-slate-900 mb-4">הזמנת בן/בת זוג</h2>
            <p className="text-sm text-slate-500 mb-4">שלח הזמנה באימייל כדי לחבר את החשבונות שלכם</p>
            <input className="input-field mb-4" placeholder="אימייל בן/בת הזוג" type="email" dir="ltr" />
            <button className="btn-primary w-full py-3">שלח הזמנה</button>
          </div>
        </div>
      )}
    </div>
  );
}
