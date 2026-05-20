# WebSockets & Real-Time

## Real-Time View Synchronization

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
