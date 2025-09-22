import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Layout from "../components/layout/Layout.jsx";
import { usePopups } from "../context/PopupsContext.jsx";
import { getLoggedInNavLinks } from "../config/navLinks.js";

import Donation from "./Donation.jsx";
import Bookings from "./Bookings.jsx";
import Volunteer from "./Volunteer.jsx";

const FeatureCard = styled(Card)({
  height: "100%",
  transition: "transform 0.3s ease",
  "&:hover": { transform: "translateY(-6px)" },
});

// 🔥 Keyframes for coin-like splash spin
const splashStyles = `
@keyframes coinSpin {
  0%   { transform: perspective(600px) rotateY(0deg) rotateX(0deg); opacity: 1; }
  25%  { transform: perspective(600px) rotateY(90deg) rotateX(10deg); opacity: 1; }
  50%  { transform: perspective(600px) rotateY(180deg) rotateX(0deg); opacity: 1; }
  75%  { transform: perspective(600px) rotateY(270deg) rotateX(-10deg); opacity: 1; }
  100% { transform: perspective(600px) rotateY(360deg) rotateX(0deg); opacity: 0; }
}
`;

const HomePageLoggedIn = ({ onLogout }) => {
  const {
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  } = usePopups();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Show splash animation for 1s
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = getLoggedInNavLinks({
    setDonateOpen,
    setBookingOpen,
    setVolunteerOpen,
    donateOpen,
    bookingOpen,
    volunteerOpen,
  });

  // 🔥 Splash screen
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <style>{splashStyles}</style>
        <img
          src="/images/sagrada.png" 
          alt="Sagrada Familia Parish Logo"
          style={{
            width: "120px",
            height: "120px",
            animation: "coinSpin 1s ease-in-out forwards",
            transformStyle: "preserve-3d",
          }}
        />
      </div>
    );
  }

  return (
    <Layout isLoggedIn={true} onLogout={onLogout} navLinks={navLinks}>
      {/* Hero */}
      <section className="relative h-[60vh] overflow-hidden">
        <img
          src="/images/SAGRADA-FAMILIA-PARISH.jpg" // ✅ from public/images
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
              <FeatureCard
                onClick={() => (window.location = "/explore-parish")}
              >
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

      {/* ✅ Popups */}
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