import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TablePagination,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Autocomplete,
  Chip,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  InputLabel,
  FormHelperText,
  useTheme,
  useMediaQuery,
  Drawer,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
  SaveAlt as SaveAltIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  TableChart,
  Menu as MenuIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";

import {
  handleFilterClick,
  handleColumnClick,
  handleColumnToggle,
  handleChangeRowsPerPage,
} from "../../utils/admin-functions/handleFilterOptions";
import exportToCSV from "../../utils/admin-functions/exportToCSV";
import { formatDisplayValue } from "../../utils/admin-functions/formatDatabaseValue";
import { TABLE_STRUCTURES } from "../../config/tableConfig";
import { applyFilters } from "../../utils/admin-functions/applyFilters";
import { supabase } from "../../config/supabase";
import blobUrlToFile from "../../utils/blobUrlToFile";

const CERT_FIELDS = [
  "baptismal_certificate",
  "confirmation_certificate",
  "wedding_certificate",
];

const getFieldDisplayName = (fieldName) => {
  const map = {
    firstname: "First Name",
    middle: "Middle Name",
    lastname: "Last Name",
    gender: "Gender",
    mobile: "Mobile Number",
    bday: "Birthday",
    marital_status: "Marital Status",
    baptismal_certificate: "Baptismal Certificate",
    confirmation_certificate: "Confirmation Certificate",
    wedding_certificate: "Wedding Certificate",
    address: "Address",
    email: "Email",
    request_type: "Request Type",
    status: "Status",
    created_at: "Created At",
    updated_at: "Updated At",
  };
  return (
    map[fieldName] ||
    fieldName.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

const getFieldInputType = (fieldName) => {
  const typeMap = {
    firstname: "text",
    middle: "text",
    lastname: "text",
    gender: "select",
    mobile: "tel",
    bday: "date",
    marital_status: "select",
    address: "text",
    email: "email",
    request_type: "select",
    status: "select",
    created_at: "datetime-local",
    updated_at: "datetime-local",
  };
  
  return typeMap[fieldName] || "text";
};

const formatPhilippineMobile = (value) => {
  if (!value) return value;
  
  const digits = value.replace(/\D/g, '');
  
  if (digits.startsWith('09') && digits.length >= 10) {
    if (digits.length <= 11) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    }
  }
  
  if (digits.startsWith('63') && digits.length >= 11) {
    if (digits.length <= 12) {
      return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
  }
  
  if (digits.length >= 10) {
    if (digits.length <= 11) {
      return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
    } else if (digits.length <= 12) {
      return `+63 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
  }
  
  return digits;
};

const getSelectOptions = (fieldName, users) => {
  const optionsMap = {
    gender: [
      { value: "Male", label: "Male" },
      { value: "Female", label: "Female" },
      { value: "Other", label: "Other" },
    ],
    marital_status: [
      { value: "Single", label: "Single" },
      { value: "Married", label: "Married" },
      { value: "Widowed", label: "Widowed" },
      { value: "Divorced", label: "Divorced" },
      { value: "Separated", label: "Separated" },
      { value: "Annulled", label: "Annulled" },
    ],
    request_type: [
      { value: "Baptismal", label: "Baptismal Certificate" },
      { value: "Confirmation", label: "Confirmation Certificate" },
      { value: "Marriage", label: "Marriage Certificate" },
    ],
    status: [
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "completed", label: "Completed" },
      { value: "cancelled", label: "Cancelled" },
    ],
  };

  if (fieldName === "user_id" && users.length > 0) {
    return users.map(user => ({
      value: user.id,
      label: `${user.firstname} ${user.lastname}`
    }));
  }

  return optionsMap[fieldName] || [];
};

async function uploadFileToStorage(file, field) {
  if (!(file instanceof File)) {
    throw new Error("File upload expected a File object.");
  }
  const ext = file.name.split(".").pop();
  const filePath = `${field}_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage
    .from("certificates")
    .upload(filePath, file, { upsert: true });
  if (error) throw new Error("Upload error: " + error.message);
  const { data } = supabase.storage.from("certificates").getPublicUrl(filePath);
  return data.publicUrl;
}

function isImageUrl(url = "") {
  if (!url || typeof url !== "string") return false;
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(url.split("?")[0]);
}

const downloadImage = async (imageUrl, filename) => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'certificate_image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert('Failed to download image');
  }
};

const removeImageFromStorage = async (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const fileName = pathParts[pathParts.length - 1];
    
    const { error } = await supabase.storage
      .from("certificates")
      .remove([fileName]);
      
    if (error) {
      console.error('Error removing file from storage:', error);
    }
  } catch (error) {
    console.error('Error parsing URL or removing file:', error);
  }
};

const enhancedApplyFilters = ({
  tableData,
  searchQuery,
  activeFilters,
  sortConfig,
  setFilteredData,
  calculateTableStats,
}) => {
  let filtered = [...tableData];

  if (searchQuery && searchQuery.trim()) {
    filtered = filtered.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }

  Object.entries(activeFilters).forEach(([field, filter]) => {
    if (!filter.value) return;

    filtered = filtered.filter((item) => {
      const fieldValue = item[field];
      const filterValue = filter.value.toLowerCase();
      const itemValue = (fieldValue || "").toString().toLowerCase();

      switch (filter.type) {
        case "contains":
          return itemValue.includes(filterValue);
        case "equals":
          return itemValue === filterValue;
        case "starts":
          return itemValue.startsWith(filterValue);
        case "ends":
          return itemValue.endsWith(filterValue);
        case "greater":
          return parseFloat(fieldValue) > parseFloat(filter.value);
        case "less":
          return parseFloat(fieldValue) < parseFloat(filter.value);
        case "older_to_newer":
          return true;
        case "newer_to_older":
          return true;
        case "a_to_z":
          return true;
        case "z_to_a":
          return true;
        default:
          return true;
      }
    });
  });

  Object.entries(activeFilters).forEach(([field, filter]) => {
    if (!filter.value) return;

    switch (filter.type) {
      case "older_to_newer":
        filtered.sort((a, b) => new Date(a[field]) - new Date(b[field]));
        break;
      case "newer_to_older":
        filtered.sort((a, b) => new Date(b[field]) - new Date(a[field]));
        break;
      case "a_to_z":
        filtered.sort((a, b) => {
          const aVal = (a[field] || "").toString().toLowerCase();
          const bVal = (b[field] || "").toString().toLowerCase();
          return aVal.localeCompare(bVal);
        });
        break;
      case "z_to_a":
        filtered.sort((a, b) => {
          const aVal = (a[field] || "").toString().toLowerCase();
          const bVal = (b[field] || "").toString().toLowerCase();
          return bVal.localeCompare(aVal);
        });
        break;
      default:
        break;
    }
  });

  setFilteredData(filtered);
  if (calculateTableStats) {
    calculateTableStats(filtered);
  }
};

const ManagementTablesView = ({
  tables,
  selectedTable,
  handleTableSelect,
  tableData,
  filteredData,
  setFilteredData,
  searchQuery,
  setSearchQuery,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  visibleColumns,
  setVisibleColumns,
  tableStats,
  calculateTableStats,
  activeFilters,
  setActiveFilters,
  filterAnchorEl,
  setFilterAnchorEl,
  columnAnchorEl,
  setColumnAnchorEl,
  handleAdd,
  handleEdit,
  handleDelete,
  loading,
  setFormData,
  setEditingRecord,
  users,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRecordLocal, setEditingRecordLocal] = useState(null);
  const [formState, setFormState] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fields = TABLE_STRUCTURES[selectedTable]?.fields || [];

  const displayData = useMemo(() => {
    if (selectedTable === "document_tbl") {
      return [...filteredData].sort((a, b) => {
        const imgCount = (row) =>
          CERT_FIELDS.filter(fld => isImageUrl(row[fld])).length;
        return imgCount(b) - imgCount(a);
      });
    }
    return filteredData;
  }, [filteredData, selectedTable]);

  const openFilterMenu = (e) => handleFilterClick(e, setFilterAnchorEl);
  const openColumnMenu = (e) => handleColumnClick(e, setColumnAnchorEl);

  const onSearchChange = (_, newValue) => {
    setSearchQuery(newValue);
    enhancedApplyFilters({
      tableData,
      searchQuery: newValue,
      activeFilters,
      sortConfig,
      setFilteredData,
      calculateTableStats,
    });
  };

  function handleDialogOpen(record = null) {
    setEditingRecordLocal(record);
    setOpenDialog(true);
    
    const initialFormState = {};
    if (record) {
      fields.forEach(field => {
        if (field === 'mobile') {
          initialFormState[field] = formatPhilippineMobile(record[field]);
        } else {
          initialFormState[field] = record[field] || '';
        }
      });
    } else {
      fields.forEach(field => {
        initialFormState[field] = '';
      });
    }
    
    setFormState(initialFormState);
    setError("");
  }

  function handleDialogClose() {
    setOpenDialog(false);
    setEditingRecordLocal(null);
    setFormState({});
    setError("");
  }

  const handleFileChange = async (e, field) => {
    let file = e.target.files[0];
    if (!file) return;
    if (!(file instanceof File)) {
      file = await blobUrlToFile(URL.createObjectURL(file), `${field}_${Date.now()}.png`);
    }
    try {
      const publicUrl = await uploadFileToStorage(file, field);
      setFormState(prev => ({ ...prev, [field]: publicUrl }));
    } catch (e) {
      setError("Upload failed: " + e.message);
    }
  };

  const handleRemoveImage = async (field) => {
    if (window.confirm("Are you sure you want to remove this image?")) {
      try {
        if (formState[field] && isImageUrl(formState[field])) {
          await removeImageFromStorage(formState[field]);
        }
        
        setFormState(prev => ({ ...prev, [field]: null }));
      } catch (error) {
        console.error("Error removing image:", error);
        setFormState(prev => ({ ...prev, [field]: null }));
      }
    }
  };

  const handleDownloadFromPreview = (imageUrl) => {
    const filename = `certificate_${Date.now()}.jpg`;
    downloadImage(imageUrl, filename);
  };

  const handleMobileChange = (e, field) => {
    const rawValue = e.target.value;
    const formattedValue = formatPhilippineMobile(rawValue);
    setFormState(prev => ({ ...prev, [field]: formattedValue }));
  };

  const validatePhilippineMobile = (value) => {
    if (!value) return false;
    const digits = value.replace(/\D/g, '');
    
    if (digits.length === 11 && digits.startsWith('09')) {
      return /^\d{11}$/.test(digits) && /^09[0-6]\d{8}$/.test(digits);
    }
    
    if (digits.length === 12 && digits.startsWith('63')) {
      return /^\d{12}$/.test(digits) && /^63[0-9]\d{9}$/.test(digits);
    }
    
    return false;
  };

  function handleFormFieldChange(field, val) {
    setFormState(prev => ({ ...prev, [field]: val }));
  }

  const handleSaveRecord = async () => {
    if (!selectedTable || !formState) return;
    
    setSaving(true);
    setError("");

    try {
      const saveData = { ...formState };
      if (saveData.mobile) {
        saveData.mobile = saveData.mobile.replace(/\D/g, '');
      }

      if (editingRecordLocal) {
        const { error } = await supabase
          .from(selectedTable)
          .update(saveData)
          .eq('id', editingRecordLocal.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from(selectedTable)
          .insert([saveData]);
        
        if (error) throw error;
      }

      handleTableSelect(selectedTable);
      handleDialogClose();
    } catch (error) {
      setError("Save failed: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  function localHandleFilterChange(field, value, type) {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: { value, type },
    }));
    enhancedApplyFilters({
      tableData,
      searchQuery,
      activeFilters: {
        ...activeFilters,
        [field]: { value, type },
      },
      sortConfig,
      setFilteredData,
      calculateTableStats,
    });
  }

  const inputComponent = (field) => {
    const inputType = getFieldInputType(field);
    const options = getSelectOptions(field, users);
    const isCertificateField = CERT_FIELDS.includes(field);
    const currentValue = formState[field];

    if (isCertificateField) {
      return (
        <>
          {currentValue && isImageUrl(currentValue) && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Current {getFieldDisplayName(field)}:
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <img
                  alt={field}
                  src={currentValue}
                  style={{
                    width: 100,
                    height: 100,
                    objectFit: "cover",
                    borderRadius: 4,
                    border: "1px solid #eee",
                  }}
                />
                <Box display="flex" flexDirection="column" gap={1}>
                  <IconButton
                    color="primary"
                    onClick={() => downloadImage(currentValue, `${field}_${Date.now()}.jpg`)}
                    title="Download Image"
                  >
                    <DownloadIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => handleRemoveImage(field)}
                    title="Remove Image"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}
          <TextField
            fullWidth
            type="file"
            label={`${currentValue ? "Replace" : "Upload"} ${getFieldDisplayName(field)}`}
            inputProps={{ accept: "image/*" }}
            onChange={(e) => handleFileChange(e, field)}
            InputLabelProps={{ shrink: true }}
            helperText={currentValue ? "Upload a new file to replace the current one" : "Choose an image file (JPG, PNG, etc.)"}
          />
        </>
      );
    }

    if (inputType === "select" && options.length > 0) {
      return (
        <FormControl fullWidth>
          <InputLabel id={`${field}-label`}>
            {getFieldDisplayName(field)}
          </InputLabel>
          <Select
            labelId={`${field}-label`}
            value={currentValue || ""}
            onChange={(e) => handleFormFieldChange(field, e.target.value)}
            label={getFieldDisplayName(field)}
          >
            <MenuItem value="" disabled>
              <em>Select {getFieldDisplayName(field).toLowerCase()}</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Select {getFieldDisplayName(field).toLowerCase()}
          </FormHelperText>
        </FormControl>
      );
    }

    if (inputType === "date") {
      return (
        <TextField
          fullWidth
          type="date"
          label={getFieldDisplayName(field)}
          value={currentValue || ""}
          onChange={(e) => handleFormFieldChange(field, e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            max: new Date().toISOString().split('T')[0]
          }}
          helperText="Date of birth"
        />
      );
    }

    if (inputType === "datetime-local") {
      return (
        <TextField
          fullWidth
          type="datetime-local"
          label={getFieldDisplayName(field)}
          value={currentValue || ""}
          onChange={(e) => handleFormFieldChange(field, e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      );
    }

    if (inputType === "email") {
      return (
        <TextField
          fullWidth
          type="email"
          label={getFieldDisplayName(field)}
          value={currentValue || ""}
          onChange={(e) => handleFormFieldChange(field, e.target.value)}
          error={currentValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue)}
          helperText={currentValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentValue) ? 
            "Please enter a valid email address" : 
            "example@domain.com"
          }
        />
      );
    }

    if (inputType === "tel" && field === "mobile") {
      const isValidNumber = validatePhilippineMobile(currentValue);
      return (
        <TextField
          fullWidth
          type="tel"
          label={getFieldDisplayName(field)}
          value={currentValue || ""}
          onChange={(e) => handleMobileChange(e, field)}
          error={!isValidNumber && currentValue}
          inputProps={{ 
            maxLength: 14,
            placeholder: "09XX XXX YYYY"
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                📱
              </InputAdornment>
            ),
          }}
          helperText={
            !currentValue 
              ? "Philippine mobile number (e.g., 0912 345 6789)" 
              : !isValidNumber 
                ? "Please enter a valid Philippine mobile number" 
                : "Valid Philippine mobile number"
          }
        />
      );
    }

    return (
      <TextField
        fullWidth
        type={inputType}
        label={getFieldDisplayName(field)}
        value={currentValue || ""}
        onChange={(e) => handleFormFieldChange(field, e.target.value)}
        multiline={["address", "notes", "description"].includes(field)}
        rows={["address", "notes", "description"].includes(field) ? 3 : 1}
        helperText={
          ["firstname", "middle", "lastname"].includes(field) 
            ? "Enter full name (no nicknames)" 
            : field === "address"
              ? "Complete address including house number, street, and city"
              : ""
        }
      />
    );
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2, height: '100%' }}>
      {isMobile ? (
        <>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 2,
            bgcolor: 'background.paper',
            borderRadius: 1,
            mb: 1
          }}>
            <IconButton 
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              {selectedTable
                ? TABLE_STRUCTURES[selectedTable]?.displayName
                : "Select Table"}
            </Typography>
          </Box>
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                boxSizing: 'border-box',
              },
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Management Tables
              </Typography>
              {tables.map((tbl) => (
                <React.Fragment key={tbl}>
                  <Button
                    fullWidth
                    variant={selectedTable === tbl ? "contained" : "text"}
                    onClick={() => {
                      handleTableSelect(tbl);
                      setMobileOpen(false);
                    }}
                    sx={{ justifyContent: "flex-start", mb: 1 }}
                  >
                    {TABLE_STRUCTURES[tbl]?.displayName || tbl}
                  </Button>
                  {tbl === "request_tbl" && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              ))}
            </Box>
          </Drawer>
        </>
      ) : (
        <Paper sx={{ p: 2, width: 200, minWidth: 200, height: 'fit-content' }}>
          <Typography variant="h6" gutterBottom>
            Management Tables
          </Typography>
          {tables.map((tbl) => (
            <React.Fragment key={tbl}>
              <Button
                fullWidth
                variant={selectedTable === tbl ? "contained" : "text"}
                onClick={() => handleTableSelect(tbl)}
                sx={{ justifyContent: "flex-start", mb: 1 }}
              >
                {TABLE_STRUCTURES[tbl]?.displayName || tbl}
              </Button>
              {tbl === "request_tbl" && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </Paper>
      )}

      <Paper sx={{ 
        p: isMobile ? 1 : 2, 
        flex: 1, 
        minWidth: 0,
        overflow: 'hidden'
      }}>
        {loading ? (
          <Box display="flex" justifyContent="center" py={3}>
            <CircularProgress />
          </Box>
        ) : selectedTable ? (
          <>
            <Box
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile ? 'stretch' : 'center',
                mb: 2,
                gap: isMobile ? 1 : 0
              }}
            >
              <Typography variant={isMobile ? "h6" : "h6"} sx={{ mb: isMobile ? 1 : 0 }}>
                {TABLE_STRUCTURES[selectedTable]?.displayName}
              </Typography>
              <Box sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 1,
                width: isMobile ? '100%' : 'auto'
              }}>
                <Button 
                  startIcon={<FilterListIcon />} 
                  onClick={openFilterMenu}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Filters
                </Button>
                <Menu
                  anchorEl={filterAnchorEl}
                  open={Boolean(filterAnchorEl)}
                  onClose={() => setFilterAnchorEl(null)}
                  PaperProps={{ 
                    style: { 
                      maxHeight: 400, 
                      width: isMobile ? '90vw' : 300,
                      maxWidth: isMobile ? '90vw' : 300
                    } 
                  }}
                >
                  {fields.map((fld) => (
                    <Box key={fld} sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        {getFieldDisplayName(fld)}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={activeFilters[fld]?.value || ""}
                        onChange={(e) =>
                          localHandleFilterChange(
                            fld,
                            e.target.value,
                            activeFilters[fld]?.type || "contains"
                          )
                        }
                        placeholder="Filter value…"
                      />
                      <Box sx={{ mt: 1 }}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={activeFilters[fld]?.type || "contains"}
                            onChange={(e) =>
                              localHandleFilterChange(
                                fld,
                                activeFilters[fld]?.value || "",
                                e.target.value
                              )
                            }
                            size="small"
                          >
                            <MenuItem value="contains">Contains</MenuItem>
                            <MenuItem value="equals">Equals</MenuItem>
                            <MenuItem value="starts">Starts with</MenuItem>
                            <MenuItem value="ends">Ends with</MenuItem>
                            {(fld.includes("date") ||
                              fld.includes("bday") ||
                              fld.includes("timestamp")) && (
                              <>
                                <MenuItem value="older_to_newer">
                                  Older to Newer
                                </MenuItem>
                                <MenuItem value="newer_to_older">
                                  Newer to Older
                                </MenuItem>
                              </>
                            )}
                            {typeof tableData[0]?.[fld] === "number" && (
                              <>
                                <MenuItem value="greater">Greater than</MenuItem>
                                <MenuItem value="less">Less than</MenuItem>
                              </>
                            )}
                            <MenuItem value="a_to_z">A → Z</MenuItem>
                            <MenuItem value="z_to_a">Z → A</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                    </Box>
                  ))}
                </Menu>
                <Button
                  startIcon={<ViewColumnIcon />}
                  onClick={openColumnMenu}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Columns
                </Button>
                <Menu
                  anchorEl={columnAnchorEl}
                  open={Boolean(columnAnchorEl)}
                  onClose={() => setColumnAnchorEl(null)}
                  PaperProps={{ 
                    style: { 
                      maxWidth: isMobile ? '90vw' : 300 
                    } 
                  }}
                >
                  {fields.map((fld) => (
                    <MenuItem key={fld}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={visibleColumns[fld] !== false}
                            onChange={() =>
                              handleColumnToggle({ setVisibleColumns, field: fld })
                            }
                          />
                        }
                        label={getFieldDisplayName(fld)}
                      />
                    </MenuItem>
                  ))}
                </Menu>
                <Button
                  startIcon={<SaveAltIcon />}
                  onClick={() => exportToCSV(displayData, selectedTable)}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleDialogOpen()}
                  size={isMobile ? "small" : "medium"}
                  fullWidth={isMobile}
                >
                  Add New
                </Button>
              </Box>
            </Box>

            <Autocomplete
              freeSolo
              options={[]}
              value={searchQuery}
              onInputChange={onSearchChange}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  placeholder="Search…"
                  sx={{ mb: 2 }}
                  size={isMobile ? "small" : "medium"}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
            />

            {Object.entries(activeFilters).some(([, f]) => f.value) && (
              <Box mb={2} display="flex" flexWrap="wrap" gap={1}>
                {Object.entries(activeFilters).map(
                  ([fld, { value, type }]) =>
                    value && (
                      <Chip
                        key={fld}
                        label={`${getFieldDisplayName(
                          fld
                        )}: ${value} (${type})`}
                        onDelete={() => {
                          const nf = { ...activeFilters };
                          delete nf[fld];
                          setActiveFilters(nf);
                          enhancedApplyFilters({
                            tableData,
                            searchQuery,
                            activeFilters: nf,
                            sortConfig,
                            setFilteredData,
                            calculateTableStats,
                          });
                        }}
                        variant="outlined"
                        size={isMobile ? "small" : "medium"}
                      />
                    )
                )}
              </Box>
            )}

            <TableContainer sx={{ 
              maxHeight: isMobile ? 300 : 440, 
              overflowX: 'auto',
              '& .MuiTable-root': {
                minWidth: isMobile ? 600 : 'auto'
              }
            }}>
              <Table stickyHeader size={isMobile ? "small" : "medium"}>
                <TableHead>
                  <TableRow>
                    {fields
                      .filter((f) => visibleColumns[f] !== false)
                      .map((fld) => (
                        <TableCell
                          key={fld}
                          onClick={() => {
                            let dir = "desc";
                            if (
                              sortConfig.key === fld &&
                              sortConfig.direction === "desc"
                            ) {
                              dir = "asc";
                            }
                            setSortConfig({ key: fld, direction: dir });
                            const sorted = [...filteredData].sort((a, b) => {
                              const va = a[fld], vb = b[fld];
                              if (va == null) return 1;
                              if (vb == null) return -1;
                              if (
                                fld.includes("date") ||
                                fld.includes("bday") ||
                                fld.includes("time")
                              ) {
                                return dir === "desc"
                                  ? new Date(vb) - new Date(va)
                                  : new Date(va) - new Date(vb);
                              }
                              if (
                                typeof va === "number" &&
                                typeof vb === "number"
                              ) {
                                return dir === "desc" ? vb - va : va - vb;
                              }
                              const A = String(va).toLowerCase(),
                                    B = String(vb).toLowerCase();
                              return dir === "desc"
                                ? B.localeCompare(A)
                                : A.localeCompare(B);
                            });
                            setFilteredData(sorted);
                          }}
                          sx={{ 
                            cursor: "pointer",
                            minWidth: isMobile ? 100 : 120,
                            fontSize: isMobile ? '0.75rem' : '0.875rem'
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            {getFieldDisplayName(fld)}
                            {sortConfig.key === fld && (
                              <Box component="span" ml={1}>
                                {sortConfig.direction === "asc" ? "↑" : "↓"}
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                      ))}
                    <TableCell sx={{ minWidth: isMobile ? 80 : 120 }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {displayData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id} hover>
                        {fields
                          .filter(f => visibleColumns[f] !== false)
                          .map((fld) => (
                            <TableCell 
                              key={fld} 
                              sx={{ 
                                fontSize: isMobile ? '0.75rem' : '0.875rem',
                                maxWidth: isMobile ? 150 : 'none',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                              }}
                            >
                              {CERT_FIELDS.includes(fld)
                                ? (
                                    isImageUrl(row[fld]) ? (
                                      <img
                                        alt={fld}
                                        src={row[fld]}
                                        style={{
                                          width: isMobile ? 40 : 60,
                                          height: isMobile ? 40 : 60,
                                          objectFit: "cover",
                                          cursor: "pointer",
                                          borderRadius: 4,
                                          border: "1px solid #eee",
                                        }}
                                        onClick={() => setPreviewImage(row[fld])}
                                      />
                                    ) : "-"
                                  )
                                : formatDisplayValue(fld, row[fld], setPreviewImage)
                              }
                            </TableCell>
                          ))}
                        <TableCell>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: isMobile ? 0.5 : 1,
                            flexDirection: isMobile ? 'column' : 'row'
                          }}>
                            <IconButton 
                              onClick={() => handleDialogOpen(row)}
                              size={isMobile ? "small" : "medium"}
                            >
                              <EditIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                            <IconButton 
                              color="error" 
                              onClick={() => handleDelete(row.id)}
                              sx={{ color: 'red' }}
                              size={isMobile ? "small" : "medium"}
                            >
                              <DeleteIcon fontSize={isMobile ? "small" : "medium"} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            <TablePagination
              component="div"
              count={displayData.length}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) =>
                handleChangeRowsPerPage(e, setRowsPerPage, setPage)
              }
              rowsPerPageOptions={[5, 10, 25, 50]}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem',
                  minHeight: isMobile ? 48 : 52
                },
                '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }
              }}
            />
          </>
        ) : (
          <Box textAlign="center" py={5}>
            <TableChart sx={{ fontSize: 64, color: "#bbb", mb: 2 }} />
            <Typography>Select a table to view its data</Typography>
          </Box>
        )}
      </Paper>

      <Dialog 
        open={!!previewImage} 
        onClose={() => setPreviewImage(null)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>Image Preview</Typography>
            <IconButton
              onClick={() => handleDownloadFromPreview(previewImage)}
              title="Download Image"
              color="primary"
            >
              <DownloadIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center">
            <img 
              src={previewImage} 
              alt="preview" 
              style={{ 
                maxWidth: "100%", 
                maxHeight: isMobile ? "60vh" : "70vh",
                objectFit: "contain"
              }} 
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewImage(null)}>Close</Button>
          <Button 
            variant="contained" 
            startIcon={<DownloadIcon />}
            onClick={() => handleDownloadFromPreview(previewImage)}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openDialog} 
        onClose={handleDialogClose} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            margin: isMobile ? 0 : 32,
            width: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : 'calc(100% - 64px)'
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant={isMobile ? "h6" : "h6"}>
              {editingRecordLocal ? "Edit" : "Add New"} Record
            </Typography>
            {editingRecordLocal && (
              <Typography variant="body2" color="textSecondary">
                ID: {editingRecordLocal.id}
              </Typography>
            )}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: isMobile ? 1 : 3 }}>
          {error && (
            <Typography 
              color="error" 
              sx={{ 
                mb: 2, 
                p: 1, 
                bgcolor: 'error.light', 
                borderRadius: 1,
                fontSize: isMobile ? '0.875rem' : '1rem'
              }}
            >
              {error}
            </Typography>
          )}
          <Grid container spacing={isMobile ? 1 : 2} sx={{ mt: 1 }}>
            {fields.map((fld) => (
              <Grid item xs={12} sm={fld === "address" ? 12 : 6} key={fld}>
                {inputComponent(fld)}
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: isMobile ? 2 : 3 }}>
          <Button 
            onClick={handleDialogClose} 
            disabled={saving}
            fullWidth={isMobile}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSaveRecord} 
            disabled={saving}
            fullWidth={isMobile}
          >
            {saving ? <CircularProgress size={20} /> : "Save"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ManagementTablesView;