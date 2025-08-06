import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Container, Grid, Card, CardContent, CardMedia, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import LoginModal from '../config/UserAuth.jsx';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot.jsx';
import isUserLoggedIn from '../utils/isUserLoggedIn.jsx';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#E1D5B8',
    },
  },
});

const HeroSection = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  textAlign: 'center',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1,
  },
}));

const HeroContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  padding: theme.spacing(3),
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const HomePageLoggedOut = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  // Check if user is logged in
  // useEffect(() => {
  //   async function checkLoginStatus() {
  //     const isLoggedIn = await isUserLoggedIn();
  //     console.log("Is user logged out? ", isLoggedIn);
  //     if (isLoggedIn) {
  //       navigate('/home');
  //     }
  //   }
  //   checkLoginStatus();
  // }, []);


  // Navigation links configuration
  const navLinks = [
    { path: '/', label: 'HOME' },
    { label: 'DONATE', action: () => handleRequireLogin() },
    { label: 'BOOK A SERVICE', action: () => handleRequireLogin() },
    { label: 'EVENTS', action: () => handleRequireLogin() },
    { label: 'BE A VOLUNTEER', action: () => handleRequireLogin() },
    { label: 'VIRTUAL TOUR', action: () => handleRequireLogin() }
  ];

  // Navigation handlers
  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (link) => {
    if (link.path) {
      handleNavigation(link.path);
    } else if (link.action) {
      link.action();
    }
  };

  const handleRequireLogin = (signup = false) => {
    setIsSignupMode(signup);
    setLoginOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    login();
    navigate('/home');
  };

  const features = [
    {
      title: 'Book Sacrament',
      description: 'Book your sacrament here.',
      action: () => handleRequireLogin(false)
    },
    {
      title: 'Online Donations',
      description: 'Support our parish through secure online donations.',
      action: () => handleRequireLogin(false)
    },
    {
      title: 'Volunteer Programs',
      description: 'Join our community of volunteers and make a difference.',
      action: () => handleRequireLogin(false)
    },
    {
      title: 'Virtual Tour',
      description: 'Explore our beautiful church through a virtual tour.',
      action: () => handleRequireLogin(false)
    },
  ];

  const onLoginClick = (isSignup) => {
    setIsSignupMode(isSignup);
    setLoginOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex flex-col" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {/* Header Section */}
        <header className="bg-white shadow-md py-4 px-6">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/')}>
              <img 
                src="/images/sagrada.png" 
                alt="Sagrada Familia Parish Logo" 
                className="h-12 w-12 mr-2" 
                style={{ background: 'transparent' }}
              />
              <span className="text-2xl font-bold text-[#E1D5B8]">SagradaGo</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-black hover:text-[#E1D5B8] relative group transition-colors duration-200"
                >
                  {link.label}
                </button>
              ))}
            </nav>

            {/* Authentication Buttons */}
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => handleRequireLogin(false)}
                className="px-4 py-2 bg-[#E1D5B8] text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
              >
                LOGIN
              </button>
              <button 
                onClick={() => handleRequireLogin(true)}
                className="px-4 py-2 bg-[#E1D5B8] text-white rounded hover:bg-opacity-90 text-sm sm:text-base"
              >
                JOIN NOW
              </button>

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 ml-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? '✕' : '☰'}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white py-2 px-4 space-y-2 mt-2">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="block w-full text-left p-2 text-black hover:text-[#E1D5B8]"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
            <img 
              src="/images/SAGRADA-FAMILIA-PARISH.jpg"
              alt="Church Community"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-6">
                <div className="max-w-2xl text-white">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                    Simplifying Church <br />
                    Management & Engagement
                  </h1>
                  <p className="text-lg md:text-xl mb-8">
                    The Society has built a new, mature, strategic structure, and kept up-to-date
                    with success across all the past year
                  </p>
                  <button 
                    onClick={() => handleRequireLogin(false)}
                    className="px-8 py-3 bg-[#E1D5B8] text-black rounded-lg hover:bg-opacity-90 text-lg transition-all hover:scale-105"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-8">
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: 6,
                  fontWeight: 'bold',
                }}
              >
                Our Services
              </Typography>
              <Grid container spacing={4}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <FeatureCard onClick={feature.action}>
                      <CardContent sx={{ flexGrow: 1, bgcolor: 'white' }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h3"
                          sx={{ color: '#6B5F32', fontWeight: 'bold' }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </section>

          <section className="py-8 bg-gray-100">
            <Container maxWidth="md">
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: 4,
                  fontWeight: 'bold',
                }}
              >
                Join Our Community
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                paragraph
                sx={{ mb: 4 }}
              >
                Be part of our growing parish family Connect with fellow parishioners,
                participate in church activities, and strengthen your faith journey with us.
              </Typography>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleRequireLogin(true)}
                  sx={{
                    bgcolor: '#E1D5B8',
                    color: 'black',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: '#d4c4a1',
                    },
                  }}
                >
                  Sign Up Now
                </Button>
              </Box>
            </Container>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-white to-gray-50 text-black py-16 px-6">
          <div className="max-w-7xl mx-auto">
            {/* Top Section with Logo and Description */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-12 pb-8 border-b border-gray-200">
              <div className="flex items-center mb-6 md:mb-0">
                <img 
                  src="/images/sagrada.png" 
                  alt="SagradaGo Logo" 
                  className="h-16 w-auto mr-4" 
                />
                <div>
                  <span className="text-3xl font-bold text-[#6B5F32]">SagradaGo</span>
                  <p className="text-sm text-gray-600 mt-2 max-w-md">
                    A digital gateway to Sagrada Familia Parish, connecting faith and community through modern technology.
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#6B5F32] p-3 rounded-full hover:bg-[#d1c5a8] transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
              {/* Quick Links */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-[#6B5F32] relative inline-block">
                  Quick Links
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6B5F32] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
                </h4>
                <ul className="space-y-4">
                  <li>
                    <button 
                      onClick={() => handleNavigation('/')}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Home
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleRequireLogin(false)}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Events
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleRequireLogin(false)}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">→</span>
                      Virtual Tour
                    </button>
                  </li>
                </ul>
              </div>

              {/* About Section */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-[#6B5F32]">About Us</h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sagrada Go is a mobile and web-based appointment and record management system designed for Sagrada Familia Parish. It streamlines parish services by allowing users to schedule appointments, access records, and stay updated with church events—anytime, anywhere.
                </p>
              </div>

              {/* Contact Section */}
              <div>
                <h4 className="text-lg font-semibold mb-6 text-[#6B5F32]">Contact Us</h4>
                <ul className="space-y-4">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-[#6B5F32] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-gray-600">Sagrada Familia Parish, Sanctuary of the Holy Face of Manoppello, Manila, Philippines</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Section */}
            <div className="pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-sm mb-4 md:mb-0">
                  © 2025 Sagrada Familia Parish. All rights reserved.
                </p>
                <p className="text-gray-500 text-sm">
                  Designed and Developed by Group 2 – Sagrada Go Capstone Team
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Login/Signup Modal */}
        {loginOpen && (
          <LoginModal
            onClose={() => setLoginOpen(false)}
            onLoginSuccess={handleLoginSuccess}
            isSignupMode={isSignupMode}
          />
        )}

        {/* Chatbot Component */}
        <Chatbot />
      </div>
    </ThemeProvider>
  );
};

export default HomePageLoggedOut;