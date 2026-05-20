# KRSwitch Frontend Documentation

Welcome to the documentation for the KRSwitch frontend application.

## 📖 Table of Contents

- [Getting Started](getting-started.md) - Setup, environment variables, and onboarding.
- [Architecture & UI](architecture.md) - Component topology, React Router, and state boundaries.
- [WebSockets & Real-Time](websockets.md) - Socket.IO client integration and event handling.
- [Testing](testing.md) - Cypress E2E testing guide and execution.

## 📁 Source Tree Layout

```text
KRSwitch-frontend/
├── cypress/                   # Cypress E2E visual tests
├── public/                    # Public static files
├── src/
│   ├── components/            # UI components
│   │   ├── admin/             # Administrative layouts, tabs, and modals
│   │   ├── dash/              # Main student dashboard layouts and cards
│   │   └── ui/                # Core accessible Radix elements
│   ├── pages/                 # Full Page layouts
│   ├── api.js                 # Unified Axios interceptor
│   ├── App.jsx                # Router & layout mappings
│   ├── index.css              # Baseline CSS & Tailwind imports
│   └── main.jsx               # Entry point
```

## 👥 Developer Credits

This project is engineered and maintained with ❤️ by:
1. **Gilang Muhamad Widiagung**
2. **Azka Julian**
3. **Muhammad Arifaushan**
