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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">טוען...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">מאזן</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {user?.first_name} {user?.last_name}
            </span>
            <button
              onClick={handleLogout}
              className="rounded-lg border px-4 py-2 text-sm hover:bg-muted transition-colors"
            >
              התנתקות
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            שלום, {user?.first_name} 👋
          </h2>
          <p className="text-muted-foreground">
            ברוך הבא למאזן – מערכת ההפעלה הפיננסית שלך
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <StatCard
            title="יתרה כוללת"
            value={formatCurrency(totalBalance)}
            color={totalBalance >= 0 ? "text-green-600" : "text-red-500"}
          />
          <StatCard
            title="הכנסות החודש"
            value={formatCurrency(monthlyIncome)}
            color="text-green-600"
          />
          <StatCard
            title="הוצאות החודש"
            value={formatCurrency(monthlyExpenses)}
            color="text-red-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setActiveModal("account")}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
          >
            + הוסף חשבון
          </button>
          <button
            onClick={() => setActiveModal("transaction")}
            disabled={accounts.length === 0}
            className="rounded-lg border-2 border-primary px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + הוסף תנועה
          </button>
        </div>

        {/* Accounts */}
        {accounts.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">החשבונות שלי</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="rounded-xl border bg-card p-5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-medium">{account.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {accountTypeLabel(account.type)}
                        {account.institution && ` · ${account.institution}`}
                      </p>
                    </div>
                    <span className="text-xs bg-muted px-2 py-1 rounded">
                      {account.currency}
                    </span>
                  </div>
                  <p
                    className={`text-xl font-bold ${Number(account.current_balance) >= 0 ? "text-green-600" : "text-red-500"}`}
                  >
                    {formatCurrency(Number(account.current_balance))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transactions */}
        {transactions.length > 0 ? (
          <div>
            <h3 className="text-lg font-semibold mb-3">תנועות אחרונות</h3>
            <div className="rounded-xl border bg-card overflow-hidden">
              {transactions.slice(0, 20).map((tx) => {
                const cat = categories.find((c) => c.id === tx.category_id);
                const account = accounts.find((a) => a.id === tx.account_id);
                return (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between px-5 py-3 border-b last:border-b-0 hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat?.icon || "📋"}</span>
                      <div>
                        <p className="font-medium text-sm">
                          {tx.description || tx.merchant_name || cat?.name_he || "ללא תיאור"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {account?.name} · {tx.date}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${tx.type === "income" ? "text-green-600" : "text-red-500"}`}
                    >
                      {tx.type === "income" ? "+" : "-"}
                      {formatCurrency(Number(tx.amount))}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border bg-card p-8 text-center">
            <p className="text-4xl mb-3">📝</p>
            <h3 className="text-lg font-semibold mb-1">אין עדיין תנועות</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {accounts.length === 0
                ? "הוסף חשבון כדי להתחיל להזין תנועות"
                : "הוסף את התנועה הראשונה שלך"}
            </p>
          </div>
        )}
      </main>

      {/* Modals */}
      {activeModal === "account" && (
        <AccountModal
          onClose={() => setActiveModal("none")}
          onCreated={() => {
            setActiveModal("none");
            loadData();
          }}
        />
      )}
      {activeModal === "transaction" && (
        <TransactionModal
          accounts={accounts}
          categories={categories}
          onClose={() => setActiveModal("none")}
          onCreated={() => {
            setActiveModal("none");
            loadData();
          }}
        />
      )}
    </div>
  );
}

// --- Modals ---

function AccountModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    type: "checking",
    institution: "",
    current_balance: "",
  });
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
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          institution: form.institution || null,
          current_balance: parseFloat(form.current_balance) || 0,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "שגיאה");
        return;
      }
      onCreated();
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} title="הוסף חשבון">
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="שם החשבון">
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="למשל: עו״ש לאומי"
            className="input-field"
          />
        </FormField>
        <FormField label="סוג חשבון">
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="input-field"
          >
            <option value="checking">עו״ש</option>
            <option value="savings">חיסכון</option>
            <option value="credit_card">כרטיס אשראי</option>
            <option value="cash">מזומן</option>
            <option value="investment">השקעות</option>
            <option value="loan">הלוואה</option>
          </select>
        </FormField>
        <FormField label="מוסד פיננסי (אופציונלי)">
          <input
            value={form.institution}
            onChange={(e) => setForm({ ...form, institution: e.target.value })}
            placeholder="למשל: בנק לאומי"
            className="input-field"
          />
        </FormField>
        <FormField label="יתרה נוכחית">
          <input
            type="number"
            step="0.01"
            value={form.current_balance}
            onChange={(e) =>
              setForm({ ...form, current_balance: e.target.value })
            }
            placeholder="0.00"
            className="input-field"
            dir="ltr"
          />
        </FormField>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "שומר..." : "הוסף חשבון"}
        </button>
      </form>
    </ModalWrapper>
  );
}

function TransactionModal({
  accounts,
  categories,
  onClose,
  onCreated,
}: {
  accounts: Account[];
  categories: Category[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState({
    account_id: accounts[0]?.id || "",
    type: "expense",
    category_id: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    description: "",
    merchant_name: "",
    notes: "",
  });
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
        body: JSON.stringify({
          account_id: form.account_id,
          category_id: form.category_id || null,
          type: form.type,
          amount: parseFloat(form.amount),
          date: form.date,
          description: form.description || null,
          merchant_name: form.merchant_name || null,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "שגיאה");
        return;
      }
      onCreated();
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper onClose={onClose} title="הוסף תנועה">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="flex gap-2">
          {(["expense", "income", "transfer"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setForm({ ...form, type: t, category_id: "" })}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-colors ${
                form.type === t
                  ? t === "income"
                    ? "bg-green-100 text-green-700 border-2 border-green-400"
                    : t === "expense"
                      ? "bg-red-100 text-red-700 border-2 border-red-400"
                      : "bg-blue-100 text-blue-700 border-2 border-blue-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {t === "expense" ? "הוצאה" : t === "income" ? "הכנסה" : "העברה"}
            </button>
          ))}
        </div>

        <FormField label="חשבון">
          <select
            required
            value={form.account_id}
            onChange={(e) => setForm({ ...form, account_id: e.target.value })}
            className="input-field"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="סכום">
            <input
              required
              type="number"
              step="0.01"
              min="0.01"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0.00"
              className="input-field"
              dir="ltr"
            />
          </FormField>
          <FormField label="תאריך">
            <input
              required
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="input-field"
              dir="ltr"
            />
          </FormField>
        </div>

        <FormField label="קטגוריה">
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="input-field"
          >
            <option value="">בחר קטגוריה</option>
            {filteredCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name_he}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="תיאור">
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="למשל: קניות בסופר"
            className="input-field"
          />
        </FormField>

        <FormField label="בית עסק (אופציונלי)">
          <input
            value={form.merchant_name}
            onChange={(e) =>
              setForm({ ...form, merchant_name: e.target.value })
            }
            placeholder="למשל: שופרסל"
            className="input-field"
          />
        </FormField>

        <FormField label="הערות (אופציונלי)">
          <input
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="input-field"
          />
        </FormField>

        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "שומר..." : "הוסף תנועה"}
        </button>
      </form>
    </ModalWrapper>
  );
}

// --- Shared Components ---

function ModalWrapper({
  onClose,
  title,
  children,
}: {
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm text-muted-foreground mb-1">{title}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
  }).format(amount);
}

function accountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    checking: "עו״ש",
    savings: "חיסכון",
    credit_card: "כרטיס אשראי",
    cash: "מזומן",
    investment: "השקעות",
    loan: "הלוואה",
  };
  return labels[type] || type;
}
