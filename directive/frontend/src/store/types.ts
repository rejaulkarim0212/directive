/**
 * Store Types — Zustand Store 类型定义
 */

import type {
  LiveStatus,
  AgentConfig,
  ChangeLogEntry,
  OfficialsData,
  AgentsStatusData,
  MorningBrief,
  SubConfig,
} from '../api/types';
import type { TabKey } from '../constants';

export interface Toast {
  id: number;
  msg: string;
  type: 'ok' | 'err';
}

export interface AppStore {
  // Data
  liveStatus: LiveStatus | null;
  agentConfig: AgentConfig | null;
  changeLog: ChangeLogEntry[];
  officialsData: OfficialsData | null;
  agentsStatusData: AgentsStatusData | null;
  morningBrief: MorningBrief | null;
  subConfig: SubConfig | null;

  // UI State
  activeTab: TabKey;
  edictFilter: 'active' | 'archived' | 'all';
  sessFilter: string;
  tplCatFilter: string;
  selectedOfficial: string | null;
  modalTaskId: string | null;
  countdown: number;

  // Toast
  toasts: Toast[];

  // Court Ceremony
  showCeremony: boolean;
  triggerCeremony: () => void;
  hideCeremony: () => void;

  // Actions
  setActiveTab: (tab: TabKey) => void;
  setEdictFilter: (f: 'active' | 'archived' | 'all') => void;
  setSessFilter: (f: string) => void;
  setTplCatFilter: (f: string) => void;
  setSelectedOfficial: (id: string | null) => void;
  setModalTaskId: (id: string | null) => void;
  setCountdown: (n: number) => void;
  toast: (msg: string, type?: 'ok' | 'err') => void;

  // Data fetching
  loadLive: () => Promise<void>;
  loadAgentConfig: () => Promise<void>;
  loadOfficials: () => Promise<void>;
  loadAgentsStatus: () => Promise<void>;
  loadMorning: () => Promise<void>;
  loadSubConfig: () => Promise<void>;
  loadAll: () => Promise<void>;
}
