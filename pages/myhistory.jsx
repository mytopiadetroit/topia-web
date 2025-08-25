import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { Api } from '../services/service';

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
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6"> History</h1>

        <div className="space-y-4">
          {isLoading && <div className="text-center text-gray-600">Loading...</div>}
          {!isLoading && orders.map((order, orderIndex) => {
            const isOpen = !!expandedByOrder[order.id];
            const productsToShow = isOpen ? order.products : order.products.slice(0, 1);
            return (
              <div key={orderIndex} className="bg-[#E7E7E7] rounded-xl shadow-lg border-b p-4 ">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm text-gray-600">
                    Order ID: ORD{order.id.slice(-4)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900">Total: ${order.total}</span>
                    <button onClick={() => toggleOrder(order.id)} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1">
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
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-12 h-12 object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-[#2E2E2E40] rounded-lg"></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-900">{p.name}</span>
                            {myReview?.label && (
                              <span className="bg-green-100 text-green-800 text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">My review: {myReview.label}</span>
                            )}
                          </div>
                        </div>
                        <div className="w-32 flex justify-center">
                        <button onClick={() => openReview(p.id, order.id)} className="text-sm py-1 px-2 rounded-lg bg-[#536690] text-white hover:bg-[#4a5a7f] whitespace-nowrap">{myReview ? 'Update Review' : 'Add Review'}</button>
                        </div>
                        <div className="w-24 flex justify-end">
                          <span className="text-sm text-gray-600 whitespace-nowrap">Amount: ${p.amount}</span>
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-8 relative">
            {/* Close button */}
            <button 
              onClick={closeReview} 
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
            
            {/* Header */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Us!</h3>
              <p className="text-gray-600 text-sm">Let us know about your experience.</p>
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <p className="text-center text-gray-700 text-sm">
                Select from the options below what best suited your experience.
              </p>
            </div>
            
            {/* Options */}
            <div className="flex flex-wrap gap-3 justify-center">
              {reviewOptions.map((opt, index) => {
                const colors = [
                  'bg-pink-300 text-pink-800',
                  'bg-purple-300 text-purple-800', 
                  'bg-blue-300 text-blue-800',
                  'bg-gray-400 text-gray-800'
                ];
                const bgColor = colors[index % 4];
                
                return (
                  <button 
                    key={opt._id} 
                    onClick={() => submitReview(opt._id)} 
                    className={`px-4 py-2 rounded-full text-sm font-medium hover:opacity-80 transition-opacity ${bgColor}`}
                  >
                    {opt.label}
                  </button>
                );
              })}
              {reviewOptions.length === 0 && (
                <div className="text-sm text-gray-500 text-center">No review options available</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}