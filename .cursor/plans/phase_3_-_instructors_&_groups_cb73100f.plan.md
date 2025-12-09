---
name: Phase 3 - Instructors & Groups
overview: Implement instructor and group management with real data and simple availability notes, then wire into admin UIs.
todos:
  - id: instructors-service
    content: Implement/verify instructor CRUD + availability fields
    status: pending
  - id: instructors-ui
    content: Wire admin Instructors page to Supabase CRUD
    status: pending
    dependencies:
      - instructors-service
  - id: instructors-validation
    content: Add validation/loading/toasts/optimistic
    status: pending
    dependencies:
      - instructors-ui
  - id: groups-service
    content: Implement/verify group CRUD + membership
    status: pending
    dependencies:
      - instructors-validation
  - id: groups-ui
    content: Wire admin Groups page to Supabase CRUD
    status: pending
    dependencies:
      - groups-service
  - id: groups-validation
    content: Add validation/loading/toasts/optimistic
    status: pending
    dependencies:
      - groups-ui
---

# Phase 3: Instructors & Groups

## Scope

Sequentially deliver instructor then group CRUD, wiring services and admin UIs to Supabase, with validation/UX and class integration.

## A. Instructors (do first)

- **Service CRUD**: Implement/verify list/get/create/update/delete + status/availabilityNote in [`src/services/instructors.ts`](src/services/instructors.ts); ensure instructor options expose id/name/status for classes.
- **Admin UI wiring**: Update [`src/pages/admin/Instructors.tsx`](src/pages/admin/Instructors.tsx) to load from Supabase (list/search/filter), view profile, create/edit/delete, show status/availability note, hire date, license, certification expiry, phone/email.
- **Validation & UX**: Require first/last/email/status/hire date; license optional; toasts + loading; optimistic create/delete if feasible.
- **Integration**: Confirm classes consume instructor IDs/options.
- **Done**: CRUD works against Supabase; page is live (no dummy data); availability/status visible; profile pane updates.

## B. Groups (after instructors)

- **Service CRUD**: Implement/verify list/get/create/update/delete + status/availabilityNote, manage student-group membership, and groupId on classes in [`src/services/groups.ts`](src/services/groups.ts).
- **Admin UI wiring**: Update [`src/pages/admin/Groups.tsx`](src/pages/admin/Groups.tsx) to list/search/filter, create/edit/delete, show members, attach group to theory classes.
- **Validation & UX**: Require name/capacity/status; toasts + loading; optimistic create/delete if feasible.
- **Integration**: Ensure classes bind groupId for theory; groups surface as options.
- **Done**: CRUD works against Supabase; page live (no dummy data); membership/theory assignments reflected.