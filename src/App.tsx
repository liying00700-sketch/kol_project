"use client";

import { useMemo, useState } from "react";

type ViewId =
  | "overview"
  | "promoter"
  | "actions"
  | "cooperation"
  | "market"
  | "influencers"
  | "voc"
  | "cooperationBoard"
  | "staragent"
  | "data";

type Creator = {
  name: string;
  handle: string;
  market: string;
  tier: string;
  match: number;
  roi: string;
  brand: number;
  action: string;
  tone: string;
};

type Evidence = {
  title: string;
  conclusion: string;
  items: { source: string; metric: string; value: string; period: string }[];
};

type CooperationDraft = {
  creator: string;
  campaign: string;
  product: string;
  fee: string;
  commission: string;
  dueDate: string;
  source: string;
};

const creators: Creator[] = [
  { name: "Emma Johnson", handle: "@emmamomlife", market: "US", tier: "S", match: 94, roi: "3.42", brand: 91, action: "建议复投", tone: "berry" },
  { name: "Sofia Reed", handle: "@sofiagrows", market: "US", tier: "A", match: 91, roi: "2.86", brand: 88, action: "进入绑定池", tone: "mint" },
  { name: "Mia Thompson", handle: "@miathompson", market: "UK", tier: "A", match: 89, roi: "2.31", brand: 86, action: "测试新品", tone: "blue" },
  { name: "Olivia Chen", handle: "@oliviamakes", market: "US", tier: "B", match: 84, roi: "1.94", brand: 82, action: "观察成长", tone: "amber" },
  { name: "Laura Klein", handle: "@lauraklein", market: "DE", tier: "R", match: 63, roi: "0.72", brand: 57, action: "暂停复盘", tone: "red" },
];

const navGroups: { label: string; items: { id: ViewId; label: string; icon: string; badge?: string }[] }[] = [
  {
    label: "工作门户",
    items: [
      { id: "promoter", label: "推广个人工作台", icon: "01" },
      { id: "actions", label: "动作中心", icon: "02", badge: "12" },
      { id: "cooperation", label: "合作中心", icon: "03", badge: "5" },
    ],
  },
  {
    label: "资产与洞察",
    items: [
      { id: "overview", label: "经营总览", icon: "04" },
      { id: "market", label: "市场与竞品", icon: "05" },
      { id: "influencers", label: "红人资产", icon: "06" },
      { id: "voc", label: "VOC 与用户心智", icon: "07" },
      { id: "cooperationBoard", label: "合作看板", icon: "08" },
    ],
  },
  {
    label: "智能与治理",
    items: [
      { id: "staragent", label: "StarAgent", icon: "AI" },
      { id: "data", label: "数据与模型", icon: "09" },
    ],
  },
];

const viewMeta: Record<ViewId, { eyebrow: string; title: string; subtitle: string }> = {
  overview: { eyebrow: "MANAGEMENT · 经营总览", title: "从经营结果看到下一步该做什么", subtitle: "统一展示红人经营、品牌影响、重要资讯、风险机会和待决策动作。" },
  promoter: { eyebrow: "MY WORKSPACE · 推广人员", title: "今天要推进的合作，都在这里", subtitle: "聚合个人合作、待办、红人消息、广告加推和下一步建议。" },
  actions: { eyebrow: "ACTION CENTER · 业务闭环", title: "从提醒直接进入执行", subtitle: "统一承接待合作、待沟通、寄样、佣金结算、邮件和加推等动作。" },
  cooperation: { eyebrow: "COOPERATION CENTER · 端到端履约", title: "创建合作，并继续跟进到完成", subtitle: "补充合作信息、AI 生成邮件、发送并创建任务，后续直接串联寄样、内容和结算。" },
  market: { eyebrow: "MARKET INTELLIGENCE · 外部机会", title: "市场在讨论什么，竞品正在抢什么", subtitle: "连接竞品视频、评论、资讯和搜索信号，形成可执行的机会与风险清单。" },
  influencers: { eyebrow: "INFLUENCER ASSET · 红人供给", title: "把合作名单变成可持续经营的资产池", subtitle: "统一查看标签、粉丝匹配、历史合作、内容能力、转化贡献和风险信号。" },
  voc: { eyebrow: "VOC & MINDSET · 用户反馈", title: "把海量评论变成可行动的用户心智信号", subtitle: "识别情感、种草意图、核心痛点、品牌心智、产品机会和潜在风险。" },
  cooperationBoard: { eyebrow: "COOPERATION BI · 合作资产", title: "看清合作规模、履约效率和复投结果", subtitle: "从建联、寄样、上线、转化到结算，统一跟踪每个合作节点。" },
  staragent: { eyebrow: "STARAGENT · 智能编排", title: "一个入口，调度整条红人增长链路", subtitle: "可问数、做 ABI 分析、问建议、做内容分析，或直接调用专业 Agent。" },
  data: { eyebrow: "DATA & ONTOLOGY · 可信底座", title: "用数据与本体关系，连接每一条证据", subtitle: "管理数据接入、实体关系、指标口径、质量状态、模型版本和人工复核。" },
};

const agents = [
  { name: "评论分析 Agent", desc: "情感、种草、痛点、机会与风险", icon: "VOC" },
  { name: "竞品分析 Agent", desc: "竞品内容、红人地图与反攻机会", icon: "CP" },
  { name: "内容分析 Agent", desc: "Hook、卖点、场景、CTA 与素材判断", icon: "CT" },
  { name: "数据洞察 Agent", desc: "概览、清单、下钻、趋势与异常", icon: "BI" },
  { name: "选红人 Agent", desc: "候选清单、推荐理由和风险", icon: "KOL" },
  { name: "广告协同 Agent 组", desc: "加推、素材识别与数据复盘", icon: "AD" },
  { name: "红人端 Agent", desc: "合作机会、消息、交付与成长", icon: "CRE" },
  { name: "AI 办公助手", desc: "周报、月报、邮件、会议与简报", icon: "OFF" },
];

const commonEvidence: Evidence = {
  title: "复投 12 位高匹配红人",
  conclusion: "粉丝匹配、长期 ROI、种草与品牌心智贡献同时达到复投规则。",
  items: [
    { source: "红人粉丝画像", metric: "目标人群匹配度", value: "92%", period: "2026-09 最新快照" },
    { source: "合作与转化数仓", metric: "12 个月长期 ROI", value: "2.63", period: "2025-10 至 2026-09" },
    { source: "AI 评论语义表", metric: "种草评论率", value: "16.8%", period: "近 90 天" },
    { source: "品牌心智词库", metric: "目标心智命中", value: "68.4%", period: "近 90 天" },
  ],
};

