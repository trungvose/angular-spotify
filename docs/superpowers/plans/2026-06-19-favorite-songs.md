# Add / Remove Favorite Songs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let users save and remove tracks from their Spotify library via a heart toggle on playlist rows, album rows, the now-playing bar, and the Liked Songs page.

**Architecture:** A new global `SavedTracksStore` (NgRx ComponentStore, `providedIn: 'root'`) holds a `Record<trackId, boolean>` cache and is the single source of truth. List views batch-check visible track IDs against `GET /me/tracks/contains`; a reusable `as-like-button` reads per-track state and toggles optimistically, reverting and toasting on error.

**Tech Stack:** Angular 17, Nx monorepo, `@ngrx/component-store`, `@ngneat/svg-icon`, ng-zorro `NzMessageService`, Jest.

## Global Constraints

- Node 18 (`.nvmrc` pins `18`). Run commands with the repo's Node.
- All components use `ChangeDetectionStrategy.OnPush`.
- Component selector prefix `as`, kebab-case (element) / camelCase (attribute) — enforced by eslint.
- Spotify Web API base URL comes from `APP_CONFIG.baseURL` (`https://api.spotify.com/v1`); auth is added by the existing `authInterceptor` — never add tokens manually.
- Spotify save/remove/contains endpoints accept at most 50 IDs per request.
- Feedback policy: toggling is optimistic; success is silent; only failures show a toast and revert state.
- Do not commit directly to `main`; the executing skill works on a branch/worktree.
- Test commands use the per-lib Nx project (e.g. `npx nx test web-shared-data-access-spotify-api`).

---

### Task 1: Spotify API methods (save / remove / check)

**Files:**
- Modify: `libs/web/shared/data-access/spotify-api/src/lib/track-api.ts`
- Test (create): `libs/web/shared/data-access/spotify-api/src/lib/track-api.spec.ts`

**Interfaces:**
- Consumes: existing `APP_CONFIG` token (`{ baseURL: string }`), Angular `HttpClient`.
- Produces (relied on by Task 2):
  - `saveTracks(ids: string[]): Observable<void>` → `PUT {baseURL}/me/tracks?ids=a,b`
  - `removeTracks(ids: string[]): Observable<void>` → `DELETE {baseURL}/me/tracks?ids=a,b`
  - `checkSavedTracks(ids: string[]): Observable<boolean[]>` → `GET {baseURL}/me/tracks/contains?ids=a,b`

- [ ] **Step 1: Write the failing test**

Create `libs/web/shared/data-access/spotify-api/src/lib/track-api.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { APP_CONFIG } from '@angular-spotify/web/shared/app-config';
import { TrackApiService } from './track-api';

describe('TrackApiService - saved tracks', () => {
  let service: TrackApiService;
  let httpMock: HttpTestingController;
  const baseURL = 'https://api.spotify.com/v1';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        TrackApiService,
        { provide: APP_CONFIG, useValue: { baseURL } }
      ]
    });
    service = TestBed.inject(TrackApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('saveTracks issues PUT /me/tracks with ids param', () => {
    service.saveTracks(['a', 'b']).subscribe();
    const req = httpMock.expectOne(
      `${baseURL}/me/tracks?ids=a,b`
    );
    expect(req.request.method).toBe('PUT');
    req.flush(null);
  });

  it('removeTracks issues DELETE /me/tracks with ids param', () => {
    service.removeTracks(['a', 'b']).subscribe();
    const req = httpMock.expectOne(
      `${baseURL}/me/tracks?ids=a,b`
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('checkSavedTracks issues GET /me/tracks/contains and returns booleans', () => {
    let result: boolean[] | undefined;
    service.checkSavedTracks(['a', 'b']).subscribe((r) => (result = r));
    const req = httpMock.expectOne(
      `${baseURL}/me/tracks/contains?ids=a,b`
    );
    expect(req.request.method).toBe('GET');
    req.flush([true, false]);
    expect(result).toEqual([true, false]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test web-shared-data-access-spotify-api`
Expected: FAIL — `service.saveTracks is not a function`.

- [ ] **Step 3: Add the three methods**

In `libs/web/shared/data-access/spotify-api/src/lib/track-api.ts`, add these methods inside the `TrackApiService` class (after `getUserSavedTracks`). Add `HttpParams` to the existing `@angular/common/http` import if needed (the `params` object form below works without it):

