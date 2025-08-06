const burialFormValidation = (cachedUserData, burialForm, setErrorMessage) => {
    if (!burialForm.deceased_name || 
        !burialForm.deceased_age || 
        !burialForm.requested_by || 
        !burialForm.deceased_relationship || 
        !burialForm.address) {
        setErrorMessage('Please fill in all required fields for the burial.');
        return false;
    }
    if (!burialForm.contact_no) {
        // this line is for users so they dont have to enter contact num if they already have one in their profile
        // but since admin can also access this form, we will not use it for now, but it can be revised it necessary
        // burialForm.contact_no = cachedUserData.user_mobile || '';
        setErrorMessage('Please enter a contact number.');
        return false;
    } else if (burialForm.contact_no.length < 11 || !burialForm.contact_no.startsWith('09') || !/^\d+$/.test(burialForm.contact_no)) {
        setErrorMessage('Please enter a valid contact number.');
        return false;
    }
    
    if (!burialForm.place_of_mass || 
        !burialForm.mass_address) {
        setErrorMessage('Please fill in all required fields for the place of mass.');
        return false;
    }
    return true;
}

export default burialFormValidation;
