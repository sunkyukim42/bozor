# BozorCheck AI npm Audit Review

## Review Metadata

- Review date: 2026-05-31
- Project: `frontend`
- Commands:
  - `npm audit --omit=dev`
  - `npm audit`
- Scope: audit analysis only. No `npm audit fix --force` was run.

## Summary

Both audit commands report the same moderate advisory:

- Package: `uuid <11.1.1`
- Severity: moderate
- Advisory: missing buffer bounds check in UUID v3/v5/v6 when a caller provides a `buf` argument
- Current result: 11 moderate vulnerabilities reported through Expo toolchain transitive dependencies

The suggested automatic fix is not safe for this project stage because npm proposes a breaking dependency change.

## `npm audit --omit=dev` Result

`npm audit --omit=dev` still reports the vulnerability. That means the affected dependency is reachable from production dependencies, not only from direct devDependencies.

Observed chain:

```text
expo
  @expo/cli
    @expo/config-plugins
      xcode
        uuid <11.1.1
```

Additional Expo packages in the chain include `@expo/config`, `@expo/metro-config`, `@expo/prebuild-config`, `@expo/local-build-cache-provider`, `@expo/inline-modules`, and `expo-splash-screen`.

## `npm audit` Result

`npm audit` reports the same `uuid <11.1.1` advisory and the same Expo toolchain chain.

The suggested forced fix would install a breaking Expo-compatible package set. In the latest run npm proposed a breaking change involving `expo@46.0.21`; in an earlier run it proposed a breaking change involving `expo-splash-screen@55.0.21`.

## Runtime Impact

The vulnerable `uuid` package is pulled through Expo configuration and native project tooling, especially `xcode` under `@expo/config-plugins`.

Current app runtime risk is assessed as low for the MVP because:

- The BozorCheck UI does not call `uuid` directly.
- The app does not accept user-provided buffers for UUID generation.
- The affected chain is primarily Expo project/config tooling.
- No API key, token, secret, Dify, Telegram, OpenAI, camera, location, or file upload integration is present in this phase.

This does not mean the advisory should be ignored permanently. It should be tracked until Expo publishes a compatible patched dependency path.

## Why Forced Fix Was Not Applied

`npm audit fix --force` was intentionally not run because it would:

- Break the current Expo SDK dependency set.
- Potentially downgrade or replace Expo packages outside the requested scope.
- Risk React Native, Expo Router, Metro, and `jest-expo` compatibility.
- Add instability immediately before the planned phase 5 Dify integration.

The safer action is to keep the current Expo-compatible package set and revisit after an Expo-compatible patch is available.

## Follow-up Plan

1. Keep the advisory documented in this file.
2. Monitor Expo SDK release notes and `expo install --check` output.
3. Re-run:

```bash
cd frontend
npm audit --omit=dev
npm audit
npx expo install --check
```

4. Apply only Expo-compatible updates through `npx expo install` or a planned Expo SDK patch update.
5. Avoid `npm audit fix --force` unless a separate upgrade task explicitly accepts the Expo/React Native compatibility risk.

## Current Decision

Proceed to phase 5 readiness with the advisory documented. Do not block phase 5 Dify design/API planning on this moderate Expo toolchain transitive issue, but re-check before production packaging.
