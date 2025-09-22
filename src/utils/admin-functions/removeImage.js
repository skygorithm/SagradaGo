import { supabase } from "../../config/supabase";

/**
 * Remove an image from Supabase storage given its public URL.
 *
 * @param {string} imageUrl
 */
export async function removeImageFromStorage(imageUrl) {
  try {
    if (!imageUrl) return;

    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/");
    const fileName = pathParts[pathParts.length - 1];

    const { error } = await supabase.storage
      .from("certificates")
      .remove([fileName]);

    if (error) {
      console.error("Error removing file from storage:", error);
    }
  } catch (err) {
    console.error("Error removing image:", err);
  }
}