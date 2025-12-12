# design-system-refactor

You are refactoring this Expo + NativeWind app to unify the UI into a coherent design system.

Goal:
- Reduce visual inconsistency across screens and components.
- Create a small set of shared UI primitives and refactor existing components to use them.

Constraints:
- Do not change business logic unless explicitly required.
- Keep routing structure intact (expo-router).
- Use existing theme tokens from constants/theme (Colors, FontSizes).
- Keep code/comments/identifiers in English.
- Changes should be incremental and safe (avoid a giant rewrite in one step).

Process:
1) Audit current UI patterns and list inconsistencies (spacing, radii, shadows, typography, button styles, cards).
2) Propose a minimal design system (3–6 primitives) with exact responsibilities and props, e.g.:
   - Surface/Card
   - Button (Primary/Secondary)
   - SectionHeader
   - Chip/Badge
   - Divider
3) Choose where these primitives live (prefer `components/ui/`).
4) Implement the primitives first.
5) Refactor existing components screen-by-screen, starting with the most reused ones.
6) After each phase, provide a manual QA checklist (light/dark, iOS/Android, small/large screens).

Output format:
- Phase plan (with file list per phase)
- Final code for Phase 1 only (copy-paste ready)
- Stop and wait for confirmation before Phase 2
