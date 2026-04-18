# Angular 17 → 20 Migration Plan (angular-spotify)

**Date:** 2026-04-18
**Strategy:** Stepwise (17 → 18 → 19 → 20), one PR per step
**Output:** Three blog posts (one per step), written after each step completes

---

## 1. Baseline

Current state of `main`:

| Package                         | Current   | Notes                                              |
| ------------------------------- | --------- | -------------------------------------------------- |
| `@angular/core`                 | `17.3.2`  | Target: `20.x`                                     |
| `@nx/*`                         | `18.2.0`  | Nx is ahead of Angular, fine                       |
| `@ngrx/*`                       | `17.0.1`  | Must track Angular majors                          |
| `ng-zorro-antd`                 | `15.1.0`  | **5 majors behind** — biggest risk                 |
| `@ant-design/icons-angular`     | n/a       | Confirm paired with ng-zorro                       |
| `rxjs`                          | `6.6.6`   | **Must go to 7.x before Angular 18**               |
| `zone.js`                       | `0.14.4`  | Fine for 17/18, bump to `0.15.x` by Angular 20     |
| `@sentry/angular`               | `7.49.0`  | `@sentry/tracing` 6.8.0 is deprecated, consolidate |
| `@ngneat/until-destroy`         | `8.0.4`   | Verify Angular 20 compatibility; may replace with `takeUntilDestroyed()` |
| `@angular-devkit/build-angular` | `17.3.2`  | Switch to `@angular/build:application` at Angular 20 |
| `@nx/jest` + `jest`             | `18.2.0` / `29.4.3` | Migrate to Vitest at Angular 20 (Karma deprecated, Jest still works but Vitest is the Nx default moving forward) |
| `eslint`                        | `8.57.0`  | Flat config + ESLint 9 at Angular 20               |
| `cypress`                       | `7.6.0`   | Dead weight; will be **removed** in Prep 2.4 (no e2e tests exist) |
| `tailwindcss`                   | `3.3.2`   | Stay on v3 (see Risk §7.1)                         |
| `typescript`                    | `5.4.3`   | Bump with each Angular step                        |

Baseline must be green before we start: `yarn build && yarn test && yarn lint` all pass on `main`.

---

## 2. Prep PRs (before the migration series)

These land on Angular 17 first. All four are independent of each other and can run in parallel; each has its own self-contained brief in `docs/plans/prep/` so a subagent can pick one up without reading the rest of this doc. Merge order is blockers first (2.1, 2.2), then non-blockers (2.3, 2.4) — but the work can happen simultaneously, rebasing as each lands.

| # | PR | Status | Verdict from peer deps | Brief |
|---|----|--------|------------------------|-------|
| 2.1 | Sentry: drop `@sentry/tracing`, bump `@sentry/angular` to v8 | **Blocker** | `@sentry/angular@7.49` caps `@angular/core` at `<= 15.x` | [`prep/2.1-sentry-v8.md`](./prep/2.1-sentry-v8.md) |
| 2.2 | ng-zorro 15 → 17 | **Blocker** | `ng-zorro-antd@15` caps `@angular/core` at `^15.0.1` | [`prep/2.2-ng-zorro-17.md`](./prep/2.2-ng-zorro-17.md) |
| 2.3 | RxJS 6 → 7 | Non-blocker | No peer-dep conflict; EOL hygiene | [`prep/2.3-rxjs-7.md`](./prep/2.3-rxjs-7.md) |
| 2.4 | Cypress removal | Non-blocker | No peer-dep conflict; Cypress is dead weight (no e2e tests exist) | [`prep/2.4-cypress-remove.md`](./prep/2.4-cypress-remove.md) |

### Parallel execution model

- **Branches:** `prep/sentry-v8`, `prep/ng-zorro-17`, `prep/rxjs-7`, `prep/cypress-remove` — one per PR
- **Conflicts:** All four touch `package.json` and `yarn.lock`. First to merge is clean; each subsequent PR rebases onto `main` after the prior merges.
- **Isolation:** If a subagent is spawned for each PR, use `isolation: "worktree"` so each branch has its own working copy.
- **Coordination:** Merge order is **2.1 → 2.2 → 2.3 → 2.4**. Don't merge 2.2 before 2.1 unless Sentry's PR stalls — blockers land first so the Angular series can start.

