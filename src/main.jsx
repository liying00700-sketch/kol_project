import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Sparkles, LayoutDashboard, Package, Users, Film, Megaphone, MessageCircleMore,
  ClipboardCheck, Database, Settings, Search, Bell, ChevronRight, ArrowUp,
  Target, WalletCards, MapPin, CalendarDays, CircleCheck, SlidersHorizontal,
  ExternalLink, ShieldCheck, FileText, UserPlus, X, Check, RefreshCw, Info,
  BarChart3, ChartSpline, Link2, Clock3, MoreHorizontal, Plus, Send,
  Handshake, Network, Route, Layers, Brain, DollarSign, TrendingUp, Download,
  Filter, ChevronDown, ArrowRight, Eye, Play, ShoppingBag, Globe, Store,
  AlertCircle, CheckCircle, Lightbulb, Gauge, Table, Upload, BadgeCheck,
  PauseCircle, Ban, Receipt, Percent, Boxes, CircleDollarSign, Radar, CircleDot
} from 'lucide-react'
import './styles.css'
import './modules.css'
import './fixes.css'
import './bi-v2.css'
import './flow-v3.css'
import './flow-v4.css'

const navGroups = [
  { no:'01', title:'StarAgent 智能工作台', items:[[Sparkles, '智能工作台', 'agent']] },
  { no:'02', title:'动作中心', items:[[ClipboardCheck, '待办与快捷动作', 'actions'], [Users, '红人资源', 'actionInfluencers'], [Package, '产品中心', 'productCenter'], [Handshake, '合作管理', 'cooperations'], [CircleDollarSign, '费用结算', 'settlements'], [Percent, '折扣码管理', 'discounts'], [Layers, 'Campaign 管理', 'campaigns']] },
  { no:'03', title:'增长放大', items:[[Network, '品牌影响', 'brand'], [Route, '跨平台引流', 'crosschannel'], [Megaphone, '内容资产与广告放大', 'ads'], [Brain, 'VOC 与用户心智', 'voc']] },
  { no:'04', title:'BI 中心', items:[[LayoutDashboard, '经营驾驶舱', 'dashboard'], [Sparkles, '智能问数', 'askData'], [ShoppingBag, '销售与转化', 'salesConversion'], [Users, '红人资产', 'influencers'], [Boxes, '合作资产', 'cooperationAsset'], [MessageCircleMore, '消费者资产', 'consumer'], [Radar, '竞品监控', 'competitor'], [BarChart3, 'Campaign 复盘', 'campaign']] },
  { no:'05', title:'管理', items:[[Database, '数据与模型', 'data'], [Settings, '系统设置', 'settings']] },
]

const pageMeta = {
  agent: ['01 · StarAgent 智能工作台', '把目标说出来，方案交给星链'], actions: ['02 · 动作中心', '今天需要推进的动作'],
  actionInfluencers: ['02 · 动作中心 / 红人资源', '从大资源池到精准合作人选'], productCenter: ['02 · 动作中心 / 产品中心', '从产品策略到匹配与执行'],
  askData: ['04 · BI 中心 / 智能问数', '用自然语言直接问经营数据'], salesConversion: ['04 · BI 中心 / 销售与转化', '看清红人带来的销售效率'],
  dashboard: ['04 · BI 中心 / 经营驾驶舱', '红人营销全域经营驾驶舱'], growthloop: ['Closed-loop operations', '从产品策略到模型回写'], bi: ['BI center', '从数据里找到下一步'],
  market: ['Market discovery', '外部发现与企业候选分层'],
  influencers: ['04 · BI 中心 / 红人资产', '红人资产与完整能力画像'], cooperations: ['02 · 动作中心 / 合作管理', '把合作流程变成可推进的任务'], cooperationAsset: ['04 · BI 中心 / 合作资产', '把每次合作沉淀为长期资产'],
  contents: ['Content asset', '内容验证与素材资产'], products: ['Product & scene', '产品、场景与卖点验证'], productgraph: ['Relationship intelligence', '产品—红人关系与任务匹配'],
  brand: ['03 · 增长放大 / 品牌影响', '品牌传播与用户心智影响'], crosschannel: ['03 · 增长放大 / 跨平台引流', '跨平台引流与辅助贡献'],
  ads: ['03 · 增长放大 / 内容资产与广告放大', '从内容验证到广告增长'], voc: ['03 · 增长放大 / VOC 与用户心智', '看见用户认知如何变化'],
  settlements: ['02 · 动作中心 / 费用结算', '从申请到付款，全程可追踪'], discounts: ['02 · 动作中心 / 折扣码管理', '折扣、归因与渠道表现统一管理'],
  consumer: ['04 · BI 中心 / 消费者资产', '把每一次反馈沉淀为人群与心智资产'], competitor: ['04 · BI 中心 / 竞品监控', '持续看见竞品、红人与内容策略变化'],
  campaigns: ['02 · 动作中心 / Campaign 管理', 'Campaign 计划与执行'], campaign: ['04 · BI 中心 / Campaign 复盘', '复盘真正创造的全域价值'],
  data: ['05 · 管理 / 数据与模型', '数据、指标与模型可信基座'], settings: ['05 · 管理 / 系统设置', '工作区、权限与审批设置'],
}

const creators = [
  { id: 1, name: '一颗小桃子', handle: '母婴 · 职场生活', initials: '桃', color: '#E7B6C2', score: 92, cost: 2800, role: '场景共鸣', reach: '18.6万', reason: '职场背奶内容互动率高于账号均值 46%，核心受众与新品人群高度重合。', evidence: '近 90 天 12 条母婴内容', risk: '低风险' },
  { id: 2, name: '护士妈妈Kiki', handle: '母婴 · 科普教育', initials: 'K', color: '#DDB3A2', score: 89, cost: 3200, role: '专业教育', reach: '15.2万', reason: '持证护士身份建立专业信任，收藏/播放比在候选中排名前 8%。', evidence: '同类产品合作 3 次', risk: '低风险' },
  { id: 3, name: '阿Moon的日常', handle: '生活方式 · 新手妈妈', initials: 'M', color: '#C9C3E1', score: 86, cost: 1500, role: '真实体验', reach: '9.8万', reason: '真实生活叙事完整，评论区关于便携和夜间使用的讨论密度高。', evidence: '有效评论样本 426 条', risk: '需确认授权' },
]

const quickPrompts = ['找适合新品传播的红人', '生成红人 + 产品 + 视频方案', '问本月销售与 ROI']

function App() {
  const [active, setActive] = useState('agent')
  const [query, setQuery] = useState('为 M5 在美国市场做职场背奶传播，预算 1 万元，优先建立场景记忆并沉淀可授权素材。')
  const [submitted, setSubmitted] = useState(true)
  const [selected, setSelected] = useState([1, 2, 3])
  const [evidence, setEvidence] = useState(null)
  const [outreach, setOutreach] = useState(false)
  const [toast, setToast] = useState('')
  const [strategy, setStrategy] = useState('均衡方案')

  const total = useMemo(() => creators.filter(c => selected.includes(c.id)).reduce((s, c) => s + c.cost, 0), [selected])
  const showToast = (text) => { setToast(text); setTimeout(() => setToast(''), 2400) }
  const submit = () => { if (!query.trim()) return; setSubmitted(true); showToast('已按传播目标重新生成方案') }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><span></span><span></span><i></i></div>
        <div><strong>星链</strong><small>红人增长引擎</small></div>
      </div>
      <button className="workspace-switch"><span className="workspace-dot">L</span><span><b>路特创新</b><small>Momcozy 全球品牌</small></span><ChevronRight size={16}/></button>
      <nav className="domain-nav">
        {navGroups.map(group => <section className="nav-domain" key={group.no}>
          <div className="nav-domain-title"><span>{group.no}</span><b>{group.title}</b></div>
          {group.items.map(([Icon,label,key]) => <button key={key} className={active===key?'active':''} onClick={()=>setActive(key)}>
            <Icon size={16}/><span>{label}</span>{key==='actions' && <em>6</em>}
          </button>)}
        </section>)}
      </nav>
      <div className="sidebar-foot">
        <div className="data-fresh"><span></span><div><b>数据已更新</b><small>今天 09:42</small></div></div>
        <button className="profile"><span>LY</span><div><b>李颖</b><small>品牌管理员</small></div><MoreHorizontal size={16}/></button>
      </div>
    </aside>

    <main>
      <header className="topbar">
        <div><p>{pageMeta[active][0]}</p><h1>{pageMeta[active][1]}</h1></div>
        <div className="top-actions"><button title="搜索"><Search size={19}/></button><button title="通知" className="notice"><Bell size={19}/><i></i></button><span className="date">7 月 21 日 · 周二</span></div>
      </header>

      {active === 'agent' ? <section className="content">
        <div className="hero-agent">
          <div className="orbit" aria-hidden="true"><i></i><i></i><i></i><b><Sparkles size={22}/></b></div>
          <div className="agent-copy"><span className="eyebrow"><i></i> STARAGENT ONLINE</span><h2>今天想推进什么？</h2><p>找红人、找素材、做方案，或者直接问一个经营问题。</p></div>
          <div className="prompt-box">
            <textarea value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submit()}}} aria-label="向 StarAgent 描述任务" />
            <div className="prompt-tools"><div><button><Plus size={17}/> 添加产品</button><button><Link2 size={16}/> 引用数据</button></div><button className="send" onClick={submit} aria-label="发送"><ArrowUp size={19}/></button></div>
          </div>
          <div className="quick-prompts">{quickPrompts.map(x=><button key={x} onClick={()=>{setQuery(x);showToast('已填入任务，可继续补充条件')}}>{x}<ChevronRight size={14}/></button>)}</div>
        </div>

        {submitted && <>
          <section className="understanding-card">
            <div className="section-heading"><div><span className="status-dot"></span><h3>我这样理解你的目标</h3><small>已结合品牌默认配置补齐条件</small></div><button><SlidersHorizontal size={16}/> 修改条件</button></div>
            <div className="task-chips">
              <div><Target size={17}/><span>核心目标<small>品牌传播</small></span></div>
              <div><Package size={17}/><span>产品<small>M5 可穿戴吸奶器</small></span></div>
              <div><WalletCards size={17}/><span>总预算<small>¥10,000</small></span></div>
              <div><MapPin size={17}/><span>市场 / 平台<small>美国 · TikTok</small></span></div>
              <div><CalendarDays size={17}/><span>投放周期<small>未来 30 天</small></span></div>
            </div>
            <p className="assumption"><Info size={15}/> 预算默认包含红人合作费与样品寄送，预留 15% 用于优质素材授权。<button>调整口径</button></p>
          </section>

          <section className="plan-section">
            <div className="plan-title"><div><span className="kicker">推荐方案 · 01</span><h2>用真实场景建立记忆，<br/>再用专业内容加深信任。</h2></div><div className="plan-controls"><div className="segment">{['保守方案','均衡方案','进取方案'].map(x=><button className={strategy===x?'active':''} onClick={()=>setStrategy(x)} key={x}>{x}</button>)}</div><button className="icon-button"><MoreHorizontal size={18}/></button></div></div>

            <section className="solution-blueprint integrated-solution">
              <div className="solution-blueprint-head"><div><span><Sparkles size={15}/> STARAGENT 完整合作方案</span><h3>找谁合作、合作什么、怎么拍，已经组合成可执行 Brief。</h3></div><button onClick={()=>setEvidence({name:'完整合作方案证据链',score:91,evidence:'红人、产品与内容结构共 62 条证据',reason:'方案同时使用产品策略、红人历史表现、受众质量、自然内容结构与广告迁移结果。',risk:'内容结构为建议模板，发送前需要结合红人表达习惯确认'})}><ShieldCheck size={14}/> 62 条组合证据</button></div>
              <article className="integrated-who">
                <div className="integrated-section-head"><div><span className="solution-no">01 · 找谁合作</span><h3>三种角色共同完成场景记忆、专业信任和真实验证</h3></div><div><span>{selected.length} 位已选择</span><button onClick={()=>setActive('actionInfluencers')}><SlidersHorizontal size={14}/>打开红人资源</button></div></div>
                <div className="integrated-creator-list">{creators.map((c,i)=><article className={selected.includes(c.id)?'selected':''} key={c.id}>
                  <button className="check" onClick={()=>setSelected(s=>s.includes(c.id)?s.filter(x=>x!==c.id):[...s,c.id])}>{selected.includes(c.id)&&<Check size={12}/>}</button>
                  <div className="avatar" style={{background:c.color}}>{c.initials}<i></i></div>
                  <div className="integrated-creator-main"><div><h4>{c.name}</h4><span>{c.role}</span><em>{['主传播位','信任解释位','真实体验位'][i]}</em></div><p>{c.handle} · {c.reason}</p><button onClick={()=>setEvidence(c)}><ShieldCheck size={13}/>{c.evidence}<ChevronRight size={12}/></button></div>
                  <div className="integrated-creator-data"><span><b>{c.score}</b><small>任务匹配</small></span><span><b>{c.reach}</b><small>预估触达</small></span><span><b>{['92','88','76'][i]}</b><small>品牌影响</small></span><span><b>{['7.4x','6.9x','5.8x'][i]}</b><small>历史 ROI</small></span><span><b>¥{c.cost.toLocaleString()}</b><small>预估费用</small></span></div>
                  <button className="replace-creator" onClick={()=>showToast(`正在为你寻找 ${c.name} 的替代人选`)}><RefreshCw size={13}/>替换</button>
                </article>)}</div>
                <button className="integrated-more" onClick={()=>setActive('actionInfluencers')}><Plus size={14}/>查看 12 位备选红人和完整表现数据</button>
              </article>
              <div className="integrated-what-how">
                <article className="solution-product"><span className="solution-no">02 · 合作什么</span><div className="product-lockup"><i><Package size={23}/></i><div><h4>M5 可穿戴吸奶器</h4><p>美国市场 · 职场背奶场景</p></div><strong>96<small>匹配</small></strong></div><div className="solution-tags"><span>免手扶</span><span>静音</span><span>贴身便携</span><span>可授权素材</span></div><p className="solution-why"><Lightbulb size={15}/>当前任务优先建立“职场可用”记忆，M5 的场景与内容证据最完整。</p></article>
                <article className="solution-script"><span className="solution-no">03 · 怎么拍</span><div className="script-timeline">{[['0–3s','冲突开场','“两场会议之间，我只有 18 分钟背奶。”'],['3–10s','场景代入','办公桌、通勤包与真实时间压力'],['10–28s','产品演示','免手扶穿戴 + 静音对比 + 工作流'],['28–38s','可信证明','真实泵奶结果 / 专业解释 / 细节近景'],['38–45s','记忆与行动','“不必离开工作，也能照顾好自己。”']].map((x,i)=><div key={x[0]}><span>{x[0]}</span><i className={i<2?'active':''}></i><b>{x[1]}<small>{x[2]}</small></b></div>)}</div></article>
              </div>
              <div className="integrated-outcome">{[['已规划预算',`¥${(total+1500).toLocaleString()} / ¥10,000`],['预计有效触达','42–56万'],['可沉淀素材','3–5 条'],['建议授权预留','¥900'],['方案证据强度','91 / 100']].map(x=><span key={x[0]}><small>{x[0]}</small><b>{x[1]}</b></span>)}</div>
            </section>

            <div className="next-action"><div><span className="next-icon"><CircleCheck size={20}/></span><div><h3>方案已准备好，可以进入执行</h3><p>红人、产品、视频结构和数据证据会随合作一起带入，不需要重复录入。</p></div></div><div><button className="secondary" onClick={()=>showToast('已保存至方案库，可继续协作编辑')}><FileText size={16}/> 保存方案</button><button className="secondary" onClick={()=>{showToast('已创建合作草稿，并带入产品与内容 Brief');setActive('cooperations')}}><Handshake size={16}/> 创建合作</button><button className="primary" onClick={()=>setOutreach(true)}><UserPlus size={16}/> 一键生成建联</button></div></div>
          </section>
        </>}
      </section> : <ModulePage active={active} setActive={setActive} showToast={showToast} setEvidence={setEvidence} />}
    </main>

    {evidence && <div className="drawer-backdrop" onClick={()=>setEvidence(null)}><aside className="evidence-drawer" onClick={e=>e.stopPropagation()}>
      <div className="drawer-head"><div><span>证据链</span><h2>{evidence.name}</h2></div><button onClick={()=>setEvidence(null)}><X size={19}/></button></div>
      <div className="strength"><ShieldCheck size={20}/><div><span>综合证据强度</span><b>{evidence.score>=90?'高':'中等'} · {evidence.score}/100</b></div></div>
      <section><h3>推荐结论</h3><p>{evidence.reason}</p></section>
      <section><h3>核心证据</h3>{[
        ['内容表现','近 90 天','母婴场景平均互动率 5.8%，高于账号均值 46%'],
        ['受众匹配','更新于 7 月 15 日','女性受众 91%，25–34 岁占 63%'],
        ['评论信号','样本 426 条','“上班、背奶、便携”高频共现 79 次'],
      ].map(x=><div className="evidence-item" key={x[0]}><CircleCheck size={16}/><div><b>{x[0]}<small>{x[1]}</small></b><p>{x[2]}</p></div></div>)}</section>
      <section className="limit"><h3>风险与限制</h3><p><Info size={15}/>{evidence.risk}；平台受众数据为估算值，建议建联前再次确认档期与授权报价。</p></section>
      <div className="data-source"><Database size={15}/> 数据来源：小红书公开数据、品牌合作记录、VOC 评论库</div>
      <button className="drawer-action" onClick={()=>{setEvidence(null);showToast('已打开红人详情')}}>打开红人详情 <ExternalLink size={15}/></button>
    </aside></div>}

    {outreach && <div className="modal-backdrop"><div className="modal">
      <button className="modal-close" onClick={()=>setOutreach(false)}><X size={19}/></button>
      <span className="modal-icon"><UserPlus size={24}/></span><p className="modal-kicker">下一步 · 人工确认</p><h2>生成 {selected.length} 位红人的建联计划</h2><p className="modal-desc">系统将创建差异化邀约、内容 Brief 和跟进节点。不会立即发送任何外部消息。</p>
      <div className="modal-list"><div><MessageCircleMore size={17}/><span>生成个性化邀约话术</span><b>待确认</b></div><div><FileText size={17}/><span>按红人角色生成 Brief</span><b>待确认</b></div><div><Clock3 size={17}/><span>创建 3 个跟进节点</span><b>待确认</b></div></div>
      <label className="owner-label">负责人<select defaultValue="me"><option value="me">李颖（我）</option><option>红人运营组</option></select></label>
      <div className="modal-actions"><button onClick={()=>setOutreach(false)}>返回调整</button><button className="primary" onClick={()=>{setOutreach(false);showToast('建联计划已生成，进入待确认状态')}}><Send size={16}/> 生成待确认计划</button></div>
    </div></div>}

    {toast && <div className="toast"><CircleCheck size={17}/>{toast}</div>}
  </div>
}

