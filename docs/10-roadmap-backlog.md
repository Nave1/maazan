# מאזן – Development Roadmap & Jira Backlog

## MVP Definition

### MVP Scope (Version 1.0)

The MVP delivers the core value proposition: **AI-powered financial visibility for Israeli households.**

| Included | Excluded (V2+) |
|----------|----------------|
| ✅ User auth (email + Google) | ❌ Microsoft OAuth |
| ✅ Dashboard with key metrics | ❌ Couple mode |
| ✅ Manual transaction entry | ❌ Bank auto-import |
| ✅ CSV/Excel import | ❌ PDF statement parsing |
| ✅ Israeli categories (full tree) | ❌ Custom category creation |
| ✅ Basic budgeting | ❌ Rollover budgets |
| ✅ AI Chat (basic Q&A) | ❌ Proactive AI alerts |
| ✅ Financial Health Score | ❌ Peer comparison |
| ✅ 2 goal types (emergency + custom) | ❌ Full goal system |
| ✅ Hebrew + English | ❌ Arabic |
| ✅ Mobile responsive | ❌ Native mobile app |
| ✅ Basic reports (monthly) | ❌ PDF export |
| ✅ Free tier only | ❌ Paid tiers |
| ✅ Basic security (JWT, encryption) | ❌ MFA |

### MVP Success Criteria

- User can sign up and see a dashboard within 5 minutes
- User can import 3 months of bank transactions via CSV
- AI can answer 5 basic financial questions accurately in Hebrew
- Financial Health Score generated and explained
- User retention > 30% at day 7

---

## Development Roadmap

### Phase 1: Foundation (Weeks 1-4)

```
Week 1-2: Project Setup & Core Infrastructure
├── Repository setup (monorepo)
├── Docker development environment
├── PostgreSQL + Redis setup
├── Next.js project with Tailwind + Shadcn
├── FastAPI project structure
├── CI/CD pipeline (GitHub Actions)
├── Authentication system (JWT + Google OAuth)
└── Database migrations (initial schema)

Week 3-4: Core Data Layer
├── User registration & login flow
├── Account management (CRUD)
├── Transaction model & CRUD
├── Category seeding (full Israeli tree)
├── CSV import engine (basic)
├── Transaction list with search & filters
└── Basic API tests
```

### Phase 2: Intelligence Layer (Weeks 5-8)

```
Week 5-6: Dashboard & Visualization
├── Financial dashboard layout (RTL)
├── Net worth calculation
├── Income/expense charts
├── Cash flow card
├── Expense breakdown donut chart
├── Monthly comparison bar chart
└── Responsive mobile layout

Week 7-8: AI Foundation
├── OpenAI integration
├── AI Chat interface (frontend)
├── Basic conversation flow
├── Financial data query tools
├── System prompt (Hebrew CFO)
├── Financial Health Score engine
├── Score visualization (gauge)
└── AI-generated score explanation
```

### Phase 3: Core Features (Weeks 9-12)

```
Week 9-10: Budgeting & Categories
├── Budget allocation per category
├── Budget tracking dashboard
├── Category rule engine
├── Smart categorization (AI)
├── Transaction bulk editing
├── Recurring transaction detection
└── Tags system

Week 11-12: Goals & Reporting
├── Goal creation (2 types for MVP)
├── Goal progress tracking
├── Goal forecast calculation
├── Basic monthly report generation
├── Report viewing interface
├── AI report summaries
└── Notification system (in-app)
```

### Phase 4: Polish & Launch (Weeks 13-16)

```
Week 13-14: Quality & Security
├── Security audit
├── Performance optimization
├── Error handling improvement
├── Input validation hardening
├── Rate limiting implementation
├── Audit logging
├── GDPR compliance (export, delete)
└── Privacy policy & ToS (Hebrew)

Week 15-16: Launch Preparation
├── Landing page
├── Onboarding flow
├── Demo data for new users
├── Analytics integration
├── Monitoring & alerting
├── Load testing
├── Beta testing (50 users)
└── Bug fixes from beta
```

---

### Version 1.5 (Months 5-6)

