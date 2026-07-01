"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface PensionFund {
  id: string;
  name: string;
  type: "pension" | "hishtalmut" | "gemel";
  provider: string;
  balance: number;
  monthlyEmployee: number;
  monthlyEmployer: number;
  managementFee: number;
  returnRate: number;
}

const MOCK_FUNDS: PensionFund[] = [
  { id: "1", name: "פנסיה מקיפה", type: "pension", provider: "מנורה מבטחים", balance: 285000, monthlyEmployee: 1080, monthlyEmployer: 1260, managementFee: 0.5, returnRate: 8.2 },
  { id: "2", name: "קרן השתלמות", type: "hishtalmut", provider: "הראל", balance: 142000, monthlyEmployee: 450, monthlyEmployer: 1350, managementFee: 0.35, returnRate: 9.1 },
  { id: "3", name: "קופת גמל להשקעה", type: "gemel", provider: "אלטשולר שחם", balance: 67000, monthlyEmployee: 1000, monthlyEmployer: 0, managementFee: 0.42, returnRate: 11.4 },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(amount);
}

function getTypeLabel(type: string): string {
  const labels: Record<string, string> = { pension: "פנסיה", hishtalmut: "קרן השתלמות", gemel: "קופת גמל" };
  return labels[type] || type;
}

function getTypeIcon(type: string): string {
  const icons: Record<string, string> = { pension: "🏛️", hishtalmut: "📚", gemel: "💼" };
  return icons[type] || "💰";
}

