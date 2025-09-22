import React, { useState, useRef } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Avatar,
  Button,
  TextField,
  Divider,
  Box,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  Chip,
  LinearProgress,
} from "@mui/material";
import {
  Edit,
  Save,
  Cancel,
  PhotoCamera,
  Person,
  Email,
  Phone,
  Cake,
  Upload,
  CheckCircle,
  Info,
} from "@mui/icons-material";
import Layout from "../components/layout/Layout.jsx";
import { usePopups } from "../context/PopupsContext.jsx";
import { getLoggedInNavLinks } from "../config/navLinks.js";
import { useAuth } from "../context/AuthContext.js"; // ✅ import AuthContext hook

const ProfilePage = ({ onLogout, isLoggedIn }) => {
  const { userProfile, updateProfile } = useAuth(); // ✅ get AuthContext stuff

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initialize profile from userProfile context OR defaults
  const [profile, setProfile] = useState({
    firstName: userProfile?.firstName || "Juan",
    lastName: userProfile?.lastName || "Dela Cruz",
    email: userProfile?.email || "juan@example.com",
    contact: userProfile?.contact || "09123456789",
    birthday: userProfile?.birthday || "1990-01-01",
    profilePicture:
      userProfile?.profilePicture ||
      "/images/wired-outline-21-avatar-hover-jumping.webp",
  });

  const [originalProfile, setOriginalProfile] = useState({ ...profile });
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select a valid image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("Image must be smaller than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setProfile((prev) => ({
          ...prev,
          profilePicture: readerEvent.target.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setOriginalProfile({ ...profile });
      setEditMode(false);
      setLoading(false);
      setShowSuccess(true);

      // ✅ Update global AuthContext + persist
      updateProfile(profile);
    }, 1500);
  };

  const handleCancel = () => {
    setProfile({ ...originalProfile });
    setEditMode(false);
  };

  const handleEditClick = () => {
    setOriginalProfile({ ...profile });
    setEditMode(true);
  };

  const isProfileComplete = () => {
    return Object.entries(profile).every(([key, value]) => {
      if (key === "profilePicture") return true; // not required
      return value && value.trim() !== "";
    });
  };

  const getProfileCompleteness = () => {
    const fields = Object.entries(profile).filter(([k]) => k !== "profilePicture");
    const completedFields = fields.filter(([_, value]) => value && value.trim() !== "");
    return Math.round((completedFields.length / fields.length) * 100);
  };

  const {
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  } = usePopups();

  const navLinks = getLoggedInNavLinks({
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  });

  return (
    <Layout isLoggedIn={isLoggedIn} onLogout={onLogout} navLinks={navLinks}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ mb: 2, color: "#6B5F32" }}
          >
            My Profile
          </Typography>
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Profile Completeness: {getProfileCompleteness()}%
              </Typography>
              {isProfileComplete() && (
                <Chip
                  icon={<CheckCircle />}
                  label="Complete"
                  color="success"
                  size="small"
                />
              )}
            </Box>
            <LinearProgress
              variant="determinate"
              value={getProfileCompleteness()}
              sx={{
                height: 6,
                borderRadius: 3,
                backgroundColor: "#E1D5B8",
                "& .MuiLinearProgress-bar": { backgroundColor: "#6B5F32" },
              }}
            />
          </Box>
        </Box>

        <Card sx={{ boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Profile Pic */}
            <Box sx={{ textAlign: "center", mb: 4, position: "relative" }}>
              <Box sx={{ position: "relative", display: "inline-block" }}>
                <Avatar
                  src={profile.profilePicture}
                  sx={{
                    width: 140,
                    height: 140,
                    mx: "auto",
                    border: "4px solid #E1D5B8",
                    mb: 2,
                    cursor: editMode ? "pointer" : "default",
                    transition: "transform 0.2s",
                    "&:hover": editMode ? { transform: "scale(1.05)" } : {},
                  }}
                  onClick={() => editMode && fileInputRef.current?.click()}
                />
                {editMode && (
                  <Tooltip title="Upload new profile picture">
                    <IconButton
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        backgroundColor: "#6B5F32",
                        color: "white",
                        "&:hover": { backgroundColor: "#5A4F29" },
                        width: 40,
                        height: 40,
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: "none" }}
              />
              <Typography variant="h5" fontWeight="600" sx={{ mb: 1 }}>
                {profile.firstName} {profile.lastName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {profile.email}
              </Typography>
              {editMode && (
                <Alert
                  severity="info"
                  sx={{ mt: 2, textAlign: "left" }}
                  icon={<Info />}
                >
                  Click your profile picture to upload. Supported: JPG, PNG, GIF
                  (max 5MB)
                </Alert>
              )}
            </Box>

            {/* Form */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 3,
                  color: "#6B5F32",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Person />
                Personal Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 3,
                }}
              >
                <TextField
                  name="firstName"
                  label="First Name"
                  value={profile.firstName}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode || loading}
                  variant="outlined"
                />
                <TextField
                  name="lastName"
                  label="Last Name"
                  value={profile.lastName}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode || loading}
                  variant="outlined"
                />
                <TextField
                  name="email"
                  label="Email Address"
                  value={profile.email}
                  disabled
                  fullWidth
                  helperText="Email cannot be changed"
                  variant="outlined"
                />
                <TextField
                  name="contact"
                  label="Contact Number"
                  value={profile.contact}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode || loading}
                  variant="outlined"
                />
                <TextField
                  name="birthday"
                  type="date"
                  label="Birthday"
                  value={profile.birthday}
                  onChange={handleChange}
                  fullWidth
                  disabled={!editMode || loading}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Box>

            {loading && (
              <Box sx={{ mb: 3 }}>
                <LinearProgress sx={{ borderRadius: 2 }} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1, textAlign: "center" }}
                >
                  Updating your profile...
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "flex-end",
                flexWrap: "wrap",
              }}
            >
              {editMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    startIcon={loading ? <Upload /> : <Save />}
                    variant="contained"
                    disabled={loading}
                    sx={{
                      bgcolor: "#6B5F32",
                      "&:hover": { bgcolor: "#5A4F29" },
                      minWidth: 120,
                    }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    startIcon={<Cancel />}
                    variant="outlined"
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleEditClick}
                  startIcon={<Edit />}
                  variant="outlined"
                  sx={{
                    borderColor: "#6B5F32",
                    color: "#6B5F32",
                    "&:hover": {
                      borderColor: "#5A4F29",
                      color: "#5A4F29",
                      backgroundColor: "rgba(107, 95, 50, 0.04)",
                    },
                    minWidth: 120,
                  }}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        <Snackbar
          open={showSuccess}
          autoHideDuration={4000}
          onClose={() => setShowSuccess(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={() => setShowSuccess(false)}
            severity="success"
            icon={<CheckCircle />}
          >
            Profile updated successfully!
          </Alert>
        </Snackbar>
      </Container>
    </Layout>
  );
};

export default ProfilePage;