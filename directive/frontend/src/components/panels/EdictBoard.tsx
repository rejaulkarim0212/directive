import { useStore } from '../../store';
import { api, type Task } from '../../api';
import { PIPE } from '../../constants';
import { isEdict, isArchived, getPipeStatus, stateLabel, deptColor, normalizeTaskState, isTerminalState } from '../../utils';

const STATE_ORDER: Record<string, number> = {
  in_progress: 0,
  pending_review: 1,
  dispatched: 2,
  under_review: 3,
  planning: 4,
  triage: 5,
  pending: 6,
  blocked: 7,
  completed: 8,
  Cancelled: 9,
};

function MiniPipe({ task }: { task: Task }) {
  const stages = getPipeStatus(task);
  return (
    <div className="ec-pipe">
      {stages.map((stage, index) => (
        <span key={stage.key} style={{ display: 'contents' }}>
          <div className={`ep-node ${stage.status}`}>
            <div className="ep-icon">{stage.icon}</div>
            <div className="ep-name">{stage.dept}</div>
          </div>
          {index < stages.length - 1 && <div className="ep-arrow">›</div>}
        </span>
      ))}
    </div>
  );
}

function DirectiveCard({ task }: { task: Task }) {
  const setModalTaskId = useStore((s) => s.setModalTaskId);
  const toast = useStore((s) => s.toast);
  const loadAll = useStore((s) => s.loadAll);

  const heartbeat = task.heartbeat || { status: 'unknown', label: '⚪' };
  const normalizedState = normalizeTaskState(task.state || '');
  const stateClass = 'st-' + normalizedState;
  const deptClass = 'dt-' + (task.org || '').replace(/\s/g, '');
  const currentStage = PIPE.find((_, index) => getPipeStatus(task)[index].status === 'active');
  const todos = task.todos || [];
  const doneTodos = todos.filter((item) => item.status === 'completed').length;
  const totalTodos = todos.length;
  const canStop = !['completed', 'blocked', 'Cancelled'].includes(normalizedState);
  const canResume = ['blocked', 'Cancelled'].includes(normalizedState);
  const archived = isArchived(task);
  const isBlocked = task.block && task.block !== 'None' && task.block !== '-';

  const handleAction = async (action: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (action === 'stop' || action === 'cancel') {
      const reason = prompt(action === 'stop' ? 'Reason for stop:' : 'Reason for cancel:');
      if (reason === null) return;
      try {
        const result = await api.taskAction(task.id, action, reason);
        if (result.ok) {
          toast(result.message || 'Action completed');
          loadAll();
        } else {
          toast(result.error || 'Action failed', 'err');
        }
      } catch {
        toast('Backend connection failed', 'err');
      }
    } else if (action === 'resume') {
      try {
        const result = await api.taskAction(task.id, 'resume', 'Resume execution');
        if (result.ok) {
          toast(result.message || 'Directive resumed');
          loadAll();
        } else {
          toast(result.error || 'Action failed', 'err');
        }
      } catch {
        toast('Backend connection failed', 'err');
      }
    }
  };

  const handleArchive = async (event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      const result = await api.archiveTask(task.id, !task.archived);
      if (result.ok) {
        toast(result.message || 'Archive updated');
        loadAll();
      } else {
        toast(result.error || 'Archive update failed', 'err');
      }
    } catch {
      toast('Backend connection failed', 'err');
    }
  };

  return (
    <div className={`edict-card${archived ? ' archived' : ''}`} onClick={() => setModalTaskId(task.id)}>
      <MiniPipe task={task} />
      <div className="ec-id">{task.id}</div>
      <div className="ec-title">{task.title || '(Untitled directive)'}</div>
      <div className="ec-meta">
        <span className={`tag ${stateClass}`}>{stateLabel(task)}</span>
        {task.org && <span className={`tag ${deptClass}`}>{task.org}</span>}
        {currentStage && (
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>
            Live stage: <b style={{ color: deptColor(currentStage.dept) }}>{currentStage.dept} · {currentStage.action}</b>
          </span>
        )}
      </div>
      {task.now && task.now !== '-' && (
        <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 6 }}>
          {task.now.substring(0, 100)}
        </div>
      )}
      {(task.review_round || 0) > 0 && (
        <div style={{ fontSize: 11, marginBottom: 6 }}>
          {Array.from({ length: task.review_round || 0 }, (_, index) => (
            <span
              key={index}
              style={{
                display: 'inline-block', width: 14, height: 14, borderRadius: '50%',
                background: index < (task.review_round || 0) - 1 ? '#1a3a6a22' : 'var(--acc)22',
                border: `1px solid ${index < (task.review_round || 0) - 1 ? '#2a4a8a' : 'var(--acc)'}`,
                fontSize: 9, textAlign: 'center', lineHeight: '13px', marginRight: 2,
                color: index < (task.review_round || 0) - 1 ? '#4a6aaa' : 'var(--acc)',
              }}
            >
              {index + 1}
            </span>
          ))}
          <span style={{ color: 'var(--muted)', fontSize: 10 }}>Review round {task.review_round}</span>
        </div>
      )}
      {totalTodos > 0 && (
        <div className="ec-todo-bar">
          <span>📋 {doneTodos}/{totalTodos}</span>
          <div className="ec-todo-track">
            <div className="ec-todo-fill" style={{ width: `${Math.round((doneTodos / totalTodos) * 100)}%` }} />
          </div>
          <span>{doneTodos === totalTodos ? 'Completed' : 'In progress'}</span>
        </div>
      )}
      <div className="ec-footer">
        <span className={`hb ${heartbeat.status}`}>{heartbeat.label}</span>
        {isBlocked && (
          <span className="tag" style={{ borderColor: '#ff527044', color: 'var(--danger)', background: '#200a10' }}>
            🚫 {task.block}
          </span>
        )}
        {task.eta && task.eta !== '-' && (
          <span style={{ fontSize: 11, color: 'var(--muted)' }}>📅 {task.eta}</span>
        )}
      </div>
      <div className="ec-actions" onClick={(event) => event.stopPropagation()}>
        {canStop && (
          <>
            <button className="mini-act" onClick={(event) => handleAction('stop', event)}>⏸ Stop</button>
            <button className="mini-act danger" onClick={(event) => handleAction('cancel', event)}>🚫 Cancel</button>
          </>
        )}
        {canResume && <button className="mini-act" onClick={(event) => handleAction('resume', event)}>▶ Resume</button>}
        {archived && !task.archived && <button className="mini-act" onClick={handleArchive}>📦 Archive</button>}
        {task.archived && <button className="mini-act" onClick={handleArchive}>📤 Restore</button>}
      </div>
    </div>
  );
}

