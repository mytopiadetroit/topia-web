import axios from "axios";
import { toast } from 'react-toastify';

   const ConstantsUrl = "http://localhost:5000/api/";
// const ConstantsUrl = "https://api.mypsyguide.io/api/";

let isRedirecting = false;
 



// Add request interceptor to include token in headers
axios.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window === 'undefined') {
      return Promise.reject(error);
    }

    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRedirecting) {
        return Promise.reject(error);
      }
      
      isRedirecting = true;
      originalRequest._retry = true;
      
      // Clear user data
      localStorage.removeItem('userDetail');
      localStorage.removeItem('token');
      
      // Notify all components about auth change
      notifyAuthChange();
      
      // Show error message
      toast.error('Your session has expired. Please login again.');
      
      // Redirect to login page if not already there
      const currentPath = window.location.pathname;
      if (!currentPath.includes('login')) {
        if (window.router) {
          window.router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
        } else {
          window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
        }
      }
      
      // Reset redirect flag after delay
      setTimeout(() => {
        isRedirecting = false;
      }, 2000);
      
      return Promise.reject(error);
    }
    
    // For other errors, just reject
    return Promise.reject(error);
  }
);



function notifyAuthChange() {
  try {
    window.dispatchEvent(new Event('storage'));
    document.dispatchEvent(new Event('auth-state-changed'));
  } catch (error) {
    console.error('Error notifying auth change:', error);
  }
}

// Handle token expiration function (kept for backward compatibility)
const handleTokenExpiration = (router) => {
  if (isRedirecting) return true;
  
  console.log("Token expired, logging out user...");
  isRedirecting = true;
  
  try {
    // Clear user data
    localStorage.removeItem("userDetail");
    localStorage.removeItem("token");
    
    // Notify all components about auth change
    notifyAuthChange();
    
    // Show error message
    toast.error('Your session has expired. Please login again.');
    
    // Navigate to login page if not already there
    const currentPath = window.location.pathname;
    if (!currentPath.includes('login')) {
      if (router) {
        router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      } else if (window.router) {
        window.router.push(`/auth/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        window.location.href = `/auth/login?redirect=${encodeURIComponent(currentPath)}`;
      }
    }
    
    setTimeout(() => {
      isRedirecting = false;
    }, 2000);
    
    return true;
  } catch (error) {
    console.error("Error during logout:", error);
    isRedirecting = false;
    return false;
  }
};

// Function to clear auth data and redirect to login
export const logout = (router) => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('userDetail');
  localStorage.removeItem('token');
  notifyAuthChange();
  
  if (router) {
    router.push('/auth/login');
  } else if (window.router) {
    window.router.push('/auth/login');
  } else {
    window.location.href = '/auth/login';
  }
};

// Helper function to check if token exists and is valid
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem('token');
  return !!token; // You can add JWT expiration check here if needed
};

// Function to set global router
export const setGlobalRouter = (router) => {
  if (typeof window !== 'undefined') {
    window.router = router;
  }
};

// API function
function Api(method, url, data, router, params) {
  return new Promise(function (resolve, reject) {
   
    if (isRedirecting) {
      resolve({ success: false, redirect: true });
      return;
    }
    
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }
    
    axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers: { Authorization: `jwt ${token}` },
      params
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined") {
              handleTokenExpiration(router);
              return resolve({ success: false, redirect: true });
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}


function ApiFormData(method, url, data, router) {
  return new Promise(function (resolve, reject) {
   
    if (isRedirecting) {
      resolve({ redirect: true, message: "Logging you out. Please wait..." });
      return;
    }
    
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }
    
    axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers: {
        Authorization: `jwt ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        console.log(err);
        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined") {
              // Use the helper function
              if (handleTokenExpiration(router)) {
                return resolve({ redirect: true, message: "Session expired. Please login again." });
              }
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}

const timeSince = (date) => {
  date = new Date(date);
  const diff = new Date().valueOf() - date.valueOf();
  const seconds = Math.floor(diff / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " Years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Months" : " Month") +
      " ago"
    );
  }
  interval = seconds / 604800;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Weeks" : " Week") +
      " ago"
    );
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Days" : " Day") +
      " ago"
    );
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Hours" : " Hour") +
      " ago"
    );
  }
  interval = seconds / 60;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Min" : " min") +
      " ago"
    );
  }
  return "Just now";
};

export { Api, timeSince, ApiFormData };
