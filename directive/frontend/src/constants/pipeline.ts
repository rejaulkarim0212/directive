/**
 * Pipeline Constants — 工作流管道相关常量
 */

export const PIPE = [
  { key: 'pending', dept: 'President', icon: '🦅', action: 'Directive' },
  { key: 'triage', dept: 'Chief of Staff', icon: '👔', action: 'Triage' },
  { key: 'planning', dept: 'NSC', icon: '📋', action: 'Planning' },
  { key: 'under_review', dept: 'Senate', icon: '🏛️', action: 'Review' },
  { key: 'dispatched', dept: 'OMB', icon: '💼', action: 'Dispatch' },
  { key: 'in_progress', dept: 'Departments', icon: '⚙️', action: 'Execute' },
  { key: 'pending_review', dept: 'OMB', icon: '🧾', action: 'Consolidate' },
  { key: 'completed', dept: 'President', icon: '✅', action: 'Briefed' },
] as const;

export const PIPE_STATE_IDX: Record<string, number> = {
  pending: 0,
  triage: 1,
  planning: 2,
  under_review: 3,
  filibustered: 2,
  dispatched: 4,
  in_progress: 5,
  pending_review: 6,
  completed: 7,
  blocked: 5,
  Cancelled: 7,
};

export const LEGACY_STATE_MAP: Record<string, string> = {
  Pending: 'pending',
  Taizi: 'triage',
  Zhongshu: 'planning',
  Menxia: 'under_review',
  Omb: 'dispatched',
  Assigned: 'dispatched',
  Doing: 'in_progress',
  Review: 'pending_review',
  Next: 'in_progress',
  Done: 'completed',
  Blocked: 'blocked',
};

export const STATE_LABEL: Record<string, string> = {
  pending: 'Pending',
  triage: 'Chief of Staff Triage',
  planning: 'NSC Planning',
  under_review: 'Senate Review',
  filibustered: 'Filibustered',
  dispatched: 'OMB Dispatch',
  in_progress: 'Department Execution',
  pending_review: 'OMB Consolidation',
  completed: 'Completed',
  blocked: 'Blocked',
  Cancelled: 'Cancelled',
};

export type PipeStatus = { 
  key: string; 
  dept: string; 
  icon: string; 
  action: string; 
  status: 'done' | 'active' | 'pending' 
};
