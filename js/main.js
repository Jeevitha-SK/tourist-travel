/**
 * TransVoyage - Tourist Bus & Traveller Rental
 * Core JavaScript Functions: Theme, RTL, Booking Calculator, Seat Filtering, Toasts, Modals
 */

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initRTL();
  initMobileMenu();
  initFareCalculator();
  initSeatFilters();
  initFaqAccordions();
  initBlogSearch();
  initVehicleComparison();
  initStickyHeader();
  initCabinVisualizer();
  initPhoneInputs();
});

/* ==========================================
   1. DARK / LIGHT THEME TOGGLE
   ========================================== */
function initTheme() {
  const savedTheme = localStorage.getItem('tv_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    updateThemeIcons(true);
  } else {
    document.documentElement.classList.remove('dark');
    updateThemeIcons(false);
  }

  // Bind to all theme toggle buttons
  const themeToggles = document.querySelectorAll('.theme-toggle-btn');
  themeToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('tv_theme', isDark ? 'dark' : 'light');
      updateThemeIcons(isDark);
    });
  });
}

function updateThemeIcons(isDark) {
  const darkIcons = document.querySelectorAll('.theme-icon-dark');
  const lightIcons = document.querySelectorAll('.theme-icon-light');

  darkIcons.forEach(icon => {
    if (isDark) {
      icon.classList.add('hidden');
    } else {
      icon.classList.remove('hidden');
    }
  });

  lightIcons.forEach(icon => {
    if (isDark) {
      icon.classList.remove('hidden');
    } else {
      icon.classList.add('hidden');
    }
  });
}

/* ==========================================
   2. RTL / LTR TOGGLE
   ========================================== */
function initRTL() {
  const savedDir = localStorage.getItem('tv_dir') || 'ltr';
  document.documentElement.setAttribute('dir', savedDir);
  updateRTLUI(savedDir === 'rtl');

  const rtlToggles = document.querySelectorAll('.rtl-toggle-btn');
  rtlToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir');
      const newDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      document.documentElement.setAttribute('dir', newDir);
      localStorage.setItem('tv_dir', newDir);
      updateRTLUI(newDir === 'rtl');
    });
  });
}

function updateRTLUI(isRtl) {
  const rtlLabels = document.querySelectorAll('.rtl-label');
  rtlLabels.forEach(el => {
    el.textContent = isRtl ? 'LTR' : 'RTL';
  });
}

/* ==========================================
   3. MOBILE NAVIGATION DRAWER
   ========================================== */
function initMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenuDrawer = document.getElementById('mobile-menu-drawer') || document.getElementById('mobile-drawer');
  const mobileMenuClose = document.getElementById('mobile-menu-close') || document.getElementById('mobile-drawer-close');
  const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');

  if (!mobileMenuBtn || !mobileMenuDrawer) return;

  function openMenu() {
    mobileMenuDrawer.classList.remove('translate-x-full', '-translate-x-full');
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  }

  function closeMenu() {
    const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
    if (isRtl) {
      mobileMenuDrawer.classList.add('-translate-x-full');
    } else {
      mobileMenuDrawer.classList.add('translate-x-full');
    }
    if (mobileMenuBackdrop) mobileMenuBackdrop.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }

  mobileMenuBtn.addEventListener('click', openMenu);
  if (mobileMenuClose) mobileMenuClose.addEventListener('click', closeMenu);
  if (mobileMenuBackdrop) mobileMenuBackdrop.addEventListener('click', closeMenu);
}

/* ==========================================
   4. STICKY HEADER
   ========================================== */
function initStickyHeader() {
  const navbar = document.getElementById('main-navbar');

  window.addEventListener('scroll', () => {
    if (navbar) {
      if (window.scrollY > 40) {
        navbar.classList.add('shadow-md', 'bg-white/95', 'dark:bg-slate-900/95', 'backdrop-blur-md');
      } else {
        navbar.classList.remove('shadow-md');
      }
    }
  });
}

/* ==========================================
   5. INTERACTIVE FARE & BOOKING CALCULATOR
   ========================================== */
// Rates per km & base allowances (in INR standard equivalent)
const VEHICLE_RATES = {
  'tempo-9': { name: '9-Seater Force Urbania VIP Cruiser', ratePerKm: 26, driverDay: 500, minKm: 250, baseLocal: 3200, seats: 9 },
  'tempo-12': { name: '12-Seater Luxury Tempo Traveller', ratePerKm: 22, driverDay: 500, minKm: 300, baseLocal: 3200, seats: 12 },
  'tempo-17': { name: '17-Seater Executive Urbania', ratePerKm: 26, driverDay: 600, minKm: 300, baseLocal: 3800, seats: 17 },
  'tempo-20': { name: '20-Seater Maharaja Luxury Van', ratePerKm: 30, driverDay: 700, minKm: 300, baseLocal: 4500, seats: 20 },
  'bus-26': { name: '26-Seater Mini Tourist Coach', ratePerKm: 36, driverDay: 800, minKm: 300, baseLocal: 5500, seats: 26 },
  'bus-35': { name: '35-Seater Ultra Deluxe Tourist Bus', ratePerKm: 44, driverDay: 1000, minKm: 300, baseLocal: 7500, seats: 35 },
  'bus-40': { name: '40-Seater Tata Magna High-Deck', ratePerKm: 48, driverDay: 1100, minKm: 300, baseLocal: 8500, seats: 40 },
  'bus-45': { name: '45-Seater Luxury AC Coach', ratePerKm: 52, driverDay: 1200, minKm: 300, baseLocal: 9500, seats: 45 },
  'bus-49': { name: '49-Seater Ashok Leyland Viking', ratePerKm: 58, driverDay: 1300, minKm: 350, baseLocal: 10500, seats: 49 },
  'volvo-53': { name: '53-Seater Volvo / Scania Multi-Axle', ratePerKm: 65, driverDay: 1500, minKm: 350, baseLocal: 12000, seats: 53 }
};

