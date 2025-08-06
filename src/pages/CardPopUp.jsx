// CardPopup.jsx
import React from 'react';
import { Dialog, Card, CardContent, IconButton, Box, Typography } from '@mui/material';

export default function CardPopup({ open, onClose, title, children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
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
          {children}
        </CardContent>
      </Card>
    </Dialog>
  );
}