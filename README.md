# Class Barter System

A real-time class trading platform that enables students to exchange parallel class schedules seamlessly. Built with React and Socket.IO for instant updates and smooth animations.

## Features

- **Real-Time Updates** — Live barter feed with WebSocket-powered instant notifications
- **Smart Filtering** — Filter offers by course code or personalized "For You" recommendations
- **Interactive UI** — Smooth animations and transitions for card entries and exits
- **Class Overview** — Visual representation of all parallel classes with active offer indicators
- **Trade Confirmation** — Secure modal-based confirmation before accepting trades
- **Responsive Design** — Mobile-first approach with adaptive layouts

## Tech Stack

### Frontend
- **React 18** — UI framework with hooks
- **Vite** — Fast build tool and dev server
- **React Router** — Client-side routing
- **Socket.IO Client** — Real-time bidirectional communication
- **Axios** — HTTP client for REST API calls
- **Tailwind CSS** — Utility-first styling

### Backend (Required)
- REST API server running on `http://localhost:5000`
- Socket.IO server for real-time events

## Prerequisites

- Node.js 16+ and npm/yarn
- Backend API server (see API Endpoints section)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173` (or the port shown in terminal)

## Project Structure

```
src/
├── assets/          # Static assets (images, icons)
├── components/      # Reusable UI components
│   ├── BarterCard.jsx              # Individual barter offer card
│   ├── ClassCard.jsx               # Class schedule card
│   ├── CourseTabs.jsx              # Course selection tabs
│   ├── CreateOfferForm.jsx         # Form for creating new offers
│   ├── FilterButton.jsx            # Filter toggle button
│   ├── Header.jsx                  # App header with connection status
│   ├── SessionTypeTabs.jsx         # Session type selector (lecture/lab/tutorial)
│   └── TradeConfirmationModal.jsx  # Trade acceptance modal
├── pages/           # Page-level components
│   ├── Admin.jsx                   # Admin dashboard
│   ├── Dashboard.jsx               # Main dashboard (primary view)
│   └── Login.jsx                   # Login page
├── api.js           # API service layer
├── App.jsx          # Root component with routing
├── main.jsx         # Application entry point
├── App.css          # Global styles
└── index.css        # Base styles
```

## API Endpoints

The application expects the following REST API endpoints:

### User Management
- `GET /api/me` — Get current authenticated user
- `GET /api/users` — Get all users

### Classes
- `GET /api/classes` — Get all parallel classes
- `GET /api/enrollments` — Get all student enrollments

### Offers
- `GET /api/offers` — Get all active barter offers
- `POST /api/offers` — Create a new barter offer
  ```json
  {
    "myClassId": 1,
    "wantedClassId": 2,
    "offererNim": "13521001"
  }
  ```

### WebSocket Events (Socket.IO)

**Client receives:**
- `connect` — Connection established
- `disconnect` — Connection lost
- `online-count` — Number of online users
- `new-offer` — New barter offer created
- `offer-taken` — Offer accepted and removed
- `enrollments-swapped` — Student enrollments updated after trade

## Usage

### Creating a Barter Offer

1. Click the **"CREATE BARTER OFFER"** button in the right panel
2. Select the class you want to trade from your enrolled classes
3. Select the target class you want to switch to
4. Submit the offer — it will appear in the live feed instantly

### Accepting a Trade

1. Browse available offers in the live barter feed
2. Click on an offer card that matches your needs (only enabled if you're enrolled in the seeking class)
3. Review the trade details in the confirmation modal
4. Accept to complete the trade — both students' enrollments will be swapped automatically

### Filtering Offers

- **Course Filter** — Toggle to show only offers for the currently selected course
- **For You Filter** — Shows offers where you can actually participate (enrolled in the seeking class)

## Key Components

### Dashboard
The main view that orchestrates the entire application. Features include:
- Staggered card animations using RAF (RequestAnimationFrame)
- Smooth tooltip tracking with linear interpolation
- Optimistic UI updates with exit animations
- Multi-source data fetching with Promise.all

### BarterCard
Displays individual barter offers with:
- Entry/exit animations
- Conditional accept button (based on user eligibility)
- Formatted timestamps
- Visual feedback on hover/interaction

### CreateOfferForm
Modal form for creating new offers with:
- Dynamic class filtering based on user enrollments
- Validation to prevent invalid trades
- Loading states and error handling
- Success confirmation

## Development

### Run Dev Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Connection Status

The app displays real-time connection status in the header:
- 🟢 Connected — WebSocket active, real-time updates enabled
- 🔴 Disconnected — Attempting reconnection
- Online user count displayed when connected

## Performance Optimizations

- **useCallback** hooks prevent unnecessary re-renders
- **useMemo** for expensive computations (filtered offers)
- **RequestAnimationFrame** for smooth animations
- **Debounced tooltip updates** using lerp interpolation
- **Optimistic updates** for instant UI feedback

## Known Limitations

- Backend API must be running on port 5000
- No authentication implementation in frontend (relies on backend)
- Hard-coded API URLs (consider environment variables)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Modern browser with ES2020+ support required.

## Contributing

Contributions are welcome! Please ensure:
- Code follows existing style patterns
- Components are properly typed and documented
- Test changes across different screen sizes

---

**Note:** This is the frontend application only. A compatible backend server is required for full functionality. Ensure the backend API is running on `http://localhost:5000` before starting the development server.