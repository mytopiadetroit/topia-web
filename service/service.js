import axios from "axios";

// export const ConstantsUrl = "http://localhost:5008/api/";
export const ConstantsUrl = "https://api.mypsyguide.io/api/";

let isRedirecting = false;

// Api function for making API calls
function Api(method, url, data, router, params, preventRedirect = false) {
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
      headers: {
        Authorization: `jwt ${token}`,
        'X-Prevent-Redirect': preventRedirect ? 'true' : 'false'  // Add this header
      },
      params
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined" && !preventRedirect) {
              handleTokenExpiration(router);
              return resolve({ success: false, redirect: true });
            } else if (preventRedirect) {
              // Don't redirect, just reject with error
              return reject(err);
            }
          }
          reject(err);
        } else {
          reject(err);
        }
      }
    );
  });
}

// ApiFormData function for making API calls with FormData
function ApiFormData(method, url, data, router, params) {
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
      headers: {
        Authorization: `jwt ${token}`
        // Don't set Content-Type for FormData, let axios handle it
      },
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

// Axios interceptor for global error handling
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if redirect should be prevented
    const preventRedirect = error.config?.headers?.['X-Prevent-Redirect'] === 'true';

    if (error.response && error.response.status === 401 && typeof window !== "undefined") {
      // Agar preventRedirect true hai, to seedha error return karo without redirect
      if (preventRedirect) {
        return Promise.reject(error);
      }

      // Otherwise normal redirect logic
      if (!isRedirecting) {
        isRedirecting = true;

        if (typeof window !== "undefined") {
          localStorage.removeItem("userDetail");
          localStorage.removeItem("token");
          window.location.href = "/";
          window.dispatchEvent(new Event('storage'));
          document.dispatchEvent(new Event('auth-state-changed'));

          if (window.router && !window.router.pathname.includes("login")) {
            window.router.push("/");
          } else {
            window.location.href = "/";
          }
        }

        setTimeout(() => {
          isRedirecting = false;
        }, 2000);
      }

      return Promise.resolve({
        data: { success: false, redirect: true }
      });
    }
    return Promise.reject(error);
  }
);

function notifyAuthChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event('storage'));
    document.dispatchEvent(new Event('auth-state-changed'));
  }
}

