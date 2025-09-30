import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Modal,
  Divider,
  Button,
  Chip,
} from "@mui/material";
import { supabase } from "../config/supabase.js";
import ReceiptIcon from "@mui/icons-material/Receipt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CancelIcon from "@mui/icons-material/Cancel";

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return { color: "success", icon: <CheckCircleIcon sx={{ fontSize: 16 }} /> };
    case "pending":
      return { color: "warning", icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> };
    case "rejected":
      return { color: "error", icon: <CancelIcon sx={{ fontSize: 16 }} /> };
    default:
      return { color: "default", icon: <AccessTimeIcon sx={{ fontSize: 16 }} /> };
  }
};

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("donation_tbl")
          .select("*")
          .eq("user_id", user.id)
          .order("date_created", { ascending: false });
        if (error) throw error;
        setDonations(data || []);
      }
    } catch (err) {
      console.error("Error fetching donations:", err);
    } finally {
      setLoading(false);
    }
  };

  const openReceiptModal = (e, donation) => {
    e.stopPropagation();
    if (donation.donation_receipts) {
      setSelectedDonation(donation);
      setReceiptModalOpen(true);
    }
  };

  return (
    <Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : donations.length === 0 ? (
        <Alert severity="info">No donations found.</Alert>
      ) : (
        donations.map((donation) => {
          const statusInfo = getStatusColor(donation.status);
          return (
            <Card
              key={donation.id}
              sx={{
                mb: 2,
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": { boxShadow: 4 },
              }}
              onClick={() => setSelectedDonation(donation)}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={1}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    ₱{donation.donation_amount?.toLocaleString()}
                  </Typography>
                  <Chip
                    label={donation.status || "pending"}
                    color={statusInfo.color}
                    size="small"
                    icon={statusInfo.icon}
                    sx={{ textTransform: "capitalize" }}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" mb={1}>
                  {formatDateTime(donation.date_created)}
                </Typography>

                {donation.donation_intercession && (
                  <Typography
                    variant="body2"
                    sx={{ fontStyle: "italic", color: "text.secondary", mb: 1 }}
                  >
                    "{donation.donation_intercession}"
                  </Typography>
                )}

                {donation.donation_receipts && (
                  <Button
                    size="small"
                    startIcon={<ReceiptIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => openReceiptModal(e, donation)}
                    sx={{
                      mt: 1,
                      color: "#6B5F32",
                      borderColor: "#E1D5B8",
                      "&:hover": { borderColor: "#d1c5a8", bgcolor: "#fafafa" },
                    }}
                    variant="outlined"
                  >
                    View Receipt
                  </Button>
                )}

                <Divider sx={{ my: 1.5 }} />
                <Typography variant="body2">
                  Payment Method: {donation.payment_method || "N/A"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Transaction ID: {donation.transaction_id || "N/A"}
                </Typography>
              </CardContent>
            </Card>
          );
        })
      )}

      {/* Donation Details Modal */}
      <Modal
        open={Boolean(selectedDonation) && !receiptModalOpen}
        onClose={() => setSelectedDonation(null)}
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
          {selectedDonation && (
            <>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  Donation Details
                </Typography>
                <Chip
                  label={selectedDonation.status || "pending"}
                  color={getStatusColor(selectedDonation.status).color}
                  size="small"
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>

              <Typography>
                Amount: ₱
                {selectedDonation.donation_amount?.toLocaleString()}
              </Typography>
              <Typography>
                Date: {formatDateTime(selectedDonation.date_created)}
              </Typography>
              <Typography>
                Method: {selectedDonation.payment_method || "N/A"}
              </Typography>

              {selectedDonation.donation_intercession && (
                <Typography sx={{ fontStyle: "italic", mt: 1 }}>
                  "{selectedDonation.donation_intercession}"
                </Typography>
              )}

              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Transaction ID: {selectedDonation.transaction_id || "N/A"}
              </Typography>

              {selectedDonation.donation_receipts && (
                <Box mt={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ReceiptIcon sx={{ fontSize: 16 }} />}
                    onClick={(e) => {
                      openReceiptModal(e, selectedDonation);
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
                onClick={() => setSelectedDonation(null)}
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
          setSelectedDonation(null);
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
          {selectedDonation && (
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
                  src={selectedDonation.donation_receipts}
                  alt="Donation Receipt"
                  sx={{
                    maxWidth: "100%",
                    maxHeight: "60vh",
                    objectFit: "contain",
                    borderRadius: 1,
                    border: "1px solid #E1D5B8",
                  }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = ""; // Fallback if image fails to load
                    e.target.alt = "Receipt image failed to load";
                  }}
                />
              </Box>

              <Box mb={2}>
                <Typography variant="body2" color="text.secondary">
                  Amount: ₱
                  {selectedDonation.donation_amount?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Date: {formatDateTime(selectedDonation.date_created)}
                </Typography>
              </Box>

              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  fullWidth
                  component="a"
                  href={selectedDonation.donation_receipts}
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
                    setSelectedDonation(null);
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

export default DonationHistory;