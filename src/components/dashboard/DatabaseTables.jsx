import React from 'react';
import { Box, Paper, Button, Typography, CircularProgress, Divider } from '@mui/material';
import { TableChart } from '@mui/icons-material';
import TableManager from '../common/TableManager';
import { TABLE_STRUCTURES, formatFieldName } from '../../config/tableConfig';

const DatabaseTables = ({
  selectedTable,
  loading,
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
  activeFilters,
  setActiveFilters,
  visibleColumns,
  setVisibleColumns,
  filterAnchorEl,
  setFilterAnchorEl,
  columnAnchorEl,
  setColumnAnchorEl,
  tableStats,
  calculateTableStats,
  onTableSelect,
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
          Management
        </Typography>
        {Object.keys(TABLE_STRUCTURES).map((table) => (
          <React.Fragment key={table}>
            <Button
              fullWidth
              variant={selectedTable === table ? 'contained' : 'text'}
              onClick={() => onTableSelect(table)}
              sx={{ justifyContent: 'flex-center', mb: 1 }}
            >
              <span className='text-[#6B5F32] font-bold'>
                {TABLE_STRUCTURES[table]?.displayName || formatFieldName(table)}
              </span>
            </Button>
            {table === 'request_tbl' && (
              <Divider sx={{ my: 1 }} />
            )}
          </React.Fragment>
        ))}
      </Paper>

      <Paper sx={{ p: 2, flex: 1 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : selectedTable ? (
          <TableManager
            tableStructure={TABLE_STRUCTURES[selectedTable]}
            tableData={tableData}
            filteredData={filteredData}
            setFilteredData={setFilteredData}
            loading={loading}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            activeFilters={activeFilters}
            setActiveFilters={setActiveFilters}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
            filterAnchorEl={filterAnchorEl}
            setFilterAnchorEl={setFilterAnchorEl}
            columnAnchorEl={columnAnchorEl}
            setColumnAnchorEl={setColumnAnchorEl}
            tableStats={tableStats}
            calculateTableStats={calculateTableStats}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            onSort={onSort}
            onFilterChange={onFilterChange}
            renderCustomCell={renderCustomCell}
          />
        ) : (
          <div className='text-center flex flex-col items-center justify-center h-full'>
            <TableChart sx={{ mb: 2, fontSize: 64 }} className='text-[#E1D5B8]' />
            <Typography variant="h5" color="text.secondary">
              Select a table to view its data
            </Typography>
          </div>
        )}
      </Paper>
    </Box>
  );
};

export default DatabaseTables;