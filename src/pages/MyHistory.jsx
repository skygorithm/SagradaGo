import React, { useState, useEffect } from "react";
import { Box, Typography, Tabs, Tab } from "@mui/material";
import Layout from "../components/layout/Layout.jsx";
import { usePopups } from "../context/PopupsContext.jsx";
import { getLoggedInNavLinks } from "../config/navLinks.js";
import { supabase } from "../config/supabase"; // Add this import
import BookingList from "./BookingList.jsx";
import DonationHistory from "./DonationHistory.jsx";

const MyHistory = ({ onLoginClick, onSignupClick }) => {
  const [mainTab, setMainTab] = useState("bookings");
  const [userProfile, setUserProfile] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const {
    donateOpen,
    bookingOpen,
    volunteerOpen,
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
  } = usePopups();

  // Check authentication status
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        // Optionally fetch user profile data here
        const { data: profile } = await supabase
          .from('user_tbl')
          .select('*')
          .eq('user_id', user.id)
          .single();
        setUserProfile(profile);
      }
    };
    checkUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setUserProfile(null);
    window.location.href = '/';
  };

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
      isLoggedIn={isLoggedIn}  // ✅ Add this
      onLogout={handleLogout}   // ✅ Add this
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
      navLinks={navLinks}
      userProfile={userProfile}  // ✅ Add this
    >
      <Box p={2} sx={{ minHeight: "calc(100vh - 200px)" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{ fontWeight: "bold", mb: 3 }}
        >
          {mainTab === "bookings" ? "My Bookings" : "My Donations"}
        </Typography>

        <Tabs
          value={mainTab}
          onChange={(e, v) => setMainTab(v)}
          sx={{ mb: 3 }}
          variant="fullWidth"
        >
          <Tab value="bookings" label="Bookings" />
          <Tab value="donations" label="Donations" />
        </Tabs>

        {mainTab === "bookings" ? <BookingList /> : <DonationHistory />}
      </Box>
    </Layout>
  );
};

export default MyHistory;