import {
  Box,
  Typography,
  Grid,
  Divider,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';

const WeddingSacramentForm = ({ data }) => {
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    const renderImage = (imageUrl, title) => {
        if (!imageUrl) {
        return (
            <Card variant="outlined" sx={{ px: 2, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                    No {title} Available
                </Typography>
            </Card>
        );
    }

    return (
      <Card variant="outlined">
        <CardMedia
          component="img"
          sx={{ 
            height: 200, 
            objectFit: 'cover',
            cursor: 'pointer'
          }}
          image={imageUrl}
          alt={title}
          onClick={() => window.open(imageUrl, '_blank')}
        />
        <CardContent sx={{ py: 1 }}>
          <Typography variant="caption" color="text.secondary" align="center" display="block">
            {title}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" color="#6B5F32" gutterBottom align="center">
        Wedding Documentation
      </Typography>
      
      <Divider sx={{ mb: 3 }} />

      {/* Couple Information */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Couple Information
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Groom Full Name:</strong> {data?.groom_fullname || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="body1">
            <strong>Bride Full Name:</strong> {data?.bride_fullname || 'N/A'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            <strong>Contact Number:</strong> {data?.contact_no || 'N/A'}
          </Typography>
        </Grid>
      </Grid>

      <Typography variant="body" color="#6B5F32">
        Click on the images to view them in full size.
      </Typography>
      <Divider sx={{ my: 2 }} />

      {/* Profile Pictures */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Profile Pictures (1x1)
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Groom Photo
          </Typography>
          {renderImage(data?.groom_1x1, "Groom 1x1 Photo")}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Bride Photo
          </Typography>
          {renderImage(data?.bride_1x1, "Bride 1x1 Photo")}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Baptismal Certificates */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Baptismal Certificates
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Groom Baptismal Certificate
          </Typography>
          {renderImage(data?.groom_baptismal_cert, "Groom Baptismal Certificate")}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Bride Baptismal Certificate
          </Typography>
          {renderImage(data?.bride_baptismal_cert, "Bride Baptismal Certificate")}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Confirmation Certificates */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Confirmation Certificates
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Groom Confirmation Certificate
          </Typography>
          {renderImage(data?.groom_confirmation_cert, "Groom Confirmation Certificate")}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Bride Confirmation Certificate
          </Typography>
          {renderImage(data?.bride_confirmation_cert, "Bride Confirmation Certificate")}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Legal Documents */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Legal Documents
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Marriage License
          </Typography>
          {renderImage(data?.marriage_license, "Marriage License")}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Marriage Contract
          </Typography>
          {renderImage(data?.marriage_contract, "Marriage Contract")}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* CENOMAR Documents */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        CENOMAR
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Groom CENOMAR
          </Typography>
          {renderImage(data?.groom_cenomar, "Groom CENOMAR")}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Bride CENOMAR
          </Typography>
          {renderImage(data?.bride_cenomar, "Bride CENOMAR")}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Banns Documents */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Banns of Marriage
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Groom Banns
          </Typography>
          {renderImage(data?.groom_banns, "Groom Banns")}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Bride Banns
          </Typography>
          {renderImage(data?.bride_banns, "Bride Banns")}
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Permission Documents */}
      <Typography variant="h5" color="#6B5F32" gutterBottom>
        Permission Documents
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Groom Permission
          </Typography>
          {renderImage(data?.groom_permission, "Groom Permission")}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Bride Permission
          </Typography>
          {renderImage(data?.bride_permission, "Bride Permission")}
        </Grid>
      </Grid>

      <Divider sx={{ mt: 3, mb: 2 }} />

      {/* Record Info */}
      <Typography variant="body2" color="text.secondary" align="center">
        Record ID: {data?.id || 'N/A'} <br /> 
        Date Created: {formatDate(data?.date_created)}
      </Typography>
    </Box>
  );
};

export default WeddingSacramentForm;