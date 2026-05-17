# 📐 KRSwitch Frontend — Component Topology & Client States

This document details the interface structures, routing gates, WebSocket event synchronization, and performance optimizations inside the React 19 / Vite 7 client.

---

## 1. Client Service Boundaries

The frontend application coordinates pages, standard UI components, state engines, WebSockets, and secure API layers:

```mermaid
graph TD
    %% Boundaries
    User["Student / Admin Browser"]
    API["Express API Server"]
    Socket["Socket.IO Server"]

    subgraph FrontEnd ["React 19 Application Scope"]
        Router["React Router 7 Gates"]
        
        subgraph Views ["Page Containers"]
            Dash["Dashboard (Student Barter)"]
            Admin["Admin Console (Telemetry / Override)"]
        end

        subgraph Network ["Network API Services"]
            Axios["Axios Interceptor Context"]
            SocketClient["Socket.IO Client Controller"]
        end
    end

    %% Mappings
    User --> Router
    Router --> Dash
    Router --> Admin
    
    Dash --> Axios
    Dash --> SocketClient
    Admin --> Axios
    
    Axios <--> API
    SocketClient <--> Socket
```

---

## 2. Real-Time View Synchronization

The Socket.IO Client maps real-time server broadcasts directly to local React state hook matrices, preventing page flushes:

```mermaid
sequenceDiagram
    autonumber
    participant Server as Socket.IO Server
    participant WS as Socket.IO Client
    participant Context as React WebSocket Context
    participant Feed as Dashboard Live Feed Page

    Server->>WS: Broadcast "new-offer" (New trade offer posted)
    WS->>Context: Parse offer payload
    Context->>Feed: Prepend offer to state array (batch renders)
    Feed-->>Feed: Trigger slide-up RAF entrance animation
    
    Server->>WS: Broadcast "offer-taken" (Swap completed)
    WS->>Context: Parse target offer ID
    Context->>Feed: Filter offer ID from state array
    Feed-->>Feed: Run exit animation sequence on target card
```

> [!NOTE]
> **Dynamic Reconnection**: If the network connection drops, the header light status immediately switches to `🔴 Reconnecting` and attempts to reconnect. Upon reconnection, the client automatically requests a new socket token and re-establishes auth.

---

## 3. Client Performance Optimizations

To maintain a fluid 60fps across highly concurrent schedule exchanges, the frontend implements several structural optimization rules:

*   **Linear Tooltip Interpolation (LERP)**: Tooltips and schedule graph overlays use linear interpolation coordinates to track mouse movements rather than sudden pixel changes.
*   **useMemo Filter Guards**: Complex class timetables and student directories are memoized to avoid expensive sorting and matching operations during real-time WebSocket updates.
*   **useCallback Handlers**: Trade confirmation callbacks and drawer toggles are memoized using `useCallback` hooks to prevent parent re-renders.

> [!TIP]
> **Batching States**: WebSocket state modifications update multiple states in a single render cycle, avoiding layout thrashing.

---

## 👥 Developer Credits

This project is engineered and maintained with ❤️ by:
1. **Gilang Muhamad Widiagung**
2. **Azka Julian**
3. **Muhammad Arifaushan**
