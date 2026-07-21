#!/usr/bin/env python3
"""Extract final Smart Assist file versions from agent transcript JSONL."""
from __future__ import annotations

import json
import os
import re
from copy import deepcopy
from pathlib import Path
from typing import Any

TRANSCRIPT = Path(
    r"C:\Users\Admin\.cursor\projects\c-Users-Admin-Documents-FormFlow"
    r"\agent-transcripts\e4eb6e37-2161-4aed-868c-8fff5ff5591a"
    r"\e4eb6e37-2161-4aed-868c-8fff5ff5591a.jsonl"
)
OUT_DIR = Path(r"C:\Users\Admin\Documents\FormFlow\frontend\_restore_smart_assist")
FRONTEND = Path(r"C:\Users\Admin\Documents\FormFlow\frontend")

KEYWORDS = re.compile(
    r"smart-assist|AIExtraction|gemini|proxy\.conf|environments|"
    r"form-host|dynamic-form-renderer|app\.config|angular\.json|package\.json|"
    r"DocumentExtraction|GeminiLanguage|ai-extraction|language-model",
    re.I,
)

# Exclude customer profile
EXCLUDE = re.compile(r"customer[-_]?profile", re.I)

# Paths we care about (relative to frontend or absolute under FormFlow/frontend)
INTERESTING = re.compile(
    r"(?i)("
    r"features[/\\]smart-assist|"
    r"environments[/\\]|"
    r"proxy\.conf|"
    r"AIExtraction|"
    r"[Gg]emini|"
    r"form-host|"
    r"dynamic-form-renderer|"
    r"app\.config\.ts|"
    r"angular\.json|"
    r"package\.json"
    r")"
)


def normalize_path(p: str) -> str | None:
    p = p.replace("/", "\\")
    # Only frontend paths
    marker = r"\FormFlow\frontend\\"
    idx = p.lower().find("formflow\\frontend\\")
    if idx < 0:
        # maybe already relative
        if INTERESTING.search(p) and not EXCLUDE.search(p):
            return p.replace("\\", "/")
        return None
    rel = p[idx + len("formflow\\frontend\\") :]
    # fix case
    abs_start = p.lower().find("formflow\\frontend\\")
    # get from actual path after frontend\
    parts = p.split("frontend\\", 1) if "frontend\\" in p else p.split("frontend/", 1)
    if len(parts) != 2:
        parts = p.split("frontend\\", 1)
    rel = parts[-1] if "frontend" in p.lower() else p
    # Better: find FormFlow\frontend\
    m = re.search(r"FormFlow[/\\]frontend[/\\](.+)$", p, re.I)
    if not m:
        return None
    rel = m.group(1).replace("\\", "/")
    if EXCLUDE.search(rel):
        return None
    if not INTERESTING.search(rel):
        return None
    # Skip restore dir itself
    if rel.startswith("_restore_smart_assist"):
        return None
    return rel


def apply_str_replace(content: str, old: str, new: str, replace_all: bool = False) -> str | None:
    if old not in content:
        return None
    if replace_all:
        return content.replace(old, new)
    return content.replace(old, new, 1)


def walk_content(obj: Any, acc: list[dict]):
    """Collect tool_use Write/StrReplace/Delete from nested content."""
    if isinstance(obj, dict):
        if obj.get("type") == "tool_use" and obj.get("name") in (
            "Write",
            "StrReplace",
            "Delete",
            "EditNotebook",
        ):
            acc.append(obj)
        for v in obj.values():
            walk_content(v, acc)
    elif isinstance(obj, list):
        for item in obj:
            walk_content(item, acc)