export default function PensionPage() {
  const router = useRouter();
  const [funds] = useState<PensionFund[]>(MOCK_FUNDS);
  const [retirementAge, setRetirementAge] = useState(67);
  const currentAge = 32;

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const totalBalance = funds.reduce((sum, f) => sum + f.balance, 0);
  const totalMonthlyDeposit = funds.reduce((sum, f) => sum + f.monthlyEmployee + f.monthlyEmployer, 0);
  const totalEmployeeDeposit = funds.reduce((sum, f) => sum + f.monthlyEmployee, 0);
  const totalEmployerDeposit = funds.reduce((sum, f) => sum + f.monthlyEmployer, 0);
  const yearsToRetirement = retirementAge - currentAge;

  // Compound growth projection
  const projectedBalance = funds.reduce((sum, f) => {
    const monthlyTotal = f.monthlyEmployee + f.monthlyEmployer;
    const rate = f.returnRate / 100 / 12;
    const months = yearsToRetirement * 12;
    const futureValue = f.balance * Math.pow(1 + rate, months) + monthlyTotal * ((Math.pow(1 + rate, months) - 1) / rate);
    return sum + futureValue;
  }, 0);

  const estimatedMonthlyPension = Math.round(projectedBalance / (20 * 12)); // 20 years of retirement

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar active="/pension" />
      <main className="flex-1 mr-64">
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">🏛️ מעקב פנסיה</h1>
            <p className="text-slate-500">מעקב אחר החיסכון הפנסיוני ותכנון פרישה</p>
          </div>

          {/* SECTION 1 — Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">סה&quot;כ חיסכון</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">💰</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalBalance)}</p>
              <p className="text-[10px] text-emerald-500 mt-1">↑ 12.3% מתחילת השנה</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">הפקדה חודשית</span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">📥</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalMonthlyDeposit)}</p>
              <p className="text-[10px] text-slate-400 mt-1">עובד + מעסיק</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">תחזית פרישה</span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">🎯</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{formatCurrency(projectedBalance)}</p>
              <p className="text-[10px] text-slate-400 mt-1">בגיל {retirementAge}</p>
            </div>
            <div className="stat-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-500">פנסיה חודשית צפויה</span>
                <span className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">🌴</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(estimatedMonthlyPension)}</p>
              <p className="text-[10px] text-slate-400 mt-1">~{Math.round(estimatedMonthlyPension / 18000 * 100)}% מהשכר הנוכחי</p>
            </div>
          </div>

          {/* SECTION 3 — Funds Detail */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900">מוצרים פנסיוניים</h2>
              {funds.map((fund) => (
                <div key={fund.id} className="card-subtle p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(fund.type)}</span>
                      <div>
                        <p className="font-bold text-slate-900">{fund.name}</p>
                        <p className="text-xs text-slate-400">{fund.provider} · {getTypeLabel(fund.type)}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${fund.returnRate >= 10 ? "bg-emerald-100 text-emerald-700" : fund.returnRate >= 7 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                      {fund.returnRate}% תשואה
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-slate-500">יתרה</p>
                      <p className="font-bold text-sm text-slate-900">{formatCurrency(fund.balance)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-slate-500">עובד</p>
                      <p className="font-bold text-sm text-blue-600">{formatCurrency(fund.monthlyEmployee)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-slate-500">מעסיק</p>
                      <p className="font-bold text-sm text-emerald-600">{formatCurrency(fund.monthlyEmployer)}</p>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-2 text-center">
                      <p className="text-[9px] text-slate-500">דמי ניהול</p>
                      <p className="font-bold text-sm text-amber-600">{fund.managementFee}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* SECTION 2 — Retirement Projection */}
            <div className="space-y-6">
              <div className="card-subtle p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">תחזית פרישה</h2>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">גיל פרישה</label>
                  <div className="flex items-center gap-4">
                    <input type="range" min={55} max={75} value={retirementAge} onChange={(e) => setRetirementAge(+e.target.value)} className="flex-1" />
                    <span className="text-lg font-bold text-slate-900 w-12 text-center">{retirementAge}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>55</span>
                    <span>67 (חוק)</span>
                    <span>75</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">שנים לפרישה</span>
                    <span className="font-bold text-slate-900">{yearsToRetirement} שנים</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">צבירה צפויה</span>
                    <span className="font-bold text-emerald-600">{formatCurrency(projectedBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">פנסיה חודשית</span>
                    <span className="font-bold text-purple-600">{formatCurrency(estimatedMonthlyPension)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">אחוז החלפה</span>
                    <span className={`font-bold ${estimatedMonthlyPension / 18000 >= 0.7 ? "text-emerald-600" : "text-amber-600"}`}>
                      {Math.round(estimatedMonthlyPension / 18000 * 100)}%
                    </span>
                  </div>
                </div>

                {/* Growth chart */}
                <div className="mt-5 h-32 flex items-end justify-between gap-1 px-2">
                  {Array.from({ length: 8 }, (_, i) => {
                    const yearsAhead = Math.round((yearsToRetirement / 8) * (i + 1));
                    const growth = (i + 1) / 8;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-t transition-all" style={{ height: `${growth * 100}%` }} />
                        <span className="text-[8px] text-slate-400">+{yearsAhead}y</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 4 — Contribution Analysis */}
              <div className="card-subtle p-5">
                <h3 className="font-bold text-slate-900 mb-3">ניתוח הפקדות</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                    <span className="text-sm text-emerald-700">הפרשת מעסיק</span>
                    <span className="font-bold text-emerald-700">{formatCurrency(totalEmployerDeposit)}/חודש</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                    <span className="text-sm text-blue-700">הפרשת עובד</span>
                    <span className="font-bold text-blue-700">{formatCurrency(totalEmployeeDeposit)}/חודש</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <span className="text-sm text-slate-600">סה&quot;כ חודשי</span>
                    <span className="font-bold text-slate-900">{formatCurrency(totalMonthlyDeposit)}/חודש</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5 — AI Retirement Advisor */}
          <div className="card-subtle p-5 bg-gradient-to-l from-purple-50 to-indigo-50 border border-purple-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0"><span>🤖</span></div>
              <div>
                <p className="font-semibold text-sm text-slate-900 mb-2">יועץ פנסיה AI</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>✅ <strong>הפרשות נכונות:</strong> המעסיק מפריש את המקסימום לפנסיה (6.5%) — מצוין!</p>
                  <p>⚠️ <strong>דמי ניהול:</strong> בפנסיה המקיפה דמי הניהול ({MOCK_FUNDS[0].managementFee}%) גבוהים מהממוצע. מעבר ל-0.25% יחסוך {formatCurrency(85000)} עד הפרישה.</p>
                  <p>💡 <strong>קרן השתלמות:</strong> תהיה נזילה בעוד 4 שנים — שקול להמשיך לחסוך בה גם אחרי.</p>
                  <p>📈 <strong>תחזית:</strong> בגיל {retirementAge} תקבל ~{Math.round(estimatedMonthlyPension / 18000 * 100)}% מהשכר הנוכחי. {estimatedMonthlyPension / 18000 < 0.7 ? "מומלץ להגדיל הפקדות ב-500 ₪/חודש." : "יחס החלפה טוב!"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
