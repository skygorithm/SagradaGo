// src/components/dashboard/SacramentBooking.jsx
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Drawer,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Autocomplete,
  InputAdornment,
  Tooltip,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import {
  handleChangeRowsPerPage,
  handleColumnClick,
  handleFilterClick,
} from "../../utils/admin-functions/handleFilterOptions";
import exportToCSV from "../../utils/admin-functions/exportToCSV";
import getDisplaySacrament from "../../utils/admin-functions/displaySacrament";
import { getFieldDisplayName } from "../../utils/admin-functions/tableStructures";
import { formatDisplayValue } from "../../utils/admin-functions/formatDatabaseValue";

const SacramentBookingsView = ({
  isMobile,
  mobileOpen,
  setMobileOpen,
  selectedSacrament,
  bookingTables,
  sacramentFilteredData,
  sacramentTableStats,
  sacramentTableData,
  sacramentVisibleColumns,
  sacramentSortConfig,
  sacramentSearchQuery,
  sacramentActiveFilters,
  sacramentFilterAnchorEl,
  sacramentColumnAnchorEl,
  sacramentPage,
  sacramentRowsPerPage,
  setSacramentFilteredData,
  handleSacramentTableSelect,
  handleSacramentAdd,
  handleSacramentEdit,
  handleSacramentDelete,
  handleSacramentSort,
  setSacramentSearchQuery,
  setSacramentActiveFilters,
  setSacramentFilterAnchorEl,
  setSacramentColumnAnchorEl,
  setSacramentPage,
  setSacramentRowsPerPage,
  setFormData,
  setEditingRecord,
  setOpenSacramentDialog,
  displaySacramentForm,
  ALL_BOOKINGS_STRUCTURE,
  BOOKING_TABLE_STRUCTURES,
  sacramentCalculateTableStats,
  applyFilters,
}) => {
  return (
    <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <Box sx={{ width: 250, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Sacrament Types
            </Typography>
            <Button
              fullWidth
              variant={selectedSacrament === "all" ? "contained" : "text"}
              onClick={() => {
                handleSacramentTableSelect("all");
                setMobileOpen(false);
              }}
            >
              All Bookings
            </Button>
            {bookingTables.map((sacrament) => (
              <Button
                key={sacrament}
                fullWidth
                variant={selectedSacrament === sacrament ? "contained" : "text"}
                onClick={() => {
                  handleSacramentTableSelect(sacrament);
                  setMobileOpen(false);
                }}
              >
                {BOOKING_TABLE_STRUCTURES[sacrament]?.displayName || sacrament}
              </Button>
            ))}
          </Box>
        </Drawer>
      ) : (
        <Paper sx={{ p: 2, width: "200px" }}>
          <Typography variant="h6" gutterBottom>
            Sacrament Types
          </Typography>
          <Button
            fullWidth
            variant={selectedSacrament === "all" ? "contained" : "text"}
            onClick={() => handleSacramentTableSelect("all")}
          >
            All Bookings
          </Button>
          {bookingTables.map((sacrament) => (
            <Button
              key={sacrament}
              fullWidth
              variant={selectedSacrament === sacrament ? "contained" : "text"}
              onClick={() => handleSacramentTableSelect(sacrament)}
            >
              {BOOKING_TABLE_STRUCTURES[sacrament]?.displayName || sacrament}
            </Button>
          ))}
        </Paper>
      )}

      {/* Content */}
      <Paper sx={{ p: 2, flex: 1 }}>
        {/* Toolbar */}
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">
            {selectedSacrament === "all"
              ? "All Bookings"
              : getDisplaySacrament(selectedSacrament)}
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(e) => handleFilterClick(e, setSacramentFilterAnchorEl)}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={(e) => handleColumnClick(e, setSacramentColumnAnchorEl)}
            >
              Columns
            </Button>
            <Button
              variant="outlined"
              startIcon={<SaveAltIcon />}
              onClick={() =>
                exportToCSV(
                  sacramentFilteredData,
                  selectedSacrament === "all" ? "all_bookings" : selectedSacrament
                )
              }
            >
              Export
            </Button>
            {selectedSacrament !== "all" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() =>
                  handleSacramentAdd({
                    selectedSacrament,
                    setFormData,
                    setEditingRecord,
                    setOpenSacramentDialog,
                  })
                }
              >
                Add New
              </Button>
            )}
          </Box>
        </Box>

        {/* Stats */}
        {Object.keys(sacramentTableStats).length > 0 && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {Object.entries(sacramentTableStats).map(([field, stats]) => (
              <Grid item xs={12} sm={4} key={field}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {getFieldDisplayName(field)}
                    </Typography>
                    <Typography variant="body2">
                      Min: {stats.min.toFixed(2)} | Max: {stats.max.toFixed(2)} |
                      Avg: {stats.avg.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Search */}
        <Autocomplete
          freeSolo
          options={[]}
          value={sacramentSearchQuery}
          onInputChange={(e, val) => {
            setSacramentSearchQuery(val);
            applyFilters({
              tableData: sacramentTableData,
              searchQuery: val,
              activeFilters: sacramentActiveFilters,
              sortConfig: sacramentSortConfig,
              setFilteredData: setSacramentFilteredData,
              calculateTableStats: sacramentCalculateTableStats,
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              placeholder="Search..."
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

        {/* Table */}
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {(selectedSacrament === "all"
                  ? ALL_BOOKINGS_STRUCTURE.fields
                  : BOOKING_TABLE_STRUCTURES[selectedSacrament]?.fields
                ).map((field) => (
                  <TableCell
                    key={field}
                    onClick={() => handleSacramentSort(field)}
                  >
                    {getFieldDisplayName(field)}
                  </TableCell>
                ))}
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sacramentFilteredData
                .slice(
                  sacramentPage * sacramentRowsPerPage,
                  sacramentPage * sacramentRowsPerPage + sacramentRowsPerPage
                )
                .map((row) => (
                  <TableRow key={row.id}>
                    {(selectedSacrament === "all"
                      ? ALL_BOOKINGS_STRUCTURE.fields
                      : BOOKING_TABLE_STRUCTURES[selectedSacrament]?.fields
                    ).map((field) => (
                      <TableCell key={field}>
                        {formatDisplayValue(field, row[field])}
                      </TableCell>
                    ))}
                    <TableCell>
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() =>
                            handleSacramentEdit({
                              record: row,
                              setFormData,
                              setEditingRecord,
                              setOpenSacramentDialog,
                            })
                          }
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => handleSacramentDelete(row.id)}
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

        <TablePagination
          component="div"
          count={sacramentFilteredData.length}
          page={sacramentPage}
          onPageChange={(e, newPage) => setSacramentPage(newPage)}
          rowsPerPage={sacramentRowsPerPage}
          onRowsPerPageChange={(e) =>
            handleChangeRowsPerPage(
              e,
              setSacramentRowsPerPage,
              setSacramentPage
            )
          }
        />
      </Paper>
    </Box>
  );
};

export default SacramentBookingsView;