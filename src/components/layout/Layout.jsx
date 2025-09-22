import React from "react";
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import { usePopups } from "../../context/PopupsContext.jsx";
import Donation from "../../pages/Donation.jsx";
import Bookings from "../../pages/Bookings.jsx";
import Volunteer from "../../pages/Volunteer.jsx";
import Chatbot from "../Chatbot.jsx";

const Layout = ({ onLoginClick, onSignupClick, navLinks, children }) => {
  const {
    donateOpen,
    bookingOpen,
    volunteerOpen,
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
  } = usePopups();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        onLoginClick={onLoginClick}
        onSignupClick={onSignupClick}
        navLinks={navLinks}
      />
      <main className="flex-grow">{children}</main>
      <Footer />

      {/* Global Popups */}
      <Donation open={donateOpen} onClose={() => setDonateOpen(false)} />
      <Bookings open={bookingOpen} onClose={() => setBookingOpen(false)} />
      <Volunteer open={volunteerOpen} onClose={() => setVolunteerOpen(false)} />

      <Chatbot />
    </div>
  );
};

export default Layout;