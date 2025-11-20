import { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';

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

  // Check if token is valid
  const isTokenValid = useCallback((token) => {
    if (!token) return false;
    
    try {
      // Decode the token to check expiration
      const base64Url = token.split('.')[1];
      if (!base64Url) return false;
      
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(window.atob(base64));
      
      // Check if token is expired
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (error) {
      console.error('Error validating token:', error);
      return false;
    }
  }, []);

  // Clear user session
  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userDetail');
    setUser(null);
    setIsLoggedIn(false);
    document.dispatchEvent(new Event('auth-state-changed'));
  }, []);

  // Refresh user data from the server
  const refreshUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      // Use the correct endpoint for fetching user profile
      const response = await fetch('https://api.mypsyguide.io/api/auth/profile', {
        headers: {
          'Authorization': `jwt ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const userData = await response.json();
        if (userData.success && userData.user) {
          setUser(userData.user);
          localStorage.setItem('userDetail', JSON.stringify(userData.user));
          setIsLoggedIn(true);
          return userData.user;
        } else if (userData.message === 'User not found' || userData.message === 'Invalid token') {
          // Handle invalid or expired token
          clearSession();
        }
      } else if (response.status === 401) {
        // Handle unauthorized (token expired or invalid)
        clearSession();
      }
      return null;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return null;
    }
  }, [clearSession]);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkUserLoggedIn = () => {
      try {
        const token = localStorage.getItem('token');
        const userDetail = localStorage.getItem('userDetail');
        
        // If no token or user detail, clear session
        if (!token || !userDetail) {
          clearSession();
          return;
        }
        
        // Check if token is valid
        if (!isTokenValid(token)) {
          console.log('Token is invalid or expired');
          clearSession();
          return;
        }
        
        // Set user data
        setUser(JSON.parse(userDetail));
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error checking user login status:', error);
        clearSession();
      } finally {
        setLoading(false);
      }
    };

    // Initial check
    checkUserLoggedIn();
    
    // Listen for storage events (when localStorage changes in other tabs)
    const handleStorageChange = (event) => {
      if (event.key === 'token' || event.key === 'userDetail' || !event.key) {
        checkUserLoggedIn();
      }
    };
    
    // Listen for custom auth state changed event
    const handleAuthStateChanged = () => {
      checkUserLoggedIn();
    };
    
    // Listen for API errors
    const handleApiError = (event) => {
      if (event.detail?.status === 401 || event.detail?.status === 403) {
        clearSession();
        toast.error('Your session has expired. Please login again.');
        router.push('/auth/login');
      }
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('auth-state-changed', handleAuthStateChanged);
    window.addEventListener('api-error', handleApiError);
    
    // Clean up event listeners
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('auth-state-changed', handleAuthStateChanged);
      window.removeEventListener('api-error', handleApiError);
    };
  }, [isTokenValid, clearSession, router]);

  // Login function
  const login = (userData, token) => {
    try {
      // Save to localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('userDetail', JSON.stringify(userData));
      
      // Update state
      setUser(userData);
      setIsLoggedIn(true);
      
      // Dispatch auth-state-changed event
      document.dispatchEvent(new Event('auth-state-changed'));
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear session
      clearSession();
      
      // Show success message
      toast.success('Successfully logged out');
      
      // Redirect to login page if not already there
      if (router.pathname !== '/auth/login') {
        router.push('/auth/login');
      }
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
      return false;
    }
  }, [clearSession, router]);

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
    updateUser,
    refreshUserData  // Add refreshUserData to the context value
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};