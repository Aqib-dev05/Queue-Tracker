# QueueSkip

A digital queue system for vehicle MTAG registration — register a vehicle, pull a
queue token, and watch your position update instead of standing in line.
Built as a MERN-adjacent stack: **MongoDB, Express, Next.js, Tailwind CSS**.

This is a demo/prototype, not affiliated with any traffic police department.

## Structure

```
queueskip/
├── server/     Express + MongoDB API (auth, vehicles, queue tokens)
└── client/     Next.js 14 (App Router) + Tailwind CSS frontend
```

## How the queue works

Every day starts a fresh queue. Pulling a token gives the next number (001, 002, ...).
"Now serving" is **controlled by the admin**: each press of *Call next token* in
the admin panel moves it forward by one. The new number is pushed to every open
browser with **Socket.io**, so the home page, *My tokens* and the admin panel
all update instantly, with no refresh. (A refetch every 2 minutes is only a safety net.)

## 1. Backend setup

```bash
cd server
cp .env.example .env      # then set JWT_SECRET, ADMIN_EMAIL and ADMIN_PASSWORD
npm install
npm run dev                # starts on http://localhost:5000
```

Requires a running MongoDB instance. Easiest local option:

```bash
docker run -d -p 27017:27017 --name queueskip-mongo mongo:7
```

Or use a free MongoDB Atlas cluster and paste its connection string into
`MONGODB_URI`.

The admin account is created automatically from `ADMIN_EMAIL` and
`ADMIN_PASSWORD` every time the server starts.

## 2. Frontend setup

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev                # starts on http://localhost:3000
```

## 3. Try it out

1. Open http://localhost:3000 and create an account.
2. Add a vehicle from the dashboard, then pull a token (e.g. `MC-003`).
3. In another browser window, sign in with the admin email and password. You land on the admin panel.
4. Press **Call next token**. The home page board and your ticket update live.

## Deploying

The client (Netlify) and the API must be hosted separately, and the API host
must support WebSockets (Render, Railway, Fly.io, a VPS, ...).

- Client: set `NEXT_PUBLIC_API_URL` to `https://<your-api-host>/api`.
  Without it the site tries `localhost:5000` and login cannot work.
- Server: set `CLIENT_ORIGIN` to your Netlify URL (several allowed, comma separated),
  plus `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Notes

- **Auth**: email/password with bcrypt hashing + JWT. The admin role is stored
  in the database and checked on every admin request. Signing up can never create an admin.
- **Photos**: the schema has a `profilePhotoUrl` / vehicle photo field ready
  to wire up to any object storage (S3, Cloudinary, etc.). File upload isn't
  implemented in this prototype.
- **Estimated wait**: people ahead x `AVG_SERVICE_MINUTES` (set in `server/.env`).
