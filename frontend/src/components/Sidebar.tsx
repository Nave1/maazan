"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export function Sidebar({ active, user: userProp }: { active: string; user?: User | null }) {
  const [user, setUser] = useState<User | null>(userProp || null);
  const router = useRouter();

  useEffect(() => {
    if (userProp) {
      setUser(userProp);
      return;
    }
    const token = localStorage.getItem("access_token");
    if (token) {
      fetch("http://localhost:8000/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => setUser(data))
        .catch(() => {});
    }
  }, [userProp]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/login");
  };

  return (
    <aside className="glass-sidebar w-64 flex flex-col fixed inset-y-0 right-0 z-40">
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg, #d4a853 0%, #c49b48 100%)" }}
          >
            <span className="text-lg font-bold text-slate-900">מ</span>
          </div>
          <div>
            <div className="font-bold text-white text-lg">מאזן</div>
            <div className="text-[11px] text-slate-500 tracking-wide">FINANCIAL OS</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <NavItem href="/dashboard" icon="📊" label="דשבורד" active={active === "/dashboard"} />
        <NavItem href="/upload" icon="📁" label="העלאת מסמכים" active={active === "/upload"} />
        <NavItem href="/chat" icon="✨" label="יועץ AI" active={active === "/chat"} />
        <NavItem href="/timeline" icon="📅" label="ציר זמן פיננסי" active={active === "/timeline"} />
        <NavItem href="/couple" icon="💑" label="מצב זוגי" active={active === "/couple"} />
        <NavItem href="/reports" icon="📑" label="דוחות" active={active === "/reports"} />
        <NavItem href="/simulator" icon="🔮" label="סימולטור מה-אם" active={active === "/simulator"} />
        <NavItem href="/mortgage" icon="🏠" label="מעקב משכנתא" active={active === "/mortgage"} />
        <NavItem href="/pension" icon="🏛️" label="מעקב פנסיה" active={active === "/pension"} />
        <NavItem href="/score" icon="💯" label="ציון בריאות פיננסית" active={active === "/score"} />
      </nav>

      <div className="px-4 py-4 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-sm font-bold text-slate-900">
            {user?.first_name?.charAt(0) || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">
              {user ? `${user.first_name} ${user.last_name}` : "..."}
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
  );
}

function NavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active?: boolean }) {
  return (
    <a
      href={href}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        active ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </a>
  );
}
