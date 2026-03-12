import React, { useState, useEffect } from 'react';

const VERIFICATION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export default function AgeVerification({ children }) {
  const [isVerified, setIsVerified] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const checkVerification = () => {
      try {
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
      } catch (e) {
        console.log('Storage not available, using session-only verification');
      }
      
      return false;
    };
    
    const shouldVerify = checkVerification();
    setIsVerified(shouldVerify);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleYes = () => {
    const now = Date.now();
    try {
      sessionStorage.setItem('ageVerified', 'true');
      sessionStorage.setItem('ageVerifiedTimestamp', now.toString());
    } catch (e) {
      console.log('Storage not available');
    }
    setIsVerified(true);
    setShowError(false);
  };

  const handleNo = () => {
    setShowError(true);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="relative">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-white border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
        </div>
      </div>
    );
  }

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: 'transparent' }}>
      {/* Animated Background */}
      <div className="absolute inset-0" style={{ background: 'transparent' }}>
        {/* Gradient Orbs */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl transition-transform duration-1000 ease-out"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
            left: `${mousePosition.x - 20}%`,
            top: `${mousePosition.y - 20}%`,
            transform: 'translate(-50%, -50%)'
          }}
        />

      
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8 md:py-20 lg:py-28">
        <div className="max-w-4xl w-full relative">
          
          {/* Logo Image - Behind and Above Box */}
          <div className="absolute -top-[122px] md:-top-[154px] lg:-top-[186px] left-1/2 transform -translate-x-1/2 z-0">
            <img 
              src="/agelogo.png" 
              alt="Logo" 
              className="w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 object-contain"
            />
          </div>

          {/* Question Card with Background Image */}
          <div 
            className="relative p-8 md:p-12 mb-8 transform hover:scale-[1.02] transition-all duration-300 overflow-hidden min-h-[420px] md:min-h-[400px] z-10"
           
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 z-0 bg-contain md:bg-contain bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url(/bgage.png)',
                backgroundSize: '100% 105%'
              }}
            >
              <style jsx>{`
                @media (min-width: 768px) {
                  div {
                    background-size: contain !important;
                  }
                }
              `}</style>
            </div>
            
            {/* Content Overlay */}
            <div className="relative z-10 flex flex-col items-center justify-center">
              {/* Main Heading */}
              <h1 className="text-2xl md:text-3xl lg:text-4xl text-white font-bold text-center mb-4 uppercase tracking-wide" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
                ENTER SHROOMTOPIA
              </h1>
              
              {/* Subheading */}
              <p className="text-lg md:text-xl text-white font-medium text-center mb-3 leading-relaxed" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
                You must be 21 or older to explore<br />
                Shroom Topia Detroit
              </p>
              
              {/* Confirmation Text */}
              <p className="text-sm md:text-base text-gray-300 text-center mb-8" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                By entering this site you confirm you are<br />
                21 years of age or older.
              </p>

              {/* Buttons */}
              <div className="flex flex-col gap-4 justify-center w-full max-w-[280px]">
                <button
                  onClick={handleYes}
                  className="group relative w-full px-8 py-3 text-white text-base md:text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wider"
                  style={{
                    background: 'transparent',
                    border: '1px solid #86D1F8',
                    boxShadow: '0 0 10px rgba(134, 209, 248, 0.3)'
                  }}
                >
                  YES - I AM 21+
                </button>
                
                <button
                  onClick={handleNo}
                  className="group relative w-full px-8 py-3 text-white text-base md:text-lg font-bold rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 uppercase tracking-wider"
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.5)',
                    boxShadow: 'none'
                  }}
                >
                  No - I AM UNDER 21
                </button>
              </div>
            </div>

            {/* Error Message - Positioned Absolutely */}
            {showError && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-full max-w-md px-4 z-20">
                <div className="backdrop-blur-sm text-white px-6 py-4 rounded-2xl shadow-2xl animate-bounce" style={{ background: 'rgba(134, 209, 248, 0.2)', border: '1px solid #86D1F8' }}>
                  <p className="text-sm md:text-base font-bold tracking-wide text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    ⚠️ You are not old enough to view this content
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Text Section */}
          <div className="text-center mt-8">
            <h2 className="text-2xl md:text-3xl text-white font-bold mb-2" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.5)' }}>
              Shroom Topia Detroit
            </h2>
            <p className="text-base md:text-lg text-gray-300" style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.5)' }}>
              Portal to Detroits Largest Mushroom Selection
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(10px, -10px) rotate(5deg); }
          50% { transform: translate(-5px, -20px) rotate(-5deg); }
          75% { transform: translate(-10px, -10px) rotate(3deg); }
        }

        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(100px, 100px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }

        @keyframes textFloat {
          0%, 100% { transform: translateY(0) rotate(-1deg); }
          50% { transform: translateY(-10px) rotate(-2deg); }
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}