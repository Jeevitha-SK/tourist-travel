/**
 * TransVoyage - Customer & Admin Dashboard Scripts
 * Handles Charts, Modals, Tab Switching, Mock Data interactions
 */

document.addEventListener('DOMContentLoaded', () => {
  initDashboardTabs();
  initCustomerDashboard();
  initAdminDashboard();
});

/* ==========================================
   1. DASHBOARD TAB SWITCHING
   ========================================== */
function initDashboardTabs() {
  const tabBtns = document.querySelectorAll('.dashboard-tab-btn');
  const tabContents = document.querySelectorAll('.dashboard-tab-content');

  if (tabBtns.length === 0) return;

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');

      // Update button styles
      tabBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
        b.classList.add('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');
        const icon = b.querySelector('i');
        if (icon) {
          icon.classList.remove('text-white');
          // Restore original icon colors
          const target = b.getAttribute('data-target');
          if (target === 'tab-book-vehicle') icon.classList.add('text-amber-500');
          else if (target === 'tab-bookings') icon.classList.add('text-blue-500');
          else if (target === 'tab-payments') icon.classList.add('text-emerald-500');
          else if (target === 'tab-tracking') icon.classList.add('text-rose-500');
          else if (target === 'tab-travelers') icon.classList.add('text-slate-500');
        }
      });

      btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');
      btn.classList.remove('text-slate-600', 'dark:text-slate-400', 'hover:bg-slate-100', 'dark:hover:bg-slate-800');

      // Ensure active icon is bright crisp white
      const activeIcon = btn.querySelector('i');
      if (activeIcon) {
        activeIcon.classList.remove('text-amber-500', 'text-blue-500', 'text-emerald-500', 'text-rose-500', 'text-slate-500');
        activeIcon.classList.add('text-white');
      }

      // Show target content
      tabContents.forEach(content => {
        if (content.id === targetId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      });
    });
  });
}

/* ==========================================
   2. CUSTOMER DASHBOARD FEATURES
   ========================================== */
function initCustomerDashboard() {
  // Booking Filters (All, Upcoming, Completed, Cancelled)
  const filterPills = document.querySelectorAll('.booking-filter-pill');
  const bookingRows = document.querySelectorAll('.booking-item-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('bg-blue-600', 'text-white');
        p.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');
      });
      pill.classList.add('bg-blue-600', 'text-white');
      pill.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-400');

      const status = pill.getAttribute('data-status');
      const allRows = document.querySelectorAll('.booking-item-card');
      allRows.forEach(row => {
        const rowStatus = row.getAttribute('data-status');
        if (status === 'all' || rowStatus === status) {
          row.classList.remove('hidden');
        } else {
          row.classList.add('hidden');
        }
      });
    });
  });

  // Delegate clicks for dynamic buttons (Track, Invoice, Details)
  document.addEventListener('click', (e) => {
    const trackBtn = e.target.closest('.btn-track-trip');
    if (trackBtn) {
      const tripId = trackBtn.getAttribute('data-trip-id') || 'TV-2026-981';
      openLiveTrackModal(tripId);
      return;
    }

    const invoiceBtn = e.target.closest('.btn-view-invoice');
    if (invoiceBtn) {
      const tripId = invoiceBtn.getAttribute('data-trip-id') || 'TV-2026-981';
      openInvoiceModal(tripId);
      return;
    }

    const detailsBtn = e.target.closest('.btn-view-trip-details');
    if (detailsBtn) {
      const tripId = detailsBtn.getAttribute('data-trip-id') || 'TV-2026-981';
      openTripDetailsModal(tripId);
      return;
    }

    const cancelBtn = e.target.closest('.btn-cancel-trip');
    if (cancelBtn) {
      const tripId = cancelBtn.getAttribute('data-trip-id') || 'TV-2026-981';
      openCancelBookingModal(tripId);
      return;
    }
  });

  // Setup In-Dashboard Booking Dates & Calculation
  initDashboardBookingEngine();

  // Render any previously created user bookings from LocalStorage
  renderSavedBookings();

  // Initialize Co-Travelers System
  initSavedTravelers();

  // Support direct URL hash: #add-traveler or #travelers
  if (window.location.hash === '#add-traveler' || window.location.hash === '#travelers') {
    const travelerTab = document.querySelector('[data-target="tab-travelers"]');
    if (travelerTab) travelerTab.click();
    if (window.location.hash === '#add-traveler') {
      setTimeout(() => openAddTravelerModal(), 200);
    }
  }
}

/* ==========================================
   2.1 IN-DASHBOARD VEHICLE BOOKING ENGINE
   ========================================== */
function initDashboardBookingEngine() {
  const depDateInput = document.getElementById('dash-departure-date');
  const retDateInput = document.getElementById('dash-return-date');

  if (!depDateInput || !retDateInput) return;

  // Set default dates: tomorrow and +3 days
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const future = new Date();
  future.setDate(future.getDate() + 4);

  depDateInput.value = tomorrow.toISOString().split('T')[0];
  retDateInput.value = future.toISOString().split('T')[0];

  // Trip Type Buttons
  const typeBtns = document.querySelectorAll('.dash-trip-type-btn');
  typeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      typeBtns.forEach(b => {
        b.className = 'dash-trip-type-btn py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 font-semibold text-xs flex flex-col items-center gap-1 transition-all';
      });
      btn.className = 'dash-trip-type-btn py-2.5 px-3 rounded-xl border border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold text-xs flex flex-col items-center gap-1 transition-all';
      updateDashboardFareCalculation();
    });
  });

  // Vehicle Radio Labels
  const vehicleRadios = document.querySelectorAll('input[name="dash_vehicle"]');
  vehicleRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.dash-vehicle-label').forEach(label => {
        label.classList.remove('border-2', 'border-blue-600', 'bg-blue-50/50', 'dark:bg-blue-950/30');
        label.classList.add('border-slate-200', 'dark:border-slate-700', 'bg-slate-50', 'dark:bg-slate-800/60');
      });
      const chosenLabel = radio.closest('.dash-vehicle-label');
      if (chosenLabel) {
        chosenLabel.classList.add('border-2', 'border-blue-600', 'bg-blue-50/50', 'dark:bg-blue-950/30');
        chosenLabel.classList.remove('border-slate-200', 'dark:border-slate-700', 'bg-slate-50', 'dark:bg-slate-800/60');
      }
      updateDashboardFareCalculation();
    });
  });

  depDateInput.addEventListener('change', updateDashboardFareCalculation);
  retDateInput.addEventListener('change', updateDashboardFareCalculation);

  // Initial calculation
  updateDashboardFareCalculation();
}

