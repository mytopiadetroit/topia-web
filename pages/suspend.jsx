import React from 'react';
import { AlertTriangle, Mail, Phone, Clock, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';

export default function SuspendedAccount() {
 const router = useRouter();

     const handleNavigation = () => {
    router.push('/contact');
  };
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      {/* Background Pattern */}
     

      <div className="relative z-10 w-full max-w-6xl">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
          {/* Header Section */}
          <div className="bg-[#80A6F7] px-8 py-12 text-center relative">
            
            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg">
                <AlertTriangle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Account Suspended
              </h1>
              <p className="text-white text-lg max-w-md mx-auto">
                Your account has been temporarily suspended due to policy violations
              </p>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-12">
            {/* Status Info */}
            <div className="bg-[#80A6F7] border-l-4 border-[#80A6F7] p-6 mb-8 rounded-r-lg">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-white mr-3" />
                <h3 className="text-lg font-semibold text-white">Suspension Details</h3>
              </div>
              <div className="text-white space-y-2">
                <p><strong>Status:</strong> Temporarily Suspended</p>
                <p><strong>Date:</strong> January 15, 2025</p>
                <p><strong>Reason:</strong> Community Guidelines Violation</p>
                <p><strong>Reference ID:</strong> #SP-2025-0115-001</p>
              </div>
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
                    <div className="text-sm text-gray-500">support@topia.com</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer">
                  <Phone className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-900">Phone Support</div>
                    <div className="text-sm text-gray-500">1-800-TOPIA-HELP</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button onClick={handleNavigation} className="flex-1 bg-gray-900 hover:bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2">
                <span>Contact Support</span>
              </button>
              
              <button className="flex-1 border-2 border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back</span>
              </button>
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