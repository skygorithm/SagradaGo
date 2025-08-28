import { supabase } from "../../../config/supabase";

const restoreSacramentDocuments = async ({
    original_table,
    record_id,
    sacrament,
}) => {
    console.log("Restoring document from deleted records:", {
        original_table,
        record_id,
        sacrament,
    })
    // Fetch document from deleted_records
    const { data: deletedRecords, error: fetchError } = await supabase
        .from('deleted_records')
        .select("*")
        .eq('original_table', original_table)
        .eq('record_id', record_id);
    console.log("Data fetched from deleted records:", deletedRecords);
    
    if (fetchError) {
        console.error('Error fetching deleted document:', fetchError);
        throw fetchError;
    }
    
    if (!deletedRecords?.length) {
        console.error('Document not found in deleted records:', record_id);
        throw new Error('Document not found in deleted records');
    }
    
    // Parse and prepare document for restoration
    const restoredDoc = JSON.parse(deletedRecords[0].record_data);
    const restoredDocId = deletedRecords[0].id;
    
    // Insert the document back into original table
    const { data: restoredData, error: restoreError } = await supabase
        .from(original_table)
        .insert([restoredDoc])
        .select();
        
    if (restoreError) {
        console.error('Error restoring document:', restoreError);
        throw restoreError;
    }
    
    const specificId = restoredData[0].id;
    console.log('Successfully restored document:', restoredData);

    // Remove from deleted_records
    const { error: deleteError } = await supabase
        .from('deleted_records')
        .delete()
        .eq('id', restoredDocId);
    return specificId;
}

export default restoreSacramentDocuments;