# Changelog

All notable changes to DocTrack Inc. will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0-alpha.1] - 2026-07-27

### Added

- Monorepo repository setup (`apps/web`, `apps/docs`, `packages/contracts`, `packages/security`, `packages/testing`, `packages/core`, `packages/config`, `packages/ui`).
- Shared security algorithms (PBKDF2 password hashing, AES-256 GCM encryption, SHA-256 token hashing).
- Machine-readable AI context files (`.ai/project-context.json`, `.ai/architecture-map.json`, `.ai/prompt-history.md`).
- GitHub CI/CD workflows (`ci.yml`, `preview.yml`, `release.yml`, `security.yml`, `dependency-update.yml`).
