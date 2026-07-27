# 星链红人增长引擎 AI 智能系统技术开发方案

版本：v2.0  
日期：2026-07-17  
依据文档：`星链红人增长引擎_正式PRD_v2.0_FastMoss对标与产品红人闭环版.md`  
基线方案：`星链红人增长引擎_AI智能系统技术方案_v1.2_全域价值模型版.md`  
技术定位：支撑外部达人发现、产品—红人关系资产、动态任务匹配、合作执行、全域归因和持续学习闭环的企业级数据与AI平台

---

## 1. 技术目标与范围

### 1.1 核心技术目标

```text
合规外部候选与企业一方数据接入
→ 统一红人、产品和业务对象
→ 产品—红人关系资产化
→ 产品/任务动态匹配与组合优化
→ 合作、内容、授权和渠道工作流
→ 多域指标、证据和分级归因
→ StarAgent与专业Agent编排
→ 结果回写、离线评估和灰度更新
```

### 1.2 必须支持的PRD需求

| 需求 | 技术责任 |
|---|---|
| 市场候选池与企业资产池分层 | 来源模型、候选服务、身份去重、分层权限 |
| FastMoss式高效搜索/榜单 | 搜索索引、榜单计算、保存视图和批处理 |
| 产品—红人图谱 | 关系表、关系服务、图谱查询和快照 |
| 动态匹配与可解释性 | 特征服务、匹配引擎、证据快照和模型注册 |
| 批量建联与合作闭环 | 工作流、审批、任务队列、SLA和审计 |
| 多平台、多渠道价值 | 统一事件、指标语义层、归因与去重 |
| 结果回写 | 反馈事件、关系更新、特征重算和离线评估 |

### 1.3 技术原则

- 业务对象、指标和规则优先于LLM生成。
- 外部候选数据和内部一方实绩物理或逻辑分层，禁止静默覆盖。
- 产品—红人基础关系与任务匹配快照分离。
- 所有推荐、预测、归因和AI动作可重放、可解释、可审计。
- 高风险商业动作由服务端审批强制拦截，不能依赖前端提示。
- P0优先使用关系数据库和可解释规则，避免过早引入复杂图数据库和黑盒模型。
- 外部达人数据只通过合法API、授权导出或人工导入接入，不设计规避平台限制的抓取机制。

### 1.4 非目标

- P0不建设全网实时采集系统。
- P0不承诺用户级跨平台确定性身份打通。
- LLM不直接访问生产数据库、不自行生成SQL、不计算财务指标。
- 不允许单次Campaign结果自动覆盖核心模型权重。

---

## 2. 总体架构

```text
体验层
├─ StarAgent / 动作中心 / 经营驾驶舱 / BI
├─ 市场候选池 / 红人资产 / 产品—红人图谱
├─ 合作 / 内容 / 产品场景 / 增长放大
└─ Campaign / 数据模型 / 系统设置

BFF与安全层
├─ API Gateway / Web BFF / SSE
├─ OIDC / RBAC / ABAC / Tenant Scope
├─ Approval Policy / Rate Limit
└─ Audit / Data Masking

业务服务层
├─ Identity & Candidate Service
├─ Product Context Service
├─ Product-Influencer Relation Service
├─ Match & Portfolio Service
├─ Cooperation Workflow Service
├─ Content & Authorization Service
├─ Campaign / Action Service
├─ Metric / Evidence / Attribution Service
└─ StarAgent Orchestrator

智能服务层
├─ Product Strategy Engine
├─ Influencer Capability Engine
├─ Dynamic Match Engine
├─ Ranking & Discovery Engine
├─ Content/VOC/Creative Engine
├─ Brand/Cross-channel/Conversion Engine
├─ Rule/Risk Engine
└─ Agent Registry / LLM Gateway

数据平台层
├─ PostgreSQL：业务对象、关系、工作流、权限
├─ Redis + BullMQ：异步任务、缓存、限流
├─ Object Storage：内容、附件、证据文件
├─ Analytical Store：事件、指标和大规模聚合
├─ OpenSearch：候选搜索与筛选（P1）
├─ pgvector：内容与VOC语义检索
└─ Metric / Feature / Evidence / Model Registry

集成层
├─ 合规外部达人数据/API/CSV
├─ 社媒平台与内部运营数据
├─ 独立站/GA4/订单
├─ Amazon / TikTok Shop
├─ 广告平台 / 搜索趋势
└─ 合同、授权、财务与企业身份系统
```

