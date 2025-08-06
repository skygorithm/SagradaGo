import { AddCircleOutline, DeleteOutline } from "@mui/icons-material";
import { Box, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";

const BaptismDocuments = ({
    baptismForm,
    setBaptismForm,
}) => {
    return (
        <>
            <Typography variant="body2" sx={{ mt: 2 }}>
                For baptism, please ensure you have the necessary information.
            </Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
                Baby's Information
            </Typography>
            <TextField
                fullWidth
                label="Baby's Fullname"
                type="text"
                value={baptismForm.baby_name || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, baby_name: e.target.value })}
                inputProps={{ min: 1  }}
                required
            />
            <DatePicker
                label="Baby's Birthday"
                value={baptismForm.baby_bday || null}
                onChange={(newValue) => setBaptismForm({ ...baptismForm, baby_bday: newValue })}
                renderInput={(params) => <TextField {...params} fullWidth />}
            />
            <TextField
                fullWidth
                label="Baby's Birthplace"
                type="text"
                value={baptismForm.baby_birthplace || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, baby_birthplace: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <Typography variant="h6">
                Mother's Information
            </Typography>
            <TextField
                fullWidth
                label="Mother's Fullname"
                type="text"
                value={baptismForm.mother_name || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, mother_name: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Mother's Birthplace"
                type="text"
                value={baptismForm.mother_birthplace || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, mother_birthplace: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <Typography variant="h6">
                Father's Information
            </Typography>
            <TextField
                fullWidth
                label="Father's Fullname"
                type="text"
                value={baptismForm.father_name || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, father_name: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Father's Birthplace"
                type="text"
                value={baptismForm.father_birthplace || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, father_birthplace: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <Divider sx={{ backgroundColor: 'black' }} />
            <FormControl fullWidth>
                <InputLabel>Select Type of Marriage</InputLabel>
                <Select
                    value={baptismForm.marriage_type || ''}
                    onChange={(e) => setBaptismForm({ ...baptismForm, marriage_type: e.target.value })}
                    label="Select Type of Marriage"
                >
                    <MenuItem value="Catholic">Catholic</MenuItem>
                    <MenuItem value="Civil">Civil</MenuItem>
                    <MenuItem value="Natural">Natural</MenuItem>
                    <MenuItem value="Not Married">Not Married</MenuItem>
                </Select>
            </FormControl>
            <TextField
                fullWidth
                label="Contact Number"
                type="text"
                value={baptismForm.contact_no || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, contact_no: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <TextField
                fullWidth
                label="Current Address"
                type="text"
                value={baptismForm.current_address || ''}
                onChange={(e) => setBaptismForm({ ...baptismForm, current_address: e.target.value })}
                inputProps={{ min: 1 }}
                required
            />
            <Divider sx={{ backgroundColor: 'black' }} />
            <Typography variant="h6">
                Main Godparents
            </Typography>
            <Typography variant="body1">
                Main Godfather
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Main Godfather's Fullname"
                        type="text"
                        value={baptismForm.main_godfather.name || ''}
                        onChange={(e) => setBaptismForm({ 
                            ...baptismForm, 
                            main_godfather: {
                                ...baptismForm.main_godfather,
                                name: e.target.value
                            } 
                        })}
                        inputProps={{ min: 1 }}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Main Godfather's Age"
                        type="number"
                        value={baptismForm.main_godfather.age || ''}
                        onChange={(e) => setBaptismForm({ ...baptismForm, 
                            main_godfather: {
                                ...baptismForm.main_godfather,
                                age: e.target.value
                            }  
                        })}
                        inputProps={{ min: 1 }}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Main Godfather's Address"
                        type="text"
                        value={baptismForm.main_godfather.address || ''}
                        onChange={(e) => setBaptismForm({ ...baptismForm, 
                            main_godfather: {
                                ...baptismForm.main_godfather,
                                address: e.target.value
                            }  
                        })}
                        inputProps={{ min: 1 }}
                        required
                    />
                </Grid>
            </Grid>
            <Typography variant="body1">
                Main Godmother
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Main Godmother's Fullname"
                        type="text"
                        value={baptismForm.main_godmother.name || ''}
                        onChange={(e) => setBaptismForm({ 
                            ...baptismForm, 
                            main_godmother: {
                                ...baptismForm.main_godmother,
                                name: e.target.value
                            } 
                        })}
                        inputProps={{ min: 1 }}
                        required
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField
                        fullWidth
                        label="Main Godmother's Age"
                        type="number"
                        value={baptismForm.main_godmother.age || ''}
                        onChange={(e) => setBaptismForm({ ...baptismForm, 
                            main_godmother: {
                                ...baptismForm.main_godmother,
                                age: e.target.value
                            }  
                        })}
                        inputProps={{ min: 1 }}
                        required
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        label="Main Godmother's Address"
                        type="text"
                        value={baptismForm.main_godmother.address || ''}
                        onChange={(e) => setBaptismForm({ ...baptismForm, 
                            main_godmother: {
                                ...baptismForm.main_godmother,
                                address: e.target.value
                            }  
                        })}
                        inputProps={{ min: 1 }}
                        required
                    />
                </Grid>
            </Grid>
            <Divider sx={{ backgroundColor: 'black' }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Typography variant="h6">
                    Additional GodParents ({baptismForm.additional_godparents?.length || 0}/10)
                </Typography>
                <IconButton 
                    onClick={() => {
                    if ((baptismForm.additional_godparents?.length || 0) < 10) {
                        setBaptismForm({
                        ...baptismForm,
                        additional_godparents: [
                            ...(baptismForm.additional_godparents || []),
                            {
                            godfather_name: '',
                            godfather_age: '',
                            godmother_name: '',
                            godmother_age: ''
                            }
                        ]
                        });
                    }
                    }}
                    disabled={(baptismForm.additional_godparents?.length || 0) >= 10}
                    color="primary"
                >
                    <AddCircleOutline />
                </IconButton>
            </Box>

            {baptismForm.additional_godparents?.map((godparent, index) => (
                <Box key={index} sx={{ border: '1px solid #e0e0e0', borderRadius: 1, p: 2, mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle2">Additional Godparent #{index + 1}</Typography>
                    <IconButton 
                        onClick={() => {
                        const updatedGodparents = baptismForm.additional_godparents.filter((_, i) => i !== index);
                        const updatedGodfathers = baptismForm.additional_godfathers.filter((_, i) => i !== index);
                        const updatedGodmothers = baptismForm.additional_godmothers.filter((_, i) => i !== index);
                        setBaptismForm({
                            ...baptismForm,
                            additional_godparents: updatedGodparents,
                            additional_godfathers: updatedGodfathers,
                            additional_godmothers: updatedGodmothers
                        });
                        }}
                        color="error"
                        size="small"
                    >
                        <DeleteOutline />
                    </IconButton>
                    </Box>
                    
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 2, mb: 2 }}>
                        <TextField
                            label="Godfather's Fullname"
                            type="text"
                            value={godparent.godfather_name}
                            onChange={(e) => {
                                const updatedGodparents = [...baptismForm.additional_godparents];
                                updatedGodparents[index].godfather_name = e.target.value;
                                setBaptismForm({
                                    ...baptismForm,
                                    additional_godparents: updatedGodparents,
                                    // Update separate arrays for database storage
                                    additional_godfathers: updatedGodparents.map(gp => ({
                                    name: gp.godfather_name,
                                    age: gp.godfather_age
                                    })).filter(gf => gf.name || gf.age)
                                });
                            }}
                            size="small"
                        />
                        
                        <TextField
                            label="Age"
                            type="number"
                            value={godparent.godfather_age}
                            onChange={(e) => {
                                const updatedGodparents = [...baptismForm.additional_godparents];
                                updatedGodparents[index].godfather_age = e.target.value;
                                setBaptismForm({
                                    ...baptismForm,
                                    additional_godparents: updatedGodparents,
                                    additional_godfathers: updatedGodparents.map(gp => ({
                                    name: gp.godfather_name,
                                    age: gp.godfather_age
                                    })).filter(gf => gf.name || gf.age)
                                });
                            }}
                            size="small"
                        />
                        </Box>
                        
                        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 2 }}>
                        <TextField
                            label="Godmother's Fullname"
                            type="text"
                            value={godparent.godmother_name}
                            onChange={(e) => {
                            const updatedGodparents = [...baptismForm.additional_godparents];
                            updatedGodparents[index].godmother_name = e.target.value;
                            setBaptismForm({
                                ...baptismForm,
                                additional_godparents: updatedGodparents,
                                // Update separate arrays for database storage
                                additional_godmothers: updatedGodparents.map(gp => ({
                                name: gp.godmother_name,
                                age: gp.godmother_age
                                })).filter(gm => gm.name || gm.age)
                            });
                            }}
                            size="small"
                        />
                        
                        <TextField
                            label="Age"
                            type="number"
                            value={godparent.godmother_age}
                            onChange={(e) => {
                                const updatedGodparents = [...baptismForm.additional_godparents];
                                updatedGodparents[index].godmother_age = e.target.value;
                                setBaptismForm({
                                    ...baptismForm,
                                    additional_godparents: updatedGodparents,
                                    additional_godmothers: updatedGodparents.map(gp => ({
                                    name: gp.godmother_name,
                                    age: gp.godmother_age
                                    })).filter(gm => gm.name || gm.age)
                                });
                            }}
                            size="small"
                        />
                    </Box>
                </Box>
            ))}

        </>
    );
}

export default BaptismDocuments;