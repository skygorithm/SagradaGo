import { supabase } from "../../../config/supabase";

const fetchSacramentForms = async (documentId, selectedSacrament) => {
    // Will get the document based on the selected sacrament and document ID
    if (selectedSacrament === 'baptism') {
        const { data, error } = await supabase
            .from('booking_baptism_docu_tbl')
            .select('*')
            .eq('id', documentId);
        if (error) {
            console.error('Error fetching baptism document:', error);
            return null;
        }
        if (data.length === 0) {
            console.warn('No baptism document found for the given ID:', documentId);
            return null;
        }
        return data[0];
    } else if (selectedSacrament === 'burial') {
        const { data, error } = await supabase
            .from('booking_burial_docu_tbl')
            .select('*')
            .eq('id', documentId);
        if (error) {
            console.error('Error fetching burial document:', error);
            return null;
        }
        if (data.length === 0) {
            console.warn('No burial document found for the given ID:', documentId);
            return null;
        }
        return data[0];
    } else if (selectedSacrament === 'wedding') {
        const { data, error } = await supabase
            .from('booking_wedding_docu_tbl')
            .select('*')
            .eq('id', documentId);
        if (error) {
            console.error('Error fetching wedding document:', error);
            return null;
        }
        if (data.length === 0) {
            console.warn('No wedding document found for the given ID:', documentId);
            return null;
        }
        return data[0];
    }
};

export default fetchSacramentForms;
