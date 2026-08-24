import React, { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowRight, BarChart3, CheckCircle2, ChevronRight, Database,
  ExternalLink, FileSearch, Film, Gauge, Link2, MessageCircleMore, RefreshCw,
  Search, ShieldCheck, Sparkles, Target, X,
} from 'lucide-react'

const stageLabels = {completed:'已完成',limited:'有边界',human_review:'待复核'}
const confidenceLabels = {high:'高可信',medium:'中可信',low:'待验证'}
const platformLabels = {xiaohongshu:'小红书',rednote:'RedNote',tiktok:'TikTok',youtube:'YouTube',instagram:'Instagram',facebook:'Facebook',bilibili:'B站',twitter:'X / Twitter',reddit:'Reddit',weibo:'微博',douyin:'抖音',kuaishou:'快手',wechat_channels:'视频号',unknown:'其他平台'}

function compact(value) {
  if (value == null) return '—'
  return new Intl.NumberFormat('zh-CN',{notation:'compact',maximumFractionDigits:1}).format(value)
}

function reportLevel(level) {
  if (level === 'formal') return '正式报告'
  if (level === 'directional') return '方向性报告'
  return '样本不足'
}

function EvidenceChip({id,report,onOpen}) {
  const comment = report.evidence.find(item=>item.commentId===id)
  if (!comment) return null
  return <button className="ci-evidence-chip" onClick={()=>onOpen(comment)}>#{String(id).slice(-8)} · {comment.interactionCount} 互动</button>
}

function ConclusionCard({item,report,onOpen}) {
  return <article className="ci-conclusion-card">
    <header><span>{item.id}</span><em className={item.confidence}>{confidenceLabels[item.confidence]}</em></header>
    <h4>{item.title}</h4><p className="ci-conclusion">{item.conclusion}</p>
    <div className="ci-proof-row"><b>数据事实</b><div>{item.facts?.map(fact=><span key={fact}>{fact}</span>)}</div></div>
    <div className="ci-proof-row"><b>证据原话</b><div className="ci-evidence-list">{item.evidenceIds?.length?item.evidenceIds.map(id=><EvidenceChip key={id} id={id} report={report} onOpen={onOpen}/>):<span>当前结论不依赖单条评论。</span>}</div></div>
    {item.counterEvidenceIds?.length>0&&<div className="ci-proof-row counter"><b>反证 / 差异</b><div className="ci-evidence-list">{item.counterEvidenceIds.map(id=><EvidenceChip key={id} id={id} report={report} onOpen={onOpen}/>)}</div></div>}
    <div className="ci-proof-row interpretation"><b>业务解读</b><p>{item.interpretation}</p></div>
    <footer><ShieldCheck size={13}/><span>{item.boundary}</span></footer>
  </article>
}

function EvidenceDrawer({comment,onClose}) {
  const annotation = comment.annotation ?? {}
  return <div className="ci-drawer-backdrop" onClick={onClose}><aside className="ci-evidence-drawer" role="dialog" aria-modal="true" aria-label={`评论证据 ${comment.commentId}`} onClick={event=>event.stopPropagation()}>
    <header><div><span>RAW COMMENT EVIDENCE</span><h3>评论 #{comment.commentId}</h3></div><button onClick={onClose} aria-label="关闭评论证据"><X size={17}/></button></header>
    <blockquote>“{comment.text}”</blockquote>
    <div className="ci-evidence-metrics"><span><small>点赞</small><b>{comment.likeCount??0}</b></span><span><small>回复</small><b>{comment.replyCount??0}</b></span><span><small>综合互动</small><b>{comment.interactionCount??0}</b></span></div>
    <section><h4>机器标注</h4><dl><div><dt>注意对象</dt><dd>{annotation.targets?.join('、')||'待确认'}</dd></div><div><dt>表达行为</dt><dd>{annotation.speechActs?.join('、')||'待确认'}</dd></div><div><dt>主题</dt><dd>{annotation.topics?.join('、')||'待确认'}</dd></div><div><dt>情绪</dt><dd>{annotation.emotions?.join('、')||'待确认'}</dd></div><div><dt>决策阶段</dt><dd>{annotation.purchaseStage||'none'}</dd></div></dl></section>
    <footer>这是采集到的原始评论证据。机器判断可以复核，原话不会被改写。</footer>
  </aside></div>
}

