import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { Api } from '../../services/service';
import Link from 'next/link';

const Login = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async () => {
    // Basic validation
    if (!formData.phone || formData.phone.trim() === '') {
      setError('Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await Api('post', 'auth/login', {
        phone: formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`
      }, router);
      
      if (response.success) {
        // Store user data and token in localStorage
        localStorage.setItem('userDetail', JSON.stringify(response.user));
        localStorage.setItem('token', response.token);
        
        // Redirect to OTP verification page or dashboard based on your flow
        router.push('/auth/otp');
      } else {
        setError(response.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
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
            <h1 className="text-6xl font-bold text-gray-900 mb-2 break-words">Back For <br/> More ?</h1>
          </div>

          <div className="space-y-4">
            {/* Phone Number Label */}
            <div className="mb-4">
              <div className="block text-gray-700 text-sm font-medium mb-3">Check-in with your registered phone number</div>
              
              {/* Phone Field with Flag */}
              <div className="flex">
                <div className="flex items-center px-4 py-3 border border-r-0 border-gray-300 rounded-l-full bg-white">
                  <img 
                    src="https://flagcdn.com/w20/in.png" 
                    alt="India flag" 
                    className="w-5 h-3 mr-2"
                  />
                  <span className="text-gray-700 text-sm">+91</span>
                  <ChevronDown className="ml-2 w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 416 568 9912"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
                />
              </div>
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
              className=" bg-[#8EAFF6CC] hover:bg-[#8EAFF6CC] text-white font-medium py-2 px-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8EAFF6CC] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
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