```ts
  saveTracks(ids: string[]) {
    return this.http.put<void>(`${this.appConfig.baseURL}/me/tracks`, null, {
      params: { ids: ids.join(',') }
    });
  }

  removeTracks(ids: string[]) {
    return this.http.delete<void>(`${this.appConfig.baseURL}/me/tracks`, {
      params: { ids: ids.join(',') }
    });
  }

  checkSavedTracks(ids: string[]) {
    return this.http.get<boolean[]>(
      `${this.appConfig.baseURL}/me/tracks/contains`,
      {
        params: { ids: ids.join(',') }
      }
    );
  }
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx nx test web-shared-data-access-spotify-api`
Expected: PASS (3 new tests green).

- [ ] **Step 5: Commit**

```bash
git add libs/web/shared/data-access/spotify-api/src/lib/track-api.ts libs/web/shared/data-access/spotify-api/src/lib/track-api.spec.ts
git commit -m "feat(spotify-api): add save/remove/check saved track methods"
```

---

### Task 2: SavedTracksStore + NzMessage wiring

**Files:**
- Create: `libs/web/shared/data-access/store/src/lib/saved-tracks/saved-tracks.store.ts`
- Create: `libs/web/shared/data-access/store/src/lib/saved-tracks/index.ts`
- Modify: `libs/web/shared/data-access/store/src/index.ts`
- Modify: `apps/angular-spotify/src/app/app.module.ts`
- Test (create): `libs/web/shared/data-access/store/src/lib/saved-tracks/saved-tracks.store.spec.ts`

**Interfaces:**
- Consumes (from Task 1): `TrackApiService.saveTracks`, `.removeTracks`, `.checkSavedTracks`. Also `NzMessageService` from `ng-zorro-antd/message`.
- Produces (relied on by Tasks 3–7):
  - `savedMap$: Observable<Record<string, boolean>>`
  - `isSaved$(id: string): Observable<boolean>`
  - `markSaved(ids: string[]): void` (updater — sets each id `true`)
  - `checkSaved(ids: string[]): void` (effect — batch-fills unknown ids)
  - `toggleSave(payload: { id: string; currentlySaved: boolean }): void` (effect — optimistic toggle)

- [ ] **Step 1: Write the failing test**

Create `libs/web/shared/data-access/store/src/lib/saved-tracks/saved-tracks.store.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { take } from 'rxjs/operators';
import { TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SavedTracksStore } from './saved-tracks.store';

describe('SavedTracksStore', () => {
  let store: SavedTracksStore;
  let trackApi: {
    saveTracks: jest.Mock;
    removeTracks: jest.Mock;
    checkSavedTracks: jest.Mock;
  };
  let message: { error: jest.Mock };

  const currentSaved = (id: string): boolean | undefined => {
    let value: boolean | undefined;
    store.isSaved$(id).pipe(take(1)).subscribe((v) => (value = v));
    return value;
  };

  beforeEach(() => {
    trackApi = {
      saveTracks: jest.fn().mockReturnValue(of(undefined)),
      removeTracks: jest.fn().mockReturnValue(of(undefined)),
      checkSavedTracks: jest.fn().mockReturnValue(of([]))
    };
    message = { error: jest.fn() };
    TestBed.configureTestingModule({
      providers: [
        SavedTracksStore,
        { provide: TrackApiService, useValue: trackApi },
        { provide: NzMessageService, useValue: message }
      ]
    });
    store = TestBed.inject(SavedTracksStore);
  });

  it('checkSaved fills savedMap from the contains response', () => {
    trackApi.checkSavedTracks.mockReturnValue(of([true, false]));
    store.checkSaved(['a', 'b']);
    expect(trackApi.checkSavedTracks).toHaveBeenCalledWith(['a', 'b']);
    expect(currentSaved('a')).toBe(true);
    expect(currentSaved('b')).toBe(false);
  });

  it('checkSaved skips ids already known', () => {
    store.markSaved(['a']);
    store.checkSaved(['a']);
    expect(trackApi.checkSavedTracks).not.toHaveBeenCalled();
  });

  it('toggleSave optimistically saves and calls saveTracks', () => {
    store.toggleSave({ id: 'a', currentlySaved: false });
    expect(currentSaved('a')).toBe(true);
    expect(trackApi.saveTracks).toHaveBeenCalledWith(['a']);
  });

  it('toggleSave optimistically removes and calls removeTracks', () => {
    store.markSaved(['a']);
    store.toggleSave({ id: 'a', currentlySaved: true });
    expect(currentSaved('a')).toBe(false);
    expect(trackApi.removeTracks).toHaveBeenCalledWith(['a']);
  });

  it('toggleSave reverts and toasts on error', () => {
    trackApi.saveTracks.mockReturnValue(throwError(() => new Error('boom')));
    store.toggleSave({ id: 'a', currentlySaved: false });
    expect(currentSaved('a')).toBe(false);
    expect(message.error).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx nx test web-shared-data-access-store`
