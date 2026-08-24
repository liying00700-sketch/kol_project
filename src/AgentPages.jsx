import React, { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowRight, BadgeCheck, BarChart3, Brain, Check, CheckCircle2,
  ChevronRight, ClipboardCheck, Database, Eye, FileCheck2, FileText, Film,
  Gauge, GitBranch, Layers3, Lightbulb, MessageCircleMore, PackageCheck,
  Play, RefreshCw, Search, ShieldCheck, Sparkles, Target, TrendingUp, Users,
} from 'lucide-react'
import ContentInsightWorkbench from './ContentInsightWorkbench'

const AGENTS = {
  contentInsightAgent: {
    no: 'A01', title: '内容洞察 Agent', icon: Film, tone: 'rose', status: 'MVP 原型',
    intro: '把视频、图文、字幕和评论整理成可复核的内容结构、用户反馈与素材价值。',
    trigger: '分析内容', sample: 'content_2026_M5_0718',
    stats: [['待分析内容','18'],['平均置信度','86%'],['高风险待确认','2'],['可复用素材','12']],
    steps: ['素材预处理','结构化理解','评论聚类','规则校验','人工确认'],
    findings: [
      ['Hook','时间压力冲突','0–3s 出现“两场会议之间只有 18 分钟”的明确冲突。','高'],
      ['核心卖点','静音与免手扶','10–24s 同时出现真实工作流和产品近景。','高'],
      ['评论主题','职场使用场景','426 条样本中，79 条提及上班、背奶或便携。','中'],
      ['素材建议','适合广告二创','建议保留冲突开场，补充静音环境对比镜头。','中'],
    ],
    reviewTitle: '标签与授权必须由业务确认', reviewText: '当前结果用于内容初筛；素材授权、投流加热和风险处置不会自动执行。',
  },
  sentimentAgent: {
    no: 'A02', title: '舆情与竞品洞察 Agent', icon: MessageCircleMore, tone: 'violet', status: 'V1 原型',
    intro: '聚合品牌评论、平台提及、趋势与竞品样本，识别机会、风险和需要验证的市场变化。',
    trigger: '生成本周洞察', sample: '美国 · TikTok · M5 / 可穿戴吸奶器',
    stats: [['本周文本样本','12,846'],['稳定主题','24'],['异常事件','3'],['重点竞品','6']],
    steps: ['清洗与脱敏','主题聚类','趋势检测','证据归因','业务确认'],
    findings: [
      ['机会主题','职场隐私感','近 7 天讨论量 +38%，用户更关注“无需离开工位”。','高'],
      ['竞品动作','专业解释集中','3 个竞品连续增加护士/顾问型红人内容，样本 42 条。','中'],
      ['购买障碍','尺码与贴合疑问','负向提及 118 条，集中在首次使用与穿戴适配。','高'],
      ['内容空位','真实通勤工作流','竞品样本覆盖较低，但自有内容收藏率高于均值 31%。','中'],
    ],
    reviewTitle: '高风险提醒只负责升级，不自动处置', reviewText: '所有竞品判断均基于当前样本，不代表全市场事实；升级或驳回需要记录原因。',
  },
  creatorRecommendAgent: {
    no: 'A03', title: '红人推荐 Agent', icon: Users, tone: 'mint', status: 'PoC 原型',
    intro: '按活动目标、市场、平台、预算和风险边界生成候选、解释分项得分并暴露数据缺口。',
    trigger: '运行推荐', sample: 'M5 · 美国 TikTok · ¥10,000 · 职场背奶',
    stats: [['已过滤红人','1,286'],['符合硬条件','24'],['推荐候选','6'],['证据不足','3']],
    steps: ['Brief 解析','硬条件过滤','多目标排序','理由与风险','人工选人'],
    findings: [
      ['92 分','一颗小桃子','人群 94 · 内容 93 · 历史 88 · 品牌 91 · 风险 96','低风险'],
      ['89 分','护士妈妈 Kiki','人群 87 · 内容 91 · 历史 90 · 品牌 92 · 风险 88','低风险'],
      ['86 分','阿Moon的日常','人群 89 · 内容 88 · 历史 78 · 品牌 87 · 风险 84','需确认授权'],
      ['82 分','Working Mom Diaries','人群 90 · 内容 86 · 历史 — · 品牌 85 · 风险 76','证据不足'],
    ],
    reviewTitle: '排序可调整，最终选人必须留痕', reviewText: '默认权重：人群 30%、内容 25%、历史 20%、品牌 15%、履约与风险 10%。',
  },
  contentProductionAgent: {
    no: 'A04', title: '内容生产 Agent', icon: FileText, tone: 'sand', status: 'MVP 原型',
    intro: '基于结构化 Brief、品牌规范、商品事实、红人风格和 VOC 生成可编辑创意与脚本初稿。',
    trigger: '生成创意方向', sample: 'M5 · 职场背奶 · 一颗小桃子 · 45s TikTok',
    stats: [['品牌规则','36'],['商品事实','28'],['禁用表达','14'],['待审脚本','5']],
    steps: ['结构化 Brief','知识检索','创意方向','脚本生成','合规审阅'],
    findings: [
      ['方向 01','会议间隙的 18 分钟','冲突开场 → 真实工作流 → 静音证明 → 情绪收束','推荐'],
      ['方向 02','通勤包里少带一件事','物品清单 → 便携反差 → 穿戴展示 → 场景 CTA','备选'],
      ['方向 03','同事不知道的背奶时刻','隐私痛点 → 低声环境 → 产品细节 → 自主选择','需审阅'],
      ['合规检查','1 条表达需改写','“完全无感”缺少可验证依据，建议改为用户主观体验表述。','阻断发布'],
    ],
    reviewTitle: '初稿可编辑，但不会自动对外发布', reviewText: '商品事实、高风险表达和平台要求必须逐项通过规则校验与人工审阅。',
  },
  businessReviewAgent: {
    no: 'A05', title: '经营复盘 Agent', icon: BarChart3, tone: 'blue', status: 'V1 原型',
    intro: '按统一指标口径汇总红人、合作、内容、广告和 VOC，区分事实、假设与下一步动作。',
    trigger: '生成 7 月复盘', sample: '2026 年 7 月 · 美国市场 · M5',
    stats: [['统一指标','42'],['异常变化','6'],['原因待确认','4'],['上期动作完成','78%']],
    steps: ['权限校验','指标查询','异常计算','解释生成','行动追踪'],
    findings: [
      ['数据事实','ROI 提升至 6.73','环比 +0.42；双角色红人组合贡献约 52% 增量。','已验证'],
      ['原因假设','内容复用扩大增量','3 条自然内容迁移广告贡献约 31%，仍需排除投放结构影响。','待确认'],
      ['经营风险','Amazon 归因回补延迟','当前跨平台贡献可信度为 64%，正式汇报需标注口径。','数据缺口'],
      ['建议动作','追加双角色组合预算','先追加 20%，设置 7 天观察窗口并复核素材疲劳。','待审批'],
    ],
    reviewTitle: '数字可追溯，推测必须明确标注', reviewText: '正式复盘需补充线下业务原因；行动项确认后才写入负责人和截止时间。',
  },
}

