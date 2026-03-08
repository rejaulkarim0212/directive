/**
 * Department Constants — 部门/官员相关常量
 */

export const DEPT_COLOR: Record<string, string> = {
  'President': '#ffd700',
  'Chief of Staff': '#e8a040',
  'NSC': '#a07aff',
  'Senate': '#6a9eff',
  'OMB': '#6aef9a',
  'Departments': '#44aaff',
  'Department of State': '#f5c842',
  'Department of the Treasury': '#ff9a6a',
  'Department of Defense': '#ff5270',
  'Department of Justice': '#cc4444',
  'Department of Commerce': '#44aaff',
  'Supreme Court': '#9b59b6',
};

export const DEPTS = [
  { id: 'chief_of_staff', label: 'Chief of Staff Office', emoji: '👔', role: 'Chief of Staff', rank: 'EOP' },
  { id: 'nsc', label: 'National Security Council', emoji: '📋', role: 'NSC Director', rank: 'EOP' },
  { id: 'senate', label: 'United States Senate', emoji: '🏛️', role: 'Senate Reviewer', rank: 'Legislative' },
  { id: 'omb', label: 'Office of Management and Budget', emoji: '💼', role: 'OMB Director', rank: 'EOP' },
  { id: 'treasury', label: 'Department of the Treasury', emoji: '🏦', role: 'Treasury', rank: 'Cabinet' },
  { id: 'state_dept', label: 'Department of State', emoji: '🌐', role: 'State Department', rank: 'Cabinet' },
  { id: 'dod', label: 'Department of Defense', emoji: '🛡️', role: 'DoD', rank: 'Cabinet' },
  { id: 'doj', label: 'Department of Justice', emoji: '⚖️', role: 'DoJ', rank: 'Cabinet' },
  { id: 'commerce', label: 'Department of Commerce', emoji: '🔧', role: 'Commerce', rank: 'Cabinet' },
  { id: 'supreme_court', label: 'Supreme Court', emoji: '🧑‍⚖️', role: 'Judicial Review', rank: 'Judicial' },
];
