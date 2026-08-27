# Cancer HMS

A hospital management system for cancer care: patient records, appointments, and billing, with role-based access (Admin, Doctor, Nurse, Receptionist) plus a patient self-service booking portal (Patient).

## Structure

- `client/` — React + Tailwind frontend (Vite), in plain JavaScript/JSX. Currently wired to an **in-browser mock API** (see below) so the UI is fully usable before the real backend exists.
- `server/` — not yet present. The backend will be built separately in **Java + Spring Boot + Maven**, backed by **PostgreSQL**. See [`API_CONTRACT.md`](./API_CONTRACT.md) for the REST contract the frontend expects.

## Running the frontend

```bash
pnpm install
pnpm dev
```

Opens at `http://localhost:5173`.

### Demo accounts (dummy data)

| Role         | Email                         | Password       |
|--------------|--------------------------------|----------------|
| Admin        | admin@cancerhms.local          | admin123       |
| Doctor       | doctor@cancerhms.local         | doctor123      |
| Nurse        | nurse@cancerhms.local          | nurse123       |
| Receptionist | reception@cancerhms.local      | reception123   |
| Patient      | patient@cancerhms.local        | patient123     |

Patients sign in to a self-service portal (book an appointment, view and manage their own bookings) and
cannot reach any staff screen. The seeded patient login is linked to the "John Doe" patient record.

Every account, staff or patient, gets **My profile** (`/profile`): change your own name, email and
password, and pick a light/dark/system theme. Changing a password in the mock API updates the seeded
account, so note the new one — there is no reset flow.

## Mock data layer

`client/src/mocks/` holds seed data and an in-memory store persisted to `localStorage`. `client/src/api/*.js` expose the same function signatures the real backend will be called through (`listPatients`, `createInvoice`, etc.). When the Spring Boot API is ready, only these `api/*.js` files need to change — swap the mock implementation for `axios` calls per [`API_CONTRACT.md`](./API_CONTRACT.md). No page or component code should need to change.

To reset the mock data to its seeded state, clear `localStorage` for the app (or run `resetMockDb()` from `client/src/mocks/db.js` in the browser console).
