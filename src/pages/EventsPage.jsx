// src/pages/EventsPage.jsx
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  Chip,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Event, Schedule, LocationOn, Close, CalendarMonth } from "@mui/icons-material";
import { format, differenceInDays, startOfDay } from "date-fns";
import Layout from "../components/layout/Layout.jsx";
import { usePopups } from "../context/PopupsContext.jsx";
import { getLoggedInNavLinks, getLoggedOutNavLinks } from "../config/navLinks.js";
import { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase.js";

const EventsPage = ({ isLoggedIn, onLogout, onLoginClick, onSignupClick }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const {
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  } = usePopups();

  // choose the correct set of nav links
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

  // Fetch events from Supabase
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from("events_tbl")
          .select("*")
          .order("date", { ascending: true });

        if (error) throw error;

        setEvents(data || []);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const getDaysUntilEvent = (eventDate) => {
    const today = startOfDay(new Date());
    const event = startOfDay(new Date(eventDate));
    const diff = differenceInDays(event, today);
    if (diff < 0) return "Past Event";
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days away`;
  };

  const getEventStatus = (eventDate) => {
    const today = startOfDay(new Date());
    const event = startOfDay(new Date(eventDate));
    const diff = differenceInDays(event, today);
    if (diff < 0) return "past";
    if (diff <= 7) return "upcoming";
    return "future";
  };

  const statusColor = (status) =>
    status === "upcoming" ? "#FF9800" : status === "future" ? "#4CAF50" : "#9E9E9E";
  const statusLabel = (status) =>
    status === "upcoming" ? "Upcoming" : status === "future" ? "Future" : "Past";

  const handleRegister = (ev) => {
    if (!isLoggedIn) {
      onLoginClick();
    } else {
      alert(`Registration for ${ev.title} – feature coming soon!`);
    }
  };

  const handleEventClick = (ev) => {
    setSelectedEvent(ev);
    setDialogOpen(true);
  };

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
          background: "linear-gradient(135deg, #E1D5B8 0%, #D4C5A0 100%)",
          py: 6,
          textAlign: "center",
          mb: 4,
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h3" fontWeight="bold" color="#6B5F32" gutterBottom>
            Parish Events
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: "auto" }}>
            Stay updated with our upcoming events and join us in celebrating our faith community
          </Typography>
        </Container>
      </Box>

      {/* Loading State */}
      {loading && (
        <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress sx={{ color: "#E1D5B8" }} />
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            Loading events...
          </Typography>
        </Container>
      )}

      {/* Error State */}
      {error && (
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      )}

      {/* Event Grid */}
      {!loading && !error && (
        <Container maxWidth="lg" sx={{ pb: 8 }}>
          {events.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No events scheduled at this time.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={4}>
              {events.map((ev) => {
                const status = getEventStatus(ev.date);
                const isPast = status === "past";
                return (
                  <Grid item xs={12} sm={6} lg={4} key={ev.id}>
                    <Paper
                      elevation={3}
                      sx={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 3,
                        overflow: "hidden",
                        opacity: isPast ? 0.7 : 1,
                        cursor: isPast ? "default" : "pointer",
                        transition: "all 0.3s ease-in-out",
                        "&:hover": {
                          transform: isPast ? "none" : "translateY(-8px)",
                          boxShadow: isPast ? 3 : 8,
                          "& .event-img": {
                            transform: isPast ? "none" : "scale(1.05)",
                          },
                        },
                      }}
                      onClick={() => !isPast && handleEventClick(ev)}
                    >
                      <Box sx={{ position: "relative", overflow: "hidden" }}>
                        <Box
                          className="event-img"
                          sx={{
                            height: 200,
                            backgroundImage: `url(${ev.img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            transition: "transform 0.3s ease-in-out",
                          }}
                        />
                        <Chip
                          label={statusLabel(status)}
                          size="small"
                          sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            backgroundColor: statusColor(status),
                            color: "white",
                            fontWeight: 600,
                          }}
                        />
                      </Box>
                      <Box sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          gutterBottom
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            minHeight: "3.2em",
                          }}
                        >
                          {ev.title}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <Event sx={{ fontSize: 18, color: "#E1D5B8", mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {format(new Date(ev.date), "EEEE, MMMM d, yyyy")}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                            <Schedule sx={{ fontSize: 18, color: "#E1D5B8", mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {ev.time}
                            </Typography>
                          </Box>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LocationOn sx={{ fontSize: 18, color: "#E1D5B8", mr: 1 }} />
                            <Typography variant="body2" color="text.secondary">
                              {ev.location}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            flexGrow: 1,
                            mb: 2,
                            lineHeight: 1.5,
                          }}
                        >
                          {ev.description}
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Typography variant="caption" color="text.secondary" fontStyle="italic">
                            {getDaysUntilEvent(ev.date)}
                          </Typography>
                          {!isPast && (
                            <Button
                              variant="contained"
                              size="small"
                              startIcon={<CalendarMonth />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRegister(ev);
                              }}
                              sx={{
                                backgroundColor: "#E1D5B8",
                                "&:hover": { backgroundColor: "#D4C5A0" },
                                borderRadius: 2,
                                textTransform: "none",
                                fontSize: "0.75rem",
                              }}
                            >
                              Register
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Container>
      )}

      {/* Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {selectedEvent && (
          <>
            <Box sx={{ position: "relative" }}>
              <Box
                sx={{
                  height: 250,
                  backgroundImage: `url(${selectedEvent.img})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <IconButton
                onClick={() => setDialogOpen(false)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  backgroundColor: "rgba(255,255,255,0.9)",
                  "&:hover": { backgroundColor: "rgba(255,255,255,1)" },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            <DialogContent sx={{ p: 4 }}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                {selectedEvent.title}
              </Typography>
              <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                  {
                    icon: <Event sx={{ color: "#E1D5B8", mr: 1 }} />,
                    label: "Date",
                    value: format(new Date(selectedEvent.date), "EEEE, MMMM d, yyyy"),
                  },
                  {
                    icon: <Schedule sx={{ color: "#E1D5B8", mr: 1 }} />,
                    label: "Time",
                    value: selectedEvent.time,
                  },
                  {
                    icon: <LocationOn sx={{ color: "#E1D5B8", mr: 1 }} />,
                    label: "Location",
                    value: selectedEvent.location,
                  },
                ].map((info, i) => (
                  <Grid item xs={12} sm={4} key={i}>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      {info.icon}
                      <Typography variant="body1" fontWeight="medium">
                        {info.label}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {info.value}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                About this Event
              </Typography>
              <Typography variant="body1" color="text.secondary" lineHeight={1.7}>
                {selectedEvent.description}
              </Typography>
            </DialogContent>

            <DialogActions sx={{ p: 3, pt: 0 }}>
              <Button onClick={() => setDialogOpen(false)} color="inherit">
                Close
              </Button>
              {getEventStatus(selectedEvent.date) !== "past" && (
                <Button
                  variant="contained"
                  startIcon={<CalendarMonth />}
                  onClick={() => handleRegister(selectedEvent)}
                  sx={{
                    backgroundColor: "#E1D5B8",
                    "&:hover": { backgroundColor: "#D4C5A0" },
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Register for Event
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Layout>
  );
};

export default EventsPage;