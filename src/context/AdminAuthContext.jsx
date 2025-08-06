import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

// Default admin credentials (these would normally be in .env)
const DEFAULT_ADMIN = {
  email: 'admin@sagradago.com',
  password: 'admin123456'
};

const AdminAuthContext = createContext();

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if admin data exists in localStorage
    const storedAdminData = localStorage.getItem('adminData');
    if (storedAdminData) {
      const parsedData = JSON.parse(storedAdminData);
      setAdminData(parsedData);
      setIsAdmin(true);
    }
    setLoading(false);
  }, []);

  const login = (data) => {
    setAdminData(data);
    setIsAdmin(true);
    localStorage.setItem('adminData', JSON.stringify(data));
  };

  const logout = () => {
    setAdminData(null);
    setIsAdmin(false);
    localStorage.removeItem('adminData');
  };

  const value = {
    isAdmin,
    adminData,
    loading,
    login,
    logout
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthContext; 