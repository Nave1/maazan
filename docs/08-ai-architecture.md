# מאזן – AI Architecture

## AI System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERFACE                             │
│  (Chat / Proactive Alerts / Insights / Reports / Simulator)      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AI CFO ORCHESTRATOR (Agent)                  │    │
│  │                                                           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Intent   │ │ Tool     │ │ Response │ │ Memory   │  │    │
│  │  │ Router   │ │ Selector │ │ Generator│ │ Manager  │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                    │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │                     AI TOOLS LAYER                         │  │
│  │                                                            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │ Query    │ │ Calculate│ │ Forecast │ │ Compare  │   │  │
│  │  │ Data     │ │ Budget   │ │ Goals    │ │ Options  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │ Simulate │ │ Generate │ │ Categorize│ │ Score    │   │  │
│  │  │ Scenario │ │ Report   │ │Transaction│ │ Health   │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │                 KNOWLEDGE & CONTEXT                         │  │
│  │                                                            │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │ User     │ │ Financial│ │ Israeli  │ │ Conver-  │   │  │
│  │  │ Financial│ │ Knowledge│ │ Context  │ │ sation   │   │  │
│  │  │ Data     │ │ Base     │ │ (RAG)    │ │ History  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              │                                    │
│  ┌───────────────────────────┼───────────────────────────────┐  │
│  │                  AI ENGINES                                │  │
│  │                                                            │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐ │  │
│  │  │ Forecasting  │ │ Scoring      │ │ Recommendation   │ │  │
│  │  │ Engine       │ │ Engine       │ │ Engine           │ │  │
│  │  └──────────────┘ └──────────────┘ └──────────────────┘ │  │
│  │  ┌──────────────┐ ┌──────────────┐                       │  │
│  │  │ Anomaly      │ │ Categorization│                      │  │
│  │  │ Detection    │ │ Engine       │                       │  │
│  │  └──────────────┘ └──────────────┘                       │  │
│  └────────────────────────────────────────────────────────────┘  │
│                                                                   │
├─────────────────────────────────────────────────────────────────┤
│               FOUNDATION: OpenAI API (GPT-4o)                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI CFO Agent Architecture

### Agent Design (LangChain-based)

```python
# Simplified agent architecture
class CFOAgent:
    """
    Main AI CFO orchestrator using ReAct pattern.
    Processes user queries through:
    1. Intent detection
    2. Context gathering (memory + data)
    3. Tool selection and execution
    4. Response generation in Hebrew/English
    """
    
    model: ChatOpenAI  # GPT-4o
    memory: ConversationBufferWindowMemory
    tools: List[BaseTool]
    system_prompt: str
    user_context: UserFinancialContext
```

### System Prompt Structure

```
You are מאזן (Ma'azan), a personal AI CFO for Israeli households.

IDENTITY:
- You are a warm, professional financial advisor
- You speak natural Hebrew (or English based on user preference)
- You explain complex concepts simply
- You are proactive and caring about the user's financial wellbeing

CONTEXT:
- User: {user_name}, age {age}, {employment_type}
- Household: {household_type} with {household_members}
- Income: ₪{monthly_income}/month
- Financial Score: {score}/100
- Active Goals: {goals_summary}
- Key Concerns: {user_priorities}

CAPABILITIES:
- Query user's financial data (transactions, balances, trends)
- Calculate budgets and forecasts
- Run what-if simulations
- Generate reports and summaries
- Provide Israeli-specific financial guidance
- Remember user preferences and past conversations

GUIDELINES:
- Always ground answers in user's actual data
- Provide specific numbers, not vague advice
- Use Israeli financial terminology naturally
- Flag risks proactively but don't alarm unnecessarily
- Celebrate positive progress
- Never provide specific investment recommendations (regulatory)
- Always clarify: "This is educational, not licensed financial advice"

ISRAELI CONTEXT:
- Understand: pension (pensia makifa), Keren Hishtalmut, Kupat Gemel
- Understand: Arnona, Bituach Leumi, Mas Hachnasa, Ma'am
- Understand: Tik Mashkanta structure (Prime, Kavua, Tzamud)
- Understand: Israeli salary structure (bruto/neto, hafrashot)
- Understand: Cost of living by Israeli city
- Understand: Reserve duty (miluim) financial impact
```

---

## AI Tools (Function Calling)

### Tool Definitions

