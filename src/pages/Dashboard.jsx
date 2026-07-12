import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './Dashboard.css';

export default function Dashboard() {
  const { kpis, logs } = useApp();
  const navigate = useNavigate();

  const cards = [
    { label: 'Available Assets', value: kpis.available },
    { label: 'Allocated', value: kpis.allocated },
    { label: 'Active Bookings', value: kpis.activeBookings },
    { label: 'Pending Transfers', value: kpis.pendingTransfers },
    { label: 'Upcoming Returns', value: kpis.upcomingReturns },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Today's Overview</h1>
          <p className="page-sub">A snapshot of everything moving through AssetFlow right now.</p>
        </div>
      </div>

      <div className="kpi-grid">
        {cards.map(c => (
          <div key={c.label} className="card kpi-card">
            <div className="kpi-value">{c.value}</div>
            <div className="kpi-label">{c.label}</div>
          </div>
        ))}
      </div>

      {kpis.overdue > 0 && (
        <div className="alert-banner">
          {kpis.overdue} assets overdue for return — flagged for follow-up
        </div>
      )}

      <div className="quick-actions">
        <button className="btn btn-primary" onClick={() => navigate('/assets')}>+ Register Asset</button>
        <button className="btn" onClick={() => navigate('/booking')}>Book Resource</button>
        <button className="btn" onClick={() => navigate('/maintenance')}>Raise Request</button>
      </div>

      <div className="card activity-card">
        <h2 className="section-title">Recent Activity</h2>
        <ul className="activity-list">
          {logs.slice(0, 6).map(log => (
            <li key={log.id}>
              <span>{log.text}</span>
              <span className="activity-time">{log.time}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