### 2.1 推荐技术栈

| 层 | 推荐方案 | 说明 |
|---|---|---|
| 前端 | React + TypeScript + Vite | 继承现有原型，逐步TypeScript化 |
| 状态/数据 | TanStack Query + Zustand | 服务端状态与交互状态分离 |
| API | NestJS + TypeScript | 与前端共享Schema，适合模块化与审批工作流 |
| Schema | OpenAPI + Zod | 运行时校验和客户端生成 |
| 业务库 | PostgreSQL 16 | 关系资产、工作流和审计主库 |
| 向量 | pgvector | P0减少额外基础设施 |
| 搜索 | PostgreSQL FTS，P1升级OpenSearch | 先满足试点规模，再支持复杂筛选 |
| 缓存/队列 | Redis + BullMQ | 同步、特征重算、导出和Agent异步任务 |
| 分析 | P0 PostgreSQL聚合；P1 ClickHouse或现有云数仓 | 依据事件量和既有数据栈确认 |
| 存储 | S3兼容对象存储 | 视频、截图、合同、证据附件 |
| 观测 | OpenTelemetry + Prometheus/Grafana + Sentry | 链路、指标、错误和成本观测 |
| 部署 | Docker + Kubernetes/企业现有容器平台 | P0可先单集群多环境 |

不建议P0引入Neo4j。产品—红人关系以结构化表、物化视图和递归查询即可满足；当出现复杂多跳探索且关系规模达到实际瓶颈时，再增加图数据库只读投影。

---

## 3. 领域模型与数据分层

### 3.1 数据域

```text
market_data      外部候选、榜单和公开/授权信号
master_data      品牌、市场、产品、红人统一身份
relationship     产品—红人关系、任务匹配和关系阶段
execution        Campaign、合作、动作、报价、Brief、授权
content          内容、片段、结构、VOC、素材版本
measurement      事件、指标、贡献、证据和实验
intelligence     特征、规则、模型、Agent运行和反馈
governance       权限、审批、审计、数据许可和质量
```

### 3.2 外部候选与企业资产分层

```ts
interface MarketCandidate {
  candidateId: string;
  sourceId: string;
  sourceRecordId: string;
  platform: string;
  handle: string;
  displayName?: string;
  marketIds: string[];
  categoryTags: string[];
  metrics: Record<string, number | null>;
  metricWindow?: DateRange;
  fetchedAt: string;
  licenseScope: string;
  confidence: number;
  linkedInfluencerId?: string;
  lifecycle: "new" | "reviewed" | "shortlisted" | "promoted" | "rejected";
}

interface DataSourceRecord {
  sourceId: string;
  provider: string;
  acquisitionMode: "api" | "authorized_export" | "manual" | "internal";
  licenseScope: string;
  retentionPolicy: string;
  freshnessSla?: string;
  owner: string;
  enabled: boolean;
}
```

外部数据采用source-of-record原则：原始记录不可修改；标准化结果可重算；晋升企业资产必须通过身份确认或人工审核。

### 3.3 统一红人身份

```ts
interface InfluencerIdentity {
  influencerId: string;
  tenantId: string;
  displayName: string;
  platformAccounts: PlatformAccount[];
  marketIds: string[];
  identityConfidence: "confirmed" | "high" | "medium" | "low";
  identityEvidenceIds: string[];
  status: "active" | "merged" | "archived";
  mergedIntoId?: string;
}
```

