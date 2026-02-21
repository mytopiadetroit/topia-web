import React, { useEffect } from 'react';
import { AlertTriangle, Mail, Phone, Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';
import { getSuspensionStatus } from '../service/service';

export default function SuspendedAccount() {
  const router = useRouter();
  const { logout, user, refreshUserData } = useUser();
  const [suspensionReason, setSuspensionReason] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  // Debug: Log user data
  useEffect(() => {
    console.log('🔍 Suspend Page - User Data:', user);
    console.log('🔍 Suspension Reason:', user?.suspensionReason);
    
    // Also check localStorage
    const storedUser = localStorage.getItem('userDetail');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('🔍 LocalStorage User:', parsedUser);
        console.log('🔍 LocalStorage Suspension Reason:', parsedUser?.suspensionReason);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
  }, [user]);

  // Fetch suspension reason using service helper
  useEffect(() => {
    const fetchSuspensionReason = async () => {
      try {
        setLoading(true);
        
        console.log('🔄 Fetching suspension status...');
        const response = await getSuspensionStatus(router);
        
        console.log('✅ Suspension Status API Response:', response);
        
        if (response.success && response.data) {
          const reason = response.data.suspensionReason || '';
          console.log('✅ Suspension Reason from API:', reason);
          
          setSuspensionReason(reason);
          console.log('✅ State updated with reason:', reason);
        }
      } catch (error) {
        console.error('❌ Error fetching suspension reason:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuspensionReason();
  }, [router]); // Run once on mount

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleContactSupport = () => {
    router.push('/contact');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}>
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

      <div className="relative z-10 w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-white/5 backdrop-blur-[1px] rounded-3xl shadow-2xl overflow-hidden border border-gray-800/40">
          {/* Header Section */}
          <div className="bg-red-500/20 backdrop-blur-sm px-8 py-12 text-center relative border-b border-red-500/30">
            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-red-500/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-lg border border-red-500/30">
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Account Suspended
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                {loading ? (
                  'Loading suspension details...'
                ) : (
                  suspensionReason || 'Your account has been suspended due to a violation of our terms of service. Please contact our support team for more information.'
                )}
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-12">
            {/* Status Info */}
            <div className="bg-red-500/10 backdrop-blur-sm border-l-4 border-red-500/50 p-6 mb-8 rounded-r-lg">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-red-400 mr-3" />
                <h3 className="text-lg font-semibold text-white">Suspension Details</h3>
              </div>
              <div className="text-gray-300 space-y-2">
                <p><strong className="text-white">Status:</strong> <span className="text-red-400 font-medium">Suspended</span></p>
                <p><strong className="text-white">Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong className="text-white">Reason:</strong> {loading ? 'Loading...' : (suspensionReason || 'Violation of Terms of Service')}</p>
                <p><strong className="text-white">Reference ID:</strong> SP-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-cyan-500/10 backdrop-blur-sm border-l-4 border-cyan-500/50 p-6 mb-8 rounded-r-lg">
              <h3 className="text-lg font-semibold text-white mb-3">What to do next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3 mt-1 border border-cyan-500/30">1</span>
                  <span className="text-gray-300">Review our <a href="/terms" className="text-cyan-400 hover:underline">Terms of Service</a> and <a href="/privacypolicy" className="text-cyan-400 hover:underline">Community Guidelines</a>.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-cyan-500/20 text-cyan-300 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3 mt-1 border border-cyan-500/30">2</span>
                  <span className="text-gray-300">If you believe this is a mistake, please contact our support team for assistance.</span>
                </li>
              </ul>
            </div>

            {/* What This Means */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">What This Means</h3>
              <div className="text-gray-300 space-y-3">
                <p>During the suspension period, you will not be able to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Access your account dashboard</li>
                  <li>Make new purchases or transactions</li>
                  <li>Participate in community discussions</li>
                  <li>Redeem rewards or points</li>
                </ul>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-gray-800/40">
              <h3 className="text-xl font-bold text-white mb-4 text-center">Need Help?</h3>
              <p className="text-gray-300 text-center mb-6">
                Our support team is here to assist you with any questions about your suspension.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/60 transition-colors cursor-pointer">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="font-medium text-white">Email Support</div>
                    <div className="text-sm text-gray-400">Mytopiadetroit@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-gray-600/60 transition-colors cursor-pointer">
                  <Phone className="w-5 h-5 text-cyan-400" />
                  <div>
                    <div className="font-medium text-white">Phone Support</div>
                    <div className="text-sm text-gray-400">+313-231-8760</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={handleContactSupport}
                className="flex-1 bg-transparent text-white border border-white/50 hover:border-white font-medium py-3 px-6 rounded-lg transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 border border-gray-700/50 hover:bg-white/5 text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Need immediate assistance? Call us at{' '}
                <a href="tel:+313-231-8760" className="text-cyan-400 hover:underline">+1 (234) 567-890</a>
              </p>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-400">
                Suspension reviews typically take 3-5 business days to process.
              </p>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}