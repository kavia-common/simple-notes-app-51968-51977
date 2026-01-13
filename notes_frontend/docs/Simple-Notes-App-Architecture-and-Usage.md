# Simple Notes App – Architecture and Usage

## Executive summary

Simple Notes is a small, single-page React application for creating, editing, searching, and deleting text notes. The application uses a single frontend container and persists all note data locally in the browser via `localStorage`, which keeps the product lightweight and self-contained. The overall design favors simple state management with a custom hook (`useLocalStorageNotes`) and a set of small UI components that render either the list/search experience or an inline editor.

This document describes the implemented architecture and current behavior, and it also outlines how the existing codebase could be extended to support backend APIs, feature flags, and improved accessibility and performance.

## Architecture overview

The application is implemented as a single React frontend container located at `simple-notes-app-51968-51977/notes_frontend`. There is no backend container in this repository and the current feature set is localStorage-only.

At a high level, the runtime flow is:

1. `src/index.js` mounts the React application into `#root`.
2. `src/App.js` renders the `<NotesApp />` component.
3. `src/components/NotesApp.js` composes UI components and coordinates state:
   - Note persistence and CRUD are handled by the custom hook `useLocalStorageNotes`.
   - Search term updates are debounced before they are used for filtering.
   - The UI toggles between “list mode” and “editor mode”.

### Folder structure (frontend container)

The most important parts of the codebase are organized as follows.

- `src/components/*` contains React presentation and orchestration components.
- `src/hooks/useLocalStorageNotes.js` contains the custom hook that manages notes and localStorage persistence.
- `src/utils/*` contains small cross-cutting helpers (ID generation, debouncing, and date formatting).
- `src/App.css` contains the theme variables and reusable utility CSS classes used throughout the UI.

### Key architectural choice: localStorage-first persistence

Note storage is implemented entirely in the browser using a stable storage key:

- Storage key: `simple_notes.v1` (defined in `src/hooks/useLocalStorageNotes.js`)

The hook reads from localStorage on mount, seeds the app with a sample note if there is no stored data, and writes back to localStorage whenever the notes array changes.

## Component breakdown

This section documents the main UI components and their responsibilities.

### Header

File: `src/components/Header.js`

The header displays the app title (“Simple Notes”) and a primary call-to-action button (“New Note”). The button triggers the creation flow.

The “New Note” button includes an `aria-label="Create new note"` to improve assistive technology readability.

### SearchBar

File: `src/components/SearchBar.js`

The SearchBar provides a text input for searching notes. It is implemented as a controlled input with local component state (`searchValue`). Whenever `searchValue` changes, `onSearch(searchValue)` is called via `useEffect`.

It also includes a clear button that appears only when the search text is non-empty, and provides `aria-label="Clear search"` for accessibility.

Important behavior detail: SearchBar itself does not debounce. The parent (`NotesApp`) debounces the state update.

### NotesList

File: `src/components/NotesList.js`

NotesList renders a vertical list of `<NoteItem />` cards for each note. It also handles the “no results” empty state when a search term is present but the filtered note list is empty. The message displayed is:

`No notes found matching "{searchTerm}"`

### NoteItem

File: `src/components/NoteItem.js`

NoteItem renders a clickable “card” representing a single note, including:

- `note.title`
- a snippet derived from `note.body`
- the last updated time (via `formatDate(note.updatedAt)`)
- a delete button with a trash icon

The snippet is derived as follows:

- If the note body has multiple non-empty lines, the second non-empty line is used.
- Otherwise, the component attempts to remove the title from the body and uses up to 100 characters of the remainder.

The delete button stops click propagation so that deleting does not trigger “edit” on the same click (`e.stopPropagation()`).

### NoteEditor

File: `src/components/NoteEditor.js`

NoteEditor is used for both creating and editing notes, and it is rendered only when the app is in “editor mode”.

Notable behavior:

- Focus management: the textarea is focused on mount via `useRef` + `useEffect`.
- Save behavior: saving requires non-empty content (`body.trim()`), and the editor passes `{ body: body.trim() }` to `onSave`.
- Cancel behavior:
  - If creating and empty, cancel occurs immediately.
  - Otherwise, cancel prompts via `window.confirm(...)` to avoid losing changes.

Keyboard shortcuts implemented in `onKeyDown`:

- Cmd/Ctrl + S: saves (prevents the browser save dialog by calling `e.preventDefault()`).
- Escape: cancels only when creating a new empty note.

The textarea includes `aria-label="Note content"`.

### EmptyState

File: `src/components/EmptyState.js`

EmptyState is shown when there are no notes and the app is not currently editing. It displays a short explanation and a “Create your first note” button that triggers the create flow. This is presented inside a card.

## Data model and persistence

### Storage layer

- Data is stored in browser `localStorage`.
- Storage key: `simple_notes.v1`.
- The app attempts to load notes from localStorage on mount.
- If parsing fails, or stored data is invalid, the app falls back to seed/demo data.
- On every change to the notes array, the app serializes and saves it back to localStorage.

