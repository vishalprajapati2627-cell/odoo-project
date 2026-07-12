import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Maintenance.css';

export default function Maintenance() {
  const { maintenance, maintenanceColumns, advanceMaintenance, raiseMaintenanceRequest, assets } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [tag, setTag] = useState(assets[0]?.tag || '');
  const [issue, setIssue] = useState('');

  const handleRaise = (e) => {
    e.preventDefault();
    if (!issue) return;
    raiseMaintenanceRequest(tag, issue, 'You');
    setIssue('');
    setShowForm(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-sub">Approving a card moves the asset to Under Maintenance; resolving returns it to Available.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>{showForm ? 'Cancel' : 'Raise request'}</button>
      </div>

      {showForm && (
        <form className="card maint-form" onSubmit={handleRaise}>
          <div className="maint-form-row">
            <div>
              <label className="field-label">Asset</label>
              <select className="input" value={tag} onChange={e => setTag(e.target.value)}>
                {assets.map(a => <option key={a.tag} value={a.tag}>{a.tag} — {a.name}</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label className="field-label">Issue</label>
              <input className="input" placeholder="Describe the problem" value={issue} onChange={e => setIssue(e.target.value)} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 12 }}>Submit request</button>
        </form>
      )}

      <div className="kanban">
        {maintenanceColumns.map(col => (
          <div key={col} className="kanban-col">
            <div className="kanban-col-header">{col}</div>
            <div className="kanban-col-body">
              {maintenance.filter(m => m.status === col).map(m => (
                <div key={m.id} className="kanban-card">
                  <div className="kanban-card-tag mono">{m.tag}</div>
                  <div className="kanban-card-issue">{m.issue}</div>
                  <div className="kanban-card-meta">
                    <span>{m.raisedBy}</span>
                    {m.technician && <span>• {m.technician}</span>}
                  </div>
                  {col !== 'Resolved' && (
                    <button className="btn btn-ghost kanban-advance" onClick={() => advanceMaintenance(m.id)}>
                      Move to {maintenanceColumns[maintenanceColumns.indexOf(col) + 1]} →
                    </button>
                  )}
                </div>
              ))}
              {maintenance.filter(m => m.status === col).length === 0 && (
                <div className="kanban-empty">No items</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
