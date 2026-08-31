# Client Dashboard Execution Plan

## 1. Current repository status

- Active branch: `main`
- This project is using a single branch workflow, so all work should continue on `main` without branch splitting.
- The repo already contains a strong frontend foundation in the client app, including reusable cards, layout shell, and mock forensic data.
- The main missing part is the actual composition and wiring of the dashboard page itself.

## 2. What is already completed

The following pieces are already implemented in the client app:

- Layout shell:
  - `client/src/components/layout/Sidebar.tsx`
  - `client/src/components/layout/Header.tsx`
- Dashboard cards:
  - `client/src/components/dashboard/RiskScoreCard.tsx`
  - `client/src/components/dashboard/ClassificationCard.tsx`
  - `client/src/components/dashboard/ThreatLevelCard.tsx`
  - `client/src/components/dashboard/AnalysisTimeCard.tsx`
  - `client/src/components/dashboard/EvidenceHashCard.tsx`
  - `client/src/components/dashboard/AuthenticationCard.tsx`
  - `client/src/components/dashboard/RelayTraceCard.tsx`
  - `client/src/components/dashboard/GeolocationMapCard.tsx`
  - `client/src/components/dashboard/ThreatSignalsCard.tsx`
  - `client/src/components/dashboard/ThreatGraphCard.tsx`
  - `client/src/components/dashboard/EmailSummaryCard.tsx`
  - `client/src/components/dashboard/RecentInvestigationsCard.tsx`
  - `client/src/components/dashboard/QuickActionsCard.tsx`
- Shared exports:
  - `client/src/components/index.ts`
- Mock forensic data:
  - `client/src/constants/mockData.ts`
- Types:
  - `client/src/types/forensics.ts`

The dashboard shell is designed around an investigation intelligence workflow, with a dark forensic UI and card-based analytics layout.

## 3. Current gap

The actual page wiring is still incomplete.

- `client/src/app/dashboard/page.tsx` exists but is empty.
- The dashboard components are created but not composed into a final working page.
- No real API integration or page state orchestration is yet connected.
- The app routes under `client/src/app` are not yet fully assembled into a complete user flow.

This means the frontend is in the “component-ready / page-assembly pending” stage.

## 4. Recommended execution priority

### Phase 1: Wire the dashboard shell
Goal: make a working dashboard screen using the existing component library.

Tasks:
1. Build the main `dashboard` page layout inside `client/src/app/dashboard/page.tsx`.
2. Use `Sidebar`, `Header`, and the card components from the client folder.
3. Add a default selected investigation using `MOCK_INVESTIGATION` and `MOCK_INVESTIGATIONS_LIST`.
4. Make the layout responsive for desktop/tablet/mobile.
5. Add conditional state for selected case, tab switching, and modal actions.

### Phase 2: Connect interactions
Goal: allow the page to feel like a real investigation dashboard.

Tasks:
1. Clicking a case in the investigations table selects it.
2. Quick action buttons open ingest or case creation modal flows.
3. Header actions trigger report export or evidence export handlers.
4. Threat graph and signals modal actions show detailed popups.
5. Add accessible states for loading, empty, and error states.

### Phase 3: Route and flow completion
Goal: connect the full forensic workflow beyond the dashboard.

Tasks:
1. Build or finalize upload page under `client/src/app/upload/page.tsx`.
2. Build analysis detail route under `client/src/app/analysis/[id]`.
3. Build report detail route under `client/src/app/reports/[emailId]`.
4. Ensure navigation works from dashboard to upload -> analysis -> evidence -> reports.
5. Keep the dashboard as the central control panel.

### Phase 4: API integration
Goal: replace mock data with backend data.

Tasks:
1. Add dashboard summary API contract.
2. Connect to investigation list API.
3. Connect to selected email analysis detail API.
4. Add loading, skeleton, and fallback handling.
5. Map backend response shape to the TypeScript types in `client/src/types/forensics.ts`.

### Phase 5: UI polish and demo readiness
Goal: make the app demo-ready.