The implementation also logs errors to the console when reads/writes fail (for example, in restricted/private browsing modes where localStorage may throw).

### Note schema (as implemented)

The note object stored in state and localStorage contains:

- `id: string`  
  Generated by `generateId()` if not provided.
- `title: string`  
  Derived from the first non-empty line of the note body, or `"Untitled"` if the body has no non-empty lines.
- `body: string`  
  The trimmed note body string.
- `createdAt: number`  
  Unix timestamp in milliseconds. For edits, preserved from the existing note.
- `updatedAt: number`  
  Unix timestamp in milliseconds. Set to `Date.now()` on create and update.

Although the request mentions `content`, the current codebase uses the field name `body` for the note content. The UI and utilities consistently refer to `note.body`.

## Data flow and state management

State management follows a “thin orchestration component + custom hook” pattern.

### useLocalStorageNotes (custom hook)

File: `src/hooks/useLocalStorageNotes.js`

Responsibilities:

- Initialize notes from localStorage or seed data.
- Persist notes back to localStorage on every update.
- Provide stable CRUD methods:
  - `createNote(body)`
  - `updateNote(id, body)`
  - `deleteNote(id)`

Behavior details:

- Notes are always sorted descending by `updatedAt` for display.
- `createNote(body)` and `updateNote(id, body)` ignore empty or whitespace-only content.

### NotesApp orchestrator

File: `src/components/NotesApp.js`

NotesApp owns the UI-level state:

- `searchTerm: string`  
  Set via a debounced setter.
- `editingNote: note | null`  
  The currently edited note when editing an existing note.
- `isCreating: boolean`  
  True when creating a new note.

It uses `useLocalStorageNotes()` to obtain the persisted `notes` array plus CRUD operations.

List vs editor mode is controlled by:

- `isEditing = isCreating || editingNote !== null`

In list mode:

- The SearchBar is shown.
- The list is shown if notes exist, or EmptyState is shown if there are no notes.
- Notes are filtered based on `searchTerm` by matching `title` or `body` case-insensitively.

In editor mode:

- The SearchBar and list are hidden.
- NoteEditor is shown.

Deletion is confirmed in the UI with a `window.confirm(...)` prompt.

### debounce utility

File: `src/utils/debounce.js`

The debounce helper wraps a function and delays execution until the user stops invoking it for a set delay (in milliseconds). In this app, it is used to debounce changes from the SearchBar before committing them to `searchTerm`:

- Delay: 300ms (in `NotesApp.js`)

This reduces re-filtering frequency when typing quickly.

### generateId utility

File: `src/utils/generateId.js`

IDs are generated as a string combining:

- `Date.now()` timestamp
- a random base-36 substring

Format: `${timestamp}-${randomString}`

This is sufficient for local-only uniqueness and small-scale usage, but it is not intended as a cryptographically secure identifier.

### formatDate utility

File: `src/utils/formatDate.js`

`formatDate(updatedAt)` produces a human-readable relative time for recent notes:

- “Just now” (< 1 minute)
- “N minutes ago” (< 1 hour)
- “N hours ago” (< 24 hours)
- “N days ago” (< 7 days)
- Otherwise, a formatted date string (Month Day, and includes Year only if it differs from current year)

This output is shown on each NoteItem.

## Theming and styling

Styling is provided through plain CSS and a small set of utility classes. The main palette is defined as CSS variables in `src/App.css` under `:root`.

The core theme variables (light theme) are:

- Primary: `#3b82f6`
- Secondary: `#64748b`
- Success: `#06b6d4`
- Error: `#EF4444`
- Background: `#f9fafb`
- Surface: `#ffffff`
- Text: `#111827`

The codebase uses these variables for:

- buttons (`.btn-primary`, `.btn-secondary`, `.btn-danger`)
- inputs (`.input`, focus ring)
- layout backgrounds and surfaces (`body`, `.card`)

The layout is intentionally simple and single-column (`.container` max-width 768px), matching the product goals and keeping rendering and navigation straightforward on mobile.

## Environment variables

The container defines the following environment variables in its `.env` (as provided in the task request):

- `REACT_APP_API_BASE`
- `REACT_APP_BACKEND_URL`
- `REACT_APP_FRONTEND_URL`
- `REACT_APP_WS_URL`
- `REACT_APP_NODE_ENV`
- `REACT_APP_NEXT_TELEMETRY_DISABLED`
- `REACT_APP_ENABLE_SOURCE_MAPS`
- `REACT_APP_PORT`
- `REACT_APP_TRUST_PROXY`
- `REACT_APP_LOG_LEVEL`
- `REACT_APP_HEALTHCHECK_PATH`
- `REACT_APP_FEATURE_FLAGS`
- `REACT_APP_EXPERIMENTS_ENABLED`

In Create React App (CRA), only variables prefixed with `REACT_APP_` are exposed to frontend code at build time. The current codebase does not reference `process.env.REACT_APP_*` in the React source, which is consistent with the current localStorage-only architecture.

### How these variables could be used (future-facing)

Even though the app is currently localStorage-only, these variables could support gradual evolution without changing the UI architecture:

