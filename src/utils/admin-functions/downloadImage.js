/**
 * Download an image from a given URL.
 *
 * @param {string} imageUrl
 * @param {string} filename - output file name
 */
export async function downloadImage(imageUrl, filename = "download.jpg") {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error("Network response not ok");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed:", err);
    alert("Failed to download image.");
  }
}