const fullValue = [
  ['品牌传播', 86, '+12%', '#d85b7f'], ['用户心智', 72, '+8%', '#8d5b7a'],
  ['内容验证', 91, '+19%', '#d6a275'], ['素材资产', 84, '+15%', '#b77b94'],
  ['跨平台引流', 68, '+6%', '#6d8ca5'], ['销售转化', 79, '+11%', '#4e8b74'],
  ['合作经营', 88, '+9%', '#9a6d7e'], ['风险健康', 93, '+3%', '#688e7f'],
]

const cockpitMetrics = [
  {key:'合作红人数',value:'3,420',delta:'+12.3%',note:'其中新增合作 186 位',tone:'rose'},
  {key:'合作事项数',value:'8,642',delta:'+8.7%',note:'进行中 1,286 项',tone:'sand'},
  {key:'上线量',value:'2,184',delta:'+22.1%',note:'按去重内容计算',tone:'plum'},
  {key:'播放量',value:'1.58B',delta:'+35.6%',note:'有效播放 68.4%',tone:'blue'},
  {key:'GMV',value:'¥8.65M',delta:'+18.4%',note:'直接归因口径',tone:'mint'},
  {key:'推广花费',value:'¥1.29M',delta:'+15.8%',note:'含合作与授权费',tone:'gold'},
  {key:'ROI',value:'6.73',delta:'+0.42',note:'GMV / 推广花费',tone:'berry'},
]

const crossAnalysisData = {
  合作红人数:[['职场背奶 × M5','场景传播型','842'],['夜间吸奶 × M5','专业教育型','684'],['通勤隐形 × Air 1','真实体验型','526'],['夜间清洗 × KleanPal','产品测评型','398']],
  合作事项数:[['职场背奶 × M5','场景传播型','2,286'],['夜间吸奶 × M5','专业教育型','1,864'],['通勤隐形 × Air 1','真实体验型','1,426'],['夜间清洗 × KleanPal','产品测评型','968']],
  上线量:[['职场背奶 × M5','场景传播型','684'],['夜间吸奶 × M5','专业教育型','526'],['通勤隐形 × Air 1','真实体验型','418'],['夜间清洗 × KleanPal','产品测评型','286']],
  播放量:[['职场背奶 × M5','场景传播型','526M'],['夜间吸奶 × M5','专业教育型','418M'],['通勤隐形 × Air 1','真实体验型','346M'],['夜间清洗 × KleanPal','产品测评型','204M']],
  GMV:[['职场背奶 × M5','场景传播型','¥2.86M'],['夜间吸奶 × M5','专业教育型','¥2.14M'],['通勤隐形 × Air 1','真实体验型','¥1.82M'],['夜间清洗 × KleanPal','产品测评型','¥1.18M']],
  推广花费:[['职场背奶 × M5','场景传播型','¥386K'],['夜间吸奶 × M5','专业教育型','¥312K'],['通勤隐形 × Air 1','真实体验型','¥268K'],['夜间清洗 × KleanPal','产品测评型','¥184K']],
  ROI:[['职场背奶 × M5','场景传播型','7.41'],['夜间吸奶 × M5','专业教育型','6.86'],['通勤隐形 × Air 1','真实体验型','6.79'],['夜间清洗 × KleanPal','产品测评型','6.41']],
}

function PageHeader({ eyebrow, title, desc, action='导出报告', onAction }) {
  return <div className="module-hero">
    <div><span>{eyebrow}</span><h2>{title}</h2><p>{desc}</p></div>
    <div className="module-tools"><button><CalendarDays size={15}/> 近 30 天 <ChevronDown size={14}/></button><button className="solid" onClick={onAction}><Download size={15}/>{action}</button></div>
  </div>
}

function ModulePage({ active, setActive, showToast, setEvidence }) {
  if (active === 'dashboard') return <DashboardPage showToast={showToast} setEvidence={setEvidence} setActive={setActive}/>
  if (active === 'askData') return <AskDataPage showToast={showToast} setActive={setActive}/>
  if (active === 'salesConversion') return <SalesConversionPage showToast={showToast} setActive={setActive}/>
  if (active === 'growthloop') return <GrowthLoopPage showToast={showToast} setActive={setActive}/>
  if (active === 'bi') return <BIPage showToast={showToast}/>
  if (active === 'market') return <MarketCandidatePage showToast={showToast} setActive={setActive} setEvidence={setEvidence}/>
  if (active === 'influencers') return <InfluencerPage showToast={showToast} setEvidence={setEvidence}/>
  if (active === 'productgraph') return <ProductInfluencerPage showToast={showToast} setEvidence={setEvidence}/>
  if (active === 'brand') return <BrandPage setEvidence={setEvidence}/>
  if (active === 'crosschannel') return <CrossChannelPage setEvidence={setEvidence}/>
  if (active === 'actions') return <ActionPage showToast={showToast} setActive={setActive}/>
  if (active === 'actionInfluencers') return <ActionInfluencerPage showToast={showToast} setActive={setActive} setEvidence={setEvidence}/>
  if (active === 'productCenter') return <ProductCenterPage showToast={showToast} setActive={setActive}/>
  if (active === 'ads') return <AdsAmplificationPage showToast={showToast} setActive={setActive}/>
  return <AssetPage type={active} showToast={showToast} setActive={setActive}/>
}

const marketCandidates = [
  {id:101,name:'Working Mom Diaries',initials:'WD',platform:'TikTok',market:'美国',followers:'42.8万',growth:'+18.4%',engagement:'6.8%',commerce:'$86K',fit:91,rank:'潜力上升',source:'授权数据源',fresh:'2小时前',confidence:'高',reason:'职场泵奶内容连续4周增长，目标受众与M5重合度高。'},
  {id:102,name:'Nurse Emily RN',initials:'NE',platform:'TikTok',market:'美国',followers:'31.6万',growth:'+12.7%',engagement:'7.4%',commerce:'$124K',fit:89,rank:'专业信任',source:'市场研究导入',fresh:'今天',confidence:'高',reason:'注册护士身份与母乳喂养科普稳定，适合解释静音与吸力。'},
  {id:103,name:'Maya Back at Work',initials:'MB',platform:'Instagram',market:'美国',followers:'18.9万',growth:'+24.1%',engagement:'8.1%',commerce:'待补充',fit:87,rank:'内容验证',source:'授权数据源',fresh:'2小时前',confidence:'中',reason:'重返职场系列收藏率突出，但缺少可验证电商数据。'},
  {id:104,name:'The Pumping Edit',initials:'PE',platform:'YouTube',market:'美国',followers:'12.4万',growth:'+9.6%',engagement:'5.9%',commerce:'$42K',fit:82,rank:'素材潜力',source:'人工研究',fresh:'3天前',confidence:'中',reason:'长视频拆解能力强，镜头完整，具备跨渠道二创潜力。'},
  {id:105,name:'Life with Ava',initials:'LA',platform:'TikTok',market:'加拿大',followers:'56.2万',growth:'+6.2%',engagement:'4.8%',commerce:'$196K',fit:74,rank:'跨渠引流',source:'授权数据源',fresh:'2小时前',confidence:'中',reason:'商业表现较强，但当前市场与M5美国任务存在偏差。'},
]