身份合并、拆分和外部候选映射均生成审计事件；低置信度映射不得用于确定性跨平台归因。

### 3.4 产品上下文

```ts
interface ProductContext {
  productId: string;
  brandId: string;
  marketId: string;
  lifecycleStage: string;
  priceBand?: string;
  audienceIds: string[];
  sceneIds: string[];
  painPointIds: string[];
  sellingPointIds: string[];
  proofIds: string[];
  targetChannelIds: string[];
  competitorIds: string[];
  validationStatus: Record<string, "unknown" | "testing" | "validated" | "rejected">;
  version: number;
}
```

任务启动时保存ProductContextSnapshot，后续产品数据修改不改变历史推荐依据。

---

## 4. 产品—红人关系模型

### 4.1 基础关系

```ts
interface ProductInfluencerRelation {
  relationId: string;
  tenantId: string;
  brandId: string;
  productId: string;
  marketId: string;
  influencerId: string;
  stage: "market_candidate" | "enterprise_candidate" | "first_test" |
    "observe" | "reinvest" | "core" | "bound" | "paused" | "rejected";
  baseDimensions: {
    categoryExperience?: number;
    audienceFit?: number;
    sceneAuthenticity?: number;
    trustFit?: number;
    priceFit?: number;
    brandToneFit?: number;
    marketLanguageFit?: number;
    competitorConflict?: number;
    complianceRisk?: number;
  };
  evidenceSnapshotId: string;
  evidenceStrength: number;
  freshness: string;
  manualOverride?: ManualOverride;
  version: number;
  updatedAt: string;
}
```

关系使用乐观锁version防止并发覆盖。手工修改必须填写原因、有效期和审批人，不直接删除模型值。

### 4.2 任务匹配快照

```ts
interface TaskMatchSnapshot {
  matchId: string;
  taskId: string;
  relationId: string;
  productContextSnapshotId: string;
  objectiveWeights: Record<string, number>;
  constraints: MatchConstraint[];
  expectedRoles: string[];
  dimensionScores: Record<string, number | null>;
  totalScore: number;
  predictedRanges: Record<string, RangeEstimate>;
  reasons: ReasonCode[];
  conflicts: ConflictCode[];
  alternatives: string[];
  evidenceSnapshotId: string;
  featureVersion: string;
  ruleVersion: string;
  modelVersion: string;
  createdAt: string;
}
```

任务快照不可变。用户调整目标、预算或约束后生成新版本，并保留差异比较。

### 4.3 合作结果反馈

```ts
interface RelationOutcome {
  outcomeId: string;
  relationId: string;
  campaignId: string;
  cooperationId: string;
  executionMetrics: Record<string, number | string>;
  contentMetrics: Record<string, number | null>;
  valueContributions: string[];
  authorizationResult?: string;
  reviewDecision: "reinvest" | "bind" | "observe" | "pause" | "reject";
  evidenceSnapshotId: string;
  reviewedBy: string;
  reviewedAt: string;
  feedbackStatus: "pending" | "applied" | "excluded";
}
```

反馈先进入pending；通过数据质量和异常检查后再更新关系特征。人工可排除异常Campaign，但必须留痕。

### 4.4 关系查询策略

- 主写库：`product_influencer_relation`。
- 任务快照：`task_match_snapshot`，按task和product分区索引。
- 高频图谱读取：按产品/市场物化视图或Redis缓存。
- 历史结果：按relation_id聚合，不在关系主表反复堆字段。
- 复杂图谱仅作为读模型，不作为审批和工作流事实来源。

---

## 5. 外部达人发现与榜单服务

### 5.1 连接器规范

所有外部数据源实现统一接口：

```ts
interface CandidateConnector {
  validateLicense(): Promise<LicenseResult>;
  pull(cursor?: string): Promise<CandidateBatch>;
  normalize(raw: unknown): Promise<NormalizedCandidate[]>;
  health(): Promise<ConnectorHealth>;
}
```

