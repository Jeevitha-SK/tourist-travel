# TransVoyage – Tourist Bus & Traveller Rental Website Template

A complete, production-grade, highly attractive HTML5/TailwindCSS website template built specifically for **Tourist Bus, Tempo Traveller, Luxury Coach Charter, and Group Mobility Rentals**.

---

## 🌟 How to View and Run the Website (No Prior Knowledge Needed!)

You don't need to install any web server or compiler! Simply:
1. Open this folder in your computer's File Explorer: `c:\Users\Jeevitha\Downloads\Tourist Bus & Traveller Rental`
2. **Double-click on `index.html`**
3. It will immediately open in Google Chrome, Microsoft Edge, Brave, or Safari!
4. Click on any link in the top menu bar to explore all the pages and features.

---

## 📄 Complete Pages Included in this Project

| # | Page File | Purpose & Highlights |
|---|---|---|
| 1 | `index.html` | **Home Page 1 (General Services Landing)**: Modern hero, live interactive fare & booking calculator widget, fleet showcase by seat capacity, why choose us, trending tour circuits, customer testimonials, and FAQs accordion. |
| 2 | `home-corporate.html` | **Home Page 2 (Niche Corporate & Luxury B2B Landing)**: MICE delegations, tech offsites, executive Sprinter/Urbania fleet, B2B RFP submission form, and corporate SLA highlights. |
| 3 | `fleet.html` | **Fleet Page (Filterable by Seats)**: Categorized by 9-12 seats, 16-20 seats, 26-35 seats, 45-53 seats, luxury VIP coaches, interactive side-by-side vehicle comparison drawer. |
| 4 | `pricing.html` | **Tariff Rates & Transparent Pricing**: Complete 2026 tariff schedule table, per-km rates, driver allowances, 8h/80km local packages, inclusion/exclusion rules, and print-ready tariff card. |
| 5 | `services.html` | **Services Grid/List**: Outstation tours, corporate transport, wedding shuttles, pilgrimage circuits, airport pickups, and educational school excursions. |
| 6 | `service-details.html` | **Service Details Page (Outstation Tours)**: Deep-dive into long-distance travel, 4-day sample itinerary, vehicle recommendations, and dedicated booking inquiry sidebar. |
| 7 | `about.html` | **About Us**: Company history from 2015 to 2026, safety protocols (speed governors, sanitization), leadership team, and milestones timeline. |
| 8 | `blog.html` | **Travel Blog & Guides**: Filterable by category (Routes, Fleet, Corporate, Safety) with instant client-side live search bar. |
| 9 | `blog-details.html` | **Blog Post Details**: Full article on booking tempo travellers, author info, social share buttons, comments section, and sidebar quick widget. |
| 10 | `contact.html` | **Contact Us**: 24/7 helpline, WhatsApp direct chat, booking inquiry form, central depot address, and interactive map simulation. |
| 11 | `customer-dashboard.html` | **Customer Portal**: View active and past bookings, **Live GPS Tracking Radar modal** with driver details, and **Printable Tax Invoice modal** with full itemized breakdown. |
| 12 | `admin-dashboard.html` | **Admin & Fleet Control Center**: Revenue and fleet distribution charts (Chart.js), live booking status manager, customer message reply modal, and vehicle fleet radar. |
| 13 | `login.html` | **Login & Registration**: Role switch tabs, password eye toggle, and **Instant 1-Click Demo Login** buttons for Customer and Admin! |
| 14 | `404.html` | **Custom 404 Error Page**: Highway detour themed error page with quick links back to safety. |
| 15 | `coming-soon.html` | **Coming Soon / Maintenance Page**: Real-time live countdown timer for upcoming ultra-luxury sleeper coach launch with email notifier. |

---

## 🚀 Key Interactive Features & Unique Format Highlights

1. **Interactive Cabin Seating & Floorplan Visualizer** (Unique Format):
   - Architectural 2D chassis preview with interactive seat clicking.
   - Switch between 12S Luxury Tempo, 17S Urbania VIP (2x1), 26S Mini Coach (2x2), and 45S Multi-Axle Coach.
   - Shows driver cockpit, central aisle, captain recliners, luggage cargo zone, and real-time selected seat counter.

2. **Asymmetrical Bento Box Ecosystem** (Unique Format):
   - Animated SVG Speedometer Gauge showing 80 km/h electronic speed governor compliance.
   - Digital Boarding Pass voucher card with punch notches and passenger ticket details.
   - HEPA dual-zone climate purification and cold air louvers.
   - Police-verified chauffeur screening protocols.
   - 25+ Standby Depot rapid vehicle replacement guarantee.

3. **Persistent Floating Cockpit Dock** (Unique Format):
   - Glassmorphic floating control dock at the bottom of the screen.
   - 1-click jump to Cabin Seats, Fare Estimator, Live Radar, and 24/7 Helpline.

4. **Cinematic Scenic Visuals & Topography Patterns**:
   - Highway coach at sunrise with glowing glass fare calculator.
   - Warm sunset horizon for client testimonials.
   - Mountain pass express banner with frosted glass CTA.

5. **Interactive Fare & Trip Calculator** (`index.html`, `js/main.js`):
   - Select between Round-Trip, One-Way Drop, and Local 8h/80km packages.
   - Choose vehicle model, enter travel duration in days and approx distance.
   - Computes total estimated price with driver allowances and per-km tariffs in real-time.
   - Clicking "Book Now" opens the reservation confirmation modal and redirects to customer portal.

6. **Fleet Filtering by Seating Capacity** (`fleet.html`, `index.html`):
   - Instant filter chips: 9-20 Seater Travellers, 26-35 Seater Mini Buses, 45-53 Seater Volvo Coaches, and Maharaja Editions.

7. **Floating Vehicle Comparison Drawer**:
   - Compare up to 3 vehicles side by side with real-time badge count and quick removal.

8. **Live GPS Tracking Simulation** (`customer-dashboard.html`, `admin-dashboard.html`):
   - Click "Track Live" on any trip to see the animated speed indicator (62 km/h), vehicle registration, route progress, and driver profile.

9. **Print-Ready Tax Invoice**:
   - Click "Invoice" in the dashboard to open the itemized GST tax invoice with a 1-click **"Print / Download PDF"** button.

10. **Dark Mode & Light Mode**:
    - One-click toggle in the header with persistent memory via `localStorage`.

11. **RTL Compatibility**:
    - One-click toggle in the header for Right-To-Left language support (Arabic, Hebrew, Persian).

12. **Admin Interactive Analytics**:
    - Monthly revenue line chart and fleet composition doughnut chart powered by Chart.js.

---

## 🛠️ How to Customize (For Beginners)

- **Change Company Name / Phone Number**:
  Open `index.html` (or any `.html` file) in Notepad or VS Code and search for `+91 98765 43210` to replace with your phone number.
- **Change Per-Km Rates**:
  Open `js/main.js` and look at `VEHICLE_RATES` near line 100 to adjust rates per km, driver allowances, or base packages.
- **Add Images**:
  All images use high-resolution Unsplash URLs and can be replaced with your own photos.

---

## 🌐 Deploying to the Web (Free)
You can easily deploy this entire website for free within 2 minutes:
- **Netlify**: Drag and drop this folder onto [netlify.com/drop](https://app.netlify.com/drop).
- **Vercel**: Run `vercel` or link via GitHub.
- **GitHub Pages**: Push this repository to GitHub and enable Pages in repository settings.
