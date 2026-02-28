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
          loadActiveDeals();
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
      <div 
        className="p-6 rounded-2xl relative"
        style={{
          background: 'rgba(20, 20, 20, 0.4)',
          border: '0.8px solid #86D1F8'
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-white animate-pulse" />
          <span className="text-white font-bold text-sm uppercase tracking-widest">Ends In</span>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          {timeLeft.days > 0 && (
            <>
              <div 
                className="flex flex-col items-center rounded-xl px-4 py-3 min-w-[70px]"
                style={{
                  background: 'transparent',
                  border: '1.26px solid rgba(134, 209, 248, 0.6)',
                  borderRadius: '14.7px'
                }}
              >
                <span className="text-3xl font-black text-white leading-none">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-xs font-semibold text-white/90 uppercase mt-1">Days</span>
              </div>
              <span className="text-3xl font-bold animate-pulse" style={{ color: '#86D1F8' }}>:</span>
            </>
          )}
          
          <div 
            className="flex flex-col items-center rounded-xl px-4 py-3 min-w-[70px]"
            style={{
              background: 'transparent',
              border: '1.26px solid rgba(134, 209, 248, 0.6)',
              borderRadius: '14.7px'
            }}
          >
            <span className="text-3xl font-black text-white leading-none">
              {String(timeLeft.hours).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-white/90 uppercase mt-1">Hours</span>
          </div>
          
          <span className="text-3xl font-bold animate-pulse" style={{ color: '#86D1F8' }}>:</span>
          
          <div 
            className="flex flex-col items-center rounded-xl px-4 py-3 min-w-[70px]"
            style={{
              background: 'transparent',
              border: '1.26px solid rgba(134, 209, 248, 0.6)',
              borderRadius: '14.7px'
            }}
          >
            <span className="text-3xl font-black text-white leading-none">
              {String(timeLeft.minutes).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-white/90 uppercase mt-1">Mins</span>
          </div>
          
          <span className="text-3xl font-bold animate-pulse" style={{ color: '#86D1F8' }}>:</span>
          
          <div 
            className="flex flex-col items-center rounded-xl px-4 py-3 min-w-[70px]"
            style={{
              background: 'transparent',
              border: '1.26px solid rgba(134, 209, 248, 0.6)',
              borderRadius: '14.7px'
            }}
          >
            <span className="text-3xl font-black text-white leading-none">
              {String(timeLeft.seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-white/90 uppercase mt-1">Secs</span>
          </div>
        </div>
        
        {/* Bottom Center Image */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <img src="/images/endinline.png" alt="" className="h-10 w-auto" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-orange-500 mx-auto mb-6"></div>
            <Flame className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-orange-500 animate-pulse" />
          </div>
          <p className="text-white text-xl font-semibold">Loading Crazy Deals...</p>
          <p className="text-gray-400 text-sm mt-2">Preparing amazing offers for you 🎉</p>
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <Flame className="w-24 h-24 text-gray-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">No Active Deals</h2>
          <p className="text-gray-400 mb-6">Check back soon for amazing offers!</p>
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
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      {/* Global Stars Animation */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="stars-container">
          {[...Array(60)].map((_, i) => (
            <div
              key={`global-star-${i}`}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative text-white py-16 overflow-hidden">
        {/* Cosmic Glow Effect */}
        <div 
          className="absolute right-0 top-1/4 w-1/2 h-1/2 opacity-20 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(47,128,255,0.3) 0%, transparent 70%)'
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          {/* Main Heading */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              DEAL OF THE WEEK
            </h1>
          </div>
          
          {/* Feature Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-sm md:text-base font-semibold mb-10">
            <span className="bg-transparent backdrop-blur-sm border border-[rgba(77,163,255,0.4)] px-4 py-2 rounded-full flex items-center gap-2">
              <img src="/images/creazydots.png" alt="" className="w-4 h-4" />
              Limited Time
            </span>
            <span className="hidden md:inline text-white/60">•</span>
            <span className="bg-transparent backdrop-blur-sm border border-[rgba(77,163,255,0.4)] px-4 py-2 rounded-full flex items-center gap-2">
              <img src="/images/creazydots.png" alt="" className="w-4 h-4" />
              Unbeatable Prices
            </span>
            <span className="hidden md:inline text-white/60">•</span>
            <span className="bg-transparent backdrop-blur-sm border border-[rgba(77,163,255,0.4)] px-4 py-2 rounded-full flex items-center gap-2">
              <img src="/images/creazydots.png" alt="" className="w-4 h-4" />
              Don't Miss Out
            </span>
          </div>

          {/* ✅ UPDATED ORDER: Discount Badge + Timer PEHLE, phir Buttons, phir Title + Description */}
          {selectedDeal && (
            <div className="max-w-6xl mx-auto space-y-6">

              {/* 1️⃣ Discount Badge + Timer - UPAR */}
              <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                {/* Discount Badge */}
                <div className="relative flex-shrink-0">
                  <div 
                    className="relative text-white px-8 py-4 text-center"
                    style={{
                      background: 'transparent',
                      border: '1.26px solid rgba(134, 209, 248, 0.6)',
                      borderRadius: '14.7px'
                    }}
                  >
                    <div className="text-4xl font-black leading-none mb-2 relative z-10">
                      {selectedDeal.discountType === 'percentage' 
                        ? `${selectedDeal.discountPercentage}%` 
                        : `$${selectedDeal.discountAmount}`}
                    </div>
                    <div className="text-xl font-bold uppercase tracking-widest relative z-10">OFF</div>
                  </div>
                </div>

                {/* Countdown Timer */}
                <div className="flex-shrink-0">
                  <CountdownTimer endDate={selectedDeal.endDate} />
                </div>
              </div>

              {/* 2️⃣ Title + Description - BEECH MEIN */}
              <div className="pt-4">
                <h2 className="text-3xl md:text-5xl font-black text-white mb-3 uppercase tracking-wide">
                  🔥 {selectedDeal.title}
                </h2>
                {selectedDeal.description && (
                  <p className="text-white/90 text-base md:text-lg font-medium max-w-3xl mx-auto">
                    {selectedDeal.description}
                  </p>
                )}
              </div>

              {/* 3️⃣ Action Buttons - NEECHE */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={() => router.push('/menu')}
                  className="bg-white text-black px-12 py-3 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-lg"
                >
                  SHOP DEALS
                </button>
                <button
                  onClick={() => router.push('/menu')}
                  className="bg-transparent border-1 border-gray-400 text-white px-14 py-3 rounded-xl font-bold text-lg hover:bg-white/10 transition-all"
                >
                  VIEW ELIGIBLE STRAINS
                </button>
              </div>

            </div>
          )}
        </div>
      </div>

      {/* Deals Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {deals.map((deal) => {
          const isVariantOnSale = (productId, variantId) => {
            if (!deal.dealItems || deal.dealItems.length === 0) {
              return deal.products.some(p => p._id === productId);
            }
            return deal.dealItems.some(
              item => item.product._id === productId && item.variantId && item.variantId.toString() === variantId.toString()
            );
          };

          const isFlavorOnSale = (productId, flavorId) => {
            if (!deal.dealItems || deal.dealItems.length === 0) {
              return deal.products.some(p => p._id === productId);
            }
            return deal.dealItems.some(
              item => item.product._id === productId && item.flavorId && item.flavorId.toString() === flavorId.toString()
            );
          };

          const productsToShow = deal.dealItems && deal.dealItems.length > 0
            ? [...new Set(deal.dealItems.map(item => item.product._id))].map(productId => 
                deal.dealItems.find(item => item.product._id === productId).product
              )
            : deal.products;

          return (
            <div key={deal._id} className="mb-16">
              <div className="space-y-6">
                {productsToShow.map((product) => {
                const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
                
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
                      className="relative rounded-3xl overflow-hidden cursor-pointer w-full max-w-4xl mx-auto"
                      style={{
                        background: 'rgba(20, 20, 20, 0.4)',
                        border: '1.2px solid rgba(134, 209, 248, 0.2)'
                      }}
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      {/* Discount Badge */}
                      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#80A6F7] to-[#80A6F7] text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {getDiscountDisplay()} OFF
                      </div>

                      <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="w-full lg:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>

                          {product.intensity && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300 uppercase tracking-wide">Intensity</span>
                                <span className="text-sm font-bold text-cyan-400">
                                  {product.intensity}/10
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

                          {product.reviewTags && product.reviewTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.reviewTags.slice(0, 4).map((tag, idx) => {
                                return (
                                  <span
                                    key={tag._id}
                                    className="px-3 py-1.5 text-sm rounded-full font-medium bg-white/5 backdrop-blur-sm border border-blue-400/40 hover:border-2 hover:border-blue-400 transition-all text-white flex items-center gap-2"
                                  >
                                    <img src="/images/dots.png" alt="" className="w-4 h-4" />
                                    {tag.label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()}
                                  </span>
                                );
                              })}
                            </div>
                          )}

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
                                  className="relative px-4 py-3 min-w-[110px]"
                                  style={{
                                    background: 'transparent',
                                    border: '1.26px solid rgba(134, 209, 248, 0.6)',
                                    borderRadius: '14.7px'
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="absolute -top-2 -right-2">
                                    {isInCart ? (
                                      <div className="flex items-center border border-gray-200 rounded-full bg-white">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateCartItemQuantity(product._id, cartItem.quantity - 1, variant);
                                          }}
                                          className="p-1 hover:bg-gray-100 rounded-l-full text-black"
                                        >
                                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M5 12h14" />
                                          </svg>
                                        </button>
                                        <span className="px-2 text-xs font-bold text-black">{cartItem.quantity}</span>
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
                                          className="p-1 hover:bg-gray-100 rounded-r-full disabled:opacity-50 text-black"
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
                                          isOutOfStock ? 'bg-gray-600/50 cursor-not-allowed' : 'bg-white hover:bg-gray-100'
                                        }`}
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                                          <path d="M12 5v14M5 12h14" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>

                                  <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">
                                      {variant.size.value}{variant.size.unit === 'grams' ? 'G' : variant.size.unit}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <span className="text-base font-bold text-green-400">
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

                const hasFlavors = product.flavors && product.flavors.length > 0 && product.flavors.some(f => f.isActive);
                
                if (hasFlavors) {
                  return (
                    <div
                      key={product._id}
                      className="relative rounded-3xl overflow-hidden cursor-pointer w-full max-w-4xl mx-auto"
                      style={{
                        background: 'rgba(20, 20, 20, 0.4)',
                        border: '1.2px solid rgba(134, 209, 248, 0.2)'
                      }}
                      onClick={() => router.push(`/productdetails?id=${product._id}`)}
                    >
                      {/* Discount Badge */}
                      <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#80A6F7] to-[#80A6F7] text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                        <Tag className="w-4 h-4" />
                        {getDiscountDisplay()} OFF
                      </div>

                      <div className="flex flex-col lg:flex-row">
                        <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <div className="w-full lg:w-3/5 p-6">
                          <h3 className="text-2xl font-bold text-white mb-2">{product.name}</h3>

                          {product.intensity && (
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-300 uppercase tracking-wide">Intensity</span>
                                <span className="text-sm font-bold text-cyan-400">
                                  {product.intensity}/10
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

                          {product.reviewTags && product.reviewTags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                              {product.reviewTags.slice(0, 4).map((tag, idx) => {
                                return (
                                  <span
                                    key={tag._id}
                                    className="px-3 py-1.5 text-sm rounded-full font-medium bg-white/5 backdrop-blur-sm border border-blue-400/40 hover:border-2 hover:border-blue-400 transition-all text-white flex items-center gap-2"
                                  >
                                    <img src="/images/dots.png" alt="" className="w-4 h-4" />
                                    {tag.label.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '').trim()}
                                  </span>
                                );
                              })}
                            </div>
                          )}

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
                                    className="relative px-4 py-3 min-w-[110px]"
                                    style={{
                                      background: 'transparent',
                                      border: '1.26px solid rgba(134, 209, 248, 0.6)',
                                      borderRadius: '14.7px'
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="absolute -top-2 -right-2">
                                      {isInCart ? (
                                        <div className="flex items-center border border-gray-200 rounded-full bg-white">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              updateCartItemQuantity(product._id, cartItem.quantity - 1, null, flavor);
                                            }}
                                            className="p-1 hover:bg-gray-100 rounded-l-full text-black"
                                          >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                              <path d="M5 12h14" />
                                            </svg>
                                          </button>
                                          <span className="px-2 text-xs font-bold text-black">{cartItem.quantity}</span>
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
                                            className="p-1 hover:bg-gray-100 rounded-r-full disabled:opacity-50 text-black"
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
                                            isOutOfStock ? 'bg-gray-600/50 cursor-not-allowed' : 'bg-white hover:bg-gray-100'
                                          }`}
                                        >
                                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3">
                                            <path d="M12 5v14M5 12h14" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>

                                    <div className="flex flex-col">
                                      <span className="text-sm font-bold text-gray-100">
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

                return null;
              })}
            </div>
          </div>
        );
      })}
      </div>
      
      {/* CSS for Stars Animation */}
      <style jsx>{`
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle linear infinite;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .star:nth-child(3n) {
          width: 3px;
          height: 3px;
          box-shadow: 0 0 6px rgba(124, 198, 255, 0.7);
        }
        
        .star:nth-child(5n) {
          width: 4px;
          height: 4px;
          box-shadow: 0 0 8px rgba(47, 128, 255, 0.8);
        }
        
        .glow-border {
          animation: borderGlow 2s ease-in-out infinite;
        }
        
        @keyframes borderGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(77, 163, 255, 0.4),
                        0 0 40px rgba(77, 163, 255, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(77, 163, 255, 0.8),
                        0 0 60px rgba(77, 163, 255, 0.4),
                        0 0 80px rgba(77, 163, 255, 0.2);
          }
        }
      `}</style>
    </div>
  );
}