import { supabase } from "../../../config/supabase";

const permanentlyDeleteSacramentDocuments = async ({
    original_table,
    record_id,
}) => {

    // If record_id is null, return early
    if (!record_id) {
        console.log('No record_id provided, nothing to delete on table: ', original_table);
        return;
    }

    const { data,  error } = await supabase
        .from('deleted_records')
        .select("*")
        .eq('original_table', original_table)
        .eq('record_id', record_id);
    if (error) {
        console.error('Error fetching document from deleted records:', error);
        throw error;
    }
    
    // Deelte the record as well
    if (!data || data.length === 0) {
        console.log('No document found in deleted records for the given criteria');
        return;
    }
    const document = data[0];
    const documentRecordData = JSON.parse(document.record_data);

    // Check if there are columns that contains public url links
    const storageUrls = [];
    console.log("Document to permanently delete:", documentRecordData);
    
    Object.entries(documentRecordData).forEach(([key, value]) => {
        // if (typeof value === 'string' && value.startsWith('https://')) {
        if (typeof value === 'string' && isSupabaseStorageUrl(value)) {
            storageUrls.push(value);
        }
    });
        
    // Delete files from storage if any URLs were found
    if (storageUrls.length > 0) {
        console.log(`Found ${storageUrls.length} storage files to delete`);
        console.log("Urls Are:", storageUrls);
        
        for (const url of storageUrls) {
            try {
                const filePath = extractFilePathFromUrl(url);
                console.log("Extracted file path:", filePath);
                
                if (!filePath) {
                    console.error(`Could not extract path from URL: ${url}`);
                    continue;
                }
                
                // Try deleting from the correct bucket - might be 'private' instead of 'booking-documents'
                const bucketName = extractBucketFromUrl(url);
                
                // check if the file actually exists
                const { data: listData, error: listError } = await supabase.storage
                    .from(bucketName || 'booking-documents')
                    .list('', {
                        limit: 1000,
                        search: filePath.split('/').pop() // search by filename
                    });
                
                console.log("List check - data:", listData);
                console.log("List check - error:", listError);
              
                
                // delete
                const { data: deleteData, error: storageError } = await supabase.storage
                    .from(bucketName || 'booking-documents')
                    .remove([filePath]);
                
                console.log("DELETE RESPONSE DATA:", deleteData);
                console.log("DELETE RESPONSE ERROR:", storageError);
                
                if (storageError) {
                    console.error(`Error deleting file ${filePath} from bucket ${bucketName}:`, storageError);
                    console.error("Full storage error:", JSON.stringify(storageError, null, 2));
                } else {
                    console.log(`Delete operation completed for: ${filePath} from bucket: ${bucketName}`);
                    console.log("Delete response data:", deleteData);

                    // Verify deletion by trying to download
                    const { data: verifyData, error: verifyError } = await supabase.storage
                        .from(bucketName || 'booking-documents')
                        .download(filePath);
                    
                    console.log("VERIFICATION - File still exists?", !verifyError);
                    console.log("VERIFICATION - Error when trying to access:", verifyError?.message);
                }
            } catch (fileError) {
                console.error(`Error processing file URL ${url}:`, fileError);
            }
        }
    }

    

    // Then, delete the document directly
    const { error: documentError } = await supabase
        .from('deleted_records')
        .delete()
        .eq('id', document.id);
    if (documentError) {
        console.error('Error deleting document from deleted records:', documentError);
        throw documentError;
    }

        console.log('Document and associated files permanently deleted');

};

// function to check if string is Supabase storage URL
const isSupabaseStorageUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    
    // Check for Supabase storage URL patterns
    // const supabaseStoragePattern = /https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\//;
    // return supabaseStoragePattern.test(url);
    return url.startsWith('https://') && url.includes('.supabase.co/storage/v1/object/public/');
};

// function to extract filepath
const extractFilePathFromUrl = (url) => {
    // URL format: https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file
    // const targetPath = "/private/WeddingDocuments/";
    // const index = url.indexOf(targetPath);
    // const fullPath = decodeURIComponent(url.substring(index));
    // return fullPath;
    const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
    return match ? decodeURIComponent(match[1]) : null;
};
// function to extract bucket name from Supabase storage URL
const extractBucketFromUrl = (url) => {
    // URL format: https://project.supabase.co/storage/v1/object/public/bucket-name/path/to/file
    const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)/);
    return match ? match[1] : null;
};

export default permanentlyDeleteSacramentDocuments;


