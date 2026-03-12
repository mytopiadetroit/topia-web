import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { Api } from '../service/service';

export default function MyHistory() {
  const router = useRouter();
  const { isLoggedIn, loading } = useUser();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedByOrder, setExpandedByOrder] = useState({});
  const [reviewOptions, setReviewOptions] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, productId: null, orderId: null });
  const [reviewsByKey, setReviewsByKey] = useState({}); // key: `${orderId || ''}:${productId}` -> { label, option, _id }

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      toast.error('Please login to view your history');
      router.push('/auth/login');
    }
  }, [loading, isLoggedIn, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoggedIn) return;
      try {
        setIsLoading(true);
        const [ordersRes, optionsRes] = await Promise.all([
          Api('get', 'orders', null, router),
          Api('get', 'reviews?active=true', null, router)
        ]);
        if (ordersRes.success) {
          const mapped = (ordersRes.data || [])
            .filter(o => o.status === 'fulfilled')
            .map(o => ({
              id: o.orderNumber,
              total: o.totalAmount,
              status: o.status,
              products: o.items.map(it => ({
                id: it.product?._id || it.product,
                name: it.name,
                amount: it.price * it.quantity,
                image: it.image || (it.product && it.product.images && it.product.images[0]) || ''
              }))
            }));
          setOrders(mapped);

          // After orders mapped, fetch user's existing reviews for each product/order pair
          const pairs = [];
          mapped.forEach(ord => {
            ord.products.forEach(p => {
              pairs.push({ productId: p.id, orderId: ord.id });
            });
          });

          const uniqueKeys = new Set();
          const uniquePairs = pairs.filter(({ productId, orderId }) => {
            const k = `${orderId}:${productId}`;
            if (uniqueKeys.has(k)) return false;
            uniqueKeys.add(k);
            return true;
          });

          const results = await Promise.allSettled(
            uniquePairs.map(({ productId, orderId }) =>
              Api('get', `reviews/my?productId=${productId}&orderId=${orderId}`, null, router)
            )
          );

          const nextMap = {};
          results.forEach((res, idx) => {
            const { productId, orderId } = uniquePairs[idx];
            const key = `${orderId}:${productId}`;
            if (res.status === 'fulfilled' && res.value && res.value.success && res.value.data) {
              const doc = res.value.data;
              nextMap[key] = { label: doc.label, option: doc.option, _id: doc._id };
            }
          });
          setReviewsByKey(nextMap);
        }
        if (optionsRes.success) setReviewOptions(optionsRes.data || []);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load history');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isLoggedIn, router]);

  const toggleOrder = (orderId) => {
    setExpandedByOrder(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const openReview = (productId, orderId) => setReviewModal({ open: true, productId, orderId });
  const closeReview = () => setReviewModal({ open: false, productId: null, orderId: null });
  const submitReview = async (optionId) => {
    try {
      const res = await Api('post', 'reviews/submit', { productId: reviewModal.productId, optionId, orderId: reviewModal.orderId }, router);
      if (res.success) {
        toast.success('Review submitted');
        // Update local cache so UI reflects Update Review and label immediately
        const chosen = reviewOptions.find(o => o._id === optionId);
        const key = `${reviewModal.orderId}:${reviewModal.productId}`;
        setReviewsByKey(prev => ({
          ...prev,
          [key]: { label: chosen?.label || '', option: optionId, _id: res.data?._id }
        }));
        closeReview();
      } else {
        toast.error(res.message || 'Failed to submit');
      }
    } catch (e) {
      toast.error('Failed to submit');
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      {/* Animated stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="stars-container">
          {[...Array(60)].map((_, i) => (
            <div
              key={`star-${i}`}
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
      `}</style>

      <div className="max-w-4xl mx-auto px-4 py-8 relative z-10">
        <h1 className="text-2xl font-bold text-white mb-6"> History</h1>

        <div className="space-y-4">
          {isLoading && <div className="text-center text-gray-300">Loading...</div>}
          {!isLoading && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-full p-6 mb-6">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">No Orders Yet</h2>
              <p className="text-gray-300 text-center mb-8 max-w-md">
                You haven't placed any orders yet. Start exploring our menu and discover amazing products!
              </p>
              <button
                onClick={() => router.push('/menu')}
                className="bg-transparent text-white border border-white/50 hover:border-white px-8 py-3 rounded-lg font-medium transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105"
              >
                Continue Shopping
              </button>
            </div>
          )}
          {!isLoading && orders.length > 0 && orders.map((order, orderIndex) => {
            const isOpen = !!expandedByOrder[order.id];
            const productsToShow = isOpen ? order.products : order.products.slice(0, 1);
            return (
              <div key={orderIndex} className="bg-white/10 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 shadow-[0_0_10px_rgba(77,163,255,0.15)]">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-300">
                    Order ID: ORD{order.id.slice(-4)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">Total: ${order.total}</span>
                    <button onClick={() => toggleOrder(order.id)} className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                      <span>{isOpen ? 'Hide items' : 'Show all items'}</span>
                      <span>{isOpen ? '▲' : '▼'}</span>
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  {productsToShow.map((p, i) => {
                    const key = `${order.id}:${p.id}`;
                    const myReview = reviewsByKey[key];
                    return (
                      <div key={i} className="flex items-center">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-12 h-12 object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white">{p.name}</span>
                            {myReview?.label && (
                              <span className="bg-green-500/20 text-green-300 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap border border-green-500/30">My review: {myReview.label}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-32 flex justify-center">
                        <button onClick={() => openReview(p.id, order.id)} className="text-sm py-1 px-2 rounded-lg bg-transparent text-white border border-white/50 hover:border-white whitespace-nowrap transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)]">{myReview ? 'Update Review' : 'Add Review'}</button>
                        </div>
                        <div className="w-24 flex justify-end">
                          <span className="text-sm text-gray-300 whitespace-nowrap">Amount: ${p.amount}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {reviewModal.open && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0B0F1A] border border-gray-700/50 rounded-3xl shadow-xl w-full max-w-lg p-8 relative">
            {/* Close button */}
            <button 
              onClick={closeReview} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white text-2xl transition-colors"
            >
              ×
            </button>
            
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Review Us!</h3>
              <p className="text-gray-300 text-sm">Let us know about your experience.</p>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <p className="text-center text-gray-400 text-sm">
                Select from the options below what best suited your experience.
              </p>
            </div>
            
            {/* Options */}
            <div className="flex flex-wrap gap-3 justify-center">
              {reviewOptions.map((opt, index) => {
                const colors = [
                  'bg-pink-500/20 text-pink-300 border-pink-500/30 hover:bg-pink-500/30',
                  'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30', 
                  'bg-blue-500/20 text-blue-300 border-blue-500/30 hover:bg-blue-500/30',
                  'bg-gray-500/20 text-gray-300 border-gray-500/30 hover:bg-gray-500/30'
                ];
                const bgColor = colors[index % 4];
                
                return (
                  <button 
                    key={opt._id} 
                    onClick={() => submitReview(opt._id)} 
                    className={`px-4 py-2 rounded-full text-sm font-medium border transition-all ${bgColor}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
              {reviewOptions.length === 0 && (
                <div className="text-sm text-gray-400 text-center">No review options available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}