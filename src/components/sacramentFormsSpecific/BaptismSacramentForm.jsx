import { Person } from '@mui/icons-material';
import {  Box,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const BaptismSacramentForm = ({ data }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const renderGodparent = (godparent, title) => {
    if (!godparent || typeof godparent !== 'object') return null;
    return (
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" color="#6B5F32" gutterBottom>
            {title}
          </Typography>
          <Typography variant="body2">
            <strong>Name:</strong> {godparent.name || 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Age:</strong> {godparent.age || 'N/A'}
          </Typography>
          <Typography variant="body2">
            <strong>Address:</strong> {godparent.address || 'N/A'}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  const renderAdditionalGodparents = (godparents) => {
    if (!Array.isArray(godparents) || godparents.length === 0) {
      return <Typography variant="body2" color="text.secondary">None</Typography>;
    }

    return (
      <List dense>
        {godparents.map((godparent, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={
                <Box>
                  {godparent.godfather_name && (
                    <Typography variant="body2">
                        <Person sx={{ color: '#6B5F32', mr: 1 }} />
                        {godparent.godfather_name} (Age: {godparent.godfather_age || 'N/A'})
                    </Typography>
                  )}
                  {godparent.godmother_name && (
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        <Person sx={{ color: '#6B5F32', mr: 1 }} />
                        {godparent.godmother_name} (Age: {godparent.godmother_age || 'N/A'})
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };

  const renderAdditionalSingleGender = (godparents) => {
    if (!Array.isArray(godparents) || godparents.length === 0) {
      return <Typography variant="body2" color="text.secondary">None</Typography>;
    }

    return (
      <List dense>
        {godparents.map((godparent, index) => (
          <ListItem key={index} divider>
            <ListItemText
              primary={
                <Typography variant="body2">
                    <Person sx={{ color: '#6B5F32', mr: 1 }} />
                    {godparent.name} (Age: {godparent.age || 'N/A'})
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
    );
  };
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" color="#6B5F32" gutterBottom align="center">
        Baptism Details
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      {/* Baby Information */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Child Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Full Name:</strong> {data?.baby_name || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Date of Birth:</strong> {formatDate(data?.baby_bday)}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Place of Birth:</strong> {data?.baby_birthplace || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Parents Information */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Parents Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Mother's Name:</strong> {data?.mother_name || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Birthplace:</strong> {data?.mother_birthplace || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Father's Name:</strong> {data?.father_name || 'N/A'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Birthplace:</strong> {data?.father_birthplace || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Marriage Type:</strong> {data?.marriage_type || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Contact Number:</strong> {data?.contact_no || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Current Address:</strong> {data?.current_address || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Main Godparents */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Principal Godparents
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          {renderGodparent(data?.main_godfather, 'Main Godfather')}
        </Grid>
        <Grid item xs={12} md={6}>
          {renderGodparent(data?.main_godmother, 'Main Godmother')}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Additional Godparents */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Additional Godparents
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Additional Godfathers
          </Typography>
          {renderAdditionalSingleGender(data?.additional_godfathers, 'Godfather')}
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Additional Godmothers
          </Typography>
          {renderAdditionalSingleGender(data?.additional_godmothers, 'Godmother')}
        </Grid>
      </Grid>

      <Divider sx={{ mt: 3, mb: 2 }} />

      {/* Certificate Info */}
      <Typography variant="body2" color="text.secondary" align="center">
        ID: {data?.id || 'N/A'} <br />
        Date Created: {formatDate(data?.data_created)}
      </Typography>
    </Box>
  );
};

export default BaptismSacramentForm;