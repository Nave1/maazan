# מאזן – Complete Feature Breakdown

## Module Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    AI FAMILY CFO LAYER                    │
│  (Conversational AI · Proactive Alerts · Recommendations)│
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Dashboard │ │Transactions│ │  Goals   │ │ Couple   │   │
│  │          │ │           │ │  System  │ │  Mode    │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Investment│ │ Pension   │ │ Mortgage │ │Reporting │   │
│  │ Tracker  │ │ Center    │ │ Tracker  │ │ Center   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │Financial │ │ What-If  │ │  Life    │ │Financial │   │
│  │ Timeline │ │Simulator │ │ Events   │ │  Score   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
│                                                           │
├─────────────────────────────────────────────────────────┤
│              DATA & SECURITY LAYER                        │
│  (Encryption · RBAC · Audit · Privacy Compliance)        │
└─────────────────────────────────────────────────────────┘
```

---

## MODULE 1: Financial Dashboard (לוח בקרה פיננסי)

### Key Metrics Display

| Metric | Calculation | Update Frequency |
|--------|-------------|-----------------|
| Net Worth (שווי נקי) | Total Assets - Total Liabilities | Real-time |
| Total Assets (סך נכסים) | Cash + Investments + Property + Pension | Daily |
| Total Liabilities (סך התחייבויות) | Mortgage + Loans + Credit Card Debt | Daily |
| Monthly Income (הכנסה חודשית) | Sum of income transactions | Monthly |
| Monthly Expenses (הוצאות חודשיות) | Sum of expense transactions | Real-time |
| Cash Flow (תזרים מזומנים) | Income - Expenses | Real-time |
| Savings Rate (שיעור חיסכון) | (Income - Expenses) / Income × 100 | Monthly |
| Debt Ratio (יחס חוב) | Total Debt / Total Assets × 100 | Monthly |
| Investment Performance (ביצועי השקעות) | Weighted portfolio return | Daily |
| Financial Health Score (ציון בריאות פיננסית) | Proprietary algorithm (0-100) | Weekly |

### Dashboard Components

1. **Hero Section**
   - Financial Health Score (large, animated gauge)
   - AI-generated one-line summary ("החודש הזה אתה חוסך 15% יותר מהרגיל!")
   - Quick action buttons

2. **Financial Snapshot Cards**
   - Net worth with trend arrow
   - Monthly cash flow with mini sparkline
   - Savings rate with target indicator
   - Next upcoming expense/payment

3. **Charts Section**
   - Income vs. Expenses (6-month bar chart)
   - Expense breakdown (donut chart by category)
   - Net worth trend (area chart, 12 months)
   - Cash flow forecast (next 3 months, line chart)

4. **AI Insights Panel**
   - 3 most important insights/alerts
   - Tap to expand into full AI conversation
   - Contextual recommendations

5. **Quick Actions**
   - Add transaction
   - Ask AI a question
   - View goals progress
   - Switch to couple view

---

## MODULE 2: Transaction Management (ניהול תנועות)

### Data Input Methods

| Method | Format | Processing |
|--------|--------|-----------|
| Manual Entry | Form | Instant categorization |
| CSV Import | .csv | Column mapping + AI categorization |
| Excel Import | .xlsx, .xls | Sheet detection + mapping |
| Bank Statement | PDF/CSV | Israeli bank format recognition |
| Credit Card Statement | PDF/CSV | Israeli CC format recognition |

### Smart Categorization Engine

```
Transaction Input → NLP Analysis → Category Suggestion → User Confirmation → Rule Learning
                                                              ↓
                                                    Rule Database Update
                                                              ↓
                                              Future auto-categorization
```

**AI Categorization Features:**
- Hebrew merchant name recognition ("שופרסל" → Groceries)
- Pattern learning (every 1st of month, same amount → recurring)
- Context awareness (gas station on Friday → pre-Shabbat shopping)
- Split transaction detection (supermarket with pharmacy items)

### Transaction Features

| Feature | Description |
|---------|-------------|
| Smart Search | Search by amount, merchant, category, date, note |
| Advanced Filters | Date range, category, amount range, tags, type |
| Bulk Edit | Select multiple → change category/tag/note |
| Tags | Custom color-coded tags (tax deductible, reimbursable, etc.) |
| Notes | Free-text notes per transaction |
| Attachments | Receipt photos linked to transactions |
| Recurring Detection | AI identifies recurring transactions automatically |
| Split Transactions | Divide one transaction across categories |
| Rule Engine | "If merchant contains X → category Y" |

### Israeli Bank Format Support

- Bank Hapoalim (בנק הפועלים)
- Bank Leumi (בנק לאומי)
- Discount Bank (בנק דיסקונט)
- Mizrahi Tefahot (מזרחי טפחות)
- Bank of Jerusalem (בנק ירושלים)
- First International (הבינלאומי הראשון)

### Israeli Credit Card Support

- Isracard (ישראכרט)
- Cal (כאל)
- Max (מקס)
- Diners
- American Express Israel

---

## MODULE 3: Israeli Financial Categories (קטגוריות פיננסיות)

### Category Hierarchy

```
דיור (Housing)
├── שכר דירה (Rent)
├── משכנתא (Mortgage)
├── ארנונה (Arnona/Property Tax)
├── מים (Water)
├── חשמל (Electricity)
├── גז (Gas)
├── ועד בית (Building Committee)
├── ביטוח דירה (Home Insurance)
└── תחזוקת בית (Home Maintenance)

תחבורה (Transportation)
├── דלק (Fuel)
├── תחבורה ציבורית (Public Transit)
├── רב-קו (Rav-Kav)
├── טיפולי רכב (Vehicle Maintenance)
├── ביטוח רכב (Car Insurance)
├── חניה (Parking)
├── טסט (Vehicle Test)
└── כבישי אגרה (Toll Roads)

מזון (Food & Groceries)
├── סופרמרקט (Supermarket)
├── ירקות ופירות (Produce)
├── בשר ודגים (Meat & Fish)
├── מאפייה (Bakery)
└── משלוחי אוכל (Food Delivery)

משפחה וילדים (Family & Children)
├── גן ילדים (Daycare/Kindergarten)
├── צהרון (After-school care)
├── חוגים (Extracurricular Activities)
├── ביגוד ילדים (Children's Clothing)
├── ציוד לבית ספר (School Supplies)
└── מטפלת (Babysitter)

חינוך (Education)
├── שכר לימוד (Tuition)
├── קורסים (Courses)
├── ספרים (Books)
└── כנסים (Conferences)

בריאות (Health)
├── קופת חולים (Health Fund - Kupat Holim)
├── ביטוח בריאות (Health Insurance)
├── רופא שיניים (Dentist)
├── תרופות (Medications)
├── טיפולים (Treatments)
└── אופטיקה (Optician)

אורח חיים (Lifestyle)
├── מסעדות (Restaurants)
├── בתי קפה (Cafes)
├── בילויים (Entertainment)
├── קולנוע (Cinema)
├── ספורט/חדר כושר (Gym/Sports)
├── קניות (Shopping)
├── ביגוד (Clothing)
├── טיפוח (Personal Care)
└── חופשות (Vacations)

פיננסי (Financial)
├── הלוואות (Loans)
├── החזר אשראי (Credit Repayment)
├── חיסכון (Savings)
├── השקעות (Investments)
├── פנסיה (Pension)
├── קרן השתלמות (Keren Hishtalmut)
├── קופת גמל (Kupat Gemel)
├── ביטוח חיים (Life Insurance)
└── עמלות בנק (Bank Fees)

הכנסות (Income)
├── משכורת (Salary)
├── בונוס (Bonus)
├── פרילנס (Freelance)
├── השכרה (Rental Income)
├── דיבידנדים (Dividends)
├── ריבית (Interest)
├── מתנות (Gifts)
├── החזרי מס (Tax Refunds)
└── ביטוח לאומי (Bituach Leumi Benefits)

תקשורת ומנויים (Communications & Subscriptions)
├── סלולר (Cellular)
├── אינטרנט (Internet)
├── טלוויזיה (TV/Streaming)
├── מנויים דיגיטליים (Digital Subscriptions)
└── עיתונות (News/Magazines)

מיסים (Taxes)
├── מס הכנסה (Income Tax)
├── ביטוח לאומי (Bituach Leumi)
├── מס בריאות (Health Tax)
├── מע"מ (VAT)
└── מס שבח (Capital Gains Tax)
```

---

## MODULE 4: Goals System (מערכת יעדים)

### Pre-Built Goal Templates

| Goal | Icon | Default Target | Typical Timeline |
|------|------|---------------|-----------------|
| חתונה (Wedding) | 💍 | ₪120,000 | 12-24 months |
| רכישת דירה (Apartment) | 🏠 | ₪400,000 (down payment) | 3-7 years |
| כרית ביטחון (Emergency Fund) | 🛡️ | 3-6 months expenses | 6-18 months |
| רכב (Vehicle) | 🚗 | ₪80,000-150,000 | 12-36 months |
| חופשה (Vacation) | ✈️ | ₪10,000-30,000 | 3-12 months |
| לימודים (Education) | 📚 | ₪30,000-80,000 | 12-48 months |
| פרישה (Retirement) | 🌅 | Custom | 10-30 years |
| יעד מותאם (Custom) | ⭐ | Custom | Custom |

### Goal Intelligence Engine

For each goal, the system calculates:

```typescript
interface GoalAnalysis {
  targetAmount: number;           // Target in ₪
  currentProgress: number;        // Current savings toward goal
  progressPercentage: number;     // % complete
  monthlyContributionNeeded: number; // To hit target on time
  currentMonthlyContribution: number; // Actual monthly saving
  estimatedCompletionDate: Date;  // At current rate
  originalTargetDate: Date;       // User's desired date
  daysAheadOrBehind: number;      // Positive = ahead, Negative = behind
  successProbability: number;     // 0-100% based on behavior patterns
  riskFactors: string[];          // What could derail the goal
  aiRecommendation: string;       // Personalized advice
}
```

### Goal Features

- **Auto-Allocation**: Set rules to automatically allocate income to goals
- **Priority Ranking**: Drag-and-drop goal priority order
- **Milestone Celebrations**: AI celebrates when milestones are hit
- **Goal Sharing**: Share goals between couple members
- **Parent Goals**: Break large goals into sub-goals
- **Goal Templates**: Israeli-specific pre-configured templates
- **Visual Progress**: Animated progress bars with celebrations
- **Forecast Adjustments**: AI adjusts forecasts based on actual behavior

---

## MODULE 5: Couple Mode (מצב זוגי)

### Architecture

```
┌─────────────────────────────────────────┐
│           HOUSEHOLD (משק בית)            │
├───────────────────┬─────────────────────┤
│   Partner A       │     Partner B        │
│   (Personal)      │     (Personal)       │
├───────────────────┴─────────────────────┤
│              SHARED SPACE                │
│   • Joint accounts                       │
│   • Shared goals                         │
│   • Household budget                     │
│   • Combined reports                     │
└─────────────────────────────────────────┘
```

### Couple Features

| Feature | Description |
|---------|-------------|
| Invite Partner | Email/SMS invite to join household |
| Shared Dashboard | Combined financial view |
| Personal Dashboard | Individual view (privacy preserved) |
| Expense Splitting | 50/50, proportional, or custom rules |
| Shared Goals | Both partners contribute and track |
| Joint Budget | Household budget categories |
| Personal Allowance | "No questions asked" personal spending |
| Contribution Tracking | Who paid what, transparency mode |
| Family Reports | Combined monthly/annual reports |
| AI Mediation | Neutral financial advice for couples |
| Privacy Controls | Each partner controls what's visible |

### Splitting Rules Engine

```
Rule Types:
├── Equal Split (50/50)
├── Proportional to Income (if A earns 60%, A pays 60%)
├── Category-Based (A handles rent, B handles groceries)
├── Fixed Amount (A contributes ₪8,000/month to shared)
└── Custom Formula (user-defined)
```

---

## MODULE 6: Investment Tracker (מעקב השקעות)

### Supported Asset Types

| Type | Data Source | Metrics |
|------|------------|---------|
| מניות (Stocks) | TASE, NYSE, NASDAQ | Price, P/E, Dividend Yield |
| תעודות סל (ETFs) | TASE, International | NAV, TER, Tracking Error |
| קרנות נאמנות (Mutual Funds) | Israeli fund houses | NAV, Management Fee, Return |
| קריפטו (Crypto) | Exchange APIs | Price, 24h change, Market Cap |
| חיסכון (Savings Accounts) | Manual/Bank | Balance, Interest Rate, Maturity |
| אג"ח (Bonds) | TASE | Yield, Duration, Credit Rating |
| נדל"ן (Real Estate) | Manual | Estimated value, Rental yield |

### Portfolio Analytics

- **Asset Allocation Pie Chart** – Breakdown by asset class
- **Geographic Diversification** – Israel vs. International exposure
- **Sector Breakdown** – Tech, Finance, Real Estate, etc.
- **Risk Score** – Portfolio volatility assessment (1-10)
- **Sharpe Ratio** – Risk-adjusted return
- **Correlation Matrix** – How holdings relate to each other
- **Currency Exposure** – ₪ vs. $ vs. € exposure
- **Fee Analysis** – Total cost of ownership across all investments
- **Tax Efficiency** – Realized vs. unrealized gains, tax-loss opportunities

### AI Investment Insights

- "הפורטפוליו שלך חשוף ב-80% לשוק הישראלי. שקול פיזור בינלאומי."
- "קרן הנאמנות X גובה 1.5% דמי ניהול. יש תעודת סל דומה עם 0.3%."
- "יש לך רווח לא ממומש של ₪15,000 בתעודת סל Y. תכנון מס?"

---

## MODULE 7: Pension Center (מרכז הפנסיה)

### Tracked Instruments

| Instrument | Key Data Points |
|-----------|----------------|
| פנסיה מקיפה (Comprehensive Pension) | Balance, Monthly Contribution, Employer Match, Coverage, Route |
| קרן השתלמות (Keren Hishtalmut) | Balance, Contribution, Tax-Free Date, Investment Route |
| קופת גמל (Kupat Gemel) | Balance, Type (savings/annuity), Route |
| ביטוח מנהלים (Managers Insurance) | Balance, Risk Coverage, Management Fees |

### Pension Dashboard

1. **Total Retirement Assets** – Aggregated across all funds
2. **Monthly Contributions Breakdown**
   - Employee contribution
   - Employer contribution
   - Severance allocation (פיצויים)
3. **Investment Route Performance** – Returns by route over time
4. **Management Fees Analysis** – Compare fees across funds
5. **Retirement Projection**
   - Projected monthly pension at retirement age
   - Gap analysis vs. desired lifestyle
   - Required additional savings
6. **Keren Hishtalmut Tracker**
   - Tax-free withdrawal date countdown
   - Projected value at maturity
   - Optimal withdrawal strategy

### AI Pension Insights

- "דמי הניהול שלך בקרן הפנסיה גבוהים ב-0.3% מהממוצע. זה עולה לך ₪180,000 עד הפרישה."
- "הקרן השתלמות שלך מתפנה בעוד 8 חודשים. בוא נתכנן מה לעשות עם ₪120,000."
- "ההפרשות של המעסיק שלך לפנסיה הן 6.5%. החוק מאפשר עד 7.5%. כדאי לבקש העלאה."

---

## MODULE 8: Mortgage Tracker (מעקב משכנתא)

### Mortgage Components (Israeli Structure)

| Track (מסלול) | Details |
|--------------|---------|
| פריים (Prime) | Variable, linked to Bank of Israel rate |
| קבועה לא צמודה (Fixed Unlinked) | Fixed rate, not CPI-linked |
| קבועה צמודה (Fixed CPI-Linked) | Fixed rate, CPI-adjusted |
| משתנה כל 5 (Variable Every 5yr) | Rate resets every 5 years |
| עוגן (Anchor) | Linked to government bonds |

### Mortgage Dashboard

- **Total Remaining Balance** – Across all tracks
- **Monthly Payment Breakdown** – Principal vs. Interest per track
- **Total Interest Paid to Date** – Cumulative cost
- **Total Interest Remaining** – Future cost at current rates
- **LTV Ratio** – Loan-to-Value based on estimated property value
- **Amortization Schedule** – Full payment table
- **CPI Impact Analysis** – How inflation affects linked tracks

### AI Mortgage Features

- **Refinance Alert** – Detects when market rates make refinance worthwhile
- **Early Repayment Simulator** – Shows impact of extra payments
- **Rate Change Impact** – What happens if Prime changes by 0.25%
- **Track Comparison** – Optimal mix analysis
- **Payoff Countdown** – Motivational tracker

---

## MODULE 9: Reporting Center (מרכז דוחות)

### Report Types

| Report | Frequency | Contents |
|--------|-----------|----------|
| Monthly Summary | Monthly | Income, expenses, savings, goals, AI summary |
| Quarterly Review | Quarterly | Trends, investments, pension, recommendations |
| Annual Report | Annual | Full year analysis, tax-relevant data, year-over-year |
| Tax Report | Annual | Tax-deductible expenses, capital gains, donations |
| Couple Report | Monthly | Joint finances, splitting summary, shared goals |
| Goal Report | On-demand | Progress across all goals |
| Investment Report | Quarterly | Portfolio performance, allocation changes |

### Report Features

- **AI Executive Summary** – Plain Hebrew explanation of key findings
- **Comparative Analysis** – This month vs. last month, this year vs. last year
- **Trend Visualization** – Charts showing direction of key metrics
- **Anomaly Highlighting** – AI flags unusual items
- **Export Options** – PDF (beautifully formatted), Excel (raw data), Email delivery
- **Scheduled Delivery** – Auto-send reports on preferred date
- **Custom Reports** – Build reports with chosen metrics and date ranges

---

## MODULE 10: Financial Health Score (ציון בריאות פיננסית)

### Scoring Algorithm

```
Financial Health Score (0-100) = Weighted Average of:

├── Savings Rate (20%)
│   └── Score based on: actual savings / recommended savings
│
├── Debt Management (20%)
│   └── Score based on: debt-to-income ratio, payment history
│
├── Emergency Fund (15%)
│   └── Score based on: months of expenses covered
│
├── Budget Discipline (15%)
│   └── Score based on: staying within budget categories
│
├── Goal Achievement (10%)
│   └── Score based on: on-track goals / total goals
│
├── Investment Health (10%)
│   └── Score based on: diversification, fee efficiency, returns
│
└── Cash Flow Stability (10%)
    └── Score based on: income consistency, expense predictability
```

### Score Presentation

- **Main Score**: Large animated number (0-100)
- **Category Breakdown**: Radar chart showing each component
- **Trend Line**: Score over past 12 months
- **Peer Comparison**: Anonymous percentile ranking
- **AI Explanation**: Why score changed, in plain Hebrew
- **Improvement Plan**: Top 3 actions to improve score
- **Future Projection**: Where score will be in 6 months at current trajectory

---

## MODULE 11: Financial Timeline (ציר הזמן הפיננסי)

### Timeline Visualization

A vertical, scrollable timeline showing:

```
היום (Today) ────────────── ציון: 62
│
├── 3 חודשים: כרית ביטחון הושלמה ✓ (probability: 89%)
│
├── 8 חודשים: חתונה 💍 (on track)
│
├── 2 שנים: מקדמה לדירה (need ₪15K more/month)
│
├── 3 שנים: רכישת דירה 🏠 (probability: 72%)
│
├── 5 שנים: ילד ראשון 👶 (financial impact: +₪4,500/month)
│
├── 7 שנים: סיום קרן השתלמות (projected: ₪220,000)
│
├── 15 שנים: סיום משכנתא 🎉
│
└── 30 שנים: פרישה 🌅 (projected pension: ₪14,200/month)
```

### Timeline Features

- **Dynamic Updates** – Adjusts based on actual financial behavior
- **Probability Indicators** – Confidence level for each milestone
- **Drag to Reorder** – Change priority and see financial impact
- **What-If Integration** – Tap milestone to run simulation
- **Celebration Animations** – When milestones are achieved
- **AI Commentary** – Context for each milestone

---

## MODULE 12: What-If Simulator (סימולטור תרחישים)

### Pre-Built Scenarios

| Scenario | Parameters | Output |
|----------|-----------|--------|
| העלאת שכר (Salary Increase) | Amount, timing | Impact on goals, savings, timeline |
| פיטורים (Job Loss) | Duration, severance | Runway, emergency fund adequacy |
| משכנתא (New Mortgage) | Amount, rate, term | Monthly impact, total cost |
| רכישת דירה (Apartment Purchase) | Price, down payment | Full financial impact |
| שינוי השקעות (Investment Change) | Allocation shift | Risk/return impact |
| הגדלת חיסכון (Increased Savings) | Amount | Goal acceleration |
| הרחבת משפחה (Family Expansion) | Child costs | Budget impact, timeline shift |
| מעבר לעצמאי (Going Freelance) | Expected income | Stability analysis |

### Simulator Output

- **Visual Forecast Chart** – Before vs. After scenario line chart
- **Key Metrics Impact** – Table showing change in all major metrics
- **Risk Assessment** – Probability of financial distress
- **Timeline Impact** – How goals shift
- **AI Recommendation** – Whether to proceed, and under what conditions

---

## MODULE 13: Life Event Planner (מתכנן אירועי חיים)

### Supported Life Events

| Event | Israeli Context | Typical Cost Range |
|-------|----------------|-------------------|
| חתונה (Wedding) | 300-500 guests typical, venue + catering | ₪100,000 - ₪250,000 |
| רכישת דירה (Apartment) | 25% down payment, stamp tax, lawyer | ₪300,000 - ₪800,000 (down) |
| ילד ראשון (First Child) | Maternity leave, daycare from 3 months | +₪3,500-6,000/month |
| רכב (Vehicle) | Purchase + insurance + fuel + maintenance | ₪80,000 - ₪200,000 |
| שינוי קריירה (Career Change) | Transition period, retraining | 3-6 months expenses |
| שבתון (Sabbatical) | Travel + no income | ₪50,000 - ₪150,000 |
| פרישה (Retirement) | Pension gap analysis | Ongoing |
| עלייה לארץ (Aliyah) | Absorption costs, sal klita | ₪50,000 - ₪100,000 |

### Planner Features

- **Cost Estimator** – AI estimates costs based on Israeli market data
- **Timeline Builder** – When to start saving, key milestones
- **Budget Breakdown** – Detailed cost components
- **Savings Plan** – Monthly amount needed
- **Impact Analysis** – How event affects other goals
- **Checklist** – Action items leading up to event
- **Community Benchmarks** – Anonymous data on what others spent

---

## MODULE 14: AI Family CFO (שר האוצר המשפחתי)

### AI Capabilities

| Capability | Examples |
|-----------|----------|
| Question Answering | "כמה הוצאתי על מסעדות השנה?" |
| Advice Giving | "האם אני יכול להרשות לעצמי רכב חדש?" |
| Planning | "עזור לי לתכנן חיסכון לדירה" |
| Alerting | "שים לב – הוצאת יותר מהתקציב על בילויים" |
| Explaining | "למה הציון הפיננסי שלי ירד?" |
| Forecasting | "מתי אגיע ליעד החיסכון?" |
| Comparing | "מה ההבדל בין קרן השתלמות לקופת גמל?" |
| Optimizing | "איך אני יכול לחסוך ₪2,000 בחודש?" |

### Conversation Memory

The AI maintains a persistent memory of:
- Stated goals and priorities
- Family structure and life stage
- Financial decisions and reasoning
- Preferences (risk tolerance, spending priorities)
- Past advice given and outcomes

### Proactive Notifications

| Trigger | Alert |
|---------|-------|
| Budget breach | "הוצאת 120% מהתקציב על קניות. רוצה לראות מה קרה?" |
| Unusual expense | "חיוב של ₪3,500 ב-'חנות X' – זה רגיל?" |
| Subscription increase | "סלקום העלו לך ₪15 בחודש. רוצה לבדוק חלופות?" |
| Cash flow risk | "בעוד שבועיים יהיו לך 3 חיובים גדולים ביחד. וודא שיש כיסוי." |
| Goal off-track | "את 8% מאחורי היעד לחיסכון לדירה. בואי נתאים את התוכנית." |
| Investment alert | "הפורטפוליו שלך ירד 5% השבוע. זה בגלל..." |
| Positive reinforcement | "חודש שלישי ברציפות שאתה חוסך מעל היעד! 🎉" |
| Missed savings | "לא הפרשת לחיסכון החודש. להעביר אוטומטית?" |
