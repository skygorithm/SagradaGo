import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
} from "@mui/material";
import CardPopup from "../components/CardPopup.jsx";
import { supabase } from "../config/supabase";

const Donation = ({ open = false, onClose = () => {} }) => {
  const [amount, setAmount] = useState("");
  const [donationIntercession, setDonationIntercession] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);

  const handleDonate = async () => {
    const parsedAmount = parseFloat(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage("Please enter a valid donation amount.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErrorMessage("You must be logged in to make a donation.");
      return;
    }

    const donationData = {
      donation_amount: parsedAmount,
      donation_intercession: donationIntercession,
      user_id: user.id,
      is_deleted: false,
      status: "active",
      date_created: new Date().toISOString(),
    };

    const { error } = await supabase.from("donation_tbl").insert([donationData]);
    if (error) {
      console.error("Error inserting donation:", error);
      setErrorMessage("Failed to process donation. Please try again.");
      return;
    }

    alert(
      `Thank you! You have donated PHP ${parsedAmount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    );
    setShowQRCode(true);
    setAmount("");
    setDonationIntercession("");
  };

  return (
    <CardPopup
      open={Boolean(open)}
      onClose={() => {
        onClose();
        setShowQRCode(false);
        setErrorMessage("");
      }}
      title="Make a Donation"
    >
      {showQRCode ? (
        <Box textAlign="center">
          <Typography variant="h6" gutterBottom>
            Scan QR Code to Complete Payment
          </Typography>

          <Box
            component="img"
            src={`/images/qr-codes/qr-${
              Math.floor(Math.random() * 3) + 1
            }.png`}
            alt="Donation QR Code"
            sx={{
              width: "100%",
              maxWidth: "200px",
              height: "auto",
              border: "2px solid #E1D5B8",
              borderRadius: "8px",
              my: 2,
            }}
          />

          <Typography sx={{ color: "#6B5F32", fontWeight: 500 }}>
            Thank you for your generosity!
          </Typography>

          <Button
            variant="contained"
            sx={{ mt: 3, bgcolor: "#E1D5B8", "&:hover": { bgcolor: "#d1c5a8" } }}
            onClick={() => {
              setShowQRCode(false);
              onClose();
            }}
          >
            Done
          </Button>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography textAlign="center">
            Support our parish by making a donation. Your generosity helps us
            continue our mission.
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <TextField
            label="Enter Amount"
            variant="outlined"
            value={
              amount === "0" || amount === ""
                ? ""
                : `${(parseFloat(amount) || 0).toLocaleString("en-PH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
            }
            onChange={(e) => {
              const input = e.target.value.replace(/[^\d]/g, "");
              if (!input) return setAmount("");
              const numericValue = parseInt(input, 10) / 100;
              if (numericValue <= 99999999.99) {
                setAmount(numericValue.toFixed(2));
              }
            }}
            placeholder="0.00"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">₱</InputAdornment>
              ),
            }}
            inputProps={{ inputMode: "numeric", style: { textAlign: "right" } }}
            fullWidth
          />

          <TextField
            label="Donation Intercession (Optional)"
            variant="outlined"
            value={donationIntercession}
            onChange={(e) => setDonationIntercession(e.target.value)}
            fullWidth
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleDonate}
            sx={{
              bgcolor: "#E1D5B8",
              "&:hover": { bgcolor: "#d1c5a8" },
              py: 1.3,
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            Confirm Donation
          </Button>
        </Box>
      )}
    </CardPopup>
  );
};

export default Donation;