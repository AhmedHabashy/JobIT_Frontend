# Feature Specification: JobIT Web App — AI Career & Labour-Market Assistant

**Feature Branch**: `001-jobit-web-app`

**Created**: 2026-07-06

**Status**: Draft

**Input**: User description: "JobIT web app — an AI career & labour-market assistant for Egyptian job seekers. Public landing page, operator-provisioned sign-in, chat sessions with a streaming charted assistant, CV attachment, credit-based access, and Arabic/RTL support."

## Clarifications

### Session 2026-07-06

- Q: When the user clicks "New Chat", when is the backend session created? → A: Defer to the first message — "New Chat" opens a blank composer; the session is created on first send, then the reply streams. No empty untitled sessions are created.
- Q: Can the user send a new message while the assistant is still streaming? → A: No — sending is blocked/disabled while a turn streams and re-enabled when the turn completes.
- Q: What does a signed-in user see at the root URL (/)? → A: Anonymous visitors see the landing page at /; already-signed-in users at / are redirected into the chat workspace.
- Q: How does the credit counter update after a message consumes a credit? → A: Refetch the current balance after each completed turn and show the authoritative value (no local decrement).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sign in as an authorized user (Priority: P1)

An authorized professional opens the app, enters their email and password on the
"Authorized Access Only" login screen, and is taken into the assistant workspace. The
screen makes clear there is no self-serve signup and to contact an administrator for
access. On first successful sign-in their account is provisioned automatically without any
extra step. Wrong credentials, or an account an operator has deactivated, produce a clear,
distinct message.

**Why this priority**: Nothing else in the product is reachable without authentication, and
access is invitation-only, so a correct sign-in experience is the foundation.

**Independent Test**: With a valid operator-provisioned account, sign in and confirm arrival
at the workspace; with bad credentials confirm a clear failure message; confirm the screen
communicates that signup is restricted.

**Acceptance Scenarios**:

1. **Given** an authorized user with valid credentials, **When** they submit the login form,
   **Then** they are signed in and land in the assistant workspace with their identity shown.
2. **Given** a first-time authorized user, **When** they sign in successfully, **Then** their
   account is provisioned automatically with no additional signup step.
3. **Given** invalid credentials, **When** the user submits, **Then** a clear "invalid
   credentials" message is shown and they remain on the login screen.
4. **Given** an operator-deactivated account, **When** the user signs in, **Then** they are
   shown a distinct "account deactivated — contact administrator" message.
5. **Given** the login screen, **When** a visitor looks for a signup option, **Then** the
   screen states registration is restricted to authorized personnel.

---

### User Story 2 - Ask a question and watch a charted answer stream in (Priority: P1)

Inside a chat session the user types a question and sends it. The assistant's reply appears
progressively, word by word, for a live-typing effect. While the assistant is working, a
brief "using {tool}…" indicator may appear. The answer may include one or more analytical
charts rendered inline. Sending a message consumes one credit.

**Why this priority**: This is the core value of the product — a responsive, charted,
data-grounded conversation. It is the primary reason a user is here.

**Independent Test**: In a session, send a question and confirm the reply streams
incrementally, any tool-in-progress indicator appears and clears, and any returned chart
renders inline; confirm the turn completes cleanly.

**Acceptance Scenarios**:

1. **Given** an open session, **When** the user sends a question, **Then** the assistant's
   reply text appears incrementally until the turn is complete.
2. **Given** the assistant is using a tool, **When** it reports progress, **Then** a
   transient "using {tool}…" indicator is shown and removed when finished.
3. **Given** an answer that includes analytics, **When** a chart is delivered, **Then** it
   renders inline within the assistant's message.
4. **Given** a completed turn, **When** the response finishes, **Then** the message is
   finalized and remains visible in the conversation.
5. **Given** a problem occurs mid-answer, **When** it is reported during the response,
   **Then** the user sees the problem without losing the partial answer, and the turn still
   concludes.

---

### User Story 3 - Manage and revisit chat sessions (Priority: P2)

From a persistent sidebar the user starts a new conversation, sees a list of their past
sessions (each with a title and a last-updated time), opens any past session to read its
full history — including charts exactly as first shown — and deletes sessions they no longer
want. The list updates immediately as sessions are created, renamed by the assistant, or
deleted.

**Why this priority**: Multi-session management and reliable history make the tool usable
beyond a single throwaway question, but the product still delivers value with a single
session (US2) if this is absent.

**Independent Test**: Create a session, hold a conversation, reopen it later and confirm the
full history and its charts reappear; delete a session and confirm it leaves the list.

