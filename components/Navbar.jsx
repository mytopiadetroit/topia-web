'use client';
import { useState } from 'react';
import { Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
     
      
      {/* Main navbar */}
      <nav className="bg-white shadow-sm border-b">
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
         <div className="hidden md:block rounded-4xl bg-[url('/images/navbar.png')] bg-cover bg-center">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="/menu" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Menu</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Resource Centre</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">Join GAG</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">My Experiences</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 px-3 py-2 text-sm font-medium">My Rewards</a>
              </div>
            </div>

            {/* Profile and Mobile menu button */}
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center cursor-pointer">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              
              {/* Mobile menu button */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="bg-gray-50 p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
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

          {/* Mobile menu */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <a href="/menu" className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium">Menu</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium">Resource Centre</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium">Join GAG</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium">My Experiences</a>
                <a href="#" className="text-gray-900 hover:text-blue-600 block px-3 py-2 text-base font-medium">My Rewards</a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}