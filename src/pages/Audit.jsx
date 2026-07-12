import { useApp } from '../context/AppContext';
import './Audit.css';

const VERIFICATIONS = ['Verified', 'Missing', 'Damaged'];

export default function Audit() {
  const { audits, setAuditItemVerification, closeAudit, flaggedCount } = useApp();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Asset Audit</h1>
          <p className="page-sub">Closing an audit auto-updates asset status: Missing → Lost, Damaged → Maintenance.</p>
        </div>
      </div>

      {audits.map(audit => {
        const flagged = flaggedCount(audit);
        return (
          <div key={audit.id} className="card audit-card">
            <div className="audit-header">
              <div>
                <h2 className="audit-name">{audit.name}</h2>
                <p className="audit-meta">{audit.range} · Auditors: {audit.auditors.join(', ')}</p>
              </div>
              {audit.status === 'Closed' && <span className="badge badge-neutral">Closed</span>}
            </div>

            <table>
              <thead><tr><th>Asset</th><th>Expected Location</th><th>Verification</th></tr></thead>
              <tbody>
                {audit.items.map(item => (
                  <tr key={item.tag}>
                    <td className="mono">{item.tag} — {item.name}</td>
                    <td>{item.expected}</td>
                    <td>
                      <select
                        className="input"
                        style={{ width: 150, padding: '5px 8px' }}
                        value={item.verification}
                        disabled={audit.status === 'Closed'}
                        onChange={e => setAuditItemVerification(audit.id, item.tag, e.target.value)}
                      >
                        {VERIFICATIONS.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {flagged > 0 && audit.status !== 'Closed' && (
              <div className="audit-flag-banner">
                {flagged} asset{flagged > 1 ? 's' : ''} flagged — discrepancy report generated automatically
              </div>
            )}

            {audit.status !== 'Closed' && (
              <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={() => closeAudit(audit.id)}>
                Close audit cycle
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
