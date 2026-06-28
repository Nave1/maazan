"use client";

import { useEffect, useState } from "react";

const API = "http://localhost:8000/api/v1";

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface Account {
  id: string;
  name: string;
  type: string;
  institution: string | null;
  currency: string;
  current_balance: number;
}

interface Category {
  id: string;
  name_he: string;
  name_en: string;
  icon: string | null;
  type: string;
}

interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  type: string;
  amount: number;
  currency: string;
  date: string;
  description: string | null;
  merchant_name: string | null;
  notes: string | null;
  source: string;
}

function getToken() {
  return localStorage.getItem("access_token") || "";
}

function authHeaders() {
  return {
    Authorization: `Bearer ${getToken()}`,
    "Content-Type": "application/json",
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<
    "none" | "account" | "transaction"
  >("none");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/login";
      return;
    }
    loadData();
  }, []);

  async function loadData() {
    try {
      const [userRes, accountsRes, categoriesRes, transactionsRes] =
        await Promise.all([
          fetch(`${API}/auth/me`, { headers: authHeaders() }),
          fetch(`${API}/finance/accounts`, { headers: authHeaders() }),
          fetch(`${API}/finance/categories`, { headers: authHeaders() }),
          fetch(`${API}/finance/transactions`, { headers: authHeaders() }),
        ]);

      if (!userRes.ok) throw new Error("Unauthorized");

      setUser(await userRes.json());
      setAccounts(await accountsRes.json());
      setCategories(await categoriesRes.json());
      setTransactions(await transactionsRes.json());
    } catch {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      window.location.href = "/login";
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  const totalBalance = accounts.reduce(
    (sum, a) => sum + Number(a.current_balance),
    0
  );
  const monthlyIncome = transactions
    .filter(
      (t) =>
        t.type === "income" &&
        t.date.startsWith(new Date().toISOString().slice(0, 7))
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.date.startsWith(new Date().toISOString().slice(0, 7))
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const savingsRate = monthlyIncome > 0
    ? Math.round(((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
    : 0;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
            <span className="text-lg font-bold text-amber-400">מ</span>
          </div>
          <div className="w-8 h-8 mx-auto border-2 border-slate-200 border-t-amber-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50" dir="rtl">
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
          <NavItem href="/dashboard" icon="📊" label="דשבורד" active />
          <NavItem href="/bank" icon="🏦" label="בנקים וכרטיסים" />
          <NavItem href="/chat" icon="✨" label="יועץ AI" />
        </nav>

        <div className="px-4 py-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-slate-900">
              {user?.first_name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 w-full text-xs text-slate-500 hover:text-slate-300 transition-colors text-right"
          >
            התנתקות ←
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 mr-64">
        <div className="max-w-6xl mx-auto px-8 py-8 page-enter">
          {/* Greeting */}
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-1">
              שלום, {user?.first_name}
            </h1>
            <p className="text-slate-500">
              {new Date().toLocaleDateString("he-IL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">יתרה כוללת</span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-base">💰</span>
              </div>
              <p className={`text-2xl font-bold ${totalBalance >= 0 ? "text-slate-900" : "text-red-500"}`}>
                {formatCurrency(totalBalance)}
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">הכנסות החודש</span>
                <span className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-base">📈</span>
              </div>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(monthlyIncome)}
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">הוצאות החודש</span>
                <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-base">📉</span>
              </div>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(monthlyExpenses)}
              </p>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">אחוז חיסכון</span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-base">🎯</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">
                {savingsRate}%
              </p>
              <div className="mt-2 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${Math.min(Math.max(savingsRate, 0), 100)}%`,
                    background: savingsRate >= 20 ? '#10b981' : savingsRate >= 10 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-3 mb-10">
            <button
              onClick={() => setActiveModal("account")}
              className="btn-primary flex items-center gap-2"
            >
              <span className="text-base">+</span>
              הוסף חשבון
            </button>
            <button
              onClick={() => setActiveModal("transaction")}
              disabled={accounts.length === 0}
              className="rounded-xl border-2 border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <span className="text-base">+</span>
              הוסף תנועה
            </button>
          </div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Accounts */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">חשבונות</h2>
                <span className="text-xs text-slate-400">{accounts.length} חשבונות</span>
              </div>
              {accounts.length > 0 ? (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div key={account.id} className="card-subtle p-4 hover:shadow-md transition-all duration-200">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{account.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {accountTypeLabel(account.type)}
                            {account.institution && ` · ${account.institution}`}
                          </p>
                        </div>
                        <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                          {account.currency}
                        </span>
                      </div>
                      <p className={`text-xl font-bold ${Number(account.current_balance) >= 0 ? "text-slate-900" : "text-red-500"}`}>
                        {formatCurrency(Number(account.current_balance))}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card-subtle p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-xl">🏦</span>
                  </div>
                  <p className="text-sm text-slate-500">הוסף את החשבון הראשון שלך</p>
                </div>
              )}
            </div>

            {/* Transactions */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-900">תנועות אחרונות</h2>
                {transactions.length > 0 && (
                  <span className="text-xs text-slate-400">{transactions.length} תנועות</span>
                )}
              </div>
              {transactions.length > 0 ? (
                <div className="card-subtle overflow-hidden">
                  {transactions.slice(0, 15).map((tx, i) => {
                    const cat = categories.find((c) => c.id === tx.category_id);
                    const account = accounts.find((a) => a.id === tx.account_id);
                    return (
                      <div
                        key={tx.id}
                        className={`flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/80 transition-colors ${
                          i < Math.min(transactions.length, 15) - 1 ? "border-b border-slate-100" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm ${
                            tx.type === "income" ? "bg-emerald-50" : "bg-red-50"
                          }`}>
                            {cat?.icon || (tx.type === "income" ? "📈" : "📉")}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-slate-900">
                              {tx.description || tx.merchant_name || cat?.name_he || "ללא תיאור"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              {account?.name} · {new Date(tx.date).toLocaleDateString("he-IL")}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`font-bold text-sm tabular-nums ${
                            tx.type === "income" ? "text-emerald-600" : "text-red-500"
                          }`}
                          dir="ltr"
                        >
                          {tx.type === "income" ? "+" : "−"}
                          {formatCurrency(Number(tx.amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="card-subtle p-10 text-center">
                  <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">אין עדיין תנועות</h3>
                  <p className="text-sm text-slate-500">
                    {accounts.length === 0
                      ? "הוסף חשבון כדי להתחיל"
                      : "הוסף את התנועה הראשונה שלך"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {activeModal === "account" && (
        <AccountModal
          onClose={() => setActiveModal("none")}
          onCreated={() => { setActiveModal("none"); loadData(); }}
        />
      )}
      {activeModal === "transaction" && (
        <TransactionModal
          accounts={accounts}
          categories={categories}
          onClose={() => setActiveModal("none")}
          onCreated={() => { setActiveModal("none"); loadData(); }}
        />
      )}
    </div>
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </a>
  );
}

// --- Modals ---

function AccountModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ name: "", type: "checking", institution: "", current_balance: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/finance/accounts`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: form.name, type: form.type, institution: form.institution || null, current_balance: parseFloat(form.current_balance) || 0 }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.detail || "שגיאה"); return; }
      onCreated();
    } catch { setError("שגיאה בחיבור לשרת"); } finally { setLoading(false); }
  };

  return (
    <ModalWrapper onClose={onClose} title="הוסף חשבון">
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="שם החשבון">
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="למשל: עו״ש לאומי" className="input-field" />
        </FormField>
        <FormField label="סוג חשבון">
          <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
            <option value="checking">עו״ש</option>
            <option value="savings">חיסכון</option>
            <option value="credit_card">כרטיס אשראי</option>
            <option value="cash">מזומן</option>
            <option value="investment">השקעות</option>
            <option value="loan">הלוואה</option>
          </select>
        </FormField>
        <FormField label="מוסד פיננסי (אופציונלי)">
          <input value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} placeholder="למשל: בנק לאומי" className="input-field" />
        </FormField>
        <FormField label="יתרה נוכחית">
          <input type="number" step="0.01" value={form.current_balance} onChange={(e) => setForm({ ...form, current_balance: e.target.value })} placeholder="0.00" className="input-field" dir="ltr" />
        </FormField>
        {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? "שומר..." : "הוסף חשבון"}</button>
      </form>
    </ModalWrapper>
  );
}

function TransactionModal({ accounts, categories, onClose, onCreated }: { accounts: Account[]; categories: Category[]; onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState({ account_id: accounts[0]?.id || "", type: "expense", category_id: "", amount: "", date: new Date().toISOString().split("T")[0], description: "", merchant_name: "", notes: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const filteredCategories = categories.filter((c) => c.type === form.type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API}/finance/transactions`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ account_id: form.account_id, category_id: form.category_id || null, type: form.type, amount: parseFloat(form.amount), date: form.date, description: form.description || null, merchant_name: form.merchant_name || null, notes: form.notes || null }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.detail || "שגיאה"); return; }
      onCreated();
    } catch { setError("שגיאה בחיבור לשרת"); } finally { setLoading(false); }
  };

  return (
    <ModalWrapper onClose={onClose} title="הוסף תנועה">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
          {(["expense", "income", "transfer"] as const).map((t) => (
            <button key={t} type="button" onClick={() => setForm({ ...form, type: t, category_id: "" })}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 ${form.type === t ? (t === "income" ? "bg-emerald-500 text-white shadow-sm" : t === "expense" ? "bg-red-500 text-white shadow-sm" : "bg-blue-500 text-white shadow-sm") : "text-slate-500 hover:text-slate-700"}`}>
              {t === "expense" ? "הוצאה" : t === "income" ? "הכנסה" : "העברה"}
            </button>
          ))}
        </div>
        <FormField label="חשבון">
          <select required value={form.account_id} onChange={(e) => setForm({ ...form, account_id: e.target.value })} className="input-field">
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="סכום">
            <input required type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" className="input-field" dir="ltr" />
          </FormField>
          <FormField label="תאריך">
            <input required type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" dir="ltr" />
          </FormField>
        </div>
        <FormField label="קטגוריה">
          <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-field">
            <option value="">בחר קטגוריה</option>
            {filteredCategories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name_he}</option>)}
          </select>
        </FormField>
        <FormField label="תיאור">
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="למשל: קניות בסופר" className="input-field" />
        </FormField>
        <FormField label="בית עסק (אופציונלי)">
          <input value={form.merchant_name} onChange={(e) => setForm({ ...form, merchant_name: e.target.value })} placeholder="למשל: שופרסל" className="input-field" />
        </FormField>
        <FormField label="הערות (אופציונלי)">
          <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" />
        </FormField>
        {error && <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? "שומר..." : "הוסף תנועה"}</button>
      </form>
    </ModalWrapper>
  );
}

function ModalWrapper({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-2xl mx-4 max-h-[90vh] overflow-y-auto page-enter">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS" }).format(amount);
}

function accountTypeLabel(type: string): string {
  const labels: Record<string, string> = { checking: "עו״ש", savings: "חיסכון", credit_card: "כרטיס אשראי", cash: "מזומן", investment: "השקעות", loan: "הלוואה" };
  return labels[type] || type;
}
