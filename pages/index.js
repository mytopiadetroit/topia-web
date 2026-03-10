'use client';
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useRouter } from 'next/router';
import { Api } from '../service/service';

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
  const [homepageImages, setHomepageImages] = useState({
    hero: '/images/mush3.jpg',
    mission: '/images/mush5.jpg',
    resource: '/images/ii4.png',
    circle: '/images/ii4.png'
  });
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Load user profile to check subscription status
  const loadUserProfile = async () => {
    if (!isLoggedIn) {
      setProfileLoading(false);
      return;
    }

    try {
      const data = await Api('get', 'auth/profile', null, router);
      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  // Load homepage settings from the backend
  const loadHomepageSettings = async () => {
    console.log('🔄 Loading homepage settings...');
    try {
      const response = await Api('get', 'homepage-settings', null, router);
      console.log('✅ API Response:', response);
      
      if (response.success && response.data) {
        const newSections = {
          rewards: response.data.rewardsSectionVisible ?? false,
          feedback: response.data.feedbackSectionVisible ?? false
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
        // Load user profile first
        await loadUserProfile();
        
        // Load shop settings
        try {
          const shopData = await Api('get', 'shop-settings', null, router);
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
        } catch (shopErr) {
          console.error('Error loading shop settings:', shopErr);
        }
        
        // Load homepage settings - single call only
        await loadHomepageSettings();
        
        // Load homepage images
        try {
          const imagesData = await Api('get', 'homepage-images', null, router);
          if (imagesData.success && imagesData.data) {
            const newImages = { ...homepageImages };
            
            // Direct mapping from API response
            if (imagesData.data.hero) {
              newImages.hero = imagesData.data.hero.startsWith('http') 
                ? imagesData.data.hero 
                : `http://localhost:5000${imagesData.data.hero}`;
            }
            if (imagesData.data.mission) {
              newImages.mission = imagesData.data.mission.startsWith('http') 
                ? imagesData.data.mission 
                : `http://localhost:5000${imagesData.data.mission}`;
            }
            if (imagesData.data.resource) {
              newImages.resource = imagesData.data.resource.startsWith('http') 
                ? imagesData.data.resource 
                : `http://localhost:5000${imagesData.data.resource}`;
            }
            if (imagesData.data.circle) {
              newImages.circle = imagesData.data.circle.startsWith('http') 
                ? imagesData.data.circle 
                : `http://localhost:5000${imagesData.data.circle}`;
            }
            
            setHomepageImages(newImages);
          }
        } catch (imgErr) {
          console.error('Error loading homepage images:', imgErr);
        }
      } catch (err) {
        console.error('Error in loadInitialData:', err);
      }
    };
    
    loadInitialData();
  }, [isLoggedIn]); 

  

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
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: 'transparent' }}>
      {/* Global Background Image - Applied via body in globals.css */}
    
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
<section 
  className="relative min-h-[600px] flex items-center justify-center overflow-hidden py-20"
  style={{
    background: 'transparent'
  }}
>
  {/* Cosmic Glow Effect - Right Side */}
  <div 
    className="absolute right-0 top-1/4 w-1/2 h-1/2 opacity-20 blur-3xl pointer-events-none"
    style={{
      background: 'radial-gradient(circle, rgba(47,128,255,0.3) 0%, transparent 70%)'
    }}
  />
  
  {/* Hero Content - Left Aligned */}
  <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16">
    <div className={`max-w-2xl transform transition-all duration-1000 ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
    }`}>
      <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
        ELEVATED<br />
        EXPERIENCES.
      </h1>
      <p className="text-base md:text-lg lg:text-xl text-gray-400 mb-10 font-light leading-relaxed">
        Portal to the largest mushroom selection in<br />
        the Metro Detroit area..
      </p>
      
      {/* Buttons Container */}
      <div className="flex flex-wrap gap-4">
        {/* Primary Button */}
        <button 
          onClick={() => {
            if (isLoggedIn) {
              router.push('/menu');
            } else {
              router.push('/auth/login');
            }
          }}
          className="bg-white hover:bg-gray-50 text-black px-8 py-4 rounded-full text-sm md:text-base font-semibold transition-all duration-300 transform hover:scale-105 uppercase tracking-wider hover:shadow-[0_8px_30px_rgba(77,163,255,0.8)]"
        >
          EXPLORE THE MENU
        </button>
        
        {/* Secondary Button */}
        <button 
          onClick={() => router.push('/resourcecenter')}
          className="bg-transparent text-white border-2 border-white/30 hover:border-white/50 px-8 py-4 rounded-full text-sm md:text-base font-semibold transition-all duration-300 transform hover:scale-105 uppercase tracking-wider hover:shadow-[0_8px_30px_rgba(77,163,255,0.8)]"
        >
          LEARN YOUR DOSAGE
        </button>
      </div>
    </div>
  </div>
