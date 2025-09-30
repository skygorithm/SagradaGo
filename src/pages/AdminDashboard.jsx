import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";
import {
  Box,
  Button,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Badge,
  CssBaseline,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Chip,
  Paper,
  TextField,
  Grid,
  IconButton,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";

import HistoryIcon from "@mui/icons-material/History";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import EventIcon from "@mui/icons-material/Event";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { EventNote as BookingsIcon } from "@mui/icons-material";

import DataAnalyticsDashboard from "../components/dashboard/DataAnalyticsDashboard";
import SacramentBookingsView from "../components/dashboard/SacramentBooking";
import ManagementTablesView from "../components/dashboard/ManagementDashboard";

import * as adminHandlers from "../utils/admin-functions/adminHandlers";
import {
  ALL_BOOKINGS_STRUCTURE,
  BOOKING_TABLE_STRUCTURES,
} from "../utils/admin-functions/tableStructures";

import { handleSacramentSave } from "../utils/admin-functions/handleSave";
import AdminSacramentDialog from "../components/dialog/AdminSacramentDialog";
import { supabase } from "../config/supabase";

// Transaction Logs Dialog
const LogsDialog = ({ open, onClose, logs }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Transaction Logs</DialogTitle>
    <DialogContent>
      <List>
        {logs.map((log, index) => (
          <React.Fragment key={log.id || index}>
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" gap={2}>
                    <Chip
                      label={log.action}
                      size="small"
                      color={
                        log.action === "CREATE"
                          ? "success"
                          : log.action === "UPDATE"
                          ? "warning"
                          : log.action === "DELETE"
                          ? "error"
                          : log.action === "RESTORE"
                          ? "info"
                          : "default"
                      }
                    />
                    <Typography variant="body2">
                      {log.table_name} (ID: {log.record_id})
                    </Typography>
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="caption">
                      By: {log.performed_by} ({log.performed_by_email})
                    </Typography>
                    <Typography variant="caption" display="block">
                      Time: {log.timestamp}
                    </Typography>
                    {log.changes && (
                      <Paper elevation={0} sx={{ mt: 1, p: 1, bgcolor: "grey.50" }}>
                        <pre style={{ margin: 0, fontSize: "0.75rem", whiteSpace: "pre-wrap" }}>
                          {JSON.stringify(log.changes, null, 2)}
                        </pre>
                      </Paper>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < logs.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {logs.length === 0 && (
          <ListItem>
            <ListItemText primary="No transaction logs found" />
          </ListItem>
        )}
      </List>
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
  </Dialog>
);

// Deleted Records Dialog
const DeletedRecordsDialog = ({ open, onClose, records, onRestore, onPermanentDelete }) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle>Deleted Records (Trash)</DialogTitle>
    <DialogContent>
      <List>
        {records.map((record, index) => (
          <React.Fragment key={record.id || index}>
            <ListItem>
              <ListItemText
                primary={
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography variant="subtitle1">
                        {record.original_table} (ID: {record.record_id})
                      </Typography>
                      <Typography variant="caption">
                        Deleted by: {record.deleted_by} ({record.deleted_by_email})
                      </Typography>
                      <Typography variant="caption" display="block">
                        Deleted at: {new Date(record.deleted_at).toLocaleString()}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Button size="small" variant="outlined" color="primary" onClick={() => onRestore(record)}>Restore</Button>
                      <Button size="small" variant="outlined" color="error" onClick={() => onPermanentDelete(record)}>Delete Forever</Button>
                    </Box>
                  </Box>
                }
                secondary={
                  <Paper elevation={0} sx={{ mt: 1, p: 1, bgcolor: "grey.50", maxHeight: 200, overflow: "auto" }}>
                    <pre style={{ margin: 0, fontSize: "0.75rem", whiteSpace: "pre-wrap" }}>
                      {JSON.stringify(
                        typeof record.record_data === "string" ? JSON.parse(record.record_data) : record.record_data,
                        null,
                        2
                      )}
                    </pre>
                  </Paper>
                }
              />
            </ListItem>
            {index < records.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {records.length === 0 && (
          <ListItem><ListItemText primary="No deleted records found" /></ListItem>
        )}
      </List>
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Close</Button></DialogActions>
  </Dialog>
);

// Events Management Dialog
// Events Management Dialog - REPLACE YOUR ENTIRE EventsManagementDialog with this
const EventsManagementDialog = ({ open, onClose, events, onRefresh }) => {
  const { adminData } = useAdminAuth();
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    description: "",
    img: "",
    location: "",
    time: "",
  });
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const handleAdd = () => {
    setEditingEvent(null);
    setFormData({
      title: "",
      date: "",
      description: "",
      img: "",
      location: "",
      time: "",
    });
    setImagePreview("");
    setOpenEventDialog(true);
    setError("");
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || "",
      date: event.date || "",
      description: event.description || "",
      img: event.img || "",
      location: event.location || "",
      time: event.time || "",
    });
    setImagePreview(event.img || "");
    setOpenEventDialog(true);
    setError("");
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setError("");

      const fileExt = file.name.split(".").pop();
      const fileName = `event-${Date.now()}.${fileExt}`;
      const filePath = `events/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("event-images")
        .getPublicUrl(filePath);

      setFormData({ ...formData, img: urlData.publicUrl });
      setImagePreview(urlData.publicUrl);
      setSuccess("Image uploaded successfully");
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const { error: deleteError } = await supabase
        .from("events_tbl")
        .delete()
        .eq("id", eventId);

      if (deleteError) throw deleteError;

      setSuccess("Event deleted successfully");
      onRefresh();
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event");
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.date || !formData.location) {
      setError("Please fill in all required fields");
      return;
    }

    const timeParts = formData.time.split(" - ");
    if (timeParts.length !== 2 || !timeParts[0] || !timeParts[1]) {
      setError("Please select both start and end time");
      return;
    }

    try {
      if (editingEvent) {
        const { error: updateError } = await supabase
          .from("events_tbl")
          .update({
            title: formData.title,
            date: formData.date,
            description: formData.description,
            img: formData.img,
            location: formData.location,
            time: formData.time,
          })
          .eq("id", editingEvent.id);

        if (updateError) throw updateError;
        setSuccess("Event updated successfully");
      } else {
        const { error: insertError } = await supabase
          .from("events_tbl")
          .insert([{
            title: formData.title,
            date: formData.date,
            description: formData.description,
            img: formData.img,
            location: formData.location,
            time: formData.time,
          }]);

        if (insertError) throw insertError;
        setSuccess("Event created successfully");
      }

      setOpenEventDialog(false);
      setEditingEvent(null);
      setFormData({
        title: "",
        date: "",
        description: "",
        img: "",
        location: "",
        time: "",
      });
      setImagePreview("");
      onRefresh();
    } catch (err) {
      console.error("Error saving event:", err);
      setError("Failed to save event");
    }
  };

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess("");
        setError("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Manage Events</Typography>
            <Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                sx={{ mr: 1 }}
              >
                Add Event
              </Button>
              <IconButton onClick={onClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <List>
            {events.map((event, index) => (
              <React.Fragment key={event.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {event.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.date} • {event.time}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>
                        <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(event)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(event.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {event.description}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < events.length - 1 && <Divider />}
              </React.Fragment>
            ))}
            {events.length === 0 && (
              <ListItem>
                <ListItemText
                  primary="No events found"
                  secondary="Click 'Add Event' to create a new event"
                />
              </ListItem>
            )}
          </List>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Event Dialog */}
      <Dialog open={openEventDialog} onClose={() => setOpenEventDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEvent ? "Edit Event" : "Add New Event"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Event Title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Date *"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location *"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Time *"
                type="time"
                value={formData.time.split(" - ")[0] || ""}
                onChange={(e) => {
                  const endTime = formData.time.split(" - ")[1] || "";
                  setFormData({ 
                    ...formData, 
                    time: endTime ? `${e.target.value} - ${endTime}` : e.target.value 
                  });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Time *"
                type="time"
                value={formData.time.split(" - ")[1] || ""}
                onChange={(e) => {
                  const startTime = formData.time.split(" - ")[0] || "";
                  setFormData({ 
                    ...formData, 
                    time: startTime ? `${startTime} - ${e.target.value}` : e.target.value 
                  });
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image Path"
                placeholder="/images/event.jpg"
                value={formData.img}
                onChange={(e) => {
                  setFormData({ ...formData, img: e.target.value });
                  setImagePreview(e.target.value);
                }}
                helperText="Path to event image"
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" gutterBottom>
                  Or Upload New Image
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  disabled={uploading}
                  sx={{ mb: 1 }}
                >
                  {uploading ? "Uploading..." : "Upload Image"}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
                {imagePreview && (
                  <Box
                    sx={{
                      mt: 1,
                      position: "relative",
                      width: "100%",
                      height: 200,
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <IconButton
                      size="small"
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "background.paper",
                        "&:hover": { bgcolor: "error.light", color: "white" },
                      }}
                      onClick={() => {
                        setFormData({ ...formData, img: "" });
                        setImagePreview("");
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
                <Typography variant="caption" color="text.secondary">
                  Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEventDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            {editingEvent ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

// Main Component
const AdminDashboard = () => {
  const { isAdmin, loading: authLoading, logout, adminData } = useAdminAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("analytics");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [users, setUsers] = useState([]);
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [tableStats, setTableStats] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingRecord, setEditingRecord] = useState(null);

  const [selectedSacrament, setSelectedSacrament] = useState("all");
  const [sacramentTableData, setSacramentTableData] = useState([]);
  const [sacramentFilteredData, setSacramentFilteredData] = useState([]);
  const [sacramentTableStats, setSacramentTableStats] = useState({});
  const [sacramentVisibleColumns, setSacramentVisibleColumns] = useState({});
  const [sacramentSortConfig, setSacramentSortConfig] = useState({ key: null, direction: "desc" });
  const [sacramentSearchQuery, setSacramentSearchQuery] = useState("");
  const [sacramentActiveFilters, setSacramentActiveFilters] = useState({});
  const [sacramentFilterAnchorEl, setSacramentFilterAnchorEl] = useState(null);
  const [sacramentColumnAnchorEl, setSacramentColumnAnchorEl] = useState(null);
  const [sacramentPage, setSacramentPage] = useState(0);
  const [sacramentRowsPerPage, setSacramentRowsPerPage] = useState(10);

  const [stats, setStats] = useState({});
  const [transactionLogs, setTransactionLogs] = useState([]);
  const [openLogsDialog, setOpenLogsDialog] = useState(false);
  const [openDeletedDialog, setOpenDeletedDialog] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState([]);

  const [allBookingsData, setAllBookingsData] = useState([]);

  const [openSacramentDialog, setOpenSacramentDialog] = useState(false);
  const [sacramentEditingRecord, setSacramentEditingRecord] = useState(null);
  const [sacramentDialogForm, setSacramentDialogForm] = useState({});
  const [sacramentDialogError, setSacramentDialogError] = useState("");

  // Events state
  const [events, setEvents] = useState([]);
  const [openEventsDialog, setOpenEventsDialog] = useState(false);

  const bookingTables = Object.keys(BOOKING_TABLE_STRUCTURES);

  const reloadManagementTable = (tbl) =>
    adminHandlers.fetchManagementTableData(tbl, setSelectedTable, setTableData, setFilteredData, setSearchQuery, setLoading);

  const loadAllBookingsForAnalytics = async () => {
    try {
      setLoading(true);
      await adminHandlers.fetchSacramentTableData("all", () => {}, setAllBookingsData, () => {}, setLoading);
    } catch (error) {
      console.error("Error loading bookings for analytics:", error);
      setAllBookingsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch events
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events_tbl")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Failed to load events");
    }
  };

  useEffect(() => {
    if (!authLoading && isAdmin) {
      adminHandlers.fetchStats(setStats);
      adminHandlers.fetchTables(setTables, setLoading);
      adminHandlers.fetchUsers(setUsers);
      
      loadAllBookingsForAnalytics();
      
      adminHandlers.fetchSacramentTableData("all", setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading);
      
      fetchEvents();
    }
  }, [isAdmin, authLoading]);

  useEffect(() => {
    if (success || error) {
      const t = setTimeout(() => { setSuccess(""); setError(""); }, 5000);
      return () => clearTimeout(t);
    }
  }, [success, error]);

  const handleSacramentAddDialog = () => {
    adminHandlers.handleSacramentAdd({
      selectedSacrament,
      setFormData: setSacramentDialogForm,
      setEditingRecord: setSacramentEditingRecord,
      setOpenSacramentDialog,
    });
    setSacramentDialogError("");
  };

  const handleSacramentEditDialog = (row) => {
    adminHandlers.handleSacramentEdit({
      record: row,
      setFormData: setSacramentDialogForm,
      setEditingRecord: setSacramentEditingRecord,
      setOpenSacramentDialog,
    });
    setSacramentDialogError("");
  };

  const handleSacramentDialogClose = () => {
    setOpenSacramentDialog(false);
    setSacramentEditingRecord(null);
    setSacramentDialogForm({});
    setSacramentDialogError("");
  };

  const handleSacramentDialogSave = async () => {
    await handleSacramentSave({
      BOOKING_TABLE_STRUCTURES,
      ALL_BOOKINGS_STRUCTURE,
      selectedSacrament,
      sacramentTableData,
      formData: sacramentDialogForm,
      editingRecord: sacramentEditingRecord,
      adminData,
      setError: setSacramentDialogError,
      setSuccess,
      setOpenDialog: setOpenSacramentDialog,
      handleSacramentTableSelect: (s) =>
        adminHandlers.fetchSacramentTableData(s, setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading),
      fetchStats: () => adminHandlers.fetchStats(setStats),
    });
    loadAllBookingsForAnalytics();
  };

  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }
  if (!isAdmin) { navigate("/admin/login"); return null; }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Tooltip title="Manage Events">
              <Button
                variant="contained"
                color="secondary"
                startIcon={<EventIcon />}
                onClick={() => {
                  fetchEvents();
                  setOpenEventsDialog(true);
                }}
              >
                Events
              </Button>
            </Tooltip>
            <Tooltip title="View Transaction Logs">
              <Button variant="contained" color="secondary" startIcon={<HistoryIcon />}
                onClick={() => adminHandlers.handleViewLogs({ setTransactionLogs, setOpenLogsDialog, setError })}>Logs</Button>
            </Tooltip>
            <Tooltip title="View Deleted Records">
              <Button variant="contained" color="secondary" startIcon={<DeleteForeverIcon />}
                onClick={() => adminHandlers.handleViewDeleted({ setDeletedRecords, setOpenDeletedDialog, setError })}>Trash</Button>
            </Tooltip>
            <Button variant="contained" color="secondary" onClick={() => navigate("/admin/approved-calendar")}>Calendar</Button>
            <Button variant="contained" color="error" onClick={() => { logout(); navigate("/admin/login"); }}>Logout</Button>
          </Box>
        </Box>

        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Tabs */}
        <Box display="flex" gap={2} mb={4} flexWrap="wrap">
          <Button variant={currentView === "analytics" ? "contained" : "outlined"} startIcon={<AnalyticsIcon />} onClick={() => setCurrentView("analytics")}>Analytics</Button>
          <Button variant={currentView === "bookings" ? "contained" : "outlined"}
            startIcon={<Badge badgeContent={stats.pendingBookings || 0} color="error" invisible={!stats.pendingBookings}><BookingsIcon /></Badge>}
            onClick={() => setCurrentView("bookings")}>Bookings</Button>
          <Button variant={currentView === "management" ? "contained" : "outlined"} startIcon={<ManageAccountsIcon />} onClick={() => setCurrentView("management")}>Management</Button>
        </Box>

        {loading && <Box display="flex" justifyContent="center"><CircularProgress /></Box>}

        {/* Views */}
        {currentView === "analytics" && (
          <DataAnalyticsDashboard 
            stats={stats} 
            allBookings={allBookingsData}  
            isMobile={false} 
            setCurrentView={setCurrentView}
            handleSacramentTableSelect={(s) => {
              adminHandlers.fetchSacramentTableData(s, setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading);
            }}
            onShowPending={() => {
              setCurrentView("bookings"); 
              setSelectedSacrament("all"); 
              setSacramentActiveFilters({ booking_status: "pending" });
            }} 
          />
        )}

        {currentView === "bookings" && (
          <>
            <SacramentBookingsView
              isMobile={false}
              selectedSacrament={selectedSacrament}
              bookingTables={bookingTables}
              sacramentFilteredData={sacramentFilteredData}
              sacramentTableStats={sacramentTableStats}
              sacramentTableData={sacramentTableData}
              sacramentVisibleColumns={sacramentVisibleColumns}
              sacramentSortConfig={sacramentSortConfig}
              sacramentSearchQuery={sacramentSearchQuery}
              sacramentActiveFilters={sacramentActiveFilters}
              sacramentFilterAnchorEl={sacramentFilterAnchorEl}
              sacramentColumnAnchorEl={sacramentColumnAnchorEl}
              setSacramentVisibleColumns={setSacramentVisibleColumns}
              setSacramentSortConfig={setSacramentSortConfig}
              setSacramentSearchQuery={setSacramentSearchQuery}
              setSacramentActiveFilters={setSacramentActiveFilters}
              setSacramentFilterAnchorEl={setSacramentFilterAnchorEl}
              setSacramentColumnAnchorEl={setSacramentColumnAnchorEl}
              sacramentPage={sacramentPage}
              setSacramentPage={setSacramentPage}
              sacramentRowsPerPage={sacramentRowsPerPage}
              setSacramentRowsPerPage={setSacramentRowsPerPage}
              setSacramentFilteredData={setSacramentFilteredData}
              handleSacramentTableSelect={(s) => {
                adminHandlers.fetchSacramentTableData(s, setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading);
                loadAllBookingsForAnalytics();
              }}
              handleSacramentDelete={(id) =>
                adminHandlers.handleSacramentDelete({
                  id, sacramentTableData, selectedSacrament, adminData,
                  setSuccess, setError,
                  handleSacramentTableSelect: (s) => {
                    adminHandlers.fetchSacramentTableData(s, setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading);
                    loadAllBookingsForAnalytics();
                  },
                  fetchStats: () => adminHandlers.fetchStats(setStats),
                })}
              users={users}
              ALL_BOOKINGS_STRUCTURE={ALL_BOOKINGS_STRUCTURE}
              BOOKING_TABLE_STRUCTURES={BOOKING_TABLE_STRUCTURES}
              sacramentCalculateTableStats={setSacramentTableStats}
              applyFilters={adminHandlers.applyFilters}
              openSacramentDialog={openSacramentDialog}
              sacramentEditingRecord={sacramentEditingRecord}
              sacramentDialogForm={sacramentDialogForm}
              setSacramentDialogForm={setSacramentDialogForm}
              sacramentDialogError={sacramentDialogError}
              handleSacramentDialogClose={handleSacramentDialogClose}
              handleSacramentDialogSave={handleSacramentDialogSave}
              handleSacramentAddDialog={handleSacramentAddDialog}
              handleSacramentEditDialog={handleSacramentEditDialog}
            />

            <AdminSacramentDialog
              openDialog={openSacramentDialog}
              editingRecord={sacramentEditingRecord}
              error={sacramentDialogError}
              sacrament={selectedSacrament}
              formData={sacramentDialogForm}
              setFormData={setSacramentDialogForm}
              users={users}
              handleCloseDialog={handleSacramentDialogClose}
              handleSave={handleSacramentDialogSave}
            />
          </>
        )}

        {currentView === "management" && (
          <ManagementTablesView
            tables={tables}
            selectedTable={selectedTable}
            handleTableSelect={reloadManagementTable}
            tableData={tableData}
            filteredData={filteredData}
            setFilteredData={setFilteredData}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            tableStats={tableStats}
            calculateTableStats={setTableStats}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            filterAnchorEl={filterAnchorEl}
            setFilterAnchorEl={setFilterAnchorEl}
            columnAnchorEl={columnAnchorEl}
            setColumnAnchorEl={setColumnAnchorEl}
            handleAdd={adminHandlers.handleAdd}
            handleEdit={adminHandlers.handleEdit}
            handleDelete={(id) =>
              adminHandlers.handleDelete({
                id, tableData, selectedTable, adminData,
                setSuccess, setError,
                handleTableSelect: reloadManagementTable,
                fetchStats: () => adminHandlers.fetchStats(setStats),
              })}
            loading={loading}
            applyFilters={adminHandlers.applyFilters}
            setFormData={setFormData}
            setEditingRecord={setEditingRecord}
            setOpenDialog={setOpenDialog}
            users={users}
          />
        )}

        {/* Dialogs */}
        <LogsDialog open={openLogsDialog} onClose={() => setOpenLogsDialog(false)} logs={transactionLogs} />
        
        <DeletedRecordsDialog 
          open={openDeletedDialog} 
          onClose={() => setOpenDeletedDialog(false)}
          records={deletedRecords}
          onRestore={(record) =>
            adminHandlers.handleRestore({
              record, setSuccess, setError,
              setDeletedRecords, setOpenDeletedDialog,
              handleTableSelect: reloadManagementTable,
              fetchStats: () => adminHandlers.fetchStats(setStats),
              selectedSacrament,
              handleSacramentTableSelect: (s) => {
                adminHandlers.fetchSacramentTableData(s, setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading);
                loadAllBookingsForAnalytics();
              },
              adminData,
            })}
          onPermanentDelete={(record) =>
            adminHandlers.handlePermanentDelete({ record, setSuccess, setError, setDeletedRecords })} 
        />

        <EventsManagementDialog
          open={openEventsDialog}
          onClose={() => setOpenEventsDialog(false)}
          events={events}
          onRefresh={fetchEvents}
        />
      </Container>
    </ThemeProvider>
  );
};

export default AdminDashboard;