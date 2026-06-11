# מאזן – User Personas & Journeys

## User Personas

---

### Persona 1: נועם (Noam) – Young Professional

| Attribute | Detail |
|-----------|--------|
| Age | 26 |
| Status | Single, post-army, first "real" job |
| Income | ₪12,000/month |
| Pain Points | No idea where money goes, zero savings habit, overwhelmed by pension/Keren Hishtalmut choices |
| Goals | Build emergency fund, understand payslip deductions, save for travel |
| Tech Comfort | High – uses apps for everything |
| Trigger | Bank balance drops to zero before month end repeatedly |

**Quote:** "אני מרוויח סכום סביר אבל בסוף החודש אין לי כלום"
("I earn a decent amount but at month's end I have nothing")

---

### Persona 2: שירה ואיתי (Shira & Itay) – Engaged Couple

| Attribute | Detail |
|-----------|--------|
| Ages | 28, 30 |
| Status | Engaged, planning wedding |
| Combined Income | ₪28,000/month |
| Pain Points | Wedding costs unclear, merging finances is confusing, parents helping — need to track who contributed what |
| Goals | Plan wedding budget, start saving for apartment, align financial priorities |
| Tech Comfort | High |
| Trigger | Realized wedding will cost ₪120K+ and they have ₪40K saved |

**Quote:** "אנחנו לא יודעים איך לנהל כסף ביחד בלי לריב"
("We don't know how to manage money together without fighting")

---

### Persona 3: מיכל ודניאל (Michal & Daniel) – Young Family

| Attribute | Detail |
|-----------|--------|
| Ages | 33, 35 |
| Status | Married, 2 kids (ages 2, 5), apartment with mortgage |
| Combined Income | ₪38,000/month |
| Pain Points | Mortgage + daycare crushing cash flow, no visibility into long-term trajectory, pension contributions feel abstract |
| Goals | Survive monthly expenses, build education fund for kids, ensure mortgage on track |
| Tech Comfort | Medium-High |
| Trigger | Received annual mortgage summary and felt panic about total interest paid |

**Quote:** "אני לא יודעת אם אנחנו בסדר או שאנחנו הולכים לפשיטת רגל"
("I don't know if we're okay or heading for bankruptcy")

---

### Persona 4: עומר (Omer) – Self-Employed

| Attribute | Detail |
|-----------|--------|
| Age | 38 |
| Status | Freelance developer, married, 1 child |
| Income | ₪25,000-45,000/month (variable) |
| Pain Points | Irregular income makes budgeting impossible, tax planning is nightmare, no employer pension contributions |
| Goals | Stabilize finances despite variable income, maximize Keren Hishtalmut, plan quarterly tax payments |
| Tech Comfort | Very High |
| Trigger | Got hit with unexpected ₪30K tax bill from Mas Hachnasa |

**Quote:** "אני צריך לדעת כמה באמת נשאר לי אחרי מסים"
("I need to know how much I actually have left after taxes")

---

### Persona 5: רונית ויוסי (Ronit & Yossi) – Pre-Retirement

| Attribute | Detail |
|-----------|--------|
| Ages | 52, 55 |
| Status | Married, kids left home, mortgage nearly paid off |
| Combined Income | ₪55,000/month |
| Pain Points | Pension scattered across 3 funds from different employers, unclear if retirement savings are sufficient, want to help kids buy apartments |
| Goals | Consolidate retirement picture, plan for early retirement at 62, help children financially without compromising their own future |
| Tech Comfort | Medium |
| Trigger | Colleague retired early and they want to know if they can too |

**Quote:** "אנחנו לא יודעים אם הפנסיה שלנו תספיק"
("We don't know if our pension will be enough")

---

### Persona 6: תמר (Tamar) – First-Time Investor

| Attribute | Detail |
|-----------|--------|
| Age | 31 |
| Status | Single, software engineer |
| Income | ₪25,000/month |
| Pain Points | Has savings but doesn't know what to do with them, overwhelmed by investment options, fears making mistakes |
| Goals | Start investing wisely, understand risk, grow wealth beyond savings account |
| Tech Comfort | High |
| Trigger | Realized savings account earning 0.1% while inflation is 3.5% |

