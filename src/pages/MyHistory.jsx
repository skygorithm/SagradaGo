import React, { useState } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import Layout from "../components/layout/Layout.jsx";
import { usePopups } from "../context/PopupsContext.jsx";
import { getLoggedInNavLinks } from "../config/navLinks.js";

// Import child components (no nav/footer inside them anymore)
import BookingList from "./BookingList.jsx";
import DonationHistory from "./DonationHistory.jsx";

const MyHistory = ({ onLoginClick, onSignupClick }) => {
  const [mainTab, setMainTab] = useState("bookings");

  // Popup context for navLinks
  const {
    donateOpen,
    bookingOpen,
    volunteerOpen,
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
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
    <Layout
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      navLinks={navLinks}
    >
      <Box p={2} sx={{ minHeight: "calc(100vh - 200px)" }}>
        {/* Dynamic Title */}
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          {mainTab === "bookings" ? "My Bookings" : "My Donations"}
        </Typography>

        {/* Main Tabs */}
        <Tabs
          value={mainTab}
          onChange={(e, v) => setMainTab(v)}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab value="bookings" label="Bookings" />
          <Tab value="donations" label="Donations" />
        </Tabs>

        {/* Conditional rendering */}
        {mainTab === "bookings" ? (
          <BookingList />
        ) : (
          <DonationHistory />
        )}
      </Box>
    </Layout>
  );
};

export default MyHistory;