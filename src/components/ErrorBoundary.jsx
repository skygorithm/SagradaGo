// src/components/ErrorBoundary.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container } from "@mui/material";
import { Home, Refresh } from "@mui/icons-material";

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    
    // Auto-redirect after 3 seconds
    this.redirectTimer = setTimeout(() => {
      this.props.navigate("/");
      this.setState({ hasError: false, error: null });
    }, 3000);
  }

  componentWillUnmount() {
    if (this.redirectTimer) {
      clearTimeout(this.redirectTimer);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#f5f5f5",
          }}
        >
          <Container maxWidth="sm">
            <Box sx={{ textAlign: "center", p: 4 }}>
              <img
                src="/images/sagrada.png"
                alt="Logo"
                style={{ width: 80, height: 80, marginBottom: 20, opacity: 0.8 }}
              />
              <Typography variant="h4" gutterBottom color="error">
                Oops! Something went wrong
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Don't worry, we're redirecting you to the homepage in 3 seconds...
              </Typography>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
                <Button
                  variant="contained"
                  startIcon={<Home />}
                  onClick={() => {
                    this.props.navigate("/");
                    this.setState({ hasError: false, error: null });
                  }}
                  sx={{ bgcolor: "#8B7355", "&:hover": { bgcolor: "#7A6449" } }}
                >
                  Go Home Now
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                  sx={{ borderColor: "#8B7355", color: "#8B7355" }}
                >
                  Refresh Page
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to use hooks
const ErrorBoundary = ({ children }) => {
  const navigate = useNavigate();
  return (
    <ErrorBoundaryClass navigate={navigate}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;