const knowledgeRows = [
  ['指标字典','GMV / ROI / 互动率等 42 项','v1.8','数据团队','有效'],
  ['红人标签体系','分层、风格、场景与风险 86 项','v2.3','红人运营','有效'],
  ['品牌表达规范','M5 美国市场表达与禁用词','v3.1','品牌 / 法务','有效'],
  ['推荐与复投规则','5 维评分、降级与例外','v1.4','业务负责人','待复核'],
  ['历史案例','优秀 28 / 失败 12 / 风险 9','2026.07','内容运营','有效'],
]

export function KnowledgeRulesPage({ showToast }) {
  const [query, setQuery] = useState('')
  const rows = useMemo(() => knowledgeRows.filter(row => row.join(' ').toLowerCase().includes(query.toLowerCase())), [query])
  return <section className="module-content agent-page">
    <AgentHero eyebrow="KNOWLEDGE & RULES" title="知识库与规则中枢" desc="所有 Agent 共用的指标、标签、品牌、案例与合规底座；每条输出都保留版本和来源。" icon={Database}/>
    <div className="agent-stat-grid">{[['知识文档','128'],['有效规则','214'],['过期提醒','7'],['近 30 天命中','8,642']].map(x=><Metric key={x[0]} data={x}/>)}</div>
    <section className="panel knowledge-console">
      <header><div><span>可信知识目录</span><h3>先过滤权限与适用范围，再召回和重排</h3></div><label><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索指标、标签、规范或案例"/></label></header>
      <div className="knowledge-table"><div className="knowledge-row head"><span>知识域</span><span>当前范围</span><span>版本</span><span>Owner</span><span>状态</span></div>{rows.map(row=><button className="knowledge-row" key={row[0]} onClick={()=>showToast(`已打开${row[0]}的版本与来源记录`)}>{row.map((cell,i)=><span key={cell} className={i===4?(cell==='有效'?'ok':'warn'):''}>{cell}{i===0&&<ChevronRight size={13}/>}</span>)}</button>)}</div>
    </section>
    <section className="agent-review"><ShieldCheck size={20}/><div><b>知识更新不会静默生效</b><p>规则变更需记录 owner、版本、生效日期、适用市场和审批状态；过期知识停止参与 Agent 输出。</p></div><button onClick={()=>showToast('已进入知识更新待审队列')}>查看 7 条提醒</button></section>
  </section>
}