function MarketCandidatePage({ showToast, setActive, setEvidence }) {
  const [ranking,setRanking]=useState('潜力达人')
  const [selectedIds,setSelectedIds]=useState([101,103])
  const [pool,setPool]=useState('市场候选')
  const rankings=['潜力达人','品类增长','内容验证','素材潜力','跨渠引流','复投价值']
  const toggle=id=>setSelectedIds(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  const promote=()=>{showToast(`已将 ${selectedIds.length} 位红人加入企业候选，等待身份校验`);setPool('企业候选')}
  return <section className="module-content market-page">
    <PageHeader eyebrow="市场候选池 · FM-R01 / FM-R02" title="先看见市场，再决定谁值得成为企业资产。" desc="外部信号与内部实绩分层保存；榜单用于发现，不把公开估算当作合作事实。" action="导入候选" onAction={()=>showToast('已打开合规数据导入向导')}/>

    <div className="source-ledger panel">
      <div className="ledger-source"><span><Globe size={20}/></span><div><small>外部市场信号</small><b>1,284,620 位候选</b><p>授权API、合规导出与人工研究</p></div><em>来源可追溯</em></div>
      <ArrowRight size={18}/>
      <div className="ledger-gate"><ShieldCheck size={20}/><div><small>企业晋升门</small><b>身份 · 权限 · 冲突校验</b><p>不覆盖内部合作实绩</p></div></div>
      <ArrowRight size={18}/>
      <div className="ledger-source enterprise"><span><Database size={20}/></span><div><small>企业红人资产</small><b>1,286 位已确认</b><p>合作、内容、授权和结果证据</p></div><em>一方数据</em></div>
    </div>

    <div className="market-toolbar panel">
      <div className="pool-switch">{['市场候选','企业候选'].map(x=><button key={x} className={pool===x?'active':''} onClick={()=>setPool(x)}>{x}<span>{x==='市场候选'?'128.4万':'1,286'}</span></button>)}</div>
      <label><Search size={15}/><input aria-label="搜索市场候选" placeholder="搜索达人、账号、内容主题"/></label>
      <button><MapPin size={14}/>美国</button><button><Play size={14}/>全平台</button><button><Filter size={14}/>高级筛选</button>
    </div>

    <div className="ranking-strip">{rankings.map((x,i)=><button key={x} className={ranking===x?'active':''} onClick={()=>{setRanking(x);showToast(`已切换到${x}榜`)}}><small>0{i+1}</small><b>{x}</b><span>{['增长动量','品类份额','结构复现','授权空间','渠道路径','企业实绩'][i]}</span></button>)}</div>

    <div className="market-layout">
      <article className="panel candidate-board">
        <div className="candidate-head"><div><h3>{ranking}榜 · M5 职场背奶</h3><p>美国 · 近30天 · 数据覆盖率 86%</p></div><div><span><i></i>外部估算</span><button>保存视图</button></div></div>
        <div className="candidate-columns"><span>红人 / 来源</span><span>增长</span><span>互动</span><span>电商信号</span><span>M5适配</span><span>可信度</span><span>发现理由</span></div>
        {marketCandidates.map(c=><article className={`candidate-row ${selectedIds.includes(c.id)?'selected':''}`} key={c.id}>
          <button className="candidate-check" aria-label={`选择 ${c.name}`} onClick={()=>toggle(c.id)}>{selectedIds.includes(c.id)&&<Check size={12}/>}</button>
          <div className="candidate-person"><span>{c.initials}</span><div><b>{c.name}</b><small>{c.platform} · {c.market}</small><em>{c.source} · {c.fresh}</em></div></div>
          <div><small>粉丝 {c.followers}</small><b className="metric-up">{c.growth}</b></div>
          <div><small>有效互动</small><b>{c.engagement}</b></div>
          <div><small>近30天</small><b>{c.commerce}</b></div>
          <div><strong>{c.fit}</strong><small>/100</small></div>
          <div><em className={`source-confidence ${c.confidence==='高'?'high':''}`}>{c.confidence}</em></div>
          <div className="candidate-reason"><b>{c.rank}</b><p>{c.reason}</p><button onClick={()=>setEvidence({name:`${c.name} · 市场发现证据`,score:c.fit,reason:c.reason,risk:c.confidence==='中'?'外部字段覆盖不完整，晋升前需要人工确认':'来源与更新时间可追溯，仍需建联确认档期和报价'})}>查看来源与证据 <ChevronRight size={12}/></button></div>
        </article>)}
      </article>

      <aside className="panel discovery-aside">
        <div className="panel-title"><div><h3>发现质量</h3><p>当前视图的数据可用性</p></div><Gauge size={18}/></div>
        <div className="quality-score"><b>86</b><span>/100<small>可用于候选发现</small></span></div>
        {[['身份可解析','94%'],['近30天新鲜度','89%'],['联系方式覆盖','61%'],['电商字段覆盖','72%']].map(x=><div className="quality-row" key={x[0]}><span>{x[0]}<b>{x[1]}</b></span><i><em style={{width:x[1]}}></em></i></div>)}
        <div className="quality-note"><Info size={15}/><p>榜单不是任务匹配。候选进入企业池后，系统才会结合产品、预算、竞品和内部历史重算。</p></div>
        <button className="evidence-button" onClick={()=>showToast('已打开来源许可与字段映射记录')}><ShieldCheck size={14}/> 查看来源许可记录</button>
      </aside>
    </div>

    {selectedIds.length>0&&<div className="batch-dock"><div><span>{selectedIds.length}</span><p><b>位候选已选择</b><small>批量动作会先执行去重、权限和竞品冲突校验</small></p></div><button onClick={()=>setSelectedIds([])}>取消选择</button><button onClick={promote}><UserPlus size={15}/>加入企业候选</button><button className="primary" onClick={()=>{showToast('已用所选候选创建 M5 匹配任务');setActive('productgraph')}}><Target size={15}/>生成产品匹配</button></div>}
  </section>
}

const loopStages = [
  {key:'strategy',name:'产品策略',state:'已完成',score:96,object:'M5 · 美国',detail:'3个人群 · 4个场景 · 5个卖点',owner:'产品策略 Agent',evidence:'42条产品/VOC证据'},
  {key:'discover',name:'候选发现',state:'已完成',score:88,object:'市场池 + 企业池',detail:'1,286位检索 · 24位入围',owner:'市场发现 Agent',evidence:'数据覆盖率86%'},
  {key:'match',name:'动态匹配',state:'已完成',score:92,object:'传播 + 素材',detail:'3种角色 · ¥10,000预算',owner:'动态匹配 Agent',evidence:'任务快照 v2.0'},
  {key:'execute',name:'合作执行',state:'进行中',score:74,object:'M5职场背奶战役',detail:'8项动作 · 3项待审批',owner:'合作经营 Agent',evidence:'完成率68%'},
  {key:'content',name:'内容验证',state:'回流中',score:81,object:'19条内容',detail:'静音卖点待加强 · 3条可授权',owner:'内容验证 Agent',evidence:'1,286条评论'},
  {key:'value',name:'渠道与归因',state:'计算中',score:64,object:'4个承接渠道',detail:'64%确定/强证据',owner:'跨渠道 Agent',evidence:'Amazon仍在回补'},
  {key:'feedback',name:'模型回写',state:'待处理',score:58,object:'3条新规则',detail:'授权结果缺3项 · 1项异常',owner:'证据风险 Agent',evidence:'等待人工复核'},
]

function GrowthLoopPage({ showToast, setActive }) {
  const [stage,setStage]=useState(loopStages[3])
  return <section className="module-content growth-loop-page">
    <PageHeader eyebrow="增长闭环 · M5美国市场" title="每一步都要留下下一步可用的数据。" desc="从产品策略到模型回写，系统同时检查业务进度、证据覆盖和资产沉淀。" action="生成闭环报告" onAction={()=>showToast('M5闭环经营报告已生成')}/>
    <div className="loop-command panel">
      <div className="loop-product"><span><Package size={21}/></span><div><small>当前经营对象</small><b>M5 可穿戴吸奶器</b><p>美国 · 职场背奶 · Campaign 进行中</p></div><button>切换 <ChevronDown size={13}/></button></div>
      <div className="loop-health"><small>闭环健康度</small><b>81<em>/100</em></b><span>较上周 +7</span></div>
      <div className="loop-definition"><ShieldCheck size={17}/><p><b>可复盘，不等于已闭环。</b> 只有结果回写关系、内容规则和推荐模型后，本轮增长才真正完成。</p></div>
    </div>

    <div className="process-spine panel">
      {loopStages.map((s,i)=><button key={s.key} className={`${stage.key===s.key?'active':''} ${i<3?'done':''}`} onClick={()=>setStage(s)}><span>{i<3?<Check size={13}/>:i+1}</span><b>{s.name}</b><small>{s.state}</small>{i<loopStages.length-1&&<i></i>}</button>)}
    </div>

    <div className="loop-workbench">
      <article className="panel stage-detail">
        <div className="stage-title"><div><span>{loopStages.findIndex(x=>x.key===stage.key)+1}</span><div><small>当前检查阶段</small><h3>{stage.name}</h3><p>{stage.owner}</p></div></div><strong>{stage.score}<small>/100</small></strong></div>
        <div className="stage-object"><small>业务对象</small><b>{stage.object}</b><p>{stage.detail}</p></div>
        <div className="stage-evidence"><ShieldCheck size={17}/><div><small>证据状态</small><b>{stage.evidence}</b></div><button onClick={()=>showToast(`已打开${stage.name}证据快照`)}>查看快照</button></div>
        <div className="stage-actions"><button onClick={()=>setActive(stage.key==='discover'?'market':stage.key==='match'?'productgraph':stage.key==='execute'?'actions':'dashboard')}>进入对应模块 <ArrowRight size={14}/></button><button className="primary" onClick={()=>showToast(`已为${stage.name}生成下一步动作`)}>生成下一步动作</button></div>
      </article>

      <article className="panel feedback-ledger">
        <div className="panel-title"><div><h3>本轮数据回写账本</h3><p>哪些结果已经改变下一轮决策</p></div><span className="live-dot">6项待处理</span></div>
        {[['产品关系','一颗小桃子 × M5','复投 → 核心','已应用'],['内容规则','职场真实工作流','跨红人复现 4 次','已应用'],['卖点验证','静音不牺牲吸力','证据仍不足','待验证'],['素材价值','3 条自然内容','等待授权结果','缺失'],['渠道贡献','Amazon品牌搜索','+18% · 中等证据','待复核']].map((x,i)=><div className="ledger-row" key={x[1]}><span><i className={`ledger-icon l${i}`}></i><b>{x[0]}<small>{x[1]}</small></b></span><p>{x[2]}</p><em className={x[3]==='已应用'?'applied':''}>{x[3]}</em></div>)}
      </article>

      <aside className="panel loop-gaps">
        <div className="panel-title"><div><h3>闭环缺口</h3><p>按对下一轮推荐的影响排序</p></div><AlertCircle size={18}/></div>
        {[['高','补齐3位红人的授权结果','影响素材价值与预算建议','今天'],['中','复核Amazon搜索提升','相关变化不能直接计收入','明天'],['中','确认2位候选未来档期','影响下轮组合可行性','7月19日']].map((x,i)=><div className="gap-card" key={x[1]}><div><span className={x[0]==='高'?'high':''}>{x[0]}优先级</span><small>{x[3]}</small></div><b>{x[1]}</b><p>{x[2]}</p><button onClick={()=>showToast(`已创建动作：${x[1]}`)}>创建动作 <ArrowRight size={12}/></button></div>)}
      </aside>
    </div>

    <div className="loop-next"><RefreshCw size={19}/><div><b>预计完成闭环后，M5下一轮匹配置信度将从 82% 提升至 91%</b><p>系统将更新产品—红人关系、静音卖点证据和素材授权成本先验。</p></div><button onClick={()=>setActive('productgraph')}>查看将被更新的关系 <ArrowRight size={14}/></button></div>
  </section>
}

const productRelations = [
  {name:'一颗小桃子', initials:'桃', platform:'小红书', role:'场景传播', stage:'复投', score:92, audience:94, scene:96, trust:82, content:91, channel:78, evidence:'强 · 26条', result:'品牌搜索 +24%', action:'扩大职场场景'},
  {name:'护士妈妈Kiki', initials:'K', platform:'抖音', role:'专业教育', stage:'核心', score:89, audience:86, scene:84, trust:97, content:88, channel:76, evidence:'强 · 31条', result:'收藏率 6.2%', action:'验证静音吸力'},
  {name:'阿Moon的日常', initials:'M', platform:'TikTok', role:'真实体验', stage:'首投', score:86, audience:90, scene:92, trust:84, content:87, channel:82, evidence:'中 · 14条', result:'意向评论 +38%', action:'确认素材授权'},
  {name:'在逃妈妈Yuki', initials:'Y', platform:'Instagram', role:'跨渠引流', stage:'观察', score:78, audience:82, scene:76, trust:79, content:74, channel:94, evidence:'中 · 9条', result:'Amazon访问 +17%', action:'小预算复测'},
]

function ProductInfluencerPage({ showToast, setEvidence }) {
  const [goal,setGoal]=useState('品牌传播')
  const [selectedRelation,setSelectedRelation]=useState(productRelations[0])
  const goals=['品牌传播','卖点验证','素材沉淀','跨渠引流','销售转化']
  const loop=[['策略已定义','产品、人群、场景'],['组合已生成','24位候选'],['执行进行中','8项动作'],['内容回流中','19条内容'],['归因计算中','64%强证据'],['模型待更新','3条新规则']]
  return <section className="module-content product-graph-page">
    <PageHeader eyebrow="产品—红人关系图谱" title="不是谁最强，而是谁最适合这个产品和任务。" desc="把产品策略、红人能力、合作结果和证据连接起来，让每次执行都更新下一次选人。" action="创建匹配任务" onAction={()=>showToast('已创建 M5 产品匹配任务草稿')}/>

    <div className="graph-context panel">
      <div className="product-identity"><span className="product-glyph"><Package size={25}/></span><div><small>当前产品</small><h3>M5 可穿戴吸奶器</h3><p>美国 · 职场妈妈 · $199–249</p></div><button>切换产品 <ChevronDown size={13}/></button></div>
      <div className="goal-switch"><small>本次业务目标</small><div>{goals.map(x=><button key={x} className={goal===x?'active':''} onClick={()=>{setGoal(x);showToast(`已按“${x}”重算红人匹配`)}}>{x}</button>)}</div></div>
      <div className="context-proof"><ShieldCheck size={18}/><span><small>上下文完整度</small><b>92%</b></span><p>缺少：部分红人未来30天档期</p></div>
    </div>

    <div className="relationship-observatory">
      <article className="panel product-thesis">
        <div className="panel-title"><div><h3>产品策略底图</h3><p>匹配不是从达人标签开始，而是从产品任务开始</p></div><span className="live-dot">更新于今天</span></div>
        <div className="thesis-line"><small>目标人群</small><b>重返职场的泵奶妈妈</b><span>规模 86万</span></div>
        <div className="thesis-line"><small>关键场景</small><b>会议间隙 · 通勤 · 夜间</b><span>4个已验证</span></div>
        <div className="thesis-line"><small>核心卖点</small><b>静音、免手扶、贴身便携</b><span>静音待加强</span></div>
        <div className="thesis-line"><small>信任证据</small><b>真实工作流 + 专业解释</b><span>证据强</span></div>
        <div className="strategy-hypothesis"><Lightbulb size={17}/><p><b>本轮假设</b> 场景型红人负责建立“职场可用”记忆，专业型红人消除“静音是否影响吸力”的疑虑。</p></div>
      </article>

      <article className="relation-core" aria-label="产品红人关系核心">
        <div className="core-ring ring-one"></div><div className="core-ring ring-two"></div>
        <div className="core-product"><Package size={24}/><b>M5</b><small>产品任务</small></div>
        {productRelations.map((r,i)=><button key={r.name} className={`creator-orbit o${i} ${selectedRelation.name===r.name?'active':''}`} onClick={()=>setSelectedRelation(r)}><span>{r.initials}</span><b>{r.score}</b><small>{r.role}</small></button>)}
        <div className="core-caption"><Network size={14}/> 关系不是标签，是持续更新的经营证据</div>
      </article>

      <aside className="panel relation-explain">
        <div className="relation-person"><span>{selectedRelation.initials}</span><div><small>{selectedRelation.platform} · {selectedRelation.stage}</small><h3>{selectedRelation.name}</h3><p>{goal}任务 · {selectedRelation.role}</p></div><b>{selectedRelation.score}<small>/100</small></b></div>
        <div className="match-bars">{[['人群',selectedRelation.audience],['场景',selectedRelation.scene],['信任',selectedRelation.trust],['内容',selectedRelation.content],['渠道',selectedRelation.channel]].map(x=><div key={x[0]}><span>{x[0]}<b>{x[1]}</b></span><i><em style={{width:`${x[1]}%`}}></em></i></div>)}</div>
        <div className="relation-result"><span><small>历史结果</small><b>{selectedRelation.result}</b></span><span><small>建议动作</small><b>{selectedRelation.action}</b></span></div>
        <button className="evidence-button" onClick={()=>setEvidence({name:`${selectedRelation.name} × M5`,score:selectedRelation.score,reason:`在${goal}任务中，人群、场景和角色证据共同支持${selectedRelation.role}定位。`,risk:selectedRelation.evidence.includes('中')?'部分渠道数据为观察信号':'低风险，仍需确认档期与授权'})}><ShieldCheck size={14}/> {selectedRelation.evidence}关系证据 <ChevronRight size={13}/></button>
      </aside>
    </div>

    <section className="panel relation-matrix">
      <div className="panel-title"><div><h3>候选关系矩阵</h3><p>分数仅在当前产品、目标与约束下有效</p></div><button onClick={()=>showToast('已导出当前任务匹配快照')}>导出匹配快照</button></div>
      <div className="relation-table-head"><span>红人 / 关系阶段</span><span>任务角色</span><span>人群</span><span>场景</span><span>信任</span><span>内容</span><span>渠道</span><span>证据</span><span>下一动作</span></div>
      {productRelations.map(r=><button className={selectedRelation.name===r.name?'selected':''} key={r.name} onClick={()=>setSelectedRelation(r)}><span className="person-cell"><i>{r.initials}</i><b>{r.name}<small>{r.platform} · {r.stage}</small></b></span><span><em className="role-pill">{r.role}</em></span>{[r.audience,r.scene,r.trust,r.content,r.channel].map((x,i)=><span key={i}><b className={`score-dot s${Math.floor(x/10)}`}>{x}</b></span>)}<span>{r.evidence}</span><span className="advice">{r.action}</span></button>)}
    </section>

    <section className="feedback-loop panel">
      <div className="panel-title"><div><h3>增长闭环健康度</h3><p>M5 职场背奶 Campaign · 每一步必须形成下一步可用的数据</p></div><strong>81<small>/100</small></strong></div>
      <div className="loop-track">{loop.map((x,i)=><div key={x[0]} className={i<4?'done':i===4?'current':''}><span>{i<4?<Check size={14}/>:i+1}</span><b>{x[0]}</b><small>{x[1]}</small>{i<loop.length-1&&<i><ArrowRight size={13}/></i>}</div>)}</div>
      <div className="loop-alert"><RefreshCw size={16}/><p><b>闭环缺口：</b>3位红人的授权结果尚未回写，导致素材价值和下一轮预算建议置信度下降。</p><button onClick={()=>showToast('已生成3项授权结果补录任务')}>生成补录动作</button></div>
    </section>
  </section>
}

function DashboardPage({ showToast, setEvidence, setActive }) {
  const [metric,setMetric]=useState('上线量')
  const [dimension,setDimension]=useState('场景 × 产品 × 红人角色')
  const rows=crossAnalysisData[metric]
  return <section className="module-content cockpit-v2">
    <PageHeader eyebrow="BI 中心 · 经营驾驶舱" title="从结果看见结构，从结构走向动作。" desc="统一查看规模、内容、交易与效率指标，并下钻到场景、产品和红人角色的真实贡献。" onAction={()=>showToast('经营驾驶舱报告已生成')}/>
    <div className="scope-bar panel"><span><SlidersHorizontal size={15}/>经营范围</span>{[['时间','近 30 天'],['市场','美国'],['平台','全部平台'],['产品','全部产品'],['Campaign','全部']].map(x=><button key={x[0]}><small>{x[0]}</small><b>{x[1]}</b><ChevronDown size={12}/></button>)}<button className="apply" onClick={()=>showToast('经营范围已更新')}>应用筛选</button></div>

    <section className="ai-signal-brief">
      <header><div><span><Sparkles size={15}/> STARAGENT AI 经营摘要</span><h3>增长窗口正在出现，但排期和归因缺口会影响放大速度。</h3><p>综合外部市场、内部合作表现与资产健康度 · 更新于今天 09:42</p></div><button onClick={()=>setActive('actions')}>生成 4 项优先动作 <ArrowRight size={14}/></button></header>
      <div className="signal-grid">
        <article><span className="signal-icon external"><Globe size={17}/></span><div><small>外部信号</small><b>职场背奶内容热度连续 3 周增长</b><p>TikTok 同类内容播放 +28%，竞品 Willow 增加专业型红人投入。</p><em>市场机会 · 置信度 86%</em></div></article>
        <article><span className="signal-icon internal"><TrendingUp size={17}/></span><div><small>内部表现</small><b>“真实工作流”已形成可放大结构</b><p>3 条自然素材 ROAS 高于品牌基线 32%，M5 品牌搜索同步 +18%。</p><em>已验证 · 38 条内部证据</em></div></article>
        <article><span className="signal-icon focus"><Target size={17}/></span><div><small>核心关注点</small><b>先锁定核心红人排期，再补齐归因</b><p>4 位高价值红人 30 天内到期，2 项合作缺 Amazon Attribution。</p><em>高优先级 · 预计影响 ¥8.4万</em></div></article>
      </div>
    </section>

    <div className="cockpit-kpis">{cockpitMetrics.map((m,i)=><button key={m.key} className={`${metric===m.key?'active':''} tone-${m.tone}`} onClick={()=>setMetric(m.key)}><span><small>{m.key}</small><em>0{i+1}</em></span><b>{m.value}</b><p><strong>{m.delta}</strong>{m.note}</p></button>)}</div>

    <div className="cockpit-analysis-grid">
      <article className="panel cross-analysis">
        <div className="panel-title"><div><h3>{metric}交叉下钻</h3><p>点击上方指标切换口径 · 结果按当前维度排序</p></div><button onClick={()=>showToast(`${metric}交叉分析已导出`)}><Download size={14}/> 导出分析</button></div>
        <div className="dimension-switch">{['场景 × 产品 × 红人角色','市场 × 平台','Campaign × 产品'].map(x=><button key={x} className={dimension===x?'active':''} onClick={()=>setDimension(x)}>{x}</button>)}</div>
        <div className="cross-chart">{rows.map((r,i)=><button key={r[0]} onClick={()=>showToast(`已下钻：${r[0]} · ${r[1]}`)}><span><b>{r[0]}</b><small>{r[1]}</small></span><i><em style={{width:`${94-i*14}%`}}></em></i><strong>{r[2]}</strong><ChevronRight size={14}/></button>)}</div>
        <div className="analysis-insight"><Sparkles size={16}/><p><b>StarAgent 解读：</b>“职场背奶 × M5”在{metric}上领先，但专业教育型红人的单位内容心智贡献更高，建议规模传播与信任解释继续采用双角色组合。</p><button onClick={()=>setActive('actions')}>生成动作</button></div>
      </article>

      <article className="panel opportunity-panel cockpit-risk"><div className="panel-title"><div><h3>本周机会与风险</h3><p>按预期经营影响排序</p></div><span className="live-dot">6 项待处理</span></div>
        {[['up','放大机会','3 条自然素材广告测试 ROAS 超过品牌基线 32%','预计增量 ¥8.4万'],['idea','心智机会','“静音”卖点主动提及增长 2.1 倍','建议纳入下轮 Brief'],['warn','归因风险','2 位红人缺少 Amazon Attribution 标签','可能低估 15%–22%'],['warn','关系风险','4 位核心红人排期将在 30 天内到期','建议启动年度续签']].map((x,i)=><button className="opportunity" key={x[1]} onClick={()=>showToast(`已打开：${x[1]}`)}><span className={x[0]}>{i===0?<TrendingUp size={16}/>:i===1?<Lightbulb size={16}/>:<AlertCircle size={16}/>}</span><div><b>{x[1]}</b><p>{x[2]}</p><small>{x[3]}</small></div><ChevronRight size={15}/></button>)}
      </article>
    </div>

    <article className="panel business-graph">
      <div className="panel-title"><div><h3>场景 × 产品 × 红人经营图谱</h3><p>从业务场景出发，查看产品证据、红人角色与下一动作如何连接</p></div><button onClick={()=>setActive('productgraph')}>进入关系图谱 <ArrowRight size={14}/></button></div>
      <div className="constellation">
        <div className="graph-axis axis-left"><small>高潜场景</small><button><span>01</span><b>职场背奶</b><em>可规模化</em></button><button><span>02</span><b>夜间吸奶</b><em>待补信任</em></button><button><span>03</span><b>通勤隐形</b><em>快速增长</em></button></div>
        <div className="graph-product"><i></i><span><Package size={25}/><b>M5</b><small>美国市场 · 品牌传播</small></span><p>4 个场景已验证<br/>3 个卖点可放大</p></div>
        <div className="graph-axis axis-right"><small>关键红人角色</small><button><span>桃</span><b>场景共鸣</b><em>匹配 92</em></button><button><span>K</span><b>专业教育</b><em>匹配 89</em></button><button><span>M</span><b>真实体验</b><em>匹配 86</em></button></div>
        <div className="graph-verdict"><Sparkles size={16}/><p><b>本周最优组合：</b>职场背奶 × M5 × 场景型 + 专业型红人</p><button onClick={()=>setActive('actions')}>生成执行动作</button></div>
      </div>
    </article>

    <div className="panel portfolio-table cockpit-portfolio"><div className="panel-title"><div><h3>本月高价值红人组合</h3><p>按角色贡献展示，而非按 GMV 单一排序</p></div><button onClick={()=>setActive('influencers')}><Users size={14}/> 查看红人资产</button></div>
      <div className="table-head"><span>红人</span><span>组合角色</span><span>上线 / 播放</span><span>品牌影响</span><span>素材价值</span><span>ROI</span><span>经营建议</span></div>
      {creators.map((c,i)=><button className="table-row" key={c.id} onClick={()=>setActive('influencers')}><span className="person-cell"><i style={{background:c.color}}>{c.initials}</i><b>{c.name}<small>{c.handle}</small></b></span><span><em className="role-pill">{['场景传播','专业教育','真实体验'][i]}</em></span><span><b>{[24,18,16][i]} / {[386,284,198][i]}万</b></span><span><b>{[92,88,76][i]}</b></span><span><b>{[84,72,94][i]}</b></span><span>{['7.4','6.9','5.8'][i]}</span><span className="advice">{['年度绑定','扩大测试','授权放大'][i]}</span></button>)}
    </div>
  </section>
}

function SalesConversionPage({showToast,setActive}) {
  const [metric,setMetric]=useState('GMV')
  const salesMetrics=[['红人归因 GMV','¥8.65M','+18.4%',ShoppingBag],['有效订单','42,684','+12.6%',Receipt],['访问转化率','4.82%','+0.64pp',Target],['推广花费','¥1.29M','+15.8%',WalletCards],['综合 ROI','6.73','+0.42',TrendingUp]]
  return <section className="module-content sales-conversion-page">
    <PageHeader eyebrow="BI 中心 · 销售与转化" title="看清红人影响如何抵达访问、订单和收入。" desc="统一直接归因、辅助贡献和增量评估，既看 GMV 与 ROI，也解释转化发生在哪里、由谁推动。" action="导出归因报告" onAction={()=>showToast('销售与转化归因报告已生成')}/>
    <div className="sales-metrics">{salesMetrics.map(([l,v,d,I])=><button key={l} className={metric===l.replace('红人归因 ','')?'active':''} onClick={()=>setMetric(l.replace('红人归因 ',''))}><I size={17}/><span><small>{l}</small><b>{v}</b><em>{d}</em></span></button>)}</div>
    <div className="sales-grid"><article className="panel conversion-funnel"><div className="panel-title"><div><h3>红人影响转化漏斗</h3><p>近 30 天 · 跨平台去重</p></div><span className="confidence"><ShieldCheck size={12}/> 78% 强归因证据</span></div><div className="funnel-steps">{[['有效内容触达','286.4万','100%'],['商品详情访问','28.4万','9.9%'],['加入购物车','86,420','30.4%'],['有效订单','42,684','49.4%'],['归因 GMV','¥8.65M','6.73 ROI']].map((x,i)=><div key={x[0]} style={{width:`${100-i*10}%`}}><span>0{i+1}</span><b>{x[0]}<small>{x[1]}</small></b><em>{x[2]}</em></div>)}</div><div className="funnel-insight"><Sparkles size={15}/><p><b>最大增长杠杆：</b>商品详情访问率提升 1 个百分点，预计可新增约 ¥72 万红人归因 GMV。</p></div></article>
      <article className="panel sales-trend"><div className="panel-title"><div><h3>GMV 与推广花费趋势</h3><p>按周 · 当前查看 {metric}</p></div><div className="chart-key"><span><i></i>GMV</span><span><i></i>推广花费</span></div></div><div className="dual-bars">{[['W1',62,26],['W2',74,31],['W3',68,29],['W4',91,38],['W5',84,34],['W6',96,39]].map(x=><div key={x[0]}><span><i style={{height:`${x[1]}%`}}></i><em style={{height:`${x[2]}%`}}></em></span><small>{x[0]}</small></div>)}</div><div className="trend-verdict"><TrendingUp size={15}/><p>W4 后 GMV 增速高于花费增速，主要来自 M5 职场场景内容与 Amazon 品牌搜索承接。</p></div></article></div>
    <div className="sales-grid lower"><article className="panel channel-sales"><div className="panel-title"><div><h3>渠道销售贡献</h3><p>直接收入与辅助贡献分开呈现</p></div><button onClick={()=>setActive('crosschannel')}>查看完整路径</button></div>{[['Amazon','¥3.86M','44.6%','+18%'],['独立站','¥2.42M','28.0%','+24%'],['TikTok Shop','¥1.56M','18.0%','+32%'],['其他渠道','¥0.81M','9.4%','+6%']].map((x,i)=><div className="channel-sales-row" key={x[0]}><span><i className={`ch${i}`}></i><b>{x[0]}<small>较上期 {x[3]}</small></b></span><em><i style={{width:x[2]}}></i></em><strong>{x[1]}<small>{x[2]}</small></strong></div>)}</article>
      <article className="panel roi-drivers"><div className="panel-title"><div><h3>ROI 驱动因素</h3><p>解释本期 6.73 的来源</p></div></div>{[['红人组合质量','+0.48','场景型 + 专业型双角色'],['素材迁移效率','+0.31','3 条内容跨广告复用'],['Amazon 承接','+0.24','品牌搜索与详情页访问'],['授权费用上升','-0.18','核心红人续签成本增加']].map((x,i)=><div key={x[0]}><span className={i===3?'down':''}>{i===3?<ArrowRight size={13}/>:<TrendingUp size={13}/>}</span><b>{x[0]}<small>{x[2]}</small></b><strong className={i===3?'down':''}>{x[1]}</strong></div>)}</article></div>
    <section className="panel sales-creator-table"><div className="panel-title"><div><h3>红人销售与转化表现</h3><p>同时展示传播、访问、订单和 ROI，避免只按 GMV 排名</p></div><button onClick={()=>setActive('actionInfluencers')}>进入红人资源</button></div><div className="sales-table-head"><span>红人 / 角色</span><span>详情访问</span><span>订单</span><span>GMV</span><span>花费</span><span>ROI</span><span>辅助贡献</span><span>建议</span></div>{[['一颗小桃子','场景传播','48,620','8,426','¥2.86M','¥386K','7.41','品牌搜索 +24%','年度绑定'],['护士妈妈Kiki','专业教育','36,840','6,842','¥2.14M','¥312K','6.86','收藏转化强','扩大复投'],['阿Moon的日常','真实体验','28,460','4,928','¥1.82M','¥268K','6.79','素材价值 94','授权放大'],['在逃妈妈Yuki','跨渠引流','21,680','3,246','¥1.18M','¥184K','6.41','Amazon +17%','小额复测']].map((r,i)=><button key={r[0]} onClick={()=>setActive('influencers')}><span className="person-cell"><i>{r[0][0]}</i><b>{r[0]}<small>{r[1]}</small></b></span>{r.slice(2,8).map((x,j)=><span key={j}><b>{x}</b></span>)}<em>{r[8]}</em><ChevronRight size={13}/></button>)}</section>
  </section>
}

function AskDataPage({showToast,setActive}) {
  const [question,setQuestion]=useState('为什么本月 M5 的红人 ROI 提升了？哪些红人和内容结构贡献最大？')
  const [answer,setAnswer]=useState(true)
  const ask=()=>{if(question.trim()){setAnswer(true);showToast('已基于统一指标口径生成可视化分析')}}
  return <section className="module-content ask-data-page">
    <PageHeader eyebrow="BI 中心 · 智能问数" title="直接问业务问题，得到结论、原因和下一步。" desc="StarAgent 自动选择指标、维度与证据，生成可视化报告；每个答案都保留口径、数据来源与可信度。" action="我的问数记录" onAction={()=>showToast('已打开已保存的问数记录')}/>
    <div className="ask-command"><div className="ask-orbit"><Sparkles size={22}/><i></i></div><div><span>STARAGENT DATA COPILOT</span><h3>你想从数据里知道什么？</h3></div><div className="ask-input"><textarea value={question} onChange={e=>setQuestion(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();ask()}}}/><button onClick={ask}><ArrowUp size={18}/></button></div><div className="ask-suggestions">{['对比各平台红人 ROI','找出本月增长最快的内容结构','哪些红人适合追加预算','解释 Amazon GMV 波动'].map(x=><button key={x} onClick={()=>{setQuestion(x);setAnswer(true)}}>{x}<ChevronRight size={12}/></button>)}</div></div>
    {answer&&<><div className="answer-meta"><div><span className="live-dot">分析完成</span><p>已使用 7 个指标、4 个维度、3 个数据源 · 数据截至今天 09:42</p></div><div><button onClick={()=>showToast('分析已保存到团队问数空间')}><FileText size={13}/>保存报告</button><button onClick={()=>showToast('分享链接已复制')}><Link2 size={13}/>分享</button></div></div>
      <section className="answer-verdict"><header><span><Sparkles size={16}/>STARAGENT 结论</span><strong>可信度 91%</strong></header><h2>M5 红人 ROI 提升主要由“组合质量”和“内容复用”驱动，不是单纯增加预算。</h2><p>本月 ROI 从 6.31 提升至 6.73。其中，场景型 + 专业型红人组合贡献约 52% 的增量，3 条自然内容迁移广告贡献约 31%。</p><div>{[['ROI','6.73','+0.42'],['增量 GMV','¥684K','+18.4%'],['关键红人','3 位','贡献 68%'],['关键结构','真实工作流','跨红人复现 4 次']].map(x=><span key={x[0]}><small>{x[0]}</small><b>{x[1]}</b><em>{x[2]}</em></span>)}</div></section>
      <div className="answer-grid"><article className="panel answer-chart"><div className="panel-title"><div><h3>ROI 增量贡献拆解</h3><p>相较上月 · 贡献百分点</p></div><span className="confidence"><ShieldCheck size={12}/> 强证据</span></div><div className="waterfall">{[['红人组合',48,'+0.48'],['内容复用',31,'+0.31'],['渠道承接',24,'+0.24'],['授权成本',18,'-0.18'],['其他',9,'-0.09']].map((x,i)=><div key={x[0]}><span>{x[0]}</span><i><em className={i>2?'negative':''} style={{width:`${x[1]*1.8}%`}}></em></i><strong className={i>2?'negative':''}>{x[2]}</strong></div>)}</div></article>
        <article className="panel answer-reasons"><div className="panel-title"><div><h3>原因证据链</h3><p>从结果向业务对象回溯</p></div></div>{[['01','组合质量提升','一颗小桃子负责场景传播，Kiki 负责专业解释，用户从“看到”到“相信”的路径更完整。','26 条合作与受众证据'],['02','内容结构可复现','“冲突开场 → 真实工作流 → 结果证明”跨 4 位红人复现，降低了内容试错成本。','19 条内容结构证据'],['03','渠道承接增强','品牌搜索提升后 Amazon 详情页访问同步增长，形成强辅助路径。','13 条 UTM / Attribution 证据']].map(x=><article key={x[0]}><span>{x[0]}</span><div><b>{x[1]}</b><p>{x[2]}</p><small><ShieldCheck size={11}/>{x[3]}</small></div></article>)}</article></div>
      <section className="panel answer-actions"><div><span><Target size={18}/></span><div><small>STARAGENT 建议</small><h3>把答案直接变成下一步动作</h3></div></div>{[['追加 20% 预算给双角色组合','预计新增 GMV ¥12–18万','salesConversion'],['把 3 条验证素材推送广告端','预计降低素材测试成本 26%','ads'],['锁定 4 位核心红人 30 天排期','避免增长窗口被竞品抢占','actionInfluencers']].map(x=><button key={x[0]} onClick={()=>setActive(x[2])}><b>{x[0]}<small>{x[1]}</small></b><ArrowRight size={14}/></button>)}</section></>}
  </section>
}

