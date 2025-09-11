// src/pages/AdminDashboard.jsx
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

import {
  fetchStats,
  fetchTables,
  fetchUsers,
  fetchManagementTableData,
  fetchSacramentTableData,
  fetchTransactionLogs,
  fetchDeletedRecords,
  displaySacramentForm,
} from "../utils/admin-functions/adminHandlers";

import {
  ALL_BOOKINGS_STRUCTURE,
  BOOKING_TABLE_STRUCTURES,
  TABLE_STRUCTURES,
} from "../utils/admin-functions/tableStructures";

import { handleAdd, handleSacramentAdd } from "../utils/admin-functions/handleAdd";
import { handleEdit, handleSacramentEdit } from "../utils/admin-functions/handleEdit";

const AdminDashboard = () => {
  const { isAdmin, loading: authLoading, logout } = useAdminAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState("bookings");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Management States
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "desc" });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [tableStats, setTableStats] = useState({});
  const [activeFilters, setActiveFilters] = useState({});
  const [visibleColumns, setVisibleColumns] = useState({});
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [columnAnchorEl, setColumnAnchorEl] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingRecord, setEditingRecord] = useState(null);
  const [users, setUsers] = useState([]);

  // Sacraments States
  const [bookingTables] = useState(Object.keys(BOOKING_TABLE_STRUCTURES));
  const [selectedSacrament, setSelectedSacrament] = useState("all");
  const [sacramentTableData, setSacramentTableData] = useState([]);
  const [sacramentFilteredData, setSacramentFilteredData] = useState([]);
  const [sacramentTableStats, setSacramentTableStats] = useState({});
  const [sacramentVisibleColumns, setSacramentVisibleColumns] = useState({});
  const [sacramentSortConfig, setSacramentSortConfig] = useState({
    key: null,
    direction: "desc",
  });
  const [sacramentSearchQuery, setSacramentSearchQuery] = useState("");
  const [sacramentActiveFilters, setSacramentActiveFilters] = useState({});
  const [sacramentFilterAnchorEl, setSacramentFilterAnchorEl] = useState(null);
  const [sacramentColumnAnchorEl, setSacramentColumnAnchorEl] = useState(null);
  const [sacramentPage, setSacramentPage] = useState(0);
  const [sacramentRowsPerPage, setSacramentRowsPerPage] = useState(10);
  const [openSacramentDialog, setOpenSacramentDialog] = useState(false);

  // Cards, Logs, Trash
  const [cardOpen, setCardOpen] = useState(false);
  const [cardTitle, setCardTitle] = useState("");
  const [cardContent, setCardContent] = useState(null);
  const [stats, setStats] = useState({});
  const [transactionLogs, setTransactionLogs] = useState([]);
  const [openLogsDialog, setOpenLogsDialog] = useState(false);
  const [openDeletedDialog, setOpenDeletedDialog] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState([]);

  // Initial load
  useEffect(() => {
    if (!authLoading && isAdmin) {
      fetchStats(setStats);
      fetchTables(setTables, setLoading);
      fetchUsers(setUsers);
      fetchSacramentTableData(
        "all",
        setSelectedSacrament,
        setSacramentTableData,
        setSacramentFilteredData,
        setLoading
      );
    }
  }, [isAdmin, authLoading]);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  if (authLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box display="flex" justifyContent="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </ThemeProvider>
    );
  }
  if (!isAdmin) return null;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" mb={3}>
          <Typography variant="h4">Admin Dashboard</Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<HistoryIcon />}
              onClick={() =>
                fetchTransactionLogs(setTransactionLogs, setOpenLogsDialog)
              }
            >
              View Logs
            </Button>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DeleteForeverIcon />}
              onClick={() =>
                fetchDeletedRecords(setDeletedRecords, setOpenDeletedDialog)
              }
            >
              View Trash
            </Button>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => navigate("/admin/approved-calendar")}
            >
              Calendar
            </Button>
            <Button variant="contained" color="error" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box display="flex" gap={2} mb={4}>
          <Button
            variant={currentView === "analytics" ? "contained" : "outlined"}
            color="primary"
            startIcon={<AnalyticsIcon />}
            onClick={() => setCurrentView("analytics")}
          >
            Data Analytics
          </Button>
          <Button
            variant={currentView === "bookings" ? "contained" : "outlined"}
            color="primary"
            startIcon={
              <Badge
                badgeContent={stats?.pendingBookings || 0}
                color="error"
                invisible={!stats?.pendingBookings}
              >
                <BookingsIcon />
              </Badge>
            }
            onClick={() => setCurrentView("bookings")}
          >
            Sacrament Bookings
          </Button>
          <Button
            variant={currentView === "management" ? "contained" : "outlined"}
            color="primary"
            startIcon={<ManageAccountsIcon />}
            onClick={() => setCurrentView("management")}
          >
            Management
          </Button>
        </Box>

        {success && <Alert severity="success">{success}</Alert>}
        {error && <Alert severity="error">{error}</Alert>}

        {/* Views */}
        {currentView === "analytics" && (
          <DataAnalyticsDashboard
            stats={stats}
            isMobile={false}
            onShowPending={() => {
              setCurrentView("bookings");
              setSelectedSacrament("all");
              setSacramentActiveFilters({
                booking_status: { value: "pending", type: "equals" },
              });
              fetchSacramentTableData(
                "all",
                setSelectedSacrament,
                setSacramentTableData,
                setSacramentFilteredData,
                setLoading
              );
            }}
          />
        )}

        {currentView === "bookings" && (
          <SacramentBookingsView
            isMobile={false}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
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
            sacramentPage={sacramentPage}
            sacramentRowsPerPage={sacramentRowsPerPage}
            setSacramentFilteredData={setSacramentFilteredData}
            handleSacramentTableSelect={(s) =>
              fetchSacramentTableData(
                s,
                setSelectedSacrament,
                setSacramentTableData,
                setSacramentFilteredData,
                setLoading
              )
            }
            handleSacramentAdd={handleSacramentAdd}
            handleSacramentEdit={handleSacramentEdit}
            handleSacramentDelete={(id) => console.log("delete sacrament", id)}
            handleSacramentSort={(f) => console.log("sort by", f)}
            setSacramentSearchQuery={setSacramentSearchQuery}
            setSacramentActiveFilters={setSacramentActiveFilters}
            setSacramentFilterAnchorEl={setSacramentFilterAnchorEl}
            setSacramentColumnAnchorEl={setSacramentColumnAnchorEl}
            setSacramentPage={setSacramentPage}
            setSacramentRowsPerPage={setSacramentRowsPerPage}
            setFormData={setFormData}
            setEditingRecord={setEditingRecord}
            setOpenSacramentDialog={setOpenSacramentDialog}
            displaySacramentForm={(title, id, sacrament) =>
              displaySacramentForm(
                title,
                id,
                sacrament,
                setCardOpen,
                setCardTitle,
                setCardContent
              )
            }
            ALL_BOOKINGS_STRUCTURE={ALL_BOOKINGS_STRUCTURE}
            BOOKING_TABLE_STRUCTURES={BOOKING_TABLE_STRUCTURES}
            sacramentCalculateTableStats={setSacramentTableStats}
            applyFilters={() => {}}
          />
        )}

        {currentView === "management" && (
          <ManagementTablesView
            isMobile={false}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
            tables={tables}
            selectedTable={selectedTable}
            handleTableSelect={(t) =>
              fetchManagementTableData(
                t,
                setSelectedTable,
                setTableData,
                setFilteredData,
                setSearchQuery,
                setLoading
              )
            }
            tableStats={tableStats}
            loading={loading}
            filteredData={filteredData}
            tableData={tableData}
            setFilteredData={setFilteredData}
            visibleColumns={visibleColumns}
            sortConfig={sortConfig}
            searchQuery={searchQuery}
            activeFilters={activeFilters}
            filterAnchorEl={filterAnchorEl}
            columnAnchorEl={columnAnchorEl}
            page={page}
            rowsPerPage={rowsPerPage}
            setFilterAnchorEl={setFilterAnchorEl}
            setColumnAnchorEl={setColumnAnchorEl}
            setActiveFilters={setActiveFilters}
            setSearchQuery={setSearchQuery}
            setPage={setPage}
            setRowsPerPage={setRowsPerPage}
            handleSort={(f) => console.log("sort by", f)}
            handleAdd={handleAdd}
            handleEdit={handleEdit}
            handleDelete={(id) => console.log("delete record", id)}
            TABLE_STRUCTURES={TABLE_STRUCTURES}
            calculateTableStats={setTableStats}
            applyFilters={() => {}}
            setFormData={setFormData}
            setEditingRecord={setEditingRecord}
            setOpenDialog={setOpenDialog}
          />
        )}
      </Container>
    </ThemeProvider>
  );
};

export default AdminDashboard;