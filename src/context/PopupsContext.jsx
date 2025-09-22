import React, { createContext, useContext, useState } from "react";

const PopupsContext = createContext();

export const usePopups = () => useContext(PopupsContext);

export const PopupsProvider = ({ children }) => {
  const [donateOpen, setDonateOpenState] = useState(false);
  const [bookingOpen, setBookingOpenState] = useState(false);
  const [volunteerOpen, setVolunteerOpenState] = useState(false);

  // ✅ Only allow one popup active at a time
  const setDonateOpen = (state) => {
    if (state) {
      setBookingOpenState(false);
      setVolunteerOpenState(false);
    }
    setDonateOpenState(state);
  };

  const setBookingOpen = (state) => {
    if (state) {
      setDonateOpenState(false);
      setVolunteerOpenState(false);
    }
    setBookingOpenState(state);
  };

  const setVolunteerOpen = (state) => {
    if (state) {
      setDonateOpenState(false);
      setBookingOpenState(false);
    }
    setVolunteerOpenState(state);
  };

  const value = {
    donateOpen,
    setDonateOpen,
    bookingOpen,
    setBookingOpen,
    volunteerOpen,
    setVolunteerOpen,
  };

  return (
    <PopupsContext.Provider value={value}>{children}</PopupsContext.Provider>
  );
};