function initFareCalculator() {
  const calcForm = document.getElementById('fare-calculator-form');
  if (!calcForm) return;

  const tripTypeRadios = calcForm.querySelectorAll('input[name="tripType"]');
  const vehicleSelect = calcForm.querySelector('#calc-vehicle');
  const daysInput = calcForm.querySelector('#calc-days');
  const distanceInput = calcForm.querySelector('#calc-distance');
  const depDateInput = calcForm.querySelector('#calc-dep-date');
  const retDateInput = calcForm.querySelector('#calc-ret-date');
  const passengersInput = calcForm.querySelector('#calc-passengers');
  const estTotalEl = document.getElementById('calc-estimated-total');
  const estPerKmEl = document.getElementById('calc-per-km-rate');
  const estDriverEl = document.getElementById('calc-driver-allowance');

  // Initialize dates with realistic defaults
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const dayAfter = new Date(today.getTime() + (86400000 * 3));
  if (depDateInput && !depDateInput.value) {
    depDateInput.value = tomorrow.toISOString().split('T')[0];
    depDateInput.min = today.toISOString().split('T')[0];
  }
  if (retDateInput && !retDateInput.value) {
    retDateInput.value = dayAfter.toISOString().split('T')[0];
    retDateInput.min = tomorrow.toISOString().split('T')[0];
  }

  // Date sync logic
  if (depDateInput && retDateInput) {
    function syncDates() {
      const d1 = new Date(depDateInput.value);
      const d2 = new Date(retDateInput.value);
      if (!isNaN(d1) && !isNaN(d2)) {
        let diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
        if (diff < 1) {
          diff = 1;
          retDateInput.value = depDateInput.value;
        }
        if (daysInput) daysInput.value = diff;
        calculate();
      }
    }
    depDateInput.addEventListener('change', () => {
      retDateInput.min = depDateInput.value;
      syncDates();
    });
    retDateInput.addEventListener('change', syncDates);
  }

  function calculate() {
    const tripType = calcForm.querySelector('input[name="tripType"]:checked')?.value || 'outstation-round';
    const vehicleKey = vehicleSelect?.value || 'tempo-12';
    const vehicle = VEHICLE_RATES[vehicleKey] || VEHICLE_RATES['tempo-12'];
    
    let days = parseInt(daysInput?.value || 1, 10);
    if (isNaN(days) || days < 1) days = 1;

    let distance = parseInt(distanceInput?.value || 300, 10);
    if (isNaN(distance) || distance < 50) distance = 50;

    let total = 0;
    let driverBatta = vehicle.driverDay * days;

    if (tripType === 'local-8hr') {
      total = vehicle.baseLocal * days;
      driverBatta = 0; // Included in local packages
    } else {
      // Outstation: Enforce minimum daily km (300 km standard)
      const effectiveKm = Math.max(distance, vehicle.minKm * days);
      total = (effectiveKm * vehicle.ratePerKm) + driverBatta;
    }

    // Format currency (INR symbol ₹)
    if (estTotalEl) estTotalEl.textContent = '₹' + total.toLocaleString('en-IN');
    if (estPerKmEl) estPerKmEl.textContent = '₹' + vehicle.ratePerKm + '/km';
    if (estDriverEl) estDriverEl.textContent = '₹' + driverBatta.toLocaleString('en-IN');
  }

  // Event Listeners for Live Calculation
  tripTypeRadios.forEach(radio => radio.addEventListener('change', calculate));
  if (vehicleSelect) vehicleSelect.addEventListener('change', calculate);
  if (daysInput) {
    daysInput.addEventListener('input', () => {
      if (depDateInput && retDateInput) {
        const d1 = new Date(depDateInput.value);
        const days = parseInt(daysInput.value || 1, 10);
        if (!isNaN(d1) && days >= 1) {
          const newRet = new Date(d1.getTime() + (days * 86400000));
          retDateInput.value = newRet.toISOString().split('T')[0];
        }
      }
      calculate();
    });
  }
  if (distanceInput) distanceInput.addEventListener('input', calculate);
  if (passengersInput) passengersInput.addEventListener('input', calculate);

  // Initial Run
  calculate();

  // Handle Form Submission: Open Booking Estimate & Enquiry Modal
  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const vehicleKey = vehicleSelect?.value || 'tempo-12';
    const vehicle = VEHICLE_RATES[vehicleKey] || VEHICLE_RATES['tempo-12'];
    const vehicleName = vehicle.name;
    const pickup = calcForm.querySelector('#calc-pickup')?.value || 'Bangalore, MG Road';
    const dest = calcForm.querySelector('#calc-destination')?.value || 'Ooty / Coonoor';
    const depDate = depDateInput?.value || tomorrow.toISOString().split('T')[0];
    const retDate = retDateInput?.value || dayAfter.toISOString().split('T')[0];
    const days = parseInt(daysInput?.value || 2, 10);
    const distance = parseInt(distanceInput?.value || 560, 10);
    const passengers = parseInt(passengersInput?.value || 10, 10);
    const tripType = calcForm.querySelector('input[name="tripType"]:checked')?.value || 'outstation-round';

    showBookingModal({
      vehicleKey,
      vehicleName,
      pickup,
      dest,
      depDate,
      retDate,
      days,
      distance,
      passengers,
      tripType,
      ratePerKm: vehicle.ratePerKm,
      driverAllowance: estDriverEl?.textContent || '₹1,000',
      total: estTotalEl?.textContent || '₹13,320'
    });
  });
}

// Global Helper to prefill calculator from destination cards
window.prefillCalculator = function(pickup, dest, vehicleKey, days, distance, passengers) {
  const calcForm = document.getElementById('fare-calculator-form');
  if (!calcForm) {
    window.location.href = `index.html#booking-calculator-sec`;
    return;
  }
  const elPickup = calcForm.querySelector('#calc-pickup');
  const elDest = calcForm.querySelector('#calc-destination');
  const elVehicle = calcForm.querySelector('#calc-vehicle');
  const elDays = calcForm.querySelector('#calc-days');
  const elDist = calcForm.querySelector('#calc-distance');
  const elPass = calcForm.querySelector('#calc-passengers');

  if (elPickup) elPickup.value = pickup;
  if (elDest) elDest.value = dest;
  if (elVehicle && vehicleKey) elVehicle.value = vehicleKey;
  if (elDays) elDays.value = days;
  if (elDist) elDist.value = distance;
  if (elPass) elPass.value = passengers;

  // Trigger input event to recompute
  if (elDays) elDays.dispatchEvent(new Event('input'));
  if (elDist) elDist.dispatchEvent(new Event('input'));

  // Scroll smoothly to top of hero section so titles never clip under navbar
  const target = document.getElementById('booking-calculator-sec');
  if (target) {
    const navbarHeight = document.querySelector('header')?.offsetHeight || 72;
    const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: Math.max(0, elementPosition - navbarHeight),
      behavior: 'smooth'
    });
  }
  if (window.showToast) {
    showToast(`Loaded route quote for ${dest}!`, 'info');
  }
};

