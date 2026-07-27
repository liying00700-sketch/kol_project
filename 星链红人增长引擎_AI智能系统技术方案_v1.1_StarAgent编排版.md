# 星链红人增长引擎 AI 智能系统技术方案

版本：v1.1  
日期：2026-07-16  
依据文档：`星链红人增长引擎_正式PRD_v1.2_StarAgent统一入口版.md`  
目标：实现以 StarAgent 为统一入口、专业 Agent 为能力单元、证据链与人工审批为安全边界的红人营销智能系统。

---

## 1. 技术目标与原则

### 1.1 技术目标

```text
用户表达业务目标
→ 会话与任务理解
→ 参数补全和必要追问
→ 权限过滤与上下文构建
→ 数据检索、评分和专业 Agent 编排
→ 组合优化与证据快照
→ 结构化方案和自然语言解释
→ 页面 Handoff / Campaign / OutreachPlan
→ 人工审批与执行
→ 反馈、评估和复盘
```

技术系统需要保证：

- 对话输出可转换为确定的结构化业务对象。
- 推荐计算与语言表达分离，LLM 不直接编造评分或事实。
- 每条结论可追踪到指标、数据范围和快照。
- 跨页面跳转可复现相同筛选条件。
- 高风险和对外动作由服务端权限与审批机制强制拦截。
- Agent、规则、提示词、数据和方案均可版本化和审计。

### 1.2 MVP 非目标

- 不构建无限循环的通用自主 Agent。
- 不允许模型直接生成 SQL 并绕过数据权限。
- 不自动发送邀约、确认报价、付款或发布广告。
- 不实现实时全平台采集和复杂在线学习。

---

## 2. 总体架构

```text
Web App (React + TypeScript)
├─ Global StarAgent Launcher
├─ StarAgent Workspace
├─ Recommendation Canvas / Evidence Drawer
└─ Domain Pages / Action Center / Campaign

API Gateway / BFF
├─ AuthN / AuthZ / Tenant Scope
├─ Conversation API
├─ Handoff API
└─ Streaming Response

Application Services
├─ StarAgent Orchestrator
├─ Task Understanding Service
├─ Context Builder
├─ Recommendation Service
├─ Evidence Service
├─ Campaign Service
├─ Outreach Service
├─ Approval Service
└─ Feedback & Evaluation Service

Domain Services
├─ Product / Scene
├─ Influencer
├─ Content / Asset
├─ VOC
├─ Ads
├─ Budget
└─ Action / Report

AI & Decision Layer
├─ Intent Router
├─ Professional Agent Registry
├─ Rule Engine
├─ Scoring Engine
├─ Portfolio Optimizer
├─ LLM Adapter
└─ Guardrail / Policy Engine

Data Layer
├─ PostgreSQL
├─ Object Storage
├─ Analytics Store (optional DuckDB/ClickHouse)
├─ Search / Vector Index (P1 optional)
└─ Audit & Evaluation Store

Integration Layer
├─ CSV / Excel Import
├─ Platform and Analytics Adapters
├─ Ecommerce / Ad Adapters
└─ Outreach Channel Adapters
```

### 2.1 分期实现

P0 前端演示：React 状态机 + mock 数据 + 确定性规则，模拟流式步骤、方案生成、证据抽屉和动作流转。

P1 客户试点：后端 API + PostgreSQL + 服务端规则/评分 + LLM 摘要 + 持久化会话、证据和审批。

P2 商业化：多租户、真实 LLM 编排、多数据源、组合优化、建联渠道和持续评估。

---

## 3. 核心领域模型

```ts
type TaskType =
  | "find_influencers"
  | "find_contents"
  | "build_promotion_plan"
  | "create_campaign"
  | "create_outreach_plan"
  | "analyze_business"
  | "find_resource";

type Objective =
  | "awareness"
  | "education"
  | "seeding"
  | "conversion"
  | "asset_generation";

type EvidenceStrength = "high" | "medium" | "low";
type FactType = "observed_fact" | "model_inference" | "user_assumption";
type ApprovalStatus = "not_required" | "pending" | "approved" | "rejected" | "expired";
```

### 3.1 Conversation 与 Message

```ts
interface AgentConversation {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  status: "active" | "completed" | "archived";
  activeTaskId?: string;
  createdAt: string;
  updatedAt: string;
}

interface AgentMessage {
  id: string;
  conversationId: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  structuredPayload?: Record<string, unknown>;
  correlationId: string;
  createdAt: string;
}
```

