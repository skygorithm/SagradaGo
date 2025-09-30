import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  MenuItem,
  Alert,
} from "@mui/material";
import CardPopup from "../components/CardPopup.jsx";

const Volunteer = ({ open = false, onClose = () => {} }) => {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = () => {
    if (!name || !contact || !role) {
      setErrorMessage("Please fill all required fields.");
      return;
    }
    // TODO: Hook up with Supabase to save volunteer record
    alert(`Thank you ${name}! You've signed up as ${role}.`);
    setName("");
    setContact("");
    setRole("");
    setErrorMessage("");
    onClose();
  };

  return (
    <CardPopup open={Boolean(open)} onClose={onClose} title="Volunteer Signup">
      <Box display="flex" flexDirection="column" gap={2}>
        <Typography textAlign="center">
          Join us in serving the parish through our volunteer ministry.
        </Typography>

        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

        <TextField
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          required
        />

        <TextField
          label="Contact Information"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          fullWidth
          required
        />

        <TextField
          select
          label="Preferred Volunteer Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          fullWidth
          required
        >
          <MenuItem value="Choir Member">Choir Member</MenuItem>
          <MenuItem value="Usher">Usher</MenuItem>
          <MenuItem value="Catechist">Catechist</MenuItem>
          <MenuItem value="Tech Team">Tech Team</MenuItem>
          <MenuItem value="Tech Team">Others</MenuItem>
        </TextField>

        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{
            bgcolor: "#E1D5B8",
            "&:hover": { bgcolor: "#d1c5a8" },
            py: 1.3,
            fontSize: "1rem",
            fontWeight: 500,
          }}
        >
          Submit
        </Button>
      </Box>
    </CardPopup>
  );
};

export default Volunteer;