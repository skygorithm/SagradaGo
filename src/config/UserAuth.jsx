import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  FormControl,
  Grid,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  Typography,
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  Paper,
  Chip,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Cake,
  Lock,
  Security,
  CheckCircle,
} from "@mui/icons-material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { supabase } from "./supabase";
import { isAlphaNumeric } from "../utils/isAlphaNumeric";
import isAlphabetOnly from "../utils/isAlphabetOnly";

const ReCAPTCHA = React.lazy(() => import("react-google-recaptcha"));

const LoginModal = ({
  open = true,
  onClose,
  onLoginSuccess,
  isSignupMode = false,
}) => {
  const [showLoginForm, setShowLoginForm] = useState(!isSignupMode);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [fieldSuccess, setFieldSuccess] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // signup state
  const [signupData, setSignupData] = useState({
    user_firstname: "",
    user_middle: "",
    user_lastname: "",
    user_gender: "rather not to tell",
    user_mobile: "",
    user_bday: null,
    user_email: "",
    password: "",
    confirmPassword: "",
  });

  // captcha
  const [captchaValue, setCaptchaValue] = useState(null);

  const signupSteps = [
    "Personal Information",
    "Contact Details",
    "Account Security",
  ];

  /** ---------------- Validation ---------------- */
  const validateField = (field, value) => {
    const errors = { ...fieldErrors };
    const success = { ...fieldSuccess };

    const setErr = (msg) => {
      errors[field] = msg;
      delete success[field];
    };

    switch (field) {
      case "user_firstname":
        if (!value.trim()) setErr("First name is required");
        else if (!isAlphabetOnly(value.trim()))
          setErr("First name must only contain letters");
        else {
          delete errors[field];
          success[field] = true;
        }
        break;
      case "user_lastname":
        if (!value.trim()) setErr("Last name is required");
        else if (!isAlphabetOnly(value.trim()))
          setErr("Last name must only contain letters");
        else {
          delete errors[field];
          success[field] = true;
        }
        break;
      case "user_email":
        if (!value.trim()) setErr("Email is required");
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
          setErr("Please enter a valid email");
        else {
          delete errors[field];
          success[field] = true;
        }
        break;
      case "user_mobile":
        if (!value.trim()) setErr("Mobile number is required");
        else if (!/^\d+$/.test(value))
          setErr("Mobile must contain only digits");
        else if (!value.startsWith("09") || value.length !== 11)
          setErr("Must be 11 digits starting with 09");
        else {
          delete errors[field];
          success[field] = true;
        }
        break;
      case "user_bday":
        if (!value) setErr("Birthday is required");
        else {
          const birth = new Date(value);
          if (isNaN(birth.getTime())) setErr("Invalid date");
          else {
            const today = new Date();
            let age = today.getFullYear() - birth.getFullYear();
            const m = today.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
              age--;
            }
            if (age < 18) setErr("You must be at least 18");
            else {
              delete errors[field];
              success[field] = true;
            }
          }
        }
        break;
      case "password":
        if (!value) setErr("Password is required");
        else if (value.length < 6) setErr("Min 6 characters required");
        else if (!isAlphaNumeric(value))
          setErr("Password must be alphanumeric");
        else {
          delete errors[field];
          success[field] = true;
        }
        break;
      case "confirmPassword":
        if (value !== signupData.password) setErr("Passwords do not match");
        else {
          delete errors[field];
          success[field] = true;
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    setFieldSuccess(success);
  };

  const validateAll = () => {
    const required = [
      "user_firstname",
      "user_lastname",
      "user_email",
      "user_mobile",
      "user_bday",
      "password",
      "confirmPassword",
    ];
    let valid = true;
    required.forEach((f) => {
      validateField(f, signupData[f]);
      if (fieldErrors[f]) valid = false;
    });
    if (!captchaValue) {
      setError("Please complete reCAPTCHA");
      valid = false;
    }
    return valid;
  };

  /** ---------------- Handlers ---------------- */
  const handleInputChange = useCallback(
    (field) => (e) => {
      const val = e.target.value;
      setSignupData((prev) => ({ ...prev, [field]: val }));
      validateField(field, val);
    },
    []
  );

  const handleDateChange = (date) => {
    setSignupData((prev) => ({ ...prev, user_bday: date }));
    validateField("user_bday", date);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!loginEmail || !loginPassword)
      return setError("Please fill in all fields.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail))
      return setError("Invalid email");

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (error) throw error;
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateAll()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupData.user_email.trim(),
        password: signupData.password,
      });
      if (error) throw error;
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    setError("");
    setActiveStep(0);
    setFieldErrors({});
    setFieldSuccess({});
  };

  /** ---------------- Signup Stepper ---------------- */
  const renderStep = () => {
    const successAdornment = (field) =>
      fieldSuccess[field] ? (
        <InputAdornment position="end">
          <CheckCircle sx={{ color: "green" }} />
        </InputAdornment>
      ) : null;

    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Person sx={{ mr: 1, color: "#6B5F32" }} />
                <Typography variant="h6" color="#6B5F32">
                  Personal Information
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="First Name"
                fullWidth
                value={signupData.user_firstname}
                onChange={handleInputChange("user_firstname")}
                error={!!fieldErrors.user_firstname}
                helperText={fieldErrors.user_firstname}
                InputProps={{ endAdornment: successAdornment("user_firstname") }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Middle Name"
                fullWidth
                value={signupData.user_middle}
                onChange={handleInputChange("user_middle")}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Last Name"
                fullWidth
                value={signupData.user_lastname}
                onChange={handleInputChange("user_lastname")}
                error={!!fieldErrors.user_lastname}
                helperText={fieldErrors.user_lastname}
                InputProps={{ endAdornment: successAdornment("user_lastname") }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl>
                <FormLabel>Gender</FormLabel>
                <RadioGroup
                  row
                  value={signupData.user_gender}
                  onChange={handleInputChange("user_gender")}
                >
                  <FormControlLabel value="m" control={<Radio />} label="Male" />
                  <FormControlLabel
                    value="f"
                    control={<Radio />}
                    label="Female"
                  />
                  <FormControlLabel
                    value="rather not to tell"
                    control={<Radio />}
                    label="Prefer not to say"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Phone sx={{ mr: 1, color: "#6B5F32" }} />
                <Typography variant="h6" color="#6B5F32">
                  Contact Info
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Mobile Number"
                fullWidth
                value={signupData.user_mobile}
                onChange={handleInputChange("user_mobile")}
                error={!!fieldErrors.user_mobile}
                helperText={fieldErrors.user_mobile}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">🇵🇭</InputAdornment>
                  ),
                  endAdornment: successAdornment("user_mobile"),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Birthday"
                  value={signupData.user_bday}
                  onChange={handleDateChange}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      error={!!fieldErrors.user_bday}
                      helperText={fieldErrors.user_bday}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps?.endAdornment}
                            {successAdornment("user_bday")}
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                fullWidth
                value={signupData.user_email}
                onChange={handleInputChange("user_email")}
                error={!!fieldErrors.user_email}
                helperText={fieldErrors.user_email}
                InputProps={{ endAdornment: successAdornment("user_email") }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Security sx={{ mr: 1, color: "#6B5F32" }} />
                <Typography variant="h6" color="#6B5F32">
                  Account Security
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                fullWidth
                type={showPassword ? "text" : "password"}
                value={signupData.password}
                onChange={handleInputChange("password")}
                error={!!fieldErrors.password}
                helperText={fieldErrors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#6B5F32" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      <IconButton onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      {successAdornment("password")}
                    </>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Confirm Password"
                fullWidth
                type={showConfirmPassword ? "text" : "password"}
                value={signupData.confirmPassword}
                onChange={handleInputChange("confirmPassword")}
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#6B5F32" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      <IconButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                      {successAdornment("confirmPassword")}
                    </>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: "center",
                  border: "1px dashed #6B5F32",
                  bgcolor: "#f5f5f5",
                }}
              >
                <Chip
                  icon={<Security />}
                  label="Security Verification"
                  sx={{ bgcolor: "#E1D5B8", color: "#6B5F32", mb: 2 }}
                />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    "& > div": {
                      transform: { xs: "scale(0.85)", sm: "scale(0.95)" },
                      transformOrigin: "center",
                    },
                  }}
                >
                  <React.Suspense fallback={<CircularProgress />}>
                    <ReCAPTCHA
                      sitekey="6LdqzbsrAAAAAKerASuwwonsNNNsMva6j-hIWFPR"
                      onChange={setCaptchaValue}
                    />
                  </React.Suspense>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={showLoginForm ? "sm" : "md"}
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{ textAlign: "center", color: "#6B5F32", fontWeight: "bold" }}
      >
        {showLoginForm ? "Welcome Back" : "Join Our Community"}
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {showLoginForm ? (
          <form onSubmit={handleLogin}>
            <TextField
              label="Email"
              fullWidth
              sx={{ mb: 2 }}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              sx={{ mb: 2 }}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
              {signupSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {renderStep()}
          </form>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, justifyContent: "space-between" }}>
        {showLoginForm ? (
          <>
            <Button onClick={toggleForm} sx={{ color: "#6B5F32" }}>
              New here? Create an account →
            </Button>
            <Button
              onClick={handleLogin}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#6B5F32",
                color: "white",
                "&:hover": { bgcolor: "#5a5129" },
              }}
            >
              {loading ? <CircularProgress size={22} /> : "Sign In"}
            </Button>
          </>
        ) : (
          <>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep(activeStep - 1)}
              sx={{ color: "#6B5F32" }}
            >
              ← Previous
            </Button>
            {activeStep === 2 ? (
              <Button
                onClick={handleSignup}
                variant="contained"
                disabled={loading}
                sx={{
                  bgcolor: "#6B5F32",
                  color: "white",
                  "&:hover": { bgcolor: "#5a5129" },
                }}
              >
                {loading ? (
                  <CircularProgress size={22} sx={{ color: "white" }} />
                ) : (
                  "Sign Up"
                )}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={() => setActiveStep(activeStep + 1)}
                sx={{
                  bgcolor: "#E1D5B8",
                  color: "#6B5F32",
                  "&:hover": { bgcolor: "#d4c4a1" },
                }}
              >
                Next →
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

LoginModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  isSignupMode: PropTypes.bool,
};

export default LoginModal;