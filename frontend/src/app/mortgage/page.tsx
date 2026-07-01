"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface MortgageData {
  originalAmount: number;
  remainingBalance: number;
  interestRate: number;
  monthlyPayment: number;
  termMonths: number;
  remainingMonths: number;
  startDate: string;
  bank: string;
  trackType: string;
  principalPaid: number;
  interestPaid: number;
}

const MOCK_MORTGAGE: MortgageData = {
  originalAmount: 1200000,
  remainingBalance: 1085000,
  interestRate: 4.2,
  monthlyPayment: 5850,
  termMonths: 300,
  remainingMonths: 276,
  startDate: "2024-06",
  bank: "בנק לאומי",
  trackType: "פריים + קבועה",
  principalPaid: 115000,
  interestPaid: 48600,
};

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

export default function MortgagePage() {
  const router = useRouter();
  const [mortgage] = useState<MortgageData>(MOCK_MORTGAGE);
  const [extraPayment, setExtraPayment] = useState("");
  const [lumpSum, setLumpSum] = useState("");
  const [showRepayment, setShowRepayment] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const progressPct = ((mortgage.termMonths - mortgage.remainingMonths) / mortgage.termMonths) * 100;
  const yearsRemaining = Math.floor(mortgage.remainingMonths / 12);
  const monthsRemaining = mortgage.remainingMonths % 12;

  // Simple early repayment calc
  const extraMonthly = parseFloat(extraPayment) || 0;
  const lumpSumAmount = parseFloat(lumpSum) || 0;
  const monthsSaved = extraMonthly > 0 ? Math.round((extraMonthly / mortgage.monthlyPayment) * mortgage.remainingMonths * 0.3) : 0;
  const interestSavedMonthly = extraMonthly > 0 ? Math.round(extraMonthly * mortgage.remainingMonths * (mortgage.interestRate / 100) * 0.4) : 0;
  const interestSavedLump = lumpSumAmount > 0 ? Math.round(lumpSumAmount * (mortgage.interestRate / 100) * yearsRemaining * 0.6) : 0;
  const monthsSavedLump = lumpSumAmount > 0 ? Math.round((lumpSumAmount / mortgage.monthlyPayment) * 0.8) : 0;

  // Generate amortization schedule (simplified, first 12 months)
  const amortization = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const interestPortion = Math.round(mortgage.remainingBalance * (mortgage.interestRate / 100 / 12));
    const principalPortion = mortgage.monthlyPayment - interestPortion;
    return { month, payment: mortgage.monthlyPayment, interest: interestPortion, principal: principalPortion, balance: mortgage.remainingBalance - principalPortion * month };
  });

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar active="/mortgage" />
      <main className="flex-1 mr-64">
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">🏠 מעקב משכנתא</h1>
            <p className="text-slate-500">ניהול, מעקב ואופטימיזציה של המשכנתא שלך</p>
          </div>

          {/* SECTION 1 — Mortgage Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">יתרת חוב</span>
                <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">🏦</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{formatCurrency(mortgage.remainingBalance)}</p>
              <p className="text-[10px] text-slate-400 mt-1">מתוך {formatCurrency(mortgage.originalAmount)}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">ריבית</span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">📊</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{mortgage.interestRate}%</p>
              <p className="text-[10px] text-slate-400 mt-1">{mortgage.trackType}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">תשלום חודשי</span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">💳</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(mortgage.monthlyPayment)}</p>
              <p className="text-[10px] text-slate-400 mt-1">{mortgage.bank}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">נותר</span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">⏱️</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{yearsRemaining} שנים {monthsRemaining > 0 ? `ו-${monthsRemaining} חודשים` : ""}</p>
              <p className="text-[10px] text-slate-400 mt-1">מתוך {Math.round(mortgage.termMonths / 12)} שנים</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="card-subtle p-5 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">התקדמות תשלום</span>
              <span className="text-sm font-bold text-amber-600">{progressPct.toFixed(1)}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-l from-amber-400 to-emerald-400 transition-all duration-700" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-[10px] text-slate-400">
              <span>התחלה: {new Date(mortgage.startDate).toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</span>
              <span>סיום צפוי: {new Date(new Date(mortgage.startDate).getTime() + mortgage.termMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("he-IL", { month: "long", year: "numeric" })}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* SECTION 2 — Breakdown */}
            <div className="card-subtle p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">פירוט תשלומים</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">קרן ששולמה</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(mortgage.principalPaid)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${(mortgage.principalPaid / mortgage.originalAmount) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">ריבית ששולמה</span>
                    <span className="font-bold text-red-500">{formatCurrency(mortgage.interestPaid)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${(mortgage.interestPaid / (mortgage.interestPaid + mortgage.principalPaid + mortgage.remainingBalance * (mortgage.interestRate / 100) * yearsRemaining)) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm text-slate-600">יתרה לתשלום</span>
                    <span className="font-bold text-slate-900">{formatCurrency(mortgage.remainingBalance)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-400 rounded-full" style={{ width: `${(mortgage.remainingBalance / mortgage.originalAmount) * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Visual split */}
              <div className="mt-6 flex h-8 rounded-xl overflow-hidden">
                <div className="bg-emerald-400 flex items-center justify-center" style={{ width: `${(mortgage.principalPaid / mortgage.originalAmount) * 100}%` }}>
                  <span className="text-[9px] text-white font-bold">קרן</span>
                </div>
                <div className="bg-red-400 flex items-center justify-center" style={{ width: `${(mortgage.interestPaid / mortgage.originalAmount) * 100 * 2}%` }}>
                  <span className="text-[9px] text-white font-bold">ריבית</span>
                </div>
                <div className="bg-slate-300 flex-1 flex items-center justify-center">
                  <span className="text-[9px] text-slate-600 font-bold">נותר</span>
                </div>
              </div>
            </div>

            {/* SECTION 4 — Early Repayment Simulator */}
            <div className="card-subtle p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">סימולטור פירעון מוקדם</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">תוספת חודשית קבועה</label>
                  <input type="number" value={extraPayment} onChange={(e) => setExtraPayment(e.target.value)} className="input-field" dir="ltr" placeholder="₪ 0" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">תשלום חד-פעמי</label>
                  <input type="number" value={lumpSum} onChange={(e) => setLumpSum(e.target.value)} className="input-field" dir="ltr" placeholder="₪ 0" />
                </div>

                {(extraMonthly > 0 || lumpSumAmount > 0) && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                    <p className="font-semibold text-sm text-emerald-800">💰 חיסכון פוטנציאלי</p>
                    {extraMonthly > 0 && (
                      <>
                        <p className="text-sm text-emerald-700">ריבית שנחסכת: <strong>{formatCurrency(interestSavedMonthly)}</strong></p>
                        <p className="text-sm text-emerald-700">חודשים שנחסכים: <strong>{monthsSaved} חודשים</strong></p>
                      </>
                    )}
                    {lumpSumAmount > 0 && (
                      <>
                        <p className="text-sm text-emerald-700">חיסכון מתשלום חד-פעמי: <strong>{formatCurrency(interestSavedLump)}</strong></p>
                        <p className="text-sm text-emerald-700">קיצור תקופה: <strong>{monthsSavedLump} חודשים</strong></p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 3 — Amortization Schedule */}
          <div className="card-subtle p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">לוח סילוקין</h2>
              <button onClick={() => setShowRepayment(!showRepayment)} className="text-xs text-amber-600 font-medium hover:text-amber-700 transition-colors">
                {showRepayment ? "הסתר" : "הצג 12 חודשים הבאים"}
              </button>
            </div>
            {showRepayment && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-right border-b border-slate-100">
                      <th className="pb-3 font-medium text-slate-500">חודש</th>
                      <th className="pb-3 font-medium text-slate-500">תשלום</th>
                      <th className="pb-3 font-medium text-slate-500">קרן</th>
                      <th className="pb-3 font-medium text-slate-500">ריבית</th>
                      <th className="pb-3 font-medium text-slate-500">יתרה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amortization.map((row) => (
                      <tr key={row.month} className="border-b border-slate-50">
                        <td className="py-2.5">{row.month}</td>
                        <td className="py-2.5 font-medium">{formatCurrency(row.payment)}</td>
                        <td className="py-2.5 text-emerald-600">{formatCurrency(row.principal)}</td>
                        <td className="py-2.5 text-red-500">{formatCurrency(row.interest)}</td>
                        <td className="py-2.5 text-slate-600">{formatCurrency(row.balance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {!showRepayment && (
              <p className="text-sm text-slate-400 text-center py-4">לחץ &quot;הצג&quot; לצפייה בלוח הסילוקין המפורט</p>
            )}
          </div>

          {/* SECTION 5 — AI Refinance Recommendations */}
          <div className="card-subtle p-5 bg-gradient-to-l from-blue-50 to-cyan-50 border border-blue-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0"><span>🤖</span></div>
              <div>
                <p className="font-semibold text-sm text-slate-900 mb-2">ניתוח מיחזור — AI</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>📊 הריבית הנוכחית שלך ({mortgage.interestRate}%) <strong>גבוהה מהממוצע בשוק</strong> (3.8%)</p>
                  <p>💡 מיחזור יכול לחסוך לך <strong>{formatCurrency(45000)}</strong> לאורך חיי ההלוואה</p>
                  <p>⚠️ שים לב: עמלת פירעון מוקדם עשויה להגיע ל-{formatCurrency(12000)} — עדיין משתלם</p>
                  <p>✅ <strong>המלצה:</strong> בדוק הצעות מיחזור בבנק הפועלים ומזרחי טפחות</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
