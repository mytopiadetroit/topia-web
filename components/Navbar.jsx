'use client';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, User, ChevronDown, ChevronRight, ShoppingCart, LogOut, Home, Award, BookOpen, Users } from 'lucide-react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { useApp } from '../context/AppContext';

export default function Navbar() {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  
  // Use context hooks
  const { user, isLoggedIn, logout } = useUser();
  const { cartCount } = useApp();
  
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

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    setIsMobileProfileOpen(false);
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
      <nav className="bg-white shadow-sm border-b relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-2">
                <a href="/" className="flex items-center">
                  <img src="/images/logo4.png" alt="Logo" className="h-20 w-auto" />
                </a>
              </div>
            </div>

            {/* Desktop Navigation */}
           <div className="hidden md:block w-[670px] rounded-4xl bg-[url('/images/navbar.png')] bg-cover bg-center">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="/menu" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Menu
                </a>
                <a href="/resourcecenter" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Resource Centre
                </a>
                <a href="/about" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  About
                </a>
                <a href="/myhistory" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Experiences
                </a>
                <a href="/profile" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium transition-colors duration-200">
                  Rewards
                </a>
              </div>
            </div>

            {/* Profile, Cart and Mobile menu button */}
            <div className="flex items-center space-x-4">
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
                      <img src={user?.avatar || "/images/avatar.png"} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  {isLoggedIn && <ChevronDown className="w-3 h-3 text-gray-600" />}
                </div>
                
                {/* Profile Dropdown */}
                {isLoggedIn && isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                    <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                       Profile
                    </a>
                    <a href="/myorders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                      Orders
                    </a>
                    <a href="/myhistory" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200">
                     History
                    </a>
                    <button 
                      onClick={() => {
                        logout();
                        setIsProfileOpen(false);
                      }} 
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center">
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                      </div>
                    </button>
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
                    src={user?.avatar || "/images/avatar.png"} 
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
                
                <a 
                  href="#" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <BookOpen className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium">Resource Centre</span>
                </a>
                
                <a 
                  href="#" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <Users className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium">Join GAG</span>
                </a>
                
                <a 
                  href="#" 
                  onClick={handleNavItemClick}
                  className="flex items-center space-x-3 px-2 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 group"
                >
                  <Award className="w-5 h-5 group-hover:text-blue-600" />
                  <span className="font-medium"> Experiences</span>
                </a>
                
                <a 
                  href="#" 
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