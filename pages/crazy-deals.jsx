import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Clock, Flame, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchActiveDeals } from '../service/service';
import { useApp } from '../context/AppContext';
import { useUser } from '../context/UserContext';

export default function CrazyDeals() {
  const router = useRouter();
  const { addToCart, cart, updateCartItemQuantity } = useApp();
  const { isLoggedIn } = useUser();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState(null);

  useEffect(() => {
    loadActiveDeals();
  }, []);

  const loadActiveDeals = async () => {
    try {
      const result = await fetchActiveDeals();
      
      if (result.success && result.data) {
        setDeals(result.data);
        if (result.data.length > 0) {
          setSelectedDeal(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const CountdownTimer = ({ endDate }) => {
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(endDate));

    useEffect(() => {
      const timer = setInterval(() => {
        const newTimeLeft = calculateTimeLeft(endDate);
        setTimeLeft(newTimeLeft);
        
        if (newTimeLeft.total <= 0) {
          clearInterval(timer);
          loadActiveDeals(); // Refresh deals when timer expires
        }
      }, 1000);

      return () => clearInterval(timer);
    }, [endDate]);

    function calculateTimeLeft(endDate) {
      const difference = new Date(endDate) - new Date();
      
      if (difference <= 0) {
        return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        total: difference,
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    if (timeLeft.total <= 0) {
      return (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl shadow-2xl">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <span className="text-xl font-black uppercase tracking-wider">Deal Expired</span>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black p-6 rounded-2xl shadow-2xl border-2 border-orange-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-[#80A6F7] animate-pulse" />
          <span className="text-[#80A6F7] font-bold text-sm uppercase tracking-widest">Ends In</span>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          {timeLeft.days > 0 && (
            <>
              <div className="flex flex-col items-center bg-gradient-to-b from-[#80A6F7] to-[#80A6F7] rounded-xl px-4 py-3 min-w-[70px] shadow-lg">
                <span className="text-3xl font-black text-white leading-none">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-xs font-semibold text-white/90 uppercase mt-1">Days</span>
              </div>
              <span className="text-3xl font-bold text-orange-500 animate-pulse">:</span>
            </>
          )}
          
          <div className="flex flex-col items-center bg-gradient-to-b from-[#80A6F7] to-[#80A6F7] rounded-xl px-4 py-3 min-w-[70px] shadow-lg">
            <span className="text-3xl font-black text-white leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-white/90 uppercase mt-1">Hours</span>
          </div>
          
          <span className="text-3xl font-bold text-orange-500 animate-pulse">:</span>
          
          <div className="flex flex-col items-center bg-gradient-to-b from-[#80A6F7] to-[#80A6F7] rounded-xl px-4 py-3 min-w-[70px] shadow-lg">
            <span className="text-3xl font-black text-white leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-white/90 uppercase mt-1">Mins</span>
          </div>
          
          <span className="text-3xl font-bold text-orange-500 animate-pulse">:</span>
          
          <div className="flex flex-col items-center bg-gradient-to-b from-[#80A6F7] to-[#80A6F7] rounded-xl px-4 py-3 min-w-[70px] shadow-lg">
            <span className="text-3xl font-black text-white leading-none">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-white/90 uppercase mt-1">Secs</span>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-500 mx-auto mb-6"></div>
            <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          <p className="text-gray-700 text-xl font-semibold">Loading Crazy Deals...</p>
          <p className="text-gray-500 text-sm mt-2">Preparing amazing offers for you 🎉</p>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Flame className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">No Active Deals</h2>
          <p className="text-gray-600 mb-6">Check back soon for amazing offers!</p>
          <button
            onClick={() => router.push('/menu')}
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-semibold transition-all"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#80A6F7] via-[#80A6F7] to-[#80A6F7] text-white py-24 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          {/* Main Heading */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Flame className="w-14 h-14 md:w-16 md:h-16 animate-bounce text-yellow-300" />
            <h1 className="text-5xl md:text-7xl font-black tracking-tight">
              CRAZY DEALS
            </h1>
            <Flame className="w-14 h-14 md:w-16 md:h-16 animate-bounce text-yellow-300" />
          </div>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-sm md:text-base font-semibold mb-10">
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">⚡ Limited Time</span>
            <span className="hidden md:inline text-white/60">•</span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">💰 Unbeatable Prices</span>
            <span className="hidden md:inline text-white/60">•</span>
            <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">🎯 Don't Miss Out</span>
          </div>

          {/* Deal Info & Timer */}
          {selectedDeal && (
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Deal Name */}
              <div>
                <h2 className="text-3xl md:text-5xl font-black text-white mb-3 uppercase tracking-wide">
                  🔥 {selectedDeal.title}
                </h2>
                {selectedDeal.description && (
                  <p className="text-white/90 text-base md:text-lg font-medium max-w-3xl mx-auto">
                    {selectedDeal.description}
                  </p>
                )}
              </div>

              {/* Discount & Timer Row */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-4">
                {/* Discount Badge */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white px-8 py-4 rounded-3xl text-center shadow-2xl transform hover:scale-105 transition-transform">
                    <div className="text-4xl font-black leading-none mb-2">
                      {selectedDeal.discountType === 'percentage' 
                        ? `${selectedDeal.discountPercentage}%` 
                        : `$${selectedDeal.discountAmount}`}
                    </div>
                    <div className="text-xl font-bold uppercase tracking-widest">OFF</div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex-shrink-0">
                  <CountdownTimer endDate={selectedDeal.endDate} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deals Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {deals.map((deal) => {
          // Helper function to check if a variant is on sale
          const isVariantOnSale = (productId, variantId) => {
            if (!deal.dealItems || deal.dealItems.length === 0) {
              // Old format: all products are on sale
              return deal.products.some(p => p._id === productId);
            }
            // New format: check specific variants
            return deal.dealItems.some(
              item => item.product._id === productId && item.variantId && item.variantId.toString() === variantId.toString()
            );
          };

          // Helper function to check if a flavor is on sale
          const isFlavorOnSale = (productId, flavorId) => {
            if (!deal.dealItems || deal.dealItems.length === 0) {
              // Old format: all products are on sale
              return deal.products.some(p => p._id === productId);
            }
            // New format: check specific flavors
            return deal.dealItems.some(
              item => item.product._id === productId && item.flavorId && item.flavorId.toString() === flavorId.toString()
            );
          };

          // Get unique products from dealItems
          const productsToShow = deal.dealItems && deal.dealItems.length > 0
            ? [...new Set(deal.dealItems.map(item => item.product._id))].map(productId => 
                deal.dealItems.find(item => item.product._id === productId).product
              )
            : deal.products;

          return (
            <div key={deal._id} className="mb-16">
              {/* Products List - Single Column like Menu */}
              <div className="space-y-6">
                {productsToShow.map((product) => {
                const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
                
                // Calculate discount based on deal type
                const calculateDiscountedPrice = (originalPrice) => {
                  if (deal.discountType === 'percentage') {
                    return originalPrice - (originalPrice * deal.discountPercentage / 100);
                  } else {
                    return Math.max(0, originalPrice - deal.discountAmount);
                  }
                };
                
                const getDiscountDisplay = () => {
                  if (deal.discountType === 'percentage') {
                    return `${deal.discountPercentage}%`;
                  } else {
                    return `$${deal.discountAmount}`;
                  }
                };
                
                if (hasVariants) {
                  return (
                    <div
                      key={product._id}
                      className="relative rounded-3xl border-2 border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden cursor-pointer w-full max-w-4xl mx-auto"
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      {/* Discount Badge */}
                      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#80A6F7] to-[#80A6F7] text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {getDiscountDisplay()} OFF
                      </div>

                      {/* Horizontal Layout */}
                      <div className="flex flex-col lg:flex-row">
                        {/* Image */}
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="w-full lg:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>

                          {/* Intensity Bar */}
                          {product.intensity && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Intensity</span>
                                <span className={`text-sm font-bold ${
                                  product.intensity <= 3 ? 'text-green-600' :
                                  product.intensity <= 7 ? 'text-yellow-600' : 'text-red-500'
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
                                      product.intensity <= 7 ? '#F59E0B' : '#EF4444'
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Review Tags */}
                          {product.reviewTags && product.reviewTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.reviewTags.slice(0, 4).map((tag, idx) => {
                                const colors = [
                                  { bg: '#FEF3C7', color: '#92400E' },
                                  { bg: '#DBEAFE', color: '#1E40AF' },
                                  { bg: '#FCE7F3', color: '#9F1239' },
                                  { bg: '#D1FAE5', color: '#065F46' },
                                ];
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
                          )}

                          {/* Variants */}
                          <div className="mt-4">
                            <div className="flex flex-wrap items-center gap-3">
                            {product.variants.filter(variant => isVariantOnSale(product._id, variant._id)).map((variant) => {
                              const cartItem = cart.find((i) => (i.id || i._id) === product._id && i.selectedVariant?._id === variant._id);
                              const isInCart = cartItem && cartItem.quantity > 0;
                              const variantStock = Number(variant.stock || 0);
                              const isOutOfStock = variantStock <= 0;
                              const originalPrice = variant.price;
                              const discountedPrice = calculateDiscountedPrice(originalPrice);

                              return (
                                <div
                                  key={variant._id}
                                  className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[110px]"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Add to Cart Button */}
                                  <div className="absolute -top-2 -right-2">
                                    {isInCart ? (
                                      <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateCartItemQuantity(product._id, cartItem.quantity - 1, variant);
                                          }}
                                          className="p-1 hover:bg-gray-50 rounded-l-full"
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
                                          className="p-1 hover:bg-gray-50 rounded-r-full disabled:opacity-50"
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
                                            addToCart({ 
                                              ...product, 
                                              selectedVariant: variant,
                                              deal: {
                                                discountType: deal.discountType,
                                                discountPercentage: deal.discountPercentage,
                                                discountAmount: deal.discountAmount
                                              },
                                              isDealProduct: true
                                            }, 1);
                                            const discountText = deal.discountType === 'percentage' 
                                              ? `${deal.discountPercentage}% discount` 
                                              : `$${deal.discountAmount} off`;
                                            toast.success(`${product.name} added with ${discountText}!`);
                                          }
                                        }}
                                        disabled={isOutOfStock}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                          isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
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
                                    <div className="flex items-center gap-2">
                                      <span className="text-base font-bold text-green-600">
                                        ${discountedPrice.toFixed(2)}
                                      </span>
                                      <span className="text-xs text-gray-400 line-through">
                                        ${originalPrice.toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Handle flavors or simple products
                const hasFlavors = product.flavors && product.flavors.length > 0 && product.flavors.some(f => f.isActive);
                
                if (hasFlavors) {
                  return (
                    <div
                      key={product._id}
                      className="relative rounded-3xl border-2 border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden cursor-pointer w-full max-w-4xl mx-auto"
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      {/* Discount Badge */}
                      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#80A6F7] to-[#80A6F7]  text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {getDiscountDisplay()} OFF
                      </div>

                      {/* Horizontal Layout */}
                      <div className="flex flex-col lg:flex-row">
                        {/* Image */}
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        {/* Details */}
                        <div className="w-full lg:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>

                          {/* Intensity Bar */}
                          {product.intensity && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-gray-600">Intensity</span>
                                <span className={`text-sm font-bold ${
                                  product.intensity <= 3 ? 'text-green-600' :
                                  product.intensity <= 7 ? 'text-yellow-600' : 'text-red-500'
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
                                      product.intensity <= 7 ? '#F59E0B' : '#EF4444'
                                  }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {/* Review Tags */}
                          {product.reviewTags && product.reviewTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.reviewTags.slice(0, 4).map((tag, idx) => {
                                const colors = [
                                  { bg: '#FEF3C7', color: '#92400E' },
                                  { bg: '#DBEAFE', color: '#1E40AF' },
                                  { bg: '#FCE7F3', color: '#9F1239' },
                                  { bg: '#D1FAE5', color: '#065F46' },
                                ];
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
                          )}

                          {/* Flavors - Same style as variants */}
                          <div className="mt-4">
                            <div className="flex flex-wrap items-center gap-3">
                              {product.flavors.filter(f => f.isActive && isFlavorOnSale(product._id, f._id)).map((flavor) => {
                                const cartItem = cart.find((i) => (i.id || i._id) === product._id && i.selectedFlavor?._id === flavor._id);
                                const isInCart = cartItem && cartItem.quantity > 0;
                                const flavorStock = Number(flavor.stock || 0);
                                const isOutOfStock = flavorStock <= 0;
                                const originalPrice = flavor.price;
                                const discountedPrice = calculateDiscountedPrice(originalPrice);

                                return (
                                  <div
                                    key={flavor._id}
                                    className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[110px]"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {/* Add to Cart Button */}
                                    <div className="absolute -top-2 -right-2">
                                      {isInCart ? (
                                        <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateCartItemQuantity(product._id, cartItem.quantity - 1, null, flavor);
                                            }}
                                            className="p-1 hover:bg-gray-50 rounded-l-full"
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
                                            className="p-1 hover:bg-gray-50 rounded-r-full disabled:opacity-50"
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
                                              addToCart({ 
                                                ...product, 
                                                selectedFlavor: flavor,
                                                deal: {
                                                  discountType: deal.discountType,
                                                  discountPercentage: deal.discountPercentage,
                                                  discountAmount: deal.discountAmount
                                                },
                                                isDealProduct: true
                                              }, 1);
                                              const discountText = deal.discountType === 'percentage' 
                                                ? `${deal.discountPercentage}% discount` 
                                                : `$${deal.discountAmount} off`;
                                              toast.success(`${product.name} - ${flavor.name} added with ${discountText}!`);
                                            }
                                          }}
                                          disabled={isOutOfStock}
                                          className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
                                            isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
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
                                      <div className="flex items-center gap-2">
                                        <span className="text-base font-bold text-green-600">
                                          ${discountedPrice.toFixed(2)}
                                        </span>
                                        <span className="text-xs text-gray-400 line-through">
                                          ${originalPrice.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                // Simple product (no variants, no flavors) - shouldn't show in deals normally
                return null;
              })}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
}
