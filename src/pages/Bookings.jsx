import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  LocalizationProvider,
  DatePicker,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

import CardPopup from "../components/CardPopup.jsx";
import { supabase } from "../config/supabase.js";

// Utilities
import {
  getMinimumBookingDate,
  restrictSacramentBooking,
} from "../utils/sacramentBookingRestriction.jsx";
import baptismFormValidation from "../utils/form-validations/baptismFormValidation.jsx";
import burialFormValidation from "../utils/form-validations/burialFormValidation.jsx";
import weddingFormValidation from "../utils/form-validations/weddingFormValidation.jsx";
import saveSpecificSacramentDocument from "../utils/form-functions/saveSpecificSacramentDocument.jsx";
import { getSacramentPrice } from "../information/getSacramentPrice.jsx";

// Sacrament Document Components
import WeddingDocuments from "../components/sacrament-documents/wedding-documents.jsx";
import BaptismDocuments from "../components/sacrament-documents/baptism-documents.jsx";
import BurialDocuments from "../components/sacrament-documents/burial-documents.jsx";

const Bookings = ({ open = false, onClose = () => {} }) => {
  const [selectedSacrament, setSelectedSacrament] = useState("");
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [pax, setPax] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Payment flow states
  const [showQRCode, setShowQRCode] = useState(false);
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);

  const [weddingForm, setWeddingForm] = useState({
    groom_fullname: "",
    bride_fullname: "",
    contact_no: "",
    marriage_license: null,
    marriage_contract: null,
    groom_1x1: null,
    bride_1x1: null,
    groom_baptismal_cert: null,
    bride_baptismal_cert: null,
    groom_confirmation_cert: null,
    bride_confirmation_cert: null,
    groom_cenomar: null,
    bride_cenomar: null,
    groom_banns: null,
    bride_banns: null,
    groom_permission: null,
    bride_permission: null,
  });

  // Format phone number for display
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 4) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 4)}-${cleaned.slice(4)}`;
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const input = e.target.value.replace(/\D/g, "");
    if (input.length <= 11) {
      setWeddingForm({ ...weddingForm, contact_no: input });
    }
  };

  const [baptismForm, setBaptismForm] = useState({
    main_godfather: {},
    main_godmother: {},
    additional_godparents: [],
  });

  const [burialForm, setBurialForm] = useState({
    funeral_mass: false,
    death_anniversary: false,
    funeral_blessing: false,
    tomb_blessing: false,
  });

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const handleNext = () => {
    // Basic validation
    if (!selectedSacrament || !date || !time || !pax) {
      setErrorMessage("Please select a sacrament, date, time, and number of people.");
      return;
    }

    let restriction = restrictSacramentBooking(selectedSacrament, date);
    if (restriction !== "") {
      setErrorMessage(restriction);
      return;
    }

    // Validate forms without uploading
    if (selectedSacrament === "Wedding") {
      const validateResult = weddingFormValidation(weddingForm, setErrorMessage);
      if (!validateResult) {
        return;
      }
    } else if (selectedSacrament === "Baptism") {
      // Just check if form is filled, don't pass user yet
      if (!baptismForm.main_godfather || !baptismForm.main_godmother) {
        setErrorMessage("Please fill in godparent information.");
        return;
      }
    } else if (selectedSacrament === "Burial") {
      // Burial form validation if needed
      const hasSelection = burialForm.funeral_mass || burialForm.death_anniversary || 
                          burialForm.funeral_blessing || burialForm.tomb_blessing;
      if (!hasSelection) {
        setErrorMessage("Please select at least one burial service.");
        return;
      }
    }

    // Generate transaction ID
    const trxId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    setCurrentTransactionId(trxId);
    
    // Show QR code immediately
    setShowQRCode(true);
    setErrorMessage("");
  };

  const handleQRNext = () => {
    setShowQRCode(false);
    setShowReceiptUpload(true);
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

    console.log("=== STARTING BOOKING PROCESS ===");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrorMessage("You must be logged in to upload a receipt.");
        setUploading(false);
        return;
      }

      console.log("Starting booking process for:", selectedSacrament);

      let specificDocumentTable = { date_created: new Date().toISOString() };

      // Handle Wedding Documents
      if (selectedSacrament === "Wedding") {
        console.log("Processing wedding documents...");
        specificDocumentTable = {
          ...specificDocumentTable,
          groom_fullname: weddingForm.groom_fullname,
          bride_fullname: weddingForm.bride_fullname,
          contact_no: weddingForm.contact_no,
        };

        // Upload function using direct File objects
        const uploadDocument = async (label, file, fileNameKey) => {
          if (!file) {
            console.log(`Skipping ${label} - no file provided`);
            return null;
          }
          
          try {
            console.log(`Uploading ${label}...`);
            
            if (!(file instanceof File)) {
              throw new Error(`Invalid file type for ${label}`);
            }

            if (file.size > 10 * 1024 * 1024) {
              throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(2)} MB (max: 10 MB)`);
            }

            const fileExt = file.name.split(".").pop();
            const sanitizedFilename = `${user.email}_${fileNameKey}`.replace(/[^a-zA-Z0-9._-]/g, '_');
            const uniqueFileName = `${sanitizedFilename}_${Date.now()}.${fileExt}`;
            const filepath = `receipts/${user.id}_${uniqueFileName}`;

            const { error: uploadError } = await supabase.storage
              .from('booking-documents')
              .upload(filepath, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error(`Upload error for ${label}:`, uploadError);
              throw new Error(`Failed to upload ${label}`);
            }
            
            console.log(`Successfully uploaded ${label}:`, filepath);
            return filepath;
          } catch (error) {
            console.error(`Error uploading ${label}:`, error);
            throw new Error(`Failed to upload ${label}: ${error.message}`);
          }
        };

        // Upload all wedding documents
        specificDocumentTable.groom_1x1 = await uploadDocument("Groom 1x1", weddingForm.groom_1x1, "groom_1x1");
        specificDocumentTable.bride_1x1 = await uploadDocument("Bride 1x1", weddingForm.bride_1x1, "bride_1x1");
        specificDocumentTable.marriage_license = await uploadDocument("Marriage License", weddingForm.marriage_license, "marriage_license");
        specificDocumentTable.marriage_contract = await uploadDocument("Marriage Contract", weddingForm.marriage_contract, "marriage_contract");
        specificDocumentTable.groom_baptismal_cert = await uploadDocument("Groom Baptismal Certificate", weddingForm.groom_baptismal_cert, "groom_baptismal_cert");
        specificDocumentTable.bride_baptismal_cert = await uploadDocument("Bride Baptismal Certificate", weddingForm.bride_baptismal_cert, "bride_baptismal_cert");
        specificDocumentTable.groom_confirmation_cert = await uploadDocument("Groom Confirmation Certificate", weddingForm.groom_confirmation_cert, "groom_confirmation_cert");
        specificDocumentTable.bride_confirmation_cert = await uploadDocument("Bride Confirmation Certificate", weddingForm.bride_confirmation_cert, "bride_confirmation_cert");
        specificDocumentTable.groom_cenomar = await uploadDocument("Groom CENOMAR", weddingForm.groom_cenomar, "groom_cenomar");
        specificDocumentTable.bride_cenomar = await uploadDocument("Bride CENOMAR", weddingForm.bride_cenomar, "bride_cenomar");
        specificDocumentTable.groom_banns = await uploadDocument("Groom Banns", weddingForm.groom_banns, "groom_banns");
        specificDocumentTable.bride_banns = await uploadDocument("Bride Banns", weddingForm.bride_banns, "bride_banns");
        specificDocumentTable.groom_permission = await uploadDocument("Groom Permission", weddingForm.groom_permission, "groom_permission");
        specificDocumentTable.bride_permission = await uploadDocument("Bride Permission", weddingForm.bride_permission, "bride_permission");

        console.log("All wedding documents uploaded successfully");
      } 
      // Handle Baptism Documents
      else if (selectedSacrament === "Baptism") {
        console.log("Processing baptism form...");
        specificDocumentTable = { ...specificDocumentTable, ...baptismForm };
      } 
      // Handle Burial Documents
      else if (selectedSacrament === "Burial") {
        console.log("Processing burial form...");
        specificDocumentTable = { ...specificDocumentTable, ...burialForm };
      }

      // Save specific sacrament document (only for sacraments that need it)
      let documentId = null;
      if (selectedSacrament === "Wedding" || selectedSacrament === "Baptism" || selectedSacrament === "Burial") {
        console.log("Saving sacrament document...");
        documentId = await saveSpecificSacramentDocument({
          selectedSacrament,
          specificDocumentTable,
          setErrorMessage,
        });

        if (!documentId) {
          console.log("Failed to save sacrament document");
          setUploading(false);
          return;
        }

        console.log("Document saved with ID:", documentId);
      }

      // Upload payment receipt to storage
      const fileExt = receiptFile.name.split(".").pop();
      const fileName = `${user.id}_${currentTransactionId}_${Date.now()}.${fileExt}`;
      const filePath = `receipts/${fileName}`;

      console.log("Uploading payment receipt...");
      const { error: uploadError } = await supabase.storage
        .from("payment-receipts")
        .upload(filePath, receiptFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("payment-receipts").getPublicUrl(filePath);

      // Create booking with receipt
      const bookingData = {
        user_id: user.id,
        booking_sacrament: selectedSacrament,
        booking_date: date.toISOString().split("T")[0],
        booking_time: time.toLocaleTimeString("en-US", { hour12: false }),
        booking_pax: parseInt(pax),
        booking_status: "pending",
        booking_transaction: currentTransactionId,
        price: getSacramentPrice(selectedSacrament),
        payment_receipts: publicUrl,
      };

      // Add document IDs only if they exist
      if (documentId) {
        if (selectedSacrament === "Wedding") {
          bookingData.wedding_docu_id = documentId;
        } else if (selectedSacrament === "Baptism") {
          bookingData.baptism_docu_id = documentId;
        } else if (selectedSacrament === "Burial") {
          bookingData.burial_docu_id = documentId;
        }
      }

      console.log("Inserting booking:", bookingData);
      const { data, error } = await supabase.from("booking_tbl").insert([bookingData]).select();
      
      if (error) {
        console.error("Booking insert error:", error);
        throw error;
      }

      console.log("Booking created successfully!");

      alert(
        `Booking confirmed for ${selectedSacrament} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}\nTransaction ID: ${currentTransactionId}\n\nYour payment receipt has been uploaded successfully.`
      );

      // Reset all states
      resetForm();
      onClose();
    } catch (error) {
      console.error("Error processing booking:", error);
      setErrorMessage(error.message || "Failed to process booking. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedSacrament("");
    setDate(null);
    setTime(null);
    setPax("");
    setWeddingForm({
      groom_fullname: "",
      bride_fullname: "",
      contact_no: "",
      marriage_license: null,
      marriage_contract: null,
      groom_1x1: null,
      bride_1x1: null,
      groom_baptismal_cert: null,
      bride_baptismal_cert: null,
      groom_confirmation_cert: null,
      bride_confirmation_cert: null,
      groom_cenomar: null,
      bride_cenomar: null,
      groom_banns: null,
      bride_banns: null,
      groom_permission: null,
      bride_permission: null,
    });
    setBaptismForm({
      main_godfather: {},
      main_godmother: {},
      additional_godparents: [],
    });
    setBurialForm({
      funeral_mass: false,
      death_anniversary: false,
      funeral_blessing: false,
      tomb_blessing: false,
    });
    setShowQRCode(false);
    setShowReceiptUpload(false);
    setReceiptFile(null);
    setCurrentBookingId(null);
    setCurrentTransactionId(null);
    setErrorMessage("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTitle = () => {
    if (showReceiptUpload) return "Upload Payment Receipt";
    if (showQRCode) return "Scan QR Code for Payment";
    return "Book a Sacrament";
  };

  return (
    <CardPopup open={Boolean(open)} onClose={handleClose} title={getTitle()}>
      <Box display="flex" flexDirection="column" gap={2} sx={{ maxHeight: "75vh", overflowY: "auto", p: 2 }}>
        {showReceiptUpload ? (
          // Receipt Upload Screen
          <>
            <Typography textAlign="center">
              Please upload your payment receipt or proof of transaction to complete your booking.
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
          </>
        ) : showQRCode ? (
          // QR Code Screen
          <Box textAlign="center">
            <Typography variant="h6" gutterBottom>
              Scan QR Code to Complete Payment
            </Typography>

            <Box
              component="img"
              src={`/images/qr-codes/qr-${Math.floor(Math.random() * 3) + 1}.png`}
              alt="Payment QR Code"
              sx={{
                width: "100%",
                maxWidth: "200px",
                height: "auto",
                border: "2px solid #E1D5B8",
                borderRadius: "8px",
                my: 2,
              }}
            />

            <Typography sx={{ color: "#6B5F32", fontWeight: 500, mb: 1 }}>
              Amount: ₱{getSacramentPrice(selectedSacrament).toLocaleString()}
            </Typography>

            <Typography sx={{ color: "#6B5F32", fontWeight: 500 }}>
              Transaction ID: {currentTransactionId}
            </Typography>

            <Button
              variant="contained"
              sx={{
                mt: 3,
                bgcolor: "#E1D5B8",
                "&:hover": { bgcolor: "#d1c5a8" },
              }}
              onClick={handleQRNext}
            >
              Next
            </Button>
          </Box>
        ) : (
          // Booking Form Screen
          <>
            <Typography align="center" sx={{ fontWeight: "bold" }}>
              Reserve a date and time for your chosen sacrament.
            </Typography>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <FormControl fullWidth>
              <InputLabel>Select Sacrament</InputLabel>
              <Select
                value={selectedSacrament}
                label="Select Sacrament"
                onChange={(e) => setSelectedSacrament(e.target.value)}
                disabled={isSubmitting}
              >
                <MenuItem value="Wedding">Wedding</MenuItem>
                <MenuItem value="Baptism">Baptism</MenuItem>
                <MenuItem value="Confession">Confession</MenuItem>
                <MenuItem value="Anointing of the Sick">Anointing of the Sick</MenuItem>
                <MenuItem value="First Communion">First Communion</MenuItem>
                <MenuItem value="Burial">Burial</MenuItem>
              </Select>
            </FormControl>

            {selectedSacrament && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Earliest available date: {getMinimumBookingDate(selectedSacrament)}
                </Typography>
                <Typography variant="body2">Price: ₱{getSacramentPrice(selectedSacrament).toLocaleString()}</Typography>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker 
                    label="Select Date" 
                    value={date} 
                    onChange={setDate} 
                    disabled={isSubmitting}
                    renderInput={(params) => <TextField {...params} fullWidth />} 
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <TimePicker 
                    label="Select Time" 
                    value={time} 
                    onChange={setTime} 
                    disabled={isSubmitting}
                    renderInput={(params) => <TextField {...params} fullWidth />} 
                  />
                </LocalizationProvider>

                <TextField 
                  type="number" 
                  label="Number of People" 
                  value={pax} 
                  onChange={(e) => setPax(e.target.value)} 
                  inputProps={{ min: 1 }} 
                  fullWidth 
                  disabled={isSubmitting}
                />

                {selectedSacrament === "Wedding" && (
                  <>
                    <TextField
                      label="Contact Number"
                      value={formatPhoneNumber(weddingForm.contact_no)}
                      onChange={handlePhoneChange}
                      placeholder="09XX-XXX-XXXX"
                      helperText="Enter 11-digit PH mobile number (e.g., 09171234567)"
                      fullWidth
                      disabled={isSubmitting}
                      inputProps={{
                        maxLength: 13,
                      }}
                    />
                    <WeddingDocuments weddingForm={weddingForm} setWeddingForm={setWeddingForm} />
                  </>
                )}
                {selectedSacrament === "Baptism" && (
                  <BaptismDocuments baptismForm={baptismForm} setBaptismForm={setBaptismForm} />
                )}
                {selectedSacrament === "Burial" && (
                  <BurialDocuments burialForm={burialForm} setBurialForm={setBurialForm} />
                )}

                <Button 
                  variant="contained" 
                  fullWidth 
                  sx={{ bgcolor: "#E1D5B8", "&:hover": { bgcolor: "#d1c5a8" } }} 
                  onClick={handleNext}
                  disabled={false}
                >
                  Next
                </Button>
              </>
            )}
          </>
        )}
      </Box>
    </CardPopup>
  );
};

export default Bookings;