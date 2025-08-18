import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp, Filter, X, Menu as MenuIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { Api } from '../services/service';

const Menu = () => {
  const router = useRouter();
  const { isLoggedIn, loading } = useUser();
  const { addToCart, cart } = useApp();
  const [addedSet, setAddedSet] = useState({});
  const [collapsedByCategory, setCollapsedByCategory] = useState({});
  const [categoryOpen, setCategoryOpen] = useState(true);
  const [primaryUseOpen, setPrimaryUseOpen] = useState(true);
  
  // Side drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // State for dynamic data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // dynamic review aggregates cache: productId -> array of { _id, count, label, emoji }
  const [reviewAggByProduct, setReviewAggByProduct] = useState({});
  
  // Filter states
  const [categoryFilters, setCategoryFilters] = useState({});
  const [primaryUseFilters, setPrimaryUseFilters] = useState({
    therapeutic: false,
    functional: false
  });

  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      // Check if user is logged in
      if (!isLoggedIn) {
        // Show toast notification
        toast.error('Please login to access the menu', {
          position: "top-center",
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
        
        // Redirect to login page
        router.push('/auth/login');
      } else {
        // Fetch data if user is logged in
        fetchCategories();
        fetchProducts();
      }
    }
  }, [isLoggedIn, loading, router]);

  // Close drawer when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setIsDrawerOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch categories from backend
  const fetchCategories = async () => {
    try {
      setLoadingData(true);
      const response = await Api('GET', 'categories/categories', null, router);
      if (response.success) {
        setCategories(response.data);
        // Initialize category filters
        const initialFilters = {};
        response.data.forEach(cat => {
          initialFilters[cat._id] = false;
        });
        setCategoryFilters(initialFilters);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoadingData(true);
      const response = await Api('GET', 'products', null, router);
      if (response.success) {
        setProducts(response.data);
        setFilteredProducts(response.data);
        // prefetch aggregates for initial page (best effort)
        const ids = (response.data || []).slice(0, 30).map(p => p._id);
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

  // Filter products based on selected filters
  useEffect(() => {
    let filtered = [...products];

    // Filter by category
    const selectedCategories = Object.keys(categoryFilters).filter(key => categoryFilters[key]);
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(product => 
        selectedCategories.includes(product.category._id || product.category)
      );
    }

    // Filter by primary use
    const selectedPrimaryUses = Object.keys(primaryUseFilters).filter(key => primaryUseFilters[key]);
    if (selectedPrimaryUses.length > 0) {
      filtered = filtered.filter(product => 
        selectedPrimaryUses.includes(product.primaryUse)
      );
    }

    setFilteredProducts(filtered);
  }, [products, categoryFilters, primaryUseFilters]);

  // Group filtered products by category for sectioned rendering
  const groupedByCategory = useMemo(() => {
    const groupMap = new Map();
    filteredProducts.forEach((product) => {
      const catId = (product.category && (product.category._id || product.category)) || 'uncategorized';
      const catName = (product.category && product.category.category) || (categories.find((c) => c._id === catId)?.category) || 'Products';
      if (!groupMap.has(catId)) {
        groupMap.set(catId, { catId, catName, items: [] });
      }
      groupMap.get(catId).items.push(product);
    });

    // Keep the order consistent with categories list, then append any uncategorized
    const ordered = [];
    categories.forEach((c) => {
      if (groupMap.has(c._id)) ordered.push(groupMap.get(c._id));
    });
    // Add any remaining groups (e.g., uncategorized)
    groupMap.forEach((val, key) => {
      if (!categories.find((c) => c._id === key)) ordered.push(val);
    });
    return ordered;
  }, [filteredProducts, categories]);

  const toggleCategoryCollapse = (catId) => {
    setCollapsedByCategory((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const handleCategoryChange = (categoryId) => {
    setCategoryFilters(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handlePrimaryUseChange = (useType) => {
    setPrimaryUseFilters(prev => ({
      ...prev,
      [useType]: !prev[useType]
    }));
  };

  const handleAddToCart = (product, e) => {
    e.stopPropagation(); // Prevent card click event
    if (product.hasStock) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
      setAddedSet(prev => ({ ...prev, [product._id]: true }));
    }
  };

  const handleProductClick = (product) => {
    if (product.hasStock) {
      router.push(`/productdetails?id=${product._id}`);
    }
  };

  const clearAllFilters = () => {
    setCategoryFilters({});
    setPrimaryUseFilters({ therapeutic: false, functional: false });
    setIsDrawerOpen(false); // Close drawer after clearing filters
  };

  // Calculate active filter count
  const activeFilterCount = useMemo(() => {
    const categoryCount = Object.values(categoryFilters).filter(Boolean).length;
    const primaryUseCount = Object.values(primaryUseFilters).filter(Boolean).length;
    return categoryCount + primaryUseCount;
  }, [categoryFilters, primaryUseFilters]);

  // Color presets for badges
  const colors = [
    { bg: '#B3194275', color: 'white' },
    { bg: '#8b5cf6', color: 'white' },
    { bg: '#CD45B480', color: 'white' },
    { bg: '#53669080', color: 'white' },
    { bg: '#2E2E2E40', color: 'white' },
  ];

  // Filter Sidebar Component
  const FilterSidebar = ({ className = "" }) => (
    <div className={`bg-white p-6 ${className}`}>
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
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {categories.map((category) => (
              <label key={category._id} className="flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categoryFilters[category._id] || false}
                  onChange={() => handleCategoryChange(category._id)}
                  className="w-4 h-4 text-[#536690] border-gray-300 rounded focus:ring-[#536690] focus:ring-2"
                />
                <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                  {category.category}
                </span>
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
    </div>
  );

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

  return (
    <div className="min-h-screen lg:px-14 bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="hover:text-gray-900 cursor-pointer">Home</span>
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
        <div className={`lg:hidden fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
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
            </p>
          </div>

          {/* Products grouped by category */}
          <div className="mb-6 space-y-8 lg:space-y-10">
            {groupedByCategory.map((group) => (
              <div key={group.catId}>
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h2 className="text-xl lg:text-2xl font-semibold text-gray-900">
                    {group.catName} ({group.items.length})
                  </h2>
                  <button
                    onClick={() => toggleCategoryCollapse(group.catId)}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    {collapsedByCategory[group.catId] ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </button>
                </div>

                {!collapsedByCategory[group.catId] && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {group.items.map((product) => (
                      <div
                        key={product._id}
                        className="relative rounded-4xl border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                        style={{ backgroundColor: '#8EAFF633' }}
                        onClick={() => handleProductClick(product)}
                      >
                        {/* Product Image with Coming Soon overlay inside */}
                        <div className="w-full h-64 bg-gray-100 rounded-t-4xl overflow-hidden relative">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                          {/* Coming Soon Watermark inside image */}
                          {!product.hasStock && (
                            <div className="absolute inset-0 flex items-center justify-center z-10">
                              <div className="text-3xl font-bold text-gray-300 rotate-12 select-none text-center">
                                Coming<br />Soon
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-4">
                          <div className="space-y-3">
                            <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                            <p className="text-lg font-semibold text-gray-900">$ {product.price}</p>
                            {/* Tags (dynamic top-5 by review aggregate) */}
                            <div className="flex flex-wrap p-4 gap-1">
                              {(reviewAggByProduct[product._id] || []).map((agg, idx) => {
                                const color = colors[Math.min(idx, colors.length - 1)];
                                const label = agg.label || '';
                                // extract leading emoji if present for display
                                const match = label.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u);
                                const emoji = match ? match[0] + ' ' : '';
                                const text = label.replace(/^[\p{Emoji}\p{Extended_Pictographic}]\s*/u, '');
                                return (
                                  <span key={agg._id} className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: color.bg, color: color.color }}>
                                    {emoji}{text} ({agg.count})
                                  </span>
                                );
                              })}
                              {(!reviewAggByProduct[product._id] || reviewAggByProduct[product._id].length === 0) && (
                                <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#B3194275', color: 'white' }}>
                                  No reviews yet
                                </span>
                              )}
                            </div>
                            {/* Add to Cart Button */}
                            <div className="flex justify-center mt-4">
                              {addedSet[product._id] || cart.find((i) => (i.id || i._id) === product._id) ? (
                                <a
                                  href="/cart"
                                  className="w-[40%] text-center py-2 px-4 rounded-4xl text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                                >
                                  Go to Cart
                                </a>
                              ) : (
                                <button
                                  className={`w-[40%] py-2 px-4 rounded-4xl text-sm font-medium transition-colors ${
                                    product.hasStock
                                      ? 'bg-[#536690] text-white hover:bg-[#536690]'
                                      : 'bg-slate-400 text-white cursor-not-allowed'
                                  }`}
                                  disabled={!product.hasStock}
                                  onClick={(e) => handleAddToCart(product, e)}
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

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
                    className="px-6 py-3 bg-[#536690] text-white rounded-full hover:bg-[#536690]/90 transition-colors font-medium"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;