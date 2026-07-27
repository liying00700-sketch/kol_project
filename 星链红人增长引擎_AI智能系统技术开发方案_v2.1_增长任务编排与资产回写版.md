# 星链红人增长引擎 AI 智能系统技术开发方案

版本：v2.1  
日期：2026-07-17  
对应PRD：`星链红人增长引擎_正式PRD_v2.1_增长任务主线与商业闭环版.md`  
基线版本：`星链红人增长引擎_AI智能系统技术开发方案_v2.0_产品红人关系图谱与闭环版.md`  
技术主题：增长任务聚合、阶段编排、动作闭环、证据追溯与品牌资产回写

---

## 1. 建设目标

### 1.1 v2.0技术能力基础

v2.0已经规划候选发现、红人资产、产品—红人关系图谱、动态匹配、Campaign、合作、内容、归因、品牌影响、跨平台引流、动作中心、StarAgent和数据治理等服务。本次不推翻这些专业能力，而是在其上增加统一业务编排层。

### 1.2 当前技术断点

现有架构以专业服务和页面为中心，缺少一个覆盖完整经营过程的聚合对象，导致：

1. Candidate、Creator、ProductCreatorRelation、Campaign、Collaboration、Content和ActionTask之间只有对象关联，没有统一业务生命周期。
2. Campaign能管理执行批次，但无法承接上游产品问题、策略假设和下游资产结算。
3. 各服务可产生推荐和状态，却没有统一的阶段准入、交接、验收与回写协议。
4. 页面切换依赖前端传参和用户重新筛选，业务上下文容易丢失。
5. 动作中心管理“做什么”，但未强制关联判断依据、验收证据和资产更新。
6. 归因、品牌和内容结果分别存储，缺少防重复、可追溯的资产台账。
7. AI可以给出答案，但缺少从结构化建议到受控执行、验证和学习的工程链路。

### 1.3 v2.1技术目标

建立以下主链路：

```text
GrowthMission聚合根
→ MissionStage阶段状态机
→ DecisionRecord经营决策
→ ActionTask动作编排
→ Evidence验收证据
→ AssetLedger资产记账
→ LearningChangeSet学习回写
```

技术北极星是：任一管理结论均能追溯到增长任务、业务判断、执行动作、原始证据和资产变更；任一动作完成后均能驱动任务状态和数据资产更新。

---

## 2. 核心架构原则

### 2.1 GrowthMission是业务聚合根

增长任务是跨模块数据一致性和权限控制的最高层业务对象。Campaign降为增长任务下的执行批次，一个增长任务可包含多个Campaign、内容实验和渠道放大批次。

所有主流程对象必须直接或可确定性追溯到`mission_id`：

```text
GrowthMission
├─ MissionContextSnapshot
├─ MissionStageRun
├─ DecisionRecord
├─ Campaign / Experiment / AmplificationBatch
├─ MissionCreatorSelection
├─ Collaboration / Content / Contribution
├─ ActionTask / Evidence
├─ AssetLedgerEntry
└─ LearningChangeSet
```

### 2.2 专业服务复用，业务流程统一编排

- 候选发现、匹配、图谱、内容、VOC、归因等保留独立计算能力。
- Mission Orchestrator负责阶段状态、调用顺序、交接条件和异常补偿。
- Mission Workspace BFF负责按任务聚合读模型，前端不直接拼接多个服务的业务状态。
- 专业服务不自行改变增长任务阶段，只发布领域事件，由编排器判断是否满足阶段门。

### 2.3 数据、判断、动作、验收和回写不可拆分

任何AI建议或人工决策必须结构化保存。任何可执行建议必须生成ActionTask，并声明：输入证据、负责人、审批策略、验收标准和回写目标。

### 2.4 强追溯，不做黑盒覆盖

- 经营上下文采用版本化快照，历史结果不被新策略覆盖。
- AI输出保留模型、提示版本、输入摘要和置信度。
- 人工修改保留前后差异与原因。
- 资产记账只追加、冲正，不直接覆盖历史账目。

