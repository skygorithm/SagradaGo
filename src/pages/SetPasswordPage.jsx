import { useEffect, useState } from 'react';
import { supabase } from '../config/supabase';
import { Container, Alert, Box, Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAlphaNumeric } from '../utils/isAlphaNumeric';

const SetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [isValidAccess, setIsValidAccess] = useState(false);


  useEffect(() => {
    async function validateAccess() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session || !session.user) {
          console.log('No session found, redirecting to login');
          navigate('/');
          return;
        }

        const user = session.user;
        setUser(user);

        // Check if this is a password recovery session
        const isPasswordRecovery = session.user.recovery_sent_at || 
                                 location.search.includes('type=recovery') ||
                                 location.hash.includes('type=recovery');

        // Check if user has never set a password (admin created account)
        // This checks if user was created recently and hasn't logged in before
        const isNewAccount = !user.last_sign_in_at || 
                           (user.created_at && user.last_sign_in_at && 
                            new Date(user.created_at).getTime() === new Date(user.last_sign_in_at).getTime());

        if (isPasswordRecovery || isNewAccount) {
          console.log('Valid access - password recovery or new account');
          setIsValidAccess(true);
        } else {
          console.log('Invalid access - user already has established account');
          setError('You already have access to your account. Use the regular login page.');
          setTimeout(() => {
            navigate('/home');
          }, 2000);
        }
      } catch (err) {
        console.error('Error validating access:', err);
        setError('An error occurred. Please try again.');
        setTimeout(() => {
          navigate('/home');
        }, 2000);
      } finally {
        setLoading(false);
      }
    }

    validateAccess();
  }, [navigate, location]);


  const handleSetPassword = async (event) => {
    event.preventDefault();
    console.log("New |Passowrd")
    if (!password) {
      setError('Please enter a new password.');
      return;
    }
    if (!isAlphaNumeric(password)) {
      setError('Password must contain only letters and numbers.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: password
    });
    
    if (error) {
      setError(error.message);
      setSuccess('');
      setLoading(false);
    } else {
      setLoading(false);
      setSuccess('Password updated successfully! You can now access your account on SagradaGo!');
      setError('');
      setTimeout(() => {
        navigate('/home');
      }, 2000);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Set your Password
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}
          <Box component="form" onSubmit={handleSetPassword} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Set Password'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default SetPasswordPage;