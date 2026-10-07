# Validation — October 7, 2026

## Workflow retest — October 7, 2026

- Frontend statistics suite: all 3 tests passed. Frontend and backend production builds passed.
- Real HTTP/MongoDB integration suite: all 35 API checks passed; password hashing verified directly in MongoDB.
- Chrome workflow passed through the local Vite frontend and Next.js development API: register, log in, create a workout, search with matching/nonmatching text, filter by matching/nonmatching category, edit, review dashboard and weekly statistics, reload to restore the session, delete using the confirmation dialog, and log out.
- The test entry was recorded for October 7, 2026 with 3 sets, 10 reps, 45.5 kg, 25 minutes, and 150 kcal, then edited to 5 sets. Dashboard and statistics showed 1 workout, 5 sets, 25 minutes, and 150 kcal; the weekly chart placed the workout on Wednesday, October 7. After deletion, history was empty and all dashboard totals returned to zero.
- Logout cleared the session token; opening the protected dashboard afterward redirected to login. No browser console errors were found in the checked preserved messages.
- The integration suite cleaned up its test accounts and workouts. The browser test account and its workouts were also removed from the configured database.
- This retest did not exercise Docker, Nginx, HTTPS, Azure, or mobile layouts.

## Earlier validation

Checks completed against the final application:

- Frontend `npm test`: 3 statistics tests passed, covering totals, a week crossing the year boundary, and local date keys.
- Frontend `npm run build`: passed.
- Backend `npm run build`: passed, including Next.js standalone output and all API routes.
- Real MongoDB/HTTP integration suite: 35 checks passed against the development backend, through the Vite proxy, and against the final production standalone backend.
- API checks cover registration validation, duplicate email normalization, password hashing in MongoDB, login, public user responses, missing/invalid/expired/forged JWTs, CORS preflight, workout validation, CRUD, invalid IDs, and user ownership restrictions.
- Chrome browser checks passed for protected redirects, registration, login, creation/editing/deletion, dashboard totals, weekly statistics, mobile page overflow, searching, session restoration after reload, logout, and invalid-token cleanup. Requests used the configured absolute VITE_API_URL and exercised browser CORS. No uncaught browser JavaScript errors were reported.
- Desktop and mobile screenshots were visually inspected during testing.
- Source imports and route paths were reviewed. Dockerfile build stages, environment exclusions, and reverse-proxy prefix stripping were reviewed.

The MongoDB server, browser tools/profiles, generated test secrets, and test database were temporary and removed after validation. No permanent database or credentials have been provisioned. Configure your own MONGODB_URI and JWT_SECRET before running the application.

Docker and Nginx are not installed in this environment. Docker image builds, Compose startup, and Nginx runtime syntax/routing were not executed. HTTPS remains inactive pending a real domain and certificates. Azure deployment was not performed.

The path `o.html` was not changed. It was absent at the start of this continuation.

## Deployment configuration update

The DNS hostname has been configured and Next.js now uses `/backend` as its base path. The original full application integration results above predate this route-prefix change; current build and route checks are documented separately below.

After the DNS/base-path update, both production builds passed. Local HTTP checks confirmed `/backend/api/health` returns 200, `/backend/api/workouts` without authentication returns 401, and the old `/api/health` returns 404. The updated Vite `/backend` proxy also returned the backend health response successfully. Docker/VM/TLS checks remain pending.

## Azure Docker validation

Both Docker images built successfully on the Ubuntu 24.04 VM. Three Compose services started; the backend container is healthy. Nginx runtime syntax validation passed. Public HTTP frontend/deep-link, API health, unauthenticated workout rejection, invalid registration validation, and CORS preflight checks passed. After adding the VM IP to Atlas, the VM MongoDB connection and ping passed, and all 35 API integration checks passed against the public deployment. Test data was removed. TLS remains pending email and subscriber-agreement authorization. See DEPLOYMENT.md.

## HTTPS validation

A trusted Let’s Encrypt certificate was issued and activated. Public HTTPS frontend, deep-link, and backend health requests passed; HTTP redirects to HTTPS with status 308. All 35 API integration checks passed over HTTPS and test data was removed. Renewal is scheduled twice daily through root cron.

Certbot renewal dry run completed successfully against the staging service. The scheduled root cron entry was verified.
