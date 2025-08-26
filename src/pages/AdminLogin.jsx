import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';
import { useAdminAuth } from '../context/AdminAuthContext';
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';

// Default admin credentials (these would normally be in .env)
const DEFAULT_ADMIN = {
  email: 'admin@sagradago.com',
  password: 'Admin123!'
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const location = useLocation();
  const { login, logout } = useAdminAuth();

  // const createDefaultAdmin = async () => {
  //   try {
  //     // First, create the user in Supabase Auth
  //     const { data: authData, error: authError } = await supabase.auth.signUp({
  //       email: DEFAULT_ADMIN.email,
  //       password: DEFAULT_ADMIN.password,
  //       options: {
  //         data: {
  //           first_name: 'Admin',
  //           last_name: 'User',
  //           role: 'admin'
  //         }
  //       }
  //     });

  //     if (authError) {
  //       console.error('Error creating default admin:', authError);
  //       throw authError;
  //     }

  //     // Then, create the admin record
  //     const { error: adminError } = await supabase
  //       .from('admin_tbl')
  //       .insert([
  //         {
  //           admin_email: DEFAULT_ADMIN.email,
  //           admin_firstname: 'Admin',
  //           admin_lastname: 'User'
  //         }
  //       ]);

  //     if (adminError) {
  //       console.error('Error creating admin record:', adminError);
  //       throw adminError;
  //     }

  //     return authData;
  //   } catch (error) {
  //     console.error('Error in createDefaultAdmin:', error);
  //     throw error;
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    console.log('Login started:', new Date().toISOString());

    try {
      // Sign in via Supabase Auth
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw new Error(signInError.message || 'Authentication failed');
      }

      const user = signInData.user;
      if (!user) {
        throw new Error('Authentication failed');
      }

      // Check admin profile gating
      const { data: adminRecord, error: adminError } = await supabase
        .from('admin_tbl')
        .select('*')
        .eq('admin_email', user.email)
        .eq('is_deleted', false)
        .eq('status', 'active')
        .single();

      if (adminError || !adminRecord) {
        await supabase.auth.signOut();
        throw new Error('You do not have admin access');
      }

      const adminData = {
        id: adminRecord.id,
        email: adminRecord.admin_email,
        firstName: adminRecord.admin_firstname,
        lastName: adminRecord.admin_lastname
      };

      login(adminData);
      navigate('/admin');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
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
            Admin Login
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
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
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AdminLogin; 