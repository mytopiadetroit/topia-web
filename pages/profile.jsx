import React, { useState, useEffect, useRef } from 'react';
import { Edit, FileText, Upload, X, Check, Camera } from 'lucide-react';
import { Api } from '../service/service';
import { updateSMSPreferences } from '../service/service';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { useUser } from '../context/UserContext';
import SubscriptionStatus from '../components/SubscriptionStatus';

const Profile = () => {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useUser();
  const [profile, setProfile] = useState({
    _id: '',
    fullName: '',
    phone: '',
    email: '',
    birthday: { day: '', month: '', year: '' },
    documentStatus: 'Processing',
    status: 'pending',
    governmentId: '',
    smsOptOut: false,
    smsOptOutDate: null,
    isTopiaCircleMember: false,
    subscriptionStatus: 'inactive'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [documentEditMode, setDocumentEditMode] = useState(false);
  const [updatedProfile, setUpdatedProfile] = useState({});
  const [avatarFile, setAvatarFile] = useState(null);
  const [documentFile, setDocumentFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [updating, setUpdating] = useState(false);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const [rewardStats, setRewardStats] = useState({
    totalEarned: 0,
    pendingRequests: 0,
    approvedRequests: 0
  });
  const [pointsBalance, setPointsBalance] = useState(0);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  useEffect(() => {
    // Only check after auth loading is complete
    if (!authLoading) {
      // Check if user is logged in using UserContext
      if (!isLoggedIn) {
        // Show toast notification
        toast.error('Please login to view your profile', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            backgroundColor: '#f44336',
            color: 'white',
            fontWeight: '500',
            borderRadius: '8px'
          }
        });
        
        // Redirect to login page
        router.push('/auth/login');
        return;
      }
      
      const fetchProfile = async () => {
        try {
          // Get token from localStorage
          const token = localStorage.getItem('userToken');
          
          if (!token) {
            setError('You need to login first');
            setLoading(false);
            return;
          }
          
          // Check if we have userDetail in localStorage with avatar
          const userDetail = localStorage.getItem('userDetail');
          let userDataFromStorage = null;
          
          if (userDetail) {
            try {
              userDataFromStorage = JSON.parse(userDetail);
              console.log('User data from localStorage:', userDataFromStorage);
            } catch (e) {
              console.error('Error parsing userDetail from localStorage:', e);
            }
          }

          // Using Api helper function from service.js
          const response = await Api('get', 'auth/profile', null, router);
          
          console.log('Profile API response:', response);

          if (response.success) {
            // Create profile data from API response
            const profileData = {
              _id: response.user._id || response.user.id, // Add user ID
              fullName: response.user.fullName || '',
              phone: response.user.phone || '',
              email: response.user.email || '',
              birthday: response.user.birthday || { day: '', month: '', year: '' },
              documentStatus: response.user.documentStatus || 'Processing',
              status: response.user.status || 'pending',
              governmentId: response.user.governmentId || '',
              smsOptOut: response.user.smsOptOut || false, // Add SMS opt-out status
              smsOptOutDate: response.user.smsOptOutDate || null, // Add SMS opt-out date
              // Prioritize avatar from API response, but fall back to localStorage if API doesn't return it
              avatar: response.user.avatar || (userDataFromStorage?.avatar) || '',
              // Add Topia Circle membership fields
              isTopiaCircleMember: response.user.isTopiaCircleMember || false,
              subscriptionStatus: response.user.subscriptionStatus || 'inactive'
            };
            
            console.log('Final profile data with avatar:', profileData);
            
            // Update profile state
            setProfile(profileData);
            setUpdatedProfile(profileData);
            
            // If we got avatar from localStorage but not from API, update localStorage with API data
            if (!response.user.avatar && userDataFromStorage?.avatar) {
              console.log('Updating API user data with avatar from localStorage');
              // Update the user in API with the avatar from localStorage
              const userId = userDataFromStorage.id;
              if (userId) {
                try {
                  const updateResponse = await Api('put', `auth/profile/${userId}`, { avatar: userDataFromStorage.avatar }, router);
                  console.log('Updated API with avatar from localStorage:', updateResponse);
                } catch (err) {
                  console.error('Error updating API with avatar from localStorage:', err);
                }
              }
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
          setError('Failed to load profile data');
        } finally {
          setLoading(false);
        }
    };

    fetchProfile();
    
    // Fetch user's recent orders
    const fetchOrders = async () => {
      try {
        setOrdersLoading(true);
        const res = await Api('get', 'orders', null, router);
        console.log('my',res)
        if (res?.success !== false && Array.isArray(res?.data || res)) {
          // Some controllers return {data: []}, some return [] directly
          setOrders(res.data || res);
        } else if (Array.isArray(res)) {
          setOrders(res);
        } else {
          setOrders([]);
        }
      } catch (e) {
        console.error('Error fetching orders:', e);
        setOrders([]);
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();

    // Fetch user's reward statistics
    const fetchRewardStats = async () => {
      try {
        const response = await Api('get', 'rewards/history', null, router);
        if (response.success) {
          const rewards = response.data || [];
          const totalEarned = response.totalEarned || 0;
          const pendingRequests = rewards.filter(r => r.status === 'pending').length;
          const approvedRequests = rewards.filter(r => r.status === 'approved').length;
          
          setRewardStats({
            totalEarned,
            pendingRequests,
            approvedRequests
          });
        }
      } catch (error) {
        console.error('Error fetching reward stats:', error);
      }
    };

    // Fetch user's points balance
    const fetchPointsBalance = async () => {
      try {
        const response = await Api('get', 'points/my-points', null, router);
        if (response.success) {
          setPointsBalance(response.data.currentBalance || 0);
        }
      } catch (error) {
        console.error('Error fetching points balance:', error);
      }
    };

    // Check for pending change requests
    const checkPendingChanges = async () => {
      try {
        const response = await Api('get', 'pending-changes/my-requests', null, router);
        if (response.success) {
          const pendingRequests = response.data.filter(r => r.status === 'pending');
          setHasPendingChanges(pendingRequests.length > 0);
        }
      } catch (error) {
        console.error('Error checking pending changes:', error);
      }
    };

    fetchRewardStats();
    fetchPointsBalance();
    checkPendingChanges();
  }
  }, [router, isLoggedIn, authLoading]);

  // Format birthday for display
  const formatBirthday = () => {
    if (!profile.birthday) return '';
    const { day, month, year } = profile.birthday;
    if (!day || !month || !year) return '';
    return `${day}-${month}-${year}`;
  };

  // Handle profile edit mode toggle
  const toggleEditMode = () => {
    setEditMode(!editMode);
    if (!editMode) {
      setUpdatedProfile({
        ...profile
      });
    }
  };

  // Handle document edit mode toggle
  const toggleDocumentEditMode = () => {
    setDocumentEditMode(!documentEditMode);
  };

  // Handle profile field changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setUpdatedProfile({
        ...updatedProfile,
        [parent]: {
          ...updatedProfile[parent],
          [child]: value
        }
      });
    } else {
      setUpdatedProfile({
        ...updatedProfile,
        [name]: value
      });
    }
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle document file selection
  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setDocumentFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle SMS preferences toggle
  const handleSMSToggle = async (e) => {
    const newOptOutStatus = !e.target.checked; // If unchecked, user wants to opt out
    
    console.log('SMS Toggle - Profile ID:', profile._id);
    console.log('SMS Toggle - New Opt Out Status:', newOptOutStatus);
    
    if (!profile._id) {
      toast.error('User ID not found. Please refresh the page.', {
        position: "top-center",
        autoClose: 5000,
      });
      return;
    }
    
    try {
      setUpdating(true);
      const response = await updateSMSPreferences(profile._id, newOptOutStatus, router);
      
      if (response.success) {
        // Update profile state
        setProfile(prev => ({
          ...prev,
          smsOptOut: newOptOutStatus,
          smsOptOutDate: newOptOutStatus ? new Date() : null
        }));
        
        toast.success(response.message, {
          position: "top-center",
          autoClose: 3000,
        });
      } else {
        toast.error(response.message || 'Failed to update SMS preferences', {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      console.error('Error updating SMS preferences:', error);
      toast.error('Failed to update SMS preferences', {
        position: "top-center",
        autoClose: 5000,
      });
    } finally {
      setUpdating(false);
    }
  };

  // Update profile
  const updateProfile = async () => {
    if (hasPendingChanges) {
      toast.error('You already have a pending change request. Please wait for admin approval.');
      return;
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('You need to login first');
        return;
      }

      const userDetail = localStorage.getItem('userDetail');
      let userId = null;
      
      if (userDetail) {
        const user = JSON.parse(userDetail);
        userId = user.id;
      }
      
      if (!userId) {
        toast.error('User ID not found. Please login again.');
        router.push('/auth/login');
        return;
      }

      const requestedData = {
        fullName: updatedProfile.fullName,
        phone: updatedProfile.phone,
        birthday: {
          day: updatedProfile.birthday.day,
          month: updatedProfile.birthday.month,
          year: updatedProfile.birthday.year
        }
      };

      const response = await Api('post', 'pending-changes', {
        changeType: 'profile',
        requestedData
      }, router);

      if (response.success) {
        toast.success('Change request submitted! Admin will review it.');
        setEditMode(false);
        setHasPendingChanges(true);
      } else {
        toast.error(response.message || 'Failed to submit change request');
      }
    } catch (err) {
      console.error('Error submitting change request:', err);
      toast.error('Failed to submit change request');
    } finally {
      setUpdating(false);
    }
  };

  // Update document
  const updateDocument = async () => {
    if (hasPendingChanges) {
      toast.error('You already have a pending change request. Please wait for admin approval.');
      return;
    }

    try {
      setUpdating(true);
      
      if (!documentFile) {
        toast.error('Please select a document first');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        const requestedData = {
          governmentId: base64String
        };

        try {
          const response = await Api('post', 'pending-changes', {
            changeType: 'account',
            requestedData
          }, router);

          if (response.success) {
            toast.success('Document change request submitted! Admin will review it.');
            setDocumentEditMode(false);
            setDocumentFile(null);
            setDocumentPreview(null);
            setHasPendingChanges(true);
          } else {
            toast.error(response.message || 'Failed to submit change request');
          }
        } catch (err) {
          console.error('Error submitting document change request:', err);
          toast.error('Failed to submit change request');
        }
      };
      
      reader.readAsDataURL(documentFile);
    } catch (err) {
      console.error('Error processing document:', err);
      toast.error('Failed to process document');
    } finally {
      setUpdating(false);
    }
  };

  // Update avatar
  const updateAvatar = async () => {
    if (hasPendingChanges) {
      toast.error('You already have a pending change request. Please wait for admin approval.');
      return;
    }

    try {
      setUpdating(true);
      
      if (!avatarFile) {
        toast.error('Please select an avatar first');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        
        const requestedData = {
          avatar: base64String
        };

        try {
          const response = await Api('post', 'pending-changes', {
            changeType: 'account',
            requestedData
          }, router);

          if (response.success) {
            toast.success('Avatar change request submitted! Admin will review it.');
            setAvatarFile(null);
            setAvatarPreview(null);
            setHasPendingChanges(true);
          } else {
            toast.error(response.message || 'Failed to submit change request');
          }
        } catch (err) {
          console.error('Error submitting avatar change request:', err);
          toast.error('Failed to submit change request');
        }
      };
      
      reader.readAsDataURL(avatarFile);
    } catch (err) {
      console.error('Error processing avatar:', err);
      toast.error('Failed to process avatar');
    } finally {
      setUpdating(false);
    }
  };

  const getDisplayOrderNumber = (orderNumber) => {
  if (orderNumber && orderNumber.startsWith('ORD')) {
    const numbers = orderNumber.replace('ORD', '');
    return `ORD${numbers.slice(-4)}`;
  }
  return orderNumber;
};

  if (loading) return <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}><span className="text-white">Loading...</span></div>;
  if (error) return <div className="min-h-screen relative flex items-center justify-center text-red-300" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}>{error}</div>;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 relative" style={{ background: 'radial-gradient(circle at 70% 40%, #101826 0%, #0B0F1A 40%, #060A12 100%)' }}>
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

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Profile Picture positioned on the left */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile Picture Section */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8CABFF59] shadow-lg relative group">
              {avatarPreview ? (
                 <img 
                   src={avatarPreview} 
                   alt="Profile Preview" 
                   className="w-full h-full object-cover"
                 />
               ) : profile.avatar ? (
                 <img 
                   src={profile.avatar} 
                   alt="Profile" 
                   className="w-full h-full object-cover"
                 />
               ) : (
                 <img 
                   src="/images/pic1.png" 
                   alt="Profile" 
                   className="w-full h-full object-cover"
                 />
               )}
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={() => fileInputRef.current.click()}>
                <Camera size={24} className="text-white" />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleAvatarChange} 
                className="hidden" 
                accept="image/*"
              />
            </div>
            {avatarFile && (
              <div className="mt-2 flex justify-center space-x-2">
                <button 
                  onClick={updateAvatar} 
                  disabled={updating}
                  className="p-1 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  <Check size={16} />
                </button>
                <button 
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview(null);
                  }}
                  className="p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Personal Information Section */}
            <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 border border-gray-800/40">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Personal Information</h2>

               
                <button 
                  onClick={toggleEditMode}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-lg text-sm font-medium transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                  <Edit size={16} />
                </button>
                
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="fullName"
                      value={updatedProfile.fullName}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    />
                  ) : (
                    <p className="text-gray-300">{profile.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="phone"
                      value={updatedProfile.phone}
                      onChange={handleProfileChange}
                      className="w-full p-2 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    />
                  ) : (
                    <p className="text-gray-300">{profile.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                  <p className="text-gray-300">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Date of Birth</label>
                  {editMode ? (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        name="birthday.day"
                        placeholder="Day"
                        value={updatedProfile.birthday.day}
                        onChange={handleProfileChange}
                        className="w-full p-2 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      />
                      <input
                        type="text"
                        name="birthday.month"
                        placeholder="Month"
                        value={updatedProfile.birthday.month}
                        onChange={handleProfileChange}
                        className="w-full p-2 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      />
                      <input
                        type="text"
                        name="birthday.year"
                        placeholder="Year"
                        value={updatedProfile.birthday.year}
                        onChange={handleProfileChange}
                        className="w-full p-2 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-300">{formatBirthday()}</p>
                  )}
                </div>
                {editMode && (
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <button
                      onClick={updateProfile}
                      disabled={updating}
                      className="px-4 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-lg transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105 flex items-center gap-2"
                    >
                      {updating ? 'Updating...' : 'Save Changes'}
                      {!updating && <Check size={16} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Document Submitted Section */}
            <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 border border-gray-800/40">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">Document Submitted</h2>
                <button 
                  onClick={toggleDocumentEditMode}
                  className="flex items-center gap-2 px-4 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-lg text-sm font-medium transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105"
                >
                  {documentEditMode ? 'Cancel' : 'Edit'}
                  <Edit size={16} />
                </button>
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[0.5px] mb-10'  />
              
              {documentEditMode ? (
                <div className="space-y-4">
                  <div className="flex items-center">
                    {documentPreview ? (
                      <div className="relative w-40 h-24 border border-gray-300 rounded-md overflow-hidden">
                        <img src={documentPreview} alt="Document Preview" className="w-full h-full object-cover" />
                        <button 
                          onClick={() => {
                            setDocumentFile(null);
                            setDocumentPreview(null);
                          }}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => documentInputRef.current.click()}
                        className="w-40 h-24 border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <Upload size={20} className="text-gray-400" />
                        <span className="mt-1 text-xs text-gray-400">Upload ID</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={documentInputRef} 
                      onChange={handleDocumentChange} 
                      className="hidden" 
                      accept="image/*,.pdf"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={updateDocument}
                      disabled={updating || !documentFile}
                      className="px-4 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-lg transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] flex items-center gap-2 disabled:opacity-50 transform hover:scale-105"
                    >
                      {updating ? 'Updating...' : 'Save Document'}
                      {!updating && documentFile && <Check size={16} />}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FileText size={24} className="text-gray-600" />
                    </div>
                    <span className="text-white font-medium">Document</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-300">Status: </span>
                    <span className={`font-medium ${
                      profile.status === 'verified' ? 'text-green-600' :
                      profile.status === 'pending' ? 'text-yellow-600' :
                      profile.status === 'suspend' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {profile.status ? profile.status.charAt(0).toUpperCase() + profile.status.slice(1) : 'Processing'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Status Section */}
            <SubscriptionStatus user={profile} />

            {/* SMS Preferences Section */}
            <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 border border-gray-800/40">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">SMS Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-white">SMS Notifications</h3>
                    <p className="text-sm text-gray-300 mt-1">
                      Receive SMS notifications for birthday wishes, promotions, and special offers
                    </p>
                  </div>
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!profile.smsOptOut}
                        onChange={handleSMSToggle}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
                
                {profile.smsOptOut && profile.smsOptOutDate && (
                  <div className="text-sm text-gray-300 bg-yellow-900/30 p-3 rounded-lg border border-yellow-700/50">
                    <p>SMS notifications disabled on {new Date(profile.smsOptOutDate).toLocaleDateString()}</p>
                    <p className="mt-1">You can re-enable them anytime by toggling the switch above.</p>
                  </div>
                )}
                
                {/* <div className="text-xs text-gray-400 bg-blue-900/30 p-3 rounded-lg border border-blue-700/50">
                  <p><strong>Note:</strong> You can also text "STOP" to our SMS number to unsubscribe, or "START" to resubscribe.</p>
                </div> */}
              </div>
            </div>

            {/* My Rewards Section */}
            <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 border border-gray-800/40">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">My Rewards</h2>
                <button onClick={() => router.push('/rewards')} className="px-4 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-lg text-sm font-medium transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105">
                  View All
                </button>
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-300 font-medium mb-1">Points Balance</p>
                      <p className="text-2xl font-bold text-purple-200">${pointsBalance}</p>
                    </div>
                    <div className="text-3xl">💎</div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-300 font-medium mb-1">Total Earned</p>
                      <p className="text-2xl font-bold text-green-200">${rewardStats.totalEarned}</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-300 font-medium mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-200">{rewardStats.pendingRequests}</p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-300 font-medium mb-1">Approved</p>
                      <p className="text-2xl font-bold text-blue-200">{rewardStats.approvedRequests}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => router.push('/rewards')}
                  className="px-6 py-3 bg-transparent text-white border border-white/50 hover:border-white rounded-lg transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] font-medium transform hover:scale-105"
                >
                  Claim More Rewards 🎁
                </button>
              </div>
            </div>

            {/* My Orders Section */}
            <div className="bg-white/5 backdrop-blur-[1px] rounded-2xl p-6 border border-gray-800/40">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-white">My Orders</h2>
                <button onClick={() => router.push('/myorders')} className="px-4 py-2 bg-transparent text-white border border-white/50 hover:border-white rounded-lg text-sm font-medium transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105">
                  View All
                </button>
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
              <div className="space-y-4">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center text-gray-300 py-8">No orders yet</div>
                ) : (
                 orders.slice(0, 2).map((order, idx) => (
  <div key={order._id || idx} className="bg-white/10 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 shadow-[0_0_10px_rgba(77,163,255,0.15)]">
    <div className="flex justify-between items-start mb-3">
     <span className="text-sm font-medium text-gray-300">Order ID: {getDisplayOrderNumber(order.orderNumber) || (order._id || '').slice(8)}</span>
      <div className="text-right">
        <span className="text-sm text-gray-300">Total: </span>
        <span className="font-semibold text-white">$ {Number(order.totalAmount || 0).toFixed(2)}</span>
      </div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {order.items && order.items[0]?.image ? (
          <img 
            src={order.items[0].image} 
            alt={order.items[0].name || 'Product'} 
            className="w-12 h-12 object-cover rounded-lg" 
          />
        ) : (
          <div className="w-12 h-12 bg-white/10 rounded-lg"></div>
        )}
        <span className="text-white font-medium">
          {(order.items && order.items[0]?.name) || 'Order Items'}
        </span>
      </div>
      <div className="text-right">
        <div className="mb-1">
          <span className="text-sm text-gray-300">Status: </span>
          <span className="text-cyan-400 font-medium">
            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-300">Items: </span>
          <span className="font-semibold text-white">{order.items ? order.items.length : 0}</span>
        </div>
      </div>
    </div>
  </div>
))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