### 2.5 外部副作用必须受控

邀约发送、报价确认、合同、付款、授权和广告发布采用人工审批、幂等执行、失败重试与审计日志。StarAgent不能绕过权限直接产生外部副作用。

---

## 3. 总体技术架构

```text
Web / Mobile Web
  ├─ 我的工作台
  ├─ 增长任务工作空间
  ├─ 品牌增长总览
  └─ 资产中心 / 经营智能 / 运营治理
            │
            ▼
Mission Workspace BFF / Management BFF
            │
            ▼
Mission Orchestrator
  ├─ Mission Context Service
  ├─ Stage Gate Engine
  ├─ Decision Service
  ├─ Action Workflow Service
  ├─ Evidence Service
  ├─ Asset Ledger Service
  └─ Learning Writeback Service
            │
            ▼
专业领域服务
  ├─ Candidate Discovery / Ranking
  ├─ Creator Asset / Identity
  ├─ Product-Creator Graph / Matching
  ├─ Campaign / Collaboration
  ├─ Content / VOC / Media Asset
  ├─ Brand Lift / Cross-channel / Attribution
  └─ Budget / Contract / Payment Integrations
            │
            ▼
Event Bus + Outbox + Workflow Queue
            │
            ▼
OLTP / Search / Graph / Object Storage / Warehouse / Feature Store
```

### 3.1 核心新增组件

| 组件 | 职责 | 不承担的职责 |
|---|---|---|
| Mission Orchestrator | 维护任务生命周期、阶段交接和异常补偿 | 不计算红人匹配分 |
| Stage Gate Engine | 校验阶段输入、产出、证据与待办 | 不替代人工经营决策 |
| Mission Workspace BFF | 输出一个工作空间所需的聚合视图 | 不保存领域事实 |
| Action Workflow Service | 建议到执行、验收和回写 | 不直接绕过审批调用外部系统 |
| Asset Ledger Service | 五类资产记账、冲正、去重和追溯 | 不把观察信号当确定价值 |
| Learning Writeback Service | 生成、审批和应用学习变更集 | 不在线自动改写高影响规则 |

---

## 4. 核心领域模型

### 4.1 增长任务

```ts
type MissionStatus =
  | 'draft'
  | 'pending_diagnosis'
  | 'strategy_confirmed'
  | 'resource_preparing'
  | 'executing'
  | 'observing'
  | 'pending_settlement'
  | 'pending_learning'
  | 'closed';

interface GrowthMission {
  id: string;
  tenantId: string;
  brandId: string;
  productId: string;
  marketId: string;
  title: string;
  problemStatement: string;
  lifecycleStage: string;
  objectiveWeights: Record<string, number>;
  budget: Money;
  timeWindow: { startAt: string; endAt: string };
  ownerId: string;
  participantIds: string[];
  status: MissionStatus;
  currentStage: MissionStageCode;
  activeContextVersion: number;
  evidenceHealth: 'healthy' | 'warning' | 'blocked';
  createdAt: string;
  updatedAt: string;
  version: number;
}
```

### 4.2 任务上下文快照

```ts
interface MissionContextSnapshot {
  id: string;
  missionId: string;
  version: number;
  brand: EntityRef;
  product: EntityRef;
  market: EntityRef;
  problem: ProblemContext;
  audience: AudienceContext[];
  scenarios: ScenarioContext[];
  sellingPoints: SellingPointContext[];
  trustEvidence: EvidenceRef[];
  objectives: ObjectiveContext[];
  channels: ChannelContext[];
  constraints: MissionConstraint[];
  budget: BudgetContext;
  timeWindow: TimeWindow;
  changedBy: string;
  changeReason: string;
  createdAt: string;
}
```

快照不可变。策略调整创建新版本；历史匹配、内容实验和结算继续关联执行当时的上下文版本。

### 4.3 阶段运行记录

