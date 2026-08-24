import assert from 'node:assert/strict'

const origin = process.env.STARLINK_ORIGIN || 'http://127.0.0.1:5182'
const comments = [
  ['c-01','两场会议之间真的能安静背奶吗？想知道办公室声音有多大',42,8],
  ['c-02','我最关心贴合和漏奶，之前用别的型号走路会漏',35,6],
  ['c-03','护士妈妈讲得很清楚，但静音不能只靠口播，要做环境对比',88,12],
  ['c-04','已经买了 M5，通勤确实方便，不过第一次穿戴要调整位置',67,9],
  ['c-05','完全无感这个说法太绝对了吧，每个人体验应该不一样',51,7],
  ['c-06','请问大胸围适合吗？想比较 M5 和 Air 1 的贴合度',29,5],
  ['c-07','职场背奶的真实流程很有共鸣，比单纯讲参数更想收藏',73,4],
  ['c-08','我用起来声音可以接受，但在特别安静的会议室还是能听到',64,11],
  ['c-09','在哪里买，最近有折扣吗？准备下周上班前入手',48,3],
  ['c-10','希望下一条讲清楚清洗时间和每天带哪些配件',31,2],
  ['c-11','广告感有点强，最好保留真实失败和调整过程',57,10],
  ['c-12','我反而觉得专业解释太多，前 3 秒那个会议冲突最抓人',46,6],
].map(([comment_id,comment_text,like_count,reply_count])=>({comment_id,comment_text,like_count,reply_count}))

const response = await fetch(`${origin}/api/comment-analysis`,{
  method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
    url:'https://www.tiktok.com/@momcozy/video/1234567890',comments,
    source:{content_id:'1234567890',creator_name:'Momcozy Creator',caption:'两场会议之间的职场背奶挑战',view_count:182000,like_count:12600,comment_count:12},
    crawl:{crawl_run_id:'starlink-smoke-001',page_count:1,has_more:false,sort_mode:'controlled_fixture',captured_top_level_count:12,captured_reply_count:0,comment_id_provenance:'platform_native',captured_at:new Date().toISOString()},
  }),
})

const payload = await response.json()
assert.equal(response.status,200,JSON.stringify(payload))
assert.equal(payload.ok,true)
assert.equal(payload.report.dataQuality.validCommentCount,12)
assert.equal(payload.report.skillOrchestration.stages.length,8)
assert.ok(payload.report.evidence.some(item=>item.commentId==='c-05'))
assert.ok(payload.report.chapters.executiveSummary.riskAlerts.evidenceIds.length>0)
console.log(JSON.stringify({
  status:'passed',analysisId:payload.report.analysisId,
  validComments:payload.report.dataQuality.validCommentCount,
  reportLevel:payload.report.dataQuality.reportLevel,
  skillStages:payload.report.skillOrchestration.stages.length,
  review:payload.report.review.status,
  evidence:payload.report.evidence.length,
}))
