'use client';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/router';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const { isLoggedIn, user } = useUser();
  const { darkMode, toggleDarkMode } = useApp();
  const router = useRouter();
  const [shopSettings, setShopSettings] = useState(null);
  const [todayTiming, setTodayTiming] = useState(null);
  const [showAllHours, setShowAllHours] = useState(false);
  // Simple state to track section visibility - null means loading
  const [sections, setSections] = useState(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  };

  // Load homepage settings from the backend
  const loadHomepageSettings = async () => {
    console.log('🔄 Loading homepage settings...');
    try {
      const response = await fetch('https://api.mypsyguide.io/api/homepage-settings', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        cache: 'no-store'
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ API Response:', result);
        
        if (result.success && result.data) {
          const newSections = {
            rewards: result.data.rewardsSectionVisible ?? false,
            feedback: result.data.feedbackSectionVisible ?? false
          };
          console.log('🎯 Setting sections to:', newSections);
          setSections(newSections);
        } else {
          console.warn('⚠️ Unexpected API response format');
          setSections({
            rewards: false,
            feedback: false
          });
        }
      } else {
        console.error('❌ API failed with status:', response.status);
        setSections({
          rewards: false,
          feedback: false
        });
      }
    } catch (error) {
      console.error('❌ Error loading homepage settings:', error);
      setSections({
        rewards: false,
        feedback: false
      });
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load shop settings
        try {
          const shopResponse = await fetch(`https://api.mypsyguide.io/api/shop-settings`, {
            headers: getAuthHeaders(),
            cache: 'no-store'
          });
          
          if (shopResponse.ok) {
            const shopData = await shopResponse.json();
            if (shopData.success) {
              setShopSettings(shopData.data);
              // Get today's timing
              const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
              const today = days[new Date().getDay()];
              if (shopData.data.timings) {
                const timing = shopData.data.timings.find(t => t.day && t.day.toLowerCase() === today);
                if (timing) {
                  setTodayTiming(timing);
                }
              }
            }
          }
        } catch (shopErr) {
          console.error('Error loading shop settings:', shopErr);
        }
        
        // Load homepage settings - single call only
        await loadHomepageSettings();
      } catch (err) {
        console.error('Error in loadInitialData:', err);
      }
    };
    
    loadInitialData();
  }, []);

  // Removed duplicate polling - settings are loaded once on mount

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Shroomtopia - Your Wellness Journey',
      text: 'Check out this amazing wellness platform!',
      url: 'https://main.d2hdxwwdjspab.amplifyapp.com/'
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback to copying to clipboard if sharing fails
      try {
        await navigator.clipboard.writeText(shareData.url);
        alert('Link copied to clipboard!');
      } catch (clipboardErr) {
        console.error('Error copying to clipboard:', clipboardErr);
        alert('Could not share the link. Please copy it manually: ' + shareData.url);
      }
    }
  };

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Debug: Log sections state whenever it changes
  useEffect(() => {
    console.log('🔍 Sections state updated:', sections);
  }, [sections]);

  return (
    <div className="min-h-screen bg-white">
    
     {/* Debug Info - Remove in production */}
     {/* <div style={{ position: 'fixed', top: 10, right: 10, background: 'black', color: 'white', padding: '10px', zIndex: 9999, fontSize: '12px', borderRadius: '5px' }}>
       <div>Rewards: {sections?.rewards ? '✅ VISIBLE' : '❌ HIDDEN'}</div>
       <div>Feedback: {sections?.feedback ? '✅ VISIBLE' : '❌ HIDDEN'}</div>
       <div>State: {sections === null ? '⏳ Loading...' : '✓ Loaded'}</div>
       <button 
         onClick={() => loadHomepageSettings()} 
         style={{ marginTop: '10px', padding: '5px 10px', background: '#4CAF50', border: 'none', borderRadius: '3px', cursor: 'pointer', color: 'white', fontSize: '11px' }}
       >
         🔄 Reload Settings
       </button>
     </div> */}
      
 {/* Hero Section */}
<section className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-800">
  {/* Background Image - Blue Mushrooms */}
  <div className="absolute inset-0 z-0">
    <Image 
      src="/images/mush3.jpg"
      alt="Glowing blue mushrooms"
      className="w-full h-full object-cover opacity-60"
      fill
      priority={true}
      sizes="100vw"
    />
    {/* Dark gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent"></div>
  </div>
  
  {/* Hero Content - Left Aligned */}
  <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
    <div className={`max-w-xl transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 leading-tight tracking-tight">
        ELEVATE YOUR<br />
        WELLNESS<br />
        NATURALLY
      </h1>
      <p className="text-base md:text-lg lg:text-xl text-gray-300 mb-10 font-light leading-relaxed">
        Discover the power of therapeutic<br />
        mushrooms today!
      </p>
      <button 
        onClick={() => {
          if (isLoggedIn) {
            router.push('/menu');
          } else {
            router.push('/auth/login');
          }
        }}
        className="bg-white hover:bg-gray-100 text-black px-10 py-4 rounded-full text-base md:text-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-block uppercase tracking-wider"
      >
        MENU
      </button>
    </div>
  </div>

  {/* Decorative mushroom image on right - visible on larger screens */}
  {/* <div className="absolute right-0 top-0 bottom-0 w-1/2 hidden lg:block pointer-events-none">
    <div className="relative w-full h-full">
      <Image 
        src="/images/mush.webp"
        alt="Blue mushrooms decoration"
        className="object-contain object-right opacity-80"
        fill
        priority={true}
        sizes="50vw"
      />
    </div>
  </div> */}
</section>

     {/* Content Section */}
<section className="py-16 px-4 bg-white">
  <div className="max-w-5xl mx-auto">
    {/* Discover Shroomtopia Header */}
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-500 tracking-[0.1em] uppercase">
        DISCOVER SHROOMTOPIA
      </h2>
    </div>

    {/* Mission Card with Background Image */}
    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/mush5.jpg"
          alt="Mushroom preparation background"
          className="w-full h-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        {/* Light overlay for better text visibility */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Mission Content */}
      <div className="relative z-10 py-20 md:py-24 lg:py-28 px-8 md:px-16 lg:px-24 text-center">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 tracking-wide uppercase">
          OUR MISSION
        </h3>
        <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
          At SHROOMTOPIA, we are dedicated to enhancing your wellness journey through the power of therapeutic mushrooms. We believe in blending nature&apos;s gifts with modern lifestyles to promote creativity, relaxation, and enjoyment.
        </p>
         <button  onClick={() => router.push('/resourcecenter')} className="bg-gray-900 mt-8 border-white border mx-auto hover:bg-gray-800 text-white px-6 py-3 rounded-4xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
        <span>Access The Resource Center</span>
        <ChevronRight className="w-5 h-5" />
      </button>
      </div>
      
    </div>
  </div>
</section>

    
      

     
    <section className="py-20 px-4 ">
      
        <div className="max-w-7xl mx-auto ">
          
       <div className="relative    ">
  {/* Center Background Image */}
  {/* <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
    <div className="w-screen h-[350px] bg-[url('/images/over.png')] bg-no-repeat bg-center bg-cover -mx-36"></div>
  </div> */}

  {/* Main Grid Content */}
  {/* <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
    
 
    <div>
      <h2 className="text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6 leading-tight">
       Discover Resources to Elevate 
<br />
        Your Wellness
      </h2>
      <p className="text-lg text-[#2E2E2E] mb-8 leading-relaxed">
       Delve into audio, guides, videos, and more <br /> curated to inspire learning, growth, and vitality..
      </p>
     
    </div>

    
<div className="flex justify-center lg:justify-end">
  <div className="overflow-hidden w-full max-w-[450px] h-[300px] sm:h-[400px] lg:h-[550px]">
    <Image 
      src="/images/ii3.png"
      alt="Happy couple embracing"
      className="w-full h-full object-contain"
      width={1200}
      height={1500}
    />
  </div>
</div>



  </div> */}
</div>


          {/* Second Row */}
          <div className="grid relative lg:grid-cols-2 gap-12 items-center ">
              {/* <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
    <div className="w-full h-full bg-[url('/images/over.png')] bg-no-repeat bg-center bg-contain"></div>
  </div> */}
            {/* Left Image - Rounded Rectangle */}
            <div className="order-2  lg:order-1">
              
              <div className="relative">
                
                <Image 
                  src="/images/ii4.png"
                  alt="Wellness products and tools"
                  className="w-full object-cover transform transition-all duration-500 hover:scale-105"
                  width={600}
                  height={400}
                />
              </div>
                     
            </div>
   

            {/* Right Content */}
            <div className="order-1  lg:order-2">
                          
              <div
                className=" rounded-4xl p-8 lg:p-10 relative"
                style={{
                 
                }}
              >
                
                {/* Badge */}
                {/* <div className="absolute -top-10 -right-1">
                <Image src='/images/offer.png' alt="Special offer badge" width={150} height={150} />
                </div> */}
                
                <div className="mb-4">
                  {/* <span className="text-sm text-gray-600 font-medium">Elevate Your Membership</span> */}
                </div>
                
                <h3 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                 The Topia 
<br />
                Circle  
                </h3>
                
                <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                 Step into a world of wellness, where exclusive rewards,  <br />
                 personalized benefits, and a community of growth await.
                </p>
                
                <button   onClick={() => router.push('/commingsoon')} className="bg-[#2E2E2E] hover:bg-[#2E2E2E] text-white px-8 py-4 rounded-4xl font-semibold transition-all duration-300 transform hover:scale-105">
                  Coming Soon 
                </button>
              </div>
            </div>
          </div>

          {/* Third Row - Rewards Section */}
          {sections?.rewards && (
          <div className="grid relative lg:grid-cols-2 gap-12  items-center">
              <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
   <div className="w-screen h-[350px] bg-[url('/images/over.png')] bg-no-repeat bg-center bg-cover -mx-36"></div>
  </div>
            {/* Left Content */}
            <div className='relative'>
              <div className="mb-4">
                <span className="text-sm text-gray-600 font-medium">Earn $15 For Each Stamp and Save up to $135 </span>
              </div>
              
              <h3 className="text-3xl lg:text-4xl relative font-extrabold text-gray-900 mb-6">
                Earn And Track Rewards<br />
                As You Grow
              </h3>
              
              <p className="text-gray-600 relative text-lg mb-8 leading-relaxed">
                Collect points through engagement, participation,<br />
                sharing content, or contributing to our community.<br />
                Track your rewards and redeem points.
              </p>
              
             <button
  onClick={() => router.push('/rewards')}
  className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-4xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
>
  <span>Get Rewards</span>
  <ChevronRight className="w-5 h-5" />
</button>
            </div>

            {/* Right Image - Rewards Grid */}
            <div className="flex justify-center relative lg:justify-end">
             <Image src='/images/star.png' alt="Rewards star graphic"  width={400} height={400} />
            </div>
          </div>
          )}
        </div>
      </section>

       <section className="py-20 px-4 ">
        <div className="max-w-7xl mx-auto">
          {/* Fourth Row - Feedback Section */}
          {sections?.feedback && (
          <div
  className="rounded-3xl p-12 mb-16 border-[#8EAFF6] border-1 relative overflow-hidden"
  style={{
                  background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 10%, #8CABFF 100%)',
                }}
>
  {/* Decorative Chat Bubbles */}
  <Image src='/images/feed.png' alt="Feedback decoration" className="absolute top-4 left-10 w-32 h-40 opacity-50" width={128} height={160} />
            {/* <div className="absolute top-12 right-12 w-10 h-6 bg-blue-300 rounded-lg opacity-40"></div> */}
            <Image src='/images/feed.png' alt="Feedback decoration" style={{ transform: 'scaleX(-1)' }} className="absolute bottom-12 left-32 w-20 h-20 rounded-lg opacity-50" width={80} height={80} />
            <Image src='/images/feed.png' alt="Feedback decoration" className="absolute bottom-8 right-8 w-32 h-40 opacity-60" width={128} height={160} />
            <Image src='/images/feed.png' alt="Feedback decoration" className="absolute top-6 right-14 w-20 h-20 rounded opacity-30" style={{ transform: 'scaleX(-1)' }} width={80} height={80} />
            <div className="absolute bottom-20 left-32 w-10 h-6  rounded-lg opacity-40"></div>
            
            <div className="text-center relative z-10">
              <h2  className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Your Feedback Helps Us Cater To Your Journey
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Tell us about your experience with the products you&apos;ve tried.<br />
                Your insights help others make better choices—and you&apos;ll earn rewards for every shared experience.
              </p>
              <button onClick={() => router.push('/myhistory')} className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto">
                <span>Share Your Product Experience</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          )}

          {/* Community Story Section */}
          {/* <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Inspire The Community With Your Story
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Your journey matters. Share how mushrooms and wellness products have transformed your life, and<br />
              inspire others to explore their own path. Earn rewards for contributing to our shared journey.
            </p>
            <button 
              onClick={handleShare}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
            >
              <span>Share Your Wellness Journey</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div> */}

 {/* Contact Us Section - Break out of parent container */}
<section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-20 bg-gray-50">
  <div className="grid lg:grid-cols-2 gap-0">
    {/* Left Content */}
    <div className="px-4 md:px-8 lg:px-16 xl:px-24 flex items-center justify-end">
      <div className="max-w-xl w-full">
        <h2 className="text-5xl lg:text-6xl font-bold text-gray-800 tracking-wider mb-12 uppercase">
          CONTACT US
        </h2>
        
        <div className="space-y-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Better yet, see us in person!
            </h3>
            <p className="text-gray-600 text-lg leading-relaxed">
              We love our customers, so feel free to visit during normal business hours.
            </p>
          </div>

          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-6">
              SHROOMTOPIA
            </h4>
            
            <div className="space-y-4 text-gray-700">
              <p className="text-lg">
                8201 8 Mile Road, Detroit, MI, USA
              </p>
              
              {shopSettings?.phone && (
                <p className="text-lg">
                  +{shopSettings.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-2xl font-bold text-gray-900 mb-4">
              Hours
            </h4>
            {todayTiming ? (
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-lg">
                  {todayTiming.isOpen ? 'Open today' : 'Closed today'}
                </span>
                {todayTiming.isOpen && (
                  <span className="text-lg font-semibold">
                    {formatTime(todayTiming.openingTime)} - {formatTime(todayTiming.closingTime)}
                  </span>
                )}
                <svg
                  onClick={() => setShowAllHours(v => !v)}
                  className={`w-5 h-5 text-gray-500 cursor-pointer transition-transform ${showAllHours ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-700">
                <span className="text-lg">Loading hours...</span>
              </div>
            )}

            {showAllHours && shopSettings?.timings && (
              <div className="mt-3 pl-0">
                {(() => {
                  const orderedDays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
                  const byDay = {};
                  shopSettings.timings.forEach(t => { byDay[t.day?.toLowerCase?.()] = t; });
                  return (
                    <div className="space-y-2">
                      {orderedDays.map(d => {
                        const t = byDay[d];
                        const label = d.charAt(0).toUpperCase() + d.slice(1);
                        return (
                          <div key={d} className="flex items-center justify-between text-gray-700">
                            <span className="text-sm">{label}</span>
                            {t ? (
                              t.isOpen ? (
                                <span className="text-sm font-semibold">
                                  {formatTime(t.openingTime)} - {formatTime(t.closingTime)}
                                </span>
                              ) : (
                                <span className="text-sm font-semibold">Closed</span>
                              )
                            ) : (
                              <span className="text-sm font-semibold">—</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

    {/* Right Map - 2px gap from right edge */}
    <div className="relative h-[600px] lg:h-[700px] w-full pr-[20px]">
      {/* Get Directions Button */}
      <button
        onClick={() => window.open('https://www.google.com/maps/dir//8201+8+Mile+Rd,+Detroit,+MI+48234,+USA/@42.4455298,-83.1537416,17z', '_blank')}
        className="absolute top-4 left-4 z-20 bg-white hover:bg-gray-50 text-gray-900 px-6 py-3 rounded-lg font-semibold shadow-xl transition-all duration-300 flex items-center space-x-2 border border-gray-200"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <span>GET DIRECTIONS</span>
      </button>

      {/* Zoom Controls with Google Maps links */}
      <div className="absolute top-4 right-6 z-20 flex flex-col space-y-2">
        <button
          onClick={() => window.open('https://www.google.com/maps/@42.4455298,-83.1537416,18z', '_blank')}
          className="bg-white hover:bg-gray-100 text-gray-900 w-10 h-10 rounded-lg shadow-xl transition-all duration-300 flex items-center justify-center border border-gray-200"
          title="Zoom In"
        >
          <span className="text-2xl font-bold leading-none">+</span>
        </button>
        <button
          onClick={() => window.open('https://www.google.com/maps/@42.4455298,-83.1537416,16z', '_blank')}
          className="bg-white hover:bg-gray-100 text-gray-900 w-10 h-10 rounded-lg shadow-xl transition-all duration-300 flex items-center justify-center border border-gray-200"
          title="Zoom Out"
        >
          <span className="text-2xl font-bold leading-none">−</span>
        </button>
      </div>

      {/* Interactive Map */}
      <iframe
        id="map-iframe"
        src="https://www.openstreetmap.org/export/embed.html?bbox=-83.1587416%2C42.4405298%2C-83.1487416%2C42.4505298&layer=mapnik&marker=42.4455298%2C-83.1537416"
        className="w-full h-full"
        style={{ border: 0, display: 'block', margin: 0, padding: 0 }}
        allowFullScreen
        loading="lazy"
        title="ShroomTopia Location Map"
      />
      
      {/* Map Info Footer */}
      <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-sm text-gray-600 bg-white/90 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
        Use mouse wheel or pinch to zoom • Drag to pan
      </p>
    </div>
  </div>
</section>

{/* 
<section className="py-20 px-4 bg-white">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
      Inspire The Community With Your Story
    </h2>
    <p className="text-gray-600 text-lg mb-8 leading-relaxed">
      Your journey matters. Share how mushrooms and wellness products have transformed your life, and<br />
      inspire others to explore their own path. Earn rewards for contributing to our shared journey.
    </p>
    <button 
      onClick={handleShare}
      className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
    >
      <span>Share Your Wellness Journey</span>
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
</section> */}


        </div>
      </section>

     

    </div>
  );
}