import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)'}}>
              <span className="text-base font-bold text-slate-900">מ</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">מאזן</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors px-4 py-2">
              התחברות
            </Link>
            <Link href="/register" className="btn-primary text-sm">
              התחל בחינם
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center page-enter">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-semibold mb-8">
            <span>✨</span>
            מופעל על ידי בינה מלאכותית
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 mb-5 leading-tight">
            שר האוצר<br />
            <span style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>
              האישי שלך
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            מאזן הופך את כל הנתונים הפיננסיים שלך לתובנות פשוטות, המלצות אישיות ותכנון אוטומטי — הכל בעברית, 24/7.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/register" className="btn-gold px-8 py-3.5 text-base">
              התחל בחינם ←
            </Link>
            <Link href="/login" className="rounded-xl border-2 border-slate-200 bg-white px-8 py-3.5 text-base font-semibold text-slate-700 hover:border-slate-300 hover:shadow-sm transition-all duration-200">
              התחברות
            </Link>
          </div>

          {/* Trust bar */}
          <div className="mt-14 flex items-center justify-center gap-8 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">🔒 אבטחה מתקדמת</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="flex items-center gap-1.5">🏦 תמיכה בכל הבנקים</span>
            <span className="w-1 h-1 rounded-full bg-slate-200" />
            <span className="flex items-center gap-1.5">🇮🇱 עברית מלאה</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">הכל מה שצריך במקום אחד</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              פלטפורמה פיננסית שלמה שמביאה לך שקט נפשי ושליטה מלאה בכסף שלך.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon="✨"
              title="יועץ AI אישי"
              description="שאל כל שאלה בעברית על הכסף שלך וקבל תשובות חכמות מיידיות"
              accent="bg-slate-900"
            />
            <FeatureCard
              icon="📊"
              title="ציון בריאות פיננסית"
              description="דע בדיוק איפה אתה עומד עם ציון 0-100 והמלצות לשיפור"
              accent="bg-emerald-500"
            />
            <FeatureCard
              icon="🎯"
              title="ניהול יעדים"
              description="חתונה, דירה, כרית ביטחון – תכנן והגשם עם ליווי AI"
              accent="bg-amber-500"
            />
            <FeatureCard
              icon="👫"
              title="מצב זוגי"
              description="ניהול כספים משותף בלי ריבים – שקיפות חכמה לשניכם"
              accent="bg-blue-500"
            />
            <FeatureCard
              icon="📈"
              title="מעקב השקעות ופנסיה"
              description="כל הכסף שלך במקום אחד – פנסיה, קרן השתלמות, השקעות"
              accent="bg-purple-500"
            />
            <FeatureCard
              icon="🔮"
              title="סימולטור תרחישים"
              description="מה יקרה אם...? בדוק כל החלטה פיננסית לפני שתעשה אותה"
              accent="bg-rose-500"
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{background: 'radial-gradient(circle at 30% 50%, #d4a853 0%, transparent 60%)'}} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">מוכן להשתלט על הכספים שלך?</h2>
              <p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto">
                הצטרף לאלפי משפחות ישראליות שכבר מנהלות את הכסף שלהן בצורה חכמה יותר.
              </p>
              <Link href="/register" className="btn-gold px-8 py-3.5 text-base inline-block">
                פתח חשבון חינם ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #d4a853 0%, #c49b48 100%)'}}>
              <span className="text-[10px] font-bold text-slate-900">מ</span>
            </div>
            <span>© 2026 מאזן. כל הזכויות שמורות.</span>
          </div>
          <div className="flex gap-6">
            <span>תנאי שימוש</span>
            <span>מדיניות פרטיות</span>
            <span>נגישות</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  accent,
}: {
  icon: string;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div className="card-subtle p-6 hover:shadow-md transition-all duration-200 group">
      <div className={`w-11 h-11 rounded-xl ${accent} flex items-center justify-center text-xl mb-4 group-hover:scale-105 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}
