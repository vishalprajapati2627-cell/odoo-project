require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const Department = require('../models/Department');
const Category = require('../models/Category');
const User = require('../models/User');
const Asset = require('../models/Asset');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const Audit = require('../models/Audit');
const Log = require('../models/Log');
const AllocationHistory = require('../models/AllocationHistory');
const { Counter } = require('../models/Counter');

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Department.deleteMany({}),
    Category.deleteMany({}),
    User.deleteMany({}),
    Asset.deleteMany({}),
    Booking.deleteMany({}),
    Maintenance.deleteMany({}),
    Audit.deleteMany({}),
    Log.deleteMany({}),
    AllocationHistory.deleteMany({}),
    Counter.deleteMany({}),
  ]);

  console.log('Creating departments...');
  const [engineering, facilities, fieldOps] = await Department.create([
    { name: 'Engineering', head: 'Aditi Rao', status: 'Active' },
    { name: 'Facilities', head: 'Rohan Mehta', status: 'Active' },
    { name: 'Field Ops (East)', head: 'Sana Iqbal', status: 'Inactive' },
  ]);

  console.log('Creating categories...');
  await Category.create([{ name: 'Electronics' }, { name: 'Furniture' }, { name: 'Vehicles' }, { name: 'Tools' }]);

  console.log('Creating users...');
  const [admin, priya, arjun, aditi, karan] = await User.create([
    { name: 'System Admin', email: 'admin@company.com', password: 'admin1234', role: 'Admin', department: engineering._id },
    { name: 'Priya Shah', email: 'priya.shah@company.com', password: 'password123', role: 'Employee', department: engineering._id },
    { name: 'Arjun Nair', email: 'arjun.nair@company.com', password: 'password123', role: 'Employee', department: facilities._id },
    { name: 'Aditi Rao', email: 'aditi.rao@company.com', password: 'password123', role: 'Department Head', department: engineering._id },
    { name: 'Karan Verma', email: 'karan.verma@company.com', password: 'password123', role: 'Asset Manager', department: fieldOps._id },
  ]);

  console.log('Creating assets...');
  const laptop1 = await Asset.create({
    tag: 'AF-0114', name: 'Dell Laptop', category: 'Electronics', status: 'Allocated',
    holder: priya._id, dept: engineering._id, location: 'Bengaluru',
    expectedReturnDate: '2026-07-25', serialNumber: 'SN-DELL-8832', purchaseCost: '1200',
    purchaseDate: '2025-01-10', notes: 'Core i7, 16GB RAM'
  });
  const projector = await Asset.create({
    tag: 'AF-0062', name: 'Projector', category: 'Electronics', status: 'Maintenance',
    holder: null, dept: facilities._id, location: 'HQ Floor 2',
    expectedReturnDate: null, serialNumber: 'SN-EPS-9921', purchaseCost: '800',
    purchaseDate: '2024-05-12', notes: 'Includes HDMI cable'
  });
  await Asset.create({
    tag: 'AF-0201', name: 'Office Chair', category: 'Furniture', status: 'Available',
    location: 'Warehouse', expectedReturnDate: null, serialNumber: 'SN-CHAIR-112',
    purchaseCost: '250', purchaseDate: '2025-03-20', notes: 'Mesh back'
  });
  const laptop2 = await Asset.create({
    tag: 'AF-0003', name: 'Dell Laptop', category: 'Electronics', status: 'Available',
    location: 'Desk E12', expectedReturnDate: null, serialNumber: 'SN-DELL-9901',
    purchaseCost: '1100', purchaseDate: '2025-02-15', notes: 'Core i5, 8GB RAM'
  });
  const chair2 = await Asset.create({
    tag: 'AF-0421', name: 'Office Chair', category: 'Furniture', status: 'Available',
    location: 'Desk E14', expectedReturnDate: null, serialNumber: 'SN-CHAIR-113',
    purchaseCost: '250', purchaseDate: '2025-03-20', notes: 'Mesh back'
  });
  const monitor = await Asset.create({
    tag: 'AF-0438', name: 'Monitor', category: 'Electronics', status: 'Available',
    location: 'Desk E15', expectedReturnDate: null, serialNumber: 'SN-MON-5531',
    purchaseCost: '350', purchaseDate: '2024-09-10', notes: '24 inch IPS display'
  });

  // keep the AF-#### counter ahead of the highest seeded tag
  await Counter.findByIdAndUpdate('assetTag', { seq: 438 }, { upsert: true });

  console.log('Creating bookings...');
  await Booking.create({
    resource: 'Conference Room B2', date: '2026-07-14', start: '09:00', end: '10:00',
    bookedBy: admin._id, status: 'Upcoming',
  });

  console.log('Creating maintenance requests...');
  await Maintenance.create([
    { asset: projector._id, tag: 'AF-0062', issue: 'Projector bulb not turning on', status: 'Pending', raisedBy: priya._id },
    { asset: laptop2._id, tag: 'AF-0003', issue: 'AC unit noisy compressor', status: 'Approved', raisedBy: arjun._id },
    { asset: laptop2._id, tag: 'AF-0078', issue: 'Forklift lift not smooth', status: 'Technician Assigned', raisedBy: karan._id, technician: 'R. Verma' },
    { asset: laptop2._id, tag: 'AF-0917', issue: 'Printer jam - parts ordered', status: 'In Progress', raisedBy: aditi._id, technician: 'S. Iqbal' },
    { asset: laptop2._id, tag: 'AF-0873', issue: 'Chair repair resolved', status: 'Resolved', raisedBy: priya._id, technician: 'R. Verma' },
  ]);

  console.log('Creating an audit...');
  await Audit.create({
    name: 'Q3 Audit: Engineering Dept',
    startDate: new Date('2026-07-01'),
    endDate: new Date('2026-07-15'),
    auditors: [aditi._id, karan._id],
    status: 'Open',
    items: [
      { asset: laptop2._id, tag: 'AF-0003', name: 'Dell Laptop', expected: 'Desk E12', verification: 'Verified' },
      { asset: chair2._id, tag: 'AF-0421', name: 'Office Chair', expected: 'Desk E14', verification: 'Missing' },
      { asset: monitor._id, tag: 'AF-0438', name: 'Monitor', expected: 'Desk E15', verification: 'Damaged' },
    ],
  });

  console.log('Creating allocation history...');
  await AllocationHistory.create([
    { asset: laptop1._id, tag: 'AF-0114', type: 'Allocation', text: 'Allocated to Priya Shah - Engineering', toEmployee: priya._id, toDept: engineering._id },
    { asset: laptop1._id, tag: 'AF-0114', type: 'Return', text: 'Returned by Arjun Nair - condition: good' },
  ]);

  console.log('Creating activity logs...');
  await Log.create([
    { text: 'Laptop AF-0114 assigned to Priya Shah', category: 'Alerts' },
    { text: 'Maintenance request AF-0055 approved', category: 'Approvals' },
    { text: 'Booking confirmed: Room B2, 2:00 to 3:00 PM', category: 'Bookings' },
    { text: 'Transfer approved: AF-0033 to Facilities dept', category: 'Approvals' },
    { text: 'Overdue return: AF-0021 was due 3 days ago', category: 'Alerts' },
    { text: 'Audit discrepancy flagged: AF-0088 damaged', category: 'Alerts' },
  ]);

  console.log('\nSeed complete!');
  console.log('Demo login -> admin@company.com / admin1234 (Admin)');
  console.log('Demo login -> priya.shah@company.com / password123 (Employee)');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
