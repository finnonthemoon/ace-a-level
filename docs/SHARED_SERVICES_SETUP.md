# Shared Supabase and RevenueCat setup

ACE A Level uses the same Supabase and RevenueCat projects as ACE TMUA, but it remains a separate App Store and Play Store application.

## Supabase

1. Reuse the existing project URL and publishable key in `.env.local`.
2. Treat `supabase/migrations/20260924000000_a_level_foundation.sql` as the reviewed draft. Because the database is shared, keep one canonical migration history: currently that should remain the ACE TMUA repository. Copy this migration into that repository's `supabase/migrations` directory and deploy from there. Do not run two independent `supabase db push` histories against the same production project.
3. In Authentication → URL Configuration, retain every TMUA redirect and add `acealevel://auth/callback`.
4. Add the eventual A-level web callback URL separately when its domain is known.
5. The existing `confirm-email` Edge Function currently redirects only to `acetmua://auth/callback`. Before A-level email sign-up ships, replace that hard-coded destination with a strict allow-list that selects either `acetmua://auth/callback` or `acealevel://auth/callback`; never accept an arbitrary redirect URL.
6. In Google Cloud, create an iOS OAuth client for `com.aceitstudios.acealevel`. In Supabase's Google provider, retain the web client first and add all accepted native client IDs as a comma-separated list.
7. In Apple Developer → Certificates, Identifiers & Profiles, enable Sign in with Apple for the new App ID and group it with the existing TMUA primary App ID. In Supabase's Apple provider, retain the Services ID first and add the new native App ID to the Client IDs list.
8. Use the Supabase Auth user UUID as the RevenueCat App User ID in both apps. This is what lets the same signed-in person be recognised across products.

The live TMUA `entitlements` table and its RevenueCat Edge Functions are hard-coded for `AceTMUA Pro` and store only one row per user. Do not change their `REVENUECAT_ENTITLEMENT_ID` secret. The migration adds a separate `a_level_entitlements` table; before A-level purchases ship, deploy dedicated A-level webhook and sync functions that read `Ace A Level Pro` and write only that table.

The migration creates only `a_level_*` tables and does not modify existing TMUA progress.

## RevenueCat

1. Open the existing RevenueCat project.
2. Add a new iOS app with bundle ID `com.aceitstudios.acealevel`.
3. Add a new Android app with package `com.aceitstudios.acealevel`.
4. Copy each new app's public SDK key into the A-level EAS environment variables.
5. Create an entitlement named `Ace A Level Pro` unless the business intentionally wants all TMUA purchasers to receive A-level Premium.
6. Create A-level App Store and Play products, import them into RevenueCat, and attach them to `Ace A Level Pro`.
7. Create an A-level offering and paywall. Keep the existing TMUA offering unchanged.
8. Confirm Project settings → Restore behavior matches the account model before testing cross-device restoration.

RevenueCat entitlements are shared across apps in one RevenueCat project. Attaching the existing TMUA product to `Ace A Level Pro` would retroactively grant A-level access to previous TMUA purchasers. Do this only if it is the intended commercial promise.

## EAS and stores

1. Create/link a new EAS project from this repository; do not reuse the TMUA EAS project ID.
2. Create a new App Store Connect app for `com.aceitstudios.acealevel`.
3. Create a new Play Console app for `com.aceitstudios.acealevel`.
4. Add the resulting App Store Connect app ID to `eas.json` only after the listing exists.
5. Configure the A-level URLs, OAuth clients, public Supabase values, and RevenueCat SDK keys in each EAS environment.

Never put Supabase service-role keys, RevenueCat secret keys, or OAuth client secrets in an `EXPO_PUBLIC_*` variable.
