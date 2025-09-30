// src/components/layout/Layout.jsx
import React from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { usePopups } from "../../context/PopupsContext.jsx";
import Donation from "../../pages/Donation.jsx";
import Bookings from "../../pages/Bookings.jsx";
import Volunteer from "../../pages/Volunteer.jsx";
import Chatbot from "../Chatbot.jsx";

const Layout = ({ 
  isLoggedIn = false,
  onLogout,
  onLoginClick, 
  onSignupClick, 
  navLinks = [], 
  children,
  userProfile
}) => {
  const {
    donateOpen,
    bookingOpen,
    volunteerOpen,
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
  } = usePopups();

  // Defensive check: If logged in but no navLinks, provide empty array
  const safeNavLinks = navLinks || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        isLoggedIn={isLoggedIn}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        navLinks={safeNavLinks}
        userProfile={userProfile}
      />
      <main className="flex-grow">{children}</main>
      <Footer />

      {/* Global Popups - only show if logged in */}
      {isLoggedIn && (
        <>
          {donateOpen && (
            <Donation open={donateOpen} onClose={() => setDonateOpen(false)} />
          )}
          {bookingOpen && (
            <Bookings open={bookingOpen} onClose={() => setBookingOpen(false)} />
          )}
          {volunteerOpen && (
            <Volunteer open={volunteerOpen} onClose={() => setVolunteerOpen(false)} />
          )}
        </>
      )}

      <Chatbot />
    </div>
  );
};

export default Layout;