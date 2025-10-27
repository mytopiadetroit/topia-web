import React, { useState, useEffect } from 'react';

const VERIFICATION_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

export default function AgeVerification({ children }) {
  const [isVerified, setIsVerified] = useState(false);
  const [showError, setShowError] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    // Generate floating particles
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 60 + 20,
      duration: Math.random() * 10 + 15,
      delay: Math.random() * 5
    }));
    setParticles(newParticles);

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
      if (rememberMe) {
        localStorage.setItem('ageVerified', 'true');
        localStorage.setItem('ageVerifiedTimestamp', now.toString());
      } else {
        sessionStorage.setItem('ageVerified', 'true');
        sessionStorage.setItem('ageVerifiedTimestamp', now.toString());
      }
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
      <div className="fixed inset-0 bg-[#80A6F7] flex items-center justify-center">
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
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[#80A6F7]">
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
        
        {/* Floating Particles */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
              filter: 'blur(2px)'
            }}
          />
        ))}

        {/* Animated Grid */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px',
            animation: 'gridMove 20s linear infinite'
          }}
        />

        {/* Radial Gradient Overlay */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at center, transparent 0%, rgba(128, 166, 247, 0.3) 100%)'
          }}
        />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-2xl w-full">
          
          {/* Logo Section with 3D Effect */}
          <div className="mb-16 relative">
            <div className="flex justify-center mb-4">
              {/* Glow Effect Behind Logo */}
              <div className="absolute inset-0 flex justify-center items-center">
                <div 
                  className="w-[600px] h-[200px] rounded-full opacity-40 blur-3xl"
                  style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, transparent 70%)',
                    animation: 'pulse 3s ease-in-out infinite'
                  }}
                />
              </div>

              {/* Logo Text with 3D Shadow */}
              <div className="relative transform hover:scale-105 transition-transform duration-300">
                <div 
                  className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white transform -rotate-1 relative select-none"
                  style={{ 
                    letterSpacing: '-0.02em',
                    textShadow: `
                      2px 2px 0 rgba(128, 166, 247, 0.8),
                      4px 4px 0 rgba(128, 166, 247, 0.6),
                      6px 6px 0 rgba(128, 166, 247, 0.4),
                      8px 8px 0 rgba(128, 166, 247, 0.2),
                      10px 10px 20px rgba(0, 0, 0, 0.3)
                    `,
                    WebkitTextStroke: '2px white',
                    animation: 'textFloat 4s ease-in-out infinite'
                  }}
                >
                  SHROOMTOPIA
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -top-12 left-1/4 w-24 h-24 bg-white rounded-full opacity-20 blur-2xl animate-bounce" style={{ animationDuration: '3s' }}></div>
            <div className="absolute -bottom-8 right-1/4 w-32 h-32 bg-white rounded-full opacity-15 blur-2xl animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
          </div>

          {/* Question Card */}
          <div 
            className="bg-white/10 backdrop-blur-md rounded-3xl p-6 md:p-8 mb-8 border-2 border-white/20 shadow-2xl transform hover:scale-[1.02] transition-all duration-300"
            style={{
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 60px rgba(255, 255, 255, 0.1) inset'
            }}
          >
            <p className="text-xl md:text-2xl text-white font-bold text-center mb-8 leading-relaxed" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.3)' }}>
              Are you over 21 years of Age ?
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <button
                onClick={handleNo}
                className="group relative px-10 py-4 bg-gradient-to-br from-gray-900 to-black text-white text-lg md:text-xl font-black rounded-full border-4 border-white overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl uppercase tracking-wider transform hover:scale-110 active:scale-95"
                style={{
                  boxShadow: '0 10px 40px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.2)'
                }}
              >
                <span className="relative z-10">NO</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              
              <button
                onClick={handleYes}
                className="group relative px-10 py-4 text-lg md:text-xl font-black rounded-full border-4 border-white overflow-hidden transition-all duration-300 shadow-xl hover:shadow-2xl uppercase tracking-wider transform hover:scale-110 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #80A6F7 0%, #6B8FE8 50%, #80A6F7 100%)',
                  backgroundSize: '200% 100%',
                  color: 'white',
                  boxShadow: '0 10px 40px rgba(128, 166, 247, 0.5), 0 0 30px rgba(255,255,255,0.3)',
                  animation: 'shimmer 3s ease-in-out infinite'
                }}
              >
                <span className="relative z-10" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>YES</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </button>
            </div>

            {/* Remember Me - Enhanced */}
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-6 h-6 rounded-md border-3 border-white cursor-pointer appearance-none checked:bg-[#80A6F7] transition-all duration-300 shadow-lg"
                  style={{
                    boxShadow: rememberMe ? '0 0 20px rgba(128, 166, 247, 0.6)' : '0 4px 6px rgba(0,0,0,0.2)'
                  }}
                />
                {rememberMe && (
                  <svg className="absolute inset-0 w-6 h-6 text-white pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <label htmlFor="remember" className="text-white text-base md:text-lg font-semibold cursor-pointer select-none hover:text-white/80 transition-colors" style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.3)' }}>
                Remember me
              </label>
            </div>

            {/* Error Message - Enhanced */}
            {showError && (
              <div className="mb-4 transform animate-bounce">
                <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-4 rounded-2xl border-2 border-red-300 shadow-2xl">
                  <p className="text-lg md:text-xl font-black tracking-wide text-center" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    ⚠️ You are not old enough to view this content
                  </p>
                </div>
              </div>
            )}

            {/* Terms - Enhanced */}
            <div className="text-center">
              <p className="text-xs md:text-sm text-white/90 leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                By entering our site, you agree to our{' '}
                <a href="/terms" className="underline font-semibold hover:text-white transition-colors hover:scale-105 inline-block">
                  Terms & Conditions
                </a>
                {' '}and{' '}
                <a href="/privacypolicy" className="underline font-semibold hover:text-white transition-colors hover:scale-105 inline-block">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
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