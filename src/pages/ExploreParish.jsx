// src/pages/ExploreParish.jsx
import React, { useState } from "react";
import {
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Card,
  CardContent,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  Info as InfoIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from "@mui/icons-material";
import Layout from "../components/layout/Layout.jsx";
import { Pannellum } from "pannellum-react";
import { usePopups } from "../context/PopupsContext.jsx";
import { getLoggedInNavLinks, getLoggedOutNavLinks } from "../config/navLinks.js";

const ExploreParish = ({ isLoggedIn, onLogout, onLoginClick, onSignupClick }) => {
  const {
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  } = usePopups();

  const navLinks = isLoggedIn
    ? getLoggedInNavLinks({
        setDonateOpen,
        setBookingOpen,
        setVolunteerOpen,
        donateOpen,
        bookingOpen,
        volunteerOpen,
      })
    : getLoggedOutNavLinks({ onLoginClick });

  const tourViews = {
    altar: {
      title: "Main Altar",
      description: "The sacred heart of our church where the Eucharist is celebrated.",
      image: process.env.PUBLIC_URL + "/images/360altar.jpg",
      icon: "⛪",
      hotspots: [
        { name: "Altar Table", description: "The main altar where Mass is celebrated." },
        { name: "Tabernacle", description: "Where the Blessed Sacrament is reserved." },
        { name: "Crucifix", description: "Symbol of Christ's sacrifice." },
      ],
    },
    pews: {
      title: "Church Pews",
      description: "Where the faithful gather and participate during the Mass.",
      image: process.env.PUBLIC_URL + "/images/360pews.jpg",
      icon: "🪑",
      hotspots: [
        { name: "Wooden Benches", description: "These pews accommodate parishioners during services." },
        { name: "Center Aisle", description: "The main walkway leading to the altar." },
      ],
    },
    facade: {
      title: "Church Facade",
      description: "The beautiful entrance that welcomes parishioners and visitors.",
      image: process.env.PUBLIC_URL + "/images/360facade.jpg",
      icon: "🏛️",
      hotspots: [
        { name: "Main Entrance", description: "Where visitors first step into the parish grounds." },
        { name: "Bell Tower", description: "A prominent feature of the church's architecture." },
      ],
    },
  };

  const [currentView, setCurrentView] = useState("altar");
  const [showInfo, setShowInfo] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [hotspotDialog, setHotspotDialog] = useState(null);

  const cv = tourViews[currentView];

  return (
    <Layout
      isLoggedIn={isLoggedIn}
      onLogout={onLogout}
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      navLinks={navLinks}
    >
      {/* Header */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          bgcolor: "white",
          borderBottom: 1,
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
            fontWeight: "bold",
            color: "#6B5F32",
            mb: 1,
          }}
        >
          Virtual Tour
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Sagrada Familia Parish • 360° Experience
        </Typography>
      </Box>

      {/* Tabs */}
      <Box
        sx={{
          position: { xs: "sticky", md: "relative" },
          top: 0,
          zIndex: 10,
          bgcolor: "white",
          borderBottom: 1,
          borderColor: "divider",
          p: { xs: 1, sm: 2 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 1,
            overflowX: "auto",
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {Object.entries(tourViews).map(([viewKey, view]) => (
            <Button
              key={viewKey}
              variant={currentView === viewKey ? "contained" : "outlined"}
              onClick={() => setCurrentView(viewKey)}
              sx={{
                minWidth: { xs: "auto", sm: "120px" },
                flexShrink: 0,
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                px: { xs: 2, sm: 3 },
                py: 1,
                bgcolor: currentView === viewKey ? "#6B5F32" : "transparent",
                color: currentView === viewKey ? "white" : "#6B5F32",
                borderColor: "#6B5F32",
                "&:hover": {
                  bgcolor: currentView === viewKey ? "#5a4d29" : "#f5f5f5",
                },
              }}
              startIcon={<span style={{ fontSize: "1rem" }}>{view.icon}</span>}
            >
              {view.title}
            </Button>
          ))}
        </Box>
      </Box>

      {/* Info Card */}
      <Collapse in={showInfo}>
        <Card sx={{ m: { xs: 1, sm: 2 }, bgcolor: "#6B5F32", color: "white" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
              <Box flex={1}>
                <Typography
                  variant="h6"
                  sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" }, fontWeight: 600, mb: 1, color: "#E1D5B8" }}
                >
                  {cv.icon} {cv.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {cv.description}
                </Typography>
              </Box>
              <IconButton onClick={() => setShowInfo(false)} sx={{ color: "white" }} size="small">
                <ExpandLessIcon />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Collapse>
      <Collapse in={!showInfo}>
        <Box sx={{ p: { xs: 1, sm: 2 }, pt: 0 }}>
          <Button
            onClick={() => setShowInfo(true)}
            startIcon={<InfoIcon />}
            endIcon={<ExpandMoreIcon />}
            sx={{ color: "#6B5F32", fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
          >
            Show Area Info
          </Button>
        </Box>
      </Collapse>

      {/* Panorama */}
      <Card sx={{ m: { xs: 1, sm: 2 }, overflow: "hidden", position: "relative" }}>
        <Box sx={{ height: { xs: "50vh", sm: "60vh", md: "70vh" }, minHeight: "300px", position: "relative" }}>
          <Pannellum
            width="100%"
            height="100%"
            image={cv.image}
            pitch={0}
            yaw={0}
            hfov={110}
            autoLoad
            showZoomCtrl
            showFullscreenCtrl
            showControls
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
              color: "white",
              p: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" }, textAlign: "center", opacity: 0.9 }}
            >
              👆 Drag to explore • 🔍 Pinch/scroll to zoom • 📱 Rotate device for best view
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Interactive Hotspots */}
      {cv.hotspots.length > 0 && (
        <Card sx={{ m: { xs: 1, sm: 2 } }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Typography variant="h6" sx={{ color: "#6B5F32", mb: 2 }}>
              Interactive Points
            </Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 1 }}>
              {cv.hotspots.map((h, i) => (
                <Button
                  key={i}
                  variant="outlined"
                  onClick={() => setHotspotDialog(h)}
                  sx={{
                    justifyContent: "flex-start",
                    textAlign: "left",
                    p: { xs: 1.5, sm: 2 },
                    borderColor: "#6B5F32",
                    color: "#6B5F32",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    "&:hover": { bgcolor: "#f5f5f5", borderColor: "#5a4d29" },
                  }}
                >
                  📍 {h.name}
                </Button>
              ))}
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Tour Tips */}
      <Card sx={{ m: { xs: 1, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 }, pb: "16px !important" }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ cursor: "pointer" }}
            onClick={() => setShowTips((t) => !t)}
          >
            <Typography variant="h6" sx={{ color: "#6B5F32" }}>
              💡 Tour Tips & Information
            </Typography>
            <IconButton size="small" sx={{ color: "#6B5F32" }}>
              {showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
          <Collapse in={showTips}>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Experience the beauty and serenity of Sagrada Familia Parish through our interactive virtual tour. Take your time to explore the sacred space and discover its architectural wonders.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" }, gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    How to Navigate:
                  </Typography>
                  <ul style={{ listStyle: "none", padding: 0, color: "#555" }}>
                    <li>👆 Drag to look around</li>
                    <li>🔍 Pinch or scroll to zoom</li>
                    <li>📱 Rotate device for best view</li>
                    <li>⛶ Use fullscreen mode</li>
                  </ul>
                </Box>
                <Box>
                  <Typography variant="subtitle2" fontWeight="600" gutterBottom>
                    Explore Features:
                  </Typography>
                  <ul style={{ listStyle: "none", padding: 0, color: "#555" }}>
                    <li>📍 Click points of interest</li>
                    <li>🏛️ Switch between areas</li>
                    <li>⛪ Learn about history</li>
                    <li>🙏 Feel the spiritual atmosphere</li>
                  </ul>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </CardContent>
      </Card>

      {/* Hotspot Dialog */}
      <Dialog
        open={!!hotspotDialog}
        onClose={() => setHotspotDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { m: { xs: 1, sm: 2 }, maxHeight: { xs: "90vh", sm: "80vh" } } }}
      >
        <DialogTitle sx={{ bgcolor: "#6B5F32", color: "white", fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
          📍 {hotspotDialog?.name}
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <DialogContentText sx={{ fontSize: { xs: "0.875rem", sm: "1rem" }, color: "text.primary" }}>
            {hotspotDialog?.description}
          </DialogContentText>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ExploreParish;