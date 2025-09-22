import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Modal,
  Divider,
  Tabs,
  Tab,
  Badge,
  Typography,
} from "@mui/material";
import { supabase } from "../config/supabase.js";

const statusColors = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  cancelled: "default",
};

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("booking_tbl")
          .select("*")
          .eq("user_id", user.id)
          .order("date_created", { ascending: false });
        if (error) throw error;
        setBookings(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (booking) => {
    try {
      await supabase
        .from("booking_tbl")
        .update({ booking_status: "cancelled" })
        .eq("id", booking.id);
      fetchBookings();
    } catch (err) {
      console.error("Cancel failed", err);
    }
  };

  const filteredBookings =
    filter === "all"
      ? bookings
      : bookings.filter((b) => b.booking_status === filter);

  const countByStatus = (status) =>
    status === "all"
      ? bookings.length
      : bookings.filter((b) => b.booking_status === status).length;

  return (
    <Box>
      <Tabs
        value={filter}
        onChange={(e, v) => setFilter(v)}
        sx={{ mb: 2 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        {["all", "pending", "approved", "rejected", "cancelled"].map(
          (status) => (
            <Tab
              key={status}
              value={status}
              label={
                <Badge
                  color={
                    statusColors[status] ||
                    (status === "all" ? "primary" : "default")
                  }
                  badgeContent={countByStatus(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Badge>
              }
            />
          )
        )}
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : filteredBookings.length === 0 ? (
        <Alert severity="info">No {filter} bookings found.</Alert>
      ) : (
        filteredBookings.map((booking) => (
          <Card
            key={booking.id}
            sx={{
              mb: 2,
              cursor: "pointer",
              transition: "0.2s",
              "&:hover": { boxShadow: 4 },
            }}
            onClick={() => setSelectedBooking(booking)}
          >
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {booking.booking_sacrament}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(booking.booking_date).toLocaleDateString()} at{" "}
                    {booking.booking_time}
                  </Typography>
                </Box>
                <Chip
                  label={booking.booking_status.toUpperCase()}
                  color={statusColors[booking.booking_status] || "default"}
                />
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2">
                Pax: {booking.booking_pax}
              </Typography>
              <Typography variant="body2">
                Price: ₱{booking.price?.toLocaleString()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Booked on{" "}
                {new Date(booking.date_created).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </Typography>
              {booking.booking_status === "pending" && (
                <Box mt={1}>
                  <Button
                    color="error"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(booking);
                    }}
                  >
                    Cancel Booking
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        ))
      )}

      {/* Booking Details Modal */}
      <Modal
        open={Boolean(selectedBooking)}
        onClose={() => setSelectedBooking(null)}
      >
        <Box
          sx={{
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
            maxWidth: 500,
            mx: "auto",
            mt: 10,
            boxShadow: 8,
          }}
        >
          {selectedBooking && (
            <>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                {selectedBooking.booking_sacrament} Booking
              </Typography>
              <Typography>
                Date:{" "}
                {new Date(selectedBooking.booking_date).toLocaleDateString()}
              </Typography>
              <Typography>Time: {selectedBooking.booking_time}</Typography>
              <Typography>Pax: {selectedBooking.booking_pax}</Typography>
              <Typography>
                Price: ₱{selectedBooking.price?.toLocaleString()}
              </Typography>
              <Typography>
                Status: {selectedBooking.booking_status.toUpperCase()}
              </Typography>
              <Typography variant="caption" display="block">
                Transaction ID: {selectedBooking.booking_transaction}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setSelectedBooking(null)}
              >
                Close
              </Button>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingList;