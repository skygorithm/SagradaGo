import {
  Box,
  Typography,
  Grid,
  Divider
} from '@mui/material';

const BurialSacramentForm = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderBooleanStatus = (value, label) => {
    const isTrue = value === true || value === 'true';
    return (
      <Typography variant="body1" sx={{ mb: 1 }}>
        <strong>{label}:</strong> {isTrue ? 'Yes' : 'No'}
      </Typography>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" color="#6B5F32" gutterBottom align="center">
        Burial Service Details
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      {/* Deceased Information */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Deceased Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Name:</strong> {data?.deceased_name || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Age:</strong> {data?.deceased_age || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Civil Status:</strong> {data?.deceased_civil_status || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Requester Information */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Requester Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Requested By:</strong> {data?.requested_by || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Relationship to Deceased:</strong> {data?.deceased_relationship || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Contact Number:</strong> {data?.contact_no || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Address:</strong> {data?.address || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Service Location */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Service Location
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Place of Mass:</strong> {data?.place_of_mass || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Mass Address:</strong> {data?.mass_address || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Service Options */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Requested Services
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {renderBooleanStatus(data?.funeral_mass, 'Funeral Mass')}
          {renderBooleanStatus(data?.death_anniversary, 'Death Anniversary')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderBooleanStatus(data?.funeral_blessing, 'Funeral Blessing')}
          {renderBooleanStatus(data?.tomb_blessing, 'Tomb Blessing')}
        </Grid>
      </Grid>

      <Divider sx={{ mt: 3, mb: 2 }} />

      {/* Certificate Info */}
      <Typography variant="body2" color="text.secondary" align="center">
        Service ID: {data?.id || 'N/A'} | 
        Date Created: {formatDate(data?.date_created)}
      </Typography>
    </Box>
  );
};

export default BurialSacramentForm;