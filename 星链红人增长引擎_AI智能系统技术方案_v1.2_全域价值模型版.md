# 星链红人增长引擎 AI 智能系统技术方案

版本：v1.2  
日期：2026-07-16  
依据文档：`星链红人增长引擎_正式PRD_v1.3_红人全域价值版.md`  
技术定位：支撑红人全域价值识别、跨资产关联、动态任务匹配、证据分级和增长放大的数据与 AI 平台。

---

## 1. 技术目标

### 1.1 核心目标

```text
多源数据接入
→ 统一身份与业务对象
→ 资产图谱与指标计算
→ 内容/VOC 语义理解
→ 红人稳定能力画像
→ 任务动态匹配
→ 品牌、素材、引流和转化贡献识别
→ 证据分级与解释
→ StarAgent 编排和动作生成
→ 执行反馈、实验和模型校准
```

### 1.2 技术原则

- 数据与指标优先于 LLM 生成。
- 红人基础能力与任务匹配分分离。
- 全域价值分维度展示，不以单一分数掩盖差异。
- 所有结论可追踪到数据、口径、版本和证据快照。
- 确定归因、辅助归因、实验估算和相关信号严格区分。
- 事件、用户和价值贡献避免重复计算。
- 跨平台身份关联遵守隐私、权限和平台政策。
- 高风险及外部商业动作由服务端审批强制拦截。

### 1.3 非目标

- MVP 不建立全网实时抓取系统。
- MVP 不承诺用户级跨平台完全打通。
- 不允许 LLM 自行生成 SQL、评分、指标或归因结论。
- 不使用黑盒总分替代维度指标和证据解释。

---

## 2. 总体架构

```text
Experience Layer
├─ StarAgent Workspace
├─ Action Center
├─ Business Dashboard / BI Center
├─ Asset Centers
├─ Brand Impact / Cross-channel Influence
└─ Campaign / Amplification / VOC

API & Security Layer
├─ API Gateway / BFF
├─ Identity / RBAC / Tenant Scope
├─ Approval / Audit
└─ Streaming / Async Job API

Application Layer
├─ Asset Services
├─ Campaign & Cooperation Service
├─ Metric & BI Service
├─ Attribution Service
├─ Evidence Service
├─ Recommendation & Portfolio Service
├─ Outreach / Authorization / Action Service
└─ StarAgent Orchestrator

Intelligence Layer
├─ Influencer Capability Engine
├─ Dynamic Match Engine
├─ Content Understanding Engine
├─ VOC / Mindshare Engine
├─ Brand Impact Engine
├─ Cross-channel Influence Engine
├─ Creative Reuse Engine
├─ Rule / Risk Engine
└─ LLM Adapter / Agent Registry

Data Platform
├─ PostgreSQL: 业务对象与状态
├─ Object Storage: 内容、素材和证据附件
├─ Analytical Warehouse: 事件、指标和聚合
├─ Search / Vector Index: 内容与语义检索
├─ Metric Registry / Feature Store
└─ Evidence / Audit / Model Registry

Integration Layer
├─ Social Platform Data
├─ Independent Site Analytics / Orders
├─ Amazon
├─ TikTok Shop
├─ Search Trends / Brand Search
├─ Advertising Platforms
└─ CSV / Excel / Internal Systems
```

### 2.1 推荐技术栈

- 前端：React、TypeScript、Vite。
- API：Node.js/NestJS 或 FastAPI；MVP 推荐 REST + SSE。
- 业务库：PostgreSQL。
- 分析：P1 可用 DuckDB/ClickHouse/BigQuery，按现有数据栈选择。
- 对象存储：S3 兼容存储。
- 队列：P1 引入 Redis Queue/Kafka 处理同步和计算任务。
- 语义：pgvector 或独立向量索引，保存内容片段和 VOC embedding。
- BI：统一 Semantic/Metric Layer，避免看板各自计算。

---

## 3. 统一身份与资产图谱

### 3.1 统一红人身份

