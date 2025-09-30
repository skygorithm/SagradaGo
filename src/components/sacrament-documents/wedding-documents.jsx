import { ImageOutlined } from "@mui/icons-material";
import { Box, Divider, Grid, List, ListItem, ListItemText, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";

const WeddingDocuments = ({
    weddingForm,
    setWeddingForm,
}) => {
    const hiddenGroomRef = useRef(null);
    const hiddenBrideRef = useRef(null);
    const hiddenGroomBaptismalRef = useRef(null);
    const hiddenBrideBaptismalRef = useRef(null);
    const hiddenGroomConfirmationRef = useRef(null);
    const hiddenBrideConfirmationRef = useRef(null);
    const hiddenGroomCenomarRef = useRef(null);
    const hiddenBrideCenomarRef = useRef(null);
    const hiddenGroomBannsRef = useRef(null);
    const hiddenBrideBannsRef = useRef(null);
    const hiddenGroomPermissionRef = useRef(null);
    const hiddenBridePermissionRef = useRef(null);
    const hiddenMarriageLicenseRef = useRef(null);
    const hiddenMarriageContractRef = useRef(null);
    const [previewUrls, setPreviewUrls] = useState({});

    const handleUploadDocument = (event, fieldName) => {
        const fileUploaded = event.target.files[0];
        if (fileUploaded) {
            // Validate file
            if (fileUploaded.size > 10 * 1024 * 1024) {
                alert("File size must be less than 10MB");
                return;
            }
            if (!fileUploaded.type.startsWith("image/")) {
                alert("Please upload an image file");
                return;
            }

            try {
                // Store the File object directly (not blob URL)
                setWeddingForm(prev => ({ ...prev, [fieldName]: fileUploaded }));
                
                // Create preview URL separately for display only
                const previewUrl = URL.createObjectURL(fileUploaded);
                setPreviewUrls(prev => ({ ...prev, [fieldName]: previewUrl }));
            } catch (error) {
                console.error("Error uploading file:", error);
            }
        }
    };

    // SXs
    const imageBoxStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center' };
    const imageStyle = { width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' };
    const emptyImageIconStyle = { fontSize: 24, color: 'grey.400' };
    const captionStyle = { fontWeight: 'bold', display: 'block', mb: 1 };
    
    return (
        <>
            <Typography variant="body2" sx={{ mt: 2 }}>
                For weddings, please ensure you have the necessary documents ready for submission.
            </Typography>
            <TextField
                fullWidth
                label="Groom's Full Name"
                type="text"
                value={weddingForm.groom_fullname || ''}
                onChange={(e) => setWeddingForm({ ...weddingForm, groom_fullname: e.target.value })}
                inputProps={{ min: 1  }}
                required
            />
            <TextField
                fullWidth
                label="Bride's Full Name"
                type="text"
                value={weddingForm.bride_fullname || ''}
                onChange={(e) => setWeddingForm({ ...weddingForm, bride_fullname: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Contact Number"
                type="text"
                value={weddingForm.contact_no || ''}
                onChange={(e) => setWeddingForm({ ...weddingForm, contact_no: e.target.value })}
                required
            />
            <Divider sx={{ backgroundColor: 'black' }} />
            {/* ---- MARRIAGE DOCUMENTS ----  */}
            <Typography variant="h6">
                Marriage Documents
            </Typography>
            <Grid container spacing={2} >
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'marriage_license')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenMarriageLicenseRef}
                    />
                    <Box 
                        onClick={() => hiddenMarriageLicenseRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Marriage License (No need if Civilly Marriage)
                        </Typography>
                        {weddingForm.marriage_license ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.marriage_license} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.marriage_license.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'marriage_contract')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenMarriageContractRef}
                    />
                    <Box 
                        onClick={() => hiddenMarriageContractRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Marriage Contract (For Civil Married Only)
                        </Typography>
                        {weddingForm.marriage_contract ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.marriage_contract} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.marriage_contract.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ backgroundColor: 'black' }} />

            {/* ---- CENOMAR ---- */}
            <Typography variant="h6">
                CENOMAR (Certificate of No Marriage) (No need if Civilly Marriage)
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'groom_cenomar')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenGroomCenomarRef}
                    />
                    <Box 
                        onClick={() => hiddenGroomCenomarRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Groom's CENOMAR
                        </Typography>
                        {weddingForm.groom_cenomar ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.groom_cenomar} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.groom_cenomar.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'bride_cenomar')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenBrideCenomarRef}
                    />
                    <Box 
                        onClick={() => hiddenBrideCenomarRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Bride's CENOMAR
                        </Typography>
                        {weddingForm.bride_cenomar ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.bride_cenomar} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.bride_cenomar.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ backgroundColor: 'black' }} />
        
            {/* ---- ID PHOTOS ---- */}
            <Typography variant="h6">
                1x1 ID Photos
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'groom_1x1')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenGroomRef}
                    />
                    <Box 
                        onClick={() => hiddenGroomRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Groom's 1x1
                        </Typography>
                        {weddingForm.groom_1x1 ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.groom_1x1} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.groom_1x1.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'bride_1x1')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenBrideRef}
                    />
                    <Box 
                        onClick={() => hiddenBrideRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Bride's 1x1
                        </Typography>
                        {weddingForm.bride_1x1 ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.bride_1x1} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.bride_1x1.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ backgroundColor: 'black' }} />

            {/* ---- BAPTISMAL CERTIFICATES ---- */}
            <Typography variant="h6">
                Baptismal Certificates
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'groom_baptismal_cert')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenGroomBaptismalRef}
                    />
                    <Box 
                        onClick={() => hiddenGroomBaptismalRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Groom's Baptismal
                        </Typography>
                        {weddingForm.groom_baptismal_cert ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.groom_baptismal_cert} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.groom_baptismal_cert.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'bride_baptismal_cert')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenBrideBaptismalRef}
                    />
                    <Box 
                        onClick={() => hiddenBrideBaptismalRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Bride's Baptismal
                        </Typography>
                        {weddingForm.bride_baptismal_cert ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.bride_baptismal_cert} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.bride_baptismal_cert.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ backgroundColor: 'black' }} />

            {/* ---- CONFIRMATION CERTIFICATES ---- */}
            <Typography variant="h6">
                Confirmation Certificates
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'groom_confirmation_cert')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenGroomConfirmationRef}
                    />
                    <Box 
                        onClick={() => hiddenGroomConfirmationRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Groom's Confirmation
                        </Typography>
                        {weddingForm.groom_confirmation_cert ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.groom_confirmation_cert} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.groom_confirmation_cert.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'bride_confirmation_cert')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenBrideConfirmationRef}
                    />
                    <Box 
                        onClick={() => hiddenBrideConfirmationRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Bride's Confirmation
                        </Typography>
                        {weddingForm.bride_confirmation_cert ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.bride_confirmation_cert} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.bride_confirmation_cert.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ backgroundColor: 'black' }} />

            <Typography variant="h6" >
                Permission (if applicable)
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'groom_permission')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenGroomPermissionRef}
                    />
                    <Box 
                        onClick={() => hiddenGroomPermissionRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Groom's Permission
                        </Typography>
                        {weddingForm.groom_permission ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.groom_permission} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.groom_permission.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                    <input
                        onChange={(e) => handleUploadDocument(e, 'bride_permission')}
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        ref={hiddenBridePermissionRef}
                    />
                    <Box 
                        onClick={() => hiddenBridePermissionRef.current.click()}
                        sx={{ 
                            border: '1px dashed #ccc', 
                            borderRadius: 1, 
                            p: 2, 
                            textAlign: 'center', 
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' }
                        }}
                    >
                        <Typography variant="caption" sx={captionStyle}>
                            Bride's Permission
                        </Typography>
                        {weddingForm.bride_permission ? (
                            <Box sx={imageBoxStyle}>
                                <img src={previewUrls.bride_permission} style={imageStyle} />
                                <Typography variant="caption" color="success.main">
                                    {weddingForm.bride_permission.name}
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={imageBoxStyle}>
                                <ImageOutlined sx={emptyImageIconStyle} />
                                <Typography variant="caption">Click to upload</Typography>
                            </Box>
                        )}
                    </Box>
                </Grid>
            </Grid>

            <Divider sx={{ backgroundColor: 'black' }} />
            {/* ---- MISCELLANEOUS ---- */}
            <Typography variant="h6" >
                Please be prepared for the following activities:
            </Typography>

            <List sx={{ pl: 2 }}>
                <ListItem disablePadding>
                    <ListItemText primary="• Wedding Questionnaires" />
                </ListItem>
                <ListItem disablePadding>
                    <ListItemText primary="• Canonical Interview" />
                </ListItem>
                <ListItem disablePadding>
                    <ListItemText primary="• Pre-Cana Seminar" />
                </ListItem>
                <ListItem disablePadding>
                    <ListItemText primary="• Confession" />
                </ListItem>
                <ListItem disablePadding>
                    <ListItemText primary="• Invitation Card for Motif Reference" />
                </ListItem>
                <ListItem disablePadding>
                    <ListItemText primary="• Banns of Marriage" />
                </ListItem>
            </List>

        </>
    );
}

export default WeddingDocuments;