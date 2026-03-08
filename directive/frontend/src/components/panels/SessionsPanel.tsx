import { useStore } from '../../store';
import type { Task } from '../../api';
import { STATE_LABEL } from '../../constants';
import { isEdict, timeAgo, isTerminalState, normalizeTaskState } from '../../utils';
import { useState } from 'react';

function useAgentMaps() {
  const cfg = useStore((s) => s.agentConfig);
  const emojiMap: Record<string, string> = {};
  const labelMap: Record<string, string> = {};
  if (cfg?.agents) {
    cfg.agents.forEach((agent) => {
      emojiMap[agent.id] = agent.emoji || '🏛️';
      labelMap[agent.id] = agent.label || agent.id;
    });
  }
  return { emojiMap, labelMap };
}

function extractAgent(task: Task): string {
  const matched = (task.id || '').match(/^OC-(\w+)-/);
  if (matched) return matched[1];
  return (task.org || '').toLowerCase();
}

function humanTitle(task: Task, labelMap: Record<string, string>): string {
  const raw = task.title || '';
  if (raw === 'heartbeat session') return 'Heartbeat probe';
  const matched = raw.match(/^agent:(\w+):(\w+)/);
  if (matched) {
    const agentLabel = labelMap[matched[1]] || matched[1];
    if (matched[2] === 'main') return `${agentLabel} · Primary thread`;
    if (matched[2] === 'subagent') return `${agentLabel} · Subtask run`;
    if (matched[2] === 'cron') return `${agentLabel} · Scheduled run`;
    return `${agentLabel} · ${matched[2]}`;
  }
  return raw || task.id;
}

function channelLabel(task: Task): { icon: string; text: string } {
  const now = task.now || '';
  if (now.includes('feishu/direct')) return { icon: '💬', text: 'Feishu direct' };
  if (now.includes('feishu')) return { icon: '💬', text: 'Feishu' };
  if (now.includes('webchat')) return { icon: '🌐', text: 'Web chat' };
  if (now.includes('cron')) return { icon: '⏰', text: 'Scheduled' };
  if (now.includes('direct')) return { icon: '📨', text: 'Direct' };
  return { icon: '🔗', text: 'Thread' };
}

