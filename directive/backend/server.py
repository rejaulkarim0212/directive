#!/usr/bin/env python3
"""
Directive US backend launcher.

This backend reuses the project-level dashboard API server so the new
`directive/frontend` can run immediately with the same endpoints.
"""

from __future__ import annotations

import runpy
import shutil
from pathlib import Path


def _bootstrap_data(root: Path) -> None:
    data_dir = root / "data"
    demo_dir = root / "docker" / "demo_data"
    if not demo_dir.exists():
        return
    data_dir.mkdir(parents=True, exist_ok=True)
    for src in demo_dir.glob("*.json"):
        dst = data_dir / src.name
        if not dst.exists():
            shutil.copy2(src, dst)


def main() -> None:
    root = Path(__file__).resolve().parents[2]
    _bootstrap_data(root)
    target = root / "dashboard" / "server.py"
    if not target.exists():
        raise FileNotFoundError(f"Backend entry not found: {target}")
    runpy.run_path(str(target), run_name="__main__")


if __name__ == "__main__":
    main()
