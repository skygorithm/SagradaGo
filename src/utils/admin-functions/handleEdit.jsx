const handleEdit = ({
    selectedTable,
    record, 
    setFormData,
    setEditingRecord,
    setOpenDialog
}) => {
    if (!record) {
        console.error('No record provided for editing');
        return;
    }
    
    // Create a clean copy of the record for editing
    const cleanRecord = { ...record };
    
    // Remove computed/display fields that shouldn't be edited
    delete cleanRecord.user_firstname;
    delete cleanRecord.user_lastname;
    delete cleanRecord.groom_fullname;
    delete cleanRecord.bride_fullname;
    delete cleanRecord.groom_1x1;
    delete cleanRecord.bride_1x1;
    
    // Handle specific table formatting
    if (selectedTable === 'booking_tbl') {
        // Ensure required booking fields have proper defaults
        cleanRecord.booking_pax = cleanRecord.booking_pax || 1;
        cleanRecord.paid = cleanRecord.paid !== undefined ? cleanRecord.paid : false;
        cleanRecord.booking_status = cleanRecord.booking_status || 'pending';
    } else if (selectedTable === 'user_tbl') {
        // Format date fields for input
        if (cleanRecord.user_bday) {
            cleanRecord.user_bday = new Date(cleanRecord.user_bday).toISOString().split('T')[0];
        }
        cleanRecord.user_status = cleanRecord.user_status || 'active';
    } else if (selectedTable === 'document_tbl') {
        // Handle certificate fields
        cleanRecord.baptismal_certificate = cleanRecord.baptismal_certificate || null;
        cleanRecord.confirmation_certificate = cleanRecord.confirmation_certificate || null;
        cleanRecord.wedding_certificate = cleanRecord.wedding_certificate || null;
    }
    
    setFormData(cleanRecord);
    setEditingRecord(record.id);
    setOpenDialog(true);
};

const handleSacramentEdit = ({
    record,
    setFormData,
    setEditingRecord,
    setOpenSacramentDialog
}) => {
    if (!record) {
        console.error('No record provided for sacrament editing');
        return;
    }
    
    // Create a clean copy of the record for editing
    const cleanRecord = { ...record };
    
    // Remove computed/display fields
    delete cleanRecord.user_firstname;
    delete cleanRecord.user_lastname;
    
    // Ensure required booking fields have proper values
    cleanRecord.booking_pax = cleanRecord.booking_pax || 1;
    cleanRecord.paid = cleanRecord.paid !== undefined ? cleanRecord.paid : false;
    cleanRecord.booking_status = cleanRecord.booking_status || 'pending';
    
    // Format date for input if needed
    if (cleanRecord.booking_date) {
        cleanRecord.booking_date = new Date(cleanRecord.booking_date).toISOString().split('T')[0];
    }
    
    setFormData(cleanRecord);
    setEditingRecord(record.id);
    setOpenSacramentDialog(true);
};

export { handleEdit, handleSacramentEdit };