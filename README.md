# 🎨 KRSwitch Frontend — Modern Real-Time Schedule Trading Dashboard

<p align="center">
  <img src="https://img.shields.io/badge/React-v19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React Badge" />
  <img src="https://img.shields.io/badge/Vite-v7.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Badge" />
  <img src="https://img.shields.io/badge/Tailwind%20CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind Badge" />
  <img src="https://img.shields.io/badge/React%20Router-v7.1-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white" alt="React Router Badge" />
  <img src="https://img.shields.io/badge/Cypress-v15.1-17202C?style=for-the-badge&logo=cypress&logoColor=white" alt="Cypress Badge" />
</p>

Welcome to the **KRSwitch Frontend**, a premium, high-fidelity schedule trading dashboard engineered for students and administrators. Designed with vibrant dark-mode aesthetics, rich glassmorphism layouts, and millisecond-level responsiveness, KRSwitch empowers students to barter class sections in real time and provides administrators with a powerful control center to orchestrate database modifications, bulk imports, and manual scheduling overrides.

---

## ✨ Premium UI Features & Aesthetics

### 1. High-Fidelity Monochromatic & Emerald Dark Theme
* **Modern Color Palette**: Crafted from curated deep grays and vibrant, high-contrast Emerald Green accent highlights, avoiding generic browser styling.
* **Glassmorphism Design**: Layout panels, headers, and modal cards utilize rich semi-translucencies, blurred dropdrops, and borders to generate premium visual depth.
* **JetBrains Mono Typography**: Native, developer-centric monospace typography styling standardizes alignment across tables, schedule grids, and logs.

### 2. Smooth Micro-Animations & Dynamic Feedback
* **Staggered RAF Animators**: Offers and classes slide in dynamically utilizing `requestAnimationFrame` for a responsive UI.
* **Live Connection Headers**: Real-time Socket.IO connection status light indicator (🟢 Connected / 🔴 Disconnected) that automatically updates active online count statistics.
* **Exit Transitions**: When trades are completed, barter cards execute smooth exit animations before disappearing, providing immediate feedback.

### 3. Comprehensive Administrative Control Center
* **Live Activity Logs Table**: High-contrast, real-time audit feed representing system events instantly synced via WebSockets.
* **Dynamic Master Import Dropzones**: Drag-and-drop file inputs supporting spreadsheet verification on-the-fly, previewing imported rows inside clean data-grid lists.
* **The Override Wizard**: A multi-step administrative scheduler force-swap wizard that maps schedule parameters, performs real-time collision alerts, and automatically cancels stale student offers.
* **Account Status Toggles**: SuperAdmins can dynamically toggle admin operator status to immediately revoke credentials and session states.

---

## 🛠️ Technological Achievements

This workspace leverages a cutting-edge front-end stack that incorporates modern build tool improvements:

* **React 19 (Concurrent Mode)**: Embraces React 19's rendering core, leveraging state transitions and concurrent features.
* **Vite 7**: Rapid hot-module replacement (HMR) and optimized rollup production bundles.
* **Tailwind CSS v4 (Zero-Config Compiler)**: Native integration using `@tailwindcss/vite` in `vite.config.js`. Avoids configuration bloat by replacing standard `postcss` configuration files with native CSS directive engines.
* **Radix UI Primitives**: Modular primitives (`Select`, `Tabs`, `Slot`) are integrated directly under custom Emerald configurations for keyboard navigation and screen-reader accessibility.
* **Cypress E2E Testing**: Headless browser automation scripts that run through authentication callbacks, route-guard protections, and swap overrides.

---

## 📂 Codebase Tour & Directory Structure

