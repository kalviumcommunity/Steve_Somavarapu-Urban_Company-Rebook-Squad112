import React from 'react';

export default function CustomerDetailsCard({ customer }) {
  const { name, email, phone } = customer;

  return (
    <div className="card-section customer-details-card" role="region" aria-label="Customer Information">
      <h2 className="card-section-heading">CUSTOMER DETAILS</h2>
      <div className="customer-info-grid">
        <div className="customer-info-row">
          <span className="customer-info-label">Full name</span>
          <span className="customer-info-value">{name}</span>
        </div>
        <div className="customer-info-row">
          <span className="customer-info-label">Email address</span>
          <span className="customer-info-value">{email}</span>
        </div>
        <div className="customer-info-row">
          <span className="customer-info-label">Phone number</span>
          <span className="customer-info-value">{phone}</span>
        </div>
      </div>
    </div>
  );
}