**Acceptance Scenarios**:

1. **Given** the workspace, **When** the user chooses "New Chat", **Then** a new empty
   session is created and becomes active.
2. **Given** a freshly created session with no title yet, **When** it appears in the list,
   **Then** it is shown gracefully (e.g. a neutral placeholder) rather than as blank/broken.
3. **Given** past sessions exist, **When** the user opens one, **Then** its full message
   history loads, with previously shown charts rendered inline as they were live.
4. **Given** a session in the list, **When** the user deletes it, **Then** it is removed from
   the list immediately.
5. **Given** the first message of a session triggers a title, **When** the title is
   generated, **Then** the session's list entry reflects that title.

---

### User Story 4 - Attach a CV for tailored answers (Priority: P2)

Before sending a message the user attaches a CV (PDF or Word document, up to 10 MiB). The
composer shows the attached filename. When they send, the assistant uses the CV to tailor
its answer and can derive a profile of the user's skills, job titles, experience, education,
and core tasks. Attaching a wrong file type or an oversize file shows an inline error and
does not send.

**Why this priority**: CV-grounded personalization meaningfully deepens the assistant's
value, but the assistant is still useful for general labour-market questions without it.

**Independent Test**: Attach a valid CV, confirm the filename is shown and the next answer
reflects CV context; attach a `.txt` or an 11 MiB file and confirm an inline rejection with
no send.

**Acceptance Scenarios**:

1. **Given** the composer, **When** the user attaches a valid PDF or Word CV under 10 MiB,
   **Then** the filename is displayed and the file is ready to send with the next message.
2. **Given** an attached CV, **When** the user sends their message, **Then** the assistant's
   answer is tailored using that CV for the turn.
3. **Given** an unsupported file type, **When** the user attaches it, **Then** an inline
   error explains the allowed types and nothing is sent.
4. **Given** a file over the size limit, **When** the user attaches it, **Then** an inline
   error explains the size limit and nothing is sent.

---

### User Story 5 - Understand credits and access states (Priority: P2)

The user can always see how many credits remain while their account is healthy. When credits
run out, a persistent, prominent notice explains the account is inactive until an operator
tops it up, and sending new messages is blocked. If the account is deactivated by an operator
or the session has expired, the user is returned to sign-in with an explanation. Temporary
problems (sending too fast, storage or server hiccups) show clear, non-fatal messages with a
retry where sensible. Every error surfaces a reference id the user can quote to support.

**Why this priority**: Because access is credit-gated and operator-controlled, users must
never be confused about why sending failed; clear state communication prevents dead ends.

**Independent Test**: With a healthy account confirm the credit count is visible; simulate an
exhausted account and confirm the persistent notice plus blocked sending; simulate a
deactivated/expired session and confirm return to sign-in; confirm a reference id is shown on
errors.

**Acceptance Scenarios**:

1. **Given** a healthy account, **When** the workspace loads, **Then** the remaining credit
   balance is visible.
2. **Given** an account with no credits left, **When** the user tries to send, **Then** a
   persistent "out of credits" notice is shown and sending is blocked.
3. **Given** an operator-deactivated account or an expired session, **When** any action is
   attempted, **Then** the user is returned to sign-in with an explanation.
4. **Given** the user is sending too quickly, **When** a rate limit is hit, **Then** a
   transient "slow down" message appears and the user can retry shortly.
5. **Given** a temporary storage or server problem, **When** it occurs, **Then** a clear,
   retryable message is shown without losing the user's place.
6. **Given** any error is shown, **When** the user views it, **Then** a reference id is
   available to quote to support.

---

### User Story 6 - Use the app in Arabic / right-to-left (Priority: P3)

An Arabic-speaking user flips the layout to right-to-left. The interface mirrors
appropriately, and any chart the assistant marks as Arabic renders right-to-left. (Full
translation of every interface string is a later enhancement; v1 provides the direction flip
and RTL charts.)

**Why this priority**: The audience is bilingual and RTL correctness matters for Arabic
users, but the product functions for English users without it, so it follows the core flows.

**Independent Test**: Toggle RTL and confirm the layout mirrors and reads correctly; receive
an Arabic-marked chart and confirm it renders right-to-left.

**Acceptance Scenarios**:

1. **Given** the workspace, **When** the user switches to RTL, **Then** the layout direction
   mirrors coherently (sidebar, message alignment, composer).
2. **Given** a chart marked as right-to-left, **When** it renders, **Then** it is laid out
   right-to-left regardless of the current interface direction.

---

### User Story 7 - Discover the product via the public landing page (Priority: P3)

