"""Agents API for Executive Order 10-agent configuration."""

import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException

log = logging.getLogger("directive.api.agents")
router = APIRouter()

ROOT = Path(__file__).resolve().parents[4]
AGENT_CONFIG_PATH = ROOT / "data" / "agent_config.json"


def _load_agents():
    if not AGENT_CONFIG_PATH.exists():
        return []
    try:
        payload = json.loads(AGENT_CONFIG_PATH.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return []
    if isinstance(payload, dict):
        agents = payload.get("agents", [])
        return agents if isinstance(agents, list) else []
    return []


@router.get("")
async def list_agents():
    """List all configured agents."""
    agents = []
    for agent in _load_agents():
        agents.append({
            "id": agent.get("id", ""),
            "name": agent.get("label", agent.get("id", "")),
            "role": agent.get("role", ""),
            "icon": agent.get("emoji", "🏛️"),
            "duty": agent.get("duty", ""),
            "model": agent.get("model", ""),
        })
    return {"agents": agents}


@router.get("/{agent_id}")
async def get_agent(agent_id: str):
    """Get one agent detail and SOUL preview."""
    meta = next((x for x in _load_agents() if x.get("id") == agent_id), None)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Agent '{agent_id}' not found")

    soul_path = ROOT / "agents" / agent_id / "SOUL.md"
    soul_preview = ""
    if soul_path.exists():
        soul_preview = soul_path.read_text(encoding="utf-8", errors="ignore")[:2000]

    return {
        "id": meta.get("id", agent_id),
        "name": meta.get("label", agent_id),
        "role": meta.get("role", ""),
        "icon": meta.get("emoji", "🏛️"),
        "duty": meta.get("duty", ""),
        "model": meta.get("model", ""),
        "soul_preview": soul_preview,
    }


@router.get("/{agent_id}/config")
async def get_agent_config(agent_id: str):
    """Get runtime config for one agent from data/agent_config.json."""
    config = next((x for x in _load_agents() if x.get("id") == agent_id), None)
    if not config:
        return {"agent_id": agent_id, "config": {}}
    return {"agent_id": agent_id, "config": config}
