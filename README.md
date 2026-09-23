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

## How the queue logic works

Instead of a background job nudging a counter forward, "now serving" is
computed on read: given when the office opened, how many counters are open,
and the average minutes per vehicle (both configurable in `server/.env`), the
API derives which ticket number should currently be serving. Your position
in line is just `your ticket number − now serving`.

## 1. Backend setup

```bash
cd server
cp .env.example .env      # then edit JWT_SECRET and MONGODB_URI if needed
npm install
npm run dev                # starts on http://localhost:5000
```

Requires a running MongoDB instance. Easiest local option:

```bash
docker run -d -p 27017:27017 --name queueskip-mongo mongo:7
```

Or use a free MongoDB Atlas cluster and paste its connection string into
`MONGODB_URI`.

## 2. Frontend setup

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev                # starts on http://localhost:3000
```

## 3. Try it out

1. Open http://localhost:3000 and create an account.
2. Add a vehicle from the dashboard.
3. Pull a token — you'll get a ticket like `MC-014`.
4. Visit **My tokens** to see your live position, estimated wait, and cancel
   if needed. Positions refresh automatically every 20 seconds.

## Notes on the demo tech choices

- **Auth**: email/password with bcrypt hashing + JWT, no third-party auth
  provider required.
- **Photos**: the schema has a `profilePhotoUrl` / vehicle photo field ready
  to wire up to any object storage (S3, Cloudinary, etc.) — file upload isn't
  implemented in this prototype.
- **Queue simulation**: throughput (`AVG_SERVICE_MINUTES`, `COUNTERS_OPEN`)
  and office hours (9am–5pm, in `queueController.js`) are just constants you
  can tune to model a real center.