### 3.2 AgentTask

```ts
interface AgentTask {
  id: string;
  conversationId: string;
  type: TaskType;
  status: "understanding" | "needs_input" | "running" | "ready" | "handed_off" | "failed";
  productId?: string;
  temporaryProduct?: {
    name: string;
    category?: string;
    price?: number;
    description?: string;
  };
  objective: Objective;
  budget?: { amount: number; currency: string; includes: string[] };
  markets: string[];
  platforms: string[];
  audience?: Record<string, unknown>;
  timeRange?: { start?: string; end?: string; lookbackDays?: number };
  constraints: TaskConstraint[];
  assumptions: TaskAssumption[];
  missingFields: string[];
  parserVersion: string;
}

interface TaskConstraint {
  field: string;
  operator: "eq" | "in" | "gte" | "lte" | "exclude";
  value: unknown;
  source: "user" | "brand_default" | "agent_suggested";
}

interface TaskAssumption {
  key: string;
  value: unknown;
  reason: string;
  userConfirmed: boolean;
}
```

### 3.3 RecommendationPlan

```ts
interface RecommendationPlan {
  id: string;
  taskId: string;
  version: number;
  strategy: "conservative" | "balanced" | "aggressive";
  summary: string;
  objective: Objective;
  items: RecommendationItem[];
  budgetAllocation: BudgetAllocation[];
  expectedMetrics: ExpectedMetric[];
  evidenceSnapshotId: string;
  riskNotes: string[];
  limitations: string[];
  status: "draft" | "accepted" | "rejected" | "converted";
  ruleVersion: string;
  modelVersion?: string;
}

interface RecommendationItem {
  id: string;
  type: "influencer" | "content" | "scene" | "product" | "reserve_budget";
  targetId?: string;
  role?: "awareness" | "education" | "seeding" | "conversion" | "creative_asset";
  rank: number;
  score: number;
  scoreBreakdown: Record<string, number>;
  reason: string;
  evidenceIds: string[];
  alternatives: string[];
  estimatedCost?: number;
  riskLevel: "none" | "low" | "medium" | "high";
}
```

### 3.4 EvidenceSnapshot

```ts
interface EvidenceSnapshot {
  id: string;
  tenantId: string;
  generatedAt: string;
  dataAsOf: string;
  queryVersion: string;
  records: EvidenceRecord[];
}

interface EvidenceRecord {
  id: string;
  subjectType: string;
  subjectId: string;
  factType: FactType;
  metricKey?: string;
  value?: number | string;
  source: string;
  timeRange?: string;
  sampleSize?: number;
  strength: EvidenceStrength;
  freshness: "current" | "stale" | "unknown";
  limitation?: string;
}
```

### 3.5 Handoff、Outreach 与 Approval

```ts
interface HandoffContext {
  id: string;
  taskId: string;
  destination: "influencers" | "contents" | "product_scene" | "campaign" | "actions";
  filters: Record<string, unknown>;
  selectedIds: string[];
  expiresAt: string;
}

interface OutreachPlan {
  id: string;
  recommendationPlanId: string;
  campaignId?: string;
  candidates: OutreachCandidate[];
  status: "draft" | "pending_approval" | "approved" | "sending" | "active" | "completed";
}

interface OutreachCandidate {
  influencerId: string;
  channel?: string;
  contactAvailable: boolean;
  messageDraft: string;
  briefId?: string;
  ownerId?: string;
  followUpAt?: string;
  riskCheck: "pending" | "passed" | "blocked";
}

interface ApprovalRequest {
  id: string;
  tenantId: string;
  actionType: string;
  resourceType: string;
  resourceId: string;
  status: ApprovalStatus;
  requestedBy: string;
  approvedBy?: string;
  payloadHash: string;
  expiresAt?: string;
}
```

---

## 4. StarAgent 编排设计

### 4.1 状态机

```text
IDLE
→ UNDERSTANDING
→ NEEDS_CLARIFICATION (可选)
→ CONTEXT_BUILDING
→ RETRIEVING
→ SCORING
→ COMPOSING_PLAN
→ READY
→ EDITING / HANDOFF / CONVERTING
→ APPROVAL_PENDING (高风险动作)
→ EXECUTING
→ FEEDBACK
```

