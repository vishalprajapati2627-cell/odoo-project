import { useState } from 'react';
import { useApp } from '../context/AppContext';
import './Notifications.css';

const TABS = ['All', 'Alerts', 'Approvals', 'Bookings'];

export default function Notifications() {
  const { logs } = useApp();
  const [tab, setTab] = useState('All');

  const filtered = tab === 'All' ? logs : logs.filter(l => l.category === tab);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs &amp; Notifications</h1>
          <p className="page-sub">Every allocation, booking, transfer, and maintenance update is logged with who and when.</p>
        </div>
      </div>

      <div className="notif-tabs">
        {TABS.map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : ''}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      <div className="card">
        <ul className="notif-list">
          {filtered.map(log => (
            <li key={log.id}>
              <input type="checkbox" defaultChecked readOnly />
              <span className="notif-text">{log.text}</span>
              <span className="notif-time">{log.time}</span>
            </li>
          ))}
          {filtered.length === 0 && <li className="notif-empty">Nothing here yet.</li>}
        </ul>
      </div>
    </div>
  );
}
