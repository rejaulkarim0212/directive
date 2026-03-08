"""Task service layer for Executive Order states."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models.task import STATE_TRANSITIONS, TERMINAL_STATES, Task, TaskState
from .event_bus import (
    TOPIC_TASK_COMPLETED,
    TOPIC_TASK_CREATED,
    TOPIC_TASK_DISPATCH,
    TOPIC_TASK_STATUS,
    EventBus,
)

log = logging.getLogger("directive.task_service")


class TaskService:
    def __init__(self, db: AsyncSession, event_bus: EventBus):
        self.db = db
        self.bus = event_bus

    async def create_task(
        self,
        title: str,
        description: str = "",
        priority: str = "normal",
        assignee_org: str | None = None,
        creator: str = "president",
        tags: list[str] | None = None,
        initial_state: TaskState = TaskState.TRIAGE,
        meta: dict | None = None,
    ) -> Task:
        task = Task(
            id=str(uuid.uuid4()),
            title=title,
            state=initial_state,
            org=assignee_org or "Chief of Staff Office",
            official=creator,
            now=description or "Task created",
            priority=priority,
            flow_log=[{
                "at": datetime.now(timezone.utc).isoformat(),
                "from": "President",
                "to": assignee_org or "Chief of Staff Office",
                "remark": "Task created",
            }],
            progress_log=[],
            todos=[],
            scheduler=meta or {},
        )
        self.db.add(task)
        await self.db.flush()

        await self.bus.publish(
            topic=TOPIC_TASK_CREATED,
            trace_id=task.id,
            event_type="task.created",
            producer="task_service",
            payload={
                "task_id": task.id,
                "title": title,
                "state": initial_state.value,
                "priority": priority,
                "assignee_org": assignee_org,
                "tags": tags or [],
            },
        )

        await self.db.commit()
        log.info("Created task %s: %s [%s]", task.id, title, initial_state.value)
        return task

    async def transition_state(
        self,
        task_id: uuid.UUID,
        new_state: TaskState,
        agent: str = "system",
        reason: str = "",
    ) -> Task:
        task = await self._get_task(task_id)
        old_state = task.state

        allowed = STATE_TRANSITIONS.get(old_state, set())
        if new_state not in allowed:
            raise ValueError(
                f"Invalid transition: {old_state.value} -> {new_state.value}. "
                f"Allowed: {[s.value for s in allowed]}"
            )

        task.state = new_state
        task.updated_at = datetime.now(timezone.utc)
        flow_entry = {
            "at": datetime.now(timezone.utc).isoformat(),
            "from": old_state.value,
            "to": new_state.value,
            "remark": reason or f"{agent} transition",
            "agent": agent,
        }
        task.flow_log = [*(task.flow_log or []), flow_entry]

        topic = TOPIC_TASK_COMPLETED if new_state in TERMINAL_STATES else TOPIC_TASK_STATUS
        await self.bus.publish(
            topic=topic,
            trace_id=task.id,
            event_type=f"task.state.{new_state.value}",
            producer=agent,
            payload={
                "task_id": task.id,
                "from": old_state.value,
                "to": new_state.value,
                "reason": reason,
            },
        )

        await self.db.commit()
        log.info("Task %s state: %s -> %s by %s", task.id, old_state.value, new_state.value, agent)
        return task

    async def request_dispatch(self, task_id: uuid.UUID, target_agent: str, message: str = ""):
        task = await self._get_task(task_id)
        await self.bus.publish(
            topic=TOPIC_TASK_DISPATCH,
            trace_id=task.id,
            event_type="task.dispatch.request",
            producer="task_service",
            payload={
                "task_id": task.id,
                "agent": target_agent,
                "message": message,
                "state": task.state.value,
            },
        )
        log.info("Dispatch requested: task %s -> agent %s", task.id, target_agent)

    async def add_progress(self, task_id: uuid.UUID, agent: str, content: str) -> Task:
        task = await self._get_task(task_id)
        entry = {"agent": agent, "text": content, "at": datetime.now(timezone.utc).isoformat()}
        task.progress_log = [*(task.progress_log or []), entry]
        task.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        return task

    async def update_todos(self, task_id: uuid.UUID, todos: list[dict]) -> Task:
        task = await self._get_task(task_id)
        task.todos = todos
        task.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        return task

    async def update_scheduler(self, task_id: uuid.UUID, scheduler: dict) -> Task:
        task = await self._get_task(task_id)
        task.scheduler = scheduler
        task.updated_at = datetime.now(timezone.utc)
        await self.db.commit()
        return task

    async def get_task(self, task_id: uuid.UUID) -> Task:
        return await self._get_task(task_id)

    async def list_tasks(
        self,
        state: TaskState | None = None,
        assignee_org: str | None = None,
        priority: str | None = None,
        limit: int = 50,
        offset: int = 0,
    ) -> list[Task]:
        stmt = select(Task)
        conditions = []
        if state is not None:
            conditions.append(Task.state == state)
        if assignee_org is not None:
            conditions.append(Task.org == assignee_org)
        if priority is not None:
            conditions.append(Task.priority == priority)
        if conditions:
            stmt = stmt.where(and_(*conditions))
        stmt = stmt.order_by(Task.created_at.desc()).limit(limit).offset(offset)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_live_status(self) -> dict[str, Any]:
        tasks = await self.list_tasks(limit=200)
        return {
            "tasks": [task.to_dict() for task in tasks],
            "last_updated": datetime.now(timezone.utc).isoformat(),
        }

    async def count_tasks(self, state: TaskState | None = None) -> int:
        stmt = select(func.count(Task.id))
        if state is not None:
            stmt = stmt.where(Task.state == state)
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def _get_task(self, task_id: uuid.UUID) -> Task:
        task = await self.db.get(Task, str(task_id))
        if task is None:
            raise ValueError(f"Task not found: {task_id}")
        return task
