# Executive Order Architecture

## System Overview

Executive Order is a multi-agent AI collaboration system based on the U.S. Constitutional framework (1787).

## 10 Agents

1. **Chief of Staff** (`chief_of_staff`) - Message triage
2. **NSC** (`nsc`) - Strategic planning
3. **Senate** (`senate`) - Review and filibuster
4. **OMB** (`omb`) - Task dispatch and coordination
5. **Supreme Court** (`supreme_court`) - Dispute arbitration
6. **Treasury** (`treasury`) - Data and analysis
7. **State Department** (`state_dept`) - Documentation
8. **DoD** (`dod`) - Engineering
9. **DoJ** (`doj`) - Security and compliance
10. **Commerce** (`commerce`) - Infrastructure

## Task States

1. `pending` - Awaiting triage
2. `planning` - NSC planning
3. `under_review` - Senate reviewing
4. `filibustered` - Rejected by Senate
5. `dispatched` - OMB dispatched
6. `in_progress` - Executing
7. `pending_review` - Awaiting final review
8. `blocked` - Dispute, awaiting Supreme Court
9. `completed` - Done

## Flow

```
President → Chief of Staff → NSC → Senate → OMB → Departments → President
                                                      ↓
                                              Supreme Court (disputes)
```

## Permission Matrix

| From ↓ \ To → | CoS | NSC | Senate | OMB | Depts | Supreme Court |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Chief of Staff | — | ✅ | | | | |
| NSC | ✅ | — | ✅ | | | ⚠️ |
| Senate | | ✅ | — | ✅ | | ⚠️ |
| OMB | | ✅ | ✅ | — | ✅ | ⚠️ |
| Departments | | | | ✅ | — | ⚠️ |
| Supreme Court | | ✅ | ✅ | ✅ | ✅ | — |

⚠️ = Appeal only (disputes)
