const express = require('express');
const router = express.Router();

const { z } = require('zod');
const validate = require('../middleware/validate');
const authenticate = require('../middleware/authenticate');
const { signUpload, uploadBuffer, isConfigured, ALLOWED_TYPES, MAX_BYTES } = require('../services/storage');

/* Hands out short-lived upload URLs. The file itself never passes through
   this API: see src/services/storage.js for why. */

const signValidation = z.object({
    kind: z.enum(['event-image', 'org-banner', 'org-icon', 'profile-pic']),
    contentType: z.string().min(1),
    contentLength: z.coerce.number().int().positive(),
}).strict();

// GET /api/uploads/status — lets the UI hide the upload control when there is
// no bucket wired up, rather than offering a button that cannot work.
router.get('/status', (req, res) => {
    return res.status(200).json({ message: 'success', data: { enabled: isConfigured } });
});

// POST /api/uploads/sign
router.post('/sign',
    authenticate,
    validate({ body: signValidation }),
    async (req, res, next) => {
        try {
            const { kind, contentType, contentLength } = req.validatedBody;

            // Signing is gated on being logged in; ownership of the record the
            // image ends up on is enforced separately by the PATCH that saves
            // the URL, so a stray upload cannot attach itself to someone else.
            const principal = req.session.principal;

            const signed = await signUpload({ kind, contentType, contentLength, principal });

            return res.status(200).json({ message: 'success', data: signed });
        } catch (err) {
            if (err.status) return res.status(err.status).json({ message: err.message });
            next(err);
        }
    }
);

/* POST /api/uploads/:kind — the proxied alternative.

   Send the raw image as the request body with its real Content-Type. The file
   passes through this API on its way to the bucket, which keeps the client
   simple (one request, no signing dance) at the cost of pushing every byte
   through the server.

   Prefer /sign in production: this route is bounded by whatever request size
   limit sits in front of the API, and on API Gateway plus Lambda that ceiling
   is well below the 5MB an ordinary phone photo can reach. */
router.post('/:kind',
    authenticate,
    // Only image bodies are accepted, and the limit is enforced before the
    // whole payload is buffered into memory.
    express.raw({ type: (req) => ALLOWED_TYPES.has(req.headers['content-type']), limit: MAX_BYTES }),
    async (req, res, next) => {
        try {
            const { kind } = req.params;

            if (!['event-image', 'org-banner', 'org-icon', 'profile-pic'].includes(kind)) {
                return res.status(400).json({ message: 'Unknown upload kind.' });
            }

            const uploaded = await uploadBuffer({
                kind,
                contentType: req.headers['content-type'],
                body: Buffer.isBuffer(req.body) ? req.body : null,
                principal: req.session.principal,
            });

            return res.status(201).json({ message: 'success', data: uploaded });
        } catch (err) {
            if (err.status) return res.status(err.status).json({ message: err.message });
            // Payloads past the limit are rejected by express.raw before this
            // handler runs; errorHandler turns those into a 413.
            next(err);
        }
    }
);

module.exports = router;
