"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

interface ScoreCategory {
  id: string;
  name: string;
  icon: string;
  score: number;
  maxScore: number;
  status: "excellent" | "good" | "fair" | "poor";
  detail: string;
  recommendation: string;
}

const MOCK_CATEGORIES: ScoreCategory[] = [
  { id: "1", name: "אחוז חיסכון", icon: "💰", score: 18, maxScore: 20, status: "excellent", detail: "36% מההכנסה — מעל 30% מצוין", recommendation: "המשך כך! אתה בטופ 10% בישראל" },
  { id: "2", name: "יחס חוב", icon: "📊", score: 12, maxScore: 20, status: "fair", detail: "יחס חוב/הכנסה 42% — גבוה מהמומלץ", recommendation: "הקטן חוב ב-2,000 ₪/חודש כדי לשפר ב-4 נקודות" },
  { id: "3", name: "קרן חירום", icon: "🛡️", score: 10, maxScore: 15, status: "good", detail: "4.2 חודשי הוצאות — קרוב ליעד 6 חודשים", recommendation: "הוסף 1,500 ₪/חודש, תגיע ליעד תוך 8 חודשים" },
  { id: "4", name: "גיוון השקעות", icon: "📈", score: 13, maxScore: 15, status: "excellent", detail: "תיק מגוון: מניות 60%, אג\"ח 30%, נדל\"ן 10%", recommendation: "שקול הוספת חשיפה בינלאומית (כיום 20%)" },
  { id: "5", name: "משמעת תקציבית", icon: "🎯", score: 14, maxScore: 15, status: "excellent", detail: "חריגה ממוצעת 3% — מצוין", recommendation: "שמור על הרמה, שקול אוטומציה של חיסכון" },
  { id: "6", name: "יציבות תזרים", icon: "🔄", score: 17, maxScore: 15, status: "excellent", detail: "הכנסה יציבה, תנודתיות נמוכה", recommendation: "מצוין! שקול מקור הכנסה פסיבי נוסף" },
];

const MOCK_HISTORY = [
  { month: "ינואר", score: 72 },
  { month: "פברואר", score: 74 },
  { month: "מרץ", score: 76 },
  { month: "אפריל", score: 78 },
  { month: "מאי", score: 81 },
  { month: "יוני", score: 84 },
];

function getStatusColor(status: string): string {
  switch (status) {
    case "excellent": return "text-emerald-600 bg-emerald-100";
    case "good": return "text-blue-600 bg-blue-100";
    case "fair": return "text-amber-600 bg-amber-100";
    case "poor": return "text-red-600 bg-red-100";
    default: return "text-slate-600 bg-slate-100";
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "excellent": return "מצוין";
    case "good": return "טוב";
    case "fair": return "סביר";
    case "poor": return "דרוש שיפור";
    default: return "";
  }
}

function getOverallStatus(score: number): { label: string; color: string; emoji: string } {
  if (score >= 85) return { label: "מצוין", color: "text-emerald-600", emoji: "🌟" };
  if (score >= 70) return { label: "טוב מאוד", color: "text-blue-600", emoji: "👍" };
  if (score >= 55) return { label: "סביר", color: "text-amber-600", emoji: "⚠️" };
  return { label: "דרוש שיפור", color: "text-red-600", emoji: "🚨" };
}

