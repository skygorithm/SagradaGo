import React from 'react';
import { Box, Paper, Button, Typography, CircularProgress } from '@mui/material';
import { ChurchOutlined } from '@mui/icons-material';
import TableManager from '../common/TableManager';
import { SACRAMENT_TABLE_STRUCTURES, formatFieldName } from '../../config/tableConfig';

const SacramentTables = ({
  selectedSacrament,
  bookingLoading,
  sacramentTableData,
  sacramentFilteredData,
  setSacramentFilteredData,
  sacramentSearchQuery,
  setSacramentSearchQuery,
  sacramentSortConfig,
  setSacramentSortConfig,
  sacramentPage,
  setSacramentPage,
  sacramentRowsPerPage,
  setSacramentRowsPerPage,
  sacramentActiveFilters,
  setSacramentActiveFilters,
  sacramentVisibleColumns,
  setSacramentVisibleColumns,
  sacramentFilterAnchorEl,
  setSacramentFilterAnchorEl,
  sacramentColumnAnchorEl,
  setSacramentColumnAnchorEl,
  sacramentTableStats,
  sacramentCalculateTableStats,
  onSacramentSelect,
  onAdd,
  onEdit,
  onDelete,
  onSort,
  onFilterChange,
  renderCustomCell
}) => {
  return (
    <Box display="flex" gap={2}>
      {/* Tables Sidebar */}
      <Paper sx={{ p: 2, width: '200px' }}>
        <Typography variant="h6" gutterBottom>
          Sacrament Bookings
        </Typography>
        {Object.keys(SACRAMENT_TABLE_STRUCTURES).map((sacrament) => (
          <Button
            key={sacrament}
            fullWidth
            variant={selectedSacrament === sacrament ? 'contained' : 'text'}
            onClick={() => onSacramentSelect(sacrament)}
            sx={{ justifyContent: 'flex-center', mb: 1 }}
          >
            <span className='text-[#6B5F32] font-bold'>
              {SACRAMENT_TABLE_STRUCTURES[sacrament]?.displayName || formatFieldName(sacrament)}
            </span>
          </Button>
        ))}
      </Paper>

      <Paper sx={{ p: 2, flex: 1 }}>
        {bookingLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : selectedSacrament ? (
          <TableManager
            tableStructure={SACRAMENT_TABLE_STRUCTURES[selectedSacrament]}
            tableData={sacramentTableData}
            filteredData={sacramentFilteredData}
            setFilteredData={setSacramentFilteredData}
            loading={bookingLoading}
            searchQuery={sacramentSearchQuery}
            setSearchQuery={setSacramentSearchQuery}
            sortConfig={sacramentSortConfig}
            setSortConfig={setSacramentSortConfig}
            page={sacramentPage}
            setPage={setSacramentPage}
            rowsPerPage={sacramentRowsPerPage}
            setRowsPerPage={setSacramentRowsPerPage}
            activeFilters={sacramentActiveFilters}
            setActiveFilters={setSacramentActiveFilters}
            visibleColumns={sacramentVisibleColumns}
            setVisibleColumns={setSacramentVisibleColumns}
            filterAnchorEl={sacramentFilterAnchorEl}
            setFilterAnchorEl={setSacramentFilterAnchorEl}
            columnAnchorEl={sacramentColumnAnchorEl}
            setColumnAnchorEl={setSacramentColumnAnchorEl}
            tableStats={sacramentTableStats}
            calculateTableStats={sacramentCalculateTableStats}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onSort={onSort}
            onFilterChange={onFilterChange}
            renderCustomCell={renderCustomCell}
          />
        ) : (
          <div className='text-center flex flex-col items-center justify-center h-full'>
            <ChurchOutlined sx={{ mb: 2, fontSize: 64 }} className='text-[#E1D5B8]' />
            <Typography variant="h5" color="text.secondary">
              Select a sacrament to view the user booking records
            </Typography>
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default SacramentTables;