function updateDashboardFareCalculation() {
  const depDateInput = document.getElementById('dash-departure-date');
  const retDateInput = document.getElementById('dash-return-date');
  if (!depDateInput || !retDateInput) return;

  const d1 = new Date(depDateInput.value);
  const d2 = new Date(retDateInput.value);
  let days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  if (isNaN(days) || days < 1) days = 1;

  const checkedRadio = document.querySelector('input[name="dash_vehicle"]:checked');
  if (!checkedRadio) return;

  const vehicleName = checkedRadio.getAttribute('data-name');
  const ratePerKm = parseInt(checkedRadio.getAttribute('data-rate'), 10) || 26;
  const minKmPerDay = parseInt(checkedRadio.getAttribute('data-min'), 10) || 250;
  const battaPerDay = parseInt(checkedRadio.getAttribute('data-batta'), 10) || 600;

  const totalMinKm = days * minKmPerDay;
  const baseCost = totalMinKm * ratePerKm;
  const totalBatta = days * battaPerDay;
  const subtotal = baseCost + totalBatta;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;
  const advance = Math.round(grandTotal * 0.25);

  const elVehName = document.getElementById('calc-vehicle-name');
  const elDays = document.getElementById('calc-trip-days');
  const elKm = document.getElementById('calc-trip-km');
  const elRate = document.getElementById('calc-rate-km');
  const elBatta = document.getElementById('calc-batta');
  const elGst = document.getElementById('calc-gst');
  const elGrand = document.getElementById('calc-grand-total');
  const elAdvance = document.getElementById('calc-advance-due');

  if (elVehName) elVehName.textContent = vehicleName;
  if (elDays) elDays.textContent = `${days} Day${days > 1 ? 's' : ''}`;
  if (elKm) elKm.textContent = `${totalMinKm.toLocaleString('en-IN')} km (${minKmPerDay} km/day)`;
  if (elRate) elRate.textContent = `₹${ratePerKm} / km`;
  if (elBatta) elBatta.textContent = `₹${totalBatta.toLocaleString('en-IN')} (₹${battaPerDay} × ${days}d)`;
  if (elGst) elGst.textContent = `₹${gst.toLocaleString('en-IN')}`;
  if (elGrand) elGrand.textContent = `₹${grandTotal.toLocaleString('en-IN')}`;
  if (elAdvance) elAdvance.textContent = `₹${advance.toLocaleString('en-IN')}`;
}

function handleDashboardBooking(e) {
  e.preventDefault();

  const pickup = document.getElementById('dash-pickup').value;
  const destination = document.getElementById('dash-destination').value;
  const depDate = document.getElementById('dash-departure-date').value;
  const retDate = document.getElementById('dash-return-date').value;
  const leadName = document.getElementById('dash-lead-name').value;
  const leadPhone = document.getElementById('dash-lead-phone').value;

  const checkedRadio = document.querySelector('input[name="dash_vehicle"]:checked');
  const vehicleName = checkedRadio ? checkedRadio.getAttribute('data-name') : '17-Seater Force Urbania';
  const ratePerKm = checkedRadio ? parseInt(checkedRadio.getAttribute('data-rate'), 10) : 26;
  const minKm = checkedRadio ? parseInt(checkedRadio.getAttribute('data-min'), 10) : 250;
  const batta = checkedRadio ? parseInt(checkedRadio.getAttribute('data-batta'), 10) : 600;

  const d1 = new Date(depDate);
  const d2 = new Date(retDate);
  let days = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
  if (isNaN(days) || days < 1) days = 1;

  const totalMinKm = days * minKm;
  const baseCost = totalMinKm * ratePerKm;
  const totalBatta = days * batta;
  const subtotal = baseCost + totalBatta;
  const gst = Math.round(subtotal * 0.05);
  const grandTotal = subtotal + gst;
  const advance = Math.round(grandTotal * 0.25);

  const newTripId = `TV-2026-${Math.floor(100 + Math.random() * 900)}`;

  const newBooking = {
    id: newTripId,
    vehicle: vehicleName,
    pickup,
    destination,
    depDate,
    retDate,
    days,
    leadName,
    leadPhone,
    grandTotal,
    advance,
    createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'upcoming'
  };

  // Save in LocalStorage
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('tv_custom_bookings')) || [];
  } catch (err) {
    saved = [];
  }
  saved.unshift(newBooking);
  localStorage.setItem('tv_custom_bookings', JSON.stringify(saved));

  // Render newly added card immediately
  renderSingleBookingCard(newBooking, true);
  renderSingleInvoiceRow(newBooking, true);

  // Update KPI counters
  const kpiTrips = document.getElementById('kpi-total-trips');
  if (kpiTrips) {
    kpiTrips.textContent = `${8 + saved.length} Trips`;
  }
  const sideCount = document.getElementById('sidebar-bookings-count');
  if (sideCount) {
    sideCount.textContent = `${3 + saved.length}`;
  }

  // Show Success Modal
  showBookingSuccessModal(newBooking);
}

function showBookingSuccessModal(booking) {
  let modal = document.getElementById('booking-success-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'booking-success-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5 animate-scaleUp">
      <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
        <i class="fa-solid fa-circle-check"></i>
      </div>
      <div>
        <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-2">
          Trip Reference: ${booking.id}
        </span>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white font-heading">Vehicle Booking Confirmed!</h3>
        <p class="text-xs text-slate-500 mt-1">Your reservation for <strong>${booking.vehicle}</strong> is reserved with sanitized cabin guarantee.</p>
      </div>

      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-left space-y-2">
        <div class="flex justify-between">
          <span class="text-slate-400">Route:</span>
          <strong class="text-slate-800 dark:text-slate-200">${booking.pickup} ➔ ${booking.destination}</strong>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Duration:</span>
          <span class="font-bold text-slate-800 dark:text-slate-200">${booking.days} Days (${booking.depDate} to ${booking.retDate})</span>
        </div>
        <div class="flex justify-between">
          <span class="text-slate-400">Total Estimated Fare:</span>
          <span class="font-bold text-slate-900 dark:text-white">₹${booking.grandTotal.toLocaleString('en-IN')}</span>
        </div>
        <div class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-emerald-600 font-bold">
          <span>Advance Paid (25%):</span>
          <span>₹${booking.advance.toLocaleString('en-IN')} (Confirmed)</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 pt-2">
        <button onclick="document.getElementById('booking-success-modal').remove(); openTripDetailsModal('${booking.id}');" class="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all">
          <i class="fa-solid fa-circle-info mr-1"></i> View Trip Details
        </button>
        <button onclick="document.getElementById('booking-success-modal').remove(); document.querySelector('[data-target=\\'tab-bookings\\']').click();" class="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow transition-all">
          <i class="fa-solid fa-ticket mr-1"></i> Go to My Bookings
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function renderSavedBookings() {
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('tv_custom_bookings')) || [];
  } catch (err) {
    saved = [];
  }

  const container = document.getElementById('dynamic-booking-cards');
  if (!container) return;
  container.innerHTML = '';

  saved.forEach(b => {
    renderSingleBookingCard(b, false);
    renderSingleInvoiceRow(b, false);
  });

  const kpiTrips = document.getElementById('kpi-total-trips');
  if (kpiTrips) {
    kpiTrips.textContent = `${8 + saved.length} Trips`;
  }
  const sideCount = document.getElementById('sidebar-bookings-count');
  if (sideCount) {
    sideCount.textContent = `${3 + saved.length}`;
  }
}

