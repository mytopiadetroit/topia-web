import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Heart } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';
import { Api, fetchAllReviewTags } from '../service/service';

export default function WishlistPage() {
  const router = useRouter();
  const { isLoggedIn, loading: userLoading } = useUser();
  const { items, count, loading, remove } = useWishlist();
  const { addToCart, cart, updateCartItemQuantity } = useApp();
  const [categories, setCategories] = useState({});
  const [categoriesLoaded, setCategoriesLoaded] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);
  const [reviewTags, setReviewTags] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({}); // {productId: {selectedItem, quantity}}

  // Helper function to get tag name by ID
  const getTagName = (tagId) => {
    if (!tagId) return '';
    const tag = reviewTags.find(t => t._id === tagId);
    return tag ? tag.label || tag.name || '' : '';
  };

  // Color presets for review tags
  const colors = [
    { bg: '#B3194275', color: 'white' },
    { bg: '#8b5cf6', color: 'white' },
    { bg: '#CD45B480', color: 'white' },
    { bg: '#53669080', color: 'white' },
    { bg: '#2E2E2E40', color: 'white' },
  ];

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const stock = Number(product.stock || 0);
    const isAvailable = product.hasStock && stock > 0;
    if (isAvailable) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleQuantityChange = (product, newQuantity, variant, flavor, e) => {
    if (e) e.stopPropagation();
    const stock = variant ? Number(variant.stock || 0) : flavor ? Number(flavor.stock || 0) : Number(product.stock || 0);
    const productId = product._id || product.id;
    
    if (newQuantity <= 0) {
      updateCartItemQuantity(productId, 0, variant, flavor);
    } else if (stock > 0 && newQuantity > stock) {
      toast.error(`Only ${stock} items available in stock`);
    } else {
      updateCartItemQuantity(productId, newQuantity, variant, flavor);
    }
  };

  // Helper functions for dropdown selection (from menu)
  const initializeProductSelection = (product) => {
    if (selectedOptions[product._id]) return;
    
    let defaultSelection = null;
    if (product.hasVariants && product.variants?.length > 0) {
      const inStockVariant = product.variants.find(v => Number(v.stock || 0) > 0);
      defaultSelection = inStockVariant || product.variants[0];
    } else if (product.flavors?.length > 0) {
      const inStockFlavor = product.flavors.find(f => f.isActive && Number(f.stock || 0) > 0);
      defaultSelection = inStockFlavor || product.flavors.find(f => f.isActive);
    }
    
    if (defaultSelection) {
      setSelectedOptions(prev => ({
        ...prev,
        [product._id]: { selectedItem: defaultSelection, quantity: 1 }
      }));
    }
  };

  const handleOptionChange = (productId, item) => {
    setSelectedOptions(prev => ({
      ...prev,
      [productId]: { selectedItem: item, quantity: prev[productId]?.quantity || 1 }
    }));
  };

  const handleQuantityChangeNew = (productId, delta) => {
    setSelectedOptions(prev => {
      const current = prev[productId];
      if (!current) return prev;
      
      const newQuantity = Math.max(1, (current.quantity || 1) + delta);
      const maxStock = Number(current.selectedItem.stock || 0);
      
      if (newQuantity > maxStock) {
        toast.error(`Only ${maxStock} available in stock`);
        return prev;
      }
      
      return {
        ...prev,
        [productId]: { ...current, quantity: newQuantity }
      };
    });
  };

  const handleAddToCartNew = (product, e) => {
    e?.stopPropagation();
    const selection = selectedOptions[product._id];
    if (!selection) return;
    
    const { selectedItem, quantity } = selection;
    const stock = Number(selectedItem.stock || 0);
    
    if (stock <= 0) {
      toast.error('Selected option is out of stock');
      return;
    }
    
    // Check how much is already in cart
    const cartItem = cart.find((i) => {
      const isSameProduct = (i.id || i._id) === product._id;
      if (product.hasVariants) {
        return isSameProduct && i.selectedVariant?._id === selectedItem._id;
      } else if (product.flavors) {
        return isSameProduct && i.selectedFlavor?._id === selectedItem._id;
      } else if (product.strains) {
        return isSameProduct && i.selectedStrain?._id === selectedItem._id;
      }
      return false;
    });
    
    const currentCartQuantity = cartItem ? cartItem.quantity : 0;
    const totalQuantity = currentCartQuantity + quantity;
    
    // Check if total would exceed stock
    if (totalQuantity > stock) {
      toast.error(`Only ${stock - currentCartQuantity} more can be added (${currentCartQuantity} already in cart)`);
      return;
    }
    
    if (product.hasVariants) {
      addToCart({ ...product, selectedVariant: selectedItem }, quantity);
      toast.success(`${product.name} (${selectedItem.size.value}${selectedItem.size.unit}) added!`);
    } else if (product.flavors) {
      addToCart({ ...product, selectedFlavor: selectedItem }, quantity);
      toast.success(`${product.name} (${selectedItem.name}) added!`);
    } else if (product.strains) {
      addToCart({ ...product, selectedStrain: selectedItem }, quantity);
      toast.success(`${product.name} (${selectedItem.name}) added!`);
    }
    
    // Reset quantity to 1 after adding
    setSelectedOptions(prev => ({
      ...prev,
      [product._id]: { ...prev[product._id], quantity: 1 }
    }));
  };

  // Function to fetch review tags
  const fetchReviewTags = async () => {
    try {
      const response = await fetchAllReviewTags(router);
      if (response.success) {
        setReviewTags(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching review tags:', error);
      toast.error('Failed to load review tags');
    }
  };

  useEffect(() => {
    // Fetch categories on component mount
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        console.log('Fetching categories...');
        const response = await Api('GET', 'categories/categories', null, router);
        console.log('Categories API Response:', response);
        
        if (response && response.success) {
          // Create a mapping of category _id to category name
          const categoryMap = {};
          response.data.forEach(category => {
            if (category && category._id) {
              categoryMap[category._id] = category.category || category.name || '';
            }
          });
          setCategories(categoryMap);
          setCategoriesLoaded(true);
        } else {
          throw new Error(response?.message || 'Failed to load categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategoryError(`Failed to load product categories: ${error.message || 'Unknown error'}`);
        console.error('Categories fetch error:', error);
        toast.error(`Failed to load categories: ${error.message || 'Please try again'}`);
      } finally {
        setLoadingCategories(false);
      }
    };

    if (isLoggedIn) {
      fetchCategories();
      fetchReviewTags();
    }
  }, [isLoggedIn]);



  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [userLoading, isLoggedIn, router]);

  const isDriedProduct = (product) => {
    if (!product || !product.category) return false;
    try {
      const categoryName = typeof product.category === 'string' 
        ? (categories[product.category] || '').toLowerCase()
        : (product.category.category || product.category.name || '').toLowerCase();
      return categoryName === 'dried';
    } catch (error) {
      console.error('Error checking if product is DRIED:', error, product);
      return false;
    }
  };

  const isEdiblesProduct = (product) => {
    if (!product || !product.category) return false;
    try {
      const categoryName = typeof product.category === 'string' 
        ? (categories[product.category] || '').toLowerCase()
        : (product.category.category || product.category.name || '').toLowerCase();
      return categoryName === 'edibles';
    } catch (error) {
      console.error('Error checking if product is EDIBLES:', error, product);
      return false;
    }
  };

  // Initialize selectedOptions when items load
  useEffect(() => {
    if (items && items.length > 0) {
      items.forEach(product => {
        initializeProductSelection(product);
      });
    }
  }, [items]);

  if (userLoading || !isLoggedIn || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{categoryError}</p>
          <button 
            onClick={() => {
              setLoadingCategories(true);
              setCategoryError(null);
              const fetchCategories = async () => {
                try {
                  setLoadingCategories(true);
                  const response = await Api('GET', 'categories/categories', null, router);
                  
                  if (response && response.success) {
                    // Create a mapping of category _id to category name
                    const categoryMap = {};
                    response.data.forEach(category => {
                      if (category && category._id) {
                        categoryMap[category._id] = category.category || category.name || '';
                      }
                    });
                    setCategories(categoryMap);
                    setCategoriesLoaded(true);
                  } else {
                    throw new Error(response?.message || 'Failed to load categories');
                  }
                } catch (error) {
                  console.error('Error fetching categories:', error);
                  setCategoryError('Failed to load product categories');
                  toast.error('Failed to load product categories');
                } finally {
                  setLoadingCategories(false);
                }
              };
              fetchCategories();
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
     

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Heart className="w-7 h-7 text-white fill-white" />
            Wishlist
          </h1>
          <span className="text-gray-300">{count} items</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
          </div>
        ) : count === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-300 mb-4">Your wishlist is empty.</p>
            <Link href="/menu" className="px-6 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 rounded-full hover:bg-cyan-500/30 inline-block transition-all shadow-lg shadow-cyan-500/20">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {items.map((product) => {
              console.log('=== WISHLIST PRODUCT DEBUG ===');
  console.log('Product:', product);
  console.log('Has category?', product.category);
  console.log('Category name:', typeof product.category === 'object' ? product.category.category : product.category);
  console.log('Has variants?', product.hasVariants, product.variants);
  console.log('Has flavors?', product.flavors);
  console.log('isDried?', isDriedProduct(product));
  console.log('isEdibles?', isEdiblesProduct(product));
  console.log('showDriedLayout?', isDriedProduct(product) && product.hasVariants && product.variants && product.variants.length > 0);
  console.log('==============================');
              const isDried = isDriedProduct(product);
              const isEdibles = isEdiblesProduct(product);
              const showDriedLayout = isDried && product.hasVariants && product.variants && product.variants.length > 0;
              // Show EDIBLES layout if product has active flavors (regardless of category)
              const showEdiblesLayout = product.flavors && product.flavors.length > 0 && product.flavors.some(f => f.isActive);
              // Show STRAINS layout if product has active strains
              const showStrainsLayout = product.strains && product.strains.length > 0 && product.strains.some(s => s.isActive);

              // DRIED Product Layout - Menu Style with Dropdown
              if (showDriedLayout) {
                // Initialize selection for this product
                initializeProductSelection(product);
                
                return (
                  <div key={product._id} className="w-full">
                    <div
                      className="relative rounded-3xl overflow-hidden w-full max-w-4xl mx-auto cursor-pointer"
                      style={{
                        background: 'rgba(20, 20, 20, 0.4)',
                        border: '1.2px solid rgba(134, 209, 248, 0.2)'
                      }}
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Left side - Product Image */}
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-800 relative">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                          
                          {/* Stock Status Overlay */}
                          {(() => {
                            const allVariantsOutOfStock = product.variants.every(v => Number(v.stock || 0) <= 0);
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
                          })()}
                        </div>
                        
                        {/* Right side - Product Details */}
                        <div className="w-full md:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-gray-100 mb-2">{product.name}</h3>
                          
                          {/* Intensity Bar */}
                          {product.intensity && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300 uppercase tracking-wide">Intensity - {product.intensity}/10</span><span className="text-sm font-bold text-white">10/10
                                </span>
                              </div>
                              <div className="w-full bg-gray-700/30 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(product.intensity / 10) * 100}%`,
                                    background: 'linear-gradient(90deg, #1D5BC7 0%, #86D1F8 82%, #97E2F8 94.12%, #CAF7FF 100%)',
                                    boxShadow: '0px 1px 17px 0px #86D1F8'
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Transparent Boxes for Weight/Pieces */}
                          {(product.showTotalWeight || product.showTotalPieces || product.showPerPiece) && (
                            <div className="flex flex-nowrap gap-2 mb-4">
                              {product.showTotalWeight && product.totalWeight && (
                                <div className="flex-1 min-w-[90px] border border-white/20 rounded-lg px-4 py-1.5 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Total Weight</div>
                                  <div className="text-sm font-bold text-white">{product.totalWeight}</div>
                                </div>
                              )}
                              {product.showTotalPieces && product.totalPieces && (
                                <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Pieces</div>
                                  <div className="text-sm font-bold text-white">{product.totalPieces}</div>
                                </div>
                              )}
                              {product.showPerPiece && product.perPiece && (
                                <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Per Piece</div>
                                  <div className="text-sm font-bold text-white">{product.perPiece}</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Review Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(product.reviewTags || []).slice(0, 4).map((tagId, idx) => {
                              const tagName = getTagName(tagId);
                              if (!tagName) return null;
                              const labelWithoutEmoji = tagName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                              return (
                                <span 
                                  key={tagId}
                                  className="px-3 py-1.5 text-sm rounded-full font-medium bg-white/5 backdrop-blur-sm border border-blue-400/40 hover:border-2 hover:border-blue-400 transition-all text-white flex items-center gap-2"
                                >
                                  <img src="/images/dots.png" alt="" className="w-4 h-4" />
                                  {labelWithoutEmoji}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* NEW: Dropdown + Quantity + Add to Cart (Menu Style) */}
                          <div className="mt-4">
                            {(() => {
                              const selection = selectedOptions[product._id];
                              const selectedItem = selection?.selectedItem;
                              const quantity = selection?.quantity || 1;
                              const currentPrice = selectedItem?.price || product.price;
                              const currentStock = Number(selectedItem?.stock || 0);
                              const isOutOfStock = currentStock <= 0 || quantity >= currentStock;
                              const options = product.variants;
                              
                              return (
                                <div className="flex flex-col gap-3">
                                  {/* Dropdown + Quantity + Price */}
                                  <div className="flex items-center gap-3">
                                    <select
                                      value={selectedItem?._id || ''}
                                      onChange={(e) => {
                                        const item = options.find(opt => opt._id === e.target.value);
                                        if (item) handleOptionChange(product._id, item);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 bg-transparent border border-white/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                                      style={{ minWidth: '120px' }}
                                    >
                                      <option value="" disabled style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: '#888' }}>Select Size</option>{options.map((item) => {
                                        const stock = Number(item.stock || 0);
                                        const label = `${item.size.value}${item.size.unit}${stock <= 0 ? ' (Out of Stock)' : ''}`;
                                        return (
                                          <option key={item._id} value={item._id} disabled={stock <= 0} style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: 'white' }}>
                                            {label}
                                          </option>
                                        );
                                      })}
                                    </select>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-white/30 rounded-md overflow-hidden">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuantityChangeNew(product._id, -1);
                                        }}
                                        className="px-3 py-2 text-white hover:bg-white/10 transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="px-4 py-2 text-white font-medium min-w-[40px] text-center">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuantityChangeNew(product._id, 1);
                                        }}
                                        disabled={quantity >= currentStock}
                                        className="px-3 py-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                    
                                    {/* Price Display - Only show when item is selected */}
                                    {selectedItem && currentPrice > 0 && (
                                      <div className="text-2xl font-bold text-white">
                                        ${currentPrice}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Add to Cart + Remove from Wishlist */}
                                  <div className="flex items-center gap-3 mt-1">
                                    <button
                                      onClick={(e) => handleAddToCartNew(product, e)}
                                      disabled={isOutOfStock}
                                      className="px-6 py-3 rounded-md font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      style={{ 
                                        width: '70%',
                                        background: isOutOfStock 
                                          ? 'rgba(100, 100, 100, 0.5)'
                                          : 'linear-gradient(90deg, rgba(70, 113, 209, 0.4) 0%, rgba(62, 102, 190, 0.4) 50%, rgba(34, 55, 102, 0.4) 100%)',
                                        border: '1px solid #88AAE4',
                                      }}
                                    >
                                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    
                                    {/* Remove from Wishlist Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        remove(product._id);
                                        toast.success('Removed from wishlist');
                                      }}
                                      className="px-4 py-3 text-white hover:text-red-500 transition-colors"
                                    >
                                      <Heart className="w-6 h-6" fill="currentColor" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // EDIBLES Product Layout - Menu Style with Dropdown
              if (showEdiblesLayout) {
                // Initialize selection for this product
                initializeProductSelection(product);
                
                return (
                  <div key={product._id} className="w-full">
                    <div
                      className="relative rounded-3xl overflow-hidden w-full max-w-4xl mx-auto cursor-pointer"
                      style={{
                        background: 'rgba(20, 20, 20, 0.4)',
                        border: '1.2px solid rgba(134, 209, 248, 0.2)'
                      }}
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Left side - Product Image */}
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-800 relative">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                          
                          {/* Stock Status Overlay */}
                          {(() => {
                            const activeFlavors = product.flavors.filter(f => f.isActive);
                            const allFlavorsOutOfStock = activeFlavors.length > 0 && activeFlavors.every(f => Number(f.stock || 0) <= 0);
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
                        <div className="w-full md:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-gray-100 mb-2">{product.name}</h3>
                          
                          {/* Intensity Bar */}
                          {product.intensity && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300 uppercase tracking-wide">Intensity - {product.intensity}/10</span><span className="text-sm font-bold text-white">10/10
                                </span>
                              </div>
                              <div className="w-full bg-gray-700/30 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(product.intensity / 10) * 100}%`,
                                    background: 'linear-gradient(90deg, #1D5BC7 0%, #86D1F8 82%, #97E2F8 94.12%, #CAF7FF 100%)',
                                    boxShadow: '0px 1px 17px 0px #86D1F8'
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Transparent Boxes for Weight/Pieces */}
                          {(product.showTotalWeight || product.showTotalPieces || product.showPerPiece) && (
                            <div className="flex flex-nowrap gap-2 mb-4">
                              {product.showTotalWeight && product.totalWeight && (
                                <div className="flex-1 min-w-[90px] border border-white/20 rounded-lg px-4 py-1.5 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Total Weight</div>
                                  <div className="text-sm font-bold text-white">{product.totalWeight}</div>
                                </div>
                              )}
                              {product.showTotalPieces && product.totalPieces && (
                                <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Pieces</div>
                                  <div className="text-sm font-bold text-white">{product.totalPieces}</div>
                                </div>
                              )}
                              {product.showPerPiece && product.perPiece && (
                                <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Per Piece</div>
                                  <div className="text-sm font-bold text-white">{product.perPiece}</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Review Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(product.reviewTags || []).slice(0, 4).map((tagId, idx) => {
                              const tagName = getTagName(tagId);
                              if (!tagName) return null;
                              const labelWithoutEmoji = tagName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                              return (
                                <span 
                                  key={tagId}
                                  className="px-3 py-1.5 text-sm rounded-full font-medium bg-white/5 backdrop-blur-sm border border-blue-400/40 hover:border-2 hover:border-blue-400 transition-all text-white flex items-center gap-2"
                                >
                                  <img src="/images/dots.png" alt="" className="w-4 h-4" />
                                  {labelWithoutEmoji}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* NEW: Dropdown + Quantity + Add to Cart (Menu Style) */}
                          <div className="mt-4">
                            {(() => {
                              const selection = selectedOptions[product._id];
                              const selectedItem = selection?.selectedItem;
                              const quantity = selection?.quantity || 1;
                              const currentPrice = selectedItem?.price || product.price;
                              const currentStock = Number(selectedItem?.stock || 0);
                              const isOutOfStock = currentStock <= 0 || quantity >= currentStock;
                              const options = product.flavors.filter(f => f.isActive);
                              
                              return (
                                <div className="flex flex-col gap-3">
                                  {/* Dropdown + Quantity + Price */}
                                  <div className="flex items-center gap-3">
                                    <select
                                      value={selectedItem?._id || ''}
                                      onChange={(e) => {
                                        const item = options.find(opt => opt._id === e.target.value);
                                        if (item) handleOptionChange(product._id, item);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 bg-transparent border border-white/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                                      style={{ minWidth: '120px' }}
                                    >
                                      <option value="" disabled style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: '#888' }}>Select Flavor</option>{options.map((item) => { const stock = Number(item.stock || 0); const label = `${item.name}${stock <= 0 ? ' (Out of Stock)' : ''}`;
                                        return (
                                          <option key={item._id} value={item._id} disabled={stock <= 0} style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: 'white' }}>
                                            {label}
                                          </option>
                                        );
                                      })}
                                    </select>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-white/30 rounded-md overflow-hidden">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuantityChangeNew(product._id, -1);
                                        }}
                                        className="px-3 py-2 text-white hover:bg-white/10 transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="px-4 py-2 text-white font-medium min-w-[40px] text-center">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuantityChangeNew(product._id, 1);
                                        }}
                                        disabled={quantity >= currentStock}
                                        className="px-3 py-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                    
                                    {/* Price Display - Only show when item is selected */}
                                    {selectedItem && currentPrice > 0 && (
                                      <div className="text-2xl font-bold text-white">
                                        ${currentPrice}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Add to Cart + Remove from Wishlist */}
                                  <div className="flex items-center gap-3 mt-1">
                                    <button
                                      onClick={(e) => handleAddToCartNew(product, e)}
                                      disabled={isOutOfStock}
                                      className="px-6 py-3 rounded-md font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      style={{ 
                                        width: '70%',
                                        background: isOutOfStock 
                                          ? 'rgba(100, 100, 100, 0.5)'
                                          : 'linear-gradient(90deg, rgba(70, 113, 209, 0.4) 0%, rgba(62, 102, 190, 0.4) 50%, rgba(34, 55, 102, 0.4) 100%)',
                                        border: '1px solid #88AAE4',
                                      }}
                                    >
                                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    
                                    {/* Remove from Wishlist Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        remove(product._id);
                                        toast.success('Removed from wishlist');
                                      }}
                                      className="px-4 py-3 text-white hover:text-red-500 transition-colors"
                                    >
                                      <Heart className="w-6 h-6" fill="currentColor" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // STRAINS Product Layout - Menu Style with Dropdown
              if (showStrainsLayout) {
                // Initialize selection for this product
                initializeProductSelection(product);
                
                return (
                  <div key={product._id} className="w-full">
                    <div
                      className="relative rounded-3xl overflow-hidden w-full max-w-4xl mx-auto cursor-pointer"
                      style={{
                        background: 'rgba(20, 20, 20, 0.4)',
                        border: '1.2px solid rgba(134, 209, 248, 0.2)'
                      }}
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Left side - Product Image */}
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-800 relative">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200"></div>
                          )}
                          
                          {/* Stock Status Overlay */}
                          {(() => {
                            const activeStrains = product.strains.filter(s => s.isActive);
                            const allStrainsOutOfStock = activeStrains.length > 0 && activeStrains.every(s => Number(s.stock || 0) <= 0);
                            if (allStrainsOutOfStock) {
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
                          <h3 className="text-2xl font-bold text-gray-100 mb-2">{product.name}</h3>
                          
                          {/* Intensity Bar */}
                          {product.intensity && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300 uppercase tracking-wide">Intensity - {product.intensity}/10</span>
                                <span className="text-sm font-bold text-white">10/10</span>
                              </div>
                              <div className="w-full bg-gray-700/30 rounded-full h-2">
                                <div 
                                  className="h-2 rounded-full transition-all duration-300"
                                  style={{ 
                                    width: `${(product.intensity / 10) * 100}%`,
                                    background: 'linear-gradient(90deg, #1D5BC7 0%, #86D1F8 82%, #97E2F8 94.12%, #CAF7FF 100%)',
                                    boxShadow: '0px 1px 17px 0px #86D1F8'
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Transparent Boxes for Weight/Pieces */}
                          {(product.showTotalWeight || product.showTotalPieces || product.showPerPiece) && (
                            <div className="flex flex-nowrap gap-2 mb-4">
                              {product.showTotalWeight && product.totalWeight && (
                                <div className="flex-1 min-w-[90px] border border-white/20 rounded-lg px-4 py-1.5 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Total Weight</div>
                                  <div className="text-sm font-bold text-white">{product.totalWeight}</div>
                                </div>
                              )}
                              {product.showTotalPieces && product.totalPieces && (
                                <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Pieces</div>
                                  <div className="text-sm font-bold text-white">{product.totalPieces}</div>
                                </div>
                              )}
                              {product.showPerPiece && product.perPiece && (
                                <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                                  <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Per Piece</div>
                                  <div className="text-sm font-bold text-white">{product.perPiece}</div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Review Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {(product.reviewTags || []).slice(0, 4).map((tagId, idx) => {
                              const tagName = getTagName(tagId);
                              if (!tagName) return null;
                              const labelWithoutEmoji = tagName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                              return (
                                <span 
                                  key={tagId}
                                  className="px-3 py-1.5 text-sm rounded-full font-medium bg-white/5 backdrop-blur-sm border border-blue-400/40 hover:border-2 hover:border-blue-400 transition-all text-white flex items-center gap-2"
                                >
                                  <img src="/images/dots.png" alt="" className="w-4 h-4" />
                                  {labelWithoutEmoji}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Dropdown + Quantity + Add to Cart */}
                          <div className="mt-4">
                            {(() => {
                              const selection = selectedOptions[product._id];
                              const selectedItem = selection?.selectedItem;
                              const quantity = selection?.quantity || 1;
                              const currentPrice = selectedItem?.price || product.price;
                              const currentStock = Number(selectedItem?.stock || 0);
                              const isOutOfStock = currentStock <= 0 || quantity >= currentStock;
                              const options = product.strains.filter(s => s.isActive);
                              
                              return (
                                <div className="flex flex-col gap-3">
                                  {/* Dropdown + Quantity + Price */}
                                  <div className="flex items-center gap-3">
                                    <select
                                      value={selectedItem?._id || ''}
                                      onChange={(e) => {
                                        const item = options.find(opt => opt._id === e.target.value);
                                        if (item) handleOptionChange(product._id, item);
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="flex-1 bg-transparent border border-white/30 rounded-md px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-400"
                                      style={{ minWidth: '120px' }}
                                    >
                                      <option value="" disabled style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: '#888' }}>Select Strain</option>
                                      {options.map((item) => {
                                        const stock = Number(item.stock || 0);
                                        const label = `${item.name}${stock <= 0 ? ' (Out of Stock)' : ''}`;
                                        return (
                                          <option key={item._id} value={item._id} disabled={stock <= 0} style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: 'white' }}>
                                            {label}
                                          </option>
                                        );
                                      })}
                                    </select>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center border border-white/30 rounded-md overflow-hidden">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuantityChangeNew(product._id, -1);
                                        }}
                                        className="px-3 py-2 text-white hover:bg-white/10 transition-colors"
                                      >
                                        -
                                      </button>
                                      <span className="px-4 py-2 text-white font-medium min-w-[40px] text-center">
                                        {quantity}
                                      </span>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleQuantityChangeNew(product._id, 1);
                                        }}
                                        disabled={quantity >= currentStock}
                                        className="px-3 py-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                                      >
                                        +
                                      </button>
                                    </div>
                                    
                                    {/* Price Display - Only show when item is selected */}
                                    {selectedItem && currentPrice > 0 && (
                                      <div className="text-2xl font-bold text-white">
                                        ${currentPrice}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Add to Cart + Remove from Wishlist */}
                                  <div className="flex items-center gap-3 mt-1">
                                    <button
                                      onClick={(e) => handleAddToCartNew(product, e)}
                                      disabled={isOutOfStock}
                                      className="px-6 py-3 rounded-md font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                      style={{ 
                                        width: '70%',
                                        background: isOutOfStock 
                                          ? 'rgba(100, 100, 100, 0.5)'
                                          : 'linear-gradient(90deg, rgba(70, 113, 209, 0.4) 0%, rgba(62, 102, 190, 0.4) 50%, rgba(34, 55, 102, 0.4) 100%)',
                                        border: '1px solid #88AAE4',
                                      }}
                                    >
                                      {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                    </button>
                                    
                                    {/* Remove from Wishlist Button */}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        remove(product._id);
                                        toast.success('Removed from wishlist');
                                      }}
                                      className="px-4 py-3 text-white hover:text-red-500 transition-colors"
                                    >
                                      <Heart className="w-6 h-6" fill="currentColor" />
                                    </button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal Product Card (non-DRIED, non-EDIBLES) - Menu Style
              const stock = Number(product.stock || 0);
              const isOutOfStock = !product.hasStock || stock <= 0;
              const cartItem = cart.find((i) => (i.id || i._id) === (product._id || product.id));
              
              return (
                <div
                  key={product._id || product.id}
                  className="relative rounded-3xl overflow-hidden w-full max-w-4xl mx-auto cursor-pointer"
                  style={{
                    background: 'rgba(20, 20, 20, 0.4)',
                    border: '1.2px solid rgba(134, 209, 248, 0.2)'
                  }}
                  onClick={() => router.push(`/productdetails?id=${product._id || product.id}`)}
                >
                  <div className="flex flex-col lg:flex-row">
                    {/* Left side - Product Image */}
                    <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-800 relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200"></div>
                      )}
                      
                      {/* Stock Status Overlay */}
                      {isOutOfStock ? (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                          <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                            Out of<br />Stock
                          </div>
                        </div>
                      ) : stock > 0 && stock < 5 ? (
                        <div className="absolute top-2 right-2 z-10">
                          <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            Only {stock} left
                          </div>
                        </div>
                      ) : null}
                    </div>

                    {/* Right side - Product Details */}
                    <div className="w-full md:w-3/5 p-6">
                      <h3 className="text-2xl font-bold text-gray-100 mb-2">{product.name}</h3>
                      
                      {/* Intensity Bar */}
                      {product.intensity && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-gray-300 uppercase tracking-wide">Intensity - {product.intensity}/10</span><span className="text-sm font-bold text-white">10/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-700/30 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ 
                                width: `${(product.intensity / 10) * 100}%`,
                                background: 'linear-gradient(90deg, #1D5BC7 0%, #86D1F8 82%, #97E2F8 94.12%, #CAF7FF 100%)',
                                boxShadow: '0px 1px 17px 0px #86D1F8'
                              }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Transparent Boxes for Weight/Pieces */}
                      {(product.showTotalWeight || product.showTotalPieces || product.showPerPiece) && (
                        <div className="flex flex-nowrap gap-2 mb-4">
                          {product.showTotalWeight && product.totalWeight && (
                            <div className="flex-1 min-w-[90px] border border-white/20 rounded-lg px-4 py-1.5 text-center">
                              <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Total Weight</div>
                              <div className="text-sm font-bold text-white">{product.totalWeight}</div>
                            </div>
                          )}
                          {product.showTotalPieces && product.totalPieces && (
                            <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                              <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Pieces</div>
                              <div className="text-sm font-bold text-white">{product.totalPieces}</div>
                            </div>
                          )}
                          {product.showPerPiece && product.perPiece && (
                            <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-3 text-center">
                              <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Per Piece</div>
                              <div className="text-sm font-bold text-white">{product.perPiece}</div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Review Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(product.reviewTags || []).slice(0, 4).map((tagId, idx) => {
                          const tagName = getTagName(tagId);
                          if (!tagName) return null;
                          const labelWithoutEmoji = tagName.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                          return (
                            <span 
                              key={tagId}
                              className="px-3 py-1.5 text-sm rounded-full font-medium bg-white/5 backdrop-blur-sm border border-blue-400/40 hover:border-2 hover:border-blue-400 transition-all text-white flex items-center gap-2"
                            >
                              <img src="/images/dots.png" alt="" className="w-4 h-4" />
                              {labelWithoutEmoji}
                            </span>
                          );
                        })}
                      </div>

                      {/* Price and Add to Cart */}
                      <div className="mt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl font-bold text-white">
                            ${product.price}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <button
                            onClick={(e) => handleAddToCart(product, e)}
                            disabled={isOutOfStock}
                            className="px-6 py-3 rounded-md font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ 
                              width: '70%',
                              background: isOutOfStock 
                                ? 'rgba(100, 100, 100, 0.5)'
                                : 'linear-gradient(90deg, rgba(70, 113, 209, 0.4) 0%, rgba(62, 102, 190, 0.4) 50%, rgba(34, 55, 102, 0.4) 100%)',
                              border: '1px solid #88AAE4',
                            }}
                          >
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                          </button>
                          
                          {/* Remove from Wishlist Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              remove(product._id || product.id);
                              toast.success('Removed from wishlist');
                            }}
                            className="px-4 py-3 text-white hover:text-red-500 transition-colors"
                          >
                            <Heart className="w-6 h-6" fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}



