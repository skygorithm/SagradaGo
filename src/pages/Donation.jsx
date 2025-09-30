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
import blobUrlToFile from "../utils/blobUrlToFile";

const Donation = ({ open = false, onClose = () => {} }) => {
  const [amount, setAmount] = useState("");
  const [donationIntercession, setDonationIntercession] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showQRCode, setShowQRCode] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentDonationId, setCurrentDonationId] = useState(null);

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
      status: "pending",
      date_created: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("donation_tbl")
      .insert([donationData])
      .select();

    if (error) {
      console.error("Error inserting donation:", error);
      setErrorMessage("Failed to process donation. Please try again.");
      return;
    }

    setCurrentDonationId(data[0].id);
    setShowQRCode(true);
    setErrorMessage("");
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage("File size must be less than 10MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please upload an image file");
        return;
      }
      setReceiptFile(file);
      setErrorMessage("");
    }
  };

  const handleReceiptUpload = async () => {
    if (!receiptFile) {
      setErrorMessage("Please select a receipt image to upload.");
      return;
    }

    setUploading(true);
    setErrorMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in to upload a receipt.");
        setUploading(false);
        return;
      }

      // Upload file to Supabase Storage
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `${user.id}_${currentDonationId}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("donation-receipts")
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("donation-receipts").getPublicUrl(filePath);

      // Update donation record with receipt URL
      const { error: updateError } = await supabase
        .from("donation_tbl")
        .update({
          donation_receipts: publicUrl,
          status: "active",
        })
        .eq("id", currentDonationId);

      if (updateError) throw updateError;

      alert(
        `Thank you! You have donated PHP ${parseFloat(amount).toLocaleString(
          "en-PH",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}. Your receipt has been uploaded successfully.`
      );

      // Reset all states
      setAmount("");
      setDonationIntercession("");
      setShowQRCode(false);
      setShowReceiptUpload(false);
      setReceiptFile(null);
      setCurrentDonationId(null);
      onClose();
    } catch (error) {
      console.error("Error uploading receipt:", error);
      setErrorMessage("Failed to upload receipt. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleNext = () => {
    setShowQRCode(false);
    setShowReceiptUpload(true);
  };

  const handleClose = () => {
    setAmount("");
    setDonationIntercession("");
    setShowQRCode(false);
    setShowReceiptUpload(false);
    setReceiptFile(null);
    setCurrentDonationId(null);
    setErrorMessage("");
    onClose();
  };

  return (
    <CardPopup
      open={Boolean(open)}
      onClose={handleClose}
      title={
        showReceiptUpload
          ? "Upload Receipt"
          : showQRCode
          ? "Scan QR Code"
          : "Make a Donation"
      }
    >
      {showReceiptUpload ? (
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography textAlign="center">
            Please upload your payment receipt or proof of transaction to
            complete your donation.
          </Typography>

          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Box
            sx={{
              border: "2px dashed #E1D5B8",
              borderRadius: "8px",
              p: 3,
              textAlign: "center",
              bgcolor: "#fafafa",
            }}
          >
            <input
              accept="image/*"
              style={{ display: "none" }}
              id="receipt-upload"
              type="file"
              onChange={handleFileSelect}
            />
            <label htmlFor="receipt-upload">
              <Button
                variant="outlined"
                component="span"
                sx={{
                  borderColor: "#E1D5B8",
                  color: "#6B5F32",
                  "&:hover": { borderColor: "#d1c5a8", bgcolor: "#f5f5f5" },
                }}
              >
                Choose File
              </Button>
            </label>
            {receiptFile && (
              <Typography sx={{ mt: 2, color: "#6B5F32" }}>
                Selected: {receiptFile.name}
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={handleReceiptUpload}
            disabled={!receiptFile || uploading}
            sx={{
              bgcolor: "#E1D5B8",
              "&:hover": { bgcolor: "#d1c5a8" },
              "&:disabled": { bgcolor: "#e0e0e0" },
              py: 1.3,
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            {uploading ? "Uploading..." : "Submit Receipt"}
          </Button>
        </Box>
      ) : showQRCode ? (
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
            sx={{
              mt: 3,
              bgcolor: "#E1D5B8",
              "&:hover": { bgcolor: "#d1c5a8" },
            }}
            onClick={handleNext}
          >
            Next
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