```
├── Couple Mode (full implementation)
├── Proactive AI alerts
├── Excel import improvement
├── Israeli credit card format support
├── PDF export for reports
├── MFA (TOTP)
├── Dark mode
├── Investment tracker (basic)
├── Mobile PWA optimization
└── Premium tier launch
```

---

### Version 2.0 Roadmap (Months 7-12)

```
Month 7-8: Advanced AI & Pension
├── AI Memory system (long-term)
├── What-If Simulator
├── Life Event Planner
├── Pension Center (full)
├── Keren Hishtalmut tracking
├── Kupat Gemel integration
├── Retirement projection
└── AI proactive engine (full)

Month 9-10: Mortgage & Investments
├── Mortgage Tracker (full)
├── Amortization schedule
├── Refinance simulator
├── Investment Tracker (full)
├── Portfolio analytics
├── TASE price integration
├── Risk metrics
└── Diversification analysis

Month 11-12: Timeline & Scale
├── Financial Timeline (visual)
├── Family plan launch
├── Professional plan launch
├── API performance optimization
├── Advanced reporting (quarterly, annual)
├── Tax report (annual)
├── Native mobile app (React Native)
└── Open Banking integration preparation
```

---

### Version 3.0 Vision (Year 2)

```
├── Open Banking (PSD2 Israel equivalent)
├── Automatic bank sync
├── Bill negotiation AI
├── Investment recommendations (licensed)
├── Insurance comparison
├── Mortgage comparison marketplace
├── Family financial education module
├── Community features (anonymous benchmarks)
├── WhatsApp bot integration
├── Voice interface (Hebrew)
├── Multi-currency support
└── Business/freelancer expansion
```

---

## Complete Jira Backlog

### Epic Structure

```
EP-001: Authentication & User Management
EP-002: Dashboard & Overview
EP-003: Transaction Management
EP-004: Budget System
EP-005: AI CFO Chat
EP-006: Financial Health Score
EP-007: Goals System
EP-008: Reporting
EP-009: Couple Mode
EP-010: Investment Tracker
EP-011: Pension Center
EP-012: Mortgage Tracker
EP-013: What-If Simulator
EP-014: Life Event Planner
EP-015: Financial Timeline
EP-016: Notifications
EP-017: Settings & Profile
EP-018: Onboarding
EP-019: Landing & Marketing Pages
EP-020: Infrastructure & DevOps
EP-021: Security & Compliance
EP-022: Monetization & Billing
```

---

### Detailed Stories (Sprint-Ready)

#### EP-001: Authentication & User Management

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-001 | As a user, I can register with email and password | Critical | 5 | 1 |
| US-002 | As a user, I can log in with email and password | Critical | 3 | 1 |
| US-003 | As a user, I can log in with Google OAuth | Critical | 5 | 1 |
| US-004 | As a user, I can reset my password via email | High | 3 | 2 |
| US-005 | As a user, I can update my profile information | Medium | 3 | 3 |
| US-006 | As a user, I can change my preferred language (HE/EN) | High | 3 | 2 |
| US-007 | As a user, I see proper RTL layout when Hebrew is selected | Critical | 5 | 1 |
| US-008 | As a user, I can enable MFA on my account | Medium | 5 | V1.5 |
| US-009 | As a user, I can log in with Microsoft OAuth | Low | 3 | V1.5 |
| US-010 | As a user, I can delete my account and all data | High | 5 | 4 |
| US-011 | As a user, I can export all my data (GDPR) | High | 5 | 4 |

#### EP-002: Dashboard & Overview

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-020 | As a user, I see my net worth on the dashboard | Critical | 5 | 3 |
| US-021 | As a user, I see monthly income and expenses | Critical | 3 | 3 |
| US-022 | As a user, I see my monthly cash flow | Critical | 3 | 3 |
| US-023 | As a user, I see a savings rate percentage | High | 2 | 3 |
| US-024 | As a user, I see an expense breakdown donut chart | High | 5 | 3 |
| US-025 | As a user, I see income vs expenses bar chart (6 months) | High | 5 | 4 |
| US-026 | As a user, I see a net worth trend chart (12 months) | Medium | 5 | 4 |
| US-027 | As a user, I see AI-generated summary text | High | 5 | 5 |
| US-028 | As a user, I see my Financial Health Score on dashboard | Critical | 3 | 5 |
| US-029 | As a user, I see upcoming payments/expenses | Medium | 3 | 4 |
| US-030 | As a user, I have quick-action buttons | Medium | 2 | 4 |
| US-031 | As a user, the dashboard updates in real-time after adding transactions | Medium | 3 | 5 |