The subsections below summarise the peer-dep evidence for each PR (blog-ready). For execution details — exact commands, file paths, validation — open the brief.

### 2.1 — Sentry consolidation (blocker)

Verified peer deps:

```bash
$ npm view @sentry/angular@7.49.0 peerDependencies
{
  rxjs: '^6.5.5 || ^7.x',
  '@angular/core': '>= 10.x <= 15.x',      # ← caps at Angular 15
  '@angular/common': '>= 10.x <= 15.x',
  '@angular/router': '>= 10.x <= 15.x'
}

$ npm view @sentry/tracing@6.8.0 peerDependencies
(none)

$ npm view @sentry/tracing@6.8.0 dependencies
{ tslib, '@sentry/hub': '6.8.0', '@sentry/types': '6.8.0',
  '@sentry/utils': '6.8.0', '@sentry/minimal': '6.8.0' }
```

**Blocker.** `@sentry/angular@7.49.0` explicitly caps Angular at 15.x. We are already on Angular 17 — yarn is silently tolerating the peer mismatch. Each Angular step widens the gap, and at some point a v7.49 internal will hit an Angular API that has moved.

Secondary problem: `@sentry/tracing@6.8.0` declares no peer deps, so nothing warned, but it pulls `@sentry/*@6.8.0` internals while `@sentry/angular@7.49` pulls `@sentry/*@7.49`. The bundle ships v6 and v7 of the Sentry core in parallel.

→ Execution details: [`prep/2.1-sentry-v8.md`](./prep/2.1-sentry-v8.md)

### 2.2 — ng-zorro 15 → 17 (blocker)

Verified peer deps:

```bash
$ npm view ng-zorro-antd@15.1.0 peerDependencies
{
  '@angular/core': '^15.0.1',              # ← caps at Angular 15
  '@angular/forms': '^15.0.1',
  '@angular/common': '^15.0.1',
  '@angular/router': '^15.0.1',
  '@angular/animations': '^15.0.1',
  '@angular/platform-browser': '^15.0.1'
}

$ npm view ng-zorro-antd@17 peerDependencies | tail
{ '@angular/core': '^17.0.0', ... }
```

**Hard blocker.** ng-zorro 15 pins every Angular package to `^15.0.1`. We're running Angular 17 today — yarn is swallowing the warning. Pushing Angular higher without bumping ng-zorro is a runtime accident waiting to happen (ng-zorro uses Angular internals that change between majors).

Why 17 and not straight to 18:
- Minimizes breaking-change volume in a single PR
- Each Angular step then moves ng-zorro one major at a time (17→18, 18→19, 19→20), much easier to review
- Matches the stepwise strategy we picked for Angular itself

→ Execution details: [`prep/2.2-ng-zorro-17.md`](./prep/2.2-ng-zorro-17.md)

### 2.3 — RxJS 6 → 7 (non-blocker)

Verified peer deps:

```bash
$ npm view rxjs@6.6.6 peerDependencies
(none)

$ npm view @angular/core@17.3.2 peerDependencies
{ rxjs: '^6.5.3 || ^7.4.0', 'zone.js': '~0.14.0' }

$ npm view @angular/core@20.3.19 peerDependencies
{ rxjs: '^6.5.3 || ^7.4.0', 'zone.js': '~0.15.0', '@angular/compiler': '20.3.19' }
```

**Not a peer-dep blocker.** Every Angular version from 17 through 20 accepts `rxjs@^6.5.3`. RxJS itself declares no peer deps.

Why we do it anyway:
- RxJS 6 has been EOL since 2022 — no security patches
- `.toPromise()` is deprecated; the v7 replacements are `firstValueFrom()` / `lastValueFrom()`
- Third-party Angular libs are starting to test only against RxJS 7
- Doing it isolated on Angular 17 means any regression is clearly an RxJS issue, not an Angular one

Repo recon note (2026-04-18): zero `.toPromise()` hits in `apps/` or `libs/`. This PR is effectively a version bump.

→ Execution details: [`prep/2.3-rxjs-7.md`](./prep/2.3-rxjs-7.md)

### 2.4 — Cypress removal (non-blocker)

Verified peer deps:

```bash
$ npm view cypress@7.6.0 peerDependencies
(none)
```

