#!/usr/bin/env python3
"""
Sync ~/.openclaw/openclaw.json -> data/agent_config.json
Executive Order fixed 10-agent architecture.
"""

import datetime
import json
import logging
import pathlib

from file_lock import atomic_json_write

log = logging.getLogger("sync_agent_config")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(name)s] %(message)s", datefmt="%H:%M:%S")

BASE = pathlib.Path(__file__).resolve().parent.parent
DATA = BASE / "data"
OPENCLAW_CFG = pathlib.Path.home() / ".openclaw" / "openclaw.json"

AGENT_META = {
    "chief_of_staff": {
        "label": "Chief of Staff Office",
        "role": "Chief of Staff",
        "duty": "Triage directives and coordinate handoff",
        "emoji": "👔",
    },
    "nsc": {
        "label": "National Security Council",
        "role": "NSC Director",
        "duty": "Strategic planning and decomposition",
        "emoji": "📋",
    },
    "senate": {
        "label": "United States Senate",
        "role": "Senate Reviewer",
        "duty": "Review plans and filibuster when needed",
        "emoji": "🏛️",
    },
    "omb": {
        "label": "Office of Management and Budget",
        "role": "OMB Director",
        "duty": "Dispatch, coordination and consolidation",
        "emoji": "💼",
    },
    "treasury": {
        "label": "Department of the Treasury",
        "role": "Secretary of the Treasury",
        "duty": "Analysis, budgeting and resource modeling",
        "emoji": "🏦",
    },
    "state_dept": {
        "label": "Department of State",
        "role": "Secretary of State",
        "duty": "Documentation and external communication",
        "emoji": "🌐",
    },
    "dod": {
        "label": "Department of Defense",
        "role": "Secretary of Defense",
        "duty": "Engineering implementation and delivery",
        "emoji": "🛡️",
    },
    "doj": {
        "label": "Department of Justice",
        "role": "Attorney General",
        "duty": "Security, compliance and governance",
        "emoji": "⚖️",
    },
    "commerce": {
        "label": "Department of Commerce",
        "role": "Secretary of Commerce",
        "duty": "Infrastructure, CI/CD and operations",
        "emoji": "🔧",
    },
    "supreme_court": {
        "label": "Supreme Court",
        "role": "Chief Justice",
        "duty": "Judicial review and dispute arbitration",
        "emoji": "🧑‍⚖️",
    },
}

AGENT_ORDER = list(AGENT_META.keys())

LEGACY_ID_ALIASES = {
    "main": "chief_of_staff",
    "state": "state_dept",
    "defense": "dod",
    "justice": "doj",
}

DEFAULT_ALLOW_AGENTS = {
    "chief_of_staff": ["nsc"],
    "nsc": ["senate"],
    "senate": ["nsc", "omb"],
    "omb": ["treasury", "state_dept", "dod", "doj", "commerce", "supreme_court"],
    "treasury": ["omb", "supreme_court"],
    "state_dept": ["omb", "supreme_court"],
    "dod": ["omb", "supreme_court"],
    "doj": ["omb", "supreme_court"],
    "commerce": ["omb", "supreme_court"],
    "supreme_court": ["omb"],
}

KNOWN_MODELS = [
    {"id": "anthropic/claude-sonnet-4-6", "label": "Claude Sonnet 4.6", "provider": "Anthropic"},
    {"id": "anthropic/claude-opus-4-5", "label": "Claude Opus 4.5", "provider": "Anthropic"},
    {"id": "anthropic/claude-haiku-3-5", "label": "Claude Haiku 3.5", "provider": "Anthropic"},
    {"id": "openai/gpt-4o", "label": "GPT-4o", "provider": "OpenAI"},
    {"id": "openai/gpt-4o-mini", "label": "GPT-4o Mini", "provider": "OpenAI"},
    {"id": "openai-codex/gpt-5.3-codex", "label": "GPT-5.3 Codex", "provider": "OpenAI Codex"},
    {"id": "google/gemini-2.0-flash", "label": "Gemini 2.0 Flash", "provider": "Google"},
    {"id": "google/gemini-2.5-pro", "label": "Gemini 2.5 Pro", "provider": "Google"},
]


def normalize_model(model_value, fallback="unknown"):
    if isinstance(model_value, str) and model_value:
        return model_value
    if isinstance(model_value, dict):
        return model_value.get("primary") or model_value.get("id") or fallback
    return fallback


def normalize_agent_id(agent_id):
    if not isinstance(agent_id, str):
        return ""
    return LEGACY_ID_ALIASES.get(agent_id, agent_id)


def normalize_allow_agents(allow_agents):
    out = []
    for aid in allow_agents or []:
        normalized = normalize_agent_id(aid)
        if normalized in AGENT_META and normalized not in out:
            out.append(normalized)
    return out