```ts
interface InfluencerIdentity {
  influencerId: string;
  displayName: string;
  marketIds: string[];
  platformAccounts: PlatformAccount[];
  identityLinks: IdentityLink[];
  confidence: "confirmed" | "high" | "medium" | "low";
  mergedIntoId?: string;
}

interface PlatformAccount {
  platform: "instagram" | "tiktok" | "youtube" | "xiaohongshu" | "other";
  platformAccountId: string;
  handle: string;
  url?: string;
  lastSyncedAt?: string;
}

interface IdentityLink {
  sourceAccountId: string;
  targetAccountId: string;
  method: "manual" | "declared_link" | "email_hash" | "rule";
  confidence: number;
  approvedBy?: string;
}
```

低置信度身份不得用于确定性跨平台归因；人工合并和拆分必须保留审计记录。

### 3.2 核心对象

```yaml
assets:
  Brand: 品牌
  Market: 市场
  Product: 产品
  Scene: 用户场景
  SellingPoint: 卖点
  Influencer: 红人主体
  PlatformAccount: 平台账号
  Cooperation: 一次合作关系
  Quote: 报价与价格口径
  Brief: 内容要求
  Content: 原始内容
  ContentSegment: Hook/镜头/片段
  ContentStructure: 内容结构
  Authorization: 授权范围
  CreativeVariant: 二创或广告版本
  ChannelPlacement: 素材复用位置
  Campaign: 营销活动
  TouchpointEvent: 触点事件
  ConversionEvent: 转化事件
  BrandSignal: 品牌/心智信号
  VocTopic: VOC 主题
  Action: 动作任务
```

### 3.3 关键关系

```text
Influencer 1-N PlatformAccount
Influencer 1-N Cooperation
Cooperation N-1 Campaign / Product / Scene
Cooperation 1-N Content / Quote / Brief / Authorization
Content 1-N ContentSegment / CreativeVariant / VocTopic
CreativeVariant N-N ChannelPlacement
Campaign N-N Influencer / Content / Channel
TouchpointEvent N-1 Content / Influencer / Campaign / Channel
ConversionEvent 0-N TouchpointEvent
BrandSignal N-1 Brand / Product / Campaign / Influencer
```

---

## 4. 数据事件模型

### 4.1 标准事件

```ts
interface MarketingEvent {
  eventId: string;
  tenantId: string;
  eventType: string;
  occurredAt: string;
  source: string;
  channel: string;
  marketId?: string;
  campaignId?: string;
  influencerId?: string;
  contentId?: string;
  productId?: string;
  anonymousUserId?: string;
  sessionId?: string;
  orderId?: string;
  value?: number;
  currency?: string;
  properties: Record<string, unknown>;
  ingestionId: string;
  dataQuality: "verified" | "normal" | "estimated" | "unknown";
}
```

### 4.2 事件类别

- 社媒：曝光、有效播放、观看时长、互动、收藏、分享、评论、主页访问。
- 站点：UTM 点击、会话、产品页访问、加购、结账和订单。
- Amazon：品牌搜索、详情页访问、加购、订单及可用的 Attribution 事件。
- TikTok Shop：商品访问、加购、订单和内容归因。
- 搜索：品牌词、产品词和品类词趋势。
- 广告：展示、点击、观看、CTR、CVR、CPA、ROAS 和素材疲劳。
- 合作：推荐、建联、回复、报价、确认、交付、授权、付款和复投。

### 4.3 去重与幂等

- 使用 source + sourceEventId 或业务幂等键去重。
- 同一订单仅保留一个事实记录，归因贡献单独记录。
- 事件保留原始时区、币种和来源，分析层统一转换。
- 数据修订不覆盖历史证据快照。

---

## 5. 指标与特征体系

### 5.1 Metric Registry

```ts
interface MetricDefinition {
  key: string;
  name: string;
  domain: "brand" | "mindshare" | "content" | "creative" | "traffic" | "conversion" | "cooperation" | "risk";
  formula: string;
  grain: string[];
  sourceRequirements: string[];
  freshnessSla?: string;
  version: string;
  owner: string;
}
```

经营驾驶舱、BI、Agent 和评分引擎必须调用同一指标服务。

### 5.2 特征分类

```text
influencer_features
├─ audience_fit
├─ communication / trust
├─ storytelling / expression
├─ reach / engagement quality
├─ content_validation
├─ creative_reusability
├─ cross_channel_influence
├─ conversion / profitability
├─ cooperation / fulfillment
└─ risk / cost
```

每个特征保存数值、时间窗口、样本数、缺失状态、数据新鲜度、计算版本和置信度。

---

## 6. 红人全域能力引擎

