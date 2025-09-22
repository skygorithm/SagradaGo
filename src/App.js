// src/App.js
import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import { PopupsProvider } from "./context/PopupsContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import LoginModal from "./config/UserAuth";
import { useAdminAuth } from "./context/AdminAuthContext";
import { supabase } from "./config/supabase";
import ProtectedRoute from "./config/ProtectedRoute";
import HomePageLoggedIn from "./pages/HomepageLoggedIn";

// Lazy‐loaded pages
const HomePageLoggedOut = lazy(() => import("./pages/HomePageLoggedOut"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const ExploreParish = lazy(() => import("./pages/ExploreParish"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const MyHistory = lazy(() => import("./pages/MyHistory"));
const BookingList = lazy(() => import("./pages/BookingList"));
const DonationHistory = lazy(() => import("./pages/DonationHistory"));
const SetPasswordPage = lazy(() => import("./pages/SetPasswordPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ApprovedBookingsCalendar = lazy(() =>
  import("./pages/ApprovedBookingsCalendar")
);

// Simple loading spinner
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

  // Sign out
  const handleLogout = useCallback(async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
    navigate("/");
  }, [navigate]);

  // Centralized “show login/signup” helper
  const handleShowLogin = (signup = false) => {
    setIsSignupMode(signup);
    setShowLogin(true);
  };

  // Check Supabase session & localStorage
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    const checkAuth = async () => {
      try {
        const cachedAuth = localStorage.getItem("isAuthenticated");
        const cachedUserData = localStorage.getItem("userData");

        if (cachedAuth === "true" && cachedUserData) {
          if (mounted) {
            setIsAuthenticated(true);
            setIsLoading(false);
          }
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error checking auth status:", error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (session) {
          const { data: userData, error: userError } = await supabase
            .from("user_tbl")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (userError) {
            console.error("Error fetching user data:", userError);
            if (mounted) setIsLoading(false);
            return;
          }

          if (mounted) {
            setIsAuthenticated(true);
            localStorage.setItem("isAuthenticated", "true");
            localStorage.setItem("userData", JSON.stringify(userData));
          }
        }
      } catch (err) {
        console.error("Error in auth check:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for Supabase auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        await checkAuth();
      } else if (event === "SIGNED_OUT") {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        navigate("/");
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate]);

  // Redirect between “/” and “/home”
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && window.location.pathname === "/") {
      navigate("/home");
    } else if (!isAuthenticated && window.location.pathname === "/home") {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

  // After successful login
  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("userData", JSON.stringify(userData));
    setShowLogin(false);
    setIsSignupMode(false);
    navigate("/home");
  };

  if (isLoading || adminLoading) return <LoadingFallback />;

  return (
    <>
      {!isAuthenticated && showLogin && (
        <LoginModal
          open={showLogin}
          onClose={() => {
            setShowLogin(false);
            setIsSignupMode(false);
          }}
          onLoginSuccess={handleLoginSuccess}
          isSignupMode={isSignupMode}
        />
      )}

      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public landing */}
          <Route
            path="/"
            element={
              <HomePageLoggedOut
                onLoginClick={() => handleShowLogin(false)}
                onSignupClick={() => handleShowLogin(true)}
              />
            }
          />

          {/* Public pages */}
          <Route
            path="/events"
            element={
              <EventsPage
                isLoggedIn={isAuthenticated}
                onLogout={handleLogout}
                onLoginClick={() => handleShowLogin(false)}
                onSignupClick={() => handleShowLogin(true)}
              />
            }
          />
          <Route
            path="/explore-parish"
            element={
              <ExploreParish
                isLoggedIn={isAuthenticated}
                onLogout={handleLogout}
                onLoginClick={() => handleShowLogin(false)}
                onSignupClick={() => handleShowLogin(true)}
              />
            }
          />

          {/* Protected user routes */}
          <Route
            path="/home"
            element={
              <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                <HomePageLoggedIn
                  onLogout={handleLogout}
                  isLoggedIn={isAuthenticated}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                <ProfilePage
                  onLogout={handleLogout}
                  isLoggedIn={isAuthenticated}
                />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                <MyHistory />
              </ProtectedRoute>
            }
          />

          <Route
            path="/bookings"
            element={
              <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                <BookingList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donations"
            element={
              <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                <DonationHistory />
              </ProtectedRoute>
            }
          />

          {/* Password reset (public) */}
          <Route path="/set-password" element={<SetPasswordPage />} />

          {/* Admin */}
          <Route
            path="/admin/login"
            element={isAdmin ? <Navigate to="/admin" /> : <AdminLogin />}
          />
          <Route
            path="/admin/approved-calendar"
            element={
              isAdmin ? (
                <ApprovedBookingsCalendar />
              ) : (
                <Navigate to="/admin/login" />
              )
            }
          />
          <Route
            path="/admin/*"
            element={
              isAdmin ? <AdminDashboard /> : <Navigate to="/admin/login" />
            }
          />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <Router>
    <PopupsProvider>
      <AppContent />
    </PopupsProvider>
  </Router>
);

export default App;