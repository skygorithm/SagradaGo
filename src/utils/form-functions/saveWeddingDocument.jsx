import { supabase } from "../../config/supabase";
import blobUrlToFile from "../blobUrlToFile";

const saveWeddingDocument = async (datenow, type, url, filename, setErrorMessage) => {
    const file = await blobUrlToFile(url, filename);
    const filepath = `private/WeddingDocuments/${datenow}_${file.name}`;
    const { data, error } = await supabase.storage
        .from('booking-documents')
        .upload(filepath, file);
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
    return fileUrl;
}

export default saveWeddingDocument;