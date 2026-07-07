---
description: "Task list for JobIT Web App implementation"
---

# Tasks: JobIT Web App — AI Career & Labour-Market Assistant

**Input**: Design documents from `specs/001-jobit-web-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Only the two constitution-mandated unit modules are tested (SSE parser, ApiError→UX
mapper). Broader component tests are out of scope for v1 unless noted.

**Organization**: Grouped by user story (priority order) so each is independently deliverable.
US1 and US2 are both P1 (auth + streaming chat form the MVP together).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1–US7 per spec.md
- File paths are relative to the repository root (single Vite SPA)

## Path Conventions

Single project at repo root: `src/`, `public/`, `tests/` (or co-located `*.test.ts`).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold the Vite SPA and reproduce the Stitch design system as a real build.

- [x] T001 Create `package.json` at repo root with scripts (`dev`,`build`,`preview`,`test`,`lint`) and dependencies: react, react-dom, react-router-dom, @supabase/supabase-js, @tanstack/react-query, react-plotly.js, plotly.js-dist-min; devDeps: vite, @vitejs/plugin-react, typescript, tailwindcss, postcss, autoprefixer, vitest, @types/react, @types/react-dom
- [x] T002 [P] Create `vite.config.ts` (react plugin, `@` alias) and strict `tsconfig.json` (`strict: true`) — consolidated to a single typecheck (`tsc --noEmit`), no separate node project reference
- [x] T003 [P] Create `index.html` at repo root with `#root`, Geist + Material Symbols `<link>` tags, and `<title>`
- [x] T004 [P] Create `tailwind.config.ts` porting the Stitch tokens (colors incl. primary `#005c86`, secondary-container `#62fae3`, surface `#f9f9f7`; borderRadius, spacing, fontSize, Geist fontFamily) and `postcss.config.js`
- [x] T005 [P] Create `src/styles/index.css` with Tailwind directives, base body (surface bg, Geist), and Material Symbols helper class
- [x] T006 [P] Create `.env.example` with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`
- [x] T007 [P] Create `public/_redirects` containing `/* /index.html 200`
- [x] T008 [P] Configure Vitest in `vite.config.ts` (jsdom env) for unit tests

**Checkpoint**: ✅ `npm install` succeeds; `npm run build` passes `tsc --noEmit` + `vite build` (Stitch tokens compiled, `dist/` output). Placeholder `src/main.tsx`+`App.tsx` boot the app (replaced by router in T022).

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-cutting primitives every user story imports. ⚠️ No story work begins until done.

- [x] T009 [P] Define API + SSE + local-state TypeScript types in `src/types/api.ts` per data-model.md (UserOut, ChatSessionSummary, ChatSessionDetail, Message, Chart, UserProfile, UploadResponse, SessionResponse, MessageRequest, ApiErrorCode, ApiErrorBody, SseEvent, RawSseFrame)
- [x] T010 [P] Implement the Supabase browser client in `src/lib/supabase.ts` (single instance; `persistSession: true`, `autoRefreshToken: true`; reads `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`)
- [x] T011 [P] Implement `ApiError` construction + the `toUx()` mapper in `src/lib/apiError.ts` (map every code → banner | toast-transient | toast-retryable | redirect-login | inline | not-found; each carries `request_id`; exhaustiveness guard)
- [x] T012 [P] [Test] Unit-test the mapper in `tests/apiError.test.ts` — every ApiErrorCode → expected UX directive, preserves `request_id`/message (11 tests)
- [x] T013 [P] Implement the isolated SSE parser `parseSSE(stream)` in `src/lib/sse.ts` (TextDecoder, CRLF-normalize, buffer, split on `"\n\n"`, parse `event:`/multi-line `data:`, ignore comments/keep-alives; async generator of `{event,data}`)
- [x] T014 [P] [Test] Unit-test `parseSSE` in `tests/sse.test.ts` — chunk-boundary splits, multi-line `data:`, multiple frames per chunk, trailing partial buffer, CRLF, all five event types (8 tests)
- [x] T015 Implement the fetch wrapper in `src/lib/apiClient.ts` (await `supabase.auth.getSession()` → fresh `Authorization: Bearer` per call; `X-Request-ID` uuid; parse JSON; throw typed `ApiError` with `httpStatus`; decoupled `setApiErrorHandlers` for forbidden/resources_exhausted; separate `streamRequest()` returning raw `Response`)
- [x] T016 [P] Define query keys in `src/lib/queryKeys.ts` (`['me']`, `['chats']`, `['chat', id]`)
- [x] T017 [P] Implement `src/i18n/DirectionProvider.tsx` (ltr/rtl context, sets `<html dir>`+`lang`, persists to localStorage)
- [x] T018 [P] Implement toast infra in `src/components/ToastProvider.tsx` (transient auto-dismiss + retryable-with-retry variants, shows `request_id`; RTL-safe viewport)
- [x] T019 [P] Implement out-of-credits banner context in `src/components/Banner.tsx` (`CreditsBannerProvider`; persistent banner; `markOutOfCredits`/`clearOutOfCredits`, `isOutOfCredits` used to block sending)
- [x] T020 Implement `src/auth/AuthProvider.tsx` (seed from `getSession()`, subscribe to `onAuthStateChange`, expose session/user/loading + `signInWithPassword` + `signOut` via `useAuth`)
- [x] T021 Implement route guards in `src/auth/guards.tsx` (`RequireAuth` → redirect `/login`; `RedirectIfAuthed` → redirect `/app`; loading spinner while session resolves)
- [x] T022 Wire providers + router in `src/main.tsx` (QueryClientProvider, refetchOnWindowFocus) and `src/App.tsx` (AuthProvider, DirectionProvider, ToastProvider, CreditsBannerProvider; ApiErrorBridge; routes `/`, `/login`, `/app`, `/app/c/:sessionId`, `*`→`/`) with placeholder pages
- [x] T023 Implement `src/components/AppShell.tsx` (sidebar + main layout, RTL-aware logical props) and shared `src/components/ui/Button.tsx` (Button + IconButton using Material Symbols)

**Checkpoint**: ✅ App boots with all providers + routing; `npm run test` passes both unit suites (19 tests); `npm run build` green. Browser-verified via Chrome DevTools: landing renders for anonymous, `RequireAuth` redirects `/app`→`/login`, zero console errors. Placeholder Login/Landing/Workspace pages in place (filled in US1/US2/US3/US7).

---

## Phase 3: User Story 1 - Sign in as an authorized user (Priority: P1) 🎯 MVP

**Goal**: An authorized user signs in and lands in the workspace; signup is clearly restricted.

**Independent Test**: Valid account → reaches `/app` with identity shown; bad credentials → clear error; deactivated account (403 after login) → distinct message; screen states signup is restricted.

- [x] T024 [P] [US1] Implement `src/api/me.ts` — `getMe()` + `useMe()` query hook (`['me']`) via apiClient
- [x] T025 [US1] Build the Login page `src/pages/Login.tsx` matching the "Authorized Access Only" reference (email/password, password visibility toggle, disabled Sign Up with the restricted-access notice, loading state) using `signInWithPassword`
- [x] T026 [US1] Handle login outcomes: Supabase auth error → inline "invalid credentials"; on success probe `getMe()` and treat a `403 forbidden` as "account deactivated — contact administrator"; redirect to `/app` on success (out-of-credits/transient → enter app anyway)
- [x] T027 [US1] `RedirectIfAuthed` on `/login` + `RequireAuth` on `/app` (from T022); `signOut` routes to `/login`; expiry/403 routed via `ApiErrorBridge`
- [x] T028 [US1] Render the signed-in user's email in the sidebar identity area of the workspace (credits added in US5)

**Checkpoint**: ✅ Auth flow works end to end against the real backend — invalid credentials → inline error (Supabase token 400); valid login → token 200 + `/api/v1/me` 200 (via dev proxy) → `/app` with `test@jobit.dev` shown; sign out → `/login`; zero console errors. Added a Vite dev proxy for `/api/*` to bypass local CORS (backend doesn't allow the localhost origin).

---

## Phase 4: User Story 2 - Ask a question and watch a charted answer stream in (Priority: P1) 🎯 MVP

**Goal**: In a session, send a question and see the reply stream live, with tool status and inline charts. Deferred session creation on first send.

**Independent Test**: In a new chat, send a question → text streams incrementally, a "using {tool}…" indicator appears/clears, any chart renders inline, the turn finalizes. Mid-stream error is shown without losing partial text.

- [x] T029 [P] [US2] Implement `src/features/chat/PlotlyChart.tsx` (+ `PlotlyChartImpl.tsx`) — parse `{plotly_json,rtl}`, render via react-plotly.js factory bound to plotly.js-dist-min; `rtl` flows via container `dir`; lazy-loaded so Plotly stays out of the main bundle (single path for live + stored charts)
- [x] T030 [P] [US2] Implement `src/features/chat/ToolStatus.tsx` (transient "using {tool}…" indicator)
- [x] T031 [P] [US2] Implement `src/features/chat/MessageBubble.tsx` (user vs assistant styling per Stitch, RTL-aware; renders content + `charts` via PlotlyChart)
- [x] T032 [US2] Implement `src/api/sessions.ts` — `createSession()` (`POST /chat/new`), `streamMessage()` via `apiClient.streamRequest()`, plus `listChats`/`getChat`/`deleteChat` + `useChats`/`useChat` hooks
- [x] T033 [US2] Implement `src/features/chat/useChatStream.ts` — turn state machine: deferred create, open stream, consume `parseSSE`, dispatch text/status/chart/error/done, `isStreaming` gating, pre-stream + in-stream error paths via `onError`/`toUx`, finalize on `done`
- [x] T034 [US2] On `done` (in `ChatView`): append finalized assistant message, invalidate `['chat',id]` + `['chats']` + `['me']`; navigate to `/app/c/{id}` for a freshly created session (no remount, via `justCreatedRef`)
- [x] T035 [US2] Implement `src/features/chat/Composer.tsx` (textarea, Enter-to-send, ≤8000-char guard, send disabled while `isStreaming`/out-of-credits) — attachment UI added in US4
- [x] T036 [US2] Implement `src/features/chat/MessageList.tsx` + `ChatView.tsx`; wire into `src/pages/Workspace.tsx` for `/app/c/:sessionId` and the empty `/app` new-chat state (auto-scroll, live typing bubble)

**Checkpoint**: ✅ Verified against the real backend via Chrome DevTools — new chat → deferred `POST /chat/new` → navigated to `/app/c/{id}` → assistant text streamed live → inline Plotly bar chart rendered; full reload replays stored history + chart through the same path (FR-017); send blocked while streaming; zero console errors. MVP (US1+US2) is demoable. Build green (main bundle 128 KB gzip, Plotly lazy-split), 19/19 unit tests pass.

---

## Phase 5: User Story 3 - Manage and revisit chat sessions (Priority: P2)

**Goal**: Sidebar lists sessions; user creates/opens/deletes; history (incl. stored charts) reloads faithfully.

**Independent Test**: Create a session via a message, reopen later → full history + charts reappear; delete → leaves the list immediately; untitled session shows a placeholder.

- [x] T037 [P] [US3] Extend `src/api/sessions.ts` with `listChats()` + `useChats()` (`['chats']`), `getChat(id)` + `useChat(id)` (`['chat',id]`, retry:false), and `useDeleteChat()` optimistic mutation
- [x] T038 [US3] Implement `src/features/sessions/SessionListItem.tsx` (title with graceful "New conversation" placeholder when `title===""`, relative last-updated time via `lib/format.ts`, active state, hover delete)
- [x] T039 [US3] Implement `src/features/sessions/Sidebar.tsx` — "New Chat" routes to `/app` (no backend call), session list from `useChats` sorted by `updated_at`, navigation to `/app/c/:id`, identity + sign-out footer; wired into Workspace
- [x] T040 [US3] Optimistic delete in the Sidebar (remove from `['chats']` immediately, rollback on error, invalidate on settle; navigate to `/app` when deleting the active session)
- [x] T041 [US3] Load + render history in `ChatView` via `useChat(id)` (messages + stored `charts[]` through the same PlotlyChart); `not_found` (404) → "Conversation not found" state with recovery button
- [x] T042 [US3] New-chat deferred creation inserts the session into `['chats']` after first `done` (via `onDone` invalidation) and reflects the backend-generated title on refetch

**Checkpoint**: ✅ Verified against the real backend — sidebar lists sessions with backend-generated titles ("Data Analyst Skills Egypt") + relative times; clicking opens full history + chart with active highlight; optimistic delete removes the row and persists (GET /chats confirms count drops); bogus id → "Conversation not found"; zero console errors. Build green, 19/19 unit tests pass.

---

## Phase 6: User Story 4 - Attach a CV for tailored answers (Priority: P2)

**Goal**: Attach a PDF/Word CV (≤10 MiB), see the filename, send it with the message; invalid files rejected inline.

**Independent Test**: Valid CV → filename shown, next answer is CV-aware; `.txt`/oversize → inline rejection, nothing sent; remove attachment → sends plain message.

- [x] T043 [P] [US4] Implement `src/api/upload.ts` — `uploadCv(file)` (multipart field `file`) + `useUploadCv()` mutation returning `{file_id, filename}`; `validateCvFile()` + `MAX_CV_BYTES`/`ALLOWED_CV_EXTENSIONS`
- [x] T044 [US4] Add attachment UI to `src/features/chat/Composer.tsx` (attach button + hidden input, client-side validation → inline error without upload, uploading state, filename chip, remove control)
- [x] T045 [US4] Thread `attached_cv_id` (from a successful upload) into the send via `onSend(content, cvId)` → `useChatStream`; cleared after send
- [x] T046 [US4] Surface `cv_parsing_failed`/`validation_failed`/storage errors from upload as inline composer errors; display parsed `user_profile` (job titles + skills chips) from `useChat` in a header strip

**Checkpoint**: ✅ Verified against the real backend — `.txt` rejected inline ("Unsupported file type"); valid PDF uploaded → filename chip; sent with `attached_cv_id` → backend parsed the CV → CV PROFILE strip showed extracted title/skills (Senior Data Analyst · Python, SQL, Excel, Power BI) → CV-tailored role recommendations streamed with live "using query_database…" indicator; attachment cleared after send; zero console errors. Build green, 19/19 unit tests pass.

---

## Phase 7: User Story 5 - Understand credits and access states (Priority: P2)

**Goal**: Credits visible while healthy; out-of-credits blocks sending with a persistent banner; deactivation/expiry → login; transient/retryable errors handled; every error shows a `request_id`.

**Independent Test**: Healthy → credits shown; exhausted → persistent banner + send blocked; deactivated/expired → `/login`; rapid sends → rate-limit toast; storage/server error → retryable toast; all errors show a reference id.

- [x] T047 [US5] Render remaining credits in `src/features/sessions/Sidebar.tsx` from `useMe`; refetch `['me']` after each completed turn (via `onDone`) and on window focus (global `refetchOnWindowFocus`)
- [x] T048 [US5] Out-of-credits banner: any `resources_exhausted` (apiClient `onResourcesExhausted` via `ApiErrorBridge`, or in-stream `error` via `ChatView.onError`) sets the Banner context; Composer send blocked while out of credits
- [x] T049 [US5] `forbidden` (403) → `ApiErrorBridge` signs out + routes `/login` (from T022)
- [x] T050 [US5] `rate_limited` → transient toast, `storage_unavailable`/`internal_error` → retryable toast via `toUx`/ToastProvider (stream errors in `ChatView.onError`; delete failure toast with retry in Sidebar; upload inline in Composer)
- [x] T051 [US5] `request_id` surfaced on banner + toasts (and inline where relevant)

**Checkpoint**: ✅ Credits counter shows live balance from `/me` ("43 credits left") and tracks consumption across turns; forbidden→login verified earlier via sign-out; banner/toast/blocking wiring in place with `request_id`. (Live out-of-credits banner not exercised — would require exhausting the account's 43 credits.) Build green, 19/19 unit tests pass, console clean (fixed a form-field a11y warning).

---

## Phase 8: User Story 6 - Use the app in Arabic / right-to-left (Priority: P3)

**Goal**: A direction toggle mirrors the layout; RTL-marked charts render RTL regardless of app direction.

**Independent Test**: Toggle RTL → sidebar/messages/composer mirror coherently; an Arabic-marked chart renders RTL.

- [ ] T052 [US6] Add a direction toggle control to the header/`AppShell` that flips `DirectionProvider` (persisted); verify sidebar, message alignment, and composer mirror correctly in RTL
- [ ] T053 [US6] Confirm `PlotlyChart` honors per-chart `rtl` independent of app direction (from T029) and add a mixed LTR-app / RTL-chart verification case

**Checkpoint**: Arabic users can complete a full conversation in RTL.

---

## Phase 9: User Story 7 - Discover the product via the public landing page (Priority: P3)

**Goal**: Public marketing landing at `/`; authed users at `/` are redirected to `/app`; CTAs lead to `/login`.

**Independent Test**: Anonymous at `/` → hero + feature overview + invite-only framing + CTAs; CTA/"Sign In" → `/login`; signed-in at `/` → redirected to `/app`.

- [ ] T054 [US7] Implement `src/pages/Landing.tsx` from `landing.html` (hero, bento feature overview, invite-only framing, CTAs) as clean React using the Tailwind design tokens
- [ ] T055 [US7] Apply `RedirectIfAuthed` at `/` so signed-in users are sent to `/app`; wire all landing CTAs / "Sign In" to `/login`

**Checkpoint**: Anonymous discovery path complete; authed users skip the landing.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Finalize docs, verify, and clean up.

- [ ] T056 [P] Write `README.md` (overview, local dev from `.env.example`, `npm run dev`, test, and Cloudflare Pages deploy: build `npm run build`, output `dist`, `_redirects`, set `VITE_*`, CORS note)
- [ ] T057 [P] Add an `.gitignore` entry check (dist/node_modules already ignored) and remove the stale prebuilt `dist/` so the first real build regenerates it
- [ ] T058 Run `npm run build` and fix any type/build errors; confirm `dist/` output and SPA redirect behavior
- [ ] T059 Execute `specs/001-jobit-web-app/quickstart.md` verification steps (all 7 layers) against a real backend/test account
- [ ] T060 [P] Accessibility + polish pass (focus states, keyboard send, tap targets, color contrast, loading/empty states)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: depends on Setup; BLOCKS all user stories.
- **US1 (Phase 3)** and **US2 (Phase 4)**: both P1; depend only on Foundational. Together = MVP.
- **US3 (Phase 5)**: depends on Foundational; builds on US2's session/stream (deferred-create handoff at T034/T042).
- **US4 (Phase 6)**: depends on Foundational + US2 Composer/stream.
- **US5 (Phase 7)**: depends on Foundational; wires credits/errors across US1–US4 surfaces.
- **US6 (Phase 8)**: depends on Foundational + US2 PlotlyChart + AppShell.
- **US7 (Phase 9)**: depends on Foundational routing/guards.
- **Polish (Phase 10)**: after all desired stories.

### Within Each User Story

- Mandated unit tests (T012, T014) are written with their modules in Foundational.
- Models/types before hooks; hooks before UI; core before integration.

### Parallel Opportunities

- Setup: T002–T008 are all [P].
- Foundational: T009–T014, T016–T019 are [P] (distinct files); T015/T020/T021/T022/T023 have the noted deps.
- Once Foundational is done, US1 and US2 can proceed in parallel (different files), then US3–US7.
- Within stories, [P]-marked tasks touch different files and can run together.

---

## Parallel Example: Foundational primitives

```bash
# Independent foundational modules (different files, no interdeps):
Task: "Define types in src/types/api.ts"                 # T009
Task: "Supabase client in src/lib/supabase.ts"           # T010
Task: "ApiError + toUx in src/lib/apiError.ts"           # T011
Task: "SSE parser in src/lib/sse.ts"                     # T013
Task: "Query keys in src/lib/queryKeys.ts"               # T016
# Then their tests:
Task: "tests/apiError.test.ts"                           # T012
Task: "tests/sse.test.ts"                                # T014
```

---

## Implementation Strategy

### MVP First (US1 + US2)

1. Phase 1 Setup → Phase 2 Foundational (unit tests green).
2. Phase 3 (US1 auth) + Phase 4 (US2 streaming chat).
3. **STOP and VALIDATE**: sign in, start a chat, watch a charted reply stream in.
4. Deploy/demo.

### Incremental Delivery

Foundation → US1+US2 (MVP) → US3 sessions → US4 CV → US5 credits/errors → US6 RTL → US7 landing.
Each story is an independently testable increment that doesn't break prior ones.

---

## Notes

- [P] = different files, no dependencies. [Story] label maps each task to a spec.md story.
- Follow the constitution's order (auth → CRUD → streaming → charts → upload → errors); charts
  live inside US2 (live) and US3 (stored) via one `PlotlyChart` path.
- Commit after each task or logical group; stop at checkpoints to validate a story independently.
- The two unit suites (parseSSE, toUx) are the constitution's named review gates — keep them green.
