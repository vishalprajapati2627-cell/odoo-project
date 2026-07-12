import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import './Assets.css';

const CATEGORIES = ['Electronics', 'Furniture', 'Vehicles', 'Tools'];

export default function Assets() {
  const { assets, registerAsset } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', category: CATEGORIES[0], location: '' });
  const [justRegistered, setJustRegistered] = useState(null);

  const filtered = useMemo(() => {
    return assets.filter(a => {
      const matchesSearch = !search ||
        a.tag.toLowerCase().includes(search.toLowerCase()) ||
        a.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  const handleRegister = (e) => {
    e.preventDefault();
    if (!form.name) return;
    const asset = registerAsset(form);
    setJustRegistered(asset.tag);
    setForm({ name: '', category: CATEGORIES[0], location: '' });
    setShowForm(false);
    setTimeout(() => setJustRegistered(null), 4000);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Assets</h1>
          <p className="page-sub">Every asset enters the system as Available and gets an auto-generated tag.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(v => !v)}>
          {showForm ? 'Cancel' : '+ Register Asset'}
        </button>
      </div>

      {justRegistered && (
        <div className="asset-success-banner">
          Asset registered as <span className="mono">{justRegistered}</span> — status: Available.
        </div>
      )}

      {showForm && (
        <form className="card asset-form" onSubmit={handleRegister}>
          <div className="asset-form-row">
            <div>
              <label className="field-label">Asset name</label>
              <input className="input" placeholder="e.g. Dell Laptop" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">Location</label>
              <input className="input" placeholder="e.g. Warehouse" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }}>Save asset</button>
        </form>
      )}

      <div className="asset-filters">
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search by tag, name, or serial..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className="input" style={{ maxWidth: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option>Available</option>
          <option>Allocated</option>
          <option>Maintenance</option>
          <option>Lost</option>
        </select>
      </div>

      <div className="card">
        <table>
          <thead>
            <tr><th>Tag</th><th>Name</th><th>Category</th><th>Status</th><th>Location / Holder</th></tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.tag}>
                <td className="mono">{a.tag}</td>
                <td>{a.name}</td>
                <td>{a.category}</td>
                <td><StatusBadge status={a.status} /></td>
                <td>{a.holder ? `${a.holder} (${a.dept})` : a.location}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={5} style={{ color: 'var(--text-faint)', textAlign: 'center', padding: 28 }}>No assets match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
