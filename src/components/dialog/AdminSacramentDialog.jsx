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

    // Initialize form data when dialog opens
    useEffect(() => {
        if (openDialog && !editingRecord) {
            // For new records, ensure booking_status has a default value
            setFormData(prev => ({
                ...prev,
                booking_status: prev.booking_status || 'pending'
            }));
        }
    }, [openDialog, editingRecord, setFormData]);

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
    }, [weddingForm, setFormData]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            burialForm: burialForm,
        }));
    }, [burialForm, setFormData]);

    useEffect(() => {
        setFormData((prev) => ({
            ...prev,
            baptismForm: baptismForm,
        }));
    }, [baptismForm, setFormData]);
    
    // Handle form field changes
    const handleFieldChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

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
                                onChange={(e) => handleFieldChange('user_id', e.target.value)}
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
                                onChange={(e) => handleFieldChange('booking_date', e.target.value)}
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
                                onChange={(e) => handleFieldChange('booking_time', e.target.value)}
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
                                onChange={(e) => handleFieldChange('booking_pax', e.target.value)}
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
                                value={formData.booking_status || 'pending'}
                                onChange={(e) => {
                                    console.log('Status changed to:', e.target.value); // Debug log
                                    handleFieldChange('booking_status', e.target.value);
                                }}
                                required
                                margin="dense"
                                InputLabelProps={{ shrink: true }}
                                SelectProps={{ native: true }}
                            >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="approved">Approved</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="rejected">Rejected</option>
                                <option value="draft">Draft</option>
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
                                    value={formData.paid !== undefined ? formData.paid.toString() : ''}
                                    onChange={(e) => handleFieldChange('paid', e.target.value === 'true')}
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

                    {/* Document components for different sacraments */}
                    {!editingRecord && sacrament === 'wedding' && (
                        <WeddingDocuments weddingForm={weddingForm} setWeddingForm={setWeddingForm} />
                    )}
                    
                    {!editingRecord && sacrament === 'baptism' && (
                        <BaptismDocuments baptismForm={baptismForm} setBaptismForm={setBaptismForm} />
                    )}
                    
                    {!editingRecord && sacrament === 'burial' && (
                        <BurialDocuments burialForm={burialForm} setBurialForm={setBurialForm} />
                    )}

                    {/* Debug information - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                            <strong>Debug Info:</strong>
                            <br />
                            Current booking_status: {formData.booking_status || 'undefined'}
                            <br />
                            Form data keys: {Object.keys(formData).join(', ')}
                        </Box>
                    )}

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