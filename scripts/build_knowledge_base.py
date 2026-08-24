#!/usr/bin/env python3
"""Build a privacy-safe KOL knowledge graph from the 15 warehouse exports.

The script deliberately separates two products:
1. knowledge_base/private/: detailed, sanitized graph assets for internal use only.
2. src/data/kolKnowledgeGraph.json: compact, anonymized projection for the public demo.

No email, contact, address, buyer email, account handle, owner name, or raw business
identifier is written to either output.
"""

from __future__ import annotations

import hashlib
import json
import math
import os
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable

import numpy as np
import pandas as pd


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = Path(os.environ.get("KOL_SOURCE_DIR", "/Users/liying/Downloads"))
PRIVATE_DIR = ROOT / "knowledge_base" / "private"
PUBLIC_GRAPH = ROOT / "src" / "data" / "kolKnowledgeGraph.json"

FILES = {
    "kol_tags": ["ads_mkt_kol_tag_df.csv"],
    "video_product_perf": ["ads_mkt_kol_video_content_product_line_perf_df.csv"],
    "creator_master": ["dim_mkt_kol_user_info_df.csv"],
    "product_master": ["dim_pd_spu_info_df.csv"],
    "sales_orders": [f"dwb_mkt_kol_sales_order_detail_df_0{i}.csv" for i in range(1, 8)],
    "content": ["dwd_mkt_kol_content_df.csv"],
    "project_cost": ["dwd_mkt_kol_project_cost_df.csv"],
    "sample_orders": ["dwb_mkt_kol_sample_order_item_df_01_03.csv", "dwb_mkt_kol_sample_order_item_df_03_07.csv"],
}

SENSITIVE_COLUMNS = {
    "email", "contact", "address", "buyer_email", "channel_account", "username",
    "user_name", "creator_name", "owner", "creator", "avatar", "remark", "extra_info",
}

TYPE_META = {
    "KnowledgeBase": ("知识基座", "#F5DDE5"),
    "Creator": ("红人", "#EC789A"),
    "Content": ("内容", "#F0A37E"),
    "Project": ("合作事项", "#B89AD8"),
    "Product": ("产品", "#76B9AC"),
    "ProductLine": ("产品线", "#8AA6D9"),
    "Category": ("品类", "#C7A667"),
    "Country": ("国家", "#7EA9CF"),
    "Channel": ("平台", "#A28CC7"),
    "Brand": ("品牌", "#D8838F"),
    "Tag": ("能力标签", "#DBB270"),
}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def clean(value: Any) -> str | None:
    if value is None or (isinstance(value, float) and math.isnan(value)):
        return None
    text = str(value).strip()
    if not text or text.lower() in {"nan", "none", "null", "nat"}:
        return None
    return text


def hid(kind: str, value: Any) -> str | None:
    value = clean(value)
    if not value:
        return None
    digest = hashlib.sha256(f"starlink-kb-v1|{kind}|{value}".encode("utf-8")).hexdigest()[:14]
    return f"{kind.lower()}_{digest}"


def creator_label(user_code: Any) -> str:
    digest = hid("creator", user_code) or "creator_unknown"
    return f"红人球 · {digest[-4:].upper()}"


def project_label(project_code: Any) -> str:
    digest = hid("project", project_code) or "project_unknown"
    return f"合作事项 · {digest[-4:].upper()}"


def content_label(content_key: Any) -> str:
    digest = hid("content", content_key) or "content_unknown"
    return f"内容证据 · {digest[-4:].upper()}"


def num(series: pd.Series) -> pd.Series:
    if series is None:
        return pd.Series(dtype=float)
    return pd.to_numeric(series.astype(str).str.replace(",", "", regex=False).str.replace("%", "", regex=False), errors="coerce")


def read_one(filename: str) -> pd.DataFrame:
    path = SOURCE_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Missing source file: {path}")
    frame = pd.read_csv(path, dtype=str, low_memory=False, encoding="utf-8-sig")
    frame["__source_file"] = filename
    return frame


def read_group(filenames: Iterable[str]) -> pd.DataFrame:
    return pd.concat([read_one(name) for name in filenames], ignore_index=True, sort=False)


def percent(value: float) -> float:
    return round(float(value) * 100, 1)