Expected: FAIL — cannot find module `./saved-tracks.store`.

- [ ] **Step 3: Implement the store**

Create `libs/web/shared/data-access/store/src/lib/saved-tracks/saved-tracks.store.ts`:

```ts
import { Injectable } from '@angular/core';
import { ComponentStore, tapResponse } from '@ngrx/component-store';
import { TrackApiService } from '@angular-spotify/web/shared/data-access/spotify-api';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Observable, from } from 'rxjs';
import { filter, map, mergeMap } from 'rxjs/operators';

interface SavedTracksState {
  savedMap: Record<string, boolean>;
}

const SAVE_BATCH_SIZE = 50;

@Injectable({ providedIn: 'root' })
export class SavedTracksStore extends ComponentStore<SavedTracksState> {
  readonly savedMap$ = this.select((s) => s.savedMap);

  isSaved$ = (id: string): Observable<boolean> =>
    this.select((s) => !!s.savedMap[id]);

  readonly markSaved = this.updater((state, ids: string[]) => {
    const updates: Record<string, boolean> = {};
    ids.forEach((id) => (updates[id] = true));
    return { savedMap: { ...state.savedMap, ...updates } };
  });

  readonly checkSaved = this.effect<string[]>((ids$) =>
    ids$.pipe(
      map((ids) => ids.filter((id) => !(id in this.get().savedMap))),
      filter((ids) => ids.length > 0),
      mergeMap((ids) => {
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += SAVE_BATCH_SIZE) {
          chunks.push(ids.slice(i, i + SAVE_BATCH_SIZE));
        }
        return from(chunks);
      }),
      mergeMap((chunk) =>
        this.trackApi.checkSavedTracks(chunk).pipe(
          tapResponse(
            (results) => {
              const updates: Record<string, boolean> = {};
              chunk.forEach((id, i) => (updates[id] = !!results[i]));
              this.patchState((s) => ({
                savedMap: { ...s.savedMap, ...updates }
              }));
            },
            () => {
              /* contains-check failures are silent */
            }
          )
        )
      )
    )
  );

  readonly toggleSave = this.effect<{ id: string; currentlySaved: boolean }>(
    (params$) =>
      params$.pipe(
        mergeMap(({ id, currentlySaved }) => {
          const nextSaved = !currentlySaved;
          this.patchState((s) => ({
            savedMap: { ...s.savedMap, [id]: nextSaved }
          }));
          const request$ = nextSaved
            ? this.trackApi.saveTracks([id])
            : this.trackApi.removeTracks([id]);
          return request$.pipe(
            tapResponse(
              () => {
                /* success is silent */
              },
              () => {
                this.patchState((s) => ({
                  savedMap: { ...s.savedMap, [id]: currentlySaved }
                }));
                this.message.error("Couldn't update Liked Songs");
              }
            )
          );
        })
      )
  );

  constructor(
    private trackApi: TrackApiService,
    private message: NzMessageService
  ) {
    super({ savedMap: {} });
  }
}
```

Create `libs/web/shared/data-access/store/src/lib/saved-tracks/index.ts`:

```ts
export * from './saved-tracks.store';
```

- [ ] **Step 4: Export from the store barrel**

In `libs/web/shared/data-access/store/src/index.ts`, add below the existing lines:

```ts
export * from './lib/saved-tracks';
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx nx test web-shared-data-access-store`
Expected: PASS (5 new tests green).

- [ ] **Step 6: Wire NzMessageModule into the app**

`NzMessageService` needs its module imported once at the app root (animations are already provided via `NoopAnimationsModule` in `WebShellModule`). In `apps/angular-spotify/src/app/app.module.ts`, add the import line and the module to `imports`:

```ts
import { NzMessageModule } from 'ng-zorro-antd/message';
```

Add `NzMessageModule` to the `imports` array (e.g. after `HttpClientModule`):

```ts
  imports: [
    BrowserModule,
    HttpClientModule,
    NzMessageModule,
    WebShellModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production,
      registrationStrategy: 'registerWhenStable:30000'
    })
  ],
```

- [ ] **Step 7: Verify the app still builds**

Run: `npx nx build angular-spotify`
Expected: build succeeds (no compile errors from the new import).

- [ ] **Step 8: Commit**

```bash
git add libs/web/shared/data-access/store/src apps/angular-spotify/src/app/app.module.ts
git commit -m "feat(store): add SavedTracksStore with optimistic toggle and toast"
```