function BIPage({ showToast }) {
  const bars=[72,88,56,94,68,83,63,91,76,87,70,96]
  return <section className="module-content">
    <PageHeader eyebrow="自由分析" title="问一个问题，或者从指标开始。" desc="所有分析与经营驾驶舱共享指标口径；你可以下钻、切片、保存和复用视图。" action="新建分析" onAction={()=>showToast('已创建空白分析')}/>
    <div className="bi-query"><Sparkles size={18}/><input defaultValue="比较不同红人角色对品牌搜索和 Amazon 访问的影响"/><button>运行分析 <ArrowRight size={15}/></button></div>
    <div className="bi-layout"><aside className="metric-library"><h3>指标库</h3><label><Search size={14}/><input placeholder="搜索指标"/></label>{[['品牌影响',['有效触达','品牌搜索提升','品类声量 SOV']],['内容资产',['素材复用率','广告迁移成功率','素材生命周期']],['渠道与转化',['独立站辅助访问','Amazon DPV','TikTok Shop GMV']]].map(g=><div className="metric-group" key={g[0]}><b>{g[0]}</b>{g[1].map(x=><button key={x}><span></span>{x}<Plus size={12}/></button>)}</div>)}</aside>
      <div className="analysis-canvas"><div className="analysis-head"><div><span className="query-chip">维度：红人角色</span><span className="query-chip">指标：品牌搜索提升</span><span className="query-chip">市场：美国</span></div><button><MoreHorizontal size={16}/></button></div>
        <div className="chart-title"><div><h3>品牌传播型红人的搜索影响更持久</h3><p>发布后 14 天 · 相对发布前基线</p></div><span className="confidence"><ShieldCheck size={13}/> 中等证据</span></div>
        <div className="bar-chart">{bars.map((h,i)=><div key={i}><i style={{height:`${h}%`}} className={i>7?'highlight':''}></i><span>{i+1}日</span></div>)}</div>
        <div className="chart-legend"><span><i></i>品牌搜索指数</span><b>峰值 +34% · 第 9 天</b></div>
        <div className="insight-note"><Lightbulb size={17}/><p><b>AI 解读：</b>品牌传播型红人的搜索提升持续时间比转化型红人长 4.2 天，但直接点击更低。建议评价窗口从 7 天延长至 14 天。</p></div>
      </div>
    </div>
  </section>
}