export default function EdictBoard() {
  const liveStatus = useStore((s) => s.liveStatus);
  const edictFilter = useStore((s) => s.edictFilter);
  const setEdictFilter = useStore((s) => s.setEdictFilter);
  const toast = useStore((s) => s.toast);
  const loadAll = useStore((s) => s.loadAll);

  const tasks = liveStatus?.tasks || [];
  const allDirectives = tasks.filter(isEdict);
  const activeDirectives = allDirectives.filter((task) => !isArchived(task));
  const archivedDirectives = allDirectives.filter((task) => isArchived(task));

  let directives: Task[];
  if (edictFilter === 'active') directives = activeDirectives;
  else if (edictFilter === 'archived') directives = archivedDirectives;
  else directives = allDirectives;

  directives.sort((left, right) => {
    const ls = normalizeTaskState(left.state || '');
    const rs = normalizeTaskState(right.state || '');
    return (STATE_ORDER[ls] ?? 9) - (STATE_ORDER[rs] ?? 9);
  });

  const unarchivedDone = allDirectives.filter((task) => !task.archived && isTerminalState(task.state || ''));

  const handleArchiveAll = async () => {
    if (!confirm('Archive all completed or cancelled directives?')) return;
    try {
      const result = await api.archiveAllDone();
      if (result.ok) {
        toast(`📦 Archived ${result.count || 0} directives`);
        loadAll();
      } else {
        toast(result.error || 'Bulk archive failed', 'err');
      }
    } catch {
      toast('Backend connection failed', 'err');
    }
  };

  const handleScan = async () => {
    try {
      const result = await api.schedulerScan();
      if (result.ok) toast(`🧭 Scheduler scan complete: ${result.count || 0} actions`);
      else toast(result.error || 'Scheduler scan failed', 'err');
      loadAll();
    } catch {
      toast('Backend connection failed', 'err');
    }
  };

  return (
    <div>
      <div className="archive-bar">
        <span className="ab-label">Filter:</span>
        {(['active', 'archived', 'all'] as const).map((filter) => (
          <button
            key={filter}
            className={`ab-btn ${edictFilter === filter ? 'active' : ''}`}
            onClick={() => setEdictFilter(filter)}
          >
            {filter === 'active' ? 'Active' : filter === 'archived' ? 'Archived' : 'All'}
          </button>
        ))}
        {unarchivedDone.length > 0 && <button className="ab-btn" onClick={handleArchiveAll}>📦 Archive completed</button>}
        <span className="ab-count">
          Active {activeDirectives.length} · Archived {archivedDirectives.length} · Total {allDirectives.length}
        </span>
        <button className="ab-scan" onClick={handleScan}>🧭 Run scheduler scan</button>
      </div>

      <div className="edict-grid">
        {directives.length === 0 ? (
          <div className="empty" style={{ gridColumn: '1/-1' }}>
            No directives yet.<br />
            <small style={{ fontSize: 11, marginTop: 6, display: 'block', color: 'var(--muted)' }}>
              New work enters through the President → Chief of Staff → NSC pipeline.
            </small>
          </div>
        ) : (
          directives.map((directive) => <DirectiveCard key={directive.id} task={directive} />)
        )}
      </div>
    </div>
  );
}
