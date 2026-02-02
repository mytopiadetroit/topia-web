import React, { useState, useEffect } from 'react';
import { ChevronRight, Mail, Bell, Star, Sparkles } from 'lucide-react';
import { useRouter } from 'next/router';
import { subscribeEmail } from '../service/service';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ComingSoon() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    setIsVisible(true);
    
    // Set countdown to 30 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSubscribe = async (e) => {
    e?.preventDefault();
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }
    
    try {
      setSubmitting(true);
      const res = await subscribeEmail(email, router);
      
      if (res.success) {
        toast.success('Subscribed successfully! Thank you for joining us.');
        setEmail('');
        setIsSubscribed(true);
        setTimeout(() => setIsSubscribed(false), 3000);
      } else {
        toast.error(res.message || 'Subscription failed');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      toast.error('Failed to subscribe. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Gradient Background */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #ffffff 40%, #8CABFF 100%)',
          }}
        />
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-[#8EAFF6] rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-20 w-20 h-20 bg-[#8CABFF] rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-16 h-16 bg-[#8EAFF6] rounded-full opacity-25 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 right-32 w-24 h-24 bg-[#8CABFF] rounded-full opacity-20 animate-bounce" style={{ animationDelay: '3s' }}></div>
        
        {/* Decorative Stars */}
        <Sparkles className="absolute top-32 left-1/4 w-6 h-6 text-[#8EAFF6] opacity-40 animate-pulse" />
        <Star className="absolute top-60 right-1/3 w-8 h-8 text-[#8CABFF] opacity-50 animate-pulse" style={{ animationDelay: '1.5s' }} />
        <Sparkles className="absolute bottom-32 left-1/3 w-5 h-5 text-[#8EAFF6] opacity-30 animate-pulse" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-12">
        <div className={`text-center max-w-4xl mx-auto transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          
          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-[#2E2E2E] mb-4 leading-tight">
              The Topia Circle
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-[#8EAFF6] to-[#8CABFF] mx-auto mb-6 rounded-full"></div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#2E2E2E] mb-6">
              Coming Soon
            </h2>
          </div>

          {/* Description */}
          <p className="text-lg sm:text-xl lg:text-2xl text-[#2E2E2E] mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            Step into a world of wellness, where exclusive rewards, personalized benefits, 
            and a community of growth await. Something extraordinary is coming.
          </p>

          {/* Countdown Timer */}
          <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-2xl mx-auto mb-12">
            {Object.entries(timeLeft).map(([unit, value], index) => (
              <div key={unit} className={`transform transition-all duration-500 hover:scale-105 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`} style={{ transitionDelay: `${index * 100}ms` }}>
                <div 
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-[#8EAFF6]/30"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(142,175,246,0.1) 100%)',
                  }}
                >
                  <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#2E2E2E] mb-2">
                    {String(value).padStart(2, '0')}
                  </div>
                  <div className="text-sm sm:text-base text-[#2E2E2E] font-medium uppercase tracking-wide">
                    {unit}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Email Subscription */}
          <div className="max-w-md mx-auto mb-12">
            <div className="mb-6">
              <Bell className="w-8 h-8 text-[#8CABFF] mx-auto mt-30 " />
              <h3 className="text-xl sm:text-2xl font-semibold mt-10 text-[#2E2E2E] mb-2">
                Be the First to Know
              </h3>
              <p className="text-[#2E2E2E] opacity-80">
                Get notified when we launch and receive exclusive early access benefits.
              </p>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#8CABFF]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-[#8EAFF6]/30 focus:border-[#8CABFF] focus:outline-none bg-white/80 backdrop-blur-sm text-[#2E2E2E] placeholder-[#2E2E2E]/60 transition-all duration-300"
                />
              </div>
              
              <button
                onClick={() => router.push('/topia-circle')}
                disabled={isSubscribed}
                className={`w-full py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 ${
                  isSubscribed 
                    ? 'bg-green-500 text-white' 
                    : 'bg-[#2E2E2E] hover:bg-gray-800 text-white'
                }`}
              >
                {isSubscribed ? (
                  <span>✓ Successfully Subscribed!</span>
                ) : (
                  <>
                    <span>Join Now</span>
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Feature Preview */}
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8 max-w-4xl mx-auto mb-12">
            {[
              {
                title: "Exclusive Rewards",
                description: "Earn points and unlock premium benefits",
                delay: "0ms"
              },
              {
                title: "Community Access",
                description: "Connect with wellness enthusiasts",
                delay: "200ms"
              },
              {
                title: "Personalized Journey",
                description: "Tailored recommendations just for you",
                delay: "400ms"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`transform transition-all duration-700 hover:scale-105 ${
                  isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
                style={{ transitionDelay: feature.delay }}
              >
                <div 
                  className="p-6 rounded-2xl shadow-lg border border-[#8EAFF6]/30 h-full"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(142,175,246,0.1) 100%)',
                  }}
                >
                  <div className="w-12 h-12 bg-gradient-to-r from-[#8EAFF6] to-[#8CABFF] rounded-xl flex items-center justify-center mb-4 mx-auto">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold text-[#2E2E2E] mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-[#2E2E2E] opacity-80 text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="text-center">
            <p className="text-[#2E2E2E] opacity-60 text-sm mb-4">
              Join thousands of wellness enthusiasts already waiting
            </p>
            <div className="flex justify-center items-center space-x-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 bg-gradient-to-r from-[#8EAFF6] to-[#8CABFF] rounded-full border-2 border-white flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">{i}</span>
                  </div>
                ))}
              </div>
              <span className="text-[#2E2E2E] font-medium ml-3">2,500+ subscribers</span>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-12">
            <button
              onClick={() => window.history.back()}
              className="bg-transparent hover:bg-[#8EAFF6]/20 text-[#2E2E2E] border-2 border-[#8EAFF6] px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 mx-auto"
            >
              <span>← Back to Home</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}