// src/components/dashboard/ManagementDashboard.jsx
import React from "react";
import {
  Box,
  Typography,
  Drawer,
  Paper,
  Button,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  Autocomplete,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress,
  IconButton,
} from "@mui/material";

import FilterListIcon from "@mui/icons-material/FilterList";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import { TableChart } from "@mui/icons-material";

import {
  handleChangeRowsPerPage,
  handleColumnClick,
  handleFilterClick,
} from "../../utils/admin-functions/handleFilterOptions";
import exportToCSV from "../../utils/admin-functions/exportToCSV";
import { formatDisplayValue } from "../../utils/admin-functions/formatDatabaseValue";
import { getFieldDisplayName } from "../../utils/admin-functions/tableStructures";

const ManagementTablesView = ({
  isMobile,
  mobileOpen,
  setMobileOpen,
  tables,
  selectedTable,
  handleTableSelect,
  tableStats,
  loading,
  filteredData,
  tableData,
  setFilteredData,
  visibleColumns,
  sortConfig,
  searchQuery,
  activeFilters,
  filterAnchorEl,
  columnAnchorEl,
  page,
  rowsPerPage,
  setFilterAnchorEl,
  setColumnAnchorEl,
  setActiveFilters,
  setSearchQuery,
  setPage,
  setRowsPerPage,
  handleSort,
  handleAdd,
  handleEdit,
  handleDelete,
  TABLE_STRUCTURES,
  calculateTableStats,
  applyFilters,
  setFormData,
  setEditingRecord,
  setOpenDialog,
}) => {
  return (
    <Box display="flex" flexDirection={isMobile ? "column" : "row"} gap={2}>
      {/* Sidebar */}
      {isMobile ? (
        <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
          <Box sx={{ width: 250, p: 2 }}>
            <Typography variant="h6">Management Tables</Typography>
            {tables.map((table) => (
              <React.Fragment key={table}>
                <Button
                  fullWidth
                  variant={selectedTable === table ? "contained" : "text"}
                  onClick={() => handleTableSelect(table)}
                >
                  {TABLE_STRUCTURES[table]?.displayName || table}
                </Button>
                {table === "request_tbl" && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        </Drawer>
      ) : (
        <Paper sx={{ p: 2, width: "200px" }}>
          <Typography variant="h6">Management Tables</Typography>
          {tables.map((table) => (
            <Button
              key={table}
              fullWidth
              variant={selectedTable === table ? "contained" : "text"}
              onClick={() => handleTableSelect(table)}
            >
              {TABLE_STRUCTURES[table]?.displayName || table}
            </Button>
          ))}
        </Paper>
      )}

      {/* Main Content */}
      <Paper sx={{ p: 2, flex: 1 }}>
        {loading ? (
          <CircularProgress />
        ) : selectedTable ? (
          <>
            {/* Toolbar */}
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="h6">
                {TABLE_STRUCTURES[selectedTable]?.displayName || selectedTable}
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant="outlined"
                  startIcon={<FilterListIcon />}
                  onClick={(e) => handleFilterClick(e, setFilterAnchorEl)}
                >
                  Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ViewColumnIcon />}
                  onClick={(e) => handleColumnClick(e, setColumnAnchorEl)}
                >
                  Columns
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SaveAltIcon />}
                  onClick={() => exportToCSV(filteredData, selectedTable)}
                >
                  Export
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    handleAdd({
                      selectedTable,
                      setFormData,
                      setEditingRecord,
                      setOpenDialog,
                    })
                  }
                >
                  Add New
                </Button>
              </Box>
            </Box>

            {/* Stats */}
            {Object.entries(tableStats).map(([field, stats]) => (
              <Card key={field}>
                <CardContent>
                  <Typography>{getFieldDisplayName(field)}</Typography>
                  <Typography>
                    Min: {stats.min} Max: {stats.max} Avg: {stats.avg}
                  </Typography>
                </CardContent>
              </Card>
            ))}

            {/* Search */}
            <Autocomplete
              freeSolo
              options={[]}
              value={searchQuery}
              onInputChange={(e, val) => {
                setSearchQuery(val);
                applyFilters({
                  tableData,
                  searchQuery: val,
                  activeFilters,
                  sortConfig,
                  setFilteredData,
                  calculateTableStats,
                });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
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
                    {TABLE_STRUCTURES[selectedTable].fields.map((field) => (
                      <TableCell key={field} onClick={() => handleSort(field)}>
                        {getFieldDisplayName(field)}
                      </TableCell>
                    ))}
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredData
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <TableRow key={row.id}>
                        {TABLE_STRUCTURES[selectedTable].fields.map((field) => (
                          <TableCell key={field}>
                            {formatDisplayValue(field, row[field])}
                          </TableCell>
                        ))}
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton
                              onClick={() =>
                                handleEdit({
                                  record: row,
                                  setFormData,
                                  setEditingRecord,
                                  setOpenDialog,
                                })
                              }
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton onClick={() => handleDelete(row.id)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            <TablePagination
              component="div"
              count={filteredData.length}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) =>
                handleChangeRowsPerPage(e, setRowsPerPage, setPage)
              }
            />
          </>
        ) : (
          <TableChart fontSize="large" />
        )}
      </Paper>
    </Box>
  );
};

export default ManagementTablesView;