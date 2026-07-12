import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import './AllocationTransfer.css';

export default function AllocationTransfer() {
  const { assets, employees, allocateAsset, requestTransfer, returnAsset, allocationHistory } = useApp();
  const [selectedTag, setSelectedTag] = useState(assets[0]?.tag || '');
  const [toEmployee, setToEmployee] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState(null); // { type: 'error'|'success', text }

  const asset = assets.find(a => a.tag === selectedTag);
  const isBlocked = asset && asset.status === 'Allocated';
  const history = allocationHistory.filter(h => h.tag === selectedTag);

  const handleAllocate = () => {
    if (!toEmployee) { setMessage({ type: 'error', text: 'Choose an employee to allocate to.' }); return; }
    const emp = employees.find(e => e.id === toEmployee);
    const result = allocateAsset(selectedTag, emp.name, emp.dept);
    setMessage(result.ok ? { type: 'success', text: `${selectedTag} allocated to ${emp.name}.` } : { type: 'error', text: result.message });
  };

  const handleTransferRequest = () => {
    if (!toEmployee || !reason) { setMessage({ type: 'error', text: 'Select a destination employee and add a reason.' }); return; }
    const emp = employees.find(e => e.id === toEmployee);
    const result = requestTransfer(selectedTag, emp.name, emp.dept, reason);
    setMessage({ type: 'success', text: result.message });
    setReason('');
  };

  const handleReturn = (condition) => {
    returnAsset(selectedTag, condition);
    setMessage({ type: 'success', text: `${selectedTag} returned — condition: ${condition}.` });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Allocation &amp; Transfer</h1>
          <p className="page-sub">Direct re-allocation of an already-assigned asset is blocked — a transfer request is required instead.</p>
        </div>
      </div>

      <div className="card alloc-card">
        <label className="field-label">Asset</label>
        <select className="input" value={selectedTag} onChange={e => { setSelectedTag(e.target.value); setMessage(null); }}>
          {assets.map(a => <option key={a.tag} value={a.tag}>{a.tag} — {a.name}</option>)}
        </select>

        <div className="alloc-status-row">
          <StatusBadge status={asset?.status} />
          {asset?.holder && <span className="alloc-holder">held by {asset.holder} ({asset.dept})</span>}
        </div>

        {isBlocked && (
          <div className="alloc-block-banner">
            Already allocated to {asset.holder} ({asset.dept}).<br />
            Direct re-allocation is blocked — submit a transfer request below.
          </div>
        )}

        {message && (
          <div className={message.type === 'error' ? 'alloc-message-error' : 'alloc-message-success'}>
            {message.text}
          </div>
        )}

        {!isBlocked && asset?.status === 'Available' && (
          <div className="alloc-section">
            <label className="field-label">Assign to</label>
            <select className="input" value={toEmployee} onChange={e => setToEmployee(e.target.value)}>
              <option value="">Select employee…</option>
              {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.dept}</option>)}
            </select>
            <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={handleAllocate}>Allocate asset</button>
          </div>
        )}

        {isBlocked && (
          <div className="alloc-section">
            <h3 className="alloc-section-title">Transfer Request</h3>
            <div className="alloc-transfer-row">
              <div>
                <label className="field-label">From</label>
                <input className="input" value={asset.holder} disabled />
              </div>
              <div>
                <label className="field-label">To</label>
                <select className="input" value={toEmployee} onChange={e => setToEmployee(e.target.value)}>
                  <option value="">Select employee…</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.name} — {e.dept}</option>)}
                </select>
              </div>
            </div>
            <label className="field-label" style={{ marginTop: 12 }}>Reason</label>
            <textarea className="input" rows={3} value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is this asset being transferred?" />
            <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={handleTransferRequest}>Submit request</button>
          </div>
        )}

        {asset?.status === 'Allocated' && (
          <div className="alloc-section">
            <h3 className="alloc-section-title">Return this asset</h3>
            <div className="return-actions">
              <button className="btn" onClick={() => handleReturn('Good')}>Return — Good condition</button>
              <button className="btn btn-danger" onClick={() => handleReturn('Damaged')}>Return — Damaged</button>
            </div>
          </div>
        )}

        <div className="alloc-history">
          <h3 className="alloc-section-title">Allocation history</h3>
          {history.length === 0 && <p className="alloc-history-empty">No history yet for this asset.</p>}
          <ul>
            {history.map((h, i) => (
              <li key={i}>
                <span>{h.text}{h.pending && <span className="badge badge-warning" style={{ marginLeft: 8 }}>Pending approval</span>}</span>
                <span className="alloc-history-date">{h.date}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
