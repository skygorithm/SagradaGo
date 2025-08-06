const restrictSacramentBooking = (selectedSacrament, date) => {
    if (!selectedSacrament || !date) {
        return '';
    }
    if (selectedSacrament === 'Confession' && date < new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)) {
        return 'Confession bookings must be at least 2 days in advance.';
    } else if (selectedSacrament === 'Wedding' && date < new Date(Date.now() + 1 * 30 * 24 * 60 * 60 * 1000)) {
        return 'Wedding bookings must be at least 1 month in advance.';
    } else if (selectedSacrament === 'Burial' && date < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) {
        return 'Burial bookings must be at least 3 days in advance.';
    } else if (selectedSacrament === 'Baptism' && date < new Date(Date.now() + 1.5 * 30 * 24 * 60 * 60 * 1000)) {
        return 'Baptism bookings must be at least 1 and a half month in advance.';
    } else if (selectedSacrament === 'Confirmation' && date < new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000)) {
        return 'Confirmation bookings must be at least 2 months in advance.';
    } else if (selectedSacrament === 'First Communion' && date < new Date(Date.now() + 2 * 30 * 24 * 60 * 60 * 1000)) { 
        return 'First Communion bookings must be at least 2 months in advance.';
    }
    return '';
}

const getDateRestriction = (selectedSacrament) => {
    if (!selectedSacrament) {
        return 0;
    }
    switch (selectedSacrament) {
        case 'Confession':
            return ; 
        case 'Wedding':
            return 1 * 30; // 1 month
        case 'Burial':
            return 1; // 1 day
        case 'Baptism':
            return 1.5 * 30; // 1 and a half month
        case 'Confirmation':
            return 2 * 30; // 2 months
        case 'First Communion':
            return 2 * 30; // 2 months
        case 'Anointing of the Sick':
            return ; 
        default:
            return 0;
    }
}

const getMinimumBookingDate = (selectedSacrament) => {
    if (!selectedSacrament) {
        return null;
    }
    
    const daysAdvance = getDateRestriction(selectedSacrament);
    const minimumDate = new Date(Date.now() + daysAdvance * 24 * 60 * 60 * 1000);
    
    return minimumDate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export {
    restrictSacramentBooking,
    getDateRestriction,
    getMinimumBookingDate,
}