# HRMS wireframe (frontend only)

Interactive UI wireframe for the HRMS product. The Laravel **`hrms`** folder in this workspace is **read-only reference** (templates, UX patterns, Filament CRUD). All development for the wireframe happens here.

## Client inputs (repo root)

| File | Used for |
|------|-----------|
| `HRMS_Developer_Sprint_Guide.docx` | Sprint/module catalogue → `/modules` |
| `Master Data updated on 30 April, 2026.xls` | `MasterList` sample rows → `src/data/clientMasterList.json` (see script below) |
| `Organogram_NAVTTC HQs_2026.pdf` | Copied to `public/organogram-navttc-hq-2026.pdf` → `/organogram` |

Regenerate JSON after editing the Excel file:

```bash
python scripts/export_masterlist_json.py
```

Optional: re-extract text from all three sources into `hrms-wireframe/docs/_extracted_sources.txt`:

```bash
python scripts/extract_client_docs.py
```

## Run locally

```bash
cd hrms-wireframe
npm install
npm run dev
```

Build: `npm run build` · Preview build: `npm run preview`

Open `/login` (unauthenticated users are redirected there). UI colours and login layout follow `hrms/resources/views/filament/auth/login.blade.php` (blues **#4B62BE** / **#2F4798**, Plus Jakarta Sans).

## Mock authentication & roles

- Session is stored in **`sessionStorage`** (key `hrms_wireframe_session_v3` in `src/auth/types.ts`). Sign out clears it.
- **339 MasterList rows** imported into `src/data/clientMasterList.json` (regenerate: `python scripts/export_masterlist_json.py` from repo root).
- **Client roles** (organogram): Executive Director, Director General, Director, Deputy Director, Assistant Director, AAO (Accounts), AAO (Finance), and **Employee** (ESS portal for all staff designations).
- **Demo accounts** live in `src/auth/mockUsers.ts` (built from `src/auth/clientRoles.ts`). Password for every account: **`11223344`**.
- **Role → permissions** map: `src/auth/rolePermissions.ts` (wireframe defaults; adjust with client).

| Role | Example username | Wireframe access (summary) |
|------|------------------|----------------------------|
| Executive Director | `executive.director` | Full |
| Director General | `director.general` | Full |
| Director / Deputy Director / Assistant Director | `director`, `deputy.director`, `assistant.director` | HR modules + write |
| AAO (Accounts) / AAO (Finance) | `aao.accounts`, `aao.finance` | Dashboard, HR lists (read), planning & master data |
| Employee (per designation) | `emp.driver`, `emp.deo`, … | Dashboard only (ESS screens TBD) |

Employee designations (18 demo logins): Private Secretary, APS, Librarian / Building Care Taker, MTO, Cashier, Assistant, Stenotypist, DEO, Receptionist, Hardware Technician, General Maintenance Worker, Dispatch Rider, Driver, DMO, Electrician, Naib Qasid, Chowkidar, Sanitary Workers — usernames `emp.<slug>` (see login table).

On the login screen, click **Show role cred** (below the Login button) for the full list.

## Data

- `src/data/clientMasterList.json` — first 35 rows of **MasterList** (generated).
- `src/data/clientDataset.ts` — builds **departments** (centres), **designations** (per centre + title + BPS), and **employees** for the UI.
- `src/data/mock.ts` — re-exports the dataset for existing screens.

## Routes

| Path | Screen |
|------|--------|
| `/login` | Sign-in + credential reference |
| `/access-denied` | Missing permission |
| `/dashboard` | Summary cards + recent employees (if allowed) |
| `/employees` | Roster (client sample) |
| `/employees/new` | Create form (alert only) |
| `/employees/:id` | Detail (`m-<S.#>`) |
| `/employees/:id/edit` | Edit form |
| `/departments` | Centres / org units |
| `/designations` | Sanctioned posts by centre |
| `/roadmap` | Delivery phases + links |
| `/modules` | Four-sprint module catalogue (from developer guide) |
| `/organogram` | Embedded HQ organogram PDF |
| `/master-data` | Workbook tab index + regen notes |

## Next steps

- Mirror new **`hrms`** Filament resources as routes + permission keys + mock slices.
- Replace mock auth with your real API / OIDC when backend is ready.