```python
@tool
def query_transactions(
    start_date: str,
    end_date: str,
    category: Optional[str] = None,
    merchant: Optional[str] = None,
    min_amount: Optional[float] = None,
    max_amount: Optional[float] = None
) -> TransactionSummary:
    """Query user's transactions with filters. Returns summary with totals."""

@tool
def calculate_budget_status(month: Optional[str] = None) -> BudgetStatus:
    """Get current budget status: allocated vs spent per category."""

@tool
def analyze_spending_patterns(
    period: str,  # 'month', 'quarter', 'year'
    compare_to: Optional[str] = None  # 'previous_period', 'same_period_last_year'
) -> SpendingAnalysis:
    """Analyze spending patterns and identify trends, anomalies."""

@tool
def project_goal_completion(goal_id: str) -> GoalProjection:
    """Calculate goal completion probability and timeline."""

@tool
def simulate_scenario(
    scenario_type: str,
    parameters: dict
) -> SimulationResult:
    """Run what-if simulation (salary change, job loss, purchase, etc.)."""

@tool
def calculate_financial_score() -> ScoreBreakdown:
    """Calculate current financial health score with breakdown."""

@tool
def get_net_worth() -> NetWorthBreakdown:
    """Get current net worth with asset/liability breakdown."""

@tool
def analyze_recurring_expenses() -> RecurringAnalysis:
    """Identify and analyze recurring expenses, find optimization opportunities."""

@tool
def calculate_retirement_projection() -> RetirementProjection:
    """Project retirement readiness based on current pension, savings, expenses."""

@tool
def mortgage_analysis() -> MortgageAnalysis:
    """Analyze mortgage status, refinance opportunities, payoff strategies."""

@tool
def generate_report_data(
    report_type: str,
    period_start: str,
    period_end: str
) -> ReportData:
    """Generate data for financial reports."""
```

---

## AI Memory System

### Memory Architecture

```
┌─────────────────────────────────────────────┐
│              AI MEMORY LAYERS                 │
├─────────────────────────────────────────────┤
│                                               │
│  Layer 1: CONVERSATION MEMORY (Short-term)   │
│  ├── Current conversation context            │
│  ├── Last 20 messages (sliding window)       │
│  └── Stored in: Redis (TTL: 2 hours)         │
│                                               │
│  Layer 2: USER MEMORY (Long-term)            │
│  ├── Stated goals & priorities               │
│  ├── Family structure                         │
│  ├── Risk tolerance                           │
│  ├── Past decisions & outcomes               │
│  ├── Preferences (communication style)       │
│  └── Stored in: PostgreSQL (ai_memory table) │
│                                               │
│  Layer 3: FINANCIAL KNOWLEDGE (RAG)          │
│  ├── Israeli tax rules                       │
│  ├── Pension regulations                     │
│  ├── Mortgage guidelines                     │
│  ├── Investment basics                       │
│  ├── Bituach Leumi rules                    │
│  └── Stored in: Vector DB (pgvector)         │
│                                               │
└─────────────────────────────────────────────┘
```

### Memory Operations

```python
class AIMemory:
    async def remember(self, user_id: str, category: str, key: str, value: str):
        """Store a fact about the user for future reference."""
        
    async def recall(self, user_id: str, query: str) -> List[MemoryItem]:
        """Retrieve relevant memories for current context."""
        
    async def forget(self, user_id: str, key: str):
        """Remove outdated or incorrect memory."""
        
    async def summarize_context(self, user_id: str) -> str:
        """Generate a context summary for the system prompt."""
```

### Memory Examples

| Category | Key | Value |
|----------|-----|-------|
| goal | apartment_purchase | "Planning to buy apartment in Ramat Gan, budget ₪2.5M, timeline 4 years" |
| preference | risk_tolerance | "Moderate-conservative, worried about market volatility" |
| life_event | wedding | "Wedding planned for May 2027, 350 guests, budget ₪120K" |
| decision | keren_hishtalmut | "Decided to not withdraw KH at maturity, reinvest in ETF" |
| context | family | "Married, 2 kids (ages 2 and 5), wife works part-time" |

---

## RAG Architecture (Israeli Financial Knowledge)

### Knowledge Base Structure

```
financial_knowledge/
├── tax/
│   ├── income_tax_brackets_2026.md
│   ├── capital_gains_tax.md
│   ├── tax_credits_and_points.md
│   └── self_employed_tax.md
├── pension/
│   ├── pension_types.md
│   ├── keren_hishtalmut_rules.md
│   ├── kupat_gemel_types.md
│   ├── employer_obligations.md
│   └── withdrawal_rules.md
├── mortgage/
│   ├── track_types.md
│   ├── eligibility.md
│   ├── government_programs.md
│   └── refinancing.md
├── banking/
│   ├── account_types.md
│   ├── fee_structures.md
│   └── overdraft_rules.md
├── insurance/
│   ├── bituach_leumi.md
│   ├── health_insurance.md
│   └── life_insurance.md
├── investing/
│   ├── tase_basics.md
│   ├── etf_guide.md
│   ├── mutual_funds_israel.md
│   └── tax_efficient_investing.md
└── life_events/
    ├── wedding_costs_israel.md
    ├── apartment_purchase_process.md
    ├── child_expenses.md
    └── army_service_impact.md
```

### Embedding & Retrieval

```python
class FinancialKnowledgeRAG:
    """
    RAG system for Israeli financial knowledge.
    Uses pgvector for storage, OpenAI embeddings for encoding.
    """
    
    embedding_model = "text-embedding-3-small"
    chunk_size = 500  # tokens
    chunk_overlap = 50
    top_k = 5  # Number of chunks to retrieve
    
    async def query(self, question: str, user_context: dict) -> str:
        """
        1. Embed the question
        2. Retrieve relevant knowledge chunks
        3. Filter by relevance score (threshold: 0.75)
        4. Return formatted context for LLM
        """
```

---

## AI Engines

### 1. Forecasting Engine

```python
class ForecastingEngine:
    """
    Financial forecasting using statistical models + LLM interpretation.
    """
    
    def forecast_cash_flow(self, months_ahead: int = 3) -> CashFlowForecast:
        """
        Method: Time-series analysis on historical transactions
        - Identifies recurring patterns
        - Accounts for known upcoming expenses
        - Adjusts for seasonal spending (holidays, summer)
        - Returns: predicted income, expenses, net per month
        """
    
    def forecast_goal_completion(self, goal_id: str) -> GoalForecast:
        """
        Method: Monte Carlo simulation
        - Input: current savings rate, volatility, goal target
        - Simulates 1000 scenarios with random variations
        - Returns: probability distribution of completion dates
        """
    
    def forecast_retirement(self, user_id: str) -> RetirementForecast:
        """
        Method: Compound growth model + expense projection
        - Aggregates all pension/savings vehicles
        - Projects growth at historical average returns
        - Estimates future expenses with inflation
        - Returns: monthly pension vs expenses at retirement age
        """
```

### 2. Financial Health Scoring Engine

```python
class ScoringEngine:
    """
    Proprietary financial health scoring (0-100).
    """
    
    WEIGHTS = {
        'savings_rate': 0.20,
        'debt_management': 0.20,
        'emergency_fund': 0.15,
        'budget_discipline': 0.15,
        'goal_achievement': 0.10,
        'investment_health': 0.10,
        'cash_flow_stability': 0.10,
    }
    
    def calculate_savings_rate_score(self) -> int:
        """
        0-100 based on:
        - 0%: score 0
        - 10%: score 50
        - 20%: score 80
        - 30%+: score 100
        """
    
    def calculate_debt_management_score(self) -> int:
        """
        0-100 based on:
        - Debt-to-income ratio
        - All payments on time (bonus)
        - Debt decreasing month-over-month (bonus)
        - High-interest debt present (penalty)
        """
    
    def calculate_emergency_fund_score(self) -> int:
        """
        0-100 based on:
        - 0 months: score 0
        - 1 month: score 25
        - 3 months: score 70
        - 6 months: score 100
        """
    
    def generate_explanation(self, scores: dict, previous_scores: dict) -> str:
        """Use LLM to generate Hebrew explanation of score change."""
```

### 3. Recommendation Engine

```python
class RecommendationEngine:
    """
    Generates personalized financial recommendations.
    """
    
    def analyze_spending_optimizations(self) -> List[Recommendation]:
        """Find areas where user can save money."""
    
    def suggest_goal_adjustments(self) -> List[Recommendation]:
        """Suggest priority changes based on feasibility."""
    
    def recommend_pension_optimizations(self) -> List[Recommendation]:
        """Find fee reductions, contribution increases."""
    
    def recommend_debt_strategy(self) -> List[Recommendation]:
        """Optimal debt payoff order (avalanche vs snowball)."""
```

### 4. Anomaly Detection Engine