function Metric({ label, value, delta, note, tone = "neutral" }: { label: string; value: string; delta: string; note: string; tone?: string }) {
  return <article className={`metric-card tone-${tone}`}><div className="metric-label">{label}</div><div className="metric-row"><strong>{value}</strong><span>{delta}</span></div><p>{note}</p></article>;
}

function PageHeader({ view, onAsk }: { view: ViewId; onAsk: () => void }) {
  const meta = viewMeta[view];
  return <div className="page-head"><div><div className="eyebrow">{meta.eyebrow}</div><h1>{meta.title}</h1><p>{meta.subtitle}</p></div><button className="primary-btn" onClick={onAsk}><span className="btn-spark">+</span> 问 StarAgent</button></div>;
}

function EvidenceButton({ evidence, onOpen, label = "查看证据链" }: { evidence: Evidence; onOpen: (evidence: Evidence) => void; label?: string }) {
  return <button className="evidence-btn" onClick={() => onOpen(evidence)}><span>证</span>{label} →</button>;
}

function AIRecommendation({ priority, title, body, action, evidence, onEvidence, onAction, tone = "berry" }: { priority: string; title: string; body: string; action: string; evidence: Evidence; onEvidence: (evidence: Evidence) => void; onAction: () => void; tone?: string }) {
  return <article className={`ai-recommendation ${tone}`}><div><span className="ai-tag">AI 建议</span><b>{priority}</b><em>可信度 92%</em></div><h3>{title}</h3><p>{body}</p><div className="recommend-foot"><EvidenceButton evidence={evidence} onOpen={onEvidence} /><button className="mini-primary" onClick={onAction}>{action}</button></div></article>;
}

function AgentLaunchers({ onOpen }: { onOpen: () => void }) {
  return <div className="agent-launchers">{agents.map((agent) => <button key={agent.name} onClick={onOpen}><i>{agent.icon}</i><span><strong>{agent.name}</strong><small>{agent.desc}</small></span><em>调用 →</em></button>)}</div>;
}

function AIHub({ onOpen, onEvidence, compact = false }: { onOpen: () => void; onEvidence: (evidence: Evidence) => void; compact?: boolean }) {
  return <section className={`ai-hub panel ${compact ? "compact" : ""}`}>
    <div className="ai-hub-top"><div className="star-mark">S</div><div><span className="section-kicker">STARAGENT</span><h2>从问数到行动，一个入口完成</h2><p>结合当前页面和权限，返回结论、证据链与待确认动作。</p></div><button onClick={onOpen}>开始提问 ↑</button></div>
    <div className="ai-capabilities"><button onClick={onOpen}><b>问数</b><span>查指标、清单和趋势</span></button><button onClick={onOpen}><b>ABI 分析</b><span>异常、归因与交叉洞察</span></button><button onClick={onOpen}><b>问建议</b><span>复投、加推和资源分配</span></button><button onClick={onOpen}><b>内容分析</b><span>拆 Hook、卖点、场景和 CTA</span></button></div>
    {!compact && <><div className="ai-proof"><span>AI 回答示例</span><p>本月 ROI 上升主要来自 US TikTok 核心红人复投和“真实日常 + 痛点实测”内容放大。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div><div className="subagent-title"><span>或直接调用专业 Agent</span><small>StarAgent 将自动带入当前业务上下文</small></div><AgentLaunchers onOpen={onOpen} /></>}
  </section>;
}