def safe_date_range(df: pd.DataFrame) -> dict[str, str | None]:
    candidates = ["data_date", "order_date", "video_release_date", "start_time", "submit_time", "update_time", "ds", "pt"]
    for column in candidates:
        if column in df.columns and df[column].notna().any():
            dates = pd.to_datetime(df[column], errors="coerce")
            if dates.notna().any():
                return {"field": column, "min": dates.min().date().isoformat(), "max": dates.max().date().isoformat()}
    return {"field": None, "min": None, "max": None}


def profile(name: str, df: pd.DataFrame) -> dict[str, Any]:
    visible_columns = [c for c in df.columns if c != "__source_file"]
    nulls = {c: round(float(df[c].isna().mean()) * 100, 1) for c in visible_columns}
    high_null = sorted(nulls.items(), key=lambda item: item[1], reverse=True)[:8]
    return {
        "name": name,
        "source_files": sorted(df["__source_file"].dropna().unique().tolist()),
        "rows": int(len(df)),
        "columns": len(visible_columns),
        "duplicate_row_rate": round(float(df[visible_columns].duplicated().mean()) * 100, 2),
        "sensitive_columns_excluded": sorted([c for c in visible_columns if c in SENSITIVE_COLUMNS]),
        "highest_null_columns": [{"column": c, "null_pct": v} for c, v in high_null],
        "date_range": safe_date_range(df),
    }


def nonempty_set(series: pd.Series) -> set[str]:
    return {x for x in (clean(v) for v in series.tolist()) if x}


def match_rate(left: pd.Series, right: pd.Series) -> float:
    left_values = left.map(clean)
    right_set = nonempty_set(right)
    eligible = left_values.notna()
    if not eligible.any():
        return 0.0
    return percent(left_values[eligible].isin(right_set).mean())


def score_bucket(value: Any, series: pd.Series) -> str:
    numeric = pd.to_numeric(pd.Series([value]), errors="coerce").iloc[0]
    benchmark = num(series).dropna()
    if pd.isna(numeric) or benchmark.empty:
        return "证据待补充"
    rank = float((benchmark <= numeric).mean())
    if rank >= 0.9:
        return "同层级 P90+"
    if rank >= 0.75:
        return "同层级 P75+"
    if rank >= 0.5:
        return "同层级中位以上"
    return "仍需验证"