def main() -> None:
    files: dict[str, str] = {}  # rel -> content
    history: dict[str, list[tuple[int, str, str]]] = {}  # rel -> [(line, op, note)]
    write_counts: dict[str, int] = {}
    strreplace_fail: list[str] = []
    line_no = 0

    with TRANSCRIPT.open("r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line_no += 1
            line = line.strip()
            if not line:
                continue
            try:
                rec = json.loads(line)
            except json.JSONDecodeError:
                continue

            tools: list[dict] = []
            msg = rec.get("message") or {}
            walk_content(msg.get("content"), tools)
            # also top-level
            walk_content(rec.get("content"), tools)

            for tool in tools:
                name = tool.get("name")
                inp = tool.get("input") or {}
                path = inp.get("path") or ""
                rel = normalize_path(path) if path else None
                if not rel:
                    continue

                history.setdefault(rel, []).append((line_no, name, ""))

                if name == "Write":
                    contents = inp.get("contents")
                    if contents is None:
                        continue
                    files[rel] = contents
                    write_counts[rel] = write_counts.get(rel, 0) + 1
                    history[rel][-1] = (line_no, "Write", f"len={len(contents)}")

                elif name == "StrReplace":
                    old = inp.get("old_string", "")
                    new = inp.get("new_string", "")
                    replace_all = bool(inp.get("replace_all", False))
                    if rel not in files:
                        # Try reading current disk version as base if exists
                        disk = FRONTEND / rel.replace("/", os.sep)
                        if disk.is_file():
                            files[rel] = disk.read_text(encoding="utf-8", errors="replace")
                        else:
                            strreplace_fail.append(
                                f"L{line_no}: StrReplace on missing base: {rel}"
                            )
                            history[rel][-1] = (line_no, "StrReplace_FAIL_NO_BASE", "")
                            continue
                    result = apply_str_replace(files[rel], old, new, replace_all)
                    if result is None:
                        strreplace_fail.append(
                            f"L{line_no}: StrReplace old_string not found: {rel}"
                        )
                        history[rel][-1] = (line_no, "StrReplace_FAIL", f"old_len={len(old)}")
                    else:
                        files[rel] = result
                        history[rel][-1] = (line_no, "StrReplace_OK", f"old_len={len(old)}")

                elif name == "Delete":
                    if rel in files:
                        del files[rel]
                    history[rel][-1] = (line_no, "Delete", "")

    # Detect deletion of smart-assist (Customer Profile cleanup) - find when Delete happened
    deleted_paths = [
        rel for rel, events in history.items() if any(e[1] == "Delete" for e in events)
    ]

    # Write recovered files
    recovered_root = OUT_DIR / "recovered"
    recovered_root.mkdir(parents=True, exist_ok=True)

    # Redact API keys
    API_KEY_RE = re.compile(
        r"(AIza[0-9A-Za-z\-_]{20,}|GEMINI_API_KEY['\"]?\s*[:=]\s*['\"][^'\"]+['\"])"
    )

    inventory = []
    for rel, content in sorted(files.items()):
        # Skip node_modules etc
        if "node_modules" in rel:
            continue
        redacted = content
        # Redact common gemini key patterns in env files
        redacted = re.sub(
            r"(geminiApiKey\s*:\s*['\"])([^'\"]+)(['\"])",
            r"\1YOUR_API_KEY_HERE\3",
            redacted,
        )
        redacted = re.sub(
            r"(apiKey\s*:\s*['\"])(AIza[^'\"]+)(['\"])",
            r"\1YOUR_API_KEY_HERE\3",
            redacted,
        )
        redacted = re.sub(
            r"(GEMINI[A-Z_]*KEY\s*[=:]\s*['\"]?)([^'\"\s,]+)(['\"]?)",
            r"\1YOUR_API_KEY_HERE\3",
            redacted,
            flags=re.I,
        )

        out_path = recovered_root / rel.replace("/", os.sep)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(redacted, encoding="utf-8", newline="\n")
        events = history.get(rel, [])
        last = events[-1] if events else None
        inventory.append(
            {
                "path": rel,
                "bytes": len(redacted.encode("utf-8")),
                "writes": write_counts.get(rel, 0),
                "ops": len(events),
                "last_op": f"L{last[0]} {last[1]}" if last else "?",
                "deleted_later": rel in deleted_paths,
            }
        )

    # Also dump history summary
    summary_path = OUT_DIR / "INVENTORY.md"
    lines = [
        "# Smart Assist Recovery Inventory",
        "",
        f"Transcript lines processed: {line_no}",
        f"Files recovered: {len(inventory)}",
        f"StrReplace failures: {len(strreplace_fail)}",
        "",
        "## Recovered files",
        "",
    ]
    for item in inventory:
        flag = " [HAD DELETE]" if item["deleted_later"] else ""
        lines.append(
            f"- `{item['path']}` — {item['bytes']} bytes, "
            f"{item['writes']} Write(s), last={item['last_op']}{flag}"
        )

    lines.extend(["", "## StrReplace failures", ""])
    for fail in strreplace_fail[-50:]:
        lines.append(f"- {fail}")

    lines.extend(["", "## Full operation history (per file)", ""])
    for rel in sorted(history.keys()):
        if "node_modules" in rel:
            continue
        lines.append(f"### `{rel}`")
        for ln, op, note in history[rel]:
            lines.append(f"- L{ln}: {op} {note}".rstrip())
        lines.append("")

    summary_path.write_text("\n".join(lines), encoding="utf-8")

    # JSON index
    (OUT_DIR / "inventory.json").write_text(
        json.dumps(
            {
                "files": inventory,
                "strreplace_failures": strreplace_fail,
                "deleted_paths": deleted_paths,
            },
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Recovered {len(inventory)} files to {recovered_root}")
    print(f"Inventory: {summary_path}")
    for item in inventory:
        print(f"  {item['path']} ({item['bytes']}b) last={item['last_op']}")
    if strreplace_fail:
        print(f"\nStrReplace failures ({len(strreplace_fail)}):")
        for f in strreplace_fail[:30]:
            print(f"  {f}")


if __name__ == "__main__":
    main()