export function AgentDetailPage({ type, showToast }) {
  if (type === 'contentInsightAgent') return <ContentInsightWorkbench showToast={showToast}/>
  const agent = AGENTS[type]
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(true)
  const [selected, setSelected] = useState(0)
  const run = () => {
    setRunning(true); setDone(false)
    window.setTimeout(()=>{setRunning(false);setDone(true);showToast(`${agent.title} 已生成演示结果，等待人工确认`)}, 700)
  }
  return <section className={`module-content agent-page tone-${agent.tone}`}>
    <AgentHero eyebrow={`${agent.no} · ${agent.status}`} title={agent.title} desc={agent.intro} icon={agent.icon}>
      <div className="agent-command"><label><span>当前任务上下文</span><input value={agent.sample} readOnly/></label><button onClick={run} disabled={running}>{running?<><RefreshCw className="spin" size={16}/>处理中</>:<><Play size={16}/>{agent.trigger}</>}</button></div>
    </AgentHero>
    <div className="agent-stat-grid">{agent.stats.map(x=><Metric key={x[0]} data={x}/>)}</div>
    <section className="panel agent-flow"><header><div><span>DETERMINISTIC WORKFLOW</span><h3>受控处理链路</h3></div><em>{done?'结果已生成':'任务处理中'}</em></header><div>{agent.steps.map((step,i)=><React.Fragment key={step}><span className={done||i===0?'done':''}><i>{done?<Check size={12}/>:i+1}</i><b>{step}</b></span>{i<agent.steps.length-1&&<ArrowRight size={14}/>}</React.Fragment>)}</div></section>
    <div className="agent-result-layout">
      <section className="panel agent-findings"><header><div><span>STRUCTURED OUTPUT</span><h3>结构化结果与证据</h3></div><button onClick={()=>showToast('已刷新证据与数据版本')}><RefreshCw size={14}/>刷新证据</button></header>{agent.findings.map((row,i)=><button key={row[1]} className={selected===i?'active':''} onClick={()=>setSelected(i)}><span className="finding-index">0{i+1}</span><span><small>{row[0]}</small><b>{row[1]}</b><p>{row[2]}</p></span><em>{row[3]}</em><ChevronRight size={15}/></button>)}</section>
      <aside className="panel agent-proof"><span>当前证据</span><h3>{agent.findings[selected][1]}</h3><div className="proof-score"><Gauge size={19}/><b>{selected===0?'91':'84'}<small>/100</small></b><span>证据强度<br/><em>{selected===0?'高':'中等'}</em></span></div><ul><li><Database size={14}/>数据版本：snapshot_2026_07</li><li><FileCheck2 size={14}/>知识版本：kol_rules_v1.4</li><li><Brain size={14}/>提示词版本：{agent.no.toLowerCase()}_v0.8</li></ul><button onClick={()=>showToast('已打开原始证据片段与计算口径')}><Eye size={14}/>查看原始证据</button></aside>
    </div>
    <section className="agent-review"><AlertTriangle size={20}/><div><b>{agent.reviewTitle}</b><p>{agent.reviewText}</p></div><button onClick={()=>showToast('已提交人工确认并保留决策原因')}>提交人工确认 <ArrowRight size={14}/></button></section>
  </section>
}

