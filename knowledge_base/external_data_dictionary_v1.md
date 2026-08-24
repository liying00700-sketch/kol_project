# StarLink 外部数据字典 v1

状态：Draft
版本：1.0.0
创建日期：2026-07-30
机器可读版本：[`external_data_dictionary_v1.json`](./external_data_dictionary_v1.json)

## 1. 目标

本字典定义 StarLink 从社交媒体、社区、电商、品牌官网、新闻和官方机构获取外部数据时使用的统一实体、字段、关系、证据和治理规则。

它解决五个问题：

1. 不同平台的数据可以进入同一套知识图谱。
2. 红人、账号、内容、品牌和产品可以跨平台消歧。
3. 播放量、粉丝数、价格和评分等变化值保留历史快照。
4. 平台观察事实、规则派生和模型推断不会混在一起。
5. 每条结论都能追溯到来源、时间、采集批次和证据。

## 2. V1 边界

初始品类为母婴及可穿戴吸奶器，重点市场为美国和中国。首批品牌包括 Momcozy、Willow、Elvie 和 Medela。

V1 默认只处理公开、用户已授权或合法授权的数据。外部原始数据进入私有知识层；公开演示层只输出匿名、聚合或不可逆哈希后的投影。

## 3. 统一记录信封

所有外部记录，无论来自哪个平台，都必须包含以下字段：

| 字段 | 类型 | 必填 | 定义 |
|---|---|---:|---|
| `record_id` | string | 是 | StarLink 内部记录 ID |
| `schema_version` | string | 是 | 写入时采用的数据字典版本 |
| `entity_type` | enum | 是 | 实体类型 |
| `source_platform` | enum | 是 | 直接来源平台 |
| `source_object_id` | string | 是 | 平台对象 ID；没有稳定 ID 时使用规范化 URL 哈希 |
| `source_url` | URI | 是 | 原始证据链接 |
| `canonical_entity_id` | string | 否 | 消歧后关联的统一实体 ID |
| `published_at` | datetime | 否 | 对象首次发布时间 |
| `captured_at` | datetime | 是 | 本次观察时间，统一为 UTC |
| `market` | string | 否 | ISO 市场代码 |
| `language` | string | 否 | BCP 47 语言代码 |
| `access_scope` | enum | 是 | `public`、`authorized`、`licensed` 或 `restricted` |
| `evidence_class` | enum | 是 | 观察事实、平台派生、规则派生、模型推断或授权估算 |
| `confidence` | number | 是 | 0–1 置信度 |
| `collector` | string | 是 | 采集器及版本 |
| `query_context` | object | 否 | 关键词、账号、社区、时间窗与排序方式 |
| `raw_hash` | string | 是 | 规范化原始载荷 SHA-256 |
| `ingestion_batch_id` | string | 是 | 采集批次 ID |
| `freshness_ttl_hours` | integer | 否 | 建议重新采集周期 |
| `rights_note` | string | 否 | 保存、展示和再利用限制 |

`published_at` 与 `captured_at` 必须分开。前者描述事件发生时间，后者描述我们什么时候观察到它。

## 4. 证据分层

| 证据类型 | 含义 | 默认置信度 |
|---|---|---:|
| `observed` | 可直接在来源页面或授权接口观察到 | 1.00 |
| `platform_derived` | 平台提供但计算过程不透明 | 0.90 |
| `rule_derived` | 由版本化规则计算得到 | 0.85 |
| `model_inferred` | NLP、视觉或推荐模型推断 | 0.70 |
| `licensed_estimate` | 合规第三方数据供应商估算 | 0.75 |

模型推断永远不能覆盖观察事实。主题、情绪、购买意图和风险判断必须保存模型版本、置信度和人工复核状态。

## 5. 核心实体

| 实体 | 优先级 | 主要内容 | 对接现有图谱 |
|---|---|---|---|
| `creator` | P0 | 跨平台统一红人实体 | `Creator` |
| `platform_account` | P0 | 平台账号及账号快照 | `Creator`、`Channel` |
| `content` | P0 | 帖子、视频、图文、文章和直播回放 | `Content` |
| `content_semantics` | P0 | 主题、场景、痛点、卖点、Hook、CTA、品牌和产品提及 | `Tag`、`Content` |
| `metric_snapshot` | P0 | 播放、点赞、评论、分享、收藏、粉丝数等时间快照 | 内容和红人事实属性 |
| `comment` | P0 | 用户评论、回复、VOC、情绪与意图 | 新增 `Comment`、`Topic` |
| `audience_snapshot` | P1 | 国家、语言、年龄段、兴趣等聚合受众 | 新增 `AudienceSegment` |
| `brand` | P0 | 品牌规范名、别名、官网和官方账号 | `Brand` |
| `product` | P0 | 产品、型号、规格、卖点和公开宣称 | `Product`、`ProductLine` |
| `retail_listing` | P1 | 电商商品页、价格、促销、评分和库存 | 新增 `RetailListing` |
| `campaign_signal` | P1 | 公开合作、发布节奏、折扣码和联盟链接 | `Project` 的外部观察层 |
| `trend_signal` | P1 | 搜索热度、平台趋势、社区讨论量和季节事件 | 新增 `TrendSignal` |
| `risk_event` | P1 | 争议、异常互动、违规、召回和品牌安全 | 新增 `RiskEvent` |
| `source_evidence` | P0 | 来源、片段、哈希、权利和失效状态 | 所有实体与关系 |

每个实体的完整字段、类型、枚举、隐私等级和采集策略见 JSON 版本。

## 6. 核心关系