---

### Task 3: Reusable `as-like-button` component (new lib)

**Files:**
- Create lib `libs/web/shared/ui/like-button/` with:
  - `project.json`, `tsconfig.json`, `tsconfig.lib.json`, `tsconfig.spec.json`, `jest.config.ts`, `.eslintrc.json`, `README.md`, `src/index.ts`, `src/test-setup.ts`
  - `src/lib/like-button.component.ts`, `.html`, `.scss`, `.spec.ts`
  - `src/lib/like-button.module.ts`
- Modify: `tsconfig.base.json` (add path mapping)

**Interfaces:**
- Consumes (from Task 2): `SavedTracksStore.isSaved$(id)`, `.toggleSave(...)`.
- Produces (relied on by Tasks 4–7): element `<as-like-button [trackId]="..."></as-like-button>` exported by `LikeButtonModule` from `@angular-spotify/web/shared/ui/like-button`.

- [ ] **Step 1: Scaffold the lib files**

Create `libs/web/shared/ui/like-button/project.json`:

```json
{
  "name": "web-shared-ui-like-button",
  "$schema": "../../../../../node_modules/nx/schemas/project-schema.json",
  "projectType": "library",
  "sourceRoot": "libs/web/shared/ui/like-button/src",
  "prefix": "as",
  "targets": {
    "lint": {
      "executor": "@nx/eslint:lint"
    },
    "test": {
      "executor": "@nx/jest:jest",
      "outputs": ["{workspaceRoot}/coverage/libs/web/shared/ui/like-button"],
      "options": {
        "jestConfig": "libs/web/shared/ui/like-button/jest.config.ts"
      }
    }
  },
  "tags": ["type:ui", "scope:web"]
}
```

Create `libs/web/shared/ui/like-button/tsconfig.json`:

```json
{
  "extends": "../../../../../tsconfig.base.json",
  "files": [],
  "include": [],
  "references": [
    {
      "path": "./tsconfig.lib.json"
    },
    {
      "path": "./tsconfig.spec.json"
    }
  ],
  "compilerOptions": {
    "forceConsistentCasingInFileNames": true,
    "strict": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "target": "es2020"
  },
  "angularCompilerOptions": {
    "strictInjectionParameters": true,
    "strictTemplates": true
  }
}
```

Create `libs/web/shared/ui/like-button/tsconfig.lib.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../../dist/out-tsc",
    "target": "es2015",
    "declaration": true,
    "declarationMap": true,
    "inlineSources": true,
    "lib": ["dom", "es2018"]
  },
  "angularCompilerOptions": {
    "skipTemplateCodegen": true,
    "strictMetadataEmit": true,
    "enableResourceInlining": true
  },
  "exclude": ["**/*.spec.ts", "**/*.test.ts"],
  "include": ["**/*.ts"]
}
```

Create `libs/web/shared/ui/like-button/tsconfig.spec.json`:

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "outDir": "../../../../../dist/out-tsc",
    "module": "commonjs",
    "types": ["jest", "node"]
  },
  "files": ["src/test-setup.ts"],
  "include": ["**/*.spec.ts", "**/*.test.ts", "**/*.d.ts", "jest.config.ts"]
}
```

Create `libs/web/shared/ui/like-button/jest.config.ts`:

```ts
/* eslint-disable */
export default {
  displayName: 'web-shared-ui-like-button',
  preset: '../../../../../jest.preset.js',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  globals: {
    'ts-jest': {
      stringifyContentPathRegex: '\\.(html|svg)$',
      tsconfig: '<rootDir>/tsconfig.spec.json'
    }
  },
  coverageDirectory: '../../../../../coverage/libs/web/shared/ui/like-button',
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment'
  ],
  transform: {
    '^.+.(ts|mjs|js|html)$': 'jest-preset-angular'
  },
  transformIgnorePatterns: ['node_modules/(?!.*.mjs$)']
};
```

Create `libs/web/shared/ui/like-button/.eslintrc.json`:

```json
{
  "extends": ["../../../../../.eslintrc.json"],
  "ignorePatterns": ["!**/*"],
  "overrides": [
    {
      "files": ["*.ts"],
      "extends": ["plugin:@nx/angular", "plugin:@angular-eslint/template/process-inline-templates"],
      "rules": {
        "@angular-eslint/directive-selector": [
          "error",
          {
            "type": "attribute",
            "prefix": "as",
            "style": "camelCase"
          }
        ],
        "@angular-eslint/component-selector": [
          "error",
          {
            "type": "element",
            "prefix": "as",
            "style": "kebab-case"
          }
        ]
      }
    },
    {
      "files": ["*.html"],
      "extends": ["plugin:@nx/angular-template"],
      "rules": {}
    }
  ]
}
```

Create `libs/web/shared/ui/like-button/README.md`:

```md
# web-shared-ui-like-button