function renderSingleBookingCard(booking, prepend) {
  const container = document.getElementById('dynamic-booking-cards');
  if (!container) return;

  const isCancelled = booking.status === 'cancelled';
  const statusBadge = isCancelled 
    ? '<span class="trip-status-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800"><i class="fa-solid fa-ban mr-1"></i> Cancelled</span>'
    : '<span class="trip-status-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><i class="fa-solid fa-circle-check mr-1 text-[9px]"></i> Confirmed (New)</span>';

  const cancelBtnHtml = isCancelled ? '' : `
    <button class="btn-cancel-trip px-3 py-1.5 border border-rose-300 dark:border-rose-800 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors" data-trip-id="${booking.id}">
      <i class="fa-solid fa-ban"></i> Cancel
    </button>
  `;

  const vehicleIcon = (booking.vehicle && (booking.vehicle.includes('Bus') || booking.vehicle.includes('Coach') || booking.vehicle.includes('Volvo'))) 
    ? 'fa-bus' 
    : 'fa-van-shuttle';

  const card = document.createElement('div');
  card.className = `booking-item-card bg-white dark:bg-slate-900 rounded-2xl border ${isCancelled ? 'border-rose-200 dark:border-rose-900/40 opacity-75' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'} shadow-sm hover:shadow transition-all overflow-hidden animate-fadeIn`;
  card.setAttribute('data-status', isCancelled ? 'cancelled' : 'upcoming');
  card.id = `card-trip-${booking.id}`;
  card.innerHTML = `
    <!-- Card Header: ID, Vehicle, Status, and Price -->
    <div class="p-4 sm:p-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/30">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-xl ${isCancelled ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'} flex items-center justify-center text-lg font-bold shrink-0">
          <i class="fa-solid ${vehicleIcon}"></i>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200/60 dark:border-blue-900/40">${booking.id}</span>
            <span class="text-sm font-bold text-slate-900 dark:text-white font-heading">${booking.vehicle}</span>
            ${statusBadge}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 shadow-xs">
        <span class="text-[10px] uppercase font-bold text-slate-600 dark:text-slate-400 tracking-wider">Total Fare:</span>
        <span class="text-base font-extrabold text-slate-900 dark:text-white font-heading">₹${booking.grandTotal.toLocaleString('en-IN')}</span>
      </div>
    </div>

    <!-- Card Body: Route & Travel Schedule -->
    <div class="p-4 sm:p-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs bg-white dark:bg-slate-900">
      <div class="flex items-center gap-2 flex-wrap text-slate-700 dark:text-slate-200">
        <span class="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
          <i class="fa-solid fa-circle-dot text-[10px] text-emerald-500"></i> ${booking.pickup}
        </span>
        <i class="fa-solid fa-arrow-right-long text-slate-400 text-xs px-1 shrink-0"></i>
        <span class="inline-flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white">
          <i class="fa-solid fa-location-dot text-[10px] text-rose-500"></i> ${booking.destination}
        </span>
      </div>
      <div class="flex items-center gap-2 flex-wrap text-slate-600 dark:text-slate-400">
        <span class="inline-flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-slate-700 font-medium">
          <i class="fa-regular fa-calendar text-blue-500"></i> ${booking.depDate} ➔ ${booking.retDate}
        </span>
        <span class="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/40 px-2 py-1 rounded-lg font-bold">
          <i class="fa-regular fa-clock"></i> ${booking.days} Days
        </span>
      </div>
    </div>

    <!-- Card Footer: Telematics feature note + Dedicated Button Bar -->
    <div class="p-3 sm:p-4 px-4 sm:px-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/40 dark:bg-slate-800/20">
      <div class="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full ${isCancelled ? 'bg-slate-400' : 'bg-emerald-500 animate-pulse'} inline-block"></span>
        <span>${isCancelled ? 'Booking Cancelled • Refund In Process' : 'AIS-140 GPS Enabled • Chauffeur & Fuel Included'}</span>
      </div>
      <div class="flex items-center gap-2 flex-wrap ml-auto">
        <button class="btn-view-trip-details px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5" data-trip-id="${booking.id}">
          <i class="fa-solid fa-circle-info text-blue-500"></i> Details
        </button>
        <button class="btn-view-invoice px-3 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5" data-trip-id="${booking.id}">
          <i class="fa-solid fa-file-invoice text-slate-500"></i> Invoice
        </button>
        ${!isCancelled ? `
        <button class="btn-track-trip px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center gap-1.5" data-trip-id="${booking.id}">
          <i class="fa-solid fa-satellite-dish"></i> Track Live
        </button>` : ''}
        ${cancelBtnHtml}
      </div>
    </div>
  `;

  if (prepend && container.firstChild) {
    container.insertBefore(card, container.firstChild);
  } else {
    container.appendChild(card);
  }
}

function renderSingleInvoiceRow(booking, prepend) {
  const tbody = document.getElementById('invoices-table-body');
  if (!tbody) return;

  const invNo = `INV-2026-${booking.id.replace('TV-2026-', '')}`;
  const tr = document.createElement('tr');
  tr.className = 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors animate-fadeIn';
  tr.innerHTML = `
    <td class="py-3.5 px-3 font-bold text-blue-600">${invNo}</td>
    <td class="py-3.5 px-3 font-bold text-slate-900 dark:text-white">${booking.id}</td>
    <td class="py-3.5 px-3 text-slate-500">${booking.createdAt || 'Nov 05, 2026'}</td>
    <td class="py-3.5 px-3 font-bold text-slate-900 dark:text-white">₹${booking.advance.toLocaleString('en-IN')}</td>
    <td class="py-3.5 px-3 text-slate-500">TransVoyage Gateway</td>
    <td class="py-3.5 px-3"><span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">ADVANCE PAID</span></td>
    <td class="py-3.5 px-3 text-right space-x-2">
      <button class="btn-view-invoice text-blue-600 hover:underline font-bold" data-trip-id="${booking.id}">Download PDF</button>
    </td>
  `;

  if (prepend && tbody.firstChild) {
    tbody.insertBefore(tr, tbody.firstChild);
  } else {
    tbody.appendChild(tr);
  }
}

/* ==========================================
   2.2 TRIP DETAILS MODAL
   ========================================== */
