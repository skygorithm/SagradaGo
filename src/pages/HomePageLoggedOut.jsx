import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, Typography, Container, Grid, Card, CardContent, useTheme, useMediaQuery } from '@mui/material';
import { ThemeProvider, createTheme, styled } from '@mui/material/styles';
import LoginModal from '../config/UserAuth.jsx';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot.jsx';
import isUserLoggedIn from '../utils/isUserLoggedIn.jsx';

// Create a theme instance outside component to prevent recreation
const theme = createTheme({
  palette: {
    primary: {
      main: '#E1D5B8',
      text: '#1E1E1E',
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
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

const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  cursor: 'pointer',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  [theme.breakpoints.down('sm')]: {
    '&:hover': {
      transform: 'translateY(-4px)',
    },
  },
}));

const HomePageLoggedOut = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(muiTheme.breakpoints.down('md'));

  // Navigation state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal states
  const [loginOpen, setLoginOpen] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);

  // Memoized navigation handlers to prevent recreation on every render
  const handleNavigation = useCallback((path) => {
    navigate(path);
    setMobileMenuOpen(false);
  }, [navigate]);

  const handleRequireLogin = useCallback((signup = false) => {
    setIsSignupMode(signup);
    setLoginOpen(true);
  }, []);

  const handleLoginSuccess = useCallback((userData) => {
    login();
    navigate('/home');
  }, [login, navigate]);

  const handleNavClick = useCallback((link) => {
    if (link.path) {
      handleNavigation(link.path);
    } else if (link.action) {
      link.action();
    }
  }, [handleNavigation]);

  // Memoized navigation links to prevent recreation
  const navLinks = useMemo(() => [
    { path: '/', label: 'HOME', highlight: true },
    { label: 'DONATE', action: () => handleRequireLogin() },
    { label: 'BOOK A SERVICE', action: () => handleRequireLogin() },
    { path: '/events', label: 'EVENTS' },
    { label: 'BE A VOLUNTEER', action: () => handleRequireLogin() },
    { path: '/explore-parish', label: 'VIRTUAL TOUR' }
  ], [handleRequireLogin]);

  // Memoized features to prevent recreation
  const features = useMemo(() => [
    {
      title: 'Book Sacrament',
      description: 'Schedule your sacrament appointment with ease.',
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
      action: () => handleNavigation('/explore-parish')
    },
  ], [handleRequireLogin, handleNavigation]);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      setMobileMenuOpen(false);
      setLoginOpen(false);
    };
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (loginOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [loginOpen]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="bg-white shadow-lg border-b-2 border-[#E1D5B8] sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Logo Section */}
              <div 
                className="flex items-center cursor-pointer group transition-transform duration-200 hover:scale-105" 
                onClick={() => handleNavigation('/')}
              >
                <div className="relative">
                  <img 
                    src="/images/sagrada.png" 
                    alt="Sagrada Familia Parish Logo" 
                    className="h-7 w-7 sm:h-10 sm:w-10 mr-2 sm:mr-3 transition-transform duration-200 group-hover:rotate-3" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-xl font-bold text-[#6B5F32]">SagradaGo</span>
                  <span className="text-xs text-gray-500 hidden sm:block">Parish Management</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className={`relative px-2 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 group whitespace-nowrap ${
                      link.highlight 
                        ? 'bg-[#E1D5B8] text-[#6B5F32] shadow-md' 
                        : 'text-gray-700 hover:text-[#6B5F32] hover:bg-gray-50'
                    }`}
                  >
                    {link.label}
                    {!link.highlight && (
                      <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#E1D5B8] transition-all duration-200 group-hover:w-full group-hover:left-0"></span>
                    )}
                  </button>
                ))}
              </nav>

              {/* Authentication Buttons */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <button 
                  onClick={() => handleRequireLogin(false)}
                  className="hidden md:flex items-center px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-white bg-[#6B5F32] rounded-lg hover:bg-[#5a5129] transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <svg className="w-3 lg:w-4 h-3 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  SIGN IN
                </button>
                <button 
                  onClick={() => handleRequireLogin(true)}
                  className="hidden md:flex items-center px-2 lg:px-3 xl:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-medium text-[#6B5F32] bg-[#E1D5B8] rounded-lg hover:bg-[#d4c4a1] transition-colors duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                >
                  <svg className="w-3 lg:w-4 h-3 lg:h-4 mr-1 lg:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  JOIN NOW
                </button>

                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 relative z-10 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen(!mobileMenuOpen);
                  }}
                  aria-label="Toggle mobile menu"
                >
                  <div className="relative w-6 h-6 flex flex-col justify-center">
                    <span className={`absolute left-0 w-6 h-0.5 bg-[#6B5F32] transition-all duration-300 ease-in-out ${
                      mobileMenuOpen ? 'rotate-45 translate-y-0' : '-translate-y-2'
                    }`}></span>
                    <span className={`absolute left-0 w-6 h-0.5 bg-[#6B5F32] transition-all duration-300 ease-in-out ${
                      mobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
                    }`}></span>
                    <span className={`absolute left-0 w-6 h-0.5 bg-[#6B5F32] transition-all duration-300 ease-in-out ${
                      mobileMenuOpen ? '-rotate-45 translate-y-0' : 'translate-y-2'
                    }`}></span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0 pb-0'} overflow-hidden`}>
              <div className="pt-2 space-y-1 bg-gray-50 rounded-lg shadow-inner mx-2">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      handleNavClick(link);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-4 py-3 text-left rounded-lg mx-2 transition-colors duration-200 text-sm font-medium ${
                      link.highlight 
                        ? 'bg-[#E1D5B8] text-[#6B5F32] shadow-md' 
                        : 'text-gray-700 hover:bg-white hover:text-[#6B5F32] hover:shadow-sm'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
                
                {/* Mobile Auth Buttons */}
                <div className="border-t border-gray-200 pt-3 mt-3 mx-2 space-y-2">
                  <button
                    onClick={() => {
                      handleRequireLogin(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 text-center rounded-lg text-white bg-[#6B5F32] hover:bg-[#5a5129] transition-colors duration-200 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    SIGN IN
                  </button>

                  <button
                    onClick={() => {
                      handleRequireLogin(true);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 text-center rounded-lg text-[#6B5F32] bg-[#E1D5B8] hover:bg-[#d4c4a1] transition-colors duration-200 text-sm font-medium mb-2"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                    </svg>
                    JOIN NOW
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative h-[50vh] sm:h-[60vh] md:h-[70vh] min-h-[400px] max-h-[800px] w-full overflow-hidden">
            <img 
              src="/images/SAGRADA-FAMILIA-PARISH.jpg"
              alt="Church Community"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 sm:px-6 w-full">
                <div className="max-w-3xl text-white text-center sm:text-left">
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3 sm:mb-4 md:mb-6 leading-tight">
                    Simplifying Church <br className="hidden sm:block" />
                    <span className="sm:hidden">Management & </span>
                    <span className="hidden sm:inline">Management & </span>Engagement
                  </h1>
                  <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 md:mb-8 leading-relaxed max-w-2xl">
                    The Society has built a new, mature, strategic structure, and kept up-to-date
                    with success across all the past year
                  </p>
                  <button 
                    onClick={() => handleRequireLogin(false)}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#E1D5B8] text-black rounded-lg hover:bg-opacity-90 text-sm sm:text-base md:text-lg transition-all hover:scale-105 font-medium shadow-lg"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Services Section */}
          <section className="py-8 sm:py-12 md:py-16">
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: { xs: 3, sm: 4, md: 6 },
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                  lineHeight: 1.2,
                }}
              >
                Our Services
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={6} lg={3} key={index}>
                    <FeatureCard onClick={feature.action}>
                      <CardContent sx={{ 
                        flexGrow: 1, 
                        bgcolor: 'white', 
                        p: { xs: 2, sm: 3 },
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h3"
                          sx={{ 
                            color: '#6B5F32', 
                            fontWeight: 'bold',
                            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
                            mb: { xs: 1, sm: 2 },
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{ 
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            lineHeight: 1.5,
                            flex: 1,
                          }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </FeatureCard>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </section>

          {/* Join Community Section */}
          <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
            <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: { xs: 2, sm: 3, md: 4 },
                  fontWeight: 'bold',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
                  lineHeight: 1.2,
                }}
              >
                Join Our Community
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                paragraph
                sx={{ 
                  mb: { xs: 3, sm: 4, md: 5 },
                  fontSize: { xs: '0.875rem', sm: '1rem', md: '1.25rem' },
                  lineHeight: 1.6,
                  maxWidth: '600px',
                  mx: 'auto',
                }}
              >
                Be part of our growing parish family. Connect with fellow parishioners,
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
                    px: { xs: 3, sm: 4, md: 5 },
                    py: { xs: 1.2, sm: 1.5 },
                    fontSize: { xs: '0.875rem', sm: '1rem', md: '1.1rem' },
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      bgcolor: '#d4c4a1',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Sign Up Now
                </Button>
              </Box>
            </Container>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gradient-to-b from-white to-gray-50 text-black py-8 sm:py-12 md:py-16 px-3 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 sm:mb-8 md:mb-12 pb-4 sm:pb-6 md:pb-8 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row items-center mb-6 md:mb-0">
                <div className="flex items-center mb-3 sm:mb-0 sm:mr-4">
                  <img 
                    src="/images/sagrada.png" 
                    alt="SagradaGo Logo" 
                    className="h-10 sm:h-12 md:h-16 w-auto mr-2 sm:mr-3" 
                  />
                  <div className="text-center sm:text-left">
                    <span className="text-xl sm:text-2xl md:text-3xl font-bold text-[#6B5F32] block">SagradaGo</span>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-600 text-center sm:text-left max-w-md leading-relaxed">
                  A digital gateway to Sagrada Familia Parish, connecting faith and community through modern technology.
                </p>
              </div>
              <div className="flex space-x-3 sm:space-x-4">
                <a 
                  href="https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#6B5F32] p-2 sm:p-2.5 md:p-3 rounded-full hover:bg-[#d1c5a8] transition-colors duration-200 group"
                >
                  <svg className="w-4 sm:w-5 md:w-6 h-4 sm:h-5 md:h-6 text-white group-hover:text-[#6B5F32] transition-colors duration-200" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12 mb-6 sm:mb-8 md:mb-12">
              <div className="text-center sm:text-left">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 md:mb-6 text-[#6B5F32]">Quick Links</h4>
                <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                  <li>
                    <button 
                      onClick={() => handleNavigation('/')}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center text-sm sm:text-base justify-center sm:justify-start w-full"
                    >
                      <span className="mr-2">→</span>
                      Home
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleNavigation('/events')}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center text-sm sm:text-base justify-center sm:justify-start w-full"
                    >
                      <span className="mr-2">→</span>
                      Events
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleNavigation('/explore-parish')}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center text-sm sm:text-base justify-center sm:justify-start w-full"
                    >
                      <span className="mr-2">→</span>
                      Virtual Tour
                    </button>
                  </li>
                </ul>
              </div>

              <div className="text-center sm:text-left">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 md:mb-6 text-[#6B5F32]">About Us</h4>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Sagrada Go is a mobile and web-based appointment and record management system designed for Sagrada Familia Parish.
                </p>
              </div>

              <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
                <h4 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 md:mb-6 text-[#6B5F32]">Contact Us</h4>
                <ul className="space-y-2 sm:space-y-3 md:space-y-4">
                  <li className="flex items-start justify-center sm:justify-start">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-[#6B5F32] mr-2 sm:mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-gray-600 text-xs sm:text-sm">Sagrada Familia Parish, Manila, Philippines</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 md:pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
                <p className="text-gray-500 text-xs sm:text-sm text-center md:text-left">
                  © 2025 Sagrada Familia Parish. All rights reserved.
                </p>
                <p className="text-gray-500 text-xs sm:text-sm text-center md:text-right">
                  Designed and Developed by Group 2 – Sagrada Go Capstone Team
                </p>
              </div>
            </div>
          </div>
        </footer>

        {/* Login/Signup Modal */}
        {loginOpen && (
          <LoginModal
            open={loginOpen}
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