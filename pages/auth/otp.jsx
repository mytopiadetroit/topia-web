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
    // Get user details from temporary storage
    const userDetail = localStorage.getItem('tempUserDetail');
    if (userDetail) {
      const user = JSON.parse(userDetail);
      if (user.phone) {
        setUserPhone(user.phone);
      }
    } else {
      // If no temp data, redirect to login
      router.push('/auth/login');
    }
  }, [router]);

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
      
      console.log('OTP Verification Response:', response);
      
      if (response && response.success) {
        if (response.token && response.user) {
          // Ensure user object has status field
          const userWithStatus = {
            ...response.user,
            status: response.user.status || 'pending' // Default to 'pending' if status is not set
          };
          
          console.log('Logging in user with status:', userWithStatus.status);
          
          // Clear temporary storage
          localStorage.removeItem('tempUserDetail');
          localStorage.removeItem('tempUserToken');
          
          // Use context login function to save properly
          login(userWithStatus, response.token);
          
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
      setLoading(false);
    }
  };

  // Check if OTP is filled (6 digits)
  const isFormFilled = otp.length === 6;

  return (
    <div className="h-screen flex overflow-hidden relative" style={{ background: 'transparent' }}>
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

      {/* Left Side - Mushroom Image */}
      <div className="hidden lg:block lg:w-1/2 relative z-10">
        <img 
          src="/images/auth.png" 
          alt="Mushroom in forest" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/3 bg-white/5 backdrop-blur-[1px] flex items-center justify-center p-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-white mb-2 break-words">Welcome to your <br/> Topia </h1>
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
              <div className="block text-gray-300 text-sm font-medium mb-3">
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
                  className="w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
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
              className="bg-transparent text-white border-2 border-white/50 hover:border-white font-medium py-3 px-8 rounded-full transition-all duration-200 focus:outline-none shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)] transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Submit'}
            </button>

            {/* Footer Text */}
            <div className="text-center mt-16">
              <p className="text-gray-300 text-sm">
                Do not have an account ? 
                <span className="text-cyan-400 font-medium cursor-pointer hover:underline ml-1">Register</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;