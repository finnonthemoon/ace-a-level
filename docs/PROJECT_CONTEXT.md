# ACE A Level project context

This document is the durable handoff for future Codex tasks. It records decisions and facts that are not obvious from individual source files. Update it when a decision changes; do not treat old chat transcripts as the source of truth.

## Product direction

ACE A Level is a separate App Store and Play Store application from ACE TMUA. It is not a replacement or an umbrella update to the existing TMUA listing.

The decision to keep separate applications was made because ACE TMUA already has approximately:

- 600 users;
- 12 store reviews;
- £400 in purchases.

Those users acquired a focused admissions-test product. Preserve its listing, content, purchases, reviews, and product promise. The broader ACE ecosystem may share engineering, accounts, infrastructure, and cross-promotion without putting every qualification in one binary.

Expected product family:

```text
ACE platform
├── ACE TMUA
├── ACE A Level
└── ACE GCSE (later)
```

## Initial A-level scope

The first subjects are:

1. Mathematics
2. Physics
3. Biology
4. Chemistry
5. Computer Science
6. Economics

A learner's active study plan contains 3–5 subjects. Onboarding enforces this range, while the main experience combines an all-subject dashboard with a single active subject for focused Learn and Practice views.

The app should be exam-board-ready even when early content is temporarily board-neutral. Use this content hierarchy:

```text
Qualification
└── Subject
    └── Specification / exam board
        └── Module or assessment component
            └── Topic
                ├── Lessons
                └── Practice questions
```

Do not duplicate per-subject screen implementations. Subject definitions and topic metadata should drive shared Home, Learn, Practice, and Profile experiences.

## Current repository state

The repository was bootstrapped from the proven ACE TMUA Expo foundation without copying the TMUA curriculum or competitive question banks.

Implemented:

- Expo SDK 57 and Expo Router;
- separate A-level app identity;
- first-launch subject selection and exam-year choice;
- central registry for six subjects and starter topic outlines;
- Home, Learn, Practice, and Profile tabs;
- a blue visual system derived from the proven ACE TMUA card, spacing, and hierarchy patterns;
- a multi-subject dashboard and 3–5-subject onboarding model;
- active-subject switching;
- local study-plan persistence under an `@ace-a-level/...` namespace;
- email account creation, sign-in, password recovery, and session handling;
- signed-in course-plan synchronisation through `a_level_user_settings` and `a_level_subject_selections`;
- Supabase and RevenueCat configuration points;
- a draft, isolated `a_level_*` database migration;
- documentation for shared-service setup.

Not yet implemented:

- social sign-in and the final cross-product account-deletion lifecycle;
- production RevenueCat paywall and purchase flow;
- dedicated A-level RevenueCat webhook/sync functions;
- exam-board selection and target-grade editing;
- the reusable lesson engine port;
- production lesson and question content;
- the practice runner and assessment formats;
- final A-level branding, icon, legal URLs, or store metadata;
- ranked mode, friend duels, or competitive leaderboards.

Before implementation work, inspect `README.md` and the relevant source rather than assuming the app has feature parity with ACE TMUA.

## App identity

The current proposed identifiers are:

```text
Display name:     Ace A Level
Expo slug:       ace-a-level
Deep-link scheme: acealevel
iOS bundle ID:   com.aceitstudios.acealevel
Android package: com.aceitstudios.acealevel
```

Confirm identifiers before creating permanent store records. Never copy the TMUA EAS project ID, App Store Connect app ID, bundle ID, package, or deep-link scheme.

## Relationship to ACE TMUA

The local ACE TMUA source repository is currently:

```text
/Users/finn/Documents/ace-tmua/ace-tmua
```

Use it as a reference for proven patterns such as lesson playback, mathematical rendering, practice sessions, authentication, subscriptions, notifications, analytics, security, and account deletion. Port only what the A-level product needs, removing TMUA-specific language and assumptions.

Do not copy:

- TMUA lesson/question content;
- Paper 1/Paper 2 assumptions;
- the 1–9 TMUA target score;
- October/January sitting choices;
- university-choice onboarding;
- `@ace-tmua/...` storage keys;
- TMUA app/store identifiers;
- TMUA RevenueCat entitlement defaults;
- ranked pools until an A-level competitive product is deliberately designed.

## Architecture direction

Organise new code around three conceptual layers:

