import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { Api, ConstantsUrl } from '../../service/service';
import Link from 'next/link';
import { safeToast } from '../../utils/toast';
import { useUser } from '../../context/UserContext';
import PhoneInput from 'react-phone-input-2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { Axios } from 'axios';


const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginImage, setLoginImage] = useState({})

  // Use the user context
  const { login } = useUser();

  useEffect(() => {
    getPageImage()
  }, [])

  const getPageImage = async () => {
    console.log('Fetching homepage settings...');
    try {
      const response = await fetch(`${ConstantsUrl}auth/pagesetting?pagename=Login`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        credentials: 'omit' // Don't send cookies for public endpoint
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('API Response:', result.data[0]);
        setLoginImage(result.data[0])

        // if (result.success && result.data) {
        //   console.log('Setting sections with:', {
        //     rewards: result.data.rewardsSectionVisible,
        //     feedback: result.data.feedbackSectionVisible
        //   });

        //   setSections({
        //     rewards: result.data.rewardsSectionVisible ?? false,
        //     feedback: result.data.feedbackSectionVisible ?? false
        //   });
        // } else {
        //   console.warn('Unexpected API response format, showing sections by default');
        //   // Default to showing sections if API response is unexpected
        //   setSections({
        //     rewards: true,
        //     feedback: true
        //   });
        // }
      } else {
        console.warn('Failed to load homepage settings. Status:', response.status);
        // Default to showing sections if API fails
        // setSections({
        //   rewards: true,
        //   feedback: true
        // });
      }
    } catch (error) {
      console.error('Error loading homepage settings:', error);
      setSections({
        rewards: false,
        feedback: false
      });
    }
  };



  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handlePhoneChange = (value, data) => {
    setPhoneNumber(value);
    const phoneWithPlus = "+" + value;
    setFormData(prev => ({
      ...prev,
      phone: phoneWithPlus
    }));

    // Validate phone number using libphonenumber-js
    const phoneNumber = parsePhoneNumberFromString(phoneWithPlus);
    if (phoneNumber) {
      if (!phoneNumber.isValid()) {
        setError('Please enter a valid phone number');
      } else {
        setError('');
      }
    } else {
      setError('Please enter a valid phone number');
    }
  };

  const handleLogin = async () => {
    // Basic validation
    if (!formData.phone || formData.phone.trim() === '') {
      setError('Please enter your phone number');
      return;
    }

    // Phone number validation using libphonenumber-js
    const phoneNumber = parsePhoneNumberFromString(formData.phone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      setError('Please enter a valid phone number');
      safeToast.error('Please enter a valid phone number');
      return;
    }

    // Check if phone number length is valid for the country
    if (!phoneNumber.isPossible()) {
      setError(`The phone number length is not valid for ${phoneNumber.country}`);
      safeToast.error(`The phone number length is not valid for ${phoneNumber.country}`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Phone number is already formatted with country code by react-phone-input-2
      const formattedPhone = formData.phone;

      try {
        // Add preventRedirect: true to prevent automatic redirection on 401
        const response = await Api('post', 'auth/login', {
          phone: formattedPhone
        }, null, null, true); // Added preventRedirect: true

        console.log('Login API Response:', response);

        if (response?.success) {
          // Check user status before proceeding
          console.log('User status:', response.user?.status);
          if (response.user?.status === 'suspended') {
            console.log('Suspended user detected, redirecting to /suspend');
            safeToast.error('Your account has been suspended. Please contact support.');
            setTimeout(() => {
              router.push('/suspend');
            }, 1000);
            return;
          }

          if (response.user && response.token) {
            // Store user detail temporarily for OTP page (don't use context login yet)
            localStorage.setItem('tempUserDetail', JSON.stringify(response.user));
            localStorage.setItem('tempUserToken', response.token);

            // Only redirect to OTP page if login is successful
            safeToast.success('OTP has been sent! Please enter your OTP.');
            setTimeout(() => {
              router.push('/auth/otp');
            }, 1000);
          }
        } else {
          console.log('Login failed, checking for suspension error');

          if (response?.message?.includes('suspended')) {
            console.log('Suspension error in response, redirecting to /suspend');
            safeToast.error(response.message);
            setTimeout(() => {
              router.push('/suspend');
            }, 1000);
            return;
          }

          // Show error message without redirecting
          const errorMsg = response?.message || 'Login failed. Please try again.';
          safeToast.error(errorMsg);
          setError(errorMsg);

          // Keep the user on the login page
          return;
        }
      } catch (apiError) {
        console.log('API Error caught:', apiError);

        // Handle 400 Bad Request errors (including our custom validation errors)
        if (apiError.response?.status === 400) {
          const errorMessage = apiError.response.data?.message || 'Invalid request. Please check your input.';
          console.log('Validation error:', errorMessage);
          safeToast.error(errorMessage);
          setError(errorMessage);
          return;
        }

        // Handle suspension
        if (apiError.message?.includes('suspended') || apiError.response?.data?.message?.includes('suspended')) {
          const message = apiError.message || apiError.response?.data?.message;
          console.log('Suspension error, redirecting to /suspend');
          safeToast.error(message);
          setTimeout(() => {
            router.push('/suspend');
          }, 1000);
          return;
        }

        // Handle other errors
        const errorMessage = apiError.response?.data?.message ||
          apiError.message ||
          'An error occurred during login. Please try again.';
        console.log('Login error:', errorMessage);
        safeToast.error(errorMessage);
        setError(errorMessage);
        return;
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message ||
        err.response?.data?.error ||
        'An error occurred during login. Please try again.';
      safeToast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  // Check if form is filled (phone number has at least 10 digits and is valid)
  const isFormFilled = phoneNumber.length >= 10 && !error && formData.phone;

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


      {/* Main Content Container */}
      <div className="w-full max-w-2xl relative z-10">
        
        {/* Logo Image - Behind and Above Box */}
        <div className="absolute -top-[180px] md:-top-[200px] lg:-top-[240px] left-1/2 transform -translate-x-1/2 z-0">
          <img 
            src="/agelogo.png" 
            alt="Logo" 
            className="w-96 h-96 md:w-[28rem] md:h-[28rem] lg:w-[32rem] lg:h-[32rem] object-contain"
          />
        </div>

        {/* Login Card with Background Image */}
        <div className="relative p-8 md:p-12 overflow-hidden min-h-[420px] md:min-h-[400px]">
          {/* Background Image */}
          <div 
            className="absolute inset-0 z-0 bg-contain md:bg-contain bg-no-repeat"
            style={{
              backgroundImage: 'url(/bgage.png)',
              backgroundSize: '100% 95%',
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
              Welcome to Shroom Topia Detroit
            </h1>
            
            <p className="text-base md:text-lg text-gray-300 text-center mb-6 md:mb-8" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
              Portal to Detroits Largest Mushroom Selection
            </p>

            {/* Phone Input */}
            <div className="w-full max-w-md mb-4">
              <PhoneInput
                country={'us'}
                value={phoneNumber}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                  placeholder: '+1',
                  className: 'w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                }}
                containerClass="w-full"
                buttonStyle={{
                  position: 'absolute',
                  border: 'none',
                  background: 'transparent',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2
                }}
                inputStyle={{
                  width: '100%',
                  paddingLeft: '50px',
                  height: '50px'
                }}
                containerStyle={{
                  position: 'relative'
                }}
                dropdownClass="rounded-lg shadow-md text-gray-700"
                enableSearch={true}
                disableSearchIcon={false}
                disableCountryCode={false}
                countryCodeEditable={false}
                autoFormat={true}
                searchPlaceholder="Search country"
                searchNotFound="Country not found"
                onlyCountries={[]}
                preferredCountries={['us', 'in', 'gb', 'ca', 'au']}
                enableClickOutside={true}
                showDropdown={false}
              />
            </div>

            <p className="text-sm text-gray-300 text-center mb-6" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
              Check in with your registered phone number
            </p>

            {/* Error Message */}
            {error && (
              <div className="text-red-300 text-sm mb-4 text-center">
                {error}
              </div>
            )}

            {/* Check-In Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full max-w-[280px] px-8 py-3 text-white text-base md:text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wider mb-4"
              style={{
                background: 'transparent',
                border: '1px solid #86D1F8',
                boxShadow: '0 0 10px rgba(134, 209, 248, 0.3)'
              }}
            >
              {loading ? 'Checking...' : 'Check - In'}
            </button>
          </div>
        </div>

        {/* Register Link - Below Box */}
        <div className="text-center mt-1">
          <p className="text-white text-base md:text-lg">
            Do not have an account ?{' '}
            <Link href="/auth/register">
              <span className="inline-block px-6 py-2 text-white font-bold rounded-full cursor-pointer transition-all duration-300 transform hover:scale-105" style={{
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: 'none'
              }}>
                Register
              </span>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;