**Quote:** "אני יודעת שאני צריכה להשקיע אבל אני מפחדת לעשות טעויות"
("I know I need to invest but I'm afraid of making mistakes")

---

## User Journeys

---

### Journey 1: First-Time User Onboarding (Noam)

```
Day 0: Discovery & Sign-Up
├── Sees ad on Instagram about "AI שר אוצר אישי"
├── Downloads app / visits web platform
├── Signs up with Google OAuth
├── Greeted by AI in Hebrew: "היי! אני מאזן, ה-CFO האישי שלך"
│
├── Step 1: Quick Profile (2 min)
│   ├── Name, age, status
│   ├── Employment type (employee/self-employed)
│   └── Primary financial concern (dropdown)
│
├── Step 2: Connect Data (3 min)
│   ├── Upload bank statement CSV
│   ├── Upload credit card statement
│   └── OR enter monthly income manually
│
├── Step 3: AI First Impression (immediate)
│   ├── AI analyzes uploaded data
│   ├── Shows: "גיליתי שאתה מוציא ₪3,200 על אוכל בחוץ"
│   ├── Shows Financial Health Score: 52/100
│   └── Suggests first goal: "בוא נבנה כרית ביטחון של ₪10,000"
│
└── Step 4: Dashboard Reveal
    ├── Personalized dashboard appears
    ├── Net worth calculated
    ├── Monthly cash flow visualized
    └── AI says: "אני כאן 24/7. שאל אותי כל שאלה על הכסף שלך"

Day 1-7: Engagement Loop
├── Daily: AI sends one insight notification
├── Day 2: "שמתי לב שיש לך מנוי ל-3 שירותי סטרימינג. רוצה לבדוק?"
├── Day 4: "השבוע הוצאת פחות מהרגיל על מסעדות. כל הכבוד! 🎯"
├── Day 7: Weekly summary with progress toward first goal
│
Day 30: First Monthly Report
├── AI generates monthly financial summary
├── Comparison to previous period
├── Updated Financial Health Score
└── Adjusted recommendations
```

---

### Journey 2: Couple Onboarding (Shira & Itay)

```
Step 1: Shira creates account
├── Sets up profile
├── Imports her bank data
│
Step 2: Invites Itay
├── Sends invite link
├── Itay creates his account
├── Links to Shira's household
│
Step 3: Couple Configuration
├── Define shared categories (rent, groceries, utilities)
├── Define personal categories (hobbies, personal shopping)
├── Set splitting rules (50/50, proportional to income, custom)
│
Step 4: Combined Dashboard
├── Household income: combined view
├── Shared expenses tracked
├── Individual discretionary spending (private)
├── Joint goals appear
│
Step 5: Wedding Planning Mode
├── AI asks: "שמעתי שאתם מתכננים חתונה! רוצים שאעזור?"
├── Creates wedding goal with Israeli-typical budget breakdown
├── Tracks contributions from parents
├── Shows countdown with financial milestones
│
Step 6: Ongoing
├── Monthly couple finance review prompted by AI
├── Spending transparency without judgment
├── Goal progress celebrations
└── AI mediates: "שירה, את בדרך כלל חוסכת יותר מאיתי. אולי תגדילו את ההפרשה המשותפת?"
```

---

### Journey 3: Mortgage Decision (Michal & Daniel)

