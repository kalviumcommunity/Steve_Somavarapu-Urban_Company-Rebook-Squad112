import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '../context/useBooking';
import { logout } from '../services/auth';
import BookingCard from '../components/BookingCard';
import RebookBanner from '../components/RebookBanner';
import CalendarModal from '../components/CalendarModal';
import CancelModal from '../components/CancelModal';
import './PastService.css';

// Icons
const MoreDotsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="5" cy="12" r="2" />
    <circle cx="12" cy="12" r="2" />
    <circle cx="19" cy="12" r="2" />
  </svg>
);

const SignOutIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const ChevronLeftIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const SERVICES_PER_PAGE = 5;

export default function PastService() {
  const navigate = useNavigate();
  const { bookingsList, confirmOneClickRebook, cancelBooking } = useBooking();
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);

  // In-app cancellation modal state
  const [bookingToCancel, setBookingToCancel] = useState(null);

  // Three dots dropdown menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isMenuOpen]);

  // Sign out handler
  const handleSignOut = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
    } catch {
      // ignore
    }
    navigate('/');
  };

  // Pagination state: 5 services per page
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(bookingsList.length / SERVICES_PER_PAGE));

  // Adjust page if current page exceeds total pages after a cancellation
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [bookingsList.length, totalPages, currentPage]);

  const startIndex = (currentPage - 1) * SERVICES_PER_PAGE;
  const displayedBookings = bookingsList.slice(startIndex, startIndex + SERVICES_PER_PAGE);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Calculates tomorrow from today (e.g. today is Aug 21 -> tomorrow is Aug 22)
  const getTomorrowFromToday = () => {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return {
      formatted: tomorrow.toLocaleDateString('en-US', options),
      dateObj: tomorrow,
    };
  };

  // Open calendar modal for a specific booking
  const handleOpenCalendar = (booking) => {
    setActiveBooking(booking);
    setIsCalendarOpen(true);
  };

  const handleCloseCalendar = () => {
    setIsCalendarOpen(false);
    setActiveBooking(null);
  };

  // Direct 1-click rebook from the in-card button (rebooks for tomorrow from today)
  const handleDirectRebook = (booking) => {
    const tomorrowInfo = getTomorrowFromToday();
    confirmOneClickRebook(tomorrowInfo.formatted, booking.time || '11:00 AM', booking);
    navigate('/booking/confirmed');
  };

  // When user selects a custom date & hourly time slot from the calendar modal
  const handleConfirmCalendarRebook = (formattedDate, selectedTime) => {
    confirmOneClickRebook(formattedDate, selectedTime || '11:00 AM', activeBooking);
    setIsCalendarOpen(false);
    setActiveBooking(null);
    navigate('/booking/confirmed');
  };

  // Handle initiating cancellation via in-app modal
  const handleInitiateCancel = (booking) => {
    setBookingToCancel(booking);
  };

  // Handle confirming cancellation inside in-app modal
  const handleConfirmCancel = (bookingId) => {
    cancelBooking(bookingId);
    setBookingToCancel(null);
  };

  const tomorrowInfo = getTomorrowFromToday();

  return (
    <div className="past-service-page">
      <main className="past-service-container" role="main">
        {/* Screen Header */}
        <header className="past-service-header">
          <div className="header-text-group">
            <h1 className="header-title">Past services</h1>
            <p className="header-subtitle">
              Showing page {currentPage} of {totalPages} ({bookingsList.length} total services)
            </p>
          </div>

          {/* Three dots menu container */}
          <div className="header-menu-container" ref={menuRef}>
            <button
              id="btn-header-menu"
              type="button"
              className="btn-header-action btn-header-menu"
              aria-label="More options"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              <MoreDotsIcon />
            </button>

            {/* Dropdown Menu with Sign out option */}
            {isMenuOpen && (
              <div className="header-dropdown-menu" role="menu">
                <button
                  id="btn-sign-out"
                  type="button"
                  className="header-dropdown-item dropdown-item-signout"
                  role="menuitem"
                  onClick={handleSignOut}
                >
                  <SignOutIcon />
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content Section: Paginated Service Cards Feed */}
        <section className="past-service-content" aria-label="Bookings Summary">
          <div className="past-services-list" role="feed" aria-label="Bookings List">
            {displayedBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onDateClick={(b) => handleOpenCalendar(b)}
                onRebook={(b) => handleDirectRebook(b)}
                onCancel={() => handleInitiateCancel(booking)}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <nav className="pagination-bar" aria-label="Services pagination">
              <div className="pagination-info">
                Showing {startIndex + 1}–{Math.min(startIndex + SERVICES_PER_PAGE, bookingsList.length)} of {bookingsList.length} services
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  id="btn-pagination-prev"
                  className="btn-pagination-nav"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  aria-label="Previous page"
                >
                  <ChevronLeftIcon />
                  <span>Prev</span>
                </button>

                <div className="pagination-pages">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNumber = idx + 1;
                    return (
                      <button
                        key={pageNumber}
                        type="button"
                        id={`btn-page-${pageNumber}`}
                        className={`pagination-page-btn ${currentPage === pageNumber ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNumber)}
                        aria-label={`Page ${pageNumber}`}
                        aria-current={currentPage === pageNumber ? 'page' : undefined}
                      >
                        {pageNumber}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  id="btn-pagination-next"
                  className="btn-pagination-nav"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  aria-label="Next page"
                >
                  <span>Next</span>
                  <ChevronRightIcon />
                </button>
              </div>
            </nav>
          )}

          {/* Rebooking Information Banner */}
          <RebookBanner message="Click on the date in any service to choose a custom day & slot, or click Rebook service to book for tomorrow." />
        </section>

        {/* Overlapping Calendar Overlay for Custom Date & Hourly Slot Selection */}
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={handleCloseCalendar}
          onConfirmRebook={handleConfirmCalendarRebook}
          initialDate={tomorrowInfo.dateObj}
          initialTime={activeBooking?.time || '11:00 AM'}
        />

        {/* In-App Cancellation Confirmation Modal */}
        <CancelModal
          isOpen={Boolean(bookingToCancel)}
          booking={bookingToCancel}
          onClose={() => setBookingToCancel(null)}
          onConfirmCancel={handleConfirmCancel}
        />
      </main>
    </div>
  );
}
