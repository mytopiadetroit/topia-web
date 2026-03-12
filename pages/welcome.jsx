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
    <div className="min-h-screen relative flex items-center justify-center px-4" style={{ background: 'transparent' }}>
  

    
      <div className="relative z-10 w-full max-w-4xl mx-auto">
        <div className={`text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          
          {/* Logo */}
          <div className="mb-8">
            <Image 
              src="/images/pnglogo.png" 
              alt="Shroomtopia Logo" 
              width={200} 
              height={200}
              className="mx-auto"
              priority
            />
          </div>

          {/* Welcome heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Welcome to <span className="text-cyan-400" style={{ textShadow: '0 0 20px rgba(34, 211, 238, 0.6)' }}>Shroomtopia</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
        Explore the largest selection of mushrooms and begin your journey to elevated experiences.
          </p>

          {/* Action buttons */}
          <div className="max-w-lg mx-auto">
            <div className="bg-white/5 backdrop-blur-[1px] rounded-xl border border-gray-800/40 overflow-hidden">
              {/* Tab Headers */}
              <div className="flex">
                <button
                  onClick={() => setActiveTab('signup')}
                  className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors duration-200 relative ${
                    activeTab === 'signup' 
                      ? 'text-cyan-400' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Sign Up
                  {activeTab === 'signup' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 py-4 px-6 text-lg font-semibold transition-colors duration-200 relative ${
                    activeTab === 'login' 
                      ? 'text-cyan-400' 
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Login
                  {activeTab === 'login' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-400"></div>
                  )}
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === 'login' ? (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Already have an account?
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Sign in to continue your wellness journey
                    </p>
                    <button
                      onClick={() => router.push('/auth/login')}
                      className="bg-transparent text-white border-2 border-white/50 hover:border-white px-8 py-3 rounded-full font-semibold transition-all duration-200 flex items-center justify-center space-x-2 mx-auto shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)] transform hover:scale-105"
                    >
                      <User className="w-5 h-5" />
                      <span>Login</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-white mb-2">
                      New to Shroomtopia?
                    </h3>
                    <p className="text-gray-300 mb-6">
                      Create your account and start exploring
                    </p>
                    <button
                      onClick={() => router.push('/auth/register')}
                      className="bg-transparent text-white border-2 border-white/50 hover:border-white px-8 py-3 rounded-full font-semibold transition-all duration-200 flex items-center justify-center space-x-2 mx-auto shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)] transform hover:scale-105"
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