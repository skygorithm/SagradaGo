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
  transition: 'transform 0.3s ease-in-out',
  cursor: 'pointer',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

const HomePageLoggedOut = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));

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

  return (
    <ThemeProvider theme={theme}>
      <div className="min-h-screen flex flex-col">
        {/* Header Section */}
        <header className="bg-white shadow-lg border-b-2 border-[#E1D5B8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo Section */}
              <div 
                className="flex items-center cursor-pointer group transition-transform duration-200 hover:scale-105" 
                onClick={() => handleNavigation('/')}
              >
                <div className="relative">
                  <img 
                    src="/images/sagrada.png" 
                    alt="Sagrada Familia Parish Logo" 
                    className="h-8 w-8 sm:h-10 sm:w-10 mr-2 sm:mr-3 transition-transform duration-200 group-hover:rotate-3" 
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-bold text-[#6B5F32] hidden sm:block">SagradaGo</span>
                  <span className="text-xs text-gray-500 hidden sm:block">Parish Management</span>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center space-x-1">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link)}
                    className={`relative px-3 xl:px-4 py-2 rounded-lg text-xs xl:text-sm font-medium transition-all duration-200 group ${
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
                  className="hidden lg:flex items-center px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium text-white bg-[#6B5F32] rounded-lg hover:bg-[#5a5129] transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-3 xl:w-4 h-3 xl:h-4 mr-1 xl:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m0 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  SIGN IN
                </button>
                <button 
                  onClick={() => handleRequireLogin(true)}
                  className="hidden lg:flex items-center px-3 xl:px-4 py-2 text-xs xl:text-sm font-medium text-[#6B5F32] bg-[#E1D5B8] rounded-lg hover:bg-[#d4c4a1] transition-colors duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="w-3 xl:w-4 h-3 xl:h-4 mr-1 xl:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
                  </svg>
                  JOIN NOW
                </button>

                {/* Mobile Menu Button */}
                <button 
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  <div className="relative w-6 h-6">
                    <span className={`absolute top-1 left-0 w-6 h-0.5 bg-[#6B5F32] transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
                    <span className={`absolute top-3 left-0 w-6 h-0.5 bg-[#6B5F32] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                    <span className={`absolute top-5 left-0 w-6 h-0.5 bg-[#6B5F32] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
                  </div>
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            <div className={`lg:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
              <div className="py-4 space-y-1 bg-gray-50 rounded-b-lg shadow-inner">
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
                <div className="border-t border-gray-200 pt-2 mt-2 mx-2">
                  <button
                    onClick={() => {
                      handleRequireLogin(false);
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center w-full px-4 py-3 text-center rounded-lg text-white bg-[#6B5F32] hover:bg-[#5a5129] transition-colors duration-200 mb-2 text-sm font-medium"
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
                    className="flex items-center justify-center w-full px-4 py-3 text-center rounded-lg text-[#6B5F32] bg-[#E1D5B8] hover:bg-[#d4c4a1] transition-colors duration-200 text-sm font-medium"
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
          <section className="relative h-[60vh] sm:h-[70vh] min-h-[400px] sm:min-h-[500px] w-full overflow-hidden">
            <img 
              src="/images/SAGRADA-FAMILIA-PARISH.jpg"
              alt="Church Community"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative h-full flex items-center">
              <div className="container mx-auto px-4 sm:px-6">
                <div className="max-w-2xl text-white">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
                    Simplifying Church <br />
                    Management & Engagement
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 leading-relaxed">
                    The Society has built a new, mature, strategic structure, and kept up-to-date
                    with success across all the past year
                  </p>
                  <button 
                    onClick={() => handleRequireLogin(false)}
                    className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#E1D5B8] text-black rounded-lg hover:bg-opacity-90 text-base sm:text-lg transition-all hover:scale-105 font-medium"
                  >
                    Book now
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="py-6 sm:py-8">
            <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: { xs: 4, sm: 6 },
                  fontWeight: 'bold',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
                }}
              >
                Our Services
              </Typography>
              <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <FeatureCard onClick={feature.action}>
                      <CardContent sx={{ flexGrow: 1, bgcolor: 'white', p: { xs: 2, sm: 3 } }}>
                        <Typography
                          gutterBottom
                          variant="h5"
                          component="h3"
                          sx={{ 
                            color: '#6B5F32', 
                            fontWeight: 'bold',
                            fontSize: { xs: '1.25rem', sm: '1.5rem' }
                          }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary"
                          sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
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

          <section className="py-6 sm:py-8 bg-gray-100">
            <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
              <Typography
                variant="h3"
                component="h2"
                align="center"
                gutterBottom
                sx={{
                  color: '#333',
                  mb: { xs: 3, sm: 4 },
                  fontWeight: 'bold',
                  fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem' }
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
                  mb: { xs: 3, sm: 4 },
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                  lineHeight: 1.6
                }}
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
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1.2, sm: 1.5 },
                    fontSize: { xs: '1rem', sm: '1.1rem' },
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
        <footer className="bg-gradient-to-b from-white to-gray-50 text-black py-12 sm:py-16 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 sm:mb-12 pb-6 sm:pb-8 border-b border-gray-200">
              <div className="flex items-center mb-6 md:mb-0">
                <img 
                  src="/images/sagrada.png" 
                  alt="SagradaGo Logo" 
                  className="h-12 sm:h-16 w-auto mr-3 sm:mr-4" 
                />
                <div>
                  <span className="text-2xl sm:text-3xl font-bold text-[#6B5F32]">SagradaGo</span>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 max-w-md">
                    A digital gateway to Sagrada Familia Parish, connecting faith and community through modern technology.
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                <a 
                  href="https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#6B5F32] p-2.5 sm:p-3 rounded-full hover:bg-[#d1c5a8] transition-colors duration-200"
                >
                  <svg className="w-5 sm:w-6 h-5 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                  </svg>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-[#6B5F32]">Quick Links</h4>
                <ul className="space-y-3 sm:space-y-4">
                  <li>
                    <button 
                      onClick={() => handleNavigation('/')}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center text-sm sm:text-base"
                    >
                      <span className="mr-2">→</span>
                      Home
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleNavigation('/events')}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center text-sm sm:text-base"
                    >
                      <span className="mr-2">→</span>
                      Events
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => handleNavigation('/explore-parish')}
                      className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center text-sm sm:text-base"
                    >
                      <span className="mr-2">→</span>
                      Virtual Tour
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-[#6B5F32]">About Us</h4>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  Sagrada Go is a mobile and web-based appointment and record management system designed for Sagrada Familia Parish.
                </p>
              </div>

              <div>
                <h4 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-[#6B5F32]">Contact Us</h4>
                <ul className="space-y-3 sm:space-y-4">
                  <li className="flex items-start">
                    <svg className="w-4 sm:w-5 h-4 sm:h-5 text-[#6B5F32] mr-2 sm:mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                    </svg>
                    <span className="text-gray-600 text-xs sm:text-sm">Sagrada Familia Parish, Manila, Philippines</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-6 sm:pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-gray-500 text-xs sm:text-sm mb-4 md:mb-0 text-center md:text-left">
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