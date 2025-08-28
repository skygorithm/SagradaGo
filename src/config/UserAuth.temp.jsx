import { useState } from 'react';
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
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { supabase } from './supabase';
import ForgotPasswordDialog from '../components/dialog/ForgotPasswordDialog';
import { isAlphaNumeric } from '../utils/isAlphaNumeric';
import { GoogleReCaptchaCheckbox } from '@google-recaptcha/react';
import isAlphabetOnly from '../utils/isAlphabetOnly';

const LoginModal = ({ onClose, onLoginSuccess, isSignupMode }) => {
  const [showLoginForm, setShowLoginForm] = useState(!isSignupMode);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [showForgotPasswordMessage, setShowForgotPasswordMessage] = useState(false);

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

  const [filledCaptcha, setFilledCaptcha] = useState(false);

  const validateSignupInputs = () => {
    if (!signupData.user_firstname || !signupData.user_lastname || !signupData.user_mobile || 
        !signupData.user_bday || !signupData.user_email || !signupData.password || !signupData.confirmPassword) {
      setError('Please fill in all required fields.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupData.user_email)) {
      setError('Please enter a valid email address.');
      return false;
    }

    if (!isAlphabetOnly(signupData.user_firstname) || 
        !isAlphabetOnly(signupData.user_middle) || 
        !isAlphabetOnly(signupData.user_lastname)) {
      setError('First name, Middle name and Last name must only contain letters.');
      return false;
    }

    if (!isAlphaNumeric(signupData.password)) {
      setError('Password must contain only letters and numbers.');
      return false;
    }

    if (signupData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return false;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (!/^\d+$/.test(signupData.user_mobile)) {
      setError('Mobile number must contain only numbers.');
      return false;
    }

    if (!signupData.user_mobile.startsWith('09') || signupData.user_mobile.length !== 11) {
      setError('Mobile number must be 11 digits long and start with 09.');
      return false;
    }

    if (!filledCaptcha) {
      setError('Please complete the CAPTCHA.');
      return false;
    }

    const today = new Date();
    const birthDate = new Date(signupData.user_bday);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    const dayDiff = today.getDate() - birthDate.getDate();

    if (age < 18 || (age === 18 && monthDiff < 0) || (age === 18 && monthDiff === 0 && dayDiff < 0)) {
      setError('You must be at least 18 years old to register.');
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateSignupInputs()) return;
    
    setLoading(true);
    setError('');

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: signupData.user_email,
        password: signupData.password,
      });

      if (authError) throw authError;

      if (authData?.user) {
        const { data: existingUsers, error: queryError } = await supabase
          .from('user_tbl')
          .select('id, is_verified, email_confirmed_at')
          .eq('user_email', signupData.user_email);

        if (queryError) throw queryError;

        if (existingUsers && existingUsers.length > 0) {
          const existingUser = existingUsers[0];
          
          if (!existingUser.email_confirmed_at) {
            await supabase
              .from('user_tbl')
              .delete()
              .eq('id', existingUser.id);
          } else {
            throw new Error('An account with this email already exists and is verified.');
          }
        }

        const storeUserData = async (retries = 3) => {
          try {
            const { error: profileError } = await Promise.race([
              supabase
                .from('user_tbl')
                .insert([{
                  id: authData.user.id,
                  user_firstname: signupData.user_firstname,
                  user_middle: signupData.user_middle,
                  user_lastname: signupData.user_lastname,
                  user_gender: signupData.user_gender,
                  user_status: signupData.user_status,
                  user_mobile: signupData.user_mobile,
                  user_bday: signupData.user_bday.toISOString().split('T')[0],
                  user_email: signupData.user_email,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                  is_verified: false,
                  email_confirmed_at: null,
                  registration_status: 'pending_verification'
                }]),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
              )
            ]);

            if (profileError) {
              if (profileError.code === '23505') {
                throw new Error('An account with this email already exists.');
              }
              throw profileError;
            }

            setVerificationEmail(signupData.user_email);
            setShowVerificationMessage(true);
          } catch (error) {
            if (error.message === 'Request timeout' && retries > 0) {
              await new Promise(resolve => setTimeout(resolve, 1000));
              return storeUserData(retries - 1);
            }
            throw error;
          }
        };

        await storeUserData();
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setError(error.message || 'Failed to create account. Please try again.');
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

    if (!loginEmail.includes('@')) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) throw authError;

      if (authData?.user) {
        if (!authData.user.email_confirmed_at) {
          setVerificationEmail(loginEmail);
          setShowVerificationMessage(true);
          await supabase.auth.signOut();
          setLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('user_tbl')
          .select('*')
          .eq('id', authData.user.id)
          .single();

        if (userError) {
          await supabase.auth.signOut();
          throw userError;
        }

        if (!userData.email_confirmed_at) {
          await supabase
            .from('user_tbl')
            .update({
              is_verified: true,
              email_confirmed_at: authData.user.email_confirmed_at,
              registration_status: 'verified',
              updated_at: new Date().toISOString()
            })
            .eq('id', authData.user.id);
        }

        const { data: employeeData } = await supabase
          .from('admin_tbl')
          .select('id, user_role')
          .eq('user_email', loginEmail)
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
      setError(error.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field) => (event) => {
    setSignupData({
      ...signupData,
      [field]: event.target.value,
    });
  };

  const toggleForm = () => {
    setShowLoginForm(!showLoginForm);
    setError('');
  };

  const toggleForgotPassword = () => {
    setShowForgotPasswordMessage(!showForgotPasswordMessage);
    setShowLoginForm(true);
    setError('');
  };

  const onCaptchaChange = (value) => {
    setFilledCaptcha(!!value);
  };

  return (
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#E1D5B8', color: 'black' }}>
        {showVerificationMessage ? 'Email Verification Required' : 
         showForgotPasswordMessage ? 'Forgot Password' :
         showLoginForm ? 'Login' : 'Sign Up'}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          {showVerificationMessage ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="h6" gutterBottom>
                Please verify your email
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                A verification link has been sent to {verificationEmail}. Please check your email and click the link to verify your account.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                After verifying your email, you can close this window and log in.
              </Typography>
              <Button
                variant="contained"
                onClick={() => {
                  setShowVerificationMessage(false);
                  setShowLoginForm(true);
                }}
                sx={{ bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d4c4a1' } }}
              >
                Go to Login
              </Button>
            </Box>
          ) : showForgotPasswordMessage ? (
            <ForgotPasswordDialog 
              onClose={onClose}
              toggleForgotPassword={toggleForgotPassword}
            />
          ) : showLoginForm ? (
            <form onSubmit={handleLogin}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                margin="normal"
                required
                disabled={loading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d4c4a1' } }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="First Name *"
                    value={signupData.user_firstname}
                    onChange={handleInputChange('user_firstname')}
                    disabled={loading}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    value={signupData.user_middle}
                    onChange={handleInputChange('user_middle')}
                    disabled={loading}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Last Name *"
                    value={signupData.user_lastname}
                    onChange={handleInputChange('user_lastname')}
                    disabled={loading}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <FormLabel>Gender</FormLabel>
                    <RadioGroup
                      row
                      value={signupData.user_gender}
                      onChange={handleInputChange('user_gender')}
                    >
                      <FormControlLabel value="m" control={<Radio />} label="Male" disabled={loading} />
                      <FormControlLabel value="f" control={<Radio />} label="Female" disabled={loading} />
                      <FormControlLabel value="rather not to tell" control={<Radio />} label="Rather not to tell" disabled={loading} />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Mobile Number *"
                    value={signupData.user_mobile}
                    onChange={(e) => {
                      if (/^\d*$/.test(e.target.value)) {
                        handleInputChange('user_mobile')(e);
                      }
                    }}
                    disabled={loading}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Birthday *"
                      value={signupData.user_bday}
                      onChange={(date) => setSignupData({ ...signupData, user_bday: date })}
                      renderInput={(params) => <TextField {...params} fullWidth required />}
                      disabled={loading}
                    />
                  </LocalizationProvider>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email *"
                    type="email"
                    value={signupData.user_email}
                    onChange={handleInputChange('user_email')}
                    disabled={loading}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password *"
                    type="password"
                    value={signupData.password}
                    onChange={handleInputChange('password')}
                    disabled={loading}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password *"
                    type="password"
                    value={signupData.confirmPassword}
                    onChange={handleInputChange('confirmPassword')}
                    disabled={loading}
                    required
                  />
                </Grid>

                <Grid item xs={12} sm={12}>
                  <div className='py-3'>
                    <center>
                      <GoogleReCaptchaCheckbox onChange={onCaptchaChange} />
                    </center>
                  </div>
                </Grid>

                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d4c4a1' } }}
                    disabled={loading}
                  >
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Box>
      </DialogContent>
      {!showVerificationMessage && (
        <DialogActions sx={{ p: 2, justifyContent: 'center', flexDirection: 'column' }}>
          {showLoginForm ? (
            <>
              <Button onClick={toggleForgotPassword} sx={{ color: '#6B5F32' }}>
                Forgot Password?
              </Button>
              <Button onClick={toggleForm} sx={{ color: '#6B5F32' }}>
                Don't have an account? Sign Up
              </Button>
            </>
          ) : (
            <Button onClick={toggleForm} sx={{ color: '#6B5F32' }}>
              Already have an account? Login
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default LoginModal;
