"use client";

import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.detail || "שגיאה בהתחברות");
        return;
      }

      const data = await res.json();
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      window.location.href = "/dashboard";
    } catch {
      setError("שגיאה בחיבור לשרת");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 glass-sidebar items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="text-center z-10 px-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-8" style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)'}}>
            <span className="text-3xl font-bold text-slate-900">מ</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">מאזן</h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            מערכת ההפעלה הפיננסית שלך.
            <br />
            ניהול חכם של הכספים עם בינה מלאכותית.
          </p>
          <div className="mt-12 flex items-center justify-center gap-8 text-slate-500 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">AI</div>
              <div>יועץ פיננסי</div>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">🏦</div>
              <div>חיבור בנקים</div>
            </div>
            <div className="w-px h-10 bg-slate-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-400">📊</div>
              <div>תובנות חכמות</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl mb-4" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
              <span className="text-xl font-bold text-amber-400">מ</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">מאזן</h1>
          </div>

          <div className="card-subtle p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-1">ברוך הבא</h1>
              <p className="text-slate-500">התחבר לחשבון שלך</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  אימייל
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field"
                  dir="ltr"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1.5">
                  סיסמה
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  dir="ltr"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3"
              >
                {loading ? "מתחבר..." : "התחברות"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-slate-500">
              אין לך חשבון?{" "}
              <Link href="/register" className="text-amber-600 font-semibold hover:text-amber-700 transition-colors">
                הרשמה
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