状态、任务和中间结果必须持久化，刷新页面后能够恢复。每次执行使用 correlationId 串联日志、工具调用、证据和输出。

### 4.2 意图路由与槽位抽取

P0 使用关键词、表单映射和确定性规则；P1 可使用 LLM 结构化输出，但必须通过 JSON Schema 校验。

```json
{
  "taskType": "build_promotion_plan",
  "product": "吸奶器",
  "objective": "awareness",
  "budget": { "amount": 10000, "currency": "CNY" },
  "missingFields": ["market", "platform"],
  "confidence": 0.94
}
```

低置信度时不得静默猜测任务类型；关键字段缺失由 Clarification Policy 判断是追问、使用品牌默认值还是带假设继续。

### 4.3 Context Builder

Context Builder 按任务读取：

- 当前用户、租户、角色和数据权限。
- 品牌配置、默认市场、平台、产品和禁用条件。
- 产品、场景、红人、内容、VOC、Campaign 和预算数据。
- 历史合作、建联、风险、授权和执行反馈。
- 指标字典、数据更新时间和模型/规则版本。

所有查询使用受控 Repository/Metric API，不允许 LLM 直接访问数据库。

### 4.4 专业 Agent Registry

```yaml
agents:
  product_scene_strategy:
    inputs: [product, market, audience, objective]
  influencer_match:
    inputs: [product, scene, objective, budget, constraints]
  content_retrieval:
    inputs: [product, scene, platform, authorization]
  brief_generation:
    inputs: [product, scene, influencer, objective]
  budget_portfolio:
    inputs: [candidates, costs, objective, risk, budget]
  compliance_risk:
    inputs: [influencer, content, market, action]
  campaign_builder:
    inputs: [recommendationPlan]
  outreach_builder:
    inputs: [campaign, candidates, brief]
```

每个 Agent 声明输入 Schema、输出 Schema、所需权限、超时、可重试性、版本和证据要求。

### 4.5 推荐与组合优化

红人基础评分：

```text
score =
  w_product × product_fit
  + w_scene × scene_fit
  + w_audience × audience_fit
  + w_expression × expression_quality
  + w_trust × trust
  + w_objective × objective_performance
  + w_asset × asset_value
  + w_fulfillment × fulfillment
  - w_risk × risk
  - w_cost × cost_penalty
```

权重按 objective 和市场配置。awareness 目标优先有效触达、播放质量、目标人群匹配、互动质量、场景表达、品牌安全和素材价值；conversion 指标不能主导 awareness 排序。

组合层需满足：

- 总成本不超过预算。
- 样品、物流、授权、加热和预留费用口径明确。
- 红人角色和场景具有必要多样性。
- 排除竞品、合规、履约和黑名单对象。
- 避免候选受众高度重叠导致虚假覆盖。

P0 用启发式预算分配；P1 可采用约束优化或整数规划，并保留可解释的规则结果。

### 4.6 语言生成边界

LLM 仅用于意图解析、追问生成、证据摘要、推荐解释、Brief 和邀约草稿。分数、预算、指标、候选集合和权限结论由确定性服务提供。语言输出中的数值必须引用结构化 payload，禁止模型自行计算或补全。

---

## 5. 证据、可信度与防幻觉

### 5.1 证据生成

Evidence Service 在推荐生成时冻结证据快照，记录查询、时间、样本、来源、数值和版本。后续底层数据变化不覆盖旧方案证据。

### 5.2 证据强度建议

- high：数据新鲜、样本充分、多个独立指标一致且有历史验证。
- medium：数据基本充分但样本、时间或授权数据存在缺口。
- low：估算数据、样本少、跨场景迁移或仅有弱相关信号。

### 5.3 输出校验

生成结果提交前执行：

1. Schema 校验。
2. 预算加总和币种校验。
3. 引用对象存在性校验。
4. 每条推荐的 evidenceIds 非空校验。
5. 数值与证据 payload 一致性校验。
6. 权限、租户和敏感字段校验。
7. 高风险对象和禁用条件校验。

失败时降级为结构化模板解释，不返回未经验证的自由文本。

---

## 6. API 设计

### 6.1 Conversation / Task API

```http
POST   /api/star-agent/conversations
GET    /api/star-agent/conversations/:id
POST   /api/star-agent/conversations/:id/messages
GET    /api/star-agent/conversations/:id/events
GET    /api/star-agent/tasks/:id
PATCH  /api/star-agent/tasks/:id
POST   /api/star-agent/tasks/:id/run
```

