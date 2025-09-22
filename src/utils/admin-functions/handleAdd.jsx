import getDisplaySacrament from "./displaySacrament";
import generateTransactionId from "./generateTransactionId";

const handleAdd = ({
    selectedTable,
    setFormData,
    setEditingRecord,
    setOpenDialog,
    formData = {} // Add default empty object
}) => {
    let initialFormData = {};
    
    if (selectedTable === 'booking_tbl') {
        const transactionId = generateTransactionId();
        initialFormData = {
            booking_status: 'pending',
            booking_transaction: transactionId,
            booking_pax: 1,
            paid: false
        };
    } else if (selectedTable === 'user_tbl') {
        initialFormData = {
            user_status: 'active',
            user_gender: ''
        };
    } else if (selectedTable === 'document_tbl') {
        initialFormData = {
            baptismal_certificate: null,
            confirmation_certificate: null,
            wedding_certificate: null
        };
    } else if (selectedTable === 'donation_tbl') {
        initialFormData = {
            donation_amount: 0,
            donation_status: 'pending'
        };
    } else if (selectedTable === 'priest_tbl') {
        initialFormData = {
            priest_availability: 'Yes'
        };
    } else if (selectedTable === 'admin_tbl') {
        initialFormData = {
            admin_status: 'active'
        };
    }
    
    // Merge with any passed formData
    const finalFormData = { ...initialFormData, ...formData };
    
    setFormData(finalFormData);
    setEditingRecord(null);
    setOpenDialog(true);
};

const handleSacramentAdd = ({
    selectedSacrament,
    setFormData,
    setEditingRecord,
    setOpenSacramentDialog
}) => {
    const transactionId = generateTransactionId();
    const initialFormData = {
        booking_status: 'pending',
        booking_transaction: transactionId,
        booking_sacrament: getDisplaySacrament(selectedSacrament),
        booking_pax: 1,
        paid: false
    };
    
    setFormData(initialFormData);
    setEditingRecord(null);
    setOpenSacramentDialog(true);
};

export { handleAdd, handleSacramentAdd };