import { supabase } from "../../../config/supabase";

const deleteSacramentDocuments = async ({table, sacrament, specificId, adminData}) => {
    let specificInsertData = null;
    
    console.log("Passed data on delete Sacrament Documents are: ", {
        table, sacrament, specificId, adminData,
    });
    // Delete the wedding document if it exists
    const { data: specificData, error: specificError } = await supabase
    .from(table)
    .select('*')
    .eq('id', specificId);
    if (specificError) {
        console.error(`Error fetching ${sacrament} document:`, specificError);
        throw specificError;
    }
    if (!specificData || specificData.length === 0) {
        console.log(`No ${sacrament} document found with ID: ${specificId}`);
        return;
    }
    specificInsertData = specificData[0];
    console.log(`${sacrament} document to delete:`, specificInsertData);
    
    // Insert the document into deleted_records
    const { error: docError } = await supabase
    .from('deleted_records')
    .insert([{
        original_table: table,
        record_id: specificId,
        record_data: specificInsertData,
        deleted_by: adminData ? `${adminData.firstName} ${adminData.lastName}` : 'Unknown',
        deleted_by_email: adminData?.email || 'Unknown'
    }])
    
    if (docError) {
        console.error(`Error deleting ${sacrament} document:`, docError);
        throw docError;
    }
}

export default deleteSacramentDocuments;
