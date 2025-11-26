# Dependency & License Compliance Matrix

**System:** Advana Marketplace  
**Environments:** Local, IL2, IL5  
**Prepared By:** Marketplace Engineering  
**Purpose:** Provide a full, documented inventory of all open-source dependencies, along with their licenses, classification status, and compliance risk assessment.

---

## 1. Overview

This document inventories all direct and transitive dependencies used across the Marketplace:

- Frontend (React + Vite)
- Backend (Node/Express + TypeScript)
- Container base images (Chainguard/Wolfi)
- Build pipeline tools
- Test-only dependencies (Jest, Nock, Testing Library)

Dependencies are classified based on DoD, CDAO, and IL5 restrictions into:

| Classification | Meaning |
|----------------|---------|
| Approved | License and security posture are acceptable. |
| Requires Review | License needs legal/CCB review or risk analysis. |
| Disallowed | Cannot be used in IL2/IL5 environments. Removal or waiver required. |

This matrix supports RMF controls: SA-22, CM-8, CM-10, RA-5, SI-2, and DSOP supply-chain requirements.

---

## 2. License Acceptability Guide (Per DoD/CDAO)

| License Type | Status | Notes |
|--------------|--------|-------|
| MIT | Approved | Permissive |
| Apache 2.0 | Approved | Permissive |
| BSD-2 / BSD-3 | Approved | Permissive |
| MPL 2.0 | Approved | Weak copyleft; acceptable |
| LGPL 2.1+ | Requires Review | Allowed if dynamically linked; verify usage |
| GPL 2.0/3.0 | Disallowed | Strong copyleft; cannot be used in IL5 |
| Elastic License | Disallowed | Not OSS; not allowed without waiver |

---

## 3. Dependency Matrix (Excerpt)

### Base Image Components (Chainguard/Wolfi)

> From uploaded SBOM: Advana-marketplace-sbom-cleaned.json

| Package | Version | License | Source | Classification | Notes |
|---------|---------|---------|--------|----------------|-------|
| ca-certificates-bundle | 20250619-r5 | MPL-2.0 AND MIT | Base image | Approved | Permissive combo license ✔ |
| glibc | 2.41-r56 | LGPL-2.1+ | Base image | Requires Review | LGPL allowed if dynamically linked ✔ |
| libcrypto3 (OpenSSL) | 3.5.2-r1 | Apache-2.0 | Base image | Approved | Widely used; no restrictions ✔ |
| libssl3 | 3.5.2-r1 | Apache-2.0 | Base image | Approved | Cryptographic ✔ |

### Backend Dependencies (Example)

| Dependency | License | Classification | Notes |
|------------|---------|----------------|-------|
| express | MIT | Approved | Safe, permissive |
| axios | MIT | Approved | No known restrictions |
| jsonwebtoken | MIT | Approved | Standard JWT library |
| @types/* | MIT | Approved | Dev-only types |
| jest | MIT | Approved | Dev-only; cannot ship to prod |
| nock | MIT | Approved | Dev/test only; no prod usage |
| ts-jest | MIT | Approved | Dev-only |

### Frontend Dependencies

| Dependency | License | Classification | Notes |
|------------|---------|----------------|-------|
| react | MIT | Approved | |
| react-dom | MIT | Approved | |
| vite | MIT | Approved | |
| zustand | MIT | Approved | |
| material-ui packages | MIT | Approved | |
| testing-library/react | MIT | Approved (test-only) | |

### Build Pipeline Tools

| Tool | License | Classification | Notes |
|------|---------|----------------|-------|
| node:20-chainguard | Multiple | Approved | SBOM included ✔ |
| syft | Apache-2.0 | Approved | Generates SBOM |
| cosign | Apache-2.0 | Approved | Supply-chain signing |
| eslint | MIT | Approved | Dev-only |

---

## 4. Automated Pipeline Compliance Checks

The Advana Marketplace uses the **DRAGON pipeline** (Delivery Route for Artifacts within Guarded Operations Networks) to automatically scan and validate all dependencies for license compliance and security vulnerabilities.

### Pipeline Scanning Tools

| Tool | Purpose | When It Runs | What It Checks |
|------|---------|--------------|----------------|
| **Anchore** | Container image & SBOM scanning | Every build | Vulnerabilities, malware, secrets, and **license compliance**. Generates SPDX SBOM. |
| **Trivy** | Comprehensive security scanner | Every build | Vulnerabilities, misconfigurations, secrets in container images and dependencies |
| **Syft** | SBOM generation | Every build | Extracts all packages, dependencies, and license metadata |
| **SonarQube** | Static code analysis | On commit | Code quality, security vulnerabilities, and code smells |
| **TruffleHog** | Secret detection | On commit | Leaked credentials, API keys, tokens in code repositories |

### License Compliance Workflow

1. **Build Stage**
   - Syft generates an SPDX-compliant SBOM listing all dependencies with licenses
   - SBOM includes: package names, versions, CPEs, purls, and license identifiers

2. **Security Scanning Stage**
   - Anchore scans the container image and validates:
     - All licenses are documented
     - No GPL or other disallowed licenses are present
     - License metadata matches SBOM declarations
   - Trivy performs additional vulnerability and license checks

3. **Compliance Gate**
   - Pipeline **FAILS** if:
     - Disallowed licenses detected (GPL, Elastic License, etc.)
     - Missing license metadata
     - Vulnerabilities with HIGH or CRITICAL severity
     - Secrets or credentials exposed
   - Pipeline **PASSES** only when:
     - All licenses are approved (MIT, Apache-2.0, BSD, MPL-2.0, etc.)
     - LGPL components are dynamically linked
     - No critical security issues found

4. **Artifact Storage**
   - SBOM attached to container image
   - Security Assessment Report (SAR) generated
   - Compliance artifacts stored in `/docs/compliance/`

### Allowlist Process

If a legitimate dependency is flagged as non-compliant (false positive), developers can request an allowlist entry:

1. **Submit Jira Ticket** with:
   - Dependency name and version
   - License type and justification
   - Evidence that it's safe for IL2/IL5 use
   - Path/regex for allowlist

2. **Review & Approval**
   - Cybersecurity team reviews request
   - Legal/CCB approval for edge cases
   - Allowlist entry added to DRAGON configuration

3. **Documentation**
   - All allowlist entries documented in this matrix
   - Quarterly review of allowlist items

### CI/CD Integration

The DRAGON pipeline runs automatically on:

- Every commit to main branch
- Pull/merge request creation
- Manual promotion to IL2/IL5 environments

---

## 5. Compliance Summary

| Category | Approved | Review | Disallowed |
|----------|----------|--------|------------|
| Base image components | 95% | 5% | 0% |
| Backend deps | 100% | 0% | 0% |
| Frontend deps | 100% | 0% | 0% |
| Pipeline tools | 100% | 0% | 0% |

**Key Findings:**

- No disallowed licenses present
- LGPL components (glibc) are dynamically linked and acceptable

---

## 5. Required Actions

1. Ensure test-only deps (Jest, Nock) never enter the production container
2. Keep SBOM generation automated in CI
3. Update this matrix quarterly or with each dependency upgrade

---

## 6. Approval

**Prepared for:** CDAO Compliance / ISSO  
**Prepared by:** Marketplace Engineering  
**Date:** November 2025
