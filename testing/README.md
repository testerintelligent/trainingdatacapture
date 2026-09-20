# testing

Playwright API scripts that push sample data into the `trainingdatacapture`
back-end, for exercising the `/api/trainings` and `/api/candidates`
endpoints (and seeding a dev database with realistic-looking data).

These are pure HTTP/API tests (Playwright's `request` fixture) — no browser
is launched, so there's no need to run `npx playwright install`.

## Setup

```bash
cd testing
npm install
```

## Before running

The back-end must be running and reachable, and pointed at a database
you're OK writing this sample data into:

```bash
cd ../back-end
npm run dev   # or: npm start
```

By default the scripts target `http://localhost:5002` (the back-end's
default `PORT`). Override with `API_BASE_URL` if yours is different:

```bash
API_BASE_URL=http://localhost:5002 npm run seed
```

## Usage

```bash
npm run seed              # push sample trainings AND candidates
npm run seed:trainings    # push sample trainings only
npm run seed:candidates   # push sample candidates only
```

Sample payloads live in `fixtures/sample-data.ts` — edit them there to
change what gets pushed. Field names/required-ness are kept in sync with
the Mongoose schemas in `back-end/index.js` (`trainingSchema` /
`candidateSchema`); update both together if those schemas change.

Each test run creates new records (the backend doesn't dedupe), so re-running
`npm run seed` repeatedly will insert duplicates — delete unwanted records
via the app's UI/API, or vary `fixtures/sample-data.ts`'s ids, if you don't
want that.