</section>

     {/* Content Section - DISCOVER SHROOMTOPIA - COMMENTED OUT */}
     {/*
<section className="py-16 px-4" style={{ background: 'transparent' }}>
  <div className="max-w-5xl mx-auto">
    {/* Discover Shroomtopia Header *-/}
    <div className="text-center mb-16">
      <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white tracking-[0.1em] uppercase">
        DISCOVER SHROOMTOPIA
      </h2>
    </div>

    {/* Mission Card with Background Image *-/}
    <div className="relative rounded-3xl overflow-hidden shadow-2xl">
      {/* Background Image *-/}
      <div className="absolute inset-0 z-0">
        <Image 
          src={homepageImages.mission}
          alt="Mushroom preparation background"
          className="w-full h-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, 1200px"
        />
        {/* Light overlay for better text visibility *-/}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Mission Content *-/}
      <div className="relative z-10 py-20 md:py-24 lg:py-28 px-8 md:px-16 lg:px-24 text-center">
        <h3 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-8 tracking-wide uppercase">
          OUR MISSION
        </h3>
        <p className="text-white text-base md:text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto">
          At SHROOMTOPIA, we are dedicated to enhancing your wellness journey through the power of therapeutic mushrooms. We believe in blending nature&apos;s gifts with modern lifestyles to promote creativity, relaxation, and enjoyment.
        </p>
         <button  onClick={() => router.push('/resourcecenter')} className="bg-white hover:bg-gray-50 text-black px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 transform hover:scale-105 uppercase tracking-wider hover:shadow-[0_8px_30px_rgba(77,163,255,0.8)] mx-auto flex items-center space-x-2 mt-8">
        <span>Access The Resource Center</span>
        <ChevronRight className="w-4 h-4" />
      </button>
      </div>
      
    </div>
  </div>
</section>
     */}

    
      

     
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

          {/* Second Row - The Topia Circle Section - COMMENTED OUT */}
          {/*
          <div className="grid relative lg:grid-cols-2 gap-12 items-center ">
            <div className="order-2  lg:order-1">
              <div className="relative">
                <Image 
                  src={homepageImages.circle}
                  alt="Wellness products and tools"
                  className="w-full object-cover transform transition-all duration-500 hover:scale-105"
                  width={600}
                  height={400}
                />
              </div>
            </div>
            <div className="order-1  lg:order-2">
              <div className=" rounded-4xl p-8 lg:p-10 relative">
                <div className="mb-4">
                </div>
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                 The Topia 
<br />
                Circle  
                </h3>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                 Step into a world of wellness, where exclusive rewards,  <br />
                 personalized benefits, and a community of growth await.
                </p>
                {profileLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                ) : userProfile?.isTopiaCircleMember ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-[#80A6F7] mb-4">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-semibold">You're a Topia Circle Member!</span>
                    </div>
                    <button 
                      onClick={() => router.push('/profile')} 
                      className="bg-white hover:bg-gray-50 text-black px-8 py-4 rounded-full text-sm md:text-base font-semibold transition-all duration-300 transform hover:scale-105 uppercase tracking-wider hover:shadow-[0_8px_30px_rgba(77,163,255,0.8)]"
                    >
                      Manage Subscription
                    </button>
                  </div>
                ) : (
                  <button   
                    onClick={() => router.push('/topia-circle')} 
                    className="bg-white hover:bg-gray-50 text-black px-8 py-4 rounded-full text-sm md:text-base font-semibold transition-all duration-300 transform hover:scale-105 uppercase tracking-wider shadow-[0_4px_15px_rgba(77,163,255,0.4)] hover:shadow-[0_8px_30px_rgba(77,163,255,0.8)]"
                  >
                    Join Now 
                  </button>
                )}
              </div>
            </div>
          </div>
          */}

          {/* New Images Section - Replacing Topia Circle */}
          <div className="grid lg:grid-cols-2 gap-8 items-center my-12">
            <div className="relative min-h-[400px] overflow-hidden rounded-lg">
              <Image 
                src="/images/mission.png"
                alt="Mission Image"
                className="w-full object-cover rounded-lg"
                width={600}
                height={400}
              />
              {/* Bottom Border Line - Mission */}
              <div className="hidden md:block absolute -bottom-6 md:-bottom-11 left-1/2 transform -translate-x-1/2 w-48 md:w-80 h-12 md:h-24">
                <Image 
                  src="/linessss.png"
                  alt="Decorative line"
                  width={1224}
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Text Overlay on Mission Image */}
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-lg px-4 md:px-6 pt-8 md:pt-28">
                <p className="text-white leading-relaxed max-w-md mx-auto text-center mb-6 md:mb-12 text-sm md:text-[22px]">
                  At SHROOMTOPIA, we are dedicated to enhancing your wellness journey through the power of therapeutic mushrooms. We believe in blending nature&apos;s gifts with modern lifestyles to promote creativity, relaxation, and enjoyment.
                </p>
                <button 
                  onClick={() => router.push('/resourcecenter')} 
                  className="px-4 md:px-10 py-2 md:py-3 rounded-full text-[10px] md:text-base font-semibold uppercase tracking-wider transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
                  style={{
                    background: 'linear-gradient(90deg, #86D1F8 0%, #CFEFFF 50%, #86D1F8 100%)',
                    color: '#000',
                    boxShadow: '0 4px 15px rgba(134, 209, 248, 0.5)'
                  }}
                >
                  <span className="hidden md:inline">ACCESS THE RESOURCE CENTER</span>
                  <span className="md:hidden">RESOURCE CENTER</span>
                  <ChevronRight className="inline-block w-3 h-3 md:w-5 md:h-5 ml-1 md:ml-2" />
                </button>
              </div>
            </div>
            <div className="relative min-h-[400px] overflow-hidden rounded-lg">
              <Image 
                src="/images/topianew.png"
                alt="Topia New"
                className="w-full object-cover rounded-lg"
                width={600}
                height={400}
              />
              {/* Bottom Border Line - Topia */}
              <div className="hidden md:block absolute -bottom-2 md:-bottom-3 left-1/2 transform -translate-x-1/2 w-40 md:w-56 h-8 md:h-8">
                <Image 
                  src="/linessss.png"
                  alt="Decorative line"
                  width={224}
                  height={32}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Text Overlay on Topia New Image */}
              <div className="absolute inset-0 flex items-center justify-center rounded-lg px-4 md:px-6 pt-0 md:pt-0">
                <p className="text-white leading-relaxed mx-auto text-center text-sm md:text-[22px] max-w-[280px] md:max-w-md">
                 Build your own monthly selection $200 in products for $100 / month


                </p>
              </div>
              {/* Button positioned separately - Mobile: 160px, Desktop: 370px */}
              <div className="absolute inset-0 flex items-center justify-center rounded-lg pt-[160px] md:pt-[370px]">
                <button 
                  onClick={() => {
                    if (userProfile?.subscriptionStatus === 'paused') {
                      router.push('/profile');
                    } else {
                      router.push('/topia-circle');
                    }
                  }}
                  className="px-6 md:px-10 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold uppercase tracking-wider transition-all duration-300 transform hover:scale-105"
                  style={{
                    background: 'linear-gradient(90deg, #86D1F8 0%, #CFEFFF 50%, #86D1F8 100%)',
                    color: '#000',
                    boxShadow: '0 4px 15px rgba(134, 209, 248, 0.5)'
                  }}
                >
                  {userProfile?.subscriptionStatus === 'paused' 
                    ? 'SUBSCRIPTION PAUSED' 
                    : userProfile?.isTopiaCircleMember && userProfile?.subscriptionStatus === 'active' 
                      ? 'MANAGE SUBSCRIPTION' 
                      : 'JOIN NOW'}
                  <ChevronRight className="inline-block w-3 h-3 md:w-5 md:h-5 ml-1 md:ml-2" />
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
              
              <h3 className="text-3xl lg:text-4xl relative font-extrabold text-white mb-6">
                Earn And Track Rewards<br />
                As You Grow
              </h3>
              
              <p className="text-gray-300 relative text-lg mb-8 leading-relaxed">
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
<section className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen py-20" style={{ background: 'transparent' }}>
  <div className="grid lg:grid-cols-2 gap-0">
    {/* Left Content */}
    <div className="px-4 md:px-8 lg:px-16 xl:px-24 flex items-center justify-end">
      <div className="max-w-xl w-full">
        <h2 className="text-5xl lg:text-6xl font-bold text-white tracking-wider mb-12 uppercase">
          CONTACT US
        </h2>
        
        <div className="space-y-10">
          <div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Better yet, see us in person!
            </h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              We love our customers, so feel free to visit during normal business hours.
            </p>
          </div>

          <div>
            <h4 className="text-2xl font-bold text-white mb-6">
              SHROOMTOPIA
            </h4>
            
            <div className="space-y-4 text-gray-300">
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
            <h4 className="text-2xl font-bold text-white mb-4">
              Hours
            </h4>
            {todayTiming ? (
              <div className="flex items-center space-x-2 text-gray-300">
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
              <div className="flex items-center space-x-2 text-gray-300">
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
                          <div key={d} className="flex items-center justify-between text-gray-300">
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
  src="https://www.google.com/maps?q=42.4455298,-83.1537416&output=embed&style=feature:all|element:geometry|color:0x242f3e&style=feature:all|element:labels.text.stroke|color:0x242f3e&style=feature:all|element:labels.text.fill|color:0x746855&style=feature:water|element:geometry|color:0x17263c"
  className="w-full h-full"
  style={{ border: 0, display: 'block', margin: 0, padding: 0, borderRadius: '12px', filter: 'invert(90%) hue-rotate(180deg)' }}
  allowFullScreen
  loading="lazy"
  title="ShroomTopia Location Map"
/>
      
      {/* Map Info Footer */}
      <p className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 text-sm text-gray-300 bg-black/70 px-4 py-2 rounded-full shadow-lg backdrop-blur-sm">
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
