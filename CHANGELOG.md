# Changelog

All notable changes to **Skylink ERP Frontend** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release tags use the same version as `erp_skl` backend (unified product version).

## [1.0.0] - 2026-07-10

### Added

- Formal application versioning (`1.0.0` baseline).
- App version shown in the footer (frontend + API version when available).
- `GET /api/health` BFF endpoint proxying backend health for deploy verification.
- `CHANGELOG.md` for release notes.

### Notes

- Baseline release for the production-ready ERP UI (finance, inventory, HRD, sales, SSO).