**Not a peer-dep blocker.** Cypress is a standalone binary with no Angular-related peer deps, so even at v7.6.0 it does not cap any Angular version.

**Repo recon (2026-04-18):**
- No `apps/*-e2e` folder exists
- No `cypress.config.{ts,js}` or `cypress.json` anywhere outside `node_modules/`
- No `*.cy.ts` / `*.cy.js` spec files in `apps/` or `libs/`
- References to `cypress` outside `node_modules/` exist only in `package.json`, `yarn.lock`, `nx.json`, and the migration plan itself

**Decision: remove, do not upgrade.** There is no e2e suite to preserve. Upgrading `cypress@7.6.0` to `cypress@^13` would only bump a dependency that nothing consumes, and the Cypress 7 → 13 API changes (`cy.intercept`, `cy.session`, config file format) would all be sunk cost. Instead we remove `cypress`, `@nx/cypress`, and `eslint-plugin-cypress` entirely, shrinking the dep tree and removing ~1GB of binary cache from CI. If the project ever needs e2e coverage again, a fresh Cypress 13+ (or Playwright) install on the then-current Angular is cleaner than upgrading through stale generations.

→ Execution details: [`prep/2.4-cypress-remove.md`](./prep/2.4-cypress-remove.md)

---

## 3. Step 1 — Angular 17 → 18

### Commands

```bash
git checkout -b upgrade/angular-18
yarn nx migrate 18.2.0
yarn install
yarn nx migrate --run-migrations
rm migrations.json
```

### Companion bumps (manual, after the migrate run)

```bash
yarn add @angular/{animations,common,compiler,core,forms,platform-browser,platform-browser-dynamic,router,service-worker}@^18.2
yarn add -D @angular/{cli,compiler-cli,language-service}@^18.2 @angular-devkit/{build-angular,core,schematics}@^18.2 @schematics/angular@^18.2
yarn add @ngrx/{store,effects,component,component-store,store-devtools}@^18
yarn add ng-zorro-antd@^18 @ant-design/icons-angular@^18
yarn add -D @angular-eslint/{eslint-plugin,eslint-plugin-template,template-parser}@^18
yarn add -D typescript@~5.5
```

### Manual fixes

