// src/pages/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { 
  Box, 
  CircularProgress, 
  Typography, 
  Alert,
  Button,
  Container,
  Card,
  CardContent 
} from '@mui/material';
import { CheckCircle, Error as ErrorIcon } from '@mui/icons-material';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing'); // processing, success, error
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Extract the token hash from URL if it exists
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        if (type === 'signup' && token_hash) {
          // Verify the email confirmation token
          const { data: sessionData, error: verifyError } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
          });

          if (verifyError) {
            console.error('Email verification error:', verifyError);
            setStatus('error');
            setMessage('Email verification failed. The link may have expired or been used already.');
            setLoading(false);
            return;
          }

          if (sessionData.user) {
            // User email is now confirmed, complete the registration
            await completeUserRegistration(sessionData.user);
          }
        } else {
          // Handle other auth callbacks (like magic link, etc.)
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            console.error('Session error:', sessionError);
            setStatus('error');
            setMessage('Authentication failed. Please try again.');
            setLoading(false);
            return;
          }

          if (sessionData.session?.user) {
            // Check if user data exists in our database
            const existingUser = await checkUserExists(sessionData.session.user.id);
            
            if (!existingUser) {
              await completeUserRegistration(sessionData.session.user);
            } else {
              // User already exists, redirect to dashboard
              setStatus('success');
              setMessage('Welcome back! Redirecting to your dashboard...');
              setTimeout(() => navigate('/'), 2000);
            }
          } else {
            setStatus('error');
            setMessage('No active session found. Please try logging in again.');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred during authentication.');
        setLoading(false);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  const checkUserExists = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_tbl')
        .select('id')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking user existence:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Check user exists error:', error);
      return null;
    }
  };

  const completeUserRegistration = async (user) => {
  try {
    setMessage('Completing your registration...');
    
    const userMetadata = user.user_metadata || {};
    let signupData = null;

    if (userMetadata.signup_data) {
      try {
        signupData = JSON.parse(userMetadata.signup_data);
      } catch (parseError) {
        console.error('Error parsing signup data:', parseError);
      }
    }

    const userData = signupData || {
      first_name: userMetadata.first_name || 'User',
      last_name: userMetadata.last_name || '',
      middle_name: userMetadata.middle_name || null,
      gender: userMetadata.gender || 'rather not to tell',
      contact_number: userMetadata.contact_number || null,
      birth_date: userMetadata.birth_date || null,
    };

    // Try to insert user data - but don't fail if it already exists
    const { error: insertError } = await supabase
      .from('user_tbl')
      .insert({
        id: user.id,
        email: user.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        middle_name: userData.middle_name,
        gender: userData.gender,
        contact_number: userData.contact_number,
        birth_date: userData.birth_date,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      // If user already exists (duplicate), that's fine
      if (insertError.code === '23505') {
        console.log('User record already exists');
      } else {
        console.error('Insert error:', insertError);
        // Don't fail - Supabase auth is the source of truth
      }
    }

    // Success - redirect regardless of DB insert result
    setStatus('success');
    setMessage('Account verified! Redirecting...');
    setTimeout(() => navigate('/'), 2000);
    
  } catch (error) {
    console.error('Registration error:', error);
    // Still allow login - Supabase auth succeeded
    setStatus('success');
    setMessage('Account verified! Redirecting...');
    setTimeout(() => navigate('/'), 2000);
  } finally {
    setLoading(false);
  }
};

  const handleRetry = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          {loading ? (
            <CircularProgress size={60} sx={{ color: '#6B5F32', mb: 3 }} />
          ) : status === 'success' ? (
            <CheckCircle sx={{ fontSize: 80, color: 'green', mb: 2 }} />
          ) : (
            <ErrorIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          )}
          
          <Typography 
            variant="h5" 
            sx={{ 
              mb: 2, 
              color: status === 'success' ? 'green' : status === 'error' ? 'error.main' : '#6B5F32',
              fontWeight: 'bold' 
            }}
          >
            {status === 'processing' && 'Processing...'}
            {status === 'success' && 'Success!'}
            {status === 'error' && 'Verification Failed'}
          </Typography>
          
          <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
            {message}
          </Typography>

          {status === 'error' && (
            <Box sx={{ mt: 3 }}>
              <Alert severity="error" sx={{ mb: 2 }}>
                If this problem persists, please try registering again or contact support.
              </Alert>
              <Button
                variant="contained"
                onClick={handleRetry}
                sx={{
                  bgcolor: '#8B7355',
                  color: 'white',
                  '&:hover': { bgcolor: '#7A6449' },
                  borderRadius: '8px',
                  px: 4,
                  py: 1.5,
                }}
              >
                Return to Homepage
              </Button>
            </Box>
          )}

          {status === 'processing' && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Please wait while we verify your email and set up your account...
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default AuthCallback;