#!/usr/bin/env python3
"""Validate graph integrity and the privacy boundary of the public projection."""

from __future__ import annotations

import json
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
PRIVATE = ROOT / "knowledge_base" / "private"
PUBLIC = ROOT / "src" / "data" / "kolKnowledgeGraph.json"


def main() -> None:
    public = json.loads(PUBLIC.read_text(encoding="utf-8"))
    nodes = {}
    for line in (PRIVATE / "nodes.jsonl").read_text(encoding="utf-8").splitlines():
        node = json.loads(line)
        nodes[node["id"]] = node

    missing_endpoints = 0
    edge_count = 0
    for line in (PRIVATE / "edges.jsonl").read_text(encoding="utf-8").splitlines():
        edge = json.loads(line)
        edge_count += 1
        missing_endpoints += int(edge["source"] not in nodes or edge["target"] not in nodes)

    public_text = json.dumps(public, ensure_ascii=False).lower()
    forbidden_values = ["buyer_email", "channel_account", "contact", "address", "@"]
    sensitive_hits = {value: public_text.count(value) for value in forbidden_values if public_text.count(value)}
    product_labels = [node["label"] for node in public["nodes"] if node["type"] == "Product"]

    result = {
        "private_nodes": len(nodes),
        "private_edges": edge_count,
        "missing_edge_endpoints": missing_endpoints,
        "public_nodes": len(public["nodes"]),
        "public_edges": len(public["edges"]),
        "sensitive_text_hits": sensitive_hits,
        "all_public_product_labels_anonymous": all(label.startswith("产品 ·") for label in product_labels),
        "public_product_nodes": len(product_labels),
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))

    if missing_endpoints:
        raise SystemExit("Knowledge graph contains dangling edges")
    if sensitive_hits:
        raise SystemExit("Public graph contains forbidden sensitive text")
    if not result["all_public_product_labels_anonymous"]:
        raise SystemExit("Public graph contains a non-anonymous product label")


if __name__ == "__main__":
    main()
