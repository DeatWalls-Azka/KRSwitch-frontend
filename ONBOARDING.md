# 🚀 KRSwitch Frontend — Developer Onboarding Playbook

This playbook provides configuration steps, component walkthrough exercises, and E2E test execution instructions for the frontend client.

---

## 📅 Onboarding Checklist

### 1. Configure Port & Environments
Verify **Node.js 20+** is installed on your system.
1. In this folder (`KRSwitch-frontend`), create a `.env` file containing:
   ```env
   VITE_API_BASE="http://localhost:5000"
   ```
2. Verify that the KRSwitch Backend service is running locally on port `5000`.

> [!NOTE]
> **Port Mappings**: By default, the React Vite client runs on port `5173` and maps backend calls to port `5000`. If you override these ports, ensure you update CORS origins in the backend `.env`.

### 2. Run Frontend Client
Initialize dependencies and launch the Vite development server:
```bash
npm install
npm run dev           # Runs Vite dev server on http://localhost:5173
```
Access the client at `http://localhost:5173`.

### 3. Run E2E Cypress Tests
Cypress tests require a running database and backend instance to complete OAuth popup verification and route-guard redirections:
```bash
# Start Cypress in interactive UI mode:
npm run cypress:open

# Run Cypress headless:
npm run cypress:run
```

---

## 🛠️ Component Walkthrough Exercises

Complete this task to understand the styling conventions, state memoizations, and rendering loops of the client:

### Exercise: Hover Styles & Re-render Tracking
* **File**: [BarterCard.jsx](file:///home/gimigkk/Desktop/Projects/KRSwitch/KRSwitch-frontend/src/components/dash/BarterCard.jsx)
* **Goal**: Observe component rendering boundaries and customize aesthetics.
* **Task**:
  1. Modify the card's active border accent on hover.
  2. Place `console.log("Render card id:", offer.id)` inside the card component function body.
  3. Observe logs in the browser console when selecting filters. Note how component updates are memoized via `Dashboard.jsx`.

---

## 📊 Component Graphs Generation (Madge)

Generates component dependency charts:
```bash
npm install --save-dev madge

# Render frontend components to SVG:
npx madge --image frontend-graph.svg --layout dot src/main.jsx
```

> [!TIP]
> **Graphviz Requirement**: Generating graphical SVG files from Madge outputs requires the `graphviz` library installed globally on your operating system (e.g., `sudo apt-get install graphviz` on Ubuntu/Debian).

---

## 👥 Developer Credits

This project is engineered and maintained with ❤️ by:
1. **Gilang Muhamad Widiagung**
2. **Azka Julian**
3. **Muhammad Arifaushan**