### 6.1 稳定能力画像

按滚动窗口计算基础能力，不与单次任务目标绑定：

```ts
interface CapabilityProfile {
  influencerId: string;
  marketId: string;
  asOf: string;
  dimensions: Record<string, CapabilityDimension>;
  roleProbabilities: Record<string, number>;
  evidenceSnapshotId: string;
  profileVersion: string;
}

interface CapabilityDimension {
  score: number;
  confidence: number;
  sampleSize: number;
  trend: "up" | "stable" | "down" | "unknown";
  evidenceIds: string[];
  missingSignals: string[];
}
```

### 6.2 业务角色画像

角色由多维特征组合，不使用互斥分类。示例：

```yaml
brand_awareness:
  weights: [effective_reach, target_audience_fit, share_quality, brand_safety]
content_validation:
  weights: [retention, save_rate, semantic_signal, structure_repeatability]
creative_asset:
  weights: [organic_validation, authorization, editability, paid_transfer]
cross_channel_traffic:
  weights: [click_quality, search_lift, assisted_visit, decay]
conversion:
  weights: [new_customer, margin, cac, refund_adjusted_roi]
```

### 6.3 任务动态匹配

```ts
interface MatchContext {
  objectiveWeights: Record<string, number>;
  productId: string;
  sceneIds: string[];
  marketId: string;
  publishPlatforms: string[];
  targetChannels: string[];
  budget: Money;
  timeRange: DateRange;
  constraints: MatchConstraint[];
}

interface DynamicMatchResult {
  influencerId: string;
  totalMatchScore: number;
  dimensionScores: Record<string, number>;
  estimatedCost?: Money;
  expectedRole: string[];
  evidenceIds: string[];
  risks: string[];
  limitations: string[];
  modelVersion: string;
}
```

```text
match_score =
  Σ objective_weight[d] × capability[d]
  + product_fit
  + scene_fit
  + channel_fit
  + historical_brand_fit
  - cost_penalty
  - audience_overlap_penalty
  - risk_penalty
  - uncertainty_penalty
```

### 6.4 组合优化

优化目标支持多目标配置：品牌传播、素材沉淀、跨平台引流、转化及风险。约束包括预算、红人角色覆盖、市场、平台、档期、竞品、授权、受众重叠和最低证据强度。

P0 使用可解释启发式；P1 可使用整数规划/约束优化，必须返回约束、权重和替代方案。

---

## 7. 内容、VOC 与素材复用引擎

### 7.1 内容理解 Schema

```ts
interface ContentAnalysis {
  contentId: string;
  hooks: string[];
  scenes: string[];
  painPoints: string[];
  sellingPoints: string[];
  proofTypes: string[];
  ctaTypes: string[];
  structureId?: string;
  segments: ContentSegmentAnalysis[];
  modelVersion: string;
  reviewStatus: "auto" | "human_verified" | "rejected";
}
```

视频分析可结合 ASR、字幕、OCR、镜头切分和多模态模型；输出必须允许人工校正。

### 7.2 VOC / 心智分析

- 评论聚类、情绪、问题、购买意图和品牌/卖点/场景实体识别。
- 发布前后主题占比和语义迁移比较。
- 标记机器人、重复和低质量评论，避免污染。
- 将代表性原文作为证据，遵守权限和隐私规则。

### 7.3 自然到广告的迁移

建立以下链路：

```text
Content
→ ContentSegment
→ Authorization
→ CreativeVariant
→ ChannelPlacement
→ Ad Performance
→ Fatigue / Reuse Result
```

计算自然指标对广告 CTR、CVR、CPA、ROAS 和生命周期的预测关系，区分红人、内容结构、剪辑和投放人群因素。

---

## 8. 品牌影响与跨平台引流

### 8.1 品牌影响时间序列

按品牌、市场、产品、Campaign、红人组和内容记录：

- 有效触达与去重覆盖。
- 品牌词/产品词搜索。
- 品类声量、SOV 和竞品差值。
- VOC 主题、情绪、卖点理解和疑虑。
- 调研或实验结果。

### 8.2 影响窗口

每次发布建立观察窗口：发布前基线、短期响应、中期衰减和长期残留。窗口按平台和目标配置，避免任意选择有利时间段。

### 8.3 跨渠道路径

优先级：

