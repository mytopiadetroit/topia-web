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

  useEffect(() => {
  try {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      
      
      // const totalQuantity = parsedCart.reduce((total, item) => total + (item.quantity || 0), 0);
      
     
      const totalQuantity = parsedCart.length;
      
      setCartCount(totalQuantity);
    }
    
    // ... rest of the code stays same
  } catch (error) {
    console.error('Error initializing app state:', error);
  }
}, []);

  // Persist cart and derive cartCount whenever cart changes
 useEffect(() => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
    
   
    // const totalQuantity = cart.reduce((total, item) => total + (item.quantity || 0), 0);
    
   
    const totalQuantity = cart.length;
    
    setCartCount(totalQuantity);
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
}, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    const productId = getItemId(product);
    const variantId = product.selectedVariant?._id;
    const flavorId = product.selectedFlavor?._id;
    
    // Determine the price based on whether it's a variant or base product
    const price = variantId ? (product.selectedVariant?.price || product.price) : product.price;

    setCart(prevCart => {
      // Find existing item with same product, variant, and flavor
      const existingItemIndex = prevCart.findIndex(item => {
        const isSameProduct = getItemId(item) === productId;
        const isSameVariant = variantId ? 
          (item.selectedVariant?._id === variantId) : 
          !item.selectedVariant;
        const isSameFlavor = flavorId ? 
          (item.selectedFlavor?._id === flavorId) : 
          !item.selectedFlavor;
        return isSameProduct && isSameVariant && isSameFlavor;
      });
      
      if (existingItemIndex >= 0) {
        // Item exists, update quantity and price
        const updatedCart = [...prevCart];
        const currentQuantity = updatedCart[existingItemIndex].quantity || 0;
        const newQuantity = currentQuantity + quantity;
        
        // For variants, check variant stock; otherwise check product stock
        const maxStock = variantId 
          ? Number(product.selectedVariant?.stock || 0)
          : Number(product.stock || 0);
        
        // Check if adding this quantity would exceed stock
        updatedCart[existingItemIndex].quantity = maxStock > 0 ? 
          Math.min(newQuantity, maxStock) : newQuantity;
          
        // Update price in case it changed
        updatedCart[existingItemIndex].price = price;
        
        return updatedCart;
      } else {
        // Item doesn't exist, add new item
        const maxStock = variantId 
          ? Number(product.selectedVariant?.stock || 0)
          : Number(product.stock || 0);
          
        const finalQuantity = maxStock > 0 ? Math.min(quantity, maxStock) : quantity;
        
        const normalizedProduct = {
          ...product,
          id: productId,
          price, // Set the correct price based on variant
          quantity: finalQuantity,
          intensity: product.intensity || 5,
          selectedVariant: product.selectedVariant || null,
          selectedFlavor: product.selectedFlavor || null
        };
        
        return [...prevCart, normalizedProduct];
      }
    });
  };

  const removeFromCart = (productId, variant = null, flavor = null) => {
    setCart(prevCart => {
      return prevCart.filter(item => {
        const isSameProduct = getItemId(item) === productId;
        if (!isSameProduct) return true; // Keep items with different product IDs
        
        // If variant is specified, check for matching variant
        if (variant) {
          const isSameVariant = item.selectedVariant?._id === variant._id;
          // If flavor is also specified, check for matching flavor too
          if (flavor) {
            const isSameFlavor = item.selectedFlavor?._id === flavor._id;
            return !(isSameVariant && isSameFlavor);
          }
          return !isSameVariant;
        }
        
        // If no variant specified but flavor is, check only flavor
        if (flavor) {
          const isSameFlavor = item.selectedFlavor?._id === flavor._id;
          return !isSameFlavor;
        }
        
        // If neither variant nor flavor is specified, remove all items with this product ID
        return false;
      });
    });
  };
 const updateCartItemQuantity = (productId, quantity, variant = null, flavor = null) => {
  if (quantity <= 0) {
    removeFromCart(productId, variant, flavor);
    return;
  }
  
  setCart(prevCart => {
    const updatedCart = prevCart.map(item => {
      const isSameProduct = getItemId(item) === productId;
      
      if (!isSameProduct) return item;
      
      // Check if variant and flavor match (if specified)
      const isSameVariant = variant 
        ? item.selectedVariant?._id === variant._id 
        : !variant;
      const isSameFlavor = flavor 
        ? item.selectedFlavor?._id === flavor._id 
        : !flavor;
      
      if (isSameVariant && isSameFlavor) {
        // Get max stock from variant or product
        const maxStock = variant 
          ? Number(variant.stock || 0)
          : Number(item.stock || 0);
        
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