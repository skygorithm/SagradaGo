// src/config/navLinks.js

export const getLoggedInNavLinks = ({
  setDonateOpen,
  setBookingOpen,
  setVolunteerOpen,
  donateOpen,
  bookingOpen,
  volunteerOpen,
}) => [
  { path: "/home", label: "HOME" },
  {
    label: "DONATE",
    action: () => setDonateOpen(true),
    highlight: donateOpen,
  },
  {
    label: "BOOK A SERVICE",
    action: () => setBookingOpen(true),
    highlight: bookingOpen,
  },
  { path: "/events", label: "EVENTS" },
  {
    label: "BE A VOLUNTEER",
    action: () => setVolunteerOpen(true),
    highlight: volunteerOpen,
  },
  { path: "/explore-parish", label: "VIRTUAL TOUR" },
  { path: "/profile", label: "PROFILE" },
];

export const getLoggedOutNavLinks = ({ onLoginClick }) => [
  { path: "/", label: "HOME", highlight: true },
  { label: "DONATE", action: onLoginClick },
  { label: "BOOK A SERVICE", action: onLoginClick },
  { path: "/events", label: "EVENTS" },
  { label: "BE A VOLUNTEER", action: onLoginClick },
  { path: "/explore-parish", label: "VIRTUAL TOUR" },
];