# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog and versioning follows SemVer.

## [Unreleased]

### Added
- Governance documentation: `docs/ROADMAP.md`, `docs/STATUS.md`, `docs/LESSONS_LEARNED.md`, `docs/UI_TOUR.md`.
- `parseJsonBody` request helper test coverage in `src/lib/server/__tests__/validation.test.ts`.

### Changed
- Hardened JSON parsing on key API routes so malformed JSON returns deterministic 400 app errors.
- Hardened export route payload handling with explicit `level` validation and boolean-flag normalization.
- Updated `docs/STATUS.md` with completed autonomous roadmap phase 1–5 execution status and release-gate evidence.

### Fixed
- Reduced risk of malformed JSON causing unexpected 500 responses on hardened API routes.

## [0.1.0] - 2026-04-04

### Added
- Initial app foundation (auth, projects, sessions, documents, AI analysis pipeline, questions, export).
