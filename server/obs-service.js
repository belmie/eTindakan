const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');

// Load environment variables if not loaded
let env = process.env;
if (!env.OBS_ACCESS_KEY) {
  try {
    const content = fs.readFileSync('.env', 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.trim().split('=');
      if (parts.length >= 2 && !parts[0].startsWith('#')) {
        process.env[parts[0].trim()] = parts.slice(1).join('=').trim();
      }
    });
    env = process.env;
  } catch (e) {}
}

const obsClient = new S3Client({
  region: env.OBS_REGION || 'my-kualalumpur-1',
  endpoint: env.OBS_ENDPOINT || 'https://obs.my-kualalumpur-1.alphaedge.tmone.com.my',
  credentials: {
    accessKeyId: env.OBS_ACCESS_KEY || 'OSYDAVAGGJZZNX4RZKCO',
    secretAccessKey: env.OBS_SECRET_KEY || 'GBwNB0s8JCxF56OcszV1GMqgNsrP1zdFiKsMRR7J',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = env.OBS_BUCKET || 'surat-masuk';

/**
 * Upload a local file to OBS Bucket
 */
async function uploadToOBS(localFilePath, destinationKey, mimeType) {
  try {
    const fileContent = fs.readFileSync(localFilePath);
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: destinationKey,
      Body: fileContent,
      ContentType: mimeType,
    });

    await obsClient.send(command);
    
    const fileUrl = `${env.OBS_ENDPOINT || 'https://obs.my-kualalumpur-1.alphaedge.tmone.com.my'}/${BUCKET_NAME}/${destinationKey}`;
    console.log(`[OBS Storage] File successfully uploaded to: ${fileUrl}`);
    return fileUrl;
  } catch (error) {
    console.error('[OBS Storage] Upload failed:', error.message);
    throw error;
  }
}

/**
 * Generate a secure, pre-signed temporary URL for viewing/downloading OBS objects
 * @param {string} fullUrlOrKey - Raw OBS URL or S3 key
 * @param {number} expiresInSeconds - Validity in seconds (default 1 hour)
 */
async function getSignedOBSUrl(fullUrlOrKey, expiresInSeconds = 3600) {
  try {
    if (!fullUrlOrKey) return fullUrlOrKey;

    let key = fullUrlOrKey;
    // Extract key if a full URL was passed
    if (fullUrlOrKey.includes(BUCKET_NAME + '/')) {
      const parts = fullUrlOrKey.split(BUCKET_NAME + '/');
      key = parts[1];
    } else if (fullUrlOrKey.startsWith('http://') || fullUrlOrKey.startsWith('https://')) {
      const urlObj = new URL(fullUrlOrKey);
      key = urlObj.pathname.replace(`/${BUCKET_NAME}/`, '');
    }

    // Decode URI component in key if encoded
    key = decodeURIComponent(key);

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(obsClient, command, { expiresIn: expiresInSeconds });
    return presignedUrl;
  } catch (error) {
    console.warn('[OBS Storage] Error generating presigned URL:', error.message);
    return fullUrlOrKey;
  }
}

module.exports = {
  obsClient,
  uploadToOBS,
  getSignedOBSUrl,
  BUCKET_NAME
};