```text
src/
  core/       reusable lesson, practice, account, and sync engines
  product/    A-level identity, subjects, policies, and configuration
  content/    specification, topic, lesson, and question data
```

The current repository is still a small foundation and does not yet contain every directory. Introduce them as real responsibilities emerge; do not create empty abstraction layers merely to match the diagram.

Primary configuration sources:

- `src/product/config.ts` — product identity and storage namespace;
- `src/product/subjects.ts` — subject and topic registry;
- `src/contexts/CourseContext.tsx` — local course selections and active subject;
- `app.json` — Expo and platform identity;
- `.env.example` — public runtime configuration contract.

## Shared Supabase decision

ACE A Level and ACE TMUA will use the same Supabase project and therefore the same authentication user pool.

Isolation rules:

- A-level progress lives in dedicated `a_level_*` tables.
- Existing TMUA tables and policies remain intact.
- The Supabase Auth user UUID is the cross-product user identity.
- Each installed app uses its own local auth storage key.
- Keep a single canonical database migration history. For now, the ACE TMUA repository is canonical; a shared backend repository may replace this later.
- Do not run two independent `supabase db push` histories against production.

The draft migration is at `supabase/migrations/20260924000000_a_level_foundation.sql`. It must be reviewed and copied into the canonical migration history before deployment.

The existing TMUA email-confirmation function redirects to `acetmua://auth/callback`. Before A-level email sign-up ships, replace that hard-coded behavior with a strict two-app allow-list. Never accept arbitrary redirect destinations.

## Shared RevenueCat decision

Use the existing RevenueCat project but add separate iOS and Android app records for ACE A Level. Each app/platform receives its own public SDK key.

The current commercial default is separate Premium access:

```text
TMUA entitlement:    AceTMUA Pro
A-level entitlement: Ace A Level Pro
```

Do not attach existing TMUA products to `Ace A Level Pro` unless the business explicitly decides that previous TMUA purchasers should receive A-level Premium. RevenueCat entitlement changes may affect past purchasers.

The existing Supabase `entitlements` table and TMUA RevenueCat functions support only `AceTMUA Pro`. A-level server-side access must use `a_level_entitlements` plus dedicated A-level webhook/sync functions. Do not change the TMUA function secret to the A-level entitlement.

Use the same Supabase user UUID as the RevenueCat App User ID in both apps.

## Recommended implementation order

1. Confirm identifiers, service setup, and entitlement policy.
2. Finish authentication (social sign-in and deletion policy); email authentication and course-plan sync are implemented.
3. Implement dedicated A-level RevenueCat functions and purchase state.
4. Add exam-board/specification and target-grade selection.
5. Port the generic lesson player and extend its content types.
6. Deliver one complete Mathematics topic end to end.
7. Generalise the practice engine beyond TMUA paper assumptions.
8. Add Physics to exercise equations, units, diagrams, and practical content.
9. Add Chemistry, Biology, Computer Science, and Economics through the same content pipeline.
10. Reassess which code is genuinely reusable before extracting an ACE shared package for GCSE.

## Subject-specific content requirements

The generic lesson system will eventually need to support:

- LaTeX and mathematical notation;
- labelled images and diagrams;
- tables, charts, and source material;
- scientific units and experimental-method panels;
- chemical equations and structures;
- code and pseudocode;
- multi-part and multi-mark questions;
- longer responses with mark schemes and model answers.

Avoid pretending that free-text extended answers can be reliably auto-marked before a reviewed marking design exists.

## Validation expectations

For implementation changes, run the checks relevant to the changed surface. The current baseline commands are:

```bash
npm run typecheck
npm run lint
npm run web:export
```

Future content validation should check unique IDs, parent relationships, reachable lessons, valid answers/marks, existing assets, satisfiable assessment blueprints, access policies, and the absence of accidental TMUA product references.

## Product decisions still open

Do not silently choose these during unrelated implementation work:

- which exam boards/specifications launch first;
- whether early content is board-neutral;
- A-level pricing and subscription periods;
- whether an eventual ACE all-access subscription exists;
- final app icon, name styling, domain, and legal URLs;
- whether competitive or community features belong in the first release;
- whether Supabase migrations move into a separate shared backend repository.

When one of these becomes necessary, present the concrete options and implications before encoding a difficult-to-reverse decision.