```text
Creator
└── ACCOUNT_OF ← PlatformAccount
    ├── PUBLISHED_BY ← Content
    │   ├── HAS_SEMANTICS → ContentSemantics
    │   ├── HAS_METRIC_SNAPSHOT → MetricSnapshot
    │   ├── HAS_COMMENT → Comment
    │   ├── MENTIONS_BRAND → Brand
    │   └── MENTIONS_PRODUCT → Product
    ├── HAS_AUDIENCE_SNAPSHOT → AudienceSnapshot
    └── PARTICIPATED_IN_EXTERNAL_CAMPAIGN → CampaignSignal

Brand
└── OWNED_BY_BRAND ← Product
    ├── LISTS_PRODUCT ← RetailListing
    ├── PROMOTES_PRODUCT ← CampaignSignal
    ├── OBSERVED_IN_TREND → TrendSignal
    └── HAS_RISK_EVENT → RiskEvent

任意实体或关系
└── SUPPORTED_BY → SourceEvidence
```

跨平台红人不能仅因为 Handle 相同而自动合并。稳定平台用户 ID、主页互链、名称、头像、简介和官方来源应共同参与消歧；置信度低于 0.9 的跨平台合并进入人工复核。

## 7. 指标必须使用时间快照

以下字段不得直接覆盖旧值：

- 账号粉丝数、关注数和内容数。
- 内容播放、浏览、点赞、评论、分享、收藏和转发。
- 电商价格、促销、评分、评论数、排名和库存。
- 平台榜单和趋势值。

建议重点内容在发布后第 1、3、7、30 天采集快照；重点账号每日或每周采集，具体频率以平台和任务优先级为准。

## 8. 平台映射

| 平台 | V1 主要对象 | 首选采集路由 | 关键注意事项 |
|---|---|---|---|
| 小红书 | 账号、笔记、评论、指标 | Agent Reach / OpenCLI | 保留带 `xsec_token` 的发现链路 |
| Reddit | 帖子、评论、指标 | Agent Reach / OpenCLI | 保存 subreddit、permalink 和评论层级 |
| B站 | 账号、视频、字幕、评论、指标 | Agent Reach / bili-cli + OpenCLI | 使用 BV 号，字幕与元数据分开存证 |
| Instagram | 账号、内容、指标、合作信号 | Agent Reach / OpenCLI | 账号 ID 与 Handle 分开 |
| Facebook | 页面、群组内容、评论 | Agent Reach / OpenCLI | 封闭群组必须记录授权范围 |
| X / Twitter | 账号、推文、回复、趋势和风险 | Agent Reach / twitter-cli 或 OpenCLI | 保存 conversation 和引用关系 |
| TikTok | 账号、视频、指标、合作和趋势 | 授权连接器 | 使用稳定内容 ID，短链规范化 |
| YouTube | 频道、视频、字幕、评论、指标 | Agent Reach / YouTube | 使用 channel_id 和 video_id |
| 电商与官网 | 产品、商品页、评价和价格快照 | 授权接口或合规网页采集 | 平台、市场、卖家和 listing 共同确定商品 |
| 新闻与公开网页 | 品牌、产品、营销和风险证据 | Agent Reach / Exa + Reader | 优先 canonical URL 与一手来源 |
| 监管机构 | 产品、召回、法规和风险 | 官方来源 | 只使用可验证的一手公告 |

## 9. 隐私和内容权利

1. 不采集或推断评论者的真实身份、联系方式、精确地址、健康身份或家庭成员信息。
2. 账号 Handle、公开昵称、评论正文、字幕和 OCR 只进入私有或受限层。
3. 评论作者只保存加盐后的伪匿名 ID。
4. 封闭群组、付费内容和授权数据必须保留 `access_scope`。
5. 原始媒体默认只保存来源引用和内容哈希，不复制原文件。
6. 儿童相关内容不得建立儿童个体画像。
7. 公开投影不得包含任何标记为 `restricted` 的字段。

## 10. 数据质量门槛

进入标准化知识层前必须通过：

- 来源 URL、采集时间、原始哈希和批次 ID 完整。
- 平台 ID 或规范化 URL 可以稳定去重。
- 指标变化以新快照写入。
- 品牌与产品完成别名匹配并携带置信度。
- 跨平台红人消歧过程可解释。
- 模型推断包含模型或规则版本。
- 已删除页面保留 `unavailable_at`，不删除历史证据关系。
- 受限字段不会进入公开图谱。

## 11. 第一阶段采集范围

首批建议：

- 品牌：Momcozy、Willow、Elvie、Medela。
- 市场：美国为主，中国作为内容和场景参考。
- 回看周期：近 365 天。
- 高频窗口：近 90 天。
- P0 平台：Reddit、小红书、B站、Instagram、TikTok、YouTube。
- P0 实体：红人、账号、内容、内容语义、指标快照、评论、品牌、产品和来源证据。

第一阶段验收标准：

1. 每条内容都能回到来源 URL、平台对象 ID 和采集时间。
2. 所有表现指标均保留时间快照。
3. 品牌和产品提及完成别名消歧。
4. 评论作者不会暴露个人身份。
5. 事实、规则和模型推断可以明确区分。
6. P0 数据能映射到现有 `Creator`、`Content`、`Brand`、`Product` 和 `Channel` 节点。

## 12. 命名与版本规则

- 字段名使用 `snake_case`。
- 时间统一使用 ISO 8601 UTC。
- 市场使用 ISO 3166-1 alpha-2。
- 语言使用 BCP 47。
- 币种使用 ISO 4217。
- 枚举只允许追加，不直接改变历史含义。
- 破坏性字段修改升级主版本；新增可选字段升级次版本；说明修订升级补丁版本。