// Global Handler: Smooth scroll to hero booking section without clipping top titles
document.addEventListener('click', function(e) {
  const link = e.target.closest('a[href="#booking-calculator-sec"], a[href="#corporate-rfp"]');
  if (link) {
    const hash = link.getAttribute('href');
    const target = document.querySelector(hash);
    if (target) {
      e.preventDefault();
      const navbarHeight = document.querySelector('header')?.offsetHeight || 72;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = Math.max(0, elementPosition - navbarHeight);

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      if (history.pushState) {
        history.pushState(null, null, hash);
      }
    }
  }
});

/* ==========================================
   6. VEHICLE FILTER BY SEAT CAPACITY & SORTING
   ========================================== */
function initSeatFilters() {
  const filterBtns = document.querySelectorAll('.seat-filter-btn');
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  const sortSelect = document.getElementById('fleet-sort-select');
  const grid = document.getElementById('fleet-card-grid');

  if (filterBtns.length === 0 || vehicleCards.length === 0) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Toggle active button style
      filterBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/30');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-lg', 'shadow-blue-600/30');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      const filterVal = btn.getAttribute('data-filter');

      vehicleCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const seats = parseInt(card.getAttribute('data-seats') || 0, 10);

        let match = false;
        if (filterVal === 'all') match = true;
        else if ((filterVal === '9-20' || filterVal === 'tempo') && (seats >= 9 && seats <= 20)) match = true;
        else if ((filterVal === '21-35' || filterVal === 'minibus') && (seats >= 21 && seats <= 35)) match = true;
        else if (filterVal === '36-45' && (seats >= 36 && seats <= 45)) match = true;
        else if (filterVal === '46-53' && (seats >= 46 && seats <= 55)) match = true;
        else if (filterVal === 'luxury-coach' && (seats >= 36 && seats <= 55)) match = true;
        else if (filterVal === 'luxury' && card.getAttribute('data-luxury') === 'true') match = true;
        else if (category === filterVal) match = true;

        if (match) {
          card.classList.remove('hidden');
          setTimeout(() => card.classList.remove('opacity-0', 'scale-95'), 10);
        } else {
          card.classList.add('opacity-0', 'scale-95');
          setTimeout(() => card.classList.add('hidden'), 200);
        }
      });
    });
  });

  // Sorting functionality
  if (sortSelect && grid) {
    sortSelect.addEventListener('change', () => {
      const mode = sortSelect.value;
      const cardsArr = Array.from(vehicleCards);
      cardsArr.sort((a, b) => {
        const seatsA = parseInt(a.getAttribute('data-seats') || 0, 10);
        const seatsB = parseInt(b.getAttribute('data-seats') || 0, 10);
        const rateA = parseInt(a.getAttribute('data-rate') || 0, 10);
        const rateB = parseInt(b.getAttribute('data-rate') || 0, 10);

        if (mode === 'seats-asc') return seatsA - seatsB;
        if (mode === 'seats-desc') return seatsB - seatsA;
        if (mode === 'price-asc') return rateA - rateB;
        if (mode === 'price-desc') return rateB - rateA;
        return 0;
      });
      cardsArr.forEach(c => grid.appendChild(c));
    });
  }
}

/* ==========================================
   7. FAQS ACCORDION
   ========================================== */
function initFaqAccordions() {
  const accordions = document.querySelectorAll('.faq-accordion-item');
  accordions.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (!trigger || !content) return;

    trigger.addEventListener('click', () => {
      const isOpen = !content.classList.contains('hidden');
      
      // Close all others in the same parent if desired
      const parent = item.parentElement;
      if (parent) {
        parent.querySelectorAll('.faq-content').forEach(c => c.classList.add('hidden'));
        parent.querySelectorAll('.faq-icon').forEach(i => i.classList.remove('rotate-180'));
      }

      if (isOpen) {
        content.classList.add('hidden');
        if (icon) icon.classList.remove('rotate-180');
      } else {
        content.classList.remove('hidden');
        if (icon) icon.classList.add('rotate-180');
      }
    });
  });
}

/* ==========================================
   8. BLOG SEARCH & FILTER
   ========================================== */
function initBlogSearch() {
  const searchInput = document.getElementById('blog-search-input');
  const categoryChips = document.querySelectorAll('.blog-cat-chip');
  const blogCards = document.querySelectorAll('.blog-card');

  if (!searchInput && categoryChips.length === 0) return;

  function filterPosts() {
    const query = (searchInput ? searchInput.value.toLowerCase().trim() : '');
    const activeChip = document.querySelector('.blog-cat-chip.active');
    const selectedCategory = activeChip ? activeChip.getAttribute('data-cat') : 'all';

    blogCards.forEach(card => {
      const title = card.querySelector('.blog-title')?.textContent.toLowerCase() || '';
      const snippet = card.querySelector('.blog-snippet')?.textContent.toLowerCase() || '';
      const category = card.getAttribute('data-category') || '';

      const matchesQuery = !query || title.includes(query) || snippet.includes(query);
      const matchesCat = (selectedCategory === 'all') || (category === selectedCategory);

      if (matchesQuery && matchesCat) {
        card.classList.remove('hidden');
      } else {
        card.classList.add('hidden');
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', filterPosts);
  }

  categoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      categoryChips.forEach(c => {
        c.classList.remove('active', 'bg-blue-600', 'text-white');
        c.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      });
      chip.classList.add('active', 'bg-blue-600', 'text-white');
      chip.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-600', 'dark:text-slate-300');
      filterPosts();
    });
  });
}

/* ==========================================
   9. VEHICLE COMPARISON DRAWER
   ========================================== */
let compareVehiclesList = [];

