import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from "@mui/material"
import { useEffect, useRef, useState } from "react";
import getDisplaySacrament from "../../utils/admin-functions/displaySacrament";
import UploadImage from "../UploadImage";
import BaptismDocuments from "../sacrament-documents/baptism-documents";
import BurialDocuments from "../sacrament-documents/burial-documents";
import WeddingDocuments from "../sacrament-documents/wedding-documents";

const AdminSacramentDialog = ({
    openDialog, 
    editingRecord, 
    error, 
    sacrament, 
    formData,
    setFormData,
    users,
    handleCloseDialog,
    handleSave
}) => {
    const [displaySacrament, setDisplaySacrament] = useState('');
    const [isIDProcessing, setIsIDProcessing] = useState(false);
    useEffect(() => {
        const sac = getDisplaySacrament(sacrament);
        setDisplaySacrament(sac);
    }, [sacrament]);

    const hiddenInputRef1 = useRef(null);
    const [residentForm, setResidentForm] = useState({
        id: null,
    });
    const [baptismForm, setBaptismForm] = useState({
        main_godfather: {},
        main_godmother: {},
        additional_godparents: [],
    });

    // For Burial Document Variables
    const [burialForm, setBurialForm] = useState({
        funeral_mass: false,
        death_anniversary: false,
        funeral_blessing: false,
        tomb_blessing: false,
    });

    // For Wedding Document Variables
      const [weddingForm, setWeddingForm] = useState({
        groom_fullname: '',
        bride_fullname: '',
        contact_no: '',
        marriage_license: null,
        marriage_contract: null,
        groom_1x1: null,
        bride_1x1: null,
        groom_baptismal_cert: null,
        bride_baptismal_cert: null,
        groom_confirmation_cert: null,
        bride_confirmation_cert: null,
        groom_cenomar: null,
        bride_cenomar: null,
        groom_banns: null,
        bride_banns: null,
        groom_permission: null,
        bride_permission: null,
      });
    
    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            weddingForm: weddingForm,
        }));
    }, [weddingForm]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            burialForm: burialForm,
        }));
    }, [burialForm]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            baptismForm: baptismForm,
        }));
    }, [baptismForm]);
    

    // const handleChangeID = async (event, def=true, setForm = null, key=null) => {
    //     const fileUploaded = event.target.files[0];
    //     if (fileUploaded) {
    //         setIsIDProcessing(true);
    //         try {
    //             const url = URL.createObjectURL(fileUploaded);
    //             setForm((prev => ({ ...prev, id: url })));
    //             if (def) {
    //                 setFormData((prev) => ({
    //                     ...prev,
    //                     document: url,
    //                 }));
    //             } else {
    //                 setFormData((prev) => ({
    //                     ...prev,
    //                     [key]: url,
    //                 }));
    //             }
                
    //         } catch (error) {
    //             console.error("Error removing background:", error);
    //         } finally {
    //             setIsIDProcessing(false);
    //         }
    //     }
    // };

    // const handleUploadID = (event, inputRef = null) => {
    //     inputRef.current.click();
    // };


    return (
        <Dialog 
            open={openDialog} 
            onClose={handleCloseDialog} 
            maxWidth="md" 
            fullWidth
        >
            <DialogTitle>
                {editingRecord ? 'Edit Record' : 'Add New Record'}
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', mt: 2, mb: 2, gap: 2, }}>
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                            fullWidth
                            select
                            label="User"
                            value={formData.user_id || ''}
                            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                            required
                            margin="dense"
                            InputLabelProps={{ shrink: true }}
                            SelectProps={{ native: true }}
                            disabled={editingRecord}
                            >
                            <option value="">Select a user</option>
                            {users.map((user) => (
                                <option key={user.id} value={user.id}>
                                {user.user_firstname} {user.user_lastname} ({user.user_email})
                                </option>
                            ))}
                            </TextField>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Sacrament"
                                type="text"
                                value={displaySacrament || ''}
                                required
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                disabled
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                    },
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Date"
                                type="date"
                                value={formData.booking_date || ''}
                                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                                required
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                disabled={editingRecord}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Time"
                                type="time"
                                value={formData.booking_time || ''}
                                onChange={(e) => setFormData({ ...formData, booking_time: e.target.value })}
                                required
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                disabled={editingRecord}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Number of People"
                                type="number"
                                value={formData.booking_pax || ''}
                                onChange={(e) => setFormData({ ...formData, booking_pax: e.target.value })}
                                required
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                disabled={editingRecord}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                select
                                label="Status"
                                value={formData.booking_status || (editingRecord ? '' : 'pending')}
                                onChange={(e) => setFormData({ ...formData, booking_status: e.target.value })}
                                required
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                SelectProps={{ native: true }}
                                >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                            </TextField>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Transaction ID"
                                value={formData.booking_transaction || ''}
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                disabled
                                sx={{
                                    '& .MuiInputBase-input.Mui-disabled': {
                                    WebkitTextFillColor: '#000000',
                                    },
                                }}
                            />
                        </Grid>
                        {editingRecord && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Is Service Fee Paid?"
                                    value={formData.paid || (editingRecord ? '' : false)}
                                    onChange={(e) => setFormData({ ...formData, paid: e.target.value === 'true' })}
                                    required
                                    margin="dense"
                                    InputLabelProps={{ shrink: true }}
                                    SelectProps={{ native: true }}
                                    >
                                    <option value="">Select Payment Status</option>
                                    <option value="true">Paid</option>
                                    <option value="false">Not Yet Paid</option>
                                </TextField>
                            </Grid>
                        )}
                    </Grid>
                    {/* {!editingRecord && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <UploadImage
                                    hiddenInputRef1={hiddenInputRef1}
                                    handleUploadID={(e) => handleUploadID(e, hiddenInputRef1)}
                                    handleChangeID={(e) => handleChangeID(e, true, setResidentForm)}
                                    isIDProcessing={isIDProcessing}
                                    residentForm={residentForm}
                                />
                            </Grid>
                        </Grid>
                    )} */}

                    {!editingRecord && sacrament === 'wedding' ? (
                        <WeddingDocuments weddingForm={weddingForm} setWeddingForm={setWeddingForm} />
                    ) : !editingRecord && sacrament === 'baptism' ? (
                        <BaptismDocuments baptismForm={baptismForm} setBaptismForm={setBaptismForm} />
                    ) : !editingRecord && sacrament === 'burial' ? (
                        <BurialDocuments burialForm={burialForm} setBurialForm={setBurialForm} />
                    ) : null}
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleCloseDialog}
                    aria-label="Cancel"
                    sx={{ color: '#6B5F32'}}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSave} 
                    variant="contained"
                    aria-label="Save changes"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AdminSacramentDialog;