An anonymous visitor arrives at a public marketing page introducing "Navigate the Egyptian
Job Market with AI", scans an overview of what the product does (demand trends, labour-law
guidance, CV optimization, career-path planning), understands that access is
operator-provisioned rather than open signup, and follows a call to action to the sign-in
screen.

**Why this priority**: The landing page aids discovery and framing but is not required for an
authorized user to get value; it is presentation around the core product.

**Independent Test**: Visit the landing page as an anonymous visitor and confirm the hero,
feature overview, invite-only framing, and a working path to sign-in.

**Acceptance Scenarios**:

1. **Given** an anonymous visitor, **When** they open the landing page, **Then** they see the
   hero, a feature overview, and calls to action.
2. **Given** the landing page, **When** the visitor chooses a call to action / "Sign In",
   **Then** they are taken to the login screen.
3. **Given** the landing page, **When** the visitor looks for how to join, **Then** it is
   clear that access is operator-provisioned, not open registration.

---

### Edge Cases

- Clicking "New Chat" and then navigating away without sending must leave no orphaned empty
  session behind (creation is deferred to the first message).
- A session whose title is still empty (e.g. created by the backend but not yet titled) must
  display gracefully in the sidebar with a neutral placeholder rather than as a blank row.
- A conversation turn that ends in an error must still conclude cleanly and preserve any text
  already shown.
- Credits reaching zero mid-use: the next send attempt must be blocked with the out-of-credits
  notice rather than appearing to send and silently failing.
- A token/session that expires between actions must route the user to sign-in with an
  explanation rather than showing a generic failure.
- Attaching a CV, then removing it before sending, must send an ordinary message with no
  attachment.
- Opening a session that no longer exists (e.g. deleted in another tab) must show a clear
  "not found" state rather than a broken view.
- Very long assistant answers and multiple charts in one turn must remain readable and
  scrollable.
- Switching between LTR and RTL mid-session must not corrupt already-rendered messages or
  charts.

## Requirements *(mandatory)*

### Functional Requirements

**Authentication & access**

- **FR-001**: The system MUST let an authorized user sign in with email and password on a
  dedicated login screen framed as authorized-access-only.
- **FR-002**: The system MUST NOT offer self-serve account registration and MUST communicate
  that access is operator-provisioned (contact an administrator).
- **FR-003**: The system MUST provision an authorized user's account automatically on first
  successful sign-in, with no separate signup action required of the user.
- **FR-004**: The system MUST show distinct messages for invalid credentials versus an
  operator-deactivated account.
- **FR-005**: The system MUST return the user to sign-in, with an explanation, when their
  session is invalid/expired or their account has been deactivated.
- **FR-006**: The system MUST display the signed-in user's identity (email) in the workspace.

**Sessions**

- **FR-007**: Users MUST be able to start a new conversation via a "New Chat" action. The
  underlying session MUST be created on the first sent message (deferred creation), not on the
  click itself, so no empty untitled sessions are produced.
- **FR-008**: Users MUST be able to see a list of their past sessions, each showing a title
  and a last-updated time, ordered so the most recently active are easy to find.
- **FR-009**: The system MUST display sessions with no generated title yet using a graceful
  placeholder rather than a blank entry.
- **FR-010**: Users MUST be able to open a past session and see its full message history.
- **FR-011**: Users MUST be able to delete a session, with the list reflecting the removal
  immediately.
- **FR-012**: The session list MUST reflect creation, title generation, and deletion promptly
  (immediate/optimistic updates are acceptable).

**Conversation & streaming**

- **FR-013**: Users MUST be able to send a text message within a session (subject to a
  reasonable maximum length). Sending MUST be blocked/disabled while a turn is still streaming
  and re-enabled once that turn completes.
- **FR-014**: The system MUST render the assistant's reply progressively for a live-typing
  effect.
- **FR-015**: The system MUST show a transient progress indicator naming the tool in use when
  the assistant reports tool activity, and clear it when finished.
- **FR-016**: The system MUST render analytical charts delivered with an answer inline within
  the assistant's message.
- **FR-017**: The system MUST render charts stored on a past assistant message identically to
  how charts render live, when a session is reopened.
- **FR-018**: The system MUST finalize a completed turn so the message persists in the visible
  conversation.
- **FR-019**: The system MUST surface a problem reported during a response without discarding
  text already shown, and still conclude the turn.
- **FR-020**: The system MUST reflect that each sent message consumes one credit.

**CV attachment**

- **FR-021**: Users MUST be able to attach a single CV file (PDF or Word document) up to
  10 MiB before sending a message, and see its filename.
- **FR-022**: The system MUST reject an unsupported file type or an oversize file with an
  inline error and MUST NOT send the message in that case.
- **FR-023**: When a CV is attached and the message sent, the system MUST associate that CV
  with the turn so the assistant can tailor its answer and derive a user profile (skills, job
  titles, experience, education, core tasks).
- **FR-024**: Users MUST be able to remove an attached CV before sending so the message is
  sent without an attachment.

**Credits & error states**

- **FR-025**: The system MUST display the remaining credit balance while the account is
  healthy, refreshing it after each completed turn to show the authoritative value.
- **FR-026**: The system MUST show a persistent, prominent "out of credits" notice and block
  sending new messages when the account's credits are exhausted.
- **FR-027**: The system MUST show a transient, non-fatal message when a rate limit is hit and
  allow the user to retry shortly.
- **FR-028**: The system MUST show a clear, retryable message for temporary storage or server
  problems without losing the user's place.
- **FR-029**: The system MUST show a distinct inline error when an uploaded CV cannot be
  processed.
- **FR-030**: The system MUST surface a support-quotable reference id on every error.

**Landing & internationalization**

- **FR-031**: The system MUST present a public landing page (hero, feature overview,
  invite-only framing, calls to action) reachable without authentication at the root URL for
  anonymous visitors; an already-signed-in user reaching the root URL MUST be redirected into
  the chat workspace.
- **FR-032**: The landing page's calls to action MUST lead to the sign-in screen.
- **FR-033**: The system MUST let the user switch the interface to right-to-left layout, with
  the workspace mirroring coherently.
- **FR-034**: The system MUST render any chart marked as right-to-left in right-to-left
  layout, independent of the current interface direction.

### Key Entities *(include if feature involves data)*

- **User (account)**: The signed-in person — identity (email), role, and a remaining credit
  balance. Account activation/deactivation and credit top-ups are controlled by operators
  outside this app.
- **Chat session**: A conversation belonging to a user, with a title (may be initially
  absent), a last-updated time, a topical route/category (may be initially absent), and an
  ordered history of messages.
- **Message**: A single turn in a session, authored by the user or the assistant. Assistant
  messages may carry one or more charts.
- **Chart**: An analytical figure attached to an assistant message, with a right-to-left
  layout hint.
- **CV attachment**: An uploaded document associated with the user and, when sent, with a
  specific message turn; used to derive a user profile.
- **User profile**: The assistant-derived summary of a user from their CV — skills, job
  titles, experience, education level, and core tasks — surfaced within a session once a CV
  has been processed.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authorized user can go from the login screen to a sent question with a
  streaming reply in under 60 seconds on first use.
- **SC-002**: 95% of assistant replies begin visibly appearing within a few seconds of
  sending, giving the user immediate feedback that the turn is progressing.
- **SC-003**: Reopening any past session restores 100% of its messages and previously shown
  charts, indistinguishable from how they first appeared.
- **SC-004**: 100% of the documented error conditions (invalid credentials, deactivated
  account, out of credits, rate limited, storage/server error, bad/oversize CV, unprocessable
  CV, expired session) present a distinct, understandable message, each with a reference id.
- **SC-005**: When credits are exhausted, 100% of send attempts are blocked with the
  persistent notice — no message appears to send and then silently fail.
- **SC-006**: A user can attach a valid CV and receive a tailored answer, and is prevented
  from attaching an invalid file 100% of the time with an explanatory inline error.
- **SC-007**: An Arabic user can switch to right-to-left and complete a full conversation
  (send, stream, view charts) with the layout mirrored coherently and RTL-marked charts laid
  out right-to-left.
- **SC-008**: An anonymous visitor can reach the sign-in screen from the landing page in one
  action.

## Assumptions

- Accounts are created, credited, deactivated, and reactivated by operators entirely outside
  this application; the app has no billing, upgrade, or admin surface (out of scope for v1).
- The credit balance is only ever reported for a healthy account; an exhausted account is
  recognized by the out-of-credits condition rather than by a zero reading.
- A single CV attachment per message is sufficient for v1; multiple simultaneous attachments
  are out of scope.
- Full translation of interface strings into Arabic is a later enhancement; v1 delivers
  right-to-left layout direction and RTL charts only.
- Users have modern browsers with stable connectivity capable of receiving a live-streamed
  response.
- The assistant's content, chart generation, titling, and CV parsing are provided by the
  backend; this app renders and orchestrates them but does not itself perform analysis.
- "Last-updated time" and titles originate from the backend; the app displays and orders by
  them.
