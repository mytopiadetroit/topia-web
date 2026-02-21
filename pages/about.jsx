import React from 'react';

export default function ShroomtopiaAbout() {
  return (
    <div className="relative min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}>
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

      {/*  Background overlay image only at center */}
      <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none opacity-10">
        <div className="w-full h-full bg-[url('/images/over.png')] bg-no-repeat bg-center bg-contain"></div>
      </div>

      {/*  Main content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Image Section */}
          <div className="flex justify-center lg:justify-start relative">
            <img
              src="/images/about2.png"
              alt="Hands holding fresh mushrooms"
              className="w-60 h-60 sm:w-96 mt-[300px] sm:h-60 lg:w-[350px] lg:h-[350px]"
            />
            <div className="relative">
              <img
                src="/images/about.png"
                alt="Hands holding fresh mushrooms"
                className="w-80 h-70 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px]"
              />
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8">
              About Us
            </h1>

            <div className="space-y-6 text-gray-300 text-base sm:text-sm lg:text-sm leading-relaxed">
              <p>
                Welcome to <span className="font-semibold text-white">Shroomtopia</span> — your trusted source for premium medicinal 
                mushrooms that nourish the mind, body, and spirit.
              </p>
              <p>
               Founded on the belief that nature holds the key to true wellness, Shroomtopia is dedicated to bringing you the highest quality mushroom-based supplements. Whether you're seeking enhanced focus, immune support, stress relief, or natural energy, our carefully curated selection of mushrooms like Lion’s Mane, Reishi, Chaga, and Cordyceps are here to help you thrive.
Our products are crafted with care—sustainably grown, rigorously tested, and thoughtfully processed to preserve their full therapeutic potential. No fillers, no shortcuts—just powerful fungi backed by tradition and science.
At Shroomtopia, we don’t just sell mushrooms. We’re building a community centered around holistic health, mindful living, and the incredible potential of fungi.
              </p>
              <p>
                At Shroomtopia, we don't just sell mushrooms. We're building a community 
                centered around holistic health, mindful living, and the incredible potential of 
                fungi.
              </p>
              <p className="font-medium text-white">
                Welcome to the world of mushrooms. Welcome to Shroomtopia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
