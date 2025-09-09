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

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
    
       {/* Top notification bar */}
      {/* <div className="bg-gray-800 text-white text-center py-2 text-sm">
        <span>Check the live streaming! Wednesday July 15th / 7:30 PM EST | </span>
        <span className="text-blue-300 cursor-pointer">YouTube ➤</span>
      </div> */}
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
         
          <Image 
            src="/images/img.png"
            alt="People in conversation"
            className="w-full h-full object-cover"
            style={{ filter: 'blur(8px)' }}
            fill
          />
          {/* Overlay Image with More Blur and Darkness */}
          <Image
            src="/images/f.png"
            alt="Overlay"
            className="w-full h-full object-cover absolute inset-0 pointer-events-none"
            style={{
              zIndex: 1,
              filter: 'blur(16px) brightness(0.7)', 
            }}
            fill
          />
        </div>
        
        {/* Hero Content */}
        <div className={`relative z-10 text-center text-white px-4 max-w-4xl mx-auto transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold mb-6 leading-tight">
           Unlock Your Path to Health and Knowledge
          </h1>
          <p className="text-sm md:text-lg lg:text-xl mb-8 font-light max-w-3xl mx-auto">
           Access curated resources science-backed wisdom,<br />
            and a supportive network of wellness enthusiasts.
          </p>
         <button 
            onClick={() => {
              if (isLoggedIn) {
                router.push('/menu');
              } else {
                router.push('/auth/login');
              }
            }}
            className="bg-[#8EAFF633] hover:bg-[#8EAFF633] text-white px-8 py-4 rounded-4xl text-lg  font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto"
          >
            <span>Get Started</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-6 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid relative lg:grid-cols-2 gap-12 items-center">
             <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
    <div className="w-full h-full "></div>
  </div>
            {/* Ginger Image */}
<div className="flex items-center overflow-hidden lg:overflow-visible">
  <Image 
    src="/images/ii2.png"
    alt="Natural ginger root"
    className="h-[250px] sm:h-[350px] lg:h-[600px] w-full lg:w-[31.5vw]  object-cover lg:-ml-[2vw] lg:transform lg:-translate-x-12"
    style={{ objectPosition: 'left' }}
    width={400}
    height={100}
  />
</div>

            {/* Content Card */}
            <div className="relative">
              <div
                className="rounded-3xl p-8 lg:p-12   transform transition-all duration-500 hover:-translate-y-2"
                style={{
                 
                 
                }}
              >
                <div className="relative">
                  {/* Cursor Animation */}
                  {/* <div className="absolute -top-4 -right-4 w-12 h-12 opacity-70">
                    <div className="w-6 h-6 bg-gray-800 rounded-full animate-pulse"></div>
                    <div className="absolute top-0 left-6 w-4 h-8 bg-gray-800 rounded-sm animate-pulse"></div>
                  </div> */}
                  <div className="mb-4">
                    <span className="inline-block text-[#2E2E2E] text-sm font-semibold px-4 py-2 rounded-full">
                      Natural Wellness
                    </span>
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6">
                  The Mushroom Treasury
<br />
                  
                  </h2>
                  <p className="text-[#2E2E2E] text-lg mb-8 leading-relaxed">
                   An exclusive collection of nature&apos;s finest functional and,<br />therapeutic mushrooms for your well-being<br /> 
                   
                  </p>
                 <button
  onClick={() => router.push('/menu')}
  className="bg-[#2E2E2E] hover:bg-gray-800 text-white px-8 py-3 rounded-4xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
>
  <span>Browser Menu</span>
</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    
      

     
    <section className="py-20 px-4 ">
      
        <div className="max-w-7xl mx-auto ">
          
       <div className="relative mb-20   ">
  {/* Center Background Image */}
  <div className="absolute inset-0 z-0 flex justify-center items-center pointer-events-none">
    <div className="w-screen h-[350px] bg-[url('/images/over.png')] bg-no-repeat bg-center bg-cover -mx-36"></div>
  </div>

  {/* Main Grid Content */}
  <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
    
    {/* Left Content */}
    <div>
      <h2 className="text-3xl lg:text-4xl font-bold text-[#2E2E2E] mb-6 leading-tight">
       Discover Resources to Elevate 
<br />
        Your Wellness
      </h2>
      <p className="text-lg text-[#2E2E2E] mb-8 leading-relaxed">
       Delve into audio, guides, videos, and more <br /> curated to inspire learning, growth, and vitality..
      </p>
      <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-4xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2">
        <span>Access The Resource Centre</span>
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>

    {/* Right Image - Circular */}
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



  </div>
</div>


          {/* Second Row */}
          <div className="grid relative lg:grid-cols-2 gap-12 items-center mb-20">
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
                  Comming Soon 
                </button>
              </div>
            </div>
          </div>

          {/* Third Row */}
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
  onClick={() => router.push('/profile')}
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
        </div>
      </section>

       <section className="py-20 px-4 ">
        <div className="max-w-7xl mx-auto">
          {/* Feedback Card */}
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
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Your Feedback Helps Us Cater To Your Journey
              </h2>
              <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                Tell us about your experience with the products you&apos;ve tried.<br />
                Your insights help others make better choices—and you&apos;ll earn rewards for every shared experience.
              </p>
              <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto">
                <span>Share Your Product Experience</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Community Story Section */}
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Inspire The Community With Your Story
            </h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Your journey matters. Share how mushrooms and wellness products have transformed your life, and<br />
              inspire others to explore their own path. Earn rewards for contributing to our shared journey.
            </p>
            <button className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto">
              <span>Share Your Wellness Journey</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

     

    </div>
  );
}