```
Trigger: AI detects mortgage anniversary approaching

AI Message: "דניאל, המשכנתא שלכם מתחדשת בעוד 3 חודשים. 
            שמתי לב שהריבית שלכם גבוהה ב-0.4% מהממוצע בשוק.
            רוצים שאריץ סימולציה של מיחזור?"

Step 1: User taps "כן, תראה לי"

Step 2: AI Simulator activates
├── Current mortgage parameters displayed
├── Shows total interest remaining: ₪380,000
├── Simulates refinance at current market rates
├── Shows potential savings: ₪45,000 over remaining term
│
Step 3: What-If Scenarios
├── Scenario A: Refinance with shorter term (+₪800/month, save ₪85K)
├── Scenario B: Refinance same term (save ₪45K, no change in monthly)
├── Scenario C: Keep current (baseline)
│
Step 4: AI Recommendation
├── "על בסיס תזרים המזומנים שלכם, אני ממליץ על תרחיש B.
│    אתם לא יכולים להרשות לעצמכם עוד ₪800 בחודש עם הגן של הילדים."
│
Step 5: Action Items
├── List of documents needed for refinance
├── Suggested banks to approach
├── Timeline for process
└── Reminder set for 2 weeks before renewal
```

---

### Journey 4: Retirement Planning (Ronit & Yossi)

```
Trigger: Yossi searches "האם אני יכול לפרוש ב-62?"

AI Response:
├── "שאלה מצוינת! בואו נבדוק את זה ביחד."
├── Aggregates all pension data
│   ├── Pension Fund 1 (from employer 2005-2012): ₪420,000
│   ├── Pension Fund 2 (from employer 2012-2019): ₪580,000
│   ├── Current Pension (2019-present): ₪310,000
│   ├── Keren Hishtalmut: ₪180,000
│   └── Kupat Gemel: ₪95,000
│
├── Total retirement assets: ₪1,585,000
├── Projected at age 62 (7 years): ₪2,850,000
│
├── Monthly pension income estimate: ₪12,400
├── Current monthly expenses: ₪18,000
├── Gap: ₪5,600/month
│
├── AI Analysis:
│   "יוסי, אם תפרוש ב-62 תהיה לכם פער של ₪5,600 בחודש.
│    יש כמה דרכים לגשר על הפער:"
│
│   Option A: "הגדילו הפרשות ב-₪2,000/חודש מהיום"
│   Option B: "דחו פרישה לגיל 64 – הפער נסגר"
│   Option C: "צמצמו הוצאות עתידיות ב-30%"
│
└── Creates retirement planning module with ongoing tracking
```

---

### Journey 5: AI Proactive Alert (Omer – Self-Employed)

```
Tuesday 10:00 AM – AI Alert:

"עומר, שמתי לב לכמה דברים שכדאי שתדע:

1. 📊 ההכנסות החודש נמוכות ב-35% מהממוצע שלך
2. 💰 הרבעון הבא יש לך תשלום מקדמות מס של ₪12,000
3. ⚠️ בקצב הנוכחי, תזרים המזומנים שלך יהיה שלילי בעוד 6 שבועות

המלצות:
• העבר ₪8,000 מחשבון החיסכון לעו"ש כרזרבה
• שקול לדחות את הרכישה של הציוד החדש (₪5,000)
• האם יש חשבוניות שטרם נגבו? מצאתי 3 לקוחות שלא שילמו"

User taps: "תראה לי את הלקוחות שלא שילמו"

AI shows:
├── Client A: ₪15,000 (45 days overdue)
├── Client B: ₪8,000 (30 days overdue)  
└── Client C: ₪4,500 (21 days overdue)

AI: "אם תגבה את כל החובות, תזרים המזומנים שלך בטוח לרבעון הבא."
```

---

## User Journey Map Summary

| Stage | Awareness | Onboarding | Active Use | Power User | Advocate |
|-------|-----------|------------|------------|------------|----------|
| Action | Discovers מאזן | Signs up, imports data | Daily/weekly usage | Uses advanced features | Refers friends |
| Feeling | Frustrated with finances | Hopeful, curious | Informed, in control | Empowered, confident | Proud, helpful |
| Touchpoint | Ad, referral, content | Web/App onboarding | Dashboard, AI chat | Simulator, Reports | Share, review |
| AI Role | — | First impression | Daily advisor | Strategic planner | — |
| Key Metric | CAC | Activation rate | DAU, retention | Feature adoption | NPS, referral rate |
