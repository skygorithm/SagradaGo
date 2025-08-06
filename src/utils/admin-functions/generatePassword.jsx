function generatePassword(length) {
    const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
    const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numberChars = '0123456789';

    // Combine all allowed characters
    let allChars = lowerCase + upperCase + numberChars;
    let password = '';

    // If the length is 3 or more, ensure at least one of each type
    if (length >= 3) {
        // Add at least one character from each set to ensure variety
        password += lowerCase[Math.floor(Math.random() * lowerCase.length)];
        password += upperCase[Math.floor(Math.random() * upperCase.length)];
        password += numberChars[Math.floor(Math.random() * numberChars.length)];
    }

    // Fill the remaining length with random characters from the combined set
    for (let i = password.length; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * allChars.length);
        password += allChars[randomIndex];
    }

    // Shuffle the password to randomize the order of the initially guaranteed characters
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}

export default generatePassword;