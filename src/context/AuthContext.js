// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    // Check persisted auth state
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);

    // Restore profile if available
    const storedProfile = localStorage.getItem("userData");
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (err) {
        console.warn("Invalid stored userData in localStorage:", err);
      }
    }
  }, []);

  // Handle login (optional profile info)
  const login = (profile = null) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    if (profile) {
      setUserProfile(profile);
      localStorage.setItem("userData", JSON.stringify(profile));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserProfile(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userData");
  };

  // Update profile after editing (ex: ProfilePage save)
  const updateProfile = (profile) => {
    setUserProfile(profile);
    localStorage.setItem("userData", JSON.stringify(profile));
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, userProfile, login, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};