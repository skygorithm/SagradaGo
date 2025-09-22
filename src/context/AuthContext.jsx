// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const authStatus = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(authStatus);

    const storedProfile = localStorage.getItem("userData"); // NOTE: match App.js key
    if (storedProfile) {
      try {
        setUserProfile(JSON.parse(storedProfile));
      } catch (err) {
        console.warn("Invalid stored profile:", err);
      }
    }
  }, []);

  const login = (profile) => {
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