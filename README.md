# מאזן (Ma'azan) – AI-Powered Financial Operating System

> The most advanced personal finance platform for Israeli households.

## 🎯 What is Maazan?

מאזן is an AI-native Financial Operating System that gives every Israeli household access to a personal CFO. It transforms complex financial data into simple insights, actionable recommendations, and automated planning — all in native Hebrew.

**Not a budgeting app. A financial operating system.**

---

## 📚 Documentation Index

| # | Document | Description |
|---|----------|-------------|
| 1 | [Product Vision](docs/01-product-vision.md) | Vision, mission, market opportunity, competitive analysis |
| 2 | [User Personas & Journeys](docs/02-user-personas-journeys.md) | 6 personas, 5 detailed user journeys |
| 3 | [Feature Breakdown](docs/03-feature-breakdown.md) | All 14 modules with detailed specifications |
| 4 | [Database Schema & ERD](docs/04-database-schema.md) | Complete PostgreSQL schema, ERD diagram, Redis cache |
| 5 | [API Design](docs/05-api-design.md) | Full REST API specification with examples |
| 6 | [Folder Structure](docs/06-folder-structure.md) | Complete monorepo structure (Frontend + Backend) |
| 7 | [Design System & Wireframes](docs/07-design-system.md) | Colors, typography, components, 5 wireframes, RTL specs |
| 8 | [AI Architecture](docs/08-ai-architecture.md) | AI CFO agent, RAG, engines, memory, tools |
| 9 | [Security Architecture](docs/09-security-architecture.md) | Auth, encryption, RBAC, audit, compliance |
| 10 | [Roadmap & Backlog](docs/10-roadmap-backlog.md) | MVP definition, 8 sprints, full Jira backlog |
| 11 | [Monetization & GTM](docs/11-monetization-gtm.md) | Pricing, revenue projections, go-to-market plan |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, TypeScript, TailwindCSS, Shadcn UI |
| Backend | FastAPI, Python 3.12, SQLAlchemy 2.0 |
| Database | PostgreSQL 16, Redis 7, TimescaleDB |
| AI | OpenAI GPT-4o, LangChain, pgvector (RAG) |
| Infrastructure | Docker, Nginx, GitHub Actions |
| Auth | JWT (RS256), Google OAuth, Microsoft OAuth |
| Monitoring | Prometheus, Grafana, Sentry |

---

## 🚀 Quick Start (Development)

```bash
# Clone repository
git clone https://github.com/your-org/maazan.git
cd maazan

# Start all services
docker compose up -d

# Frontend (http://localhost:3000)
cd frontend && npm install && npm run dev

# Backend (http://localhost:8000)
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload

# Run migrations
cd backend && alembic upgrade head

# Seed categories
cd backend && python scripts/seed_categories.py
```

---

## 🏗 Architecture

```
Users → CDN/WAF → Nginx → Next.js (SSR) → FastAPI → PostgreSQL
                                              ↓
                                        OpenAI API
                                              ↓
                                     Redis (Cache/Sessions)
```

---

## 📋 MVP Timeline

- **Weeks 1-4**: Foundation (auth, transactions, import)
- **Weeks 5-8**: Dashboard + AI Chat integration
- **Weeks 9-12**: Score, budgets, goals, reports
- **Weeks 13-16**: Security hardening + launch

---

## 🌍 Languages

- 🇮🇱 Hebrew (RTL) – Primary
- 🇬🇧 English (LTR) – Secondary

---

## 📄 License

Proprietary. All rights reserved.
