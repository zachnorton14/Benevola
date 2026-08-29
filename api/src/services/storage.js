const crypto = require('crypto');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

/* Direct-to-storage uploads, backed by Cloudflare R2.

   The API never receives the file itself. It signs a short-lived URL, the
   browser PUTs straight to R2, and only the resulting public URL comes back
   here to be saved on the record. That matters because this API runs behind
   API Gateway and Lambda, which cap request payloads at 10MB and 6MB: routing
   images through them would break on anything bigger than a phone photo.

   R2 speaks the S3 API, so the AWS SDK works unchanged apart from the
   endpoint and the fixed "auto" region. */

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET     = process.env.R2_BUCKET;
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || '').replace(/\/$/, '');

/** Uploads are optional: the app runs fine without R2, you just cannot upload. */
const isConfigured = Boolean(ACCOUNT_ID && ACCESS_KEY && SECRET_KEY && BUCKET && PUBLIC_URL);

const client = isConfigured
  ? new S3Client({
      region: 'auto',
      endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
    })
  : null;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);

const EXTENSION = {
  'image/jpeg': 'jpg',
  'image/png':  'png',
  'image/webp': 'webp',
  'image/gif':  'gif',
  'image/avif': 'avif',
};

const MAX_BYTES = 5 * 1024 * 1024; // 5MB

/** Where a given kind of image lives in the bucket. */
const FOLDER = {
  'event-image':  'events',
  'org-banner':   'orgs/banners',
  'org-icon':     'orgs/icons',
  'profile-pic':  'users/avatars',
};

/**
 * Sign a one-off upload for a single object.
 *
 * Both content type and content length are part of the signature, so the
 * browser cannot swap in a different file type or a much larger file than the
 * one we approved. The size is also checked here before signing.
 */
async function signUpload({ kind, contentType, contentLength, principal }) {
  if (!isConfigured) {
    const err = new Error('Image uploads are not configured on this server.');
    err.status = 503;
    throw err;
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    const err = new Error(`That file type is not supported. Use JPEG, PNG, WebP, GIF or AVIF.`);
    err.status = 400;
    throw err;
  }

  if (contentLength > MAX_BYTES) {
    const err = new Error(`That image is too large. The limit is ${MAX_BYTES / 1024 / 1024}MB.`);
    err.status = 400;
    throw err;
  }

  const folder = FOLDER[kind] ?? 'misc';
  // Random name: keeps uploads from colliding and stops anyone guessing a URL
  // from an account id. The owner prefix keeps the bucket browsable.
  const key = `${folder}/${principal.kind}-${principal.id}/${crypto.randomUUID()}.${EXTENSION[contentType]}`;

  const uploadUrl = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength,
    }),
    {
      expiresIn: 300, // five minutes is plenty to push one image
      signableHeaders: new Set(['content-type', 'content-length']),
    }
  );

  return { uploadUrl, key, publicUrl: `${PUBLIC_URL}/${key}` };
}

/**
 * Push a buffer we already hold straight into the bucket.
 *
 * This is the proxied path: the file has come through this API rather than
 * going browser-to-R2. Simpler for the client, but every byte occupies API
 * memory and counts against the request size cap of whatever is in front of
 * it, so it is only appropriate for small images.
 */
async function uploadBuffer({ kind, contentType, body, principal }) {
  if (!isConfigured) {
    const err = new Error('Image uploads are not configured on this server.');
    err.status = 503;
    throw err;
  }

  if (!ALLOWED_TYPES.has(contentType)) {
    const err = new Error('That file type is not supported. Use JPEG, PNG, WebP, GIF or AVIF.');
    err.status = 400;
    throw err;
  }

  if (!body?.length) {
    const err = new Error('No image data was received.');
    err.status = 400;
    throw err;
  }

  if (body.length > MAX_BYTES) {
    const err = new Error(`That image is too large. The limit is ${MAX_BYTES / 1024 / 1024}MB.`);
    err.status = 400;
    throw err;
  }

  const folder = FOLDER[kind] ?? 'misc';
  const key = `${folder}/${principal.kind}-${principal.id}/${crypto.randomUUID()}.${EXTENSION[contentType]}`;

  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));

  return { key, publicUrl: `${PUBLIC_URL}/${key}` };
}

module.exports = { signUpload, uploadBuffer, isConfigured, ALLOWED_TYPES, MAX_BYTES };
