import { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/router';

// Create the context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  return useContext(UserContext);
};

// Provider component that wraps the app
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = () => {
      try {
        const token = localStorage.getItem('token');
        const userDetail = localStorage.getItem('userDetail');
        
        if (token && userDetail) {
          setUser(JSON.parse(userDetail));
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Error checking user login status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserLoggedIn();
  }, []);

  // Login function
  const login = (userData, token) => {
    try {
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userDetail', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoggedIn(true);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    try {
      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('userDetail');
      
      // Update state
      setUser(null);
      setIsLoggedIn(false);
      
      // Redirect to login page
      router.push('/auth/login');
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      return false;
    }
  };

  // Update user data
  const updateUser = (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      
      // Update localStorage
      localStorage.setItem('userDetail', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };

  // Context value
  const value = {
    user,
    isLoggedIn,
    loading,
    login,
    logout,
    updateUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};