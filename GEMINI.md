# STOCKMASTER GLOBAL PROTOCOL : ENGINEERING MANDATES

This document serves as the absolute foundational mandate for the **StockMaster Pro** ecosystem. All operational modifications and architectural expansions MUST adhere strictly to these protocols.

## 1. Visual Identity (Ultra Pro Aesthetic)
- **Glassmorphism:** Use white/10 and slate-900/10 with backdrop-blur for all surfaces.
- **Typography:** Standardized 14px base font. Use `font-black`, `uppercase`, and `italic` for primary signaling.
- **Spacing:** Compact padding/margins optimized for 14-inch high-bandwidth displays.
- **Pulse Indicators:** Real-time state MUST be visualized with animated pulse nodes.

## 2. Technical Standards
- **Data Integrity:** All Mongoose models MUST use the `mongoose.models.X || mongoose.model("X", ...)` pattern to prevent runtime collisions.
- **Forensic Traceability:** Every write operation MUST be recorded in the Forensic Audit Protocol.
- **Error Handling:** Generic failures are prohibited. All errors MUST return descriptive diagnostic signals via the global error middleware.
- **Resource Constraints:** SaaS limits (maxProducts, maxUsers) MUST be enforced at the model and middleware layers.

## 3. Communication Protocols
- **Neural Chat:** All messaging nodes MUST support high-bandwidth media (Images/Video) and voice signaling.
- **Sync Data:** Feed components MUST include manual refresh triggers to force immediate registry synchronization.

## 4. Mobile Architecture
- **Offline First:** Local SQLite indexing is mandatory for field operations.
- **AI Vision:** Scanning nodes MUST provide haptic feedback and cinematic UI overlays.

---
**OPERATIONAL STATUS: VISUALLY DOMINANT. TECHNICALLY SUPERIOR.**