function OverviewView({ go, onAsk, onEvidence, startCooperation }: { go: (view: ViewId) => void; onAsk: () => void; onEvidence: (evidence: Evidence) => void; startCooperation: (creator: string, source: string) => void }) {
  const [trend, setTrend] = useState("GMV");
  const trendValues: Record<string, number[]> = { GMV: [42, 48, 51, 57, 63, 61, 72, 78, 83, 79, 88, 93], ROI: [48, 43, 52, 61, 55, 68, 64, 72, 79, 75, 84, 88], 品牌影响: [36, 41, 47, 45, 54, 58, 63, 67, 69, 74, 78, 82], 播放量: [65, 58, 74, 69, 81, 76, 72, 86, 79, 83, 77, 90] };
  return <>
    <div className="metric-grid eight">
      <Metric label="GMV" value="$1.08M" delta="+39.1%" note="环比上升" tone="berry" />
      <Metric label="推广花费" value="$263.08K" delta="-22.8%" note="费用口径已统一" tone="mint" />
      <Metric label="ROI" value="1.77" delta="+29.2%" note="自然+广告统一视角" tone="blue" />
      <Metric label="合作红人数" value="1,574" delta="+6.3%" note="S/A 核心贡献 61%" />
      <Metric label="合作事项数" value="1,915" delta="+1.9%" note="履约中 386 项" />
      <Metric label="上线量" value="1,443" delta="+32.4%" note="本期新上线" tone="mint" />
      <Metric label="播放量" value="164.72M" delta="-15.5%" note="头部内容波动" tone="amber" />
      <Metric label="品牌影响力得分" value="78.6" delta="+6.4" note="种草与心智同步上升" tone="berry" />
    </div>

    <div className="two-col overview-grid">
      <section className="panel trend-panel"><div className="panel-head"><div><span className="section-kicker">核心指标趋势</span><h2>从结果看增长质量</h2></div><div className="trend-tabs">{Object.keys(trendValues).map((item) => <button className={trend === item ? "active" : ""} onClick={() => setTrend(item)} key={item}>{item}</button>)}</div></div><div className="trend-summary"><strong>{trend === "GMV" ? "$1.08M" : trend === "ROI" ? "1.77" : trend === "品牌影响" ? "78.6" : "164.72M"}</strong><span>近 12 周趋势</span></div><div className="trend-chart" aria-label={`${trend}近 12 周趋势`}>{trendValues[trend].map((height, index) => <div key={index}><i style={{ height: `${height}%` }} /><span>{index % 2 === 0 ? `W${index + 1}` : ""}</span></div>)}</div><div className="ai-inline-insight"><span>AI 分析</span><p>{trend === "播放量" ? "播放量下滑主要由头部视频减少导致，中位数内容表现保持稳定。" : "US TikTok 核心红人复投和高种草内容加推，是本期增长的主要来源。"}</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div></section>
      <section className="panel news-panel"><div className="panel-head"><div><span className="section-kicker">今日重要资讯</span><h2>与业务相关的 5 条消息</h2></div><span className="status-pill live">实时聚合</span></div><div className="news-list"><button onClick={() => go("actions")}><b className="source feishu">飞书</b><span><strong>广告组反馈 3 条内容建议加推</strong><small>来自「US 红人广告协同」群 · 09:31</small></span><em>去处理 →</em></button><button onClick={() => go("market")}><b className="source external">市场</b><span><strong>竞品旅行场景视频一周增长 42%</strong><small>TikTok · US · 08:55</small></span><em>看详情 →</em></button><button onClick={() => go("voc")}><b className="source ai">AI</b><span><strong>“夜间静音”痛点连续两周升温</strong><small>VOC 主题聚类 · 可回链 246 条评论</small></span><em>查看证据 →</em></button><button onClick={() => startCooperation("Emma Johnson", "飞书复投建议")}><b className="source feishu">飞书</b><span><strong>Emma 已确认新品档期</strong><small>来自推广负责人 Wendy · 08:42</small></span><em>创建合作 →</em></button></div></section>
    </div>

    <div className="three-col management-cards">
      <section className="panel signal-panel"><div className="panel-head"><div><span className="section-kicker">风险与机会</span><h2>需要管理层关注</h2></div></div><div className="signal-list"><article><b className="opportunity">机会</b><div><strong>旅行场景内容窗口</strong><p>竞品热度上升，但核心红人重合仍低。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div></article><article><b className="risk">风险</b><div><strong>2 位核心红人新增竞品合作</strong><p>已暂停自动复投，等待负责人复核。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div></article></div></section>
      <section className="panel next-action-panel"><div className="panel-head"><div><span className="section-kicker">下一步动作</span><h2>今日建议完成</h2></div><button className="quiet-btn" onClick={() => go("actions")}>全部动作 →</button></div><div className="next-actions"><button onClick={() => go("actions")}><span>01</span><div><strong>确认 3 条高潜内容加推</strong><small>P0 · 预计影响本周投流</small></div><em>处理 →</em></button><button onClick={() => startCooperation("Emma Johnson", "AI 复投建议")}><span>02</span><div><strong>为 12 位红人建立复投任务</strong><small>P0 · 粉丝与长期 ROI 达标</small></div><em>创建合作 →</em></button><button onClick={() => go("market")}><span>03</span><div><strong>确认旅行场景首轮验证预算</strong><small>P1 · 建议测试 20 位红人</small></div><em>去评估 →</em></button></div></section>
      <section className="panel decision-summary"><span className="section-kicker">本期经营结论</span><h2>增长已从“扩大合作数”转向“放大高质量资产”</h2><p>GMV 与 ROI 同步提升，核心红人复投、高种草内容和广告加推开始形成协同。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} label="查看完整分析" /></section>
    </div>
    <AIHub onOpen={onAsk} onEvidence={onEvidence} />
  </>;
}

function PromoterView({ go, onAsk, onEvidence, startCooperation }: { go: (view: ViewId) => void; onAsk: () => void; onEvidence: (evidence: Evidence) => void; startCooperation: (creator: string, source: string) => void }) {
  const tasks = [["待合作", "5", "berry"], ["待沟通", "8", "blue"], ["待寄样", "3", "mint"], ["待佣金结算", "4", "amber"], ["待邮件处理", "11", "neutral"]];
  return <>
    <section className="personal-hero panel"><div><span className="section-kicker">WENDY · US 推广</span><h2>早上好，今天有 5 项高优任务</h2><p>本月已管理 42 位红人、51 项合作，已上线 36 条内容。</p></div><div className="personal-summary"><span><b>42</b>负责红人</span><span><b>51</b>本月合作</span><span><b>2.31</b>个人 ROI</span><span><b>92%</b>履约及时率</span></div></section>
    <div className="task-metrics">{tasks.map((task) => <button className={`task-metric ${task[2]}`} key={task[0]} onClick={() => task[0] === "待合作" ? startCooperation("Emma Johnson", "个人待合作提醒") : go("actions")}><span>{task[0]}</span><strong>{task[1]}</strong><em>去处理 →</em></button>)}</div>
    <div className="two-col promoter-main">
      <section className="panel my-cooperations"><div className="panel-head"><div><span className="section-kicker">个人合作详情</span><h2>今天需要推进</h2></div><button className="quiet-btn" onClick={() => go("cooperationBoard")}>查看全部 →</button></div><div className="cooperation-list"><button onClick={() => startCooperation("Emma Johnson", "待创建合作")}><i className="avatar berry">EJ</i><span><strong>Emma Johnson · New Pump Launch</strong><small>已确认档期，等待创建合作和发送邮件</small></span><b className="tag priority-p0">待创建合作</b><em>继续 →</em></button><button onClick={() => go("actions")}><i className="avatar mint">SR</i><span><strong>Sofia Reed · Travel Campaign</strong><small>样品已出库，等待同步物流单号</small></span><b className="tag soft">待寄样</b><em>继续 →</em></button><button onClick={() => go("actions")}><i className="avatar blue">MT</i><span><strong>Mia Thompson · Always-on</strong><small>内容已上线，等待佣金复核</small></span><b className="tag soft">待结算</b><em>继续 →</em></button></div></section>
      <section className="panel inbox-panel"><div className="panel-head"><div><span className="section-kicker">消息提醒</span><h2>红人与飞书消息</h2></div><span className="status-pill live">7 条未读</span></div><div className="inbox-list"><button onClick={() => startCooperation("Emma Johnson", "红人合作消息")}><b className="source creator">红人</b><span><strong>Emma：我可以参加 10 月新品合作</strong><small>Instagram DM · 8 分钟前</small></span><em>回复 →</em></button><button onClick={() => go("actions")}><b className="source feishu">飞书</b><span><strong>广告组 @你：请确认 3 条加推素材</strong><small>US 红人广告协同群 · 09:31</small></span><em>打开 →</em></button><button onClick={() => go("actions")}><b className="source creator">红人</b><span><strong>Sofia：请把物流单号发给我</strong><small>Email · 32 分钟前</small></span><em>回复 →</em></button><button onClick={() => go("actions")}><b className="source feishu">飞书</b><span><strong>财务提醒：4 笔佣金待复核</strong><small>红人结算机器人 · 08:40</small></span><em>处理 →</em></button></div></section>
    </div>

    <div className="two-col promoter-secondary"><section className="panel ad-alert"><div className="panel-head"><div><span className="section-kicker">广告加推提醒</span><h2>3 条内容进入高潜池</h2></div><b className="tag priority-p0">P0</b></div><p>自然互动、种草评论和授权状态已满足加推规则。</p><div className="mini-content-list"><span>#US-9231 · 夜间静音实测 <b>ROI 3.86</b></span><span>#US-9184 · 真实一天 <b>种草率 16.8%</b></span><span>#US-9168 · 旅行轻量化 <b>互动 +42%</b></span></div><div className="panel-actions"><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /><button className="mini-primary" onClick={() => go("actions")}>确认加推</button></div></section>
      <section className="panel personal-period"><div className="panel-head"><div><span className="section-kicker">周月汇总</span><h2>个人推广进展</h2></div><div className="filter-pills"><button className="active">本周</button><button>本月</button></div></div><div className="personal-bars"><div><span>合作创建</span><i><b style={{ width: "86%" }} /></i><strong>12 / 14</strong></div><div><span>内容上线</span><i><b style={{ width: "72%" }} /></i><strong>18 / 25</strong></div><div><span>邮件响应</span><i><b style={{ width: "94%" }} /></i><strong>94%</strong></div><div><span>履约及时</span><i><b style={{ width: "92%" }} /></i><strong>92%</strong></div></div></section></div>

    <section className="section-block"><div className="section-title"><div><span className="section-kicker">红人清单</span><h2>可复投与推荐合作</h2></div><button className="quiet-btn" onClick={() => go("influencers")}>进入红人资产 →</button></div><div className="creator-recommend-grid">{creators.slice(0, 4).map((creator, index) => <article key={creator.name}><i className={`avatar large ${creator.tone}`}>{creator.name.split(" ").map((part) => part[0]).join("")}</i><div><span className="tag soft">{index < 2 ? "可复投" : "推荐新合作"}</span><h3>{creator.name}</h3><p>{creator.market} · 匹配度 {creator.match}% · ROI {creator.roi}</p></div><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /><button className="mini-primary" onClick={() => startCooperation(creator.name, index < 2 ? "复投红人" : "推荐合作红人")}>创建合作</button></article>)}</div></section>

    <div className="decision-grid personal-decisions"><AIRecommendation priority="P0" title="今日先完成 Emma 合作创建" body="红人已确认档期，延迟可能影响新品首发时间。" action="创建合作" evidence={commonEvidence} onEvidence={onEvidence} onAction={() => startCooperation("Emma Johnson", "AI 优先级建议")} /><AIRecommendation priority="P1" title="对 3 条素材确认广告加推" body="已等待 2 小时，建议在自然流量窗口期完成确认。" action="去处理" evidence={commonEvidence} onEvidence={onEvidence} onAction={() => go("actions")} tone="mint" /><AIRecommendation priority="P1" title="关注 Sofia 寄样进度" body="红人主动询问物流单号，需在今日回复以保证上线节点。" action="回复消息" evidence={commonEvidence} onEvidence={onEvidence} onAction={() => go("actions")} tone="amber" /></div>
    <AIHub onOpen={onAsk} onEvidence={onEvidence} />
  </>;
}