```
KRSwitch-frontend/
├── cypress/                   # Cypress E2E visual automation suites
│   ├── e2e/
│   │   ├── admin/             # RBAC guard testing
│   │   └── auth/              # OAuth popup callback testing
│   └── support/               # E2E command overrides
├── public/                    # Static site assets
├── src/
│   ├── assets/                # Graphic files
│   ├── components/
│   │   ├── admin/             # Administrative layouts & components
│   │   │   ├── tabs/          # Tab content panels (Akun, Barter, KRS, Override)
│   │   │   ├── modals/        # CRUD forms (Students, Courses, Admins)
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminLogTable.jsx
│   │   │   ├── AdminModal.jsx
│   │   │   ├── AdminWizardCard.jsx
│   │   │   ├── ExportRecapCard.jsx
│   │   │   └── SystemStatsCard.jsx
│   │   ├── dash/              # Main student barter dashboard components
│   │   │   ├── BarterCard.jsx
│   │   │   ├── ClassCard.jsx
│   │   │   ├── CourseTabs.jsx
│   │   │   ├── CreateOfferForm.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── NotificationModal.jsx
│   │   │   ├── ScheduleGraphModal.jsx
│   │   │   └── TradeConfirmationModal.jsx
│   │   └── ui/                # Core accessible primitives (buttons, selects)
│   ├── pages/
│   │   ├── Admin.jsx          # General dashboard stats & logs orchestrator
│   │   ├── AdminManagementPage.jsx  # SuperAdmin admin management table
│   │   ├── CourseManagementPage.jsx # Operator/Admin Course grid
│   │   ├── StudentManagementPage.jsx# Student Database details & sidebar pages
│   │   ├── AuthCallback.jsx   # Google OAuth callback redirection page
│   │   ├── Dashboard.jsx      # Primary student barter page
│   │   └── Login.jsx          # Secure login gate
│   ├── api.js                 # Unified Axios HTTP interceptor & methods
│   ├── App.jsx                # Layout definitions and route configurations
│   ├── index.css              # Base styling & Tailwind v4 imports
│   └── main.jsx               # Application entry point
├── cypress.config.js          # Cypress runner settings
├── eslint.config.js           # Lint configurations
├── tailwind.config.js         # Custom animations & font extensions
└── vite.config.js             # Vite 7 plugins (React 19 & Tailwind v4)
```

---

## 🚀 Local Development Setup

### 1. Prerequisites
* **Node.js** 20.x or higher
* **npm** or **yarn**
* Compatible running **KRSwitch Backend** on `http://localhost:5000`

### 2. Configure Environment Variables
Create a `.env` file in the frontend root directory:

```env
VITE_API_BASE="http://localhost:5000"
```

### 3. Installation & Bootstrapping

```bash
# Install dependencies
npm install

# Start the Vite 7 development server
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 Cypress End-to-End Testing

Cypress tests let developers validate login states, role protections, and schedules modifications in actual Chrome/headless browser contexts.

```bash
# Open Cypress visual workspace (interactive mode)
npm run cypress:open

# Run E2E tests inside headless terminal (CI/CD mode)
npm run cypress:run
```

### Coverage Highlights
* **Authentication Guards (`auth.cy.js`)**: Confirms OAuth callbacks, tests zombie cookie blocking configurations, and logs user logout clears.
* **Role-Based Access (`redirect-guard.cy.js`)**: Verifies that standard students attempting to enter administrative subroutes (`/admin/*`) are immediately redirected back, and disabled admin accounts are blocked.
* **Dashboard Interactions**: Simulates click schedules, toggle filter switches ("For You" recommendations), and accept barter models.

---

## 💡 Performance Engineering Optimizations

To maintain a fluid 60fps across highly concurrent schedule exchanges, KRSwitch implements several key rendering strategies:

* **Linear Tooltip Interpolation (LERP)**: Tooltips and hover analytics widgets use dynamic linear interpolation for smooth motion rather than sudden position changes.
* **useMemo Filter Guards**: Expensive course selections and student search indices are guarded inside `useMemo` hooks, preventing structural recalculations during Socket updates.
* **Callback Protection (`useCallback`)**: Handlers passed into active grid cards are memoized to completely avoid component re-renders.
* **Batch Enrollment Swaps**: WS updates for barter completions update local state indices in single React state updates, avoiding flashing grid indicators.

---

*KRSwitch Frontend is built for user experience. For bugs, features, or design discussions, open a pull request.*

---

## 👥 Developer Credits

This project is engineered and maintained with ❤️ by:
1. **Gilang Muhamad Widiagung**
2. **Azka Julian**
3. **Muhammad Arifaushan**