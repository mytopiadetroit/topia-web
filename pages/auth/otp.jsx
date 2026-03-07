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
    <div className="min-h-screen flex items-center justify-center overflow-hidden relative px-4 py-20 md:py-28" style={{ background: 'transparent' }}>
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

     
      <div className="w-full max-w-2xl relative z-10">
        
       
        <div className="absolute -top-[180px] md:-top-[200px] lg:-top-[240px] left-1/2 transform -translate-x-1/2 z-0">
          <img 
            src="/agelogo.png" 
            alt="Logo" 
            className="w-96 h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] object-contain"
          />
        </div>

        {/* OTP Card with Background Image */}
        <div className="relative p-8 md:p-12 overflow-hidden min-h-[420px] md:min-h-[400px]">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-contain md:bg-contain bg-no-repeat"
            style={{
              backgroundImage: 'url(/bgage.png)',
              backgroundSize: '100% 80%',
              backgroundPosition: 'center top'
            }}
          >
            <style jsx>{`
              @media (min-width: 768px) {
                div {
                  background-size: contain !important;
                  background-position: center !important;
                }
              }
            `}</style>
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Header */}
            <h1 className="text-xl md:text-2xl lg:text-3xl text-white font-bold text-center mb-3 md:mb-4 uppercase tracking-wide" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
              Verify Your OTP
            </h1>
            
            <p className="text-sm md:text-base text-gray-300 text-center mb-6 md:mb-8 px-4" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
              Enter the one-time password received on {userPhone && `${userPhone}`}
            </p>

            {/* OTP Input */}
            <div className="w-full max-w-md mb-4">
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

            {/* Error Message */}
            {error && (
              <div className="text-red-300 text-sm mb-6 text-center">
                {error}
              </div>
            )}

            {/* Button Container with Decorative Lines */}
            <div className="flex flex-col items-center mt-4">
              {/* Decorative Top Border Line */}
              <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mt-2" 
                   style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.6)' }}></div>
              
              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="max-w-[250px] px-8 py-3 text-white text-base md:text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wider"
                style={{
                  background: 'transparent',
                  border: '1px solid #86D1F8',
                  boxShadow: '0 0 10px rgba(134, 209, 248, 0.3)',
                  width: '250px'
                }}
              >
                {loading ? 'Processing...' : 'Submit'}
              </button>

              {/* Decorative Bottom Border Line */}
              <div className="w-32 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-2" 
                   style={{ boxShadow: '0 0 10px rgba(34, 211, 238, 0.6)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpVerification;