/**
 * Convert a Blob URL, Data URL, or File/Blob into a File object with safety checks.
 *
 * @param {string|File|Blob} input - The Blob URL, Data URL, File, or Blob
 * @param {string} filename - Desired filename
 * @returns {Promise<File>}
 */
async function blobUrlToFile(input, filename) {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  try {
    // If it's already a File, return it
    if (input instanceof File) {
      console.log("Input is already a File object");
      if (input.size > MAX_FILE_SIZE) {
        throw new Error(
          `File too large: ${(input.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`
        );
      }
      return input;
    }

    // If it's a Blob, convert to File
    if (input instanceof Blob) {
      console.log("Converting Blob to File");
      if (input.size > MAX_FILE_SIZE) {
        throw new Error(
          `File too large: ${(input.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`
        );
      }
      return new File([input], filename, { type: input.type });
    }

    // If it's a string (URL), fetch it
    if (typeof input === 'string') {
      console.log("Fetching from URL:", input.substring(0, 50) + "...");
      
      // For blob: URLs, we need to handle CSP restrictions
      // Create a temporary XMLHttpRequest as a workaround
      if (input.startsWith('blob:')) {
        return await fetchBlobUrl(input, filename, MAX_FILE_SIZE);
      }
      
      // For data: URLs or regular URLs, use fetch
      const response = await fetch(input);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > MAX_FILE_SIZE) {
        throw new Error(
          `File too large: ${(parseInt(contentLength, 10) / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`
        );
      }

      const blob = await response.blob();
      if (blob.size > MAX_FILE_SIZE) {
        throw new Error(
          `File too large: ${(blob.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`
        );
      }

      return new File([blob], filename, { type: blob.type });
    }

    throw new Error("Invalid input type - expected File, Blob, or URL string");
  } catch (err) {
    console.error("Error in blobUrlToFile:", err.message);
    throw err;
  }
}

/**
 * Fetch blob URL using XMLHttpRequest to bypass CSP restrictions
 * @param {string} blobUrl - Blob URL
 * @param {string} filename - Filename
 * @param {number} maxSize - Maximum file size
 * @returns {Promise<File>}
 */
function fetchBlobUrl(blobUrl, filename, maxSize) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', blobUrl, true);
    xhr.responseType = 'blob';

    xhr.onload = function() {
      if (xhr.status === 200) {
        const blob = xhr.response;
        if (blob.size > maxSize) {
          reject(new Error(
            `File too large: ${(blob.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`
          ));
          return;
        }
        resolve(new File([blob], filename, { type: blob.type }));
      } else {
        reject(new Error(`Failed to fetch blob: ${xhr.status}`));
      }
    };

    xhr.onerror = function() {
      reject(new Error('Network error while fetching blob'));
    };

    xhr.send();
  });
}

export default blobUrlToFile;