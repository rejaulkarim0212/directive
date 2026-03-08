"""
Task Schemas — 任务相关的 Pydantic 模型
"""

from pydantic import BaseModel, Field


class TaskCreate(BaseModel):
    title: str
    description: str = ""
    priority: str = "normal"
    assignee_org: str | None = None
    creator: str = "president"
    tags: list[str] = []
    meta: dict | None = None


class TaskTransition(BaseModel):
    new_state: str
    agent: str = "system"
    reason: str = ""


class TaskProgress(BaseModel):
    agent: str
    content: str


class TaskTodoUpdate(BaseModel):
    todos: list[dict]


class TaskSchedulerUpdate(BaseModel):
    scheduler: dict


class TaskOut(BaseModel):
    id: str
    title: str
    priority: str
    state: str
    org: str
    official: str
    flow_log: list
    progress_log: list
    todos: list
    createdAt: str
    updatedAt: str

    class Config:
        from_attributes = True
