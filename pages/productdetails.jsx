import { useState, useEffect } from 'react';
import { Heart, Package } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { Api } from '../service/service';
import { useWishlist } from '../context/WishlistContext';

export default function ProductDetails() {
  const [quantity, setQuantity] = useState(1);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewAgg, setReviewAgg] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const router = useRouter();
  const { id } = router.query;
  const { isLoggedIn, userLoading } = useUser();
  const { addToCart } = useApp();
  const { isInWishlist, toggle } = useWishlist();
  const isWishlisted = product ? isInWishlist(product._id || product.id) : false;
  
  useEffect(() => {
    // Only check after loading is complete
    if (!userLoading) {
      // Check if user is logged in
      if (!isLoggedIn) {
        // Show toast notification
        toast.error('Please login to view product details', {
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
      }
    }
  }, [isLoggedIn, userLoading, router]);

  // Fetch product data when ID changes
  useEffect(() => {
    if (id && isLoggedIn) {
      fetchProduct();
      fetchAgg();
    }
  }, [id, isLoggedIn]);

  // Set default variant and flavor when product loads
  useEffect(() => {
    if (product) {
      // Set default variant if product has variants
      if (product.hasVariants && product.variants && product.variants.length > 0) {
        setSelectedVariant(product.variants[0]);
      } else {
        setSelectedVariant(null);
      }
      
      // Set default flavor if product has flavors
      if (product.flavors && product.flavors.length > 0) {
        setSelectedFlavor(product.flavors[0]);
      } else {
        setSelectedFlavor(null);
      }
    }
  }, [product]);

  // Calculate final price based on selected variant and flavor
  const getFinalPrice = () => {
    let price = 0;
    
    // If product has variants, use selected variant price
    if (product?.hasVariants && selectedVariant) {
      price = Number(selectedVariant.price || 0);
    } else {
      // Otherwise use base product price
      price = Number(product?.price || 0);
    }
    
    // Add flavor price if flavor is selected
    if (selectedFlavor) {
      price += Number(selectedFlavor.price || 0);
    }
    
    return price.toFixed(2);
  };

  // Get available stock based on selection
  const getAvailableStock = () => {
    if (product?.hasVariants && selectedVariant) {
      return Number(selectedVariant.stock || 0);
    }
    return Number(product?.stock || 0);
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await Api('GET', `products/${id}`, null, router);
      console.log('Product response:', response);
      if (response.success) {
        setProduct(response.data);
      } else {
        setError('Product not found');
        toast.error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError('Failed to load product');
      toast.error('Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    try {
      const res = await toggle(product);
      if (res?.success) {
        toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
      } else if (res?.redirect) {
        // handled globally via Api
      } else {
        toast.error('Failed to update wishlist');
      }
    } catch (e) {
      toast.error('Failed to update wishlist');
    }
  };

  const fetchAgg = async () => {
    try {
      const r = await Api('GET', `reviews/product/${id}/aggregate?limit=5`, null, router);
      if (r.success) setReviewAgg(r.data || []);
    } catch (e) {}
  }

  // Handle quantity change
  const increaseQuantity = () => setQuantity(prev => {
    const max = Math.max(0, getAvailableStock());
    const next = prev + 1;
    if (max > 0 && next > max) return max;
    return next;
  });
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  // Handle add to cart
  const handleAddToCart = () => {
    if (!product) return;
    const stock = getAvailableStock();
    if (!product.hasStock || stock <= 0) return;
    
    // Validate variant selection if product has variants
    if (product.hasVariants && !selectedVariant) {
      toast.error('Please select a size');
      return;
    }
    
    const qty = Math.min(quantity, stock);
    
    // Create cart item with variant and flavor info
    const cartItem = {
      ...product,
      selectedVariant: selectedVariant,
      selectedFlavor: selectedFlavor,
      finalPrice: getFinalPrice(),
    };
    
    addToCart(cartItem, qty);
    
    let message = `${product.name}`;
    if (selectedVariant) {
      message += ` (${selectedVariant.size.value}${selectedVariant.size.unit})`;
    }
    if (selectedFlavor) {
      message += ` - ${selectedFlavor.name}`;
    }
    message += ' added to cart!';
    
    toast.success(message);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#536690] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-lg mb-4">{error}</p>
          <button 
            onClick={() => router.push('/menu')}
            className="px-6 py-2 bg-[#536690] text-white rounded-full hover:bg-[#536690] transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // No product state
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Product not found</p>
          <button 
            onClick={() => router.push('/menu')}
            className="px-6 py-2 bg-[#536690] text-white rounded-full hover:bg-[#536690] transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Tag color presets
  const colors = [
    { bg: '#B3194275', color: 'white' },
    { bg: '#8b5cf6', color: 'white' },
    { bg: '#CD45B480', color: 'white' },
    { bg: '#53669080', color: 'white' },
    { bg: '#2E2E2E40', color: 'white' },
  ];

  // Static ratings data for the 3 images section (preserved)
  // const ratings = {
  //   count: 15,
  //   stats: [
  //     { effect: 'Euphoric' },
  //     { effect: 'Joy' },
  //     { effect: 'Creative' }
  //   ]
  // };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-700">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/menu" className="hover:text-gray-700">Menu</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Images */}
          <div className="md:w-1/2">
            {/* Main Image */}
            <div className="bg-gray-50 rounded-4xl overflow-hidden mb-4">
              <img 
                src={product.images && product.images.length > 0 
                  ? (product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`)
                  : '/images/details.png'
                } 
                alt={product.name}
                className="w-full h-auto object-cover"
              />
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-4">
              {product.images && product.images.length > 1 ? (
                product.images.slice(1, 4).map((image, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg aspect-square overflow-hidden">
                    <img 
                      src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                      alt={`${product.name} ${index + 2}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))
              ) : (
                Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="bg-gray-200 rounded-lg aspect-square flex items-center justify-center">
                    <span className="text-gray-400 text-sm">Product Image</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
            
            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg text-gray-700 font-semibold mb-2">Description</h2>
              <p className="text-gray-700 mb-4">{product.description?.main || 'No description available'}</p>
              {product.description?.details && (
                <p className="text-gray-700">{product.description.details}</p>
              )}
            </div>

            {/* Size Variant Selection */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-700 font-semibold mb-2">Select Size</h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setQuantity(1); // Reset quantity when changing variant
                      }}
                      className={`px-3 py-2 border-2 rounded-lg transition-all text-left ${
                        selectedVariant === variant
                          ? 'border-[#536690] bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {variant.size.value}{variant.size.unit}
                        </span>
                        <span className="text-sm text-[#536690] font-medium">
                          ${Number(variant.price).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Stock: {variant.stock}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor Selection */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm text-gray-700 font-semibold mb-2">Select Flavor</h3>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((flavor, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedFlavor(flavor)}
                      className={`px-3 py-2 border-2 rounded-lg transition-all ${
                        selectedFlavor === flavor
                          ? 'border-green-600 bg-green-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {flavor.name}
                        </span>
                        <span className="text-sm text-green-600 font-medium">
                          {Number(flavor.price) > 0 ? `+$${Number(flavor.price).toFixed(2)}` : 'Free'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <h2 className="text-lg text-gray-700 font-semibold mb-2">Final Price</h2>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-[#536690]">$ {getFinalPrice()}</p>
                {(selectedVariant || selectedFlavor) && (
                  <span className="text-sm text-gray-500">
                    {selectedVariant && `(${selectedVariant.size.value}${selectedVariant.size.unit})`}
                    {selectedVariant && selectedFlavor && ' + '}
                    {selectedFlavor && `${selectedFlavor.name}`}
                  </span>
                )}
              </div>
            </div>

            {/* Quantity Selector (respect stock limits) */}
            <div className="mb-6">
              <h3 className="text-lg text-gray-700 font-semibold mb-3">Quantity</h3>
              <div className="flex items-center ">
                <button 
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-gray-600  text-lg">-</span>
                </button>
                <span className="text-xl font-semibold text-gray-800 w-16 text-center">{quantity}</span>
                <button 
                  onClick={increaseQuantity}
                  disabled={getAvailableStock() > 0 && quantity >= getAvailableStock()}
                  className="w-10 h-10 rounded-full text-gray-600 border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-lg">+</span>
                </button>
              </div>
              {getAvailableStock() <= 0 ? (
                <p className="mt-2 text-sm text-red-600">Out of stock</p>
              ) : getAvailableStock() < 5 ? (
                <p className="mt-2 text-sm text-gray-600">Only {getAvailableStock()} left</p>
              ) : null}
            </div>

            {/* Add to Cart Section */}
            <div className="flex items-center gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                disabled={!product.hasStock || getAvailableStock() <= 0}
                className={`bg-[#536690] hover:bg-[#536690] text-white font-medium py-3 px-8 rounded-full flex items-center justify-center gap-2 flex-1 transition-colors ${
                  (!product.hasStock || getAvailableStock() <= 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <span>{(product.hasStock && getAvailableStock() > 0) ? 'Add to Cart' : 'Out of Stock'}</span>
                {(product.hasStock && getAvailableStock() > 0) && <span className="text-xl">+</span>}
              </button>
              
              <button onClick={handleToggleWishlist} className="border border-gray-300 bg-white text-gray-500 font-medium py-3 px-6 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center">
                <span className="mr-2">{isWishlisted ? 'Wishlisted' : 'Wishlist'}</span>
                <Heart className="w-5 h-5" style={{ color: isWishlisted ? '#80A6F7' : undefined }} fill={isWishlisted ? '#80A6F7' : 'none'} />
              </button>
            </div>
          </div>
        </div>

        {/* Ratings and Tags Section (original position restored) */}
       <div className="mt-16">
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
    {/* Research Section - Left Side (now dynamic) */}
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Research</h2>
        <span className="text-sm text-gray-500">
          {product.reviewTags?.length || 0} Research 
        </span>
      </div>
      
      {product.reviewTags && product.reviewTags.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {product.reviewTags.map((tag, idx) => {
            const color = colors[Math.min(idx, colors.length - 1)];
            const label = tag.label || '';
            const match = label.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u);
            const emoji = match ? match[0] + ' ' : '';
            const text = label.replace(/^[\p{Emoji}\p{Extended_Pictographic}]\s*/u, '');
            
            return (
              <span 
                key={tag._id} 
                className="px-4 py-3 rounded-full text-sm font-medium flex items-center gap-2" 
                style={{ backgroundColor: color.bg, color: color.color }}
              >
                <span className="text-sm">{emoji}</span>
                {text}
              </span>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            
          </div>
          <p className="text-sm text-gray-500">No research tags available </p>
        </div>
      )}
    </div>

    {/* Tags Section - Right Side (Customer Feedback - keep as is) */}
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Customer Feedback</h3>
      <div className="flex flex-wrap gap-3">
        {reviewAgg.length > 0 ? (
          reviewAgg.map((agg, idx) => {
            const color = colors[Math.min(idx, colors.length - 1)];
            const label = agg.label || '';
            const match = label.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u);
            const emoji = match ? match[0] + ' ' : '';
            const text = label.replace(/^[\p{Emoji}\p{Extended_Pictographic}]\s*/u, '');
            return (
              <span key={agg._id} className={`px-4 py-3 rounded-full text-sm font-medium flex items-center gap-2`} style={{ backgroundColor: color.bg, color: color.color }}>
                <span className="text-sm">{emoji}</span>
                {text} ({agg.count})
              </span>
            );
          })
        ) : (
          <span className="px-4 py-3 rounded-full text-sm font-medium flex items-center gap-2" style={{ backgroundColor: '#B3194275', color: 'white' }}>
            No reviews yet
          </span>
        )}
      </div>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}