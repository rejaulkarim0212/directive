"""Task model for the Executive Order 10-agent pipeline."""

import enum
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, Enum, Index, String, Text
from sqlalchemy.dialects.postgresql import JSONB

from ..db import Base


class TaskState(str, enum.Enum):
    """Canonical directive states."""

    PENDING = "pending"
    TRIAGE = "triage"
    PLANNING = "planning"
    UNDER_REVIEW = "under_review"
    FILIBUSTERED = "filibustered"
    DISPATCHED = "dispatched"
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    COMPLETED = "completed"
    BLOCKED = "blocked"
    CANCELLED = "Cancelled"


TERMINAL_STATES = {TaskState.COMPLETED, TaskState.CANCELLED}

STATE_TRANSITIONS = {
    TaskState.PENDING: {TaskState.TRIAGE, TaskState.CANCELLED},
    TaskState.TRIAGE: {TaskState.PLANNING, TaskState.CANCELLED},
    TaskState.PLANNING: {TaskState.UNDER_REVIEW, TaskState.BLOCKED, TaskState.CANCELLED},
    TaskState.UNDER_REVIEW: {TaskState.DISPATCHED, TaskState.FILIBUSTERED, TaskState.PLANNING, TaskState.CANCELLED},
    TaskState.FILIBUSTERED: {TaskState.PLANNING, TaskState.CANCELLED},
    TaskState.DISPATCHED: {TaskState.IN_PROGRESS, TaskState.BLOCKED, TaskState.CANCELLED},
    TaskState.IN_PROGRESS: {TaskState.PENDING_REVIEW, TaskState.BLOCKED, TaskState.CANCELLED},
    TaskState.PENDING_REVIEW: {TaskState.COMPLETED, TaskState.PLANNING, TaskState.CANCELLED},
    TaskState.BLOCKED: {
        TaskState.TRIAGE,
        TaskState.PLANNING,
        TaskState.UNDER_REVIEW,
        TaskState.DISPATCHED,
        TaskState.IN_PROGRESS,
    },
}

STATE_AGENT_MAP = {
    TaskState.PENDING: "chief_of_staff",
    TaskState.TRIAGE: "chief_of_staff",
    TaskState.PLANNING: "nsc",
    TaskState.UNDER_REVIEW: "senate",
    TaskState.FILIBUSTERED: "nsc",
    TaskState.DISPATCHED: "omb",
    TaskState.PENDING_REVIEW: "omb",
    TaskState.BLOCKED: "supreme_court",
}

ORG_AGENT_MAP = {
    "Department of the Treasury": "treasury",
    "Department of State": "state_dept",
    "Department of Defense": "dod",
    "Department of Justice": "doj",
    "Department of Commerce": "commerce",
}


class Task(Base):
    """Directive task table."""

    __tablename__ = "tasks"

    id = Column(String(32), primary_key=True, comment="Task ID, e.g. JJC-20260301-001")
    title = Column(Text, nullable=False, comment="Task title")
    state = Column(Enum(TaskState, name="task_state"), nullable=False, default=TaskState.TRIAGE, index=True)
    org = Column(String(64), nullable=False, default="Chief of Staff Office", comment="Current owner office")
    official = Column(String(64), default="", comment="Responsible official")
    now = Column(Text, default="", comment="Current progress summary")
    eta = Column(String(64), default="-", comment="ETA")
    block = Column(Text, default="None", comment="Block reason")
    output = Column(Text, default="", comment="Final output path")
    priority = Column(String(16), default="normal", comment="Priority")
    archived = Column(Boolean, default=False, index=True)

    flow_log = Column(JSONB, default=list, comment="Flow log [{at, from, to, remark}]")
    progress_log = Column(JSONB, default=list, comment="Progress log")
    todos = Column(JSONB, default=list, comment="Todo items")
    scheduler = Column(JSONB, default=dict, comment="Scheduler metadata")
    template_id = Column(String(64), default="", comment="Template ID")
    template_params = Column(JSONB, default=dict, comment="Template parameters")
    ac = Column(Text, default="", comment="Acceptance criteria")
    target_dept = Column(String(64), default="", comment="Target department")

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("ix_tasks_state_archived", "state", "archived"),
        Index("ix_tasks_updated_at", "updated_at"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "state": self.state.value if self.state else "",
            "org": self.org,
            "official": self.official,
            "now": self.now,
            "eta": self.eta,
            "block": self.block,
            "output": self.output,
            "priority": self.priority,
            "archived": self.archived,
            "flow_log": self.flow_log or [],
            "progress_log": self.progress_log or [],
            "todos": self.todos or [],
            "templateId": self.template_id,
            "templateParams": self.template_params or {},
            "ac": self.ac,
            "targetDept": self.target_dept,
            "_scheduler": self.scheduler or {},
            "createdAt": self.created_at.isoformat() if self.created_at else "",
            "updatedAt": self.updated_at.isoformat() if self.updated_at else "",
        }
