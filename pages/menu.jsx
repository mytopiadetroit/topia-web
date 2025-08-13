import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
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
  
  // State for dynamic data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
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
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setLoadingData(false);
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

  // Tag emoji mapping (kept if needed elsewhere)
  const tagEmojis = {
    Joy: '😀',
    Euphoric: '😍',
    Creative: '🎨',
    Focus: '🎯',
    Connection: '🔗',
    Insight: '👀',
  };

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
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="hover:text-gray-900 cursor-pointer">Home</span>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 font-medium">Menu</span>
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar */}
        <div className="w-full lg:w-64 bg-white border-r border-gray-200 p-6">
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
                  <label key={category._id} className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={categoryFilters[category._id] || false}
                      onChange={() => handleCategoryChange(category._id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{category.category}</span>
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
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={primaryUseFilters.therapeutic}
                    onChange={() => handlePrimaryUseChange('therapeutic')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Therapeutic</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={primaryUseFilters.functional}
                    onChange={() => handlePrimaryUseChange('functional')}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm text-gray-700">Functional / Medicinal</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header Banner */}
          <div className="bg-slate-400 rounded-lg h-24 mb-8"></div>

          {/* Products grouped by category */}
          <div className="mb-6 space-y-10">
            {groupedByCategory.map((group) => (
              <div key={group.catId}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900">
                    {group.catName} ({group.items.length})
                  </h2>
                  <button
                    onClick={() => toggleCategoryCollapse(group.catId)}
                    className="p-2 text-gray-600 hover:text-gray-800"
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
                            {/* Tags (static on every card) */}
                            <div className="flex flex-wrap p-4 gap-1">
                              <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#B3194275', color: 'white' }}>
                                😀 Joy
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#8b5cf6', color: 'white' }}>
                                😍 Euphoric
                              </span>
                              <span className="px-2 py-1 text-xs rounded-full" style={{ backgroundColor: '#CD45B480', color: 'white' }}>
                                🎨 Creative
                              </span>
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
                <p className="text-gray-500 text-lg">No products match your current filters.</p>
                <button 
                  onClick={() => {
                    setCategoryFilters({});
                    setPrimaryUseFilters({ therapeutic: false, functional: false });
                  }}
                  className="mt-4 px-6 py-2 bg-[#536690] text-white rounded-full hover:bg-[#536690] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Menu;