def get_skills(workspace):
    skills_dir = pathlib.Path(workspace) / "skills"
    skills = []
    try:
        if skills_dir.exists():
            for item in sorted(skills_dir.iterdir()):
                if not item.is_dir():
                    continue
                md = item / "SKILL.md"
                desc = ""
                if md.exists():
                    try:
                        for line in md.read_text(encoding="utf-8", errors="ignore").splitlines():
                            line = line.strip()
                            if line and not line.startswith("#") and not line.startswith("---"):
                                desc = line[:100]
                                break
                    except Exception:
                        desc = "(read failed)"
                skills.append({"name": item.name, "path": str(md), "exists": md.exists(), "description": desc})
    except PermissionError as exc:
        log.warning("Skills directory permission denied: %s", exc)
    return skills


def default_workspace(agent_id):
    return str(pathlib.Path.home() / f".openclaw/workspace-{agent_id}")


def sync_scripts_to_workspaces():
    scripts_src = BASE / "scripts"
    if not scripts_src.is_dir():
        return
    synced = 0
    for agent_id in AGENT_ORDER:
        ws_scripts = pathlib.Path.home() / f".openclaw/workspace-{agent_id}" / "scripts"
        ws_scripts.mkdir(parents=True, exist_ok=True)
        for src_file in scripts_src.iterdir():
            if src_file.suffix not in (".py", ".sh") or src_file.stem.startswith("__"):
                continue
            dst_file = ws_scripts / src_file.name
            try:
                src_text = src_file.read_bytes()
                dst_text = dst_file.read_bytes() if dst_file.exists() else b""
            except Exception:
                continue
            if src_text != dst_text:
                dst_file.write_bytes(src_text)
                synced += 1
    if synced:
        log.info("%s script files synced to workspaces", synced)


def deploy_soul_files():
    agents_dir = BASE / "agents"
    deployed = 0
    for agent_id in AGENT_ORDER:
        src = agents_dir / agent_id / "SOUL.md"
        if not src.exists():
            continue
        content = src.read_text(encoding="utf-8", errors="ignore")
        workspace = pathlib.Path.home() / f".openclaw/workspace-{agent_id}"
        workspace.mkdir(parents=True, exist_ok=True)
        for name in ("SOUL.md", "soul.md"):
            dst = workspace / name
            existing = dst.read_text(encoding="utf-8", errors="ignore") if dst.exists() else ""
            if existing != content:
                dst.write_text(content, encoding="utf-8")
                deployed += 1
        (pathlib.Path.home() / f".openclaw/agents/{agent_id}/sessions").mkdir(parents=True, exist_ok=True)
    if deployed:
        log.info("%s SOUL files deployed", deployed)


def main():
    try:
        cfg = json.loads(OPENCLAW_CFG.read_text(encoding="utf-8"))
    except Exception as exc:
        log.warning("cannot read openclaw.json: %s", exc)
        return

    agents_cfg = cfg.get("agents", {})
    default_model = normalize_model(agents_cfg.get("defaults", {}).get("model", {}), "unknown")
    agents_list = agents_cfg.get("list", [])

    result_by_id = {}
    for item in agents_list:
        raw_id = item.get("id", "")
        agent_id = normalize_agent_id(raw_id)
        if agent_id not in AGENT_META or agent_id in result_by_id:
            continue
        meta = AGENT_META[agent_id]
        workspace = item.get("workspace", default_workspace(agent_id))
        model = normalize_model(item.get("model", default_model), default_model)
        result_by_id[agent_id] = {
            "id": agent_id,
            "label": meta["label"],
            "role": meta["role"],
            "duty": meta["duty"],
            "emoji": meta["emoji"],
            "model": model,
            "defaultModel": default_model,
            "isDefaultModel": model == default_model,
            "workspace": workspace,
            "skills": get_skills(workspace),
            "allowAgents": normalize_allow_agents(item.get("subagents", {}).get("allowAgents", [])) or DEFAULT_ALLOW_AGENTS.get(agent_id, []),
        }

    for agent_id in AGENT_ORDER:
        if agent_id in result_by_id:
            continue
        meta = AGENT_META[agent_id]
        workspace = default_workspace(agent_id)
        result_by_id[agent_id] = {
            "id": agent_id,
            "label": meta["label"],
            "role": meta["role"],
            "duty": meta["duty"],
            "emoji": meta["emoji"],
            "model": default_model,
            "defaultModel": default_model,
            "isDefaultModel": True,
            "workspace": workspace,
            "skills": get_skills(workspace),
            "allowAgents": DEFAULT_ALLOW_AGENTS.get(agent_id, []),
        }

    result = [result_by_id[agent_id] for agent_id in AGENT_ORDER]
    payload = {
        "generatedAt": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "defaultModel": default_model,
        "knownModels": KNOWN_MODELS,
        "agents": result,
    }
    DATA.mkdir(exist_ok=True)
    atomic_json_write(DATA / "agent_config.json", payload)
    log.info("%s agents synced", len(result))

    deploy_soul_files()
    sync_scripts_to_workspaces()


if __name__ == "__main__":
    main()
