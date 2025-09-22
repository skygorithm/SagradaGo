import React, { useMemo, useState, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
  Chip,
  Divider,
  Alert,
  Menu,
  MenuItem,
  Checkbox,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const capitalizeWords = (str) => {
  if (!str || typeof str !== "string") return str;
  return str
    .split(" ")
    .map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join(" ");
};

const capitalizeAllWords = (str) => {
  if (!str || typeof str !== "string") return str;
  return str.replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const getDisplaySacrament = (sacrament) => {
  const displayNames = {
    baptism: "Baptism",
    wedding: "Wedding",
    burial: "Burial",
    confirmation: "Confirmation",
    anointing: "Anointing",
    firstcommunion: "First Communion",
    all: "All Bookings",
  };
  return displayNames[sacrament] || capitalizeWords(sacrament);
};

const exportToCSV = (data, filename) => {
  if (!data.length) return;
  const headers = Object.keys(data[0]).join(",");
  const rows = data.map((row) =>
    Object.values(row)
      .map((val) =>
        typeof val === "string" && val.includes(",") ? `"${val}"` : val
      )
      .join(",")
  );
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

const getStatusStyle = (status) => {
  if (!status) return { color: "default", backgroundColor: "#f5f5f5" };

  const statusLower = String(status).toLowerCase();

  switch (statusLower) {
    case "confirmed":
    case "approved":
    case "completed":
      return {
        backgroundColor: "#e8f5e8",
        textColor: "#2e7d32",
      };
    case "pending":
    case "waiting":
      return {
        backgroundColor: "#fff3e0",
        textColor: "#f57c00",
      };
    case "cancelled":
    case "rejected":
    case "declined":
      return {
        backgroundColor: "#ffebee",
        textColor: "#d32f2f",
      };
    case "draft":
    case "incomplete":
      return {
        backgroundColor: "#f5f5f5",
        textColor: "#757575",
      };
    default:
      return {
        backgroundColor: "#e3f2fd",
        textColor: "#1976d2",
      };
  }
};

const formatDisplayValue = (field, value) => {
  if (value === null || value === undefined) return "-";
  if (field === "booking_status") return capitalizeWords(String(value));
  if (field.includes("date") || field.includes("bday")) {
    return new Date(value).toLocaleDateString();
  }
  if (field.includes("price") || field.includes("amount")) {
    return `₱${parseFloat(value || 0).toFixed(2)}`;
  }
  return capitalizeAllWords(String(value));
};

const renderCellContent = (field, value) => {
  if (field === "booking_status") {
    if (!value) return "-";
    const statusStyle = getStatusStyle(value);
    return (
      <Chip
        label={capitalizeWords(String(value))}
        size="small"
        sx={{
          backgroundColor: statusStyle.backgroundColor,
          color: statusStyle.textColor,
          fontWeight: 600,
          borderRadius: "12px",
          height: "24px",
          "& .MuiChip-label": {
            px: 1,
            fontSize: "0.75rem",
          },
        }}
      />
    );
  }

  if (field === "paid") {
    const isPaid = String(value).toLowerCase() === "true" || value === true;
    return (
      <Chip
        label={isPaid ? "Paid" : "Not Yet Paid"}
        size="small"
        sx={{
          backgroundColor: isPaid ? "#e8f5e8" : "#fff3e0",
          color: isPaid ? "#2e7d32" : "#f57c00",
          fontWeight: 600,
          borderRadius: "12px",
          height: "24px",
          "& .MuiChip-label": {
            px: 1,
            fontSize: "0.75rem",
          },
        }}
      />
    );
  }

  return formatDisplayValue(field, value);
};

const getFieldDisplayName = (field) => {
  const displayNames = {
    user_firstname: "First Name",
    user_lastname: "Last Name",
    user_id: "User ID",
    user_email: "Email",
    user_phone: "Phone",
    user_address: "Address",
    id: "Booking ID",
    booking_status: "Status",
    booking_date: "Date",
    booking_time: "Time",
    booking_sacrament: "Sacrament",
    booking_pax: "Participants",
    booking_transaction: "Transaction ID",
    wedding_docu_id: "Wedding Document ID",
    baptism_docu_id: "Baptism Document ID",
    burial_docu_id: "Burial Document ID",
    confirmation_docu_id: "Confirmation Document ID",
    anointing_docu_id: "Anointing Document ID",
    firstcommunion_docu_id: "First Communion Document ID",
    price: "Amount",
    total_price: "Total Amount",
    amount: "Amount",
    paid: "Payment Status",
    payment_method: "Payment Method",
    created_at: "Created On",
    updated_at: "Last Updated",
    date_created: "Date Created",
    date_updated: "Date Updated",
    notes: "Notes",
    comments: "Comments",
    special_requirements: "Special Requirements",
    additional_info: "Additional Information",
    approval_status: "Approval Status",
    processing_status: "Processing Status",
    completed_status: "Completion Status",
    reference_number: "Reference Number",
    booking_reference: "Booking Reference",
    transaction_id: "Transaction ID",
  };

  return (
    displayNames[field] ||
    field
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .replace(/\bId\b/g, "ID")
      .replace(/\bPax\b/g, "Participants")
      .replace(/\bDocu\b/g, "Document")
      .replace(/\bTbl\b/g, "Table")
  );
};

const CERT_FIELDS = [
  "baptismal_certificate",
  "confirmation_certificate",
  "wedding_certificate",
];

function isImageUrl(url = "") {
  if (!url || typeof url !== "string") return false;
  return /\.(jpg|jpeg|png|webp|gif)$/i.test(url.split("?")[0]);
}

// Filter function to apply active filters
const applyFilters = (data, activeFilters) => {
  if (!activeFilters || Object.keys(activeFilters).length === 0) {
    return data;
  }
  
  return data.filter((item) => {
    // Filter by booking status
    if (activeFilters.booking_status) {
      const itemStatus = String(item.booking_status || '').toLowerCase();
      const filterStatus = String(activeFilters.booking_status).toLowerCase();
      if (itemStatus !== filterStatus) {
        return false;
      }
    }
    
    // Filter by payment status
    if (activeFilters.paid !== undefined && activeFilters.paid !== null) {
      const itemPaid = String(item.paid || '').toLowerCase() === 'true' || item.paid === true;
      const filterPaid = activeFilters.paid;
      if (itemPaid !== filterPaid) {
        return false;
      }
    }
    
    // Filter by sacrament type
    if (activeFilters.booking_sacrament) {
      const itemSacrament = String(item.booking_sacrament || '').toLowerCase();
      const filterSacrament = String(activeFilters.booking_sacrament).toLowerCase();
      if (itemSacrament !== filterSacrament) {
        return false;
      }
    }
    
    return true;
  });
};

const SacramentBookingsView = (props) => {
  const {
    mobileOpen,
    setMobileOpen,
    selectedSacrament = "all",
    bookingTables = [],
    sacramentFilteredData = [],
    sacramentVisibleColumns = {},
    sacramentFilterAnchorEl,
    setSacramentFilterAnchorEl,
    sacramentColumnAnchorEl,
    setSacramentColumnAnchorEl,
    sacramentPage = 0,
    setSacramentPage,
    sacramentRowsPerPage = 10,
    setSacramentRowsPerPage,
    handleSacramentTableSelect,
    handleSacramentDelete,
    setSacramentActiveFilters,
    setSacramentVisibleColumns,
    handleSacramentAddDialog,
    handleSacramentEditDialog,
    ALL_BOOKINGS_STRUCTURE = { fields: [] },
    BOOKING_TABLE_STRUCTURES = {},
    sacramentActiveFilters = {},
  } = props;

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

  // Drawer fix: Fallback to internal state if not provided
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const drawerOpen =
    mobileOpen !== undefined ? mobileOpen : internalMobileOpen;
  const toggleDrawer = (open) => {
    if (setMobileOpen) {
      setMobileOpen(open);
    } else {
      setInternalMobileOpen(open);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Debug effect to track filter changes
  useEffect(() => {
    console.log('SacramentBookingsView - Filter state changed:', sacramentActiveFilters);
  }, [sacramentActiveFilters]);

  const currentFields = useMemo(() => {
    if (selectedSacrament === "all") {
      return ALL_BOOKINGS_STRUCTURE?.fields || [];
    } else {
      const structure = BOOKING_TABLE_STRUCTURES[selectedSacrament];
      return structure?.fields || [];
    }
  }, [selectedSacrament, ALL_BOOKINGS_STRUCTURE, BOOKING_TABLE_STRUCTURES]);

  // Apply filters to the data
  const filteredSortedData = useMemo(() => {
    const filtered = applyFilters(sacramentFilteredData || [], sacramentActiveFilters);
    console.log('Filtered data:', filtered.length, 'from', sacramentFilteredData?.length || 0);
    return filtered;
  }, [sacramentFilteredData, sacramentActiveFilters]);

  const visibleFields = currentFields.filter(
    (f) => sacramentVisibleColumns[f] !== false
  );

  const handleEditClick = (row) => {
    handleSacramentEditDialog?.(row);
  };

  const handleDeleteClick = (row) => {
    setRecordToDelete(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    handleSacramentDelete?.(recordToDelete?.id);
    setDeleteDialogOpen(false);
    setRecordToDelete(null);
  };

  const statusOptions = [
    "pending",
    "confirmed",
    "approved",
    "completed",
    "cancelled",
  ];

  // Get unique payment statuses and sacrament types for filters
  const paymentOptions = [
    { label: "Paid", value: true },
    { label: "Not Paid", value: false },
  ];

  const sacramentOptions = useMemo(() => {
    const uniqueSacraments = [...new Set(
      (sacramentFilteredData || [])
        .map(item => item.booking_sacrament)
        .filter(Boolean)
    )];
    return uniqueSacraments.map(sacrament => ({
      label: capitalizeWords(sacrament),
      value: sacrament
    }));
  }, [sacramentFilteredData]);

  // Clear all filters function
  const clearAllFilters = () => {
    console.log('Clearing all filters');
    setSacramentActiveFilters?.({});
    setSacramentFilterAnchorEl?.(null);
  };

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    const activeCount = Object.keys(sacramentActiveFilters || {}).filter(key => {
      const value = sacramentActiveFilters[key];
      return value !== null && value !== undefined && value !== '';
    }).length;
    console.log('Has active filters:', activeCount > 0, 'Active filters:', sacramentActiveFilters);
    return activeCount > 0;
  }, [sacramentActiveFilters]);

  const sidebar = (
    <Box sx={{ width: 240, p: 2 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        Sacrament Types
      </Typography>
      {["all", ...bookingTables].map((sacrament) => (
        <Button
          key={sacrament}
          fullWidth
          variant={selectedSacrament === sacrament ? "contained" : "text"}
          onClick={() => {
            handleSacramentTableSelect?.(sacrament);
            toggleDrawer(false);
          }}
          sx={{
            justifyContent: "flex-start",
            mb: 1,
            color: selectedSacrament === sacrament ? "white" : "#6B5F32",
            backgroundColor:
              selectedSacrament === sacrament ? "#6B5F32" : "transparent",
            fontWeight: 600,
            "&:hover": {
              backgroundColor:
                selectedSacrament === sacrament ? "#5A4F28" : "#E1D5B8",
            },
          }}
        >
          {sacrament === "all"
            ? "All Bookings"
            : BOOKING_TABLE_STRUCTURES[sacrament]?.displayName ||
              getDisplaySacrament(sacrament)}
        </Button>
      ))}
    </Box>
  );

  return (
    <>
      <Box display="flex" flexDirection={isDesktop ? "row" : "column"}>
        {isDesktop ? (
          <Paper sx={{ p: 2, width: 240, minWidth: 200, flexShrink: 0, mr: 2 }}>
            {sidebar}
          </Paper>
        ) : (
          <>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="flex-start"
              px={1}
              py={1}
            >
              <IconButton onClick={() => toggleDrawer(true)} size="large">
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap>
                {selectedSacrament === "all"
                  ? "All Sacrament Bookings"
                  : getDisplaySacrament(selectedSacrament)}
              </Typography>
            </Box>
            <Drawer
              anchor="left"
              open={drawerOpen}
              onClose={() => toggleDrawer(false)}
              ModalProps={{ keepMounted: true }}
              PaperProps={{ sx: { width: 260 } }}
            >
              {sidebar}
            </Drawer>
          </>
        )}

        <Paper sx={{ p: 2, flex: 1 }}>
          <Box
            display="flex"
            flexWrap="wrap"
            flexDirection={isDesktop ? "row" : "column"}
            justifyContent="space-between"
            alignItems={isDesktop ? "center" : "flex-start"}
            mb={2}
            gap={1}
          >
            <Typography variant="h6">
              {selectedSacrament === "all"
                ? "All Sacrament Bookings"
                : getDisplaySacrament(selectedSacrament)}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                startIcon={<FilterListIcon />}
                onClick={(e) => setSacramentFilterAnchorEl?.(e.currentTarget)}
                color={hasActiveFilters ? "primary" : "inherit"}
                variant={hasActiveFilters ? "contained" : "outlined"}
              >
                Filters {hasActiveFilters && `(${Object.keys(sacramentActiveFilters || {}).filter(k => {
                  const value = sacramentActiveFilters[k];
                  return value !== null && value !== undefined && value !== '';
                }).length})`}
              </Button>
              <Menu
                anchorEl={sacramentFilterAnchorEl}
                open={Boolean(sacramentFilterAnchorEl)}
                onClose={() => setSacramentFilterAnchorEl?.(null)}
                PaperProps={{ sx: { minWidth: 250 } }}
              >
                <Box sx={{ p: 1 }}>
                  <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, fontWeight: 600 }}>
                    Status
                  </Typography>
                  {statusOptions.map((status) => {
                    const isChecked = sacramentActiveFilters?.booking_status === status;
                    return (
                      <MenuItem
                        key={status}
                        onClick={() => {
                          const newValue = isChecked ? null : status;
                          console.log(`Setting booking_status filter from ${sacramentActiveFilters?.booking_status} to:`, newValue);
                          setSacramentActiveFilters?.((prev) => ({
                            ...prev,
                            booking_status: newValue,
                          }));
                        }}
                      >
                        <Checkbox checked={isChecked} />
                        <ListItemText primary={capitalizeWords(status)} />
                      </MenuItem>
                    );
                  })}
                  
                  <Divider sx={{ my: 1 }} />
                  
                  <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, fontWeight: 600 }}>
                    Payment Status
                  </Typography>
                  {paymentOptions.map((option) => (
                    <MenuItem
                      key={option.value.toString()}
                      onClick={() =>
                        setSacramentActiveFilters?.((prev) => ({
                          ...prev,
                          paid: prev?.paid === option.value ? null : option.value,
                        }))
                      }
                    >
                      <Checkbox
                        checked={sacramentActiveFilters?.paid === option.value}
                      />
                      <ListItemText primary={option.label} />
                    </MenuItem>
                  ))}

                  {selectedSacrament === "all" && sacramentOptions.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      
                      <Typography variant="subtitle2" sx={{ px: 1, py: 0.5, fontWeight: 600 }}>
                        Sacrament Type
                      </Typography>
                      {sacramentOptions.map((option) => (
                        <MenuItem
                          key={option.value}
                          onClick={() =>
                            setSacramentActiveFilters?.((prev) => ({
                              ...prev,
                              booking_sacrament: prev?.booking_sacrament === option.value ? null : option.value,
                            }))
                          }
                        >
                          <Checkbox
                            checked={sacramentActiveFilters?.booking_sacrament === option.value}
                          />
                          <ListItemText primary={option.label} />
                        </MenuItem>
                      ))}
                    </>
                  )}
                  
                  {hasActiveFilters && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ px: 1 }}>
                        <Button
                          size="small"
                          onClick={clearAllFilters}
                          fullWidth
                          variant="outlined"
                        >
                          Clear All Filters
                        </Button>
                      </Box>
                    </>
                  )}
                </Box>
              </Menu>

              <Button
                startIcon={<ViewColumnIcon />}
                onClick={(e) => setSacramentColumnAnchorEl?.(e.currentTarget)}
              >
                Columns
              </Button>
              <Menu
                anchorEl={sacramentColumnAnchorEl}
                open={Boolean(sacramentColumnAnchorEl)}
                onClose={() => setSacramentColumnAnchorEl?.(null)}
              >
                {currentFields.map((field) => (
                  <MenuItem
                    key={field}
                    onClick={() =>
                      setSacramentVisibleColumns?.((prev) => ({
                        ...prev,
                        [field]: !prev[field],
                      }))
                    }
                  >
                    <Checkbox
                      checked={sacramentVisibleColumns[field] !== false}
                    />
                    <ListItemText primary={getFieldDisplayName(field)} />
                  </MenuItem>
                ))}
              </Menu>

              <Button
                startIcon={<SaveAltIcon />}
                onClick={() =>
                  exportToCSV(
                    filteredSortedData,
                    selectedSacrament === "all"
                      ? "all_bookings"
                      : selectedSacrament
                  )
                }
              >
                Export
              </Button>

              {selectedSacrament !== "all" && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleSacramentAddDialog}
                >
                  Add New
                </Button>
              )}
            </Box>
          </Box>

          {/* Show active filters */}
          {hasActiveFilters && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Active filters:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {Object.entries(sacramentActiveFilters || {}).map(([key, value]) => {
                  if (value === null || value === undefined || value === '') return null;
                  
                  let displayValue = value;
                  if (key === 'paid') {
                    displayValue = value ? 'Paid' : 'Not Paid';
                  } else if (typeof value === 'string') {
                    displayValue = capitalizeWords(value);
                  }
                  
                  return (
                    <Chip
                      key={key}
                      label={`${getFieldDisplayName(key)}: ${displayValue}`}
                      size="small"
                      onDelete={() =>
                        setSacramentActiveFilters?.((prev) => ({
                          ...prev,
                          [key]: null,
                        }))
                      }
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
              </Box>
            </Box>
          )}

          <TableContainer sx={{ maxHeight: 500, overflowX: "auto" }}>
            <Table stickyHeader sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  {visibleFields.map((fld) => (
                    <TableCell key={fld} sx={{ fontWeight: 600 }}>
                      {getFieldDisplayName(fld)}
                    </TableCell>
                  ))}
                  {visibleFields.length > 0 && (
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  )}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSortedData
                  .slice(
                    sacramentPage * sacramentRowsPerPage,
                    sacramentPage * sacramentRowsPerPage + sacramentRowsPerPage
                  )
                  .map((row, idx) => (
                    <TableRow key={row.id || idx} hover>
                      {visibleFields.map((fld) => (
                        <TableCell key={fld}>
                          {renderCellContent(fld, row[fld])}
                        </TableCell>
                      ))}
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton
                            onClick={() => handleEditClick(row)}
                            sx={{ color: "#6B5F32" }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            onClick={() => handleDeleteClick(row)}
                            sx={{ color: "#dc3545" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {filteredSortedData.length === 0 && (sacramentFilteredData || []).length > 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                No records match the current filters.
              </Typography>
            </Box>
          )}
          
          {filteredSortedData.length > 0 && (
            <TablePagination
              component="div"
              count={filteredSortedData.length}
              page={sacramentPage}
              onPageChange={(e, newPage) => setSacramentPage?.(newPage)}
              rowsPerPage={sacramentRowsPerPage}
              onRowsPerPageChange={(e) => {
                setSacramentRowsPerPage?.(parseInt(e.target.value, 10));
                setSacramentPage?.(0);
              }}
              rowsPerPageOptions={[5, 10, 25, 50]}
            />
          )}
        </Paper>
      </Box>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this record? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SacramentBookingsView;