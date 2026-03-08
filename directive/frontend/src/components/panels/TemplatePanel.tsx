import { useMemo, useState } from 'react';
import { useStore } from '../../store';
import { api } from '../../api';
import { TEMPLATES, TPL_CATS, type Template } from '../../constants';

export default function TemplatePanel() {
  const tplCatFilter = useStore((s) => s.tplCatFilter);
  const setTplCatFilter = useStore((s) => s.setTplCatFilter);
  const loadAll = useStore((s) => s.loadAll);
  const toast = useStore((s) => s.toast);

  const [formTpl, setFormTpl] = useState<Template | null>(null);
  const [formVals, setFormVals] = useState<Record<string, string>>({});
  const [previewCmd, setPreviewCmd] = useState('');

  const playbooks = useMemo(() => {
    if (tplCatFilter === 'All') return TEMPLATES;
    return TEMPLATES.filter((tpl) => tpl.cat === tplCatFilter);
  }, [tplCatFilter]);

  const openForm = (tpl: Template) => {
    const nextVals: Record<string, string> = {};
    tpl.params.forEach((param) => {
      nextVals[param.key] = param.default || '';
    });
    setFormVals(nextVals);
    setPreviewCmd('');
    setFormTpl(tpl);
  };

  const buildCommand = (tpl: Template) => {
    let command = tpl.command;
    for (const param of tpl.params) {
      const value = formVals[param.key] || param.default || '';
      command = command.replace(new RegExp(`\\{${param.key}\\}`, 'g'), value);
    }
    return command;
  };

  const preview = () => {
    if (!formTpl) return;
    setPreviewCmd(buildCommand(formTpl));
  };

  const execute = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!formTpl) return;
    const command = buildCommand(formTpl);
    if (!confirm(`Launch this directive?\n\n${command.substring(0, 240)}${command.length > 240 ? '…' : ''}`)) return;

    try {
      const params: Record<string, string> = {};
      for (const param of formTpl.params) {
        params[param.key] = formVals[param.key] || param.default || '';
      }
      const result = await api.createTask({
        title: command.substring(0, 120),
        org: 'National Security Council',
        targetDept: formTpl.depts[0] || '',
        priority: 'normal',
        templateId: formTpl.id,
        params,
      });
      if (result.ok) {
        toast(`📜 ${result.taskId} launched`, 'ok');
        setFormTpl(null);
        loadAll();
      } else {
        toast(result.error || 'Directive launch failed', 'err');
      }
    } catch {
      toast('Backend connection failed', 'err');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {TPL_CATS.map((category) => (
          <span
            key={category.name}
            className={`tpl-cat${tplCatFilter === category.name ? ' active' : ''}`}
            onClick={() => setTplCatFilter(category.name)}
          >
            {category.icon} {category.name}
          </span>
        ))}
      </div>

      <div className="tpl-grid">
        {playbooks.map((playbook) => (
          <div className="tpl-card" key={playbook.id}>
            <div className="tpl-top">
              <span className="tpl-icon">{playbook.icon}</span>
              <span className="tpl-name">{playbook.name}</span>
            </div>
            <div className="tpl-desc">{playbook.desc}</div>
            <div className="tpl-footer">
              {playbook.depts.map((dept) => (
                <span className="tpl-dept" key={dept}>{dept}</span>
              ))}
              <span className="tpl-est">{playbook.est} · {playbook.cost}</span>
              <button className="tpl-go" onClick={() => openForm(playbook)}>Launch</button>
            </div>
          </div>
        ))}
      </div>

      {formTpl && (
        <div className="modal-bg open" onClick={() => setFormTpl(null)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <button className="modal-close" onClick={() => setFormTpl(null)}>✕</button>
            <div className="modal-body">
              <div style={{ fontSize: 11, color: 'var(--acc)', fontWeight: 700, letterSpacing: '.04em', marginBottom: 4 }}>
                Directive Playbook
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                {formTpl.icon} {formTpl.name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 18 }}>{formTpl.desc}</div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 18, flexWrap: 'wrap' }}>
                {formTpl.depts.map((dept) => (
                  <span className="tpl-dept" key={dept}>{dept}</span>
                ))}
                <span style={{ fontSize: 11, color: 'var(--muted)', marginLeft: 'auto' }}>
                  {formTpl.est} · {formTpl.cost}
                </span>
              </div>

              <form className="tpl-form" onSubmit={execute}>
                {formTpl.params.map((param) => (
                  <div className="tpl-field" key={param.key}>
                    <label className="tpl-label">
                      {param.label}
                      {param.required && <span style={{ color: '#ff5270' }}> *</span>}
                    </label>
                    {param.type === 'textarea' ? (
                      <textarea
                        className="tpl-input"
                        style={{ minHeight: 80, resize: 'vertical' }}
                        required={param.required}
                        value={formVals[param.key] || ''}
                        onChange={(event) => setFormVals((value) => ({ ...value, [param.key]: event.target.value }))}
                      />
                    ) : param.type === 'select' ? (
                      <select
                        className="tpl-input"
                        value={formVals[param.key] || param.default || ''}
                        onChange={(event) => setFormVals((value) => ({ ...value, [param.key]: event.target.value }))}
                      >
                        {(param.options || []).map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        className="tpl-input"
                        type="text"
                        required={param.required}
                        value={formVals[param.key] || ''}
                        onChange={(event) => setFormVals((value) => ({ ...value, [param.key]: event.target.value }))}
                      />
                    )}
                  </div>
                ))}

                {previewCmd && (
                  <div
                    style={{
                      background: 'var(--panel2)',
                      border: '1px solid var(--line)',
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 14,
                      fontSize: 12,
                      color: 'var(--muted)',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
                      📜 Draft directive sent to NSC:
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{previewCmd}</div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                  <button type="button" className="btn btn-g" onClick={preview} style={{ padding: '8px 16px', fontSize: 12 }}>
                    Preview
                  </button>
                  <button type="submit" className="tpl-go" style={{ padding: '8px 20px', fontSize: 13 }}>
                    Launch directive
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