const influencerAssets = [
  {id:1,name:'一颗小桃子',initials:'桃',platform:'小红书',market:'中国',category:'职场妈妈',tier:'头部',lifecycle:'成熟期',relation:'核心',score:94,roi:'7.4',gmv:'¥2.86M',audience:'92%',contents:24,plays:'386M',spend:'¥386K',brand:92,material:84,cross:78,safety:'安全',color:'#e7b6c2',strategy:'年度绑定 · P0',roles:['场景传播','品牌心智','素材生产']},
  {id:2,name:'护士妈妈Kiki',initials:'K',platform:'TikTok',market:'美国',category:'母婴科普',tier:'头部',lifecycle:'成长期',relation:'复投',score:91,roi:'6.9',gmv:'¥2.14M',audience:'89%',contents:18,plays:'284M',spend:'¥312K',brand:88,material:72,cross:91,safety:'安全',color:'#ddb3a2',strategy:'扩大测试 · P0',roles:['专业教育','信任建立','跨渠引流']},
  {id:3,name:'阿Moon的日常',initials:'M',platform:'Instagram',market:'美国',category:'新手妈妈',tier:'肩部',lifecycle:'成长期',relation:'首投',score:86,roi:'5.8',gmv:'¥1.82M',audience:'87%',contents:16,plays:'198M',spend:'¥268K',brand:76,material:94,cross:82,safety:'待确认授权',color:'#c9c3e1',strategy:'授权放大 · P1',roles:['真实体验','内容验证','素材生产']},
  {id:4,name:'在逃妈妈Yuki',initials:'Y',platform:'YouTube',market:'加拿大',category:'精致育儿',tier:'腰部',lifecycle:'观察期',relation:'观察',score:78,roi:'4.6',gmv:'¥1.18M',audience:'82%',contents:12,plays:'126M',spend:'¥184K',brand:74,material:81,cross:94,safety:'1项风险',color:'#c7d8d2',strategy:'小预算复测 · P1',roles:['产品测评','跨渠引流','长内容']},
]

function InfluencerPage({ showToast, setEvidence }) {
  const [segment,setSegment]=useState('全部资产')
  const [profile,setProfile]=useState(null)
  return <section className="module-content influencer-assets-v2">
    <PageHeader eyebrow="BI 中心 · 红人资产" title="汇总看到规模，360 画像决定怎么合作。" desc="从账号与受众、合作关系、内容资产、交易归因、品牌 VOC、风险和策略七个域经营每一位红人。" action="导入红人" onAction={()=>showToast('红人导入模板已准备')}/>
    <div className="influencer-summary">{[['企业红人资产','1,286','+86 本月新增',Users],['高价值红人','84','综合价值 ≥ 85',BadgeCheck],['高潜成长','126','近 30 天加速',TrendingUp],['深度合作','186','复投或框架合作',Handshake],['风险红人','17','需人工复核',ShieldCheck]].map(([l,v,n,I],i)=><button key={l} onClick={()=>setSegment(i===1?'高价值':i===2?'高潜成长':i===4?'风险':'全部资产')}><I size={17}/><span><small>{l}</small><b>{v}</b><em>{n}</em></span></button>)}</div>
    <div className="influencer-toolbar panel"><div className="asset-segments">{['全部资产','高价值','高潜成长','高匹配','风险'].map(x=><button key={x} className={segment===x?'active':''} onClick={()=>setSegment(x)}>{x}<span>{[1286,84,126,286,17][['全部资产','高价值','高潜成长','高匹配','风险'].indexOf(x)]}</span></button>)}</div><label><Search size={15}/><input placeholder="搜索红人、平台、角色或标签"/></label><button><SlidersHorizontal size={15}/> 维度筛选</button></div>
    <div className="influencer-asset-layout">
      <aside className="panel asset-filter-rail"><div><h3>资产维度</h3><button>重置</button></div>{[['关系阶段','核心 / 复投 / 首投'],['平台与市场','TikTok / 美国'],['业务角色','传播 / 教育 / 素材'],['生命周期','成长 / 成熟 / 观察'],['受众质量','真实受众 ≥ 80%'],['授权状态','可投流 / 待确认'],['风险信号','品牌安全 / 履约'],['证据强度','中等以上']].map((x,i)=><button key={x[0]} className={i===0?'open':''}><span><CircleDot size={13}/><b>{x[0]}</b><small>{i===0?'3':''}</small></span><p>{x[1]}</p><ChevronDown size={13}/></button>)}</aside>
      <div className="influencer-card-grid">{influencerAssets.map(c=><button className="influencer-asset-card" key={c.id} onClick={()=>setProfile(c)}>
        <div className="asset-card-head"><span style={{background:c.color}}>{c.initials}</span><div><h3>{c.name}<BadgeCheck size={13}/></h3><p>{c.platform} · {c.market} · {c.category}</p></div><strong>{c.score}</strong></div>
        <div className="asset-card-tags"><span>{c.tier}</span><span>{c.lifecycle}</span><span>{c.relation}关系</span></div>
        <div className="asset-card-metrics"><span><b>{c.roi}x</b><small>ROI</small></span><span><b>{c.gmv}</b><small>GMV</small></span><span><b>{c.audience}</b><small>受众质量</small></span><span><b>{c.contents}</b><small>内容资产</small></span></div>
        <div className="relationship-depth"><i><em style={{width:`${c.score}%`}}></em></i><span>{c.relation}关系</span></div>
        <div className="asset-card-foot"><span className={c.safety==='安全'?'safe':'risk'}><ShieldCheck size={12}/>{c.safety}</span><b>{c.strategy}</b><ChevronRight size={14}/></div>
      </button>)}</div>
    </div>
    {profile&&<Influencer360Drawer creator={profile} onClose={()=>setProfile(null)} showToast={showToast} setEvidence={setEvidence}/>} 
  </section>
}

function ActionInfluencerPage({showToast,setActive,setEvidence}) {
  const [resourceScope,setResourceScope]=useState('外部资源')
  const [pool,setPool]=useState('精准推荐')
  const [profile,setProfile]=useState(null)
  const [selectedIds,setSelectedIds]=useState([1,2])
  const [query,setQuery]=useState('')
  const pools=[['全量资源池','3.2亿+','全球合规数据'],['企业候选池','1,286','身份已确认'],['精准推荐','24','匹配当前任务']]
  const visible=influencerAssets.filter(c=>!query||`${c.name}${c.platform}${c.market}${c.category}${c.roles.join('')}`.toLowerCase().includes(query.toLowerCase()))
  const toggle=id=>setSelectedIds(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id])
  return <section className="module-content action-resource-page">
    <PageHeader eyebrow="动作中心 · 红人资源" title="市场发现和内部资产，在同一个选人入口汇合。" desc="外部资源用于发现竞品和平台新红人；内部资源使用企业合作、内容和表现数据完成精准匹配。" action={resourceScope==='外部资源'?'新建监控':'导入红人'} onAction={()=>showToast(resourceScope==='外部资源'?'已打开社媒监控配置':'已打开红人导入与身份校验向导')}/>
    <div className="resource-scope-tabs"><button className={resourceScope==='外部资源'?'active':''} onClick={()=>setResourceScope('外部资源')}><Globe size={17}/><span><b>外部资源</b><small>竞品品牌 · 竞品红人 · 全平台市场发现</small></span><em>1,284,620</em></button><button className={resourceScope==='内部资源'?'active':''} onClick={()=>setResourceScope('内部资源')}><Database size={17}/><span><b>内部资源</b><small>合作实绩 · 内容表现 · 企业关系资产</small></span><em>1,286</em></button></div>
    {resourceScope==='外部资源'?<>
      <section className="social-monitor panel"><div className="monitor-identity"><span><Radar size={21}/><i></i></span><div><small>SOCIAL LISTENING PLUGIN · 实时运行</small><h3>社媒红人雷达</h3><p>监控重点竞品的新增合作红人、内容主题和平台增速，异常信号自动进入候选池。</p></div></div><div className="monitor-platforms">{[['TikTok','2分钟前','386'],['Instagram','5分钟前','248'],['YouTube','18分钟前','92'],['小红书','32分钟前','164']].map(x=><button key={x[0]}><i></i><span><b>{x[0]}</b><small>同步于 {x[1]}</small></span><strong>{x[2]}<small>新信号</small></strong></button>)}</div><button className="monitor-config" onClick={()=>showToast('已打开监控关键词、竞品和告警阈值设置')}><Settings size={14}/>监控设置</button></section>
      <div className="external-resource-grid">
        <section className="panel competitor-watch"><div className="panel-title"><div><h3>竞品品牌与红人动向</h3><p>样例监测数据 · 近 7 天</p></div><button onClick={()=>setActive('competitor')}>进入竞品监控</button></div>{[['Willow','新增 18 位合作红人','职场免手扶','+28%','高'],['Elvie','新增 12 位合作红人','轻薄隐形','+19%','中'],['Medela','新增 7 位合作红人','专业供奶','+8%','中']].map((x,i)=><article key={x[0]}><span className={`competitor-logo c${i}`}>{x[0][0]}</span><div><h4>{x[0]}<em>{x[4]}关注</em></h4><p>{x[1]} · 主攻“{x[2]}”</p><small>红人合作声量 {x[3]}</small></div><div className="competitor-spark">{[42,68,54,76,63,82,91].map((h,j)=><i key={j} style={{height:`${h}%`}}></i>)}</div><button onClick={()=>showToast(`已筛选 ${x[0]} 近 30 天合作红人`)}>查看红人 <ChevronRight size={13}/></button></article>)}</section>
        <aside className="panel discovery-brief"><div><Sparkles size={17}/><span><small>STARAGENT 市场发现</small><h3>本周值得抢先建联</h3></span></div><b>竞品正在集中占领“专业解释”，但真实职场工作流仍有空位。</b><p>建议优先联系 6 位近期快速增长、尚未与重点竞品深度绑定的场景型红人。</p><button onClick={()=>showToast('已生成 6 位外部红人的优先建联计划')}>生成优先建联名单 <ArrowRight size={13}/></button></aside>
      </div>
      <section className="external-candidate-board panel"><div className="external-board-head"><div><h3>外部平台红人候选</h3><p>合规数据源 + 社媒监控 · 尚未沉淀为企业合作资产</p></div><div><button className="active">综合潜力</button><button>竞品合作</button><button>近期增长</button><button>平台分布</button></div></div><div className="external-table-head"><span>红人 / 平台</span><span>发现来源</span><span>近期增长</span><span>互动质量</span><span>竞品关系</span><span>M5 预匹配</span><span>动作</span></div>{marketCandidates.slice(0,4).map((c,i)=><article key={c.id}><span className="external-person"><i>{c.initials}</i><b>{c.name}<small>{c.platform} · {c.market} · {c.followers} 粉丝</small></b></span><span><em>{i<2?'竞品红人监控':'平台增长榜'}</em><small>{c.source}</small></span><strong className="metric-up">{c.growth}</strong><strong>{c.engagement}</strong><span><b>{['Willow · 单次','Elvie · 近期合作','无重点竞品','Medela · 历史'][i]}</b><small>{['可争取','需查排他','优先建联','需风险复核'][i]}</small></span><strong>{c.fit}<small>/100</small></strong><span className="external-actions"><button onClick={()=>showToast(`${c.name} 已加入内部候选池`)}>加入候选</button><button className="solid" onClick={()=>showToast(`已为 ${c.name} 生成个性化建联草稿`)}><Send size={12}/>一键建联</button></span></article>)}</section>
    </>:<>
    <div className="pool-funnel panel">
      {pools.map((p,i)=><React.Fragment key={p[0]}><button className={pool===p[0]?'active':''} onClick={()=>setPool(p[0])}><span>0{i+1}</span><div><small>{p[2]}</small><b>{p[0]}</b></div><strong>{p[1]}</strong></button>{i<2&&<ArrowRight size={17}/>}</React.Fragment>)}
      <div className="pool-context"><Package size={16}/><span><small>当前匹配产品</small><b>M5 · 职场背奶 · 美国</b></span><button onClick={()=>setActive('productCenter')}>切换</button></div>
    </div>
    <div className="resource-toolbar panel"><label><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="搜索红人、平台、市场或标签"/></label>{[['平台','全部'],['市场','美国'],['粉丝量级','全部'],['业务角色','传播 / 内容'],['证据强度','中等以上']].map(x=><button key={x[0]}><small>{x[0]}</small>{x[1]}<ChevronDown size={12}/></button>)}<button className="filter-more"><SlidersHorizontal size={14}/>更多筛选</button></div>
    <div className="resource-status"><div><span className="live-dot">{pool}</span><p>按 M5 品牌传播任务匹配 · 展示 {visible.length} / 24 位</p></div><div><button className="active">综合匹配</button><button>近期增长</button><button>历史表现</button></div></div>
    <div className="resource-card-grid">{visible.map((c,i)=><article className={`resource-card ${selectedIds.includes(c.id)?'selected':''}`} key={c.id}>
      <header><button className="resource-check" onClick={()=>toggle(c.id)}>{selectedIds.includes(c.id)&&<Check size={12}/>}</button><span className="resource-avatar" style={{background:c.color}}>{c.initials}<i></i></span><div><h3>{c.name}<BadgeCheck size={13}/></h3><p>{c.platform} · {c.market} · {c.category}</p></div><strong>{c.score}<small>任务匹配</small></strong></header>
      <div className="resource-tags">{c.roles.map(x=><span key={x}>{x}</span>)}<span>{c.relation}关系</span></div>
      <div className="performance-ribbon"><span><b>{c.plays}</b><small>累计播放</small></span><span><b>{c.brand}</b><small>品牌影响</small></span><span><b>{c.material}</b><small>素材价值</small></span><span><b>{c.roi}x</b><small>历史 ROI</small></span></div>
      <div className="match-reason"><Sparkles size={15}/><p><b>{['最适合建立职场场景记忆','最适合解释静音与吸力','最适合验证真实体验','最适合跨平台承接'][i]}</b>{['场景内容高于账号基线 2.8x，受众与 M5 人群重合 92%。','专业身份与高收藏率能够补齐产品信任证据。','内容结构完整，已有 6 条素材被跨渠道复用。','YouTube 长测评对 Amazon 详情页访问贡献突出。'][i]}</p></div>
      <footer><span className={c.safety==='安全'?'safe':'risk'}><ShieldCheck size={12}/>{c.safety}</span><button onClick={()=>setProfile(c)}>查看 360 画像</button><button className="solid" onClick={()=>{showToast(`已将 ${c.name} 带入合作草稿`);setActive('cooperations')}}>创建合作</button></footer>
    </article>)}</div>
    {selectedIds.length>0&&<div className="selection-dock"><div><span>{selectedIds.length}</span><p><b>位红人已选择</b><small>产品、内容结构与表现数据会一起带入下一步</small></p></div><button onClick={()=>setSelectedIds([])}>清空</button><button onClick={()=>{showToast('已生成 M5 产品匹配方案');setActive('productCenter')}}><Package size={15}/>生成产品匹配</button><button className="primary" onClick={()=>{showToast('合作草稿已创建，并带入所选红人');setActive('cooperations')}}><Handshake size={15}/>批量创建合作</button></div>}
    </>}
    {profile&&<Influencer360Drawer creator={profile} onClose={()=>setProfile(null)} showToast={showToast} setEvidence={setEvidence}/>} 
  </section>
}

