import { createContext, useContext, useState, useMemo, useCallback } from 'react';

const AppContext = createContext(null);

// ---- seed data (mirrors the wireframes) --------------------------------

const seedDepartments = [
  { id: 'd1', name: 'Engineering', head: 'Aditi Rao', parent: '--', status: 'Active' },
  { id: 'd2', name: 'Facilities', head: 'Rohan Mehta', parent: '--', status: 'Active' },
  { id: 'd3', name: 'Field Ops (East)', head: 'Sana Iqbal', parent: '--', status: 'Inactive' },
];

const seedEmployees = [
  { id: 'e1', name: 'Priya Shah', email: 'priya.shah@company.com', dept: 'Engineering', role: 'Employee' },
  { id: 'e2', name: 'Arjun Nair', email: 'arjun.nair@company.com', dept: 'Facilities', role: 'Employee' },
  { id: 'e3', name: 'Aditi Rao', email: 'aditi.rao@company.com', dept: 'Engineering', role: 'Department Head' },
  { id: 'e4', name: 'Karan Verma', email: 'karan.verma@company.com', dept: 'Field Ops (East)', role: 'Asset Manager' },
];

const seedAssets = [
  { tag: 'AF-0114', name: 'Dell Laptop', category: 'Electronics', status: 'Allocated', holder: 'Priya Shah', dept: 'Engineering', location: 'Bengaluru' },
  { tag: 'AF-0062', name: 'Projector', category: 'Electronics', status: 'Maintenance', holder: null, dept: 'Facilities', location: 'HQ Floor 2' },
  { tag: 'AF-0201', name: 'Office Chair', category: 'Furniture', status: 'Available', holder: null, dept: null, location: 'Warehouse' },
  { tag: 'AF-0003', name: 'Dell Laptop', category: 'Electronics', status: 'Available', holder: null, dept: null, location: 'Desk E12' },
  { tag: 'AF-0421', name: 'Office Chair', category: 'Furniture', status: 'Available', holder: null, dept: null, location: 'Desk E14' },
  { tag: 'AF-0438', name: 'Monitor', category: 'Electronics', status: 'Available', holder: null, dept: null, location: 'Desk E15' },
];

const seedBookings = [
  { id: 'b1', resource: 'Conference Room B2', date: '2026-07-14', start: '09:00', end: '10:00', bookedBy: 'Procurement Team', status: 'Upcoming' },
];

const seedMaintenance = [
  { id: 'm1', tag: 'AF-0062', issue: 'Projector bulb not turning on', status: 'Pending', raisedBy: 'Priya Shah', technician: null },
  { id: 'm2', tag: 'AF-0003', issue: 'AC unit noisy compressor', status: 'Approved', raisedBy: 'Arjun Nair', technician: null },
  { id: 'm3', tag: 'AF-0078', issue: 'Forklift lift not smooth', status: 'Technician Assigned', raisedBy: 'Karan Verma', technician: 'R. Verma' },
  { id: 'm4', tag: 'AF-0917', issue: 'Printer jam - parts ordered', status: 'In Progress', raisedBy: 'Aditi Rao', technician: 'S. Iqbal' },
  { id: 'm5', tag: 'AF-0873', issue: 'Chair repair resolved', status: 'Resolved', raisedBy: 'Priya Shah', technician: 'R. Verma' },
];

const seedAudits = [
  {
    id: 'a1',
    name: 'Q3 Audit: Engineering Dept',
    range: '1 - 15 Jul',
    auditors: ['A. Rao', 'S. Iqbal'],
    status: 'Open',
    items: [
      { tag: 'AF-0003', name: 'Dell Laptop', expected: 'Desk E12', verification: 'Verified' },
      { tag: 'AF-0421', name: 'Office Chair', expected: 'Desk E14', verification: 'Missing' },
      { tag: 'AF-0438', name: 'Monitor', expected: 'Desk E15', verification: 'Damaged' },
    ],
  },
];

const seedLogs = [
  { id: 'l1', text: 'Laptop AF-0114 assigned to Priya Shah', category: 'Alerts', time: '2m ago' },
  { id: 'l2', text: 'Maintenance request AF-0055 approved', category: 'Approvals', time: '18m ago' },
  { id: 'l3', text: 'Booking confirmed: Room B2, 2:00 to 3:00 PM', category: 'Bookings', time: '1h ago' },
  { id: 'l4', text: 'Transfer approved: AF-0033 to Facilities dept', category: 'Approvals', time: '3h ago' },
  { id: 'l5', text: 'Overdue return: AF-0021 was due 3 days ago', category: 'Alerts', time: '1d ago' },
  { id: 'l6', text: 'Audit discrepancy flagged: AF-0088 damaged', category: 'Alerts', time: '2d ago' },
];

