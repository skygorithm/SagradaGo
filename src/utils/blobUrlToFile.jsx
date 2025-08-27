async function blobUrlToFile(blobUrl, filename) {
  console.log(`[MEMORY] Starting blobUrlToFile for ${filename}`);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
  const memUsageBefore = process.memoryUsage();
  console.log(`[MEMORY] Before fetch - Heap Used: ${(memUsageBefore.heapUsed / 1024 / 1024).toFixed(2)}MB`);

  try {
    const response = await fetch(blobUrl);

    if (!response.ok) {
      throw new Error(`Failed to fetch blob: ${response.statusText}`);
    }

    // Check content length if available
    const contentLength = response.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(parseInt(contentLength) / 1024 / 1024).toFixed(2)}MB (max allowed: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB)`);
    }

    const memUsageAfterFetch = process.memoryUsage();
    console.log(`[MEMORY] After fetch - Heap Used: ${(memUsageAfterFetch.heapUsed / 1024 / 1024).toFixed(2)}MB, Increase: ${((memUsageAfterFetch.heapUsed - memUsageBefore.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

    const blob = await response.blob();

    // Check blob size
    if (blob.size > MAX_FILE_SIZE) {
      throw new Error(`File too large: ${(blob.size / 1024 / 1024).toFixed(2)}MB (max allowed: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(2)}MB)`);
    }

    const memUsageAfterBlob = process.memoryUsage();
    console.log(`[MEMORY] After blob creation - Heap Used: ${(memUsageAfterBlob.heapUsed / 1024 / 1024).toFixed(2)}MB, Blob size: ${(blob.size / 1024 / 1024).toFixed(2)}MB, Increase: ${((memUsageAfterBlob.heapUsed - memUsageAfterFetch.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

    const file = new File([blob], filename, { type: blob.type });

    const memUsageAfterFile = process.memoryUsage();
    console.log(`[MEMORY] After File creation - Heap Used: ${(memUsageAfterFile.heapUsed / 1024 / 1024).toFixed(2)}MB, Increase: ${((memUsageAfterFile.heapUsed - memUsageAfterBlob.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

    // Force garbage collection hint (if available in development)
    if (global.gc) {
      global.gc();
      console.log(`[MEMORY] After GC - Heap Used: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
    }

    return file;
  } catch (error) {
    console.error(`[MEMORY] Error in blobUrlToFile for ${filename}:`, error.message);
    throw error;
  }
}

export default blobUrlToFile;