const productAssets=[
  {id:'M5',name:'M5 可穿戴吸奶器',series:'Wearable Pump',market:'美国',stage:'规模增长期',score:96,coops:186,creators:48,gmv:'¥3.86M',tags:['重返职场妈妈','会议间隙','免手扶','静音','贴身便携','真实工作流'],focus:'建立“职场可用”场景记忆',color:'#d85b7f'},
  {id:'AIR1',name:'Air 1 超薄吸奶器',series:'Ultra-slim Pump',market:'欧洲',stage:'内容验证期',score:89,coops:84,creators:26,gmv:'¥1.82M',tags:['通勤妈妈','公共空间','超薄隐形','轻量','舒适佩戴','穿搭实测'],focus:'验证“隐形不尴尬”内容结构',color:'#9a6d7e'},
  {id:'KP',name:'KleanPal 洗奶瓶机',series:'Bottle Washer',market:'美国',stage:'新品教育期',score:84,coops:52,creators:19,gmv:'¥1.18M',tags:['新手父母','夜间清洗','洗烘存一体','省时','卫生安心','前后对比'],focus:'建立“夜间省时”功能认知',color:'#6d8b80'},
]

function ProductCenterPage({showToast,setActive}) {
  const [product,setProduct]=useState(productAssets[0])
  return <section className="module-content product-center-page">
    <PageHeader eyebrow="动作中心 · 产品中心" title="先定义产品任务，再决定找谁合作。" desc="把产品人群、场景、卖点、证据和合作历史组织为可执行上下文，为每次红人匹配提供同一套底图。" action="新建产品任务" onAction={()=>showToast('已创建产品任务草稿')}/>
    <div className="product-center-summary">{[['核心产品','28',Package],['已验证场景','64',CircleCheck],['关联红人','384',Users],['本月合作事项','326',Handshake]].map(([l,v,I])=><div key={l}><I size={17}/><span><small>{l}</small><b>{v}</b></span></div>)}</div>
    <div className="product-center-layout"><div className="product-list-panel"><div className="product-list-head"><div><h3>核心产品</h3><p>点击产品查看完整标签与合作表现</p></div><label><Search size={14}/><input placeholder="搜索产品"/></label></div>{productAssets.map((p,i)=><button className={`product-business-card ${product.id===p.id?'active':''}`} key={p.id} onClick={()=>setProduct(p)}>
      <span className="product-visual" style={{'--product-color':p.color}}><Package size={25}/><small>{p.id}</small></span><div className="product-card-main"><span>{p.series} · {p.market}</span><h3>{p.name}</h3><p>{p.focus}</p><div>{p.tags.slice(0,4).map(x=><em key={x}>{x}</em>)}</div></div><div className="product-match"><strong>{p.score}</strong><small>红人匹配健康度</small><i><em style={{width:`${p.score}%`}}></em></i></div><div className="product-record"><span><b>{p.coops}</b><small>合作记录</small></span><span><b>{p.creators}</b><small>合作红人</small></span><span><b>{p.gmv}</b><small>关联 GMV</small></span></div><ChevronRight size={16}/>
    </button>)}</div>
      <aside className="product-detail-panel panel"><header><span style={{background:product.color}}><Package size={22}/></span><div><small>{product.series}</small><h3>{product.name}</h3><p>{product.market} · {product.stage}</p></div><strong>{product.score}<small>匹配健康度</small></strong></header>
        <section><div className="detail-title"><h4>完整产品标签</h4><button>编辑标签</button></div>{[['目标人群',product.tags.slice(0,1)],['核心场景',product.tags.slice(1,2)],['核心卖点',product.tags.slice(2,5)],['内容证据',product.tags.slice(5)],['合作约束',['45秒内完整演示','允许90天投流','避免医疗功效承诺']]].map(([l,tags])=><div className="product-tag-row" key={l}><small>{l}</small><div>{tags.map(x=><span key={x}>{x}</span>)}</div></div>)}</section>
        <section><div className="detail-title"><h4>高匹配红人与合作记录</h4><button onClick={()=>setActive('actionInfluencers')}>查看全部</button></div>{influencerAssets.slice(0,3).map((c,i)=><button className="product-creator-row" key={c.id} onClick={()=>setActive('actionInfluencers')}><span style={{background:c.color}}>{c.initials}</span><b>{c.name}<small>{c.roles[0]} · 历史合作 {[6,4,2][i]} 次</small></b><em>{[96,92,88][i]} 匹配</em><ChevronRight size={13}/></button>)}</section>
        <div className="product-next"><Sparkles size={17}/><p><b>StarAgent 建议</b>{product.focus}，用“场景型 + 专业型”双角色组合兼顾传播与信任。</p></div>
        <footer><button onClick={()=>{showToast(`已按 ${product.name} 生成精准推荐`);setActive('actionInfluencers')}}><Target size={15}/>生成红人匹配</button><button className="primary" onClick={()=>{showToast(`${product.name} 合作草稿已创建`);setActive('cooperations')}}><Handshake size={15}/>创建合作</button></footer>
      </aside></div>
  </section>
}

const amplificationSources={
  '合作事项':[['COOP-260718 · 一颗小桃子 × M5','职场背奶的一天 · 已发布','自然播放 386万 · 品牌搜索 +24%','授权至 10/31'],['COOP-260724 · 护士妈妈Kiki × M5','静音是否影响吸力 · 已验收','收藏率 6.2% · 意向评论 +38%','授权确认中'],['COOP-260731 · 阿Moon × Air 1','通勤隐形实测 · 已发布','自然播放 198万 · 素材价值 94','授权至 09/15']],
  '素材资产':[['MAT-1846 · 职场冲突 Hook A','一颗小桃子 · 9:16 · 14s','自然表现高于基线 2.8x','Meta / TikTok 可用'],['MAT-1724 · 静音对比 Hook B','护士妈妈Kiki · 1:1 · 22s','收藏率 6.2% · 证据强','Meta 可用'],['MAT-1688 · 夜间体验 Hook C','阿Moon · 9:16 · 18s','意向评论 +38%','待续签授权']],
  '红人':[['一颗小桃子 · 场景传播','M5 核心红人 · 6 次合作','品牌影响 92 · 素材价值 84','Spark Ads 已授权'],['护士妈妈Kiki · 专业教育','M5 复投红人 · 4 次合作','专业信任 97 · 引流能力 91','待确认白名单'],['阿Moon的日常 · 真实体验','Air 1 首投红人 · 2 次合作','素材价值 94 · 内容验证强','Meta Partnership 可用']]
}

function AdsAmplificationPage({showToast,setActive}) {
  const [sourceType,setSourceType]=useState('合作事项')
  const [selected,setSelected]=useState([0])
  const rows=amplificationSources[sourceType]
  const toggle=i=>setSelected(s=>s.includes(i)?s.filter(x=>x!==i):[...s,i])
  return <section className="module-content ads-bridge-page">
    <PageHeader eyebrow="增长放大 · 内容资产与广告放大" title="先沉淀内容资产，再把已验证结构推入广告增长。" desc="统一管理内容结构、自然表现、授权、二创与广告迁移；广告结果继续回写内容资产和红人能力模型。" action="上传内容" onAction={()=>showToast('已打开内容资产上传与自动解析')}/>
    <div className="creative-asset-summary">{[['内容资产','2,486','+126 本月新增',Film],['已验证结构','48','跨红人复现 ≥ 3次',BadgeCheck],['可授权素材','126','覆盖 Meta / TikTok',ShieldCheck],['广告迁移中','18','平均 ROAS 2.86',Megaphone],['素材复用价值','¥684K','节省制作与测试成本',TrendingUp]].map(([l,v,n,I],i)=><button key={l} onClick={()=>i===3?showToast('已筛选正在广告迁移的素材'):showToast(`已打开${l}明细`)}><I size={16}/><span><small>{l}</small><b>{v}</b><em>{n}</em></span></button>)}</div>
    <div className="ad-connection panel"><div><span><Megaphone size={20}/></span><div><small>广告端连接状态</small><b>Meta · TikTok Ads · Amazon DSP 已连接</b><p>账户、像素、授权白名单与归因窗口最近校验于 18 分钟前</p></div></div><em><i></i>连接健康</em><button onClick={()=>showToast('广告端连接与权限均正常')}>检查连接</button></div>
    <div className="amplify-spine panel">{['选择业务对象','校验授权与风险','生成广告素材包','推送广告端','效果回流模型'].map((x,i)=><React.Fragment key={x}><div className={i<2?'done':i===2?'active':''}><span>{i<2?<Check size={12}/>:i+1}</span><b>{x}</b></div>{i<4&&<ArrowRight size={14}/>}</React.Fragment>)}</div>
    <div className="source-type-tabs"><div><h3>选择要放大的对象</h3><p>可以直接从合作事项、素材资产或红人开始</p></div><nav>{Object.keys(amplificationSources).map(x=><button key={x} className={sourceType===x?'active':''} onClick={()=>{setSourceType(x);setSelected([0])}}>{x==='合作事项'?<Handshake size={15}/>:x==='素材资产'?<Film size={15}/>:<Users size={15}/>} {x}<span>{amplificationSources[x].length}</span></button>)}</nav></div>
    <div className="amplify-layout"><div className="amplify-source-list">{rows.map((r,i)=><article className={selected.includes(i)?'selected':''} key={r[0]}><button className="resource-check" onClick={()=>toggle(i)}>{selected.includes(i)&&<Check size={12}/>}</button><div className="source-preview"><Play size={17}/><small>0{i+1}</small></div><div><small>{sourceType}</small><h3>{r[0]}</h3><p>{r[1]}</p></div><span><small>原始表现</small><b>{r[2]}</b></span><em>{r[3]}</em><button onClick={()=>showToast(`已打开 ${r[0]} 证据与授权`)}>证据 / 授权 <ChevronRight size={12}/></button></article>)}</div>
      <aside className="panel ad-package"><header><span><Sparkles size={16}/></span><div><small>AI 广告放大建议</small><h3>M5 职场场景素材包</h3></div><b>{selected.length}<small>个对象</small></b></header><div className="package-row"><small>投放目标</small><b>品牌认知 + 落地页访问</b><button>修改</button></div><div className="package-row"><small>建议渠道</small><b>Meta Reels · TikTok Spark Ads</b><button>修改</button></div><div className="package-row"><small>建议受众</small><b>美国 · 25–34 岁 · 重返职场妈妈</b><button>修改</button></div><div className="package-row"><small>预算建议</small><b>¥8,000 / 7 天探索期</b><button>修改</button></div><div className="package-proof"><ShieldCheck size={15}/><p>授权覆盖 {sourceType==='合作事项'?'2 / 3':'当前已选对象'}；推送前系统会再次校验音乐、肖像和平台白名单。</p></div><button className="push-ad" disabled={!selected.length} onClick={()=>showToast(`已将 ${selected.length} 个${sourceType}推送至广告端草稿，等待人工确认`)}><Send size={16}/>一键推送广告端</button><button className="back-coop" onClick={()=>setActive('cooperations')}>返回合作管理</button></aside></div>
  </section>
}

