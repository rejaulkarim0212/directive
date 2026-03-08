import { useEffect } from 'react';
import { useStore } from '../../store';
import { STATE_LABEL } from '../../constants';
import { normalizeTaskState } from '../../utils';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function OfficialPanel() {
  const officialsData = useStore((s) => s.officialsData);
  const selectedOfficial = useStore((s) => s.selectedOfficial);
  const setSelectedOfficial = useStore((s) => s.setSelectedOfficial);
  const loadOfficials = useStore((s) => s.loadOfficials);
  const setModalTaskId = useStore((s) => s.setModalTaskId);

  useEffect(() => {
    loadOfficials();
  }, [loadOfficials]);

  if (!officialsData?.officials) {
    return <div className="empty">Backend is offline. Start the local server first.</div>;
  }

  const offices = officialsData.officials;
  const totals = officialsData.totals || { tasks_done: 0, cost_cny: 0 };
  const maxTokens = Math.max(...offices.map((o) => o.tokens_in + o.tokens_out + o.cache_read + o.cache_write), 1);
  const activeOffices = offices.filter((o) => o.heartbeat?.status === 'active');
  const selected = offices.find((o) => o.id === (selectedOfficial || offices[0]?.id));
  const selectedId = selected?.id || offices[0]?.id;

  return (
    <div>
      {activeOffices.length > 0 && (
        <div className="off-activity">
          <span>🟢 Active now:</span>
          {activeOffices.map((office) => (
            <span key={office.id} style={{ fontSize: 12 }}>{office.emoji} {office.role}</span>
          ))}
          <span style={{ color: 'var(--muted)', fontSize: 11, marginLeft: 'auto' }}>All other offices are on standby</span>
        </div>
      )}

      <div className="off-kpi">
        <div className="kpi">
          <div className="kpi-v" style={{ color: 'var(--acc)' }}>{offices.length}</div>
          <div className="kpi-l">Cabinet offices</div>
        </div>
        <div className="kpi">
          <div className="kpi-v" style={{ color: '#f5c842' }}>{totals.tasks_done || 0}</div>
          <div className="kpi-l">Completed directives</div>
        </div>
        <div className="kpi">
          <div className="kpi-v" style={{ color: (totals.cost_cny || 0) > 20 ? 'var(--warn)' : 'var(--ok)' }}>
            ¥{totals.cost_cny || 0}
          </div>
          <div className="kpi-l">Estimated spend</div>
        </div>
        <div className="kpi">
          <div className="kpi-v" style={{ fontSize: 16, paddingTop: 4 }}>{officialsData.top_official || '—'}</div>
          <div className="kpi-l">Top performer</div>
        </div>
      </div>

      <div className="off-layout">
        <div className="off-ranklist">
          <div className="orl-hdr">Performance Rank</div>
          {offices.map((office) => {
            const heartbeat = office.heartbeat || { status: 'idle' };
            return (
              <div
                key={office.id}
                className={`orl-item${selectedId === office.id ? ' selected' : ''}`}
                onClick={() => setSelectedOfficial(office.id)}
              >
                <span style={{ minWidth: 24, textAlign: 'center' }}>
                  {office.merit_rank <= 3 ? MEDALS[office.merit_rank - 1] : '#' + office.merit_rank}
                </span>
                <span>{office.emoji}</span>
                <span style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{office.role}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)' }}>{office.label}</div>
                </span>
                <span style={{ fontSize: 11 }}>{office.merit_score} pts</span>
                <span className={`dc-dot ${heartbeat.status}`} style={{ width: 8, height: 8 }} />
              </div>
            );
          })}
        </div>

        <div className="off-detail">
          {selected ? (
            <OfficeDetail office={selected} maxTokens={maxTokens} onOpenTask={setModalTaskId} />
          ) : (
            <div className="empty">Select an office on the left to inspect it.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function OfficeDetail({
  office,
  maxTokens,
  onOpenTask,
}: {
  office: NonNullable<ReturnType<typeof useStore.getState>['officialsData']>['officials'][0];
  maxTokens: number;
  onOpenTask: (id: string) => void;
}) {
  const heartbeat = office.heartbeat || { status: 'idle', label: 'Idle' };
  const totalTokens = office.tokens_in + office.tokens_out + office.cache_read + office.cache_write;
  const directives = office.participated_edicts || [];

  const tokenBars = [
    { label: 'Input', value: office.tokens_in, color: '#6a9eff' },
    { label: 'Output', value: office.tokens_out, color: '#a07aff' },
    { label: 'Cache read', value: office.cache_read, color: '#2ecc8a' },
    { label: 'Cache write', value: office.cache_write, color: '#f5c842' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
        <div style={{ fontSize: 40 }}>{office.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{office.role}</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>
            {office.label} · <span style={{ color: 'var(--acc)' }}>{office.model_short || office.model}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
            🏅 {office.rank} · Merit score {office.merit_score}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className={`hb ${heartbeat.status}`} style={{ marginBottom: 4 }}>{heartbeat.label}</div>
          {office.last_active && <div style={{ fontSize: 10, color: 'var(--muted)' }}>Last active {office.last_active}</div>}
          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>
            {office.sessions} sessions · {office.messages} messages
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div className="sec-title">Office Metrics</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10 }}>
          <MetricCard label="Completed" value={String(office.tasks_done)} color="#f5c842" />
          <MetricCard label="Active" value={String(office.tasks_active)} color="#6a9eff" />
          <MetricCard label="Sessions" value={String(office.sessions)} color="#2ecc8a" />
          <MetricCard label="Flow touches" value={String(office.flow_participations)} color="#a07aff" />
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div className="sec-title">Token Footprint</div>
        <div style={{ marginBottom: 8, fontSize: 12, color: 'var(--muted)' }}>Total {totalTokens.toLocaleString()} tokens</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tokenBars.map((bar) => (
            <div key={bar.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4 }}>
                <span>{bar.label}</span>
                <span style={{ color: 'var(--muted)' }}>{bar.value.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: 'var(--panel2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${Math.max(2, (bar.value / maxTokens) * 100)}%`, height: '100%', background: bar.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <div className="sec-title">Cost Snapshot</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
          <MetricCard label="USD" value={`$${office.cost_usd || 0}`} color="#2ecc8a" />
          <MetricCard label="CNY" value={`¥${office.cost_cny || 0}`} color="#f5c842" />
          <MetricCard label="Merit rank" value={`#${office.merit_rank || '—'}`} color="#a07aff" />
        </div>
      </div>

      <div>
        <div className="sec-title">Directive Involvement ({directives.length})</div>
        {directives.length === 0 ? (
          <div style={{ fontSize: 12, color: 'var(--muted)', padding: '8px 0' }}>No directive history yet.</div>
        ) : (
          directives.map((directive) => {
            const state = normalizeTaskState(directive.state || '');
            return (
              <div
                key={directive.id}
                onClick={() => onOpenTask(directive.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 12px',
                  marginBottom: 8,
                  borderRadius: 10,
                  background: 'var(--panel2)',
                  border: '1px solid var(--line)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 11, color: 'var(--acc)', minWidth: 96 }}>{directive.id}</span>
                <span style={{ flex: 1, fontSize: 12 }}>{directive.title}</span>
                <span className={`tag st-${state}`} style={{ fontSize: 10 }}>{STATE_LABEL[state] || state}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ background: 'var(--panel2)', border: '1px solid var(--line)', borderRadius: 10, padding: '12px 14px' }}>
      <div style={{ fontSize: 10, color: 'var(--muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 800, color }}>{value}</div>
    </div>
  );
}
