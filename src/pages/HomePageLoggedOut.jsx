import React, { useState, useMemo, useEffect } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Chatbot from "../components/Chatbot.jsx";
import Layout from "../components/layout/Layout.jsx";

const FeatureCard = styled(Card)({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  cursor: "pointer",
  transition: "transform 0.3s ease-in-out",
  "&:hover": { transform: "translateY(-6px)" },
});

const splashStyles = `
@keyframes coinSpin {
  0%   { transform: perspective(600px) rotateY(0deg) rotateX(0deg); opacity: 1; }
  25%  { transform: perspective(600px) rotateY(90deg) rotateX(10deg); opacity: 1; }
  50%  { transform: perspective(600px) rotateY(180deg) rotateX(0deg); opacity: 1; }
  75%  { transform: perspective(600px) rotateY(270deg) rotateX(-10deg); opacity: 1; }
  100% { transform: perspective(600px) rotateY(360deg) rotateX(0deg); opacity: 0; }
}
`;

const HomePageLoggedOut = ({ onLoginClick, onSignupClick }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Splash screen duration
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const navLinks = useMemo(
    () => [
      { path: "/", label: "HOME", highlight: true },
      { label: "DONATE", action: () => onLoginClick() },
      { label: "BOOK A SERVICE", action: () => onLoginClick() },
      { path: "/events", label: "EVENTS" },
      { label: "BE A VOLUNTEER", action: () => onLoginClick() },
      { path: "/explore-parish", label: "VIRTUAL TOUR" },
    ],
    [onLoginClick]
  );

  const features = [
    {
      title: "Book Sacrament",
      description: "Schedule your sacrament appointment with ease.",
      action: () => onLoginClick(),
    },
    {
      title: "Online Donations",
      description: "Support our parish through secure online donations.",
      action: () => onLoginClick(),
    },
    {
      title: "Volunteer Programs",
      description: "Join our community of volunteers and make a difference.",
      action: () => onLoginClick(),
    },
    {
      title: "Virtual Tour",
      description: "Explore our beautiful church through a virtual tour.",
      action: () => navigate("/explore-parish"),
    },
  ];

  // Splash screen while loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <style>{splashStyles}</style>
        <img
          src="/images/sagrada.png"
          alt="Sagrada Familia Parish logo"
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
    <Layout
      isLoggedIn={false}
      navLinks={navLinks}
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
    >
      {/* Hero */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src="/images/SAGRADA-FAMILIA-PARISH.jpg"
          alt="Church"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative h-full flex items-center">
          <div className="max-w-2xl mx-auto text-center text-white px-4">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Simplifying Church Management & Engagement
            </h1>
            <p className="text-lg mb-6">
              Building stronger faith through technology & community.
            </p>
            <button
              onClick={onLoginClick}
              className="px-6 py-3 bg-[#E1D5B8] text-black rounded-lg shadow-lg hover:bg-[#d4c4a1]"
            >
              Book now
            </button>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12">
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ fontWeight: "bold", mb: 6 }}
          >
            Our Services
          </Typography>
          <Grid container spacing={4}>
            {features.map((f, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <FeatureCard onClick={f.action}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight="bold">
                      {f.title}
                    </Typography>
                    <Typography color="text.secondary">
                      {f.description}
                    </Typography>
                  </CardContent>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </section>

      <Chatbot />
    </Layout>
  );
};

export default HomePageLoggedOut;