import React, { useState, useEffect } from 'react';
import { Edit, FileText } from 'lucide-react';
import { Api } from '../services/service';
import { useRouter } from 'next/router';

const Profile = () => {
  const router = useRouter();
  const [profile, setProfile] = useState({
    fullName: '',
    phone: '',
    email: '',
    birthday: { day: '', month: '', year: '' },
    documentStatus: 'Processing'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setError('You need to login first');
          setLoading(false);
          return;
        }

        // Using Api helper function from service.js
        const response = await Api('get', 'auth/profile', null, router);

        if (response.success) {
          setProfile({
            fullName: response.user.fullName || '',
            phone: response.user.phone || '',
            email: response.user.email || '',
            birthday: response.user.birthday || { day: '', month: '', year: '' },
            documentStatus: 'Processing' // This is static as per requirements
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format birthday for display
  const formatBirthday = () => {
    if (!profile.birthday) return '';
    const { day, month, year } = profile.birthday;
    if (!day || !month || !year) return '';
    return `${day}-${month}-${year}`;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white to-blue-100">
      <div className="max-w-7xl mx-auto">
        {/* Profile Picture positioned on the left */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Picture Section */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8CABFF59] shadow-lg">
              <img 
                src="/images/pic.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

               
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Edit
                  <Edit size={16} />
                </button>
                
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  <p className="text-gray-900">{profile.fullName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  <p className="text-gray-900">{profile.phone}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                  <p className="text-gray-900">{formatBirthday()}</p>
                </div>
              </div>
            </div>

            {/* Document Submitted Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Document Submitted</h2>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Edit
                  <Edit size={16} />
                </button>
                
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[0.5px] mb-10'  />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText size={24} className="text-gray-600" />
                  </div>
                  <span className="text-gray-900 font-medium">Document</span>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Status: </span>
                  <span className="text-pink-600 font-medium">Processing</span>
                </div>
              </div>
            </div>

            {/* My Orders Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  View All
                </button>
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
              <div className="space-y-4">
                {/* Order 1 */}
                <div className="bg-[#E7E7E7] rounded-xl shadow-lg border-b h p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">Order ID: 12345</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Total: </span>
                      <span className="font-semibold text-gray-900">$ 50</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#2E2E2E40] rounded-lg"></div>
                      <span className="text-gray-900 font-medium">Lion's Mane Capsule</span>
                    </div>
                    <div className="text-right">
                      <div className="mb-1">
                        <span className="text-sm text-gray-500">Status: </span>
                        <span className="text-blue-600 font-medium">Ready for Pick-Up</span>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Amount: </span>
                        <span className="font-semibold text-gray-900">$ 50</span>
                      </div>
                    </div>
                  </div>
                </div>
                <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />

                {/* Order 2 */}
                <div className="bg-[#E7E7E7] shadow-lg border-b  rounded-xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-700">Order ID: 12345</span>
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Total: </span>
                      <span className="font-semibold text-gray-900">$ 100</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2E2E2E40] rounded-lg"></div>
                        <span className="text-gray-900 font-medium">Lion's Mane Capsule</span>
                      </div>
                      <div className="text-right">
                        <div className="mb-1">
                          <span className="text-sm text-gray-500">Status: </span>
                          <span className="text-green-600 font-medium">Picked</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Amount: </span>
                          <span className="font-semibold text-gray-900">$ 50</span>
                        </div>
                      </div>
                    </div>
                    <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
                    {/* Item 2 */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#2E2E2E40] rounded-lg"></div>
                        <span className="text-gray-900 font-medium">Shroom Chocolate</span>
                      </div>
                      <div className="text-right">
                        <div className="mb-1">
                          <span className="text-sm text-gray-500">Status: </span>
                          <span className="text-green-600 font-medium">Picked</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Amount: </span>
                          <span className="font-semibold text-gray-900">$ 50</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