const handleTokenExpiration = (router) => {
  if (isRedirecting) return true;

  console.log("Token expired, logging out user...");
  isRedirecting = true;

  try {
    if (typeof window !== "undefined") {
      localStorage.removeItem("userDetail");
      localStorage.removeItem("token");

      notifyAuthChange();

      if (router && !router.pathname.includes("login")) {
        router.push("/");
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

// Helper function to fetch all categories
const fetchAllCategories = async (router) => {
  try {
    return await Api('get', 'categories/categories', null, router);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

// Helper function to fetch products by category
const fetchProductsByCategory = async (categoryId, router) => {
  try {
    return await Api('get', `products/category/${categoryId}`, null, router);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

// Helper function to create product (multipart/form-data)
const createProduct = async (formData, router) => {
  try {
    return await ApiFormData('post', 'products', formData, router);
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Helper function to fetch all users
const fetchAllUsers = async (router) => {
  try {
    return await Api('get', 'users', null, router);
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Helper function to fetch user by ID
const fetchUserById = async (id, router) => {
  try {
    return await Api('get', `users/${id}`, null, router);
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

// Helper function to update user
const updateUser = async (id, userData, router) => {
  try {
    return await Api('put', `users/${id}`, userData, router);
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

// Helper function to delete user
const deleteUser = async (id, router) => {
  try {
    return await Api('delete', `users/${id}`, null, router);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

// Toast notification function
const toast = {
  success: (message) => {
    if (typeof window !== "undefined" && window.toast) {
      window.toast({ type: "success", message });
    }
  },
  error: (message) => {
    if (typeof window !== "undefined" && window.toast) {
      window.toast({ type: "error", message });
    }
  },
  info: (message) => {
    if (typeof window !== "undefined" && window.toast) {
      window.toast({ type: "info", message });
    }
  }
};

// Set global toast function
const setGlobalToast = (toastFunction) => {
  if (typeof window !== "undefined") {
    window.toast = toastFunction;
  }
};

// Set global router function
const setGlobalRouter = (routerInstance) => {
  if (typeof window !== "undefined") {
    window.router = routerInstance;
  }
};

// Reward system API calls
export const fetchRewardTasks = async (router) => {
  try {
    return await Api('get', 'rewards/tasks', null, router);
  } catch (error) {
    console.error('Error fetching reward tasks:', error);
    throw error;
  }
};

export const submitRewardClaim = async (router, formData) => {
  try {
    return await ApiFormData('post', 'rewards/claim', formData, router);
  } catch (error) {
    console.error('Error submitting reward claim:', error);
    throw error;
  }
};

export const fetchUserRewards = async (router) => {
  try {
    return await Api('get', 'rewards/history', null, router);
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    throw error;
  }
};

export const fetchRewardRequests = async (router) => {
  try {
    return await Api('get', 'rewards/requests', null, router);
  } catch (error) {
    console.error('Error fetching reward requests:', error);
    throw error;
  }
};

// Admin reward API calls
export const fetchAllRewardRequests = async (router, params = {}) => {
  try {
    return await Api('get', 'rewards/admin/requests', null, router, params);
  } catch (error) {
    console.error('Error fetching all reward requests:', error);
    throw error;
  }
};

export const updateRewardStatus = async (id, data, router) => {
  try {
    return await Api('put', `rewards/admin/requests/${id}`, data, router);
  } catch (error) {
    console.error('Error updating reward status:', error);
    throw error;
  }
};

export const fetchRewardStats = async (router) => {
  try {
    return await Api('get', 'rewards/admin/stats', null, router);
  } catch (error) {
    console.error('Error fetching reward stats:', error);
    throw error;
  }
};

export const fetchShopSettings = async () => {
  try {
    const response = await axios.get(ConstantsUrl + 'shop-settings');
    return response.data;
  } catch (error) {
    console.error('Error fetching shop settings:', error);
    throw error;
  }
};


export const updateProductOrder = async (productId, newOrder, router) => {
  try {
    const response = await Api('put', `products/${productId}/order`, { order: newOrder }, router);
    return response;
  } catch (error) {
    console.error('Error updating product order:', error);
    throw error;
  }
};

// Helper function to fetch all review tags
const fetchAllReviewTags = (router) => {
  return Api('GET', 'review-tags', null, router);
};

// Helper function to create a new review tag
const createReviewTagApi = (data, router) => {
  return Api('POST', 'review-tags', data, router);
};

// Helper function to update a review tag
const updateReviewTagApi = (id, data, router) => {
  return Api('PUT', `review-tags/${id}`, data, router);
};

// Helper function to delete a review tag
const deleteReviewTagApi = (id, router) => {
  return Api('DELETE', `review-tags/${id}`, null, router);
};

// Gallery helpers
const fetchGalleryImages = async (router) => {
  try {
    return await Api('get', 'gallery', null, router);
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    throw error;
  }
};

export {
  Api,
  timeSince,
  ApiFormData,
  setGlobalRouter,
  toast,
  setGlobalToast,
  fetchAllCategories,
  fetchProductsByCategory,
  createProduct,
  fetchAllUsers,
  fetchUserById,
  updateUser,
  deleteUser,
  fetchAllReviewTags,
  createReviewTagApi,
  updateReviewTagApi,
  deleteReviewTagApi,
  fetchGalleryImages
};
export const submitContactMessage = async (data, router) => {
  try {
    return await Api('post', 'contacts', data, router);
  } catch (error) {
    console.error('Error submitting contact:', error);
    throw error;
  }
};
// Newsletter subscription
export const subscribeEmail = async (email, router) => {
  try {
    return await Api('post', 'subscribers', { email }, router);
  } catch (error) {
    console.error('Error subscribing email:', error);
    throw error;
  }
};