```python
class AnomalyDetectionEngine:
    """
    Detects unusual financial patterns for proactive alerts.
    """
    
    def detect_unusual_transactions(self) -> List[Anomaly]:
        """
        Flags:
        - Amount significantly higher than merchant average
        - New merchant in sensitive category
        - Transaction at unusual time
        - Duplicate charges
        """
    
    def detect_budget_breach_risk(self) -> List[Anomaly]:
        """Predicts budget breaches before they happen."""
    
    def detect_subscription_changes(self) -> List[Anomaly]:
        """Identifies price increases in recurring charges."""
    
    def detect_cash_flow_risk(self) -> List[Anomaly]:
        """Predicts negative cash flow situations 2-4 weeks ahead."""
```

---

## Proactive AI System

### Trigger Engine

```python
class ProactiveAlertEngine:
    """
    Runs on schedule (daily) to generate proactive insights.
    """
    
    # Daily checks
    DAILY_CHECKS = [
        'check_budget_status',          # Alert if >80% spent with >7 days left
        'check_unusual_transactions',    # Flag anomalies from today
        'check_upcoming_payments',       # Warn about large upcoming payments
        'check_cash_flow_risk',         # Predict if balance will go negative
    ]
    
    # Weekly checks
    WEEKLY_CHECKS = [
        'check_goal_progress',          # Are goals on track?
        'check_subscription_changes',    # Any price increases?
        'check_savings_consistency',     # Did user save this week?
        'generate_weekly_insight',       # One smart observation
    ]
    
    # Monthly checks
    MONTHLY_CHECKS = [
        'generate_monthly_summary',     # Full month analysis
        'recalculate_financial_score',  # Update health score
        'check_investment_rebalance',   # Portfolio drift check
        'check_pension_optimization',   # Fee/contribution check
        'update_timeline_projections',  # Refresh all forecasts
    ]
```

### Alert Priority System

| Priority | Criteria | Delivery |
|----------|----------|----------|
| Urgent | Cash flow crisis, fraud suspected | Push + SMS |
| High | Budget breach, goal derailed, unusual large expense | Push |
| Medium | Optimization opportunity, subscription change | In-app + Push |
| Low | Positive reinforcement, fun insight | In-app only |

---

## AI Conversation Flow

```
User Message → 
  │
  ├── Language Detection (Hebrew/English)
  │
  ├── Intent Classification
  │   ├── Query (asking about data)
  │   ├── Action (wants to do something)
  │   ├── Planning (future-oriented)
  │   ├── Education (wants to learn)
  │   └── Chat (general conversation)
  │
  ├── Context Assembly
  │   ├── User financial summary
  │   ├── Relevant memories
  │   ├── Conversation history
  │   └── RAG knowledge (if needed)
  │
  ├── Tool Selection & Execution
  │   ├── May call 0-3 tools
  │   └── Results formatted for LLM
  │
  ├── Response Generation
  │   ├── Natural language response
  │   ├── Data visualizations (if applicable)
  │   ├── Action buttons (if applicable)
  │   └── Follow-up suggestions
  │
  └── Memory Update
      ├── Store important facts mentioned
      └── Update user context if changed
```

---

## Model Selection & Cost Management

| Use Case | Model | Estimated Cost/User/Month |
|----------|-------|--------------------------|
| Chat conversations | GPT-4o | ~$0.50 |
| Categorization | GPT-4o-mini | ~$0.10 |
| Report summaries | GPT-4o | ~$0.15 |
| Embeddings | text-embedding-3-small | ~$0.02 |
| Proactive insights | GPT-4o-mini | ~$0.08 |

**Total estimated AI cost per active user: ~$0.85/month**

### Cost Optimization Strategies

1. **Caching**: Cache common queries (e.g., "what's my net worth") for 5 minutes
2. **Batching**: Batch proactive analysis runs (nightly job for all users)
3. **Model routing**: Use GPT-4o-mini for simple queries, GPT-4o for complex reasoning
4. **Prompt optimization**: Keep system prompts concise, use structured outputs
5. **Rate limiting**: Free tier: 20 AI queries/month; Premium: unlimited

---

## AI Safety & Guardrails

| Rule | Implementation |
|------|---------------|
| No specific investment advice | System prompt + output filter |
| No licensed financial advice | Disclaimer in every financial recommendation |
| Data privacy | AI never stores raw PII in conversation logs |
| Hallucination prevention | Always ground in user's actual data via tools |
| Hebrew quality | Post-processing check for mixed RTL/LTR issues |
| Emotional sensitivity | Tone detection – softer language when user seems stressed |
| Regulatory compliance | Cannot recommend specific stocks, funds, or products |
