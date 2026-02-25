import React, { useState, useEffect } from 'react';
import { ChevronRight, Shield, Lock, Eye, Users, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function PrivacyPolicy() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const sections = [
    { id: 'information-collection', title: 'Information We Collect', icon: <FileText className="w-5 h-5" /> },
    { id: 'how-we-use', title: 'How We Use Information', icon: <Eye className="w-5 h-5" /> },
    { id: 'data-sharing', title: 'Data Sharing & Disclosure', icon: <Users className="w-5 h-5" /> },
    { id: 'data-security', title: 'Data Security', icon: <Shield className="w-5 h-5" /> },
    { id: 'your-rights', title: 'Your Privacy Rights', icon: <Lock className="w-5 h-5" /> },
    // { id: 'cookies', title: 'Cookies & Tracking', icon: <AlertCircle className="w-5 h-5" /> },
    { id: 'contact', title: 'Contact Us', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      sections.forEach(section => {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section.id);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
      {/* Animated stars background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="stars-container">
          {[...Array(60)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="star"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* CSS for Stars Animation */}
      <style jsx>{`
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .star {
          position: absolute;
          width: 2px;
          height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle linear infinite;
          box-shadow: 0 0 4px rgba(255, 255, 255, 0.6);
        }
        
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
        
        .star:nth-child(3n) {
          width: 3px;
          height: 3px;
          box-shadow: 0 0 6px rgba(124, 198, 255, 0.7);
        }
        
        .star:nth-child(5n) {
          width: 4px;
          height: 4px;
          box-shadow: 0 0 8px rgba(47, 128, 255, 0.8);
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden z-10">
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-cyan-500/10 rounded-full opacity-50 animate-pulse" />
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-blue-500/10 rounded-full opacity-30" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-400/10 rounded-full opacity-40" />
        
        <div className={`relative z-10 max-w-4xl mx-auto text-center transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6 border border-cyan-400/30">
            <Shield className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Your Privacy Matters</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            We're committed to protecting your privacy and being transparent about how we collect, use, and safeguard your personal information.
          </p>
          
          <div className="flex items-center justify-center space-x-2 text-gray-400">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span className="text-sm">Last updated: January 15, 2025</span>
          </div>
        </div>
      </section>

      {/* Navigation & Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10">
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl border border-gray-800/40 p-6">
                <h3 className="font-bold text-white mb-4">Quick Navigation</h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full text-left flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        activeSection === section.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                          : 'text-gray-300 hover:bg-white/10'
                      }`}
                    >
                      <span className={activeSection === section.id ? 'text-cyan-400' : 'text-gray-400'}>{section.icon}</span>
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-16">
              
              {/* Information Collection */}
              <section id="information-collection" className="scroll-mt-8">
                <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl border border-gray-800/40 p-8 lg:p-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <FileText className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Information We Collect</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-white/5 rounded-xl p-6 border border-gray-700/30">
                      <h4 className="font-semibold text-white mb-3">Personal Information</h4>
                      <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                          <span>Name, email address, and contact information</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                          <span>Account credentials and profile information</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-1 flex-shrink-0" />
                          <span>Payment and billing information</span>
                        </li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-400/30">
                      <h4 className="font-semibold text-white mb-3">Usage Information</h4>
                      <p className="text-gray-300 leading-relaxed">
                        We collect information about how you interact with our platform, including pages visited, features used, and engagement patterns to improve your wellness journey.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* How We Use Information */}
              <section id="how-we-use" className="scroll-mt-8">
                <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl border border-gray-800/40 p-8 lg:p-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <Eye className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">How We Use Your Information</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 rounded-xl p-6 border border-blue-400/30">
                        <h4 className="font-semibold text-white mb-2">Service Delivery</h4>
                        <p className="text-gray-300 text-sm">Provide personalized wellness recommendations and maintain your account</p>
                      </div>
                      <div className="bg-green-500/10 rounded-xl p-6 border border-green-400/30">
                        <h4 className="font-semibold text-white mb-2">Communication</h4>
                        <p className="text-gray-300 text-sm">Send important updates, newsletters, and respond to your inquiries</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-purple-500/10 rounded-xl p-6 border border-purple-400/30">
                        <h4 className="font-semibold text-white mb-2">Platform Improvement</h4>
                        <p className="text-gray-300 text-sm">Analyze usage patterns to enhance our services and user experience</p>
                      </div>
                      <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-400/30">
                        <h4 className="font-semibold text-white mb-2">Legal Compliance</h4>
                        <p className="text-gray-300 text-sm">Meet legal obligations and protect against fraud</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Sharing */}
              <section id="data-sharing" className="scroll-mt-8">
                <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl border border-gray-800/40 p-8 lg:p-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <Users className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Data Sharing & Disclosure</h2>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-400/30 rounded-xl p-6 mb-6">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-red-300 mb-2">We Never Sell Your Data</h4>
                        <p className="text-red-200 text-sm">Your personal information is never sold to third parties for marketing purposes.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-white">We may share information only in these specific circumstances:</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-gray-700/30">
                        <h5 className="font-medium text-white mb-2">Service Providers</h5>
                        <p className="text-gray-300 text-sm">Trusted partners who help us deliver services (payment processing, hosting)</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-gray-700/30">
                        <h5 className="font-medium text-white mb-2">Legal Requirements</h5>
                        <p className="text-gray-300 text-sm">When required by law or to protect rights and safety</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Data Security */}
              <section id="data-security" className="scroll-mt-8">
                <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl border border-gray-800/40 p-8 lg:p-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center border border-green-400/30">
                      <Shield className="w-6 h-6 text-green-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Data Security</h2>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl p-8 mb-6 border border-green-400/20">
                    <p className="text-gray-300 leading-relaxed mb-4">
                      We implement industry-standard security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
                    </p>
                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-green-400/30">
                          <Lock className="w-6 h-6 text-green-400" />
                        </div>
                        <p className="font-medium text-white">SSL Encryption</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-blue-400/30">
                          <Shield className="w-6 h-6 text-blue-400" />
                        </div>
                        <p className="font-medium text-white">Secure Storage</p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-2 border border-purple-400/30">
                          <Eye className="w-6 h-6 text-purple-400" />
                        </div>
                        <p className="font-medium text-white">Access Controls</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Your Rights */}
              <section id="your-rights" className="scroll-mt-8">
                <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl border border-gray-800/40 p-8 lg:p-12">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center border border-purple-400/30">
                      <Lock className="w-6 h-6 text-purple-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Your Privacy Rights</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="border border-gray-700/50 bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Access & Portability</h4>
                        <p className="text-gray-300 text-sm">Request copies of your personal data in a portable format</p>
                      </div>
                      <div className="border border-gray-700/50 bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Correction</h4>
                        <p className="text-gray-300 text-sm">Update or correct inaccurate personal information</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="border border-gray-700/50 bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Deletion</h4>
                        <p className="text-gray-300 text-sm">Request deletion of your personal data (subject to legal requirements)</p>
                      </div>
                      <div className="border border-gray-700/50 bg-white/5 rounded-xl p-4">
                        <h4 className="font-semibold text-white mb-2">Opt-out</h4>
                        <p className="text-gray-300 text-sm">Unsubscribe from marketing communications at any time</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Cookies */}
              {/* <section id="cookies" className="scroll-mt-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-3xl border border-gray-700/50 p-8 lg:p-12 shadow-[0_0_10px_rgba(77,163,255,0.15)] hover:shadow-[0_0_15px_rgba(77,163,255,0.25)] transition-shadow duration-300">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center border border-orange-400/30">
                      <AlertCircle className="w-6 h-6 text-orange-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Cookies & Tracking Technologies</h2>
                  </div>
                  
                  <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-400/30">
                    <p className="text-gray-300 leading-relaxed mb-4">
                      We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookie preferences through your browser settings.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700/30">Essential Cookies</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700/30">Analytics</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700/30">Preferences</span>
                      <span className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-300 border border-gray-700/30">Marketing</span>
                    </div>
                  </div>
                </div>
              </section> */}

              {/* Contact */}
              <section id="contact" className="scroll-mt-8">
                <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl p-8 lg:p-12 border border-cyan-400/30">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <CheckCircle className="w-6 h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-2xl lg:text-3xl font-bold text-white">Contact Our Privacy Team</h2>
                  </div>
                  
                  <p className="text-gray-300 leading-relaxed mb-8">
                    Have questions about this Privacy Policy or how we handle your personal information? Our dedicated privacy team is here to help.
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white/10 rounded-xl p-6 border border-cyan-400/20">
                      <h4 className="font-semibold text-white mb-3">Email Us</h4>
                      <p className="text-gray-300 text-sm">Mytopiadetroit@gmail.com</p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-6 border border-cyan-400/20">
                      <h4 className="font-semibold text-white mb-3">Response Time</h4>
                      <p className="text-gray-300 text-sm">We respond within 48 hours</p>
                    </div>
                  </div>
                  
                 <button
  onClick={() =>
    window.open(
      "https://mail.google.com/mail/?view=cm&fs=1&to=Mytopiadetroit@gmail.com&su=Privacy%20Team%20Request&body=Hello, I want to contact the privacy team regarding...",
      "_blank"
    )
  }
  className="bg-transparent text-white border border-white/50 hover:border-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mt-8 shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)]"
>
  <span>Contact Privacy Team</span>
  <ChevronRight className="w-5 h-5 text-cyan-400" />
</button>

                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}