每批次记录ingestion_id、来源、时间、许可、字段映射版本和校验结果。FastMoss相关数据仅在路特创新拥有合法API或导出权限时接入。

### 5.2 候选搜索

P0使用PostgreSQL倒排/GIN索引，支持：平台、市场、品类、粉丝区间、增长、互动、销售、内容主题、联系方式状态、数据新鲜度和企业关系阶段。

P1达到以下任一条件时引入OpenSearch：候选超过500万、组合筛选P95超过800ms、榜单聚合影响在线业务库。

### 5.3 榜单计算

榜单不是永久总排名，而是保存上下文和版本的RankingSnapshot：

```text
榜单分 = 标准化外部表现
       + 产品/品类相关性
       + 增长动量
       + 企业历史先验（如有）
       - 数据陈旧惩罚
       - 风险与不确定性惩罚
```

至少支持：潜力达人、品类增长、内容验证、素材潜力、跨渠引流、复投价值。所有榜单展示窗口、字段覆盖率和不适用说明。

### 5.4 批处理

- 批量加入企业候选、Campaign候选或建联队列。
- 身份去重、竞品冲突、黑名单和权限预检查。
- 单批次上限和异步执行，返回成功、跳过和失败原因。
- 联系方式查看、导出和触达均写审计日志并应用限流。

---

## 6. 统一事件与指标体系

### 6.1 标准事件

```ts
interface MarketingEvent {
  eventId: string;
  tenantId: string;
  eventType: string;
  occurredAt: string;
  source: string;
  sourceEventId?: string;
  marketId?: string;
  productId?: string;
  relationId?: string;
  influencerId?: string;
  campaignId?: string;
  cooperationId?: string;
  contentId?: string;
  channelId?: string;
  anonymousUserId?: string;
  orderId?: string;
  value?: number;
  currency?: string;
  properties: Record<string, unknown>;
  dataQuality: "verified" | "normal" | "estimated" | "unknown";
  ingestionId: string;
}
```

### 6.2 反馈事件

新增闭环关键事件：

- `relation.stage_changed`
- `match.accepted/rejected/edited`
- `candidate.promoted`
- `cooperation.outcome_reviewed`
- `content.hypothesis_validated`
- `creative.authorization_confirmed`
- `attribution.window_closed`
- `feature.recompute_requested/completed`
- `model.feedback_applied/excluded`

### 6.3 去重与幂等

- 外部事件使用source + sourceEventId；内部事件使用业务幂等键。
- 订单事实和贡献记录分表。
- 数据修订新增版本，不覆盖历史证据快照。
- 币种、时区、市场和数据窗口在分析层统一。

### 6.4 Metric Registry

```ts
interface MetricDefinition {
  key: string;
  domain: "brand" | "mindshare" | "content" | "creative" |
    "traffic" | "conversion" | "cooperation" | "risk" | "efficiency";
  formula: string;
  grain: string[];
  sourceRequirements: string[];
  freshnessSla: string;
  nullPolicy: string;
  version: string;
  owner: string;
}
```

驾驶舱、BI、匹配、Agent和导出必须调用同一指标服务。

---

## 7. 特征、能力与动态匹配

### 7.1 特征记录

每个特征保存：值、窗口、样本数、缺失状态、来源、新鲜度、置信度、计算版本和证据ID。

特征分层：

```text
external_market_features  外部增长、互动、销售、内容和榜单信号
influencer_capabilities   红人稳定能力
product_relation_features 产品适配、场景、信任、竞品和历史结果
task_context_features     目标、渠道、预算、档期和角色约束
execution_features        回复、报价、履约、授权和复投
risk_features             合规、舆情、冲突和数据不确定性
```

### 7.2 动态匹配流程

```text
Context Validation
→ Candidate Retrieval
→ Hard Constraint Filtering
→ Feature Join
→ Dimension Scoring
→ Role Assignment
→ Portfolio Optimization
→ Evidence Assembly
→ Snapshot Persistence
→ Explanation Rendering
```