function Influencer360Drawer({creator,onClose,showToast,setEvidence}) {
  const [tab,setTab]=useState('总览')
  const tabs=['总览','账号与受众','合作关系','内容资产','交易归因','品牌 VOC','风险与策略']
  const domainRows={
    '账号与受众':[['真实受众占比',creator.audience,'高于同量级 8.4pp'],['核心年龄','25–34 岁 · 63%','与 M5 人群高度重合'],['核心地区','美国加州 / 德州 / 纽约','一二线城市占 72%'],['互动真实性','96 / 100','异常互动占比 1.8%']],
    '合作关系':[['关系阶段',creator.relation,'近 12 个月合作 6 次'],['平均报价','¥3,200 / 条','较首次合作 +18%'],['履约健康','94 / 100','准时交付率 96%'],['授权偏好','90 天付费投流','可谈框架授权']],
    '内容资产':[['累计内容资产',`${creator.contents} 条`,'9 条可复用 · 6 条已投流'],['最高表现','职场背奶的一天','播放高于账号基线 2.8x'],['稳定内容结构','冲突开场 → 真实工作流 → 结果','跨内容复现 4 次'],['素材生命周期','平均 76 天','当前 3 条处于上升期']],
    '交易归因':[['直接 GMV',creator.gmv,'专属链接 / 折扣码'],['综合 ROI',`${creator.roi}x`,'高于品类中位数 32%'],['辅助渠道贡献','¥386K','Amazon 与独立站'],['高贡献路径','内容 → 品牌搜索 → Amazon','强证据 · 1,286 次']],
    '品牌 VOC':[['品牌提及','8,426 次','正向 86%'],['心智净值','92 / 100','较合作前 +14'],['核心记忆','静音 · 职场可用 · 便携','主动提及增长 2.1x'],['待解决疑虑','清洗零件较多','建议增加教程内容']],
    '风险与策略':[['品牌安全','低风险','近 12 个月无争议'],['受众异常','低风险','增长曲线稳定'],['授权缺口',creator.safety,'3 条素材需续签'],['建议策略',creator.strategy,'预计下一轮 ROI 7.8x']],
  }
  return <div className="profile360-backdrop" onClick={onClose}><aside className="profile360" onClick={e=>e.stopPropagation()}>
    <header className="profile360-head"><div className="profile-identity"><span style={{background:creator.color}}>{creator.initials}</span><div><h2>{creator.name}<BadgeCheck size={16}/></h2><p>{creator.platform} · {creator.market} · {creator.category}</p></div></div><div className="profile-score-big"><b>{creator.score}</b><small>综合价值</small></div><button aria-label="关闭画像" onClick={onClose}><X size={19}/></button><div className="profile-tags"><span>{creator.tier}</span><span>已认证</span><span>{creator.relation}关系</span><span>{creator.lifecycle}</span>{creator.roles.map(x=><span key={x}>{x}</span>)}</div></header>
    <nav className="profile360-tabs">{tabs.map(x=><button key={x} className={tab===x?'active':''} onClick={()=>setTab(x)}>{x}</button>)}</nav>
    <div className="profile360-body">
      {tab==='总览'?<>
        <div className="profile-kpis">{[['任务匹配',`${creator.score}%`],['受众质量',creator.audience],['内容资产',`${creator.contents} 条`],['累计播放',creator.plays],['GMV',creator.gmv],['推广花费',creator.spend],['ROI',`${creator.roi}x`],['品牌影响',creator.brand]].map(x=><div key={x[0]}><b>{x[1]}</b><small>{x[0]}</small></div>)}</div>
        <div className="profile360-grid"><article className="profile-radar-panel"><div className="profile-section-title"><div><h3>八维能力雷达</h3><p>能力分不等于任务匹配分</p></div><button onClick={()=>setEvidence({name:`${creator.name} · 八维能力`,score:creator.score,reason:'综合账号、受众、内容、合作、交易和品牌 VOC 证据形成。',risk:creator.safety})}><ShieldCheck size={13}/> 38 条证据</button></div><CreatorRadar creator={creator}/></article>
          <article className="profile-ledger"><div className="profile-section-title"><div><h3>关键资产账本</h3><p>每个判断都保留来源与更新时间</p></div></div>{[['账号资产','真实受众 92% · 互动质量 96','平台授权数据','高'],['合作资产','6 次合作 · 履约健康 94','企业合作记录','高'],['内容资产','9 条可复用 · 3 条上升期','内容表现与授权','高'],['交易资产','ROI 7.4x · 辅助贡献 ¥38.6万','UTM / Amazon','中'],['品牌 VOC','“静音”主动提及 +110%','8,426 条评论','中']].map(x=><button key={x[0]} onClick={()=>showToast(`已展开${x[0]}证据`)}><span><i></i><b>{x[0]}<small>{x[1]}</small></b></span><em>{x[2]}</em><strong>{x[3]}证据</strong><ChevronRight size={13}/></button>)}</article></div>
        <div className="profile-strategy"><Sparkles size={19}/><div><small>STARAGENT 经营建议</small><h3>{creator.strategy}</h3><p>该红人的场景传播、受众质量和合作稳定性均进入核心区，建议用年度框架锁定排期，同时将高表现自然内容授权至 Meta 与 Amazon 场景。</p></div><button onClick={()=>showToast(`已为 ${creator.name} 创建经营动作`)}>创建经营动作</button></div>
      </>:<div className="profile-domain-view"><div className="domain-hero"><span>{tab}</span><h3>{creator.name} 的{tab}画像</h3><p>指标、事实、证据和建议在同一层级展示，避免只看单一评分。</p></div><div className="domain-cards">{domainRows[tab].map((x,i)=><article key={x[0]}><small>{x[0]}</small><b>{x[1]}</b><p>{x[2]}</p><button onClick={()=>showToast(`已打开${x[0]}明细`)}>查看明细 <ArrowRight size={13}/></button></article>)}</div><div className="domain-history panel"><div className="profile-section-title"><div><h3>近 90 天趋势与记录</h3><p>指标变化、关键事件和人工判断</p></div><button><Download size={13}/>导出</button></div><div className="mini-trend">{[48,55,52,64,61,72,76,82,79,88,91,94].map((h,i)=><i key={i} style={{height:`${h}%`}}></i>)}</div><div className="domain-note"><Info size={15}/><p>最近一次显著变化发生在 M5 职场背奶内容上线后：有效评论率、品牌词提及和 Amazon 辅助访问同步上升。</p></div></div></div>}
    </div>
  </aside></div>
}

function CreatorRadar({creator}) {
  return <div className="creator-radar"><svg viewBox="0 0 360 270" role="img" aria-label={`${creator.name}八维能力雷达`}><g className="radar-grid"><polygon points="180,35 274,75 315,135 274,205 180,238 86,205 45,135 86,75"/><polygon points="180,70 250,97 278,135 250,180 180,202 110,180 82,135 110,97"/><polygon points="180,104 224,116 241,135 224,157 180,167 136,157 119,135 136,116"/><path d="M180 35V238M45 135H315M86 75L274 205M274 75L86 205"/></g><polygon className="radar-shape" points={`180,${42+(100-creator.brand)*.5} ${265-(100-Number(creator.audience.replace('%','')))*.6},78 300,135 268,198 180,225 94,198 57,135 96,82`}/><g className="radar-points">{[[180,50],[260,82],[296,135],[263,195],[180,221],[98,195],[61,135],[100,84]].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="3"/>)}</g><g className="radar-labels"><text x="180" y="20">品牌影响 {creator.brand}</text><text x="288" y="66">受众 {creator.audience}</text><text x="326" y="138">内容 {creator.material}</text><text x="284" y="225">素材 {creator.material}</text><text x="180" y="260">交易 {Math.round(Number(creator.roi)*12)}</text><text x="72" y="225">引流 {creator.cross}</text><text x="10" y="138">合作 {creator.score}</text><text x="50" y="66">安全 93</text></g></svg></div>
}

function BrandPage({ setEvidence }) {
  return <section className="module-content">
    <PageHeader eyebrow="品牌影响" title="用户不只看到了内容，也开始记住品牌。" desc="结合有效触达、品牌搜索、评论语义和声量变化，观察从曝光到心智的迁移。"/>
    <div className="brand-summary"><div><small>去重有效触达</small><b>286.4万</b><span className="up">+22.4%</span></div><div><small>品牌搜索指数</small><b>138</b><span className="up">+18.1%</span></div><div><small>品类声量 SOV</small><b>16.8%</b><span className="up">+3.2pp</span></div><div><small>核心卖点记忆</small><b>42%</b><span className="up">+9.6pp</span></div></div>
    <div className="brand-layout"><article className="panel mind-journey"><div className="panel-title"><div><h3>用户心智迁移</h3><p>发布前后评论与搜索主题变化</p></div><button onClick={()=>setEvidence({name:'用户心智迁移',score:82,reason:'基于 8,426 条有效评论和品牌搜索趋势识别。',risk:'中等证据，无法完全排除同期广告影响'})}>证据中等 <ShieldCheck size={13}/></button></div>
      <div className="journey"><div><small>发布前</small><span style={{width:'88%'}}>吸奶疼痛 <b>31%</b></span><span style={{width:'72%'}}>清洗麻烦 <b>24%</b></span><span style={{width:'54%'}}>上班背奶 <b>18%</b></span></div><ArrowRight size={22}/><div><small>发布后</small><span className="after" style={{width:'94%'}}>静音吸奶 <b>34%</b></span><span className="after" style={{width:'78%'}}>职场便携 <b>27%</b></span><span className="after" style={{width:'66%'}}>Momcozy M5 <b>22%</b></span></div></div>
      <div className="mind-conclusion"><Brain size={18}/><p>用户讨论已从“品类痛点”向“品牌 + 场景 + 产品型号”迁移，说明传播不只创造曝光，也建立了选择线索。</p></div>
    </article><article className="panel search-timeline"><div className="panel-title"><div><h3>品牌搜索影响窗口</h3><p>发布日前后 21 天</p></div><span className="legend-line">品牌词搜索</span></div><div className="line-chart"><svg viewBox="0 0 500 170" preserveAspectRatio="none"><defs><linearGradient id="area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#d85b7f" stopOpacity=".28"/><stop offset="1" stopColor="#d85b7f" stopOpacity="0"/></linearGradient></defs><path d="M0 142 C70 138 95 130 145 126 C188 122 194 92 235 88 C275 82 295 34 335 42 C380 49 385 72 430 70 C462 69 476 54 500 58 L500 170 L0 170Z" fill="url(#area)"/><path d="M0 142 C70 138 95 130 145 126 C188 122 194 92 235 88 C275 82 295 34 335 42 C380 49 385 72 430 70 C462 69 476 54 500 58" fill="none" stroke="#d85b7f" strokeWidth="3"/></svg><i className="publish-line"><span>集中发布</span></i></div><div className="timeline-labels"><span>-7天</span><span>发布日</span><span>+7天</span><span>+14天</span></div></article></div>
    <div className="panel creator-impact"><div className="panel-title"><div><h3>品牌影响贡献红人</h3><p>按增量覆盖、搜索和心智信号综合排序</p></div><button>查看全部</button></div>{[['一颗小桃子','职场场景记忆','+18.6万','+24%','强'],['护士妈妈Kiki','专业信任建立','+15.2万','+19%','中'],['在逃妈妈Yuki','跨平台扩散','+12.4万','+17%','中']].map((x,i)=><div className="impact-row-list" key={x[0]}><b className="rank">0{i+1}</b><span className="person-cell"><i>{x[0][0]}</i><b>{x[0]}<small>{x[1]}</small></b></span><span><small>增量触达</small><b>{x[2]}</b></span><span><small>搜索提升</small><b>{x[3]}</b></span><em>{x[4]}证据</em><ChevronRight size={15}/></div>)}</div>
  </section>
}

function CrossChannelPage({ setEvidence }) {
  return <section className="module-content">
    <PageHeader eyebrow="跨平台引流" title="影响从社媒发生，价值在多个渠道完成。" desc="识别红人内容对独立站、Amazon、TikTok Shop 和品牌搜索的直接、辅助及增量贡献。"/>
    <div className="attribution-notice"><ShieldCheck size={17}/><p><b>本页按证据等级展示贡献，不将相关性计作确定收入。</b> 当前 64% 的渠道贡献具有确定或强归因证据。</p><button>查看归因规则</button></div>
    <div className="flow-canvas panel"><div className="panel-title"><div><h3>红人影响流向</h3><p>近 30 天 · 已去重触点</p></div><div className="flow-tabs"><button className="active">全部渠道</button><button>确定归因</button><button>辅助贡献</button></div></div>
      <div className="channel-flow"><div className="source-column"><small>内容发布平台</small>{[['Instagram','146.2万',Globe],['TikTok','98.6万',Play],['YouTube','41.8万',Film]].map(([n,v,I])=><div key={n}><I size={17}/><span>{n}<b>{v}</b></span></div>)}</div><div className="flow-lines"><i></i><i></i><i></i><span>28.4万<br/><small>有效跨渠道访问</small></span></div><div className="target-column"><small>价值承接渠道</small>{[['品牌独立站','12.6万','¥86.4万',Globe],['Amazon','9.8万','¥128.7万',ShoppingBag],['TikTok Shop','4.2万','¥52.1万',Store],['品牌搜索','1.8万','+18%',Search]].map(([n,v,m,I])=><div key={n}><I size={17}/><span>{n}<b>{v} 访问</b></span><em>{m}</em></div>)}</div></div>
    </div>
    <div className="cross-grid"><article className="panel attribution-card"><div className="panel-title"><div><h3>贡献证据构成</h3><p>渠道贡献 ¥267.2万</p></div></div>{[['确定归因','专属链接、Amazon Attribution','38%','#4e8b74'],['强归因','观看后转化、可靠路径','26%','#759e8d'],['中等归因','时间和行为信号一致','21%','#d6a275'],['观察信号','仅发现相关变化','15%','#c7b7bd']].map(x=><div className="attribution-row" key={x[0]}><span><i style={{background:x[3]}}></i><b>{x[0]}<small>{x[1]}</small></b></span><strong>{x[2]}</strong></div>)}</article>
      <article className="panel path-card"><div className="panel-title"><div><h3>典型影响路径</h3><p>按发生次数排序</p></div></div>{[['Instagram 内容','Google 品牌搜索','Amazon 下单','1,286'],['TikTok 视频','独立站产品页','站内购买','948'],['YouTube 测评','Amazon 详情页','7 日内购买','634']].map((p,i)=><div className="path-row" key={p[0]}><b>0{i+1}</b><span>{p[0]}<ArrowRight size={13}/>{p[1]}<ArrowRight size={13}/>{p[2]}</span><em>{p[3]} 次</em></div>)}<button className="evidence-button" onClick={()=>setEvidence({name:'跨平台路径证据',score:81,reason:'基于 UTM、Amazon Attribution 和聚合时间序列构建。',risk:'21% 为中等归因，不能视为确定订单贡献'})}><ShieldCheck size={14}/> 查看路径方法与限制</button></article></div>
  </section>
}

