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
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Mushroom Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img
          src={loginImage?.image || "/images/auth.png"}
          alt="Mushroom in forest"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-2/3 bg-white flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-2 break-words">Welcome to your <br /> Topia </h1>
          </div>

          <div className="space-y-4">
            {/* Phone Number Label */}
            <div className="mb-4">
              <div className="block text-gray-700 text-sm font-medium mb-3">Check-in with your registered phone number</div>

              {/* Phone Field with react-phone-input-2 */}
              <PhoneInput
                country={'us'}
                value={phoneNumber}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  required: true,
                  autoFocus: true,
                  placeholder: 'Enter phone number',
                  className: 'w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500'
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

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm mb-4">
                {error}
              </div>
            )}

            {/* Check-In Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className={`${isFormFilled
                ? 'bg-[#6B92E8] hover:bg-[#5A81D7]'
                : 'bg-[#80A6F7] hover:bg-[#8EAFF6CC]'
                } text-white font-medium py-2 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8EAFF6CC] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? 'Checking...' : 'Check-In'}
            </button>

            {/* Footer Text */}
            <div className="text-center mt-16">
              <p className="text-gray-600 text-sm">
                Do not have an account ?
                <Link href="/auth/register">
                  <span className="bg-[#8EAFF6CC] text-white font-medium cursor-pointer hover:bg-[#6B94F5] ml-2 px-4 py-2 rounded-full transition-colors duration-200">Register</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;