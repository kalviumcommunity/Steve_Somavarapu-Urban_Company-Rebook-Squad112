import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import './CalendarModal.css';

const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const AlertWarningIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Standard hourly slots ranging between AM and PM
const HOURLY_SLOTS = [
  { time: '08:00 AM', period: 'AM' },
  { time: '09:00 AM', period: 'AM' },
  { time: '10:00 AM', period: 'AM' },
  { time: '11:00 AM', period: 'AM' },
  { time: '12:00 PM', period: 'PM' },
  { time: '01:00 PM', period: 'PM' },
  { time: '02:00 PM', period: 'PM' },
  { time: '03:00 PM', period: 'PM' },
  { time: '04:00 PM', period: 'PM' },
  { time: '05:00 PM', period: 'PM' },
  { time: '06:00 PM', period: 'PM' },
];

function getValidInitialDate(dateInput) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  if (!dateInput) return tomorrow;

  if (dateInput instanceof Date && !isNaN(dateInput.getTime())) {
    const d = new Date(dateInput);
    d.setHours(0, 0, 0, 0);
    return d >= now ? d : tomorrow;
  }

  if (typeof dateInput === 'string') {
    const parsed = new Date(dateInput);
    if (!isNaN(parsed.getTime())) {
      parsed.setHours(0, 0, 0, 0);
      return parsed >= now ? parsed : tomorrow;
    }
  }

  return tomorrow;
}

