// src/App.js
import React, { useState, useEffect, lazy, Suspense, useCallback } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import LoginModal from "./config/UserAuth";
import { useAdminAuth } from "./context/AdminAuthContext";
import { supabase } from "./config/supabase";
import ProtectedRoute from "./config/ProtectedRoute";
import HomePageLoggedIn from "./pages/HomepageLoggedIn";

const HomePageLoggedOut = lazy(() =>
  import("./pages/HomePageLoggedOut")
);
const EventsPage = lazy(() => import("./pages/EventsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const ApprovedBookingsCalendar = lazy(() =>
  import("./pages/ApprovedBookingsCalendar")
);
const ExploreParish = lazy(() => import("./pages/ExploreParish"));
const SetPasswordPage = lazy(() => import("./pages/SetPasswordPage"));

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
    console.log("Logging out...");
    await supabase.auth.signOut();
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
    setIsAuthenticated(false);
    navigate("/");
  }, [navigate]);

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
      } catch (error) {
        console.error("Error in auth check:", error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
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

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated && window.location.pathname === "/") {
      navigate("/home");
    } else if (!isAuthenticated && window.location.pathname === "/home") {
      navigate("/");
    }
  }, [isAuthenticated, isLoading, navigate]);

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
          <Route
            path="/"
            element={
              <HomePageLoggedOut
                onLoginClick={(signup = false) => {
                  setIsSignupMode(signup);
                  setShowLogin(true);
                }}
              />
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute onLoginClick={() => setShowLogin(true)}>
                <HomePageLoggedIn onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute onLoginClick={() => setShowLogin(true)}>
                <ProfilePage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          <Route path="/set-password" element={<SetPasswordPage />} />
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
          <Route path="/explore-parish" element={<ExploreParish />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;