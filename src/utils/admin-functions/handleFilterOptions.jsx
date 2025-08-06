const handleChangeRowsPerPage = (event, setRowsPerPage, setPage) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
};

const handleFilterClick = (event, setFilterAnchorEl) => {
    setFilterAnchorEl(event.currentTarget);
};

const handleColumnClick = (event, setColumnAnchorEl) => {
    setColumnAnchorEl(event.currentTarget);
};

const handleFilterClose = (setFilterAnchorEl) => {
    setFilterAnchorEl(null);
};

const handleColumnClose = (setColumnAnchorEl) => {
    setColumnAnchorEl(null);
};

const handleColumnToggle = ({setVisibleColumns, field}) => {
    setVisibleColumns(prev => ({
        ...prev,
        [field]: !prev[field]
    }));
};

export {
    handleChangeRowsPerPage,
    handleFilterClick,
    handleColumnClick,
    handleFilterClose,
    handleColumnClose,
    handleColumnToggle
}