function initVehicleComparison() {
  const compareButtons = document.querySelectorAll('.btn-compare-vehicle');
  const compareDrawer = document.getElementById('compare-drawer');
  const compareBadge = document.getElementById('compare-count-badge');
  const compareItemsContainer = document.getElementById('compare-items-container');

  if (compareButtons.length === 0) return;

  compareButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const vehicleId = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const seats = btn.getAttribute('data-seats');
      const price = btn.getAttribute('data-price');
      const image = btn.getAttribute('data-image');

      const existingIndex = compareVehiclesList.findIndex(v => v.id === vehicleId);
      if (existingIndex > -1) {
        compareVehiclesList.splice(existingIndex, 1);
        btn.classList.remove('text-blue-600', 'font-bold');
        showToast(`Removed ${name} from comparison`, 'info');
      } else {
        if (compareVehiclesList.length >= 3) {
          showToast('You can compare a maximum of 3 vehicles at once.', 'warning');
          return;
        }
        compareVehiclesList.push({ id: vehicleId, name, seats, price, image });
        btn.classList.add('text-blue-600', 'font-bold');
        showToast(`Added ${name} to comparison!`, 'success');
      }

      renderCompareDrawer();
    });
  });

  function renderCompareDrawer() {
    if (!compareDrawer) return;
    if (compareVehiclesList.length > 0) {
      compareDrawer.classList.remove('translate-y-full');
      if (compareBadge) compareBadge.textContent = compareVehiclesList.length;
    } else {
      compareDrawer.classList.add('translate-y-full');
    }

    if (compareItemsContainer) {
      compareItemsContainer.innerHTML = compareVehiclesList.map(v => `
        <div class="flex items-center gap-3 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-700">
          <img src="${v.image}" class="w-12 h-10 object-cover rounded" alt="${v.name}">
          <div class="text-xs">
            <p class="font-semibold text-slate-800 dark:text-slate-100 truncate w-28">${v.name}</p>
            <p class="text-slate-500">${v.seats} Seats • ${v.price}</p>
          </div>
          <button onclick="removeCompareItem('${v.id}')" class="text-slate-400 hover:text-red-500 ml-auto p-1">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      `).join('');
    }
  }

  window.removeCompareItem = function(id) {
    compareVehiclesList = compareVehiclesList.filter(v => v.id !== id);
    renderCompareDrawer();
  };

  const clearCompareBtn = document.getElementById('clear-compare-btn');
  if (clearCompareBtn) {
    clearCompareBtn.addEventListener('click', () => {
      compareVehiclesList = [];
      renderCompareDrawer();
      showToast('Cleared vehicle comparison list.', 'info');
    });
  }
}

/* ==========================================
   10. TOAST NOTIFICATION SYSTEM
   ========================================== */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  const icons = {
    success: '<i class="fa-solid fa-circle-check text-emerald-500 text-lg"></i>',
    error: '<i class="fa-solid fa-circle-exclamation text-rose-500 text-lg"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation text-amber-500 text-lg"></i>',
    info: '<i class="fa-solid fa-circle-info text-blue-500 text-lg"></i>'
  };

  const toast = document.createElement('div');
  toast.className = 'pointer-events-auto flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 p-4 rounded-xl shadow-xl transform transition-all duration-300 translate-y-3 opacity-0';
  toast.innerHTML = `
    <div>${icons[type] || icons.info}</div>
    <div class="text-sm font-medium flex-1">${message}</div>
    <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm ml-2">
      <i class="fa-solid fa-xmark"></i>
    </button>
  `;

  toast.querySelector('button').addEventListener('click', () => {
    dismissToast(toast);
  });

  toastContainer.appendChild(toast);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-3', 'opacity-0');
  });

  // Auto dismiss after 4 seconds
  setTimeout(() => {
    dismissToast(toast);
  }, 4000);
}

function dismissToast(toast) {
  toast.classList.add('opacity-0', 'translate-y-2');
  setTimeout(() => {
    if (toast.parentElement) toast.parentElement.removeChild(toast);
  }, 300);
}

/* ==========================================
   11. BOOKING CONFIRMATION MODAL HELPER
   ========================================== */
/* ==========================================
   11. BOOKING ESTIMATE & ENQUIRY MODAL HELPER
   ========================================== */
