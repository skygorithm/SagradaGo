async function blobUrlToFile(blobUrl, filename) {
  const response = await fetch(blobUrl);
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type });
}

export default blobUrlToFile;