# ADR 0001: ServiceNow API Integration Location (Frontend vs Backend)

**Date:** 2025-11-18  
**Status:** Accepted  
**Author:** Marketplace Engineering Team  

---

## Context

The Marketplace requires integration with ServiceNow to support catalog retrieval, request submission, updates, and comments. The engineering team needed to determine whether the ServiceNow integration should occur in the **frontend (React)** or **backend (Node.js/Express)**.  

The backend stack includes:
- Node.js / Express  
- Sequelize ORM  
- PostgreSQL  
- Keycloak SSO with token introspection middleware  

The frontend is a React application using Advana shared libraries.

The architectural decision must align with Advana security posture, IL2/IL5 expectations, and cybersecurity review processes.

---

## Decision

**All ServiceNow API integration will occur in the backend.**  
The frontend must never directly call ServiceNow APIs or handle OAuth credentials.

---

## Options Considered

### **Option A — Frontend Integration**  
Browser directly calls ServiceNow APIs.

| Pros | Cons |
|------|------|
| Simplifies backend; Faster UI prototyping | Exposes OAuth tokens; Harder error handling; CORS issues; UI tightly coupled to SNOW schema; Likely fails Advana cybersecurity review |

### **Option B — Backend Integration (Chosen)**  
Backend acts as proxy for all ServiceNow API calls.

| Pros | Cons |
|------|------|
| Secures OAuth tokens; Centralized logic; Retry/caching possible; Easier to adapt to API changes; Aligns with compliance | Slight backend complexity increase; Extra network hop |

---

## Rationale

Backend integration:
- Ensures OAuth tokens and credentials never reach the client.  
- Aligns with Keycloak introspection-based backend architecture.  
- Centralizes error handling, logging, transformation, and retries.  
- Eases future maintainability and security audits.  
- Ensures compatibility with Advana cybersecurity requirements.  

---

## Consequences

| Category | Details |
|----------|---------|
| **Positive** | Stronger security; Cleaner separation of concerns; Centralized logic; Audit-friendly |
| **Negative** | Slightly increased backend complexity; Minor added latency |

---

## Compliance & Traceability

- Related spike: **CA-658 – Mock SNOW API Framework**
- Architecture discussions: Microsoft Teams sessions, October 2025  
- Aligns with Advana Software Operations Playbook: *Authentication*, *Cybersecurity*, *Application Server*

---

## Risks

- Backend may grow complex → mitigate with reusable integration patterns  
- ServiceNow API changes may require transformation updates  
- Latency may increase → caching strategies may help  

---

## Open Questions

1. Should Marketplace support integrations with additional ITSM tools?  
2. Should a reusable service-to-service HTTP integration pattern be formalized (timeouts, retries, circuit breaking)?  
3. Is caching needed for specific ServiceNow endpoints?  

---

## Next Steps

- Implement backend ServiceNow client  
- Add backend routes for SNOW products, requests, updates, and comments  
- Define transformation and error-handling layer  
- Conduct cybersecurity review  
- Publish this ADR in the GitHub ADR folder structure  

