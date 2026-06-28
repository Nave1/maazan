"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "http://localhost:8000/api/v1";

interface Bank { code: string; name: string; name_en: string; icon: string; }
interface Connection { id: string; bank_name: string; bank_code: string; account_id: string | null; status: string; last_sync_at: string | null; created_at: string; }
interface AccountOption { id: string; name: string; type: string; institution: string | null; }
interface ImportResult { import_batch_id: string; status: string; total_rows: number; imported_rows: number; failed_rows: number; message: string; errors: { row: number; error: string }[]; }

export default function BankPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [banks, setBanks] = useState<Bank[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConnect, setShowConnect] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedAccount, setSelectedAccount] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);

  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  useEffect(() => {
    if (!token) { router.push("/login"); return; }
    loadData();
  }, []);

  async function loadData() {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [banksRes, connsRes, accsRes] = await Promise.all([
        fetch(`${API}/bank/banks`),
        fetch(`${API}/bank/connections`, { headers }),
        fetch(`${API}/finance/accounts`, { headers }),
      ]);
      setBanks(await banksRes.json());
      setConnections(await connsRes.json());
      const accsData = await accsRes.json();
      setAccounts(Array.isArray(accsData) ? accsData : []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }

  async function connectBank() {
    if (!selectedBank) return;
    try {
      const res = await fetch(`${API}/bank/connect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ bank_code: selectedBank, account_id: selectedAccount || null }),
      });
      if (res.ok) { setShowConnect(false); setSelectedBank(""); setSelectedAccount(""); loadData(); }
    } catch (err) { console.error(err); }
  }

  async function handleImport(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAccount || !fileInputRef.current?.files?.[0]) return;
    setImporting(true);
    setImportResult(null);
    const formData = new FormData();
    formData.append("file", fileInputRef.current.files[0]);
    formData.append("account_id", selectedAccount);
    formData.append("source", "csv");
    try {
      const res = await fetch(`${API}/bank/import`, { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      setImportResult(await res.json());
    } catch (err) { console.error(err); } finally { setImporting(false); }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div dir="rtl" className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="glass-sidebar w-64 flex flex-col fixed inset-y-0 right-0 z-40">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)'}}>
              <span className="text-lg font-bold text-slate-900">מ</span>
            </div>
            <div>
              <div className="font-bold text-white text-lg">מאזן</div>
              <div className="text-[11px] text-slate-500 tracking-wide">FINANCIAL OS</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span>📊</span> דשבורד
          </a>
          <a href="/bank" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium bg-white/10 text-white transition-all">
            <span>🏦</span> בנקים וכרטיסים
          </a>
          <a href="/chat" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <span>✨</span> יועץ AI
          </a>
        </nav>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-64">
        <div className="max-w-5xl mx-auto px-8 py-8 page-enter">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">בנקים וכרטיסי אשראי</h1>
            <p className="text-slate-500">חבר חשבונות וייבא תנועות</p>
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            <button
              onClick={() => { setShowConnect(true); setShowImport(false); }}
              className="card-subtle p-6 text-right hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <span className="text-xl">🏦</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">חבר בנק או כרטיס</h3>
              <p className="text-sm text-slate-500">חבר חשבון בנק או חברת אשראי ישראלית</p>
            </button>
            <button
              onClick={() => { setShowImport(true); setShowConnect(false); }}
              className="card-subtle p-6 text-right hover:shadow-md transition-all duration-200 group"
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform" style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)'}}>
                <span className="text-xl">📄</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">ייבוא מקובץ</h3>
              <p className="text-sm text-slate-500">ייבא תנועות מקובץ CSV של דף חשבון</p>
            </button>
          </div>

          {/* Connect Bank Panel */}
          {showConnect && (
            <div className="card-subtle p-7 mb-10 page-enter">
              <h2 className="text-xl font-bold text-slate-900 mb-6">בחר בנק או חברת אשראי</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                {banks.map((bank) => (
                  <button
                    key={bank.code}
                    onClick={() => setSelectedBank(bank.code)}
                    className={`p-4 rounded-xl text-center transition-all duration-200 ${
                      selectedBank === bank.code
                        ? "bg-slate-900 text-white shadow-lg scale-[1.02]"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                    }`}
                  >
                    <div className="text-2xl mb-2">{bank.icon}</div>
                    <div className="text-xs font-medium leading-tight">{bank.name}</div>
                  </button>
                ))}
              </div>

              {accounts.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">שייך לחשבון (אופציונלי)</label>
                  <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="input-field max-w-md">
                    <option value="">ללא שיוך</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} {a.institution ? `(${a.institution})` : ""}</option>)}
                  </select>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={connectBank} disabled={!selectedBank} className="btn-primary disabled:opacity-40">חבר</button>
                <button onClick={() => { setShowConnect(false); setSelectedBank(""); }} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">ביטול</button>
              </div>
            </div>
          )}

          {/* Import Panel */}
          {showImport && (
            <div className="card-subtle p-7 mb-10 page-enter">
              <h2 className="text-xl font-bold text-slate-900 mb-6">ייבוא תנועות מקובץ CSV</h2>
              <form onSubmit={handleImport} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">חשבון יעד</label>
                  <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)} className="input-field max-w-md" required>
                    <option value="">בחר חשבון...</option>
                    {accounts.map((a) => <option key={a.id} value={a.id}>{a.name} {a.institution ? `(${a.institution})` : ""}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">קובץ CSV</label>
                  <input ref={fileInputRef} type="file" accept=".csv" className="input-field max-w-md" required />
                  <p className="text-xs text-slate-400 mt-1.5">נתמכים: הפועלים, לאומי, דיסקונט, מזרחי, ישראכרט, כאל, מקס</p>
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={importing} className="btn-gold disabled:opacity-40">{importing ? "מייבא..." : "ייבא תנועות"}</button>
                  <button type="button" onClick={() => { setShowImport(false); setImportResult(null); }} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">ביטול</button>
                </div>
              </form>

              {importResult && (
                <div className={`mt-6 p-5 rounded-xl ${
                  importResult.status === "completed" ? "bg-emerald-50 border border-emerald-200" :
                  importResult.status === "partial" ? "bg-amber-50 border border-amber-200" :
                  "bg-red-50 border border-red-200"
                }`}>
                  <p className="font-semibold text-slate-900">{importResult.message}</p>
                  <div className="mt-2 text-sm space-y-1 text-slate-600">
                    <p>סה&quot;כ: {importResult.total_rows} | יובאו: {importResult.imported_rows} {importResult.failed_rows > 0 && <span className="text-red-600">| נכשלו: {importResult.failed_rows}</span>}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Connected banks */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4">חשבונות מחוברים</h2>
            {connections.length === 0 ? (
              <div className="card-subtle p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <p className="font-semibold text-slate-900 mb-1">אין חשבונות מחוברים</p>
                <p className="text-sm text-slate-500">חבר בנק או כרטיס אשראי כדי להתחיל</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {connections.map((conn) => {
                  const bank = banks.find((b) => b.code === conn.bank_code);
                  return (
                    <div key={conn.id} className="card-subtle p-5 hover:shadow-md transition-all duration-200">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl">
                          {bank?.icon || "🏦"}
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{conn.bank_name}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            conn.status === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                          }`}>
                            {conn.status === "connected" ? "מחובר" : "ממתין"}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400">
                        חובר: {new Date(conn.created_at).toLocaleDateString("he-IL")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
