# HASCare — Testing Guide

End-to-end guide to standing up the backend and app, and walking through every feature.

## 1. Start the backend

```bash
cd backend
npm run seed   # one-time / whenever you want fresh reference data
npm run dev
```

You should see `MongoDB connected` and `Server running on port 5000`. The DB is `has_db` on the Atlas cluster configured in `backend/.env`.

`npm run seed` creates (safe to re-run — it upserts/skips existing records):
- 1 superadmin
- 6 departments (with symptom keywords for the matching feature)
- 2 sample companies (for the Non-Payment classification test)
- 3 doctors, each with open slots every day of the week
- 2 nurses
- 1 receptionist

### Seeded credentials

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin | `admin@has.local` | `Admin@12345` | superadmin |
| Doctor | `doctor1@has.local` | `Doctor@123` | Dr. James Carter — Cardiology, ₹500 |
| Doctor | `doctor2@has.local` | `Doctor@123` | Dr. Priya Sharma — General Medicine, ₹300 |
| Doctor | `doctor3@has.local` | `Doctor@123` | Dr. Arjun Mehta — Orthopedics, ₹400 |
| Nurse | `nurse1@has.local` | `Nurse@123` | Staff ID `NR00001` |
| Nurse | `nurse2@has.local` | `Nurse@123` | Staff ID `NR00002` |
| Receptionist | `reception1@has.local` | `Recep@123` | Staff ID `RC00001` |

Patients have no seeded account — they self-register in-app (name, age, phone, **password**, etc.) and sign in with **phone + password**.

## 2. Start the app

```bash
cd android_app
npx expo run:android
```

Keep that terminal open — it hosts the Metro bundler the app needs to load its JS. If the app ever shows a red "Unable to load script" screen, this terminal died or the USB reverse tunnel is stale; run `adb reverse tcp:8081 tcp:8081` and relaunch.

If testing on a physical device (not the emulator), confirm `android_app/src/constants/config.js`'s `DEV_HOST` matches this machine's current LAN IP, and that the device is on the same network.

## 3. Core flow — walk it in this order

Each step unlocks the next; you can't skip ahead (no doctor to book until one exists, no UHID until vitals are recorded, etc).

```
Admin creates staff (Doctor/Nurse/Receptionist)      [already seeded]
        ↓
Patient registers (self or via Receptionist) → gets MR No + payment classification
        ↓
Receptionist/Admin assigns a Nurse (by Staff ID)
        ↓
Nurse records vitals → generates UHID + Token No
        ↓
Patient books: symptoms → matched department → doctor → slot → payment (if applicable) → confirmed
        ↓
Doctor sees the appointment → records consultation notes
        ↓
Admin views updated reports
```

### Step-by-step

1. **Register a patient** — Welcome → Get Started → Continue As → Patient → "New patient? Register here". Fill the form including a password. Leave Employer blank (→ `payment` category). Note the MR No shown on the success screen, then tap Continue (this signs you in with the phone + password you just set).

2. **Assign a nurse** — log out, Continue As → Hospital → Receptionist, sign in as `reception1@has.local`. Tap **Assign Nurse** → start typing the patient's MR No (a picker of matching patients appears — tap to select, or search manually) → enter Staff ID `NR00001` (also autocompletes).

3. **Record vitals** — log out, sign in as `nurse1@has.local`. Search the same patient (autocomplete works here too) → **Record Vitals** → fill weight/BP/temperature/height/pulse/blood group → Save. Note the UHID and Token No shown.

4. **Book an appointment** — log out, sign in as the patient (phone + password). Home now shows MR No / UHID / Token. Tap the hero card → enter symptoms like `chest pain, breathlessness` (matches Cardiology → Dr. James Carter) → pick a date/time (every seeded doctor has slots every day) → pay via any method (mocked, always succeeds) → confirmation screen.

5. **Consult** — log out, sign in as `doctor1@has.local`. The appointment appears on the home list → tap it → review vitals/symptoms → enter consultation notes → Complete Consultation.

6. **Check admin reports** — sign in as `admin@has.local`. Home shows updated patient count, revenue, staff counts, and appointment status breakdown. Also explore **Add Staff** (create a new doctor/nurse/receptionist — try adding availability slots for a doctor), **Staff** (toggle active/inactive), **Departments**, and **Companies**.

## 4. Edge cases worth exercising

- **Non-Payment path** — register a second patient with Employer = `Example Corp` or `Acme Industries`. After nurse vitals + doctor/slot selection, it should skip payment entirely and go straight to confirmed.
- **Symptom fallback** — during booking, enter nonsense symptoms (e.g. `qwertyxyz`). No department should match; you land on "browse all departments" instead of a dead end.
- **Receptionist walk-in registration** — Receptionist → **Register Patient** — same form as self-registration (including password), plus an inline "Assign a Nurse" step right after showing the new MR No.
- **Deactivate a staff member** — Admin → Staff → tap a doctor/nurse/receptionist's status pill to toggle active/inactive. An inactive account should be rejected on next login attempt (`403 Account is inactive`).
- **Wrong password** — try logging in (any role) with an incorrect password; should show a clear error, not crash.

## 5. Dark mode

Every screen (except none now — even the auth flow is theme-reactive) should render correctly in both themes.

- Tap the sun/moon icon on the Welcome screen or any role's Home screen to flip between light and dark. It's a straightforward two-state toggle — one tap always flips to the opposite of whatever is currently showing.
- Things to check per theme: card backgrounds vs text contrast (no dark-on-dark or light-on-light), the bottom tab bar (Patient role) matches the theme and isn't hidden behind the phone's gesture/button navigation, and icons (back button, notification bell, avatar circles) stay visible in both themes.
- The preference persists across app restarts.

## 6. Testing the backend directly (no app)

Everything is under `http://localhost:5000/api`. Quick example:

```bash
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","email":"admin@has.local","password":"Admin@12345"}'
# → copy the token, then:
curl -s http://localhost:5000/api/admin/reports \
  -H "Authorization: Bearer <token>"
```

Patient login uses a different endpoint and now takes a password instead of MR No:

```bash
curl -s -X POST http://localhost:5000/api/auth/patient-login \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999900001","password":"yourpassword"}'
```
