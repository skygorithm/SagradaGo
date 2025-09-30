// src/pages/HomePageLoggedIn.jsx
import React, { useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { usePopups } from "../context/PopupsContext.jsx";
import { getLoggedInNavLinks } from "../config/navLinks.js";

import Donation from "./Donation.jsx";
import Bookings from "./Bookings.jsx";
import Volunteer from "./Volunteer.jsx";

const FeatureCard = styled(Card)({
  height: "100%",
  transition: "transform 0.3s ease",
  cursor: "pointer",
  "&:hover": { transform: "translateY(-6px)" },
});

const HomePageLoggedIn = ({ onLogout, userProfile }) => {
  const navigate = useNavigate();
  const {
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  } = usePopups();

  useEffect(() => {
    console.log("HomePageLoggedIn mounted with userProfile:", userProfile);
    
    // Safety check: if we don't have user profile after mount, something went wrong
    if (!userProfile) {
      console.warn("⚠️ HomePageLoggedIn mounted without userProfile");
    }
    
    return () => {
      console.log("HomePageLoggedIn unmounted");
    };
  }, [userProfile]);

  // Early return with loading state if no user profile
  if (!userProfile) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <img
            src="/images/sagrada.png"
            alt="Loading"
            className="w-16 h-16 mx-auto mb-4 animate-pulse"
          />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    console.log("Logout clicked from HomePageLoggedIn");
    setDonateOpen(false);
    setBookingOpen(false);
    setVolunteerOpen(false);

    if (onLogout) {
      onLogout();
    }
  };

  const navLinks = getLoggedInNavLinks({
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  });

  console.log("HomePageLoggedIn rendering main content");

  return (
    <Layout 
      isLoggedIn={true} 
      userProfile={userProfile}
      onLogout={handleLogout} 
      navLinks={navLinks}
    >
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src="/images/SAGRADA-FAMILIA-PARISH.jpg"
          alt="Church"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative h-full flex items-center text-white px-8">
          <div>
            <h1 className="text-4xl font-bold mb-3">
              Simplifying Church Management & Engagement
            </h1>
            <p className="mb-5 text-lg">
              Building a parish system to unify faith and technology.
            </p>
            <Button
              onClick={() => setBookingOpen(true)}
              variant="contained"
              sx={{ bgcolor: "#E1D5B8", color: "#000" }}
            >
              Book now
            </Button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            fontWeight="bold"
            gutterBottom
          >
            Our Services
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard onClick={() => setBookingOpen(true)}>
                <CardContent>
                  <Typography fontWeight="bold">Book Sacrament</Typography>
                  <Typography color="text.secondary">
                    Schedule your sacrament
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard onClick={() => setDonateOpen(true)}>
                <CardContent>
                  <Typography fontWeight="bold">Online Donations</Typography>
                  <Typography color="text.secondary">
                    Support our parish online
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard onClick={() => setVolunteerOpen(true)}>
                <CardContent>
                  <Typography fontWeight="bold">Volunteer Programs</Typography>
                  <Typography color="text.secondary">
                    Join and participate
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard onClick={() => navigate("/explore-parish")}>
                <CardContent>
                  <Typography fontWeight="bold">Virtual Tour</Typography>
                  <Typography color="text.secondary">
                    Explore our parish
                  </Typography>
                </CardContent>
              </FeatureCard>
            </Grid>
          </Grid>
        </Container>
      </section>

      {/* Popups */}
      {donateOpen && (
        <Donation open={donateOpen} onClose={() => setDonateOpen(false)} />
      )}
      {bookingOpen && (
        <Bookings open={bookingOpen} onClose={() => setBookingOpen(false)} />
      )}
      {volunteerOpen && (
        <Volunteer open={volunteerOpen} onClose={() => setVolunteerOpen(false)} />
      )}
    </Layout>
  );
};

export default HomePageLoggedIn;