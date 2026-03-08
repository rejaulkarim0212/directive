/**
 * Tab Constants — 标签页相关常量
 */

export type TabKey =
  | 'edicts' | 'monitor' | 'officials' | 'models'
  | 'skills' | 'sessions' | 'memorials' | 'templates' | 'morning';

export const TAB_DEFS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'edicts', label: 'Directives', icon: '📜' },
  { key: 'monitor', label: 'Dispatch', icon: '🏛️' },
  { key: 'officials', label: 'Cabinet', icon: '👔' },
  { key: 'models', label: 'Models', icon: '🤖' },
  { key: 'skills', label: 'Skills', icon: '🎯' },
  { key: 'sessions', label: 'Threads', icon: '💬' },
  { key: 'memorials', label: 'Records', icon: '📜' },
  { key: 'templates', label: 'Playbooks', icon: '📋' },
  { key: 'morning', label: 'Intel Brief', icon: '🌅' },
];