### 7.3 匹配公式

```text
match_score =
  Σ objective_weight[d] × capability[d]
  + audience_fit
  + scene_fit
  + selling_point_fit
  + channel_fit
  + product_history_prior
  + relationship_value
  - cost_penalty
  - audience_overlap_penalty
  - competitor_conflict_penalty
  - risk_penalty
  - uncertainty_penalty
```

P0采用版本化规则和线性加权，所有权重可解释；P1在历史样本足够后引入学习排序，但保留硬约束、校准层和解释层。

### 7.4 缺失数据处理

- 缺失不等于0，使用`null + missing_reason`。
- 数据覆盖不足时降低置信度，不通过隐式均值填充伪造确定性。
- 关键约束缺失时返回补充问题或验证动作。
- 预测输出区间而非单点，并记录训练分布适用范围。

### 7.5 组合优化

约束：预算、角色覆盖、平台、市场、档期、授权、竞品、受众重叠、最低证据和风险上限。

P0使用可解释启发式；P1可采用OR-Tools整数规划。必须返回可行性、被触发约束、替代组合和目标敏感性。

---

## 8. 合作工作流与动作引擎

### 8.1 状态机

```text
candidate → contact_pending → contacted → replied → quoting
→ confirmed → sample_sent → producing → reviewing → published
→ authorization → amplification → review → reinvest/bind/pause
```

状态转换由后端状态机校验；禁止客户端直接写任意状态。

### 8.2 动作模型

```ts
interface ActionTask {
  actionId: string;
  objectType: string;
  objectId: string;
  actionType: string;
  status: "pending_confirmation" | "assigned" | "in_progress" |
    "pending_validation" | "completed" | "reviewed" | "cancelled";
  ownerId?: string;
  approverIds: string[];
  dueAt?: string;
  inputSnapshotId: string;
  acceptanceCriteria: string[];
  externalEffect: boolean;
}
```

### 8.3 批量建联

批量操作只创建待确认动作；发送前执行联系人权限、模板、频率、平台政策、黑名单、重复触达和审批检查。每位红人的个性化内容和发送状态独立保存，避免批次失败导致整体不可追踪。

### 8.4 审批策略

使用服务端Policy Engine：按动作类型、金额、市场、品牌、风险和数据敏感度决定审批人。审批令牌一次性使用并绑定对象版本，防止审批后内容被替换。

---

## 9. 内容、VOC与素材链路

### 9.1 内容结构

```text
Content → Segment → Hook/Scene/PainPoint/SellingPoint/Proof/CTA
        → VOC Topic → Authorization → Creative Variant
        → Channel Placement → Ad Performance → Fatigue/Reuse Result
```

### 9.2 多模态分析

组合ASR、字幕、OCR、镜头切分和多模态模型；输出Schema化标签和置信度，支持人工纠错。模型输入和输出保存版本，原始内容按权限和保留期管理。

### 9.3 验证回写

同一场景/卖点需支持跨红人、跨内容结构的复现比较。验证结论写入ProductContext.validationStatus，并生成RelationOutcome；不得因单条爆款直接标记“可规模化”。

---

## 10. 归因与证据系统

### 10.1 ContributionRecord

```ts
interface ContributionRecord {
  contributionId: string;
  subjectType: "influencer" | "relation" | "content" | "campaign" | "creative";
  subjectId: string;
  productId: string;
  valueDomain: string;
  metricKey: string;
  rawValue: number;
  incrementalValue?: number;
  contributionShare?: number;
  attributionLevel: "deterministic" | "strong" | "medium" |
    "weak" | "experimental" | "observational";
  methodology: string;
  baselineId?: string;
  evidenceSnapshotId: string;
  window: DateRange;
  modelVersion: string;
  limitations: string[];
}
```

### 10.2 EvidenceSnapshot

保存结论产生时的对象版本、查询条件、指标、样本、基线、来源、新鲜度、规则、模型、归因方法和限制。快照不可修改，只能创建替代版本。

