// npm install dotenv if erroring here
// the env variables weren't working for me (owen) until I implemented this,
// possibly a Windows vs iOS issue?
require("dotenv").config({ quiet: true });

const express = require('express');
const session = require('express-session');
const cors = require("cors");
const sequelize = require('./src/db/database');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
require("./src/models/associations");

/* This module builds the app and exports it. It does NOT listen.

   Serverless platforms import this file and hand it requests themselves, so
   everything here has to be synchronous and reusable across invocations —
   no top-level await, no connection opened at boot. Sequelize connects lazily
   on the first query, which is what we want: a cold start that receives no
   database work should not pay for a connection.

   `npm run dev` still gets a real server: see the bottom of the file. */

const BE_PORT = process.env.BE_PORT || 5173;
const FE_PORT = process.env.FE_PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'http://localhost';
const IS_PROD = process.env.NODE_ENV === "production";

const app = express();

/* Behind a proxy (Vercel, and any CDN in front of it) the connection to Node
   is plain HTTP even though the browser is on HTTPS. Without this, the
   `secure: true` cookie below is judged unsafe and silently never set —
   logins appear to succeed and every following request is anonymous. */
if (IS_PROD) app.set('trust proxy', 1);

/* SQLite needs foreign key enforcement switched on per connection; it is off
   by default. Postgres enforces them always and has no PRAGMA, and this hook
   calls connection.run(), which only the node-sqlite3 driver provides — so it
   has to be gated on the dialect or production crashes on first connect. */
if (sequelize.getDialect() === "sqlite") {
    sequelize.addHook("afterConnect", async (connection) => {
        await new Promise((resolve, reject) => {
            connection.run("PRAGMA foreign_keys = ON;", (err) =>
                err ? reject(err) : resolve()
            );
        });
    });
}

/* Required for fetch on the frontend instead of using form POSTs.
   Comes before the body parsers so preflight requests are answered without
   being dragged through them.

   In production the frontend proxies /api through its own domain, so requests
   arrive same-origin and none of this applies. CORS_ORIGIN is the escape
   hatch for hitting the API directly from somewhere else; it takes a
   comma-separated list. */
const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
    : [`${DOMAIN}:${FE_PORT}`];

app.use(cors({
    origin: corsOrigins,
    credentials: true
}));

// Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* Sessions live in the database, in the table created by
   migrations/20260820000000-create-sessions.js.

   This replaced Redis. One less service to pay for and keep alive, one less
   secret, and — the reason it matters here — no connect() step to await
   before the app can be built, which is what makes the serverless shape
   above possible. Local dev no longer needs Redis installed at all. */
const store = new SequelizeStore({
    db: sequelize,
    // The library sweeps expired rows on a timer. A serverless instance is
    // frozen between requests, so the timer mostly never fires and burns a
    // query when it does. Sweep on a schedule instead — see README.
    checkExpirationInterval: IS_PROD ? 0 : 15 * 60 * 1000,
});

app.use(session({
    store,
    name: 'sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        /* "lax" is correct while the frontend proxies /api through its own
           domain, which keeps this a first-party cookie. If you ever point
           the frontend straight at a different domain, the browser treats
           that as cross-site and drops a lax cookie on every fetch — set
           COOKIE_SAMESITE=none then (which also requires secure: true). */
        sameSite: process.env.COOKIE_SAMESITE || "lax",
        secure: IS_PROD,
        maxAge: 1000 * 60 * 60 * 24, // 1 day
    }
}));

// get routes
const eventsRouter = require('./src/routes/events');
const orgsRouter = require('./src/routes/organizations');
const usersRouter = require('./src/routes/users');
const authRouter = require('./src/routes/auth');
const uploadsRouter = require('./src/routes/uploads');
const { errorHandler } = require("./src/middleware/errorHandler");

/* Health check. The API is its own Vercel project, so this is the cheapest way
   to tell "deployed and talking to the database" from "deployed". */
app.get('/', (req, res) => {
    res.json({ status: 'ok', service: 'benevola-api' });
});

// API Routes
app.use('/api/events', eventsRouter);
app.use('/api/orgs', orgsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);
app.use('/api/uploads', uploadsRouter);
app.use(errorHandler);

module.exports = app;

/* Local development only. `require.main === module` is false when a serverless
   platform imports this file, so nothing below runs in production. */
if (require.main === module) {
    sequelize.authenticate()
        .then(() => {
            console.log('Database connected.');
            app.listen(BE_PORT, () => {
                console.log(`Server is running on ${DOMAIN}:${BE_PORT}`);
            });
        })
        .catch((err) => {
            console.error('Unable to start server:', err);
            process.exit(1);
        });
}