export function AgentOrchestrationBoard({ setActive, showToast }) {
  const routes = [
    ['内容洞察','分析 19 条内容','contentInsightAgent','已完成'],
    ['舆情与竞品','补充机会主题','sentimentAgent','已完成'],
    ['红人推荐','筛选 6 位候选','creatorRecommendAgent','待确认'],
    ['内容生产','生成差异化 Brief','contentProductionAgent','等待中'],
    ['经营复盘','月末回流结果','businessReviewAgent','未开始'],
  ]
  return <section className="orchestration-board">
    <header><div><span><GitBranch size={15}/> MULTI-AGENT ROUTING</span><h3>当前任务由 5 个业务 Agent 协同，关键动作等待人工确认。</h3></div><button onClick={()=>showToast('已打开任务 task_M5_US_202607 的全链路日志')}><ClipboardCheck size={14}/>任务日志</button></header>
    <div>{routes.map((route,i)=><React.Fragment key={route[0]}><button onClick={()=>setActive(route[2])} className={route[3]==='待确认'?'current':''}><span>0{i+1}</span><b>{route[0]}</b><small>{route[1]}</small><em>{route[3]}</em></button>{i<routes.length-1&&<ChevronRight size={14}/>}</React.Fragment>)}</div>
    <p><ShieldCheck size={14}/>选人、风险处置、脚本发布与复投决策均不自动执行；失败时保留已有数据并转为人工任务。</p>
  </section>
}

const launcherAgents = [
  {key:'contentInsightAgent', label:'内容洞察', icon:Film, hint:'拆结构、看评论、判素材', prompt:'分析这条内容的 Hook、卖点、评论反馈、风险和素材复用价值。'},
  {key:'sentimentAgent', label:'舆情与竞品', icon:MessageCircleMore, hint:'追主题、看趋势、找机会', prompt:'汇总本周品牌舆情与竞品动作，标出机会、风险和证据范围。'},
  {key:'creatorRecommendAgent', label:'红人推荐', icon:Users, hint:'按目标筛选并解释推荐', prompt:'为 M5 美国 TikTok 职场背奶传播推荐红人，预算 1 万元，并说明证据、风险和数据缺口。'},
  {key:'contentProductionAgent', label:'内容生产', icon:FileText, hint:'生成 Brief 与脚本初稿', prompt:'基于 M5 职场背奶场景，生成 3 个创意方向和一版可编辑的 45 秒 TikTok 脚本。'},
  {key:'businessReviewAgent', label:'经营复盘', icon:BarChart3, hint:'分清事实、假设与动作', prompt:'复盘本月美国市场 M5 的红人合作、内容、广告和 ROI，列出异常、原因假设与下一步。'},
  {key:'knowledgeRules', label:'知识与规则', icon:Database, hint:'查指标、规范与历史案例', prompt:'查询当前美国市场的红人推荐规则、M5 品牌表达规范和 ROI 指标口径。'},
]

export function AgentLauncherRail({ selected, onInvoke, onOpen }) {
  return <section className="agent-launcher" aria-label="子智能体快捷调用">
    <div className="launcher-heading"><span>选择一个子智能体直接调用</span><small>也可以不选，由星链自动编排</small></div>
    <div className="launcher-track">{launcherAgents.map(({key,label,icon:Icon,hint,prompt})=><article key={key} className={selected===key?'selected':''}>
      <button className="launcher-invoke" onClick={()=>onInvoke({key,label,prompt})} aria-label={`调用${label}智能体`}>
        <i><Icon size={18}/></i><b>{label}</b><small>{hint}</small><em>{selected===key?'已挂载':'直接调用'}</em>
      </button>
      <button className="launcher-open" onClick={()=>onOpen(key)} aria-label={`打开${label}工作台`}>打开工作台 <ChevronRight size={12}/></button>
    </article>)}</div>
  </section>
}

function AgentHero({ eyebrow, title, desc, icon: Icon, children }) {
  return <section className="agent-hero"><div className="agent-hero-icon"><Icon size={28}/><i></i></div><div className="agent-hero-copy"><span>{eyebrow}</span><h2>{title}</h2><p>{desc}</p>{children}</div><div className="agent-hero-orbit" aria-hidden="true"><i></i><i></i><i></i></div></section>
}

function Metric({data}) { return <article><span>{data[0]}</span><b>{data[1]}</b><small><TrendingUp size={12}/>演示工作区</small></article> }
