import React from 'react';
import { Dialog, Card, CardContent, IconButton, Box, Typography } from '@mui/material';

export default function CardPopup({ open, onClose, title, children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Card>
        <CardContent>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <img 
              src="/images/sagrada-familia-logo.png" 
              alt="Sagrada Familia Parish Logo" 
              style={{ height: 60, marginBottom: 8 }}
            />
            <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
              <Typography variant="h6">{title}</Typography>
              <IconButton 
                onClick={onClose} 
                size="small"
                edge="end"
                aria-label="close"
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)'
                  }
                }}
              >
                ✕
              </IconButton>
            </Box>
          </Box>
          {children}
        </CardContent>
      </Card>
    </Dialog>
  );
} 