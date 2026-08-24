# 星链红人知识库 v1.0

本知识库由15份业务数据导出构建，生成时间：2026-07-29T02:54:36+00:00。

## 构建结果

- 原始记录：106,185 行
- 图谱节点：25,856 个
- 图谱关系：110,685 条
- 红人实体：4,425 个
- 内容实体：8,830 个
- 合作事项：11,308 个
- 产品实体：1,102 个
- 去重销售订单：50,906 单

## 数据分层

1. `private/nodes.jsonl`：脱敏后的完整实体。
2. `private/edges.jsonl`：带来源与置信度的完整关系。
3. `private/data_profile.json`：数据质量和关联覆盖率。
4. `private/metric_dictionary.json`：智能问数使用的指标语义。
5. `src/data/kolKnowledgeGraph.json`：公开演示使用的匿名图谱投影。

## 专题研究补充

- `private/research/reddit/momcozy/2026-07-30/`：Momcozy Reddit 公开讨论调研，包含原始搜索、代表帖评论、去重后的帖子/评论 CSV 与 JSON，以及人工复核洞察。该数据只进入私有知识层，不进入公开演示图谱。

## 外部数据层

- [`external_data_dictionary_v1.md`](./external_data_dictionary_v1.md)：StarLink 外部数据字典 v1，供业务、数据与采集团队共同评审。
- [`external_data_dictionary_v1.json`](./external_data_dictionary_v1.json)：机器可读数据契约，定义统一记录信封、实体、关系、平台路由、隐私规则和质量门槛。

## 隐私规则

知识构建过程读取邮箱、联系方式等字段仅用于识别其敏感性，不将这些字段写入任何图谱产物。公开页面不包含姓名、邮箱、地址、买家邮箱、账号Handle或原始业务ID；红人、合作、内容ID均使用不可逆哈希并显示为匿名球体。

## 使用原则

- SQL/指标层回答准确数字。
- 向量RAG检索视频、字幕、评论与Brief语义。
- GraphRAG检索红人—内容—合作—产品—销售的多跳证据。
- 推荐模型输出预测区间，不能作为已发生事实。
- 每条结论需携带来源、时间、口径和置信度。