### 10.3 归因分期

- P0：专属链接/码、平台归因、发布窗口和前后基线。
- P1：辅助触点、时间衰减、匹配对照和聚合异常控制。
- P2：地域/人群实验、合成控制、因果估计和高级多触点归因。

### 10.4 防重复记账

- `conversion_event`为唯一交易事实。
- 多个ContributionRecord只分配贡献份额。
- 财务值、指数和观察信号分开展示。
- 多红人贡献份额总和不得超过策略上限。

---

## 11. StarAgent与专业Agent

### 11.1 编排流程

```text
Intent Parse
→ Permission-aware Context Builder
→ Missing Context Resolution
→ Deterministic Service Calls
→ Professional Agent Execution
→ Evidence/Risk Validation
→ Structured Result Validation
→ Explanation and Draft Actions
→ Human Approval
```

### 11.2 Agent契约

每个Agent注册：输入Schema、输出Schema、允许工具、数据权限、最低证据、超时、重试、降级、版本、成本上限和评估集。

新增Agent：

```yaml
product_strategy:
  tools: [product_context_query, voc_query, validation_query]
market_discovery:
  tools: [candidate_search, ranking_query, source_quality_query]
product_relation:
  tools: [relation_query, outcome_query, evidence_query]
dynamic_match:
  tools: [candidate_retrieve, feature_query, match_run, portfolio_optimize]
cooperation:
  tools: [workflow_query, quote_query, authorization_query]
```

### 11.3 LLM边界

LLM负责意图抽取、语义理解、解释、总结和草稿。候选集合、分数、预算、指标、归因等级、审批和外部执行来自确定性服务。所有数值在输出前通过Schema和证据ID一致性校验。

### 11.4 Prompt Injection防护

- 外部达人简介、内容、评论和文件均为不可信数据。
- 工具参数由Schema构造，不拼接外部文本为系统指令。
- 高权限工具与LLM隔离，由服务端策略决定是否执行。
- 检索内容携带来源标签并限制上下文长度。

---

## 12. API设计

### 12.1 候选与身份

```http
GET  /api/market-candidates
POST /api/market-candidates/import
POST /api/market-candidates/batch/promote
GET  /api/rankings/:type
POST /api/identity/resolve
POST /api/identity/merge
```

### 12.2 产品与关系

```http
GET  /api/products/:id/context
POST /api/products/:id/context/snapshots
GET  /api/products/:id/influencer-relations
GET  /api/influencers/:id/product-relations
GET  /api/relations/:id
POST /api/relations/:id/stage-transitions
GET  /api/relations/:id/outcomes
```

### 12.3 匹配与组合

```http
POST /api/match-tasks
POST /api/match-tasks/:id/run
GET  /api/match-tasks/:id/snapshots
GET  /api/match-snapshots/:id/evidence
POST /api/portfolios/optimize
POST /api/portfolios/:id/convert-to-campaign
```

### 12.4 执行与回写

```http
POST /api/candidates/batch-actions
POST /api/cooperations
POST /api/cooperations/:id/transitions
POST /api/actions/:id/approve
POST /api/actions/:id/execute
POST /api/reviews/:id/apply-feedback
GET  /api/closed-loop/health
```

### 12.5 分析、证据与Agent

```http
GET  /api/dashboard/full-value
POST /api/bi/query
GET  /api/evidence-snapshots/:id
GET  /api/contributions/:id/methodology
POST /api/star-agent/conversations/:id/messages
GET  /api/star-agent/tasks/:id/events
POST /api/agent-feedback
```

异步匹配、导入、导出、同步和Agent任务通过SSE返回进度；客户端断线后可按task_id恢复。

---

## 13. 权限、隐私与审计

### 13.1 权限模型

