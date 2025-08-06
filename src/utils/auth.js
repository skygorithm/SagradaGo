export const loginUser = (userData) => {
    // Simulate login by storing the user data in localStorage
    localStorage.setItem('user', JSON.stringify(userData));
  };
  
  export const logoutUser = () => {
    // Clear user data from localStorage
    localStorage.removeItem('user');
  };
  
  export const isUserLoggedIn = () => {
    // Check if user data exists in localStorage
    return localStorage.getItem('user') !== null;
  };
  
  export const getUser = () => {
    return JSON.parse(localStorage.getItem('user'));
  };
  