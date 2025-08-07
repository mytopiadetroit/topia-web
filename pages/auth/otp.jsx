import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const BackForMore = () => {
  const [formData, setFormData] = useState({
    phone: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Mushroom Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img 
          src="/images/auth.png" 
          alt="Mushroom in forest" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/3 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-900 mb-2 break-words">Back For <br/> More ?</h1>
          </div>

          <div className="space-y-4">
            {/* OTP Label */}
            <div className="mb-4">
              <div className="block text-gray-700 text-sm font-medium mb-3">Enter the one-time password received on your registered phone number.</div>
              
              {/* OTP Input Field */}
              <div>
                <input
                  type="text"
                  name="otp"
                  placeholder="One Time Password"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              className=" bg-[#8EAFF6CC] hover:bg-[#8EAFF6CC] text-white font-medium py-2 px-8 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8EAFF6CC] focus:ring-offset-2 "
            >
              Submit
            </button>

            {/* Footer Text */}
            <div className="text-center mt-16">
              <p className="text-gray-600 text-sm">
                Do not have an account ? 
                <span className="text-blue-600 font-medium cursor-pointer hover:underline ml-1">Register</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackForMore;