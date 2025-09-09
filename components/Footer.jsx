"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { subscribeEmail } from '../service/service';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../context/UserContext';

function App() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isLoggedIn } = useUser();

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

  return (
    <div>
      {/* Footer Component */}
      <footer className="bg-gradient-to-r from-[#80A6F7] via-[#80A6F7] to-[#80A6F7] text-white">
        <div className="container mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            {/* Logo Section */}
            <div className="flex-shrink-0 ">
              <div className="flex items-center space-x-3">
                <div className="w-40 h-40 flex items-center justify-center">
                  <img src='/images/logo.png' className='mb-20'/>
                </div>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="text-center flex-1 max-w-md">
              <h3 className="text-2xl font-bold mb-3">Stay Updated With the Latest Insights</h3>
              <p className="text-sm opacity-90 mb-6 leading-relaxed">
                Subscribe to our newsletter to get insider tips, expert advice, and exclusive insights and updates tailored just for you.
              </p>
              <form onSubmit={handleSubscribe} className="flex border-white w-full">
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 px-2 py-3 rounded-l-lg bg-[#80A6F7] text-white placeholder-white border border-white focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button type="submit" disabled={submitting} className="bg-white text-[#80A6F7] px-6 py-3 rounded-r-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-60">
                  {submitting ? 'Submitting...' : 'Subscribe'}
                </button>
              </form>
            </div>

            {/* Navigation Links */}
            <div className="flex space-x-16">
              <div className="space-y-4">
                <a href="/" className="block hover:text-gray-200 transition-colors">Home</a>
                <a href="/resourcecenter" className="block hover:text-gray-200 transition-colors">Articles</a>
                <a href="/commingsoon" className="block hover:text-gray-200 transition-colors">Comming soon</a>
               
                <a href="/contact" className="block hover:text-gray-200 transition-colors">Contact</a>
              </div>
              <div className="space-y-4">
                {!isLoggedIn && (
                  <a href="/auth/register" className="block hover:text-gray-200 transition-colors">Register</a>
                )}
                <a href="#" className="block hover:text-gray-200 transition-colors">About Us</a>
                <a href="/resourcecenter" className="block hover:text-gray-200 transition-colors">Blogs</a>
                <a href="/rewards" className="block hover:text-gray-200 transition-colors">Rewards</a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white border-opacity-20">
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2 text-sm opacity-80">
                <span>©</span>
                <span>Copyright</span>
              </div>
              <div className="flex flex-wrap items-center space-x-6 text-sm">
                <a href="/terms" className="hover:text-gray-200 transition-colors opacity-80">Terms of Use</a>
                <span className="opacity-60">|</span>
                <a href="/privacypolicy" className="hover:text-gray-200 transition-colors opacity-80">Privacy Policy</a>
                <span className="opacity-60">|</span>
                <a href="#" className="hover:text-gray-200 transition-colors opacity-80">Cookie Policy</a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Toasts are managed globally in _app.js */}
    </div>
  );
}

export default App;