- RxJS 7 fallout surfaced in Step 1 even if Prep 2.3 landed — sweep for leftover `toPromise()`
- `@ngneat/until-destroy` still fine on Angular 18; keep as-is
- Zone.js stays on `0.14.x`
- No `standalone: true` removal yet (that's Angular 19)
- Nx 18 runtime warnings: inspect `nx.json` `tasksRunnerOptions` — `canTrackAnalytics` / `showUsageWarnings` have moved

### Validation

1. `yarn build` passes
2. `yarn test` passes
3. `yarn lint` passes
4. `yarn start` → open `localhost:4200`
5. Smoke-test: login, browse, search, play a track, visualizer, lyrics overlay
6. `yarn build:prod` passes and output bundle size is within budgets

### Blog post 1

Title: `Upgrade angular-spotify from Angular 17 to Angular 18`
Focus: Nx-driven migration, RxJS 6 → 7 debt cleanup, ng-zorro catch-up if bundled here.

---

## 4. Step 2 — Angular 18 → 19

### Commands

```bash
git checkout -b upgrade/angular-19
yarn nx migrate 19.2.0
yarn install
yarn nx migrate --run-migrations
rm migrations.json
```

### Companion bumps

```bash
yarn add @angular/{animations,common,compiler,core,forms,platform-browser,platform-browser-dynamic,router,service-worker}@^19.2
yarn add -D @angular/{cli,compiler-cli,language-service}@^19.2 @angular-devkit/{build-angular,core,schematics}@^19.2 @schematics/angular@^19.2
yarn add @ngrx/{store,effects,component,component-store,store-devtools}@^19
yarn add ng-zorro-antd@^19 @ant-design/icons-angular@^19
yarn add -D @angular-eslint/{eslint-plugin,eslint-plugin-template,template-parser}@^19
yarn add -D typescript@~5.6
```

### Manual fixes

- **Standalone is the default in v19.** The Angular schematic adds `standalone: false` to every `@Component`/`@Directive`/`@Pipe` that still uses `NgModule`. Review and start deleting `standalone: true` from components that were already standalone.
- `provideExperimentalZonelessChangeDetection` is available — **do not** flip zoneless yet. Note it and defer.
- Check for deprecated `HttpClientModule` imports; switch to `provideHttpClient()` if any remain.
- NgRx 19 signal store is available — note it as a follow-up, do not migrate in this PR.

### Validation

Same checklist as Step 1, plus:
- Verify every formerly-standalone component still works (template rendering, host bindings)
- Verify all `NgModule`-based components now render with `standalone: false` tag

### Blog post 2

Title: `Upgrade angular-spotify from Angular 18 to Angular 19`
Focus: Standalone-by-default, `standalone: true` flag cleanup, HttpClient module → provider.

---

## 5. Step 3 — Angular 19 → 20

This is the big one. Three sub-migrations on top of the version bump.

### 5.1 Version bump

```bash
git checkout -b upgrade/angular-20
yarn nx migrate 20.3.0
yarn install
yarn nx migrate --run-migrations
rm migrations.json
```

Companion bumps:

```bash
yarn add @angular/{animations,common,compiler,core,forms,platform-browser,platform-browser-dynamic,router,service-worker}@^20.3
yarn add -D @angular/{cli,compiler-cli,language-service}@^20.3 @schematics/angular@^20.3
yarn add @angular/build@^20.3 # new package, replaces @angular-devkit/build-angular at build time
yarn add @ngrx/{store,effects,component,component-store,store-devtools}@^20
yarn add ng-zorro-antd@^20 @ant-design/icons-angular@^20
yarn add -D typescript@~5.8
yarn add zone.js@~0.15.1
```

### 5.2 Builder: browser → application (esbuild)

Edit `apps/angular-spotify/project.json`:
- `"executor": "@angular-devkit/build-angular:browser"` → `"@angular/build:application"`
- `"executor": "@angular-devkit/build-angular:dev-server"` → `"@angular/build:dev-server"`
- `"executor": "@angular-devkit/build-angular:extract-i18n"` → `"@angular/build:extract-i18n"`
- Drop `vendorChunk`, `buildOptimizer`, `namedChunks` (esbuild ignores / doesn't support these)
- `main` key renames to `browser`
- Output path: the new builder writes to `dist/apps/angular-spotify/browser/` (see §5.6)

### 5.3 Jest → Vitest

```bash
yarn remove jest jest-environment-jsdom jest-preset-angular ts-jest @types/jest @nx/jest
yarn add -D vitest @nx/vite @analogjs/vitest-angular jsdom @vitest/ui
```

- Replace every project's `jest.config.{js,ts}` with `vite.config.ts` using `@analogjs/vitest-angular`
- Update `project.json` test targets: `@nx/jest:jest` → `@nx/vite:test`
- Sweep spec files for spy API:
  - `jasmine.createSpy('x')` → `vi.fn()`
  - `spy.and.returnValue(x)` → `spy.mockReturnValue(x)`
  - `spy.and.callFake(fn)` → `spy.mockImplementation(fn)`
  - `spyOn(obj, 'method').and.callThrough()` → `vi.spyOn(obj, 'method')`
- Update `test-setup.ts`: imports change from `jest-preset-angular/setup-jest` to Vitest equivalent
- Update `tsconfig.spec.json` `types` array: `"jest"` → `"vitest/globals"`

### 5.4 ESLint 8 → 9 (flat config)

```bash
yarn add -D eslint@^9 @angular-eslint/{eslint-plugin,eslint-plugin-template,template-parser}@^20 @typescript-eslint/{eslint-plugin,parser}@^8
```

- Rename `.eslintrc.json` → `eslint.config.js` at the workspace root
- Convert every per-project `.eslintrc.json` to flat config (or collapse into root config and use `files` globs)
- Flat config is JS, not JSON: import plugins instead of listing strings
- Update `nx.json` `namedInputs.sharedGlobals` to reference `eslint.config.js` instead of `.eslintrc.json`
- Run: `yarn nx run-many -t lint` to sanity-check

### 5.5 Tailwind: stay on v3

Do **not** migrate to Tailwind v4. Part 7 on Jira Clone documented this — `@apply` in component SCSS needs `@reference` with correct relative paths in every file, and dev-server startup balloons. Bump to the latest v3 (`^3.4.17`) and move on.

### 5.6 Deploy output path

The `application` builder outputs to `dist/apps/angular-spotify/browser/` instead of `dist/apps/angular-spotify/`.

Update wherever the publish directory is configured:
- Netlify: `netlify.toml` or dashboard `publish` setting
- Any CI step that copies `dist/apps/angular-spotify/**` to a CDN
- Service worker: `ngswConfigPath` stays the same; the schematic updates the copy step

No build warning will fire if you forget this — the site just serves an empty directory.

### 5.7 Manual fixes (watch list)

- `@ngneat/until-destroy@^8` may not publish Angular 20 peer ranges; evaluate replacing call sites with `takeUntilDestroyed(destroyRef)` and dropping the dep
- NgRx 20 — `createSelector` signatures tightened, `provideStore` default changes; schematic handles most of it
- `ng-zorro-antd@^20` — check theme/token variables, `nz-select` custom templates (Part 7 hit a 60px height bug)
- Zoneless mode — available but keep zone.js; zoneless is its own migration
- SSR — not enabled today, do not enable in this step
- `@sentry/angular@^8` init API changed if Prep 2.1 was deferred

### 5.8 Validation

Full checklist + Netlify deploy preview opened and manually verified (blank-page risk).

### Blog post 3

Title: `Upgrade angular-spotify from Angular 19 to Angular 20`
Focus: esbuild, Vitest, flat config, output path gotcha, ng-zorro 20, `takeUntilDestroyed` story.

---

## 6. Reusable validation checklist (each step)

Run in order. Block the PR on any failure.

- [ ] `yarn install` clean (no peer warnings from our own packages; upstream warnings ok if expected)
- [ ] `yarn nx run-many -t build` passes
- [ ] `yarn nx run-many -t test` passes
- [ ] `yarn nx run-many -t lint` passes
- [ ] `yarn start` boots, no console errors on `localhost:4200`
- [ ] Smoke test: auth → home → browse → search → playlist detail → play a track
- [ ] Visualizer opens, animation renders
- [ ] Lyrics overlay toggles in main view and fullscreen
- [ ] `yarn build:prod` passes, bundle budgets not exceeded
- [ ] Deploy preview loads the actual app (not blank page)

---

## 7. Risk register

### 7.1 Tailwind v4
**Skip.** Jira Clone Part 7 proved `@apply` + Angular component styles is unworkable without per-file `@reference` and 3× dev-server startup. Stay on v3.

### 7.2 ng-zorro-antd (5-major-jump)
Highest risk single item. Mitigation: **Prep 2.2** lands 15 → 17 on Angular 17 before Step 1, so each Angular step only moves ng-zorro one major. If Prep 2.2 slips, allocate extra manual-fix budget for Step 1.

### 7.3 RxJS 6 lingering
If Prep 2.3 is skipped, Angular 18's migration schematic will flag RxJS incompatibilities mid-run. Do not skip Prep 2.3.

### 7.4 until-destroy
`@ngneat/until-destroy` may lag Angular 20 peer deps. Mitigation: replace with `takeUntilDestroyed` in Step 3 (Angular 16+ API).

### 7.5 Jest → Vitest friction
Vitest's DI test bed story for Angular is newer than Jest's. If `@analogjs/vitest-angular` blocks, fall back: stay on Jest 29, defer Vitest to a follow-up PR. Angular 20 does not force Vitest.

### 7.6 ESLint 9 flat config friction
Nx 20 ships flat-config support but some `@angular-eslint` rules require careful migration. Fall back: stay on `.eslintrc.json` compat mode (`ESLINT_USE_FLAT_CONFIG=false`) if blocked, defer to follow-up.

### 7.7 Blank-page deploy
Output path changes in Step 3. Caught only in browser, not by build. Mitigation: every deploy preview must be loaded, not trusted.

---

## 8. Non-goals

These are explicitly out of scope for this series:

- Zoneless change detection
- SSR / prerender
- NgRx signal store migration
- Cypress → Playwright
- Storybook (not installed here)

Each is its own project.

---

## 9. Rollback

Each step is one PR on its own branch. Rollback = revert the PR. Keep `migrations.json` out of the final commit (delete after `--run-migrations` succeeds) so there's no stale migration state if we revert.
