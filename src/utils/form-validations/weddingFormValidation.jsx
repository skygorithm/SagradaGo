const weddingFormValidation = (weddingForm, setErrorMessage) => {
    // Double check if required fields are filled
    if (!weddingForm.groom_fullname || !weddingForm.bride_fullname) {
        setErrorMessage('Please fill in the Groom and Bride\'s Names.');
        return false;
    }
    if (!weddingForm.contact_no) {
        // baptismForm.contact_no = cachedUserData.user_mobile || '';
        setErrorMessage('Please enter a contact number.');
        return false;
    } else if (weddingForm.contact_no.length < 11 || !weddingForm.contact_no.startsWith('09') || !/^\d+$/.test(weddingForm.contact_no)) {
        setErrorMessage('Please enter a valid contact number.');
        return false;
    }
    if (!weddingForm.groom_1x1 || !weddingForm.bride_1x1) {
        setErrorMessage('Please upload the 1x1 photos of both Groom and Bride.');
        return false;
    }
    if (!weddingForm.groom_baptismal_cert || !weddingForm.bride_baptismal_cert) {
        setErrorMessage('Please upload the baptismal certificates of both Groom and Bride.');
        return false;
    }
    if (!weddingForm.groom_confirmation_cert || !weddingForm.bride_confirmation_cert) {
        setErrorMessage('Please upload the confirmation certificates of both Groom and Bride.');
        return false;
    // }
    // if (!weddingForm.groom_banns || !weddingForm.bride_banns) {
    //     setErrorMessage('Please upload the banns of both Groom and Bride.');
    //     return false;
    }
    // if (!weddingForm.groom_permission || !weddingForm.bride_permission) {
    //     setErrorMessage('Please upload the permission documents of both Groom and Bride.');
    //     return false;
    // }
    return true;
}

export default weddingFormValidation;