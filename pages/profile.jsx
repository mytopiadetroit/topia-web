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

    fetchRewardStats();
    fetchPointsBalance();
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
    try {
      setUpdating(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('You need to login first');
        return;
      }

      const formData = new FormData();
      formData.append('fullName', updatedProfile.fullName);
      formData.append('phone', updatedProfile.phone);
      formData.append('day', updatedProfile.birthday.day);
      formData.append('month', updatedProfile.birthday.month);
      formData.append('year', updatedProfile.birthday.year);

      // Get user ID from localStorage
      const userDetail = localStorage.getItem('userDetail');
      let userId = null;
      
      if (userDetail) {
        const user = JSON.parse(userDetail);
        userId = user.id; // Use 'id' instead of 'userId'
      }
      
      if (!userId) {
        toast.error('User ID not found. Please login again.');
        router.push('/auth/login');
        return;
      }

      // Make API call to update profile
      const response = await Api('put', `auth/profile/${userId}`, formData, router);

      if (response.message === 'Profile updated successfully') {
        toast.success('Profile updated successfully');
        setProfile(updatedProfile);
        setEditMode(false);
      } else {
        toast.error('Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  // Update document
  const updateDocument = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('You need to login first');
        return;
      }

      const formData = new FormData();
      if (documentFile) {
        formData.append('govId', documentFile);
      }

      // Get user ID from localStorage
      const userDetail = localStorage.getItem('userDetail');
      let userId = null;
      
      if (userDetail) {
        const user = JSON.parse(userDetail);
        userId = user.id; // Use 'id' instead of 'userId'
      }
      
      if (!userId) {
        toast.error('User ID not found. Please login again.');
        router.push('/auth/login');
        return;
      }

      // Make API call to update profile with document
      const response = await Api('put', `auth/profile/${userId}`, formData, router);

      if (response.message === 'Profile updated successfully') {
        toast.success('Document updated successfully');
        setProfile({
          ...profile,
          governmentId: response.user.governmentId
        });
        setDocumentEditMode(false);
        setDocumentFile(null);
        setDocumentPreview(null);
      } else {
        toast.error('Failed to update document');
      }
    } catch (err) {
      console.error('Error updating document:', err);
      toast.error('Failed to update document');
    } finally {
      setUpdating(false);
    }
  };

  // Update avatar
  const updateAvatar = async () => {
    try {
      setUpdating(true);
      const token = localStorage.getItem('userToken');
      if (!token) {
        toast.error('You need to login first');
        return;
      }

      const formData = new FormData();
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      // Get user ID from localStorage
      const userDetail = localStorage.getItem('userDetail');
      let userId = null;
      let userData = null;
      
      if (userDetail) {
        userData = JSON.parse(userDetail);
        userId = userData.id; // Use 'id' instead of 'userId'
      }
      
      if (!userId) {
        toast.error('User ID not found. Please login again.');
        router.push('/auth/login');
        return;
      }

      // Make API call to update profile with avatar
      const response = await Api('put', `auth/profile/${userId}`, formData, router);
      console.log('Avatar update response:', response);

      if (response.message === 'Profile updated successfully') {
        toast.success('Avatar updated successfully');
        
        // Update profile state with the new avatar URL
        const updatedProfile = {
          ...profile,
          avatar: response.user.avatar
        };
        
        console.log('Updated profile with new avatar:', updatedProfile);
        setProfile(updatedProfile);
        setUpdatedProfile(updatedProfile);
        
        // Update localStorage userDetail with new avatar
        if (userData) {
          userData.avatar = response.user.avatar;
          localStorage.setItem('userDetail', JSON.stringify(userData));
          console.log('Updated userDetail in localStorage:', userData);
          
          // Trigger auth state change to update UI across the app
          document.dispatchEvent(new Event('auth-state-changed'));
        }
        
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        toast.error('Failed to update avatar');
      }
    } catch (err) {
      console.error('Error updating avatar:', err);
      toast.error('Failed to update avatar');
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

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 bg-gradient-to-b from-white to-blue-100">
      <div className="max-w-7xl mx-auto">
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>

               
                <button 
                  onClick={toggleEditMode}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  {editMode ? 'Cancel' : 'Edit'}
                  <Edit size={16} />
                </button>
                
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="fullName"
                      value={updatedProfile.fullName}
                      onChange={handleProfileChange}
                      className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="phone"
                      value={updatedProfile.phone}
                      onChange={handleProfileChange}
                      className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                  <p className="text-gray-900">{profile.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                  {editMode ? (
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        name="birthday.day"
                        placeholder="Day"
                        value={updatedProfile.birthday.day}
                        onChange={handleProfileChange}
                        className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        name="birthday.month"
                        placeholder="Month"
                        value={updatedProfile.birthday.month}
                        onChange={handleProfileChange}
                        className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <input
                        type="text"
                        name="birthday.year"
                        placeholder="Year"
                        value={updatedProfile.birthday.year}
                        onChange={handleProfileChange}
                        className="w-full p-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <p className="text-gray-900">{formatBirthday()}</p>
                  )}
                </div>
                {editMode && (
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <button
                      onClick={updateProfile}
                      disabled={updating}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      {updating ? 'Updating...' : 'Save Changes'}
                      {!updating && <Check size={16} />}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Document Submitted Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Document Submitted</h2>
                <button 
                  onClick={toggleDocumentEditMode}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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
                        <span className="mt-1 text-xs text-gray-500">Upload ID</span>
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
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
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
                    <span className="text-gray-900 font-medium">Document</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">Status: </span>
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
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                    <p className="text-sm text-gray-600 mt-1">
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
                  <div className="text-sm text-gray-500 bg-yellow-50 p-3 rounded-lg">
                    <p>SMS notifications disabled on {new Date(profile.smsOptOutDate).toLocaleDateString()}</p>
                    <p className="mt-1">You can re-enable them anytime by toggling the switch above.</p>
                  </div>
                )}
                
                {/* <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <p><strong>Note:</strong> You can also text "STOP" to our SMS number to unsubscribe, or "START" to resubscribe.</p>
                </div> */}
              </div>
            </div>

            {/* My Rewards Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">My Rewards</h2>
                <button onClick={() => router.push('/rewards')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  View All
                </button>
              </div>
              <img src="/images/line.png" alt="edit" className='w-full h-[1px] mb-10'  />
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-600 font-medium mb-1">Points Balance</p>
                      <p className="text-2xl font-bold text-purple-700">${pointsBalance}</p>
                    </div>
                    <div className="text-3xl">💎</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium mb-1">Total Earned</p>
                      <p className="text-2xl font-bold text-green-700">${rewardStats.totalEarned}</p>
                    </div>
                    <div className="text-3xl">💰</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-700">{rewardStats.pendingRequests}</p>
                    </div>
                    <div className="text-3xl">⏳</div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-600 font-medium mb-1">Approved</p>
                      <p className="text-2xl font-bold text-blue-700">{rewardStats.approvedRequests}</p>
                    </div>
                    <div className="text-3xl">✅</div>
                  </div>
                </div>
              </div>

              <div className="text-center">
                <button 
                  onClick={() => router.push('/rewards')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Claim More Rewards 🎁
                </button>
              </div>
            </div>

            {/* My Orders Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">My Orders</h2>
                <button onClick={() => router.push('/myorders')} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
                  <div className="text-center text-gray-500 py-8">No orders yet</div>
                ) : (
                 orders.slice(0, 2).map((order, idx) => (
  <div key={order._id || idx} className="bg-[#E7E7E7] rounded-xl shadow-lg border p-4">
    <div className="flex justify-between items-start mb-3">
     <span className="text-sm font-medium text-gray-700">Order ID: {getDisplayOrderNumber(order.orderNumber) || (order._id || '').slice(8)}</span>
      <div className="text-right">
        <span className="text-sm text-gray-500">Total: </span>
        <span className="font-semibold text-gray-900">$ {Number(order.totalAmount || 0).toFixed(2)}</span>
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
          <div className="w-12 h-12 bg-[#2E2E2E40] rounded-lg"></div>
        )}
        <span className="text-gray-900 font-medium">
          {(order.items && order.items[0]?.name) || 'Order Items'}
        </span>
      </div>
      <div className="text-right">
        <div className="mb-1">
          <span className="text-sm text-gray-500">Status: </span>
          <span className="text-blue-600 font-medium">
            {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
          </span>
        </div>
        <div>
          <span className="text-sm text-gray-500">Items: </span>
          <span className="font-semibold text-gray-900">{order.items ? order.items.length : 0}</span>
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