function showBookingModal(details) {
  let modal = document.getElementById('booking-quote-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'booking-quote-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative max-h-[92vh] overflow-y-auto space-y-5 animate-scaleUp">
      <button id="close-quote-modal" class="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 w-8 h-8 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800">
        <i class="fa-solid fa-xmark text-lg"></i>
      </button>

      <div class="text-center space-y-1">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto text-xl shadow-md">
          <i class="fa-solid fa-file-lines"></i>
        </div>
        <h3 class="text-2xl font-black text-slate-900 dark:text-white font-heading">Instant Trip Estimate</h3>
        <p class="text-xs text-slate-500 dark:text-slate-400">Review your indicative quotation and submit charter availability enquiry</p>
      </div>

      <!-- Itemized Estimate Breakdown -->
      <div class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
        <div class="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span class="font-medium">Selected Vehicle:</span>
          <strong class="text-slate-900 dark:text-white">${details.vehicleName}</strong>
        </div>
        <div class="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span class="font-medium">Route Itinerary:</span>
          <span class="font-bold text-slate-900 dark:text-white">${details.pickup} ➔ ${details.dest}</span>
        </div>
        <div class="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span class="font-medium">Travel Schedule:</span>
          <span>${details.depDate} to ${details.retDate} (${details.days} Days)</span>
        </div>
        <div class="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span class="font-medium">Tariff Rate:</span>
          <span class="text-blue-600 dark:text-blue-400 font-bold">₹${details.ratePerKm}/km (Min. 300 km/day)</span>
        </div>
        <div class="flex justify-between items-center text-slate-600 dark:text-slate-300">
          <span class="font-medium">Driver Allowance:</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-semibold">${details.driverAllowance}</span>
        </div>
        <div class="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-baseline">
          <div>
            <span class="font-bold text-slate-900 dark:text-white text-sm">Estimated Total:</span>
            <span class="block text-[10px] text-slate-400">Inclusive of fuel &amp; driver batta</span>
          </div>
          <span class="text-2xl font-black text-blue-600 dark:text-blue-400">${details.total}</span>
        </div>
        <p class="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2 leading-relaxed">
          <i class="fa-solid fa-circle-info text-amber-500 mr-1"></i> <strong>Estimate Disclaimer:</strong> This quote is an estimate for itinerary planning. Final billing is calculated on garage-to-garage odometer readings. Highway tolls, parking receipts, and state permit entry taxes are reimbursed at actuals.
        </p>
      </div>

      <!-- Enquiry Form -->
      <form id="instant-enquiry-form" class="space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Full Name <span class="text-rose-500">*</span></label>
          <input type="text" id="enq-name" required placeholder="e.g. Sarah Jenkins" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none">
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile / WhatsApp <span class="text-rose-500">*</span></label>
            <input type="tel" id="enq-phone" required placeholder="+91 98765 43210" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address <span class="text-rose-500">*</span></label>
            <input type="email" id="enq-email" required placeholder="name@company.com" class="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none">
          </div>
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Special Requirements / Notes (Optional)</label>
          <input type="text" id="enq-notes" placeholder="e.g. Rooftop luggage rack, Senior citizens onboard, GST billing" class="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 outline-none">
        </div>

        <button type="submit" class="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs">
          <i class="fa-solid fa-paper-plane"></i>
          <span>Submit Booking Enquiry &amp; Hold Vehicle</span>
        </button>
      </form>
    </div>
  `;
  document.body.appendChild(modal);

  modal.querySelector('#close-quote-modal').addEventListener('click', () => {
    modal.remove();
  });

  modal.querySelector('#instant-enquiry-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const leadName = document.getElementById('enq-name')?.value || 'Guest Traveler';
    const leadPhone = document.getElementById('enq-phone')?.value || '+91 98765 43210';
    const leadEmail = document.getElementById('enq-email')?.value || 'guest@example.com';
    const leadNotes = document.getElementById('enq-notes')?.value || 'Standard Tourist Booking';

    const cleanTotal = parseInt((details.total || '7500').replace(/[^0-9]/g, ''), 10) || 7500;
    const enqRef = `ENQ-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newTrip = {
      id: enqRef,
      vehicle: details.vehicleName,
      pickup: details.pickup,
      destination: details.dest,
      depDate: details.depDate,
      retDate: details.retDate,
      days: details.days,
      distance: details.distance,
      leadName,
      leadPhone,
      leadEmail,
      leadNotes,
      grandTotal: cleanTotal,
      advance: Math.round(cleanTotal * 0.25),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: 'enquiry-submitted'
    };

    // Store in LocalStorage for client-side demo persistence
    try {
      let existingBookings = JSON.parse(localStorage.getItem('tv_custom_bookings')) || [];
      existingBookings.unshift(newTrip);
      localStorage.setItem('tv_custom_bookings', JSON.stringify(existingBookings));

      let existingEnquiries = JSON.parse(localStorage.getItem('tv_custom_enquiries')) || [];
      existingEnquiries.unshift(newTrip);
      localStorage.setItem('tv_custom_enquiries', JSON.stringify(existingEnquiries));
    } catch (err) {}

    // Replace modal body with Confirmation Card
    modal.querySelector('.bg-white, .dark\\:bg-slate-900').innerHTML = `
      <div class="text-center space-y-4 py-2">
        <div class="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto text-3xl shadow-lg shadow-emerald-500/20">
          <i class="fa-solid fa-circle-check"></i>
        </div>
        <div>
          <span class="inline-block px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 mb-2">
            Enquiry Reference: ${enqRef}
          </span>
          <h3 class="text-2xl font-black text-slate-900 dark:text-white font-heading">Enquiry Received!</h3>
          <p class="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Thank you, <strong>${leadName}</strong>. Your charter request for <strong>${details.vehicleName}</strong> has been logged with our central dispatch desk.
          </p>
        </div>

        <div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs text-left space-y-1.5">
          <div class="flex justify-between">
            <span class="text-slate-400">Route:</span>
            <strong class="text-slate-800 dark:text-slate-200">${details.pickup} ➔ ${details.dest}</strong>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Dates:</span>
            <span class="text-slate-800 dark:text-slate-200">${details.depDate} to ${details.retDate} (${details.days} Days)</span>
          </div>
          <div class="flex justify-between">
            <span class="text-slate-400">Estimated Total:</span>
            <span class="font-bold text-slate-900 dark:text-white">${details.total}</span>
          </div>
          <div class="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5 text-blue-600">
            <span>Status:</span>
            <span class="font-bold">Dispatch Review In Progress</span>
          </div>
        </div>

        <p class="text-[11px] text-slate-500">
          Our tour manager will call you at <strong>${leadPhone}</strong> within 30 minutes to verify pickup depot details and chauffeur assignment.
        </p>

        <div class="grid grid-cols-2 gap-3 pt-2">
          <button onclick="document.getElementById('booking-quote-modal').remove();" class="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition-all">
            Done
          </button>
          <a href="customer-dashboard.html" class="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow text-center block transition-all">
            Go to Dashboard
          </a>
        </div>
      </div>
    `;

    if (window.showToast) {
      showToast(`Enquiry ${enqRef} submitted! Our team will contact you shortly.`, 'success');
    }
  });
}

/* ==========================================
   FLEET VEHICLE DETAILS MODAL
   ========================================== */