1. 确定性：UTM、专属链接、优惠码、Amazon Attribution、平台归因。
2. 高置信：登录态、合法的第一方 ID 或可靠映射。
3. 聚合增量：时间序列、地区、人群或对照实验。
4. 相关信号：搜索、访问和评论意向共同变化。

不得将低置信路径用于用户级营销或确定归因。

---

## 9. 归因与证据系统

### 9.1 ContributionRecord

```ts
type AttributionLevel =
  | "deterministic"
  | "strong"
  | "medium"
  | "weak"
  | "experimental"
  | "observational";

interface ContributionRecord {
  id: string;
  subjectType: "influencer" | "content" | "campaign" | "creative";
  subjectId: string;
  valueDomain: string;
  metricKey: string;
  rawValue: number;
  incrementalValue?: number;
  contributionShare?: number;
  attributionLevel: AttributionLevel;
  methodology: string;
  baselineId?: string;
  evidenceIds: string[];
  window: DateRange;
  modelVersion: string;
  limitations: string[];
}
```

### 9.2 EvidenceSnapshot

保存推荐或经营结论产生时的数据版本、查询、样本、指标、基线、归因方法和限制。后续数据更新不修改历史快照。

### 9.3 归因方法分期

- P0：专属链接/码、时间窗口、发布前后基线和规则分级。
- P1：辅助触点、时间衰减、内容/渠道路径、匹配对照和异常控制。
- P2：地域/人群实验、合成控制、因果影响估计和高级多触点归因。

### 9.4 防重复计算

- ConversionEvent 是唯一交易事实。
- ContributionRecord 只分配贡献，不复制订单价值。
- 跨维度综合展示标记“不可相加”或使用标准化指数。
- 多红人同窗影响的贡献份额总和不得超过规定上限。
- 品牌影响指数与财务收益分开展示。

---

## 10. StarAgent 与专业 Agent

### 10.1 编排流程

```text
Task Understanding
→ Permission-aware Context Builder
→ Metric / Asset Retrieval
→ Professional Agent Execution
→ Dynamic Match / Attribution / Evidence
→ Structured Result Validation
→ Explanation & Action Generation
→ Human Approval
```

### 10.2 Agent Registry

```yaml
agents:
  influencer_capability:
    tools: [feature_query, evidence_query]
  dynamic_match:
    tools: [capability_query, product_scene_query, portfolio_optimizer]
  brand_impact:
    tools: [brand_signal_query, baseline_compare, experiment_query]
  content_validation:
    tools: [content_analysis_query, voc_query, structure_compare]
  creative_amplification:
    tools: [authorization_query, creative_query, ad_performance_query]
  cross_channel_influence:
    tools: [touchpoint_query, attribution_query, channel_timeseries]
  conversion_business:
    tools: [order_metric_query, margin_query, attribution_query]
  cooperation_value:
    tools: [cooperation_query, quote_query, fulfillment_query]
  evidence_risk:
    tools: [evidence_validate, policy_check, risk_query]
```

每个 Agent 必须声明输入/输出 Schema、权限、所需证据、版本、超时、重试和失败降级方式。

### 10.3 LLM 边界

LLM 负责意图抽取、内容/VOC 语义、证据摘要、解释和草稿。指标、分数、预算、候选集合、归因等级和权限结论来自确定性服务；所有数值引用结构化 payload 并进行一致性校验。

---

## 11. API 草案

### 11.1 资产 API

```http
GET /api/influencers/:id/capability-profile
GET /api/influencers/:id/cooperations
GET /api/influencers/:id/contents
GET /api/influencers/:id/contributions
GET /api/cooperations
GET /api/contents/:id/analysis
GET /api/contents/:id/reuse-chain
```

### 11.2 经营与分析 API

```http
GET  /api/dashboard/full-value
POST /api/bi/query
GET  /api/brand-impact/timeseries
GET  /api/cross-channel-influence
GET  /api/campaigns/:id/value-review
GET  /api/metrics/definitions
```

### 11.3 推荐与 Agent API

```http
POST /api/matches/run
POST /api/portfolios/optimize
POST /api/star-agent/conversations/:id/messages
GET  /api/star-agent/tasks/:id/events
GET  /api/recommendation-plans/:id/evidence
POST /api/recommendation-plans/:id/convert-to-actions
```

### 11.4 同步与证据 API