const actionRows = [
  ["P0", "待创建合作", "Emma Johnson", "红人消息", "Wendy", "今日"],
  ["P0", "广告加推", "Video #US-9231", "AI 加推建议", "Wendy", "今日"],
  ["P1", "待沟通", "Olivia Chen", "合作跟进", "Wendy", "9 月 16 日"],
  ["P1", "待寄样", "Sofia Reed", "履约节点", "Joey", "9 月 16 日"],
  ["P1", "待佣金结算", "Mia Thompson", "财务机器人", "Wendy", "9 月 17 日"],
  ["P2", "待邮件处理", "11 封未回复", "Email + 飞书", "Wendy", "本周"],
];

function ActionView({ go, startCooperation, onEvidence }: { go: (view: ViewId) => void; startCooperation: (creator: string, source: string) => void; onEvidence: (evidence: Evidence) => void }) {
  return <><div className="metric-grid five"><Metric label="待合作" value="5" delta="2 项 P0" note="可直接创建合作" tone="berry" /><Metric label="待沟通" value="8" delta="3 项今日" note="红人已回复" tone="blue" /><Metric label="待寄样" value="3" delta="1 项延迟" note="需同步物流" tone="amber" /><Metric label="待结算" value="4" delta="财务复核" note="佣金信息已齐" tone="mint" /><Metric label="待邮件" value="11" delta="+3" note="AI 可生成回复" /></div><section className="panel table-panel"><div className="panel-head"><div><span className="section-kicker">统一任务队列</span><h2>点击后直接进入对应操作</h2></div><div className="filter-pills"><button className="active">我的待办 12</button><button>飞书消息 4</button><button>AI 建议 3</button></div></div><div className="data-table action-v2-table"><div className="table-row table-head"><span>优先级</span><span>待办</span><span>对象</span><span>来源</span><span>负责人</span><span>截止</span><span>证据</span><span>操作</span></div>{actionRows.map((row) => <div className="table-row" key={row[1] + row[2]}><span><b className={`tag priority-${row[0].toLowerCase()}`}>{row[0]}</b></span><span><strong>{row[1]}</strong></span><span>{row[2]}</span><span>{row[3]}</span><span>{row[4]}</span><span>{row[5]}</span><span><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} label="证据" /></span><span><button className="mini-primary" onClick={() => row[1] === "待创建合作" ? startCooperation(row[2], row[3]) : row[1] === "广告加推" ? go("staragent") : go("cooperation")}>{row[1] === "待创建合作" ? "创建合作" : "立即处理"}</button></span></div>)}</div></section><div className="closed-loop"><span>消息 / 洞察</span><i>→</i><span>直达业务对象</span><i>→</i><span>补充信息</span><i>→</i><span>发送与执行</span><i>→</i><span>结果回传</span></div></>;
}

