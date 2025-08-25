import { createContext, useState, useContext, useEffect } from 'react';

// Create the context
const AppContext = createContext();

// Custom hook to use the app context
export const useApp = () => {
  return useContext(AppContext);
};

// Helper to normalize IDs across backend (_id) and frontend (id)
const getItemId = (obj) => (obj && (obj.id || obj._id)) || undefined;

// Provider component that wraps the app
export const AppProvider = ({ children }) => {
  // Cart state
  const [cart, setCart] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(false);
  
  // Language state
  const [language, setLanguage] = useState('en');
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        setCart(parsedCart);
        // Count total quantity of all items for navbar badge
        const totalQuantity = parsedCart.reduce((total, item) => total + (item.quantity || 0), 0);
        setCartCount(totalQuantity);
      }
      
      // Check for saved theme preference
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme) {
        setDarkMode(savedTheme === 'true');
      }
      
      // Check for saved language preference
      const savedLanguage = localStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Error initializing app state:', error);
    }
  }, []);

  // Persist cart and derive cartCount whenever cart changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(cart));
      // Count total quantity of all items in cart
      const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 0), 0);
      setCartCount(totalQuantity);
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    const productId = getItemId(product);

    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => getItemId(item) === productId);
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        const updatedCart = [...prevCart];
        const currentQuantity = updatedCart[existingItemIndex].quantity || 0;
        const newQuantity = currentQuantity + quantity;
        const maxStock = Number(product.stock || 0);
        
        // Check if adding this quantity would exceed stock
        if (maxStock > 0 && newQuantity > maxStock) {
          // Limit to available stock
          updatedCart[existingItemIndex].quantity = maxStock;
        } else {
          updatedCart[existingItemIndex].quantity = newQuantity;
        }
        return updatedCart;
      } else {
        // Item doesn't exist, add new item
        const maxStock = Number(product.stock || 0);
        const finalQuantity = maxStock > 0 ? Math.min(quantity, maxStock) : quantity;
        
        const normalizedProduct = {
          ...product,
          // Ensure consistent id field exists for comparisons later
          id: productId,
          quantity: finalQuantity
        };
        return [...prevCart, normalizedProduct];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    setCart(prevCart => {
      return prevCart.filter(item => getItemId(item) !== productId);
    });
  };

  // Update item quantity with stock validation
  const updateCartItemQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => {
        if (getItemId(item) === productId) {
          const maxStock = Number(item.stock || 0);
          // If stock is available, limit quantity to stock
          if (maxStock > 0 && quantity > maxStock) {
            return { ...item, quantity: maxStock };
          }
          return { ...item, quantity };
        }
        return item;
      });
      return updatedCart;
    });
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
    setCartCount(0);
  };

  // Toggle theme
  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  };

  // Change language
  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Set loading state
  const setLoading = (state) => {
    setIsLoading(state);
  };

  // Context value
  const value = {
    // Cart
    cart,
    cartCount,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    
    // Theme
    darkMode,
    toggleDarkMode,
    
    // Language
    language,
    changeLanguage,
    
    // Loading
    isLoading,
    setLoading
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};