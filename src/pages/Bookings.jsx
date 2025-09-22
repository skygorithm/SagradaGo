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
import saveWeddingDocument from "../utils/form-functions/saveWeddingDocument.jsx";
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

  const [weddingForm, setWeddingForm] = useState({
    groom_fullname: "",
    bride_fullname: "",
    contact_no: "",
    marriage_license: null,
    marriage_contract: null,
    psa_birth_cert: null,
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

  const handleBooking = async () => {
    if (!selectedSacrament || !date || !time || !pax) {
      setErrorMessage("Please select a sacrament, date, time, and number of people.");
      return;
    }

    let restriction = restrictSacramentBooking(selectedSacrament, date);
    if (restriction !== "") {
      setErrorMessage(restriction);
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setErrorMessage("You must be logged in to book.");
        return;
      }

      let specificDocumentTable = { date_created: new Date().toISOString() };

      if (selectedSacrament === "Wedding") {
        const validateResult = weddingFormValidation(weddingForm, setErrorMessage);
        if (!validateResult) return;
        specificDocumentTable = {
          ...specificDocumentTable,
          ...weddingForm,
        };
        // Upload docs simplified
        const uploadAndReplace = async (label, file, fileNameKey) => {
          if (file) {
            const url = await saveWeddingDocument(
              Date.now(),
              label,
              file,
              `${user.email}_${fileNameKey}.png`,
              setErrorMessage
            );
            if (!url) throw new Error("Upload failed: " + label);
            return url;
          }
          return null;
        };
        specificDocumentTable.groom_1x1 = await uploadAndReplace(
          "Groom 1x1",
          weddingForm.groom_1x1,
          `groom_1x1`
        );
        specificDocumentTable.bride_1x1 = await uploadAndReplace(
          "Bride 1x1",
          weddingForm.bride_1x1,
          `bride_1x1`
        );
      } else if (selectedSacrament === "Baptism") {
        const validateResult = baptismFormValidation(user, baptismForm, setErrorMessage);
        if (!validateResult) return;
        specificDocumentTable = { ...specificDocumentTable, ...baptismForm };
      } else if (selectedSacrament === "Burial") {
        const validateResult = burialFormValidation(user, burialForm, setErrorMessage);
        if (!validateResult) return;
        specificDocumentTable = { ...specificDocumentTable, ...burialForm };
      }

      const documentId = await saveSpecificSacramentDocument({
        selectedSacrament,
        specificDocumentTable,
        setErrorMessage,
      });
      if (!documentId) return;

      const trxId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const bookingData = {
        user_id: user.id,
        booking_sacrament: selectedSacrament,
        booking_date: date.toISOString().split("T")[0],
        booking_time: time.toLocaleTimeString("en-US", { hour12: false }),
        booking_pax: parseInt(pax),
        booking_status: "pending",
        booking_transaction: trxId,
        price: getSacramentPrice(selectedSacrament),
        ...(documentId && selectedSacrament === "Wedding"
          ? { wedding_docu_id: documentId }
          : documentId && selectedSacrament === "Baptism"
          ? { baptism_docu_id: documentId }
          : documentId && selectedSacrament === "Burial"
          ? { burial_docu_id: documentId }
          : {}),
      };

      const { error } = await supabase.from("booking_tbl").insert([bookingData]);
      if (error) throw error;

      alert(`Booking confirmed for ${selectedSacrament} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()}`);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to create booking. Please try again.");
    }
  };

  return (
    <CardPopup open={Boolean(open)} onClose={onClose} title="Book a Sacrament">
      <Box display="flex" flexDirection="column" gap={2} sx={{ maxHeight: "75vh", overflowY: "auto", p: 2 }}>
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
              <DatePicker label="Select Date" value={date} onChange={setDate} renderInput={(params) => <TextField {...params} fullWidth />} />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker label="Select Time" value={time} onChange={setTime} renderInput={(params) => <TextField {...params} fullWidth />} />
            </LocalizationProvider>

            <TextField type="number" label="Number of People" value={pax} onChange={(e) => setPax(e.target.value)} inputProps={{ min: 1 }} fullWidth />

            {selectedSacrament === "Wedding" && (
              <WeddingDocuments weddingForm={weddingForm} setWeddingForm={setWeddingForm} />
            )}
            {selectedSacrament === "Baptism" && (
              <BaptismDocuments baptismForm={baptismForm} setBaptismForm={setBaptismForm} />
            )}
            {selectedSacrament === "Burial" && (
              <BurialDocuments burialForm={burialForm} setBurialForm={setBurialForm} />
            )}

            <Button variant="contained" fullWidth sx={{ bgcolor: "#E1D5B8", "&:hover": { bgcolor: "#d1c5a8" } }} onClick={handleBooking}>
              Confirm Booking
            </Button>
          </>
        )}
      </Box>
    </CardPopup>
  );
};

export default Bookings;