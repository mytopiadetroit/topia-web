'use client';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, ChevronDown, ChevronRight, ShoppingCart, LogOut, Home, Award, BookOpen, Users, Heart } from 'lucide-react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [hasActiveDeals, setHasActiveDeals] = useState(false);
  
  // Use context hooks
  const { user, isLoggedIn, logout } = useUser();
  const { cartCount } = useApp();
  const { count: wishlistCount } = useWishlist();
  
  // Check for active deals
  useEffect(() => {
    const checkActiveDeals = async () => {
      try {
        const response = await fetch('https://api.mypsyguide.io/api/deals/active');
        const result = await response.json();
        setHasActiveDeals(result.success && result.data && result.data.length > 0);
      } catch (error) {
        console.error('Error checking deals:', error);
        setHasActiveDeals(false);
      }
    };

    checkActiveDeals();
    // Check every 5 minutes
    const interval = setInterval(checkActiveDeals, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthChange = () => {
      // This will trigger a re-render when auth state changes
    };
    
    // Listen for custom auth state change events
    window.addEventListener('storage', handleAuthChange);
    document.addEventListener('auth-state-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleAuthChange);
      document.removeEventListener('auth-state-changed', handleAuthChange);
    };
  }, []);
  
  // Handle 403 errors from API responses
  useEffect(() => {
    const handleApiError = (event) => {
      // Check if this is an API error with 403 status
      if (event.detail?.status === 403) {
        toast.error('Your session has expired. Please login again.');
        logout();
        router.push('/auth/login');
      }
    };
    
    // Listen for API errors
    window.addEventListener('api-error', handleApiError);
    
    return () => {
      window.removeEventListener('api-error', handleApiError);
    };
  }, [logout, router]);
  
  // Create refs for the profile dropdown and side drawer
  const profileRef = useRef(null);
  const sideDrawerRef = useRef(null);
  
  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      // Close side drawer when clicking outside
      if (sideDrawerRef.current && !sideDrawerRef.current.contains(event.target) && 
          !event.target.closest('[data-mobile-menu-button]')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleNavItemClick = () => {
    setIsMenuOpen(false);
    setIsMobileProfileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMenuOpen(false);
      setIsProfileOpen(false);
      setIsMobileProfileOpen(false);
      router.push('/auth/login');
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <>
      {/* Overlay for mobile drawer */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
      
      {/* Main navbar */}
     <nav className="bg-white shadow-sm relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <a href="/" className="flex items-center">
                  <img src="/newlogo.jpg" alt="Logo" className="h-20 w-auto" />
                </a>
              </div>
            </div>

            {/* Desktop Navigation */}
           <div className={`hidden md:block rounded-4xl bg-[url('/images/navbar.png')] bg-cover bg-center transition-all duration-300 ${hasActiveDeals ? 'w-[780px]' : 'w-[680px]'}`}>
              <div className="ml-20 flex items-baseline space-x-8">
                <a href="/" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  HOME
                </a>
                <a href="/menu" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  MENU
                </a>
                {hasActiveDeals && (
                  <a href="/crazy-deals" className="relative text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                    CRAZY DEALS
                    <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                      🔥
                    </span>
                  </a>
                )}
                <a href="/resourcecenter" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
               RESOURCE CENTER

                </a>
                  {/* <a href="/myhistory" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                    Experiences
                  </a> */}
                <a href="/rewards" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  REWARDS
                </a>
              </div>
            </div>

            {/* Profile, Cart and Mobile menu button */}
            <div className="flex items-center space-x-4">
              {/* Wishlist Icon */}
              <a href="/wishlist" className="relative">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors duration-200">
                  <Heart className="w-5 h-5 text-gray-600" />
                </div>
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </a>
              {/* Cart Icon */}
              <a href="/cart" className="relative">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-400 transition-colors duration-200">
                  <ShoppingCart className="w-5 h-5 text-gray-600" />
                </div>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </a>

              {/* Desktop Profile Dropdown */}
              <div className="hidden md:block relative" ref={profileRef}>
                <div 
                  className="flex items-center space-x-1 cursor-pointer"
                  onClick={() => isLoggedIn ? setIsProfileOpen(!isProfileOpen) : router.push('/auth/login')}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden">
                    {isLoggedIn ? (
                      <img src={user?.avatar || "/images/pic1.png"} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  {isLoggedIn && <ChevronDown className="w-3 h-3 text-gray-600" />}
                </div>
                
                {/* Profile Dropdown */}
              
{isLoggedIn && isProfileOpen && (
  <div className="absolute right-0 mt-2 w-[220px] bg-white rounded-md shadow-2xl py-0 z-40 border border-gray-100">
    {/* Arrow indicator */}
    <div className="absolute -top-1 right-4 w-3 h-3 bg-white transform rotate-45 border-l border-t border-gray-100"></div>
    
    <div className="bg-[#80A6F7]/80 shadow-inner rounded-t-md">
      <ul>
        <li className="px-3 py-2 shadow-inner border-b-2 border-white">
          <a href="/profile" className="flex items-center gap-3 text-white font-semibold text-sm">
            <User className="text-lg" />
            Profile Settings
          </a>
        </li>
        
        <li className="px-3 py-2 shadow-inner border-b-2 border-white">
          <a href="/myorders" className="flex items-center gap-3 text-white font-semibold text-sm">
            <ShoppingCart className="text-lg" />
            My Orders
          </a>
        </li>
        
        <li className="px-3 py-2 shadow-inner border-b-2 border-white">
          <a href="/myhistory" className="flex items-center gap-3 text-white font-semibold text-sm">
            <BookOpen className="text-lg" />
            My History
          </a>
        </li>
        
        <li className="px-3 py-2 shadow-inner">
          <button 
            onClick={() => {
              logout();
              setIsProfileOpen(false);
            }}
            className="flex items-center gap-3 text-white font-semibold text-sm w-full text-left"
          >
            <LogOut className="text-lg" />
            Logout
          </button>
        </li>
      </ul>
    </div>
  </div>
)}



 
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  data-mobile-menu-button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-gray-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 transition-colors duration-200"
                >
                  {isMenuOpen ? (
                    <X className="h-6 w-6" />
                  ) : (
                    <Menu className="h-6 w-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Side Drawer - Now opens from LEFT */}
      <div 
        ref={sideDrawerRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="px-4 py-4 border-b border-gray-100 bg-gray-50">
            {isLoggedIn ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-200">
                  <img 
                    src={user?.avatar || "/images/pic1.png"} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || 'Welcome back!'}
                  </p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  router.push('/auth/login');
                  handleNavItemClick();
                }}
                className="flex items-center space-x-3 w-full p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200"
              >
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">Login / Sign Up</span>
              </button>
            )}
          </div>

          {/* Navigation Links */}
          <div className="flex-1 px-2 py-4 overflow-y-auto">
            <div className="space-y-2">
              {/* Main Navigation */}
              <div className="space-y-1">
                <a 
                  href="/menu" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <Home className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium">Menu</span>
                </a>
                
                {hasActiveDeals && (
                  <a 
                    href="/crazy-deals" 
                    onClick={handleNavItemClick}
                    className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group relative"
                  >
                    <svg className="w-5 h-5 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">Crazy Deals</span>
                    <span className="ml-auto flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </a>
                )}
                
                <a 
                  href="/resourcecenter" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <BookOpen className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium">Resource Center</span>
                </a>
                
                {/* <a 
                  href="#" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <Users className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium">Join GAG</span>
                </a> */}
                
                {/* <a 
                  href="/myhistory" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <Award className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium"> Experiences</span>
                </a> */}
                
                <a 
                  href="/rewards" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <Award className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium"> Rewards</span>
                </a>
              </div>

              {/* Cart Section */}
              <div className="pt-4 border-t border-gray-200">
                <a 
                  href="/cart" 
                  onClick={handleNavItemClick}
                  className="flex items-center justify-between px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <ShoppingCart className="w-5 h-5 group-hover:text-blue-600" />
                    <span className="font-medium">Shopping Cart</span>
                  </div>
                  {cartCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </a>
              </div>

              {/* My Profile Section with Dropdown */}
              {isLoggedIn && (
                <div className="pt-4 border-t border-gray-200">
                  <div className="space-y-1">
                    {/* My Profile Main Button with Dropdown */}
                    <button 
                      onClick={() => setIsMobileProfileOpen(!isMobileProfileOpen)}
                      className="flex items-center justify-between w-full px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 group-hover:text-blue-600" />
                        <span className="font-medium">Profile</span>
                      </div>
                      <ChevronRight 
                        className={`w-4 h-4 transition-transform duration-200 ${
                          isMobileProfileOpen ? 'rotate-90' : ''
                        }`} 
                      />
                    </button>
                    
                    {/* Profile Dropdown Items */}
                    {isMobileProfileOpen && (
                      <div className="ml-2 space-y-1">
                        <a 
                          href="/profile" 
                          onClick={handleNavItemClick}
                          className="flex items-center space-x-3 px-2 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                        >
                          <User className="w-4 h-4 group-hover:text-blue-600" />
                          <span className="text-sm font-medium">Profile Settings</span>
                        </a>
                        
                        <a 
                          href="/myorders" 
                          onClick={handleNavItemClick}
                          className="flex items-center space-x-3 px-2 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                        >
                          <ShoppingCart className="w-4 h-4 group-hover:text-blue-600" />
                          <span className="text-sm font-medium">Orders</span>
                        </a>
                        
                        <a 
                          href="/myhistory" 
                          onClick={handleNavItemClick}
                          className="flex items-center space-x-3 px-2 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                        >
                          <BookOpen className="w-4 h-4 group-hover:text-blue-600" />
                          <span className="text-sm font-medium"> History</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Logout Section */}
            {isLoggedIn && (
              <div className="px-2 py-4 border-t border-gray-200 mt-auto">
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-2 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}