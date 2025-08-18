export function isAlphaNumeric(str) {
    const regex = /^[a-zA-Z0-9]+$/;
    return regex.test(str);
}