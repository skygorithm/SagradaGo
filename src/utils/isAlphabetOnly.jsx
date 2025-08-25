export default function isAlphabetOnly(str) {
  // Only allows letters (upper/lower), spaces, and hyphens
  const nameRegex = /^[A-Za-z\s\-]+$/;
  return nameRegex.test(str);
}