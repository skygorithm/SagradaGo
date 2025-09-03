import React, { useState, useRef } from 'react';
import { TextField, Button, Box, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Avatar } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Alert, InputAdornment, Paper, Divider, Card, CardContent } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Person, Email, Phone, Cake, Lock, Edit, Save, Cancel, PhotoCamera } from '@mui/icons-material';
import { supabase } from '../config/supabase';
import { isAlphaNumeric } from '../utils/isAlphaNumeric';
import CardPopup from './CardPopUp.jsx';
import { getMinimumBookingDate, restrictSacramentBooking } from '../utils/sacramentBookingRestriction.jsx';
import WeddingDocuments from '../components/sacrament-documents/wedding-documents.jsx';
import BaptismDocuments from '../components/sacrament-documents/baptism-documents.jsx';
import BurialDocuments from '../components/sacrament-documents/burial-documents.jsx';
import burialFormValidation from '../utils/form-validations/burialFormValidation.jsx';
import baptismFormValidation from '../utils/form-validations/baptismFormValidation.jsx';
import saveSpecificSacramentDocument from '../utils/form-functions/saveSpecificSacramentDocument.jsx';
import weddingFormValidation from '../utils/form-validations/weddingFormValidation.jsx';
import saveWeddingDocument from '../utils/form-functions/saveWeddingDocument.jsx';
import { getSacramentPrice } from '../information/getSacramentPrice.jsx';

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
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Add modal states from HomePageLoggedIn
  const [DonateOpen, setDonateOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);

  // Add donation states
  const [amount, setAmount] = useState('');
  const [donationIntercession, setDonationIntercession] = useState('');

  // Add booking states
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [pax, setPax] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Add form states
  const [residentForm, setResidentForm] = useState({
    id: null,
  });

  const [baptismForm, setBaptismForm] = useState({
    main_godfather: {},
    main_godmother: {},
    additional_godparents: [],
  });

  const [burialForm, setBurialForm] = useState({
    funeral_mass: false,
    death_anniversary: false,
    funeral_blessing: false,
    tomb_blessing: false,
  });

  const [weddingForm, setWeddingForm] = useState({
    groom_fullname: '',
    bride_fullname: '',
    contact_no: '',
    marriage_license: null,
    marriage_contract: null,
    groom_1x1: null,
    bride_1x1: null,
    groom_baptismal_cert: null,
    bride_baptismal_cert: null,
    groom_confirmation_cert: null,
    bride_confirmation_cert: null,
    groom_cenomar: null,
    bride_cenomar: null,
    groom_banns: null,
    bride_banns: null,
    groom_permission: null,
    bride_permission: null,
  });

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

  // Add error message timeout effect
  React.useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Add donation handler
  const handleDonate = async () => {
    const parsedAmount = parseFloat(amount);
    
    if (!amount || amount === '' || isNaN(parsedAmount) || parsedAmount <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      setErrorMessage('You must be logged in to make a donation.');
      return;
    }
    
    const donationData = {
      donation_amount: parsedAmount,
      donation_intercession: donationIntercession,
      user_id: user.id,
      is_deleted: false,
      status: 'active',
      date_created: new Date().toISOString(),
    };
    
    const { error } = await supabase
      .from('donation_tbl')
      .insert([donationData]);
    if (error) {
      console.error('Error inserting donation:', error);
      setErrorMessage('Failed to process donation. Please try again.');
      return;
    }
    console.log('Donation successful:', donationData);

    alert(`Thank you! You have donated PHP ${parsedAmount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    setAmount('');
    setDonationIntercession('');
    setDonateOpen(false);
  };

  // Add booking handler
  const handleBooking = async () => {
    if (!selectedSacrament || !date || !time || !pax) {
      setErrorMessage('Please select a sacrament, date, time, and number of people.');
      return;
    }

    let restriction = restrictSacramentBooking(selectedSacrament, date);
    if (restriction !== '') {
      setErrorMessage(restriction);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setErrorMessage('You must be logged in to make a booking.');
        return;
      }
      
      let cachedUserData = localStorage.getItem('userData');
      if (cachedUserData) {
        cachedUserData = JSON.parse(cachedUserData);
      } else {
        cachedUserData = {
          id: null,
          user_firstname: '',
          user_middle: '',
          user_lastname: '',
          user_gender: '',
          user_status: null,
          user_mobile: '',
          user_bday: '',
          user_email: '',
          date_created: '',
          date_updated: '',
          user_image: '',
          is_deleted: false,
          status: '',
        };
      }
      const username = `${cachedUserData.user_lastname}, ${cachedUserData.user_firstname}${cachedUserData.user_middle ? " " + cachedUserData.user_middle : ''}`;
      let datenow = new Date();
      const datePart = datenow.toLocaleDateString().replace(/\//g, '-');
      const timePart = datenow
      .toLocaleTimeString('en-US', { hour12: false });
      datenow = `${datePart}_${timePart}`;
      
      let specificDocumentTable = {
        date_created: new Date().toISOString(),
      }
      if (selectedSacrament === 'Wedding') {
        const validateResult = weddingFormValidation(weddingForm, setErrorMessage);
        if (!validateResult) {
          return;
        }
        specificDocumentTable = {
          ...specificDocumentTable,
          ...weddingForm,
        }
        const weddingGroomFullname = weddingForm.groom_fullname;
        const weddingBrideFullname = weddingForm.bride_fullname;
        
        const groom1x1Url = await saveWeddingDocument(datenow, "Groom 1x1", specificDocumentTable.groom_1x1, `${username}_groom_pic_${weddingGroomFullname}.png`, setErrorMessage);
        if (!groom1x1Url) {
          return;
        }
        specificDocumentTable.groom_1x1 = groom1x1Url;

        const bride1x1Url = await saveWeddingDocument(datenow, "Bride 1x1", specificDocumentTable.bride_1x1, `${username}_bride_pic_${weddingBrideFullname}.png`, setErrorMessage);
        if (!bride1x1Url) {
          return;
        }
        specificDocumentTable.bride_1x1 = bride1x1Url;
        
        const groomBaptismalUrl = await saveWeddingDocument(datenow, "Groom Baptismal", specificDocumentTable.groom_baptismal_cert, `${username}_groom_baptismal_${weddingGroomFullname}.png`, setErrorMessage);
        if (!groomBaptismalUrl) {
          return;
        }
        specificDocumentTable.groom_baptismal_cert = groomBaptismalUrl;

        const brideBaptismalUrl = await saveWeddingDocument(datenow, "Bride Baptismal", specificDocumentTable.bride_baptismal_cert, `${username}_bride_baptismal_${weddingBrideFullname}.png`, setErrorMessage);
        if (!brideBaptismalUrl) {
          return;
        }
        specificDocumentTable.bride_baptismal_cert = brideBaptismalUrl;

        const groomConfirmationUrl = await saveWeddingDocument(datenow, "Groom Confirmation", specificDocumentTable.groom_confirmation_cert, `${username}_groom_confirmation_${weddingGroomFullname}.png`, setErrorMessage);
        if (!groomConfirmationUrl) {
          return;
        }
        specificDocumentTable.groom_confirmation_cert = groomConfirmationUrl;

        const brideConfirmationUrl = await saveWeddingDocument(datenow, "Bride Confirmation", specificDocumentTable.bride_confirmation_cert, `${username}_bride_confirmation_${weddingBrideFullname}.png`, setErrorMessage);
        if (!brideConfirmationUrl) {
          return;
        }
        specificDocumentTable.bride_confirmation_cert = brideConfirmationUrl;

        if (specificDocumentTable.groom_cenomar) {
          const groomCENOMARUrl = await saveWeddingDocument(datenow, "Groom CENOMAR", specificDocumentTable.groom_cenomar, `${username}_groom_cenomar_${weddingGroomFullname}.png`, setErrorMessage);
          if (!groomCENOMARUrl) {
            return;
          }
          specificDocumentTable.groom_cenomar = groomCENOMARUrl;
        }
        if (specificDocumentTable.bride_cenomar) {
          const brideCENOMARUrl = await saveWeddingDocument(datenow, "Bride CENOMAR", specificDocumentTable.bride_cenomar, `${username}_bride_cenomar_${weddingBrideFullname}.png`, setErrorMessage);
          if (!brideCENOMARUrl) {
            return;
          }
          specificDocumentTable.bride_cenomar = brideCENOMARUrl;
        }
        if (specificDocumentTable.marriage_license) {
          const marriageLicenseUrl = await saveWeddingDocument(datenow, "Marriage License", specificDocumentTable.marriage_license, `${username}_marriage_license_${weddingGroomFullname}_${weddingBrideFullname}.png`, setErrorMessage);
          if (!marriageLicenseUrl) {
            return;
          }
          specificDocumentTable.marriage_license = marriageLicenseUrl;
        }
        if (specificDocumentTable.marriage_contract) {
          const marriageContractUrl = await saveWeddingDocument(datenow, "Marriage Contract", specificDocumentTable.marriage_contract, `${username}_marriage_contract_${weddingGroomFullname}_${weddingBrideFullname}.png`, setErrorMessage);
          if (!marriageContractUrl) {
            return;
          }
          specificDocumentTable.marriage_contract = marriageContractUrl;
        }
        const groomBannsUrl = await saveWeddingDocument(datenow, "Groom Banns", specificDocumentTable.groom_banns, `${username}_groom_banns_${weddingGroomFullname}.png`, setErrorMessage);
        if (!groomBannsUrl) {
          return;
        }
        specificDocumentTable.groom_banns = groomBannsUrl;

        const brideBannsUrl = await saveWeddingDocument(datenow, "Bride Banns", specificDocumentTable.bride_banns, `${username}_bride_banns_${weddingBrideFullname}.png`, setErrorMessage);
        if (!brideBannsUrl) {
          return;
        }
        specificDocumentTable.bride_banns = brideBannsUrl;

        const groomPermissionUrl = await saveWeddingDocument(datenow, "Groom Permission", specificDocumentTable.groom_permission, `${username}_groom_permission_${weddingGroomFullname}.png`, setErrorMessage);
        if (!groomPermissionUrl) {
          return;
        }
        specificDocumentTable.groom_permission = groomPermissionUrl;

        const bridePermissionUrl = await saveWeddingDocument(datenow, "Bride Permission", specificDocumentTable.bride_permission, `${username}_bride_permission_${weddingBrideFullname}.png`, setErrorMessage);
        if (!bridePermissionUrl) {
          return;
        }
        specificDocumentTable.bride_permission = bridePermissionUrl;

      } else if (selectedSacrament === 'Baptism') {
        const validateResult = baptismFormValidation(cachedUserData, baptismForm, setErrorMessage);
        specificDocumentTable = {
          ...specificDocumentTable,
          ...baptismForm,
        };
        if (!validateResult) {
          return;
        }
      } else if (selectedSacrament === 'Burial') {
        const validateResult = burialFormValidation(cachedUserData, burialForm, setErrorMessage);
        specificDocumentTable = {
          ...specificDocumentTable,
          ...burialForm,
        };
        if (!validateResult) {
          return;
        }
      }

      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      let specificDocumentId = null;
      console.log("Specific document table: ", specificDocumentTable);
      specificDocumentId = await saveSpecificSacramentDocument({
        selectedSacrament,
        specificDocumentTable: specificDocumentTable,
        setErrorMessage,
      })
      if (!specificDocumentId) {
        return;
      }
      
      const bookingData = {
        user_id: user.id,
        booking_sacrament: selectedSacrament,
        booking_date: date.toISOString().split('T')[0],
        booking_time: time.toLocaleTimeString('en-US', { hour12: false }),
        booking_pax: parseInt(pax),
        booking_status: 'pending',
        booking_transaction: transactionId,
        ...(specificDocumentId && selectedSacrament === 'Wedding' ? {
          wedding_docu_id: specificDocumentId
        } : specificDocumentId && selectedSacrament === 'Baptism' ? {
          baptism_docu_id: specificDocumentId
        } : specificDocumentId && selectedSacrament === 'Burial' ? {
          burial_docu_id: specificDocumentId
        } : {}),
        price: getSacramentPrice(selectedSacrament),
      };
      const { error } = await supabase
        .from('booking_tbl')
        .insert([bookingData]);

      if (error) throw error;

      alert(`Booking confirmed for ${selectedSacrament} on ${date.toLocaleDateString()} at ${time.toLocaleTimeString()} for ${pax} people`);
      if (selectedSacrament === 'Wedding') {
        setWeddingForm({
          groom_fullname: '',
          bride_fullname: '',
          contact_no: '',
          marriage_license: null,
          marriage_contract: null,
          groom_1x1: null,
          bride_1x1: null,
          groom_baptismal_cert: null,
          bride_baptismal_cert: null,
          groom_confirmation_cert: null,
          bride_confirmation_cert: null,
          groom_cenomar: null,
          bride_cenomar: null,
          groom_banns: null,
          bride_banns: null,
          groom_permission: null,
          bride_permission: null,
        });
      } else if (selectedSacrament === 'Baptism') {
        setBaptismForm({
          main_godfather: {},
          main_godmother: {},
          additional_godparents: [],
        });
      } else if (selectedSacrament === 'Burial') {
        setBurialForm({
          funeral_mass: false,
          death_anniversary: false,
          funeral_blessing: false,
          tomb_blessing: false,
        });
      }
      setSelectedSacrament('');
      setDate(null);
      setTime(null);
      setPax('');
      setErrorMessage('');
      setResidentForm({
        id: null,
      });
      setBookingOpen(false);

    } catch (error) {
      console.error('Error creating booking:', error);
      setErrorMessage('Failed to create booking. Please try again.');
    }
  };

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

  // Update navigation links to use same functionality as HomePageLoggedIn
  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home'), highlight: !DonateOpen && !bookingOpen && !volunteerOpen },
    { label: 'DONATE', action: () => setDonateOpen(true), highlight: DonateOpen },
    { label: 'BOOK A SERVICE', action: () => setBookingOpen(true), highlight: bookingOpen },
    { label: 'EVENTS', action: () => handleNavigation('/events'), highlight: false },
    { label: 'BE A VOLUNTEER', action: () => setVolunteerOpen(true), highlight: volunteerOpen },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish'), highlight: false },
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
    setPasswordMessage('');
    // Reset profile to original values
    setProfile(getInitialProfile());
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

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header Section - Same as HomePageLoggedIn */}
      <header className="bg-white shadow-lg border-b-2 border-[#E1D5B8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div 
              className="flex items-center cursor-pointer group transition-transform duration-200 hover:scale-105" 
              onClick={() => handleNavigation('/home')}
            >
              <div className="relative">
                <img 
                  src="/images/sagrada.png" 
                  alt="Sagrada Familia Parish Logo" 
                  className="h-10 w-10 mr-3 transition-transform duration-200 group-hover:rotate-3" 
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-[#6B5F32] hidden sm:block">SagradaGo</span>
                <span className="text-xs text-gray-500 hidden sm:block">Parish Management</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => protectedNavClick(link.action)}
                  className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    link.highlight 
                      ? 'bg-[#E1D5B8] text-[#6B5F32] shadow-md' 
                      : 'text-gray-700 hover:text-[#6B5F32] hover:bg-gray-50'
                  }`}
                >
                  {link.label}
                  {!link.highlight && (
                    <span className="absolute bottom-0 left-1/2 w-0 h-0.5 bg-[#E1D5B8] transition-all duration-200 group-hover:w-full group-hover:left-0"></span>
                  )}
                </button>
              ))}
            </nav>

            {/* Right Section - Logout and Profile */}
            <div className="flex items-center space-x-3">
              {/* Desktop Logout Button */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="hidden lg:flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                SIGN OUT
              </button>

              {/* Profile Button with Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setProfileDropdownOpen(true)}
                onMouseLeave={() => setProfileDropdownOpen(false)}
              >
                <button
                  className="relative group p-1 rounded-full transition-all duration-200 hover:bg-gray-50"
                >
                  <div className="relative">
                    <img
                      src="/images/wired-outline-21-avatar-hover-jumping.webp"
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-[#E1D5B8] transition-all duration-200 group-hover:border-[#6B5F32] group-hover:shadow-lg"
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                </button>

                {/* Profile Dropdown Menu */}
                <div className={`absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 transition-all duration-200 ${
                  profileDropdownOpen ? 'opacity-100 visible transform translate-y-0' : 'opacity-0 invisible transform -translate-y-2'
                }`}>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 hover:text-[#6B5F32] transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Edit Profile
                  </button>
                  <div className="border-t border-gray-100 my-1"></div>
                  <button
                    onClick={() => {
                      setShowLogoutConfirm(true);
                      setProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                    </svg>
                    Logout
                  </button>
                </div>
              </div>

              {/* Mobile Menu Button */}
              <button 
                className="lg:hidden p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <div className="relative w-6 h-6">
                  <span className={`absolute top-1 left-0 w-6 h-0.5 bg-[#6B5F32] transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 top-3' : ''}`}></span>
                  <span className={`absolute top-3 left-0 w-6 h-0.5 bg-[#6B5F32] transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                  <span className={`absolute top-5 left-0 w-6 h-0.5 bg-[#6B5F32] transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 top-3' : ''}`}></span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
            <div className="py-4 space-y-2 bg-gray-50 rounded-b-lg shadow-inner">
              {navLinks.map((link) => (
                <button
                  key={link.label}
                  onClick={() => {
                    protectedNavClick(link.action);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full px-4 py-3 text-left rounded-lg mx-2 transition-colors duration-200 ${
                    link.highlight 
                      ? 'bg-[#E1D5B8] text-[#6B5F32] shadow-md' 
                      : 'text-gray-700 hover:bg-white hover:text-[#6B5F32] hover:shadow-sm'
                  }`}
                >
                  <span className="w-2 h-2 bg-current rounded-full mr-3 opacity-60"></span>
                  {link.label}
                </button>
              ))}
              
              {/* Mobile Profile Link */}
              <button
                onClick={() => {
                  navigate('/profile');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-left rounded-lg mx-2 text-gray-700 hover:bg-white hover:text-[#6B5F32] hover:shadow-sm transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Edit Profile
              </button>

              {/* Mobile Logout Button */}
              <button
                onClick={() => {
                  setShowLogoutConfirm(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-4 py-3 text-left rounded-lg mx-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
                LOGOUT
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Profile Content - Redesigned */}
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#6B5F32] mb-2">My Profile</h1>
            <p className="text-gray-600">Manage your personal information and account settings</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Image Section */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg border border-[#E1D5B8]/30 hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="text-center">
                    <div
                      className={`relative mx-auto mb-4 ${editMode ? 'cursor-pointer' : ''}`}
                      onClick={handleImageClick}
                      onDrop={editMode ? handleDrop : undefined}
                      onDragOver={editMode ? handleDragOver : undefined}
                      onDragLeave={editMode ? handleDragLeave : undefined}
                    >
                      <Avatar
                        src={profileImage}
                        alt="Profile"
                        sx={{ 
                          width: 120, 
                          height: 120, 
                          mx: 'auto',
                          border: dragActive ? '3px dashed #E1D5B8' : '3px solid #E1D5B8',
                          transition: 'all 0.3s ease',
                          boxShadow: dragActive ? '0 8px 25px rgba(107, 95, 50, 0.15)' : '0 4px 15px rgba(0,0,0,0.1)',
                          '&:hover': editMode ? {
                            transform: 'scale(1.05)',
                            boxShadow: '0 8px 25px rgba(107, 95, 50, 0.2)'
                          } : {}
                        }}
                      />
                      {editMode && (
                        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                          <PhotoCamera sx={{ color: 'white', fontSize: 30 }} />
                        </div>
                      )}
                      {editMode && (
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleFileChange}
                        />
                      )}
                    </div>
                    <Typography variant="h6" className="font-semibold text-[#6B5F32] mb-1">
                      {profile.firstName} {profile.lastName}
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mb-4">
                      {profile.email}
                    </Typography>
                    {editMode && (
                      <Typography variant="caption" className="text-gray-400 text-center block">
                        {dragActive ? 'Drop image here' : 'Click to change photo or drag & drop'}
                      </Typography>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Profile Information Section */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border border-[#E1D5B8]/30 hover:shadow-xl transition-shadow duration-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <Typography variant="h6" className="text-[#6B5F32] font-semibold flex items-center">
                      <Person className="mr-2" />
                      Personal Information
                    </Typography>
                    {!editMode && (
                      <Button
                        variant="outlined"
                        onClick={handleEditClick}
                        startIcon={<Edit />}
                        sx={{ 
                          color: '#6B5F32',
                          borderColor: '#E1D5B8',
                          '&:hover': {
                            borderColor: '#6B5F32',
                            backgroundColor: 'rgba(107, 95, 50, 0.04)'
                          }
                        }}
                      >
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <TextField
                      label="First Name"
                      variant="outlined"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ 
                        readOnly: !editMode,
                        startAdornment: !editMode ? <Person sx={{ mr: 1, color: '#6B5F32' }} /> : undefined
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6B5F32',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#6B5F32',
                        },
                      }}
                    />
                    <TextField
                      label="Last Name"
                      variant="outlined"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ 
                        readOnly: !editMode,
                        startAdornment: !editMode ? <Person sx={{ mr: 1, color: '#6B5F32' }} /> : undefined
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6B5F32',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#6B5F32',
                        },
                      }}
                    />
                  </div>

                  <div className="mb-4">
                    <TextField
                      label="Email Address"
                      variant="outlined"
                      name="email"
                      value={profile.email}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ 
                        readOnly: true,
                        startAdornment: <Email sx={{ mr: 1, color: '#6B5F32' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9f9f9',
                        },
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <TextField
                      label="Contact Number"
                      variant="outlined"
                      name="contact"
                      value={profile.contact}
                      onChange={handleChange}
                      fullWidth
                      InputProps={{ 
                        readOnly: !editMode,
                        startAdornment: !editMode ? <Phone sx={{ mr: 1, color: '#6B5F32' }} /> : undefined
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6B5F32',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#6B5F32',
                        },
                      }}
                    />
                    <TextField
                      label="Birthday"
                      variant="outlined"
                      type="date"
                      name="birthday"
                      value={profile.birthday}
                      onChange={handleChange}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      InputProps={{ 
                        readOnly: !editMode,
                        startAdornment: !editMode ? <Cake sx={{ mr: 1, color: '#6B5F32' }} /> : undefined
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          '&.Mui-focused fieldset': {
                            borderColor: '#6B5F32',
                          },
                        },
                        '& .MuiInputLabel-root.Mui-focused': {
                          color: '#6B5F32',
                        },
                      }}
                    />
                  </div>

                  {/* Password Change Section */}
                  {editMode && (
                    <>
                      <Divider sx={{ my: 3 }} />
                      <Typography variant="h6" className="text-[#6B5F32] font-semibold flex items-center mb-4">
                        <Lock className="mr-2" />
                        Change Password
                      </Typography>
                      <Typography variant="body2" className="text-gray-500 mb-4">
                        Leave password fields empty if you don't want to change your password.
                      </Typography>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <TextField
                          label="Current Password"
                          variant="outlined"
                          name="password"
                          type={showOldPassword ? 'text' : 'password'}
                          value={profile.password}
                          onChange={handleChange}
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <Button 
                                onClick={() => setShowOldPassword((v) => !v)} 
                                tabIndex={-1} 
                                size="small"
                                sx={{ minWidth: 'auto', p: 1 }}
                              >
                                {showOldPassword ? <VisibilityOff /> : <Visibility />}
                              </Button>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: '#6B5F32',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#6B5F32',
                            },
                          }}
                        />
                        <TextField
                          label="New Password"
                          variant="outlined"
                          name="confirmPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={profile.confirmPassword}
                          onChange={handleChange}
                          fullWidth
                          InputProps={{
                            endAdornment: (
                              <Button 
                                onClick={() => setShowNewPassword((v) => !v)} 
                                tabIndex={-1} 
                                size="small"
                                sx={{ minWidth: 'auto', p: 1 }}
                              >
                                {showNewPassword ? <VisibilityOff /> : <Visibility />}
                              </Button>
                            )
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              '&.Mui-focused fieldset': {
                                borderColor: '#6B5F32',
                              },
                            },
                            '& .MuiInputLabel-root.Mui-focused': {
                              color: '#6B5F32',
                            },
                          }}
                        />
                      </div>
                      
                      {passwordMessage && (
                        <Alert 
                          severity={passwordMessage.includes('success') ? 'success' : 'error'} 
                          sx={{ mb: 2 }}
                        >
                          {passwordMessage}
                        </Alert>
                      )}
                    </>
                  )}

                  {/* Action Buttons */}
                  {editMode ? (
                    <div className="flex flex-col sm:flex-row gap-3 mt-6">
                      <Button
                        variant="contained"
                        onClick={handleSaveChanges}
                        startIcon={<Save />}
                        fullWidth
                        sx={{
                          bgcolor: '#6B5F32',
                          '&:hover': { bgcolor: '#5a4f2a' },
                          py: 1.5,
                          fontSize: '1rem'
                        }}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={handleCancelEdit}
                        startIcon={<Cancel />}
                        fullWidth
                        sx={{
                          color: '#6B5F32',
                          borderColor: '#E1D5B8',
                          '&:hover': {
                            borderColor: '#6B5F32',
                            backgroundColor: 'rgba(107, 95, 50, 0.04)'
                          },
                          py: 1.5,
                          fontSize: '1rem'
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="mt-6">
                      <Button
                        variant="outlined"
                        onClick={() => setShowLogoutConfirm(true)}
                        fullWidth
                        sx={{
                          color: '#dc2626',
                          borderColor: '#fecaca',
                          '&:hover': {
                            borderColor: '#dc2626',
                            backgroundColor: 'rgba(220, 38, 38, 0.04)'
                          },
                          py: 1.5,
                          fontSize: '1rem'
                        }}
                      >
                        Sign Out
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog 
        open={showLogoutConfirm} 
        onClose={() => setShowLogoutConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#6B5F32', fontWeight: 600 }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowLogoutConfirm(false)} 
            sx={{ color: '#6B5F32' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              setShowLogoutConfirm(false);
              onLogout();
            }} 
            variant="contained"
            sx={{
              bgcolor: '#dc2626',
              '&:hover': { bgcolor: '#b91c1c' }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm Edit Dialog */}
      <Dialog 
        open={showConfirm} 
        onClose={() => setShowConfirm(false)}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          }
        }}
      >
        <DialogTitle sx={{ color: '#6B5F32', fontWeight: 600 }}>
          Edit Profile
        </DialogTitle>
        <DialogContent>
          <Typography>
            You're about to edit your profile information. Make sure to save your changes when you're done.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setShowConfirm(false)}
            sx={{ color: '#6B5F32' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmEdit} 
            variant="contained"
            sx={{
              bgcolor: '#6B5F32',
              '&:hover': { bgcolor: '#5a4f2a' }
            }}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Modal Components from HomePageLoggedIn */}
      {/* Donation Modal */}
      <CardPopup open={DonateOpen} onClose={() => setDonateOpen(false)} title="Make a Donation">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Support our parish by making a donation. Your generosity helps us continue our mission.
          </Typography>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Enter Amount"
            variant="outlined"
            value={amount === '0' || amount === '' ? '' : `${(parseFloat(amount) || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            onChange={(e) => {
              const input = e.target.value;
              const digitsOnly = input.replace(/[^\d]/g, '');
              
              if (digitsOnly === '') {
                setAmount('');
                return;
              }
              
              const numericValue = parseInt(digitsOnly, 10) / 100;
              
              if (numericValue <= 99999999.99) {
                setAmount(numericValue.toFixed(2));
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace') {
                e.preventDefault();
                const currentAmount = parseFloat(amount) || 0;
                const cents = Math.floor(currentAmount * 100);
                const newCents = Math.floor(cents / 10);
                const newAmount = newCents / 100;
                setAmount(newCents === 0 ? '' : newAmount.toFixed(2));
              }
            }}
            fullWidth
            autoFocus
            InputProps={{
              startAdornment: <InputAdornment position="start">₱</InputAdornment>,
            }}
            inputProps={{
              inputMode: 'numeric',
              style: { textAlign: 'right' }
            }}
            placeholder="0.00"
          />
          <TextField
            label="Enter Donation Intercession (Optional)"
            variant="outlined"
            type="text"
            value={donationIntercession}
            onChange={(e) => setDonationIntercession(e.target.value)}
            fullWidth
          />
          <Button 
            variant="contained" 
            fullWidth 
            onClick={handleDonate}
            sx={{ bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
          >
            Confirm Donation
          </Button>
        </Box>
      </CardPopup>

      {/* Booking Modal */}
      <CardPopup open={bookingOpen} onClose={() => setBookingOpen(false)} title="Book a Sacrament">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2, maxHeight: '70vh', overflowY: 'auto' }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Reserve a date and time for your chosen sacrament below.
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Select Sacrament</InputLabel>
            <Select
              value={selectedSacrament}
              onChange={(e) => setSelectedSacrament(e.target.value)}
              label="Select Sacrament"
            >
              <MenuItem value="Wedding">Wedding</MenuItem>
              <MenuItem value="Baptism">Baptism</MenuItem>
              <MenuItem value="Confession">Confession</MenuItem>
              <MenuItem value="Anointing of the Sick">Anointing of the Sick</MenuItem>
              <MenuItem value="First Communion">First Communion</MenuItem>
              <MenuItem value="Burial">Burial</MenuItem>
            </Select>
          </FormControl>
          {selectedSacrament && (
            <>
              <Typography variant="h6" sx={{ mt: 1 }}>
                Selected Sacrament: {selectedSacrament}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                You may book {selectedSacrament} services from {getMinimumBookingDate(selectedSacrament)} onwards. 
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Price for {selectedSacrament} service: ₱{getSacramentPrice(selectedSacrament).toLocaleString()} 
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={date}
                  onChange={setDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <TimePicker
                  label="Select Time"
                  value={time}
                  onChange={setTime}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <TextField
                fullWidth
                label="Number of People"
                type="number"
                value={pax}
                onChange={(e) => setPax(e.target.value)}
                inputProps={{ min: 1 }}
                required
              />
              
              {/* Document components */}
              {selectedSacrament === 'Wedding' ? (
                <WeddingDocuments
                  weddingForm={weddingForm}
                  setWeddingForm={setWeddingForm}
                />
              ) : selectedSacrament === 'Baptism' ? (
                <BaptismDocuments
                  baptismForm={baptismForm}
                  setBaptismForm={setBaptismForm}
                />
              ) : selectedSacrament === 'Burial' ? (
                <BurialDocuments
                  burialForm={burialForm}
                  setBurialForm={setBurialForm}
                />
              ) : null}
              {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
              <Button
                variant="contained"
                fullWidth
                onClick={handleBooking}
                sx={{ mt: 2, bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
              >
                Request Booking
              </Button>
            </>
          )}
        </Box>
      </CardPopup>

      {/* Volunteer Modal */}
      <CardPopup open={volunteerOpen} onClose={() => setVolunteerOpen(false)} title="Become a Volunteer">
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, p: 2 }}>
          <Typography variant="h5" gutterBottom>
            Want to make a difference? Join our volunteer team!
          </Typography>
          {!isVolunteer ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsVolunteer(true);
                alert('You are now a registered volunteer!');
              }}
              sx={{ width: '250px', bgcolor: '#E1D5B8', '&:hover': { bgcolor: '#d1c5a8' } }}
            >
              Sign Up as Volunteer
            </Button>
          ) : (
            <Typography variant="body1">Thank you for volunteering!</Typography>
          )}
        </Box>
      </CardPopup>

      {/* Footer - Keep existing footer */}
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
                    onClick={() => setDonateOpen(true)}
                    className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Donate
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setBookingOpen(true)}
                    className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Book a Service
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
                    onClick={() => setVolunteerOpen(true)}
                    className="text-gray-600 hover:text-[#6B5F32] transition-colors duration-200 flex items-center"
                  >
                    <span className="mr-2">→</span>
                    Be a Volunteer
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