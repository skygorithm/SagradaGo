import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { History as HistoryIcon, DeleteForever as DeleteForeverIcon } from '@mui/icons-material';

const DashboardHeader = ({
  onViewLogs,
  onViewDeleted,
  onViewCalendar,
  onLogout
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h4" component="h1">
        Admin Dashboard
      </Typography>
      <Box>
        <Button
          variant="outlined"
          startIcon={<HistoryIcon />}
          onClick={onViewLogs}
          sx={{ mr: 2, color: '#6B5F32' }}
        >
          View Logs
        </Button>
        <Button
          variant="outlined"
          startIcon={<DeleteForeverIcon />}
          onClick={onViewDeleted}
          sx={{ mr: 2, color: '#6B5F32' }}
        >
          View Trash
        </Button>
        <Button
          variant="outlined"
          onClick={onViewCalendar}
          sx={{ mr: 2, color: '#6B5F32' }}
        >
          Approved Bookings Calendar
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={onLogout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default DashboardHeader;