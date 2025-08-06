const baptismFormValidation = (cachedUserData, baptismForm, setErrorMessage) => {
    // Double check if required fields are filled
    if (baptismForm.baby_name == '' || !baptismForm.baby_bday || baptismForm.baby_birthplace  == '') {
        setErrorMessage('Please fill in all required fields for the baby.');
        return false;
    }
    if (baptismForm.mother_name == '' || baptismForm.mother_birthplace == '' || baptismForm.father_name == '' || baptismForm.father_birthplace == '') {
        setErrorMessage('Please fill in all required fields for the parents.');
        return false;
    }
    if (!baptismForm.marriage_type) {
        setErrorMessage('Please select the type of marriage for the parents.');
        return false;
    }
    if (!baptismForm.contact_no) {
        // baptismForm.contact_no = cachedUserData.user_mobile || '';
        setErrorMessage('Please enter a contact number.');
        return false;
    } else if (baptismForm.contact_no.length < 11 || !baptismForm.contact_no.startsWith('09') || !/^\d+$/.test(baptismForm.contact_no)) {
        setErrorMessage('Please enter a valid contact number.');
        return false;
    }
    if (!baptismForm.current_address) {
        setErrorMessage('Please enter the current address.');
        return false;
    }
    if (!baptismForm.main_godfather.name || 
        !baptismForm.main_godmother.name || 
        !baptismForm.main_godfather.age || !
        baptismForm.main_godmother.age || 
        !baptismForm.main_godfather.address || 
        !baptismForm.main_godmother.address
        ) {
        setErrorMessage('Please enter necessary information of the main godparents.');
        return false;
    }
    return true;
}

export default baptismFormValidation;