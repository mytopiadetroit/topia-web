import { useState, useEffect, useRef } from 'react';
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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

        // Redirect to welcome page
        router.push('/welcome');
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

  // Fetch related products when product loads
  useEffect(() => {
    if (product && product._id) {
      fetchRelatedProducts();
    }
  }, [product]);

  const fetchRelatedProducts = async () => {
    try {
      setRelatedLoading(true);
      const response = await Api('GET', `products/${product._id}/related?limit=4`, null, router);
      if (response.success) {
        setRelatedProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching related products:', error);
    } finally {
      setRelatedLoading(false);
    }
  };
  const getFinalPrice = () => {
    if (!product) return '0.00';

    let price = 0;

    // Priority 1: If flavor is selected, use flavor price
    if (selectedFlavor && selectedFlavor.price) {
      price = Number(selectedFlavor.price) || 0;
      console.log('Using flavor price:', price);
    }
    // Priority 2: If variant is selected, use variant price
    else if (product?.hasVariants && selectedVariant) {
      price = Number(selectedVariant.price || 0);
      console.log('Using variant price:', price);
    }
    // Priority 3: Use base product price
    else {
      price = Number(product?.price || 0);
      console.log('Using base product price:', price);
    }

    const finalPrice = price.toFixed(2);
    console.log('Final calculated price:', finalPrice);
    return finalPrice;
  };

  // Update price display when variant or flavor changes
  const [displayPrice, setDisplayPrice] = useState('0.00');
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  const descriptionRef = useRef(null);

  // Update price whenever relevant state changes
  useEffect(() => {
    if (product) {
      const newPrice = getFinalPrice();
      console.log('Updating display price to:', newPrice);
      setDisplayPrice(newPrice);
    }
  }, [selectedVariant, selectedFlavor, product, quantity]);

  // Check if description is long enough to need "Read More"
  useEffect(() => {
    if (descriptionRef.current) {
      const isLong = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsDescriptionLong(isLong);
    }
  }, [product?.description]);

  // Get available stock based on selection
  const getAvailableStock = () => {

    if (selectedFlavor) {
      return Number(selectedFlavor.stock || 0);
    }

    if (product?.hasVariants && selectedVariant) {
      return Number(selectedVariant.stock || 0);
    }

    if (product?.flavors && product.flavors.length > 0) {
      const totalFlavorStock = product.flavors.reduce((sum, flavor) => {
        return sum + Number(flavor.stock || 0);
      }, 0);
      return totalFlavorStock;
    }

    if (product?.hasVariants && product.variants && product.variants.length > 0) {
      const totalVariantStock = product.variants.reduce((sum, variant) => {
        return sum + Number(variant.stock || 0);
      }, 0);
      return totalVariantStock;
    }

    // Priority 5: Use base product stock
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
      console.log('Review Agg response:', r);
      if (r.success) setReviewAgg(r.data || []);
    } catch (e) { }
  }

  // Handle quantity change
  const increaseQuantity = () => setQuantity(prev => {
    const max = Math.max(0, getAvailableStock());
    const next = prev + 1;
    if (max > 0 && next > max) return max;
    return next;
  });
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return;
    }

    // Check stock before adding
    const availableStock = getAvailableStock();
    if (availableStock <= 0) {
      toast.error('This item is out of stock');
      return;
    }

    if (quantity > availableStock) {
      toast.error(`Only ${availableStock} items available`);
      return;
    }

    const qty = quantity;
    const finalPrice = getFinalPrice();

    // Create a clean cart item with all necessary details
    const cartItem = {
      ...product,
      price: Number(finalPrice),
      originalPrice: Number(product.price),
      selectedVariant: selectedVariant,
      selectedFlavor: selectedFlavor,
      displayName: [
        product.name,
        selectedVariant && `(${selectedVariant.size.value}${selectedVariant.size.unit})`,
        selectedFlavor && selectedFlavor.name
      ].filter(Boolean).join(' ')
    };

    addToCart(cartItem, qty);

    let message = [
      product.name,
      selectedVariant && `(${selectedVariant.size.value}${selectedVariant.size.unit})`,
      selectedFlavor && selectedFlavor.name
    ].filter(Boolean).join(' ');

    toast.success(`${message} added to cart!`);
  };

  // Helper function to generate display name with variant and flavor
  const generateDisplayName = (product, variant, flavor) => {
    let name = product.name;
    if (variant) {
      name += ` (${variant.size.value}${variant.size.unit})`;
    }
    if (flavor) {
      name += ` - ${flavor.name}`;
    }
    return name;
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
            {/* Main Image with Carousel */}
            <div className="bg-white rounded-2xl overflow-hidden mb-4 border-2 border-gray-100 shadow-lg p-4">
              <div className="bg-gray-50 rounded-xl overflow-hidden relative group">
                <img
                  src={product.images && product.images.length > 0
                    ? (product.images[selectedImageIndex].startsWith('http') 
                        ? product.images[selectedImageIndex] 
                        : `http://localhost:5000${product.images[selectedImageIndex]}`)
                    : '/images/details.png'
                  }
                  alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                  className="w-full h-auto object-cover"
                />
                
                {/* Carousel Navigation Arrows - Only show if multiple images */}
                {product.images && product.images.length > 1 && (
                  <>
                    {/* Previous Button */}
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === 0 ? product.images.length - 1 : prev - 1
                      )}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {/* Next Button */}
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === product.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>

                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImageIndex + 1} / {product.images.length}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Thumbnail Gallery - Only show if multiple images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`bg-gray-100 rounded-lg aspect-square overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-[#536690] ring-2 ring-[#536690]/30' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={image.startsWith('http') ? image : `http://localhost:5000${image}`}
                      alt={`${product.name} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column - Product Info */}
          <div className="md:w-1/2">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
            {product?.short_description && <p className="text-gray-700 -mt-3  mb-4">{product.short_description}</p>}
            {product.intensity && (
              <div className="mt-4">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-600 mr-3">Intensity:</span>
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${product.intensity <= 3 ? 'bg-green-100 text-green-800' :
                    product.intensity <= 7 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {product.intensity <= 3 ? 'Mild' : product.intensity <= 7 ? 'Medium' : 'Strong'} ({product.intensity}/10)
                  </span>
                </div>
                <div className="w-[50%] bg-gray-200 rounded-full h-2 mt-2">
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


            {product.reviewTags && product.reviewTags.length > 0 && (
              <div className="mt-6">
                {/* <h3 className="text-sm font-medium text-gray-700 mb-3">Experience</h3> */}
                <div className="flex flex-wrap gap-2">
                  {product.reviewTags.map((tag, idx) => {
                    const color = colors[Math.min(idx, colors.length - 1)];
                    const label = tag.label || '';
                    const match = label.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u);
                    const emoji = match ? match[0] + ' ' : '';
                    const text = label.replace(/^[\p{Emoji}\p{Extended_Pictographic}]\s*/u, '');

                    return (
                      <span
                        key={tag._id}
                        className="px-3 py-2 rounded-full text-sm font-medium flex items-center gap-1"
                        style={{ backgroundColor: color.bg, color: color.color }}
                      >
                        <span className="text-sm">{emoji}</span>
                        {text}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Description */}
            <div className="mt-6">
              <h2 className="text-lg text-gray-700 font-semibold mb-2">Description</h2>
              <div className="relative">
                <div 
                  ref={descriptionRef}
                  className={`text-gray-700 mb-4 overflow-hidden transition-all duration-300 ${!showFullDescription && 'max-h-20'}`}
                >
                  {product.description?.main || 'No description available'}
                  {product.description?.details && (
                    <p className="mt-2">{product.description.details}</p>
                  )}
                </div>
                {isDescriptionLong && (
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-[#536690] mb-6 underline text-sm font-medium hover:underline focus:outline-none"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
            </div>

            {/* Size Variant Selection */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Select Size</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((variant, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setSelectedFlavor(null); // Ye line add karo
                        setQuantity(1);
                      }}
                      className={`px-6 py-3 border-2 rounded-lg transition-all ${selectedVariant === variant
                        ? 'border-[#536690] bg-[#536690] text-white'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }`}
                    >
                      <div className="text-center">
                        <span className="text-lg font-bold">
                          {variant.size.value}{variant.size.unit === 'grams' ? 'G' : variant.size.unit === 'pieces' ? ' pcs' : variant.size.unit.toUpperCase()}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Flavor Selection */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm text-gray-700 font-semibold mb-2">Select Flavor</h3>
                <div className="flex flex-wrap gap-2">
                  {product.flavors.map((flavor, index) => {
                    const flavorStock = Number(flavor.stock || 0);
                    const isOutOfStock = flavorStock <= 0;

                    return (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isOutOfStock) {
                            console.log('Selected flavor:', flavor);
                            setSelectedFlavor({
                              ...flavor,
                              price: Number(flavor.price)
                            });
                            setQuantity(1); // Reset quantity when flavor changes
                          }
                        }}
                        disabled={isOutOfStock}
                        className={`px-3 py-2 border-2 rounded-lg transition-all ${isOutOfStock
                          ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                          : selectedFlavor?._id === flavor._id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-300 hover:border-gray-400'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {flavor.name}
                          </span>
                          {isOutOfStock ? (
                            <span className="text-xs text-red-600 font-medium">Out of Stock</span>
                          ) : (
                            <span className="text-sm text-green-600 font-medium">
                              {Number(flavor.price) > 0 ? `+$${Number(flavor.price).toFixed(2)}` : 'Free'}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-6">
              <h2 className="text-lg text-gray-700 font-semibold mb-2">Final Price</h2>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-[#536690]">$ {displayPrice}</p>
                </div>
                {product?.allergenInfo?.tooltipText && (
                  <div className="text-sm text-gray-500 mt-1">
                   Allergen : {product.allergenInfo.tooltipText}
                  </div>
                )}
                {/* <div className="flex flex-col gap-1 mt-2">
                  {selectedVariant && (
                    <div className="text-sm text-gray-600">
                      Size: {selectedVariant.size.value}{selectedVariant.size.unit} (${Number(selectedVariant.price).toFixed(2)})
                    </div>
                  )}
                  {selectedFlavor && (
                    <div className="text-sm text-gray-600">
                      Flavor: {selectedFlavor.name} {selectedFlavor.price > 0 ? `(+$${Number(selectedFlavor.price).toFixed(2)})` : '(Free)'}
                    </div>
                  )}
                </div> */}
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
                  disabled={
                    getAvailableStock() <= 0 ||
                    quantity >= getAvailableStock() ||
                    (product?.flavors && product.flavors.length > 0 && !selectedFlavor)
                  }
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
                disabled={getAvailableStock() <= 0}
                className={`bg-[#536690] hover:bg-[#536690] text-white font-medium py-3 px-8 rounded-full flex items-center justify-center gap-2 flex-1 transition-colors ${getAvailableStock() <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
              >
                <span>{getAvailableStock() > 0 ? 'Add to Cart' : 'Out of Stock'}</span>
                {getAvailableStock() > 0 && <span className="text-xl">+</span>}
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


            {/* Tags Section - Right Side (Customer Feedback - keep as is) */}
            {false && (
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
            )}
          </div>
        </div>

        {/* You May Also Like Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
                  onClick={() => router.push(`/productdetails?id=${relatedProduct._id}`)}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
                    <img
                      src={relatedProduct.images && relatedProduct.images.length > 0
                        ? (relatedProduct.images[0].startsWith('http') ? relatedProduct.images[0] : `http://localhost:5000${relatedProduct.images[0]}`)
                        : '/images/details.png'
                      }
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#536690] transition-colors">
                      {relatedProduct.name}
                    </h3>

                    {/* Price */}
                    {/* <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl font-bold text-[#536690]">
                        ${Number(relatedProduct.price || 0).toFixed(2)}
                      </span>
                      {relatedProduct.hasVariants && relatedProduct.variants && (
                        <span className="text-sm text-gray-500">+ variants</span>
                      )}
                    </div> */}

                    {/* Stock Status */}
                    {relatedProduct.hasStock ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-green-600 font-medium">In Stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-600 font-medium">Out of Stock</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading state for related products */}
        {relatedLoading && (
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-3 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}