```ts
type MissionStageCode =
  | 'diagnosis'
  | 'strategy'
  | 'creator_portfolio'
  | 'collaboration'
  | 'content_amplification'
  | 'value_settlement'
  | 'learning_writeback';

interface MissionStageRun {
  id: string;
  missionId: string;
  stage: MissionStageCode;
  status: 'not_started' | 'in_progress' | 'ready_for_review' | 'completed' | 'blocked';
  contextVersion: number;
  requiredInputs: RequirementCheck[];
  outputs: ArtifactRef[];
  openRisks: RiskRef[];
  openActions: ActionRef[];
  evidenceRefs: EvidenceRef[];
  gateResult?: StageGateResult;
  startedAt?: string;
  completedAt?: string;
  completedBy?: string;
  version: number;
}
```

### 4.4 决策记录

```ts
interface DecisionRecord {
  id: string;
  missionId: string;
  stageRunId: string;
  decisionType: string;
  question: string;
  options: DecisionOption[];
  aiRecommendation?: StructuredRecommendation;
  selectedOption: string;
  rationale: string;
  evidenceRefs: EvidenceRef[];
  impactScope: string[];
  decidedBy: string;
  decidedAt: string;
}
```

### 4.5 动作任务

```ts
interface ActionTask {
  id: string;
  missionId: string;
  stageRunId: string;
  decisionId?: string;
  objectType: string;
  objectId: string;
  actionType: string;
  title: string;
  rationale: string;
  inputEvidenceRefs: EvidenceRef[];
  ownerId: string;
  dueAt: string;
  approvalPolicy?: ApprovalPolicy;
  acceptanceCriteria: AcceptanceCriterion[];
  expectedOutputs: OutputContract[];
  writebackTargets: WritebackTarget[];
  externalEffect: boolean;
  status: 'draft' | 'pending_approval' | 'ready' | 'running' | 'pending_verification' | 'accepted' | 'rejected' | 'cancelled';
  idempotencyKey?: string;
  resultRefs: ArtifactRef[];
  verifiedBy?: string;
  verifiedAt?: string;
  version: number;
}
```

### 4.6 资产台账和学习变更集

```ts
type AssetAccount =
  | 'product_creator_relation'
  | 'content_media'
  | 'brand_audience'
  | 'channel_commerce'
  | 'operation_knowledge';

interface AssetLedgerEntry {
  id: string;
  missionId: string;
  account: AssetAccount;
  assetObjectType: string;
  assetObjectId: string;
  entryType: 'provisional' | 'confirmed' | 'reversal' | 'expiry';
  metricCode: string;
  value: number;
  unit: string;
  evidenceLevel: 'certain' | 'strong' | 'medium' | 'experimental' | 'observational';
  evidenceRefs: EvidenceRef[];
  deduplicationKey: string;
  ownerId: string;
  validFrom: string;
  validUntil?: string;
  sourceEntryId?: string;
  createdAt: string;
}

interface LearningChangeSet {
  id: string;
  missionId: string;
  targetType: 'product_strategy' | 'creator_relation' | 'content_rule' | 'cost_prior' | 'recommendation_policy';
  targetId: string;
  beforeVersion: number;
  proposedPatch: JsonPatchOperation[];
  rationale: string;
  evidenceRefs: EvidenceRef[];
  impactLevel: 'low' | 'medium' | 'high';
  status: 'draft' | 'pending_review' | 'approved' | 'applied' | 'rejected';
  approvedBy?: string;
  appliedAt?: string;
}
```

---

## 5. 阶段状态机与阶段门

### 5.1 服务端状态机

任务状态转换由Mission Orchestrator在服务端执行。前端只能提交业务命令，不能直接更新`status`或`currentStage`。

```text
createMission
→ submitDiagnosis
→ confirmStrategy
→ confirmCreatorPortfolio
→ startExecution
→ startObservation
→ submitSettlement
→ approveLearningWriteback
→ closeMission
```

状态转换采用乐观锁和命令幂等键，防止多人重复操作。

