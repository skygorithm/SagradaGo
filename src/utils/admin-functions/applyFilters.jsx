const applyFilters = ({
    tableData, 
    searchQuery, 
    activeFilters,
    sortConfig,
    setFilteredData,
    calculateTableStats
}) => {
    let filtered = [...tableData];

    // Apply search query
    if (searchQuery) {
        filtered = filtered.filter(row => 
        Object.values(row).some(value => 
            String(value).toLowerCase().includes(searchQuery.toLowerCase())
        )
        );
    }

    // Apply active filters
    Object.entries(activeFilters).forEach(([field, { value, type }]) => {
        if (value) {
        filtered = filtered.filter(row => {
            const cellValue = String(row[field]).toLowerCase();
            const filterValue = String(value).toLowerCase();
            
            switch (type) {
            case 'contains':
                return cellValue.includes(filterValue);
            case 'equals':
                return cellValue === filterValue;
            case 'starts':
                return cellValue.startsWith(filterValue);
            case 'ends':
                return cellValue.endsWith(filterValue);
            case 'greater':
                return Number(cellValue) > Number(filterValue);
            case 'less':
                return Number(cellValue) < Number(filterValue);
            case 'older_to_newer':
                return true; // Handled in sorting
            case 'newer_to_older':
                return true; // Handled in sorting
            default:
                return cellValue.includes(filterValue);
            }
        });
        }
    });

    // Apply sorting if active
    if (sortConfig.key) {
        filtered.sort((a, b) => {
        if (a[sortConfig.key] === null) return 1;
        if (b[sortConfig.key] === null) return -1;
        
        // Handle date fields
        if (sortConfig.key.includes('date') || sortConfig.key.includes('bday') || sortConfig.key.includes('time')) {
            const dateA = new Date(a[sortConfig.key]);
            const dateB = new Date(b[sortConfig.key]);
            return sortConfig.direction === 'desc' ? dateB - dateA : dateA - dateB;
        }
        
        // Handle numeric fields
        if (typeof a[sortConfig.key] === 'number' && typeof b[sortConfig.key] === 'number') {
            return sortConfig.direction === 'desc' ? b[sortConfig.key] - a[sortConfig.key] : a[sortConfig.key] - b[sortConfig.key];
        }
        
        // Handle text fields
        const valueA = String(a[sortConfig.key]).toLowerCase();
        const valueB = String(b[sortConfig.key]).toLowerCase();
        return sortConfig.direction === 'desc'
            ? valueB.localeCompare(valueA)
            : valueA.localeCompare(valueB);
        });
    }

    setFilteredData(filtered);
    calculateTableStats(filtered);
};


export {
    applyFilters
};
