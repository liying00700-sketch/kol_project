#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const workspaceRoot = path.resolve(import.meta.dirname, "..");
const outputDir = path.join(
  workspaceRoot,
  "knowledge_base",
  "private",
  "research",
  "reddit",
  "momcozy",
  "2026-07-30",
);

const searchRuns = [
  {
    file: "/private/tmp/momcozy_reddit_relevance.json",
    query: "momcozy",
    sort: "relevance",
    time: "all",
    limit: 80,
  },
  {
    file: "/private/tmp/momcozy_reddit_top.json",
    query: "momcozy",
    sort: "top",
    time: "all",
    limit: 80,
  },
  {
    file: "/private/tmp/momcozy_reddit_new_year.json",
    query: "momcozy",
    sort: "new",
    time: "year",
    limit: 60,
  },
  {
    file: "/private/tmp/momcozy_reddit_breast_pump.json",
    query: "momcozy breast pump",
    sort: "relevance",
    time: "all",
    limit: 50,
  },
  {
    file: "/private/tmp/momcozy_reddit_bottle_washer.json",
    query: "momcozy bottle washer",
    sort: "relevance",
    time: "all",
    limit: 50,
  },
];

const threadDir = "/private/tmp/momcozy_reddit_threads";
const collectedAt = "2026-07-30T00:00:00+08:00";

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function compact(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function csvCell(value) {
  const text = Array.isArray(value) ? value.join("|") : String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function writeCsv(file, rows, columns) {
  const lines = [
    columns.map(csvCell).join(","),
    ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(",")),
  ];
  fs.writeFileSync(file, `${lines.join("\n")}\n`, "utf8");
}

function classifyProduct(title, body) {
  const titleValue = title.toLowerCase();
  const value = `${title}\n${body}`.toLowerCase();
  if (/(bottle washer|washer\/sterilizer|washer|sterilizer|dishwasher)/.test(titleValue)) {
    return "bottle_washer";
  }
  if (/(breast pump|wearable pump|pump|m5|m6|m9|s9|s12|v1|v2|mobile style)/.test(titleValue)) {
    return "breast_pump";
  }
  if (/(bottle washer|washer\/sterilizer|washer|sterilizer|dishwasher)/.test(value)) {
    return "bottle_washer";
  }
  if (/(breast pump|wearable pump|pump|m5|m6|m9|s9|s12|v1|v2|mobile style)/.test(value)) {
    return "breast_pump";
  }
  if (/(nursing bra|pumping bra|bra\b)/.test(value)) return "nursing_apparel";
  if (/(carrier|babywearing|wrap\b)/.test(value)) return "baby_carrier";
  if (/(monitor|camera)/.test(value)) return "baby_monitor";
  if (/(bottle warmer|warmer)/.test(value)) return "bottle_warmer";
  if (/(pregnancy pillow|pillow)/.test(value)) return "pregnancy_pillow";
  if (/(stroller)/.test(value)) return "stroller";
  return "brand_or_other";
}

function classifyDiscussion(text) {
  const value = text.toLowerCase();
  if (
    /(\bpaid\b|paying creators|\bemployees?\b|\bplanted\b|\bshills?\b|\bbots?\b|\bbogus\b|fake reviews?|\bstealth\b|\bundisclosed\b)/.test(
      value,
    )
  ) {
    return "brand_trust";
  }
  if (/(vs\.?|versus|compare|which one|which .* recommend|alternative)/.test(value)) {
    return "comparison";
  }
  if (/(worth|should i|any feedback|recommend\?|thoughts\?|which momcozy|overhyped)/.test(value)) {
    return "purchase_question";
  }
  if (/(warning|do not buy|don't buy|sucks|trash|broke|leak|problem|issue|remnants)/.test(value)) {
    return "complaint";
  }
  if (/(recommend|game changer|love|amazing|happy|worked beautifully|can't live without)/.test(value)) {
    return "recommendation";
  }
  return "experience_or_other";
}

function classifySentiment(text) {
  const value = text.toLowerCase();
  const positive = [
    "love",
    "great",
    "recommend",
    "amazing",
    "worth it",
    "game changer",
    "happy",
    "worked beautifully",
    "saved",
    "convenient",
    "good",
    "can't live without",
  ].filter((term) => value.includes(term)).length;
  const negative = [
    "hate",
    "terrible",
    "warning",
    "do not buy",
    "don't buy",
    "sucks",
    "trash",
    "broke",
    "broken",
    "leak",
    "painful",
    "problem",
    "issue",
    "regret",
    "waste",
    "scam",
    "bad",
    "stopped working",
    "remnants",
    "shill",
    "bot",
    "lie",
  ].filter((term) => value.includes(term)).length;
  if (positive > 0 && negative > 0) return "mixed";
  if (positive > 0) return "positive";
  if (negative > 0) return "negative";
  if (text.includes("?") || /^(which|should|anyone|thoughts|what|is it)/i.test(text.trim())) {
    return "inquiry";
  }
  return "neutral";
}

function countBy(rows, field) {
  return Object.fromEntries(
    [...rows.reduce((map, row) => {
      const key = row[field] || "unknown";
      map.set(key, (map.get(key) || 0) + 1);
      return map;
    }, new Map())].sort((a, b) => b[1] - a[1]),
  );
}

ensureDir(outputDir);
ensureDir(path.join(outputDir, "raw", "search_runs"));
ensureDir(path.join(outputDir, "raw", "threads"));

const postsById = new Map();
let rawSearchRows = 0;

for (const run of searchRuns) {
  const rows = readJson(run.file);
  rawSearchRows += rows.length;
  fs.copyFileSync(
    run.file,
    path.join(outputDir, "raw", "search_runs", path.basename(run.file)),
  );
  for (const row of rows) {
    const prior = postsById.get(row.id);
    const provenance = {
      query: run.query,
      sort: run.sort,
      time: run.time,
      limit: run.limit,
    };
    if (prior) {
      prior.search_provenance.push(provenance);
      continue;
    }
    postsById.set(row.id, { ...row, search_provenance: [provenance] });
  }
}

const posts = [...postsById.values()].map((row) => {
  const fullText = compact(`${row.title}\n${row.selftext}`);
  const titleHasBrand = /momcozy/i.test(row.title || "");
  const bodyHasBrand = /momcozy/i.test(row.selftext || "");
  return {
    post_id: row.id,
    title: compact(row.title),
    subreddit: row.subreddit,
    author: row.author,
    score: Number(row.score || 0),
    comment_count: Number(row.comments || 0),
    url: row.url,
    created_utc: Number(row.created_utc || 0),
    created_at: row.created_utc
      ? new Date(Number(row.created_utc) * 1000).toISOString()
      : "",
    selftext: row.selftext || "",
    outbound_url: row.url_overridden_by_dest || "",
    post_hint: row.post_hint || "",
    product_category: classifyProduct(row.title || "", row.selftext || ""),
    discussion_type: classifyDiscussion(fullText),
    sentiment_estimate: classifySentiment(fullText),
    sentiment_method: "rule_based_directional_only",
    brand_relevance: titleHasBrand ? "high" : bodyHasBrand ? "medium" : "low",
    matched_queries: [...new Set(row.search_provenance.map((item) => item.query))],
    search_provenance: row.search_provenance,
    collected_at: collectedAt,
  };
});

posts.sort((a, b) => b.comment_count - a.comment_count || b.score - a.score);

const comments = [];
const threadFiles = fs
  .readdirSync(threadDir)
  .filter((file) => file.endsWith(".json"))
  .sort();

for (const file of threadFiles) {
  const postId = path.basename(file, ".json");
  const rows = readJson(path.join(threadDir, file));
  fs.copyFileSync(
    path.join(threadDir, file),
    path.join(outputDir, "raw", "threads", file),
  );
  for (const row of rows) {
    if (row.type === "POST" || row.author === "AutoModerator") continue;
    comments.push({
      post_id: postId,
      level: row.type,
      author: row.author,
      score: Number(row.score || 0),
      text: row.text || "",
      sentiment_estimate: classifySentiment(row.text || ""),
      sentiment_method: "rule_based_directional_only",
      collected_at: collectedAt,
    });
  }
}

const relevantPosts = posts.filter((post) => post.brand_relevance !== "low");
const summary = {
  dataset: "Momcozy Reddit public discussion research",
  collected_at: collectedAt,
  source: "Reddit via Agent Reach / OpenCLI using user-controlled Chrome session",
  access_mode: "read_only",
  raw_search_rows: rawSearchRows,
  unique_posts: posts.length,
  brand_relevant_posts: relevantPosts.length,
  representative_threads_read: threadFiles.length,
  collected_comments_excluding_automoderator: comments.length,
  date_range: {
    min: posts.length ? posts.map((post) => post.created_at).filter(Boolean).sort()[0] : "",
    max: posts.length
      ? posts.map((post) => post.created_at).filter(Boolean).sort().at(-1)
      : "",
  },
  posts_by_relevance: countBy(posts, "brand_relevance"),
  relevant_posts_by_product: countBy(relevantPosts, "product_category"),
  relevant_posts_by_discussion_type: countBy(relevantPosts, "discussion_type"),
  relevant_posts_by_sentiment_estimate: countBy(relevantPosts, "sentiment_estimate"),
  comments_by_sentiment_estimate: countBy(comments, "sentiment_estimate"),
  top_subreddits: Object.entries(countBy(relevantPosts, "subreddit"))
    .slice(0, 15)
    .map(([subreddit, count]) => ({ subreddit, count })),
  top_relevant_posts: relevantPosts
    .slice()
    .sort((a, b) => b.comment_count - a.comment_count || b.score - a.score)
    .slice(0, 25)
    .map((post) => ({
      post_id: post.post_id,
      title: post.title,
      subreddit: post.subreddit,
      score: post.score,
      comment_count: post.comment_count,
      product_category: post.product_category,
      discussion_type: post.discussion_type,
      sentiment_estimate: post.sentiment_estimate,
      url: post.url,
    })),
  caveats: [
    "Reddit search ranking is not a probability sample and may omit deleted, private, or poorly indexed discussions.",
    "Search output captures posts, while comments were collected only for 12 representative high-signal threads.",
    "Sentiment labels are directional keyword rules for triage, not human-coded ground truth.",
    "Public usernames are retained only in the private research layer for source traceability.",
  ],
};

fs.writeFileSync(path.join(outputDir, "posts.json"), JSON.stringify(posts, null, 2));
fs.writeFileSync(path.join(outputDir, "comments.json"), JSON.stringify(comments, null, 2));
fs.writeFileSync(path.join(outputDir, "dataset_summary.json"), JSON.stringify(summary, null, 2));

writeCsv(path.join(outputDir, "posts.csv"), posts, [
  "post_id",
  "title",
  "subreddit",
  "author",
  "score",
  "comment_count",
  "url",
  "created_at",
  "product_category",
  "discussion_type",
  "sentiment_estimate",
  "brand_relevance",
  "matched_queries",
  "selftext",
]);

writeCsv(path.join(outputDir, "comments.csv"), comments, [
  "post_id",
  "level",
  "author",
  "score",
  "sentiment_estimate",
  "text",
]);

const readme = `# Momcozy Reddit 公开讨论数据

采集时间：${collectedAt}

## 文件

- \`raw/search_runs/\`：5 组 Reddit 搜索原始 JSON。
- \`raw/threads/\`：12 个代表帖及评论的原始 JSON。
- \`posts.json\` / \`posts.csv\`：去重后的帖子级结构化数据。
- \`comments.json\` / \`comments.csv\`：代表帖评论数据，已排除 AutoModerator。
- \`dataset_summary.json\`：数据规模、主题、社区与规则情绪标签汇总。
- \`insights.md\`：人工复核后的中文洞察。

## 口径

- 来源：Reddit，经 Agent Reach / OpenCLI 使用用户明确控制的 Chrome 登录会话只读采集。
- 搜索：品牌词、多排序、近一年新帖、吸奶器和洗奶瓶机关键词。
- 去重主键：Reddit post ID。
- 情绪标签：仅用于初筛的关键词规则，不是人工标注，不应直接作为品牌净推荐值。
- 隐私：该目录属于 \`knowledge_base/private\`，保留公开用户名仅用于来源追溯，不进入公开前端图谱。
`;

fs.writeFileSync(path.join(outputDir, "README.md"), readme);
console.log(JSON.stringify(summary, null, 2));
