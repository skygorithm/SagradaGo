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
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../theme";

import HistoryIcon from "@mui/icons-material/History";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
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

// Transaction Logs
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

// Deleted Records
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

// Main Component
const AdminDashboard = () => {
  const { isAdmin, loading: authLoading, logout, adminData } = useAdminAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("analytics"); // Changed to start with analytics
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

  // ✅ NEW: State to hold all bookings data for analytics
  const [allBookingsData, setAllBookingsData] = useState([]);

  const [openSacramentDialog, setOpenSacramentDialog] = useState(false);
  const [sacramentEditingRecord, setSacramentEditingRecord] = useState(null);
  const [sacramentDialogForm, setSacramentDialogForm] = useState({});
  const [sacramentDialogError, setSacramentDialogError] = useState("");

  const bookingTables = Object.keys(BOOKING_TABLE_STRUCTURES);

  const reloadManagementTable = (tbl) =>
    adminHandlers.fetchManagementTableData(tbl, setSelectedTable, setTableData, setFilteredData, setSearchQuery, setLoading);

  // ✅ NEW: Function to load all bookings data for analytics
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

  useEffect(() => {
    if (!authLoading && isAdmin) {
      adminHandlers.fetchStats(setStats);
      adminHandlers.fetchTables(setTables, setLoading);
      adminHandlers.fetchUsers(setUsers);
      
      // ✅ FIXED: Load all bookings data for analytics immediately
      loadAllBookingsForAnalytics();
      
      // Also load sacrament data for bookings view
      adminHandlers.fetchSacramentTableData("all", setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading);
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
    // ✅ FIXED: Reload analytics data after save
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
            allBookings={allBookingsData}  // ✅ FIXED: Pass the correct analytics data
            isMobile={false} 
            setCurrentView={setCurrentView}
            handleSacramentTableSelect={(s) => {
              // Update both analytics and bookings data when a sacrament is selected
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
                // ✅ FIXED: Also update analytics data
                loadAllBookingsForAnalytics();
              }}
              handleSacramentDelete={(id) =>
                adminHandlers.handleSacramentDelete({
                  id, sacramentTableData, selectedSacrament, adminData,
                  setSuccess, setError,
                  handleSacramentTableSelect: (s) => {
                    adminHandlers.fetchSacramentTableData(s, setSelectedSacrament, setSacramentTableData, setSacramentFilteredData, setLoading);
                    // ✅ FIXED: Also update analytics data after delete
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

        {/* dialogs */}
        <LogsDialog open={openLogsDialog} onClose={() => setOpenLogsDialog(false)} logs={transactionLogs} />
        <DeletedRecordsDialog open={openDeletedDialog} onClose={() => setOpenDeletedDialog(false)}
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
                // ✅ FIXED: Also update analytics data after restore
                loadAllBookingsForAnalytics();
              },
              adminData,
            })}
          onPermanentDelete={(record) =>
            adminHandlers.handlePermanentDelete({ record, setSuccess, setError, setDeletedRecords })} />
      </Container>
    </ThemeProvider>
  );
};

export default AdminDashboard;