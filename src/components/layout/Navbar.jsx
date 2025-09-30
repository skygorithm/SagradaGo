// src/components/layout/Navbar.jsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = ({
  navLinks = [],
  onLoginClick,
  onSignupClick,
  onLogout,
  isLoggedIn = false,
  userProfile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleNavigation = (link) => {
    if (link.path) navigate(link.path);
    if (link.action) link.action();
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  };

  const isActive = (link) => {
    if (link.path) return location.pathname === link.path;
    return false;
  };

  // Defensive access to userProfile with fallbacks
  const profileImage =
    userProfile?.profilePicture ||
    userProfile?.profile_image_url ||
    "/images/wired-outline-21-avatar-hover-jumping.webp";

  const firstName = userProfile?.firstName || userProfile?.user_firstname || userProfile?.first_name || "";
  const lastName = userProfile?.lastName || userProfile?.user_lastname || userProfile?.last_name || "";
  const displayName = firstName && lastName ? `${firstName} ${lastName}` : firstName || "User";

  return (
    <header className="bg-white shadow-lg border-b-2 border-[#E1D5B8] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer group hover:scale-105 transition"
            onClick={() => navigate(isLoggedIn ? "/" : "/")}
          >
            <img
              src="/images/sagrada.png"
              alt="Logo"
              className="h-8 w-8 sm:h-10 sm:w-10 mr-2 group-hover:rotate-3 transition"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-[#6B5F32]">SagradaGo</span>
              <span className="text-xs text-gray-500 hidden sm:block">
                Parish Management
              </span>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavigation(link)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition group ${
                  isActive(link)
                    ? "bg-[#E1D5B8] text-[#6B5F32] shadow-md"
                    : "text-gray-700 hover:text-[#6B5F32] hover:bg-gray-50"
                }`}
              >
                {link.label}
                {!isActive(link) && (
                  <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#E1D5B8] transition-all group-hover:w-full group-hover:left-0"></span>
                )}
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={onLoginClick}
                  className="hidden md:flex bg-[#6B5F32] text-white px-3 py-2 rounded-lg hover:bg-[#5a5129] text-sm"
                >
                  SIGN IN
                </button>
                <button
                  onClick={onSignupClick}
                  className="hidden md:flex bg-[#E1D5B8] text-[#6B5F32] px-3 py-2 rounded-lg hover:bg-[#d4c4a1] text-sm"
                >
                  JOIN NOW
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onLogout}
                  className="hidden md:flex bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  SIGN OUT
                </button>

                {/* Profile Menu */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="relative group p-1 rounded-full hover:bg-gray-50 transition"
                  >
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-9 h-9 rounded-full border-2 border-[#E1D5B8] group-hover:border-[#6B5F32] group-hover:shadow group-hover:animate-bounce"
                      onError={(e) => {
                        e.target.src = "/images/wired-outline-21-avatar-hover-jumping.webp";
                      }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => handleNavigation({ path: "/profile" })}
                        className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6B5F32]"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => handleNavigation({ path: "/history" })}
                        className="block w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6B5F32]"
                      >
                        My History
                      </button>
                      <button
                        onClick={onLogout}
                        className="block w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-3 rounded-lg hover:bg-gray-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <div className="w-6 h-6 relative">
                <span
                  className={`absolute w-6 h-0.5 bg-[#6B5F32] transition ${
                    mobileMenuOpen ? "rotate-45 top-3" : "top-1"
                  }`}
                ></span>
                <span
                  className={`absolute w-6 h-0.5 bg-[#6B5F32] transition ${
                    mobileMenuOpen ? "opacity-0" : "top-3"
                  }`}
                ></span>
                <span
                  className={`absolute w-6 h-0.5 bg-[#6B5F32] transition ${
                    mobileMenuOpen ? "-rotate-45 top-3" : "top-5"
                  }`}
                ></span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 mb-3 bg-white rounded-xl shadow-lg border border-gray-100">
            {/* Navigation Links */}
            <div className="py-2">
              {navLinks.map((link, index) => (
                <button
                  key={link.label}
                  onClick={() => handleNavigation(link)}
                  className={`block w-full text-left px-5 py-4 text-base font-medium transition-colors ${
                    isActive(link)
                      ? "bg-[#E1D5B8] text-[#6B5F32] shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#6B5F32]"
                  } ${
                    index === navLinks.length - 1 ? "" : "border-b border-gray-100"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>

            {/* User Section */}
            {!isLoggedIn ? (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <button
                  onClick={onLoginClick}
                  className="w-full py-3 px-4 bg-[#6B5F32] text-white rounded-lg font-medium hover:bg-[#5a5129] transition-colors"
                >
                  SIGN IN
                </button>
                <button
                  onClick={onSignupClick}
                  className="w-full py-3 px-4 bg-[#E1D5B8] text-[#6B5F32] rounded-lg font-medium hover:bg-[#d4c4a1] transition-colors"
                >
                  JOIN NOW
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-100">
                {/* User Profile Info */}
                <div className="px-5 py-4 bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-[#E1D5B8]"
                      onError={(e) => {
                        e.target.src = "/images/wired-outline-21-avatar-hover-jumping.webp";
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {displayName}
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                        <p className="text-xs text-gray-500">Online</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="py-2">
                  <button
                    onClick={() => handleNavigation({ path: "/profile" })}
                    className="block w-full text-left px-5 py-4 text-base text-gray-700 hover:bg-gray-50 hover:text-[#6B5F32] transition-colors border-b border-gray-100"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => handleNavigation({ path: "/bookings" })}
                    className="block w-full text-left px-5 py-4 text-base text-gray-700 hover:bg-gray-50 hover:text-[#6B5F32] transition-colors"
                  >
                    My Bookings
                  </button>
                </div>

                {/* Sign Out Button */}
                <div className="border-t border-gray-100 p-4">
                  <button
                    onClick={onLogout}
                    className="w-full py-3 px-4 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                  >
                    SIGN OUT
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;