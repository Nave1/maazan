# מאזן – Design System & UI Wireframes

## Design Philosophy

- **Hebrew-first**: Every component designed for RTL, then adapted for LTR
- **Financial clarity**: Numbers, charts, and money always visually prominent
- **Calm confidence**: Users should feel in control, not stressed
- **Conversational warmth**: The AI layer brings humanity to finance
- **Progressive disclosure**: Simple by default, detailed on demand

---

## Brand Identity

### Name & Logo
- **Name**: מאזן (Ma'azan) – "Balance" in Hebrew
- **Logo concept**: Abstract balance/scales motif using geometric shapes, incorporating the Hebrew letter מ
- **Logo style**: Clean, modern, geometric — no gradients, works at all sizes

### Color System

#### Primary Palette

| Name | Hex | Usage |
|------|-----|-------|
| Sapphire | `#1B4F72` | Primary brand, headers, CTAs |
| Sapphire Light | `#2E86AB` | Secondary actions, links |
| Sapphire Pale | `#E8F4F8` | Backgrounds, cards |

#### Secondary Palette

| Name | Hex | Usage |
|------|-----|-------|
| Olive | `#4A7C59` | Positive/income/growth |
| Coral | `#C0392B` | Negative/expenses/alerts |
| Amber | `#D4A03C` | Warnings, attention |
| Slate | `#2C3E50` | Text primary |
| Cloud | `#F8FAFE` | Page background |

#### Semantic Colors

| Name | Hex | Usage |
|------|-----|-------|
| Success | `#27AE60` | Positive change, goals met |
| Warning | `#F39C12` | Budget near limit |
| Error | `#E74C3C` | Over budget, critical alert |
| Info | `#3498DB` | Informational, tips |
| Neutral | `#95A5A6` | Disabled, secondary text |

#### Score Colors (Gradient)

```
0-25:  #E74C3C (Critical)
26-50: #F39C12 (Needs Work)
51-75: #F1C40F (Good)
76-90: #2ECC71 (Great)
91-100: #1B4F72 (Excellent)
```

### Typography

#### Hebrew Font Stack
```css
font-family: 'Heebo', 'Assistant', 'Rubik', sans-serif;
```

#### English Font Stack
```css
font-family: 'Inter', 'Nunito Sans', sans-serif;
```

#### Type Scale

| Level | Size | Weight | Usage |
|-------|------|--------|-------|
| Display | 36px / 2.25rem | 700 | Hero numbers (net worth) |
| H1 | 28px / 1.75rem | 700 | Page titles |
| H2 | 22px / 1.375rem | 600 | Section headers |
| H3 | 18px / 1.125rem | 600 | Card titles |
| Body | 16px / 1rem | 400 | Default text |
| Small | 14px / 0.875rem | 400 | Secondary text, captions |
| Tiny | 12px / 0.75rem | 400 | Timestamps, labels |

#### Number Display
```css
/* Financial numbers use tabular figures for alignment */
font-variant-numeric: tabular-nums;
/* Large amounts: */
font-size: 2.25rem;
font-weight: 700;
letter-spacing: -0.02em;
```

### Spacing System

```
4px  (0.25rem) - Micro spacing
8px  (0.5rem)  - Tight spacing
12px (0.75rem) - Compact spacing
16px (1rem)    - Default spacing
24px (1.5rem)  - Comfortable spacing
32px (2rem)    - Loose spacing
48px (3rem)    - Section spacing
64px (4rem)    - Page section gaps
```

### Border Radius

```
4px  - Buttons, inputs
8px  - Cards, panels
12px - Dialogs, large cards
16px - Feature cards, hero sections
9999px - Pills, badges, avatars
```

### Shadows

```css
/* Subtle - cards at rest */
shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06);

/* Medium - cards on hover */
shadow-md: 0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.06);

/* Large - modals, dropdowns */
shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.08), 0 4px 6px rgba(0, 0, 0, 0.05);

/* Glow - score gauge, celebrations */
shadow-glow: 0 0 20px rgba(27, 79, 114, 0.3);
```

---

## RTL Design Specifications

### Layout Rules

```
┌────────────────────────────────────────────────────┐
│  RTL Mode (Hebrew - Default)                        │
│                                                      │
│  ┌──────────────────────────────────────┐ ┌──────┐ │
│  │                                      │ │      │ │
│  │          Main Content                │ │ Side │ │
│  │          (flows right-to-left)       │ │ bar  │ │
│  │                                      │ │      │ │
│  └──────────────────────────────────────┘ └──────┘ │
│                                                      │
│  Sidebar: RIGHT side                                │
│  Text alignment: RIGHT                              │
│  Icons before text: To the RIGHT of text           │
│  Numbers: LTR (always left-to-right)               │
│  Charts: Flipped X-axis direction                   │
└────────────────────────────────────────────────────┘
```

### RTL-Specific Rules

1. **Navigation sidebar** → Anchored to RIGHT side
2. **Text alignment** → Right-aligned by default
3. **Icons** → Appear to the right of text labels
4. **Directional icons** → Flipped (arrows, chevrons)
5. **Numbers** → Always LTR, even in RTL context
6. **Charts** → Time axis reads right-to-left (past → future)
7. **Progress bars** → Fill from right to left
8. **Tables** → Columns start from right
9. **Forms** → Labels right-aligned, inputs left-edge aligned
10. **Currency** → ₪ symbol to the right of number (₪12,500)

---

## Wireframes

### Wireframe 1: Main Dashboard (Hebrew/RTL)

```
┌─────────────────────────────────────────────────────────────────────┐
│ ◉ התראות    🔍 חיפוש                          מאזן    [אוטאר] │
├─────────────────────────────────────────────────────────────┬───────┤
│                                                               │      │
│  שלום נועם! הנה סיכום מהיר: החודש חסכת 15% יותר מהרגיל 🎉  │ 📊   │
│                                                               │ לוח  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌────────┐ │ בקרה │
│  │ שווי נקי    │ │ תזרים חודשי │ │ שיעור חיסכון│ │ ציון   │ │      │
│  │ ₪452,000   │ │ +₪3,500    │ │    15.9%    │ │  62    │ │ 💳   │
│  │   ▲ 2.8%   │ │   ▲ ₪800   │ │   ▲ 1.2%   │ │ ▲ +3  │ │תנועות│
│  └─────────────┘ └─────────────┘ └─────────────┘ └────────┘ │      │
│                                                               │ 🎯   │
│  ┌──────────────────────────────┐ ┌──────────────────────┐   │יעדים │
│  │     הכנסות מול הוצאות        │ │   פילוח הוצאות       │   │      │
│  │                              │ │                      │   │ 📈   │
│  │  ██                          │ │      ╭───╮           │   │השקעות│
│  │  ██  ▓▓                      │ │    ╭─┤   ├─╮        │   │      │
│  │  ██  ▓▓  ██                  │ │   ╭┤  דיור ├╮       │   │ 🏦   │
│  │  ██  ▓▓  ██  ▓▓             │ │   │ ╰───╯   │       │   │פנסיה │
│  │  ינו  פבר  מרץ  אפר         │ │   │ אוכל│חינוך      │   │      │
│  └──────────────────────────────┘ └──────────────────────┘   │ 🏠   │
│                                                               │משכנתא│
│  ┌──────────────────────────────────────────────────────┐   │      │
│  │  🤖 תובנות AI                                        │   │ 📅   │
│  │                                                       │   │ציר   │
│  │  • המנוי לנטפליקס עלה ב-₪12. שקול לעבור לתוכנית...  │   │זמן   │
│  │  • אתה 8% מאחורי יעד החיסכון לדירה                   │   │      │
│  │  • חשבון החשמל גבוה ב-30% מהממוצע שלך               │   │ ⚙️   │
│  │                                     [שאל את מאזן →]   │   │הגדרות│
│  └──────────────────────────────────────────────────────┘   │      │
│                                                               │      │
└───────────────────────────────────────────────────────────────┴──────┘
```

### Wireframe 2: AI Chat Interface

```
┌─────────────────────────────────────────────────────────────────────┐
│ ← חזרה ללוח בקרה           שר האוצר שלי                     מאזן │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                              ┌──────────────────────────────────┐   │
│                              │ כמה הוצאתי על מסעדות השנה?       │   │
│                              └──────────────────────────────────┘   │
│                                                                      │
│  ┌────────────────────────────────────────────────────────┐         │
│  │ 🤖 מאזן                                                │         │
│  │                                                         │         │
│  │ השנה הוצאת ₪12,450 על מסעדות, שזה ממוצע               │         │
│  │ של ₪2,075 בחודש.                                       │         │
│  │                                                         │         │
│  │ ┌─────────────────────────────────────┐                │         │
│  │ │  ינו  פבר  מרץ  אפר  מאי  יונ      │                │         │
│  │ │  ███  ██   ████ ███  ██   ███       │                │         │
│  │ │  1.8K 1.5K 2.8K 2.1K 1.9K 2.3K     │                │         │
│  │ └─────────────────────────────────────┘                │         │
│  │                                                         │         │
│  │ 📊 זה 11% מסך ההוצאות שלך                             │         │
│  │ 📈 עלייה של 18% לעומת שנה שעברה                       │         │
│  │                                                         │         │
│  │ ┌────────────────────┐ ┌──────────────────────┐        │         │
│  │ │ הראה פירוט חודשי  │ │ הגדר תקציב למסעדות  │        │         │
│  │ └────────────────────┘ └──────────────────────┘        │         │
│  └────────────────────────────────────────────────────────┘         │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  💬  שאל שאלה...                                    [שלח ←] │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  הצעות: [האם אני יכול להרשות רכב?] [כמה לחסוך?] [ביטול מנויים]    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Wireframe 3: Goals Screen

```
┌─────────────────────────────────────────────────────────────────────┐
│ + יעד חדש                          היעדים שלי                 מאזן │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  💰 סה"כ חיסכון ליעדים: ₪187,000 / ₪530,000              │     │
│  │  ██████████████░░░░░░░░░░░░░░░░░░  35%                    │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                      │
│  ┌─────────────────────────────────────┐ ┌─────────────────────┐   │
│  │  🏠 רכישת דירה                      │ │  💍 חתונה           │   │
│  │                                      │ │                      │   │
│  │  ₪125,000 / ₪400,000               │ │  ₪52,000 / ₪120,000│   │
│  │                                      │ │                      │   │
│  │  ╭────╮                             │ │  ╭────╮              │   │
│  │  │31% │  ◐                          │ │  │43% │  ◕           │   │
│  │  ╰────╯                             │ │  ╰────╯              │   │
│  │                                      │ │                      │   │
│  │  📅 יעד: יוני 2029                  │ │  📅 יעד: מאי 2027   │   │
│  │  💰 נדרש: ₪7,639/חודש              │ │  💰 נדרש: ₪5,667/חו │   │
│  │  📊 סיכוי: 72%                      │ │  📊 סיכוי: 85%      │   │
│  │  ⚠️ מאחור ב-75 יום                  │ │  ✅ במסלול           │   │
│  │                                      │ │                      │   │
│  │  [AI: הגדל ב-₪800/חודש לחזור      │ │                      │   │
│  │   למסלול]                           │ │                      │   │
│  └─────────────────────────────────────┘ └─────────────────────┘   │
│                                                                      │
│  ┌─────────────────────────────────────┐ ┌─────────────────────┐   │
│  │  🛡️ כרית ביטחון                     │ │  ✈️ חופשה ביוון     │   │
│  │                                      │ │                      │   │
│  │  ₪8,000 / ₪36,000                  │ │  ₪2,000 / ₪12,000  │   │
│  │  ╭────╮                             │ │  ╭────╮              │   │
│  │  │22% │  ◔                          │ │  │17% │  ◔           │   │
│  │  ╰────╯                             │ │  ╰────╯              │   │
│  │  📅 יעד: ינואר 2027                 │ │  📅 יעד: אוגוסט 2027│  │
│  │  💰 נדרש: ₪4,000/חודש              │ │  💰 נדרש: ₪714/חודש │   │
│  │  📊 סיכוי: 89%                      │ │  📊 סיכוי: 95%      │   │
│  └─────────────────────────────────────┘ └─────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Wireframe 4: Financial Timeline

```
┌─────────────────────────────────────────────────────────────────────┐
│                              ציר הזמן הפיננסי שלי            מאזן │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ציון נוכחי: 62 ───────────────────────────────── ציון צפוי: 78    │
│                                                                      │
│  ●═══════════════════════════════════════════════════════════●       │
│                                                                      │
│  2026                                                                │
│  ├── ● היום (יוני 2026)                                            │
│  │       ציון: 62 | שווי נקי: ₪452,000                             │
│  │                                                                   │
│  ├── ◐ כרית ביטחון הושלמה (ספטמבר 2026)                            │
│  │       סיכוי: 89% | ✅ במסלול                                     │
│  │       "עוד ₪28,000 ואתה מוגן לחצי שנה"                          │
│  │                                                                   │
│  2027                                                                │
│  ├── ◐ חתונה 💍 (מאי 2027)                                         │
│  │       סיכוי: 85% | ✅ במסלול                                     │
│  │       חסכת: ₪52,000 | יעד: ₪120,000                             │
│  │       "תצטרכו עוד ₪68,000 – ב-₪5,667/חודש זה אפשרי"           │
│  │                                                                   │
│  ├── ○ שחרור קרן השתלמות (מרץ 2027)                                │
│  │       צפי: ₪185,000 | פטור ממס ✓                                │
│  │       "₪185,000 יתפנו. רוצה לתכנן מה לעשות איתם?"              │
│  │                                                                   │
│  2029                                                                │
│  ├── ◔ רכישת דירה 🏠 (יוני 2029)                                   │
│  │       סיכוי: 72% | ⚠️ צריך תשומת לב                             │
│  │       חסכת: ₪125,000 | יעד: ₪400,000                            │
│  │       "מאחור ב-75 יום. העלאה של ₪800/חודש תחזיר למסלול"        │
│  │                                                                   │
│  2031                                                                │
│  ├── ○ ילד ראשון 👶 (2031)                                         │
│  │       השפעה: +₪4,500/חודש                                       │
│  │       "כדאי להתחיל קרן חינוך 3 שנים לפני"                       │
│  │                                                                   │
│  2044                                                                │
│  ├── ○ סיום משכנתא 🎉                                              │
│  │       ישוחרר: ₪6,800/חודש                                       │
│  │                                                                   │
│  2058                                                                │
│  └── ○ פרישה 🌅 (גיל 67)                                          │
│          פנסיה צפויה: ₪14,200/חודש                                  │
│          "על בסיס ההפרשות הנוכחיות + קרנות"                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Wireframe 5: Transaction Management

```
┌─────────────────────────────────────────────────────────────────────┐
│ [ייצוא] [ייבוא]  + תנועה חדשה              תנועות           מאזן │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │ 🔍 חיפוש תנועות...    │ קטגוריה ▼ │ תאריך ▼ │ סכום ▼ │ תגיות│   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  יוני 2026                        הכנסה: ₪22,000  הוצאה: ₪14,200  │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                      │
│  │ היום                                                              │
│  │                                                                   │
│  │  ☐ 🛒 שופרסל דיל                     מזון       -₪385.00      │
│  │     10:30  •  ויזה 4521  •  [שבועי]                             │
│  │                                                                   │
│  │  ☐ ⛽ דלק פז                         תחבורה     -₪280.00      │
│  │     08:15  •  מקס 7834                                          │
│  │                                                                   │
│  │ אתמול (10 יוני)                                                  │
│  │                                                                   │
│  │  ☐ 🍕 משלוח וולט                     מסעדות     -₪89.00       │
│  │     20:45  •  ויזה 4521  •  #אוכל-בחוץ                         │
│  │                                                                   │
│  │  ☐ 💰 משכורת                          הכנסה     +₪22,000.00   │
│  │     09:00  •  העברה בנקאית  •  [חוזר - חודשי]                  │
│  │                                                                   │
│  │  ☐ 🏠 משכנתא                         דיור       -₪6,800.00    │
│  │     09:00  •  הוראת קבע  •  [חוזר - חודשי]                     │
│  │                                                                   │
│  │  ☐ 📱 סלקום                          תקשורת     -₪99.00       │
│  │     •  הוראת קבע  •  [חוזר - חודשי]  •  ⚠️ עלה ב-₪12         │
│  │                                                                   │
│  │ 8 יוני                                                           │
│  │                                                                   │
│  │  ☐ 👶 צהרון "שמש"                    ילדים      -₪2,800.00    │
│  │     •  הוראת קבע  •  [חוזר - חודשי]                            │
│  │                                                                   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ◄ 1  2  3  4  5  ...  25 ►                                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Component Library (Shadcn UI + Custom)

### Button Variants

| Variant | Usage | Style |
|---------|-------|-------|
| Primary | Main CTAs | Sapphire bg, white text |
| Secondary | Secondary actions | Sapphire outline |
| Ghost | Tertiary, navigation | No border, hover bg |
| Destructive | Delete, remove | Coral bg, white text |
| Success | Confirm positive action | Olive bg, white text |
| AI | AI-related actions | Gradient sapphire → light |

### Card Variants

| Variant | Usage |
|---------|-------|
| Default | Standard content card |
| Metric | Dashboard number display |
| Interactive | Clickable, hover state |
| AI Insight | AI-generated content |
| Alert | Warning/notification card |

### Chart Components

| Chart | Usage | Library |
|-------|-------|---------|
| Area Chart | Net worth trend, cash flow forecast | Recharts |
| Bar Chart | Income vs expenses by month | Recharts |
| Donut Chart | Expense breakdown, allocation | Recharts |
| Line Chart | Performance, score trend | Recharts |
| Sparkline | Inline trend indicators | Custom SVG |
| Gauge | Financial health score | Custom SVG |
| Progress Ring | Goal progress | Custom SVG |

---

## Responsive Breakpoints

```css
/* Mobile first approach */
sm: 640px   /* Large phone */
md: 768px   /* Tablet */
lg: 1024px  /* Small laptop */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */
```

### Mobile Adaptations

- Sidebar collapses to bottom tab bar
- Cards stack vertically
- Charts become scrollable
- AI chat becomes full-screen overlay
- Swipe gestures for navigation

---

## Dark Mode

| Element | Light | Dark |
|---------|-------|------|
| Background | `#F8FAFE` | `#0F1419` |
| Card | `#FFFFFF` | `#1C2028` |
| Text Primary | `#2C3E50` | `#E8ECF0` |
| Text Secondary | `#6C7A89` | `#8899A6` |
| Border | `#E8ECF0` | `#2C3640` |
| Sapphire | `#1B4F72` | `#4DACDB` |
| Success | `#27AE60` | `#4FD080` |
| Error | `#E74C3C` | `#FF6B6B` |

---

## Animation & Micro-Interactions

| Element | Animation | Duration |
|---------|-----------|----------|
| Score gauge | Count-up + ring fill | 1.2s ease-out |
| Card appear | Fade up | 300ms |
| Progress ring | Fill arc | 800ms ease-out |
| Number change | Count animation | 600ms |
| Chart data | Staggered enter | 400ms per series |
| AI typing | Bouncing dots | Loop |
| Celebration | Confetti burst | 2s |
| Alert enter | Slide from top | 300ms spring |
| Timeline node | Pulse glow | 2s loop |

---

## Accessibility Requirements

- **WCAG 2.1 AA** compliance minimum
- Color contrast ratio ≥ 4.5:1 for text
- All interactive elements keyboard-navigable
- Screen reader support for Hebrew and English
- Focus indicators visible and clear
- Reduced motion preference respected
- Font size scalable to 200% without breaking layout