### 5.2 通用阶段协议

每个阶段实现同一协议：

```ts
interface StageContract {
  prepare(missionId: string): Promise<StagePreparation>;
  validateInputs(missionId: string): Promise<RequirementCheck[]>;
  proposeDecisions(missionId: string): Promise<StructuredRecommendation[]>;
  validateCompletion(missionId: string): Promise<StageGateResult>;
  complete(command: CompleteStageCommand): Promise<StageTransitionResult>;
}
```

`StageGateResult`必须返回：已满足条件、阻塞条件、允许带风险通过的条件、待创建修复动作、阶段产出、资产回写和下一阶段准备项。

### 5.3 七阶段输入输出合同

| 阶段 | 最低输入 | 必须产出 | 完成门槛 | 核心回写 |
|---|---|---|---|---|
| 问题诊断 | 产品、市场、问题、基线数据 | 问题定义、目标权重、成功标准 | 负责人确认且证据缺口已处理 | 产品经营档案 |
| 策略设计 | 诊断、受众、场景、卖点、预算 | 策略快照、红人角色、内容实验 | 策略版本获批且预算约束成立 | 产品策略资产 |
| 红人组合 | 策略、外部信号、内部实绩、关系 | 主选/备选组合、预算、风险 | 角色覆盖、预算、冲突和许可校验通过 | 任务匹配快照 |
| 合作执行 | 已确认组合、联系方式、Brief | 建联、报价、寄样、内容、授权状态 | 必需发布/终止对象已验收且异常有结论 | 合作及关系资产 |
| 内容与放大 | 内容、评论、授权、渠道数据 | 内容实验结论、素材版本、放大决策 | 观察窗满足且关键内容完成验收 | 内容和素材资产 |
| 价值结算 | 成本、品牌、流量、销售和证据 | 结算单、贡献记录、资产分录 | 去重、证据分级和财务口径通过 | 五类资产账户 |
| 学习回写 | 结算单、决策差异、人工复核 | 变更集、下一轮建议 | 高影响变更获批且已应用或明确拒绝 | 企业经营知识 |

### 5.4 阶段异常处理

缺失数据、审批阻塞、预算超限、授权风险和归因不足统一转为`ActionTask`，阶段状态标记为`blocked`或`ready_for_review`。异常不得只存在于前端警告中。

---

## 6. 统一上下文传递

### 6.1 强制上下文字段

主流程请求必须携带`mission_id`。服务端根据任务解析`tenant_id`、`brand_id`、`product_id`、`market_id`、`context_version`、`objective`、`time_window`和权限，不接受前端用自由文本重新定义同一上下文。

专业下钻页路由采用：

```text
/missions/:missionId/stages/:stageCode
/missions/:missionId/stages/creator-portfolio/discovery
/missions/:missionId/stages/content-amplification/content/:contentId
```

跨页返回状态使用`return_to`和服务端保存的`WorkspaceViewState`，保留筛选、分页、视图和滚动锚点。

### 6.2 上下文变更影响分析

产品、市场、目标、预算或周期变化时，Mission Context Service生成影响清单：

- 需要重新计算的匹配与预算方案。
- 受影响的已确认红人和执行动作。
- 需要重新确认的Brief、实验或渠道窗口。
- 可继续复用和已失效的证据。

用户确认后创建新快照并发布`mission.context.changed`事件，不静默覆盖下游数据。

---

## 7. 动作编排与执行闭环

### 7.1 标准链路

```text
建议生成
→ 动作草稿
→ 权限与审批
→ 指派
→ 执行
→ 数据回流
→ 自动/人工验收
→ 业务对象回写
→ 阶段门重算
```

### 7.2 执行策略

- 内部低风险动作可在权限范围内自动创建并指派。
- 外部邀约、金额、合同、付款、授权和广告发布必须显式审批。
- 外部调用使用`idempotency_key`、Outbox和重试队列。
- 部分成功的批量动作拆分为独立子动作，禁止用一个总状态掩盖失败对象。
- 不可逆失败通过补偿动作处理，不删除原执行记录。

