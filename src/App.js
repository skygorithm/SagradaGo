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
  useLocation,
} from "react-router-dom";
import { CircularProgress, Box } from "@mui/material";

import LoginModal from "./config/UserAuth";
import { useAdminAuth } from "./context/AdminAuthContext";
import { supabase } from "./config/supabase";
import ProtectedRoute from "./config/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy-loaded pages - INCLUDING HomePageLoggedIn
const HomePageLoggedIn = lazy(() => import("./pages/HomepageLoggedIn"));
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

// Loader fallback
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

// Choose home view
const HomeRoute = ({
  isAuthenticated,
  userData,
  onLoginClick,
  onSignupClick,
  onLogout,
}) => {
  if (isAuthenticated) {
    return (
      <HomePageLoggedIn
        key="logged-in"
        onLogout={onLogout}
        userProfile={userData}
      />
    );
  }
  return (
    <HomePageLoggedOut
      key="logged-out"
      onLoginClick={onLoginClick}
      onSignupClick={onSignupClick}
    />
  );
};

const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, loading: adminLoading } = useAdminAuth();

  // Centralized logout
  const handleLogout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error("Supabase signout error:", error);

      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUserData(null);

      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
      setIsAuthenticated(false);
      setUserData(null);
      navigate("/", { replace: true });
    }
  }, [navigate]);

  // Show login modal
  const handleShowLogin = useCallback((signup = false) => {
    setIsSignupMode(signup);
    setShowLogin(true);
  }, []);

  // Auth status check with duplicate call prevention
  const checkAuthStatus = useCallback(async (source = 'unknown') => {
    // Prevent duplicate simultaneous calls
    if (checkAuthStatus.isRunning) {
      console.log(`⏭️ Skipping duplicate auth check from ${source}`);
      return;
    }
    
    checkAuthStatus.isRunning = true;
    
    try {
      console.log(`🔍 Checking auth status from: ${source}`);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Error checking auth:", sessionError);
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUserData(null);
        return;
      }

      if (session?.user) {
        console.log("✅ Valid session found");
        const { data: dbUser, error: dbError } = await supabase
          .from("user_tbl")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        let finalData;
        if (dbError || !dbUser) {
          console.warn("⚠️ Using session metadata fallback");
          finalData = {
            id: session.user.id,
            email: session.user.email,
            first_name: session.user.user_metadata?.first_name || "User",
            last_name: session.user.user_metadata?.last_name || "",
          };
        } else {
          finalData = dbUser;
        }

        setIsAuthenticated(true);
        setUserData(finalData);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(finalData));
      } else {
        console.log("🚫 No session");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUserData(null);
      }
    } catch (err) {
      console.error("💥 Unexpected auth check error:", err);
      setIsAuthenticated(false);
      setUserData(null);
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
    } finally {
      setIsLoading(false);
      checkAuthStatus.isRunning = false;
    }
  }, []);

  // Load from localStorage first for instant UI
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUserData = localStorage.getItem("userData");
    if (storedAuth === "true" && storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
        setIsAuthenticated(true);
        console.log("✅ Loaded user from localStorage:", parsedData);
      } catch (err) {
        console.error("Failed to parse stored user data:", err);
        setUserData(null);
      }
    }
    // Then verify with Supabase
    checkAuthStatus('initial-mount');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Listen to Supabase auth changes
  useEffect(() => {
    let mounted = true;
    
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("🔔 Auth state changed:", event);
      
      // Only handle specific events that require action
      if (event === "SIGNED_OUT") {
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userData");
        setIsAuthenticated(false);
        setUserData(null);
        if (location.pathname !== "/") {
          navigate("/", { replace: true });
        }
      } else if (event === "TOKEN_REFRESHED" && session?.user) {
        console.log("🔄 Token refreshed, updating user data");
        // Just update the user data silently
        const { data: dbUser } = await supabase
          .from("user_tbl")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();
        
        if (dbUser && mounted) {
          setUserData(dbUser);
          localStorage.setItem("userData", JSON.stringify(dbUser));
        }
      }
      // SIGNED_IN event is ignored - handleLoginSuccess handles login flow
    });
    
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [navigate, location.pathname]); // Removed checkAuthStatus dependency

  // Handle login success from modal
  const handleLoginSuccess = useCallback(
    async (newUserData) => {
      console.log("Login success, fetching full user data...");
      
      // Fetch complete user data from database
      try {
        const { data: dbUser, error } = await supabase
          .from("user_tbl")
          .select("*")
          .eq("id", newUserData.id)
          .maybeSingle();

        const finalData = dbUser || newUserData;
        
        setIsAuthenticated(true);
        setUserData(finalData);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(finalData));
        setShowLogin(false);
        setIsSignupMode(false);
        navigate("/", { replace: true });
      } catch (err) {
        console.error("Error fetching user data after login:", err);
        // Fallback to basic data
        setIsAuthenticated(true);
        setUserData(newUserData);
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(newUserData));
        setShowLogin(false);
        setIsSignupMode(false);
        navigate("/", { replace: true });
      }
    },
    [navigate]
  );

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
        <ErrorBoundary>
          <Routes>
            {/* Main home */}
            <Route
              path="/"
              element={
                <HomeRoute
                  isAuthenticated={isAuthenticated}
                  userData={userData}
                  onLoginClick={() => handleShowLogin(false)}
                  onSignupClick={() => handleShowLogin(true)}
                  onLogout={handleLogout}
                />
              }
            />

            {/* Public */}
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

            {/* Protected */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                  <ProfilePage
                    userData={userData}
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
                  <MyHistory onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/bookings"
              element={
                <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                  <BookingList onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/donations"
              element={
                <ProtectedRoute onLoginClick={() => handleShowLogin(false)}>
                  <DonationHistory onLogout={handleLogout} />
                </ProtectedRoute>
              }
            />

            {/* Misc */}
            <Route path="/set-password" element={<SetPasswordPage />} />

            {/* Admin */}
            <Route
              path="/admin/login"
              element={isAdmin ? <Navigate to="/admin" replace /> : <AdminLogin />}
            />
            <Route
              path="/admin/approved-calendar"
              element={
                isAdmin ? (
                  <ApprovedBookingsCalendar />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />
            <Route
              path="/admin/*"
              element={
                isAdmin ? (
                  <AdminDashboard />
                ) : (
                  <Navigate to="/admin/login" replace />
                )
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
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