#### EP-003: Transaction Management

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-040 | As a user, I can add a transaction manually | Critical | 5 | 2 |
| US-041 | As a user, I can view my transaction list | Critical | 5 | 2 |
| US-042 | As a user, I can search transactions by text | High | 3 | 3 |
| US-043 | As a user, I can filter transactions by date range | High | 3 | 3 |
| US-044 | As a user, I can filter transactions by category | High | 2 | 3 |
| US-045 | As a user, I can filter by amount range | Medium | 2 | 3 |
| US-046 | As a user, I can edit a transaction | Critical | 3 | 2 |
| US-047 | As a user, I can delete a transaction | Critical | 2 | 2 |
| US-048 | As a user, I can import transactions from CSV | Critical | 8 | 2 |
| US-049 | As a user, I can import from Excel (.xlsx) | High | 5 | 3 |
| US-050 | As a user, imported transactions get AI-suggested categories | High | 5 | 4 |
| US-051 | As a user, I can bulk-edit transaction categories | Medium | 5 | 5 |
| US-052 | As a user, I can add tags to transactions | Medium | 3 | 5 |
| US-053 | As a user, I can add notes to transactions | Low | 2 | 5 |
| US-054 | As a user, the system detects recurring transactions | Medium | 5 | 5 |
| US-055 | As a user, I can create categorization rules | Medium | 5 | 5 |
| US-056 | As a user, I can split a transaction across categories | Low | 3 | V1.5 |
| US-057 | As a user, I can import Israeli bank CSV formats | High | 5 | 3 |
| US-058 | As a user, I can import Israeli credit card CSV formats | High | 5 | V1.5 |

#### EP-004: Budget System

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-060 | As a user, I can set monthly budget per category | Critical | 5 | 5 |
| US-061 | As a user, I see budget vs actual spending per category | Critical | 5 | 5 |
| US-062 | As a user, I see overall budget utilization | High | 3 | 5 |
| US-063 | As a user, I see a visual indicator when approaching budget limit | High | 3 | 5 |
| US-064 | As a user, I receive alert when exceeding budget | Medium | 3 | 6 |
| US-065 | As a user, I can copy last month's budget to current month | Medium | 2 | 6 |
| US-066 | As a user, unused budget rolls over to next month | Low | 3 | V1.5 |

#### EP-005: AI CFO Chat

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-070 | As a user, I can open an AI chat interface | Critical | 5 | 4 |
| US-071 | As a user, I can ask questions in Hebrew and get Hebrew answers | Critical | 8 | 4 |
| US-072 | As a user, I can ask "how much did I spend on X" | Critical | 5 | 4 |
| US-073 | As a user, I can ask "what's my net worth" | High | 3 | 4 |
| US-074 | As a user, I can ask "can I afford X" | High | 5 | 5 |
| US-075 | As a user, AI provides data-grounded answers (not hallucinations) | Critical | 8 | 4 |
| US-076 | As a user, AI shows charts/data inline in chat | Medium | 5 | 5 |
| US-077 | As a user, AI suggests follow-up questions | Medium | 3 | 5 |
| US-078 | As a user, I can view conversation history | Medium | 3 | 5 |
| US-079 | As a user, AI remembers context within a conversation | High | 5 | 5 |
| US-080 | As a user, AI responses stream in real-time (not wait for full) | Medium | 5 | 6 |
| US-081 | As a user, AI remembers my goals and priorities across conversations | Medium | 8 | V1.5 |
| US-082 | As a user, AI proactively alerts me about issues | High | 8 | V1.5 |

#### EP-006: Financial Health Score

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-090 | As a user, I see my financial health score (0-100) | Critical | 8 | 5 |
| US-091 | As a user, I see score breakdown by category | High | 5 | 5 |
| US-092 | As a user, AI explains why my score is what it is | High | 5 | 5 |
| US-093 | As a user, I see top 3 ways to improve my score | High | 5 | 5 |
| US-094 | As a user, I see my score history over time | Medium | 3 | 6 |
| US-095 | As a user, I see how my score changed vs last month | Medium | 2 | 6 |

#### EP-007: Goals System

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-100 | As a user, I can create a savings goal with target amount and date | Critical | 5 | 6 |
| US-101 | As a user, I see progress toward each goal | Critical | 3 | 6 |
| US-102 | As a user, I see monthly contribution needed to reach goal | High | 3 | 6 |
| US-103 | As a user, I see estimated completion date at current rate | High | 3 | 6 |
| US-104 | As a user, I can add contributions to a goal | High | 3 | 6 |
| US-105 | As a user, I see success probability for each goal | Medium | 5 | 6 |
| US-106 | As a user, I can choose from goal templates (wedding, apartment, etc.) | Medium | 3 | V1.5 |
| US-107 | As a user, AI suggests goal adjustments | Medium | 5 | V1.5 |

#### EP-008: Reporting

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-110 | As a user, I can view a monthly financial report | High | 8 | 6 |
| US-111 | As a user, the report includes AI-generated summary | High | 5 | 6 |
| US-112 | As a user, I see income, expenses, and savings in the report | High | 3 | 6 |
| US-113 | As a user, I see category-by-category breakdown | Medium | 3 | 6 |
| US-114 | As a user, I can export report as PDF | Medium | 5 | V1.5 |
| US-115 | As a user, I can generate quarterly and annual reports | Medium | 5 | V1.5 |

#### EP-009: Couple Mode

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-120 | As a user, I can create a household | High | 3 | V1.5 |
| US-121 | As a user, I can invite my partner via email | High | 5 | V1.5 |
| US-122 | As a partner, I can join a household | High | 3 | V1.5 |
| US-123 | As a couple, we see a combined dashboard | High | 8 | V1.5 |
| US-124 | As a couple, we can create shared goals | High | 5 | V1.5 |
| US-125 | As a couple, we can set expense splitting rules | Medium | 5 | V1.5 |
| US-126 | As a user, my personal transactions remain private unless shared | Critical | 5 | V1.5 |
| US-127 | As a couple, we see a joint monthly report | Medium | 5 | V1.5 |

#### EP-020: Infrastructure & DevOps

| ID | Story | Priority | Points | Sprint |
|----|-------|----------|--------|--------|
| US-200 | Set up monorepo with frontend and backend | Critical | 3 | 1 |
| US-201 | Docker Compose for local development | Critical | 3 | 1 |
| US-202 | PostgreSQL database setup with migrations | Critical | 5 | 1 |
| US-203 | Redis setup for caching and sessions | Critical | 3 | 1 |
| US-204 | CI pipeline (lint + test + build) | Critical | 5 | 1 |
| US-205 | CD pipeline to staging | High | 5 | 3 |
| US-206 | CD pipeline to production | High | 5 | 7 |
| US-207 | Nginx reverse proxy configuration | High | 3 | 3 |
| US-208 | Monitoring setup (Prometheus + Grafana) | Medium | 5 | 6 |
| US-209 | Error tracking (Sentry) | High | 3 | 4 |
| US-210 | Log aggregation | Medium | 5 | 6 |
| US-211 | Database backup automation | High | 3 | 5 |
| US-212 | SSL certificate automation | High | 2 | 3 |

---

## Sprint Plan (2-Week Sprints)

### Sprint 1 (Weeks 1-2): Foundation
**Goal**: Project running end-to-end, auth works

- US-200: Monorepo setup
- US-201: Docker Compose
- US-202: PostgreSQL + migrations
- US-203: Redis setup
- US-204: CI pipeline
- US-001: Register with email
- US-002: Login with email
- US-003: Google OAuth
- US-007: RTL layout

**Demo**: User can register → login → see empty dashboard (RTL Hebrew)

### Sprint 2 (Weeks 3-4): Data Layer
**Goal**: Transactions can be created and imported