### 7.3 验收和回写

验收器按动作类型注册：数据同步可自动验收；Brief、初稿、关系阶段和高影响学习由人工验收。动作进入`accepted`后，Action Workflow发布回写命令；对应领域服务完成更新后返回事实事件，资产服务再决定是否记账。

---

## 8. 事件模型与一致性

### 8.1 核心事件

```text
mission.created
mission.context.changed
mission.stage.started
mission.stage.ready_for_review
mission.decision.confirmed
mission.action.created
mission.action.approved
mission.action.executed
mission.action.verified
mission.stage.completed
mission.asset.posted
mission.learning.approved
mission.learning.applied
mission.closed
```

候选、合作、内容、归因等既有事件统一增加：

```json
{
  "event_id": "evt_xxx",
  "event_type": "content.published",
  "mission_id": "mission_xxx",
  "correlation_id": "mission_xxx",
  "causation_id": "action_xxx",
  "aggregate_id": "content_xxx",
  "aggregate_version": 8,
  "occurred_at": "2026-07-17T10:00:00+08:00",
  "schema_version": 1
}
```

### 8.2 一致性策略

- 单一聚合内部使用数据库事务和乐观锁。
- 跨服务使用Transactional Outbox和至少一次投递。
- 消费端按`event_id`幂等，资产记账按`deduplication_key`幂等。
- 长流程采用Saga；失败进入重试、补偿或人工异常队列。
- 阶段读模型允许最终一致，但状态转换使用强一致事实校验。

---

## 9. 资产台账与品牌资产结算

### 9.1 台账规则

五类资产分别记账，不将财务、品牌指数和观察信号直接相加。每条分录必须包含任务、资产对象、指标、证据等级、所有者、适用范围、有效期和去重键。

### 9.2 临时与正式资产

- `provisional`：观察窗未结束、证据不足或待人工确认。
- `confirmed`：达到指标字典定义的最低证据标准。
- `reversal`：数据纠错、归因重算或重复记账的冲正。
- `expiry`：许可、素材或知识规则超过有效期。

### 9.3 防重复逻辑

同一内容、红人、渠道事件可以支撑多个分析维度，但同一资产账户内不得重复贡献。结算服务以`source_event + account + metric + attribution_window + method_version`生成去重键。

### 9.4 结算产物

`MissionSettlement`包含：

- 预算、成本和可确认财务结果。
- 五类资产新增、增强、失效和待验证项。
- 每项结论的证据等级、方法版本和限制。
- 与基线、目标、历史任务和备选方案的比较。
- 建议写回的产品策略、红人关系、内容规则和预算先验。

---

## 10. 工作空间读模型与BFF

### 10.1 聚合读模型

```ts
interface MissionWorkspaceReadModel {
  mission: GrowthMissionSummary;
  context: MissionContextSummary;
  stageTimeline: StageSummary[];
  currentJudgement: JudgementSummary;
  nextBestActions: ActionSummary[];
  dataGaps: DataGapSummary[];
  budgetHealth: BudgetHealth;
  creatorPortfolio: CreatorPortfolioSummary;
  executionHealth: ExecutionHealth;
  contentHealth: ContentHealth;
  valueSummary: ValueSummary;
  assetDeltas: AssetDeltaSummary[];
  recentDecisions: DecisionSummary[];
  refreshedAt: string;
}
```

读模型由事件投影生成；关键动作提交后可同步返回最小状态，再异步刷新完整聚合视图。

### 10.2 BFF接口

