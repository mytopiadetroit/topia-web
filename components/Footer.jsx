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
      <footer 
        className="text-white relative min-h-[500px]"
        style={{
          backgroundImage: 'url(/footerimage.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Section - Logo and Tagline */}
            <div className="lg:col-span-6 flex flex-col items-center lg:items-start">
              <div className="flex items-center mb-6">
                <div className="w-48 h-48 flex items-center justify-center">
                  <img src='/images/pnglogo.png' alt="ShroomTopia Logo" className='object-contain w-full h-full'/>
                </div>
              </div>
              <div className="mb-6 text-center lg:text-left">
                <h3 className="text-lg font-bold mb-2">Detroit's Portal to Elevated Experiences</h3>
                <p className="text-sm opacity-90 leading-relaxed">
                  Naturals goods. Premium mushroom selection.<br />
                  Community knowledge
                </p>
              </div>
              <div className="flex space-x-3">
                {/* Instagram */}
                <a href="https://www.instagram.com/myshroom?igsh=Mzllemtjc2E1cmdn&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded border border-white/30 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
                {/* Facebook */}
                <a href="https://www.facebook.com/61582026845507/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 flex items-center justify-center rounded border border-white/30 hover:bg-white/10 transition-colors">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>



            {/* Right Section - Navigation */}
            <div className="lg:col-span-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Explore</h4>
                  <div className="space-y-3">
                    <a href="/" className="block hover:text-gray-200 transition-colors">Home</a>
                    <a href="/menu" className="block hover:text-gray-200 transition-colors">Shop</a>
                    <a href="/topia-circle" className="block hover:text-gray-200 transition-colors">Topia Circle</a>
                    <a href="/rewards" className="block hover:text-gray-200 transition-colors">Rewards</a>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold mb-4">Company</h4>
                  <div className="space-y-3">
                    <a href="/about" className="block hover:text-gray-200 transition-colors">About Us</a>
                    <a href="/contact" className="block hover:text-gray-200 transition-colors">Contact</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Copyright Section - Outside Footer Image */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-6 py-4">
          <div className="text-center space-y-2">
            <div className="text-sm">
              <span>2026 Shroom Topia Detroit</span>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm">
              <a href="/terms" className="hover:text-gray-200 transition-colors">Terms of Use</a>
              <span className="opacity-60">|</span>
              <a href="/privacypolicy" className="hover:text-gray-200 transition-colors">Privacy Policy</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;