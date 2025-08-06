import getDisplaySacrament from "./displaySacrament";
import generateTransactionId from "./generateTransactionId";

const handleAdd = ({
    selectedTable,
    setFormData,
    setEditingRecord,
    setOpenDialog,
}) => {
    if (selectedTable === 'booking_tbl') {
      const transactionId = generateTransactionId();
      setFormData({
        booking_status: 'pending',
        booking_transaction: transactionId
      });
    } else {
      setFormData({});
    }
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
    setFormData({
      booking_status: 'pending',
      booking_transaction: transactionId,
      booking_sacrament: getDisplaySacrament(selectedSacrament)
    });
    setEditingRecord(null);
    setOpenSacramentDialog(true);
}

export { handleAdd, handleSacramentAdd };