function lastMessage(task: Task): string {
  const activity = task.activity || [];
  for (let index = activity.length - 1; index >= 0; index -= 1) {
    const entry = activity[index];
    if (entry.kind !== 'assistant') continue;
    let text = entry.text || '';
    if (text.startsWith('NO_REPLY') || text.startsWith('Reasoning:')) continue;
    text = text.replace(/\[\[.*?\]\]/g, '').replace(/\*\*/g, '').replace(/^#+\s/gm, '').trim();
    return text.substring(0, 140) + (text.length > 140 ? '…' : '');
  }
  return '';
}

export default function SessionsPanel() {
  const liveStatus = useStore((s) => s.liveStatus);
  const sessFilter = useStore((s) => s.sessFilter);
  const setSessFilter = useStore((s) => s.setSessFilter);
  const { emojiMap, labelMap } = useAgentMaps();
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const tasks = liveStatus?.tasks || [];
  const threads = tasks.filter((task) => !isEdict(task));

  let filtered = threads;
  if (sessFilter === 'active') filtered = threads.filter((task) => !isTerminalState(task.state || ''));
  else if (sessFilter !== 'all') filtered = threads.filter((task) => extractAgent(task) === sessFilter);

  const agentIds = [...new Set(threads.map(extractAgent))];

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: `All (${threads.length})` },
          { key: 'active', label: 'Active' },
          ...agentIds.slice(0, 8).map((id) => ({ key: id, label: labelMap[id] || id })),
        ].map((filter) => (
          <span
            key={filter.key}
            className={`sess-filter${sessFilter === filter.key ? ' active' : ''}`}
            onClick={() => setSessFilter(filter.key)}
          >
            {filter.label}
          </span>
        ))}
      </div>

      <div className="sess-grid">
        {!filtered.length ? (
          <div style={{ fontSize: 13, color: 'var(--muted)', padding: 24, textAlign: 'center', gridColumn: '1/-1' }}>
            No ad-hoc threads yet.
          </div>
        ) : (
          filtered.map((task) => {
            const agent = extractAgent(task);
            const emoji = emojiMap[agent] || '🏛️';
            const agentLabel = labelMap[agent] || task.org || agent;
            const heartbeat = task.heartbeat || { status: 'unknown' as const, label: '' };
            const channel = channelLabel(task);
            const title = humanTitle(task, labelMap);
            const message = lastMessage(task);
            const meta = task.sourceMeta || {};
            const totalTokens = (meta as Record<string, unknown>).totalTokens as number | undefined;
            const updatedAt = task.updatedAt || task.eta || '';
            const hbDot = heartbeat.status === 'active' ? '🟢' : heartbeat.status === 'warn' ? '🟡' : heartbeat.status === 'stalled' ? '🔴' : '⚪';
            const state = normalizeTaskState(task.state || 'Unknown');

            return (
              <div className="sess-card" key={task.id} onClick={() => setDetailTask(task)}>
                <div className="sc-top">
                  <span className="sc-emoji">{emoji}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="sc-agent">{agentLabel}</span>
                      <span style={{ fontSize: 10, color: 'var(--muted)', background: 'var(--panel2)', padding: '2px 6px', borderRadius: 4 }}>
                        {channel.icon} {channel.text}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span title={heartbeat.label || ''}>{hbDot}</span>
                    <span className={`tag st-${state}`} style={{ fontSize: 10 }}>{STATE_LABEL[state] || state}</span>
                  </div>
                </div>
                <div className="sc-title">{title}</div>
                {message && <div className="sc-now">{message}</div>}
                <div className="sc-meta">
                  <span className="sc-id">{task.id}</span>
                  {typeof totalTokens === 'number' && <span style={{ fontSize: 10, color: 'var(--muted)' }}>{totalTokens.toLocaleString()} tokens</span>}
                  {updatedAt && <span className="sc-time">{timeAgo(updatedAt)}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {detailTask && (
        <ThreadDetailModal task={detailTask} labelMap={labelMap} emojiMap={emojiMap} onClose={() => setDetailTask(null)} />
      )}
    </div>
  );
}

function ThreadDetailModal({
  task,
  labelMap,
  emojiMap,
  onClose,
}: {
  task: Task;
  labelMap: Record<string, string>;
  emojiMap: Record<string, string>;
  onClose: () => void;
}) {
  const agent = extractAgent(task);
  const emoji = emojiMap[agent] || '🏛️';
  const title = humanTitle(task, labelMap);
  const channel = channelLabel(task);
  const heartbeat = task.heartbeat || { status: 'unknown' as const, label: '' };
  const meta = task.sourceMeta || {};
  const activity = task.activity || [];
  const state = normalizeTaskState(task.state || 'Unknown');

  const totalTokens = (meta as Record<string, unknown>).totalTokens as number | undefined;
  const inputTokens = (meta as Record<string, unknown>).inputTokens as number | undefined;
  const outputTokens = (meta as Record<string, unknown>).outputTokens as number | undefined;

  return (
    <div className="modal-bg open" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 700, letterSpacing: '.04em', marginBottom: 4 }}>{task.id}</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{emoji} {title}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <span className={`tag st-${state}`}>{STATE_LABEL[state] || state}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{channel.icon} {channel.text}</span>
            {heartbeat.label && <span style={{ fontSize: 11 }}>{heartbeat.label}</span>}
          </div>

          <div style={{ display: 'flex', gap: 14, marginBottom: 18, flexWrap: 'wrap' }}>
            {totalTokens != null && <Metric label="Total tokens" value={totalTokens.toLocaleString()} color="var(--acc)" />}
            {inputTokens != null && <Metric label="Input" value={inputTokens.toLocaleString()} color="var(--text)" />}
            {outputTokens != null && <Metric label="Output" value={outputTokens.toLocaleString()} color="var(--text)" />}
          </div>

          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            Recent activity <span style={{ fontWeight: 400, color: 'var(--muted)' }}>({activity.length})</span>
          </div>
          <div style={{ maxHeight: 350, overflowY: 'auto', border: '1px solid var(--line)', borderRadius: 10, background: 'var(--panel2)' }}>
            {!activity.length ? (
              <div style={{ padding: 16, color: 'var(--muted)', fontSize: 12, textAlign: 'center' }}>No activity recorded.</div>
            ) : (
              activity.slice(-15).reverse().map((entry, index) => {
                const kind = entry.kind || '';
                const icon = kind === 'assistant' ? '🤖' : kind === 'tool' ? '🔧' : kind === 'user' ? '👤' : '📝';
                const label = kind === 'assistant' ? 'Assistant' : kind === 'tool' ? 'Tool' : kind === 'user' ? 'User' : 'Event';
                let text = (entry.text || '').replace(/\[\[.*?\]\]/g, '').replace(/\*\*/g, '').trim();
                if (text.length > 200) text = text.substring(0, 200) + '…';
                const time = ((entry.at as string) || '').substring(11, 19);
                return (
                  <div key={index} style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', fontSize: 12, lineHeight: 1.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                      <span>{icon}</span>
                      <span style={{ fontWeight: 600, fontSize: 11 }}>{label}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 10, marginLeft: 'auto' }}>{time}</span>
                    </div>
                    <div style={{ color: 'var(--muted)' }}>{text}</div>
                  </div>
                );
              })
            )}
          </div>

          {task.output && task.output !== '-' && (
            <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 12, wordBreak: 'break-all', borderTop: '1px solid var(--line)', paddingTop: 8 }}>
              📂 {task.output}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--panel2)', padding: '10px 16px', borderRadius: 8, fontSize: 12 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
      <div style={{ color: 'var(--muted)', fontSize: 10 }}>{label}</div>
    </div>
  );
}
