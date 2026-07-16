# ADR: Integrate RAG Chatbot into Marketplace as a Separate Service

**Status:** Proposed  
**Date:** 2026-07-02  
**Repositories:** `marketplace`, `marketplace-monolith-node`, `talkback-api`

## Context

The Marketplace application currently uses a JSON file to define catalog offerings. A separate `talkback-api` service already provides RAG functionality backed by AWS Knowledge Base. The Marketplace frontend and backend run in containers and are split into separate repositories.

## Decision

Keep the RAG capability as a separate service and integrate it through the Marketplace backend rather than moving the RAG logic into the Marketplace application.

The Marketplace backend will:
- read and resolve catalog data from the existing JSON catalog,
- enrich the user request with catalog context,
- call `talkback-api`,
- return a combined response to the frontend.

The Marketplace frontend will:
- expose a chat UI,
- call only the Marketplace backend,
- render answers, citations, and product cards.

## Why this approach

- Preserves separation of concerns.
- Keeps the AI/RAG stack reusable by other applications.
- Avoids duplicating AWS Knowledge Base logic.
- Minimizes changes to the Marketplace frontend.
- Allows the Marketplace backend to own auth, logging, retries, and response shaping.

## Consequences

### Benefits
- Independent deployment of RAG and marketplace code.
- Easier testing of each layer.
- Lower coupling between product catalog logic and retrieval logic.
- Clearer ownership boundaries.

### Tradeoffs
- One extra network hop from marketplace backend to `talkback-api`.
- Requires service-to-service authentication.
- Requires API contract management between services.

## Implementation Outline

### Marketplace backend (`marketplace-monolith-node`)
- [ ] Add `TALKBACK_API_URL`
- [ ] Add service authentication
- [ ] Add `POST /api/chat`
- [ ] Resolve catalog records
- [ ] Forward prompt + context to `talkback-api`
- [ ] Merge response with product metadata
- [ ] Add logging, tracing, and tests

### Marketplace frontend (`marketplace`)
- [ ] Add chat widget
- [ ] Add chat history
- [ ] Render markdown and citations
- [ ] Display product cards
- [ ] Handle loading and error states

### TalkBack service (`talkback-api`)
- [ ] Keep existing RAG and AWS Knowledge Base integration
- [ ] Expose stable chat endpoint
- [ ] Return citations/source metadata

## API Boundary

The frontend should never call `talkback-api` directly.  
The backend should remain the single integration point for the UI.

## Notes

If the catalog grows beyond JSON-only lookup, introduce a dedicated catalog service or indexed search layer later. The RAG service should remain separate regardless of how the catalog is stored.
