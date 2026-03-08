#!/usr/bin/env python3
"""Sync official statistics -> data/officials_stats.json (Executive Order 10-agent)."""

import datetime
import json
import logging
import pathlib

from file_lock import atomic_json_write

log = logging.getLogger("officials")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s", datefmt="%H:%M:%S")

BASE = pathlib.Path(__file__).resolve().parent.parent
DATA = BASE / "data"
AGENTS_ROOT = pathlib.Path.home() / ".openclaw" / "agents"
OPENCLAW_CFG = pathlib.Path.home() / ".openclaw" / "openclaw.json"

MODEL_PRICING = {
    "anthropic/claude-sonnet-4-6": {"in": 3.0, "out": 15.0, "cr": 0.30, "cw": 3.75},
    "anthropic/claude-opus-4-5": {"in": 15.0, "out": 75.0, "cr": 1.50, "cw": 18.75},
    "anthropic/claude-haiku-3-5": {"in": 0.8, "out": 4.0, "cr": 0.08, "cw": 1.0},
    "openai/gpt-4o": {"in": 2.5, "out": 10.0, "cr": 1.25, "cw": 0.0},
    "openai/gpt-4o-mini": {"in": 0.15, "out": 0.6, "cr": 0.075, "cw": 0.0},
    "google/gemini-2.0-flash": {"in": 0.075, "out": 0.3, "cr": 0.0, "cw": 0.0},
    "google/gemini-2.5-pro": {"in": 1.25, "out": 10.0, "cr": 0.0, "cw": 0.0},
}

OFFICIALS = [
    {"id": "chief_of_staff", "label": "Chief of Staff Office", "role": "Chief of Staff", "emoji": "👔", "rank": "EOP"},
    {"id": "nsc", "label": "National Security Council", "role": "NSC Director", "emoji": "📋", "rank": "EOP"},
    {"id": "senate", "label": "United States Senate", "role": "Senate Reviewer", "emoji": "🏛️", "rank": "Legislative"},
    {"id": "omb", "label": "Office of Management and Budget", "role": "OMB Director", "emoji": "💼", "rank": "EOP"},
    {"id": "treasury", "label": "Department of the Treasury", "role": "Secretary of the Treasury", "emoji": "🏦", "rank": "Cabinet"},
    {"id": "state_dept", "label": "Department of State", "role": "Secretary of State", "emoji": "🌐", "rank": "Cabinet"},
    {"id": "dod", "label": "Department of Defense", "role": "Secretary of Defense", "emoji": "🛡️", "rank": "Cabinet"},
    {"id": "doj", "label": "Department of Justice", "role": "Attorney General", "emoji": "⚖️", "rank": "Cabinet"},
    {"id": "commerce", "label": "Department of Commerce", "role": "Secretary of Commerce", "emoji": "🔧", "rank": "Cabinet"},
    {"id": "supreme_court", "label": "Supreme Court", "role": "Chief Justice", "emoji": "🧑‍⚖️", "rank": "Judicial"},
]

AGENT_DIR_ALIASES = {
    "chief_of_staff": ["chief_of_staff", "main"],
    "nsc": ["nsc"],
    "senate": ["senate", "wh_counsel"],
    "omb": ["omb", "cabinet_sec"],
    "treasury": ["treasury"],
    "state_dept": ["state_dept", "state"],
    "dod": ["dod", "defense"],
    "doj": ["doj", "justice"],
    "commerce": ["commerce"],
    "supreme_court": ["supreme_court"],
}

ORG_ALIASES = {
    "chief_of_staff": {"Chief of Staff Office"},
    "nsc": {"National Security Council"},
    "senate": {"United States Senate", "White House Counsel"},
    "omb": {"Office of Management and Budget", "Cabinet Secretariat"},
    "treasury": {"Department of the Treasury"},
    "state_dept": {"Department of State", "State Department"},
    "dod": {"Department of Defense"},
    "doj": {"Department of Justice"},
    "commerce": {"Department of Commerce"},
    "supreme_court": {"Supreme Court"},
}

_OPENCLAW_CACHE = None


