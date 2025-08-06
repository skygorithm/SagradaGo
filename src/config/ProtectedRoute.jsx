import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from './supabase';

const ProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;

        if (!session) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // Check if user is an admin in admin_tbl
        const { data: employeeData, error: employeeError } = await supabase
          .from('admin_tbl')
          .select('user_role')
          .eq('user_email', session.user.email)
          .single();

        if (employeeError) {
          console.error('Employee check error:', employeeError);
          setIsAdmin(false);
        } else {
          setIsAdmin(employeeData?.user_role === 'admin');
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setIsAdmin(false);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        checkAdminAuth();
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

  if (!isAdmin) {
    // Save the attempted URL to redirect back after login
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute; 