```text
POST   /api/missions
GET    /api/missions/:missionId/workspace
GET    /api/missions/:missionId/context
POST   /api/missions/:missionId/context/versions
GET    /api/missions/:missionId/stages/:stageCode
POST   /api/missions/:missionId/stages/:stageCode/prepare
POST   /api/missions/:missionId/stages/:stageCode/decisions
POST   /api/missions/:missionId/stages/:stageCode/complete
GET    /api/missions/:missionId/actions
POST   /api/missions/:missionId/actions
POST   /api/missions/:missionId/actions/:actionId/approve
POST   /api/missions/:missionId/actions/:actionId/verify
GET    /api/missions/:missionId/settlement
POST   /api/missions/:missionId/settlement/submit
GET    /api/missions/:missionId/learning-change-sets
POST   /api/missions/:missionId/learning-change-sets/:id/approve
POST   /api/missions/:missionId/close
```

### 10.3 红人组合阶段接口

FastMoss式市场发现、企业红人资产和产品关系图谱在同一任务上下文中调用：

```text
GET  /api/missions/:missionId/creator-portfolio/discovery
GET  /api/missions/:missionId/creator-portfolio/internal-assets
GET  /api/missions/:missionId/creator-portfolio/relations
POST /api/missions/:missionId/creator-portfolio/match
POST /api/missions/:missionId/creator-portfolio/simulate-budget
POST /api/missions/:missionId/creator-portfolio/confirm
```

确认接口在同一命令中保存组合版本、证据、预算与风险，并创建后续建联/Brief动作，避免名单手工搬运。

---

## 11. StarAgent技术方案

### 11.1 任务级Agent上下文

Agent调用由`MissionContextBuilder`生成受控上下文包：任务快照、当前阶段、权限、数据新鲜度、可用工具、关键证据、未完成动作和输出Schema。不得把所有跨品牌数据无差别放入提示词。

### 11.2 阶段工具白名单

| 阶段 | 可调用能力示例 | 禁止行为 |
|---|---|---|
| 诊断/策略 | VOC、基线、历史任务、策略模拟 | 未确认即改变预算或目标 |
| 红人组合 | 候选、匹配、图谱、预算模拟 | 直接对外联系或承诺报价 |
| 合作执行 | 生成邀约/Brief草稿、解释异常 | 绕过审批发送、签约或付款 |
| 内容与放大 | 内容分析、素材建议、实验比较 | 无授权发布素材或广告 |
| 价值/学习 | 解释贡献、生成变更集 | 自动确认高影响资产或在线改模型 |

### 11.3 结构化输出

Agent输出统一为：`judgement`、`evidence_refs`、`confidence`、`limitations`、`recommended_actions`和`required_confirmation`。只有`recommended_actions`通过策略校验后才能转为动作草稿。

### 11.4 学习边界

人工修改和任务结果进入训练/评估数据集前必须脱敏、版本化并经过质量校验。线上反馈先更新特征或规则先验；模型重训采用离线评估、回放测试、灰度和可回滚发布。

---

## 12. 数据存储与计算

| 数据类型 | 推荐存储 | 说明 |
|---|---|---|
| 任务、阶段、动作、审批、台账 | PostgreSQL | 事务、一致性、审计 |
| 红人/内容搜索和聚合筛选 | OpenSearch | 市场发现和工作空间检索 |
| 产品—红人—内容关系 | 图数据库或关系图投影 | 解释路径与多跳关系 |
| 原始内容、报告、合同、素材 | 对象存储 | 版本、许可和生命周期 |
| 事件流与异步任务 | Kafka/兼容事件总线 + Queue | 编排、投影和集成 |
| 分析事实与历史快照 | 数据仓库/湖仓 | 跨任务分析与结算 |
| 在线匹配特征 | Feature Store/缓存 | 训练与在线口径一致 |

P0可继续使用现有技术栈：若尚未引入图数据库，先以边表和物化路径实现产品—红人关系，避免基础设施先行扩大范围。

---

## 13. 既有模块迁移与复用