function CooperationCenter({ draft, setDraft, onEvidence, go }: { draft: CooperationDraft; setDraft: (draft: CooperationDraft) => void; onEvidence: (evidence: Evidence) => void; go: (view: ViewId) => void }) {
  const [email, setEmail] = useState("");
  const [created, setCreated] = useState(false);
  const aiFill = () => setEmail(`Hi ${draft.creator},\n\nWe’re excited to invite you to join the ${draft.campaign} campaign for Momcozy. Based on your audience fit and strong content performance, we believe your authentic parenting stories are a great match for this launch.\n\nDeliverable: 1 TikTok video\nProduct: ${draft.product}\nProposed fee: ${draft.fee}\nCommission: ${draft.commission}\nTarget posting date: ${draft.dueDate}\n\nPlease reply to confirm your availability. We’d love to create something meaningful together.\n\nBest,\nWendy`);
  return <><div className="workflow-steps"><span className="done"><i>1</i>建立合作</span><b>→</b><span><i>2</i>沟通确认</span><b>→</b><span><i>3</i>寄样</span><b>→</b><span><i>4</i>内容上线</span><b>→</b><span><i>5</i>佣金结算</span></div>{created ? <section className="success-panel panel"><span>✓</span><h2>合作已创建，邮件已进入发送队列</h2><p>{draft.creator} · {draft.campaign} · 预计上线 {draft.dueDate}</p><div><button className="primary-btn" onClick={() => go("cooperationBoard")}>查看合作详情</button><button className="secondary-btn" onClick={() => go("promoter")}>返回个人工作台</button></div></section> : <div className="two-col cooperation-editor"><section className="panel cooperation-form"><div className="panel-head"><div><span className="section-kicker">合作信息</span><h2>{draft.creator}</h2></div><b className="tag soft">来源：{draft.source}</b></div><div className="form-grid"><label>红人<input value={draft.creator} onChange={(e) => setDraft({ ...draft, creator: e.target.value })} /></label><label>Campaign<input value={draft.campaign} onChange={(e) => setDraft({ ...draft, campaign: e.target.value })} /></label><label>合作产品<input value={draft.product} onChange={(e) => setDraft({ ...draft, product: e.target.value })} /></label><label>合作费用<input value={draft.fee} onChange={(e) => setDraft({ ...draft, fee: e.target.value })} /></label><label>佣金比例<input value={draft.commission} onChange={(e) => setDraft({ ...draft, commission: e.target.value })} /></label><label>目标上线日<input type="date" value={draft.dueDate} onChange={(e) => setDraft({ ...draft, dueDate: e.target.value })} /></label></div><div className="cooperation-context"><span>AI 推荐摘要</span><p>该红人与 US 新品目标人群高度匹配，长期 ROI 和品牌心智贡献均达到复投线。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div></section><section className="panel email-editor"><div className="panel-head"><div><span className="section-kicker">合作邮件</span><h2>生成并发送邀约</h2></div><button className="ai-fill" onClick={aiFill}><span>AI</span>智能填充</button></div><label>收件人<input value={`${draft.creator} <creator@email.com>`} readOnly /></label><label>邮件主题<input value={`Momcozy x ${draft.creator} | ${draft.campaign}`} readOnly /></label><label>邮件正文<textarea value={email} onChange={(e) => setEmail(e.target.value)} placeholder="点击「AI 智能填充」，根据红人画像、Campaign 要求和合作条件生成邮件。" /></label><div className="email-actions"><span>关键动作将记录操作人和时间</span><button className="primary-btn" disabled={!email} onClick={() => setCreated(true)}>发送邮件并创建合作</button></div></section></div>}</>;
}

function InfluencerView({ startCooperation, onEvidence }: { startCooperation: (creator: string, source: string) => void; onEvidence: (evidence: Evidence) => void }) {
  const [selected, setSelected] = useState(creators[0]);
  return <><div className="metric-grid five"><Metric label="红人资产总数" value="12,486" delta="+6.3%" note="已完成主键统一" /><Metric label="S/A 核心红人" value="1,286" delta="10.3%" note="重点维护与复投" tone="berry" /><Metric label="B 潜力红人" value="3,742" delta="+186" note="成长池持续扩充" tone="mint" /><Metric label="待复投" value="42" delta="12 高优" note="符合复投规则" tone="blue" /><Metric label="风险红人" value="17" delta="+3" note="竞品与履约风险" tone="amber" /></div><div className="two-col creator-layout"><section className="panel table-panel"><div className="panel-head"><div><span className="section-kicker">资产清单</span><h2>按价值与动作管理红人</h2></div></div><div className="data-table creator-table"><div className="table-row table-head"><span>红人</span><span>市场</span><span>层级</span><span>匹配度</span><span>ROI</span><span>品牌分</span><span>建议</span></div>{creators.map((creator) => <button className={`table-row ${selected.name === creator.name ? "selected" : ""}`} key={creator.name} onClick={() => setSelected(creator)}><span className="person-cell"><i className={`avatar ${creator.tone}`}>{creator.name.split(" ").map((part) => part[0]).join("")}</i><span><strong>{creator.name}</strong><small>{creator.handle}</small></span></span><span>{creator.market}</span><span><b className={`tier tier-${creator.tier.toLowerCase()}`}>{creator.tier}</b></span><span>{creator.match}%</span><span>{creator.roi}</span><span>{creator.brand}</span><span><b className="tag soft">{creator.action}</b></span></button>)}</div></section><aside className="panel detail-card"><div className="detail-person"><i className={`avatar large ${selected.tone}`}>{selected.name.split(" ").map((part) => part[0]).join("")}</i><div><span className="section-kicker">当前选择</span><h2>{selected.name}</h2><p>{selected.handle} · {selected.market} TikTok</p></div></div><div className="score-ring"><div><strong>{selected.match}</strong><small>综合匹配</small></div><p>基于粉丝画像、内容风格、合作表现、品牌心智与风险信号</p></div><div className="ai-note"><span>AI 推荐理由</span><p>近 3 次合作的种草评论与品牌心智命中稳定，粉丝画像与目标人群重合。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div><div className="detail-actions"><button className="primary-btn" onClick={() => startCooperation(selected.name, selected.action)}>创建合作</button><button className="secondary-btn">查看完整档案</button></div></aside></div></>;
}