function openTripDetailsModal(tripId) {
  let modal = document.getElementById('trip-details-modal');
  if (modal) modal.remove();

  // Look for stored custom booking or default data
  let customBookings = [];
  try {
    customBookings = JSON.parse(localStorage.getItem('tv_custom_bookings')) || [];
  } catch (e) { customBookings = []; }

  const custom = customBookings.find(b => b.id === tripId);

  const vehicleTitle = custom ? custom.vehicle : (tripId === 'TV-2026-742' ? '26-Seater Mini Coach Bus' : (tripId === 'TV-2026-411' ? '12-Seater Tempo Traveller Luxury' : '17-Seater Force Urbania VIP Luxury'));
  const regNumber = tripId === 'TV-2026-742' ? 'KA-01-EQ-4418' : (tripId === 'TV-2026-411' ? 'KA-04-NB-1092' : 'KA-01-MJ-9921');
  const route = custom ? `${custom.pickup} ➔ ${custom.destination}` : (tripId === 'TV-2026-742' ? 'Bangalore Central ➔ Mysore ➔ Ooty Heritage Circuit' : (tripId === 'TV-2026-411' ? 'Whitefield Tech Park ➔ Bangalore International Airport' : 'Bangalore Airport Terminal 1 ➔ Madikeri & Coorg Resort Circuit'));
  const dates = custom ? `${custom.depDate} to ${custom.retDate} (${custom.days} Days)` : (tripId === 'TV-2026-742' ? 'Oct 12 - Oct 15, 2026 (3 Days)' : (tripId === 'TV-2026-411' ? 'Aug 22, 2026 (Single Day)' : 'Nov 07, 2026 (06:30 AM) to Nov 10, 2026 (08:00 PM)'));
  const statusBadge = (tripId === 'TV-2026-742' || tripId === 'TV-2026-411') ? '<span class="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Completed &amp; Closed</span>' : '<span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"><i class="fa-solid fa-circle-check mr-1"></i> Confirmed &amp; Driver Allocated</span>';
  const fare = custom ? `₹${custom.grandTotal.toLocaleString('en-IN')}` : (tripId === 'TV-2026-742' ? '₹33,138' : (tripId === 'TV-2026-411' ? '₹4,200' : '₹16,400'));

  modal = document.createElement('div');
  modal.id = 'trip-details-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[92vh] overflow-y-auto space-y-6">
      <button onclick="document.getElementById('trip-details-modal').remove()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <span class="text-xs font-bold text-slate-400 uppercase tracking-wider">Charter Trip Details</span>
          <h2 class="text-2xl font-black text-slate-900 dark:text-white font-heading">${tripId}</h2>
        </div>
        <div>${statusBadge}</div>
      </div>

      <!-- Route Card -->
      <div class="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-3">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider">Itinerary & Schedule</h4>
        <div class="flex items-start gap-3">
          <i class="fa-solid fa-route text-blue-600 text-lg mt-0.5"></i>
          <div>
            <p class="text-sm font-bold text-slate-900 dark:text-white">${route}</p>
            <p class="text-xs text-slate-500 mt-0.5"><i class="fa-solid fa-clock text-slate-400 mr-1"></i> ${dates}</p>
          </div>
        </div>
      </div>

      <!-- Vehicle & Chauffeur Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <!-- Vehicle Card -->
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Allocated Fleet</span>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center text-lg">
              <i class="fa-solid fa-bus"></i>
            </div>
            <div>
              <p class="text-xs font-bold text-slate-900 dark:text-white">${vehicleTitle}</p>
              <p class="text-[11px] text-slate-400">Reg: <strong>${regNumber}</strong></p>
            </div>
          </div>
          <ul class="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <li><i class="fa-solid fa-check text-emerald-500 mr-1"></i> Dual Zone Climate AC</li>
            <li><i class="fa-solid fa-check text-emerald-500 mr-1"></i> AIS-140 GPS & Panic Button</li>
            <li><i class="fa-solid fa-check text-emerald-500 mr-1"></i> 80 km/h Speed Governor Capped</li>
          </ul>
        </div>

        <!-- Chauffeur Card -->
        <div class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Chauffeur</span>
          <div class="flex items-center gap-3">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" class="w-10 h-10 rounded-full object-cover border-2 border-blue-500">
            <div>
              <p class="text-xs font-bold text-slate-900 dark:text-white">Rajesh Kumar</p>
              <p class="text-[11px] text-amber-500 font-bold"><i class="fa-solid fa-star"></i> 4.9 (420+ trips)</p>
            </div>
          </div>
          <ul class="text-[11px] text-slate-500 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
            <li><i class="fa-solid fa-shield-halved text-blue-500 mr-1"></i> Police Vetted &amp; Drug Tested</li>
            <li><i class="fa-solid fa-phone text-emerald-500 mr-1"></i> Phone: +91 98765 43210</li>
            <li><i class="fa-solid fa-language text-slate-400 mr-1"></i> English, Hindi, Kannada, Tamil</li>
          </ul>
        </div>
      </div>

      <!-- Financial Billing Overview -->
      <div class="bg-blue-50/60 dark:bg-slate-800/40 p-4 rounded-2xl border border-blue-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span class="text-[11px] text-slate-400 uppercase">Tariff Billing Total:</span>
          <p class="text-xl font-black text-slate-900 dark:text-white">${fare}</p>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <button onclick="document.getElementById('trip-details-modal').remove(); openInvoiceModal('${tripId}');" class="px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 shadow-sm">
            <i class="fa-solid fa-file-invoice mr-1 text-blue-500"></i> Tax Invoice
          </button>
          <button onclick="document.getElementById('trip-details-modal').remove(); openLiveTrackModal('${tripId}');" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow">
            <i class="fa-solid fa-location-arrow mr-1"></i> Track Live
          </button>
          <button onclick="document.getElementById('trip-details-modal').remove(); openCancelBookingModal('${tripId}');" class="px-3.5 py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 hover:bg-rose-100 rounded-xl text-xs font-bold border border-rose-200 dark:border-rose-800 shadow-sm">
            <i class="fa-solid fa-ban mr-1"></i> Cancel Trip
          </button>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2">
        <a href="tel:+919876543210" class="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1.5">
          <i class="fa-solid fa-headset"></i> 24/7 TransVoyage Concierge Desk
        </a>
        <button onclick="document.getElementById('trip-details-modal').remove()" class="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-300">
          Close Window
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* ==========================================
   2.25 CANCELLATION MODAL & PROCESSOR
   ========================================== */
function openCancelBookingModal(tripId) {
  let modal = document.getElementById('cancel-booking-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'cancel-booking-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 animate-scaleUp">
      <button onclick="document.getElementById('cancel-booking-modal').remove()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <div class="text-center space-y-1">
        <div class="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto text-2xl mb-2">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white font-heading">Cancel Vehicle Booking</h3>
        <p class="text-xs text-slate-500">Trip Reference: <strong class="text-slate-800 dark:text-slate-200">${tripId}</strong></p>
      </div>

      <!-- Cancellation Policy Tier Notice -->
      <div class="bg-rose-50/80 dark:bg-rose-950/30 p-4 rounded-2xl border border-rose-200 dark:border-rose-800/40 text-xs text-slate-700 dark:text-slate-300 space-y-2">
        <div class="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
          <i class="fa-solid fa-shield-halved"></i>
          <span>Official Carriage Cancellation Policy</span>
        </div>
        <ul class="text-[11px] space-y-1 text-slate-600 dark:text-slate-400">
          <li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-emerald-500"></i> <strong>&gt; 48 hours prior:</strong> 100% refund of advance (minus ₹500 clerical handling fee).</li>
          <li class="flex items-center gap-1.5"><i class="fa-solid fa-check text-amber-500"></i> <strong>24 – 48 hours prior:</strong> 50% refund of advance deposit.</li>
          <li class="flex items-center gap-1.5"><i class="fa-solid fa-xmark text-rose-500"></i> <strong>&lt; 24 hours prior:</strong> Advance deposit forfeited.</li>
        </ul>
      </div>

      <!-- Reason Selection Form -->
      <div class="space-y-3 text-xs">
        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Reason for Cancellation <span class="text-rose-500">*</span></label>
          <select id="cancel-reason-select" class="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-rose-500">
            <option value="Change of travel plans / dates">Change of travel plans or dates</option>
            <option value="Trip cancelled by group members">Trip cancelled by group / corporate members</option>
            <option value="Found alternative transport arrangement">Found alternative transport arrangement</option>
            <option value="Medical or personal emergency">Medical or personal emergency</option>
            <option value="Other unforeseen reasons">Other unforeseen reasons</option>
          </select>
        </div>

        <div>
          <label class="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Additional Remarks (Optional)</label>
          <textarea id="cancel-remarks-input" rows="2" placeholder="Briefly describe if you want to reschedule instead..." class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none text-xs"></textarea>
        </div>
      </div>

      <!-- Actions -->
      <div class="grid grid-cols-2 gap-3 pt-1">
        <button onclick="document.getElementById('cancel-booking-modal').remove()" class="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all">
          Keep Booking
        </button>
        <button onclick="confirmTripCancellation('${tripId}')" class="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5">
          <i class="fa-solid fa-ban"></i>
          <span>Confirm Cancel</span>
        </button>
      </div>

      <p class="text-[10px] text-center text-slate-400">
        Refunds are credited back to the original payment source within 3–5 business days.
      </p>
    </div>
  `;
  document.body.appendChild(modal);
}

function confirmTripCancellation(tripId) {
  const modal = document.getElementById('cancel-booking-modal');
  if (modal) modal.remove();

  // 1. Check if stored in localStorage
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem('tv_custom_bookings')) || [];
  } catch (e) { saved = []; }

  const matchIdx = saved.findIndex(b => b.id === tripId);
  if (matchIdx !== -1) {
    saved[matchIdx].status = 'cancelled';
    localStorage.setItem('tv_custom_bookings', JSON.stringify(saved));
  }

  // 2. Update UI card on screen
  const targetCard = document.getElementById(`card-trip-${tripId}`);
  if (targetCard) {
    targetCard.setAttribute('data-status', 'cancelled');
    targetCard.classList.remove('border-emerald-500/40', 'border-slate-200', 'dark:border-slate-800');
    targetCard.classList.add('border-rose-200', 'dark:border-rose-900/40', 'opacity-75');
    const badge = targetCard.querySelector('.trip-status-pill, .bg-emerald-100');
    if (badge) {
      badge.className = 'trip-status-pill px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
      badge.innerHTML = '<i class="fa-solid fa-ban mr-1"></i> Cancelled (Refund Initiated)';
    }
    const cBtn = targetCard.querySelector('.btn-cancel-trip');
    if (cBtn) cBtn.remove();
    const trackBtn = targetCard.querySelector('.btn-track-trip');
    if (trackBtn) trackBtn.remove();
  }

  // Also update overview card if TV-2026-981
  if (tripId === 'TV-2026-981') {
    const kpiUpcoming = document.getElementById('kpi-upcoming-trip');
    if (kpiUpcoming) {
      kpiUpcoming.textContent = 'None Active';
      kpiUpcoming.className = 'text-2xl font-black text-slate-400 font-heading mt-1';
    }
    const overviewCard = document.querySelector('#tab-overview .bg-emerald-100');
    if (overviewCard) {
      overviewCard.className = 'px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      overviewCard.innerHTML = '<i class="fa-solid fa-ban mr-1"></i> Cancelled (Refund Initiated)';
    }
    const overviewCancelBtn = document.querySelector('#tab-overview .btn-cancel-trip');
    if (overviewCancelBtn) overviewCancelBtn.remove();
  }

  if (window.showToast) {
    showToast(`Booking ${tripId} has been successfully cancelled. Refund initiated as per carriage terms.`, 'info');
  }
}

/* ==========================================
   2.3 INTERACTIVE PAYMENT GATEWAY MODAL
   ========================================== */
function openPaymentModal(amount, tripId) {
  let modal = document.getElementById('payment-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'payment-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative space-y-5 animate-scaleUp">
      <button onclick="document.getElementById('payment-modal').remove()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <div class="text-center space-y-1">
        <div class="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto text-xl mb-2">
          <i class="fa-solid fa-credit-card"></i>
        </div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white font-heading">Secure Payment Checkout</h3>
        <p class="text-xs text-slate-500">Trip Ref: <strong>${tripId}</strong></p>
      </div>

      <div class="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-200 dark:border-amber-800/40 flex items-center justify-between">
        <span class="text-xs font-bold text-amber-800 dark:text-amber-300 uppercase">Amount Payable:</span>
        <span class="text-2xl font-black text-slate-900 dark:text-white font-heading">₹${amount.toLocaleString('en-IN')}</span>
      </div>

      <!-- Prototype Simulation Notice -->
      <div class="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-[11px] text-blue-800 dark:text-blue-300 text-left flex items-start gap-2">
        <i class="fa-solid fa-circle-info text-blue-600 mt-0.5 flex-shrink-0"></i>
        <span><strong>Frontend Prototype Sandbox:</strong> Demonstrates simulated UPI QR, Card & Net Banking checkout. No real monetary transactions are processed.</span>
      </div>

      <!-- Payment Tabs -->
      <div class="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold">
        <button type="button" onclick="switchPayTab('upi')" id="pay-tab-upi" class="py-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm">
          UPI / QR
        </button>
        <button type="button" onclick="switchPayTab('card')" id="pay-tab-card" class="py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white">
          Card
        </button>
        <button type="button" onclick="switchPayTab('net')" id="pay-tab-net" class="py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white">
          Net Banking
        </button>
      </div>

      <!-- UPI Form -->
      <div id="pay-sec-upi" class="space-y-4 text-center">
        <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 inline-block shadow-sm">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=transvoyage@icici&pn=TransVoyage&am=${amount}&cu=INR" alt="UPI QR" class="w-32 h-32 mx-auto rounded-lg">
          <p class="text-[10px] text-slate-400 mt-2 font-mono">UPI ID: transvoyage@icici</p>
        </div>
        <p class="text-xs text-slate-500">Scan using GPay, PhonePe, Paytm, or BHIM UPI.</p>
      </div>

      <!-- Card Form -->
      <div id="pay-sec-card" class="space-y-3 hidden text-left text-xs">
        <div>
          <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Card Number</label>
          <input type="text" placeholder="4111 2222 3333 4444" value="4532 •••• •••• 8821" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Expiry</label>
            <input type="text" placeholder="MM/YY" value="09/28" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
          </div>
          <div>
            <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">CVV</label>
            <input type="password" placeholder="CVV" value="•••" class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
          </div>
        </div>
      </div>

      <!-- Net Banking Form -->
      <div id="pay-sec-net" class="space-y-3 hidden text-left text-xs">
        <label class="block font-medium text-slate-600 dark:text-slate-300 mb-1">Select Bank</label>
        <select class="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none">
          <option>HDFC Bank</option>
          <option>ICICI Bank</option>
          <option>State Bank of India</option>
          <option>Axis Bank</option>
        </select>
      </div>

      <button onclick="executePaymentProcessing(${amount}, '${tripId}')" id="btn-confirm-payment" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 text-xs transition-all flex items-center justify-center gap-2">
        <i class="fa-solid fa-lock"></i>
        <span>Pay ₹${amount.toLocaleString('en-IN')} Securely</span>
      </button>

      <p class="text-[10px] text-center text-slate-400">
        <i class="fa-solid fa-shield-halved text-emerald-500 mr-1"></i> Simulated Sandbox Gateway • Production integration requires Razorpay/Stripe API keys
      </p>
    </div>
  `;
  document.body.appendChild(modal);
}

function switchPayTab(mode) {
  const tabUpi = document.getElementById('pay-tab-upi');
  const tabCard = document.getElementById('pay-tab-card');
  const tabNet = document.getElementById('pay-tab-net');
  const secUpi = document.getElementById('pay-sec-upi');
  const secCard = document.getElementById('pay-sec-card');
  const secNet = document.getElementById('pay-sec-net');

  [tabUpi, tabCard, tabNet].forEach(t => t.className = 'py-2 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white');
  [secUpi, secCard, secNet].forEach(s => s.classList.add('hidden'));

  if (mode === 'card') {
    tabCard.className = 'py-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm';
    secCard.classList.remove('hidden');
  } else if (mode === 'net') {
    tabNet.className = 'py-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm';
    secNet.classList.remove('hidden');
  } else {
    tabUpi.className = 'py-2 rounded-lg bg-white dark:bg-slate-900 text-blue-600 dark:text-white shadow-sm';
    secUpi.classList.remove('hidden');
  }
}

function executePaymentProcessing(amount, tripId) {
  const btn = document.getElementById('btn-confirm-payment');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch animate-spin mr-2"></i> Authorizing with Bank...';
  }

  setTimeout(() => {
    const modal = document.getElementById('payment-modal');
    if (modal) modal.remove();

    // Clear outstanding UI balance
    const elOutstanding = document.getElementById('pay-outstanding-amt');
    if (elOutstanding) elOutstanding.textContent = '₹0';

    const elKpiPending = document.getElementById('kpi-pending-invoice');
    if (elKpiPending) elKpiPending.textContent = '₹0';

    const payBtn = document.getElementById('btn-pay-outstanding');
    if (payBtn) {
      payBtn.className = 'w-full py-2.5 px-4 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 mt-2';
      payBtn.innerHTML = '<i class="fa-solid fa-check"></i> Outstanding Cleared';
      payBtn.onclick = null;
    }

    if (window.showToast) {
      showToast(`Payment of ₹${amount.toLocaleString('en-IN')} Successful! Transaction ID: TXN_${Math.floor(10000000 + Math.random() * 90000000)}`, 'success');
    }
  }, 1200);
}

/* ==========================================
   2.4 WALLET TOP-UP MODAL
   ========================================== */
function openTopUpModal() {
  let modal = document.getElementById('topup-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'topup-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 animate-scaleUp">
      <div class="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center mx-auto text-xl">
        <i class="fa-solid fa-wallet"></i>
      </div>
      <div>
        <h3 class="text-xl font-black text-slate-900 dark:text-white font-heading">Recharge Wallet</h3>
        <p class="text-xs text-slate-500">Add funds for 1-click advance booking & loyalty bonuses.</p>
      </div>

      <div class="grid grid-cols-3 gap-2">
        <button type="button" onclick="selectTopUpAmount(1000)" class="topup-amount-btn py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500">₹1,000</button>
        <button type="button" onclick="selectTopUpAmount(2500)" class="topup-amount-btn py-2 rounded-xl border-2 border-blue-600 text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-950/40">₹2,500</button>
        <button type="button" onclick="selectTopUpAmount(5000)" class="topup-amount-btn py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:border-blue-500">₹5,000</button>
      </div>

      <input type="number" id="topup-custom-input" value="2500" class="w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-center outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white">

      <button onclick="executeWalletTopUp()" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md transition-all">
        Proceed to Add Money
      </button>

      <button onclick="document.getElementById('topup-modal').remove()" class="text-xs text-slate-400 hover:underline">Cancel</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function selectTopUpAmount(amt) {
  const input = document.getElementById('topup-custom-input');
  if (input) input.value = amt;
}

function executeWalletTopUp() {
  const input = document.getElementById('topup-custom-input');
  const amt = parseInt(input ? input.value : '2500', 10) || 2500;

  const modal = document.getElementById('topup-modal');
  if (modal) modal.remove();

  const elWallet = document.getElementById('pay-wallet-amt');
  const elKpiWallet = document.getElementById('kpi-wallet-balance');
  const current = 2450;
  const newBal = current + amt;

  if (elWallet) elWallet.textContent = `₹${newBal.toLocaleString('en-IN')}`;
  if (elKpiWallet) elKpiWallet.textContent = `₹${newBal.toLocaleString('en-IN')}`;

  if (window.showToast) {
    showToast(`Added ₹${amt.toLocaleString('en-IN')} to TransVoyage Wallet! New Balance: ₹${newBal.toLocaleString('en-IN')}`, 'success');
  }
}

function openLiveTrackModal(tripId) {
  let modal = document.getElementById('live-track-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'live-track-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
      <button onclick="document.getElementById('live-track-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <div class="flex items-center gap-3 mb-4">
        <span class="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white">Live Vehicle GPS Tracking</h3>
        <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">Active On Route</span>
      </div>

      <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Booking Ref: <strong class="text-slate-800 dark:text-slate-200">${tripId}</strong> • Outstation Transit Circuit</p>

      <!-- Live Interactive Route Map -->
      <div class="relative w-full h-72 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-6 shadow-inner">
        <iframe 
          src="https://maps.google.com/maps?q=Bangalore+-+Mysore+Expressway,+Karnataka&amp;t=&amp;z=11&amp;ie=UTF8&amp;iwloc=&amp;output=embed" 
          class="w-full h-full border-0 absolute inset-0" 
          allowfullscreen="" 
          loading="lazy" 
          referrerpolicy="no-referrer-when-downgrade"
          title="Trip Route Live Map">
        </iframe>
        
        <!-- Live Badge Overlay -->
        <div class="absolute top-3 left-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shadow-sm">
            <i class="fa-solid fa-bus"></i>
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span class="text-xs font-bold text-slate-900 dark:text-white">KA-01-MJ-9921</span>
              <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">(62 km/h)</span>
            </div>
            <p class="text-[10px] text-slate-500">Live Telemetry • Bangalore - Mysore Hwy</p>
          </div>
        </div>

        <div class="absolute bottom-3 right-3 z-10 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-700 dark:text-slate-300">
          <i class="fa-solid fa-shield-halved text-blue-500 mr-1"></i> AIS-140 GPS Radar Active
        </div>
      </div>
            <div class="text-center">
              <i class="fa-solid fa-flag-checkered text-rose-500 text-lg"></i>
              <p class="mt-1 font-bold">Destination Outstation</p>
              <p class="text-[10px] text-slate-400">ETA: 01:45 PM (In 1h 15m)</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Driver & Vehicle Details -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 text-sm">
        <div class="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" alt="Driver" class="w-12 h-12 rounded-full object-cover border-2 border-blue-500">
          <div>
            <p class="text-xs text-slate-400">Assigned Chauffeur</p>
            <p class="font-bold text-slate-800 dark:text-slate-100">Rajesh Kumar <span class="text-amber-500 text-xs">★ 4.9 (420+ trips)</span></p>
            <a href="tel:+919876543210" class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5">
              <i class="fa-solid fa-phone"></i> +91 98765 43210
            </a>
          </div>
        </div>
        <div>
          <p class="text-xs text-slate-400">Assigned Vehicle</p>
          <p class="font-bold text-slate-800 dark:text-slate-100">17-Seater Force Urbania Luxury</p>
          <p class="text-xs text-slate-500 dark:text-slate-400">Speed Governor: 80 km/h Capped • AC On</p>
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button onclick="document.getElementById('live-track-modal').remove()" class="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button onclick="if(window.showToast) showToast('Emergency Dispatch Alerted!', 'warning')" class="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2">
          <i class="fa-solid fa-shield-halved"></i> SOS Emergency Contact
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

function openInvoiceModal(tripId) {
  let modal = document.getElementById('invoice-modal');
  if (modal) modal.remove();

  let customBookings = [];
  try {
    customBookings = JSON.parse(localStorage.getItem('tv_custom_bookings')) || [];
  } catch (e) { customBookings = []; }
  const custom = customBookings.find(b => b.id === tripId);

  const invNo = `INV-2026-${tripId.replace('TV-2026-', '')}`;
  const invDate = custom ? custom.createdAt : (tripId === 'TV-2026-981' ? 'Nov 04, 2026' : (tripId === 'TV-2026-411' ? 'Aug 22, 2026' : 'Oct 15, 2026'));
  const fleetName = custom ? custom.vehicle : (tripId === 'TV-2026-981' ? '17-Seater Force Urbania VIP Luxury' : (tripId === 'TV-2026-411' ? '12-Seater Tempo Traveller' : '26-Seater Mini Coach'));
  const routeName = custom ? `${custom.pickup} ➔ ${custom.destination} (${custom.days} Days)` : (tripId === 'TV-2026-981' ? 'Bangalore Airport to Coorg Circuit (4 Days)' : (tripId === 'TV-2026-411' ? 'Whitefield to Bangalore Airport Drop' : 'Bangalore - Mysore - Ooty (3 Days)'));
  const totalAmount = custom ? custom.grandTotal : (tripId === 'TV-2026-981' ? 16400 : (tripId === 'TV-2026-411' ? 4200 : 33138));
  const baseCost = Math.round(totalAmount * 0.82);
  const gst = Math.round(totalAmount * 0.05);
  const batta = totalAmount - baseCost - gst;

  modal = document.createElement('div');
  modal.id = 'invoice-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[90vh] overflow-y-auto">
      <button onclick="document.getElementById('invoice-modal').remove()" class="no-print absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <div id="printable-invoice">
        <!-- Invoice Header -->
        <div class="flex justify-between items-start border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base">TV</span>
              <span class="text-lg font-bold text-slate-900 dark:text-white font-heading">TransVoyage Rentals</span>
            </div>
            <p class="text-xs text-slate-500">GSTIN: 29AABCT1334M1Z2</p>
            <p class="text-xs text-slate-500">All India Tourist Coach Depot, Hub 4</p>
          </div>
          <div class="text-right">
            <span class="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider">OFFICIAL TAX INVOICE</span>
            <p class="text-xs text-slate-500 mt-2">Invoice: <strong>${invNo}</strong></p>
            <p class="text-xs text-slate-500">Date: ${invDate}</p>
          </div>
        </div>

        <!-- Bill To -->
        <div class="grid grid-cols-2 gap-4 text-xs mb-4 text-slate-600 dark:text-slate-400">
          <div>
            <p class="font-bold text-slate-900 dark:text-white uppercase mb-1">Billed To:</p>
            <p class="font-semibold text-slate-800 dark:text-slate-200">Sarah Jenkins</p>
            <p>Corporate Events Specialist</p>
            <p>sarah.j@techsolutions.com</p>
          </div>
          <div>
            <p class="font-bold text-slate-900 dark:text-white uppercase mb-1">Trip Summary:</p>
            <p><strong>Fleet:</strong> ${fleetName}</p>
            <p><strong>Route:</strong> ${routeName}</p>
            <p><strong>Trip Ref:</strong> ${tripId}</p>
          </div>
        </div>

        <!-- Line Items Table -->
        <table class="w-full text-xs text-left mb-4">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700 text-slate-400 uppercase">
              <th class="py-2 font-semibold">Description</th>
              <th class="py-2 text-center font-semibold">Units</th>
              <th class="py-2 text-right font-semibold">Amount</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            <tr>
              <td class="py-2.5 font-medium">Vehicle Base Hire (${fleetName})</td>
              <td class="py-2.5 text-center">Itinerary Run</td>
              <td class="py-2.5 text-right font-semibold">₹${baseCost.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td class="py-2.5 font-medium">Driver Daily Allowance &amp; Batta</td>
              <td class="py-2.5 text-center">Included</td>
              <td class="py-2.5 text-right font-semibold">₹${batta.toLocaleString('en-IN')}</td>
            </tr>
            <tr>
              <td class="py-2.5 font-medium">GST (5% Passenger Road Transport)</td>
              <td class="py-2.5 text-center">5%</td>
              <td class="py-2.5 text-right font-semibold">₹${gst.toLocaleString('en-IN')}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="border-t-2 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm">
              <td colspan="2" class="py-3 text-right">Grand Total:</td>
              <td class="py-3 text-right text-blue-600 dark:text-blue-400 text-base">₹${totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </tfoot>
        </table>

        <div class="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg text-[11px] text-slate-500 dark:text-slate-400">
          Payment Mode: Razorpay Secured Gateway • Transaction ID: TXN_8819230491. For any queries, reach billing@transvoyage.com
        </div>
      </div>

      <div class="mt-6 flex justify-end gap-3 no-print">
        <button onclick="document.getElementById('invoice-modal').remove()" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        <button onclick="window.print()" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-2">
          <i class="fa-solid fa-print"></i> Print / Download PDF
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
}

/* ==========================================
   3. ADMIN DASHBOARD CHARTS & ACTIONS
   ========================================== */
function initAdminDashboard() {
  const revenueChartCanvas = document.getElementById('admin-revenue-chart');
  const fleetChartCanvas = document.getElementById('admin-fleet-chart');

  // Check if Chart.js is available and canvases exist
  if (typeof Chart !== 'undefined') {
    if (revenueChartCanvas) {
      new Chart(revenueChartCanvas, {
        type: 'line',
        data: {
          labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'],
          datasets: [
            {
              label: 'Fleet Revenue (₹ Lakhs)',
              data: [14.2, 18.5, 22.8, 26.4, 31.0, 38.5, 42.5],
              borderColor: '#2563EB',
              backgroundColor: 'rgba(37, 99, 235, 0.1)',
              fill: true,
              tension: 0.35,
              borderWidth: 3,
              pointBackgroundColor: '#2563EB'
            },
            {
              label: 'Completed Bookings',
              data: [85, 110, 135, 160, 195, 240, 280],
              borderColor: '#10B981',
              backgroundColor: 'transparent',
              borderWidth: 2,
              tension: 0.35,
              pointBackgroundColor: '#10B981'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: document.documentElement.classList.contains('dark') ? '#94A3B8' : '#475569'
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: '#94A3B8' }
            },
            y: {
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: { color: '#94A3B8' }
            }
          }
        }
      });
    }

    if (fleetChartCanvas) {
      new Chart(fleetChartCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Tempo Travellers (9-20)', 'Mini Buses (26-35)', 'Luxury Coaches (45-55)', 'Sleeper Coaches'],
          datasets: [{
            data: [42, 28, 22, 8],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6'],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                color: document.documentElement.classList.contains('dark') ? '#94A3B8' : '#475569'
              }
            }
          }
        }
      });
    }
  }

  // Admin Booking Status Switcher
  const statusSelectors = document.querySelectorAll('.admin-status-select');
  statusSelectors.forEach(select => {
    select.addEventListener('change', (e) => {
      const val = e.target.value;
      if (window.showToast) {
        window.showToast(`Trip status updated to: ${val.toUpperCase()}`, 'success');
      }
    });
  });

  // Admin Reply to Message Button
  const replyBtns = document.querySelectorAll('.btn-admin-reply');
  replyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const customerName = btn.getAttribute('data-customer') || 'Customer';
      openAdminReplyModal(customerName);
    });
  });
}

