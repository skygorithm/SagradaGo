import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Box, TextField, Typography, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { DatePicker, TimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import CardPopup from './CardPopUp.jsx';
import Chatbot from '../components/Chatbot.jsx';
import { styled } from '@mui/material/styles';
import { supabase } from '../config/supabase';
import { FiCamera, FiUpload } from 'react-icons/fi';
import { BiSolidImageAlt } from 'react-icons/bi';
import { getMinimumBookingDate, restrictSacramentBooking } from '../utils/sacramentBookingRestriction.jsx';
import WeddingDocuments from '../components/sacrament-documents/wedding-documents.jsx';
import blobUrlToFile from '../utils/blobUrlToFile.jsx';
import BaptismDocuments from '../components/sacrament-documents/baptism-documents.jsx';
import BurialDocuments from '../components/sacrament-documents/burial-documents.jsx';
import burialFormValidation from '../utils/form-validations/burialFormValidation.jsx';
import baptismFormValidation from '../utils/form-validations/baptismFormValidation.jsx';
import saveSpecificSacramentDocument from '../utils/form-functions/saveSpecificSacramentDocument.jsx';
import { NoAdultContentOutlined } from '@mui/icons-material';
import weddingFormValidation from '../utils/form-validations/weddingFormValidation.jsx';
import saveWeddingDocument from '../utils/form-functions/saveWeddingDocument.jsx';
import { getSacramentPrice } from '../information/getSacramentPrice.jsx';
import isUserLoggedIn from '../utils/isUserLoggedIn.jsx';

// Styled components
const FeatureCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-10px)',
  },
}));

// Used for converting Blob to Image File


