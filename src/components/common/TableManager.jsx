import React from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Tooltip,
  Autocomplete,
  TextField,
  InputAdornment,
  Menu,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Chip,
  FormControl,
  Select,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  FilterList as FilterListIcon,
  ViewColumn as ViewColumnIcon,
  SaveAlt as SaveAltIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { applyFilters } from '../../utils/admin-functions/applyFilters';
import { handleChangeRowsPerPage, handleColumnClick, handleColumnToggle, handleFilterClick } from '../../utils/admin-functions/handleFilterOptions';
import exportToCSV from '../../utils/admin-functions/exportToCSV';
import { formatDisplayValue } from '../../utils/admin-functions/formatDatabaseValue';

const TableManager = ({
  // Data and Structure
  tableStructure,
  tableData,
  filteredData,
  setFilteredData,
  
  // UI State
  loading,
  searchQuery,
  setSearchQuery,
  sortConfig,
  setSortConfig,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  
  // Filters and Columns
  activeFilters,
  setActiveFilters,
  visibleColumns,
  setVisibleColumns,
  filterAnchorEl,
  setFilterAnchorEl,
  columnAnchorEl,
  setColumnAnchorEl,
  
  // Statistics
  tableStats,
  calculateTableStats,
  
  // Actions
  onAdd,
  onEdit,
  onDelete,
  onSort,
  onFilterChange,
  
  // Custom rendering
  renderCustomCell,
  customActions,
  
  // Display options
  title,
  showStats = true,
  showSearch = true,
  showFilters = true,
  showColumns = true,
  showExport = true,
  showAdd = true
}) => {
  
  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
    if (onSort) {
      onSort(key, direction);
    }
  };

  const handleFilterChangeLocal = (field, value, type = 'contains') => {
    let newFilter = { ...activeFilters };
    newFilter = {
      ...newFilter,
      [field]: { value, type }
    };
    setActiveFilters(newFilter);
    
    applyFilters({
      tableData,
      searchQuery,
      activeFilters: newFilter,
      sortConfig,
      setFilteredData,
      calculateTableStats,
    });
    
    if (onFilterChange) {
      onFilterChange(field, value, type);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Header with title and action buttons */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          {title || tableStructure?.displayName}
        </Typography>
        <Box>
          {showFilters && (
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={(e) => handleFilterClick(e, setFilterAnchorEl)}
              sx={{ mr: 1, color: '#6B5F32' }}
            >
              Filters
            </Button>
          )}
          {showColumns && (
            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={(e) => handleColumnClick(e, setColumnAnchorEl)}
              sx={{ mr: 1, color: '#6B5F32' }}
            >
              Columns
            </Button>
          )}
          {showExport && (
            <Button
              variant="outlined"
              startIcon={<SaveAltIcon />}
              onClick={() => exportToCSV(filteredData, tableStructure?.tableName)}
              sx={{ mr: 1, color: '#6B5F32' }}
            >
              Export
            </Button>
          )}
          {showAdd && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
            >
              Add New
            </Button>
          )}
        </Box>
      </Box>

      {/* Table Statistics */}
      {showStats && Object.keys(tableStats).length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Statistics</Typography>
          <Grid container spacing={2}>
            {Object.entries(tableStats).map(([field, stats]) => (
              <Grid item xs={12} sm={4} key={field}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Typography>
                    <Typography variant="body2">
                      Min: {stats.min.toFixed(2)} | Max: {stats.max.toFixed(2)} | Avg: {stats.avg.toFixed(2)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Search */}
      {showSearch && (
        <Autocomplete
          freeSolo
          options={[]}
          value={searchQuery}
          onChange={(event, newValue) => {
            setSearchQuery(newValue);
            applyFilters({
              tableData,
              searchQuery: newValue,
              activeFilters,
              sortConfig,
              setFilteredData,
              calculateTableStats,
            });
          }}
          onInputChange={(event, newValue) => {
            setSearchQuery(newValue);
            applyFilters({
              tableData,
              searchQuery: newValue,
              activeFilters,
              sortConfig,
              setFilteredData,
              calculateTableStats,
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              variant="outlined"
              placeholder="Search..."
              sx={{ mb: 2 }}
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
      )}

      {/* Active Filters Display */}
      {Object.entries(activeFilters).some(([_, filter]) => filter.value) && (
        <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Object.entries(activeFilters).map(([field, { value, type }]) => (
            value && (
              <Chip
                key={field}
                label={`${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${value} (${type})`}
                onDelete={() => {
                  const newFilters = { ...activeFilters };
                  delete newFilters[field];
                  setActiveFilters(newFilters);
                  applyFilters({
                    tableData,
                    searchQuery,
                    activeFilters: newFilters,
                    sortConfig,
                    setFilteredData,
                    calculateTableStats,
                  });
                }}
                color="primary"
                variant="outlined"
              />
            )
          ))}
        </Box>
      )}

      {/* Filter Menu */}
      <Menu
        anchorEl={filterAnchorEl}
        open={Boolean(filterAnchorEl)}
        onClose={() => setFilterAnchorEl(null)}
        PaperProps={{
          style: {
            maxHeight: 400,
            width: '300px',
          },
        }}
      >
        {tableStructure?.fields.map((field) => (
          <Box key={field} sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Typography>
            <TextField
              fullWidth
              size="small"
              value={activeFilters[field]?.value || ''}
              onChange={(e) => handleFilterChangeLocal(field, e.target.value)}
              placeholder="Filter value..."
            />
            <Box sx={{ mt: 1 }}>
              <FormControl size="small" fullWidth>
                <Select
                  value={activeFilters[field]?.type || 'contains'}
                  onChange={(e) => handleFilterChangeLocal(field, activeFilters[field]?.value || '', e.target.value)}
                  size="small"
                >
                  <MenuItem value="contains">Contains</MenuItem>
                  <MenuItem value="equals">Equals</MenuItem>
                  <MenuItem value="starts">Starts with</MenuItem>
                  <MenuItem value="ends">Ends with</MenuItem>
                  {(field.includes('date') || field.includes('bday') || field.includes('timestamp')) && (
                    <>
                      <MenuItem value="older_to_newer">Older to Newer</MenuItem>
                      <MenuItem value="newer_to_older">Newer to Older</MenuItem>
                    </>
                  )}
                  {typeof tableData[0]?.[field] === 'number' && (
                    <>
                      <MenuItem value="greater">Greater than</MenuItem>
                      <MenuItem value="less">Less than</MenuItem>
                    </>
                  )}
                </Select>
              </FormControl>
            </Box>
          </Box>
        ))}
      </Menu>

      {/* Column Visibility Menu */}
      <Menu
        anchorEl={columnAnchorEl}
        open={Boolean(columnAnchorEl)}
        onClose={() => setColumnAnchorEl(null)}
      >
        {tableStructure?.fields.map((field) => (
          <MenuItem key={field}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={visibleColumns[field] !== false}
                  onChange={() => handleColumnToggle({setVisibleColumns, field})}
                />
              }
              label={field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            />
          </MenuItem>
        ))}
      </Menu>

      {/* Table */}
      <TableContainer sx={{ maxHeight: 440, overflow:'auto' }} className='rounded-2xl overflow-hidden shadow-lg'>
        <Table stickyHeader>
          <TableHead className='hover:bg-[#E1D5B8]'>
            <TableRow>
              {tableStructure?.fields
                .filter(field => visibleColumns[field] !== false)
                .map((field) => (
                  <TableCell 
                    key={field}
                    onClick={() => handleSort(field)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      {field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      {sortConfig.key === field && (
                        <Box component="span" ml={1}>
                          {sortConfig.direction === 'asc' ? '↑' : '↓'}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
                ))}
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index} className='hover:bg-[#F5F0E2]'>
                  {tableStructure?.fields
                    .filter(field => visibleColumns[field] !== false)
                    .map((field) => (
                      <TableCell key={field}>
                        {renderCustomCell ? 
                          renderCustomCell(field, row, index) : 
                          formatDisplayValue(field, row[field])
                        }
                      </TableCell>
                    ))}
                  <TableCell>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => onEdit(row)}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton onClick={() => onDelete(row.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                    {customActions && customActions(row)}
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
        onRowsPerPageChange={(e) => handleChangeRowsPerPage(e, setRowsPerPage, setPage)}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </>
  );
};

export default TableManager;