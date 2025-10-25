import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { Api } from '@/service/service';

const Cart = () => {
  const router = useRouter();
  const { isLoggedIn, loading } = useUser();
  const { cart, cartCount, removeFromCart, updateCartItemQuantity, clearCart } = useApp();
  
  useEffect(() => {
    // Only check after loading is complete
    if (!loading) {
      // Check if user is logged in
      if (!isLoggedIn) {
        // Show toast notification
        toast.error('Please login to access your cart', {
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

  // Calculate totals
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.07; // 7% tax
  const grandTotal = subtotal + tax;

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      toast.success('Item removed from cart');
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    removeFromCart(productId);
    toast.success('Item removed from cart');
  };

  const handleClearCart = () => {
    clearCart();
    toast.success('Cart cleared');
  };

  const handleSubmitCart = async () => {
    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    try {
      // Prepare order data (pickup flow)
      const orderData = {
        items: cart.map(item => ({
          ...item,
          // Ensure intensity is included for each product
          intensity: item.intensity || 5 // Default to 5 if intensity is not set
        })),
        shippingAddress: {},
        paymentMethod: 'pay_at_pickup',
        notes: 'Pickup at store'
      };

      // Create order via API
      const response = await Api('POST', 'orders', orderData, router);
      
      if (response.success) {
        // Clear cart after successful order
        clearCart();
        
        // Redirect to order confirmation page with order ID
        router.push(`/orderconfirm?orderId=${response.data._id}`);
        
        toast.success('Order placed successfully!');
      } else {
        toast.error(response.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-16">
            <div className="mb-6">
              <img src="/images/cart.png" alt="Empty Cart" className="w-32 h-32 mx-auto opacity-50" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 mb-4">Your cart is empty</h1>
            <p className="text-gray-600 mb-8">Looks like you haven't added any products to your cart yet.</p>
            <button 
              onClick={() => router.push('/menu')}
              className="bg-[#536690] hover:bg-[#536690] text-white font-semibold py-3 px-8 rounded-full transition-colors"
            >
              Start Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Side - Cart Items */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {/* <button onClick={() => router.back()} className="p-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button> */}
                <h1 className="text-xl font-semibold text-gray-900">My Cart ({cartCount} items)</h1>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleClearCart}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded-full hover:bg-red-50 transition-colors"
                >
                  Clear Cart
                </button>
                <button 
                  onClick={() => router.push('/menu')} 
                  className="flex items-center gap-2 px-4 py-2 border border-gray-500 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {cart.map((item) => {
                const stock = Number(item.stock || 0);
                const isOutOfStock = stock <= 0;
                const isAtMaxStock = stock > 0 && item.quantity >= stock;
                
                return (
                  <div key={item._id || item.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full">
                    <div className="flex items-center gap-4">
                    <div 
  className="w-32 rounded-2xl h-30 overflow-hidden flex-shrink-0 cursor-pointer"
  onClick={() => router.push(`/productdetails?id=${item._id || item.id}`)} 
>
  <img 
    src={item.images && item.images.length > 0 
      ? (item.images[0].startsWith('http') ? item.images[0] : `http://localhost:5000${item.images[0]}`)
      : "/images/cart.png"
    } 
    alt={item.name}
    className="w-full h-full object-cover"
  />
</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-sm">
                          {item.displayName || item.name}
                        </h3>
                        {item.selectedVariant && (
                          <p className="text-sm text-gray-600">
                            Size: {item.selectedVariant.size.value}{item.selectedVariant.size.unit}
                          </p>
                        )}
                        {item.selectedFlavor && (
                          <p className="text-sm text-gray-600">
                            Flavor: {item.selectedFlavor.name}
                            {item.selectedFlavor.price > 0 && (
                              <span className="text-green-600 ml-1">
                                (+${Number(item.selectedFlavor.price).toFixed(2)})
                              </span>
                            )}
                          </p>
                        )}
                        <p className="text-gray-500 text-sm mt-1">Quantity: {item.quantity}</p>
                        {isOutOfStock && (
                          <p className="text-red-500 text-sm mt-1">Out of stock</p>
                        )}
                        {!isOutOfStock && stock < 5 && (
                          <p className="text-orange-500 text-sm mt-1">Only {stock} left</p>
                        )}
                        <p className="font-semibold text-lg text-gray-900 mt-2">
                          ${Number(item.price || 0).toFixed(2)}
                          {item.quantity > 1 && (
                            <span className="text-sm text-gray-500 ml-2">
                              (${(Number(item.price || 0) / item.quantity).toFixed(2)} each)
                            </span>
                          )}
                        </p>
                      </div>
                      {/* Quantity Controls and Delete */}
                      <div className="flex items-end mt-14 gap-3 mr-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border bg-[#BABABA80] border-gray-300 rounded-full">
                          <button 
                            onClick={() => handleQuantityChange(item._id || item.id, item.quantity - 1)}
                            className="p-2 hover:bg-gray-50 rounded-l-full"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-800 hover:text-black" stroke="currentColor" strokeWidth="2">
                              <path d="M5 12h14"/>
                            </svg>
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-800 font-medium">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item._id || item.id, item.quantity + 1)}
                            disabled={isOutOfStock || isAtMaxStock}
                            className={`p-2 rounded-r-full ${
                              isOutOfStock || isAtMaxStock 
                                ? 'opacity-50 cursor-not-allowed' 
                                : 'hover:bg-gray-50'
                            }`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" className={`w-4 h-4 ${
                              isOutOfStock || isAtMaxStock 
                                ? 'text-gray-400' 
                                : 'text-gray-800 hover:text-black'
                            }`} fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 5v14M5 12h14"/>
                            </svg>
                          </button>
                        </div>
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleRemoveItem(item._id || item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c0 1 1 2 2 2v2"/>
                            <path d="M10 11v6M14 11v6"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <img src="/images/line2.png" alt="abc" className="ml-24 hidden sm:block" />

          {/* Right Side - Bill Summary */}
          <div className="w-full lg:w-80 flex flex-col items-center lg:ml-44">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Bill Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">$ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax (7%)</span>
                  <span className="font-semibold text-gray-900">$ {tax.toFixed(2)}</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-900">Grand Total</span>
                  <span className="text-xl font-semibold text-gray-900">$ {grandTotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <button 
              onClick={handleSubmitCart}
              className="w-full mt-6 bg-[#536690] hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-4xl transition-colors"
            >
              Submit Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;