const FLEET_SPECS_DATA = {
  'urbania-9': {
    name: 'Force 9-Seater Urbania VIP Cruiser',
    category: '9–20 Seater • VIP Van',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/2010_Mercedes-Benz_Sprinter_2500_Passenger_Van_%28W906%29.jpg/960px-2010_Mercedes-Benz_Sprinter_2500_Passenger_Van_%28W906%29.jpg',
    rate: '₹26 / km',
    minKm: '250 km / day',
    local8h: '₹3,200',
    seats: '9 Captain Recliners (1x1 Layout)',
    luggage: '8 Large Suitcases + 4 Handbags',
    ac: 'Dual Zone High-Efficiency Climate Control',
    safety: 'ABS, EBD, Speed Governor locked at 80 km/h, Driver Airbag, AIS-140 GPS',
    features: ['1x1 Aircraft-Style Captain Seats', 'Individual USB Fast Charging', 'Ambient Starlight Ceiling', 'Deep Rear Luggage Boot', 'Chilled Mineral Water Box']
  },
  'tempo-12': {
    name: 'Force 12-Seater Luxury Tempo Traveller',
    category: '9–20 Seater • Outstation Traveller',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Force_Traveller_Luxury.jpg/960px-Force_Traveller_Luxury.jpg',
    rate: '₹22 / km',
    minKm: '300 km / day',
    local8h: '₹3,200',
    seats: '12 Pushback Seats (2x1 Layout)',
    luggage: '10 Large Suitcases + Rooftop Carrier',
    ac: 'Chilled Dual-Blower AC with Roof Vents',
    safety: 'Speed Governor 80 km/h, Emergency Roof Exit, First Aid Kit, Fire Extinguisher',
    features: ['140° Pushback Recliner Seats', 'Surround Sound Stereo System', 'Wide Center Walkway', 'Dedicated Chauffeur Cabin', 'Tinted UV Protection Windows']
  },
  'urbania-14': {
    name: 'Force 14-Seater Urbania Royal Executive',
    category: '9–20 Seater • Royal Executive Van',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Tunas_Rent_Toyota_HiAce_Commuter_%28H200%29_minibus_20210117.jpg/960px-Tunas_Rent_Toyota_HiAce_Commuter_%28H200%29_minibus_20210117.jpg',
    rate: '₹25 / km',
    minKm: '250 km / day',
    local8h: '₹3,600',
    seats: '14 Wide Captain Seats (1x1 Layout)',
    luggage: '12 Large Suitcases Hold',
    ac: 'Dual-Zone High Cool Air Conditioning',
    safety: 'Electronic Stability Program (ESP), Speed Governor 80 km/h, Dual Airbags',
    features: ['1x1 Wide Executive Captain Seats', 'Individual High-Cool AC Vents', 'Fast USB & Type-C Charging', 'Deep Rear Luggage Boot', 'Tinted UV Cut Privacy Glass']
  },
  'urbania-17': {
    name: 'Force Urbania 17-Seater Executive',
    category: '9–20 Seater • Executive Traveller',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Mercedes-Benz_Sprinter_VS30_black_%281%29.jpg/960px-Mercedes-Benz_Sprinter_VS30_black_%281%29.jpg',
    rate: '₹28 / km',
    minKm: '300 km / day',
    local8h: '₹4,000',
    seats: '17 Ergonomic Recliners (2x1 Layout)',
    luggage: '14 Large Suitcases Hold',
    ac: 'Individual Passenger Air Conditioner Vents',
    safety: 'Monocoque Body, Dual Airbags, ESP, AIS-140 Live Telematics',
    features: ['Ergonomic Calf Rests', 'Whisper-Quiet European NVH Cab', 'Smart Android LED TV', 'Independent Coil Spring Ride', 'Individual Reading Lights']
  },
  'tempo-20': {
    name: '20-Seater Maharaja Luxury Van',
    category: '9–20 Seater • Luxury Van',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Force_Traveller%2C_Leh-Manali_Highway.jpg/960px-Force_Traveller%2C_Leh-Manali_Highway.jpg',
    rate: '₹32 / km',
    minKm: '300 km / day',
    local8h: '₹4,800',
    seats: '20 Luxury Recliners (2x2 Layout)',
    luggage: '16 Large Suitcases Boot Space',
    ac: 'Sub-Zero Powerful Twin Compressor AC',
    safety: 'Speed Limiter, SOS Panic Switch, Verified Police Chauffeur',
    features: ['Plush 2x2 Maharaja Upholstery', 'Tour Guide Mic & PA System', 'Overhead Parcel Racks', 'Multi-Color Ambient Lighting', 'Rear Dedicated Luggage Area']
  },
  'bus-26': {
    name: 'Eicher 26-Seater AC Tourist Bus',
    category: '21–35 Seater • Mini Coach',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Force_Motors_-_Traveller_26_-_Agra_2014-05-14_4222.JPG/960px-Force_Motors_-_Traveller_26_-_Agra_2014-05-14_4222.JPG',
    rate: '₹36 / km',
    minKm: '300 km / day',
    local8h: '₹5,500',
    seats: '26 Pushback Seats (2x2 Layout)',
    luggage: '22 Large Suitcases (Belly Trunk + Overhead)',
    ac: 'Roof-Mounted High Capacity Air Conditioning',
    safety: 'Air Brakes, Emergency Exit Door, Speed Governor 80 km/h',
    features: ['Wide Gangway for Easy Boarding', 'Curtains on all Side Windows', 'High Quality PA Guide Mic', 'Generous Under-Floor Luggage', 'Comfortable Headrest Cushions']
  },
  'bus-32': {
    name: 'BharatBenz 32-Seater Glider Tourist Coach',
    category: '21–35 Seater • Executive Glider Coach',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/30/Volvo_9700_%28PRF-925%29.jpg/960px-Volvo_9700_%28PRF-925%29.jpg',
    rate: '₹40 / km',
    minKm: '300 km / day',
    local8h: '₹6,500',
    seats: '32 Pushback Luxury Recliners (2x2 Layout)',
    luggage: '28 Large Suitcases Undercarriage',
    ac: 'Engine-Driven Roof Air Conditioning',
    safety: 'Full Air Brakes with ABS, Emergency Escape Hatch, Speed Limiter 80 km/h',
    features: ['Pneumatic Level Air Suspension', 'Dual LED HD Entertainment Screens', 'Deep Recline with Calf Supports', 'High-Output Individual Reading Lights', 'Tour Chauffeur PA Microphone']
  },
  'bus-35': {
    name: 'BharatBenz 35-Seater Tourer Executive',
    category: '21–35 Seater • Luxury Tourer',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/08/Victory_Liner_Hyundai_Universe_Space_Luxury_-_856.jpg/960px-Victory_Liner_Hyundai_Universe_Space_Luxury_-_856.jpg',
    rate: '₹44 / km',
    minKm: '300 km / day',
    local8h: '₹7,500',
    seats: '35 Deluxe Reclining Seats (2x2 Layout)',
    luggage: '30 Large Suitcases Under-floor Hold',
    ac: 'Heavy-Duty Integrated Engine-Driven AC',
    safety: 'Air Suspension, ABS with EBD, Driver Cabin Partition',
    features: ['German Precision Air Suspension', 'Dual 32" High-Definition LED TVs', 'Individual Mobile Phone Charging', 'Full-Length Overhead Parcel Shelves', 'Emergency Window Hammers']
  },
  'bus-40': {
    name: 'Tata Magna 40-Seater High-Deck Coach',
    category: '36–45 Seater • High-Deck Coach',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Setra_S_515_HD%2C_Busworld_Europe_2023%2C_Brussels_%28P1140120%29.jpg/960px-Setra_S_515_HD%2C_Busworld_Europe_2023%2C_Brussels_%28P1140120%29.jpg',
    rate: '₹48 / km',
    minKm: '300 km / day',
    local8h: '₹8,500',
    seats: '40 High-Back Pushback Seats (2x2 Layout)',
    luggage: '35 Bulk Suitcases Hold',
    ac: 'Central Climate Control with Individual Louvres',
    safety: 'Front Anti-Roll Bar, AIS-140 GPS, Dual Fire Extinguishers',
    features: ['Elevated Passenger Deck for Highway Views', 'Tinted Heat-Absorbing Windows', 'Heavy-Duty Chauffeur Crew Cabin', 'Air Suspension Rear Axle', 'Music & Microphone System']
  },
  'bus-45': {
    name: 'Scania Metrolink 45-Seater HD Coach',
    category: '36–45 Seater • VIP Touring Coach',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/MSRTC-Scania-Shivneri.jpg/960px-MSRTC-Scania-Shivneri.jpg',
    rate: '₹54 / km',
    minKm: '300 km / day',
    local8h: '₹9,500',
    seats: '45 Luxury Recliners (2x2 Layout)',
    luggage: '45 Large Bags Undercarriage',
    ac: 'Multi-Zone Automatic Climate Conditioning',
    safety: 'Electronic Braking System (EBS), Roll Stability, Reverse Camera',
    features: ['Multi-Axle Floating Air Suspension', 'Individual USB Outlets at Every Seat', 'Reading Spotlights & Attendant Call', 'Integrated Chilled Water Dispenser', 'High Luggage Boot with Pneumatic Doors']
  },
  'bus-49': {
    name: 'Ashok Leyland 49-Seater Intercity',
    category: '46–53 Seater • Intercity Bus',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Mercedes-Benz_Tourismo_M2%2C_Busworld_Europe_2023%2C_Brussels_%28P1140114%29.jpg/960px-Mercedes-Benz_Tourismo_M2%2C_Busworld_Europe_2023%2C_Brussels_%28P1140114%29.jpg',
    rate: '₹58 / km',
    minKm: '350 km / day',
    local8h: '₹10,500',
    seats: '49 High-Back Seats (2x2 Layout)',
    luggage: '42 Large Bags Luggage Boot',
    ac: 'Twin AC Blowers for Large Cabin Uniform Cooling',
    safety: 'Reinforced Steel Cage, Speed Limiter 80 km/h, 3 Emergency Exits',
    features: ['Maximum Seating Capacity Efficiency', 'Padded High-Back Ergonomic Seats', 'Continuous Overhead Luggage Racks', 'Driver Rest Compartment', 'All-India Tourist Permit Certified']
  },
  'volvo-53': {
    name: 'Volvo 9600 Multi-Axle Luxury Cruiser',
    category: '46–53 Seater • Flagship Luxury',
    image: 'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a0/MSRTC-Ashwameh-Volvo.jpg/960px-MSRTC-Ashwameh-Volvo.jpg',
    rate: '₹65 / km',
    minKm: '350 km / day',
    local8h: '₹12,000',
    seats: '53 Semi-Sleeper Luxury Recliners',
    luggage: '55+ Large Heavy Trolley Hold',
    ac: 'Automated Micro-Filter Climate Control',
    safety: 'Electronic Stability Program (ESP), Hill Start Assist, AIS-140 Certified',
    features: ['Steerable Tag Axle for Ultra-Smooth Curves', 'Adjustable Calf Rest Support on Seats', 'Onboard High-Speed 5G Wi-Fi Hotspot', 'Individual USB & Type-C Fast Ports', 'Pneumatic Level-Controlled Air Suspension']
  }
};

