import { supabase } from "../../config/supabase";
import blobUrlToFile from "../blobUrlToFile";

const saveWeddingDocument = async (datenow, type, url, filename, setErrorMessage) => {
    console.log(`[MEMORY] Starting saveWeddingDocument for ${type}: ${filename}`);

    const memUsageStart = process.memoryUsage();
    console.log(`[MEMORY] Start - Heap Used: ${(memUsageStart.heapUsed / 1024 / 1024).toFixed(2)}MB`);

    let file;
    try {
        file = await blobUrlToFile(url, filename);

        const memUsageAfterFile = process.memoryUsage();
        console.log(`[MEMORY] After blobUrlToFile - Heap Used: ${(memUsageAfterFile.heapUsed / 1024 / 1024).toFixed(2)}MB, Increase: ${((memUsageAfterFile.heapUsed - memUsageStart.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

        const filepath = `private/WeddingDocuments/${datenow}_${file.name}`;
        const { data, error } = await supabase.storage
            .from('booking-documents')
            .upload(filepath, file);

        const memUsageAfterUpload = process.memoryUsage();
        console.log(`[MEMORY] After upload - Heap Used: ${(memUsageAfterUpload.heapUsed / 1024 / 1024).toFixed(2)}MB, Increase: ${((memUsageAfterUpload.heapUsed - memUsageAfterFile.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

        if (error) {
            console.error(`image upload error on ${filename}:`, error.message);
            setErrorMessage(`Server Failed to upload the ${type} document. Please try again.`);
            return false;
        }

        const { data: publicUrlData } = supabase
            .storage
            .from('booking-documents')
            .getPublicUrl(filepath);
        const fileUrl = publicUrlData?.publicUrl;

        const memUsageEnd = process.memoryUsage();
        console.log(`[MEMORY] End saveWeddingDocument - Heap Used: ${(memUsageEnd.heapUsed / 1024 / 1024).toFixed(2)}MB, Total Increase: ${((memUsageEnd.heapUsed - memUsageStart.heapUsed) / 1024 / 1024).toFixed(2)}MB`);

        return fileUrl;
    } finally {
        // Clear references to help garbage collection
        file = null;

        // Force garbage collection in development
        if (global.gc) {
            global.gc();
            console.log(`[MEMORY] After GC in saveWeddingDocument - Heap Used: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`);
        }

        // Small delay to allow GC to work
        await new Promise(resolve => setTimeout(resolve, 100));
    }
}

export default saveWeddingDocument;