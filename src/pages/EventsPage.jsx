import React from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const EventsPage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  // Navigation handlers and navLinks copied from HomepageLoggedIn
  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home'), highlight: false },
    { label: 'EVENTS', action: () => handleNavigation('/events'), highlight: false },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish'), highlight: false },
    { label: 'LOGOUT', action: onLogout, highlight: false }
  ];
  function handleNavigation(path) {
    navigate(path);
    setMobileMenuOpen(false);
  }
  function protectedNavClick(actionOrPath) {
    if (typeof actionOrPath === 'function') {
      actionOrPath();
    } else {
      handleNavigation(actionOrPath);
    }
  }
  

  const events = [
    {
      title: 'Diocesan Youth Day',
      date: '2025-02-23',
      description: 'A church event for the Youth of the Diocese.',
      img: '/images/dyd.jpg',
    },
    {
      title: 'Sagrada Familia Parish Feast Day',
      date: '2025-03-23',
      description: 'A church event for Feast Day.',
      img: '/images/pista.jpg',
    },
    {
      title: 'Sacerdotal Anniversary',
      date: '2025-11-29',
      description: 'A church event for Sacerdotal Anniversary of the Parish Priest.',
      img: '/images/sarcedotal.jpg',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/home')}>
            <img 
              src="/images/sagrada.png"
              alt="SagradaGo Logo"
              className="h-10 w-auto mr-2"
            />
            <span className="text-2xl font-bold text-[#E1D5B8] hidden sm:block">SagradaGo</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={onLogout}
                  className="text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded px-4 py-2 hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => protectedNavClick(link.action)}
                  className={`text-black hover:text-[#E1D5B8] relative group transition-colors duration-200`}
                >
                  {link.label}
                </button>
              )
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2 ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <a
              href="/profile"
              className="ml-4"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/profile');
              }}
            >
              <img
                src="/images/wired-outline-21-avatar-hover-jumping.webp"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-[#E1D5B8] hover:shadow-lg transition-shadow duration-200"
                style={{ objectFit: 'cover' }}
              />
            </a>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-2 px-4 space-y-2 mt-2">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={onLogout}
                  className="block w-full text-left p-2 text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => protectedNavClick(link.action)}
                  className={`block w-full text-left p-2 text-black hover:text-[#E1D5B8]`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>
        )}
      </header>
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          sx={{ 
            mb: 6, 
            color: '#2C3E50',
            fontWeight: 'bold',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: '#E1D5B8',
              margin: '16px auto 0',
              borderRadius: '2px'
            }
          }}
        >
          Upcoming Events
        </Typography>
        <Grid container spacing={4}>
          {events.map((event, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Paper 
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    paddingTop: '56.25%', // 16:9 aspect ratio
                    overflow: 'hidden',
                    borderTopLeftRadius: '8px',
                    borderTopRightRadius: '8px'
                  }}
                >
                  <img 
                    src={event.img} 
                    alt={event.title} 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                </Box>
                <Box sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 'bold',
                      color: '#2C3E50'
                    }}
                  >
                    {event.title}
                  </Typography>
                  <Typography 
                    variant="subtitle1" 
                    sx={{ 
                      mb: 2,
                      color: '#E1D5B8',
                      fontWeight: 'medium'
                    }}
                  >
                    {format(new Date(event.date), 'MMMM d, yyyy')}
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 3,
                      color: '#666',
                      flexGrow: 1
                    }}
                  >
                    {event.description}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </div>
  );
};

export default EventsPage;
