import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import './OrgSetup.css';

const ROLES = ['Employee', 'Asset Manager', 'Department Head', 'Admin'];

export default function OrgSetup() {
  const {
    departments, addDepartment,
    categories, addCategory, categoryCounts,
    employees, setEmployees, addEmployee,
    user,
  } = useApp();

  const [tab, setTab] = useState('departments');
  const [showAdd, setShowAdd] = useState(false);

  const [deptForm, setDeptForm] = useState({ name: '', head: '', parent: '' });
  const [catForm, setCatForm] = useState('');
  const [empForm, setEmpForm] = useState({ name: '', email: '', dept: departments[0]?.name || '' });

  if (user?.role !== 'Admin') {
    return (
      <div className="card" style={{ padding: 24 }}>
        <h1 className="page-title">Organization Setup</h1>
        <p className="page-sub">Only Admins can access this screen. Ask an existing Admin to promote your account here once you're set up.</p>
      </div>
    );
  }

  const promote = (empId, newRole) => {
    setEmployees(prev => prev.map(e => e.id === empId ? { ...e, role: newRole } : e));
  };

  const switchTab = (t) => { setTab(t); setShowAdd(false); };

  const submitAdd = (e) => {
    e.preventDefault();
    if (tab === 'departments') {
      if (!deptForm.name) return;
      addDepartment(deptForm);
      setDeptForm({ name: '', head: '', parent: '' });
    } else if (tab === 'categories') {
      if (!catForm) return;
      addCategory(catForm);
      setCatForm('');
    } else if (tab === 'employees') {
      if (!empForm.name || !empForm.email) return;
      addEmployee(empForm);
      setEmpForm({ name: '', email: '', dept: departments[0]?.name || '' });
    }
    setShowAdd(false);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Organization Setup</h1>
          <p className="page-sub">Role assignment happens only here — employees can't self-select a role at signup.</p>
        </div>
      </div>

      <div className="org-tabs">
        <button className={`btn ${tab === 'departments' ? 'btn-primary' : ''}`} onClick={() => switchTab('departments')}>Departments</button>
        <button className={`btn ${tab === 'categories' ? 'btn-primary' : ''}`} onClick={() => switchTab('categories')}>Categories</button>
        <button className={`btn ${tab === 'employees' ? 'btn-primary' : ''}`} onClick={() => switchTab('employees')}>Employee</button>
        <button className="btn btn-primary org-add-btn" onClick={() => setShowAdd(v => !v)}>{showAdd ? 'Cancel' : '+ Add'}</button>
      </div>

      {showAdd && (
        <form className="card org-add-form" onSubmit={submitAdd}>
          {tab === 'departments' && (
            <div className="org-add-row">
              <div>
                <label className="field-label">Department name</label>
                <input className="input" placeholder="e.g. Marketing" value={deptForm.name} onChange={e => setDeptForm({ ...deptForm, name: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Head</label>
                <input className="input" placeholder="e.g. Neha Kapoor" value={deptForm.head} onChange={e => setDeptForm({ ...deptForm, head: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Parent dept (optional)</label>
                <select className="input" value={deptForm.parent} onChange={e => setDeptForm({ ...deptForm, parent: e.target.value })}>
                  <option value="">--</option>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>
          )}

          {tab === 'categories' && (
            <div className="org-add-row">
              <div style={{ flex: 1 }}>
                <label className="field-label">Category name</label>
                <input className="input" placeholder="e.g. Appliances" value={catForm} onChange={e => setCatForm(e.target.value)} />
              </div>
            </div>
          )}

          {tab === 'employees' && (
            <div className="org-add-row">
              <div>
                <label className="field-label">Name</label>
                <input className="input" placeholder="e.g. Neha Kapoor" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Email</label>
                <input className="input" type="email" placeholder="name@company.com" value={empForm.email} onChange={e => setEmpForm({ ...empForm, email: e.target.value })} />
              </div>
              <div>
                <label className="field-label">Department</label>
                <select className="input" value={empForm.dept} onChange={e => setEmpForm({ ...empForm, dept: e.target.value })}>
                  {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                </select>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ marginTop: 14 }}>Save</button>
          <p className="org-add-note">
            {tab === 'employees'
              ? 'New employees are added with the default Employee role — promote them below once created.'
              : 'No role selection happens here — that stays in the Employee tab, on purpose.'}
          </p>
        </form>
      )}

      {tab === 'departments' && (
        <div className="card">
          <table>
            <thead>
              <tr><th>Department</th><th>Head</th><th>Parent Dept</th><th>Status</th></tr>
            </thead>
            <tbody>
              {departments.map(d => (
                <tr key={d.id}>
                  <td>{d.name}</td>
                  <td>{d.head}</td>
                  <td>{d.parent}</td>
                  <td><StatusBadge status={d.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="org-note">Editing a department here also updates the department picklist used in Assets and Allocation & Transfer.</p>
        </div>
      )}

      {tab === 'categories' && (
        <div className="card">
          <table>
            <thead><tr><th>Category</th><th>Assets in category</th></tr></thead>
            <tbody>
              {categories.map(c => (
                <tr key={c}><td>{c}</td><td className="mono">{categoryCounts[c] ?? 0}</td></tr>
              ))}
            </tbody>
          </table>
          <p className="org-note">Categories created here immediately appear in the Register Asset form.</p>
        </div>
      )}

      {tab === 'employees' && (
        <div className="card">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Role</th></tr></thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.id}>
                  <td>{emp.name}</td>
                  <td className="mono" style={{ fontSize: 12.5 }}>{emp.email}</td>
                  <td>{emp.dept}</td>
                  <td>
                    <select className="input" style={{ width: 170, padding: '5px 8px' }} value={emp.role} onChange={(e) => promote(emp.id, e.target.value)}>
                      {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="org-note">Role assignment — Asset Manager, Department Head, Admin — happens only here.</p>
        </div>
      )}
    </div>
  );
}