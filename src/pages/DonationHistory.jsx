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
} from "@mui/material";
import { supabase } from "../config/supabase.js";

const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

const DonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);

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

  return (
    <Box>
      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : donations.length === 0 ? (
        <Alert severity="info">No donations found.</Alert>
      ) : (
        donations.map((donation) => (
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
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ₱{donation.donation_amount?.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1}>
                {formatDateTime(donation.date_created)}
              </Typography>
              {donation.donation_intercession && (
                <Typography
                  variant="body2"
                  sx={{ fontStyle: "italic", color: "text.secondary" }}
                >
                  "{donation.donation_intercession}"
                </Typography>
              )}
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2">
                Payment Method: {donation.payment_method}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Transaction ID: {donation.transaction_id}
              </Typography>
            </CardContent>
          </Card>
        ))
      )}

      {/* Donation Details Modal */}
      <Modal
        open={Boolean(selectedDonation)}
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
              <Typography
                variant="h6"
                gutterBottom
                sx={{ fontWeight: "bold" }}
              >
                Donation Details
              </Typography>
              <Typography>
                Amount: ₱{selectedDonation.donation_amount?.toLocaleString()}
              </Typography>
              <Typography>
                Date: {formatDateTime(selectedDonation.date_created)}
              </Typography>
              <Typography>
                Method: {selectedDonation.payment_method}
              </Typography>
              {selectedDonation.donation_intercession && (
                <Typography sx={{ fontStyle: "italic", mt: 1 }}>
                  "{selectedDonation.donation_intercession}"
                </Typography>
              )}
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Transaction ID: {selectedDonation.transaction_id}
              </Typography>
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
    </Box>
  );
};

export default DonationHistory;