- `REACT_APP_API_BASE` / `REACT_APP_BACKEND_URL` could define the base URL for an HTTP API, enabling syncing notes to a server.
- `REACT_APP_WS_URL` could support WebSocket-based realtime collaboration or sync.
- `REACT_APP_FRONTEND_URL` could be used for generating share links.
- `REACT_APP_FEATURE_FLAGS` and `REACT_APP_EXPERIMENTS_ENABLED` could gate optional UI features such as markdown support, tagging, or archive/trash.
- `REACT_APP_ENABLE_SOURCE_MAPS` could control sourcemap generation for production builds.
- `REACT_APP_LOG_LEVEL` could adjust client logging verbosity for debugging.
- `REACT_APP_HEALTHCHECK_PATH` could be used by hosting infrastructure or a lightweight client-side health view in more complex deployments.
- `REACT_APP_NODE_ENV` in CRA typically reflects build mode, but could also be used to select different runtime behavior (e.g., more verbose logging in development).

If a backend were introduced, a sensible design is to preserve the hook boundary by implementing an alternative hook such as `useRemoteNotes` (or enhancing `useLocalStorageNotes` to optionally sync) while keeping components unchanged.

## Usage guide

This section documents end-user behavior as implemented today.

### Creating a note

1. Click “New Note” in the header, or click “Create your first note” in the empty state.
2. Type your note content in the editor.
3. Click “Save” or press Cmd/Ctrl+S.

Notes are not saved if the editor content is empty or only whitespace.

### Editing a note

1. From the list view, click a note card.
2. Modify the content in the editor.
3. Click “Save” or press Cmd/Ctrl+S.

On save, the note’s `updatedAt` changes and the note will move to the top of the list because the list is sorted by most recently updated.

### Canceling an edit

- If you are creating a new note and it is still empty, pressing “Cancel” or Escape will immediately exit the editor.
- If you are editing an existing note (or a new note that has content), cancel prompts a confirmation dialog warning that unsaved changes will be lost.

### Deleting a note

1. Click the trash button on a note card.
2. Confirm the deletion when prompted.

Deletion is immediate after confirmation. If the deleted note was currently being edited, the editor is also closed.

### Searching notes

- Search is available only in list mode (not while editing).
- Search matches both the note title and body text, case-insensitively.
- Search input is debounced by 300ms in the parent component. This means the list updates shortly after you stop typing, which improves perceived performance when typing quickly.

If no notes match your search term, the UI displays a “No notes found matching …” message.

### Keyboard tips

The editor supports:

- Cmd/Ctrl + S to save.
- Escape to cancel only when creating a new empty note.

## Accessibility and performance considerations (planned)

The current implementation already includes some accessibility-friendly attributes such as `aria-label` on important buttons and the editor textarea. However, there are additional areas to improve as the app grows:

Accessibility improvements that are natural next steps:

- Ensure all interactive elements have clear focus styles and visible focus indication.
- Add better focus management when switching between list and editor mode, such as returning focus to the previously selected note after saving/canceling, and focusing the SearchBar when exiting the editor.
- Add ARIA live regions or status messages for operations such as “note saved” or “note deleted” (especially if confirmation dialogs are later removed).
- Ensure empty states and “no results” messages are announced appropriately to screen readers.

Performance improvements that are natural next steps:

- Consider list virtualization for very large note collections (for example, using a windowing strategy) while preserving the simple UI.
- Consider lazy loading or code splitting for optional features (e.g., markdown preview) if the application expands, although the current footprint is small and does not require it.
- Keep the debounced search and avoid expensive per-keystroke processing; this is already implemented.

## Future enhancements and deployment considerations

Potential enhancements that fit the existing architecture:

- Tagging or folders, implemented by extending the note schema and adjusting the filtering UI.
- Rich text or markdown preview, likely implemented within NoteEditor while persisting a new field (or treating `body` as markdown).
- Undo/redo or version history, potentially stored locally first and later synced.
- Sync to backend APIs:
  - Keep the current `useLocalStorageNotes` behavior for offline-first usage.
  - Add optional remote sync, conflict resolution strategies, and authentication if needed.
- Export/import notes (JSON download/upload), which aligns well with a local-first system.

Deployment considerations for CRA:

- `npm run build` produces a static bundle under `build/` suitable for hosting on any static site/CDN.
- Environment variables are baked in at build time for CRA. Changing them typically requires rebuilding the frontend.
- The current app does not require server-side routing support since it does not define client-side routes; a basic static host is sufficient.

## Implementation references

The sections above are derived directly from the following source files:

- Orchestration: `src/components/NotesApp.js`
- Components: `src/components/Header.js`, `src/components/SearchBar.js`, `src/components/NotesList.js`, `src/components/NoteItem.js`, `src/components/NoteEditor.js`, `src/components/EmptyState.js`
- Persistence hook: `src/hooks/useLocalStorageNotes.js`
- Utilities: `src/utils/debounce.js`, `src/utils/generateId.js`, `src/utils/formatDate.js`
- Theme and layout: `src/App.css`
