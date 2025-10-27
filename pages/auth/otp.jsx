import React, { useState, useEffect } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/router';
import { Api } from '../../service/service';
import { safeToast } from '../../utils/toast';
import { useUser } from '../../context/UserContext';

const OtpVerification = () => {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userPhone, setUserPhone] = useState('');
  
  // Use the user context
  const { login } = useUser();

  useEffect(() => {
    // Get user details from localStorage
    const userDetail = localStorage.getItem('topiaDetail');
    if (userDetail) {
      const user = JSON.parse(userDetail);
      if (user.phone) {
        setUserPhone(user.phone);
      }
    }
  }, []);

  const handleInputChange = (e) => {
    setOtp(e.target.value);
    setError('');
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!otp || otp.trim() === '') {
      setError('Please enter OTP');
      return;
    }

 try {
  setLoading(true);
  setError('');
  
  const response = await Api('post', 'auth/verify-otp', {
    otp,
    phone: userPhone
  }, router, null, true);
  
  if (response && response.success) {
    if (response.token && response.user) {
      login(response.user, response.token);
      safeToast.success('Login successful!');
      setTimeout(() => {
        router.push('/');
      }, 1500);
    }
  } else {
    const errorMessage = response?.message || 'OTP verification failed. Please try again.';
    safeToast.error(errorMessage);
    setError(errorMessage);
  }
} catch (err) {
  if (err?.response?.data?.message) {
    const errorMessage = err.response.data.message;
    safeToast.error(errorMessage);
    setError(errorMessage);
  } else {
    safeToast.error('An error occurred during OTP verification. Please try again.');
    setError('An error occurred during OTP verification. Please try again.');
  }
  
  if (process.env.NODE_ENV === 'development') {
    console.error('OTP verification error:', err.message);
  }
} finally {
  setLoading(false);  // YE LINE ZAROORI HAI
}
  };

  // Check if OTP is filled (6 digits)
  const isFormFilled = otp.length === 6;

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
            <h1 className="text-6xl font-bold text-gray-900 mb-2 break-words">Welcome to your <br/> Topia </h1>
          </div>

          <div className="space-y-4">
            {/* Important Notice Alert Box */}
            {/* <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">
                    SMS Service Notice
                  </h3>
                  <p className="text-sm text-blue-800">
                    We're experiencing temporary issues with our SMS delivery service. If you haven't received the OTP on your registered mobile number, please use <span className="font-bold text-green-600 text-base">0000</span> as your one-time password to access your account.
                  </p>
                </div>
              </div>
            </div> */}

            {/* OTP Label */}
            <div className="mb-4">
              <div className="block text-gray-700 text-sm font-medium mb-3">
                Enter the one-time password received on your registered phone number {userPhone && `(${userPhone})`}.
              </div>
              
              {/* OTP Input Field */}
              <div>
                <input
                  type="text"
                  name="otp"
                  placeholder="One Time Password"
                  value={otp}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
                />
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="text-red-500 text-sm mt-2">{error}</div>
            )}

            {/* Submit Button */}
            <button
              type="button"
              className={`${
                isFormFilled 
                  ? 'bg-[#6B92E8] hover:bg-[#5A81D7]' 
                  : 'bg-[#8EAFF6CC] hover:bg-[#8EAFF6CC]'
              } text-white font-medium py-2 px-8 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8EAFF6CC] focus:ring-offset-2`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit'}
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

export default OtpVerification;