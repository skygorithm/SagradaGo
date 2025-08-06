import { Checkbox, Divider, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";

const BurialDocuments = ({
    burialForm,
    setBurialForm,
}) => {
    return (
        <>
            <Typography variant="body2" sx={{ mt: 2 }}>
                For funeral, please ensure you have the necessary information.
            </Typography>
            <Typography variant="h6">
                Deceased Information
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={9}>
                    <TextField
                        fullWidth
                        label="Deceased's Name"
                        type="text"
                        value={burialForm.deceased_name}
                        onChange={(e) => setBurialForm({ ...burialForm, deceased_name: e.target.value })}
                        inputProps={{ min: 1  }}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <TextField
                        fullWidth
                        label="Age"
                        type="number"
                        value={burialForm.deceased_age}
                        onChange={(e) => setBurialForm({ ...burialForm, deceased_age: e.target.value })}
                        inputProps={{ min: 1 }}
                        required
                    />
                </Grid>
            </Grid>
            <FormControl fullWidth>
                <InputLabel>Select Type of Marriage</InputLabel>
                <Select
                    value={burialForm.deceased_civil_status || ''}
                    onChange={(e) => setBurialForm({ ...burialForm, deceased_civil_status: e.target.value })}
                    label="Civil Status"
                >
                    <MenuItem value="Single">Single</MenuItem>
                    <MenuItem value="Married">Married</MenuItem>
                    <MenuItem value="Widowed">Widowed</MenuItem>
                </Select>
            </FormControl>
            <Divider sx={{ backgroundColor: 'black' }} />
            <TextField
                fullWidth
                label="Requested By"
                type="text"
                value={burialForm.requested_by}
                onChange={(e) => setBurialForm({ ...burialForm, requested_by: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Relationship to Deceased"
                type="text"
                value={burialForm.deceased_relationship}
                onChange={(e) => setBurialForm({ ...burialForm, deceased_relationship: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Address"
                type="text"
                value={burialForm.address}
                onChange={(e) => setBurialForm({ ...burialForm, address: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Contact Number"
                type="text"
                value={burialForm.contact_no}
                onChange={(e) => setBurialForm({ ...burialForm, contact_no: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <Divider sx={{ backgroundColor: 'black' }} />
            <TextField
                fullWidth
                label="Place of Mass"
                type="text"
                value={burialForm.place_of_mass}
                onChange={(e) => setBurialForm({ ...burialForm, place_of_mass: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Mass Address"
                type="text"
                value={burialForm.mass_address}
                onChange={(e) => setBurialForm({ ...burialForm, mass_address: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <Divider sx={{ backgroundColor: 'black' }} />
            <Typography variant="h6" sx={{ mb: 2 }}>
                Select Funeral Services
            </Typography>

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={burialForm.funeral_mass || false}
                                onChange={(e) => setBurialForm({ ...burialForm, funeral_mass: e.target.checked })}
                            />
                        }
                        label="Funeral Mass"
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={burialForm.death_anniversary || false}
                                onChange={(e) => setBurialForm({ ...burialForm, death_anniversary: e.target.checked })}
                            />
                        }
                        label="Death Anniversary"
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={burialForm.funeral_blessing || false}
                                onChange={(e) => setBurialForm({ ...burialForm, funeral_blessing: e.target.checked })}
                            />
                        }
                        label="Funeral Blessing"
                    />
                </Grid>
                
                <Grid item xs={12} sm={6} md={6}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={burialForm.tomb_blessing || false}
                                onChange={(e) => setBurialForm({ ...burialForm, tomb_blessing: e.target.checked })}
                            />
                        }
                        label="Tomb Blessing"
                    />
                </Grid>
            </Grid>


            
        </>
    );
}

export default BurialDocuments;