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
    const { data, error } = await supabase
        .from('deleted_records')
        .select("*")
        .eq('original_table', original_table)
        .eq('record_id', record_id);
    console.log("Data fetched from deleted records:", data);
    if (error) {
        console.error('Error restoring document:', error);
        throw error;
    }
    if (data.length === 0) {
        console.error('document not found in deleted records:', record_id);
        throw new Error('document not found in deleted records');
    }
    let restoredDoc = JSON.parse(data[0].record_data);
    let restoredDocId = data[0].id;
    
    // Insert the document back into their own table
    const { data: restoredData, error: restoreError } = await supabase
        .from(original_table)
        .insert([restoredDoc])
        .select();
    if (restoreError) {
        console.error('Error restoring document:', restoreError);
        throw restoreError;
    }
    let specificId = restoredData[0].id;
    // recordToRestore.wedding_docu_id = restoredData[0].id; // Update the wedding_docu_id in the main record
    console.log('Successfully restored document:', restoredData);

    // Delete it from deleted_records
    const { error: deleteWeddingError } = await supabase
        .from('deleted_records')
        .delete()
        .eq('id', restoredDocId);
    return specificId;
}

export default restoreSacramentDocuments;