import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
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
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Phone,
  Cake,
  Lock,
  Security,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { supabase } from './supabase';
import ForgotPasswordDialog from '../components/dialog/ForgotPasswordDialog';
import { isAlphaNumeric } from '../utils/isAlphaNumeric';
import isAlphabetOnly from '../utils/isAlphabetOnly';

// Lazy load reCAPTCHA to prevent timeout
const ReCAPTCHA = React.lazy(() => import('react-google-recaptcha'));

const LoginModal = ({ 
  open = true, 
  onClose, 
  onLoginSuccess, 
  isSignupMode = false 
}) => {
  const [showLoginForm, setShowLoginForm] = useState(!isSignupMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showForgotPasswordMessage, setShowForgotPasswordMessage] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // reCAPTCHA state
  const [captchaValue, setCaptchaValue] = useState(null);
  const [captchaRef, setCaptchaRef] = useState(null);
  const [captchaLoaded, setCaptchaLoaded] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    user_firstname: '',
    user_middle: '',
    user_lastname: '',
    user_gender: 'rather not to tell',
    user_status: '-',
    user_mobile: '',
    user_bday: null,
    user_email: '',
    password: '',
    confirmPassword: '',
  });

  const signupSteps = [
    'Personal Information',
    'Contact Details', 
    'Account Security'
  ];

  // Clear error when form changes - with proper dependencies
  useEffect(() => {
    setError('');
    setFieldErrors({});
  }, [showLoginForm]);

  // Reset form when isSignupMode changes - with proper dependencies
  useEffect(() => {
    if (open) {
      setShowLoginForm(!isSignupMode);
      setError('');
      setFieldErrors({});
      setShowVerificationMessage(false);
      setShowForgotPasswordMessage(false);
      setActiveStep(0);
      resetCaptcha();
    }
  }, [isSignupMode, open]);

  // Reset reCAPTCHA when step changes - with proper dependencies
  useEffect(() => {
    if (activeStep !== 2) {
      resetCaptcha();
    }
  }, [activeStep]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setLoading(false);
      setError('');
      setFieldErrors({});
      setCaptchaValue(null);
    };
  }, []);

  const resetCaptcha = useCallback(() => {
    setCaptchaValue(null);
    if (captchaRef && captchaLoaded) {
      try {
        captchaRef.reset();
      } catch (error) {
        console.warn('Error resetting reCAPTCHA:', error);
      }
    }
  }, [captchaRef, captchaLoaded]);

  const handleCaptchaChange = useCallback((value) => {
    console.log('reCAPTCHA value:', value);
    setCaptchaValue(value);
    if (value) {
      setError('');
    }
  }, []);

  const handleCaptchaExpired = useCallback(() => {
    console.log('reCAPTCHA expired');
    setCaptchaValue(null);
    setError('reCAPTCHA verification expired. Please verify again.');
  }, []);

  const handleCaptchaError = useCallback(() => {
    console.log('reCAPTCHA error');
    setCaptchaValue(null);
    setError('reCAPTCHA verification failed. Please try again.');
  }, []);

  const handleCaptchaLoad = useCallback(() => {
    setCaptchaLoaded(true);
  }, []);

  // Simplified user existence check
  const checkExistingUser = async (email, mobile) => {
    return { isAvailable: true };
  };

  // Create user record after email verification
  const createUserRecord = async (authUser, userData) => {
    try {
      console.log('Creating user record after verification...');
      
      const userRecord = {
        id: authUser.id,
        user_firstname: userData.user_firstname,
        user_middle: userData.user_middle || '',
        user_lastname: userData.user_lastname,
        user_gender: userData.user_gender,
        user_status: userData.user_status,
        user_mobile: userData.user_mobile,
        user_bday: userData.user_bday,
        user_email: userData.user_email,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        email_confirmed_at: authUser.email_confirmed_at,
        registration_status: 'verified'
      };

      const { data: insertData, error: insertError } = await supabase
        .from('user_tbl')
        .insert([userRecord])
        .select();

      if (insertError) {
        console.error('User record creation error:', insertError);
        throw insertError;
      }

      // Clear user metadata after successful creation
      const { error: updateError } = await supabase.auth.updateUser({
        data: { signup_data: null }
      });

      if (updateError) {
        console.warn('Failed to clear metadata:', updateError);
      }

      console.log('User record created successfully:', insertData);
      return insertData[0];
    } catch (error) {
      console.error('Error creating user record:', error);
      throw error;
    }
  };

  const validateField = (field, value) => {
    const errors = { ...fieldErrors };
    
    switch (field) {
      case 'user_firstname':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = 'First name is required';
        } else if (!isAlphabetOnly(value.trim())) {
          errors[field] = 'First name must only contain letters';
        } else {
          delete errors[field];
        }
        break;
      case 'user_lastname':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = 'Last name is required';
        } else if (!isAlphabetOnly(value.trim())) {
          errors[field] = 'Last name must only contain letters';
        } else {
          delete errors[field];
        }
        break;
      case 'user_middle':
        if (value && typeof value === 'string' && value.trim() !== '' && !isAlphabetOnly(value.trim())) {
          errors[field] = 'Middle name must only contain letters';
        } else {
          delete errors[field];
        }
        break;
      case 'user_mobile':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = 'Mobile number is required';
        } else if (!/^\d+$/.test(value)) {
          errors[field] = 'Mobile number must contain only numbers';
        } else if (!value.startsWith('09') || value.length !== 11) {
          errors[field] = 'Mobile number must be 11 digits and start with 09';
        } else {
          delete errors[field];
        }
        break;
      case 'user_bday':
        if (!value) {
          errors[field] = 'Birthday is required';
        } else {
          try {
            const today = new Date();
            const birthDate = new Date(value);
            
            if (isNaN(birthDate.getTime())) {
              errors[field] = 'Please enter a valid date';
            } else {
              const age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              const dayDiff = today.getDate() - birthDate.getDate();

              if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
                errors[field] = 'You must be at least 18 years old';
              } else {
                delete errors[field];
              }
            }
          } catch (dateError) {
            errors[field] = 'Please enter a valid date';
          }
        }
        break;
      case 'user_email':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          errors[field] = 'Please enter a valid email address';
        } else {
          delete errors[field];
        }
        break;
      case 'password':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = 'Password is required';
        } else if (value.length < 6) {
          errors[field] = 'Password must be at least 6 characters';
        } else if (!isAlphaNumeric(value)) {
          errors[field] = 'Password must contain only letters and numbers';
        } else {
          delete errors[field];
        }
        break;
      case 'confirmPassword':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors[field] = 'Please confirm your password';
        } else if (value !== signupData.password) {
          errors[field] = 'Passwords do not match';
        } else {
          delete errors[field];
        }
        break;
      default:
        break;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateSignupInputs = () => {
    const requiredFields = [
      'user_firstname', 'user_lastname', 'user_mobile', 
      'user_bday', 'user_email', 'password', 'confirmPassword'
    ];

    let isValid = true;
    const newErrors = { ...fieldErrors };

    requiredFields.forEach(field => {
      const value = signupData[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldName = field.replace('user_', '').replace('_', ' ');
        newErrors[field] = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
        isValid = false;
      } else if (!validateField(field, value)) {
        isValid = false;
      }
    });

    setFieldErrors(newErrors);

    if (!captchaValue) {
      setError('Please complete the reCAPTCHA verification.');
      return false;
    }

    return isValid;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignupInputs()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Format birthday safely
      let birthdayFormatted;
      try {
        if (signupData.user_bday instanceof Date) {
          if (isNaN(signupData.user_bday.getTime())) {
            throw new Error('Invalid date');
          }
          birthdayFormatted = signupData.user_bday.toISOString().split('T')[0];
        } else if (signupData.user_bday) {
          const dateObj = new Date(signupData.user_bday);
          if (isNaN(dateObj.getTime())) {
            throw new Error('Invalid date');
          }
          birthdayFormatted = dateObj.toISOString().split('T')[0];
        } else {
          throw new Error('Birthday is required');
        }
      } catch (dateError) {
        console.error('Date formatting error:', dateError);
        throw new Error('Invalid date format for birthday. Please select a valid date.');
      }

      console.log('Starting signup process...');

      // Check for existing users
      await checkExistingUser(signupData.user_email, signupData.user_mobile);

      // Prepare user data to store in metadata
      const userDataForStorage = {
        user_firstname: signupData.user_firstname.trim(),
        user_middle: signupData.user_middle ? signupData.user_middle.trim() : '',
        user_lastname: signupData.user_lastname.trim(),
        user_gender: signupData.user_gender,
        user_status: signupData.user_status,
        user_mobile: signupData.user_mobile,
        user_bday: birthdayFormatted,
        user_email: signupData.user_email.toLowerCase().trim(),
        registration_timestamp: new Date().toISOString()
      };

      // Sign up with Supabase Auth with timeout
      const signupPromise = supabase.auth.signUp({
        email: signupData.user_email.toLowerCase().trim(),
        password: signupData.password,
        options: {
          data: {
            signup_data: userDataForStorage
          }
        }
      });

      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - please check your connection')), 30000);
      });

      const { data: authData, error: authError } = await Promise.race([signupPromise, timeoutPromise]);

      if (authError) {
        console.error('Auth error:', authError);
        
        if (authError.message.includes('already registered')) {
          throw new Error(
            'This email address is already registered. Please use the login form instead or try the "Forgot Password" option.'
          );
        } else if (authError.message.includes('invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (authError.message.includes('weak password')) {
          throw new Error('Password is too weak. Please use a stronger password with at least 6 characters.');
        }
        
        throw new Error(authError.message || 'Failed to create account. Please try again.');
      }

      console.log('Auth user created successfully:', authData?.user?.id);

      if (authData?.user) {
        setVerificationEmail(signupData.user_email);
        setShowVerificationMessage(true);
        resetCaptcha();
        
        console.log('Signup data stored in user metadata. User must verify email to complete registration.');
      } else {
        throw new Error('Failed to create user account - no user data returned');
      }
    } catch (error) {
      console.error('Signup error details:', error);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }
      
      setError(errorMessage);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!loginEmail || !loginPassword) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      // Add timeout to login request
      const loginPromise = supabase.auth.signInWithPassword({
        email: loginEmail.toLowerCase().trim(),
        password: loginPassword,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout - please check your connection')), 30000);
      });

      const { data: authData, error: authError } = await Promise.race([loginPromise, timeoutPromise]);

      if (authError) {
        console.error('Login error:', authError);
        
        if (authError.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (authError.message.includes('Email not confirmed')) {
          setVerificationEmail(loginEmail);
          setShowVerificationMessage(true);
          setLoading(false);
          return;
        } else if (authError.message.includes('Too many requests')) {
          throw new Error('Too many login attempts. Please wait a moment and try again.');
        }
        
        throw authError;
      }

      if (authData?.user) {
        if (!authData.user.email_confirmed_at) {
          setVerificationEmail(loginEmail);
          setShowVerificationMessage(true);
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        // Check if user record exists in user_tbl
        const { data: userData, error: userError } = await supabase
          .from('user_tbl')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError && userError.code === 'PGRST116') {
          // User record doesn't exist, create it from metadata
          console.log('User record not found, checking metadata...');
          
          const signupData = authData.user.user_metadata?.signup_data;
          if (signupData) {
            console.log('Found signup data in metadata, creating user record...');
            try {
              const newUserData = await createUserRecord(authData.user, signupData);
              
              // Check for admin role
              const { data: employeeData } = await supabase
                .from('admin_tbl')
                .select('id, user_role')
                .eq('user_email', loginEmail.toLowerCase().trim())
                .single();

              const userWithRole = {
                ...newUserData,
                isAdmin: employeeData?.user_role === 'admin',
                employeeRole: employeeData?.user_role
              };

              onLoginSuccess(userWithRole);
              onClose();
              return;
            } catch (createError) {
              console.error('Failed to create user record:', createError);
              await supabase.auth.signOut();
              throw new Error('Failed to complete registration. Please contact support.');
            }
          } else {
            console.error('No signup data found in metadata');
            await supabase.auth.signOut();
            throw new Error('Account registration is incomplete. Please sign up again.');
          }
        } else if (userError) {
          console.error('User fetch error:', userError);
          await supabase.auth.signOut();
          throw userError;
        }

        // User record exists, proceed with normal login
        console.log('User record found, proceeding with login...');

        // Check for admin role
        const { data: employeeData } = await supabase
          .from('admin_tbl')
          .select('id, user_role')
          .eq('user_email', loginEmail.toLowerCase().trim())
          .single();

        const userWithRole = {
          ...userData,
          isAdmin: employeeData?.user_role === 'admin',
          employeeRole: employeeData?.user_role
        };

        onLoginSuccess(userWithRole);
        onClose();
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Failed to log in. Please check your credentials.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.error_description) {
        errorMessage = error.error_description;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = useCallback((field) => (event) => {
    const value = event.target.value;
    setSignupData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Debounced validation
    const timeoutId = setTimeout(() => {
      validateField(field, value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleDateChange = useCallback((date) => {
    setSignupData(prev => ({
      ...prev,
      user_bday: date
    }));
    
    const timeoutId = setTimeout(() => {
      validateField('user_bday', date);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, []);

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    setError('');
    setFieldErrors({});
    setActiveStep(0);
    resetCaptcha();
  };

  const toggleForgotPassword = () => {
    setShowForgotPasswordMessage(!showForgotPasswordMessage);
    setShowLoginForm(true);
    setError('');
    resetCaptcha();
  };

  const handleClose = () => {
    setError('');
    setFieldErrors({});
    setLoading(false);
    setShowVerificationMessage(false);
    setShowForgotPasswordMessage(false);
    setLoginEmail('');
    setLoginPassword('');
    setActiveStep(0);
    setShowPassword(false);
    setShowConfirmPassword(false);
    resetCaptcha();
    setSignupData({
      user_firstname: '',
      user_middle: '',
      user_lastname: '',
      user_gender: 'rather not to tell',
      user_status: '-',
      user_mobile: '',
      user_bday: null,
      user_email: '',
      password: '',
      confirmPassword: '',
    });
    onClose();
  };

  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0:
        return signupData.user_firstname && 
               signupData.user_lastname && 
               !fieldErrors.user_firstname && 
               !fieldErrors.user_lastname && 
               !fieldErrors.user_middle;
      case 1:
        return signupData.user_mobile && 
               signupData.user_bday && 
               signupData.user_email &&
               !fieldErrors.user_mobile && 
               !fieldErrors.user_bday && 
               !fieldErrors.user_email;
      case 2:
        return signupData.password && 
               signupData.confirmPassword && 
               !fieldErrors.password && 
               !fieldErrors.confirmPassword &&
               captchaValue;
      default:
        return false;
    }
  };

  const handleStepChange = (newStep) => {
    setActiveStep(newStep);
  };

  const renderSignupStep = () => {
    switch (activeStep) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Person sx={{ mr: 1, color: '#6B5F32' }} />
                <Typography variant="h6" color="#6B5F32">
                  Tell us about yourself
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={signupData.user_firstname}
                onChange={handleInputChange('user_firstname')}
                disabled={loading}
                required
                error={!!fieldErrors.user_firstname}
                helperText={fieldErrors.user_firstname}
                autoComplete="given-name"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#6B5F32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6B5F32',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Middle Name"
                value={signupData.user_middle}
                onChange={handleInputChange('user_middle')}
                disabled={loading}
                error={!!fieldErrors.user_middle}
                helperText={fieldErrors.user_middle || 'Optional'}
                autoComplete="additional-name"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#6B5F32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6B5F32',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Last Name"
                value={signupData.user_lastname}
                onChange={handleInputChange('user_lastname')}
                disabled={loading}
                required
                error={!!fieldErrors.user_lastname}
                helperText={fieldErrors.user_lastname}
                autoComplete="family-name"
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#6B5F32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6B5F32',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl component="fieldset" sx={{ width: '100%' }}>
                <FormLabel sx={{ color: '#6B5F32', mb: 1 }}>Gender</FormLabel>
                <RadioGroup
                  row
                  value={signupData.user_gender}
                  onChange={handleInputChange('user_gender')}
                  sx={{ justifyContent: 'space-between' }}
                >
                  <FormControlLabel 
                    value="m" 
                    control={<Radio sx={{ '&.Mui-checked': { color: '#6B5F32' } }} />} 
                    label="Male" 
                    disabled={loading} 
                  />
                  <FormControlLabel 
                    value="f" 
                    control={<Radio sx={{ '&.Mui-checked': { color: '#6B5F32' } }} />} 
                    label="Female" 
                    disabled={loading} 
                  />
                  <FormControlLabel 
                    value="rather not to tell" 
                    control={<Radio sx={{ '&.Mui-checked': { color: '#6B5F32' } }} />} 
                    label="Prefer not to say" 
                    disabled={loading} 
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Phone sx={{ mr: 1, color: '#6B5F32' }} />
                <Typography variant="h6" color="#6B5F32">
                  Contact Information
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={signupData.user_mobile}
                onChange={(e) => {
                  if (/^\d*$/.test(e.target.value) && e.target.value.length <= 11) {
                    handleInputChange('user_mobile')(e);
                  }
                }}
                disabled={loading}
                required
                error={!!fieldErrors.user_mobile}
                helperText={fieldErrors.user_mobile || 'Format: 09XXXXXXXXX'}
                autoComplete="tel"
                placeholder="09XXXXXXXXX"
                InputProps={{
                  startAdornment: <InputAdornment position="start">🇵🇭</InputAdornment>,
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#6B5F32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6B5F32',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Birthday"
                  value={signupData.user_bday}
                  onChange={handleDateChange}
                  disabled={loading}
                  maxDate={new Date()}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      fullWidth 
                      required 
                      error={!!fieldErrors.user_bday}
                      helperText={fieldErrors.user_bday || 'You must be at least 18 years old'}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start">
                            <Cake sx={{ color: '#6B5F32' }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6B5F32',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#6B5F32',
                        },
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={signupData.user_email}
                onChange={handleInputChange('user_email')}
                disabled={loading}
                required
                error={!!fieldErrors.user_email}
                helperText={fieldErrors.user_email || 'We\'ll send a verification email to this address'}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: '#6B5F32' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#6B5F32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6B5F32',
                  },
                }}
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Security sx={{ mr: 1, color: '#6B5F32' }} />
                <Typography variant="h6" color="#6B5F32">
                  Account Security
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={signupData.password}
                onChange={handleInputChange('password')}
                disabled={loading}
                required
                error={!!fieldErrors.password}
                helperText={fieldErrors.password || 'Minimum 6 characters, letters and numbers only'}
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#6B5F32' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#6B5F32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6B5F32',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={signupData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                disabled={loading}
                required
                error={!!fieldErrors.confirmPassword}
                helperText={fieldErrors.confirmPassword || 'Re-enter your password to confirm'}
                autoComplete="new-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: '#6B5F32' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        aria-label="toggle confirm password visibility"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    '&.Mui-focused fieldset': {
                      borderColor: '#6B5F32',
                    },
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: '#6B5F32',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  bgcolor: '#f5f5f5', 
                  border: '1px dashed #6B5F32',
                  borderRadius: 2
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                  <Chip 
                    icon={<Security />} 
                    label="Security Verification" 
                    sx={{ 
                      bgcolor: '#E1D5B8', 
                      color: '#6B5F32',
                      fontWeight: 'bold'
                    }} 
                  />
                </Box>
                <Typography variant="body2" align="center" sx={{ mb: 2, color: '#666' }}>
                  Please verify that you're not a robot
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  '& > div': {
                    transform: 'scale(0.9)',
                    transformOrigin: 'center'
                  }
                }}>
                  <React.Suspense fallback={<CircularProgress />}>
                    <ReCAPTCHA
                      ref={(ref) => setCaptchaRef(ref)}
                      sitekey="6LdqzbsrAAAAAKerASuwwonsNNNsMva6j-hIWFPR"
                      onChange={handleCaptchaChange}
                      onExpired={handleCaptchaExpired}
                      onError={handleCaptchaError}
                      onLoad={handleCaptchaLoad}
                      theme="light"
                      size="normal"
                    />
                  </React.Suspense>
                </Box>
                {captchaValue && (
                  <Typography 
                    variant="caption" 
                    align="center" 
                    sx={{ mt: 1, color: '#4caf50', display: 'block' }}
                  >
                    ✓ Verification successful
                  </Typography>
                )}
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
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={loading}
      PaperProps={{
        sx: { 
          borderRadius: 3,
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        bgcolor: 'linear-gradient(135deg, #E1D5B8 0%, #d4c4a1 100%)', 
        color: '#6B5F32',
        textAlign: 'center',
        py: 3,
        fontSize: '1.5rem',
        fontWeight: 'bold'
      }}>
        {showVerificationMessage ? '✅ Email Verification Required' : 
         showForgotPasswordMessage ? '🔑 Forgot Password' :
         showLoginForm ? '🔐 Welcome Back' : '🎉 Join Our Community'}
      </DialogTitle>
      
      <DialogContent sx={{ px: 4, py: 3 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontSize: '0.95rem'
              }
            }}
          >
            {error}
          </Alert>
        )}
        
        {showVerificationMessage ? (
          <Paper elevation={0} sx={{ p: 4, textAlign: 'center', bgcolor: '#f8f9fa', borderRadius: 3 }}>
            <Box sx={{ mb: 3 }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#6B5F32', fontWeight: 'bold' }}>
                📧 Almost There!
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, color: '#666', lineHeight: 1.6 }}>
                We've sent a verification link to <strong>{verificationEmail}</strong>. 
                Please check your email and click the link to <strong>complete your registration</strong>.
              </Typography>
              <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Important Note:
                </Typography>
                <Typography variant="body2">
                  Your account will only be created after you verify your email address. 
                  Don't forget to check your spam folder if you don't see the email.
                </Typography>
              </Alert>
              <Button
                variant="contained"
                onClick={() => {
                  setShowVerificationMessage(false);
                  setShowLoginForm(true);
                }}
                sx={{ 
                  bgcolor: '#6B5F32', 
                  '&:hover': { bgcolor: '#5a5129' },
                  borderRadius: 2,
                  px: 4,
                  py: 1.5
                }}
              >
                Continue to Login
              </Button>
            </Box>
          </Paper>
        ) : showForgotPasswordMessage ? (
          <ForgotPasswordDialog 
            onClose={handleClose}
            toggleForgotPassword={toggleForgotPassword}
          />
        ) : showLoginForm ? (
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" align="center" sx={{ mb: 4, color: '#666' }}>
              Sign in to access your parish account
            </Typography>
            <form onSubmit={handleLogin}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#6B5F32' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#6B5F32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6B5F32',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="current-password"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#6B5F32' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      '& .MuiOutlinedInput-root': {
                        '&.Mui-focused fieldset': {
                          borderColor: '#6B5F32',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#6B5F32',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      mt: 2, 
                      py: 1.5,
                      bgcolor: '#6B5F32', 
                      '&:hover': { bgcolor: '#5a5129' },
                      borderRadius: 2,
                      fontSize: '1.1rem',
                      fontWeight: 'bold'
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '🔐 Sign In'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </Box>
        ) : (
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" align="center" sx={{ mb: 3, color: '#666' }}>
              Create your parish account in just a few steps
            </Typography>
            
            <Stepper 
              activeStep={activeStep} 
              alternativeLabel 
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#6B5F32',
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#6B5F32',
                },
              }}
            >
              {signupSteps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <form onSubmit={handleSignup}>
              {renderSignupStep()}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={activeStep === 0 || loading}
                  onClick={() => handleStepChange(activeStep - 1)}
                  sx={{ 
                    color: '#6B5F32',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                >
                  ← Previous
                </Button>
                
                {activeStep === signupSteps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !canProceedToNextStep()}
                    sx={{ 
                      bgcolor: '#6B5F32', 
                      '&:hover': { bgcolor: '#5a5129' },
                      borderRadius: 2,
                      px: 4
                    }}
                  >
                    {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : '🎉 Sign Up'}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleStepChange(activeStep + 1)}
                    disabled={!canProceedToNextStep() || loading}
                    variant="contained"
                    sx={{ 
                      bgcolor: '#E1D5B8', 
                      color: '#6B5F32',
                      '&:hover': { bgcolor: '#d4c4a1' },
                      borderRadius: 2
                    }}
                  >
                    Next →
                  </Button>
                )}
              </Box>
            </form>
          </Box>
        )}
      </DialogContent>

      {!showVerificationMessage && (
        <DialogActions sx={{ p: 3, justifyContent: 'center', flexDirection: 'column', gap: 1 }}>
          <Divider sx={{ width: '100%', my: 1 }} />
          {showLoginForm ? (
            <>
              <Button 
                onClick={toggleForgotPassword} 
                sx={{ color: '#6B5F32', '&:hover': { bgcolor: '#f5f5f5' } }} 
                disabled={loading}
              >
                🔑 Forgot Password?
              </Button>
              <Button 
                onClick={toggleForm} 
                sx={{ color: '#6B5F32', fontWeight: 'bold' }} 
                disabled={loading}
              >
                New here? Create an account →
              </Button>
            </>
          ) : (
            <Button 
              onClick={toggleForm} 
              sx={{ color: '#6B5F32', fontWeight: 'bold' }} 
              disabled={loading}
            >
              ← Already have an account? Sign in
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

LoginModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  onLoginSuccess: PropTypes.func.isRequired,
  isSignupMode: PropTypes.bool
};

export default LoginModal;