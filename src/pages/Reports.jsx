import './Reports.css';

const utilization = [
  { dept: 'Engineering', value: 82 },
  { dept: 'Facilities', value: 54 },
  { dept: 'Field Ops', value: 68 },
  { dept: 'Sales', value: 40 },
  { dept: 'Design', value: 71 },
];

const maintenanceTrend = [3, 5, 4, 7, 6, 9, 8];

export default function Reports() {
  const max = Math.max(...utilization.map(u => u.value));
  const maxTrend = Math.max(...maintenanceTrend);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports &amp; Analytics</h1>
          <p className="page-sub">Usage, maintenance trends, and idle assets at a glance.</p>
        </div>
        <button className="btn">Export report</button>
      </div>

      <div className="reports-charts">
        <div className="card report-chart-card">
          <h3 className="alloc-section-title">Utilization by department</h3>
          <div className="bar-chart">
            {utilization.map(u => (
              <div key={u.dept} className="bar-col">
                <div className="bar" style={{ height: `${(u.value / max) * 100}%` }} />
                <span className="bar-label">{u.dept}</span>
                <span className="bar-value mono">{u.value}%</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card report-chart-card">
          <h3 className="alloc-section-title">Maintenance frequency</h3>
          <svg viewBox="0 0 300 140" className="line-chart">
            <polyline
              fill="none"
              stroke="var(--danger)"
              strokeWidth="2.5"
              points={maintenanceTrend.map((v, i) => `${i * 45 + 10},${120 - (v / maxTrend) * 100}`).join(' ')}
            />
            {maintenanceTrend.map((v, i) => (
              <circle key={i} cx={i * 45 + 10} cy={120 - (v / maxTrend) * 100} r="3" fill="var(--danger)" />
            ))}
          </svg>
        </div>
      </div>

      <div className="reports-lists">
        <div className="card report-list-card">
          <h3 className="alloc-section-title">Most used assets</h3>
          <ul>
            <li><span>Room B2</span><span className="mono">34 bookings this month</span></li>
            <li><span>Van AF-0343</span><span className="mono">21 trips this month</span></li>
            <li><span>Projector AF-0335</span><span className="mono">18 uses</span></li>
          </ul>
        </div>
        <div className="card report-list-card">
          <h3 className="alloc-section-title">Idle assets</h3>
          <ul>
            <li><span>Camera AF-0301</span><span className="mono">unused 60+ days</span></li>
            <li><span>Chair AF-0410</span><span className="mono">unused 45 days</span></li>
          </ul>
        </div>
        <div className="card report-list-card">
          <h3 className="alloc-section-title">Due for maintenance / nearing retirement</h3>
          <ul>
            <li><span>Forklift AF-0087</span><span className="mono">service due in 5 days</span></li>
            <li><span>Laptop AF-0020</span><span className="mono">4 years old — nearing retirement</span></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
