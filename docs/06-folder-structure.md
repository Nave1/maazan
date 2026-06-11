# מאזן – Project Folder Structure

## Monorepo Structure

```
maazan/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                    # CI pipeline (lint, test, build)
│   │   ├── cd-staging.yml            # Deploy to staging
│   │   ├── cd-production.yml         # Deploy to production
│   │   └── security-scan.yml         # Dependency & code security scanning
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── ISSUE_TEMPLATE/
│       ├── bug_report.md
│       └── feature_request.md
│
├── docker/
│   ├── docker-compose.yml            # Local development stack
│   ├── docker-compose.prod.yml       # Production stack
│   ├── frontend/
│   │   └── Dockerfile
│   ├── backend/
│   │   └── Dockerfile
│   └── nginx/
│       ├── Dockerfile
│       ├── nginx.conf
│       └── ssl/
│
├── frontend/                          # Next.js Application
│   ├── public/
│   │   ├── fonts/
│   │   │   ├── heebo-regular.woff2   # Hebrew font
│   │   │   ├── heebo-bold.woff2
│   │   │   └── inter-variable.woff2  # English font
│   │   ├── icons/
│   │   ├── images/
│   │   └── locales/
│   │       ├── he.json               # Hebrew translations
│   │       └── en.json               # English translations
│   │
│   ├── src/
│   │   ├── app/                      # Next.js App Router
│   │   │   ├── (auth)/               # Auth route group
│   │   │   │   ├── login/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── register/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── layout.tsx
│   │   │   │
│   │   │   ├── (dashboard)/          # Main app route group
│   │   │   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   │   │   ├── page.tsx          # Main dashboard
│   │   │   │   ├── transactions/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── import/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── budget/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── goals/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── investments/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── pension/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── mortgage/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── timeline/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── simulator/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── life-events/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── reports/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── couple/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── invite/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── ai-cfo/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       ├── page.tsx
│   │   │   │       ├── profile/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── security/
│   │   │   │       │   └── page.tsx
│   │   │   │       ├── notifications/
│   │   │   │       │   └── page.tsx
│   │   │   │       └── billing/
│   │   │   │           └── page.tsx
│   │   │   │
│   │   │   ├── onboarding/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx            # Root layout
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   └── globals.css
│   │   │
│   │   ├── components/               # Shared components
│   │   │   ├── ui/                   # Shadcn UI primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   └── ...
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── header.tsx
│   │   │   │   ├── mobile-nav.tsx
│   │   │   │   └── language-switcher.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── financial-score-gauge.tsx
│   │   │   │   ├── net-worth-card.tsx
│   │   │   │   ├── cash-flow-card.tsx
│   │   │   │   ├── expense-breakdown-chart.tsx
│   │   │   │   ├── income-expense-chart.tsx
│   │   │   │   ├── ai-insights-panel.tsx
│   │   │   │   └── quick-actions.tsx
│   │   │   ├── transactions/
│   │   │   │   ├── transaction-list.tsx
│   │   │   │   ├── transaction-form.tsx
│   │   │   │   ├── transaction-filters.tsx
│   │   │   │   ├── import-wizard.tsx
│   │   │   │   └── category-selector.tsx
│   │   │   ├── goals/
│   │   │   │   ├── goal-card.tsx
│   │   │   │   ├── goal-form.tsx
│   │   │   │   ├── goal-progress-ring.tsx
│   │   │   │   └── goal-forecast-chart.tsx
│   │   │   ├── investments/
│   │   │   │   ├── portfolio-allocation.tsx
│   │   │   │   ├── performance-chart.tsx
│   │   │   │   ├── investment-card.tsx
│   │   │   │   └── add-investment-form.tsx
│   │   │   ├── pension/
│   │   │   │   ├── pension-summary.tsx
│   │   │   │   ├── contribution-chart.tsx
│   │   │   │   └── retirement-projection.tsx
│   │   │   ├── mortgage/
│   │   │   │   ├── mortgage-overview.tsx
│   │   │   │   ├── track-breakdown.tsx
│   │   │   │   ├── amortization-chart.tsx
│   │   │   │   └── refinance-simulator.tsx
│   │   │   ├── ai/
│   │   │   │   ├── chat-interface.tsx
│   │   │   │   ├── chat-message.tsx
│   │   │   │   ├── chat-input.tsx
│   │   │   │   ├── insight-card.tsx
│   │   │   │   └── suggestion-chips.tsx
│   │   │   ├── timeline/
│   │   │   │   ├── timeline-view.tsx
│   │   │   │   ├── milestone-node.tsx
│   │   │   │   └── timeline-connector.tsx
│   │   │   ├── simulator/
│   │   │   │   ├── scenario-builder.tsx
│   │   │   │   ├── forecast-chart.tsx
│   │   │   │   └── impact-table.tsx
│   │   │   ├── charts/
│   │   │   │   ├── area-chart.tsx
│   │   │   │   ├── bar-chart.tsx
│   │   │   │   ├── donut-chart.tsx
│   │   │   │   ├── line-chart.tsx
│   │   │   │   ├── sparkline.tsx
│   │   │   │   └── gauge-chart.tsx
│   │   │   └── shared/
│   │   │       ├── currency-display.tsx
│   │   │       ├── percentage-badge.tsx
│   │   │       ├── trend-indicator.tsx
│   │   │       ├── date-picker.tsx
│   │   │       ├── file-upload.tsx
│   │   │       ├── empty-state.tsx
│   │   │       └── loading-skeleton.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-auth.ts
│   │   │   ├── use-dashboard.ts
│   │   │   ├── use-transactions.ts
│   │   │   ├── use-goals.ts
│   │   │   ├── use-investments.ts
│   │   │   ├── use-pension.ts
│   │   │   ├── use-mortgage.ts
│   │   │   ├── use-ai-chat.ts
│   │   │   ├── use-financial-score.ts
│   │   │   ├── use-notifications.ts
│   │   │   ├── use-locale.ts
│   │   │   ├── use-rtl.ts
│   │   │   └── use-websocket.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api-client.ts          # Axios/fetch wrapper
│   │   │   ├── auth.ts                # Auth utilities
│   │   │   ├── constants.ts
│   │   │   ├── formatters.ts          # Currency, date, number formatting
│   │   │   ├── validators.ts          # Zod schemas
│   │   │   ├── utils.ts               # General utilities
│   │   │   ├── i18n.ts                # Internationalization config
│   │   │   └── chart-config.ts        # Chart theme/config
│   │   │
│   │   ├── stores/                    # Zustand stores
│   │   │   ├── auth-store.ts
│   │   │   ├── dashboard-store.ts
│   │   │   ├── transaction-store.ts
│   │   │   ├── notification-store.ts
│   │   │   └── ui-store.ts
│   │   │
│   │   ├── types/
│   │   │   ├── api.ts                 # API response types
│   │   │   ├── models.ts             # Domain model types
│   │   │   ├── forms.ts              # Form types
│   │   │   └── charts.ts             # Chart data types
│   │   │
│   │   └── styles/
│   │       ├── themes/
│   │       │   ├── light.css
│   │       │   └── dark.css
│   │       └── rtl-overrides.css
│   │
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   ├── components.json               # Shadcn UI config
│   └── postcss.config.js
│
├── backend/                           # FastAPI Application
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                   # FastAPI app entry
│   │   ├── config.py                 # Settings & env vars
│   │   ├── dependencies.py           # Dependency injection
│   │   │
│   │   ├── api/                      # API routes
│   │   │   ├── __init__.py
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py         # Main router aggregator
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   ├── households.py
│   │   │   │   ├── accounts.py
│   │   │   │   ├── transactions.py
│   │   │   │   ├── categories.py
│   │   │   │   ├── budgets.py
│   │   │   │   ├── goals.py
│   │   │   │   ├── investments.py
│   │   │   │   ├── pension.py
│   │   │   │   ├── mortgages.py
│   │   │   │   ├── ai_chat.py
│   │   │   │   ├── financial_score.py
│   │   │   │   ├── timeline.py
│   │   │   │   ├── simulator.py
│   │   │   │   ├── reports.py
│   │   │   │   ├── notifications.py
│   │   │   │   └── dashboard.py
│   │   │   └── websocket/
│   │   │       ├── __init__.py
│   │   │       └── ai_stream.py
│   │   │
│   │   ├── models/                   # SQLAlchemy models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── household.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── category.py
│   │   │   ├── budget.py
│   │   │   ├── goal.py
│   │   │   ├── investment.py
│   │   │   ├── pension.py
│   │   │   ├── mortgage.py
│   │   │   ├── ai.py
│   │   │   ├── notification.py
│   │   │   ├── report.py
│   │   │   ├── simulation.py
│   │   │   └── audit.py
│   │   │
│   │   ├── schemas/                  # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── user.py
│   │   │   ├── household.py
│   │   │   ├── account.py
│   │   │   ├── transaction.py
│   │   │   ├── category.py
│   │   │   ├── budget.py
│   │   │   ├── goal.py
│   │   │   ├── investment.py
│   │   │   ├── pension.py
│   │   │   ├── mortgage.py
│   │   │   ├── ai.py
│   │   │   ├── notification.py
│   │   │   ├── report.py
│   │   │   ├── dashboard.py
│   │   │   └── common.py
│   │   │
│   │   ├── services/                 # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py
│   │   │   ├── user_service.py
│   │   │   ├── household_service.py
│   │   │   ├── account_service.py
│   │   │   ├── transaction_service.py
│   │   │   ├── categorization_service.py
│   │   │   ├── budget_service.py
│   │   │   ├── goal_service.py
│   │   │   ├── investment_service.py
│   │   │   ├── pension_service.py
│   │   │   ├── mortgage_service.py
│   │   │   ├── financial_score_service.py
│   │   │   ├── timeline_service.py
│   │   │   ├── simulator_service.py
│   │   │   ├── report_service.py
│   │   │   ├── notification_service.py
│   │   │   └── import_service.py
│   │   │
│   │   ├── ai/                       # AI/ML Layer
│   │   │   ├── __init__.py
│   │   │   ├── cfo_agent.py          # Main AI CFO orchestrator
│   │   │   ├── conversation.py       # Conversation management
│   │   │   ├── memory.py             # AI memory management
│   │   │   ├── prompts/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── system_prompt.py
│   │   │   │   ├── financial_advisor.py
│   │   │   │   ├── categorization.py
│   │   │   │   ├── report_summary.py
│   │   │   │   └── hebrew_templates.py
│   │   │   ├── tools/                # AI function calling tools
│   │   │   │   ├── __init__.py
│   │   │   │   ├── query_transactions.py
│   │   │   │   ├── calculate_budget.py
│   │   │   │   ├── analyze_spending.py
│   │   │   │   ├── project_goals.py
│   │   │   │   ├── simulate_scenario.py
│   │   │   │   └── generate_report.py
│   │   │   ├── rag/                  # RAG architecture
│   │   │   │   ├── __init__.py
│   │   │   │   ├── embeddings.py
│   │   │   │   ├── retriever.py
│   │   │   │   └── financial_knowledge.py
│   │   │   └── engines/
│   │   │       ├── __init__.py
│   │   │       ├── forecasting.py     # Financial forecasting
│   │   │       ├── scoring.py         # Health score engine
│   │   │       ├── recommendation.py  # Recommendation engine
│   │   │       └── anomaly.py         # Anomaly detection
│   │   │
│   │   ├── core/                     # Core utilities
│   │   │   ├── __init__.py
│   │   │   ├── security.py           # JWT, hashing, encryption
│   │   │   ├── database.py           # DB connection & session
│   │   │   ├── redis.py              # Redis connection
│   │   │   ├── middleware.py         # CORS, rate limiting, etc.
│   │   │   ├── exceptions.py         # Custom exceptions
│   │   │   ├── pagination.py         # Pagination utilities
│   │   │   └── permissions.py        # RBAC logic
│   │   │
│   │   ├── tasks/                    # Background tasks (Celery/ARQ)
│   │   │   ├── __init__.py
│   │   │   ├── worker.py
│   │   │   ├── import_processor.py
│   │   │   ├── report_generator.py
│   │   │   ├── score_calculator.py
│   │   │   ├── notification_sender.py
│   │   │   └── price_updater.py
│   │   │
│   │   └── utils/
│   │       ├── __init__.py
│   │       ├── israeli_banks.py       # Bank format parsers
│   │       ├── currency.py            # Currency conversion
│   │       ├── date_utils.py          # Hebrew calendar, holidays
│   │       └── validators.py          # Israeli-specific validators
│   │
│   ├── migrations/                   # Alembic migrations
│   │   ├── env.py
│   │   ├── alembic.ini
│   │   └── versions/
│   │       └── 001_initial_schema.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── conftest.py
│   │   ├── test_auth.py
│   │   ├── test_transactions.py
│   │   ├── test_goals.py
│   │   ├── test_ai.py
│   │   ├── test_scoring.py
│   │   └── test_import.py
│   │
│   ├── scripts/
│   │   ├── seed_categories.py        # Seed Israeli categories
│   │   ├── seed_demo_data.py         # Demo data for testing
│   │   └── migrate.py
│   │
│   ├── requirements.txt
│   ├── requirements-dev.txt
│   ├── pyproject.toml
│   └── Makefile
│
├── docs/                             # Documentation
│   ├── 01-product-vision.md
│   ├── 02-user-personas-journeys.md
│   ├── 03-feature-breakdown.md
│   ├── 04-database-schema.md
│   ├── 05-api-design.md
│   ├── 06-folder-structure.md
│   ├── 07-design-system.md
│   ├── 08-ai-architecture.md
│   ├── 09-security-architecture.md
│   ├── 10-roadmap-backlog.md
│   └── 11-monetization-gtm.md
│
├── .env.example
├── .gitignore
├── README.md
└── LICENSE
```

---

## Key Architecture Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Monorepo | Single repo | Simplified CI/CD, shared types, atomic deploys |
| Frontend routing | Next.js App Router | Server components, streaming, layouts |
| State management | Zustand | Lightweight, TypeScript-native, no boilerplate |
| API client | Custom fetch wrapper | Type-safe, interceptors, error handling |
| Charts | Recharts | React-native, RTL support, customizable |
| Forms | React Hook Form + Zod | Performance, validation, type safety |
| Backend ORM | SQLAlchemy 2.0 | Async support, mature, migrations via Alembic |
| Task queue | ARQ (Redis-based) | Lightweight, async, good FastAPI integration |
| AI integration | LangChain + OpenAI | Tool calling, memory, streaming |
| File storage | S3-compatible (MinIO locally) | Reports, receipts, imports |
| Email | Resend | Developer-friendly, good Hebrew support |
| Payments | Tranzila / PayPlus | Israeli payment processor |
