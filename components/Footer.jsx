"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { subscribeEmail } from '../service/service';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../context/UserContext';

function App() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [shopSettings, setShopSettings] = useState(null);
  const { isLoggedIn } = useUser();

  useEffect(() => {
    const loadShopSettings = async () => {
      try {
        const response = await axios.get('https://api.mypsyguide.io/api/shop-settings');
        console.log('Shop settings response:', response);
        if (response.data.success) {
          setShopSettings(response.data.data);
        }
      } catch (err) {
        console.error('Failed to load shop settings:', err);
      }
    };
    loadShopSettings();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
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
      } else {
        toast.error(res.message || 'Subscription failed');
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div>
      {/* Footer Component */}
      <footer className="bg-gradient-to-r from-[#80A6F7] via-[#80A6F7] to-[#80A6F7] text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Logo and Contact Section - 3 columns */}
            <div className="lg:col-span-3">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-32 h-32 flex items-center justify-center">
                  <img src='/images/logo.png' alt="Logo" className='object-contain w-full h-full'/>
                </div>
              </div>
            </div>

            {/* Newsletter Section - 5 columns */}
            <div className="lg:col-span-5 text-center">
              <h3 className="text-xl sm:text-2xl font-bold mb-3 px-2 sm:px-0">Stay Updated With the Latest Insights</h3>
              <p className="text-sm opacity-90 mb-6 leading-relaxed px-4 sm:px-0">
                Subscribe to our newsletter to get insider tips, expert advice, and exclusive insights and updates tailored just for you.
              </p>
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row w-full max-w-md mx-auto px-4 sm:px-0">
                <div className="flex-1 mb-3 sm:mb-0 sm:mr-2">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg sm:rounded-r-none bg-[#80A6F7] text-white placeholder-white placeholder-opacity-80 border border-white focus:outline-none focus:ring-2 focus:ring-white"
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={submitting} 
                  className="bg-white text-[#80A6F7] px-6 py-3 rounded-lg sm:rounded-l-none font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60 whitespace-nowrap w-full sm:w-auto"
                >
                  {submitting ? 'Submitting...' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Navigation Links and Timings - 4 columns */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-2 gap-6">
                {/* Left Navigation */}
                <div className="space-y-3">
                  <a href="/" className="block hover:text-gray-200 transition-colors font-medium">Home</a>
                  <a href="/resourcecenter" className="block hover:text-gray-200 transition-colors font-medium">Articles</a>
                  <a href="/commingsoon" className="block hover:text-gray-200 transition-colors font-medium">Coming soon</a>
                  <a href="/contact" className="block hover:text-gray-200 transition-colors font-medium">Contact</a>
                </div>
                
                {/* Right Navigation */}
                <div className="space-y-3">
                  {!isLoggedIn && (
                    <a href="/auth/register" className="block hover:text-gray-200 transition-colors font-medium">Register</a>
                  )}
                  <a href="#" className="block hover:text-gray-200 transition-colors font-medium">About Us</a>
                  <a href="/resourcecenter" className="block hover:text-gray-200 transition-colors font-medium">Blogs</a>
                  <a href="/rewards" className="block hover:text-gray-200 transition-colors font-medium">Rewards</a>
                </div>
              </div>

              {/* Full Week Timings */}
              {/* {shopSettings?.timings && (
                <div className="bg-[#80A6F7] bg-opacity-20 rounded-lg p-4 backdrop-blur-sm border border-white border-opacity-30 mt-6">
                  <p className="text-sm font-bold mb-3 pb-2 border-b border-white border-opacity-40">Opening Hours</p>
                  <div className="space-y-2">
                    {shopSettings.timings.map((timing) => (
                      <div key={timing._id} className="flex justify-between items-center text-sm">
                        <span className="capitalize font-medium">{timing.day.substring(0, 3)}</span>
                        {timing.isOpen ? (
                          <span className="font-semibold">
                            {formatTime(timing.openingTime)} - {formatTime(timing.closingTime)}
                          </span>
                        ) : (
                          <span className="opacity-80">Closed</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )} */}
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white border-opacity-30">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-sm font-medium">
                <span>©</span>
                <span>Copyright</span>
              </div>
              <div className="flex flex-wrap items-center space-x-6 text-sm font-medium">
                <a href="/terms" className="hover:text-gray-200 transition-colors">Terms of Use</a>
                <span className="opacity-60">|</span>
                <a href="/privacypolicy" className="hover:text-gray-200 transition-colors">Privacy Policy</a>
                <span className="opacity-60">|</span>
                <a href="#" className="hover:text-gray-200 transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;