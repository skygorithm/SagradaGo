import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CircularProgress, Box } from '@mui/material';
import LoginModal from './config/UserAuth';
import { useAdminAuth } from './context/AdminAuthContext';
import { supabase } from './config/supabase';
import ProtectedRoute from './config/ProtectedRoute';
import HomePageLoggedIn from './pages/HomepageLoggedIn';


const HomePageLoggedOut = lazy(() => import('./pages/HomePageLoggedOut'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const ApprovedBookingsCalendar = lazy(() => import('./pages/ApprovedBookingsCalendar'));
const ExploreParish = lazy(() => import('./pages/ExploreParish'));
const SetPasswordPage = lazy(() => import('./pages/SetPasswordPage'));


const theme = createTheme({
  palette: {
    primary: {
      main: '#E1D5B8',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Loading component
const LoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    minHeight="100vh"
  >
    <CircularProgress />
  </Box>
);

const AppContent = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  const handleLogout = useCallback(async () => {
    console.log('Logging out...');

    // First, sign out from Supabase
    await supabase.auth.signOut();
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    navigate('/');
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
      setIsLoading(true);
    const checkAuth = async () => {

      try {
        // First check localStorage for cached auth state
        const cachedAuth = localStorage.getItem('isAuthenticated');
        const cachedUserData = localStorage.getItem('userData');
        
        if (cachedAuth === 'true' && cachedUserData) {
          if (mounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
          }
          return;
        }

        // If no cache, check Supabase session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth status:', error);
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }
        console.log('Supabase session:', session);

        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('user_tbl')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (userError) {
            console.error('Error fetching user data:', userError);
            if (mounted) {
              setIsLoading(false);
            }
            return;
          }

          if (mounted) {
            console.log('User data mounting:', userData);
            setIsAuthenticated(true);
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userData', JSON.stringify(userData));
          }
        }
      } catch (error) {
        console.error('Error in auth check:', error);
      } finally {
        console.log('mounted 1:', mounted);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth state changes
    console.log('Setting up auth state change listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        console.log('signed in');
        await checkAuth();
      } else if (event === 'SIGNED_OUT') {
        // cleanup here directly
        console.log('signed out');
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        navigate('/');
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    if (isLoading) return;
    console.log('Auth state changed:', isAuthenticated);
    if (isAuthenticated && window.location.pathname === '/') {
      navigate('/home');
    } else if (!isAuthenticated && window.location.pathname === '/home') {
      navigate('/');
    }
  }, [isAuthenticated, isLoading, navigate]); // Navigate when auth state changes

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userData', JSON.stringify(userData));
    setShowLogin(false);
    setIsSignupMode(false);
    navigate('/home');
  };

  if (isLoading || adminLoading) {
    return <LoadingFallback />;
  }

  return (
    <>
      {!isAuthenticated && showLogin && (
        <LoginModal 
          onLoginSuccess={handleLoginSuccess} 
          onClose={() => {
            setShowLogin(false);
            setIsSignupMode(false);
          }} 
          isSignupMode={isSignupMode}
        />
      )}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={
            <HomePageLoggedOut 
              onLoginClick={(signup = false) => {
                setIsSignupMode(signup);
                setShowLogin(true);
              }} 
            />
          } />
          <Route path="/home" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
              <HomePageLoggedIn onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/events" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
              <EventsPage onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute isAuthenticated={isAuthenticated} onLoginClick={() => setShowLogin(true)}>
              <ProfilePage onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/set-password" element={
            <SetPasswordPage />
          } />
          {/* Admin routes */}
          <Route path="/admin/login" element={
            isAdmin ? <Navigate to="/admin" /> : <AdminLogin />
          } />
          <Route path="/admin/approved-calendar" element={
            isAdmin ? (
              <ApprovedBookingsCalendar />
            ) : (
              <Navigate to="/admin/login" />
            )
          } />
          <Route path="/admin/*" element={
            isAdmin ? (
              <AdminDashboard />
            ) : (
              <Navigate to="/admin/login" />
            )
          } />
          <Route path="/explore-parish" element={<ExploreParish />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
};

export default App;