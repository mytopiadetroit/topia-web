import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { Api } from '../service/service';
import { XCircle } from 'lucide-react';

export default function MyOrders() {
  const router = useRouter();
  const { isLoggedIn, loading } = useUser();
  const [activeFilter, setActiveFilter] = useState('All');
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedByOrder, setExpandedByOrder] = useState({});
  
  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      // Check if user is logged in
      if (!isLoggedIn) {
        // Show toast notification
        toast.error('Please login to view your orders', {
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
  }, [isLoggedIn, loading, router]);

  // Function to fetch orders
  const fetchOrders = async () => {
    if (!isLoggedIn) return;
    try {
      setIsLoading(true);
      const res = await Api('get', 'orders', null, router);
      console.log("API Response:", JSON.stringify(res, null, 2));
      if (res.success) {
        // Normalize to fields we use in UI
        const mapped = (res.data || []).map(o => ({
          id: o.orderNumber,  // Use orderNumber as the ID
          _id: o._id,         // Keep the MongoDB _id as well
          total: o.totalAmount,
          status: o.status,
          products: o.items.map(it => ({
            id: it.product?._id || it.productId || (it.product && it.product.id) || null,
            name: it.name,
            amount: it.price * it.quantity,
            image: it.image || (it.product?.images?.[0]) || ''
          }))
        }));
        setOrders(mapped);
      } else {
        toast.error(res.message || 'Failed to load orders');
      }
    } catch (err) {
      console.error('Load my orders error:', err);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Load user's orders from backend when logged in
  useEffect(() => {
    fetchOrders();
  }, [isLoggedIn, router]);

  const filters = ['All', 'Processing', 'Ready for Pick-Up', 'Picked'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'unfulfilled':
        return 'text-cyan-400'; // Ready for Pick-Up
      case 'fulfilled':
        return 'text-green-400'; // Picked
      case 'incomplete':
        return 'text-red-400';
      case 'pending':
        return 'text-yellow-400';
      default:
        return 'text-gray-400';
    }
  };

  // Filter mapping: Processing -> pending; Ready for Pick-Up -> unfulfilled; Picked -> fulfilled
  const filteredOrders = orders.filter(o => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Processing') return o.status === 'pending';
    if (activeFilter === 'Ready for Pick-Up') return o.status === 'unfulfilled';
    if (activeFilter === 'Picked') return o.status === 'fulfilled';
    return true;
  });

  const toggleOrder = (orderId) => {
    setExpandedByOrder(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      const response = await Api('put', `orders/${orderId}/cancel`, null, router);
      
      if (response.success) {
        toast.success('Order cancelled successfully');
        // Refresh orders list
        await fetchOrders();
      } else {
        throw new Error(response.message || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.message || 'Error cancelling order');
    }
  };

  const canCancelOrder = (order) => {
    return ['pending', 'unfulfilled', 'incomplete'].includes(order.status?.toLowerCase());
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}>
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
        {/* Header Section */}
        <div className="mb-8">
          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-6">My Orders</h1>
          
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeFilter === filter
                    ? 'bg-white/20 text-white border border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.3)]'
                    : 'bg-white/10 text-gray-300 border border-white/20 hover:bg-white/15 hover:border-white/30'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center text-gray-300">Loading your orders...</div>
          )}
          {!isLoading && filteredOrders.length === 0 && (
            <div className="text-center text-gray-400">No orders found</div>
          )}
          {filteredOrders.map((order, orderIndex) => {
            const isOpen = !!expandedByOrder[order.id];
            const productsToShow = isOpen ? order.products : order.products.slice(0, 1);
            return (
              <div key={orderIndex} className="bg-white/10 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 shadow-[0_0_10px_rgba(77,163,255,0.15)]">
                {/* Order Header */}
                <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-300">
  Order ID: ORD{order.id.slice(-4)}
</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-white">Total: ${order.total}</span>
                    <button
                      onClick={() => toggleOrder(order.id)}
                      className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                    >
                      <span>{isOpen ? 'Hide items' : 'Show all items'}</span>
                      <span>{isOpen ? '▲' : '▼'}</span>
                    </button>
                    {canCancelOrder(order) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelOrder(order.id);
                        }}
                        className="flex items-center text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>

                {/* Products */}
                <div className="space-y-3">
                  {productsToShow.map((product, productIndex) => {
                    // Product ID is now included in the product object
                    
                    return (
                      <div key={productIndex} className="flex items-center justify-between">
                        {/* Left Side - Product Info */}
                        <div 
                          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent event bubbling
                            console.log('Product clicked:', product);
                            if (product.id) {
                              console.log('Navigating to product:', product.id);
                              router.push(`/productdetails?id=${product.id}`);
                            } else {
                              console.error('No product ID found. Full product object:', product);
                              // Try to get ID from original item if available
                              const fallbackId = product.originalItem?.product?._id || 
                                              product.originalItem?.productId || 
                                              product.originalItem?.product?.id;
                              if (fallbackId) {
                                console.log('Found fallback ID:', fallbackId);
                                router.push(`/productdetails?id=${fallbackId}`);
                              } else {
                                toast.error('Could not find product details');
                              }
                            }
                          }}
                        >
                          <div className="w-12 h-12 bg-white/10 rounded-lg overflow-hidden flex items-center justify-center">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="w-12 h-12 object-cover" />
                            ) : (
                              <div className="w-10 h-10 bg-white/10 rounded-lg"></div>
                            )}
                          </div>
                          <span className="text-sm text-white">{product.name}</span>
                        </div>

                        {/* Right Side - Status and Amount */}
                        <div className="flex items-center gap-4">
                          <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                            Status: {activeFilter === 'Ready for Pick-Up' ? 'Ready for Pick-Up' : activeFilter === 'Picked' ? 'Picked' : activeFilter === 'Processing' ? 'Processing' : order.status}
                          </span>
                          <span className="text-sm text-gray-300">Amount: ${product.amount}</span>
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
    </div>
  );
}