export default function ScorePage() {
  const router = useRouter();
  const [categories] = useState<ScoreCategory[]>(MOCK_CATEGORIES);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) router.push("/login");
  }, [router]);

  const totalScore = categories.reduce((sum, c) => sum + c.score, 0);
  const maxPossible = categories.reduce((sum, c) => sum + c.maxScore, 0);
  const normalizedScore = Math.round((totalScore / maxPossible) * 100);
  const status = getOverallStatus(normalizedScore);

  const weaknesses = categories.filter(c => c.status === "fair" || c.status === "poor");

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
      <Sidebar active="/score" />
      <main className="flex-1 mr-64">
        <div className="max-w-7xl mx-auto px-8 py-8 page-enter">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">💯 ציון בריאות פיננסית</h1>
            <p className="text-slate-500">מדד מקיף של המצב הפיננסי שלך עם המלצות לשיפור</p>
          </div>

          {/* SECTION 1 — Main Score Card */}
          <div className="card-subtle p-8 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Score circle */}
              <div className="relative w-48 h-48 flex-shrink-0">
                <svg className="w-48 h-48 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    stroke={normalizedScore >= 85 ? "#10b981" : normalizedScore >= 70 ? "#3b82f6" : normalizedScore >= 55 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${normalizedScore * 2.64} 264`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold text-slate-900">{normalizedScore}</span>
                  <span className="text-sm text-slate-400">מתוך 100</span>
                </div>
              </div>

              <div className="flex-1 text-center md:text-right">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <span className="text-2xl">{status.emoji}</span>
                  <h2 className={`text-2xl font-bold ${status.color}`}>{status.label}</h2>
                </div>
                <p className="text-slate-500 mb-4">הציון שלך גבוה מ-78% מהמשתמשים בישראל</p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">חיסכון מעולה</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">תקציב מדויק</span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">חוב גבוה</span>
                </div>
              </div>

              {/* Score trend mini chart */}
              <div className="w-40">
                <p className="text-xs text-slate-400 mb-2 text-center">מגמה (6 חודשים)</p>
                <div className="h-20 flex items-end justify-between gap-1">
                  {MOCK_HISTORY.map((h) => (
                    <div key={h.month} className="flex-1 flex flex-col items-center gap-0.5">
                      <div
                        className="w-full rounded-t bg-gradient-to-t from-amber-500 to-amber-300"
                        style={{ height: `${(h.score - 60) * 3}%` }}
                      />
                      <span className="text-[7px] text-slate-400">{h.month.slice(0, 3)}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-emerald-500 text-center mt-1">↑ +12 נקודות השנה</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* SECTION 2 — Score Breakdown */}
            <div className="lg:col-span-2">
              <div className="card-subtle p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-5">פירוט ציון</h2>
                <div className="space-y-4">
                  {categories.map((cat) => (
                    <div key={cat.id} className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xl">{cat.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm text-slate-900">{cat.name}</p>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getStatusColor(cat.status)}`}>
                                {getStatusLabel(cat.status)}
                              </span>
                              <span className="text-sm font-bold text-slate-900">{cat.score}/{cat.maxScore}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mr-9">
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              cat.status === "excellent" ? "bg-emerald-400" :
                              cat.status === "good" ? "bg-blue-400" :
                              cat.status === "fair" ? "bg-amber-400" : "bg-red-400"
                            }`}
                            style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500">{cat.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 4 & 5 — Weaknesses + Recommendations */}
            <div className="space-y-6">
              {/* Weaknesses */}
              {weaknesses.length > 0 && (
                <div className="card-subtle p-5 border-2 border-amber-100">
                  <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <span>⚠️</span> נקודות לשיפור
                  </h3>
                  <div className="space-y-3">
                    {weaknesses.map((w) => (
                      <div key={w.id} className="p-3 rounded-lg bg-amber-50">
                        <p className="font-medium text-sm text-amber-800 mb-1">{w.icon} {w.name}</p>
                        <p className="text-xs text-amber-700">{w.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Improvement recommendations */}
              <div className="card-subtle p-5">
                <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span>💡</span> המלצות לשיפור
                </h3>
                <div className="space-y-3">
                  {categories.filter(c => c.status !== "excellent").map((cat) => (
                    <div key={cat.id} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs font-medium text-slate-700">{cat.icon} {cat.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{cat.recommendation}</p>
                    </div>
                  ))}
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-medium text-emerald-800">🎯 פוטנציאל שיפור</p>
                    <p className="text-xs text-emerald-700 mt-1">יישום כל ההמלצות יעלה את הציון ל-~92 תוך 6 חודשים</p>
                  </div>
                </div>
              </div>

              {/* SECTION 3 — Historical */}
              <div className="card-subtle p-5">
                <h3 className="font-bold text-slate-900 mb-3">היסטוריית ציון</h3>
                <div className="space-y-2">
                  {MOCK_HISTORY.map((h, i) => (
                    <div key={h.month} className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 w-14">{h.month}</span>
                      <div className="flex-1 h-5 bg-slate-50 rounded overflow-hidden">
                        <div
                          className={`h-full rounded transition-all ${h.score >= 80 ? "bg-emerald-300" : h.score >= 70 ? "bg-blue-300" : "bg-amber-300"}`}
                          style={{ width: `${h.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-700 w-8">{h.score}</span>
                      {i > 0 && (
                        <span className={`text-[10px] font-medium ${h.score > MOCK_HISTORY[i - 1].score ? "text-emerald-500" : "text-red-500"}`}>
                          {h.score > MOCK_HISTORY[i - 1].score ? `+${h.score - MOCK_HISTORY[i - 1].score}` : h.score - MOCK_HISTORY[i - 1].score}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 6 — AI Financial Coach */}
          <div className="card-subtle p-5 bg-gradient-to-l from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0"><span>🤖</span></div>
              <div>
                <p className="font-semibold text-sm text-slate-900 mb-2">מאמן פיננסי AI</p>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>📈 <strong>הציון שלך עלה ב-3 נקודות החודש</strong> — בזכות חיסכון עקבי ומשמעת תקציבית.</p>
                  <p>⚠️ <strong>יחס החוב</strong> הוא הגורם העיקרי שמונע ציון גבוה יותר. הקטנת חוב ב-{new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(2000)}/חודש תשפר את הציון ב-4 נקודות.</p>
                  <p>💡 <strong>צעד ראשון מומלץ:</strong> הגדל את קרן החירום — זה הצעד הקל ביותר עם ההשפעה הגדולה ביותר על הציון.</p>
                  <p>🎯 <strong>יעד ריאלי:</strong> הגעה ל-90 נקודות תוך 4 חודשים אם תיישם את 2 ההמלצות הראשונות.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
