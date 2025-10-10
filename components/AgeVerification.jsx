import React, { useState, useEffect } from 'react';

const VERIFICATION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export default function AgeVerification({ children }) {
  const [isVerified, setIsVerified] = useState(false);
  const [showError, setShowError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {

    const checkVerification = () => {
    
      const sessionVerified = sessionStorage.getItem('ageVerified') === 'true';
      const sessionTimestamp = sessionStorage.getItem('ageVerifiedTimestamp');
      
      if (sessionVerified && sessionTimestamp) {
        const timeSinceSessionVerification = Date.now() - parseInt(sessionTimestamp, 10);
        if (timeSinceSessionVerification < VERIFICATION_DURATION) {
          return true;
        }
      }
      
      
      const localVerified = localStorage.getItem('ageVerified') === 'true';
      const localTimestamp = localStorage.getItem('ageVerifiedTimestamp');
      
      if (localVerified && localTimestamp) {
        const timeSinceLocalVerification = Date.now() - parseInt(localTimestamp, 10);
        if (timeSinceLocalVerification < VERIFICATION_DURATION) {
          return true;
        }
      }
      
      return false;
    };
    
    const shouldVerify = checkVerification();
    setIsVerified(shouldVerify);
    setIsLoading(false);
  }, []);

  const handleYes = () => {
    const now = Date.now();
    if (rememberMe) {
      localStorage.setItem('ageVerified', 'true');
      localStorage.setItem('ageVerifiedTimestamp', now.toString());
    } else {
      // Only set session storage if not remembering
      sessionStorage.setItem('ageVerified', 'true');
      sessionStorage.setItem('ageVerifiedTimestamp', now.toString());
    }
    setIsVerified(true);
    setShowError(false);
  };

  const handleNo = () => {
    setShowError(true);
  };

  // Show nothing while checking localStorage
  if (isLoading) {
    return null;
  }

  // If verified, show the actual website content
  if (isVerified) {
    return <>{children}</>;
  }

  // Show age verification screen
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-transparent to-purple-900/50"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 35px,
              rgba(128, 166, 247, 0.1) 35px,
              rgba(128, 166, 247, 0.1) 70px
            )`
          }}
        ></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl w-full">
        {/* Logo Text */}
        <div className="mb-12 relative flex justify-center">
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white transform -rotate-2 relative" style={{ letterSpacing: '-0.02em' }}>
            <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-purple-600 blur-sm">
              SHROOMTOPIA
            </span>
            <span className="relative" style={{ 
              textShadow: '4px 4px 0 #80A6F7, 8px 8px 0 rgba(128, 166, 247, 0.5)',
              WebkitTextStroke: '3px white'
            }}>
              SHROOMTOPIA
            </span>
          </div>
          
          {/* Decorative mushroom shapes */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-purple-500 rounded-full opacity-50 blur-xl"></div>
          <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-blue-500 rounded-full opacity-50 blur-xl"></div>
        </div>

        {/* Question */}
        <p className="text-2xl md:text-3xl text-white mb-8 font-semibold tracking-wide">
          Are you over 21 years of age or otherwise a qualified patient?
        </p>

        {/* Buttons */}
        <div className="flex gap-6 justify-center mb-6">
          <button
            onClick={handleNo}
            className="px-12 py-4 bg-black text-white text-xl font-bold rounded-full border-4 border-white hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl uppercase tracking-wider"
          >
            NO
          </button>
          <button
            onClick={handleYes}
            className="px-12 py-4 text-xl font-bold rounded-full border-4 border-white hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl uppercase tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #80A6F7 0%, #6B8FE8 100%)',
              color: 'white'
            }}
          >
            YES
          </button>
        </div>

        {/* Remember Me Checkbox */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-5 h-5 rounded border-2 border-white cursor-pointer accent-purple-600"
          />
          <label htmlFor="remember" className="text-white text-lg cursor-pointer select-none">
            Remember me
          </label>
        </div>

        {/* Error Message */}
        {showError && (
          <div className="mb-6 animate-pulse">
            <p className="text-red-500 text-xl font-bold tracking-wide">
              You are not old enough to view this content
            </p>
          </div>
        )}

        {/* Terms and Privacy */}
        <p className="text-sm text-gray-300">
          By entering our site, you agree to our{' '}
          <a href="/terms" className="underline hover:text-white transition-colors">
            Terms & Conditions
          </a>
          {' '}and{' '}
          <a href="/privacypolicy" className="underline hover:text-white transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Decorative Elements */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none"></div>
    </div>
  );
}