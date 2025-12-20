import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { X } from 'lucide-react';
import { fetchBannerDeal } from '../service/service';
import { useUser } from '../context/UserContext';

export default function DealBanner() {
  const router = useRouter();
  const { isLoggedIn } = useUser();
  const [deal, setDeal] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Only show banner on home and menu pages, not on crazy-deals
  const shouldShowBanner = router.pathname === '/' || router.pathname === '/menu';

  useEffect(() => {
    if (shouldShowBanner) {
      loadBannerDeal();
    }
  }, [shouldShowBanner]);

  useEffect(() => {
    if (!deal || dismissed || !shouldShowBanner) return;

    // Show banner immediately on page load
    setShowBanner(true);
    setTimeout(() => {
      setShowBanner(false);
    }, 10000);

    // Set interval to show banner again
    const interval = setInterval(() => {
      setShowBanner(true);
      
      setTimeout(() => {
        setShowBanner(false);
      }, 10000);
    }, (deal.bannerInterval || 30) * 1000);

    return () => clearInterval(interval);
  }, [deal, dismissed, shouldShowBanner]);

  // Reset dismissed state when route changes
  useEffect(() => {
    setDismissed(false);
  }, [router.pathname]);

  const loadBannerDeal = async () => {
    try {
      const result = await fetchBannerDeal();
      
      if (result.success && result.data) {
        setDeal(result.data);
      }
    } catch (error) {
      console.error('Error fetching banner deal:', error);
    }
  };

  const handleClick = () => {
    // Check if user is logged in
    if (!isLoggedIn) {
      setShowBanner(false);
      router.push('/auth/login');
      return;
    }
    
    setShowBanner(false);
    router.push('/crazy-deals');
  };

  const handleDismiss = (e) => {
    e.stopPropagation();
    setShowBanner(false);
    setDismissed(true);
  };

  // Don't show banner if not on allowed pages or if dismissed or no deal
  if (!deal || !showBanner || !shouldShowBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        onClick={handleClick}
        className="relative max-w-xl w-full mx-4 cursor-pointer transform transition-all duration-300 hover:scale-[1.02]"
      >
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute -top-3 -right-3 bg-white hover:bg-gray-100 text-gray-800 rounded-full p-2.5 shadow-xl z-10 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Banner Card with Gradient Border */}
        <div className="bg-gradient-to-br from-[#80A6F7] via-[#80A6F7] to-[#80A6F7] p-1 rounded-3xl shadow-2xl">
          <div className="bg-white rounded-3xl overflow-hidden">
            
            {/* Banner Image */}
            <div className="relative h-80 md:h-96">
              <Image
                src={deal.bannerImage}
                alt={deal.title}
                fill
                className="object-contain bg-gradient-to-br from-blue-200 to-blue-200"
              />
              
              {/* Dark Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

              {/* Simple Ribbon Badge - Top Right */}
              <div className="absolute top-0 right-8">
                <div className="relative">
                  {/* Ribbon */}
                  <div className="bg-gradient-to-br from-[#80A6F7] to-[#80A6F7] px-6 py-3 shadow-2xl">
                    <div className="text-center">
                      <div className="text-3xl font-black text-white leading-none">
                        {deal.discountPercentage}%
                      </div>
                      <div className="text-xs font-bold text-white uppercase tracking-wide">
                        OFF
                      </div>
                    </div>
                  </div>
                  {/* Ribbon Tail - Left */}
                  <div className="absolute -bottom-3 left-0 w-0 h-0 border-l-[24px] border-l-transparent border-t-[12px] border-t-[#80A6F7] border-r-[0px] border-r-transparent"></div>
                  {/* Ribbon Tail - Right */}
                  <div className="absolute -bottom-3 right-0 w-0 h-0 border-r-[24px] border-r-transparent border-t-[12px] border-t-[#80A6F7] border-l-[0px] border-l-transparent"></div>
                </div>
              </div>

              {/* Deal Title & Description */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-[#80A6F7] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    Limited Time
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                  {deal.title}
                </h2>
                {deal.description && (
                  <p className="text-white/95 text-sm md:text-base">
                    {deal.description}
                  </p>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <div className="p-5 bg-gradient-to-r from-orange-50 to-red-50">
              <button className="w-full bg-gradient-to-r from-[#80A6F7] to-[#80A6F7] hover:from-[#80A6F7] hover:to-[#80A6F7] text-white py-4 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl">
                🛍️ Shop Now & Save Big!
              </button>
              <p className="text-gray-600 text-xs text-center mt-3">
                Click anywhere to explore all deals • Offer valid while stocks last
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
