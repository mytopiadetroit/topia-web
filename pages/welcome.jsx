'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, UserPlus } from 'lucide-react';
import Image from 'next/image';

export default function Welcome() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const router = useRouter();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center px-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-100 rounded-full opacity-20"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className={`text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/newlogo.jpg" 
              alt="Shroomtopia Logo" 
              width={200} 
              height={80}
              className="mx-auto"
              priority
            />
          </div>

          {/* Welcome heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Welcome to <span className="text-[#80A6F7]">Shroomtopia</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
            Your wellness journey starts here. Discover the power of therapeutic mushrooms 
            and elevate your natural wellness experience.
          </p>

          {/* Action buttons */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
              {/* Tab Headers */}
              <div className="flex">
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors duration-200 relative ${
                    activeTab === 'signup' 
                      ? 'text-[#80A6F7]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Sign Up
                  {activeTab === 'signup' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#80A6F7]"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors duration-200 relative ${
                    activeTab === 'login' 
                      ? 'text-[#80A6F7]' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Login
                  {activeTab === 'login' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#80A6F7]"></div>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'login' ? (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Already have an account?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Sign in to continue your wellness journey
                    </p>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="bg-[#80A6F7] hover:bg-[#6B94F5] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                    >
                      <User className="w-5 h-5" />
                      <span>Login</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      New to Shroomtopia?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Create your account and start exploring
                    </p>
                    <button
                      onClick={() => router.push('/auth/register')}
                      className="bg-[#80A6F7] hover:bg-[#6B94F5] text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center space-x-2 mx-auto"
                    >
                      <UserPlus className="w-5 h-5" />
                      <span>Register</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

       

        

      
        </div>
      </div>
    </div>
  );
}