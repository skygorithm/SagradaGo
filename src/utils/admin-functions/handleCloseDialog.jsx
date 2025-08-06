  const handleCloseDialog = ({
    setOpenDialog,
    setFormData,
    setEditingRecord
  }) => {
    setOpenDialog(false);
    setFormData({});
    setEditingRecord(null);
  };

  const handleCloseSacramentDialog = ({
    setOpenSacramentDialog,
    setFormData,
    setEditingRecord
  }) => {
    setOpenSacramentDialog(false);
    setFormData({});
    setEditingRecord(null);
  };

  export {
    handleCloseDialog,
    handleCloseSacramentDialog
  }