    import React, { useState, useEffect } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { supabase } from '../config/supabase';
    import { useAdminAuth } from '../context/AdminAuthContext';
    import {
      Box,
      Button,
      Container,
      Typography,
      Paper,
      Table,
      TableBody,
      TableCell,
      TableContainer,
      TableHead,
      TableRow,
      Dialog,
      DialogTitle,
      DialogContent,
      DialogActions,
      TextField,
      Alert,
      CircularProgress,
      Grid,
      IconButton,
      Tooltip,
      Card,
      CardContent,
      Tabs,
      Tab,
      TablePagination,
      InputAdornment,
      Menu,
      MenuItem,
      Checkbox,
      FormControlLabel,
      Chip,
      Autocomplete,
      FormControl,
      Select,
      Divider,
      useMediaQuery,
      useTheme,
      Drawer,
    } from '@mui/material';
    import MenuIcon from '@mui/icons-material/Menu';
    import EditIcon from '@mui/icons-material/Edit';
    import DeleteIcon from '@mui/icons-material/Delete';
    import AddIcon from '@mui/icons-material/Add';
    import HistoryIcon from '@mui/icons-material/History';
    import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
    import SearchIcon from '@mui/icons-material/Search';
    import FilterListIcon from '@mui/icons-material/FilterList';
    import ViewColumnIcon from '@mui/icons-material/ViewColumn';
    import SaveAltIcon from '@mui/icons-material/SaveAlt';
    import AnalyticsIcon from '@mui/icons-material/Analytics';
    import BookingsIcon from '@mui/icons-material/EventNote';
    import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
    import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
    import { ChurchOutlined, TableChart } from '@mui/icons-material';
    import { applyFilters } from '../utils/admin-functions/applyFilters';
    import { handleChangeRowsPerPage, handleColumnClick, handleColumnToggle, handleFilterClick } from '../utils/admin-functions/handleFilterOptions';
    import exportToCSV from '../utils/admin-functions/exportToCSV';
    import AdminSacramentDialog from '../components/dialog/AdminSacramentDialog';
    import { handleSacramentSave, handleSave } from '../utils/admin-functions/handleSave';
    import getDisplaySacrament from '../utils/admin-functions/displaySacrament';
    import { BarChartLegend, PieChartLegend } from '../components/ChartLegends';
    import { handleAdd, handleSacramentAdd } from '../utils/admin-functions/handleAdd';
    import { handleEdit, handleSacramentEdit } from '../utils/admin-functions/handleEdit';
    import { handleCloseDialog, handleCloseSacramentDialog } from '../utils/admin-functions/handleCloseDialog';
    import { formatDisplayValue } from '../utils/admin-functions/formatDatabaseValue';
    import SacramentFormCard from '../components/SacramentForms';
    import fetchSacramentForms from '../utils/admin-functions/fetch-documents/fetchSacramentForms';
    import BaptismSacramentForm from '../components/sacramentFormsSpecific/BaptismSacramentForm';
    import BurialSacramentForm from '../components/sacramentFormsSpecific/BurialSacramentForm';
    import deleteSacramentDocuments from '../utils/admin-functions/delete-documents/deleteSacramentDocuments';
    import restoreSacramentDocuments from '../utils/admin-functions/delete-documents/restoreSacramentDocuments';
    import permanentlyDeleteSacramentDocuments from '../utils/admin-functions/delete-documents/permanentlyDeleteSacramentDocuments';
    import WeddingSacramentForm from '../components/sacramentFormsSpecific/WeddingSacramentForm';
    
    // Field name mapping for better display
    const getFieldDisplayName = (fieldName) => {
      const fieldMapping = {
        // User fields - Remove "User" prefix since table context is clear
        'user_firstname': 'First Name',
        'user_middle': 'Middle Name',
        'user_lastname': 'Last Name',
        'user_gender': 'Gender',
        'user_email': 'Email',
        'user_mobile': 'Mobile',
        'user_bday': 'Birthday',
        
        // Admin fields - Remove "Admin" prefix since table context is clear
        'admin_firstname': 'First Name',
        'admin_lastname': 'Last Name',
        'admin_email': 'Email',
        'admin_mobile': 'Mobile',
        'admin_bday': 'Birthday',
        
        // Priest fields - Remove "Priest" prefix since table context is clear
        'priest_name': 'Name',
        'priest_diocese': 'Diocese',
        'priest_parish': 'Parish',
        'priest_availability': 'Availability',
        
        // Donation fields - Remove redundant prefixes
        'donation_amount': 'Amount',
        'donation_intercession': 'Intercession',
        'date_created': 'Date Created',
        
        // Request fields - Remove redundant prefixes and improve naming
        'request_baptismcert': 'Baptism Certificate',
        'request_confirmationcert': 'Confirmation Certificate',
        'document_id': 'Document ID',
        
        // Document fields - Clean and consistent naming
        'firstname': 'First Name',
        'middle': 'Middle Name',
        'lastname': 'Last Name',
        'gender': 'Gender',
        'mobile': 'Mobile',
        'bday': 'Birthday',
        'marital_status': 'Marital Status',
        'baptismal_certificate': 'Baptismal Certificate',
        'confirmation_certificate': 'Confirmation Certificate',
        'wedding_certificate': 'Wedding Certificate',
        
        // Booking fields - Remove "booking" prefix where redundant
        'booking_status': 'Status',
        'booking_sacrament': 'Sacrament',
        'booking_date': 'Date',
        'booking_time': 'Time',
        'booking_pax': 'Participants',
        'booking_transaction': 'Transaction ID',
        'price': 'Price',
        'paid': 'Paid',
      };
      
      return fieldMapping[fieldName] || fieldName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

export default getFieldDisplayName;