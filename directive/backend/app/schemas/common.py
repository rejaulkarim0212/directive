"""
Common Schemas — 通用 Pydantic 模型
"""

from pydantic import BaseModel


class ActionResult(BaseModel):
    ok: bool
    message: str | None = None
    error: str | None = None
