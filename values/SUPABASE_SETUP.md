# Wiring up Supabase

## 1. Create the project
1. Go to supabase.com, create a new project.
2. In **Project Settings → API**, copy the **Project URL** and the **anon public** key.

## 2. Set env vars
Copy `.env.example` to `.env` in your project root and fill in the two values
from step 1:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

Add `.env` to your `.gitignore` if it isn't already there.

## 3. Run the schema
In the Supabase dashboard, go to **SQL Editor**, paste the contents of
`supabase/schema.sql`, and run it. That creates the `days` and `vehicles`
tables with row-level security so each user can only ever see their own data.

## 4. Enable email auth
In **Authentication → Providers**, make sure **Email** is enabled (it is by
default). By default Supabase requires email confirmation before a new
account can sign in — you can turn that off in **Authentication → Settings**
if you'd rather test without checking your inbox for every account.

## 5. Install the client + drop in the files
```
npm install @supabase/supabase-js
```

Then add these files to your project (paths relative to `src/`):
- `lib/supabaseClient.ts`
- `hooks/useAuth.ts`
- `hooks/useCloudPersistedAppState.ts`
- `components/LoginScreen.tsx`
- `vite-env.d.ts` (skip this if your project already has one from the Vite
  scaffold — just merge the `ImportMetaEnv` fields in if so)

Replace `src/App.tsx` with the updated version — it now uses `useAuth` +
`useCloudPersistedAppState` instead of the old `usePersistedAppState`, so you
can delete `hooks/usePersistedAppState.ts` once you're on this version.

## How it behaves
- **Sign up / sign in** — email + password, shown as a full-screen form when
  no one's logged in.
- **Calendar view** — on login, the app instantly renders whatever's cached in
  localStorage, then fetches the lightweight list of dates you have data for
  in the background (just dates, no vehicle data) so the calendar's dots stay
  in sync across devices.
- **Opening a day** — the first time you open a given date, its vehicles get
  fetched from Supabase. After that it's cached locally, so reopening the
  same day later is instant.
- **Edits** — every change (add/edit/delete/import/mark went-down-the-line)
  updates local state and localStorage immediately, so the UI never waits on
  the network. Changes are pushed to Supabase in the background, debounced by
  about half a second.

## Known limitations (v1)
- **Last-write-wins.** If you edit the same vehicle from two devices within
  the same sync window, whichever write reaches Supabase last simply
  overwrites the other. There's no merge or conflict warning.
- **Import to a non-active date** kicks off a fetch for that date but doesn't
  wait for it before merging — if you import into a date you haven't opened
  yet on this device, and that date already has cloud data, the import could
  merge against a stale (empty) local copy. Importing into the date you're
  currently viewing (the common case) is unaffected.
- Deletions are pushed immediately as they happen but aren't retried if that
  specific request fails offline (it'll log an error to the console).

None of these are hard to close up — happy to build out proper conflict
handling or an offline write queue once you've had a chance to use this for a
bit and see what actually matters in practice.
