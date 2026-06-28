import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-primary mb-4">מאזן</h1>
        <p className="text-xl text-muted-foreground mb-2">
          מערכת ההפעלה הפיננסית שלך
        </p>
        <p className="text-lg text-muted-foreground mb-8">
          AI שמנהל את הכספים שלך – כמו שר אוצר אישי, 24/7
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            href="/register"
            className="rounded-lg bg-primary px-8 py-3 text-lg font-semibold text-white hover:bg-primary-light transition-colors"
          >
            התחל בחינם
          </Link>
          <Link
            href="/login"
            className="rounded-lg border-2 border-primary px-8 py-3 text-lg font-semibold text-primary hover:bg-primary-pale transition-colors"
          >
            התחברות
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-5xl">
        <FeatureCard
          icon="🤖"
          title="AI שר אוצר"
          description="שאל כל שאלה בעברית על הכסף שלך וקבל תשובות חכמות מיידיות"
        />
        <FeatureCard
          icon="📊"
          title="ציון בריאות פיננסית"
          description="דע בדיוק איפה אתה עומד עם ציון 0-100 והמלצות לשיפור"
        />
        <FeatureCard
          icon="🎯"
          title="ניהול יעדים"
          description="חתונה, דירה, כרית ביטחון – תכנן והגשם עם ליווי AI"
        />
        <FeatureCard
          icon="👫"
          title="מצב זוגי"
          description="ניהול כספים משותף בלי ריבים – שקיפות חכמה"
        />
        <FeatureCard
          icon="📈"
          title="מעקב השקעות ופנסיה"
          description="כל הכסף שלך במקום אחד – פנסיה, קרן השתלמות, השקעות"
        />
        <FeatureCard
          icon="🔮"
          title="סימולטור תרחישים"
          description="מה יקרה אם...? בדוק כל החלטה פיננסית לפני שתעשה אותה"
        />
      </div>

      {/* Footer */}
      <footer className="mt-16 text-sm text-muted-foreground">
        © 2026 מאזן. כל הזכויות שמורות.
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 hover:shadow-md transition-shadow">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