window.openFleetDetailsModal = function(vehicleId) {
  const spec = FLEET_SPECS_DATA[vehicleId] || FLEET_SPECS_DATA['tempo-12'];

  let modal = document.getElementById('fleet-details-modal');
  if (modal) modal.remove();

  modal = document.createElement('div');
  modal.id = 'fleet-details-modal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md';
  modal.innerHTML = `
    <div class="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[92vh] flex flex-col animate-scaleUp">
      <button onclick="document.getElementById('fleet-details-modal').remove()" class="absolute top-4 right-4 z-10 text-white bg-slate-950/60 hover:bg-slate-950 w-8 h-8 rounded-full flex items-center justify-center text-sm transition-colors">
        <i class="fa-solid fa-xmark"></i>
      </button>

      <div class="relative h-60 w-full overflow-hidden flex-shrink-0">
        <img src="${spec.image}" alt="${spec.name}" class="w-full h-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>
        <div class="absolute bottom-4 left-6 right-6 flex items-end justify-between">
          <div>
            <span class="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/30">
              ${spec.category}
            </span>
            <h3 class="text-xl sm:text-2xl font-black text-white font-heading mt-1">${spec.name}</h3>
          </div>
          <div class="text-right">
            <span class="text-xs text-slate-300 block">Outstation Tariff</span>
            <span class="text-2xl font-black text-amber-400">${spec.rate}</span>
          </div>
        </div>
      </div>

      <div class="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 dark:text-slate-300">
        <!-- Specs Matrix -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">Seating Layout</span>
            <strong class="text-slate-900 dark:text-white">${spec.seats}</strong>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">Luggage Capacity</span>
            <strong class="text-slate-900 dark:text-white">${spec.luggage}</strong>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">Daily Minimum</span>
            <strong class="text-slate-900 dark:text-white">${spec.minKm}</strong>
          </div>
          <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
            <span class="text-slate-400 block text-[10px]">Local Package (8h)</span>
            <strong class="text-slate-900 dark:text-white">${spec.local8h}</strong>
          </div>
        </div>

        <!-- Amenities Checklist -->
        <div>
          <h4 class="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">Onboard Premium Facilities</h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
            ${spec.features.map(f => `
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-emerald-500 text-xs"></i>
                <span>${f}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Safety Systems -->
        <div class="p-3.5 bg-blue-50 dark:bg-blue-900/30 rounded-2xl border border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-200">
          <p class="font-bold flex items-center gap-1.5 text-xs mb-1">
            <i class="fa-solid fa-shield-halved text-blue-600 dark:text-blue-400"></i> Statutory Highway Safety Standards
          </p>
          <p class="text-[11px] leading-relaxed">${spec.safety}</p>
        </div>

        <!-- Action Row -->
        <div class="pt-2 flex items-center justify-between gap-4 border-t border-slate-200 dark:border-slate-800">
          <button onclick="document.getElementById('fleet-details-modal').remove()" class="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800">
            Close
          </button>
          <a href="customer-dashboard.html?tab=tab-book-vehicle&vehicle=${vehicleId}" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2">
            <span>Proceed to Booking</span>
            <i class="fa-solid fa-arrow-right text-xs"></i>
          </a>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
};

/* ==========================================
   12. INTERACTIVE BUS CABIN SEATING VISUALIZER
   ========================================== */
