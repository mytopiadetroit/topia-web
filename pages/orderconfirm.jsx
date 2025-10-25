import { useState, useEffect } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { Api } from '../service/service';

export default function OrderConfirm() {
  const router = useRouter();
  const { orderId } = router.query;
  const { isLoggedIn, loading } = useUser();
  const [orderData, setOrderData] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [error, setError] = useState(null);

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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#536690] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
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

  // No order state
  if (!orderData) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg mb-4">Order not found</p>
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
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Top Confirmation Section */}
        <div className="text-center mb-12">
          {/* Green Checkmark Circle */}
          <div className="w-44 h-44 rounded-full border-4 shadow-lg mx-auto mb-6 flex items-center justify-center">
            <img src="/images/check.png" alt="abc" />
          </div>
          
          {/* Heading */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          
          {/* Sub-text */}
          <p className="text-lg text-gray-700">Thank you for your order!</p>
        </div>

  <div className="flex justify-end mt-4 mb-8">
          <button 
            onClick={() => router.push('/menu')} 
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
    <ChevronLeft className="w-4 h-4" />
    <span>Back to Menu</span>
  </button>
</div>

        {/* Order Details Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header - Dark Blue/Gray Bar */}
          <div className="bg-[#536690] text-white px-6 py-4 flex justify-between items-center">
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
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <span className="font-semibold text-gray-900">$ {item.price}</span>
                    </div>
                  </div>
                  
                  {/* Divider after each item */}
                  <div className="border-t border-gray-200 mt-4"></div>
                </div>
              ))}
            </div>

            {/* Bottom Section */}
            <div className="flex justify-between items-start">
              {/* Contact Information - Bottom Left */}
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-2">Need Help ?</h3>
                <p className="text-sm text-gray-600 mb-1">+313-231-8760</p>
                <p className="text-sm text-gray-600">Mytopiadetroit@gmail.com</p>
                
                {/* Order Status */}
                <div className="mt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Order Status</h4>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    orderData.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    orderData.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    orderData.status === 'processing' ? 'bg-purple-100 text-purple-800' :
                    orderData.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    orderData.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Bill Summary - Bottom Right */}
              <div className="flex-1 text-right">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">${orderData.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Tax (7%)</span>
                    <span className="font-medium text-gray-900">${orderData.tax.toFixed(2)}</span>
                  </div>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900">Grand Total:</span>
                      <span className="text-xl font-bold text-gray-900">${orderData.totalAmount.toFixed(2)}</span>
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