| v2.0能力 | v2.1归属 | 技术处理 |
|---|---|---|
| 市场候选池/榜单 | 红人组合·市场发现 | 保留发现服务，增加mission上下文适配器 |
| 红人资产 | 红人组合/资产中心 | 保留主数据，增加任务选择快照 |
| 产品—红人图谱 | 红人组合/学习回写 | 保留关系服务，消费任务结果更新关系 |
| 动态匹配 | 红人组合 | 输入改为MissionContextSnapshot版本 |
| Campaign | 增长任务下执行批次 | 增加mission_id，不再作为顶层闭环对象 |
| 合作资产 | 执行协同 | 状态事件驱动ActionTask和阶段健康度 |
| 内容/VOC/素材 | 内容与放大 | 按mission自动归集，保留专业下钻 |
| 品牌影响/跨渠/归因 | 价值结算 | 结果先进入Contribution，再由台账记账 |
| 动作中心 | 我的工作台/任务内动作 | 复用任务能力，补充验收和回写合同 |
| 驾驶舱/BI | 品牌增长总览/经营智能 | 基于任务和资产读模型重建入口 |
| StarAgent | 创建、导航和阶段助手 | 增加任务上下文和工具白名单 |

迁移原则是“增加编排和关联，不重写已验证引擎”。旧页面在新工作空间稳定前保留只读或兼容入口，并通过埋点确认无关键路径依赖后下线。

---

## 14. 权限、安全与审计

- 权限判定维度：租户、品牌、市场、增长任务、对象和动作类型。
- 任务参与者默认仅访问所属任务；跨任务资产访问由品牌角色授权。
- 联系方式、报价、合同、付款和用户级数据按字段脱敏。
- 外部数据记录来源、采集时间、许可、保存期限和可用范围。
- 所有状态转换、人工修改、AI建议、审批、外部调用、资产分录和学习应用写入不可变审计日志。
- 任务关闭前执行权限、合同、付款、授权、数据回流和资产完整性检查。

---

## 15. 可观测性与服务目标

### 15.1 业务可观测性

- 各阶段停留时间、阻塞原因和完成率。
- 建议→动作→执行→验收→回写各环节转化率。
- 上下文缺失、证据不足、重复记账和异常补偿数量。
- 从管理结论回溯到原始证据的成功率。

### 15.2 技术指标

- 工作空间摘要P95响应时间≤2秒，复杂分析采用异步任务。
- 状态命令成功后，关键读模型P95在5秒内更新。
- 核心业务事件无永久丢失，消费失败进入可见重试队列。
- 外部副作用调用具备幂等、超时、重试和人工接管。
- 资产台账重复分录率为0，所有冲正可追溯。

链路日志统一携带`trace_id`、`mission_id`、`stage_run_id`、`action_id`和`event_id`。

---

## 16. 测试方案

### 16.1 单元与契约测试

- 任务状态转换和非法跃迁。
- 七阶段输入输出合同与阶段门。
- 动作审批、验收和回写策略。
- 资产去重、临时转正式、冲正和过期。
- Agent结构化输出Schema和工具权限。
- 各专业服务事件Schema兼容性。

### 16.2 集成与端到端测试

以“M5美国职场背奶心智”作为黄金路径：

```text
创建任务
→ 导入诊断基线
→ 确认策略
→ 外部发现+内部资产+关系匹配
→ 确认组合并生成建联动作
→ 合作与发布数据回流
→ 内容验证和授权放大
→ 跨渠道贡献与资产结算
→ 学习变更审批
→ 任务闭环
```

必须验证：上下文不重复输入、名单不手工搬运、动作可追踪、阶段不能非法跳过、内容自动归集、资产不重复记账、管理结论可回溯。

### 16.3 故障与安全测试

- 外部平台超时、重复回调和乱序事件。
- 部分批量邀约失败、归因数据迟到和授权撤回。
- 多人同时确认组合或关闭任务。
- 越权访问、提示词注入、敏感字段泄漏和Agent越权工具调用。
- 资产结算重算和历史方法版本回放。

---

## 17. 实施计划

### 阶段0：领域冻结与基线（第1—2周）

- 冻结GrowthMission、阶段、动作、证据和资产字典。
- 梳理v2.0对象、接口、事件和页面依赖。
- 建立M5试点基线：耗时、跳转、重复录入和数据完整率。

