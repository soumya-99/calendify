# Repository Guidelines

## Project Structure & Module Organization
`app/` contains Expo Router screens and route layouts such as `app/(tabs)/`, `app/add/`, and dynamic routes like `app/event/[id].tsx`. Put reusable code in `src/`: UI in `src/components/`, state in `src/stores/`, hooks in `src/hooks/`, pure helpers in `src/utils/`, shared types in `src/types/`, and theme tokens in `src/theme/`. Static assets live in `assets/images/`. Native Android files are in `android/`, and app-level Expo config is in `app.json`.

## Build, Test, and Development Commands
Use `npm install` to sync dependencies from `package-lock.json`. Use `npm run start` to launch the Expo dev server, `npm run android` for a local Android build, and `npm run web` for the browser target. Run `npm run lint` before opening a PR; it uses Expo's ESLint config. Native project regeneration is handled by `npm run prebuild` or `npm run prebuild:clean`. `npm run reset-project` is a starter-reset script and should not be used on active feature branches.

## Coding Style & Naming Conventions
This repo uses TypeScript with `strict` mode and the `@/*` path alias. Follow the existing style: 2-space indentation, semicolons, and single quotes. Use PascalCase for components (`CalendarPicker.tsx`), camelCase for helpers (`generateId.ts`), `useX` for hooks, and `useXStore` for Zustand stores. Keep route files named after their URL segment, including bracket syntax for dynamic routes. Prefer moving logic into hooks, stores, or `src/utils/` instead of growing screen components.

## Testing Guidelines
There is no automated test runner or coverage gate configured yet. For now, every change should pass `npm run lint` and a manual smoke test of the affected flows in Expo. Focus on navigation, add/edit forms, persisted MMKV-backed state, and platform-specific behavior you touched. If you introduce a test harness, prefer colocated `*.test.ts` or `*.test.tsx` files beside the module under test.

## Commit & Pull Request Guidelines
Git history is still minimal, but it already uses an imperative `feat:` subject. Continue with concise Conventional Commit-style messages such as `feat: add birthday import` or `fix: guard invalid reminder dates`. PRs should include a short summary, linked issue when applicable, test notes, and screenshots or recordings for UI changes. Call out any config, native, or migration impact explicitly.

## Configuration Notes
Keep Expo settings in `app.json` aligned with route, plugin, and package changes. Do not commit secrets; this repo currently has no checked-in environment file, so document any new runtime configuration in `README.md` and the PR description.