Reusable heart toggle to save/remove a track from the user's Liked Songs.
```

Create `libs/web/shared/ui/like-button/src/test-setup.ts`:

```ts
import 'jest-preset-angular/setup-jest';
```

Create `libs/web/shared/ui/like-button/src/index.ts`:

```ts
export * from './lib/like-button.module';
export * from './lib/like-button.component';
```

- [ ] **Step 2: Add the path mapping**

In `tsconfig.base.json`, inside `compilerOptions.paths`, add (keep alphabetical-ish near the other `shared/ui` entries):

```json
      "@angular-spotify/web/shared/ui/like-button": [
        "libs/web/shared/ui/like-button/src/index.ts"
      ],
```

- [ ] **Step 3: Write the failing test**

Create `libs/web/shared/ui/like-button/src/lib/like-button.component.spec.ts`:

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';
import { LikeButtonComponent } from './like-button.component';
import { LikeButtonModule } from './like-button.module';

describe('LikeButtonComponent', () => {
  let fixture: ComponentFixture<LikeButtonComponent>;
  let component: LikeButtonComponent;
  let saved$: BehaviorSubject<boolean>;
  let store: { isSaved$: jest.Mock; toggleSave: jest.Mock };

  beforeEach(async () => {
    saved$ = new BehaviorSubject<boolean>(false);
    store = {
      isSaved$: jest.fn().mockReturnValue(saved$),
      toggleSave: jest.fn()
    };
    await TestBed.configureTestingModule({
      imports: [LikeButtonModule],
      providers: [{ provide: SavedTracksStore, useValue: store }]
    }).compileComponents();

    fixture = TestBed.createComponent(LikeButtonComponent);
    component = fixture.componentInstance;
    component.trackId = 'track-1';
    fixture.detectChanges();
  });

  it('renders the outline heart when not saved', () => {
    const icon = fixture.nativeElement.querySelector('svg-icon');
    expect(icon.getAttribute('ng-reflect-key')).toBe('heart');
  });

  it('renders the filled heart when saved', () => {
    saved$.next(true);
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('svg-icon');
    expect(icon.getAttribute('ng-reflect-key')).toBe('heart-fill');
  });

  it('toggles and stops propagation on click', () => {
    const event = { stopPropagation: jest.fn() } as unknown as MouseEvent;
    component.toggle(event, false);
    expect(event.stopPropagation).toHaveBeenCalled();
    expect(store.toggleSave).toHaveBeenCalledWith({
      id: 'track-1',
      currentlySaved: false
    });
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx nx test web-shared-ui-like-button`
Expected: FAIL — cannot find `./like-button.component`.

- [ ] **Step 5: Implement the component**

Create `libs/web/shared/ui/like-button/src/lib/like-button.component.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges
} from '@angular/core';
import { Observable } from 'rxjs';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';

@Component({
  selector: 'as-like-button',
  templateUrl: './like-button.component.html',
  styleUrls: ['./like-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LikeButtonComponent implements OnChanges {
  @Input() trackId!: string;

  isSaved$!: Observable<boolean>;

  constructor(private savedTracksStore: SavedTracksStore) {}

  ngOnChanges(): void {
    this.isSaved$ = this.savedTracksStore.isSaved$(this.trackId);
  }

  toggle(event: MouseEvent, currentlySaved: boolean): void {
    event.stopPropagation();
    this.savedTracksStore.toggleSave({ id: this.trackId, currentlySaved });
  }
}
```

Create `libs/web/shared/ui/like-button/src/lib/like-button.component.html`:

```html
<ng-container *ngrxLet="isSaved$ as isSaved">
  <button
    type="button"
    class="like-button"
    [class.is-saved]="isSaved"
    [title]="isSaved ? 'Remove from your Liked Songs' : 'Save to your Liked Songs'"
    (click)="toggle($event, isSaved)"
  >
    <svg-icon [key]="isSaved ? 'heart-fill' : 'heart'"></svg-icon>
  </button>
</ng-container>
```

Create `libs/web/shared/ui/like-button/src/lib/like-button.component.scss`:

```scss
.like-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 0;
  padding: 0;
  cursor: pointer;
  color: var(--text-subdued, #a7a7a7);
  opacity: 0.7;
  transition: opacity 0.15s ease, color 0.15s ease;

  &:hover {
    opacity: 1;
    color: #fff;
  }

  &.is-saved {
    opacity: 1;
    color: #1db954;
  }
}
```

