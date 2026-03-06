# Directive Task Dispatch Architecture

> Complete business and technical architecture for the Directive multi-agent collaboration system.

## Overview

Directive is an **institutionalized AI multi-agent framework** based on the U.S. Constitutional system (1787), not a free-form collaboration system.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business Layer: Constitutional Governance Model
  ├─ Separation of Powers: President → Chief of Staff → NSC → Senate → OMB → Departments
  ├─ Institutional Constraints: No bypassing, strict state progression, mandatory Senate review
  └─ Quality Assurance: Filibuster mechanism, real-time observability, emergency intervention
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Technical Layer: OpenClaw Multi-Agent Orchestration
  ├─ State Machine: 9 states (pending → planning → under_review → filibustered → dispatched → in_progress → pending_review → blocked → completed)
  ├─ Data Fusion: flow_log + progress_log + session JSONL → unified activity stream
  ├─ Permission Matrix: Strict subagent invocation control
  └─ Scheduling: Auto-dispatch, timeout retry, stall escalation, auto-rollback
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Observation Layer: React Dashboard + Real-time API
  ├─ Task Board: 10 view panels
  ├─ Activity Stream: Mixed activity records per task
  └─ Online Status: Real-time agent node detection + heartbeat mechanism
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Part 1: Business Architecture

### 1.1 Constitutional System: Separation of Powers

Traditional multi-agent frameworks (CrewAI, AutoGen) use **"free collaboration"**:
- Agents choose collaboration partners autonomously
- Framework only provides communication channels
- Quality control depends entirely on agent intelligence
- **Problem**: Agents can create fake data, duplicate work, no quality guarantee

**Directive** uses **"institutionalized collaboration"**, modeled after the U.S. Constitutional system:

```
              President
              (User)
               │
               ↓
          Chief of Staff
        [Triage Officer]
      ├─ Identify: Task or chat?
      ├─ Execute: Reply to chat || Create task → NSC
      └─ Permission: Can only invoke NSC
               │
               ↓
           NSC (National Security Council)
      [Planning Officer]
      ├─ Analyze requirements
      ├─ Decompose into subtasks
      ├─ Invoke Senate for review
      └─ Permission: Can only invoke Senate
               │
               ↓
           Senate
        [Review Officer]
      ├─ Review NSC's plan (feasibility, completeness, risks)
      ├─ Approve OR Filibuster (with modification requirements)
      ├─ If filibustered → return to NSC → re-review (max 3 rounds)
      └─ Permission: Can only invoke OMB + callback NSC
               │
         (✅ Approved)
               │
               ↓
           OMB (Office of Management and Budget)
        [Dispatch Officer]
      ├─ Receive approved plan
      ├─ Analyze which departments to dispatch
      ├─ Invoke Departments (Treasury/State/DoD/DoJ/Commerce)
      ├─ Monitor progress → consolidate results
      └─ Permission: Can only invoke Departments
               │
               ↓
        Departments Execute
      (Treasury/State/DoD/DoJ/Commerce)
               │
               ↓
          Report to President
```

### 1.2 Supreme Court: Judicial Review

**New layer vs. Edict** - Established in Marbury v. Madison (1803)

When agents conflict or disputes arise:
- Department conflicts → Appeal to Supreme Court
- Authority overreach → Supreme Court ruling
- Plan disputes → Supreme Court arbitration
- Result attribution disputes → Supreme Court decision

**Supreme Court rulings are final** - no appeals, no retries.

---

## Part 2: Technical Architecture

### 2.1 State Machine (9 States)

```
pending → planning → under_review → filibustered/dispatched → in_progress → pending_review → blocked/completed
```

**State Definitions:**
- `pending` - Awaiting Chief of Staff triage
- `planning` - NSC planning
- `under_review` - Senate reviewing
- `filibustered` - Rejected by Senate, sent back to NSC
- `dispatched` - OMB dispatched to departments
- `in_progress` - Departments executing
- `pending_review` - Awaiting final review
- `blocked` - Dispute, awaiting Supreme Court ruling
- `completed` - Done, archived as Executive Record

### 2.2 Permission Matrix

| From ↓ \ To → | Chief of Staff | NSC | Senate | OMB | Depts | Supreme Court |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Chief of Staff | — | ✅ | | | | |
| NSC | ✅ | — | ✅ | | | ⚠️ |
| Senate | | ✅ | — | ✅ | | ⚠️ |
| OMB | | ✅ | ✅ | — | ✅ | ⚠️ |
| Departments | | | | ✅ | — | ⚠️ |
| Supreme Court | | ✅ | ✅ | ✅ | ✅ | — |

⚠️ = Appeal only (disputes)

### 2.3 Data Structure

**Task Object:**
```json
{
  "id": "EO-20260306-001",
  "title": "Design authentication system",
  "state": "in_progress",
  "org": "Department of Defense",
  "flow_log": [
    {"at": "2026-03-06T10:00:00Z", "from": "President", "to": "Chief of Staff", "remark": "Executive Order issued"},
    {"at": "2026-03-06T10:01:00Z", "from": "Chief of Staff", "to": "NSC", "remark": "Task forwarded"},
    {"at": "2026-03-06T10:05:00Z", "from": "NSC", "to": "Senate", "remark": "Plan submitted"},
    {"at": "2026-03-06T10:10:00Z", "from": "Senate", "to": "OMB", "remark": "✅ Approved"},
    {"at": "2026-03-06T10:15:00Z", "from": "OMB", "to": "DoD", "remark": "Dispatched"}
  ],
  "progress_log": [
    {"at": "2026-03-06T10:20:00Z", "msg": "Implementing FastAPI endpoints", "phase": "Code✅|Test🔄|Deploy"}
  ]
}
```

---

## Part 3: Dashboard

### 3.1 Situation Room (10 Panels)

1. **Order Board** - All Executive Orders by status
2. **Agency Monitor** - Task distribution, department load
3. **Executive Records** - Completed orders archive
4. **Order Templates** - 9 preset templates
5. **Agency Personnel** - Token usage, activity stats
6. **Supreme Court Docket** - Pending cases & rulings
7. **Intelligence Brief** - Daily news aggregation
8. **Model Config** - Per-agent LLM switching
9. **Skills Config** - View/add skills
10. **Daily Opener** - Opening ceremony animation

---

## Quick Start

```bash
cd directive
./install.sh
bash scripts/run_loop.sh &
python3 dashboard/server.py
```

Open: http://127.0.0.1:7891
