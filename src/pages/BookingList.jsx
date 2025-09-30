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
import ReceiptIcon from "@mui/icons-material/Receipt";

const statusColors = {
  approved: "success",
  pending: "warning",
  rejected: "error",
  cancelled: "default",
};

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [weddingDetails, setWeddingDetails] = useState({});
  const [baptismDetails, setBaptismDetails] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

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
        
        // Fetch wedding details for wedding bookings
        const weddingBookings = (data || []).filter(
          (b) => b.booking_sacrament?.toLowerCase() === "wedding"
        );
        
        if (weddingBookings.length > 0) {
          const weddingIds = weddingBookings.map((b) => b.id);
          const { data: weddingData, error: weddingError } = await supabase
            .from("booking_wedding_docu_tbl")
            .select("booking_id, groom_fullname, bride_fullname")
            .in("booking_id", weddingIds);
          
          if (!weddingError && weddingData) {
            const weddingMap = {};
            weddingData.forEach((w) => {
              weddingMap[w.booking_id] = {
                groom: w.groom_fullname,
                bride: w.bride_fullname,
              };
            });
            setWeddingDetails(weddingMap);
          }
        }
        
        // Fetch baptism details for baptism bookings
        const baptismBookings = (data || []).filter(
          (b) => b.booking_sacrament?.toLowerCase() === "baptism"
        );
        
        if (baptismBookings.length > 0) {
          const baptismIds = baptismBookings.map((b) => b.id);
          const { data: baptismData, error: baptismError } = await supabase
            .from("booking_baptism_docu_tbl")
            .select("booking_id, baby_name, baby_bday, mother_name, father_name")
            .in("booking_id", baptismIds);
          
          if (!baptismError && baptismData) {
            const baptismMap = {};
            baptismData.forEach((b) => {
              baptismMap[b.booking_id] = {
                babyName: b.baby_name,
                babyBirthday: b.baby_bday,
                motherName: b.mother_name,
                fatherName: b.father_name,
              };
            });
            setBaptismDetails(baptismMap);
          }
        }
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

  const openReceiptModal = (e, booking) => {
    e.stopPropagation();
    if (booking.payment_receipts) {
      setSelectedBooking(booking);
      setReceiptModalOpen(true);
    }
  };

  const getWeddingNames = (bookingId) => {
    const details = weddingDetails[bookingId];
    if (details && (details.groom || details.bride)) {
      return `${details.groom || "N/A"} & ${details.bride || "N/A"}`;
    }
    return null;
  };

  const getBaptismInfo = (bookingId) => {
    const details = baptismDetails[bookingId];
    if (details && details.babyName) {
      return details.babyName;
    }
    return null;
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
        filteredBookings.map((booking) => {
          const isWedding = booking.booking_sacrament?.toLowerCase() === "wedding";
          const isBaptism = booking.booking_sacrament?.toLowerCase() === "baptism";
          const weddingNames = isWedding ? getWeddingNames(booking.id) : null;
          const baptismInfo = isBaptism ? getBaptismInfo(booking.id) : null;
          
          return (
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
                    {weddingNames && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "#6B5F32", 
                          fontWeight: 500,
                          mt: 0.5 
                        }}
                      >
                        {weddingNames}
                      </Typography>
                    )}
                    {baptismInfo && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: "#6B5F32", 
                          fontWeight: 500,
                          mt: 0.5 
                        }}
                      >
                        {baptismInfo}
                      </Typography>
                    )}
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

                {booking.payment_receipts && (
                  <Box mt={1}>
                    <Button
                      size="small"
                      startIcon={<ReceiptIcon sx={{ fontSize: 16 }} />}
                      onClick={(e) => openReceiptModal(e, booking)}
                      sx={{
                        color: "#6B5F32",
                        borderColor: "#E1D5B8",
                        "&:hover": { borderColor: "#d1c5a8", bgcolor: "#fafafa" },
                      }}
                      variant="outlined"
                    >
                      View Receipt
                    </Button>
                  </Box>
                )}

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
          );
        })
      )}

      {/* Booking Details Modal */}
      <Modal
        open={Boolean(selectedBooking) && !receiptModalOpen}
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
              
              {selectedBooking.booking_sacrament?.toLowerCase() === "wedding" && 
               getWeddingNames(selectedBooking.id) && (
                <Box 
                  sx={{ 
                    bgcolor: "#FFF9E6", 
                    p: 2, 
                    borderRadius: 1, 
                    mb: 2,
                    border: "1px solid #E1D5B8"
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: "#6B5F32", 
                      fontWeight: 600,
                      mb: 0.5
                    }}
                  >
                    Couple
                  </Typography>
                  <Typography variant="body2">
                    Groom: {weddingDetails[selectedBooking.id]?.groom || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Bride: {weddingDetails[selectedBooking.id]?.bride || "N/A"}
                  </Typography>
                </Box>
              )}
              
              {selectedBooking.booking_sacrament?.toLowerCase() === "baptism" && 
               baptismDetails[selectedBooking.id] && (
                <Box 
                  sx={{ 
                    bgcolor: "#FFF9E6", 
                    p: 2, 
                    borderRadius: 1, 
                    mb: 2,
                    border: "1px solid #E1D5B8"
                  }}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      color: "#6B5F32", 
                      fontWeight: 600,
                      mb: 0.5
                    }}
                  >
                    Baptism Details
                  </Typography>
                  <Typography variant="body2">
                    Baby: {baptismDetails[selectedBooking.id]?.babyName || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Birthday: {baptismDetails[selectedBooking.id]?.babyBirthday 
                      ? new Date(baptismDetails[selectedBooking.id].babyBirthday).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Mother: {baptismDetails[selectedBooking.id]?.motherName || "N/A"}
                  </Typography>
                  <Typography variant="body2">
                    Father: {baptismDetails[selectedBooking.id]?.fatherName || "N/A"}
                  </Typography>
                </Box>
              )}
              
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

              {selectedBooking.payment_receipts && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ReceiptIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => {
                      openReceiptModal(e, selectedBooking);
                    }}
                    sx={{
                      color: "#6B5F32",
                      borderColor: "#E1D5B8",
                      "&:hover": {
                        borderColor: "#d1c5a8",
                        bgcolor: "#fafafa",
                      },
                    }}
                  >
                    View Receipt
                  </Button>
                </Box>
              )}

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

      {/* Receipt Image Modal */}
      <Modal
        open={receiptModalOpen}
        onClose={() => {
          setReceiptModalOpen(false);
          setSelectedBooking(null);
        }}
      >
        <Box
          sx={{
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
            maxWidth: 600,
            mx: "auto",
            mt: 5,
            boxShadow: 8,
            maxHeight: "90vh",
            overflow: "auto",
          }}
        >
          {selectedBooking && (
            <>
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold", mb: 2 }}
              >
                Payment Receipt
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  bgcolor: "#f5f5f5",
                  borderRadius: 2,
                  p: 2,
                  mb: 2,
                }}
              >
                <Box
                  component="img"
                  src={selectedBooking.payment_receipts}
                  alt="Payment Receipt"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "60vh",
                    objectFit: "contain",
                    borderRadius: 1,
                    border: "1px solid #E1D5B8",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "";
                    e.target.alt = "Receipt image failed to load";
                  }}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Sacrament: {selectedBooking.booking_sacrament}
                </Typography>
                {selectedBooking.booking_sacrament?.toLowerCase() === "wedding" && 
                 getWeddingNames(selectedBooking.id) && (
                  <Typography variant="body2" color="text.secondary">
                    Couple: {getWeddingNames(selectedBooking.id)}
                  </Typography>
                )}
                {selectedBooking.booking_sacrament?.toLowerCase() === "baptism" && 
                 baptismDetails[selectedBooking.id] && (
                  <>
                    <Typography variant="body2" color="text.secondary">
                      Baby: {baptismDetails[selectedBooking.id]?.babyName || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Parents: {baptismDetails[selectedBooking.id]?.motherName || "N/A"} & {baptismDetails[selectedBooking.id]?.fatherName || "N/A"}
                    </Typography>
                  </>
                )}
                <Typography variant="body2" color="text.secondary">
                  Amount: ₱{selectedBooking.price?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date:{" "}
                  {new Date(selectedBooking.booking_date).toLocaleDateString()}{" "}
                  at {selectedBooking.booking_time}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Booked on:{" "}
                  {new Date(selectedBooking.date_created).toLocaleString(
                    "en-US",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  )}
                </Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  component="a"
                  href={selectedBooking.payment_receipts}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#6B5F32",
                    borderColor: "#E1D5B8",
                    "&:hover": {
                      borderColor: "#d1c5a8",
                      bgcolor: "#fafafa",
                    },
                  }}
                >
                  Open in New Tab
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => {
                    setReceiptModalOpen(false);
                    setSelectedBooking(null);
                  }}
                  sx={{
                    bgcolor: "#E1D5B8",
                    "&:hover": { bgcolor: "#d1c5a8" },
                  }}
                >
                  Close
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default BookingList;