function InsightView({ voc, go, onEvidence }: { voc?: boolean; go: (view: ViewId) => void; onEvidence: (evidence: Evidence) => void }) {
  const themes = voc ? [["轻松出行", 88, "+28%"], ["夜间噪音", 73, "+31%"], ["佩戴舒适", 67, "+19%"], ["清洗步骤", 51, "+12%"]] : [["真实育儿日常", 91, "+42%"], ["旅行轻量化", 82, "+36%"], ["静音对比测试", 74, "+29%"], ["医疗专业背书", 61, "+18%"]];
  return <><div className="metric-grid four"><Metric label={voc ? "分析评论" : "竞品内容"} value={voc ? "182.4K" : "28,642"} delta="覆盖完整" note={voc ? "重点平台与 Campaign" : "3 个竞品 · 2 个平台"} /><Metric label={voc ? "种草评论率" : "Momcozy 声量份额"} value={voc ? "15.8%" : "31.6%"} delta={voc ? "+3.2pp" : "+4.8pp"} note="近 30 天持续上升" tone="mint" /><Metric label={voc ? "目标心智命中" : "新增机会主题"} value={voc ? "64.2%" : "7"} delta="本周 +2" note={voc ? "轻松、舒适、安心" : "已生成 3 项业务建议"} tone="berry" /><Metric label="高优风险" value={voc ? "3" : "2"} delta="需跟进" note={voc ? "负面主题波动" : "竞品红人重合"} tone="amber" /></div><div className="two-col equal"><section className="panel topic-panel"><div className="panel-head"><div><span className="section-kicker">{voc ? "主题与心智" : "内容趋势"}</span><h2>{voc ? "用户正在形成什么认知" : "市场热度与品牌机会"}</h2></div></div><div className="topic-bars">{themes.map((theme) => <div key={String(theme[0])}><span>{theme[0]}</span><i><b style={{ width: `${theme[1]}%` }} /></i><strong>{theme[2]}</strong><em>{Number(theme[1]) > 70 ? "重点" : "观察"}</em></div>)}</div><div className="panel-actions"><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /><button className="mini-primary" onClick={() => go("actions")}>生成动作</button></div></section><section className="panel opportunity-list"><div className="panel-head"><div><span className="section-kicker">AI 行动建议</span><h2>从外部信号回到业务</h2></div></div><div className="signal-list"><article><b className="opportunity">机会</b><div><strong>补强“夜间静音”实测证据</strong><p>高频痛点明确，当前品牌内容供给仍不足。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div></article><article><b className="risk">风险</b><div><strong>复核“清洗复杂”负面主题</strong><p>连续两周上升，需区分产品问题与使用误解。</p><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} /></div></article></div></section></div></>;
}

function CooperationBoard({ go }: { go: (view: ViewId) => void }) {
  const stages = [["已建联", 428, 100], ["达成合作", 286, 67], ["已寄样", 241, 56], ["内容上线", 198, 46], ["已完成结算", 164, 38]];
  return <><div className="metric-grid five"><Metric label="本月合作" value="286" delta="+18.7%" note="51 项新合作" tone="berry" /><Metric label="履约及时率" value="92.4%" delta="+3.1pp" note="延迟 17 项" tone="mint" /><Metric label="内容上线率" value="82.1%" delta="+6.8pp" note="待上线 43 项" tone="blue" /><Metric label="复投合作占比" value="41.6%" delta="+5.2pp" note="核心红人稳定" /><Metric label="待结算金额" value="$48.6K" delta="24 笔" note="其中 4 笔待复核" tone="amber" /></div><div className="two-col overview-grid"><section className="panel funnel-panel"><div className="panel-head"><div><span className="section-kicker">合作转化漏斗</span><h2>从建联到结算</h2></div></div><div className="funnel-list">{stages.map((stage) => <div key={String(stage[0])}><span>{stage[0]}</span><i><b style={{ width: `${stage[2]}%` }} /></i><strong>{stage[1]}</strong><em>{stage[2]}%</em></div>)}</div></section><section className="panel next-action-panel"><div className="panel-head"><div><span className="section-kicker">卡点分布</span><h2>需要协同处理</h2></div></div><div className="next-actions"><button onClick={() => go("actions")}><span>17</span><div><strong>履约超时</strong><small>主要集中在素材审核和寄样</small></div><em>处理 →</em></button><button onClick={() => go("actions")}><span>11</span><div><strong>邮件未回复</strong><small>4 封已超过 48 小时</small></div><em>处理 →</em></button><button onClick={() => go("actions")}><span>4</span><div><strong>佣金待复核</strong><small>金额与合同存在差异</small></div><em>处理 →</em></button></div></section></div></>;
}

function StarAgentView({ onEvidence, onStartCooperation }: { onEvidence: (evidence: Evidence) => void; onStartCooperation: (creator: string, source: string) => void }) {
  const [prompt, setPrompt] = useState("找出本月最值得复投的红人，并给出证据和合作建议");
  const [runState, setRunState] = useState<"idle" | "running" | "done">("idle");
  const run = () => { setRunState("running"); window.setTimeout(() => setRunState("done"), 1000); };
  return <><section className="agent-command panel"><div className="star-mark">S</div><div className="command-copy"><span className="section-kicker">STARLINK MAIN AGENT</span><h2>把业务目标交给我</h2><p>我会自动带入当前数据与规则，调用专业 Agent，返回证据链和动作。</p></div><div className="command-box"><textarea aria-label="向 StarAgent 描述业务目标" value={prompt} onChange={(event) => setPrompt(event.target.value)} /><div><span>可问数 · ABI 分析 · 建议 · 内容分析 · 专业 Agent 调度</span><button onClick={run}>{runState === "running" ? "编排中…" : runState === "done" ? "重新运行" : "开始编排"} <b>↑</b></button></div></div><div className="prompt-row"><button onClick={() => setPrompt("查询本月 GMV、花费和 ROI 的变化")}>问数</button><button onClick={() => setPrompt("对本月 ROI 变化进行 ABI 归因分析")}>ABI 分析</button><button onClick={() => setPrompt("下个月应该加码哪些红人和内容结构？")}>问建议</button><button onClick={() => setPrompt("分析 #US-9231 为什么值得加推")}>内容分析</button></div>{runState !== "idle" && <div className={`run-result ${runState}`}><span>{runState === "running" ? "正在调用：数据洞察 → 选红人 → 评论分析 → 合作建议" : "已完成：找到 12 位高优复投红人，其中 3 位需在本周锁定档期。"}</span><i /></div>}</section>
    <section className="section-block"><div className="section-title"><div><span className="section-kicker">专业子 Agent</span><h2>直接调用某项能力</h2></div><small className="section-note">每个 Agent 的输出均包含数据来源、时间范围、口径和原始样本</small></div><AgentLaunchers onOpen={run} /></section>
    {runState === "done" && <section className="agent-answer panel"><div><span className="ai-tag">AI 回答</span><b>编排完成</b></div><h2>建议优先复投 Emma、Sofia 等 12 位红人</h2><p>综合粉丝匹配、长期 ROI、内容稳定性、种草评论和品牌心智贡献，这批红人在结果与长期资产两个维度都优于同层基线。</p><div className="answer-actions"><EvidenceButton evidence={commonEvidence} onOpen={onEvidence} label="展开完整证据链" /><button className="mini-primary" onClick={() => onStartCooperation("Emma Johnson", "StarAgent 复投建议")}>创建合作</button></div></section>}
    <section className="capability-map panel"><div className="panel-head"><div><span className="section-kicker">业务闭环</span><h2>数据进入判断，判断进入动作，结果返回系统</h2></div><span className="status-pill live">关键动作人工确认</span></div><div className="capability-flow"><div className="flow-column input"><span>数据与知识</span><strong>红人 · 粉丝 · 合作</strong><strong>内容 · 评论 · VOC</strong><strong>转化 · 广告 · TK Shop</strong><strong>竞品 · 资讯 · 搜索</strong></div><i className="flow-arrow">→</i><div className="flow-column foundation"><span>AI 基础能力</span><strong>标签与身份识别</strong><strong>内容结构与语义</strong><strong>情感 / 主题 / 风险</strong><strong>异常、趋势与证据回链</strong></div><i className="flow-arrow">→</i><div className="flow-column orchestration"><span>StarAgent</span><div className="orbit"><b>主 Agent</b><i>理解目标</i><i>拆解任务</i><i>调用 Agent</i><i>汇总证据</i></div></div><i className="flow-arrow">→</i><div className="flow-column action"><span>业务动作</span><strong>选人 · 合作 · 复投</strong><strong>内容优化 · 加推 · 复用</strong><strong>风险处置 · 机会反馈</strong><strong>经营复盘 · 品牌验证</strong></div></div><div className="feedback-ribbon"><span>结果反馈</span><b>采纳、拒绝、执行状态和业务结果持续更新数据、知识、标签和模型</b><i>↻</i></div></section>
  </>;
}

const dataSources = [["红人基础数据", "内部 · 结构化", "已接入", "99.2%"], ["视频标签数据", "内部 · 结构化", "已接入", "96.8%"], ["合作与转化数据", "内部 · 结构化", "已接入", "98.7%"], ["广告加热数据", "内部 · 结构化", "打通中", "92.1%"], ["TikTok Shop", "内部 · 结构化", "已落仓", "94.6%"], ["红人粉丝画像", "外采 · 结构化", "提需中", "—"], ["竞品视频与评论", "外部 · 混合", "已接入", "95.3%"], ["资讯与搜索", "外部 · 非结构化", "建设中", "90.8%"]];

function DataView() {
  const nodes = [["红人", "n1"], ["内容", "n2"], ["合作", "n3"], ["Campaign", "n4"], ["产品", "n5"], ["订单", "n6"], ["评论/VOC", "n7"], ["广告素材", "n8"]];
  return <><div className="data-health panel"><div><span className="section-kicker">数据健康度</span><strong>96.7</strong><small>核心数据域综合评分</small></div><div><span>关键字段完整率</span><strong>97.4%</strong><i><b style={{ width: "97.4%" }} /></i></div><div><span>抽样准确率</span><strong>98.6%</strong><i><b style={{ width: "98.6%" }} /></i></div><div><span>刷新 SLA 达成</span><strong>96.1%</strong><i><b style={{ width: "96.1%" }} /></i></div><div className="health-alert"><span>2</span><p><strong>待处理异常</strong>广告素材映射、资讯抓取延迟</p></div></div><div className="two-col ontology-layout"><section className="panel ontology-panel"><div className="panel-head"><div><span className="section-kicker">红人业务本体</span><h2>实体、关系和证据的统一语义网络</h2></div><span className="status-pill live">8 类核心实体</span></div><div className="ontology-sphere"><div className="sphere-core"><strong>品牌资产</strong><span>红人增长本体</span></div>{nodes.map((node) => <button className={`ontology-node ${node[1]}`} key={node[0]}><i />{node[0]}</button>)}<div className="sphere-orbit one" /><div className="sphere-orbit two" /><div className="sphere-orbit three" /></div><p className="ontology-note">每条 AI 结论通过本体关系回链到红人、内容、合作、订单、评论和广告原始记录。</p></section><section className="panel ontology-side"><span className="section-kicker">关系示例</span><h2>一条复投建议如何形成</h2><div className="relation-chain"><span>Emma Johnson<small>红人</small></span><i>创作</i><span>#US-9231<small>内容</small></span><i>引发</i><span>种草主题<small>VOC</small></span><i>转化</i><span>ROI 3.86<small>订单/费用</small></span></div><div className="model-stats"><div><strong>87.6%</strong><span>AI 分类准确率</span></div><div><strong>100%</strong><span>证据回链率</span></div><div><strong>246</strong><span>人工复核样本</span></div></div></section></div><section className="panel table-panel"><div className="panel-head"><div><span className="section-kicker">数据资产地图</span><h2>结构化与非结构化数据统一管理</h2></div></div><div className="data-table source-v2-table"><div className="table-row table-head"><span>数据域</span><span>来源类型</span><span>接入状态</span><span>质量评分</span><span>本体关系</span><span>血缘</span></div>{dataSources.map((row) => <div className="table-row" key={row[0]}><span><strong>{row[0]}</strong></span><span>{row[1]}</span><span><b className={`tag ${row[2] === "已接入" || row[2] === "已落仓" ? "tag-ok" : "soft"}`}>{row[2]}</b></span><span>{row[3]}</span><span>已映射</span><span><button className="text-btn">查看证据链 →</button></span></div>)}</div></section></>;
}

