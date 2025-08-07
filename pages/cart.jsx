import React from 'react';

const Cart = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8"> {/* Reset gap to normal */}
          {/* Left Side - Cart Items */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button className="p-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                </button>
                <h1 className="text-xl font-semibold text-gray-900">My Cart</h1>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50">
                Edit
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="space-y-4">
              {/* Item 1 */}
              <div className="bg-white rounded-2xl  shadow-sm border border-gray-100 w-full">
                <div className="flex items-center gap-4">
                <div className="w-32 rounded-2xl h-30  overflow-hidden flex-shrink-0">
                    <img 
                      src="/images/cart.png" 
                      alt="Lion's Mane Capsules"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">Lion's Mane Capsules</h3>
                    <p className="text-gray-500 text-sm mt-1">Quantity: 1</p>
                    <p className="font-semibold text-lg text-gray-900 mt-10">$ 50</p>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white rounded-2xl  shadow-sm border border-gray-100 w-full">
                <div className="flex items-center gap-4">
                  <div className="w-32 rounded-2xl h-28  overflow-hidden flex-shrink-0">
                    <img 
                      src="/images/cart.png" 
                      alt="Mush Love Chocolate"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">Mush Love Chocolate</h3>
                    <p className="text-gray-500 text-sm mt-1">Quantity: 1</p>
                    <p className="font-semibold text-lg text-gray-900 mt-1">$ 20</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <img src="/images/line2.png" alt="abc" className="ml-24 hidden sm:block" />

          {/* Right Side - Bill Summary */}
          <div className="w-full lg:w-80 flex flex-col items-center lg:ml-44"> {/* Add margin-left for spacing on large screens */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Bill Summary</h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">$ 70</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-semibold text-gray-900">$ 5</span>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 mb-2">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-gray-900">Grand Total</span>
                  <span className="text-xl font-semibold text-gray-900">$ 75</span>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 bg-[#536690] hover:bg-slate-700 text-white font-semibold py-4 px-6 rounded-4xl transition-colors">
              Submit Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;