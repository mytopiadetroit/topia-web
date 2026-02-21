'use client';
import { useState, useEffect } from 'react';
import { ChevronRight, Shield, FileText, Users, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function Terms() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('terms');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen relative" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}>
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

      {/* Top notification bar */}




      {/* Navigation Pills */}
      <section className="py-8 px-4 border-b border-gray-700/50 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              { id: 'terms', label: 'Terms Overview', icon: FileText },
              { id: 'usage', label: 'Platform Usage', icon: Users },
              { id: 'content', label: 'Content Policy', icon: Shield },
              { id: 'liability', label: 'Liability', icon: AlertCircle }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-4xl font-semibold transition-all duration-300 ${activeSection === item.id
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                    : 'bg-white/10 text-gray-300 hover:bg-white/15 border border-white/20'
                  }`}
              >
                <item.icon className={`w-4 h-4 ${activeSection === item.id ? 'text-cyan-400' : 'text-gray-400'}`} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-6xl mx-auto">

          {/* Terms Overview */}
          <div id="terms" className="mb-16">
            <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl p-8 lg:p-12 mb-12 border border-gray-800/40">
              <div className="flex items-center mb-6">
                <div className="bg-cyan-500/20 rounded-full p-3 mr-4 border border-cyan-400/30">
                  <FileText className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-bold text-white">Welcome to Our Community</h2>
              </div>
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                These Terms of Use govern your access to and use of our wellness platform, including our website, mobile applications, and all related services. By accessing or using our platform, you agree to be bound by these terms.
              </p>
              <div className="bg-white/10 rounded-2xl p-6 border-l-4 border-cyan-400">
                <h3 className="font-semibold text-white mb-3">Key Points:</h3>
                <ul className="space-y-2 text-gray-300">
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 mt-1 mr-2 text-cyan-400" />
                    You must be 21 years or older to use our services
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 mt-1 mr-2 text-cyan-400" />
                    Our platform is for informational and community purposes
                  </li>
                  <li className="flex items-start">
                    <ChevronRight className="w-4 h-4 mt-1 mr-2 text-cyan-400" />
                    You're responsible for maintaining account security
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Platform Usage */}
          <div id="usage" className="mb-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-12">
              <div>
                <div className="mb-4">
                  <span className="inline-block text-white text-sm font-semibold px-4 py-2 bg-white/10 rounded-full border border-white/20">
                    Platform Guidelines
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Acceptable Use<br />
                  Policy
                </h2>
                <p className="text-gray-300 text-lg mb-8 leading-relaxed">
                  Our platform is designed to foster a supportive wellness community. Please use our services responsibly and respectfully.
                </p>
              </div>
              {/* <div className="flex justify-center">
                <Image 
                  src="/images/img2.png"
                  alt="Community guidelines"
                  className="w-full max-w-[300px] h-[250px] object-contain rounded-2xl"
                  width={300}
                  height={250}
                />
              </div> */}
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-8 border border-gray-800/40">
                <h3 className="text-xl font-bold text-white mb-4">Permitted Activities</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 mt-1 mr-2 text-green-500" />
                      <span className="text-gray-100">Browse and purchase wellness products</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 mt-1 mr-2 text-green-500" />
                      <span className="text-gray-100">Share authentic product reviews</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 mt-1 mr-2 text-green-500" />
                      <span className="text-gray-100">Participate in community discussions</span>
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 mt-1 mr-2 text-green-500" />
                      <span className="text-gray-100">Access educational resources</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 mt-1 mr-2 text-green-500" />
                      <span className="text-gray-100">Earn and redeem rewards</span>
                    </li>
                    <li className="flex items-start">
                      <ChevronRight className="w-4 h-4 mt-1 mr-2 text-green-500" />
                      <span className="text-gray-100">Connect with like-minded individuals</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-8 border border-gray-800/40">
                <h3 className="text-xl font-bold text-red-300 mb-4">Prohibited Activities</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-red-500" />
                      <span className="text-red-100">Posting false or misleading information</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-red-500" />
                      <span className="text-red-100">Harassment or inappropriate behavior</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-red-500" />
                      <span className="text-red-100">Unauthorized commercial activities</span>
                    </li>
                  </ul>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-red-500" />
                      <span className="text-red-100">Violation of intellectual property rights</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-red-500" />
                      <span className="text-red-100">Attempting to hack or compromise security</span>
                    </li>
                    <li className="flex items-start">
                      <AlertCircle className="w-4 h-4 mt-1 mr-2 text-red-500" />
                      <span className="text-red-100">Sharing personal medical advice</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Content Policy */}
          <div id="content" className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                Content Guidelines
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto leading-relaxed">
                We believe in fostering authentic, helpful, and respectful communication within our wellness community.
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 text-center border border-gray-800/40">
                <div className="bg-blue-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-blue-400/30">
                  <Shield className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="font-bold text-white mb-3">User-Generated Content</h3>
                <p className="text-gray-300 text-sm">
                  You retain ownership of your content but grant us license to use it on our platform for community benefit.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 text-center border border-gray-800/40">
                <div className="bg-green-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-green-400/30">
                  <Users className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="font-bold text-white mb-3">Community Standards</h3>
                <p className="text-gray-300 text-sm">
                  All content must be respectful, truthful, and contribute positively to our wellness community.
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 text-center border border-gray-800/40">
                <div className="bg-purple-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-purple-400/30">
                  <FileText className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="font-bold text-white mb-3">Content Moderation</h3>
                <p className="text-gray-300 text-sm">
                  We reserve the right to review, edit, or remove content that violates our community guidelines.
                </p>
              </div>
            </div>
          </div>

          {/* Liability Section */}
          <div id="liability" className="mb-16">
            <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl p-8 lg:p-12 border border-gray-800/40">
              <div className="text-center mb-8">
                <div className="bg-yellow-500/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center border border-yellow-400/30">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                  Important Disclaimers
                </h2>
                <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                  Please read these important limitations and disclaimers carefully.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/5 rounded-2xl p-6 border border-gray-800/40">
                  <h3 className="font-bold text-white mb-4">Medical Disclaimer</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Our platform provides general wellness information for educational purposes only. Content on our platform is not intended as medical advice, diagnosis, or treatment. Always consult with qualified healthcare professionals before making any health-related decisions.
                  </p>
                </div>

                <div className="bg-white/5 rounded-2xl p-6 border border-gray-800/40">
                  <h3 className="font-bold text-white mb-4">Limitation of Liability</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    We provide our platform "as is" and make no warranties about its availability, accuracy, or suitability for your needs. Our liability is limited to the maximum extent permitted by applicable law.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="text-center">
            <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl p-8 lg:p-12 border border-gray-800/40">
              <h2 className="text-3xl font-bold text-white mb-6">
                Questions About Our Terms?
              </h2>
              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                If you have any questions about these Terms of Use, please don't hesitate to contact our support team.
              </p>
          <button
  onClick={() =>
    window.open(
      "https://mail.google.com/mail/?view=cm&fs=1&to=Mytopiadetroit@gmail.com&su=Support Request&body=Hello, I need support regarding...",
      "_blank"
    )
  }
  className="bg-transparent text-white border border-white/50 hover:border-white px-8 py-4 rounded-4xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 mx-auto shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)]"
>
  <span>Contact Support</span>
  <ChevronRight className="w-5 h-5 text-cyan-400" />
</button>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}