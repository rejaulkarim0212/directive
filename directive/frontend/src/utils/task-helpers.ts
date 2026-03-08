/**
 * Task Helpers — 任务相关的工具函数
 */

import type { Task } from '../api/types';
import { PIPE, PIPE_STATE_IDX, LEGACY_STATE_MAP, STATE_LABEL, DEPT_COLOR, type PipeStatus } from '../constants';

export function normalizeTaskState(state: string): string {
  return LEGACY_STATE_MAP[state] || state;
}

export function isTerminalState(state: string): boolean {
  const normalized = normalizeTaskState(state);
  return normalized === 'completed' || normalized === 'Cancelled';
}

export function isReviewState(state: string): boolean {
  const normalized = normalizeTaskState(state);
  return normalized === 'under_review' || normalized === 'pending_review';
}

export function canAdvanceState(state: string): boolean {
  const normalized = normalizeTaskState(state);
  return ['pending', 'triage', 'planning', 'under_review', 'dispatched', 'in_progress', 'pending_review'].includes(normalized);
}

export function deptColor(d: string): string {
  return DEPT_COLOR[d] || '#6a9eff';
}

export function stateLabel(t: Task): string {
  const state = normalizeTaskState(t.state || '');
  const r = t.review_round || 0;
  if (state === 'under_review' && r > 1) return `Senate Review (Round ${r})`;
  if (state === 'planning' && r > 0) return `NSC Revision (Round ${r})`;
  return STATE_LABEL[state] || state;
}

export function isEdict(t: Task): boolean {
  return /^JJC-/i.test(t.id || '');
}

export function isSession(t: Task): boolean {
  return /^(OC-|MC-)/i.test(t.id || '');
}

export function isArchived(t: Task): boolean {
  return Boolean(t.archived) || isTerminalState(t.state || '');
}

export function getPipeStatus(t: Task): PipeStatus[] {
  const stateIdx = PIPE_STATE_IDX[normalizeTaskState(t.state || '')] ?? 4;
  return PIPE.map((stage, i) => ({
    ...stage,
    status: (i < stateIdx ? 'done' : i === stateIdx ? 'active' : 'pending') as 'done' | 'active' | 'pending',
  }));
}