function ActionPage({ showToast, setActive }) {
  const [tab, setTab]=useState('待我处理')
  return <section className="module-content">
    <PageHeader eyebrow="动作中心 · 统一执行入口" title="从选人到结算，一处完成。" desc="把旧系统分散在列表、合作、上链、折扣和结算里的操作，按业务对象与下一动作重新组织。" action="创建动作" onAction={()=>showToast('已打开动作创建器')}/>
    <div className="quick-action-grid">
      {[
        [Target,'选红人','按产品、场景和目标智能筛选','actionInfluencers'],[UserPlus,'创建合作','从候选直接生成合作与 Brief','cooperations'],
        [Receipt,'申请结算','核对交付、授权与付款条件','settlements'],[PauseCircle,'暂停合作','保留原因、证据和后续恢复节点','cooperations'],
        [Ban,'拉黑红人','沉淀风险原因并同步推荐模型','influencers'],[Percent,'创建折扣','生成站点 / Amazon / TK Shop 规则','discounts']
      ].map(([Icon,title,desc,key])=><button className="quick-action" key={title} onClick={()=>setActive(key)}><span><Icon size={19}/></span><b>{title}</b><p>{desc}</p><ChevronRight size={15}/></button>)}
    </div>
    <div className="execution-spine panel"><small>标准执行链路</small>{['选红人','创建合作','报价 / 寄样','内容交付','UTM / 折扣追踪','费用结算','资产回写'].map((x,i)=><React.Fragment key={x}><span className={i<3?'done':''}>{i<3?<Check size={12}/>:i+1}</span><b>{x}</b>{i<6&&<i></i>}</React.Fragment>)}</div>
    <div className="action-tabs">{['待我处理','全部动作','待审批','即将逾期'].map(x=><button className={tab===x?'active':''} onClick={()=>setTab(x)} key={x}>{x}<span>{x==='待我处理'?6:x==='待审批'?3:x==='即将逾期'?2:24}</span></button>)}</div>
    <div className="action-board">{[['待确认','3','确认一颗小桃子的素材授权报价','素材放大 Agent','今天 18:00','高'],['待执行','2','补充 Amazon Attribution 链接','跨平台引流 Agent','明天 12:00','中'],['待验证','1','复核“静音”卖点广告测试结果','内容验证 Agent','7 月 19 日','中']].map((col,i)=><div className="action-column" key={col[0]}><div className="column-head"><h3>{col[0]} <span>{col[1]}</span></h3><MoreHorizontal size={16}/></div><article><div className="task-priority"><span className={col[5]==='高'?'high':'medium'}>{col[5]}优先级</span><small>{col[3]}</small></div><h4>{col[2]}</h4><p><Clock3 size={13}/>{col[4]}</p><div><span className="task-avatar">LY</span><button onClick={()=>showToast(`${col[2]} 已进入处理`)}>开始处理 <ArrowRight size={14}/></button></div></article>{i===0&&<article><div className="task-priority"><span>普通</span><small>人工创建</small></div><h4>确认 3 位候选红人的下周档期</h4><p><Clock3 size={13}/>7 月 18 日</p><div><span className="task-avatar alt">LJ</span><button onClick={()=>showToast('任务已进入处理')}>开始处理 <ArrowRight size={14}/></button></div></article>}<button className="add-task"><Plus size={14}/>添加动作</button></div>)}</div>
  </section>
}

const assetConfig = {
  cooperations:{eyebrow:'动作中心 · 合作管理',title:'合作不是一张表，而是一条可推进的执行链。',desc:'统一管理建联、报价、折扣、寄样、内容交付、UTM 追踪、授权与复投。',stats:[['进行中合作','186'],['等待我方动作','24'],['本周将到期','9'],['履约健康率','92%']],columns:['红人 / Campaign','当前阶段','下一动作','寄样','UTM 追踪','负责人'],rows:[['护士妈妈Kiki','内容生产','7/22 查看初稿','已签收','已生效','张琳'],['一颗小桃子','报价确认','今天确认报价','待寄出','待生成','李颖'],['阿Moon的日常','已发布','确认素材授权','已签收','数据回流中','陈蔚']]},
  cooperationAsset:{eyebrow:'BI 中心 · 合作资产',title:'把报价、履约和复投沉淀成判断依据。',desc:'从历史合作中提炼成本、周期、履约、授权和关系阶段，服务下一次选人。',stats:[['历史合作','4,286'],['可复投红人','384'],['平均成交周期','8.4 天'],['完整证据合作','86%']],columns:['红人 / 产品','关系阶段','历史报价','履约健康','授权偏好','经验结论'],rows:[['护士妈妈Kiki × M5','核心','¥3,200','稳定','可谈判','专业 Brief 转化更好'],['一颗小桃子 × M5','复投','¥2,800','优秀','偏长期','适合扩大职场场景'],['阿Moon的日常 × Air 1','首投','¥1,500','稳定','单次授权','真实体验素材价值高']]},
  settlements:{eyebrow:'动作中心 · 费用结算',title:'先验证交付，再让费用准确流转。',desc:'从结算申请、验收、发票、审批到付款，保留每一笔费用的合作与资产证据。',stats:[['待申请','18'],['待审批','7'],['本月应付','¥286,400'],['平均结算周期','6.2 天']],columns:['结算单 / 红人','合作与交付','申请金额','票据状态','审批节点','付款状态'],rows:[['SET-202607-018 · 一颗小桃子','M5 · 3条内容','¥8,400','已齐全','品牌负责人','待审批'],['SET-202607-017 · Nurse Emily','M5 · 1条视频','$1,200','待补税表','财务复核','待补件'],['SET-202607-012 · Yuki','Air 1 · 2条内容','¥6,800','已齐全','审批完成','7/23付款']]},
  discounts:{eyebrow:'动作中心 · 折扣码管理',title:'一个折扣码，对应一条可解释的渠道路径。',desc:'管理独立站、Amazon 与 TikTok Shop 折扣规则、归属红人、有效期和使用表现。',stats:[['有效折扣码','328'],['本月使用','4,826'],['辅助收入','¥186,420'],['异常折扣码','6']],columns:['折扣码 / 红人','渠道','优惠规则','有效期','使用 / GMV','状态'],rows:[['M5KIKI15 · 护士妈妈Kiki','独立站','15% OFF','至 8/31','826 / ¥12.4万','生效中'],['M5MAYA10 · Maya','Amazon','10% OFF','至 8/15','462 / ¥8.6万','即将到期'],['AIRYUKI20 · Yuki','TK Shop','20% OFF','至 7/31','1,286 / ¥21.8万','需复核']]},
  contents:{eyebrow:'内容资产',title:'从一条内容，看见可验证与可复用的部分。',desc:'管理 Hook、场景、卖点、评论信号、授权、二创和跨渠道生命周期。',stats:[['内容资产','2,486'],['已验证结构','48'],['可授权素材','126'],['广告迁移成功率','34.6%']],columns:['内容 / 红人','验证场景','自然表现','素材价值','授权','复用渠道'],rows:[['职场背奶的一天','一颗小桃子','高于基线 46%','92','已授权','Meta / 独立站'],['护士值夜班怎么泵奶','护士妈妈Kiki','收藏率 6.2%','88','谈判中','Amazon'],['夜间吸奶不吵醒宝宝','阿Moon的日常','评论意向高','86','待确认','TikTok Ads']]},
  products:{eyebrow:'产品与场景',title:'让产品、用户场景和内容证据彼此连接。',desc:'管理卖点、痛点、信任证据和场景验证状态，为动态匹配提供上下文。',stats:[['在营产品','28'],['已验证场景','64'],['待验证卖点','17'],['内容证据','486']],columns:['产品','市场','核心场景','验证状态','关联红人','下一测试'],rows:[['M5 可穿戴吸奶器','美国','职场背奶','可规模化','48','静音卖点'],['Air 1 超薄吸奶器','欧洲','通勤隐形','内容已验证','26','佩戴舒适'],['KleanPal 洗奶瓶机','美国','夜间清洗','VOC 已验证','19','省时证明']]},
  ads:{eyebrow:'广告与素材放大',title:'让自然内容的好表现，在更多场景继续发生。',desc:'追踪授权、二创、广告迁移、跨渠道复用和素材疲劳。',stats:[['待测试素材','24'],['正在投放','18'],['平均 ROAS','2.86'],['较品牌素材提升','+31%']],columns:['素材','自然验证','广告表现','授权期限','生命周期','建议'],rows:[['职场背奶 Hook A','高','ROAS 3.42','剩 76 天','上升期','扩大预算'],['静音对比 Hook B','中','CTR 2.8%','剩 42 天','稳定期','继续观察'],['夜间吸奶 Hook C','高','CPA -26%','剩 18 天','临界期','续签授权']]},
  voc:{eyebrow:'VOC 与用户心智',title:'用户在说什么，也在改变什么认知。',desc:'从评论、评价和客服反馈中识别需求、卖点理解、疑虑和心智迁移。',stats:[['有效反馈','18,426'],['新机会主题','12'],['高风险主题','3'],['卖点理解率','42%']],columns:['VOC 主题','趋势','关联产品','心智阶段','证据','建议动作'],rows:[['静音但有吸力','+86%','M5','卖点理解','1,286 条评论','放大表达'],['清洗零件较多','+24%','Air 1','使用疑虑','642 条评论','优化教程'],['职场背奶尴尬','-18%','M5','场景焦虑','2,104 条评论','继续教育']]},
  campaigns:{eyebrow:'Campaign 管理',title:'让目标、红人角色、内容实验和渠道承接从一开始就对齐。',desc:'计划并跟踪每一场 Campaign 的全域价值目标。',stats:[['进行中','8'],['待启动','5'],['预算执行','82%'],['本月总投入','¥42.8万']],columns:['Campaign','目标组合','进度','预算','红人','健康状态'],rows:[['M5 职场背奶心智战役','传播 / 心智 / 素材','68%','¥12.6万','24','健康'],['Air 1 通勤隐形测试','验证 / 引流','42%','¥8.4万','12','需关注'],['KleanPal 夜间清洗','教育 / 转化','86%','¥9.8万','18','健康']]},
  campaign:{eyebrow:'Campaign 复盘',title:'复盘的不只是销售，还有留下来的资产。',desc:'分开解释品牌、内容、渠道和销售贡献，并更新下一轮推荐。',stats:[['已复盘 Campaign','36'],['沉淀素材','286'],['复投红人','84'],['经验规则','42']],columns:['Campaign','品牌影响','内容资产','跨渠道贡献','直接 ROI','下轮策略'],rows:[['M5 职场背奶心智战役','92','37 条','¥18.6万','1.8','加码场景传播'],['母乳喂养周','88','24 条','¥12.4万','1.4','保留教育型红人'],['Air 1 新品首发','76','18 条','¥21.2万','2.6','扩大 Amazon 引流']]},
  consumer:{eyebrow:'BI 中心 · 消费者资产',title:'把评论和行为，沉淀成可复用的人群理解。',desc:'连接红人内容、VOC、搜索与购买路径，持续更新消费者场景、疑虑和心智状态。',stats:[['有效消费者信号','186.4万'],['可识别人群','24'],['高价值场景','18'],['心智主题','86']],columns:['消费者分群','核心场景','规模','品牌认知','主要疑虑','增长机会'],rows:[['重返职场妈妈','职场背奶','86万','上升期','静音是否影响吸力','专业教育'],['新手夜奶妈妈','夜间吸奶','42万','建立期','是否吵醒宝宝','真实体验'],['移动办公妈妈','通勤隐形','28万','认知弱','穿戴是否明显','场景放大']]},
  competitor:{eyebrow:'BI 中心 · 竞品监控',title:'看清竞品在用谁、讲什么、赢在哪里。',desc:'监控竞品红人组合、内容主题、折扣与渠道动作，识别可借鉴策略和差异化机会。',stats:[['重点竞品','12'],['本周新增内容','428'],['高热主题','18'],['策略异动','7']],columns:['竞品 / 产品','红人策略','内容主题','声量变化','渠道动作','我们的机会'],rows:[['Willow Go','专业型 + 头部','免手扶效率','+18%','Amazon折扣','强化真实职场流程'],['Elvie Stride','生活方式型','轻薄隐形','+12%','独立站捆绑','验证通勤隐形'],['Medela Freestyle','专家型','吸力与供奶','-4%','YouTube长测评','加强专业信任']]},
  data:{eyebrow:'数据与模型',title:'每一个结论，都知道自己从哪里来。',desc:'管理数据源、指标口径、同步质量、证据快照与模型版本。',stats:[['已连接数据源','12'],['今日同步事件','184.6万'],['指标口径','126'],['模型版本','8']],columns:['数据源 / 模型','类型','同步状态','新鲜度','质量等级','负责人'],rows:[['Amazon Attribution','渠道数据','正常','8 分钟前','A','数据团队'],['独立站 GA4 + Orders','事件与订单','正常','3 分钟前','A','增长团队'],['红人动态匹配 v1.3','模型','灰度中','今天 09:20','B+','AI 团队']]},
  settings:{eyebrow:'系统设置',title:'让权限、审批与品牌规则在系统中生效。',desc:'配置工作区、成员、数据权限、审批流程和 Agent 安全边界。',stats:[['工作区成员','48'],['自定义角色','6'],['待审批权限','3'],['审计保留','365 天']],columns:['设置项','当前配置','生效范围','最近更新','负责人','状态'],rows:[['红人邀约审批','二级确认','全部市场','今天 10:18','李颖','已启用'],['高额预算审批','≥ ¥50,000','全部 Campaign','7 月 15 日','品牌负责人','已启用'],['敏感数据脱敏','联系方式 / 订单','外部模型','7 月 14 日','数据团队','已启用']]},
}

function AssetPage({ type, showToast, setActive }) {
  const c=assetConfig[type] || assetConfig.contents
  const actionLabel={cooperations:'新建合作',settlements:'申请结算',discounts:'创建折扣',contents:'上传内容',campaigns:'创建 Campaign'}[type] || '创建'
  return <section className="module-content"><PageHeader eyebrow={c.eyebrow} title={c.title} desc={c.desc} action={actionLabel} onAction={()=>showToast(`${actionLabel}入口已打开`)}/>
    <div className="asset-stats">{c.stats.map((s,i)=><div key={s[0]}><small>{s[0]}</small><b>{s[1]}</b><span className={i===1?'up':''}>{i===1?'较上月 +8.4%':'数据截至今天'}</span></div>)}</div>
    {type==='cooperations'&&<div className="cooperation-stage-strip">{[
      ['01','合作准备','18','档期 · 报价 · Brief'],['02','寄样与签收','42','物流 · 签收 · 异常'],['03','内容与追踪','31','初稿 · 发布 · UTM'],['04','授权与结算','24','授权 · 验收 · 付款']
    ].map((x,i)=><button key={x[0]} className={i===2?'active':''} onClick={()=>showToast(`已筛选：${x[1]}`)}><span>{x[0]}</span><div><b>{x[1]}</b><small>{x[3]}</small></div><strong>{x[2]}</strong><ChevronRight size={14}/></button>)}</div>}
    {type==='cooperations'&&<div className="cooperation-ad-bridge panel"><div><span><Megaphone size={19}/></span><div><small>增长放大建议 · 2 项合作已达到广告测试门槛</small><b>高表现内容不必重新上传，合作授权和原始数据会一起传入广告端。</b></div></div><div className="bridge-items"><span>一颗小桃子 × M5 <em>自然播放 386万</em></span><span>阿Moon × Air 1 <em>素材价值 94</em></span></div><button onClick={()=>{showToast('已选择 2 项合作事项');setActive('ads')}}>推送到广告端 <ArrowRight size={14}/></button></div>}
    <div className="panel asset-table"><div className="asset-toolbar"><label><Search size={15}/><input placeholder="搜索名称或对象"/></label><button><Filter size={14}/>筛选</button><button>状态：全部 <ChevronDown size={13}/></button><span>显示 1–20 条</span></div><div className="generic-table-head" style={{gridTemplateColumns:`2fr repeat(${c.columns.length-1},1fr)`}}>{c.columns.map(x=><span key={x}>{x}</span>)}</div>{c.rows.map((r,i)=><button className="generic-table-row" style={{gridTemplateColumns:`2fr repeat(${r.length-1},1fr)`}} key={r[0]} onClick={()=>showToast(`已打开 ${r[0]}`)}>{r.map((x,j)=><span key={j}>{j===0?<b>{x}<small>ID · 00{i+1}</small></b>:j===1?<em className="role-pill">{x}</em>:x}</span>)}<ChevronRight size={14}/></button>)}</div>
  </section>
}

createRoot(document.getElementById('root')).render(<App />)
