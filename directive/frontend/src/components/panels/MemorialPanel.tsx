import { useState } from 'react';
import { useStore } from '../../store';
import type { Task, FlowEntry } from '../../api';
import { STATE_LABEL } from '../../constants';
import { isEdict, isTerminalState, normalizeTaskState } from '../../utils';

export default function MemorialPanel() {
  const liveStatus = useStore((s) => s.liveStatus);
  const [filter, setFilter] = useState('all');
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const toast = useStore((s) => s.toast);

  const tasks = liveStatus?.tasks || [];
  let records = tasks.filter((task) => isEdict(task) && isTerminalState(task.state || ''));
  if (filter !== 'all') records = records.filter((task) => normalizeTaskState(task.state || '') === filter);

  const exportRecord = (task: Task) => {
    const flow = task.flow_log || [];
    let md = `# Congressional Record · ${task.title}\n\n`;
    md += `- **Directive ID**: ${task.id}\n`;
    md += `- **State**: ${task.state}\n`;
    md += `- **Lead office**: ${task.org}\n`;
    if (flow.length) {
      const startAt = flow[0].at ? flow[0].at.substring(0, 19).replace('T', ' ') : 'unknown';
      const endAt = flow[flow.length - 1].at ? flow[flow.length - 1].at.substring(0, 19).replace('T', ' ') : 'unknown';
      md += `- **Opened**: ${startAt}\n`;
      md += `- **Closed**: ${endAt}\n`;
    }
    md += `\n## Flow Log\n\n`;
    for (const entry of flow) {
      md += `- **${entry.from}** → **${entry.to}**  \n  ${entry.remark}  \n  _${(entry.at || '').substring(0, 19)}_\n\n`;
    }
    if (task.output && task.output !== '-') md += `## Output\n\n\`${task.output}\`\n`;
    navigator.clipboard.writeText(md).then(
      () => toast('Record copied as Markdown', 'ok'),
      () => toast('Copy failed', 'err')
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>Filter:</span>
        {[
          { key: 'all', label: 'All' },
          { key: 'completed', label: '✅ Completed' },
          { key: 'Cancelled', label: '🚫 Cancelled' },
        ].map((option) => (
          <span
            key={option.key}
            className={`sess-filter${filter === option.key ? ' active' : ''}`}
            onClick={() => setFilter(option.key)}
          >
            {option.label}
          </span>
        ))}
      </div>

      <div className="mem-list">
        {!records.length ? (
          <div className="mem-empty">No archived records yet. Completed directives will appear here.</div>
        ) : (
          records.map((task) => {
            const flow = task.flow_log || [];
            const offices = [...new Set(flow.map((entry) => entry.from).concat(flow.map((entry) => entry.to)).filter(Boolean))];
            const firstAt = flow.length ? (flow[0].at || '').substring(0, 16).replace('T', ' ') : '';
            const lastAt = flow.length ? (flow[flow.length - 1].at || '').substring(0, 16).replace('T', ' ') : '';
            const normalized = normalizeTaskState(task.state || '');
            const stateIcon = normalized === 'completed' ? '✅' : '🚫';
            return (
              <div className="mem-card" key={task.id} onClick={() => setDetailTask(task)}>
                <div className="mem-icon">📜</div>
                <div className="mem-info">
                  <div className="mem-title">{stateIcon} {task.title || task.id}</div>
                  <div className="mem-sub">{task.id} · {task.org || ''} · {flow.length} flow events</div>
                  <div className="mem-tags">
                    {offices.slice(0, 5).map((office) => (
                      <span className="mem-tag" key={office}>{office}</span>
                    ))}
                  </div>
                </div>
                <div className="mem-right">
                  <span className="mem-date">{firstAt}</span>
                  {lastAt !== firstAt && <span className="mem-date">{lastAt}</span>}
                </div>
              </div>
            );
          })
        )}
      </div>

      {detailTask && <RecordDetailModal task={detailTask} onClose={() => setDetailTask(null)} onExport={exportRecord} />}
    </div>
  );
}

function RecordDetailModal({
  task,
  onClose,
  onExport,
}: {
  task: Task;
  onClose: () => void;
  onExport: (task: Task) => void;
}) {
  const flow = task.flow_log || [];
  const state = normalizeTaskState(task.state || 'Unknown');
  const stateIcon = state === 'completed' ? '✅' : state === 'Cancelled' ? '🚫' : '🔄';
  const offices = [...new Set(flow.map((entry) => entry.from).concat(flow.map((entry) => entry.to)).filter(Boolean))];

  const originLog: FlowEntry[] = [];
  const planningLog: FlowEntry[] = [];
  const reviewLog: FlowEntry[] = [];
  const executionLog: FlowEntry[] = [];
  const finalLog: FlowEntry[] = [];
  for (const entry of flow) {
    if (entry.from === 'President' || entry.to === 'Chief of Staff Office') originLog.push(entry);
    else if ((entry.to || '').includes('National Security Council') || (entry.from || '').includes('National Security Council')) planningLog.push(entry);
    else if ((entry.to || '').includes('Senate') || (entry.from || '').includes('Senate') || (entry.to || '').includes('Office of Management and Budget') || (entry.from || '').includes('Office of Management and Budget')) reviewLog.push(entry);
    else if (entry.remark && (entry.remark.includes('complete') || entry.remark.includes('Final review approved'))) finalLog.push(entry);
    else executionLog.push(entry);
  }

  const renderPhase = (title: string, icon: string, items: FlowEntry[]) => {
    if (!items.length) return null;
    return (
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>{icon} {title}</div>
        <div className="md-timeline">
          {items.map((entry, index) => {
            const dotCls = entry.remark?.includes('✅') ? 'green' : entry.remark?.includes('🚫') ? 'red' : '';
            return (
              <div className="md-tl-item" key={index}>
                <div className={`md-tl-dot ${dotCls}`} />
                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                  <span className="md-tl-from">{entry.from}</span>
                  <span className="md-tl-to">→ {entry.to}</span>
                </div>
                <div className="md-tl-remark">{entry.remark}</div>
                <div className="md-tl-time">{(entry.at || '').substring(0, 19).replace('T', ' ')}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="modal-bg open" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-body">
          <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 700, letterSpacing: '.04em', marginBottom: 4 }}>{task.id}</div>
          <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>{stateIcon} {task.title || task.id}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
            <span className={`tag st-${state}`}>{STATE_LABEL[state] || state}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{task.org}</span>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>{flow.length} flow events</span>
            {offices.map((office) => (
              <span className="mem-tag" key={office}>{office}</span>
            ))}
          </div>

          {task.now && (
            <div style={{ background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 8, padding: '10px 14px', marginBottom: 18, fontSize: 12, color: 'var(--muted)' }}>
              {task.now}
            </div>
          )}

          {renderPhase('Presidential Intake', '🦅', originLog)}
          {renderPhase('NSC Planning', '📋', planningLog)}
          {renderPhase('Senate / OMB Review', '🏛️', reviewLog)}
          {renderPhase('Department Execution', '⚙️', executionLog)}
          {renderPhase('Final Briefing', '🧾', finalLog)}

          {task.output && task.output !== '-' && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>📦 Output</div>
              <code style={{ fontSize: 11, wordBreak: 'break-all' }}>{task.output}</code>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-g" onClick={() => onExport(task)} style={{ fontSize: 12, padding: '6px 16px' }}>
              📋 Copy record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
