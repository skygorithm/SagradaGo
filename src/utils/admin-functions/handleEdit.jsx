const handleEdit = ({
    record, 
    setFormData,
    setEditingRecord,
    setOpenDialog
}) => {
    setFormData(record);
    setEditingRecord(record.id);
    setOpenDialog(true);
};
const handleSacramentEdit = ({
    record,
    setFormData,
    setEditingRecord,
    setOpenSacramentDialog
}) => {
    setFormData(record);
    setEditingRecord(record.id);
    setOpenSacramentDialog(true);
};

export { handleEdit, handleSacramentEdit };