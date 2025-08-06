import { supabase } from "../../config/supabase";

const saveSpecificSacramentDocument = async ({selectedSacrament, specificDocumentTable, setErrorMessage}) => {
    if (selectedSacrament === 'Wedding' || selectedSacrament === 'wedding') {
        const { data: insertedData, error: specificDocumentError } = await supabase
            .from('booking_wedding_docu_tbl')
            .insert([specificDocumentTable])
            .select('id');
        if (specificDocumentError) {
            console.error('Error inserting wedding documents:', specificDocumentError);
            setErrorMessage('Failed to insert wedding documents. Please try again.');
            return false;
        }
        if (insertedData && insertedData.length > 0) {
            return insertedData[0].id; // Return the ID of the inserted document
        } else {
            setErrorMessage('An error occured. Please try again.');
            return false;
        }
    } else if (selectedSacrament === 'Baptism' || selectedSacrament === 'baptism') {
        // filter additional_godparents
        specificDocumentTable.additional_godparents = specificDocumentTable.additional_godparents.filter(godparent => 
            godparent.godfather_name || godparent.godmother_name
        );

        const { data: insertedData, error: specificDocumentError } = await supabase
            .from('booking_baptism_docu_tbl')
            .insert([specificDocumentTable])
            .select('id'); 
        if (specificDocumentError) {
            console.error('Error inserting baptism documents:', specificDocumentError);
            setErrorMessage('Failed to insert baptism documents. Please try again.');
            return false;
        }
        if (insertedData && insertedData.length > 0) {
            return insertedData[0].id;
        } else {
            setErrorMessage('An error occured. Please try again.');
            return false;
        }
    } else if (selectedSacrament === 'Burial' || selectedSacrament === 'burial') {
        const { data: insertedData, error: specificDocumentError } = await supabase
            .from('booking_burial_docu_tbl')
            .insert([specificDocumentTable])
            .select('id'); 
        if (specificDocumentError) {
            console.error('Error inserting burial documents:', specificDocumentError);
            setErrorMessage('Failed to insert burial documents. Please try again.');
            return false;
        }
        if (insertedData && insertedData.length > 0) {
            return insertedData[0].id;
        } else {
            setErrorMessage('An error occured. Please try again.');
            return false;

        }

    } else {
        console.log('Sacrament Type is different:', selectedSacrament);
        return true;
        // setErrorMessage('An unexpected error occured. Please try again.');
        // return false;
    }
};

export default saveSpecificSacramentDocument;