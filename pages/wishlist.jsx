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

  if (userLoading || !isLoggedIn || loadingCategories) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (categoryError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-7 h-7" style={{ color: '#80A6F7' }} fill="#80A6F7" />
            Wishlist
          </h1>
          <span className="text-gray-500">{count} items</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#536690]"></div>
          </div>
        ) : count === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
            <Link href="/menu" className="px-6 py-2 bg-[#536690] text-white rounded-full hover:bg-[#536690]">
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
              const showEdiblesLayout = isEdibles && product.flavors && product.flavors.length > 0 && product.flavors.some(f => f.isActive);

              // DRIED Product Layout
              if (showDriedLayout) {
                return (
                  <div key={product._id} className="w-full">
                    <div
                      className="relative rounded-3xl border border-gray-200 hover:shadow-lg transition-shadow bg-white overflow-hidden w-full max-w-4xl mx-auto"
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Left side - Product Image */}
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
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
                        <div className="w-full lg:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                          
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
                            {(product.reviewTags || []).slice(0, 4).map((tagId, idx) => {
                              const tagName = getTagName(tagId);
                              if (!tagName) return null;
                              const color = colors[idx % colors.length];
                              return (
                                <span 
                                  key={tagId} 
                                  className="px-3 py-1.5 text-sm rounded-full font-medium"
                                  style={{ backgroundColor: color.bg, color: color.color }}
                                >
                                  {tagName}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Variants with pricing */}
                          <div className="mt-4">
                            <div className="flex flex-wrap items-center gap-3">
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
                                    {/* Add to Cart Button - Top Right */}
                                    <div className="absolute -top-2 -right-2">
                                      {isInCart ? (
                                        <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                                          <button 
                                            onClick={(e) => handleQuantityChange(product, cartItem.quantity - 1, variant, null, e)}
                                            className="p-1 hover:bg-gray-50 rounded-l-full transition-colors"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <path d="M5 12h14"/>
                                            </svg>
                                          </button>
                                          <span className="px-2 text-xs font-bold">
                                            {cartItem.quantity}
                                          </span>
                                          <button 
                                            onClick={(e) => {
                                              if (cartItem.quantity < variantStock) {
                                                handleQuantityChange(product, cartItem.quantity + 1, variant, null, e);
                                              } else {
                                                toast.error(`Only ${variantStock} available`);
                                              }
                                            }}
                                            disabled={cartItem.quantity >= variantStock}
                                            className="p-1 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-50"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <path d="M12 5v14M5 12h14"/>
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
                                            isOutOfStock 
                                              ? 'bg-gray-300 cursor-not-allowed' 
                                              : 'bg-gray-900 hover:bg-gray-800'
                                          }`}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M12 5v14M5 12h14"/>
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
                              
                              {/* Remove from Wishlist Button */}
                              <div 
                                className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove(product._id);
                                  toast.success('Removed from wishlist');
                                }}
                              >
                                <span className="text-sm font-medium">Remove</span>
                                <Heart className="w-5 h-5" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // EDIBLES Product Layout
              if (showEdiblesLayout) {
                return (
                  <div key={product._id} className="w-full">
                    <div
                      className="relative rounded-3xl border border-gray-200 hover:shadow-lg transition-shadow bg-white overflow-hidden w-full max-w-4xl mx-auto"
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Left side - Product Image */}
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
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
                        <div className="w-full lg:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                          
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
                            {(product.reviewTags || []).slice(0, 4).map((tagId, idx) => {
                              const tagName = getTagName(tagId);
                              if (!tagName) return null;
                              const color = colors[idx % colors.length];
                              return (
                                <span 
                                  key={tagId} 
                                  className="px-3 py-1.5 text-sm rounded-full font-medium"
                                  style={{ backgroundColor: color.bg, color: color.color }}
                                >
                                  {tagName}
                                </span>
                              );
                            })}
                          </div>
                          
                          {/* Flavors with pricing */}
                          <div className="mt-4">
                            <div className="flex flex-wrap items-center gap-3">
                              {product.flavors.filter(f => f.isActive).map((flavor) => {
                                const cartItem = cart.find((i) => {
                                  const isSameProduct = (i.id || i._id) === product._id;
                                  const isSameFlavor = i.selectedFlavor?._id === flavor._id;
                                  return isSameProduct && isSameFlavor;
                                });
                                
                                const isInCart = cartItem && cartItem.quantity > 0;
                                const flavorStock = Number(flavor.stock || 0);
                                const isOutOfStock = flavorStock <= 0;
                                
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
                                            onClick={(e) => handleQuantityChange(product, cartItem.quantity - 1, null, flavor, e)}
                                            className="p-1 hover:bg-gray-50 rounded-l-full transition-colors"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <path d="M5 12h14"/>
                                            </svg>
                                          </button>
                                          <span className="px-2 text-xs font-bold">
                                            {cartItem.quantity}
                                          </span>
                                          <button 
                                            onClick={(e) => {
                                              if (cartItem.quantity < flavorStock) {
                                                handleQuantityChange(product, cartItem.quantity + 1, null, flavor, e);
                                              } else {
                                                toast.error(`Only ${flavorStock} available`);
                                              }
                                            }}
                                            disabled={cartItem.quantity >= flavorStock}
                                            className="p-1 hover:bg-gray-50 rounded-r-full transition-colors disabled:opacity-50"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <path d="M12 5v14M5 12h14"/>
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
                                            isOutOfStock 
                                              ? 'bg-gray-300 cursor-not-allowed' 
                                              : 'bg-gray-900 hover:bg-gray-800'
                                          }`}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                            <path d="M12 5v14M5 12h14"/>
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
                              
                              {/* Remove from Wishlist Button */}
                              <div 
                                className="flex items-center space-x-2 cursor-pointer hover:text-red-500 transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  remove(product._id);
                                  toast.success('Removed from wishlist');
                                }}
                              >
                                <span className="text-sm font-medium">Remove</span>
                                <Heart className="w-5 h-5" fill="currentColor" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              // Normal Product Card (non-DRIED, non-EDIBLES)
              const stock = Number(product.stock || 0);
              const isOutOfStock = !product.hasStock || stock <= 0;
              const cartItem = cart.find((i) => (i.id || i._id) === (product._id || product.id));
              
              return (
                <div
                  key={product._id || product.id}
                  className="relative rounded-2xl border border-gray-200 hover:shadow-md transition-shadow bg-white overflow-hidden cursor-pointer max-w-sm"
                  onClick={() => router.push(`/productdetails?id=${product._id || product.id}`)}
                >
                  {/* Image + Stock overlay */}
                  <div className="bg-gray-50 aspect-[4/3] overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
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

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-[#536690] font-bold">$ {product.price}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(product._id || product.id); toast.success('Removed from wishlist'); }}
                        className="p-2 rounded-full border hover:bg-gray-50"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-5 h-5" style={{ color: '#80A6F7' }} fill="#80A6F7" />
                      </button>
                    </div>

                    {/* Cart controls */}
                    <div className="flex justify-center mt-4">
                      {cartItem ? (
                        <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center border border-gray-300 rounded-full bg-white">
                            <button 
                              onClick={(e) => handleQuantityChange(product, (cartItem.quantity || 0) - 1, null, null, e)}
                              className="p-2 hover:bg-gray-50 rounded-l-full transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-600 hover:text-black" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14"/>
                              </svg>
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-800 font-medium min-w-[2rem] text-center">
                              {cartItem.quantity}
                            </span>
                            <button 
                              onClick={(e) => handleQuantityChange(product, (cartItem.quantity || 0) + 1, null, null, e)}
                              disabled={isOutOfStock || (stock > 0 && (cartItem.quantity || 0) >= stock)}
                              className={`p-2 rounded-r-full transition-colors ${
                                isOutOfStock || (stock > 0 && (cartItem.quantity || 0) >= stock)
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" className={`w-4 h-4 ${
                                isOutOfStock || (stock > 0 && (cartItem.quantity || 0) >= stock)
                                  ? 'text-gray-400' 
                                  : 'text-gray-600 hover:text-black'
                              }`} fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : isOutOfStock ? (
                        <button
                          className="w-[40%] py-2 px-4 rounded-4xl text-sm font-medium bg-gray-400 text-white cursor-not-allowed"
                          disabled={true}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <button
                          className="w-[40%] py-2 px-4 rounded-4xl text-sm font-medium transition-colors bg-[#536690] text-white hover:bg-[#536690]"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          Add to Cart
                        </button>
                      )}
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