Create `libs/web/shared/ui/like-button/src/lib/like-button.module.ts`:

```ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SvgIconComponent } from '@ngneat/svg-icon';
import { LetDirective } from '@ngrx/component';
import { LikeButtonComponent } from './like-button.component';

@NgModule({
  imports: [CommonModule, SvgIconComponent, LetDirective],
  declarations: [LikeButtonComponent],
  exports: [LikeButtonComponent]
})
export class LikeButtonModule {}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx nx test web-shared-ui-like-button`
Expected: PASS (3 tests green). If the `ng-reflect-key` attribute assertions are flaky under the test renderer, assert on `component`-level state instead, but try the attribute form first.

- [ ] **Step 7: Commit**

```bash
git add libs/web/shared/ui/like-button tsconfig.base.json
git commit -m "feat(like-button): reusable heart toggle component"
```

---

### Task 4: Integrate into playlist track rows

**Files:**
- Modify: `libs/web/playlist/ui/playlist-track/src/lib/playlist-track.component.html`
- Modify: `libs/web/playlist/ui/playlist-track/src/lib/playlist-track.module.ts`
- Modify: `libs/web/playlist/feature/detail/src/lib/playlist.component.ts`

**Interfaces:**
- Consumes: `LikeButtonModule` (Task 3), `SavedTracksStore.checkSaved` (Task 2).
- The like button reads its own state from the root store; the parent only needs to fire `checkSaved` for visible IDs.

- [ ] **Step 1: Add LikeButtonModule to the playlist-track module**

In `libs/web/playlist/ui/playlist-track/src/lib/playlist-track.module.ts`, add the import and include it in `imports`:

```ts
import { LikeButtonModule } from '@angular-spotify/web/shared/ui/like-button';
```

Add `LikeButtonModule` to the module's `imports` array.

- [ ] **Step 2: Add the heart button to the row template**

In `libs/web/playlist/ui/playlist-track/src/lib/playlist-track.component.html`, replace the final duration cell:

```html
    <div class="text-description">
      {{ item.track.duration_ms | duration }}
    </div>
```

with a flex cell that holds the like button next to the duration:

```html
    <div class="text-description flex items-center justify-end gap-4">
      <as-like-button [trackId]="item.track.id"></as-like-button>
      <span>{{ item.track.duration_ms | duration }}</span>
    </div>
```

- [ ] **Step 3: Batch-check saved state when the playlist's tracks load**

Rewrite `libs/web/playlist/feature/detail/src/lib/playlist.component.ts` to fire `checkSaved` whenever `tracks$` emits. Full file:

```ts
import { PlaylistStore } from '@angular-spotify/web/playlist/data-access';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';
import { RouteUtil } from '@angular-spotify/web/shared/utils';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs/operators';

@Component({
  selector: 'as-playlist',
  templateUrl: './playlist.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  providers: [PlaylistStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PlaylistComponent implements OnInit {
  playlistId$ = this.store.playlistId$;
  playlist$ = this.store.playlist$;
  isPlaylistPlaying$ = this.store.isPlaylistPlaying$;
  isCurrentPlaylistLoading$ = this.store.isCurrentPlaylistLoading$;
  tracks$ = this.store.tracks$;
  isPlaylistTracksLoading$ = this.store.isPlaylistTracksLoading$;
  tracksHasMore$ = this.store.tracksHasMore$;

  constructor(
    private store: PlaylistStore,
    private savedTracksStore: SavedTracksStore,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.tracks$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tracks) => {
        const ids = (tracks ?? [])
          .map((item) => item.track?.id)
          .filter((id): id is string => !!id);
        if (ids.length) {
          this.savedTracksStore.checkSaved(ids);
        }
      });
  }

  togglePlaylist(isPlaying: boolean) {
    this.store.togglePlaylist({
      isPlaying
    });
  }

  playTrack(position: number) {
    this.store.playTrack({
      position
    });
  }

  loadMoreTracks() {
    this.store.playlistId$.pipe(take(1)).subscribe((playlistId: string) => {
      if (playlistId) {
        this.store.loadMoreTracks(playlistId);
      }
    });
  }

  getPlaylistContextUri(playlistId: string | null) {
    return RouteUtil.getPlaylistContextUri(playlistId || '');
  }
}
```

- [ ] **Step 4: Verify build and run the affected tests**