- Tenant → Brand → Market → Object层级范围。
- RBAC控制角色，ABAC控制品牌、市场、金额和敏感字段。
- 联系方式、合同、订单和用户标识字段级脱敏。
- 导出使用短时签名链接并记录行数、字段、筛选和下载人。

### 13.2 数据许可

每个外部数据源记录许可、用途、保留期和禁止用途。连接器在运行前校验许可状态；到期后停止同步并按策略删除或归档。

### 13.3 审计范围

身份合并、关系阶段、人工覆盖、指标修改、规则/模型版本、候选导出、联系人查看、Agent建议、审批、发送、报价、授权、付款和反馈应用必须审计。

---

## 14. 数据质量与可观测性

### 14.1 数据质量

按数据源监控：同步成功率、新鲜度、字段覆盖率、重复率、身份映射率、异常值、许可状态和质量等级。

推荐前检查关键特征覆盖；数据质量不达阈值时降级为探索性输出或阻止自动动作。

### 14.2 服务SLO

| 能力 | P0目标 |
|---|---|
| 候选搜索P95 | < 800ms（100万候选以内） |
| 产品关系页P95 | < 1.2s |
| 单任务匹配（500候选） | < 10s，异步可见进度 |
| 批量导入 | 10万行<15分钟 |
| 核心API月可用性 | 99.5% |
| 证据引用完整率 | 100%关键结论 |

### 14.3 AI观测

记录Agent耗时、工具调用、token成本、缓存命中、Schema失败、无依据陈述、人工采纳/修改/拒绝和失败降级。不得记录未脱敏敏感内容。

---

## 15. 测试与评估

### 15.1 软件测试

- 单元测试：评分、状态机、审批、去重和归因上限。
- 契约测试：外部连接器、OpenAPI和事件Schema。
- 集成测试：产品找人→Campaign→合作→复盘→关系回写。
- E2E：三条入口（StarAgent、产品页、榜单）完成同一业务任务。
- 安全测试：越权、敏感字段、审批绕过、批量导出和提示注入。
- 性能测试：候选搜索、关系查询、匹配和大批量导入。

### 15.2 模型评估

- 排序NDCG/HitRate与人工候选重合及差异解释。
- 推荐组合相对人工基线的业务表现。
- 预测区间覆盖率和校准误差。
- 关系阶段建议准确率及人工采纳率。
- 不同市场、平台和红人量级的公平性与偏差。
- 证据引用正确率、无依据陈述率和数值一致性。

### 15.3 业务实验

- 推荐组vs人工组。
- 外部榜单候选vs传统人工搜集。
- 产品上下文匹配vs仅历史表现排序。
- 内容结构跨红人复现实验。
- 自然优选素材vs随机素材广告测试。

模型发布必须经过离线回放、小流量灰度、业务审批和可回滚验证。

---

## 16. 开发实施计划

### 阶段0：基线与数据盘点（第1—2周）

- 冻结对象词典、指标口径和权限矩阵。
- 盘点现有红人、产品、合作、内容和渠道数据。
- 确认FastMoss或其他外部数据的合法接入方式。
- 建立环境、CI/CD、日志、错误和审计框架。

交付：数据字典、源系统清单、接口清单、P0验收数据集。

### 阶段1：关系基座与候选发现（第3—5周）

- 统一红人身份、产品上下文和产品—红人关系表。
- 外部候选导入、搜索、筛选、去重和晋升。
- 产品—红人图谱API和前端页面。
- 任务上下文、关系阶段和证据快照。

交付：可从产品生成候选并查看关系解释。

### 阶段2：匹配与组合（第6—8周）

- 特征服务、规则引擎、动态匹配和组合优化。
- 任务快照、版本比较、替代人选和缺失数据处理。
- StarAgent产品找人编排。

交付：3分钟内完成可解释候选组合。

### 阶段3：执行闭环（第9—11周）

- 合作状态机、动作中心、审批和批量建联队列。
- Campaign、Brief、授权和内容对象串联。
- 结果复盘和关系反馈事件。

交付：推荐可进入执行，执行结果可回写关系。