消息接口可返回 task extraction，并通过 SSE 推送 `understanding`、`retrieving`、`scoring`、`composing` 和 `ready` 事件。进度描述只展示真实执行状态，不展示模型隐式推理过程。

### 6.2 Recommendation API

```http
GET    /api/recommendation-plans/:id
POST   /api/recommendation-plans/:id/revise
POST   /api/recommendation-plans/:id/items/:itemId/replace
POST   /api/recommendation-plans/:id/accept
POST   /api/recommendation-plans/:id/feedback
GET    /api/recommendation-plans/:id/evidence
```

### 6.3 Handoff / Conversion API

```http
POST   /api/recommendation-plans/:id/handoffs
GET    /api/handoffs/:token
POST   /api/recommendation-plans/:id/campaign
POST   /api/recommendation-plans/:id/outreach-plan
POST   /api/outreach-plans/:id/submit-for-approval
POST   /api/approvals/:id/approve
POST   /api/approvals/:id/reject
POST   /api/outreach-plans/:id/send
```

`send` 接口必须在服务端校验有效审批、payloadHash、发送权限、候选风险状态和幂等键；前端按钮状态不能作为安全边界。

### 6.4 示例任务请求

```json
{
  "message": "我想投放一个吸奶器，预算是1万，主要目标是传播不是转化",
  "clientContext": {
    "currentPage": "star-agent",
    "timezone": "Asia/Shanghai"
  }
}
```

### 6.5 Handoff 格式

```json
{
  "destination": "influencers",
  "filters": {
    "productId": "prod_pump_001",
    "objective": "awareness",
    "market": "CN",
    "roles": ["awareness", "education"],
    "maxEstimatedCost": 4000,
    "excludeRiskAbove": "medium"
  },
  "selectedIds": ["inf_001", "inf_014"]
}
```

Handoff 需短期有效、租户绑定且服务端可重建，避免把敏感筛选数据全部放入 URL。

---

## 7. 前端设计

### 7.1 主要组件

```text
GlobalAgentLauncher
StarAgentWorkspace
ConversationPanel
TaskUnderstandingCard
ClarificationCard
AssumptionBanner
AgentProgressTimeline
RecommendationCanvas
InfluencerPortfolioCard
ContentRecommendationCard
BudgetAllocationEditor
ExpectedMetricPanel
EvidenceDrawer
RiskAndLimitationPanel
PlanComparisonPanel
HandoffActions
OutreachApprovalModal
```

### 7.2 状态管理

- 服务端数据使用 Query Cache。
- 会话流式事件写入 Conversation Store。
- 方案编辑使用本地草稿，保存时由服务端生成新版本。
- 所有 mutation 使用幂等键并提供明确成功/失败状态。
- 刷新后通过 conversationId/taskId 恢复。

### 7.3 对话与画布协同

对话负责表达目标和解释；画布负责展示可比较、可编辑的结构化方案。不得把长名单、预算表和证据链仅作为聊天文本输出。

---

## 8. 权限、安全与审计

### 8.1 权限

建议权限点：

```yaml
star_agent:
  - agent.chat
  - agent.plan.create
  - agent.evidence.read
  - agent.campaign.create
  - outreach.plan.create
  - outreach.approve
  - outreach.send
  - agent.audit.read
```

Context Builder、检索、证据、Handoff 和执行接口均执行 tenantId 与 object-level 权限过滤。

### 8.2 Prompt Injection 与数据安全

- 外部内容、评论和红人简介视为不可信数据，不作为系统指令执行。
- 工具调用使用白名单、固定 Schema、超时和最大结果量。
- 模型上下文只包含任务所需字段，敏感联系方式默认脱敏。
- 不允许提示词覆盖权限和审批策略。
- 对话日志按租户策略设定保留周期和删除机制。

### 8.3 审计事件

记录会话创建、任务解析、默认假设、Agent 调用、数据查询版本、方案生成/修改、证据查看、Handoff、Campaign 创建、审批、发送、拒绝和反馈。

---

## 9. 可观测性与评估

### 9.1 运行指标

- 首 token/首结构化结果时间。
- 完整方案生成耗时和各阶段耗时。
- Agent/工具调用成功率、超时率和重试率。
- 单任务模型 token/成本。
- Evidence 校验失败率。
- Handoff、Campaign 和 Outreach 转化率。

