import React from 'react';

export default function SlotPicker({ slots, selectedTime, onSelectTime }) {
  return (
    <div className="slot-picker-section" role="region" aria-label="Available Time Slots">
      <h2 className="card-section-heading">AVAILABLE TIMES</h2>
      <div className="slots-grid" role="group" aria-label="Choose a time slot">
        {slots.map((time) => {
          const isSelected = selectedTime === time;
          return (
            <button
              key={time}
              type="button"
              className={`slot-button ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectTime(time)}
              aria-pressed={isSelected}
              aria-label={`Time slot ${time}${isSelected ? ' (selected)' : ''}`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