```http
POST /api/integrations/:source/sync
GET  /api/sync-jobs/:id
GET  /api/evidence-snapshots/:id
GET  /api/contributions/:id/methodology
POST /api/agent-feedback
```

---

## 12. 数据质量、权限与审计

### 12.1 数据质量

每个数据源记录同步状态、新鲜度、覆盖率、异常、缺失字段和质量等级。Agent 必须读取质量元数据；数据不足时降低置信度或输出探索性结论。

### 12.2 权限与隐私

- 对象级和字段级权限控制。
- 联系方式、用户标识和订单字段按角色脱敏。
- 只使用合法的一方数据和平台允许的数据。
- 跨平台身份与用户路径按同意、用途和保留期限管理。
- 不向外部模型发送不必要的个人或经营敏感信息。

### 12.3 审计

记录身份合并、指标修改、模型/规则版本、数据查询、归因计算、证据生成、Agent 建议、人工反馈、审批和外部执行。

---

## 13. 评估与实验

### 13.1 模型评估

- 能力画像稳定性和数据覆盖率。
- 不同目标下排序区分度。
- 推荐红人相对人工基线的表现提升。
- 自然指标对广告表现的预测能力。
- 跨平台引流预测与实际增量的一致性。
- 证据引用正确率和无依据陈述率。
- 不同市场、平台和红人量级的偏差。

### 13.2 业务实验

- 推荐组与人工组对比。
- 内容结构跨红人复现实验。
- 红人发布地域/时间对照。
- 自然优选素材与随机素材广告对比。
- 不同红人角色组合的预算效率比较。

模型升级必须先离线回放，再小流量灰度，不允许根据单次 Campaign 自动重写核心权重。

---

## 14. 分期实施

### 14.1 P0：统一资产和模型原型

1. 建立统一红人 ID 和核心业务对象。
2. 导入红人、合作、内容、产品、Campaign 和基础渠道数据。
3. 建立 Metric Registry 和证据 Schema。
4. 实现七维能力画像和四类任务动态匹配。
5. 建立内容结构、VOC 和自然表现基础分析。
6. 实现品牌影响、跨平台引流和素材复用演示视图。
7. StarAgent 返回全域价值解释和待确认动作。

### 14.2 P1：历史回算和业务试点

1. 回算过去 6—12 个月合作数据。
2. 接入独立站、Amazon、TikTok Shop、搜索及广告的可用数据。
3. 建立事件仓库、同步任务和数据质量监控。
4. 校准能力维度、任务权重和内容到广告预测。
5. 实现基础跨渠道贡献、观察窗口和实验归因。
6. 建立合作漏斗、授权与素材复用闭环。
7. 建立离线评估、灰度和模型版本管理。

### 14.3 P2：高级经营与放大

1. 多市场、多品牌和更多平台。
2. 增量实验、去重覆盖和因果估计。
3. 多目标预算组合优化与情景模拟。
4. 素材自动拆解、跨渠道适配和疲劳预测。
5. 多触点归因和长期品牌资产趋势。
6. 企业级权限、审计、SLA 和成本控制。

---

## 15. 技术验收标准

1. 平台账号可以归并到统一红人 ID，并保留置信度和审计。
2. 红人能力画像包含各维度数值、样本、新鲜度、置信度和证据。
3. 同一红人在不同任务上下文中获得不同动态匹配结果。
4. 内容可以追踪到片段、授权、二创、渠道放置和广告结果。
5. 社媒、独立站、Amazon、TikTok Shop 事件可进入统一事件模型。
6. ConversionEvent 不因多触点归因被重复记账。
7. ContributionRecord 明确归因等级、方法、基线和限制。
8. BI、驾驶舱、Agent 和评分使用同一指标口径。
9. LLM 输出数值均能映射到结构化数据和证据。
10. 权限、审批和外部执行在服务端强制校验。

---

## 16. 推荐落地顺序

```text
统一身份与资产
→ 指标口径和事件模型
→ 历史数据回算
→ 稳定能力画像
→ 动态任务匹配
→ 内容/VOC/素材复用
→ 品牌影响和跨渠道贡献
→ StarAgent 编排
→ 动作、实验和持续校准
```

技术建设必须围绕可验证的真实业务闭环推进，避免先构建复杂 Agent、后补数据和指标。