// ---- provider -----------------------------------------------------------

export function AppProvider({ children }) {
  const [user, setUser] = useState(null); // { email, role }
  const [departments, setDepartments] = useState(seedDepartments);
  const [employees, setEmployees] = useState(seedEmployees);
  const [assets, setAssets] = useState(seedAssets);
  const [bookings, setBookings] = useState(seedBookings);
  const [maintenance, setMaintenance] = useState(seedMaintenance);
  const [audits, setAudits] = useState(seedAudits);
  const [logs, setLogs] = useState(seedLogs);
  const [allocationHistory, setAllocationHistory] = useState([
    { tag: 'AF-0114', text: 'Allocated to Priya Shah - Engineering', date: 'Mar 12' },
    { tag: 'AF-0114', text: 'Returned by Arjun Nair - condition: good', date: 'Jan 04' },
  ]);

  const addLog = useCallback((text, category = 'Alerts') => {
    setLogs(prev => [{ id: `l${Date.now()}`, text, category, time: 'just now' }, ...prev]);
  }, []);

  const login = useCallback((email) => {
    // demo: admin@ logs in as Admin, everyone else as Employee
    const role = email.startsWith('admin') ? 'Admin' : 'Employee';
    setUser({ email, role });
  }, []);

  const logout = useCallback(() => setUser(null), []);

  // ---- asset registration ----
  const registerAsset = useCallback((data) => {
    const nextNum = assets.length + 1;
    const tag = `AF-${String(nextNum).padStart(4, '0')}`;
    const asset = { tag, name: data.name, category: data.category, status: 'Available', holder: null, dept: null, location: data.location || 'Warehouse' };
    setAssets(prev => [asset, ...prev]);
    addLog(`Asset ${tag} (${data.name}) registered`, 'Approvals');
    return asset;
  }, [assets, addLog]);

  // ---- allocation with the double-allocation block ----
  const allocateAsset = useCallback((tag, employeeName, deptName) => {
    const asset = assets.find(a => a.tag === tag);
    if (!asset) return { ok: false, message: 'Asset not found' };
    if (asset.status !== 'Available') {
      return { ok: false, message: `Already allocated to ${asset.holder} (${asset.dept}). Direct re-allocation is blocked — submit a transfer request instead.` };
    }
    setAssets(prev => prev.map(a => a.tag === tag ? { ...a, status: 'Allocated', holder: employeeName, dept: deptName } : a));
    setAllocationHistory(prev => [{ tag, text: `Allocated to ${employeeName} - ${deptName}`, date: 'Today' }, ...prev]);
    addLog(`Asset ${tag} allocated to ${employeeName}`, 'Alerts');
    return { ok: true };
  }, [assets, addLog]);

  const requestTransfer = useCallback((tag, toEmployeeName, toDept, reason) => {
    setAllocationHistory(prev => [{ tag, text: `Transfer requested to ${toEmployeeName} (${toDept}) - "${reason}"`, date: 'Today', pending: true }, ...prev]);
    addLog(`Transfer request submitted for ${tag} to ${toEmployeeName}`, 'Approvals');
    return { ok: true, message: 'Transfer request submitted for approval.' };
  }, [addLog]);

  const returnAsset = useCallback((tag, condition) => {
    setAssets(prev => prev.map(a => a.tag === tag ? { ...a, status: condition === 'Damaged' ? 'Maintenance' : 'Available', holder: null, dept: null } : a));
    setAllocationHistory(prev => [{ tag, text: `Returned - condition: ${condition}`, date: 'Today' }, ...prev]);
    addLog(`Asset ${tag} returned (${condition})`, 'Alerts');
  }, [addLog]);

  // ---- booking with overlap validation ----
  const checkOverlap = useCallback((resource, date, start, end, excludeId = null) => {
    return bookings.some(b =>
      b.id !== excludeId &&
      b.resource === resource &&
      b.date === date &&
      b.status !== 'Completed' &&
      (start < b.end && end > b.start)
    );
  }, [bookings]);

  const bookResource = useCallback((resource, date, start, end, bookedBy) => {
    if (checkOverlap(resource, date, start, end)) {
      return { ok: false, message: `Conflict - ${resource} already booked for that slot.` };
    }
    const booking = { id: `b${Date.now()}`, resource, date, start, end, bookedBy, status: 'Upcoming' };
    setBookings(prev => [...prev, booking]);
    addLog(`Booking confirmed: ${resource}, ${start} to ${end}`, 'Bookings');
    return { ok: true };
  }, [checkOverlap, addLog]);

  const advanceBookingStatus = useCallback((id) => {
    setBookings(prev => prev.map(b => {
      if (b.id !== id) return b;
      const next = b.status === 'Upcoming' ? 'Ongoing' : b.status === 'Ongoing' ? 'Completed' : b.status;
      return { ...b, status: next };
    }));
  }, []);

  // ---- maintenance kanban ----
  const maintenanceColumns = ['Pending', 'Approved', 'Technician Assigned', 'In Progress', 'Resolved'];

  const raiseMaintenanceRequest = useCallback((tag, issue, raisedBy) => {
    const req = { id: `m${Date.now()}`, tag, issue, status: 'Pending', raisedBy, technician: null };
    setMaintenance(prev => [req, ...prev]);
    addLog(`Maintenance request raised for ${tag}`, 'Approvals');
    return req;
  }, [addLog]);

  const advanceMaintenance = useCallback((id) => {
    setMaintenance(prev => prev.map(m => {
      if (m.id !== id) return m;
      const idx = maintenanceColumns.indexOf(m.status);
      const next = maintenanceColumns[Math.min(idx + 1, maintenanceColumns.length - 1)];
      // side effects on asset status
      if (next === 'Approved') {
        setAssets(a => a.map(x => x.tag === m.tag ? { ...x, status: 'Maintenance' } : x));
      }
      if (next === 'Resolved') {
        setAssets(a => a.map(x => x.tag === m.tag ? { ...x, status: 'Available' } : x));
        addLog(`Maintenance resolved for ${m.tag} - asset available again`, 'Approvals');
      }
      return { ...m, status: next };
    }));
  }, [addLog]);

  // ---- audits ----
  const setAuditItemVerification = useCallback((auditId, tag, verification) => {
    setAudits(prev => prev.map(a => {
      if (a.id !== auditId) return a;
      return { ...a, items: a.items.map(i => i.tag === tag ? { ...i, verification } : i) };
    }));
  }, []);

  const closeAudit = useCallback((auditId) => {
    setAudits(prev => prev.map(a => {
      if (a.id !== auditId) return a;
      a.items.forEach(item => {
        if (item.verification === 'Missing') {
          setAssets(assetsPrev => assetsPrev.map(x => x.tag === item.tag ? { ...x, status: 'Lost' } : x));
        } else if (item.verification === 'Damaged') {
          setAssets(assetsPrev => assetsPrev.map(x => x.tag === item.tag ? { ...x, status: 'Maintenance' } : x));
        }
      });
      addLog(`Audit "${a.name}" closed - discrepancies resolved`, 'Approvals');
      return { ...a, status: 'Closed' };
    }));
  }, [addLog]);

  const flaggedCount = (audit) => audit.items.filter(i => i.verification === 'Missing' || i.verification === 'Damaged').length;

  // ---- derived KPIs ----
  const kpis = useMemo(() => {
    const available = assets.filter(a => a.status === 'Available').length;
    const allocated = assets.filter(a => a.status === 'Allocated').length;
    const activeBookings = bookings.filter(b => b.status !== 'Completed').length;
    const pendingTransfers = allocationHistory.filter(h => h.pending).length;
    const overdue = 3; // demo constant, mirrors wireframe
    return { available, allocated, activeBookings, pendingTransfers, overdue, upcomingReturns: 12 };
  }, [assets, bookings, allocationHistory]);

  const value = {
    user, login, logout,
    departments, setDepartments,
    employees, setEmployees,
    assets, registerAsset,
    allocateAsset, requestTransfer, returnAsset, allocationHistory,
    bookings, bookResource, checkOverlap, advanceBookingStatus,
    maintenance, maintenanceColumns, raiseMaintenanceRequest, advanceMaintenance,
    audits, setAuditItemVerification, closeAudit, flaggedCount,
    logs, addLog,
    kpis,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
