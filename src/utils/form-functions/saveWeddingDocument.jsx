import { supabase } from "../../config/supabase";

/**
 * Upload wedding document to Supabase Storage
 * @param {number} datenow - Timestamp for unique file naming
 * @param {string} type - Document type/label
 * @param {File|Blob|string} fileOrUrl - File object, Blob, or blob URL
 * @param {string} filename - Original filename
 * @param {Function} setErrorMessage - Error message setter
 * @returns {Promise<string|boolean>} - Returns file path or false on failure
 */
const saveWeddingDocument = async (datenow, type, fileOrUrl, filename, setErrorMessage) => {
    console.log(`Starting saveWeddingDocument for ${type}: ${filename}`);

    let file;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    try {
        // Handle different input types
        if (fileOrUrl instanceof File) {
            // Already a File object
            file = fileOrUrl;
            console.log(`Using direct File object for ${type}`);
        } else if (fileOrUrl instanceof Blob) {
            // Convert Blob to File
            file = new File([fileOrUrl], filename, { type: fileOrUrl.type });
            console.log(`Converted Blob to File for ${type}`);
        } else if (typeof fileOrUrl === 'string') {
            // Handle blob URL or data URL
            console.log(`Converting URL to File for ${type}`);
            
            // Check if it's a data URL
            if (fileOrUrl.startsWith('data:')) {
                const response = await fetch(fileOrUrl);
                const blob = await response.blob();
                file = new File([blob], filename, { type: blob.type });
            } else {
                // It's a blob URL - need to fetch it
                // This will only work if CSP allows blob: URLs
                const response = await fetch(fileOrUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch file: ${response.status}`);
                }
                const blob = await response.blob();
                file = new File([blob], filename, { type: blob.type });
            }
        } else {
            throw new Error(`Invalid file input type for ${type}`);
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            throw new Error(
                `File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`
            );
        }

        console.log(`File ready for upload - Size: ${(file.size / 1024).toFixed(2)} KB`);

        // Get authenticated user
        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
            throw new Error("User not authenticated");
        }

        // Create file path: receipts/{user_id}_{timestamp}_{filename}
        const fileExt = file.name.split(".").pop();
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
        const uniqueFileName = `${sanitizedFilename.split(".")[0]}_${datenow}.${fileExt}`;
        const filepath = `receipts/${user.id}_${uniqueFileName}`;

        console.log(`Uploading ${type} to: ${filepath}`);

        // Upload to booking-documents bucket
        const { data, error } = await supabase.storage
            .from('booking-documents')
            .upload(filepath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error(`Upload error for ${type} (${filename}):`, error.message);
            setErrorMessage(`Server failed to upload the ${type} document. Please try again.`);
            return false;
        }

        console.log(`Successfully uploaded ${type}:`, data);

        // Return the file path (bucket is private, so we store the path)
        return filepath;

    } catch (error) {
        console.error(`Error in saveWeddingDocument for ${type}:`, error);
        setErrorMessage(`Failed to upload ${type}: ${error.message}`);
        return false;
    } finally {
        // Clear references to help garbage collection
        file = null;
        
        // Small delay to allow browser GC to work
        await new Promise(resolve => setTimeout(resolve, 50));
        
        console.log(`Completed saveWeddingDocument for ${type}`);
    }
}

export default saveWeddingDocument;