Tasks:
1. Dark forensic theme consistency.
2. Material icon and spacing consistency.
3. Edge-case handling for long email subjects and tokens.
4. Mobile behavior checks.
5. Final QA pass for demo flow.

## 5. Wireframing plan for the dashboard

### A. Dashboard screen structure

The dashboard should be the command center and should follow this visual order:

1. Left sidebar navigation
2. Top header with investigation identifier and actions
3. Quick actions row
4. KPI summary row:
   - Risk Score
   - Classification
   - Threat Level
   - Analysis Time
   - Evidence Hash
   - Authentication status
5. Main content row:
   - Email Summary card
   - Threat Signals card
   - Threat Graph card
6. Secondary row:
   - Relay Trace
   - Geo Location / map
   - Authentication details
7. Investigation list table at the bottom

### B. Proposed wireframe layout

```text
┌──────────────────────────────────────────────────────────────────────┐
│ TRACE | Investigation #TRC-1024               [Download PDF] [Export] │
├───────────────┬───────────────────────────────────────────────────────┤
│ Sidebar       │ Quick Actions                                           │
│ Dashboard     │ [Ingest Email] [Search] [Create Case]                   │
│ Ingest Email  │                                                       │
│ Analysis      │ KPI Row                                                │
│ Authentication│ [Risk Score] [Classification] [Threat Level]           │
│ Relay Trace   │ [Analysis Time] [Evidence Hash] [Auth Status]          │
│ Threat Graph  │                                                       │
│ Risk Score    │ Main Content                                           │
│ Cases         │ [Email Summary] [Threat Signals] [Threat Graph]        │
│ Evidence      │                                                       │
│ Reports       │ Secondary Row                                          │
│ Alerts        │ [Relay Trace] [Location Map] [Authentication Detail]  │
├───────────────┴───────────────────────────────────────────────────────┤
│ Recent Investigations Table                                           │
│ ID | Subject | From | Risk | Class | Date | Status                   │
└──────────────────────────────────────────────────────────────────────┘
```

### C. Card priorities

Priority 1 (must be visible immediately):
- Risk Score
- Threat Level
- Authentication status
- Email summary
- Threat signals
- Recent investigations

Priority 2 (important but secondary):
- Threat graph
- Relay trace
- Geolocation map
- Evidence hash

Priority 3 (optional / modal-driven):
- full graph modal
- auth details modal
- headers modal
- ingest modal

## 6. Recommended UI behavior

### Dashboard interactions
- When a case is selected, the top summary should update immediately.
- The selected row in the investigations table should keep a strong accent color.
- Threat severity should use consistent colors:
  - Critical = red
  - High = orange
  - Medium = amber
  - Low / safe = blue / green
- Hover states should be subtle but visible.
- Alerts should be visible but not intrusive.

### Page flow
1. User lands on dashboard after login.
2. User sees the latest investigation and the full forensic summary.
3. User can open upload modal or upload page to ingest new email.
4. User can navigate to analysis detail, case report, or evidence.
5. Final report can be exported in PDF as demo output.

## 7. Suggested sprint sequence for single-branch execution

### Week 1 / Sprint 1
- Complete dashboard page assembly using existing client components.
- wire state and filtering for Recent Investigations.
- finalize dark UI theme and spacing across cards.

### Week 1 / Sprint 2
- connect upload, analysis, and redirect flow.
- integrate mock API layer and real backend contract.
- polish modal behaviors and report export hooks.

### Final demo prep
- Verify full flow from upload to report generation.
- ensure all screens are stable with mock data.
- remove placeholder inconsistencies.
- test the dashboard on desktop and tablet sizes.

## 8. Final recommendation

The best immediate target is:

- use the current `client` folder as the source of truth,
- finish the `dashboard` page composition first,
- then connect the rest of the forensic workflow around it,
- and keep everything on the single branch `main` with incremental commits.

This is the cleanest approach because the frontend has already invested in the design system and reusable cards; only the final page orchestration and data linking remain pending.