- US-040: Manual transaction entry
- US-041: Transaction list view
- US-046: Edit transaction
- US-047: Delete transaction
- US-048: CSV import
- US-057: Israeli bank format support
- US-004: Password reset
- US-006: Language switching

**Demo**: User can import bank CSV → see transactions listed → edit categories

### Sprint 3 (Weeks 5-6): Dashboard
**Goal**: Meaningful financial overview

- US-020: Net worth on dashboard
- US-021: Monthly income/expenses
- US-022: Cash flow card
- US-023: Savings rate
- US-024: Expense donut chart
- US-042: Search transactions
- US-043: Filter by date
- US-044: Filter by category
- US-049: Excel import
- US-205: Staging deployment
- US-207: Nginx
- US-212: SSL

**Demo**: After import, user sees full financial dashboard with charts

### Sprint 4 (Weeks 7-8): AI Chat Foundation
**Goal**: User can talk to AI about their finances

- US-070: AI chat interface
- US-071: Hebrew conversation
- US-072: "How much did I spend on X"
- US-073: "What's my net worth"
- US-075: Data-grounded answers
- US-025: Income vs expense chart (6 months)
- US-029: Upcoming payments
- US-030: Quick action buttons
- US-050: AI categorization suggestions
- US-209: Sentry error tracking

**Demo**: User asks "כמה הוצאתי על אוכל" → gets accurate Hebrew answer with numbers

### Sprint 5 (Weeks 9-10): Score & Budget
**Goal**: Financial health visible, budgeting works

- US-028: Score on dashboard
- US-090: Health score calculation
- US-091: Score breakdown
- US-092: AI score explanation
- US-093: Improvement suggestions
- US-060: Set budget per category
- US-061: Budget vs actual
- US-062: Overall utilization
- US-063: Approaching limit indicator
- US-074: "Can I afford X" AI
- US-076: Charts in AI chat
- US-077: Follow-up suggestions
- US-078: Conversation history
- US-079: Context within conversation
- US-027: AI summary on dashboard
- US-031: Real-time dashboard updates
- US-211: Database backups

**Demo**: User sees score of 62, AI explains why, budget tracking works

### Sprint 6 (Weeks 11-12): Goals & Reports
**Goal**: Goal tracking and reporting MVP complete

- US-100: Create savings goal
- US-101: Goal progress
- US-102: Monthly contribution needed
- US-103: Estimated completion
- US-104: Add contributions
- US-105: Success probability
- US-110: Monthly report
- US-111: AI report summary
- US-112: Report income/expenses
- US-113: Category breakdown
- US-094: Score history
- US-095: Score change
- US-051: Bulk edit categories
- US-052: Tags
- US-054: Recurring detection
- US-055: Categorization rules
- US-064: Budget breach alert
- US-065: Copy budget from last month
- US-080: AI streaming
- US-208: Monitoring
- US-210: Log aggregation

**Demo**: Full MVP feature set working end-to-end

### Sprint 7 (Weeks 13-14): Security & Quality
**Goal**: Production-ready security

- US-010: Account deletion
- US-011: Data export
- Security audit tasks
- Performance optimization
- Load testing
- Privacy policy
- Terms of service
- Input validation hardening
- Rate limiting

### Sprint 8 (Weeks 15-16): Launch
**Goal**: Public launch

- Landing page
- Onboarding flow
- Demo data
- Beta testing
- Bug fixes
- US-206: Production deployment
- Analytics
- Launch marketing

---

## Team Structure

| Role | Count | Responsibilities |
|------|-------|-----------------|
| Full Stack Lead | 1 | Architecture, code review, backend core |
| Frontend Developer | 2 | Next.js, UI components, charts, RTL |
| Backend Developer | 1 | FastAPI, services, import engine |
| AI/ML Engineer | 1 | OpenAI integration, prompts, RAG, engines |
| DevOps Engineer | 0.5 | CI/CD, Docker, monitoring, security |
| UI/UX Designer | 1 | Design system, wireframes, user testing |
| QA Engineer | 0.5 | Testing strategy, automation, manual QA |
| Product Manager | 1 | Backlog, priorities, stakeholder management |

**Total**: ~8 people for MVP delivery in 16 weeks
