import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { Api, ApiFormData } from '../../services/service';
import Link from 'next/link';

const Register = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    phone: '',
    day: 'Day',
    month: 'Month',
    year: 'Year',
    howDidYouHear: 'How did you hear about us ?',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.fullName || !formData.phone) {
      setError('Please fill in all required fields');
      return;
    }
    
    if (formData.day === 'Day' || formData.month === 'Month' || formData.year === 'Year') {
      setError('Please select your complete date of birth');
      return;
    }
    
    if (formData.howDidYouHear === 'How did you hear about us ?') {
      setError('Please select how you heard about us');
      return;
    }
    
    if (!formData.agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }
    
    if (!selectedFile) {
      setError('Please upload your government ID');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Format the date of birth
      const dob = `${formData.year}-${months.indexOf(formData.month) + 1}-${formData.day}`;
      
      // Create form data for file upload
      const formDataToSend = new FormData();
      formDataToSend.append('email', formData.email);
      formDataToSend.append('fullName', formData.fullName);
      formDataToSend.append('phone', formData.phone.startsWith('+91') ? formData.phone : `+91${formData.phone}`);
      formDataToSend.append('dob', dob);
      formDataToSend.append('howDidYouHear', formData.howDidYouHear);
      formDataToSend.append('govId', selectedFile);
      
      const response = await ApiFormData('post', 'auth/register', formDataToSend, router);
      
      if (response.success) {
        // Store user data and token in localStorage if provided
        if (response.user) {
          localStorage.setItem('userDetail', JSON.stringify(response.user));
        }
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        
        // Redirect to OTP verification or login page based on your flow
        router.push('/auth/otp');
      } else {
        setError(response.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i);

  const hearAboutOptions = [
    'Social Media',
    'Friend Referral', 
    'Google Search',
    'Advertisement',
    'Blog/Article',
    'Other'
  ];

  // NEW OPTIONS ARRAY
  const contactMethodOptions = [
    'Email',
    'Phone Call',
    'SMS/Text',
    'WhatsApp',
    'No Contact Preference'
  ];

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

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-2/3 bg-white pt-10 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 break-words">Register</h1>
            <p className="text-gray-600 text-sm break-words">Let us get to know you better</p>
          </div>

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Full Name Field */}
            <div>
              <input
                type="text"
                name="fullName"
                placeholder="Full Name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Phone Field with Flag */}
            <div className="flex">
              <div className="flex items-center px-4 py-3 border border-r-0 border-gray-300 rounded-l-full bg-white">
                <img 
                  src="https://flagcdn.com/w20/in.png" 
                  alt="India flag" 
                  className="w-5 h-3 mr-2"
                />
                <span className="text-gray-700 text-sm">+91</span>
              </div>
              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border border-l-0 border-gray-300 rounded-r-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Birthday Label */}
            <div className="pt-2">
              <label className="block text-gray-700 text-sm font-medium mb-3">Birthday</label>
              
              {/* Birthday Dropdowns */}
              <div className="grid grid-cols-3 gap-3">
                {/* Day Dropdown */}
                <div className="relative">
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 appearance-none bg-white cursor-pointer"
                  >
                    <option value="Day">Day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Month Dropdown */}
                <div className="relative">
                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 appearance-none bg-white cursor-pointer"
                  >
                    <option value="Month">Month</option>
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Year Dropdown */}
                <div className="relative">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 appearance-none bg-white cursor-pointer"
                  >
                    <option value="Year">Year</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* How did you hear about us */}
            <div className="relative">
              <select
                name="howDidYouHear"
                value={formData.howDidYouHear}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 appearance-none bg-white cursor-pointer"
              >
                <option value="How did you hear about us ?">How did you hear about us ?</option>
                {hearAboutOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Government ID Upload Section */}
            <div className="bg-blue-50 p-4 rounded-2xl mt-6">
              <p className="text-xs text-gray-600 mb-3">
                *Drag & drop your government-issued ID here, or click to upload.
              </p>
              <div className="border-2 border-dashed border-blue-300 rounded-xl p-6 text-center bg-white">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="id-upload"
                  />
                  <label
                    htmlFor="id-upload"
                    className="cursor-pointer text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    {selectedFile ? selectedFile.name : 'Click to upload or drag and drop'}
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Terms Section */}
            <div className="bg-blue-50 p-4 rounded-2xl mt-6">
              <p className="text-xs text-gray-600 mb-3">
                *This & other your government-issued ID form, 
                or click to upload.
              </p>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <p className="text-xs text-gray-600 leading-relaxed">
                  I consent to the <span className="text-blue-600 underline cursor-pointer">Terms & Conditions</span> and understand that the ShroomTopia's products are 
                  intended for adults and may not be suitable for everyone. I agree to the 
                  <span className="text-blue-600 underline cursor-pointer"> Terms of Service</span> and <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-500 text-sm mb-4 mt-4">
                {error}
              </div>
            )}
            
            {/* Register Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#8EAFF6CC] hover:bg-[#8EAFF6CC] text-white font-medium py-3 px-4 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8EAFF6CC] focus:ring-offset-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
            
            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-600 text-sm">
                Already have an account? 
                <Link href="/auth/login">
                  <span className="text-[#8EAFF6CC] font-medium cursor-pointer hover:underline ml-1">Login</span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;