function initCabinVisualizer() {
  const modelBtns = document.querySelectorAll('.seat-model-tab-btn');
  const cabinContainer = document.getElementById('cabin-seating-grid');
  const selectedCountEl = document.getElementById('selected-seat-count');
  const luggageCapEl = document.getElementById('cabin-luggage-cap');
  const modelNameEl = document.getElementById('cabin-model-name');

  if (!cabinContainer) return;

  const CABIN_LAYOUTS = {
    '12': { name: '12-Seater Luxury Tempo Traveller', seats: 12, layout: '1x1', luggage: '12 Large Trolley Bags + 6 Handbags', rows: 4 },
    '17': { name: '17-Seater Force Urbania VIP', seats: 17, layout: '2x1', luggage: '18 Suitcases + Overhead Racks', rows: 5 },
    '26': { name: '26-Seater Mini Tourist Bus', seats: 26, layout: '2x2', luggage: '30 Bags in Rear Cargo', rows: 6 },
    '45': { name: '45-Seater BharatBenz AC Coach', seats: 45, layout: '2x2', luggage: '50 Undercarriage Suitcases', rows: 10 }
  };

  let selectedSeats = new Set();

  function renderLayout(capacityKey) {
    const config = CABIN_LAYOUTS[capacityKey] || CABIN_LAYOUTS['17'];
    selectedSeats.clear();
    updateStats(config);

    let html = `
      <div class="flex items-center justify-between pb-3 mb-4 border-b border-slate-200 dark:border-slate-700">
        <div class="flex items-center gap-2">
          <div class="seat-item driver text-xs"><i class="fa-solid fa-steering-wheel"></i></div>
          <span class="text-xs font-bold text-slate-500">Chauffeur Cockpit</span>
        </div>
        <div class="flex items-center gap-3 text-[11px] text-slate-400">
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-blue-500/20 border border-blue-500 inline-block"></span> Available</span>
          <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span> Selected</span>
        </div>
      </div>
      <div class="space-y-3">
    `;

    let seatNumber = 1;
    for (let r = 1; r <= config.rows; r++) {
      html += `<div class="flex items-center justify-between gap-4">`;
      // Left side
      html += `<div class="flex gap-2">`;
      if (seatNumber <= config.seats) {
        html += `<div class="seat-item available" data-seat="${seatNumber}">S${seatNumber++}</div>`;
      }
      if (config.layout === '2x2' && seatNumber <= config.seats) {
        html += `<div class="seat-item available" data-seat="${seatNumber}">S${seatNumber++}</div>`;
      }
      html += `</div>`;

      // Aisle
      html += `<div class="w-8 text-center text-[10px] text-slate-400 font-mono">AISLE</div>`;

      // Right side
      html += `<div class="flex gap-2">`;
      if (seatNumber <= config.seats) {
        html += `<div class="seat-item available" data-seat="${seatNumber}">S${seatNumber++}</div>`;
      }
      if ((config.layout === '2x2' || config.layout === '2x1') && seatNumber <= config.seats) {
        html += `<div class="seat-item available" data-seat="${seatNumber}">S${seatNumber++}</div>`;
      }
      html += `</div>`;
      html += `</div>`;
    }

    html += `
      </div>
      <div class="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-center gap-2 text-xs text-slate-400">
        <i class="fa-solid fa-suitcase"></i> Rear Luggage Compartment
      </div>
    `;

    cabinContainer.innerHTML = html;

    // Attach click listeners
    cabinContainer.querySelectorAll('.seat-item.available').forEach(seat => {
      seat.addEventListener('click', () => {
        const num = seat.getAttribute('data-seat');
        if (selectedSeats.has(num)) {
          selectedSeats.delete(num);
          seat.classList.remove('selected');
        } else {
          selectedSeats.add(num);
          seat.classList.add('selected');
          if (window.showToast) window.showToast(`Selected Reclining Seat S${num}`, 'info');
        }
        if (selectedCountEl) selectedCountEl.textContent = selectedSeats.size;
      });
    });
  }

  function updateStats(config) {
    if (modelNameEl) modelNameEl.textContent = config.name;
    if (luggageCapEl) luggageCapEl.textContent = config.luggage;
    if (selectedCountEl) selectedCountEl.textContent = '0';
  }

  modelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modelBtns.forEach(b => {
        b.classList.remove('bg-blue-600', 'text-white', 'shadow-lg');
        b.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');
      });
      btn.classList.add('bg-blue-600', 'text-white', 'shadow-lg');
      btn.classList.remove('bg-slate-100', 'dark:bg-slate-800', 'text-slate-700', 'dark:text-slate-300');

      const cap = btn.getAttribute('data-capacity');
      renderLayout(cap);
    });
  });

  // Initial render with 17 seats
  renderLayout('17');
}

/* ==========================================
   11. PHONE NUMBER INPUT RESTRICTION
   Strictly accepts only numeric phone values (0-9, optional leading '+', space, hyphen)
   Prevents any alphabetic characters or invalid symbols
   ========================================== */
function initPhoneInputs() {
  const phoneInputs = document.querySelectorAll('input[type="tel"]');
  phoneInputs.forEach(input => {
    input.setAttribute('inputmode', 'tel');
    if (!input.hasAttribute('pattern')) {
      input.setAttribute('pattern', '^[+]?[0-9\\s-]{7,15}$');
    }
    if (!input.hasAttribute('title')) {
      input.setAttribute('title', 'Please enter a valid phone number (numeric values only)');
    }

    // Keypress filter: prevent typing alphabets & non-phone characters immediately
    input.addEventListener('keypress', function(e) {
      // Allow browser shortcuts / function keys (Ctrl, Alt, Meta, arrows, etc.)
      if (e.ctrlKey || e.altKey || e.metaKey || e.key.length > 1) return;

      // Only allow digits 0-9, leading '+', space, and hyphen
      if (!/[0-9+\s-]/.test(e.key)) {
        e.preventDefault();
        return false;
      }

      // Allow '+' only at the very first position and only once
      if (e.key === '+' && (this.selectionStart !== 0 || this.value.includes('+'))) {
        e.preventDefault();
        return false;
      }
    });

    // Input sanitization: strips alphabets and invalid characters on paste, drop, or virtual keyboard
    input.addEventListener('input', function() {
      const prevVal = this.value;
      // Strip any alphabets and invalid characters
      let cleaned = prevVal.replace(/[^0-9+\s-]/g, '');

      // Ensure '+' only appears once and at the beginning
      if (cleaned.includes('+')) {
        const hasLeading = cleaned.startsWith('+');
        cleaned = (hasLeading ? '+' : '') + cleaned.replace(/\+/g, '');
      }

      if (prevVal !== cleaned) {
        this.value = cleaned;
      }
    });
  });
}


