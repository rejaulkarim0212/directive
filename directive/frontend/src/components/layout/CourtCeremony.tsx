import { useEffect, useState } from 'react';
import { useStore } from '../../store';
import { isEdict, isTerminalState, normalizeTaskState } from '../../utils';

export default function CourtCeremony() {
  const liveStatus = useStore((s) => s.liveStatus);
  const showCeremony = useStore((s) => s.showCeremony);
  const hideCeremony = useStore((s) => s.hideCeremony);
  const [show, setShow] = useState(false);
  const [out, setOut] = useState(false);

  // 响应 store 的触发
  useEffect(() => {
    if (showCeremony) {
      setShow(true);
      setOut(false);
      const timer = setTimeout(() => skip(), 3500);
      return () => clearTimeout(timer);
    }
  }, [showCeremony]);

  // 首次加载检查（每天只显示一次）
  useEffect(() => {
    const lastOpen = localStorage.getItem('openclaw_court_date');
    const today = new Date().toISOString().substring(0, 10);
    const pref = JSON.parse(localStorage.getItem('openclaw_court_pref') || '{"enabled":true}');
    if (!pref.enabled || lastOpen === today) return;
    localStorage.setItem('openclaw_court_date', today);
    setShow(true);
    const timer = setTimeout(() => skip(), 3500);
    return () => clearTimeout(timer);
  }, []);

  const skip = () => {
    setOut(true);
    setTimeout(() => {
      setShow(false);
      hideCeremony();
    }, 500);
  };

  if (!show) return null;

  const tasks = liveStatus?.tasks || [];
  const jjc = tasks.filter(isEdict);
  const pending = jjc.filter((t) => !isTerminalState(t.state || '')).length;
  const done = jjc.filter((t) => normalizeTaskState(t.state || '') === 'completed').length;
  const overdue = jjc.filter(
    (t) => !isTerminalState(t.state || '') && t.eta && new Date(t.eta.replace(' ', 'T')) < new Date()
  ).length;

  const d = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} · ${days[d.getDay()]}`;

  return (
    <div className={`ceremony-bg${out ? ' out' : ''}`} onClick={skip}>
      <div className="crm-glow" />
      <div className="crm-line1 in">🏛 Situation Room</div>
      <div className="crm-line2 in">Executive Order Dashboard</div>
      <div className="crm-line3 in">
        Active {pending} · Completed {done}{overdue > 0 && ` · ⚠ Overdue ${overdue}`}
      </div>
      <div className="crm-date in">{dateStr}</div>
      <div className="crm-skip">Click to skip</div>
    </div>
  );
}