function openAdminReplyModal(customerName) {
  let modal = document.getElementById('admin-reply-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'admin-reply-modal';
    modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm';
    modal.innerHTML = `
      <div class="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button onclick="document.getElementById('admin-reply-modal').remove()" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>

        <h3 class="text-xl font-bold text-slate-900 dark:text-white font-heading mb-1">Reply to Enquiry</h3>
        <p class="text-xs text-slate-500 mb-4">Customer: <strong class="text-slate-800 dark:text-slate-200" id="reply-customer-name">${customerName}</strong></p>

        <form onsubmit="event.preventDefault(); document.getElementById('admin-reply-modal').remove(); if(window.showToast) showToast('Reply sent via Email & SMS!', 'success');" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Subject</label>
            <input type="text" value="Quotation for 45-Seater Luxury AC Coach Charter" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Message Content</label>
            <textarea rows="4" class="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:ring-2 focus:ring-blue-500">Hello, thank you for contacting TransVoyage. We have reserved our 45-seater Volvo Coach for your scheduled travel. Attached is the customized itinerary and tariff breakdown.</textarea>
          </div>
          <div class="flex justify-end gap-2">
            <button type="button" onclick="document.getElementById('admin-reply-modal').remove()" class="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5">
              <i class="fa-solid fa-paper-plane"></i> Send Reply
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);
  } else {
    document.getElementById('reply-customer-name').textContent = customerName;
    modal.classList.remove('hidden');
  }
}


/* ==========================================
   2.6 CO-TRAVELERS MANAGEMENT ENGINE
   ========================================== */
const DEFAULT_TRAVELERS = [
  { id: 'trv-1', name: 'Sarah Jenkins (Self)', age: 34, gender: 'Female', relation: 'Primary', idType: 'Aadhaar Verified', phone: '+91 98765 43210' },
  { id: 'trv-2', name: 'Michael Jenkins', age: 38, gender: 'Male', relation: 'Family', idType: 'Aadhaar Verified', phone: '+91 98765 43211' }
];

function initSavedTravelers() {
  let travelers = [];
  try {
    const raw = localStorage.getItem('tv_saved_travelers');
    if (raw) {
      travelers = JSON.parse(raw);
    } else {
      travelers = DEFAULT_TRAVELERS;
      localStorage.setItem('tv_saved_travelers', JSON.stringify(travelers));
    }
  } catch (err) {
    travelers = DEFAULT_TRAVELERS;
  }
  renderSavedTravelersList(travelers);
}

function renderSavedTravelersList(travelers) {
  const container = document.getElementById('saved-travelers-list');
  if (!container) return;

  if (!travelers || travelers.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
        <div class="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 mx-auto flex items-center justify-center text-xl">
          <i class="fa-solid fa-user-group"></i>
        </div>
        <p class="text-sm font-bold text-slate-800 dark:text-slate-200">No co-travelers saved yet</p>
        <p class="text-xs text-slate-500 max-w-sm mx-auto">Add family members, guests, or colleagues to speed up interstate passenger manifest verification.</p>
        <button onclick="openAddTravelerModal()" class="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow">
          + Add First Traveler
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = travelers.map(t => {
    const isPrimary = t.relation === 'Primary';
    const relationBadgeColor = isPrimary 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800' 
      : (t.relation === 'Family' 
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
          : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800');

    const avatarIcon = t.gender === 'Female' ? 'fa-user' : (isPrimary ? 'fa-user-tie' : 'fa-user');

    return `
      <div class="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex items-start justify-between gap-3 shadow-xs animate-fadeIn">
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-xl ${isPrimary ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'} flex items-center justify-center text-lg font-bold shrink-0 shadow-sm">
            <i class="fa-solid ${avatarIcon}"></i>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h4 class="text-sm font-bold text-slate-900 dark:text-white font-heading">${t.name}</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold border ${relationBadgeColor}">${t.relation}</span>
            </div>
            <p class="text-xs text-slate-500 mt-1">
              <span class="font-semibold text-slate-700 dark:text-slate-300">Age: ${t.age}</span> &bull; 
              <span class="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                <i class="fa-solid fa-circle-check text-[10px]"></i> ${t.idType}
              </span>
            </p>
            ${t.phone ? `<p class="text-[11px] text-slate-400 mt-0.5"><i class="fa-solid fa-phone text-[9px] mr-1"></i> ${t.phone}</p>` : ''}
          </div>
        </div>

        ${!isPrimary ? `
        <button onclick="removeTraveler('${t.id}')" title="Remove Co-Traveler" class="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950 transition-colors">
          <i class="fa-solid fa-trash-can text-xs"></i>
        </button>
        ` : '<span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded">Account Lead</span>'}
      </div>
    `;
  }).join('');
}

function openAddTravelerModal() {
  let modal = document.getElementById('add-traveler-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'add-traveler-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[92vh] overflow-y-auto space-y-5 animate-scaleUp">
      <button onclick="document.getElementById('add-traveler-modal').remove()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <!-- Modal Header -->
      <div class="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div class="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl font-bold shrink-0">
          <i class="fa-solid fa-user-plus"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white font-heading">Add Co-Traveler</h3>
          <p class="text-xs text-slate-500">Add passenger details to auto-fill manifests for interstate permits.</p>
        </div>
      </div>

      <!-- Add Traveler Form -->
      <form id="form-add-traveler" onsubmit="handleAddTravelerSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Legal Name (as per Govt ID) *</label>
          <input type="text" id="traveler-full-name" required placeholder="e.g. Ramesh Narayan" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Age *</label>
            <input type="number" id="traveler-age" required min="1" max="110" placeholder="e.g. 29" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Gender *</label>
            <select id="traveler-gender" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Relationship *</label>
            <select id="traveler-relation" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Family">Family Member</option>
              <option value="Colleague">Corporate Colleague</option>
              <option value="Friend">Friend / Group</option>
              <option value="Guest">Wedding Guest</option>
              <option value="Senior">Senior Citizen</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ID Proof Type *</label>
            <select id="traveler-id-type" required class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
              <option value="Aadhaar Verified">Aadhaar Card</option>
              <option value="Passport Verified">Indian / Int'l Passport</option>
              <option value="Voter ID Verified">Voter ID</option>
              <option value="Driving License">Driving License</option>
            </select>
          </div>
        </div>

        <div>
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Mobile Phone (Optional - for Driver SMS)</label>
          <input type="tel" id="traveler-phone" placeholder="e.g. +91 98765 12345" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <!-- Compliance note -->
        <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-500 flex items-center gap-2">
          <i class="fa-solid fa-shield-halved text-blue-500 shrink-0"></i>
          <span>Required by RTO for interstate passenger tax & travel insurance.</span>
        </div>

        <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button type="button" onclick="document.getElementById('add-traveler-modal').remove()" class="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5">
            <i class="fa-solid fa-check"></i>
            <span>Save Co-Traveler</span>
          </button>
        </div>
      </form>
    </div>
  `;
  document.body.appendChild(modal);
  const nameInput = document.getElementById('traveler-full-name');
  if (nameInput) nameInput.focus();
}

function handleAddTravelerSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('traveler-full-name').value.trim();
  const age = document.getElementById('traveler-age').value.trim();
  const gender = document.getElementById('traveler-gender').value;
  const relation = document.getElementById('traveler-relation').value;
  const idType = document.getElementById('traveler-id-type').value;
  const phone = document.getElementById('traveler-phone').value.trim();

  if (!name || !age) return;

  const newTraveler = {
    id: `trv-${Date.now()}`,
    name,
    age: parseInt(age, 10),
    gender,
    relation,
    idType,
    phone
  };

  let travelers = [];
  try {
    travelers = JSON.parse(localStorage.getItem('tv_saved_travelers')) || [];
  } catch (err) {
    travelers = [];
  }
  travelers.push(newTraveler);
  localStorage.setItem('tv_saved_travelers', JSON.stringify(travelers));

  const modal = document.getElementById('add-traveler-modal');
  if (modal) modal.remove();

  renderSavedTravelersList(travelers);

  if (window.showToast) {
    showToast(`Co-Traveler "${name}" added successfully!`, 'success');
  }
}

function removeTraveler(id) {
  let travelers = [];
  try {
    travelers = JSON.parse(localStorage.getItem('tv_saved_travelers')) || [];
  } catch (err) {
    travelers = [];
  }
  const removed = travelers.find(t => t.id === id);
  travelers = travelers.filter(t => t.id !== id);
  localStorage.setItem('tv_saved_travelers', JSON.stringify(travelers));
  renderSavedTravelersList(travelers);

  if (window.showToast && removed) {
    showToast(`Removed "${removed.name}" from saved travelers.`, 'info');
  }
}
