import React, { useState, useRef } from 'react';
import { TextField, Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { isAlphaNumeric } from '../utils/isAlphaNumeric';

const ProfilePage = ({ onLogout }) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState('/images/wired-outline-21-avatar-hover-jumping.webp');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  const getInitialProfile = () => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return {
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        birthday: '',
        password: '',
        confirmPassword: '',
      };
    }
    return {
      firstName: userData.user_firstname || '',
      lastName: userData.user_lastname || '',
      email: userData.user_email || '',
      contact: userData.user_mobile || '',
      birthday: userData.user_bday || '',
      password: '',
      confirmPassword: '',
    };
  };

  const [profile, setProfile] = useState(getInitialProfile());

  // Update profile live if userData in localStorage changes
  React.useEffect(() => {
    const handleStorage = () => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (userData) {
        setProfile({
          firstName: userData.user_firstname || '',
          lastName: userData.user_lastname || '',
          email: userData.user_email || '',
          contact: userData.user_mobile || '',
          birthday: userData.user_bday || '',
          password: '',
          confirmPassword: '',
        });
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
    if (!editMode) return;

    // Validate all fields first
    const validationErrors = [];
    
    if (!profile.firstName.trim()) {
      validationErrors.push('First name is required');
    }
    if (!profile.lastName.trim()) {
      validationErrors.push('Last name is required');
    }
    if (!profile.contact.trim()) {
      validationErrors.push('Contact number is required');
    }
    if (!profile.birthday) {
      validationErrors.push('Birthday is required');
    }

    // If there are validation errors, show them and stay in edit mode
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    // Password validation and update
    if (profile.password || profile.confirmPassword) {
      if (!profile.password || !profile.confirmPassword) {
        setPasswordMessage('Please fill in both password fields.');
        return;
      }

      if (!isAlphaNumeric(profile.confirmPassword)) {
        setPasswordMessage('New Password must contain only letters and numbers.');
        return false;
      }

      if (profile.confirmPassword.length < 6) {
        setPasswordMessage('New password must be at least 6 characters.');
        return;
      }
      if (profile.password === profile.confirmPassword) {
        setPasswordMessage('New password must be different from the current password.');
        return;
      }

      try {
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setPasswordMessage('Failed to verify your session. Please try logging in again.');
          return;
        }

        if (!session) {
          setPasswordMessage('No active session found. Please log in again.');
          return;
        }

        // First verify the current password
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: profile.password
        });

        if (signInError) {
          console.error('Current password verification error:', signInError);
          setPasswordMessage('Current password is incorrect.');
          return;
        }

        // Update password using the current session
        const { error: updateError } = await supabase.auth.updateUser({
          password: profile.confirmPassword
        });

        if (updateError) {
          console.error('Password update error:', updateError);
          setPasswordMessage(updateError.message || 'Failed to update password.');
          return;
        }

        // Clear password fields and show success message
        setProfile(prev => ({
          ...prev,
          password: '',
          confirmPassword: ''
        }));
        setPasswordMessage('Password updated successfully!');
        alert('Password has been successfully updated!');
        return; // Return here to prevent profile update if password was changed
      } catch (err) {
        console.error('Password update error:', err);
        setPasswordMessage('An unexpected error occurred. Please try again.');
        return;
      }
    }

    // Update profile information
    try {
      const { data: userData, error: userError } = await supabase
        .from('user_tbl')
        .update({
          user_firstname: profile.firstName.trim(),
          user_lastname: profile.lastName.trim(),
          user_mobile: profile.contact.trim(),
          user_bday: profile.birthday,
          date_updated: new Date().toISOString()
        })
        .eq('user_email', profile.email)
        .select();

      if (userError) {
        console.error('Profile update error:', userError);
        alert('Failed to update profile information.');
        return;
      }

      // Update localStorage with new user data
      if (userData && userData[0]) {
        localStorage.setItem('userData', JSON.stringify(userData[0]));
      }

      // Only exit edit mode and show success message if everything was successful
      setEditMode(false);
      alert('Profile Updated Successfully!');
    } catch (err) {
      console.error('Profile update error:', err);
      alert('Failed to update profile information.');
    }
  };

  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home'), highlight: false },
    { label: 'EVENTS', action: () => handleNavigation('/events'), highlight: false },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish'), highlight: false },
    { label: 'LOGOUT', action: onLogout, highlight: false }
  ];

  function handleNavigation(path, state) {
    navigate(path, state ? { state } : undefined);
    setMobileMenuOpen(false);
  }

  function protectedNavClick(actionOrPath) {
    if (typeof actionOrPath === 'function') {
      actionOrPath();
    } else {
      handleNavigation(actionOrPath);
    }
  }

  const handleEditClick = () => setShowConfirm(true);
  const handleConfirmEdit = () => {
    setEditMode(true);
    setShowConfirm(false);
  };
  const handleCancelEdit = () => {
    setEditMode(false);
    setProfileImage('/images/wired-outline-21-avatar-hover-jumping.webp');
  };

  // Drag and drop handlers
  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };
  const handleImageClick = () => {
    if (editMode && fileInputRef.current) fileInputRef.current.click();
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setProfileImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/home')}>
            <img 
              src="/images/sagrada.png"
              alt="SagradaGo Logo"
              className="h-10 w-auto mr-2"
            />
            <span className="text-2xl font-bold text-[#E1D5B8] hidden sm:block">SagradaGo</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded px-4 py-2 hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => protectedNavClick(link.action)}
                  className={`text-black hover:text-[#E1D5B8] relative group transition-colors duration-200`}
                >
                  {link.label}
                </button>
              )
            ))}
          </nav>
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden p-2 ml-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
            <a
              href="/profile"
              className="ml-4"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                navigate('/profile');
              }}
            >
              <img
                src="/images/wired-outline-21-avatar-hover-jumping.webp"
                alt="Profile"
                className="w-10 h-10 rounded-full border-2 border-[#E1D5B8] hover:shadow-lg transition-shadow duration-200"
                style={{ objectFit: 'cover' }}
              />
            </a>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white py-2 px-4 space-y-2 mt-2">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={link.action}
                  className="block w-full text-left p-2 text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={() => protectedNavClick(link.action)}
                  className={`block w-full text-left p-2 text-black hover:text-[#E1D5B8]`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>
        )}
      </header>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 10 }}>
        {/* Profile Image */}
        <Box
          sx={{ position: 'relative', mb: 3, cursor: editMode ? 'pointer' : 'default' }}
          onClick={handleImageClick}
          onDrop={editMode ? handleDrop : undefined}
          onDragOver={editMode ? handleDragOver : undefined}
          onDragLeave={editMode ? handleDragLeave : undefined}
        >
          <Avatar
            src={profileImage}
            alt="Profile"
            sx={{ width: 100, height: 100, border: dragActive ? '3px dashed #E1D5B8' : '3px solid #E1D5B8', transition: 'border 0.2s', boxShadow: dragActive ? 3 : 1 }}
          />
          {editMode && (
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          )}
        </Box>
        <Typography variant="h4" gutterBottom>
          Profile
        </Typography>
        <TextField
          label="First Name"
          variant="outlined"
          name="firstName"
          value={profile.firstName}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Last Name"
          variant="outlined"
          name="lastName"
          value={profile.lastName}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Email"
          variant="outlined"
          name="email"
          value={profile.email}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: true }}
        />
        <TextField
          label="Contact Number"
          variant="outlined"
          name="contact"
          value={profile.contact}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputProps={{ readOnly: !editMode }}
        />
        <TextField
          label="Birthday"
          variant="outlined"
          type="date"
          name="birthday"
          value={profile.birthday}
          onChange={handleChange}
          sx={{ mb: 2, width: '250px' }}
          InputLabelProps={{ shrink: true }}
          InputProps={{ readOnly: !editMode }}
        />
        {editMode && (
          <>
            <TextField
              label="Old Password"
              variant="outlined"
              name="password"
              type={showOldPassword ? 'text' : 'password'}
              value={profile.password}
              onChange={handleChange}
              sx={{ mb: 2, width: '250px' }}
              InputProps={{
                endAdornment: (
                  <Button onClick={() => setShowOldPassword((v) => !v)} tabIndex={-1} size="small">
                    {showOldPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            <TextField
              label="New Password"
              variant="outlined"
              name="confirmPassword"
              type={showNewPassword ? 'text' : 'password'}
              value={profile.confirmPassword}
              onChange={handleChange}
              sx={{ mb: 2, width: '250px' }}
              InputProps={{
                endAdornment: (
                  <Button onClick={() => setShowNewPassword((v) => !v)} tabIndex={-1} size="small">
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </Button>
                )
              }}
            />
            {passwordMessage && (
              <Typography color={passwordMessage.includes('success') ? 'green' : 'error'} sx={{ mb: 2, width: '250px' }}>
                {passwordMessage}
              </Typography>
            )}
          </>
        )}
        {!editMode && (
          <Button 
            variant="contained" 
            onClick={handleEditClick} 
            sx={{ width: '250px', mt: 2 }}
          >
            Edit Profile
          </Button>
        )}
        {editMode && (
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={handleSaveChanges} 
              sx={{ width: '120px' }}
            >
              Save
            </Button>
            <Button 
              variant="outlined" 
              onClick={handleCancelEdit} 
              sx={{ width: '120px' }}
            >
              Cancel
            </Button>
          </Box>
        )}
        <Button variant="outlined" sx={{ mt: 2, width: '250px', color: '#6B5F32', mb: 2 }} onClick={() => setShowLogoutConfirm(true)}>
          Sign Out
        </Button>
        <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            Are you sure you want to log out?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowLogoutConfirm(false)} sx={{ color: '#6B5F32' }}>Cancel</Button>
            <Button 
              onClick={() => {
                setShowLogoutConfirm(false);
                onLogout();
              }} 
              color="primary"
              variant="contained"
              sx={{ color: 'black' }}
            >
              Logout
            </Button>
          </DialogActions>
        </Dialog>
        {/* Confirm Dialog */}
        <Dialog open={showConfirm} onClose={() => setShowConfirm(false)}>
          <DialogTitle>Confirm Edit</DialogTitle>
          <DialogContent>Are you sure you want to edit your profile?</DialogContent>
          <DialogActions>
            <Button onClick={() => setShowConfirm(false)}>No</Button>
            <Button onClick={handleConfirmEdit} autoFocus>Yes</Button>
          </DialogActions>
        </Dialog>
      </Box>
      {/* Footer */}
      <footer className="bg-gradient-to-b from-white to-gray-50 text-black py-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Top Section with Logo and Description */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 pb-8 border-b border-gray-200">
            <div className="flex items-center mb-6 md:mb-0">
              <img 
                src="/images/sagrada.png" 
                alt="SagradaGo Logo" 
                className="h-16 w-auto mr-4" 
              />
              <div>
                <span className="text-3xl font-bold text-[#6B5F32]">SagradaGo</span>
                <p className="text-sm text-gray-600 mt-2 max-w-md">
                  A digital gateway to Sagrada Familia Parish, connecting faith and community through modern technology.
                </p>
              </div>
            </div>
            <div className="flex space-x-4">
              <a 
                href="https://www.facebook.com/sfpsanctuaryoftheholyfaceofmanoppello"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#6B5F32] p-3 rounded-full hover:bg-[#d1c5a8] transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.77 7.46H14.5v-1.9c0-.9.6-1.1 1-1.1h3V.5h-4.33C10.24.5 9.5 3.44 9.5 5.32v2.15h-3v4h3v12h5v-12h3.85l.42-4z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#6B5F32] relative inline-block">
                Quick Links
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#6B5F32] transform scale-x-0 transition-transform duration-300 group-hover:scale-x-100"></span>
              </h4>
              <ul className="space-y-4">
                <li>
                  <button 
                    onClick={() => handleNavigation('/home')}
                    className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Home
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/events')}
                    className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Events
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => handleNavigation('/explore-parish')}
                    className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Virtual Tour
                  </button>
                </li>
              </ul>
            </div>

            {/* About Section */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#6B5F32]">About Us</h4>
              <p className="text-gray-600 text-sm leading-relaxed">
                Sagrada Go is a mobile and web-based appointment and record management system designed for Sagrada Familia Parish. It streamlines parish services by allowing users to schedule appointments, access records, and stay updated with church events—anytime, anywhere.
              </p>
            </div>

            {/* Contact Section */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-[#6B5F32]">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <svg className="w-5 h-5 text-[#6B5F32] mr-3 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span className="text-gray-600">Sagrada Familia Parish, Sanctuary of the Holy Face of Manoppello, Manila, Philippines</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-500 text-sm mb-4 md:mb-0">
                © 2025 Sagrada Familia Parish. All rights reserved.
              </p>
              <p className="text-gray-500 text-sm">
                Designed and Developed by Group 2 – Sagrada Go Capstone Team
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;
