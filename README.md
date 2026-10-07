# Gym Workout Tracker

A university project with a React + Vite frontend and a Next.js API backend. MongoDB stores users and workouts through Mongoose. Passwords are hashed with bcryptjs; JWTs authenticate workout requests.

## Features

- Registration, login, logout, and protected pages.
- Dashboard with total workouts, sets, duration, calories, and recent workouts.
- Add, edit, delete, search, and filter workouts.
- Statistics with overall totals and a Monday-to-Sunday breakdown for the current week.
- Responsive desktop and mobile layout with loading, empty, and error states.
- User-scoped API access: every workout query uses the authenticated user's ID.

A workout record represents one exercise entry. Duration is in minutes, weight in kilograms, and calories in kcal. Use zero for measurements that do not apply. Dates represent a calendar day; a future date is allowed. No demo accounts or seeded workouts are included.

## Run locally

Use Node.js 22.12+ and npm. You also need a running MongoDB instance, either locally or MongoDB Atlas. Dependencies are installed in this workspace; `npm ci` reinstalls them from each lockfile when needed.

From the project root, create your environment files:

```sh
cp gym-tracker-backend/.env.example gym-tracker-backend/.env.local
cp gym-tracker-frontend/.env.example gym-tracker-frontend/.env
```

Edit `gym-tracker-backend/.env.local`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/gym-workout-tracker
JWT_SECRET=YOUR_GENERATED_SECRET
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

The MongoDB URI above requires an existing local MongoDB server. For Atlas, use your cluster's connection string, configure database credentials, and allow your machine's IP in Atlas. Generate your own secret of at least 32 characters:

```sh
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Paste that result into `JWT_SECRET`. Never commit real environment files. No database URI or secret is hardcoded into the application.

Frontend `gym-tracker-frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:3000/backend/api
```

Start the backend in terminal 1:

```sh
cd gym-tracker-backend
npm run dev
```

Start the frontend in terminal 2, from the project root:

```sh
cd gym-tracker-frontend
npm run dev
```

Open **http://localhost:5173**, register an account, and log in. The backend is at http://localhost:3000/backend; http://localhost:3000/backend/api/health checks that the HTTP server is running (it does not check database readiness).

`FRONTEND_URL` must match the browser's exact origin, including scheme and port. Prefer `localhost` consistently instead of mixing it with `127.0.0.1`. Restart the backend after environment changes. Restart Vite after changing its `.env` file. Alternatively, `VITE_API_URL=/backend/api` uses Vite's development proxy.

## Structure

```text
gym-tracker-frontend/
  src/
    components/   Shared layout, table, totals, and status components
    context/      Authentication and workout state
    pages/        Login, Register, Dashboard, form, History, Statistics
    services/     API client and statistics helpers
    styles/       Responsive CSS
  tests/          Statistics tests
  Dockerfile
  nginx.conf
  .env.example
  .dockerignore

gym-tracker-backend/
  src/
    app/api/
      auth/register/  POST registration
      auth/login/     POST login
      auth/me/        GET current user
      workouts/       GET list, POST create
      workouts/[id]/  PUT update, DELETE remove
      health/         GET server status
    lib/          Cached MongoDB connection, JWT, validation, API/CORS helpers
    models/       Mongoose User and Workout schemas
  public/
  tests/          HTTP/database integration checks
  Dockerfile
  .env.example
  .dockerignore

nginx/            Reverse proxy and future HTTPS instructions
docker-compose.yml
.env.example      Docker runtime settings and frontend build argument
```

`User` contains `name`, `email`, a hashed `password`, and `createdAt`. `Workout` contains `userId`, `exercise`, `category`, `sets`, `reps`, `weight`, `duration`, `calories`, `date`, and `createdAt`. Categories are Strength, Cardio, Flexibility, and Other. Sets and reps must be non-negative integers; weight, duration, and calories must be non-negative numbers.

## Authentication and API

Login returns `{ token, user }`. The frontend keeps the JWT in `sessionStorage` for the current browser tab and sends `Authorization: Bearer <token>`. Tokens expire after seven days. Session restoration checks `/api/auth/me`; expired or invalid tokens clear the session and redirect to login. Logout clears the token and user state. Closing the tab ends the stored session.

Registration returns a public user object and asks the user to log in. Passwords never appear in API responses. Workout creation ignores supplied ownership fields; updates and deletion always require both the workout ID and authenticated user ID. Attempts to change or delete another user's workout return 404.

The API returns JSON errors as `{ error: "message" }`. Browser origins are restricted to `FRONTEND_URL`. Backend secrets never belong in `VITE_` variables, which are public frontend build settings.

## Validation commands

```sh
cd gym-tracker-frontend
npm test
npm run build
```

In a separate terminal from the root:

```sh
cd gym-tracker-backend
npm run build
```

To repeat API integration tests, start the backend using a **disposable test database**, set its `MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL` in `.env.local`, then run from the backend folder:

```sh
npm run test:integration
```

The test uses uniquely named test accounts and removes those accounts and their workouts when `MONGODB_URI` is configured. `TEST_API_URL` optionally selects another API endpoint, including `http://localhost:5173/backend/api` for Vite proxy testing. The database connection and secret must match the running backend. These are real HTTP and MongoDB tests, not mocked persistence.

