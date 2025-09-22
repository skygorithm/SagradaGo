/**
 * Convert a Blob URL or remote URL into a File object with safety checks.
 *
 * Works in:
 * - Browser (native File API)
 * - Node.js (with fetch + File polyfills)
 *
 * @param {string} blobUrl - The Blob or remote URL
 * @param {string} filename - Desired filename
 * @returns {Promise<File>}
 */
async function blobUrlToFile(blobUrl, filename) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  try {
    const response = await fetch(blobUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
    }

    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
      throw new Error(
        `File too large: ${(parseInt(contentLength, 10) / 1024 / 1024).toFixed(
          2
        )} MB (max: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)} MB)`
      );
    }

    const blob = await response.blob();
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(
        `File too large: ${(blob.size / 1024 / 1024).toFixed(2)} MB (max: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)} MB)`
      );
    }

    return new File([blob], filename, { type: blob.type });
  } catch (err) {
    console.error("Error in blobUrlToFile:", err.message);
    throw err;
  }
}

export default blobUrlToFile;