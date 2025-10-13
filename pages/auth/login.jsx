import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { Api } from '../../service/service';
import Link from 'next/link';
import { safeToast } from '../../utils/toast';
import { useUser } from '../../context/UserContext';
import PhoneInput from 'react-phone-input-2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';


const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: ''
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Use the user context
  const { login } = useUser();

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
        const response = await Api('post', 'auth/admin-login', {
          phone: formattedPhone
        }, router);
        
        console.log('Login API Response:', response);
        
        if (response.success) {
          // Check user status before proceeding
          console.log('User status:', response.user?.status);
          if (response.user && response.user.status === 'suspended') {
            console.log('Suspended user detected, redirecting to /suspend');
            safeToast.error('Your account has been suspended. Please contact support.');
            setTimeout(() => {
              router.push('/suspend');
            }, 1000);
            return;
          }
          
          
          if (response.user && response.token) {
            localStorage.setItem('topiaDetail', JSON.stringify(response.user));
            localStorage.setItem('token', response.token);
          }
          
        
          safeToast.success('OTP has been sent! Please enter your OTP.');
          
         
          setTimeout(() => {
            router.push('/auth/otp');
          }, 1000);
        } else {
          console.log('Login failed, checking for suspension error');
        
          if (response.message && response.message.includes('suspended')) {
            console.log('Suspension error in response, redirecting to /suspend');
            safeToast.error(response.message);
            setTimeout(() => {
              router.push('/suspend');
            }, 1000);
            return;
          }
          
          safeToast.error(response.message || 'Login failed. Please try again.');
          setError(response.message || 'Login failed. Please try again.');
        }
      } catch (apiError) {
        // Handle API rejection (403, 500, etc.)
        console.log('API Error caught:', apiError);
        
        if (apiError.message && apiError.message.includes('suspended')) {
          console.log('Suspension error in catch, redirecting to /suspend');
          safeToast.error(apiError.message);
          setTimeout(() => {
            router.push('/suspend');
          }, 1000);
          return;
        }
        
        // Re-throw to be caught by outer catch
        throw apiError;
      }
    } catch (err) {
      console.error('Login error:', err);
      safeToast.error('An error occurred during login. Please try again.');
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
            <h1 className="text-5xl font-bold text-gray-900 mb-2 break-words">Welcome to your <br/> Topia </h1>
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
              className=" bg-[#80A6F7] hover:bg-[#8EAFF6CC] text-white font-medium py-2 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8EAFF6CC] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Checking...' : 'Check-In'}
            </button>

            {/* Footer Text */}
            <div className="text-center mt-16">
              <p className="text-gray-600 text-sm">
                Do not have an account ? 
                <Link href="/auth/register">
                  <span className="text-[#8EAFF6CC] font-medium cursor-pointer hover:underline ml-1">Register</span>
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