def read_json(path, default):
    try:
        return json.loads(pathlib.Path(path).read_text(encoding="utf-8"))
    except Exception:
        return default


def normalize_model(model_value, fallback="anthropic/claude-sonnet-4-6"):
    if isinstance(model_value, str) and model_value:
        return model_value
    if isinstance(model_value, dict):
        return model_value.get("primary") or model_value.get("id") or fallback
    return fallback


def load_openclaw_cfg():
    global _OPENCLAW_CACHE
    if _OPENCLAW_CACHE is None:
        _OPENCLAW_CACHE = read_json(OPENCLAW_CFG, {})
    return _OPENCLAW_CACHE


def get_model(agent_id):
    cfg = load_openclaw_cfg()
    agents = cfg.get("agents", {})
    default = normalize_model(agents.get("defaults", {}).get("model", {}), "anthropic/claude-sonnet-4-6")
    by_id = {}
    for item in agents.get("list", []):
        if not isinstance(item, dict):
            continue
        raw_id = item.get("id", "")
        for alias_owner, aliases in AGENT_DIR_ALIASES.items():
            if raw_id in aliases:
                by_id.setdefault(alias_owner, normalize_model(item.get("model", default), default))
    return by_id.get(agent_id, default)


def scan_agent(agent_id):
    totals = {
        "tokens_in": 0,
        "tokens_out": 0,
        "cache_read": 0,
        "cache_write": 0,
        "sessions": 0,
        "last_active": None,
        "messages": 0,
    }
    last_dt = None

    for alias in AGENT_DIR_ALIASES.get(agent_id, [agent_id]):
        sessions_json = AGENTS_ROOT / alias / "sessions" / "sessions.json"
        if not sessions_json.exists():
            continue
        data = read_json(sessions_json, {})
        if not isinstance(data, dict):
            continue
        totals["sessions"] += len(data)
        for session in data.values():
            if not isinstance(session, dict):
                continue
            totals["tokens_in"] += session.get("inputTokens", 0) or 0
            totals["tokens_out"] += session.get("outputTokens", 0) or 0
            totals["cache_read"] += session.get("cacheRead", 0) or 0
            totals["cache_write"] += session.get("cacheWrite", 0) or 0
            ts = session.get("updatedAt")
            if not ts:
                continue
            try:
                if isinstance(ts, (int, float)):
                    dt = datetime.datetime.fromtimestamp(ts / 1000, tz=datetime.timezone.utc)
                else:
                    dt = datetime.datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
                if last_dt is None or dt > last_dt:
                    last_dt = dt
            except Exception:
                continue

        if not data:
            continue
        try:
            latest_key = max(data.keys(), key=lambda k: data[k].get("updatedAt", 0) or 0)
            session_file = data[latest_key].get("sessionFile")
        except Exception:
            session_file = None
        if session_file:
            session_path = AGENTS_ROOT / alias / "sessions" / pathlib.Path(session_file).name
            try:
                for line in session_path.read_text(encoding="utf-8", errors="ignore").splitlines():
                    try:
                        row = json.loads(line)
                    except Exception:
                        continue
                    if row.get("type") == "message" and row.get("message", {}).get("role") == "assistant":
                        totals["messages"] += 1
            except Exception:
                pass

    if last_dt:
        totals["last_active"] = last_dt.astimezone(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M")
    return totals


def calc_cost(stats, model):
    pricing = MODEL_PRICING.get(model, MODEL_PRICING["anthropic/claude-sonnet-4-6"])
    usd = (
        stats["tokens_in"] / 1e6 * pricing["in"]
        + stats["tokens_out"] / 1e6 * pricing["out"]
        + stats["cache_read"] / 1e6 * pricing["cr"]
        + stats["cache_write"] / 1e6 * pricing["cw"]
    )
    return round(usd, 4)


def normalize_state(state):
    mapping = {
        "Done": "completed",
        "Doing": "in_progress",
        "Review": "pending_review",
        "Assigned": "dispatched",
        "Blocked": "blocked",
    }
    if isinstance(state, str):
        return mapping.get(state, state)
    return state


def get_task_stats(agent_id, tasks):
    orgs = ORG_ALIASES.get(agent_id, set())
    done = 0
    active = 0
    flow_hits = 0
    participated = []
    seen_ids = set()
    for task in tasks:
        if not isinstance(task, dict):
            continue
        state = normalize_state(task.get("state"))
        org = task.get("org", "")
        if org in orgs:
            if state == "completed":
                done += 1
            elif state not in {"completed", "Cancelled"}:
                active += 1
        for flow in task.get("flow_log", []) or []:
            if flow.get("from") in orgs or flow.get("to") in orgs:
                flow_hits += 1
                task_id = task.get("id", "")
                if task_id.startswith("JJC") and task_id not in seen_ids:
                    seen_ids.add(task_id)
                    participated.append({
                        "id": task_id,
                        "title": task.get("title", ""),
                        "state": state,
                    })
                break
    return {
        "tasks_done": done,
        "tasks_active": active,
        "flow_participations": flow_hits,
        "participated_orders": participated,
    }


def get_heartbeat(agent_id, live_tasks):
    aliases = set(AGENT_DIR_ALIASES.get(agent_id, [agent_id]))
    for task in live_tasks:
        source = task.get("sourceMeta", {}) if isinstance(task, dict) else {}
        if source.get("agentId") in aliases and task.get("heartbeat"):
            return task["heartbeat"]
    return {"status": "idle", "label": "⚪ Idle", "ageSec": None}


def main():
    tasks = read_json(DATA / "tasks_source.json", [])
    live = read_json(DATA / "live_status.json", {})
    live_tasks = live.get("tasks", []) if isinstance(live, dict) else []

    rows = []
    for official in OFFICIALS:
        model = get_model(official["id"])
        stats = scan_agent(official["id"])
        task_stats = get_task_stats(official["id"], tasks)
        heartbeat = get_heartbeat(official["id"], live_tasks)
        cost_usd = calc_cost(stats, model)
        row = {
            **official,
            "model": model,
            "model_short": model.split("/")[-1] if isinstance(model, str) and "/" in model else str(model),
            "sessions": stats["sessions"],
            "tokens_in": stats["tokens_in"],
            "tokens_out": stats["tokens_out"],
            "cache_read": stats["cache_read"],
            "cache_write": stats["cache_write"],
            "tokens_total": stats["tokens_in"] + stats["tokens_out"],
            "messages": stats["messages"],
            "cost_usd": cost_usd,
            "cost_cny": round(cost_usd * 7.25, 2),
            "last_active": stats["last_active"],
            "heartbeat": heartbeat,
            "tasks_done": task_stats["tasks_done"],
            "tasks_active": task_stats["tasks_active"],
            "flow_participations": task_stats["flow_participations"],
            "participated_orders": task_stats["participated_orders"],
            "participated_edicts": task_stats["participated_orders"],
            "merit_score": task_stats["tasks_done"] * 10 + task_stats["flow_participations"] * 2 + min(stats["sessions"], 20),
        }
        rows.append(row)

    rows.sort(key=lambda x: x["merit_score"], reverse=True)
    for idx, row in enumerate(rows, start=1):
        row["merit_rank"] = idx

    totals = {
        "tokens_total": sum(row["tokens_total"] for row in rows),
        "cache_total": sum(row["cache_read"] + row["cache_write"] for row in rows),
        "cost_usd": round(sum(row["cost_usd"] for row in rows), 2),
        "cost_cny": round(sum(row["cost_cny"] for row in rows), 2),
        "tasks_done": sum(row["tasks_done"] for row in rows),
    }
    top = max(rows, key=lambda x: x["merit_score"], default={})

    payload = {
        "generatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "officials": rows,
        "totals": totals,
        "top_official": top.get("label", ""),
    }
    atomic_json_write(DATA / "officials_stats.json", payload)
    log.info("%s officials | cost=¥%s | top=%s", len(rows), totals["cost_cny"], top.get("label", ""))


if __name__ == "__main__":
    main()
