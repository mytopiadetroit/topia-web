import React, { useEffect } from 'react';
import { AlertTriangle, Mail, Phone, Clock, ArrowLeft, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';
import { useUser } from '../context/UserContext';
import { toast } from 'react-toastify';

export default function SuspendedAccount() {
  const router = useRouter();
  const { logout } = useUser();



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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Background Pattern */}
     

      <div className="relative z-10 w-full max-w-4xl">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="bg-red-600 px-8 py-12 text-center relative">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-black"></div>
            </div>
            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                <AlertTriangle className="w-12 h-12 text-red-600" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Account Suspended
              </h1>
              <p className="text-white text-lg max-w-2xl mx-auto">
                Your account has been suspended due to a violation of our terms of service.
                Please contact our support team for more information.
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-12">
            {/* Status Info */}
            <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-r-lg">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-red-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">Suspension Details</h3>
              </div>
              <div className="text-gray-700 space-y-2">
                <p><strong>Status:</strong> <span className="text-red-600 font-medium">Suspended</span></p>
                <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Reason:</strong> Violation of Terms of Service</p>
                <p><strong>Reference ID:</strong> SP-{new Date().getFullYear()}-{String(new Date().getMonth() + 1).padStart(2, '0')}-{String(new Date().getDate()).padStart(2, '0')}</p>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 mb-8 rounded-r-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">What to do next?</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3 mt-1">1</span>
                  <span className="text-gray-700">Review our <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="/privacypolicy" className="text-blue-600 hover:underline">Community Guidelines</a>.</span>
                </li>
                <li className="flex items-start">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full mr-3 mt-1">2</span>
                  <span className="text-gray-700">If you believe this is a mistake, please contact our support team for assistance.</span>
                </li>
              </ul>
            </div>

            {/* What This Means */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">What This Means</h3>
              <div className="text-gray-600 space-y-3">
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
            <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Need Help?</h3>
              <p className="text-gray-600 text-center mb-6">
                Our support team is here to assist you with any questions about your suspension.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                  <Mail className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">Email Support</div>
                    <div className="text-sm text-gray-500">Mytopiadetroit@gmail.com</div>
                  </div>
                </div>
                <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">Phone Support</div>
                    <div className="text-sm text-gray-500">+313-231-8760</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <button
                onClick={handleContactSupport}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-5 h-5" />
                Contact Support
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Need immediate assistance? Call us at{' '}
                <a href="tel:+1234567890" className="text-blue-600 hover:underline">+1 (234) 567-890</a>
              </p>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500">
                Suspension reviews typically take 3-5 business days to process.
              </p>
            </div>
          </div>
        </div>

       
      </div>
    </div>
  );
}