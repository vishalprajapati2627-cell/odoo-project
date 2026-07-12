import { useState } from 'react';
import { useApp } from '../context/AppContext';
import StatusBadge from '../components/StatusBadge';
import './ResourceBooking.css';

const RESOURCES = ['Conference Room B2', 'Conference Room A1', 'Projector Cart', 'Company Van'];
const HOURS = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'];

export default function ResourceBooking() {
  const { bookings, bookResource, checkOverlap, advanceBookingStatus } = useApp();
  const [resource, setResource] = useState(RESOURCES[0]);
  const [date, setDate] = useState('2026-07-14');
  const [start, setStart] = useState('10:00');
  const [end, setEnd] = useState('11:00');
  const [message, setMessage] = useState(null);

  const conflict = checkOverlap(resource, date, start, end);
  const dayBookings = bookings.filter(b => b.resource === resource && b.date === date);

  const handleBook = () => {
    if (start >= end) { setMessage({ type: 'error', text: 'End time must be after start time.' }); return; }
    const result = bookResource(resource, date, start, end, 'You');
    setMessage(result.ok ? { type: 'success', text: `Booked ${resource} from ${start} to ${end}.` } : { type: 'error', text: result.message });
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Resource Booking</h1>
          <p className="page-sub">Overlapping requests for the same resource and time slot are rejected automatically.</p>
        </div>
      </div>

      <div className="booking-layout">
        <div className="card booking-form">
          <label className="field-label">Resource</label>
          <select className="input" value={resource} onChange={e => setResource(e.target.value)}>
            {RESOURCES.map(r => <option key={r}>{r}</option>)}
          </select>

          <label className="field-label" style={{ marginTop: 12 }}>Date</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} />

          <div className="booking-time-row">
            <div>
              <label className="field-label">Start</label>
              <select className="input" value={start} onChange={e => setStart(e.target.value)}>
                {HOURS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="field-label">End</label>
              <select className="input" value={end} onChange={e => setEnd(e.target.value)}>
                {HOURS.map(h => <option key={h}>{h}</option>)}
              </select>
            </div>
          </div>

          {conflict && (
            <div className="booking-conflict-banner">
              Requested {start} to {end} conflicts with an existing booking — this slot is unavailable.
            </div>
          )}
          {message && (
            <div className={message.type === 'error' ? 'alloc-message-error' : 'alloc-message-success'} style={{ marginTop: 12 }}>
              {message.text}
            </div>
          )}

          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={handleBook} disabled={conflict}>
            Book a slot
          </button>
        </div>

        <div className="card booking-timeline">
          <h3 className="alloc-section-title">{resource} — {date}</h3>
          {HOURS.map(h => {
            const booking = dayBookings.find(b => h >= b.start && h < b.end);
            return (
              <div key={h} className="timeline-row">
                <span className="timeline-hour mono">{h}</span>
                <div className="timeline-track">
                  {booking && h === booking.start && (
                    <div className="timeline-block">
                      Booked — {booking.bookedBy} · <StatusBadge status={booking.status} />
                      <button className="btn btn-ghost timeline-advance" onClick={() => advanceBookingStatus(booking.id)} disabled={booking.status === 'Completed'}>
                        Advance status →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
