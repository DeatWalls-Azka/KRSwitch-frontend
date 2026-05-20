# KRSwitch Frontend — Real-Time Schedule Exchange Client

KRSwitch is a modern, dark-mode React application powered by Vite and Tailwind CSS. It serves as the primary interface for students to manage and barter their university class schedules in real time.

## 🌟 Key Features

*   **Live Barter Feed:** Real-time trade listings and offers that update dynamically via WebSockets without page reloads.
*   **Conflict Guards:** Intelligent schedule conflict detection that prevents overlapping classes before confirming swaps.
*   **Admin Management Center:** A powerful operator view featuring live telemetry, student registry databases, and manual override wizards.
*   **Optimized Performance:** Implements state batching and memoization to maintain fluid 60fps rendering during highly concurrent schedule exchanges.

## 📖 Documentation

The complete documentation system is organized in the `docs/` directory:

- [Getting Started](docs/getting-started.md) - Local setup, environment config, and onboarding.
- [Architecture & UI](docs/architecture.md) - React component topology and service boundaries.
- [WebSockets & Real-Time](docs/websockets.md) - Socket.IO event handling.
- [Testing](docs/testing.md) - Cypress E2E testing guides.