Run: `npx nx build angular-spotify`
Expected: build succeeds.
Run: `npx nx test web-playlist-ui-playlist-track`
Expected: existing tests still PASS (component declares the new element via `LikeButtonModule`).

- [ ] **Step 5: Commit**

```bash
git add libs/web/playlist
git commit -m "feat(playlist): show like toggle on playlist tracks"
```

---

### Task 5: Integrate into album track rows

**Files:**
- Modify: `libs/web/album/ui/album-track/src/lib/album-track.component.html`
- Modify: `libs/web/album/ui/album-track/src/lib/album-track.module.ts`
- Modify: `libs/web/album/feature/detail/src/lib/album.component.ts`

**Interfaces:**
- Consumes: `LikeButtonModule` (Task 3), `SavedTracksStore.checkSaved` (Task 2).

- [ ] **Step 1: Add LikeButtonModule to the album-track module**

In `libs/web/album/ui/album-track/src/lib/album-track.module.ts`, add:

```ts
import { LikeButtonModule } from '@angular-spotify/web/shared/ui/like-button';
```

Add `LikeButtonModule` to the `imports` array.

- [ ] **Step 2: Add the heart button to the album row template**

In `libs/web/album/ui/album-track/src/lib/album-track.component.html`, replace the final duration cell:

```html
  <div class="text-description">
    {{ track.duration_ms | duration }}
  </div>
```

with:

```html
  <div class="text-description flex items-center justify-end gap-4">
    <as-like-button [trackId]="track.id"></as-like-button>
    <span>{{ track.duration_ms | duration }}</span>
  </div>
```

- [ ] **Step 3: Batch-check saved state when the album loads**

Rewrite `libs/web/album/feature/detail/src/lib/album.component.ts`. Full file:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AlbumStore } from '@angular-spotify/web/album/data-access';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';

