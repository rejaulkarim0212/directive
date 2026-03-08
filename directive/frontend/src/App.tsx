import { useEffect } from 'react';
import { useStore, startPolling, stopPolling } from './store';
import { isEdict, isArchived, normalizeTaskState, isTerminalState } from './utils';
import { TAB_DEFS } from './constants';
import {
  EdictBoard,
  MonitorPanel,
  OfficialPanel,
  ModelConfig,
  SkillsConfig,
  SessionsPanel,
  MemorialPanel,
  TemplatePanel,
  MorningPanel,
  TaskModal,
  Toaster,
  CourtCeremony,
} from './components';

export default function App() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);
  const liveStatus = useStore((s) => s.liveStatus);
  const countdown = useStore((s) => s.countdown);
  const loadAll = useStore((s) => s.loadAll);
  const triggerCeremony = useStore((s) => s.triggerCeremony);

  useEffect(() => {
    startPolling();
    return () => stopPolling();
  }, []);

  // Compute header chips
  const tasks = liveStatus?.tasks || [];
  const edicts = tasks.filter(isEdict);
  const activeEdicts = edicts.filter((t) => !isArchived(t));
  const sync = liveStatus?.syncStatus;
  const syncOk = sync?.ok;

  // Tab badge counts
  const tabBadge = (key: string): string => {
    if (key === 'edicts') return String(activeEdicts.length);
    if (key === 'sessions') return String(tasks.filter((t) => !isEdict(t)).length);
    if (key === 'memorials') return String(edicts.filter((t) => isTerminalState(t.state || '')).length);
    if (key === 'monitor') {
      const activeDepts = tasks.filter((t) => isEdict(t) && normalizeTaskState(t.state || '') === 'in_progress').length;
      return activeDepts + ' active';
    }
    return '';
  };

  return (
    <div className="wrap">
      {/* ── Header ── */}
      <div className="hdr">
        <div>
          <div className="logo" onClick={triggerCeremony} style={{ cursor: 'pointer' }} title="Click to replay entrance animation">
            Executive Order · Situation Room
          </div>
          <div className="sub-text">US 10-Agent Control Dashboard</div>
        </div>
        <div className="hdr-r">
          <span className={`chip ${syncOk ? 'ok' : syncOk === false ? 'err' : ''}`}>
            {syncOk ? '✅ Sync OK' : syncOk === false ? '❌ Backend Offline' : '⏳ Connecting...'}
          </span>
          <span className="chip">{activeEdicts.length} directives</span>
          <button className="btn-refresh" onClick={() => loadAll()}>
            ⟳ Refresh
          </button>
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>⟳ {countdown}s</span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="tabs">
        {TAB_DEFS.map((t) => (
          <div
            key={t.key}
            className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}
          >
            {t.icon} {t.label}
            {tabBadge(t.key) && <span className="tbadge">{tabBadge(t.key)}</span>}
          </div>
        ))}
      </div>

      {/* ── Panels ── */}
      {activeTab === 'edicts' && <EdictBoard />}
      {activeTab === 'monitor' && <MonitorPanel />}
      {activeTab === 'officials' && <OfficialPanel />}
      {activeTab === 'models' && <ModelConfig />}
      {activeTab === 'skills' && <SkillsConfig />}
      {activeTab === 'sessions' && <SessionsPanel />}
      {activeTab === 'memorials' && <MemorialPanel />}
      {activeTab === 'templates' && <TemplatePanel />}
      {activeTab === 'morning' && <MorningPanel />}

      {/* ── Overlays ── */}
      <TaskModal />
      <Toaster />
      <CourtCeremony />
    </div>
  );
}