export default function CalendarModal({
  isOpen,
  onClose,
  onConfirmRebook,
  initialDate,
  initialTime,
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedDate, setSelectedDate] = useState(() => getValidInitialDate(initialDate));
  const [currentMonthDate, setCurrentMonthDate] = useState(
    () => new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  const [selectedTimeSlot, setSelectedTimeSlot] = useState(initialTime || '11:00 AM');
  const [periodFilter, setPeriodFilter] = useState('ALL'); // 'ALL' | 'AM' | 'PM'
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [slotAlertMessage, setSlotAlertMessage] = useState(null);

  // Simulated booked slots map (e.g. 10:00 AM & 02:00 PM booked on selected day)
  const bookedSlotsByDate = useMemo(() => {
    return {
      'default': ['10:00 AM', '02:00 PM'],
    };
  }, []);

  const getDateKey = (dateObj) => {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const currentBookedSlots = useMemo(() => {
    const key = getDateKey(selectedDate);
    return bookedSlotsByDate[key] || bookedSlotsByDate['default'];
  }, [selectedDate, bookedSlotsByDate]);

  // Sync state when modal opens or initialDate changes
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const valid = getValidInitialDate(initialDate);
      setSelectedDate(valid);
      setCurrentMonthDate(new Date(valid.getFullYear(), valid.getMonth(), 1));
      setSlotAlertMessage(null);

      const defaultTime = initialTime && !currentBookedSlots.includes(initialTime) ? initialTime : '11:00 AM';
      setSelectedTimeSlot(defaultTime);

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen, initialDate, initialTime]);

  if (!isOpen) return null;

  const currentYear = currentMonthDate.getFullYear();
  const currentMonth = currentMonthDate.getMonth();

  // Days calculations for current viewing month
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleDaySelect = (day) => {
    const chosen = new Date(currentYear, currentMonth, day);
    chosen.setHours(0, 0, 0, 0);
    if (chosen < today) return; // Disable past days
    setSelectedDate(chosen);
    setSlotAlertMessage(null);

    // If current selected time is booked on new day, reset to first open
    if (currentBookedSlots.includes(selectedTimeSlot)) {
      const firstOpen = HOURLY_SLOTS.find((s) => !currentBookedSlots.includes(s.time));
      if (firstOpen) {
        setSelectedTimeSlot(firstOpen.time);
      }
    }
  };

  const handleSlotClick = (slotItem) => {
    const isBooked = currentBookedSlots.includes(slotItem.time);

    if (isBooked) {
      // User clicked a slot that is already booked -> show alert and display available slots
      setSlotAlertMessage(
        `⚠️ ${slotItem.time} has already been booked. Showing available time slots for you.`
      );
      setShowOnlyAvailable(true);
      return;
    }

    // Available slot selected
    setSelectedTimeSlot(slotItem.time);
    setSlotAlertMessage(null);
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const formatSelectedDateString = (d) => {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return d.toLocaleDateString('en-US', options);
  };

  const handleRebookAction = () => {
    if (currentBookedSlots.includes(selectedTimeSlot)) {
      setSlotAlertMessage(`⚠️ ${selectedTimeSlot} is already booked. Please select an available slot.`);
      setShowOnlyAvailable(true);
      return;
    }

    const formattedDate = formatSelectedDateString(selectedDate);
    onConfirmRebook(formattedDate, selectedTimeSlot, selectedDate);
  };

  // Filter slots by AM/PM and availability
  const visibleSlots = HOURLY_SLOTS.filter((slot) => {
    if (periodFilter !== 'ALL' && slot.period !== periodFilter) {
      return false;
    }
    const isBooked = currentBookedSlots.includes(slot.time);
    if (showOnlyAvailable && isBooked) {
      return false;
    }
    return true;
  });

  const modalContent = (
    <div className="calendar-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="calendar-modal-card calendar-modal-card-expanded"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Choose Rebooking Date & Time Slot"
      >
        {/* Modal Header */}
        <div className="calendar-modal-header">
          <div className="calendar-header-title-group">
            <span className="calendar-header-icon"><CalendarIcon /></span>
            <div>
              <h2 className="calendar-modal-title">Select Date & Time</h2>
              <p className="calendar-modal-subtitle">Choose your preferred day and hourly slot</p>
            </div>
          </div>
          <button
            type="button"
            className="calendar-btn-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="calendar-modal-body-scroll">
          {/* Month Navigation */}
          <div className="calendar-month-bar">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handlePrevMonth}
              aria-label="Previous Month"
            >
              <ChevronLeftIcon />
            </button>
            <span className="calendar-month-label">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={handleNextMonth}
              aria-label="Next Month"
            >
              <ChevronRightIcon />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="calendar-weekdays-grid">
            {DAYS_OF_WEEK.map((d, i) => (
              <span key={i} className="calendar-weekday-cell">{d}</span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="calendar-days-grid">
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="calendar-day-cell empty" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNumber = i + 1;
              const dateObj = new Date(currentYear, currentMonth, dayNumber);
              dateObj.setHours(0, 0, 0, 0);
              const isPast = dateObj < today;
              const isSelected = isSameDay(dateObj, selectedDate);
              const isToday = isSameDay(dateObj, today);

              return (
                <button
                  key={`day-${dayNumber}`}
                  type="button"
                  className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''} ${isPast ? 'disabled' : ''}`}
                  onClick={() => handleDaySelect(dayNumber)}
                  disabled={isPast}
                  aria-label={`${dayNumber} ${MONTH_NAMES[currentMonth]} ${currentYear}`}
                  aria-pressed={isSelected}
                >
                  {dayNumber}
                </button>
              );
            })}
          </div>

          {/* Alert Banner for Booked Slot Warning */}
          {slotAlertMessage && (
            <div className="slot-alert-banner" role="alert">
              <span className="slot-alert-icon"><AlertWarningIcon /></span>
              <div className="slot-alert-text">{slotAlertMessage}</div>
              <button
                type="button"
                className="slot-alert-dismiss"
                onClick={() => setSlotAlertMessage(null)}
                aria-label="Dismiss alert"
              >
                ×
              </button>
            </div>
          )}

          {/* Hourly Slots Section */}
          <div className="slots-section">
            <div className="slots-section-header">
              <div className="slots-title-group">
                <span className="slots-clock-icon"><ClockIcon /></span>
                <h3 className="slots-section-title">Hourly Time Slots</h3>
              </div>

              {/* AM / PM Filter Tabs */}
              <div className="slots-period-tabs">
                <button
                  type="button"
                  className={`period-tab ${periodFilter === 'ALL' ? 'active' : ''}`}
                  onClick={() => setPeriodFilter('ALL')}
                >
                  All
                </button>
                <button
                  type="button"
                  className={`period-tab ${periodFilter === 'AM' ? 'active' : ''}`}
                  onClick={() => setPeriodFilter('AM')}
                >
                  AM
                </button>
                <button
                  type="button"
                  className={`period-tab ${periodFilter === 'PM' ? 'active' : ''}`}
                  onClick={() => setPeriodFilter('PM')}
                >
                  PM
                </button>
              </div>
            </div>

            {/* Toggle to show only available slots */}
            <div className="slots-filter-row">
              <label className="slots-filter-checkbox-label">
                <input
                  type="checkbox"
                  checked={showOnlyAvailable}
                  onChange={(e) => setShowOnlyAvailable(e.target.checked)}
                />
                <span>Display available slots only</span>
              </label>
              <span className="slots-count-badge">
                {HOURLY_SLOTS.length - currentBookedSlots.length} available
              </span>
            </div>

            {/* Hourly Slots Grid */}
            <div className="hourly-slots-grid">
              {visibleSlots.map((slotItem) => {
                const isBooked = currentBookedSlots.includes(slotItem.time);
                const isSelected = selectedTimeSlot === slotItem.time && !isBooked;

                return (
                  <button
                    key={slotItem.time}
                    type="button"
                    className={`hourly-slot-chip ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : 'available'}`}
                    onClick={() => handleSlotClick(slotItem)}
                    aria-label={`${slotItem.time} ${isBooked ? '(Booked)' : '(Available)'}`}
                    aria-pressed={isSelected}
                  >
                    <span className="slot-time-text">{slotItem.time}</span>
                    <span className={`slot-status-tag ${isBooked ? 'tag-booked' : 'tag-available'}`}>
                      {isBooked ? 'Booked' : 'Open'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Summary & Confirm Button */}
        <div className="calendar-modal-footer">
          <div className="calendar-selected-summary">
            <span className="selected-tag">Selected</span>
            <span className="selected-date-text">
              {formatSelectedDateString(selectedDate)} at {selectedTimeSlot}
            </span>
          </div>

          <button
            id="btn-confirm-rebook-calendar"
            type="button"
            className="btn-confirm-rebook"
            onClick={handleRebookAction}
          >
            Confirm & Rebook ({selectedTimeSlot})
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
