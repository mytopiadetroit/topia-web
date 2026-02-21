import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from 'next/router';
import { Api, ApiFormData } from '../../service/service';
import Link from 'next/link';
import { safeToast } from '../../utils/toast';
import PhoneInput from 'react-phone-input-2';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

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
    takesMedication: false,
    medicationDetails: '',
    agreeToTerms: false
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate that it's an image file
      const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validImageTypes.includes(file.type)) {
        setError('Please upload only image files (JPG, PNG, GIF, WEBP)');
        safeToast.error('Please upload only image files (JPG, PNG, GIF, WEBP)');
        e.target.value = ''; // Clear the input
        return;
      }
      setSelectedFile(file);
      setError(''); // Clear any previous errors
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.email || !formData.fullName || !formData.phone) {
      setError('Please fill in all required fields');
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
    const nationalNumber = phoneNumber.nationalNumber;
    const countryCode = phoneNumber.country;
    
    if (!phoneNumber.isPossible()) {
      setError(`The phone number length is not valid for ${phoneNumber.country}`);
      safeToast.error(`The phone number length is not valid for ${phoneNumber.country}`);
      return;
    }
    
    if (formData.day === 'Day' || formData.month === 'Month' || formData.year === 'Year') {
      setError('Please select your complete date of birth');
      return;
    }
    
 
    const birthDate = new Date(`${formData.year}-${months.indexOf(formData.month) + 1}-${formData.day}`);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - (months.indexOf(formData.month));
    const dayDiff = today.getDate() - formData.day;
    
    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }
    
    if (age < 21) {
      setError('You must be at least 21 years old to register');
      safeToast.error('You must be at least 21 years old to register');
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
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('day', formData.day);
      formDataToSend.append('month', formData.month);
      formDataToSend.append('year', formData.year);
      formDataToSend.append('howDidYouHear', formData.howDidYouHear);
      // Ensure takesMedication is sent as a boolean
      formDataToSend.append('takesMedication', formData.takesMedication ? 'true' : 'false');
      formDataToSend.append('medicationDetails', formData.medicationDetails);
      formDataToSend.append('govId', selectedFile);
      
      const response = await ApiFormData('post', 'auth/register', formDataToSend, router);
      
      
      // Check if registration was successful - improved condition
      if (response && (response.message === "Registration successful" || response.success === true || response.user || response.status === 'success')) {
        // Store user data (no token in this response)
        if (response.user) {
          localStorage.setItem('topiaDetail', JSON.stringify(response.user));
        }
        
        // Show success toast message with proper styling
        safeToast.success('Registration successful!');
        
        // Redirect to login page after a delay to ensure toast is visible
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        
        return; // Important: return early to prevent error toast
      } else {
        // Registration failed
        const errorMessage = response?.message || response?.error || 'Registration failed. Please try again.';

        safeToast.error(errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // Check if error response has success indicators
      if (err.response && err.response.data && 
          (err.response.data.message === "Registration successful" || 
           err.response.data.success === true || 
           err.response.data.user)) {
        
        // It's actually success but came through catch block
        if (err.response.data.user) {
          localStorage.setItem('topiaDetail', JSON.stringify(err.response.data.user));
        }
        
        safeToast.success('Registration successful!');
        
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
        
        return;
      }
      
      // Actual error
      const errorMessage = err.response?.data?.message || err.message || 'registration failed. Please try again.';
      
      safeToast.error(errorMessage);
      setError(errorMessage);
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

  // Check if all required fields are filled
  const isFormFilled = 
    formData.email.trim() !== '' &&
    formData.fullName.trim() !== '' &&
    phoneNumber.length >= 10 &&
    !error &&
    formData.phone &&
    formData.day !== 'Day' &&
    formData.month !== 'Month' &&
    formData.year !== 'Year' &&
    formData.howDidYouHear !== 'How did you hear about us ?' &&
    formData.agreeToTerms &&
    selectedFile !== null;

  return (
    <div className="h-screen flex overflow-hidden relative" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}>
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

      {/* Right Side - Registration Form */}
      <div className="w-full lg:w-2/3 bg-white/5 backdrop-blur-[1px] flex p-4 lg:p-8 overflow-y-auto relative z-10">
        <div className="w-full max-w-md mx-auto my-4 lg:my-auto">
          {/* Header */}
          <div className="mb-6 lg:mb-8 mt-4 lg:mt-0">
            <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2 break-words">Register</h1>
            <p className="text-gray-300 text-sm break-words">Registration must match Information on Goverment issued ID</p>
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
                className="w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
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
                className="w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              />
            </div>

            {/* Phone Field with react-phone-input-2 */}
            <div>
              <PhoneInput
                country={'us'}
                value={phoneNumber}
                onChange={handlePhoneChange}
                inputProps={{
                  name: 'phone',
                  placeholder: 'Phone',
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
              <p className='text-gray-300 ml-2 mt-1 text-[12px]'>*Verification code will be send for Confirmation</p>
            </div>

            {/* Birthday Label */}
            <div className="pt-2">
              <label className="block text-gray-300 text-sm font-medium mb-3">Birthday</label>
              
              {/* Birthday Dropdowns */}
              <div className="grid grid-cols-3 gap-3">
                {/* Day Dropdown */}
                <div className="relative">
                  <select
                    name="day"
                    value={formData.day}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white appearance-none cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    <option value="Day" className="bg-gray-800">Day</option>
                    {days.map(day => (
                      <option key={day} value={day} className="bg-gray-800">{day}</option>
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
                    className="w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white appearance-none cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    <option value="Month" className="bg-gray-800">Month</option>
                    {months.map(month => (
                      <option key={month} value={month} className="bg-gray-800">{month}</option>
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
                    className="w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white appearance-none cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                  >
                    <option value="Year" className="bg-gray-800">Year</option>
                    {years.map(year => (
                      <option key={year} value={year} className="bg-gray-800">{year}</option>
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
                className="w-full px-4 py-3 border border-white/30 bg-white/10 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white appearance-none cursor-pointer shadow-[0_0_15px_rgba(34,211,238,0.3)]"
              >
                <option value="How did you hear about us ?" className="bg-gray-800">How did you hear about us ?</option>
                {hearAboutOptions.map(option => (
                  <option key={option} value={option} className="bg-gray-800">{option}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Medication Information */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Do you take any medication?
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-cyan-400"
                    name="takesMedication"
                    checked={formData.takesMedication === true}
                    onChange={() => setFormData(prev => ({ ...prev, takesMedication: true }))}
                  />
                  <span className="ml-2 text-gray-300">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio h-4 w-4 text-cyan-400"
                    name="takesMedication"
                    checked={formData.takesMedication === false}
                    onChange={() => setFormData(prev => ({ ...prev, takesMedication: false, medicationDetails: '' }))}
                  />
                  <span className="ml-2 text-gray-300">No</span>
                </label>
              </div>
              
              {formData.takesMedication && (
                <div className="mt-2">
                  <label htmlFor="medicationDetails" className="block text-sm font-medium text-gray-300">
                    Please list your medications:
                  </label>
                  <input
                    type="text"
                    id="medicationDetails"
                    name="medicationDetails"
                    value={formData.medicationDetails}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border border-white/30 bg-white/10 px-3 py-2 shadow-sm focus:border-cyan-400 focus:outline-none focus:ring-cyan-400 sm:text-sm text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    placeholder="Enter medication names separated by commas"
                  />
                </div>
              )}
            </div>

            {/* Government ID Upload */}
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl mt-6 border border-white/20">
              <p className="text-sm font-medium text-gray-300 mb-2">
                Upload Government-Issued ID
              </p>
              <p className="text-xs text-gray-400 mb-3">
                Choose one of the following options to upload your ID:
              </p>
              
              {/* Two Options: Camera and File Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                {/* Camera Capture Option */}
                <div className="border-2 border-dashed border-cyan-400/50 rounded-xl p-4 text-center bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                      id="camera-capture"
                    />
                    <label
                      htmlFor="camera-capture"
                      className="cursor-pointer text-cyan-400 text-sm font-medium hover:text-cyan-300"
                    >
                      Take Photo
                    </label>
                    <p className="text-xs text-gray-400 mt-1">Use Camera</p>
                  </div>
                </div>

                {/* File Upload Option */}
                <div className="border-2 border-dashed border-cyan-400/50 rounded-xl p-4 text-center bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex flex-col items-center">
                    <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-2">
                      <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="id-upload"
                    />
                    <label
                      htmlFor="id-upload"
                      className="cursor-pointer text-cyan-400 text-sm font-medium hover:text-cyan-300"
                    >
                      Choose File
                    </label>
                    <p className="text-xs text-gray-400 mt-1">From Device</p>
                  </div>
                </div>
              </div>

              {/* Selected File Display */}
              {selectedFile && (
                <div className="bg-green-500/20 border border-green-400/50 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm text-green-300 font-medium truncate max-w-[200px]">
                      {selectedFile.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-green-400 hover:text-green-300"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {/* Help Text */}
              <div className="mt-3 bg-yellow-500/20 border border-yellow-400/50 rounded-lg p-3">
                <p className="text-xs text-yellow-300">
                  <strong>💡 Tip:</strong> If file upload doesn't work on your device, use the "Take Photo" option to capture your ID directly with your camera.
                </p>
              </div>
              
              <p className="text-xs text-gray-400 mt-2 text-center">
                Accepted formats: PNG, JPG, JPEG (up to 10MB)
              </p>
            </div>

            {/* Terms Section */}
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl mt-6 border border-white/20">
              <p className="text-xs text-gray-400 mb-3">
                {/* *This & other your government-issued ID form, 
                or click to upload. */}
              </p>
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="mt-1 w-4 h-4 text-cyan-400 border-gray-300 rounded focus:ring-cyan-400 cursor-pointer"
                />
                <p className="text-xs text-gray-300 leading-relaxed">
                  I consent to the <span className="text-cyan-400 underline cursor-pointer">Terms & Conditions</span> and understand that the ShroomTopia's products are 
                  intended for adults and may not be suitable for everyone. I agree to the 
                  <span className="text-cyan-400 underline cursor-pointer"> Terms of Service</span> and <span className="text-cyan-400 underline cursor-pointer">Privacy Policy</span>.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="text-red-300 text-sm mb-4 mt-4">
                {error}
              </div>
            )}
            
            {/* Register Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-transparent text-white border-2 border-white/50 hover:border-white font-medium py-3 px-4 rounded-full transition-all duration-200 focus:outline-none shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)] transform hover:scale-105 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
            
            {/* Login Link */}
            <div className="text-center mt-6">
              <p className="text-gray-300 text-sm">
                Already have an account? 
                <Link href="/auth/login">
                  <span className="bg-transparent text-white border-2 border-white/50 hover:border-white font-medium cursor-pointer ml-2 px-4 py-2 rounded-full transition-all duration-200 inline-block shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)] transform hover:scale-105">Login</span>
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