### 9.2 离线评估集

建立覆盖产品、预算、目标、市场、平台、否定表达和多约束的标准任务集，评估：

- 意图分类和槽位抽取。
- 是否提出必要而非多余的追问。
- 候选召回、排序和预算可行性。
- 证据引用正确率。
- 数值一致性和无依据陈述率。
- 权限越界与高风险动作拦截。

### 9.3 在线反馈

记录方案采纳、候选替换、拒绝原因、人工预算调整、建联回复、实际合作和内容表现。模型或规则升级使用回放评估和小流量灰度，不直接在线自我修改权重。

---

## 10. 故障与降级策略

| 故障 | 降级方式 |
|---|---|
| LLM 不可用 | 使用关键词解析、固定追问和模板解释 |
| 检索超时 | 返回已完成数据源并标注缺失来源 |
| 数据不足 | 输出探索性候选和测试建议，证据降级 |
| 组合无解 | 返回冲突约束及可行的最小调整 |
| 证据校验失败 | 不展示该推荐，记录验证错误 |
| 发送渠道失败 | 保留已批准状态，幂等重试，不重复发送 |
| 审批过期或 payload 改变 | 要求重新审批 |

---

## 11. 开发分期

### 11.1 P0：可演示 MVP

1. StarAgent 页面、全局入口和会话 UI。
2. 规则式意图解析与必要追问。
3. mock Task、RecommendationPlan、EvidenceSnapshot、OutreachPlan。
4. awareness 与 conversion 两套可解释权重。
5. 组合方案、预算编辑、候选替换和证据抽屉。
6. 本地 Handoff 到红人/内容页面。
7. Campaign 草稿和建联人工确认演示。
8. 错误、数据不足和约束冲突状态。

### 11.2 P1：试点版本

1. Node.js/FastAPI 服务和 PostgreSQL。
2. 会话、任务、方案、证据、Handoff、审批和审计表。
3. 客户 CSV/Excel 数据导入与指标计算。
4. 受控检索、评分、规则 Agent 和 LLM 结构化解析/摘要。
5. SSE 流式状态、幂等和任务恢复。
6. 真实 Campaign、动作中心和基础消息渠道适配。
7. 离线评估与质量看板。

### 11.3 P2：商业化版本

1. 多租户和多外部数据源。
2. 可配置专业 Agent Registry 和 Orchestrator。
3. 约束优化、多方案模拟和高级归因。
4. 多渠道建联、回复同步和授权流程。
5. 模型/提示词/规则版本管理与灰度实验。
6. 完整 SLA、成本控制和安全评估。

---

## 12. 测试与验收

### 12.1 单元测试

- 中文金额、目标否定表达和多条件解析。
- Clarification Policy。
- 不同 objective 的评分权重。
- 预算加总、费用预留和约束求解。
- Evidence 强度和新鲜度计算。
- 权限、审批、payloadHash 和幂等逻辑。

### 12.2 集成测试

- 对话 → 追问 → 推荐 → 修改 → Handoff。
- 推荐 → Campaign → OutreachPlan → 审批 → 发送适配器。
- 数据更新后旧方案仍能读取原证据快照。
- 跨租户对象不可被检索、引用或 Handoff。
- 模型异常时完成模板降级。

### 12.3 P0 验收用例

输入：`我想投放一个吸奶器，预算是1w，主要目标是传播不是转化。`

预期：

1. 解析为 `build_promotion_plan + awareness + CNY 10000`。
2. 识别并处理市场、平台等缺失项。
3. 调用产品场景、红人匹配、内容检索、预算组合和风险规则。
4. 返回可编辑的红人角色组合、内容方向、预算和预期传播指标。
5. 每个候选包含证据和风险，数值可验证。
6. 可以带条件进入红人资产和内容资产。
7. 可以生成 Campaign 和 OutreachPlan 草稿。
8. 未完成人工审批时，发送接口和 UI 均不可执行。

---

## 13. 推荐实施顺序

```text
领域类型和 mock 数据
→ 对话/任务状态机
→ 任务理解与必要追问
→ 检索和目标化评分
→ 组合与预算
→ 证据快照和校验
→ 推荐画布与编辑
→ Handoff
→ Campaign / Outreach / Approval
→ 反馈、审计和评估
```

该顺序优先打通一条完整可验证的业务链路，再扩展更多意图和专业 Agent。

