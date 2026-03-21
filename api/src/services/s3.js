const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { randomUUID } = require('crypto');

const MIME_TO_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png' };

const client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET = process.env.S3_BUCKET_NAME;

// Generates a presigned PUT URL for direct browser-to-S3 upload.
// Returns { uploadUrl, finalUrl } — uploadUrl is used to upload the file,
// finalUrl is the permanent S3 URL to save in the database.
async function generateUploadUrl(folder, contentType, expiresIn = 300) {
    const ext = MIME_TO_EXT[contentType];
    const key = `${folder}/${randomUUID()}${ext}`;

    const uploadUrl = await getSignedUrl(
        client,
        new PutObjectCommand({ Bucket: BUCKET, Key: key, ContentType: contentType }),
        { expiresIn }
    );

    const finalUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    return { uploadUrl, finalUrl };
}

async function deleteFromS3(url) {
    const urlObj = new URL(url);
    const key = urlObj.pathname.slice(1); // strip leading /

    await client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
}

module.exports = { generateUploadUrl, deleteFromS3 };