export default function Home() {
  const [view, setView] = useState<ViewId>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [notice, setNotice] = useState(false);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [draft, setDraft] = useState<CooperationDraft>({ creator: "Emma Johnson", campaign: "US New Pump Launch", product: "M9 Wearable Pump", fee: "$1,200", commission: "12%", dueDate: "2026-10-15", source: "个人待办" });
  const meta = useMemo(() => viewMeta[view], [view]);
  const go = (next: ViewId) => { setView(next); setMobileNav(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const startCooperation = (creator: string, source: string) => { setDraft({ creator, campaign: "US New Pump Launch", product: "M9 Wearable Pump", fee: "$1,200", commission: "12%", dueDate: "2026-10-15", source }); go("cooperation"); };
  return <div className="app-frame"><aside className={`sidebar ${mobileNav ? "mobile-open" : ""}`}><div className="brand"><div className="brand-symbol">S</div><div><strong>STARLINK</strong><span>红人品牌资产增长引擎</span></div></div><div className="brand-context"><span className="context-logo">M</span><div><strong>Momcozy</strong><small>全球红人经营空间</small></div><button aria-label="切换品牌">⌄</button></div><div className="role-switch"><button className={view === "overview" ? "active" : ""} onClick={() => go("overview")}><i>M</i><span><strong>管理层</strong><small>经营总览</small></span></button><button className={view === "promoter" ? "active" : ""} onClick={() => go("promoter")}><i>W</i><span><strong>推广人员</strong><small>个人工作台</small></span></button></div><nav aria-label="产品主导航">{navGroups.map((group) => <div className="nav-group" key={group.label}><span>{group.label}</span>{group.items.map((item) => <button className={view === item.id ? "active" : ""} key={item.id} onClick={() => go(item.id)}><i>{item.icon}</i><b>{item.label}</b>{item.badge && <em>{item.badge}</em>}</button>)}</div>)}</nav><div className="sidebar-foot"><div><i className="data-dot" /><span><strong>数据服务正常</strong><small>今天 09:42 更新</small></span></div><button aria-label="打开个人菜单"><span>LY</span><b>李莹</b><small>品牌管理员</small><i>···</i></button></div></aside>
    <div className="main-shell"><header className="topbar"><button className="mobile-menu" aria-label="打开导航" onClick={() => setMobileNav(!mobileNav)}>☰</button><div className="crumb"><span>STARLINK</span><i>/</i><strong>{meta.eyebrow.split("·")[1]?.trim()}</strong></div><div className="global-filters"><button>近 30 天 <i>⌄</i></button><button>US <i>⌄</i></button><button>TikTok <i>⌄</i></button><button>全部产品线 <i>⌄</i></button></div><div className="top-actions"><button aria-label="全局搜索">⌕</button><button aria-label="查看飞书与系统通知" onClick={() => setNotice(!notice)}>◌<i /></button><span>9 月 15 日 · 周二</span></div>{notice && <div className="notice-pop v2"><div><strong>消息中心</strong><b>全部已读</b></div><button onClick={() => go("actions")}><span className="source feishu">飞书</span><p><strong>广告组 @你：3 条素材待确认</strong><small>US 红人广告协同群 · 09:31</small></p></button><button onClick={() => startCooperation("Emma Johnson", "飞书消息")}><span className="source creator">红人</span><p><strong>Emma 已确认 10 月新品档期</strong><small>Instagram DM · 09:12</small></p></button><button onClick={() => go("actions")}><span className="source feishu">飞书</span><p><strong>财务机器人：4 笔佣金待复核</strong><small>红人结算群 · 08:40</small></p></button></div>}</header>
      <main className="main-content"><PageHeader view={view} onAsk={() => setAgentOpen(true)} />{view === "overview" && <OverviewView go={go} onAsk={() => setAgentOpen(true)} onEvidence={setEvidence} startCooperation={startCooperation} />}{view === "promoter" && <PromoterView go={go} onAsk={() => setAgentOpen(true)} onEvidence={setEvidence} startCooperation={startCooperation} />}{view === "actions" && <ActionView go={go} startCooperation={startCooperation} onEvidence={setEvidence} />}{view === "cooperation" && <CooperationCenter draft={draft} setDraft={setDraft} onEvidence={setEvidence} go={go} />}{view === "influencers" && <InfluencerView startCooperation={startCooperation} onEvidence={setEvidence} />}{view === "market" && <InsightView go={go} onEvidence={setEvidence} />}{view === "voc" && <InsightView voc go={go} onEvidence={setEvidence} />}{view === "cooperationBoard" && <CooperationBoard go={go} />}{view === "staragent" && <StarAgentView onEvidence={setEvidence} onStartCooperation={startCooperation} />}{view === "data" && <DataView />}</main></div>
    {mobileNav && <button className="mobile-scrim" aria-label="关闭导航" onClick={() => setMobileNav(false)} />}
    {agentOpen && <div className="agent-drawer" role="dialog" aria-modal="true" aria-label="StarAgent 对话"><button className="drawer-scrim" aria-label="关闭 StarAgent" onClick={() => setAgentOpen(false)} /><aside><div className="drawer-head"><div className="star-mark small">S</div><div><strong>StarAgent</strong><span>基于当前页面发起任务</span></div><button aria-label="关闭" onClick={() => setAgentOpen(false)}>×</button></div><div className="drawer-message"><span>当前上下文</span><strong>{meta.title}</strong><p>已带入当前筛选：近 30 天、US、TikTok、全部产品线。</p></div><div className="drawer-agent-capabilities"><button>问数</button><button>ABI 分析</button><button>问建议</button><button>内容分析</button></div><div className="chat-bubble"><strong>我会同时返回：</strong><p>结论、数据来源、指标口径、时间范围、原始样本和可执行的下一步。</p></div><div className="drawer-input"><textarea defaultValue="请分析当前页面，给出 3 个优先动作并附证据链" aria-label="向 StarAgent 提问" /><button onClick={() => { setAgentOpen(false); go("staragent"); }}>发送 ↑</button></div><small className="drawer-policy">AI 提供建议与证据；复投、暂停、发送邮件和广告加推需人工确认。</small></aside></div>}
    {evidence && <div className="evidence-modal" role="dialog" aria-modal="true" aria-label="AI 建议证据链"><button className="drawer-scrim" aria-label="关闭证据链" onClick={() => setEvidence(null)} /><section><div className="evidence-head"><div><span className="section-kicker">AI EVIDENCE CHAIN</span><h2>{evidence.title}</h2></div><button aria-label="关闭" onClick={() => setEvidence(null)}>×</button></div><div className="evidence-conclusion"><span>结论</span><p>{evidence.conclusion}</p><b>可信度 92%</b></div><div className="evidence-chain-list">{evidence.items.map((item, index) => <article key={item.source}><i>{String(index + 1).padStart(2, "0")}</i><div><span>{item.source}</span><strong>{item.metric}</strong><small>{item.period}</small></div><b>{item.value}</b>{index < evidence.items.length - 1 && <em>↓</em>}</article>)}</div><div className="evidence-foot"><span>数据更新：2026-09-15 09:42 · 模型版本：Starlink Insight V1.3 · 口径已审核</span><button className="primary-btn" onClick={() => setEvidence(null)}>完成复核</button></div></section></div>}
  </div>;
}
