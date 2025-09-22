/**
 * Check if a given URL points to an image resource.
 * Works for common image extensions even with query strings.
 *
 * @param {string} url
 * @returns {boolean}
 */
export function isImageUrl(url = "") {
  if (!url || typeof url !== "string") return false;
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(url.split("?")[0]);
}