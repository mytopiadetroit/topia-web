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
  const [selectedStrain, setSelectedStrain] = useState(null);
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

  // Reset selections when product loads (don't auto-select)
  useEffect(() => {
    if (product) {
      // Reset all selections to null so user must choose
      setSelectedVariant(null);
      setSelectedFlavor(null);
      setSelectedStrain(null);
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

    // Priority 1: If strain is selected, use strain price
    if (selectedStrain && selectedStrain.price) {
      price = Number(selectedStrain.price) || 0;
      console.log('Using strain price:', price);
    }
    // Priority 2: If flavor is selected, use flavor price
    else if (selectedFlavor && selectedFlavor.price) {
      price = Number(selectedFlavor.price) || 0;
      console.log('Using flavor price:', price);
    }
    // Priority 3: If variant is selected, use variant price
    else if (product?.hasVariants && selectedVariant) {
      price = Number(selectedVariant.price || 0);
      console.log('Using variant price:', price);
    }
    // Priority 4: Use base product price
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
  const [openTooltipId, setOpenTooltipId] = useState(null);
  const [isDescriptionTabOpen, setIsDescriptionTabOpen] = useState(true);
  const descriptionRef = useRef(null);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openTooltipId) {
        setOpenTooltipId(null);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openTooltipId]);

  // Update price whenever relevant state changes
  useEffect(() => {
    if (product) {
      const newPrice = getFinalPrice();
      console.log('Updating display price to:', newPrice);
      setDisplayPrice(newPrice);
    }
  }, [selectedVariant, selectedFlavor, selectedStrain, product, quantity]);

  // Check if description is long enough to need "Read More"
  useEffect(() => {
    if (descriptionRef.current) {
      const isLong = descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight;
      setIsDescriptionLong(isLong);
    }
  }, [product?.description]);

  // Get available stock based on selection
  const getAvailableStock = () => {

    if (selectedStrain) {
      return Number(selectedStrain.stock || 0);
    }

    if (selectedFlavor) {
      return Number(selectedFlavor.stock || 0);
    }

    if (product?.hasVariants && selectedVariant) {
      return Number(selectedVariant.stock || 0);
    }

    if (product?.strains && product.strains.length > 0) {
      const totalStrainStock = product.strains.reduce((sum, strain) => {
        return sum + Number(strain.stock || 0);
      }, 0);
      return totalStrainStock;
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

    // Priority 6: Use base product stock
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

    // Check if required selections are made
    if (product?.flavors && product.flavors.length > 0 && !selectedFlavor) {
      toast.error('Please select a flavor');
      return;
    }

    if (product?.strains && product.strains.length > 0 && !selectedStrain) {
      toast.error('Please select a strain');
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
      selectedStrain: selectedStrain,
      displayName: [
        product.name,
        selectedVariant && `(${selectedVariant.size.value}${selectedVariant.size.unit})`,
        selectedFlavor && selectedFlavor.name,
        selectedStrain && `🧬 ${selectedStrain.name}`
      ].filter(Boolean).join(' ')
    };

    addToCart(cartItem, qty);

    let message = [
      product.name,
      selectedVariant && `(${selectedVariant.size.value}${selectedVariant.size.unit})`,
      selectedFlavor && selectedFlavor.name,
      selectedStrain && `🧬 ${selectedStrain.name}`
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#536690] mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading product...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">{error}</p>
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <p className="text-gray-300 text-lg mb-4">Product not found</p>
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
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
   

   

      <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-300 mb-8">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">›</span>
          <Link href="/menu" className="hover:text-white">Menu</Link>
          <span className="mx-2">›</span>
          <span className="text-white">{product.name}</span>
        </nav>

        {/* Product Section */}
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column - Images */}
          <div className="md:w-1/2">
            {/* Main Image with Carousel */}
            <div className="bg-transparent rounded-2xl overflow-hidden mb-4 border-2 border-gray-800/40 shadow-lg p-4">
              <div className="bg-transparent rounded-xl overflow-hidden relative group">
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
                    className={`bg-transparent rounded-lg aspect-square overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-cyan-400 ring-2 ring-cyan-400/30' 
                        : 'border-gray-700/50 hover:border-gray-600'
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
            <h1 className="text-4xl font-bold text-white mb-4">{product.name}</h1>
            {/* {product?.short_description && <p className="text-gray-300 -mt-3  mb-4">{product.short_description}</p>} */}
            
            {/* Total Weight, Pieces, Per Piece - Same design as menu.jsx */}
            {(product.showTotalWeight || product.showTotalPieces || product.showPerPiece) && (
              <div className="flex flex-nowrap gap-2 mb-4">
                {product.showTotalWeight && product.totalWeight && (
                  <div className="flex-1 min-w-[90px] border border-white/20 rounded-lg px-4 py-1.5 text-center">
                    <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Total Weight</div>
                    <div className="text-sm font-bold text-white">{product.totalWeight}</div>
                  </div>
                )}
                {product.showTotalPieces && product.totalPieces && (
                  <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-1.5 text-center">
                    <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Pieces</div>
                    <div className="text-sm font-bold text-white">{product.totalPieces}</div>
                  </div>
                )}
                {product.showPerPiece && product.perPiece && (
                  <div className="flex-1 min-w-[120px] border border-white/20 rounded-lg px-4 py-1.5 text-center">
                    <div className="text-[10px] text-gray-300 uppercase tracking-wide mb-0.5">Per Piece</div>
                    <div className="text-sm font-bold text-white">{product.perPiece}</div>
                  </div>
                )}
              </div>
            )}
            
            {product.intensity && (
              <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300 uppercase tracking-wide">Intensity</span>
                  <span className="text-sm font-bold text-white">
                    {product.intensity}/10
                  </span>
                </div>
                <div className="w-[50%] bg-gray-700/30 rounded-full h-2">
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


            {product.reviewTags && product.reviewTags.length > 0 && (
              <div className="mt-6">
                {/* <h3 className="text-sm font-medium text-gray-700 mb-3">Experience</h3> */}
                <div className="flex flex-wrap gap-2">
                  {product.reviewTags.map((tag, idx) => {
                    const label = tag.label || '';
                    const match = label.match(/^[\p{Emoji}\p{Extended_Pictographic}]/u);
                    const emoji = match ? match[0] + ' ' : '';
                    const text = label.replace(/^[\p{Emoji}\p{Extended_Pictographic}]\s*/u, '');
                    const labelWithoutEmoji = label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim();
                    const tooltipId = `${product._id}-${tag._id}`;
                    const isTooltipOpen = openTooltipId === tooltipId;

                    return (
                      <div key={tag._id} className="relative group">
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenTooltipId(isTooltipOpen ? null : tooltipId);
                          }}
                          className="px-3 py-1.5 text-sm rounded-full font-medium bg-white/5 backdrop-blur-sm border border-blue-400/40 hover:border-2 hover:border-blue-400 transition-all text-white flex items-center gap-1 cursor-pointer"
                        >
                          <img src="/images/dots.png" alt="" className="w-4 h-4" />
                          {text}
                        </span>
                        {/* Tooltip */}
                        {tag.tooltip && (
                          <div className={`absolute ${idx === 0 ? '-right-40' : '-right-40'} top-full mt-2 transition-opacity duration-200 z-[9999] ${isTooltipOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-none'}`}>
                            <div 
                              className="relative rounded-xl shadow-2xl pt-9 px-5 pb-5" 
                              style={{ 
                                minWidth: '240px',
                                maxWidth: '280px',
                                minHeight: '120px',
                                backgroundImage: 'url(/rightone.png)',
                                backgroundSize: '100% 100%',
                                backgroundRepeat: 'no-repeat'
                              }}
                            >
                              <h4 className="text-white font-bold text-base mb-2">{labelWithoutEmoji}</h4>
                              <p className="text-white/90 text-sm leading-relaxed">{tag.tooltip}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Size Variant Selection */}
            {product.hasVariants && product.variants && product.variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Select Size</h3>
                <select
                  value={selectedVariant?._id || ''}
                  onChange={(e) => {
                    const variant = product.variants.find(v => v._id === e.target.value);
                    if (variant) {
                      setSelectedVariant(variant);
                      setSelectedFlavor(null); // Reset flavor when variant changes
                      setSelectedStrain(null); // Reset strain when variant changes
                      setQuantity(1);
                    }
                  }}
                  className="w-full max-w-md bg-transparent border border-white/30 rounded-md px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="" disabled style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: '#888' }}>
                    Select Size
                  </option>
                  {product.variants.map((variant) => {
                    const stock = Number(variant.stock || 0);
                    const label = `${variant.size.value}${variant.size.unit === 'grams' ? 'G' : variant.size.unit === 'pieces' ? ' pcs' : variant.size.unit.toUpperCase()}${stock <= 0 ? ' (Out of Stock)' : ''}`;
                    return (
                      <option 
                        key={variant._id} 
                        value={variant._id} 
                        disabled={stock <= 0} 
                        style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: 'white' }}
                      >
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}
            {/* Flavor Selection */}
            {product.flavors && product.flavors.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm text-white font-semibold mb-2">Select Flavor</h3>
                <select
                  value={selectedFlavor?._id || ''}
                  onChange={(e) => {
                    const flavor = product.flavors.find(f => f._id === e.target.value);
                    if (flavor) {
                      setSelectedFlavor({
                        ...flavor,
                        price: Number(flavor.price)
                      });
                      setSelectedStrain(null); // Reset strain when flavor changes
                      setQuantity(1); // Reset quantity when flavor changes
                    }
                  }}
                  className="w-full max-w-md bg-transparent border border-white/30 rounded-md px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="" disabled style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: '#888' }}>
                    Select Flavor
                  </option>
                  {product.flavors.map((flavor) => {
                    const stock = Number(flavor.stock || 0);
                    const label = `${flavor.name}${stock <= 0 ? ' (Out of Stock)' : ''}`;
                    return (
                      <option 
                        key={flavor._id} 
                        value={flavor._id} 
                        disabled={stock <= 0} 
                        style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: 'white' }}
                      >
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Strain Selection */}
            {product.strains && product.strains.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm text-white font-semibold mb-2">Select Strain</h3>
                <select
                  value={selectedStrain?._id || ''}
                  onChange={(e) => {
                    const strain = product.strains.find(s => s._id === e.target.value);
                    if (strain) {
                      setSelectedStrain({
                        ...strain,
                        price: Number(strain.price)
                      });
                      setSelectedFlavor(null); // Reset flavor when strain changes
                      setQuantity(1); // Reset quantity when strain changes
                    }
                  }}
                  className="w-full max-w-md bg-transparent border border-white/30 rounded-md px-3 py-3 text-white text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="" disabled style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: '#888' }}>
                    Select Strain
                  </option>
                  {product.strains.filter(strain => strain.isActive !== false).map((strain) => {
                    const stock = Number(strain.stock || 0);
                    const label = `🧬 ${strain.name}${stock <= 0 ? ' (Out of Stock)' : ''}`;
                    return (
                      <option 
                        key={strain._id} 
                        value={strain._id} 
                        disabled={stock <= 0} 
                        style={{ backgroundColor: 'rgba(20, 30, 50, 0.95)', color: 'white' }}
                      >
                        {label}
                      </option>
                    );
                  })}
                </select>
              </div>
            )}

            {/* Price - Only show when user has made required selections */}
            {(() => {
              // Check if user needs to make selections and has made them
              const needsVariant = product.hasVariants && product.variants && product.variants.length > 0;
              const needsFlavor = product.flavors && product.flavors.length > 0;
              const needsStrain = product.strains && product.strains.length > 0;
              
              const hasRequiredSelections = 
                (!needsVariant || selectedVariant) &&
                (!needsFlavor || selectedFlavor) &&
                (!needsStrain || selectedStrain);
              
              // For products without variants/flavors/strains, always show price
              const shouldShowPrice = hasRequiredSelections || (!needsVariant && !needsFlavor && !needsStrain);
              
              if (!shouldShowPrice) return null;
              
              return (
                <div className="mb-6">
                  <h2 className="text-lg text-gray-100 font-semibold mt-2">Final Price</h2>
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-gray-200">$ {displayPrice}</p>
                </div>
                {product?.allergenInfo?.tooltipText && (
                  <div className="text-sm text-gray-300 mt-1">
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
              );
            })()}

            {/* Quantity Selector (respect stock limits) */}
            <div className="mb-6">
              <h3 className="text-lg text-gray-200 font-semibold mb-3">Quantity</h3>
              <div className="flex items-center border border-white/30 rounded-md overflow-hidden w-fit">
                <button
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="px-4 py-2 text-white font-medium min-w-[40px] text-center">{quantity}</span>
                <button
                  onClick={increaseQuantity}
                  disabled={
                    getAvailableStock() <= 0 ||
                    quantity >= getAvailableStock() ||
                    (product?.flavors && product.flavors.length > 0 && !selectedFlavor) ||
                    (product?.strains && product.strains.length > 0 && !selectedStrain)
                  }
                  className="px-3 py-2 text-white hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
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
                disabled={
                  getAvailableStock() <= 0 ||
                  (product?.flavors && product.flavors.length > 0 && !selectedFlavor) ||
                  (product?.strains && product.strains.length > 0 && !selectedStrain) ||
                  (product?.hasVariants && product.variants && product.variants.length > 0 && !selectedVariant)
                }
                className="px-6 py-3 rounded-md font-medium text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-[70%]"
                style={{ 
                  background: (getAvailableStock() <= 0 ||
                    (product?.flavors && product.flavors.length > 0 && !selectedFlavor) ||
                    (product?.strains && product.strains.length > 0 && !selectedStrain) ||
                    (product?.hasVariants && product.variants && product.variants.length > 0 && !selectedVariant))
                    ? 'rgba(100, 100, 100, 0.5)'
                    : 'linear-gradient(90deg, rgba(70, 113, 209, 0.4) 0%, rgba(62, 102, 190, 0.4) 50%, rgba(34, 55, 102, 0.4) 100%)',
                  border: '1px solid #88AAE4',
                }}
              >
                {getAvailableStock() <= 0 
                  ? 'Out of Stock' 
                  : (product?.hasVariants && product.variants && product.variants.length > 0 && !selectedVariant)
                    ? 'Select Size'
                    : (product?.flavors && product.flavors.length > 0 && !selectedFlavor)
                      ? 'Select Flavor'
                      : (product?.strains && product.strains.length > 0 && !selectedStrain)
                        ? 'Select Strain'
                        : 'Add to Cart'
                }
              </button>

              <button onClick={handleToggleWishlist} className="px-4 py-3 text-white hover:text-red-500 transition-colors">
                <Heart className="w-6 h-6" fill={isWishlisted ? 'currentColor' : 'none'} />
              </button>
            </div>

            {/* Description - Moved from above */}
            <div className="mt-6">
              <h2 className="text-lg text-white font-semibold mb-2">Description</h2>
              <div className="relative">
                <div 
                  ref={descriptionRef}
                  className={`text-gray-300 mb-4 overflow-hidden transition-all duration-300 ${!showFullDescription && 'max-h-20'}`}
                >
                  {product.description?.main || 'No description available'}
                  {product.description?.details && (
                    <p className="mt-2">{product.description.details}</p>
                  )}
                </div>
                {isDescriptionLong && (
                  <button 
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-gray-200 mb-6 underline text-sm font-medium hover:underline focus:outline-none"
                  >
                    {showFullDescription ? 'Show Less' : 'Read More'}
                  </button>
                )}
              </div>
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
            <h2 className="text-3xl font-bold text-gray-100 mb-8">You May Also Like</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div
                  key={relatedProduct._id}
                  className="bg-white/5 backdrop-blur-[1px] border border-gray-800/40 rounded-lg hover:border-gray-700/60 transition-all duration-300 cursor-pointer group"
                  onClick={() => router.push(`/productdetails?id=${relatedProduct._id}`)}
                >
                  {/* Product Image */}
                  <div className="aspect-square bg-gray-800/50 rounded-t-lg overflow-hidden">
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
                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
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
                        <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        <span className="text-sm text-cyan-400 font-medium">In Stock</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-red-400 font-medium">Out of Stock</span>
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
            <h2 className="text-3xl font-bold text-gray-100 mb-8">You May Also Like</h2>
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