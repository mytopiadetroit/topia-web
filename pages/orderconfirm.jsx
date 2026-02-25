import { useState, useEffect } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { Api, fetchTaxSettings } from '../service/service';

export default function OrderConfirm() {
  const router = useRouter();
  const { orderId } = router.query;
  const { isLoggedIn, loading } = useUser();
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState(null);
  const [taxPercentage, setTaxPercentage] = useState(7);

  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      // Check if user is logged in
      if (!isLoggedIn) {
        // Show toast notification
        toast.error('Please login to view order confirmation', {
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

  // Load tax settings
  useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        const response = await fetchTaxSettings();
        if (response.success && response.data.isActive) {
          setTaxPercentage(response.data.percentage);
        }
      } catch (error) {
        console.error('Error loading tax settings:', error);
      }
    };
    loadTaxSettings();
  }, []);

  // Fetch order data when orderId changes
  useEffect(() => {
    if (orderId && isLoggedIn) {
      fetchOrderData();
    }
  }, [orderId, isLoggedIn]);

  const fetchOrderData = async () => {
    try {
      setLoadingOrder(true);
      setError(null);
      const response = await Api('GET', `orders/${orderId}`, null, router);
      
      if (response.success) {
        setOrderData(response.data);
      } else {
        setError('Order not found');
        toast.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      setError('Failed to load order');
      toast.error('Failed to load order');
    } finally {
      setLoadingOrder(false);
    }
  };

  const getDisplayOrderNumber = (orderNumber) => {
  if (orderNumber && orderNumber.startsWith('ORD')) {
    const numbers = orderNumber.replace('ORD', '');
    return `ORD${numbers.slice(-4)}`;
  }
  return orderNumber;
};
  // Loading state
  if (loadingOrder) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'transparent' }}>
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

        <div className="text-center relative z-10">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading order details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center relative z-10">
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button 
            onClick={() => router.push('/menu')}
            className="px-6 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-full transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // No order state
  if (!orderData) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center relative z-10">
          <p className="text-gray-400 text-lg mb-4">Order not found</p>
          <button 
            onClick={() => router.push('/menu')}
            className="px-6 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-full transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  // Format order date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10">
        {/* Top Confirmation Section */}
        <div className="text-center mb-12">
          {/* Green Checkmark Circle */}
          <div className="w-44 h-44 rounded-full border-4 border-green-400/30 shadow-[0_0_20px_rgba(34,197,94,0.3)] mx-auto mb-6 flex items-center justify-center bg-green-500/10">
            <img src="/images/check.png" alt="abc" />
          </div>
          
          {/* Heading */}
          <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
          
          {/* Sub-text */}
          <p className="text-lg text-gray-300">Thank you for your order!</p>
        </div>

  <div className="flex justify-end mt-4 mb-8">
          <button 
            onClick={() => router.push('/menu')} 
            className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
          >
    <ChevronLeft className="w-4 h-4" />
    <span>Back to Menu</span>
  </button>
</div>

        {/* Order Details Card */}
        <div className="bg-white/5 backdrop-blur-[1px] rounded-xl border border-gray-800/40 overflow-hidden">
          {/* Header - Dark Blue/Gray Bar */}
          <div className="bg-cyan-500/20 text-white px-6 py-4 flex justify-between items-center border-b border-cyan-400/30">
           <span className="font-medium">Order ID: {getDisplayOrderNumber(orderData.orderNumber)}</span>
            <span className="font-medium">Order Date: {formatDate(orderData.createdAt)}</span>
          </div>

          {/* Body - White Background */}
          <div className="p-10 rounded-xl">
            {/* Product Listings */}
            <div className="space-y-4 mb-8">
              {orderData.items.map((item, index) => (
                <div key={index}>
                  <div className="flex items-center gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image ? 
                          (item.image.startsWith('http') ? item.image : `http://localhost:5000${item.image}`) 
                          : "/images/img3.png"
                        } 
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-medium text-white">{item.name}</h3>
                      <p className="text-sm text-gray-400">Quantity: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="font-semibold text-white">$ {item.price}</span>
                    </div>
                  </div>
                  
                  {/* Divider after each item */}
                  <div className="border-t border-gray-700/50 mt-4"></div>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between items-start">
              {/* Contact Information - Bottom Left */}
              <div className="flex-1">
                <h3 className="font-bold text-white mb-2">Need Help ?</h3>
                <p className="text-sm text-gray-300 mb-1">+313-231-8760</p>
                <p className="text-sm text-gray-300">Mytopiadetroit@gmail.com</p>
                
                {/* Order Status */}
                <div className="mt-4">
                  <h4 className="font-semibold text-white mb-2">Order Status</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    orderData.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-400/30' :
                    orderData.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' :
                    orderData.status === 'processing' ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30' :
                    orderData.status === 'shipped' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30' :
                    orderData.status === 'delivered' ? 'bg-green-500/20 text-green-300 border border-green-400/30' :
                    'bg-red-500/20 text-red-300 border border-red-400/30'
                  }`}>
                    {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Bill Summary - Bottom Right */}
              <div className="flex-1 text-right">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Subtotal</span>
                    <span className="font-medium text-white">${orderData.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Tax ({taxPercentage}%)</span>
                    <span className="font-medium text-white">${orderData.tax.toFixed(2)}</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-700/50 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white">Grand Total:</span>
                      <span className="text-xl font-bold text-white">${orderData.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