def build() -> None:
    PRIVATE_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_GRAPH.parent.mkdir(parents=True, exist_ok=True)

    frames = {name: read_group(files) for name, files in FILES.items()}
    users = frames["creator_master"].copy()
    tags = frames["kol_tags"].copy()
    content = frames["content"].copy()
    costs = frames["project_cost"].copy()
    products = frames["product_master"].copy()
    perf = frames["video_product_perf"].copy()
    sales_raw = frames["sales_orders"].copy()
    samples_raw = frames["sample_orders"].copy()

    # Grain normalization. Keep the newest master record and remove cross-file overlap.
    users = users.sort_values([c for c in ["update_time", "pt"] if c in users.columns]).drop_duplicates("user_code", keep="last")
    tags = tags.sort_values([c for c in ["ds"] if c in tags.columns]).drop_duplicates("user_code", keep="last")
    products = products.sort_values([c for c in ["update_time", "pt"] if c in products.columns]).drop_duplicates("spu_code", keep="last")
    content_key = content["md5_url"].fillna(content["video_url"])
    content["__content_key"] = content_key
    content = content.drop_duplicates("__content_key", keep="last")
    perf = perf.drop_duplicates(["video_url", "product_line_name", "country_code", "channel_code"], keep="last")

    sales_key = [c for c in ["order_id", "sku_code", "user_code", "project_code", "spu_code", "sales_amount", "sales_qty"] if c in sales_raw.columns]
    sales = sales_raw.drop_duplicates(sales_key, keep="last") if sales_key else sales_raw.copy()
    sample_key = "id" if "id" in samples_raw.columns else "order_code"
    samples = samples_raw.drop_duplicates(sample_key, keep="last")

    source_profiles = [profile(name, frame) for name, frame in frames.items()]
    data_quality = {
        "tag_to_creator": match_rate(tags["user_code"], users["user_code"]),
        "content_to_creator": match_rate(content["user_code"], users["user_code"]),
        "cost_to_creator": match_rate(costs["user_code"], users["user_code"]),
        "sales_to_creator": match_rate(sales["user_code"], users["user_code"]),
        "sales_to_product": match_rate(sales["spu_code"], products["spu_code"]),
        "sample_to_product": match_rate(samples["spu_code"], products["spu_code"]),
        "video_perf_to_content": match_rate(perf["video_url"], content["video_url"]),
    }

    nodes: dict[str, dict[str, Any]] = {}
    edges: list[dict[str, Any]] = []
    edge_seen: set[str] = set()

    def add_node(node_id: str | None, node_type: str, label: str | None, **props: Any) -> None:
        if not node_id:
            return
        label = clean(label) or TYPE_META.get(node_type, (node_type, "#C9B8C0"))[0]
        safe_props = {k: v for k, v in props.items() if v is not None and k not in SENSITIVE_COLUMNS}
        if node_id in nodes:
            nodes[node_id]["properties"].update(safe_props)
            return
        nodes[node_id] = {"id": node_id, "type": node_type, "label": label, "properties": safe_props}

    def add_edge(source: str | None, relation: str, target: str | None, source_table: str, confidence: float = 1.0, **props: Any) -> None:
        if not source or not target or source == target:
            return
        context = json.dumps(props, ensure_ascii=False, sort_keys=True, default=str)
        key = hashlib.sha256(f"{source}|{relation}|{target}|{source_table}|{context}".encode()).hexdigest()
        if key in edge_seen:
            return
        edge_seen.add(key)
        edges.append({
            "id": f"rel_{key[:14]}", "source": source, "target": target, "relation": relation,
            "provenance": {"source_table": source_table, "confidence": round(float(confidence), 3)},
            "properties": {k: v for k, v in props.items() if v is not None},
        })

    add_node("kb_starlink", "KnowledgeBase", "星链红人知识基座", version="1.0", source_tables=15)

    # Creator, location and account-domain knowledge.
    for row in users.to_dict("records"):
        cid = hid("creator", row.get("user_code"))
        if not cid:
            continue
        add_node(cid, "Creator", creator_label(row.get("user_code")),
                 fans_num=float(pd.to_numeric(row.get("fans_num"), errors="coerce")) if pd.notna(pd.to_numeric(row.get("fans_num"), errors="coerce")) else None,
                 fans_level=clean(row.get("fans_level")), status=clean(row.get("status")), frozen=clean(row.get("frozen")),
                 data_as_of=clean(row.get("ds")) or clean(row.get("pt")))
        country = clean(row.get("country_code")) or clean(row.get("country_name"))
        if country:
            country_id = hid("country", country)
            add_node(country_id, "Country", clean(row.get("country_name")) or country)
            add_edge(cid, "LOCATED_IN", country_id, "dim_mkt_kol_user_info_df")

    tag_fields = ["fan_level", "coop_status", "lifecycle_status", "kol_type", "potential_level", "kol_grade", "is_silent_kol"]
    for row in tags.to_dict("records"):
        cid = hid("creator", row.get("user_code"))
        if not cid:
            continue
        if cid not in nodes:
            add_node(cid, "Creator", creator_label(row.get("user_code")))
        for field in tag_fields:
            value = clean(row.get(field))
            if value:
                tid = hid("tag", f"{field}:{value}")
                add_node(tid, "Tag", value, dimension=field)
                add_edge(cid, "HAS_TAG", tid, "ads_mkt_kol_tag_df", rule=field)
        nodes[cid]["properties"].update({
            "content_score": float(pd.to_numeric(row.get("content_score"), errors="coerce")) if pd.notna(pd.to_numeric(row.get("content_score"), errors="coerce")) else None,
            "sales_score": float(pd.to_numeric(row.get("sales_score"), errors="coerce")) if pd.notna(pd.to_numeric(row.get("sales_score"), errors="coerce")) else None,
            "roi": float(pd.to_numeric(row.get("roi"), errors="coerce")) if pd.notna(pd.to_numeric(row.get("roi"), errors="coerce")) else None,
            "evidence_count": int(pd.to_numeric(row.get("coop_count"), errors="coerce")) if pd.notna(pd.to_numeric(row.get("coop_count"), errors="coerce")) else 0,
        })

    # Products, product lines, categories and brands.
    for row in products.to_dict("records"):
        pid = hid("product", row.get("spu_code"))
        if not pid:
            continue
        product_label = clean(row.get("spu_name_en")) or clean(row.get("spu_name")) or f"产品 · {pid[-4:].upper()}"
        add_node(pid, "Product", product_label,
                 product_line=clean(row.get("product_line_name")), gtm=clean(row.get("gtm_name")),
                 selling_point=clean(row.get("selling_point")), scene=clean(row.get("sence_tag_name")),
                 state=clean(row.get("spu_state_desc")), is_new=clean(row.get("is_new_spu")))
        line = clean(row.get("product_line_name"))
        if line:
            line_id = hid("productline", line)
            add_node(line_id, "ProductLine", line)
            add_edge(pid, "BELONGS_TO_PRODUCT_LINE", line_id, "dim_pd_spu_info_df")
        category = clean(row.get("category_name_level1")) or clean(row.get("category_name"))
        if category:
            cat_id = hid("category", category)
            add_node(cat_id, "Category", category)
            add_edge(pid, "BELONGS_TO_CATEGORY", cat_id, "dim_pd_spu_info_df")
        brand = clean(row.get("brand_code"))
        if brand:
            brand_id = hid("brand", brand)
            add_node(brand_id, "Brand", brand)
            add_edge(pid, "OWNED_BY_BRAND", brand_id, "dim_pd_spu_info_df")

    # Collaboration projects and cost facts.
    project_cost_group = costs.assign(
        total_cost_num=num(costs.get("total_cost_usd", pd.Series(index=costs.index, dtype=str))),
        promotion_fee_num=num(costs.get("promotion_fee_usd", pd.Series(index=costs.index, dtype=str))),
        sample_fee_num=num(costs.get("sample_fee_usd", pd.Series(index=costs.index, dtype=str))),
    ).groupby("project_code", dropna=True).agg(
        total_cost_usd=("total_cost_num", "sum"), promotion_fee_usd=("promotion_fee_num", "sum"),
        sample_fee_usd=("sample_fee_num", "sum"), row_count=("project_code", "size")
    ).reset_index()
    project_cost_map = project_cost_group.set_index("project_code").to_dict("index")
    project_codes = set()
    for frame in [costs, content, sales, samples]:
        if "project_code" in frame.columns:
            project_codes |= nonempty_set(frame["project_code"])
    for code in project_codes:
        project_id = hid("project", code)
        metrics = project_cost_map.get(code, {})
        add_node(project_id, "Project", project_label(code),
                 total_cost_usd=round(float(metrics.get("total_cost_usd", 0)), 2),
                 promotion_fee_usd=round(float(metrics.get("promotion_fee_usd", 0)), 2),
                 sample_fee_usd=round(float(metrics.get("sample_fee_usd", 0)), 2))
    for row in costs.to_dict("records"):
        cid, project_id = hid("creator", row.get("user_code")), hid("project", row.get("project_code"))
        add_edge(cid, "PARTICIPATED_IN", project_id, "dwd_mkt_kol_project_cost_df", settle_status=clean(row.get("settle_status")))
        channel = clean(row.get("channel"))
        if channel:
            channel_id = hid("channel", channel)
            add_node(channel_id, "Channel", channel)
            add_edge(project_id, "EXECUTED_ON", channel_id, "dwd_mkt_kol_project_cost_df")

    # Content and direct evidence relationships.
    url_to_content: dict[str, str] = {}
    for row in content.to_dict("records"):
        key = row.get("__content_key")
        content_id = hid("content", key)
        if not content_id:
            continue
        url = clean(row.get("video_url"))
        if url:
            url_to_content[url] = content_id
        play = pd.to_numeric(row.get("play_cnt"), errors="coerce")
        interact = pd.to_numeric(row.get("interact_rate"), errors="coerce")
        add_node(content_id, "Content", content_label(key),
                 play_cnt=float(play) if pd.notna(play) else None,
                 interact_rate=float(interact) if pd.notna(interact) else None,
                 video_type=clean(row.get("video_type")), release_date=clean(row.get("video_release_date")),
                 is_hit=clean(row.get("is_hit_video")), deliver_standard=clean(row.get("is_deliver_standard")))
        creator_id = hid("creator", row.get("user_code"))
        project_id = hid("project", row.get("project_code"))
        add_edge(creator_id, "CREATED", content_id, "dwd_mkt_kol_content_df")
        add_edge(content_id, "DELIVERED_FOR", project_id, "dwd_mkt_kol_content_df")
        channel = clean(row.get("channel_code"))
        if channel:
            channel_id = hid("channel", channel)
            add_node(channel_id, "Channel", channel)
            add_edge(content_id, "PUBLISHED_ON", channel_id, "dwd_mkt_kol_content_df")
        brand = clean(row.get("brand_code"))
        if brand:
            brand_id = hid("brand", brand)
            add_node(brand_id, "Brand", brand)
            add_edge(content_id, "MENTIONS_BRAND", brand_id, "dwd_mkt_kol_content_df")

    for row in perf.to_dict("records"):
        content_id = url_to_content.get(clean(row.get("video_url")) or "")
        if not content_id:
            continue
        line = clean(row.get("product_line_name"))
        if line:
            line_id = hid("productline", line)
            add_node(line_id, "ProductLine", line)
            add_edge(content_id, "VALIDATES_PRODUCT_LINE", line_id, "ads_mkt_kol_video_content_product_line_perf_df",
                     play_cnt=float(pd.to_numeric(row.get("play_cnt"), errors="coerce")) if pd.notna(pd.to_numeric(row.get("play_cnt"), errors="coerce")) else None,
                     interact_rate=float(pd.to_numeric(row.get("interact_rate"), errors="coerce")) if pd.notna(pd.to_numeric(row.get("interact_rate"), errors="coerce")) else None)
        country = clean(row.get("country_code")) or clean(row.get("country_name"))
        if country:
            country_id = hid("country", country)
            add_node(country_id, "Country", clean(row.get("country_name")) or country)
            add_edge(content_id, "PERFORMED_IN", country_id, "ads_mkt_kol_video_content_product_line_perf_df")

    # Sample shipment facts, aggregated at project-product level by deduped item id.
    sample_num = num(samples.get("num", pd.Series(index=samples.index, dtype=str))).fillna(0)
    samples = samples.assign(__num=sample_num)
    sample_group = samples.groupby(["project_code", "spu_code"], dropna=True).agg(sample_qty=("__num", "sum"), item_count=(sample_key, "nunique")).reset_index()
    for row in sample_group.to_dict("records"):
        product_id = hid("product", row.get("spu_code"))
        if product_id and product_id not in nodes:
            add_node(product_id, "Product", f"产品 · {product_id[-4:].upper()}", master_data_status="待补齐")
        add_edge(hid("project", row.get("project_code")), "SAMPLED_PRODUCT", hid("product", row.get("spu_code")),
                 "dwb_mkt_kol_sample_order_item_df", sample_qty=round(float(row.get("sample_qty", 0)), 2), item_count=int(row.get("item_count", 0)))

    # Sales facts are aggregated; buyer-level data never leaves the source frame.
    sales = sales.assign(
        __sales=num(sales.get("hongren_sales_amount", sales.get("sales_amount", pd.Series(index=sales.index, dtype=str)))).fillna(0),
        __qty=num(sales.get("sales_qty", pd.Series(index=sales.index, dtype=str))).fillna(0),
    )
    sales_group = sales.groupby(["user_code", "project_code", "spu_code", "country_code"], dropna=False).agg(
        order_count=("order_id", "nunique"), sales_amount=("__sales", "sum"), sales_qty=("__qty", "sum")
    ).reset_index()
    for row in sales_group.to_dict("records"):
        cid, project_id, product_id = hid("creator", row.get("user_code")), hid("project", row.get("project_code")), hid("product", row.get("spu_code"))
        if cid and cid not in nodes:
            add_node(cid, "Creator", creator_label(row.get("user_code")), master_data_status="待补齐", source_domain="销售明细")
        if product_id and product_id not in nodes:
            add_node(product_id, "Product", f"产品 · {product_id[-4:].upper()}", master_data_status="待补齐", source_domain="销售明细")
        facts = {"order_count": int(row.get("order_count", 0)), "sales_amount": round(float(row.get("sales_amount", 0)), 2), "sales_qty": round(float(row.get("sales_qty", 0)), 2)}
        add_edge(cid, "DROVE_SALES_FOR", product_id, "dwb_mkt_kol_sales_order_detail_df", **facts)
        add_edge(project_id, "GENERATED_SALES_FOR", product_id, "dwb_mkt_kol_sales_order_detail_df", **facts)
        country = clean(row.get("country_code"))
        if country and project_id:
            country_id = hid("country", country)
            add_node(country_id, "Country", country)
            add_edge(project_id, "GENERATED_SALES_IN", country_id, "dwb_mkt_kol_sales_order_detail_df", order_count=facts["order_count"])

    type_counts = Counter(node["type"] for node in nodes.values())
    relation_counts = Counter(edge["relation"] for edge in edges)
    unique_orders = int(sales["order_id"].nunique(dropna=True))
    raw_rows = sum(item["rows"] for item in source_profiles)
    graph_summary = {
        "generated_at": now_iso(),
        "source_tables": sum(len(v) for v in FILES.values()),
        "source_groups": len(FILES),
        "raw_rows": int(raw_rows),
        "deduped_sales_rows": int(len(sales)),
        "unique_sales_orders": unique_orders,
        "unique_sample_items": int(samples[sample_key].nunique(dropna=True)),
        "nodes": len(nodes),
        "edges": len(edges),
        "node_types": dict(type_counts.most_common()),
        "relationship_types": dict(relation_counts.most_common()),
        "data_quality": data_quality,
        "privacy": {
            "public_graph_anonymized": True,
            "excluded_fields": sorted(SENSITIVE_COLUMNS),
            "raw_identifiers_hashed": True,
            "buyer_level_records_persisted": False,
        },
    }

    # Full sanitized internal graph.
    with (PRIVATE_DIR / "nodes.jsonl").open("w", encoding="utf-8") as handle:
        for node in nodes.values():
            handle.write(json.dumps(node, ensure_ascii=False, default=str) + "\n")
    with (PRIVATE_DIR / "edges.jsonl").open("w", encoding="utf-8") as handle:
        for edge in edges:
            handle.write(json.dumps(edge, ensure_ascii=False, default=str) + "\n")
    (PRIVATE_DIR / "data_profile.json").write_text(json.dumps({"sources": source_profiles, "quality": data_quality}, ensure_ascii=False, indent=2), encoding="utf-8")
    (PRIVATE_DIR / "summary.json").write_text(json.dumps(graph_summary, ensure_ascii=False, indent=2), encoding="utf-8")

    metric_dictionary = [
        {"code": "creator_count", "name": "红人数", "formula": "COUNT(DISTINCT user_code)", "source": "dim_mkt_kol_user_info_df", "boundary": "自然人ID去重"},
        {"code": "project_count", "name": "合作事项数", "formula": "COUNT(DISTINCT project_code)", "source": "project_cost/content/sales/sample", "boundary": "跨表项目并集"},
        {"code": "published_content", "name": "上线量", "formula": "COUNT(DISTINCT md5_url)", "source": "dwd_mkt_kol_content_df", "boundary": "已删除内容需业务确认是否排除"},
        {"code": "play_count", "name": "播放量", "formula": "SUM(play_cnt)", "source": "dwd_mkt_kol_content_df", "boundary": "按内容最新快照汇总"},
        {"code": "interaction_rate", "name": "互动率", "formula": "SUM(total_interact_cnt)/SUM(play_cnt)", "source": "dwd_mkt_kol_content_df", "boundary": "加权口径"},
        {"code": "kol_sales", "name": "红人销售额", "formula": "SUM(hongren_sales_amount)", "source": "dwb_mkt_kol_sales_order_detail_df", "boundary": "使用订单表现有归因字段"},
        {"code": "promotion_cost", "name": "推广花费", "formula": "SUM(total_cost_usd)", "source": "dwd_mkt_kol_project_cost_df", "boundary": "合作费+样品费，币种USD"},
        {"code": "roi", "name": "ROI", "formula": "红人销售额/推广花费", "source": "sales+project_cost", "boundary": "需避免项目与红人多对多重复成本"},
        {"code": "sample_delivery", "name": "发样件数", "formula": "SUM(num)", "source": "dwb_mkt_kol_sample_order_item_df", "boundary": "按item id去重"},
        {"code": "hit_video_rate", "name": "爆款率", "formula": "SUM(is_hit_video)/COUNT(content)", "source": "dwd_mkt_kol_content_df", "boundary": "爆款阈值沿用源系统定义"},
    ]
    (PRIVATE_DIR / "metric_dictionary.json").write_text(json.dumps(metric_dictionary, ensure_ascii=False, indent=2), encoding="utf-8")

    # Compact public projection: real topology, anonymized labels and percentile/bucket metrics.
    tag_lookup = tags.set_index("user_code", drop=False) if "user_code" in tags.columns else pd.DataFrame()
    tag_rank = tags.copy()
    tag_rank["__rank"] = num(tag_rank.get("content_score", pd.Series(index=tag_rank.index, dtype=str))).fillna(0) + num(tag_rank.get("sales_score", pd.Series(index=tag_rank.index, dtype=str))).fillna(0)
    selected_creator_codes = tag_rank.nlargest(18, "__rank")["user_code"].dropna().astype(str).tolist()
    selected_creator_ids = {hid("creator", code) for code in selected_creator_codes}

    creator_content = content[content["user_code"].isin(selected_creator_codes)].copy()
    creator_content["__play"] = num(creator_content.get("play_cnt", pd.Series(index=creator_content.index, dtype=str))).fillna(0)
    selected_content_rows = creator_content.nlargest(22, "__play")
    selected_content_ids = {hid("content", row.get("__content_key")) for row in selected_content_rows.to_dict("records")}

    selected_project_codes = selected_content_rows["project_code"].dropna().astype(str).drop_duplicates().head(12).tolist()
    selected_project_ids = {hid("project", code) for code in selected_project_codes}

    related_sales = sales[sales["user_code"].isin(selected_creator_codes)].copy()
    product_rank = related_sales.groupby("spu_code", dropna=True)["__sales"].sum().sort_values(ascending=False).head(12)
    selected_product_ids = {hid("product", code) for code in product_rank.index.astype(str).tolist()}

    selected_base_ids = {x for x in selected_creator_ids | selected_content_ids | selected_project_ids | selected_product_ids if x}
    neighborhood_counts = Counter()
    for edge in edges:
        if edge["source"] in selected_base_ids:
            neighborhood_counts[edge["target"]] += 1
        if edge["target"] in selected_base_ids:
            neighborhood_counts[edge["source"]] += 1
    allowed_neighbor_types = {"ProductLine", "Category", "Country", "Channel", "Brand", "Tag"}
    neighbor_ids = [nid for nid, _ in neighborhood_counts.most_common() if nid in nodes and nodes[nid]["type"] in allowed_neighbor_types][:32]
    selected_ids = selected_base_ids | set(neighbor_ids)

    public_nodes: list[dict[str, Any]] = []
    type_hubs: dict[str, str] = {}
    public_types = ["Creator", "Content", "Project", "Product", "ProductLine", "Category", "Country", "Channel", "Brand", "Tag"]
    for index, node_type in enumerate(public_types):
        hub_id = f"hub_{node_type.lower()}"
        type_hubs[node_type] = hub_id
        title, color = TYPE_META[node_type]
        public_nodes.append({
            "id": hub_id, "type": "EntityHub", "group": node_type, "label": title,
            "subtitle": f"{type_counts.get(node_type, 0):,} 个实体", "weight": 18,
            "evidence": int(type_counts.get(node_type, 0)), "confidence": 1.0, "color": color,
            "description": f"知识本体中的{title}实体集合",
        })

    play_series = num(content.get("play_cnt", pd.Series(index=content.index, dtype=str)))
    for node_id in sorted(selected_ids):
        node = nodes.get(node_id)
        if not node:
            continue
        node_type = node["type"]
        props = node.get("properties", {})
        label = node["label"]
        subtitle = TYPE_META.get(node_type, (node_type, "#C9B8C0"))[0]
        description = "由真实业务数据生成，公开页面已完成标识符脱敏。"
        evidence = int(props.get("evidence_count") or 1)
        weight = 7
        if node_type == "Creator":
            label = node["label"]
            score_parts = [props.get("content_score"), props.get("sales_score")]
            scores = [float(v) for v in score_parts if isinstance(v, (int, float))]
            subtitle = f"红人能力 · {round(sum(scores)/len(scores), 1)} / 5" if scores else "红人能力 · 待评估"
            description = f"ROI {score_bucket(props.get('roi'), tags.get('roi', pd.Series(dtype=str)))}；合作证据 {props.get('evidence_count', 0)} 条"
            evidence = max(1, int(props.get("evidence_count") or 0))
            weight = 11
        elif node_type == "Content":
            label = node["label"]
            subtitle = f"内容表现 · {score_bucket(props.get('play_cnt'), play_series)}"
            description = f"互动率 {props.get('interact_rate') if props.get('interact_rate') is not None else '待补充'}；已关联合作与平台证据"
            evidence = 3
            weight = 8
        elif node_type == "Project":
            label = node["label"]
            subtitle = "合作履约与成本节点"
            description = "连接红人、内容、发样、成本和销售结果。"
            evidence = 4
            weight = 9
        elif node_type == "Product":
            label = f"产品 · {node_id[-4:].upper()}"
            subtitle = props.get("product_line") or "产品实体"
            description = "连接产品线、品类、合作、发样和销售结果。"
            evidence = 4
            weight = 9
        elif node_type == "Tag":
            subtitle = props.get("dimension") or "能力标签"
            description = "由现有规则标签表生成，并保留标签维度来源。"
            weight = 6
        public_nodes.append({
            "id": node_id, "type": node_type, "group": node_type, "label": label,
            "subtitle": subtitle, "description": description, "weight": weight,
            "evidence": evidence, "confidence": 0.92 if node_type in {"Creator", "Content"} else 1.0,
            "color": TYPE_META.get(node_type, (node_type, "#C9B8C0"))[1],
        })

    public_node_ids = {node["id"] for node in public_nodes}
    public_edges: list[dict[str, Any]] = []
    for node in public_nodes:
        if node["type"] == "EntityHub":
            continue
        hub = type_hubs.get(node["type"])
        if hub:
            public_edges.append({"source": hub, "target": node["id"], "relation": "CONTAINS", "confidence": 1.0})
    for edge in edges:
        if edge["source"] in public_node_ids and edge["target"] in public_node_ids:
            public_edges.append({
                "source": edge["source"], "target": edge["target"], "relation": edge["relation"],
                "confidence": edge["provenance"]["confidence"], "source_table": edge["provenance"]["source_table"],
            })
    # Keep the public network readable.
    public_edges = public_edges[:260]

    public_summary = dict(graph_summary)
    public_summary["privacy"] = {
        "public_graph_anonymized": True,
        "excluded_field_count": len(SENSITIVE_COLUMNS),
        "raw_identifiers_hashed": True,
        "buyer_level_records_persisted": False,
    }
    public_source_profiles = []
    for item in source_profiles:
        public_item = {key: value for key, value in item.items() if key != "sensitive_columns_excluded"}
        public_item["highest_null_columns"] = [
            value for value in item["highest_null_columns"] if value["column"] not in SENSITIVE_COLUMNS
        ]
        public_item["sensitive_field_count"] = len(item["sensitive_columns_excluded"])
        public_source_profiles.append(public_item)
    public_payload = {
        "summary": public_summary,
        "sourceProfiles": public_source_profiles,
        "metrics": metric_dictionary,
        "nodeTypes": [
            {"type": t, "label": TYPE_META[t][0], "color": TYPE_META[t][1], "count": int(type_counts.get(t, 0))}
            for t in public_types
        ],
        "relationshipTypes": [
            {"type": name, "count": int(count)} for name, count in relation_counts.most_common(12)
        ],
        "nodes": public_nodes,
        "edges": public_edges,
        "buildSteps": [
            {"id": "01", "title": "数据审计", "detail": "识别15份导出表的字段、粒度、日期范围、重复和敏感字段。", "principle": "先确认每行代表什么，再谈关联；错误粒度会造成GMV和成本重复。"},
            {"id": "02", "title": "主键统一", "detail": "以user_code、project_code、spu_code、video_url构建跨域连接。", "principle": "统一ID是证据链成立的前提，所有公开标识符均不可逆哈希。"},
            {"id": "03", "title": "本体建模", "detail": "定义红人、内容、合作、产品、品类、平台、国家、标签等实体。", "principle": "本体约束实体和关系语义，避免把标签、指标和事实混成同一层。"},
            {"id": "04", "title": "关系生成", "detail": "从事实表生成创作、合作、发样、产品验证和销售贡献关系。", "principle": "每条边保留来源表、置信度和上下文，支持回答为什么。"},
            {"id": "05", "title": "指标语义", "detail": "把红人数、上线量、播放、销售额、成本、ROI等统一为受控口径。", "principle": "智能问数先由指标层精确计算，再由AI解释，不能让模型猜数字。"},
            {"id": "06", "title": "检索与推荐", "detail": "SQL、向量检索、图遍历和模型评分由StarAgent按问题编排。", "principle": "RAG负责找内容，Graph负责找关系，SQL负责准确，模型负责预测。"},
        ],
    }
    PUBLIC_GRAPH.write_text(json.dumps(public_payload, ensure_ascii=False, indent=2, default=str), encoding="utf-8")

    readme = f"""# 星链红人知识库 v1.0

本知识库由15份业务数据导出构建，生成时间：{graph_summary['generated_at']}。

## 构建结果

- 原始记录：{graph_summary['raw_rows']:,} 行
- 图谱节点：{graph_summary['nodes']:,} 个
- 图谱关系：{graph_summary['edges']:,} 条
- 红人实体：{type_counts.get('Creator', 0):,} 个
- 内容实体：{type_counts.get('Content', 0):,} 个
- 合作事项：{type_counts.get('Project', 0):,} 个
- 产品实体：{type_counts.get('Product', 0):,} 个
- 去重销售订单：{unique_orders:,} 单

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
"""
    (ROOT / "knowledge_base" / "README.md").write_text(readme, encoding="utf-8")
    print(json.dumps(graph_summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    build()
