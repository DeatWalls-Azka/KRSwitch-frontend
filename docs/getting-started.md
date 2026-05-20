# Getting Started

## 🚀 Setup & Execution

### 1. Configure Environment
Verify **Node.js 20+** is installed on your system.
Create a `.env` file in the root frontend directory:
```env
VITE_API_BASE="http://localhost:5000"
```

> [!NOTE]
> **Port Mappings**: By default, the React Vite client runs on port `5173` and maps backend calls to port `5000`. If you override these ports, ensure you update CORS origins in the backend `.env`.

### 2. Launch Client
```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open browser to `http://localhost:5173`.

## 🛠️ Onboarding Exercises

### Exercise: Hover Styles & Re-render Tracking
* **Goal**: Observe component rendering boundaries and customize aesthetics.
* **Task**:
  1. Modify the card's active border accent on hover in `BarterCard.jsx`.
  2. Place `console.log("Render card id:", offer.id)` inside the card component function body.
  3. Observe logs in the browser console when selecting filters to see memoization in action.

## 📊 Component Graphs Generation (Madge)

Generates component dependency charts:
```bash
npm install --save-dev madge

# Render frontend components to SVG:
npx madge --image frontend-graph.svg --layout dot src/main.jsx
```

> [!TIP]
> **Graphviz Requirement**: Generating graphical SVG files from Madge outputs requires the `graphviz` library installed globally on your OS.