@Component({
  selector: 'as-album',
  templateUrl: './album.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `
  ],
  providers: [AlbumStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AlbumComponent implements OnInit {
  album$ = this.store.album$;
  isAlbumLoading$ = this.store.isCurrentAlbumLoading$;
  isAlbumPlaying$ = this.store.isAlbumPlaying$;

  constructor(
    private store: AlbumStore,
    private savedTracksStore: SavedTracksStore,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.album$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((album) => {
      const ids = (album?.tracks?.items ?? [])
        .map((track) => track.id)
        .filter((id): id is string => !!id);
      if (ids.length) {
        this.savedTracksStore.checkSaved(ids);
      }
    });
  }

  toggleAlbum(isPlaying: boolean, uri: string) {
    this.store.toggleAlbum({
      isPlaying,
      uri
    });
  }
}
```

- [ ] **Step 4: Verify build**

Run: `npx nx build angular-spotify`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add libs/web/album
git commit -m "feat(album): show like toggle on album tracks"
```

---

### Task 6: Integrate into the now-playing bar

**Files:**
- Modify: `libs/web/shell/ui/now-playing-bar/src/lib/now-playing-bar.component.ts`
- Modify: `libs/web/shell/ui/now-playing-bar/src/lib/now-playing-bar.component.html`
- Modify: `libs/web/shell/ui/now-playing-bar/src/lib/now-playing-bar.module.ts`

**Interfaces:**
- Consumes: `LikeButtonModule` (Task 3), `SavedTracksStore.checkSaved` (Task 2), existing `PlaybackStore.currentTrack$` (emits `SpotifyTrackExtended | null`, which has `id`).

- [ ] **Step 1: Add LikeButtonModule to the now-playing-bar module**

In `libs/web/shell/ui/now-playing-bar/src/lib/now-playing-bar.module.ts`, add:

```ts
import { LikeButtonModule } from '@angular-spotify/web/shared/ui/like-button';
```

Add `LikeButtonModule` to the `imports` array.

- [ ] **Step 2: Check saved state for the current track**

Rewrite `libs/web/shell/ui/now-playing-bar/src/lib/now-playing-bar.component.ts`. Full file:

```ts
import { PlaybackStore } from '@angular-spotify/web/shared/data-access/store';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'as-now-playing-bar',
  templateUrl: './now-playing-bar.component.html',
  styleUrls: ['./now-playing-bar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NowPlayingBarComponent implements OnInit {
  currentTrack$ = this.playbackStore.currentTrack$;

  constructor(
    private playbackStore: PlaybackStore,
    private savedTracksStore: SavedTracksStore,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit(): void {
    this.currentTrack$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((track) => {
        if (track?.id) {
          this.savedTracksStore.checkSaved([track.id]);
        }
      });
  }
}
```

(`SavedTracksStore` and `PlaybackStore` both live in `@angular-spotify/web/shared/data-access/store`; the two import lines may be merged into one.)

- [ ] **Step 3: Add the like button next to the current track info**

In `libs/web/shell/ui/now-playing-bar/src/lib/now-playing-bar.component.html`, update the left section:

```html
  <div class="now-playing-bar-left">
    @if (currentTrack$ | async; as currentTrack) {
      <as-track-current-info
        [track]="currentTrack">
      </as-track-current-info>
      <as-like-button [trackId]="currentTrack.id"></as-like-button>
    }
  </div>
```

- [ ] **Step 4: Verify build**

Run: `npx nx build angular-spotify`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add libs/web/shell/ui/now-playing-bar
git commit -m "feat(now-playing-bar): show like toggle for the current track"
```

---

### Task 7: Liked Songs page — seed state and remove un-liked rows

**Files:**
- Modify: `libs/web/tracks/feature/src/lib/tracks.component.ts`
- Modify: `libs/web/tracks/feature/src/lib/tracks.component.html`

**Interfaces:**
- Consumes: `SavedTracksStore.markSaved` and `.savedMap$` (Task 2). The Liked Songs page reuses `as-playlist-track`, which already renders the like button after Task 4 — no template change to the row itself.
- Behavior: every listed track is seeded `saved=true` (filled heart). Un-liking flips `savedMap[id]` to `false` via the shared store; the page filters those out so the row disappears, and a failed API call (handled in the store) flips it back to `true`, restoring the row.

- [ ] **Step 1: Seed saved state and derive the displayed list**

Rewrite `libs/web/tracks/feature/src/lib/tracks.component.ts`. Full file:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { TracksStore } from '@angular-spotify/web/tracks/data-access';
import { SavedTracksStore } from '@angular-spotify/web/shared/data-access/store';

@Component({
  selector: 'as-tracks',
  templateUrl: './tracks.component.html',
  styleUrls: ['./tracks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TracksStore]
})
export class TracksComponent implements OnInit {
  vm$ = this.store.vm$;

  displayedTracks$ = combineLatest([
    this.store.vm$,
    this.savedTracksStore.savedMap$
  ]).pipe(
    map(([vm, savedMap]) =>
      (vm.data ?? []).filter(
        (item) => item.track && savedMap[item.track.id] !== false
      )
    )
  );

  constructor(
    private store: TracksStore,
    private savedTracksStore: SavedTracksStore,
    private destroyRef: DestroyRef
  ) {}

  ngOnInit() {
    this.store.loadTracks();
    this.store.vm$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((vm) => {
        const ids = (vm.data ?? [])
          .map((item) => item.track?.id)
          .filter((id): id is string => !!id);
        if (ids.length) {
          this.savedTracksStore.markSaved(ids);
        }
      });
  }

  playTrack(track: SpotifyApi.TrackObjectFull) {
    this.store.playTrack({ track });
  }

  loadMore() {
    this.store.loadMore();
  }
}
```

- [ ] **Step 2: Render the filtered list**

In `libs/web/tracks/feature/src/lib/tracks.component.html`, change the `@for` to iterate over `displayedTracks$` instead of `vm.data`:

```html
    <div class="mb-8">
      @for (item of (displayedTracks$ | async); track item; let idx = $index) {
        @if (item.track) {
          <as-playlist-track
            type="LIKE_SONGS"
            [item]="$any(item)"
            [index]="idx"
            [contextUri]="item.track.album.uri"
            (dblclick)="playTrack(item.track)"
            >
          </as-playlist-track>
        }
      }
    </div>
```

- [ ] **Step 3: Verify build**

Run: `npx nx build angular-spotify`
Expected: build succeeds.

- [ ] **Step 4: Manual verification**

Run the app (`npx nx serve angular-spotify`), log in, and verify:
- Liked Songs page shows filled hearts; clicking one removes the row.
- A playlist/album shows filled hearts only on already-saved tracks; clicking toggles instantly.
- The now-playing bar reflects the current track's saved state and toggles it.
- Toggling the same track in two places stays in sync.

- [ ] **Step 5: Commit**

```bash
git add libs/web/tracks/feature
git commit -m "feat(tracks): seed liked state and drop un-liked rows on Liked Songs"
```

---

## Notes / Out of scope (YAGNI)

- No bulk multi-select save/remove.
- No saving of albums or playlists (tracks only).
- No real-time sync with other Spotify clients.
- `loadMore` pagination on playlists/Liked Songs re-fires `checkSaved`/`markSaved` because the parent subscribes to the tracks stream — already covered, no extra work.