During implementation, authentication, hashing, CRUD, ownership restrictions, JWT rejection, and CORS were checked against a temporary MongoDB instance. Browser checks exercised registration, login, create/edit/delete, dashboard totals, weekly statistics, mobile layout, session restoration, logout, and invalid-session handling. Temporary test tools/data were removed afterward. See `VALIDATION.md` for results and limits.

## Docker preparation

The frontend uses a Node 22 Alpine build stage and Nginx Alpine runtime. `VITE_API_URL` is a public build argument: changing it requires rebuilding the frontend image.

The backend uses Node 22 Alpine stages and Next.js standalone output. MongoDB credentials and JWT secrets are supplied at runtime through Compose. `.dockerignore` files exclude all environment files, local dependencies, caches, and build outputs from image contexts.

To use Docker after installing Docker Engine/Desktop and the Compose plugin, from the project root:

```sh
cp .env.example .env
```

Edit this **root** `.env`:

- `MONGODB_URI`: a database reachable from the backend container. Container `localhost` is not your computer; for a host MongoDB on Docker Desktop, use `host.docker.internal` with appropriately configured MongoDB networking. Atlas is another option.
- `JWT_SECRET`: your generated secret, at least 32 characters.
- `FRONTEND_URL`: `http://localhost` for local Compose, or `http://ogk-gym-tracker.koreacentral.cloudapp.azure.com` for your VM (switch to HTTPS after TLS setup).
- `VITE_API_URL`: keep `/backend/api` for the reverse proxy.

Then run:

```sh
docker compose config --quiet
docker compose up --build -d
```

Open http://localhost. Check http://localhost/backend/api/health. Compose runs **frontend**, **backend**, and the **nginx reverse proxy**; MongoDB is supplied separately. Backend and frontend ports are internal to the Compose network.

Routing:

- `/` → frontend Nginx, which supports React Router deep links.
- `/backend/` → Next.js, with the prefix preserved; `/backend/api/workouts` reaches Next.js at `/backend/api/workouts`.
- `/.well-known/acme-challenge/` → the future Certbot webroot.

Ports 80 and 443 are mapped. HTTP works with the supplied configuration; **HTTPS remains inactive until a real domain and certificates are configured**. Certificate directories are mounted and ignored by Git. Follow [nginx/HTTPS.md](nginx/HTTPS.md) for the later DNS, Certbot, TLS, and renewal steps. The supplied DNS hostname is configured. Azure HTTP deployment is complete; HTTPS is now enabled with Let’s Encrypt.

Docker remains unavailable on the local development computer. Docker Engine and Compose have now been installed on the Azure VM; both images built successfully, all three containers started, and Nginx/public HTTP route checks passed. See [DEPLOYMENT.md](DEPLOYMENT.md) for successful database/API checks and HTTPS status.

References: [Next.js standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output), [Nginx proxy URI behavior](https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_pass).

## Your VM hostname

Production hostname: `ogk-gym-tracker.koreacentral.cloudapp.azure.com`. Nginx and the root environment example use this name. Next.js uses `next.config.mjs` with standalone output and `basePath: "/backend"`. API routes are now under `/backend/api` in both local and Docker environments.

Use the root `.env` for Compose runtime secrets, separately from the backend local-development `.env`. Set `FRONTEND_URL=http://ogk-gym-tracker.koreacentral.cloudapp.azure.com` initially, then change it to `https://ogk-gym-tracker.koreacentral.cloudapp.azure.com` after installing TLS certificates. The frontend build argument remains `/backend/api`. Add the VM’s public outgoing IP to the MongoDB Atlas access list before running the backend on the VM.

The source has been pushed to GitHub and cloned onto the VM. Both images have been built and Compose is running. HTTPS has been activated with Let’s Encrypt; renewal is scheduled twice daily.
