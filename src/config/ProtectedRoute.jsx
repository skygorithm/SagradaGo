import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';

const ProtectedRoute = ({ children, onLoginClick }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }

        // User is authenticated if we have a session
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        checkAuth();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Save the attempted URL to redirect back after login
    // For now, we'll just redirect to home and show login
    onLoginClick && onLoginClick();
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute; 