// src/config/UserAuth.jsx
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
  Lock,
  Security,
  CheckCircle,
  MarkEmailRead,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { supabase } from "./supabase";
import { isAlphaNumeric } from "../utils/isAlphaNumeric";
import isAlphabetOnly from "../utils/isAlphabetOnly";

const ReCAPTCHA = React.lazy(() => import("react-google-recaptcha"));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    borderRadius: "16px",
    padding: "8px",
    backgroundColor: "#ffffff",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
  },
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "8px",
    backgroundColor: "#f8f9fa",
    "&:hover fieldset": {
      borderColor: "#E1D5B8",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#E1D5B8",
    },
  },
});

const LoginModal = ({
  open = false,
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
  const [showVerificationCard, setShowVerificationCard] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup state
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

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (!open) {
      // Reset all state
      setLoginEmail("");
      setLoginPassword("");
      setSignupData({
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
      setCaptchaValue(null);
      setError("");
      setActiveStep(0);
      setFieldErrors({});
      setFieldSuccess({});
      setShowPassword(false);
      setShowConfirmPassword(false);
      setShowVerificationCard(false);
      setUserEmail("");
    }
    setShowLoginForm(!isSignupMode);
  }, [open, isSignupMode]);

  // -------------------- Resend Email --------------------
  const handleResendEmail = async () => {
    try {
      setLoading(true);
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      if (resendError) {
        console.error("Resend email error:", resendError);
        setError(
          "Failed to resend verification email. Please try again later."
        );
      } else {
        setError("");
        alert("Verification email has been resent. Please check your inbox.");
      }
    } catch (err) {
      console.error("Unexpected resend error:", err);
      setError("Unexpected error while resending email.");
    } finally {
      setLoading(false);
    }
  };

  /** ---------------- Validation ---------------- */
  const validateField = React.useCallback(
    (field, value, currentSignupData = signupData) => {
      const errors = { ...fieldErrors };
      const success = { ...fieldSuccess };

      const setErr = (msg) => {
        errors[field] = msg;
        delete success[field];
      };

      switch (field) {
        case "user_firstname":
          if (!value || !value.trim()) setErr("First name is required");
          else if (!isAlphabetOnly(value.trim()))
            setErr("First name must only contain letters");
          else {
            delete errors[field];
            success[field] = true;
          }
          break;
        case "user_lastname":
          if (!value || !value.trim()) setErr("Last name is required");
          else if (!isAlphabetOnly(value.trim()))
            setErr("Last name must only contain letters");
          else {
            delete errors[field];
            success[field] = true;
          }
          break;
        case "user_email":
          if (!value || !value.trim()) setErr("Email is required");
          else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()))
            setErr("Please enter a valid email");
          else {
            delete errors[field];
            success[field] = true;
          }
          break;
        case "user_mobile":
          if (!value || !value.trim()) setErr("Mobile number is required");
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

            if (currentSignupData.confirmPassword) {
              const confirmPasswordValue = currentSignupData.confirmPassword;
              if (confirmPasswordValue === value) {
                delete errors.confirmPassword;
                success.confirmPassword = true;
              } else if (confirmPasswordValue) {
                errors.confirmPassword = "Passwords do not match";
                delete success.confirmPassword;
              }
            }
          }
          break;
        case "confirmPassword":
          const currentPassword = currentSignupData.password;
          if (!currentPassword) {
            setErr("Please enter password first");
          } else if (!value) {
            setErr("Please confirm your password");
          } else if (value !== currentPassword) {
            setErr("Passwords do not match");
          } else {
            delete errors[field];
            success[field] = true;
          }
          break;
        default:
          break;
      }

      setFieldErrors(errors);
      setFieldSuccess(success);
    },
    [fieldErrors, fieldSuccess, signupData]
  );

  const isCurrentStepComplete = () => {
    switch (activeStep) {
      case 0:
        return (
          signupData.user_firstname.trim() && 
          signupData.user_lastname.trim() &&
          !fieldErrors.user_firstname &&
          !fieldErrors.user_lastname
        );
      case 1:
        return (
          signupData.user_mobile.trim() && 
          signupData.user_bday && 
          signupData.user_email.trim() &&
          !fieldErrors.user_mobile &&
          !fieldErrors.user_bday &&
          !fieldErrors.user_email
        );
      case 2:
        return (
          signupData.password && 
          signupData.confirmPassword &&
          !fieldErrors.password &&
          !fieldErrors.confirmPassword &&
          captchaValue
        );
      default:
        return false;
    }
  };

  const validateCurrentStep = () => {
    let isValid = true;
    const newErrors = { ...fieldErrors };
    
    switch (activeStep) {
      case 0:
        const personalFields = ["user_firstname", "user_lastname"];
        personalFields.forEach((field) => {
          validateField(field, signupData[field]);
          if (!signupData[field] || !signupData[field].trim()) {
            newErrors[field] = `${field === 'user_firstname' ? 'First name' : 'Last name'} is required`;
            isValid = false;
          }
        });
        break;
      case 1:
        const contactFields = ["user_mobile", "user_bday", "user_email"];
        contactFields.forEach((field) => {
          validateField(field, signupData[field]);
          if (!signupData[field] || (typeof signupData[field] === 'string' && !signupData[field].trim())) {
            let fieldName = field === 'user_mobile' ? 'Mobile number' : 
                           field === 'user_bday' ? 'Birthday' : 'Email';
            newErrors[field] = `${fieldName} is required`;
            isValid = false;
          }
        });
        break;
      case 2:
        const securityFields = ["password", "confirmPassword"];
        securityFields.forEach((field) => {
          validateField(field, signupData[field]);
          if (!signupData[field]) {
            newErrors[field] = field === 'password' ? 'Password is required' : 'Please confirm your password';
            isValid = false;
          }
        });
        
        if (!captchaValue) {
          setError("Please complete reCAPTCHA verification");
          isValid = false;
        }
        break;
      default:
        break;
    }

    Object.values(fieldErrors).forEach(error => {
      if (error) isValid = false;
    });

    if (!isValid) {
      setFieldErrors(newErrors);
      if (!error && activeStep !== 2) {
        setError("Please fix the errors below before proceeding.");
      }
    } else {
      setError("");
    }

    return isValid;
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

  const handleInputChange = useCallback(
  (field) => (e) => {
    let val = e.target.value;
    
    if (field === "user_mobile") {
      if (!/^\d*$/.test(val) || val.length > 11) {
        return;
      }
    }
    
    // Create updated signup data for validation
    const updatedSignupData = { ...signupData, [field]: val };
    
    setSignupData(updatedSignupData);
    if (error) setError("");
    
    // Pass the updated data to validation
    validateField(field, val, updatedSignupData);
  },
  [error, signupData, validateField] // Add signupData to dependencies
);

  const handleDateChange = (date) => {
    setSignupData((prev) => ({ ...prev, user_bday: date }));
    if (error) setError("");
    validateField("user_bday", date);
  };

  // FIXED LOGIN HANDLER
  const handleLogin = async (e) => {
  e.preventDefault();
  setError("");
  
  if (!loginEmail || !loginPassword) {
    return setError("Please fill in all fields.");
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
    return setError("Please enter a valid email address");
  }

  if (loginPassword.length < 6) {
    return setError("Password must be at least 6 characters");
  }

  setLoading(true);
  
  try {
    const emailLowerCase = loginEmail.toLowerCase().trim();

    // Let Supabase handle authentication
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: emailLowerCase,
      password: loginPassword,
    });

    if (authError) {
      console.error("Login error:", authError);
      if (authError.message.includes("Invalid login credentials")) {
        setError("Incorrect email or password. Please try again.");
      } else if (authError.message.includes("Email not confirmed")) {
        setError("Please verify your email before signing in. Check your inbox for the confirmation link.");
      } else {
        setError(authError.message || "Login failed");
      }
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Login failed - no user data received");
      setLoading(false);
      return;
    }

    // Just pass the auth user data - App.js will handle the rest
    onLoginSuccess({ 
      id: authData.user.id,
      email: authData.user.email 
    });
    onClose();
    
  } catch (err) {
    console.error("Unexpected authentication error:", err);
    setError("An unexpected error occurred during login");
  } finally {
    setLoading(false);
  }
};

  // IMPROVED SIGNUP HANDLER with better error handling
  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateAll()) return;

    setLoading(true);
    
    try {
      const emailLowerCase = signupData.user_email.toLowerCase().trim();

      // SIMPLIFIED: Skip email checking to avoid database connection issues
      // Let Supabase handle duplicate email validation during auth.signUp
      
      // Format birth_date properly for PostgreSQL
      const formattedBirthDate = signupData.user_bday 
        ? new Date(signupData.user_bday).toISOString().split('T')[0] 
        : null;

      // Create auth user with email confirmation required
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: emailLowerCase,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_name: signupData.user_firstname.trim(),
            last_name: signupData.user_lastname.trim(),
            // Store signup data in metadata for later use
            signup_data: JSON.stringify({
              first_name: signupData.user_firstname.trim(),
              last_name: signupData.user_lastname.trim(),
              middle_name: signupData.user_middle.trim() || null,
              gender: signupData.user_gender,
              contact_number: signupData.user_mobile.trim(),
              birth_date: formattedBirthDate,
            })
          }
        }
      });

      if (authError) {
        console.error("Signup error:", authError);
        
        // Handle specific Supabase auth errors
        if (authError.message.includes('User already registered')) {
          setError("An account with this email already exists. Please use the login form.");
        } else if (authError.message.includes('Password should be at least')) {
          setError("Password must be at least 6 characters long.");
        } else if (authError.message.includes('Invalid email')) {
          setError("Please enter a valid email address.");
        } else {
          setError(authError.message || "Failed to create account. Please try again.");
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        setError("Account creation failed. Please try again.");
        setLoading(false);
        return;
      }

      // Show verification message
      setUserEmail(emailLowerCase);
      setShowVerificationCard(true);
      
      // Reset form
      setSignupData({
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
      setCaptchaValue(null);
      setFieldErrors({});
      setFieldSuccess({});
      setActiveStep(0);
      setLoading(false);

    } catch (err) {
      console.error("Signup error:", err);
      setError("An unexpected error occurred. Please check your connection and try again.");
      setLoading(false);
    }
  };

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    setError("");
    setActiveStep(0);
    setFieldErrors({});
    setFieldSuccess({});
    setShowVerificationCard(false);
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      setActiveStep((prev) => prev + 1);
      setError("");
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => prev - 1);
    setError("");
  };

  const handleCloseVerificationCard = () => {
    setShowVerificationCard(false);
    onClose();
  };

  /** ---------------- Render Steps ---------------- */
  const successAdornment = (field) =>
    fieldSuccess[field] ? (
      <InputAdornment position="end" sx={{ position: 'absolute', right: 8 }}>
        <CheckCircle sx={{ color: "green", fontSize: 20 }} />
      </InputAdornment>
    ) : null;

  const renderStep = () => {
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
              <Box sx={{ position: 'relative' }}>
                <StyledTextField
                  label="First Name"
                  required
                  placeholder="Juan"
                  fullWidth
                  value={signupData.user_firstname}
                  onChange={handleInputChange("user_firstname")}
                  error={!!fieldErrors.user_firstname}
                  helperText={fieldErrors.user_firstname}
                  disabled={loading}
                  sx={{ pr: fieldSuccess.user_firstname ? 5 : 0 }}
                />
                {successAdornment("user_firstname")}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <StyledTextField
                label="Middle Name"
                placeholder="Santos"
                fullWidth
                value={signupData.user_middle}
                onChange={handleInputChange("user_middle")}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <StyledTextField
                  label="Last Name"
                  required
                  placeholder="Dela Cruz"
                  fullWidth
                  value={signupData.user_lastname}
                  onChange={handleInputChange("user_lastname")}
                  error={!!fieldErrors.user_lastname}
                  helperText={fieldErrors.user_lastname}
                  disabled={loading}
                  sx={{ pr: fieldSuccess.user_lastname ? 5 : 0 }}
                />
                {successAdornment("user_lastname")}
              </Box>
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
                  <FormControlLabel value="f" control={<Radio />} label="Female" />
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
              <Box sx={{ position: 'relative' }}>
                <StyledTextField
                  label="Mobile Number"
                  required
                  placeholder="09123456789"
                  fullWidth
                  value={signupData.user_mobile}
                  onChange={handleInputChange("user_mobile")}
                  error={!!fieldErrors.user_mobile}
                  helperText={fieldErrors.user_mobile}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">PH</InputAdornment>
                    ),
                  }}
                  sx={{ pr: fieldSuccess.user_mobile ? 5 : 0 }}
                />
                {successAdornment("user_mobile")}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label="Birthday"
                    value={signupData.user_bday}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !!fieldErrors.user_bday,
                        helperText: fieldErrors.user_bday,
                        disabled: loading,
                        sx: { pr: fieldSuccess.user_bday ? 5 : 0 }
                      }
                    }}
                  />
                </LocalizationProvider>
                {successAdornment("user_bday")}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <StyledTextField
                  label="Email"
                  required
                  placeholder="juandelacruz@gmail.com"
                  fullWidth
                  type="email"
                  value={signupData.user_email}
                  onChange={handleInputChange("user_email")}
                  error={!!fieldErrors.user_email}
                  helperText={fieldErrors.user_email}
                  disabled={loading}
                  sx={{ pr: fieldSuccess.user_email ? 5 : 0 }}
                />
                {successAdornment("user_email")}
              </Box>
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
              <Box sx={{ position: 'relative' }}>
                <StyledTextField
                  label="Password"
                  fullWidth
                  required
                  type={showPassword ? "text" : "password"}
                  value={signupData.password}
                  onChange={handleInputChange("password")}
                  error={!!fieldErrors.password}
                  helperText={fieldErrors.password}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#6B5F32" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ pr: fieldSuccess.password ? 8 : 0 }}
                />
                {fieldSuccess.password && (
                  <CheckCircle sx={{ 
                    color: "green", 
                    fontSize: 20,
                    position: 'absolute',
                    right: 50,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }} />
                )}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ position: 'relative' }}>
                <StyledTextField
                  label="Confirm Password"
                  fullWidth
                  required
                  type={showConfirmPassword ? "text" : "password"}
                  value={signupData.confirmPassword}
                  onChange={handleInputChange("confirmPassword")}
                  error={!!fieldErrors.confirmPassword}
                  helperText={fieldErrors.confirmPassword}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: "#6B5F32" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{ pr: fieldSuccess.confirmPassword ? 8 : 0 }}
                />
                {fieldSuccess.confirmPassword && (
                  <CheckCircle sx={{ 
                    color: "green", 
                    fontSize: 20,
                    position: 'absolute',
                    right: 50,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 1
                  }} />
                )}
              </Box>
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

  // Email verification card
  const renderVerificationCard = () => (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <MarkEmailRead sx={{ fontSize: 64, color: "#6B5F32", mb: 2 }} />
      <Typography
        variant="h5"
        sx={{ color: "#6B5F32", mb: 2, fontWeight: "bold" }}
      >
        Check Your Email
      </Typography>
      <Typography variant="body1" sx={{ mb: 3, px: 2 }}>
        We've sent a verification link to:
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: "bold", mb: 3, color: "#8B7355" }}
      >
        {userEmail}
      </Typography>
      <Typography
        variant="body2"
        sx={{ mb: 3, px: 2, color: "text.secondary" }}
      >
        Please check your email and click the verification link to activate your
        account. You may need to check your spam folder.
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          onClick={handleCloseVerificationCard}
          sx={{
            bgcolor: "#8B7355",
            color: "white",
            "&:hover": { bgcolor: "#7A6449" },
            borderRadius: "8px",
            px: 4,
            py: 1.5,
          }}
        >
          Got it!
        </Button>
        <Button
          variant="outlined"
          onClick={handleResendEmail}
          disabled={loading}
          sx={{
            borderColor: "#8B7355",
            color: "#8B7355",
            "&:hover": { borderColor: "#7A6449", color: "#7A6449" },
            borderRadius: "8px",
            px: 4,
            py: 1.5,
          }}
        >
          {loading ? <CircularProgress size={22} /> : "Resend Email"}
        </Button>
      </Box>
    </Box>
  );

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth={showLoginForm ? "sm" : "md"}
      fullWidth
    >
      <DialogTitle
        sx={{ textAlign: "center", color: "#6B5F32", fontWeight: "bold" }}
      >
        {showVerificationCard 
          ? "Email Verification" 
          : showLoginForm 
          ? "Welcome Back" 
          : "Join Our Community"
        }
      </DialogTitle>

      <DialogContent sx={{ px: 3, pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: "8px" }}>
            {error}
          </Alert>
        )}

        {showVerificationCard ? (
          renderVerificationCard()
        ) : showLoginForm ? (
          <form onSubmit={handleLogin}>
            <StyledTextField
              label="Email"
              placeholder="Enter your email"
              fullWidth
              sx={{ mb: 2, mt: 1 }}
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <StyledTextField
              label="Password"
              placeholder="Enter your password"
              type={showPassword ? "text" : "password"}
              fullWidth
              sx={{ mb: 2 }}
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
        {showVerificationCard ? (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            {/* Verification card actions are handled in renderVerificationCard */}
          </Box>
        ) : showLoginForm ? (
          <>
            <Button onClick={toggleForm} sx={{ color: "#6B5F32" }}>
              New here? Create an account →
            </Button>
            <Button
              onClick={handleLogin}
              variant="contained"
              disabled={loading}
              sx={{
                bgcolor: "#8B7355",
                color: "white",
                "&:hover": { bgcolor: "#7A6449" },
                borderRadius: "8px",
                px: 3,
                py: 1.5,
              }}
            >
              {loading ? <CircularProgress size={22} /> : "Sign In"}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={toggleForm} sx={{ color: "#6B5F32" }}>
              Already have an account? Sign In
            </Button>
            <Box>
              {activeStep > 0 && (
                <Button
                  disabled={loading}
                  onClick={handlePrevious}
                  sx={{ color: "#6B5F32", mr: 1 }}
                >
                  ← Previous
                </Button>
              )}
              {activeStep === signupSteps.length - 1 ? (
                <Button
                  onClick={handleSignup}
                  variant="contained"
                  disabled={loading || !isCurrentStepComplete()}
                  sx={{
                    bgcolor: isCurrentStepComplete() ? "#8B7355" : "#e0e0e0",
                    color: isCurrentStepComplete() ? "white" : "#9e9e9e",
                    "&:hover": { 
                      bgcolor: isCurrentStepComplete() ? "#7A6449" : "#e0e0e0"
                    },
                    "&:disabled": {
                      bgcolor: "#e0e0e0",
                      color: "#9e9e9e"
                    },
                    borderRadius: "8px",
                    px: 3,
                    py: 1.5,
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
                  onClick={handleNext}
                  disabled={loading || !isCurrentStepComplete()}
                  sx={{
                    bgcolor: isCurrentStepComplete() ? "#E1D5B8" : "#e0e0e0",
                    color: isCurrentStepComplete() ? "#6B5F32" : "#9e9e9e",
                    "&:hover": { 
                      bgcolor: isCurrentStepComplete() ? "#d4c4a1" : "#e0e0e0"
                    },
                    "&:disabled": {
                      bgcolor: "#e0e0e0",
                      color: "#9e9e9e"
                    },
                    borderRadius: "8px",
                    px: 3,
                    py: 1.5,
                  }}
                >
                  Next →
                </Button>
              )}
            </Box>
          </>
        )}
      </DialogActions>
    </StyledDialog>
  );
};

LoginModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  isSignupMode: PropTypes.bool,
};

export default LoginModal;