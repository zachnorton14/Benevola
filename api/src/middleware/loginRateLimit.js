const { Op } = require("sequelize");
const LoginAttempt = require("../models/LoginAttempt");

/* Rate limit on the login endpoints.
 *
 * Deliberately moderate: ten attempts from one address in fifteen minutes.
 * Nobody mistypes their own password ten times in a quarter of an hour, so a
 * real visitor will never meet this, while an attacker guessing passwords is
 * cut to a rate that gets nowhere against anything but a terrible password.
 *
 * Keyed on IP rather than on the email being tried. Keying on the account
 * would let an attacker rotate addresses to sidestep the limit entirely, and
 * worse, it would let anyone lock a specific user out of their own account by
 * failing logins against their email on purpose.
 *
 * The trade is that a shared address — a university NAT, an office — shares a
 * budget. Ten in fifteen minutes leaves room for that.
 *
 * req.ip is only trustworthy because index.js sets `trust proxy` in
 * production; without it every request behind Vercel would look like it came
 * from the same proxy address and one visitor could lock out everyone.
 */

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

/* Rows older than the window can never affect a decision. Pruning here rather
   than on a timer is deliberate: a serverless instance is frozen between
   requests, so a setInterval would mostly never run. */
async function prune(cutoff) {
    await LoginAttempt.destroy({ where: { createdAt: { [Op.lt]: cutoff } } });
}

async function loginRateLimit(req, res, next) {
    const key = String(req.ip || "unknown").slice(0, 100);
    const cutoff = new Date(Date.now() - WINDOW_MS);

    try {
        await prune(cutoff);

        const recent = await LoginAttempt.count({
            where: { key, createdAt: { [Op.gte]: cutoff } },
        });

        if (recent >= MAX_ATTEMPTS) {
            const oldest = await LoginAttempt.findOne({
                where: { key, createdAt: { [Op.gte]: cutoff } },
                order: [["createdAt", "ASC"]],
            });
            /* Tell them when the window actually reopens rather than restating
               the full fifteen minutes, which would be wrong by however long
               they have already waited. */
            const retryAfter = oldest
                ? Math.max(1, Math.ceil((oldest.createdAt.getTime() + WINDOW_MS - Date.now()) / 1000))
                : Math.ceil(WINDOW_MS / 1000);

            res.set("Retry-After", String(retryAfter));
            return res.status(429).json({
                message: `Too many login attempts. Try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
            });
        }

        /* Recorded before the handler runs, not after it fails. On a platform
           that can freeze the instance the moment a response is flushed, work
           queued behind the response is not guaranteed to happen — and an
           attempt that goes unrecorded is a free guess. */
        await LoginAttempt.create({ key });

        /* Clearing on success is the one part that is allowed to be
           best-effort: if it is lost, the rows simply expire on their own. */
        res.on("finish", () => {
            if (res.statusCode === 200) {
                LoginAttempt.destroy({ where: { key } }).catch(() => {});
            }
        });

        return next();
    } catch (err) {
        /* A limiter that takes the site down when its own table misbehaves is
           worse than no limiter. Log it and let the login through. */
        console.error("loginRateLimit failed open:", err.message);
        return next();
    }
}

module.exports = loginRateLimit;
