# 🚀 Engineering Operations Intelligence Platform — Implementation Plan

> **MCP Hackathon Project**
> An MCP-powered platform that investigates engineering bottlenecks and discovers automation opportunities across enterprise tools.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Phase 0 — Project Scaffolding & Infrastructure](#phase-0--project-scaffolding--infrastructure)
4. [Phase 1 — MCP Data Connectors (Tool Integrations)](#phase-1--mcp-data-connectors-tool-integrations)
5. [Phase 2 — Core Intelligence Engine](#phase-2--core-intelligence-engine)
6. [Phase 3 — Feature 1: Engineering Bottleneck Investigator](#phase-3--feature-1-engineering-bottleneck-investigator)
7. [Phase 4 — Feature 2: Workflow Discovery & Automation](#phase-4--feature-2-workflow-discovery--automation)
8. [Phase 5 — Unified Dashboard (Widgets UI)](#phase-5--unified-dashboard-widgets-ui)
9. [Phase 6 — Integration Testing & Demo Preparation](#phase-6--integration-testing--demo-preparation)
10. [File/Module Map](#filemodule-map)
11. [Risk Mitigation](#risk-mitigation)
12. [Demo Script](#demo-script)

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    USER / ENGINEERING MANAGER                 │
│               (NitroStack Chat + Widget Dashboard)           │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  MCP APPLICATION (NitroStack)                 │
│                                                              │
│  ┌─────────────────┐  ┌──────────────────────────────────┐  │
│  │  MCP Tools       │  │  MCP Prompts                     │  │
│  │  (Exposed to AI) │  │  (Investigation Templates)       │  │
│  └────────┬────────┘  └──────────────┬───────────────────┘  │
│           │                          │                       │
│           ▼                          ▼                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              INTELLIGENCE ENGINE                      │   │
│  │                                                       │   │
│  │  ┌─────────────────┐  ┌─────────────────────────┐    │   │
│  │  │ Bottleneck       │  │ Workflow Discovery      │    │   │
│  │  │ Analyzer         │  │ Engine                  │    │   │
│  │  └────────┬────────┘  └────────────┬────────────┘    │   │
│  │           │                        │                  │   │
│  │           ▼                        ▼                  │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │        Signal Correlator & Scorer            │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              DATA CONNECTOR LAYER                     │   │
│  │                                                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌────────┐ ┌──────────┐  │   │
│  │  │ GitHub   │ │  Jira    │ │ Slack  │ │  CI/CD   │  │   │
│  │  │ Connector│ │ Connector│ │Connector│ │ Connector│  │   │
│  │  └──────────┘ └──────────┘ └────────┘ └──────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              WIDGETS (Next.js Dashboard)              │   │
│  │                                                       │   │
│  │  ┌─────────────┐ ┌──────────┐ ┌──────────────────┐  │   │
│  │  │ Bottleneck  │ │ Workflow │ │ Risk Dashboard   │  │   │
│  │  │ Report      │ │ Discovery│ │                  │  │   │
│  │  └─────────────┘ └──────────┘ └──────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer              | Technology                                              |
| ------------------ | ------------------------------------------------------- |
| **MCP Framework**  | NitroStack (`@nitrostack/core`) — decorators, modules   |
| **Language**       | TypeScript (strict mode)                                |
| **Runtime**        | Node.js (ES Modules)                                    |
| **Widget UI**      | Next.js 14 + React 18 (`@nitrostack/widgets`)           |
| **API Clients**    | Octokit (GitHub), Jira REST API, Slack Web API           |
| **Data Models**    | Zod schemas for all inputs/outputs                      |
| **Transport**      | STDIO (dev) / Dual STDIO+HTTP SSE (prod)                |
| **Config**         | dotenv + NitroStack ConfigModule                        |

---

## Phase 0 — Project Scaffolding & Infrastructure

> **Goal:** Transform the calculator starter template into the platform's foundation.
> **Estimated Time:** 1–2 hours

### 0.1 — Clean Up Starter Code

- Remove `src/modules/calculator/` entirely (all 4 files)
- Remove calculator widget from `src/widgets/app/`
- Update `widget-manifest.json` to remove calculator entries
- Rename server in `app.module.ts`:
  - `name: 'calculator-server'` → `name: 'eng-ops-intelligence-server'`
  - `version: '1.0.0'`

### 0.2 — Environment Configuration

Update `.env.example` and create `.env` with required API keys:

```env
# NitroStack
NITRO_LOG_LEVEL=info
NITROSTACK_APP_MODE=universal

# GitHub Integration
GITHUB_TOKEN=ghp_xxxxx
GITHUB_ORG=your-org
GITHUB_DEFAULT_REPOS=repo1,repo2

# Jira Integration
JIRA_BASE_URL=https://your-domain.atlassian.net
JIRA_EMAIL=user@example.com
JIRA_API_TOKEN=xxxxx
JIRA_PROJECT_KEY=PROJ

# Slack Integration
SLACK_BOT_TOKEN=xoxb-xxxxx
SLACK_CHANNEL_IDS=C01XXXX,C02XXXX

# CI/CD Integration (GitHub Actions used as default)
CICD_PROVIDER=github_actions
# Optional: Jenkins, CircleCI
# JENKINS_URL=https://jenkins.example.com
# JENKINS_TOKEN=xxxxx

# AI / LLM (for analysis augmentation — optional)
OPENAI_API_KEY=sk-xxxxx

# Transport
# MCP_TRANSPORT_TYPE=stdio
# PORT=3000
```

### 0.3 — Shared Types & Interfaces

Create `src/shared/` directory with:

```
src/shared/
├── types/
│   ├── github.types.ts        # PR, Commit, Review interfaces
│   ├── jira.types.ts          # Issue, Sprint, Board interfaces
│   ├── slack.types.ts         # Message, Channel, Thread interfaces
│   ├── cicd.types.ts          # Build, Pipeline, TestResult interfaces
│   ├── investigation.types.ts # Evidence, RootCause, Signal interfaces
│   └── workflow.types.ts      # WorkflowPattern, AutomationOpportunity interfaces
├── schemas/
│   └── index.ts               # Zod schemas for all MCP tool inputs/outputs
├── constants.ts               # Severity levels, risk thresholds, etc.
└── utils/
    ├── date.utils.ts          # Time-window helpers, SLA calculators
    ├── scoring.utils.ts       # Risk scoring, priority calculations
    └── correlation.utils.ts   # Signal correlation helpers
```

### 0.4 — Module Registration

Update `app.module.ts` to prepare for new module imports:

```typescript
@McpApp({
  module: AppModule,
  server: {
    name: 'eng-ops-intelligence-server',
    version: '1.0.0'
  },
  logging: { level: 'info' }
})
@Module({
  name: 'app',
  description: 'Engineering Operations Intelligence Platform',
  imports: [
    ConfigModule.forRoot(),
    // Phase 1 connectors
    GitHubConnectorModule,
    JiraConnectorModule,
    SlackConnectorModule,
    CICDConnectorModule,
    // Phase 3 & 4 feature modules
    BottleneckInvestigatorModule,
    WorkflowDiscoveryModule,
  ],
  providers: [SystemHealthCheck]
})
export class AppModule {}
```

### 0.5 — Install Dependencies

```bash
npm install @octokit/rest slack-web-api node-fetch
npm install -D @types/node
```

> **Note:** Jira and CI/CD connectors will use raw HTTP via `fetch` to minimize dependencies.

---

## Phase 1 — MCP Data Connectors (Tool Integrations)

> **Goal:** Build the data-collection layer — each connector is an independent NitroStack module that exposes MCP tools for querying external systems.
> **Estimated Time:** 4–6 hours

### 1.1 — GitHub Connector Module

**Directory:** `src/modules/github/`

```
src/modules/github/
├── github.module.ts          # @Module registration
├── github.service.ts         # Octokit wrapper, API calls
├── github.tools.ts           # MCP tools exposed to AI
├── github.resources.ts       # MCP resources (cached data snapshots)
└── github.prompts.ts         # MCP prompts for GitHub-specific queries
```

**MCP Tools to Expose:**

| Tool Name                    | Description                                  | Input Schema                                       |
| ---------------------------- | -------------------------------------------- | -------------------------------------------------- |
| `github_get_open_prs`        | List open PRs for a repo with review status  | `{ repo: string, state?: string }`                 |
| `github_get_pr_review_stats` | Get avg review time, reviewer workload       | `{ repo: string, days?: number }`                  |
| `github_get_merge_delays`    | Find PRs waiting > N days for merge          | `{ repo: string, threshold_days: number }`         |
| `github_get_commit_activity` | Commit frequency and contributor breakdown   | `{ repo: string, days?: number }`                  |
| `github_get_branch_status`   | Stale branches, divergence from main         | `{ repo: string }`                                 |
| `github_get_ci_checks`       | CI check status for recent PRs               | `{ repo: string, pr_number?: number }`             |

**Key Data Extracted:**

- PR age, review turnaround time, reviewer assignment distribution
- Commit velocity trends (daily/weekly)
- Branch staleness and merge conflict risk
- CI check pass/fail rates per PR

**Service Layer Logic (`github.service.ts`):**

```typescript
export class GitHubService {
  private octokit: Octokit;

  async getOpenPRs(repo: string): Promise<PullRequestSummary[]>;
  async getPRReviewStats(repo: string, days: number): Promise<ReviewStats>;
  async getMergeDelays(repo: string, thresholdDays: number): Promise<DelayedPR[]>;
  async getCommitActivity(repo: string, days: number): Promise<CommitActivity>;
  async getBranchStatus(repo: string): Promise<BranchStatus[]>;
}
```

---

### 1.2 — Jira Connector Module

**Directory:** `src/modules/jira/`

```
src/modules/jira/
├── jira.module.ts
├── jira.service.ts           # REST API client (fetch-based)
├── jira.tools.ts
├── jira.resources.ts
└── jira.prompts.ts
```

**MCP Tools to Expose:**

| Tool Name                     | Description                                    | Input Schema                                                |
| ----------------------------- | ---------------------------------------------- | ----------------------------------------------------------- |
| `jira_get_sprint_status`      | Current sprint completion %, velocity          | `{ project: string, board_id?: number }`                    |
| `jira_get_blocked_issues`     | Issues with "Blocked" status or flag           | `{ project: string }`                                       |
| `jira_get_overdue_issues`     | Issues past their due date                     | `{ project: string, days_overdue?: number }`                |
| `jira_get_dependency_graph`   | Issues blocking other issues (linked issues)   | `{ project: string, issue_key?: string }`                   |
| `jira_get_workload`           | Assignee workload distribution                 | `{ project: string }`                                       |
| `jira_get_cycle_time`         | Average time from In Progress → Done           | `{ project: string, days?: number }`                        |

**Key Data Extracted:**

- Sprint burndown / completion percentage
- Blocked issue chains (A blocks B blocks C)
- Assignee overload detection
- Cycle time anomalies (tasks taking 3x average)

---

### 1.3 — Slack Connector Module

**Directory:** `src/modules/slack/`

```
src/modules/slack/
├── slack.module.ts
├── slack.service.ts          # Slack Web API client
├── slack.tools.ts
├── slack.resources.ts
└── slack.prompts.ts
```

**MCP Tools to Expose:**

| Tool Name                       | Description                                     | Input Schema                                      |
| ------------------------------- | ----------------------------------------------- | ------------------------------------------------- |
| `slack_search_messages`         | Search for keywords in channels                 | `{ query: string, channels?: string[], days?: number }` |
| `slack_get_blocker_mentions`    | Find messages mentioning blockers/waiting/stuck | `{ channels?: string[], days?: number }`          |
| `slack_get_incident_threads`    | Identify incident-related threads               | `{ channels?: string[], days?: number }`          |
| `slack_get_channel_activity`    | Message volume and participation stats          | `{ channel: string, days?: number }`              |
| `slack_get_decision_threads`    | Threads with decisions or approvals             | `{ channels?: string[], days?: number }`          |

**Key Data Extracted:**

- Blocker keyword frequency ("blocked", "waiting for", "stuck on", "can't proceed")
- Incident thread detection and resolution times
- Decision bottleneck detection (unanswered decision threads)
- Communication pattern anomalies

**Smart Keyword Lists (configurable):**

```typescript
const BLOCKER_KEYWORDS = [
  'blocked', 'blocking', 'stuck', 'waiting for',
  'can\'t proceed', 'dependency', 'need approval',
  'who owns', 'help needed', 'urgent'
];

const INCIDENT_KEYWORDS = [
  'incident', 'outage', 'downtime', 'production issue',
  'hotfix', 'rollback', 'P0', 'P1', 'severity'
];
```

---

### 1.4 — CI/CD Connector Module

**Directory:** `src/modules/cicd/`

```
src/modules/cicd/
├── cicd.module.ts
├── cicd.service.ts           # Supports GitHub Actions (primary), extensible
├── cicd.tools.ts
├── cicd.resources.ts
└── cicd.prompts.ts
```

**MCP Tools to Expose:**

| Tool Name                      | Description                                   | Input Schema                                      |
| ------------------------------ | --------------------------------------------- | ------------------------------------------------- |
| `cicd_get_build_status`        | Recent build pass/fail rates                  | `{ repo: string, days?: number }`                 |
| `cicd_get_failed_pipelines`    | List currently failing pipelines              | `{ repo: string }`                                |
| `cicd_get_flaky_tests`         | Tests that intermittently fail                | `{ repo: string, days?: number }`                 |
| `cicd_get_deployment_history`  | Recent deployment success/failure timeline    | `{ repo: string, environment?: string }`          |
| `cicd_get_build_duration_trend`| Build time trends (detecting slowdowns)       | `{ repo: string, days?: number }`                 |

**Key Data Extracted:**

- Build failure rate trends
- Flaky test identification
- Deployment frequency and failure rate
- Build duration degradation

---

### 1.5 — Mock Data Layer (Hackathon Demo Support)

> **Critical for Hackathon:** Create a mock data provider that returns realistic simulated data when real API tokens are not available.

**Directory:** `src/shared/mock/`

```
src/shared/mock/
├── mock-data.provider.ts     # Central mock data factory
├── github.mock.ts            # Realistic GitHub mock data
├── jira.mock.ts              # Realistic Jira mock data
├── slack.mock.ts             # Realistic Slack mock data
└── cicd.mock.ts              # Realistic CI/CD mock data
```

**Strategy:**
- Each connector service checks `process.env.USE_MOCK_DATA === 'true'`
- If true, returns pre-built realistic data that tells a compelling demo story
- Mock data is pre-seeded to demonstrate a clear bottleneck scenario:
  - **Project "Phoenix"** is delayed
  - Backend reviewer (Alice) is overloaded with 12 pending reviews
  - 3 frontend tasks blocked by backend API dependency
  - CI pipeline failing on integration tests due to API contract change
  - Slack channels have repeated "waiting for backend" messages

---

## Phase 2 — Core Intelligence Engine

> **Goal:** Build the analysis layer that correlates signals across data sources and produces actionable insights.
> **Estimated Time:** 3–4 hours

### 2.1 — Signal Collector

**File:** `src/engine/signal-collector.ts`

Aggregates raw data from all connectors into a normalized `Signal` format:

```typescript
interface Signal {
  id: string;
  source: 'github' | 'jira' | 'slack' | 'cicd';
  type: SignalType;         // 'review_delay' | 'blocked_task' | 'build_failure' | 'blocker_mention' | ...
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  summary: string;          // Human-readable description
  rawData: Record<string, any>;
  relatedEntities: string[]; // PR numbers, issue keys, user IDs
}
```

**Signal Types Supported:**

| Source | Signal Types |
|--------|-------------|
| GitHub | `review_delay`, `stale_branch`, `merge_conflict_risk`, `low_commit_activity`, `reviewer_overload` |
| Jira   | `blocked_task`, `overdue_issue`, `sprint_risk`, `workload_imbalance`, `dependency_chain` |
| Slack  | `blocker_mention`, `incident_thread`, `unanswered_decision`, `escalation_pattern` |
| CI/CD  | `build_failure`, `flaky_test`, `deployment_failure`, `build_slowdown` |

### 2.2 — Signal Correlator

**File:** `src/engine/signal-correlator.ts`

Finds relationships between signals across different sources:

```typescript
interface Correlation {
  signals: Signal[];                  // The correlated signals
  correlationType: CorrelationType;   // 'causal_chain' | 'common_entity' | 'temporal_proximity'
  confidence: number;                 // 0.0 – 1.0
  narrative: string;                  // AI-generated explanation of the relationship
}
```

**Correlation Strategies:**

1. **Entity Matching:** Link signals that reference the same PR, issue, person, or component
   - Example: `review_delay` on PR #214 + `blocked_task` on PROJ-456 (which references PR #214)

2. **Temporal Proximity:** Link signals that occurred within a configurable time window
   - Example: `build_failure` at 2pm + `blocker_mention` in Slack at 2:15pm

3. **Causal Chain Detection:** Identify cascading effects
   - Example: `reviewer_overload` → `review_delay` → `blocked_task` → `sprint_risk`

4. **Pattern Matching:** Identify recurring patterns
   - Example: Every Monday, `build_failure` occurs after deployment

### 2.3 — Risk Scorer

**File:** `src/engine/risk-scorer.ts`

Computes an overall project risk score and per-dimension risk breakdown:

```typescript
interface RiskAssessment {
  overallRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  overallScore: number;              // 0–100
  dimensions: {
    codeReview: number;              // 0–100
    taskCompletion: number;
    buildHealth: number;
    teamCommunication: number;
    dependencies: number;
  };
  topRisks: RankedRisk[];           // Sorted by impact
  estimatedDelay: string;            // "3–5 days", "1–2 weeks"
  recommendations: Recommendation[];
}
```

**Scoring Algorithm:**

```
overallScore =
  (codeReview × 0.25) +
  (taskCompletion × 0.25) +
  (buildHealth × 0.20) +
  (dependencies × 0.20) +
  (teamCommunication × 0.10)
```

Each dimension score is computed from its constituent signals:

- **Code Review (25%):** PR age, review turnaround, reviewer workload, unreviewed PR count
- **Task Completion (25%):** Sprint completion %, blocked tasks, overdue issues, cycle time
- **Build Health (20%):** Build pass rate, flaky test count, deployment failure rate
- **Dependencies (20%):** Blocked chains, cross-team dependencies, external API issues
- **Communication (10%):** Unanswered questions, incident thread resolution time

### 2.4 — Recommendation Engine

**File:** `src/engine/recommendation-engine.ts`

Generates actionable recommendations from risk assessments:

```typescript
interface Recommendation {
  id: string;
  priority: 'immediate' | 'short_term' | 'long_term';
  category: 'process' | 'people' | 'technical' | 'communication';
  title: string;
  description: string;
  expectedImpact: string;
  effort: 'low' | 'medium' | 'high';
  automatable: boolean;             // Links to Feature 2
}
```

**Example Recommendations:**

| Trigger | Recommendation |
|---------|---------------|
| Reviewer overload detected | "Assign 2 additional reviewers to the backend team to reduce avg review time from 3 days to 8 hours" |
| Recurring Monday build failures | "Investigate weekend deployment pipeline — 80% of Monday failures trace to Saturday auto-deploys" |
| 5 tasks blocked by single dependency | "Prioritize PROJ-123 (Backend API) — it unblocks 5 downstream tasks worth 21 story points" |

---

## Phase 3 — Feature 1: Engineering Bottleneck Investigator

> **Goal:** Expose the intelligence engine as MCP tools and prompts that an AI can use to investigate engineering delays.
> **Estimated Time:** 3–4 hours

### 3.1 — Investigator Module

**Directory:** `src/modules/investigator/`

```
src/modules/investigator/
├── investigator.module.ts
├── investigator.service.ts    # Orchestrates the investigation pipeline
├── investigator.tools.ts      # MCP tools for investigation
├── investigator.prompts.ts    # Investigation prompt templates
└── investigator.resources.ts  # Cached investigation reports
```

### 3.2 — MCP Tools

| Tool Name                           | Description                                                           |
| ----------------------------------- | --------------------------------------------------------------------- |
| `investigate_project`               | Full investigation: collects signals, correlates, scores, recommends  |
| `get_project_risk_score`            | Quick risk assessment without full investigation                      |
| `find_bottlenecks`                  | Identify top N bottlenecks for a project/team                         |
| `get_blocker_chain`                 | Trace a specific blocker through all systems                          |
| `compare_sprint_health`             | Compare current sprint to previous sprints                            |
| `get_team_workload_analysis`        | Analyze workload distribution across team members                     |
| `get_investigation_report`          | Generate a formatted investigation report                             |

### 3.3 — Investigation Pipeline (Orchestration)

```
User Query: "Why is Project Phoenix delayed?"
                │
                ▼
┌─────────────────────────────────────┐
│  1. PARSE INVESTIGATION SCOPE       │
│     - Extract: project, team, time  │
│     - Determine: scope, depth       │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  2. COLLECT SIGNALS (Parallel)      │
│     ┌──────────────────────────┐    │
│     │ GitHub → PR delays,      │    │
│     │          review stats    │    │
│     ├──────────────────────────┤    │
│     │ Jira   → Blocked tasks,  │    │
│     │          sprint status   │    │
│     ├──────────────────────────┤    │
│     │ Slack  → Blocker mentions│    │
│     ├──────────────────────────┤    │
│     │ CI/CD  → Build failures  │    │
│     └──────────────────────────┘    │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  3. CORRELATE SIGNALS               │
│     - Entity matching               │
│     - Temporal proximity            │
│     - Causal chain detection        │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  4. SCORE & RANK                    │
│     - Risk assessment               │
│     - Bottleneck ranking            │
│     - Delay estimation              │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│  5. GENERATE REPORT                 │
│     - Root cause analysis           │
│     - Evidence summary              │
│     - Recommendations               │
│     - Visual dashboard data         │
└─────────────────────────────────────┘
```

### 3.4 — MCP Prompts (Investigation Templates)

```typescript
@Prompt({
  name: 'investigate_delay',
  description: 'Investigate why a project or sprint is delayed',
  arguments: [
    { name: 'project', description: 'Project name or key', required: true },
    { name: 'timeframe', description: 'Lookback period (e.g., "last 2 weeks")', required: false }
  ]
})
```

**Prompts to Create:**

| Prompt Name              | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `investigate_delay`      | Full delay investigation                         |
| `daily_standup_prep`     | Pre-standup risk summary                         |
| `sprint_health_check`    | Mid-sprint health assessment                     |
| `team_capacity_review`   | Workload balance analysis                        |
| `release_readiness`      | Pre-release risk checklist                       |
| `incident_postmortem`    | Post-incident signal analysis                    |

### 3.5 — Report Output Format

The investigation tool returns a structured JSON that powers both text responses and widget visualizations:

```typescript
interface InvestigationReport {
  metadata: {
    project: string;
    investigatedAt: string;
    timeframeStart: string;
    timeframeEnd: string;
    dataSources: string[];
  };
  riskAssessment: RiskAssessment;
  rootCauses: {
    primary: RootCause;
    contributing: RootCause[];
  };
  evidence: Evidence[];
  correlations: Correlation[];
  recommendations: Recommendation[];
  timeline: TimelineEvent[];        // For visual timeline widget
}
```

---

## Phase 4 — Feature 2: Workflow Discovery & Automation

> **Goal:** Analyze cross-system activity patterns to discover repetitive workflows and propose automation opportunities.
> **Estimated Time:** 3–4 hours

### 4.1 — Workflow Discovery Module

**Directory:** `src/modules/workflow-discovery/`

```
src/modules/workflow-discovery/
├── workflow-discovery.module.ts
├── workflow-discovery.service.ts
├── workflow-discovery.tools.ts
├── workflow-discovery.prompts.ts
├── workflow-discovery.resources.ts
├── pattern-detector.ts             # Pattern detection algorithms
└── automation-scorer.ts            # ROI calculator for automation
```

### 4.2 — MCP Tools

| Tool Name                             | Description                                                        |
| ------------------------------------- | ------------------------------------------------------------------ |
| `discover_workflows`                  | Scan all connected systems for repetitive workflow patterns        |
| `analyze_workflow_pattern`            | Deep-dive into a specific detected pattern                         |
| `calculate_automation_roi`            | Estimate time/cost savings from automating a workflow              |
| `generate_automation_blueprint`       | Create a step-by-step automation plan for a workflow               |
| `get_workflow_frequency_report`       | Show most frequent cross-system action sequences                   |
| `get_automation_opportunities`        | Ranked list of automation opportunities by ROI                     |
| `simulate_automation`                 | Dry-run: show what would happen if a workflow were automated       |

### 4.3 — Pattern Detection Engine

**File:** `src/modules/workflow-discovery/pattern-detector.ts`

Detects repeating action sequences across systems:

```typescript
interface WorkflowPattern {
  id: string;
  name: string;                       // AI-generated name
  description: string;
  steps: WorkflowStep[];
  frequency: {
    occurrences: number;
    period: 'day' | 'week' | 'month';
    lastOccurrence: Date;
  };
  actors: string[];                   // People who perform this workflow
  systems: string[];                  // Systems involved
  avgDurationMinutes: number;
  manualEffortHoursPerMonth: number;
}

interface WorkflowStep {
  order: number;
  system: 'github' | 'jira' | 'slack' | 'cicd' | 'email';
  action: string;                     // "Create issue", "Post message", "Merge PR"
  description: string;
  isManual: boolean;
  avgDurationMinutes: number;
}
```

**Detection Strategies:**

1. **Temporal Sequence Mining:**
   - Detect that action A (Slack message) is consistently followed by action B (Jira ticket creation) within N minutes
   - Example: Bug report in Slack → Jira ticket created → Developer assigned → Slack notification

2. **Periodic Pattern Detection:**
   - Identify actions that repeat on a schedule
   - Example: Every Monday morning — sprint data exported, report created, emailed

3. **Cross-System Action Chains:**
   - Detect multi-system workflows that always involve the same sequence of tools
   - Example: PR merged → deployment triggered → Slack notification → Jira status updated

4. **Role-Based Pattern Detection:**
   - Identify workflows specific to roles (managers, leads, QA)
   - Example: Manager's daily routine — check Jira board, review PRs, post standup summary

### 4.4 — Automation Scorer (ROI Calculator)

**File:** `src/modules/workflow-discovery/automation-scorer.ts`

```typescript
interface AutomationOpportunity {
  workflowPattern: WorkflowPattern;
  automationScore: number;             // 0–100
  roi: {
    timeSavedPerMonth: number;         // hours
    costSavedPerMonth: number;         // estimated $$
    implementationEffort: 'low' | 'medium' | 'high';
    breakEvenWeeks: number;
  };
  feasibility: {
    apiAvailability: boolean;          // Can all steps be automated via APIs?
    requiresHumanJudgment: boolean;    // Does any step need human decision?
    riskLevel: 'low' | 'medium' | 'high';
  };
  automationBlueprint: AutomationBlueprint;
}
```

**Scoring Formula:**

```
automationScore =
  (frequency × 0.30) +
  (timeSavedPerExecution × 0.25) +
  (numberOfManualSteps × 0.20) +
  (apiAvailability × 0.15) +
  (lowRisk × 0.10)
```

### 4.5 — Automation Blueprint Generator

Produces a concrete automation plan:

```typescript
interface AutomationBlueprint {
  trigger: {
    system: string;
    event: string;
    condition: string;
  };
  steps: AutomationStep[];
  approvalRequired: boolean;
  estimatedBuildTime: string;
}

interface AutomationStep {
  order: number;
  system: string;
  action: string;
  apiEndpoint?: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  errorHandling: string;
}
```

**Example Output:**

```
Workflow: "Bug Report → Jira Ticket" (detected 35x/month)

BEFORE (Manual):
  1. Developer posts bug in #engineering-bugs Slack channel
  2. Lead reads message, copies details
  3. Lead opens Jira, creates ticket manually
  4. Lead assigns developer
  5. Lead posts Jira link back in Slack thread
  Total: ~12 min/occurrence → 7 hrs/month

AFTER (Automated):
  Trigger: New message in #engineering-bugs matching bug pattern
  Step 1: Extract title, description, severity from message (AI)
  Step 2: Create Jira ticket via API
  Step 3: Auto-assign based on component ownership
  Step 4: Reply in Slack thread with Jira link
  Step 5: Add to current sprint if severity >= HIGH

  ⚠️ Requires Approval: Manager approves ticket creation before execution
  Estimated Build Time: 2–3 hours
  Monthly Time Saved: 6.5 hours
```

### 4.6 — MCP Prompts

| Prompt Name                     | Purpose                                                |
| ------------------------------- | ------------------------------------------------------ |
| `discover_automation`           | Find all automation opportunities across systems       |
| `analyze_team_workflows`        | Deep-dive into a specific team's repetitive patterns   |
| `build_automation_case`         | Generate a business case for automating a workflow     |
| `weekly_efficiency_report`      | Weekly report on manual effort and automation potential |

---

## Phase 5 — Unified Dashboard (Widgets UI)

> **Goal:** Build Next.js widget components that visualize investigation reports, risk dashboards, and workflow discovery results inside the NitroStack UI.
> **Estimated Time:** 3–4 hours

### 5.1 — Widget Architecture

**Directory:** `src/widgets/app/`

```
src/widgets/app/
├── layout.tsx                          # Root layout with design system
├── globals.css                         # Design tokens, theme, animations
├── page.tsx                            # Widget router / landing
│
├── bottleneck-report/
│   └── page.tsx                        # Full investigation report widget
│
├── risk-dashboard/
│   └── page.tsx                        # Project risk heatmap + scores
│
├── workflow-discovery/
│   └── page.tsx                        # Workflow patterns + ROI cards
│
├── signal-timeline/
│   └── page.tsx                        # Cross-system event timeline
│
└── components/
    ├── RiskGauge.tsx                    # Circular risk score indicator
    ├── SignalCard.tsx                   # Individual signal display
    ├── CorrelationGraph.tsx             # Signal relationship visualization
    ├── WorkflowDiagram.tsx             # Before/After workflow visualization
    ├── RecommendationList.tsx          # Prioritized action items
    ├── TimelineView.tsx                # Cross-system event timeline
    ├── AutomationROICard.tsx           # ROI summary for automation opportunity
    └── MetricBadge.tsx                 # Risk dimension score badge
```

### 5.2 — Widget Manifest

Update `widget-manifest.json` to register all widgets:

```json
{
  "version": "1.0.0",
  "widgets": [
    {
      "uri": "/bottleneck-report",
      "name": "Bottleneck Investigation Report",
      "description": "Displays full investigation results with root causes, evidence, and recommendations",
      "tags": ["investigation", "bottleneck", "report"]
    },
    {
      "uri": "/risk-dashboard",
      "name": "Project Risk Dashboard",
      "description": "Real-time risk heatmap across code review, tasks, builds, and dependencies",
      "tags": ["risk", "dashboard", "health"]
    },
    {
      "uri": "/workflow-discovery",
      "name": "Workflow Discovery Results",
      "description": "Discovered workflow patterns with automation ROI analysis",
      "tags": ["workflow", "automation", "discovery"]
    },
    {
      "uri": "/signal-timeline",
      "name": "Cross-System Signal Timeline",
      "description": "Timeline view of signals across GitHub, Jira, Slack, and CI/CD",
      "tags": ["timeline", "signals", "activity"]
    }
  ]
}
```

### 5.3 — Design System

**Color Palette:**

| Risk Level | Color       | Usage                  |
| ---------- | ----------- | ---------------------- |
| Critical   | `#FF4757`   | Critical risk elements |
| High       | `#FF6B35`   | High risk elements     |
| Medium     | `#FFA502`   | Medium risk warnings   |
| Low        | `#2ED573`   | Healthy / low risk     |
| Info       | `#5B8DEF`   | Informational          |

**Widget Design Principles:**
- Dark theme with glassmorphism cards
- Smooth micro-animations on data load
- Responsive grid layout
- Color-coded risk severity throughout
- Interactive hover states on all data points

### 5.4 — Key Widget Behaviors

**Bottleneck Report Widget:**
- Receives `InvestigationReport` JSON from the `investigate_project` tool
- Renders: Risk gauge → Root cause card → Evidence timeline → Recommendation list
- Each evidence item links back to source (PR URL, Jira ticket URL, Slack message)

**Risk Dashboard Widget:**
- Receives `RiskAssessment` JSON from `get_project_risk_score` tool
- Renders: 5-dimension radar chart → individual dimension bars → trend indicators
- Real-time color transitions based on score changes

**Workflow Discovery Widget:**
- Receives `AutomationOpportunity[]` from `get_automation_opportunities` tool
- Renders: ROI ranking cards → Before/After workflow diagrams → Approval buttons
- Sortable by ROI, frequency, or effort

---

## Phase 6 — Integration Testing & Demo Preparation

> **Goal:** End-to-end testing, demo data polishing, and presentation preparation.
> **Estimated Time:** 2–3 hours

### 6.1 — Integration Testing

**Test Scenarios:**

| # | Scenario                                     | Expected Result                                                          |
|---|----------------------------------------------|--------------------------------------------------------------------------|
| 1 | "Why is Project Phoenix delayed?"            | Full investigation report with root cause, evidence, recommendations      |
| 2 | "Show me the risk dashboard for Phoenix"     | Risk gauge widget with 5-dimension breakdown                              |
| 3 | "What are the top bottlenecks this sprint?"  | Ranked bottleneck list with severity and evidence                         |
| 4 | "Find automation opportunities"              | List of discovered workflows with ROI analysis                           |
| 5 | "Show me the workflow for bug reporting"     | Before/After workflow diagram with automation blueprint                   |
| 6 | "Who is the most overloaded reviewer?"       | Team workload analysis with reviewer stats                                |
| 7 | "Is our CI pipeline healthy?"                | Build health assessment with failure trends                               |

### 6.2 — Demo Story (Pre-Seeded Scenario)

**"Project Phoenix" Story Arc:**

> Project Phoenix is a critical feature release that's 1 week behind schedule.
> Nobody can explain why.

**Act 1 — The Question:**
Manager asks: *"Why is Project Phoenix delayed?"*

**Act 2 — The Investigation:**
AI collects signals from all 4 systems, correlates them, and discovers:
- **Root Cause:** Alice (senior backend engineer) is the sole reviewer for 12 PRs
- **Cascade Effect:** Review delays → 3 frontend tasks blocked → Sprint at risk
- **Contributing Factor:** CI pipeline failing due to API contract change that Alice made
- **Communication Signal:** 8 Slack messages in #phoenix-dev saying "waiting for Alice's review"

**Act 3 — The Recommendation:**
AI recommends:
1. Immediately assign Bob as co-reviewer for backend PRs
2. Prioritize PR #214 (API contract update) — it unblocks 5 downstream tasks
3. Fix CI config to use updated API contract schema

**Act 4 — The Automation Discovery:**
AI also discovers:
- The "bug triage" workflow happens 35x/month and takes 12 min each time
- Sprint reporting is done manually every Monday (25 hrs/month wasted)
- Post-deployment verification follows the same 7-step checklist every time

**Act 5 — The Resolution:**
Manager approves automation for sprint reporting → estimated savings: 20 hrs/month

### 6.3 — Demo Polish Checklist

- [ ] Mock data produces compelling, realistic investigation results
- [ ] All 4 widgets render correctly with mock data
- [ ] Prompt templates produce well-structured outputs
- [ ] Tool descriptions are clear and discoverable
- [ ] Error handling works gracefully when a connector fails
- [ ] Health check passes for all services
- [ ] README updated with project description and setup instructions

---

## File/Module Map

```
src/
├── index.ts                              # Entry point (no changes needed)
├── app.module.ts                         # Root module (update imports)
│
├── shared/
│   ├── types/
│   │   ├── github.types.ts
│   │   ├── jira.types.ts
│   │   ├── slack.types.ts
│   │   ├── cicd.types.ts
│   │   ├── investigation.types.ts
│   │   └── workflow.types.ts
│   ├── schemas/
│   │   └── index.ts
│   ├── constants.ts
│   ├── utils/
│   │   ├── date.utils.ts
│   │   ├── scoring.utils.ts
│   │   └── correlation.utils.ts
│   └── mock/
│       ├── mock-data.provider.ts
│       ├── github.mock.ts
│       ├── jira.mock.ts
│       ├── slack.mock.ts
│       └── cicd.mock.ts
│
├── engine/
│   ├── signal-collector.ts
│   ├── signal-correlator.ts
│   ├── risk-scorer.ts
│   └── recommendation-engine.ts
│
├── modules/
│   ├── github/
│   │   ├── github.module.ts
│   │   ├── github.service.ts
│   │   ├── github.tools.ts
│   │   ├── github.resources.ts
│   │   └── github.prompts.ts
│   │
│   ├── jira/
│   │   ├── jira.module.ts
│   │   ├── jira.service.ts
│   │   ├── jira.tools.ts
│   │   ├── jira.resources.ts
│   │   └── jira.prompts.ts
│   │
│   ├── slack/
│   │   ├── slack.module.ts
│   │   ├── slack.service.ts
│   │   ├── slack.tools.ts
│   │   ├── slack.resources.ts
│   │   └── slack.prompts.ts
│   │
│   ├── cicd/
│   │   ├── cicd.module.ts
│   │   ├── cicd.service.ts
│   │   ├── cicd.tools.ts
│   │   ├── cicd.resources.ts
│   │   └── cicd.prompts.ts
│   │
│   ├── investigator/
│   │   ├── investigator.module.ts
│   │   ├── investigator.service.ts
│   │   ├── investigator.tools.ts
│   │   ├── investigator.prompts.ts
│   │   └── investigator.resources.ts
│   │
│   └── workflow-discovery/
│       ├── workflow-discovery.module.ts
│       ├── workflow-discovery.service.ts
│       ├── workflow-discovery.tools.ts
│       ├── workflow-discovery.prompts.ts
│       ├── workflow-discovery.resources.ts
│       ├── pattern-detector.ts
│       └── automation-scorer.ts
│
├── health/
│   └── system.health.ts                   # Keep existing (no changes)
│
└── widgets/
    ├── app/
    │   ├── layout.tsx
    │   ├── globals.css
    │   ├── page.tsx
    │   ├── bottleneck-report/page.tsx
    │   ├── risk-dashboard/page.tsx
    │   ├── workflow-discovery/page.tsx
    │   ├── signal-timeline/page.tsx
    │   └── components/
    │       ├── RiskGauge.tsx
    │       ├── SignalCard.tsx
    │       ├── CorrelationGraph.tsx
    │       ├── WorkflowDiagram.tsx
    │       ├── RecommendationList.tsx
    │       ├── TimelineView.tsx
    │       ├── AutomationROICard.tsx
    │       └── MetricBadge.tsx
    ├── widget-manifest.json
    ├── package.json
    └── tsconfig.json
```

**Total Files to Create:** ~50 files
**Total Files to Modify:** ~3 files (app.module.ts, widget-manifest.json, .env.example)
**Total Files to Delete:** ~4 files (calculator module)

---

## Risk Mitigation

| Risk                                     | Mitigation                                                                  |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| API rate limits from GitHub/Jira/Slack   | Mock data layer serves as primary demo mode; real APIs are optional          |
| NitroStack decorator API unfamiliarity   | Follow existing calculator module patterns exactly for all new modules       |
| Time pressure (hackathon)                | Mock data is Phase 1 priority — everything can demo with mocks alone         |
| Widget rendering issues                  | Start with simple JSON display, progressively enhance with rich components   |
| Cross-system correlation complexity      | Start with entity-matching only, add temporal/causal in polish phase         |

---

## Demo Script

### Slide 1: The Problem (30 seconds)
> "Every engineering manager has asked: *Why is this project delayed?* Today they spend hours manually checking Jira, GitHub, Slack, and CI/CD to piece together an answer."

### Slide 2: Our Solution (30 seconds)
> "We built an MCP-powered intelligence layer that sits on top of your existing tools and answers that question in seconds."

### Live Demo: Investigation (2 minutes)
> User asks: "Why is Project Phoenix delayed?"
> → Show investigation running across all 4 systems
> → Display bottleneck report widget with root cause
> → Highlight the causal chain visualization

### Live Demo: Workflow Discovery (1 minute)
> User asks: "Find automation opportunities"
> → Show discovered workflows with ROI
> → Display before/after automation blueprint
> → Show approval workflow

### Slide 3: Impact (30 seconds)
> "Diagnosis + Treatment. We don't just find what's wrong — we show how to fix it and automate the fix."

---

> **Total Estimated Implementation Time: 16–23 hours**
> **Recommended Team Split (if 2-3 people):**
> - Person A: Phase 0 + Phase 1 (Connectors + Mock Data)
> - Person B: Phase 2 + Phase 3 (Engine + Investigator)
> - Person C: Phase 4 + Phase 5 (Workflow Discovery + Widgets)
> - All: Phase 6 (Integration + Demo)