### 阶段4：价值与归因（第12—16周）

- 接入基础独立站、Amazon、TikTok Shop、广告和搜索数据。
- Metric Registry、贡献记录、证据和闭环健康度。
- 品牌、内容、素材、引流、转化分域视图。

交付：M5完整链路和历史回算报告。

### 阶段5：试点与灰度（第17—20周）

- 选择1个品牌、1—2个市场、2—3个产品试点。
- 建立人工基线、推荐对照、运营反馈和问题闭环。
- 完成性能、安全、权限、模型和业务验收。

交付：试点评估、上线清单、回滚方案和P1规划。

---

## 17. 团队建议

P0建议最小团队：

- 产品负责人1名、KOL业务专家1名。
- 前端2名、后端3名、数据工程2名。
- 算法/AI 2名、测试1—2名、设计1名。
- 安全/法务/数据治理按评审节点参与。

业务侧需明确产品、红人运营、内容、广告和数据负责人，确保口径与反馈有人确认。

---

## 18. 技术验收标准

1. 外部候选保留来源、许可、新鲜度和原始记录，且不覆盖内部实绩。
2. 平台账号可归并统一红人ID，并保留置信度和审计。
3. 产品—红人关系具有独立阶段、维度、证据和历史结果。
4. 同一红人在不同产品和任务上下文中获得不同匹配快照。
5. 匹配结果包含理由、冲突、预测区间、替代方案和版本。
6. 推荐、批量处理和外部动作均经过权限与审批服务。
7. 合作、内容、授权和渠道结果可回写关系和特征。
8. 订单事实不会因多触点贡献重复记账。
9. 驾驶舱、BI、匹配和Agent使用同一指标口径。
10. LLM输出数值可映射到结构化数据和证据ID。
11. 数据质量不足时系统降级或阻止高置信结论。
12. 关键服务满足SLO，模型升级可灰度和回滚。

---

## 19. PRD—技术追踪矩阵

| PRD需求 | 核心服务 | 关键表/对象 | API | 验收 |
|---|---|---|---|---|
| FM-R01 市场/企业池分层 | Candidate/Identity | market_candidate/data_source/influencer | `/market-candidates` | 来源不覆盖、可晋升 |
| FM-R02 榜单筛选 | Ranking/Search | ranking_snapshot/saved_view | `/rankings/:type` | 3分钟产出名单 |
| FM-R03 产品—红人图谱 | Relation/Product | product_context/relation/outcome | `/products/:id/influencer-relations` | 多产品差异可解释 |
| FM-R04 批量建联 | Workflow/Action | action/cooperation/approval | `/candidates/batch-actions` | 状态、审批、审计完整 |
| FM-R05 推荐快照 | Match/Evidence | task_match_snapshot/evidence_snapshot | `/match-tasks/:id/run` | 100%关键结论可追溯 |
| FM-R06 多域价值 | Metric/Attribution | event/contribution/metric | `/dashboard/full-value` | 分域展示、不重复记账 |
| FM-R07 分级归因 | Evidence/Attribution | contribution/evidence/baseline | `/contributions/:id/methodology` | 等级、方法、限制明确 |
| FM-R08 外部连接器 | Integration | ingestion/source/raw_record | `/market-candidates/import` | 许可、质量、幂等可审计 |
| 结果回写 | Feedback/Feature | relation_outcome/feedback_event | `/reviews/:id/apply-feedback` | 画像、关系和推荐更新 |

---

## 20. 待确认技术信息

- 路特创新现有云平台、数据仓库、身份系统和CI/CD标准。
- FastMoss或其他外部数据服务可用的API、导出格式、频率和许可。
- 现有红人、产品、合作、合同、付款和内容表结构及数据质量。
- 各渠道事件量、历史数据年限、币种、时区和主数据口径。
- 企业安全等级、跨境数据要求、敏感字段及保留期限。
- 试点品牌、市场、产品、团队和人工基线数据。