const HomePageLoggedIn = ({ onLogout }) => {
  const navigate = useNavigate();

  const [amount, setAmount] = useState('');
  const [donationIntercession, setDonationIntercession] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [DonateOpen, setDonateOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedSacrament, setSelectedSacrament] = useState('');
  const [date, setDate] = useState(null);
  const [time, setTime] = useState(null);
  const [pax, setPax] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [volunteerOpen, setVolunteerOpen] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  // For Uploaded Document Images
  const [residentForm, setResidentForm] = useState({
    id: null,
  });

  const [isIDProcessing, setIsIDProcessing] = useState(false);
  const hiddenInputRef1 = useRef(null);

  // For Baptism Document Variables
  // Naka json na lang so all data will be stored in one state
  const [baptismForm, setBaptismForm] = useState({
    main_godfather: {},
    main_godmother: {},
    additional_godparents: [],
  });

  // For Burial Document Variables
  const [burialForm, setBurialForm] = useState({
    funeral_mass: false,
    death_anniversary: false,
    funeral_blessing: false,
    tomb_blessing: false,
  });

  // For Wedding Document Variables
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
  // individually initializing them is much faster, and more performance goods
  const hiddenGroomRef = useRef(null);
  const hiddenBrideRef = useRef(null);


  // Check authentication on mount
  // useEffect(() => {
  //   const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  //   if (!isAuthenticated) {
  //     navigate('/');
  //   }
  // }, [navigate]);
  //  useEffect(() => {
  //   async function checkLoginStatus() {
  //     const isLoggedIn = await isUserLoggedIn();
  //     console.log("Is user logged in? ", isLoggedIn);
  //     if (!isLoggedIn) {
  //       navigate('/');
  //     }
  //   }
  //   checkLoginStatus();
  // }, []);

  // Navigation links for logged-in users
  const navLinks = [
    { label: 'HOME', action: () => handleNavigation('/home'), highlight: !DonateOpen && !bookingOpen && !volunteerOpen },
    { label: 'DONATE', action: () => setDonateOpen(true), highlight: DonateOpen },
    { label: 'BOOK A SERVICE', action: () => setBookingOpen(true), highlight: bookingOpen },
    { label: 'EVENTS', action: () => handleNavigation('/events'), highlight: false },
    { label: 'BE A VOLUNTEER', action: () => setVolunteerOpen(true), highlight: volunteerOpen },
    { label: 'VIRTUAL TOUR', action: () => handleNavigation('/explore-parish'), highlight: false },
    { label: 'LOGOUT', action: onLogout, highlight: false }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);
  const handleBooking = async () => {
    if (!selectedSacrament || !date || !time || !pax) {
      setErrorMessage('Please select a sacrament, date, time, and number of people.');
      return;
    }
    // if (residentForm.id === null) {
    //   setErrorMessage('Please upload the required document image.');
    //   return;
    // }
    // Confession - pwedeng 2 days 
    // Wedding - 6 months
    // Burial mass - 2-3 days since biglaan talaga
    // Baptism - 1 & ½ month
    // Confirmation - 2 months
    // Communion - 2 months
    let restriction = restrictSacramentBooking(selectedSacrament, date);
    if (restriction !== '') {
      setErrorMessage(restriction);
      return;
    }

    try {
      // Get the current user's ID
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
      // Format date as YYYY-MM-DD
      const datePart = datenow.toLocaleDateString().replace(/\//g, '-');
      // Format time as HH-MM-SS
      const timePart = datenow
      .toLocaleTimeString('en-US', { hour12: false });
      datenow = `${datePart}_${timePart}`; // Combine date and time for file path compatibility
      
      // const file = await blobUrlToFile(residentForm.id, `${username}.png`);
      // const filePath = `private/${selectedSacrament}/${datenow}_${file.name}`;
      // if (!file || !(file instanceof File)) {
      //   setErrorMessage('Failed to prepare document file for upload. Please try again.');
      //   return;
      // }

      // Asikasuhin ang mga Specific Documents based on the sacrament
      let specificDocumentTable = {
        date_created: new Date().toISOString(),
      }
      if (selectedSacrament === 'Wedding') {
        // Double check if required fields are filled
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
        
        // Upload IDs

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
        // Double check if required fields are filled
        const validateResult = baptismFormValidation(cachedUserData, baptismForm, setErrorMessage);
        // add the form values in specificDocumentTable to be put sa database
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


      // // Upload the file first on the Supabase storage
      // const { data: storageData, error: storageError } = await supabase.storage
      //   .from('booking-documents')
      //   .upload(filePath, file);

      // if (storageError) {
      //   console.error('Upload error:', storageError.message);
      //   setErrorMessage('Server Failed to upload the document. Please try again.');
      //   return;
      // } else {
      //   console.log('Upload successful:', storageData.path);
      // }

      // // Get the public URL of the uploaded file to be stored in the database
      // const { data: publicUrlData } = supabase
      //   .storage
      //   .from('booking-documents')
      //   .getPublicUrl(filePath);

      // const fileUrl = publicUrlData?.publicUrl;

      // Generate a transaction ID
      const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      // Insert the booking into the database
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
        // document: fileUrl,
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

  const handleDonate = async () => {
    if (amount === '' || isNaN(amount) || parseFloat(amount) <= 0) {
      setErrorMessage('Please enter a valid donation amount.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
      
    if (!user) {
      setErrorMessage('You must be logged in to make a booking.');
      return;
    }
    
    const donationData = {
      donation_amount: parseFloat(amount),
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

    alert(`Thank you! You have donated PHP ${amount}`);
    setAmount('');
    setDonateOpen(false);
    // set the donation thingy
    navigate('/home');
  };

  const features = [
    {
      title: 'Book Sacrament',
      description: 'Book your sacrament here.',
      action: () => setBookingOpen(true)
    },
    {
      title: 'Online Donations',
      description: 'Support our parish through secure online donations.',
      action: () => setDonateOpen(true)
    },
    {
      title: 'Volunteer Programs',
      description: 'Join our community of volunteers and make a difference.',
      action: () => setVolunteerOpen(true)
    },
    {
      title: 'Virtual Tour',
      description: 'Explore our beautiful church through a virtual tour.',
      action: () => handleNavigation('/explore-parish')
    },
  ];

  // const handleUploadID = (event, def=true, inputRef = null) => {
  //   if (def) {
  //     hiddenInputRef1.current.click();
  //   } else {
  //     inputRef.current.click();
  //   }
  // };

  // const handleChangeID = async (event, resident=true, setForm = null) => {
  //     const fileUploaded = event.target.files[0];
  //     if (fileUploaded) {
  //       setIsIDProcessing(true);
  //       try {
  //         const url = URL.createObjectURL(fileUploaded);
  //         if (resident) {
  //           setResidentForm((prev) => ({ ...prev, id: url }));
  //         } else {
  //           setForm((prev => ({ ...prev, id: url })));
  //         }
  //       } catch (error) {
  //         console.error("Error removing background:", error);
  //       } finally {
  //         setIsIDProcessing(false);
  //       }
  //     }
  // };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center cursor-pointer" onClick={() => handleNavigation('/home')}>
            <img 
              src="/images/sagrada.png" 
              alt="Sagrada Familia Parish Logo" 
              className="h-12 w-12 mr-2" 
              style={{ background: 'transparent' }}
            />
            <span className="text-2xl font-bold text-[#E1D5B8] hidden sm:block">SagradaGo</span>
          </div>
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              link.label === 'LOGOUT' ? (
                <button
                  key={link.label}
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded px-4 py-2 hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`text-black hover:text-[#E1D5B8] relative group transition-colors duration-200${
                    link.highlight ? ' text-[#E1D5B8] underline underline-offset-4' : ''
                  }`}
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
                  onClick={() => setShowLogoutConfirm(true)}
                  className="block w-full text-left p-2 text-white bg-[#E1D5B8] border border-[#E1D5B8] rounded hover:bg-[#d1c5a8] hover:text-black transition-colors duration-200"
                >
                  {link.label}
                </button>
              ) : (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`block w-full text-left p-2 text-black hover:text-[#E1D5B8]${
                    link.highlight ? ' text-[#E1D5B8] underline underline-offset-4' : ''
                  }`}
                >
                  {link.label}
                </button>
              )
            ))}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[500px] w-full overflow-hidden">
          <img 
            src="/images/SAGRADA-FAMILIA-PARISH.jpg"
            alt="Church Community"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="relative h-full flex items-center">
            <div className="container mx-auto px-6">
              <div className="max-w-2xl text-white">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Simplifying Church <br />
                  Management & Engagement
                </h1>
                <p className="text-lg md:text-xl mb-8">
                  The Society has built a new, mature, strategic structure, and kept up-to-date
                  with success across all the past year
                </p>
                <button 
                  onClick={() => setBookingOpen(true)}
                  className="px-8 py-3 bg-[#E1D5B8] text-black rounded-lg hover:bg-opacity-90 text-lg transition-all hover:scale-105"
                >
                  Book now
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features/Services Section */}
        <section className="py-8">
          <Box maxWidth="lg" sx={{ mx: 'auto' }}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ color: '#333', mb: 6, fontWeight: 'bold' }}
            >
              Our Services
            </Typography>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <FeatureCard onClick={feature.action}>
                    <CardContent sx={{ flexGrow: 1, bgcolor: 'white' }}>
                      <Typography gutterBottom variant="h5" component="h3" sx={{ color: '#6B5F32', fontWeight: 'bold' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </FeatureCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        </section>

        {/* Join Community Section */}
        <section className="py-8 bg-gray-100">
          <Box maxWidth="md" sx={{ mx: 'auto' }}>
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ color: '#333', mb: 4, fontWeight: 'bold' }}
            >
              Join Our Community
            </Typography>
            <Typography
              variant="h6"
              align="center"
              color="text.secondary"
              paragraph
              sx={{ mb: 4 }}
            >
              Be part of our growing parish family. Connect with fellow parishioners,
              participate in church activities, and strengthen your faith journey with us.
            </Typography>
            <Box sx={{ textAlign: 'center' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => setVolunteerOpen(true)}
                sx={{ bgcolor: '#E1D5B8', color: 'black', px: 4, py: 1.5, fontSize: '1.1rem', '&:hover': { bgcolor: '#d4c4a1' } }}
              >
                Become a Volunteer
              </Button>
            </Box>
          </Box>
        </section>
      </main>

      {/* Footer Section */}
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

      {/* Modals and Popups */}
      <CardPopup open={DonateOpen} onClose={() => setDonateOpen(false)} title="Make a Donation">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Support our parish by making a donation. Your generosity helps us continue our mission.
          </Typography>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <TextField
            label="Enter Amount"
            variant="outlined"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            fullWidth
            autoFocus
          />
          <TextField
            label="Enter Donation Intercession (Optional)"
            variant="outlined"
            type="text"
            value={donationIntercession}
            onChange={(e) => setDonationIntercession(e.target.value)}
            fullWidth
            autoFocus
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

      <CardPopup open={bookingOpen} onClose={() => setBookingOpen(false)} title="Book a Sacrament">
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2,  maxHeight: '70vh', overflowY: 'auto' }}>
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
              {/* Upload File */}
              {/* <div className="upload-box">
                <input
                  onChange={handleChangeID}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  ref={hiddenInputRef1}
                />

                <div className="upload-content">
                  <b>
                    Upload Required Document Image:
                  </b>
                  <div className="preview-container">
                    {isIDProcessing ? (
                      <p>Processing...</p>
                    ) : residentForm.id ? (
                      <div className="flex flex-col items-center my-2 p-2 bg-white rounded-lg border">
                        <img src={residentForm.id} className="upload-img" />
                      </div>
                    ) : (
                      <div className="flex flex-col items-center my-2 p-2 bg-white rounded-lg border">
                        <BiSolidImageAlt className="w-6 h-6" />
                        <p>Attach Image</p>
                      </div>
                    )}
                  </div>

                  <div 
                    className="upload-picture-btn "
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    <button 
                      onClick={handleUploadID} 
                      className="upload-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "4px 8px",
                        backgroundColor: "#E1D5B8",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "14px",
                      }}
                    >
                      Upload <FiUpload style={{ marginLeft: "0.5rem" }} />
                    </button>
                  </div>
                </div>
              </div> */}
              {/* More Requests */}
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
              ) : null
              }
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

      {/* Chatbot and Logout Confirmation */}
      <Chatbot />
      <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>Are you sure you want to log out?</DialogContent>
        <DialogActions>
          <Button onClick={() => setShowLogoutConfirm(false)} sx={{ color: '#6B5F32' }}>No</Button>
          <Button onClick={() => { setShowLogoutConfirm(false); onLogout(); }} autoFocus sx={{ color: '#6B5F32' }}>Yes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default HomePageLoggedIn;