### 阶段1：任务核心与上下文（第3—5周）

- 实现Mission Service、Context Snapshot和服务端状态机。
- 为既有核心对象补充mission_id、context_version和事件信封。
- 实现任务列表、固定上下文栏和阶段时间线。

### 阶段2：工作空间和红人组合（第6—8周）

- 建设Mission Workspace BFF和读模型。
- 将候选、榜单、资产、图谱、匹配和预算模拟嵌入组合阶段。
- 组合确认后自动生成建联与Brief动作。

### 阶段3：动作编排和执行回流（第9—11周）

- 扩展ActionTask、审批、验收、Outbox和异常队列。
- 接入合作、内容、授权和渠道事件。
- 建设我的工作台与任务内执行协同。

### 阶段4：价值结算和学习回写（第12—14周）

- 建设Contribution、Asset Ledger和结算单。
- 实现学习变更集、审批、应用和模型反馈隔离。
- 建设品牌增长总览和资产中心基础读模型。

### 阶段5：试点与切换（第15—16周）

- 完成M5全链路试点、并发与故障演练。
- 对比基线验证主流程效率和数据闭环率。
- 灰度新导航；旧入口先只读，再按使用证据下线。

---

## 18. 技术验收标准

1. GrowthMission是主流程唯一顶层对象，Campaign必须归属一个任务。
2. 七阶段状态由服务端状态机控制，任何阶段完成均有门槛校验结果。
3. 主流程所有领域对象和事件可追溯到mission_id和context_version。
4. 工作空间由聚合读模型提供，前端不承担跨服务业务状态拼接。
5. 红人组合同时调用外部发现、内部资产、产品关系和动态匹配，确认后直接创建执行动作。
6. 每个动作均包含依据、负责人、审批、验收、证据和回写目标。
7. 外部副作用具备人工确认、幂等、审计、重试和补偿。
8. 内容、合作、渠道和归因事件可自动更新任务健康度和待办。
9. 五类资产分别记账，支持临时、正式、冲正、过期和防重复。
10. 学习回写采用变更集，高影响更新必须审批并可回滚。
11. StarAgent受任务上下文、结构化输出和阶段工具白名单约束。
12. M5试点可从产品问题完整运行至结算、学习回写和任务关闭。

---

## 19. PRD—技术映射

| PRD要求 | 技术实现 | 验证方式 |
|---|---|---|
| 增长任务为主线 | GrowthMission聚合根和状态机 | 非法阶段跃迁测试 |
| 同一工作空间推进 | Workspace BFF和任务读模型 | 黄金路径页面测试 |
| 上下文不丢失 | Context Snapshot和mission路由 | 跨页与版本变更测试 |
| 数据支持经营动作 | DecisionRecord + Evidence + ActionTask | 决策追溯测试 |
| 完成即交接 | Stage Gate + Orchestrator | 阶段合同测试 |
| FastMoss能力嵌入选人 | Discovery适配器和组合阶段API | 组合确认端到端测试 |
| 动作闭环 | Workflow、审批、验收和回写 | 外部调用/补偿测试 |
| 品牌资产增长结算 | Contribution + Asset Ledger | 去重与冲正测试 |
| 学习进入下一轮 | LearningChangeSet | 审批、应用和回滚测试 |
| AI可控执行 | 上下文构建、Schema、工具白名单 | Agent安全测试 |

---

## 20. 待补充信息

- 现有前后端框架、服务边界、消息系统和部署架构。
- v2.0各模块的真实数据表、API、事件和代码完成度。
- CRM、项目管理、合同、付款、广告和电商平台的集成方式。
- 路特创新真实审批矩阵、金额阈值和品牌/市场权限规则。
- 品牌资产指标字典、证据等级、结算窗口和财务折算方法。
- 外部数据源许可、同步频率、历史覆盖和字段稳定性。
- M5试点可用数据、业务负责人、目标基线和验收样本。

