# KRSwitch Frontend — Real-Time Schedule Exchange Client

A dark-mode React application powered by Vite 7 and Tailwind CSS v4, providing student barter panels and administrative management views.

---

## 🎨 User Interface & Views

### 1. Student Barter Dashboard
*   **Parallel Classes Grid**: Lists parallel sections alongside enrollment structures, slot indicators, and schedule overlaps.
*   **Live Barter Feed**: Real-time trade listings that update dynamically via WebSockets.
*   **Filters**: Focuses views on compatible sections and active offers.
*   **Schedule Conflict Guards**: Alerts users of time overlaps prior to confirming swaps.

### 2. Admin Management Center
*   **System Telemetry**: Displays counts of online users, active listings, transaction success ratios, and system audit logs in real time.
*   **Student Registry & Management**: Searchable databases containing registration logs, active trades, and course drops.
*   **Transactional CSV Imports**: Drag-and-drop file inputs designed to import schedules and registries, featuring validation previews.
*   **Override Wizard**: Steps operators through manual enrollment swaps, checking conflicts and cleaning stale listings automatically.
*   **SuperAdmin Tab**: Manage administrative permissions, edit details, toggle active/disabled flags, and trigger a master system reset.

---

## 🛠️ Technological Stack

*   **React 19**: Modern concurrent state updates.
*   **Vite 7**: Fast builds and fast hot-module replacements.
*   **Tailwind CSS v4**: Built natively with `@tailwindcss/vite` within the compilation cycle, replacing PostCSS configuration files.
*   **Radix UI**: Fully accessible keyboard-friendly components (button, select, tabs).
*   **Socket.IO Client**: Persistent WebSocket connections with initial handshake tokens.
*   **Cypress E2E**: Integration test suites verifying layout guards and visual transitions.

---

## 📁 Source Tree Layout

```
KRSwitch-frontend/
├── cypress/                   # Cypress E2E visual tests
├── public/                    # Public static files
├── src/
│   ├── components/            # UI components
│   │   ├── admin/             # Administrative layouts, tabs, and modals
│   │   ├── dash/              # Main student dashboard layouts and cards
│   │   └── ui/                # Core accessible Radix elements
│   ├── pages/                 # Full Page layouts
│   │   ├── Admin.jsx          # Audit logs & telemetry view
│   │   ├── AdminManagement.jsx# SuperAdmin operator table
│   │   ├── CourseManagement.jsx# Master class scheduler
│   │   ├── StudentManagement.jsx# Student details & sidebar
│   │   ├── AuthCallback.jsx   # OAuth redirect handler
│   │   ├── Dashboard.jsx      # Barter main feed
│   │   └── Login.jsx          # Login screen
│   ├── api.js                 # Unified Axios interceptor
│   ├── App.jsx                # Router & layout mappings
│   ├── index.css              # Baseline CSS & Tailwind imports
│   └── main.jsx               # Entry point
```

---

## 🚀 Setup & Execution

### 1. Configure Environment
Create a `.env` file in the root frontend directory:
```env
VITE_API_BASE="http://localhost:5000"
```

> [!NOTE]
> **API Mappings**: Ensure the backend service is running and accessible at the specified `VITE_API_BASE` address before launching the development server.

### 2. Launch Client
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open browser to `http://localhost:5173`.

---

## 🧪 Cypress End-to-End Tests

Verify components and access guards using Cypress:
```bash
# Start Cypress in interactive UI mode:
npm run cypress:open

# Run Cypress headless:
npm run cypress:run
```
*   **Auth Checks (`auth.cy.js`)**: Evaluates Google OAuth callback sequences and cookie clearings.
*   **Role Mappings (`redirect-guard.cy.js`)**: Confirms route redirects for unauthorized roles.

---

## 💡 Performance Optimization
*   **LERP Tooltips**: Custom tooltip overlays coordinate positions smoothly using linear interpolation.
*   **useMemo Filter Wrappers**: Heavy filter listings are memoized, avoiding render bottlenecks during Socket.IO feed broadcasts.
*   **useCallback Handlers**: Callback functions are memoized to avoid child card rendering cycles.
*   **State Batching**: WebSocket updates for matched trades are batched, preventing browser layout thrashing.

> [!TIP]
> **Render Profiling**: You can use React Developer Tools in your browser to inspect rendering boundaries and confirm that `useMemo` blocks keep rendering costs contained during live feeds.

---

## 👥 Developer Credits

This project is engineered and maintained with ❤️ by:
1. **Gilang Muhamad Widiagung**
2. **Azka Julian**
3. **Muhammad Arifaushan**