export default function ContentInsightWorkbench({showToast}) {
  const [inputMode,setInputMode]=useState('link')
  const [url,setUrl]=useState('')
  const [rawComments,setRawComments]=useState('')
  const [status,setStatus]=useState('idle')
  const [report,setReport]=useState(null)
  const [error,setError]=useState(null)
  const [selectedEvidence,setSelectedEvidence]=useState(null)
  const [activeView,setActiveView]=useState('summary')

  const endpoint = `${String(import.meta.env.VITE_CONTENT_INSIGHT_API_URL??'').replace(/\/$/,'')}/api/comment-analysis`
  const conclusions = useMemo(()=>report?.chapters?.executiveSummary?Object.values(report.chapters.executiveSummary):[],[report])

  const analyze = async () => {
    let requestBody
    if (inputMode==='link') {
      let parsed
      try { parsed=new URL(url.trim()) } catch { setError({code:'INVALID_URL',message:'请输入完整的公开内容链接。',action:'链接需要以 http:// 或 https:// 开头。'});setStatus('error');return }
      if (!['http:','https:'].includes(parsed.protocol)) { setError({code:'INVALID_URL',message:'链接必须使用 http 或 https。'});setStatus('error');return }
      requestBody={url:parsed.toString()}
    } else {
      let rows
      try { const parsed=JSON.parse(rawComments);rows=Array.isArray(parsed)?parsed:null } catch { rows=rawComments.split(/\n+/).map(text=>text.trim()).filter(Boolean) }
      if(!rows||rows.length<3){setError({code:'INSUFFICIENT_IMPORT',message:'至少导入 3 条有效评论。',action:'支持 JSON 数组，或每行粘贴一条评论。'});setStatus('error');return}
      const comments=rows.flatMap((row,index)=>{
        if(typeof row==='string') return [{comment_id:`manual-${String(index+1).padStart(3,'0')}`,comment_text:row}]
        if(!row||typeof row!=='object') return []
        const text=String(row.comment_text??row.commentText??row.text??'').trim()
        return text?[{...row,comment_id:String(row.comment_id??row.commentId??row.id??`manual-${String(index+1).padStart(3,'0')}`),comment_text:text}]:[]
      })
      const importTime=Date.now()
      requestBody={url:`https://manual.starlink.local/import/${importTime}`,comments,source:{content_id:`manual-${importTime}`,caption:'StarLink 手动导入评论'},crawl:{crawl_run_id:`manual-${importTime}`,sort_mode:'manual_import',page_count:1,has_more:false,captured_top_level_count:comments.length,captured_reply_count:0,comment_id_provenance:'capture_generated',captured_at:new Date().toISOString()}}
    }
    setStatus('analyzing');setError(null);setReport(null)
    try {
      const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(requestBody)})
      const payload=await response.json()
      if(!payload.ok){setError(payload.error??{code:'ANALYSIS_FAILED',message:'内容洞察未能生成。'});setStatus('error');return}
      setReport(payload.report);setStatus('done');setActiveView('summary');showToast(`已基于 ${payload.report.dataQuality.validCommentCount} 条真实评论生成洞察`)
    } catch (requestError) {
      setError({code:'SERVICE_UNAVAILABLE',message:'内容洞察服务暂时无法访问。',detail:requestError instanceof Error?requestError.message:'未知网络错误',action:'确认育见内容洞察服务已启动，或配置 VITE_CONTENT_INSIGHT_API_URL。'});setStatus('error')
    }
  }

  const reset=()=>{setUrl('');setRawComments('');setStatus('idle');setReport(null);setError(null);setSelectedEvidence(null)}

  return <section className="module-content ci-workbench">
    <section className="ci-entry">
      <div className="ci-entry-icon"><Film size={23}/><i></i></div>
      <div className="ci-entry-copy"><span>CONTENT INSIGHT · YUJIAN ENGINE</span><h2>给我一个内容链接，返回可复核的真实洞察。</h2><p>读取真实评论，运行育见八技能 VOC 编排；每一条结论都能回到评论证据和采集范围。</p></div>
      <div className="ci-mode-switch" role="group" aria-label="内容洞察输入方式"><button className={inputMode==='link'?'active':''} onClick={()=>{setInputMode('link');setStatus('idle');setError(null)}}>链接采集</button><button className={inputMode==='import'?'active':''} onClick={()=>{setInputMode('import');setStatus('idle');setError(null)}}>导入评论</button></div>
      {inputMode==='link'?<div className="ci-link-box"><label><Link2 size={16}/><input aria-label="需要分析的内容链接" value={url} onChange={event=>{setUrl(event.target.value);if(status==='error'){setStatus('idle');setError(null)}}} onKeyDown={event=>{if(event.key==='Enter'&&status!=='analyzing')void analyze()}} placeholder="粘贴小红书、TikTok、YouTube、B站、微博等公开内容链接"/></label><button disabled={!url.trim()||status==='analyzing'} onClick={()=>void analyze()}>{status==='analyzing'?<><RefreshCw className="spin" size={15}/>正在读取</>:<><Sparkles size={15}/>分析真实评论</>}</button></div>:<div className="ci-import-box"><textarea aria-label="需要分析的评论数据" value={rawComments} onChange={event=>{setRawComments(event.target.value);if(status==='error'){setStatus('idle');setError(null)}}} placeholder={'每行粘贴一条真实评论，或粘贴评论 JSON 数组。\n支持 text / comment_text、comment_id、like_count、reply_count 等字段。'}/><button disabled={!rawComments.trim()||status==='analyzing'} onClick={()=>void analyze()}>{status==='analyzing'?<><RefreshCw className="spin" size={15}/>正在分析</>:<><FileSearch size={15}/>分析导入评论</>}</button></div>}
      <div className="ci-contract"><span><CheckCircle2 size={13}/>不使用演示评论替代采集结果</span><span><ShieldCheck size={13}/>结论绑定证据 ID 与反证</span><span><Gauge size={13}/>覆盖不足自动降级</span>{inputMode==='import'&&<span><Database size={13}/>手动导入会标记来源与采集边界</span>}</div>
    </section>

    {status==='idle'&&<section className="ci-empty"><div className="ci-empty-orbit"><Search size={21}/><i></i><i></i></div><h3>等待一个真实内容链接</h3><p>系统会先采集评论，再区分注意对象、主题、混合情绪、购买阶段和业务动作。</p><div>{[['01','真实采集'],['02','NLP 清洗'],['03','VOC / 舆情'],['04','证据链报告'],['05','团队路由'],['06','质量门禁']].map(item=><span key={item[0]}><b>{item[0]}</b>{item[1]}</span>)}</div></section>}

    {status==='analyzing'&&<section className="ci-progress" aria-live="polite"><header><span>8</span><div><b>正在运行育见 VOC 八技能编排</b><small>{url}</small></div><em>进行中</em></header><div>{['单帖识别','NLP 处理','情感与舆情','评论总结','优先级分析','客户决策路由','语义复核','质量门禁'].map((step,index)=><span className={index===0?'current':''} key={step}><i>{index+1}</i><b>{step}</b></span>)}</div></section>}

    {status==='error'&&error&&<section className="ci-error" role="alert"><AlertTriangle size={22}/><div><span>{error.code}</span><h3>{error.message}</h3>{error.detail&&<p>{error.detail}</p>}{error.action&&<b>{error.action}</b>}</div><button onClick={()=>void analyze()}>重新尝试</button></section>}

    {status==='done'&&report&&<>
      <section className="ci-source-card"><div className="ci-platform">{(platformLabels[report.source.platform]??'内容').slice(0,1)}</div><div><span>{platformLabels[report.source.platform]??report.source.platform} · {report.source.contentId}</span><h3>{report.source.caption||report.source.creatorName||'该内容未返回标题或 Caption'}</h3><a href={report.source.sourceUrl} target="_blank" rel="noreferrer">查看原始内容 <ExternalLink size={12}/></a></div><div className="ci-source-metrics"><span><small>播放</small><b>{compact(report.source.viewCount)}</b></span><span><small>点赞</small><b>{compact(report.source.likeCount)}</b></span><span><small>页面评论</small><b>{compact(report.source.displayedCommentCount)}</b></span></div><button onClick={reset}>分析新链接</button></section>
      <section className={`ci-quality level-${report.dataQuality.reportLevel}`}>{[['报告等级',reportLevel(report.dataQuality.reportLevel)],['有效样本',`${report.dataQuality.validCommentCount} / ${report.dataQuality.rawCommentCount}`],['采集覆盖',report.dataQuality.coverageRatio==null?'覆盖率未知':`${Math.round(report.dataQuality.coverageRatio*100)}%`],['内容语境',report.dataQuality.contextStatus==='full'?'完整':report.dataQuality.contextStatus==='partial'?'部分':'缺失'],['复核状态',report.review.status==='human_required'?'需要人工复核':'自动校验通过']].map(item=><span key={item[0]}><small>{item[0]}</small><b>{item[1]}</b></span>)}</section>

      {report.skillOrchestration&&<section className="ci-skills"><header><div><span>8-SKILL VOC ORCHESTRATOR</span><h3>八个方法模块共同完成这份报告</h3></div><em className={report.skillOrchestration.qualityGate.status}>{report.skillOrchestration.qualityGate.status==='passed'?'质量门禁通过':'需要人工复核'}</em></header><div className="ci-skill-track">{report.skillOrchestration.stages.map((stage,index)=><article key={stage.id}><span>{String(index+1).padStart(2,'0')}</span><b>{stage.label}</b><small>{stage.role}</small><em>{stageLabels[stage.status]}</em></article>)}</div></section>}

      <section className="ci-verdict"><div><Sparkles size={19}/></div><span>EXECUTIVE SUMMARY</span><h2>{report.executiveSummary}</h2><p>{report.review.analysisMethod==='llm_semantic_review'?'语义模型复核':'确定性语义基线'} · {report.review.promptVersion} · {new Date(report.generatedAt).toLocaleString('zh-CN')}</p></section>

      <nav className="ci-tabs" aria-label="内容洞察报告视图">{[['summary','执行摘要'],['topics','主题与情绪'],['evidence','原始证据']].map(tab=><button className={activeView===tab[0]?'active':''} onClick={()=>setActiveView(tab[0])} key={tab[0]}>{tab[1]}</button>)}</nav>
      {activeView==='summary'&&<div className="ci-conclusion-grid">{conclusions.map(item=><ConclusionCard key={item.id} item={item} report={report} onOpen={setSelectedEvidence}/>)}</div>}
      {activeView==='topics'&&<div className="ci-topic-layout"><section className="panel"><header><MessageCircleMore size={17}/><h3>评论主题</h3></header>{report.topics.filter(topic=>topic.id!=='other').slice(0,8).map(topic=><button key={topic.id} onClick={()=>topic.evidenceIds?.[0]&&setSelectedEvidence(report.evidence.find(item=>item.commentId===topic.evidenceIds[0]))}><span><b>{topic.name}</b><small>{topic.commentCount} 条 · {topic.primaryEmotion}</small></span><strong>{topic.ratio}%</strong><ChevronRight size={13}/></button>)}</section><section className="panel ci-decision-panel"><header><Target size={17}/><h3>产品决策信号</h3></header>{[['决策表达',report.purchaseSignals.decisionCount],['信息查证',report.purchaseSignals.informationSearchCount],['比较替换',report.purchaseSignals.comparisonCount],['行动表达',report.purchaseSignals.explicitCount],['购后体验',report.purchaseSignals.postPurchaseCount]].map(item=><div key={item[0]}><span>{item[0]}</span><b>{item[1]}</b></div>)}</section></div>}
      {activeView==='evidence'&&<section className="panel ci-evidence-library"><header><div><Database size={17}/><span><h3>全部原始评论</h3><small>点击查看完整机器标注与证据边界</small></span></div><b>{report.evidence.length} 条</b></header>{report.evidence.map(comment=><button key={comment.commentId} onClick={()=>setSelectedEvidence(comment)}><span><b>#{String(comment.commentId).slice(-8)}</b>{comment.text}</span><small>{comment.annotation?.topics?.join('、')||'待分类'}</small><strong>{comment.interactionCount}</strong></button>)}</section>}
    </>}
    {selectedEvidence&&<EvidenceDrawer comment={selectedEvidence} onClose={()=>setSelectedEvidence(null)}/>}
  </section>
}
