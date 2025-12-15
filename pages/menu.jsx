import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { debounce } from 'lodash';
import { ChevronDown, ChevronUp, Filter, X, Menu as MenuIcon, Tag, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useWishlist } from '../context/WishlistContext';
import { Api, fetchAllReviewTags } from '../service/service';

const Menu = () => {
  const router = useRouter();
  const { isLoggedIn, loading, user, refreshUserData } = useUser();
  const { addToCart, cart, updateCartItemQuantity } = useApp();
  const [addedSet, setAddedSet] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [primaryUseOpen, setPrimaryUseOpen] = useState(true);
  const [intensityOpen, setIntensityOpen] = useState(true);
  const [reviewTagsOpen, setReviewTagsOpen] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hoveredProductId, setHoveredProductId] = useState(null);
  const { isInWishlist, toggle } = useWishlist();
  const [reviewAggByProduct, setReviewAggByProduct] = useState({});
  const [reviewTags, setReviewTags] = useState([]);
  const [selectedReviewTags, setSelectedReviewTags] = useState({});
  const [categoryFilters, setCategoryFilters] = useState({});
  const [primaryUseFilters, setPrimaryUseFilters] = useState({
    therapeutic: false,
    functional: false
  });
  const [intensityFilters, setIntensityFilters] = useState({
    mild: false,
    medium: false,
    strong: false
  });
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [localPriceRange, setLocalPriceRange] = useState([0, 0]);
  const [priceRangeOpen, setPriceRangeOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showPendingMessage, setShowPendingMessage] = useState(false);
  const ITEMS_PER_PAGE = 15;

  // Debug logs
  console.log('Auth State:', {
    loading,
    isLoggedIn,
    user: user ? { ...user, status: user.status } : null,
    currentTime: new Date().toISOString()
  });

  // Handle user status and loading state in useEffect
  const [initialLoad, setInitialLoad] = useState(true);
  const [userStatusChecked, setUserStatusChecked] = useState(false);

  useEffect(() => {
    const initializeUserData = async () => {
      if (isLoggedIn) {
        await refreshUserData();
      }
      setInitialLoad(false);
    };
    
    initializeUserData();

    const intervalId = setInterval(async () => {
      if (isLoggedIn) {
        await refreshUserData();
      }
    }, 30000);

    return () => clearInterval(intervalId);
  }, [isLoggedIn, refreshUserData]);

  // Handle user status and products
  useEffect(() => {
    // Skip if still in initial load or user data isn't ready
    if (initialLoad || (isLoggedIn && !user)) {
      console.log('Initial load or waiting for user data');
      return;
    }

    // Only block suspended users, allow pending and incomplete
    if (isLoggedIn && user?.status === 'suspend') {
      console.log('User is suspended, clearing products');
      setProducts([]);
      setFilteredProducts([]);
      setShowPendingMessage(true);
      setUserStatusChecked(true);
    } else {
      setShowPendingMessage(false);
      setUserStatusChecked(true);
    }
  }, [initialLoad, isLoggedIn, user]);

  // Check user status before any data fetching
  useEffect(() => {
    console.log('useEffect - User status check:', {
      loading,
      isLoggedIn,
      userStatus: user?.status,
      hasUser: !!user,
      currentTime: new Date().toISOString()
    });
    
    // Only block suspended users
    if (!loading && isLoggedIn && user?.status === 'suspend') {
      console.log('Clearing product data due to suspended status');
      setProducts([]);
      setFilteredProducts([]);
      setLoadingData(false);
      return;
    }

    if (!loading && !isLoggedIn) {
      router.push('/auth/login');
      return;
    }
  }, [loading, isLoggedIn, user, router]);

  // Fetch review tags
  const fetchReviewTags = async () => {
    // Allow all users except suspended
    if (user?.status === 'suspend') return;
    
    try{
      const response = await fetchAllReviewTags(router);
      if (response.success) {
        setReviewTags(response.data || []);
        const initialTags = {};
        response.data.forEach(tag => {
          initialTags[tag._id] = false;
        });
        setSelectedReviewTags(initialTags);
      }
    } catch (error) {
      console.error('Error fetching review tags:', error);
      toast.error('Failed to load review tags');
    }
  };

  // Main data fetching effect with safety timeout
  useEffect(() => {
    // Safety timeout - if loading takes too long, force data fetch
    const safetyTimeout = setTimeout(() => {
      if (loadingData && isLoggedIn) {
        console.log('⚠️ Safety timeout triggered - forcing data fetch');
        fetchCategories();
        fetchProducts();
        fetchReviewTags();
      }
    }, 3000); // 3 seconds timeout

    if (!loading) {
      if (!isLoggedIn) {
        toast.error('Please login to access the menu', {
          position: "bottom-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            backgroundColor: '#f44336',
            color: 'white',
            fontWeight: '500',
            borderRadius: '8px'
          }
        });
        router.push('/auth/login');
      } else {
        fetchCategories();
        fetchProducts();
        fetchReviewTags();
      }
    }

    return () => clearTimeout(safetyTimeout);
  }, [isLoggedIn, loading, router]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleHomeClick = () => {
    router.push('/');
  };

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoadingData(true);
      const response = await Api('GET', 'categories/categories', null, router);
      console.log('Categories API Response:', response);
      if (response.success) {
        setCategories(response.data);

        const { category, primaryUse } = router.query;
        const initialFilters = {};

        response.data.forEach(cat => {
          initialFilters[cat._id] = category ?
            (Array.isArray(category) ? category.includes(cat._id) : category === cat._id) :
            false;
        });

        setCategoryFilters(initialFilters);

        if (primaryUse) {
          const selectedPrimaryUses = Array.isArray(primaryUse) ? primaryUse : [primaryUse];
          setPrimaryUseFilters({
            therapeutic: selectedPrimaryUses.includes('therapeutic'),
            functional: selectedPrimaryUses.includes('functional')
          });
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      // Always clear loading state
      setLoadingData(false);
    }
  };

  const fetchProducts = async () => {
    console.log('Fetching products - user status:', user?.status);
    // Only block suspended users
    if (user?.status === 'suspend') {
      console.log('Skipping product fetch - user is suspended');
      setProducts([]);
      setFilteredProducts([]);
      setLoadingData(false); // Important: clear loading state
      return;
    }
    
    try {
      setLoadingData(true);
      const response = await Api('GET', 'products?limit=10000&populate=reviewTags', null, router);
      console.log('Products API Response:', response);
      if (response.success) {
        const allProducts = response.data || [];
        setProducts(allProducts);
        setFilteredProducts(allProducts);

        if (allProducts.length > 0) {
          const prices = allProducts.map(p => p.price);
          const min = Math.floor(Math.min(...prices) / 20) * 20;
          const max = Math.ceil(Math.max(...prices) / 20) * 20;
          setPriceRange([min, max]);
          setLocalPriceRange([min, max]);
        }

        const ids = allProducts.map(p => p._id);
        fetchAggregatesForProducts(ids);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoadingData(false);
    }
  };

  const fetchAggregatesForProducts = async (ids) => {
    try {
      const results = await Promise.all(ids.map(id => Api('GET', `reviews/product/${id}/aggregate?limit=5`, null, router).then(r => ({ id, r }))))
      const map = {};
      results.forEach(({ id, r }) => { if (r && r.success) map[id] = r.data || []; });
      setReviewAggByProduct(prev => ({ ...prev, ...map }));
    } catch (e) {
      // silent fail
    }
  };

  const [hasCategorySelected, setHasCategorySelected] = useState(false);

  useEffect(() => {
    let filtered = [...products];

    const selectedCategories = Object.keys(categoryFilters).filter(key => categoryFilters[key]);
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product =>
        product.category && selectedCategories.includes(
          typeof product.category === 'object' ? product.category._id : product.category
        )
      );
    }

    const selectedPrimaryUses = Object.keys(primaryUseFilters).filter(key => primaryUseFilters[key]);
    if (selectedPrimaryUses.length > 0) {
      filtered = filtered.filter(product =>
        selectedPrimaryUses.includes(product.primaryUse)
      );
    }

    const selectedIntensities = Object.keys(intensityFilters).filter(key => intensityFilters[key]);
    if (selectedIntensities.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.intensity) return false;
        const intensity = parseInt(product.intensity, 10);
        return selectedIntensities.some(type => {
          if (type === 'mild') return intensity >= 1 && intensity <= 3;
          if (type === 'medium') return intensity >= 4 && intensity <= 7;
          if (type === 'strong') return intensity >= 8 && intensity <= 10;
          return false;
        });
      });
    }

    const selectedTags = Object.keys(selectedReviewTags).filter(key => selectedReviewTags[key]);
    if (selectedTags.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.reviewTags || !Array.isArray(product.reviewTags)) {
          return false;
        }
        return selectedTags.every(tagId =>
          product.reviewTags.some(tag => tag._id === tagId)
        );
      });
    }

    filtered = filtered.filter(product => {
      const price = Number(product.price || 0);
      if (priceRange[1] >= 9999) {
        return price >= priceRange[0];
      }
      return price >= priceRange[0] && price <= priceRange[1];
    });

    setFilteredProducts(filtered);
    setTotalItems(filtered.length);
    setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [products, categoryFilters, primaryUseFilters, intensityFilters, selectedReviewTags, priceRange, reviewAggByProduct]);

  const isDriedProduct = (product) => {
    if (!product.category) return false;
    const categoryName = typeof product.category === 'object'
      ? product.category.category
      : '';
    return categoryName.toUpperCase() === 'DRIED';
  };

  const isEdiblesProduct = (product) => {
    if (!product.category) return false;
    const categoryName = typeof product.category === 'object'
      ? product.category.category
      : '';
    return categoryName.toUpperCase() === 'EDIBLES';
  };

  const sortedProducts = useMemo(() => {
    const driedProducts = filteredProducts.filter(p => isDriedProduct(p));

    const ediblesProducts = filteredProducts.filter(p => {
      const isEdible = isEdiblesProduct(p);
      if (!isEdible) return false;
      return p.flavors && p.flavors.length > 0 && p.flavors.some(f => f.isActive);
    });

    const otherProducts = filteredProducts.filter(p => {
      if (isDriedProduct(p)) return false;
      if (isEdiblesProduct(p)) {
        return !(p.flavors && p.flavors.length > 0 && p.flavors.some(f => f.isActive));
      }
      return true;
    });

    const sorted = [...driedProducts, ...ediblesProducts, ...otherProducts];

    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return sorted.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage]);

  const selectedCategoriesMemo = useMemo(() => Object.keys(categoryFilters).filter((k) => categoryFilters[k]), [categoryFilters]);

  const updateURL = (newCategoryFilters, newPrimaryUseFilters, newIntensityFilters = null) => {
    const selectedCategories = Object.keys(newCategoryFilters).filter(key => newCategoryFilters[key]);
    const selectedPrimaryUses = Object.keys(newPrimaryUseFilters).filter(key => newPrimaryUseFilters[key]);
    const selectedIntensities = newIntensityFilters ?
      Object.keys(newIntensityFilters).filter(key => newIntensityFilters[key]) :
      [];

    const query = { ...router.query };

    if (selectedCategories.length > 0) {
      query.category = selectedCategories;
    } else {
      delete query.category;
    }

    if (selectedPrimaryUses.length > 0) {
      query.primaryUse = selectedPrimaryUses;
    } else {
      delete query.primaryUse;
    }

    if (selectedIntensities.length > 0) {
      query.intensity = selectedIntensities;
    } else {
      delete query.intensity;
    }

    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  const handleCategoryChange = (categoryId) => {
    const newCategoryFilters = {
      ...categoryFilters,
      [categoryId]: !categoryFilters[categoryId]
    };
    setCategoryFilters(newCategoryFilters);
    updateURL(newCategoryFilters, primaryUseFilters);
  };

  const handlePrimaryUseChange = (useType) => {
    const newPrimaryUseFilters = {
      ...primaryUseFilters,
      [useType]: !primaryUseFilters[useType]
    };
    setPrimaryUseFilters(newPrimaryUseFilters);
    updateURL(categoryFilters, newPrimaryUseFilters, intensityFilters);
  };

  const handleIntensityChange = (intensityType) => {
    const newIntensityFilters = {
      ...intensityFilters,
      [intensityType]: !intensityFilters[intensityType]
    };
    setIntensityFilters(newIntensityFilters);
    updateURL(categoryFilters, primaryUseFilters, newIntensityFilters);
  };

  const handleReviewTagToggle = (tagId) => {
    setSelectedReviewTags(prev => ({
      ...prev,
      [tagId]: !prev[tagId]
    }));
  };

  const resetAllFilters = () => {
    const newCategoryFilters = {};
    categories.forEach(cat => {
      newCategoryFilters[cat._id] = false;
    });
    setCategoryFilters(newCategoryFilters);
    setPrimaryUseFilters({ therapeutic: false, functional: false });
    setIntensityFilters({ mild: false, medium: false, strong: false });

    const resetTags = {};
    reviewTags.forEach(tag => {
      resetTags[tag._id] = false;
    });
    setSelectedReviewTags(resetTags);

    updateURL({}, {}, {});
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation();
    const stock = Number(product.stock || 0);
    const isAvailable = product.hasStock && stock > 0;

    if (isAvailable) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
      setAddedSet(prev => ({ ...prev, [product._id]: true }));
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleQuantityChange = (product, newQuantity, e) => {
    e.stopPropagation();
    const stock = Number(product.stock || 0);
    const productId = product._id || product.id;

    if (newQuantity <= 0) {
      updateCartItemQuantity(productId, 0);
      setAddedSet(prev => ({ ...prev, [productId]: false }));
    } else if (stock > 0 && newQuantity > stock) {
      toast.error(`Only ${stock} items available in stock`);
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleProductClick = (product) => {
    if (product.hasVariants && product.variants && product.variants.length > 0) {
      const hasInStockVariant = product.variants.some(variant => {
        const variantStock = Number(variant.stock || 0);
        return variantStock > 0;
      });

      if (hasInStockVariant) {
        router.push(`/productdetails?id=${product._id}`);
        return;
      }
    }

    if (product.flavors && product.flavors.length > 0) {
      const hasInStockFlavor = product.flavors.some(flavor => {
        const flavorStock = Number(flavor.stock || 0);
        return flavorStock > 0;
      });

      if (hasInStockFlavor) {
        router.push(`/productdetails?id=${product._id}`);
        return;
      }
    }

    const stock = Number(product.stock || 0);
    const isAvailable = product.hasStock && stock > 0;

    if (isAvailable) {
      router.push(`/productdetails?id=${product._id}`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const isDriedFilterActive = () => {
    const driedCategory = categories.find(cat =>
      cat.category.toUpperCase() === 'DRIED'
    );

    console.log('=== DEBUG ===');
    console.log('Dried Category:', driedCategory);
    console.log('Category Filters:', categoryFilters);
    console.log('Is Dried Filter ON:', driedCategory && categoryFilters[driedCategory._id]);
    console.log('Sorted Products:', sortedProducts);
    console.log('============');

    return driedCategory && categoryFilters[driedCategory._id];
  };

  const clearAllFilters = () => {
    const newCategoryFilters = {};
    const newPrimaryUseFilters = { therapeutic: false, functional: false };
    const newIntensityFilters = { mild: false, medium: false, strong: false };

    setCategoryFilters(newCategoryFilters);
    setPrimaryUseFilters(newPrimaryUseFilters);
    setIntensityFilters(newIntensityFilters);
    setPriceRange([priceRangeLimits.min, priceRangeLimits.max]);
    setIsDrawerOpen(false);

    const query = { ...router.query };
    delete query.category;
    delete query.primaryUse;
    delete query.intensity;
    delete query.minPrice;
    delete query.maxPrice;

    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  const priceRangeLimits = useMemo(() => {
    if (!products || products.length === 0) return { min: 0, max: 100 };
    const prices = products.map(p => p.price);
    const min = Math.floor(Math.min(...prices) / 20) * 20;
    const max = Math.ceil(Math.max(...prices) / 20) * 20;
    return { min, max };
  }, [products]);

  const applyPriceRange = useCallback(
    debounce((newRange) => {
      setPriceRange([...newRange]);
    }, 100),
    []
  );

  const handlePriceRangeChange = useCallback((newRange) => {
    setLocalPriceRange(newRange);
    setPriceRange(newRange);
  }, []);

  const resetPriceRange = useCallback(() => {
    const newRange = [priceRangeLimits.min, priceRangeLimits.max];
    setLocalPriceRange([...newRange]);
    setPriceRange([...newRange]);
  }, [priceRangeLimits]);

  const activeFilterCount = useMemo(() => {
    const categoryCount = Object.values(categoryFilters).filter(Boolean).length;
    const primaryUseCount = Object.values(primaryUseFilters).filter(Boolean).length;
    const intensityCount = Object.values(intensityFilters).filter(Boolean).length;
    const reviewTagCount = Object.values(selectedReviewTags).filter(Boolean).length;
    const priceFilterActive = priceRange[0] > priceRangeLimits.min ||
      priceRange[1] < priceRangeLimits.max;
    return categoryCount + primaryUseCount + intensityCount + reviewTagCount + (priceFilterActive ? 1 : 0);
  }, [categoryFilters, primaryUseFilters, intensityFilters, selectedReviewTags, priceRange, priceRangeLimits]);

  const colors = [
    { bg: '#B3194275', color: 'white' },
    { bg: '#8b5cf6', color: 'white' },
    { bg: '#CD45B480', color: 'white' },
    { bg: '#53669080', color: 'white' },
    { bg: '#2E2E2E40', color: 'white' },
  ];

  // Handle loading state
  const isLoading = loading || (isLoggedIn && !user);
  
  if (isLoading) {
    console.log('Showing loading state - waiting for user data');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

// Only block suspended users, allow pending and incomplete
if (isLoggedIn && user?.status === 'suspend') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Suspended</h2>
          <p className="text-gray-600 mb-6">
            Thank you for signing up! Your account is currently under review by our team.
            You'll be able to browse our menu once your account is verified.
          </p>
          <p className="text-gray-500 text-sm">
            Please check back later or contact support if you have any questions.
          </p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view the menu.</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (loadingData) {
    return (
      <div className="min-h-screen lg:px-14 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#536690] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  const PaginationControls = () => {
    const maxVisiblePages = 5;

    const handlePageChange = (pageNum) => {
      setCurrentPage(pageNum);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const getPageNumbers = () => {
      const pages = [];
      let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-center space-x-2 mt-8 mb-6">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Previous
        </button>

        {currentPage > 3 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              1
            </button>
            {currentPage > 4 && <span className="text-gray-400">...</span>}
          </>
        )}

        {getPageNumbers().map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
              ? 'bg-[#536690] text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            {pageNum}
          </button>
        ))}

        {currentPage < totalPages - 2 && (
          <>
            {currentPage < totalPages - 3 && <span className="text-gray-400">...</span>}
            <button
              onClick={() => handlePageChange(totalPages)}
              className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
        >
          Next
        </button>
      </div>
    );
  };

  
  const FilterSidebar = ({ className = "" }) => (
   <div className={`bg-white p-6 ${className} overflow-visible`}>
      {/* Header for mobile drawer */}
      <div className="flex items-center justify-between mb-6 lg:hidden">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        <button
          onClick={() => setIsDrawerOpen(false)}
          className="p-2 text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Active filters indicator */}
      {activeFilterCount > 0 && (
        <div className="mb-6 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 font-medium">
              {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
            </span>
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      <div className="mb-8">
        <button
          onClick={() => setCategoryOpen(!categoryOpen)}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
        >
          Category
          {categoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {categoryOpen && (
          <div className="space-y-3">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center cursor-pointer group w-full">
                <div className="flex items-center w-full">
                  <input
                    type="checkbox"
                    checked={categoryFilters[category._id] || false}
                    onChange={() => handleCategoryChange(category._id)}
                    className="w-4 h-4 text-[#536690] border-gray-300 rounded focus:ring-[#536690] focus:ring-2 flex-shrink-0"
                  />
                  {category.image && (
                    <div className="ml-3 w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <img
                        src={category.image}
                        alt={category.category}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors truncate">
                    {category.category}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Primary Use Filter */}
      <div>
        <button
          onClick={() => setPrimaryUseOpen(!primaryUseOpen)}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
        >
          Primary Use
          {primaryUseOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {primaryUseOpen && (
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={primaryUseFilters.therapeutic}
                onChange={() => handlePrimaryUseChange('therapeutic')}
                className="w-4 h-4 text-[#536690] border-gray-300 rounded focus:ring-[#536690] focus:ring-2"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                Therapeutic
              </span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="checkbox"
                checked={primaryUseFilters.functional}
                onChange={() => handlePrimaryUseChange('functional')}
                className="w-4 h-4 text-[#536690] border-gray-300 rounded focus:ring-[#536690] focus:ring-2"
              />
              <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                Functional / Medicinal
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Intensity Filter */}
      <div className="mt-6">
        <button
          onClick={() => setIntensityOpen(!intensityOpen)}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
        >
          Intensity
          {intensityOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {intensityOpen && (
          <div className="space-y-3">
            {[
              { id: 'mild', label: 'Mild (1-3)' },
              { id: 'medium', label: 'Medium (4-7)' },
              { id: 'strong', label: 'Strong (8-10)' }
            ].map((intensity) => (
              <label key={intensity.id} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={intensityFilters[intensity.id] || false}
                  onChange={() => handleIntensityChange(intensity.id)}
                  className="w-4 h-4 text-[#536690] border-gray-300 rounded focus:ring-[#536690] focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {intensity.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Review Tags Filter */}
      <div className="mt-6">
        <button
          onClick={() => setReviewTagsOpen(!reviewTagsOpen)}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
        >
          <span className="flex items-center">
            <Tag size={16} className="mr-2" />
            Review Tags
          </span>
          {reviewTagsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {reviewTagsOpen && (
          <div className="space-y-3">
            {reviewTags.length > 0 ? (
              reviewTags
                .filter(tag => tag.isActive) // Only show active tags
                .map(tag => (
                  <label key={tag._id} className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedReviewTags[tag._id] || false}
                      onChange={() => handleReviewTagToggle(tag._id)}
                      className="w-4 h-4 text-[#536690] border-gray-300 rounded focus:ring-[#536690] focus:ring-2"
                    />
                    <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                      {tag.label}
                    </span>
                  </label>
                ))
            ) : (
              <p className="text-sm text-gray-500">No review tags available</p>
            )}
          </div>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="mt-6">
        <button
          onClick={() => setPriceRangeOpen(!priceRangeOpen)}
          className="flex items-center justify-between w-full text-left font-medium text-gray-900 mb-4"
        >
          Price Range
          {priceRangeOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {priceRangeOpen && (
          <div className="space-y-3">
            {[
              { id: '20', label: 'Under $20', range: [0, 20] },
              { id: '40', label: '$20 - $40', range: [20, 40] },
              { id: '60', label: '$40 - $60', range: [40, 60] },
              { id: '80', label: '$60 - $80', range: [60, 80] },
              { id: '80+', label: 'Over $80', range: [80, 9999] }
            ].map((priceOption) => {
              const isActive = priceRange[0] === priceOption.range[0] &&
                priceRange[1] === priceOption.range[1];

              return (
                <label key={priceOption.id} className="flex items-center cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handlePriceRangeChange([...priceOption.range])}
                    className="w-4 h-4 text-[#536690] border-gray-300 rounded focus:ring-[#536690] focus:ring-2"
                  />
                  <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                    {priceOption.label}
                  </span>
                </label>
              );
            })}
            {(priceRange[0] > 0 || priceRange[1] < 9999) && (
              <button
                onClick={resetPriceRange}
                className="text-xs text-[#536690] hover:underline mt-2 block"
              >
                Reset Price Filter
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );


  // const PaginationControls = () => {
  //   const maxVisiblePages = 5;

  //   const handlePageChange = (pageNum) => {
  //     setCurrentPage(pageNum);
  //     // Scroll to top smoothly
  //     window.scrollTo({ top: 0, behavior: 'smooth' });
  //   };

  //   const getPageNumbers = () => {
  //     const pages = [];
  //     let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  //     let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  //     if (endPage - startPage < maxVisiblePages - 1) {
  //       startPage = Math.max(1, endPage - maxVisiblePages + 1);
  //     }

  //     for (let i = startPage; i <= endPage; i++) {
  //       pages.push(i);
  //     }

  //     return pages;
  //   };

  //   if (totalPages <= 1) return null;

  //   return (
  //     <div className="flex items-center justify-center space-x-2 mt-8 mb-6">
  //       <button
  //         onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
  //         disabled={currentPage === 1}
  //         className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === 1
  //           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
  //           : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
  //           }`}
  //       >
  //         Previous
  //       </button>

  //       {currentPage > 3 && (
  //         <>
  //           <button
  //             onClick={() => handlePageChange(1)}
  //             className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
  //           >
  //             1
  //           </button>
  //           {currentPage > 4 && <span className="text-gray-400">...</span>}
  //         </>
  //       )}

  //       {getPageNumbers().map(pageNum => (
  //         <button
  //           key={pageNum}
  //           onClick={() => handlePageChange(pageNum)}
  //           className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
  //             ? 'bg-[#536690] text-white'
  //             : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
  //             }`}
  //         >
  //           {pageNum}
  //         </button>
  //       ))}

  //       {currentPage < totalPages - 2 && (
  //         <>
  //           {currentPage < totalPages - 3 && <span className="text-gray-400">...</span>}
  //           <button
  //             onClick={() => handlePageChange(totalPages)}
  //             className="px-3 py-2 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
  //           >
  //             {totalPages}
  //           </button>
  //         </>
  //       )}

  //       <button
  //         onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
  //         disabled={currentPage === totalPages}
  //         className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentPage === totalPages
  //           ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
  //           : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
  //           }`}
  //       >
  //         Next
  //       </button>
  //     </div>
  //   );
  // };

  <div className="mb-6">
    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
      Menu
    </h1>
    <p className="text-gray-600 mt-1">
      {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
      {totalPages > 1 && (
        <span className="text-gray-500">
          {' '}• Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
        </span>
      )}
    </p>
  </div>

  if (loadingData) {
    return (
      <div className="min-h-screen lg:px-14 bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#536690] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  // Render loading state for data
  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:px-14 bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span
              className="hover:text-gray-900 cursor-pointer"
              onClick={handleHomeClick}
            >
              Home
            </span>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Menu</span>
          </div>

          {/* Mobile filter button */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-[#536690] text-white rounded-lg hover:bg-[#536690]/90 transition-colors"
          >
            <Filter size={16} />
            <span className="text-sm">Filters</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-[#536690] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row relative">
        {/* Desktop Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-64 border-r border-gray-200">
          <FilterSidebar />
        </div>

        {/* Mobile Drawer Overlay */}
        {isDrawerOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 bg-opacity-50 z-40 transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
        )}

        {/* Mobile Drawer */}
        <div className={`lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}>
          <FilterSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Mobile Active Filters Display */}
          {activeFilterCount > 0 && (
            <div className="lg:hidden mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 font-medium">
                  {activeFilterCount} active filter{activeFilterCount > 1 ? 's' : ''}
                </span>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#536690] hover:text-[#536690]/80 underline font-medium"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Menu
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} available
              {totalPages > 1 && (
                <span className="text-gray-500">
                  {' '}• Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length}
                </span>
              )}
            </p>
          </div>


          {/* All Products */}
          {/* All Products */}
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 relative">
              {sortedProducts.map((product) => {
                const isDried = isDriedProduct(product);
                const isEdibles = isEdiblesProduct(product);
                const driedCat = categories.find(cat => cat.category.toUpperCase() === 'DRIED');
                const isDriedSelected = driedCat && categoryFilters[driedCat._id];

                // Special DRIED layout sirf DRIED products ke liye
                const showDriedLayout = isDried && product.hasVariants && product.variants && product.variants.length > 0;
                const showEdiblesLayout = isEdibles &&
                  product.flavors &&
                  product.flavors.length > 0 &&
                  product.flavors.some(f => f.isActive);
                // DRIED products ke liye special UI - FULL WIDTH
                if (showDriedLayout) {
                  return (
                    <div 
                      key={product._id} 
                      className="col-span-full"
                      onMouseEnter={() => setHoveredProductId(product._id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                    >
                      <div
                        className="relative rounded-3xl border border-gray-200 hover:shadow-lg transition-shadow bg-white overflow-hidden w-full max-w-4xl mx-auto"
                        onClick={() => handleProductClick(product)}
                      >
                        {/* Left side - Product Image */}
                        <div className="flex flex-col lg:flex-row">
                          <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
                            {product.images && product.images.length > 0 ? (
                              <>
                                <img
                                  src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                {/* Allergen Icons */}
                               {product.allergenInfo?.hasAllergens && product.allergenInfo.allergenImages?.length > 0 && (
<div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 justify-center z-20">
    {product.allergenInfo.allergenImages.map((img, idx) => (
      <div key={idx} className="relative">
        <img
          src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
          alt="Allergen"
          className="w-6 h-6 object-cover rounded-full border border-white shadow-sm"
        />
      </div>
    ))}
    {hoveredProductId === product._id && product.allergenInfo.tooltipText && (
  <div className="absolute -top-8 left-2/3 transform -translate-x-1/2 z-30 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
        {product.allergenInfo.tooltipText}
        <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
      </div>
    )}
  </div>
)}
                              </>
                            ) : (
                              <div className="w-full h-full bg-gray-200"></div>
                            )}

                            {/* Stock Status Overlay */}
                            {(() => {
                              // For products with variants, check if all variants are out of stock
                              if (product.hasVariants && product.variants && product.variants.length > 0) {
                                const allVariantsOutOfStock = product.variants.every(variant => {
                                  const variantStock = Number(variant.stock || 0);
                                  return variantStock <= 0;
                                });

                                if (allVariantsOutOfStock) {
                                  return (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                      <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                                        Out of<br />Stock
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }

                              // For products with flavors, check if all flavors are out of stock
                              if (product.flavors && product.flavors.length > 0) {
                                const allFlavorsOutOfStock = product.flavors.every(flavor => {
                                  const flavorStock = Number(flavor.stock || 0);
                                  return flavorStock <= 0;
                                });

                                if (allFlavorsOutOfStock) {
                                  return (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                      <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                                        Out of<br />Stock
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }

                              // For products without variants or flavors, use the original stock check
                              const stock = Number(product.stock || 0);
                              const isOutOfStock = !product.hasStock || stock <= 0;

                              if (isOutOfStock) {
                                return (
                                  <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                                      Out of<br />Stock
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* Right side - Product Details */}
                          <div className="w-full md:w-3/5 p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>

                            {/* Intensity Bar */}
                            {product.intensity && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Intensity</span>
                                  <span className={`text-sm font-bold ${product.intensity <= 3 ? 'text-green-600' :
                                    product.intensity <= 7 ? 'text-yellow-600' :
                                      'text-red-500'
                                    }`}>
                                    {product.intensity <= 3 ? 'Mild' : product.intensity <= 7 ? 'Medium' : 'Strong'} ({product.intensity}/10)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${(product.intensity / 10) * 100}%`,
                                      backgroundColor:
                                        product.intensity <= 3 ? '#10B981' :
                                          product.intensity <= 7 ? '#F59E0B' :
                                            '#EF4444'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Review Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {(product.reviewTags || []).slice(0, 4).map((tag, idx) => {
                                const color = colors[idx % colors.length];
                                return (
                                  <span
                                    key={tag._id}
                                    className="px-3 py-1.5 text-sm rounded-full font-medium"
                                    style={{ backgroundColor: color.bg, color: color.color }}
                                  >
                                    {tag.label}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Variants with pricing - INLINE STYLE */}
                            <div className="mt-4">
                              <div className="flex flex-wrap items-center gap-3">
                                {product.variants.map((variant, idx) => {

                                  const cartItem = cart.find((i) => {
                                    const isSameProduct = (i.id || i._id) === product._id;
                                    const isSameVariant = i.selectedVariant?._id === variant._id;
                                    return isSameProduct && isSameVariant;
                                  });

                                  const isInCart = cartItem && cartItem.quantity > 0;
                                  const variantStock = Number(variant.stock || 0);
                                  const isOutOfStock = variantStock <= 0;
                                  // const cartItem = cart.find((i) => (i.id || i._id) === product._id && i.selectedVariant?._id === variant._id);


                                  return (
                                    <div
                                      key={variant._id}
                                      className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[120px]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Add to Cart Button - Top Right */}
                                      <div className="absolute -top-2 -right-2">
                                        {isInCart ? (
                                          <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateCartItemQuantity(product._id, cartItem.quantity - 1, variant);
                                              }}
                                              className="p-1 hover:bg-gray-50 rounded-l-full transition-colors"
                                            >
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M5 12h14" />
                                              </svg>
                                            </button>
                                            <span className="px-2 text-xs font-bold">
                                              {cartItem.quantity}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (cartItem.quantity < variantStock) {
                                                  updateCartItemQuantity(product._id, cartItem.quantity + 1, variant);
                                                } else {
                                                  toast.error(`Only ${variantStock} available`);
                                                }
                                              }}
                                              disabled={cartItem.quantity >= variantStock}
                                              className="p-1 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-50"
                                            >
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M12 5v14M5 12h14" />
                                              </svg>
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!isOutOfStock) {
                                                addToCart({ ...product, selectedVariant: variant }, 1);
                                                toast.success(`${product.name} (${variant.size.value}${variant.size.unit}) added!`);
                                                setAddedSet(prev => ({ ...prev, [`${product._id}-${variant._id}`]: true }));
                                              }
                                            }}
                                            disabled={isOutOfStock}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${isOutOfStock
                                              ? 'bg-gray-300 cursor-not-allowed'
                                              : 'bg-gray-900 hover:bg-gray-800'
                                              }`}
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                              <path d="M12 5v14M5 12h14" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>

                                      {/* Size and Price */}
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">
                                          {variant.size.value}{variant.size.unit === 'grams' ? 'G' : variant.size.unit}
                                        </span>
                                        <span className="text-base font-bold text-gray-900">
                                          ${variant.price}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Wishlist Button */}
                                <div
                                  className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLoggedIn) {
                                      toast.error('Please login to manage your wishlist', {
                                        position: "bottom-left",
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                      });
                                      return;
                                    }
                                    const wasInWishlist = isInWishlist(product._id);
                                    toggle(product);
                                    toast.success(
                                      wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist!',
                                      {
                                        position: "bottom-left",
                                        autoClose: 2000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                      }
                                    );
                                  }}
                                >
                                  <span className="text-sm font-medium">Wishlist</span>
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (showEdiblesLayout) {
                  return (
                    <div 
                      key={product._id} 
                      className="col-span-full"
                      onMouseEnter={() => setHoveredProductId(product._id)}
                      onMouseLeave={() => setHoveredProductId(null)}
                    >
                      <div
                        className="relative rounded-3xl border border-gray-200 hover:shadow-lg transition-shadow bg-white overflow-hidden w-full max-w-4xl mx-auto"
                        onClick={() => handleProductClick(product)}
                      >
                        <div className="flex flex-col lg:flex-row">
                          {/* Left side - Product Image */}
                          <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
                            {product.images && product.images.length > 0 ? (
                              <>
                                <img
                                  src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                                {/* Allergen Icons */}
                                {product.allergenInfo?.hasAllergens && product.allergenInfo.allergenImages?.length > 0 && (
                                  <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 justify-center">
                                    {product.allergenInfo.allergenImages.map((img, idx) => (
                                      <div key={idx} className="relative group">
                                        <img
                                          src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                                          alt="Allergen"
                                          className="w-6 h-6 object-cover rounded-full border border-white shadow-sm"
                                        />
                                        {product.allergenInfo.tooltipText && (
                                          <div className="absolute z-10 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap bottom-full left-1/2 transform -translate-x-1/2 mb-1">
                                            {product.allergenInfo.tooltipText}
                                            <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full h-full bg-gray-200"></div>
                            )}

                            {/* Stock Status Overlay */}
                            {(() => {
                              // Only show out of stock if ALL active flavors have 0 stock
                              const activeFlavors = product.flavors.filter(f => f.isActive);
                              const allFlavorsOutOfStock = activeFlavors.length > 0 &&
                                activeFlavors.every(f => Number(f.stock || 0) <= 0);
                              if (allFlavorsOutOfStock) {
                                return (
                                  <div className="absolute inset-0 flex items-center justify-center z-10">
                                    <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                                      Out of<br />Stock
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>

                          {/* Right side - Product Details */}
                          <div className="w-full lg:w-3/5 p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                            {product?.short_description && <p className="text-gray-700 -mt-1  mb-2">{product.short_description}</p>}
                            {/* Intensity Bar */}
                            {product.intensity && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm text-gray-600">Intensity</span>
                                  <span className={`text-sm font-bold ${product.intensity <= 3 ? 'text-green-600' :
                                    product.intensity <= 7 ? 'text-yellow-600' :
                                      'text-red-500'
                                    }`}>
                                    {product.intensity <= 3 ? 'Mild' : product.intensity <= 7 ? 'Medium' : 'Strong'} ({product.intensity}/10)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${(product.intensity / 10) * 100}%`,
                                      backgroundColor:
                                        product.intensity <= 3 ? '#10B981' :
                                          product.intensity <= 7 ? '#F59E0B' :
                                            '#EF4444'
                                    }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            {/* Review Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {(product.reviewTags || []).slice(0, 4).map((tag, idx) => {
                                const color = colors[idx % colors.length];
                                return (
                                  <span
                                    key={tag._id}
                                    className="px-3 py-1.5 text-sm rounded-full font-medium"
                                    style={{ backgroundColor: color.bg, color: color.color }}
                                  >
                                    {tag.label}
                                  </span>
                                );
                              })}
                            </div>

                            {/* Flavors with pricing - INLINE STYLE */}
                            <div className="mt-4">
                              <div className="flex flex-wrap items-center gap-3">
                                {product.flavors.filter(f => f.isActive).map((flavor, idx) => {
                                  const cartItem = cart.find((i) => {
                                    const isSameProduct = (i.id || i._id) === product._id;
                                    const isSameFlavor = i.selectedFlavor?._id === flavor._id;
                                    return isSameProduct && isSameFlavor;
                                  });

                                  const isInCart = cartItem && cartItem.quantity > 0;
                                  const flavorStock = Number(flavor.stock || 0);
                                  // Flavor is out of stock if: product hasStock is false OR individual flavor stock is 0
                                  const isOutOfStock = !product.hasStock || flavorStock <= 0;

                                  return (
                                    <div
                                      key={flavor._id}
                                      className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[120px]"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      {/* Add to Cart Button - Top Right */}
                                      <div className="absolute -top-2 -right-2">
                                        {isInCart ? (
                                          <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                updateCartItemQuantity(product._id, cartItem.quantity - 1, null, flavor);
                                              }}
                                              className="p-1 hover:bg-gray-50 rounded-l-full transition-colors"
                                            >
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M5 12h14" />
                                              </svg>
                                            </button>
                                            <span className="px-2 text-xs font-bold">
                                              {cartItem.quantity}
                                            </span>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                if (cartItem.quantity < flavorStock) {
                                                  updateCartItemQuantity(product._id, cartItem.quantity + 1, null, flavor);
                                                } else {
                                                  toast.error(`Only ${flavorStock} available`);
                                                }
                                              }}
                                              disabled={cartItem.quantity >= flavorStock}
                                              className="p-1 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-50"
                                            >
                                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                                <path d="M12 5v14M5 12h14" />
                                              </svg>
                                            </button>
                                          </div>
                                        ) : (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              if (!isOutOfStock) {
                                                addToCart({ ...product, selectedFlavor: flavor }, 1);
                                                toast.success(`${product.name} (${flavor.name}) added!`);
                                                setAddedSet(prev => ({ ...prev, [`${product._id}-${flavor._id}`]: true }));
                                              }
                                            }}
                                            disabled={isOutOfStock}
                                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${isOutOfStock
                                              ? 'bg-gray-300 cursor-not-allowed'
                                              : 'bg-gray-900 hover:bg-gray-800'
                                              }`}
                                          >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                              <path d="M12 5v14M5 12h14" />
                                            </svg>
                                          </button>
                                        )}
                                      </div>

                                      {/* Flavor Name and Price */}
                                      <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-900">
                                          {flavor.name}
                                        </span>
                                        <span className="text-base font-bold text-gray-900">
                                          ${flavor.price}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}

                                {/* Wishlist Button */}
                                <div
                                  className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (!isLoggedIn) {
                                      toast.error('Please login to manage your wishlist', {
                                        position: "bottom-left",
                                        autoClose: 3000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                        progress: undefined,
                                      });
                                      return;
                                    }
                                    const wasInWishlist = isInWishlist(product._id);
                                    toggle(product);
                                    toast.success(
                                      wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist!',
                                      {
                                        position: "bottom-left",
                                        autoClose: 2000,
                                        hideProgressBar: false,
                                        closeOnClick: true,
                                        pauseOnHover: true,
                                        draggable: true,
                                      }
                                    );
                                  }}
                                >
                                  <span className="text-sm font-medium">Wishlist</span>
                                  <svg
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

              
// Normal card UI for non-DRIED products - FULL WIDTH HORIZONTAL LAYOUT
return (
  <div 
    key={product._id} 
    className="col-span-full"
    onMouseEnter={() => setHoveredProductId(product._id)}
    onMouseLeave={() => setHoveredProductId(null)}
  >
    <div
      className="relative rounded-3xl border border-gray-200 hover:shadow-lg transition-shadow bg-white overflow-hidden w-full max-w-4xl mx-auto"
      onClick={() => handleProductClick(product)}
    >
      <div className="flex flex-col lg:flex-row">
        {/* Left side - Product Image */}
        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
          {product.images && product.images.length > 0 ? (
            <>
              <img
                src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Allergen Icons */}
              {product.allergenInfo?.hasAllergens && product.allergenInfo.allergenImages?.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-1 justify-center z-20">
                  {product.allergenInfo.allergenImages.map((img, idx) => (
                    <div key={idx} className="relative">
                      <img
                        src={img.startsWith('http') ? img : `http://localhost:5000${img}`}
                        alt="Allergen"
                        className="w-6 h-6 object-cover rounded-full border border-white shadow-sm"
                      />
                    </div>
                  ))}
                  {hoveredProductId === product._id && product.allergenInfo.tooltipText && (
                    <div className="absolute -top-8 left-2/3 transform -translate-x-1/2 z-30 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap shadow-lg">
                      {product.allergenInfo.tooltipText}
                      <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200"></div>
          )}

          {/* Stock Status Overlay */}
          {(() => {
            // Check variants
            if (product.hasVariants && product.variants && product.variants.length > 0) {
              const allVariantsOutOfStock = product.variants.every(variant => {
                const variantStock = Number(variant.stock || 0);
                return variantStock <= 0;
              });
              if (allVariantsOutOfStock) {
                return (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                      Out of<br />Stock
                    </div>
                  </div>
                );
              }
              return null;
            }

            // Check flavors
            if (product.flavors && product.flavors.length > 0) {
              const allFlavorsOutOfStock = product.flavors.every(flavor => {
                const flavorStock = Number(flavor.stock || 0);
                return flavorStock <= 0;
              });
              if (allFlavorsOutOfStock) {
                return (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                      Out of<br />Stock
                    </div>
                  </div>
                );
              }
              return null;
            }

            // Normal stock check
            const stock = Number(product.stock || 0);
            const isOutOfStock = !product.hasStock || stock <= 0;
            if (isOutOfStock) {
              return (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                    Out of<br />Stock
                  </div>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Right side - Product Details */}
        <div className="w-full lg:w-3/5 p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
          {product?.short_description && <p className="text-gray-700 -mt-1 mb-2">{product.short_description}</p>}
          
          {/* Intensity Bar */}
          {product.intensity && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-600">Intensity</span>
                <span className={`text-sm font-bold ${
                  product.intensity <= 3 ? 'text-green-600' :
                  product.intensity <= 7 ? 'text-yellow-600' :
                  'text-red-500'
                }`}>
                  {product.intensity <= 3 ? 'Mild' : product.intensity <= 7 ? 'Medium' : 'Strong'} ({product.intensity}/10)
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(product.intensity / 10) * 100}%`,
                    backgroundColor:
                      product.intensity <= 3 ? '#10B981' :
                      product.intensity <= 7 ? '#F59E0B' :
                      '#EF4444'
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Review Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(product.reviewTags || []).slice(0, 4).map((tag, idx) => {
              const color = colors[idx % colors.length];
              return (
                <span
                  key={tag._id}
                  className="px-3 py-1.5 text-sm rounded-full font-medium"
                  style={{ backgroundColor: color.bg, color: color.color }}
                >
                  {tag.label}
                </span>
              );
            })}
          </div>

          {/* Variants/Flavors or Simple Price */}
          <div className="mt-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Check if product has VARIANTS */}
              {product.hasVariants && product.variants && product.variants.length > 0 && (
                <>
                  {product.variants.map((variant) => {
                    const cartItem = cart.find((i) => {
                      const isSameProduct = (i.id || i._id) === product._id;
                      const isSameVariant = i.selectedVariant?._id === variant._id;
                      return isSameProduct && isSameVariant;
                    });

                    const isInCart = cartItem && cartItem.quantity > 0;
                    const variantStock = Number(variant.stock || 0);
                    const isOutOfStock = variantStock <= 0;

                    return (
                      <div
                        key={variant._id}
                        className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="absolute -top-2 -right-2">
                          {isInCart ? (
                            <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCartItemQuantity(product._id, cartItem.quantity - 1, variant);
                                }}
                                className="p-1 hover:bg-gray-50 rounded-l-full transition-colors"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M5 12h14" />
                                </svg>
                              </button>
                              <span className="px-2 text-xs font-bold">{cartItem.quantity}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (cartItem.quantity < variantStock) {
                                    updateCartItemQuantity(product._id, cartItem.quantity + 1, variant);
                                  } else {
                                    toast.error(`Only ${variantStock} available`);
                                  }
                                }}
                                disabled={cartItem.quantity >= variantStock}
                                className="p-1 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-50"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isOutOfStock) {
                                  addToCart({ ...product, selectedVariant: variant }, 1);
                                  toast.success(`${product.name} (${variant.size.value}${variant.size.unit}) added!`);
                                }
                              }}
                              disabled={isOutOfStock}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
                                isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                              }`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {variant.size.value}{variant.size.unit === 'grams' ? 'G' : variant.size.unit}
                          </span>
                          <span className="text-base font-bold text-gray-900">${variant.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Check if product has FLAVORS */}
              {product.flavors && product.flavors.length > 0 && product.flavors.some(f => f.isActive) && (
                <>
                  {product.flavors.filter(f => f.isActive).map((flavor) => {
                    const cartItem = cart.find((i) => {
                      const isSameProduct = (i.id || i._id) === product._id;
                      const isSameFlavor = i.selectedFlavor?._id === flavor._id;
                      return isSameProduct && isSameFlavor;
                    });

                    const isInCart = cartItem && cartItem.quantity > 0;
                    const flavorStock = Number(flavor.stock || 0);
                    const isOutOfStock = !product.hasStock || flavorStock <= 0;

                    return (
                      <div
                        key={flavor._id}
                        className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="absolute -top-2 -right-2">
                          {isInCart ? (
                            <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCartItemQuantity(product._id, cartItem.quantity - 1, null, flavor);
                                }}
                                className="p-1 hover:bg-gray-50 rounded-l-full transition-colors"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M5 12h14" />
                                </svg>
                              </button>
                              <span className="px-2 text-xs font-bold">{cartItem.quantity}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (cartItem.quantity < flavorStock) {
                                    updateCartItemQuantity(product._id, cartItem.quantity + 1, null, flavor);
                                  } else {
                                    toast.error(`Only ${flavorStock} available`);
                                  }
                                }}
                                disabled={cartItem.quantity >= flavorStock}
                                className="p-1 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-50"
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <path d="M12 5v14M5 12h14" />
                                </svg>
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isOutOfStock) {
                                  addToCart({ ...product, selectedFlavor: flavor }, 1);
                                  toast.success(`${product.name} (${flavor.name}) added!`);
                                }
                              }}
                              disabled={isOutOfStock}
                              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
                                isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                              }`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">{flavor.name}</span>
                          <span className="text-base font-bold text-gray-900">${flavor.price}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* Simple product - show only if NO variants AND NO flavors */}
              {(!product.hasVariants || !product.variants || product.variants.length === 0) && 
               (!product.flavors || product.flavors.length === 0 || !product.flavors.some(f => f.isActive)) && (
                <div className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[120px]" onClick={(e) => e.stopPropagation()}>
                  <div className="absolute -top-2 -right-2">
                    {(() => {
                      const stock = Number(product.stock || 0);
                      const isOutOfStock = !product.hasStock || stock <= 0;
                      const cartItem = cart.find((i) => (i.id || i._id) === product._id);
                      const isInCart = cartItem && cartItem.quantity > 0;

                      if (isInCart) {
                        return (
                          <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateCartItemQuantity(product._id, cartItem.quantity - 1);
                              }}
                              className="p-1 hover:bg-gray-50 rounded-l-full transition-colors"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 12h14" />
                              </svg>
                            </button>
                            <span className="px-2 text-xs font-bold">{cartItem.quantity}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (cartItem.quantity < stock) {
                                  updateCartItemQuantity(product._id, cartItem.quantity + 1);
                                } else {
                                  toast.error(`Only ${stock} available`);
                                }
                              }}
                              disabled={cartItem.quantity >= stock}
                              className="p-1 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-50"
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M12 5v14M5 12h14" />
                              </svg>
                            </button>
                          </div>
                        );
                      } else {
                        return (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isOutOfStock) {
                                addToCart(product, 1);
                                toast.success(`${product.name} added!`);
                                setAddedSet(prev => ({ ...prev, [product._id]: true }));
                              }
                            }}
                            disabled={isOutOfStock}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-md ${
                              isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
                            }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <path d="M12 5v14M5 12h14" />
                            </svg>
                          </button>
                        );
                      }
                    })()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-gray-900">${product.price}</span>
                  </div>
                </div>
              )}

              {/* Wishlist Button */}
              <div
                className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  if (!isLoggedIn) {
                    toast.error('Please login to manage your wishlist');
                    return;
                  }
                  const wasInWishlist = isInWishlist(product._id);
                  toggle(product);
                  toast.success(wasInWishlist ? 'Removed from wishlist' : 'Added to wishlist!');
                }}
              >
                <span className="text-sm font-medium">Wishlist</span>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill={isInWishlist(product._id) ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
              })}
            </div>

            {/* Pagination Controls */}
            {filteredProducts.length > 0 && <PaginationControls />}
          </div>

          {/* No products message */}
          {filteredProducts.length === 0 && !loadingData && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="mb-4">
                  <Filter size={48} className="text-gray-300 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 text-sm lg:text-base mb-6">
                  No products match your current filters. Try adjusting your filter criteria.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-[#536690] text-white rounded-lg hover:bg-[#536690]/90 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;