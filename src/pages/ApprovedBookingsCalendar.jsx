import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText, CircularProgress, Button, Tooltip } from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, StaticDatePicker } from '@mui/x-date-pickers';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

const ApprovedBookingsCalendar = () => {
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedBookings = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('booking_tbl')
        .select('*')
        .eq('booking_status', 'approved')
        .order('booking_date', { ascending: true })
        .order('booking_time', { ascending: true });
      
      if (!error) setApprovedBookings(data || []);
      setLoading(false);
    };
    fetchApprovedBookings();
  }, []);

  // Group bookings by date
  const bookingsByDate = approvedBookings.reduce((acc, booking) => {
    if (!acc[booking.booking_date]) {
      acc[booking.booking_date] = [];
    }
    acc[booking.booking_date].push(booking);
    return acc;
  }, {});

  // Get bookings for the selected date
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const bookingsForSelectedDate = bookingsByDate[selectedDateStr] || [];

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Get tooltip content for a date
  const getDateTooltip = (dateStr) => {
    const bookings = bookingsByDate[dateStr] || [];
    if (bookings.length === 0) return '';
    
    return bookings.map(booking => 
      `${booking.booking_sacrament} at ${formatTime(booking.booking_time)}`
    ).join('\n');
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4, p: 2 }}>
      <Button variant="outlined" sx={{ mb: 2, color: '#6B5F32' }} onClick={() => navigate('/admin')}>
        Back to Dashboard
      </Button>
      <Typography variant="h4" gutterBottom>Approved Bookings Calendar</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <StaticDatePicker
            displayStaticWrapperAs="desktop"
            value={selectedDate}
            onChange={setSelectedDate}
            renderDay={(day, _value, DayComponentProps) => {
              const dateStr = day.toISOString().split('T')[0];
              const bookings = bookingsByDate[dateStr] || [];
              const isMarked = bookings.length > 0;
              const tooltipContent = getDateTooltip(dateStr);

              return (
                <Tooltip 
                  title={tooltipContent} 
                  arrow 
                  placement="top"
                  enterDelay={200}
                >
                  <div style={{ position: 'relative' }}>
                    <span style={{
                      background: isMarked ? '#E1D5B8' : undefined,
                      borderRadius: '50%',
                      display: 'inline-block',
                      width: 36,
                      height: 36,
                      lineHeight: '36px',
                      textAlign: 'center',
                      color: isMarked ? '#000' : undefined,
                      position: 'relative',
                    }}>
                      {day.getDate()}
                      {isMarked && (
                        <span style={{
                          position: 'absolute',
                          bottom: 2,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '8px',
                          color: '#666',
                        }}>
                          {bookings.length}
                        </span>
                      )}
                    </span>
                  </div>
                </Tooltip>
              );
            }}
          />
        </LocalizationProvider>
      </Paper>

      <Typography variant="h6" gutterBottom>
        Bookings for {selectedDate.toLocaleDateString()}
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : bookingsForSelectedDate.length === 0 ? (
        <Typography>No approved bookings for this date.</Typography>
      ) : (
        <List>
          {bookingsForSelectedDate.map((booking) => (
            <ListItem 
              key={booking.id}
              sx={{
                border: '1px solid #E1D5B8',
                borderRadius: 1,
                mb: 1,
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
              }}
            >
              <ListItemText
                primary={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {booking.booking_sacrament}
                  </Typography>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Time: {formatTime(booking.booking_time)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Number of People: {booking.booking_pax}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transaction ID: {booking.booking_transaction}
                    </Typography>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
};

export default ApprovedBookingsCalendar; 