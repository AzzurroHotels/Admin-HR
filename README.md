# CBIT Workspace — GitHub and Supabase Setup

This package is configured for:

- Main System: authentication and application database
- File Storage: evaluation images and videos
- GitHub Pages: static frontend hosting

The package contains no employee records, roster assignments, evaluations, tasks, published rosters, or sample user accounts.

## 1. Main System project

Open the Main System SQL Editor and run, in order:

1. `supabase/main_system_setup.sql`
2. `supabase/main_system_property_seed.sql`

The property seed adds only roster property, role, and shift templates. It does not add staff or assignments.

If any trial records were previously added, run:

1. `supabase/remove_all_test_data.sql`
2. `supabase/main_system_property_seed.sql`

In Authentication > Users, create the initial account:

- Email: `alvinrustia@azzurrohotels.com`
- Password: set a strong, unique production password
- Confirm the email when creating the account

Then run:

3. `supabase/promote_initial_admin.sql`

All later Admin and Manager accounts must be created from User Management.

## 2. File Storage project

Open the File Storage SQL Editor and run:

- `supabase/file_storage_setup.sql`

This creates the private `evaluation-evidence` bucket. Browser access is intentionally disabled.

If trial files were uploaded previously, delete them from the `evaluation-evidence` bucket before entering live data.

## 3. Deploy Main System Edge Functions

Install the Supabase CLI, sign in, and link the Main System project:

```bash
supabase login
supabase link --project-ref erjpypkktehzlsotopew
```

Deploy both functions:

```bash
supabase functions deploy manage-user
supabase functions deploy evidence
```

The `evidence` function needs secure access to File Storage. Copy the File Storage service-role key from Project Settings > API. Do not put it in GitHub or `config.js`.

Set these secrets on Main System:

```bash
supabase secrets set FILE_STORAGE_URL=https://egxojiqxnppxflmojjze.supabase.co
supabase secrets set FILE_STORAGE_SERVICE_ROLE_KEY=PASTE_FILE_STORAGE_SERVICE_ROLE_KEY_HERE
```

Redeploy the evidence function:

```bash
supabase functions deploy evidence
```

## 4. Authentication URL settings

In Main System > Authentication > URL Configuration:

- Set Site URL to the final GitHub Pages address
- Add the same address under Redirect URLs

## 5. Publish to GitHub Pages

Upload this package to the repository root.

In GitHub:

1. Open Settings > Pages
2. Select Deploy from a branch
3. Select the `main` branch and `/root`
4. Save

The anon keys in `config.js` are public browser keys. Never add a service-role key, database password, or JWT secret to the repository.

## Project responsibility split

### Main System

- Login and sessions
- Admin and Manager roles
- Staff records and employment status
- Tasks and updates
- Evaluations and evidence metadata
- Rostering and Excel imports
- Published roster snapshots

### File Storage

- Evaluation pictures
- Evaluation videos

## Production acceptance test

Before entering live information, verify:

- Admin login
- Manager restrictions
- User creation in User Management
- Staff creation and Active/Inactive changes
- Multiple same-day evaluations and consolidated export
- Image/video upload, opening, and removal
- Excel and CSV roster import
- Multiple employees in one shift
- Moving assignments between shifts
- Roster publishing and public viewing
