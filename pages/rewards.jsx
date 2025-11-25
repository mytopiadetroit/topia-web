import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import { 
  fetchRewardTasks, 
  submitRewardClaim, 
  fetchUserRewards,
  fetchRewardRequests,
   
} from '../service/service';
import { toast } from 'react-toastify';

const RewardsPage = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('claim');
  const [rewardTasks, setRewardTasks] = useState([]);
  const [rewardHistory, setRewardHistory] = useState([]);
  const [rewardRequests, setRewardRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [claimData, setClaimData] = useState({
    taskId: '',
    proofType: 'text',
    proofText: '',
    proofImage: null,
    proofAudio: null,
    proofVideo: null
  });

  useEffect(() => {
    loadRewardData();
  }, [activeTab]);

  const loadRewardData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'claim') {
        // Load reward tasks from backend (dynamic)
        try {
          console.log('🔄 Fetching reward tasks...');
          const response = await fetchRewardTasks(router);
          console.log('📥 Reward tasks response:', response);
          
          if (response.success) {
            console.log('✅ Tasks loaded:', response.data);
            setRewardTasks(response.data || []);
          } else {
            console.log('❌ Failed to load tasks:', response.message);
            setRewardTasks([]);
          }
        } catch (error) {
          console.error('❌ Error fetching tasks:', error);
          setRewardTasks([]);
        }
      } else if (activeTab === 'history') {
        const response = await fetchUserRewards(router);
        if (response.success) {
          setRewardHistory(response.data);
        }
      } else if (activeTab === 'requests') {
        const response = await fetchRewardRequests(router);
        if (response.success) {
          setRewardRequests(response.data);
        }
      }
    } catch (error) {
      console.error('Error loading reward data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskClick = (task) => {
    if (!task.completed) {
      setSelectedTask(task);
      setClaimData({ ...claimData, taskId: task.id });
      setShowClaimModal(true);
    }
  };

  const handleClaimSubmit = async () => {
    if (!selectedTask || !claimData.proofText.trim()) {
      toast.error('Please provide proof description');
      return;
    }

    console.log('Selected Task:', selectedTask);
    console.log('Task ID being sent:', selectedTask.id);

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('taskId', selectedTask.id);
      formData.append('proofType', claimData.proofType);
      formData.append('proofText', claimData.proofText);
      
      if (claimData.proofImage) {
        formData.append('proofImage', claimData.proofImage);
      }
      if (claimData.proofAudio) {
        formData.append('proofAudio', claimData.proofAudio);
      }
      if (claimData.proofVideo) {
        formData.append('proofVideo', claimData.proofVideo);
      }

      const response = await submitRewardClaim(router, formData);
      if (response.success) {
        toast.success('Reward claim submitted successfully! 🎉');
        setShowClaimModal(false);
        setClaimData({
          taskId: '',
          proofType: 'text',
          proofText: '',
          proofImage: null,
          proofAudio: null,
          proofVideo: null
        });
        loadRewardData();
      } else {
        toast.error(response.message || 'Failed to submit reward claim');
      }
    } catch (error) {
      console.error('Error submitting claim:', error);
      toast.error('An error occurred while submitting your claim');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Check if there are any tasks
  const hasTasks = rewardTasks.length > 0;
  
  // Check if there are any visible tasks
  const hasVisibleTasks = hasTasks && rewardTasks.some(task => task.isVisible);

  return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Reward Center</h1>
            <p className="text-lg text-gray-600">
              {rewardTasks.length > 0 
                ? "Earn $15 for Every Stamp Collected and $1 for Each Check-in or Shared Experience!"
                : "Your gateway to exciting rewards and exclusive benefits"
              }
            </p>

            {/* Tabs - Only shown when there are visible tasks */}
            {rewardTasks.length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="bg-white rounded-lg p-1 shadow-sm">
                  <button
                    onClick={() => setActiveTab('claim')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      activeTab === 'claim'
                        ? 'bg-[#80A6F7] text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Claim Rewards
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      activeTab === 'history'
                        ? 'bg-[#80A6F7] text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reward History
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-2 rounded-md font-medium transition-colors ${
                      activeTab === 'requests'
                        ? 'bg-[#80A6F7] text-white'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Reward Requests
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          {activeTab === 'claim' && (
            loading ? (
              // Loading State
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>
                <p className="text-gray-600 text-lg">Loading your rewards...</p>
              </div>
            ) : rewardTasks.length === 0 ? (
              // Coming Soon Screen - Enhanced
              <div className="flex flex-col items-center justify-center  py-20 px-4">
                <div className="text-center max-w-2xl relative">
                  {/* Animated Background Elements */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                  
                  {/* Main Content */}
                  <div className="relative  z-10">
                    {/* Animated Icon */}
                    <div className="mb-8 relative">
                      <div className="inline-block relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50 animate-pulse"></div>
                        <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 rounded-full p-8 shadow-2xl">
                          <svg
                            className="w-16 h-16 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Coming Soon!
                    </h2>
                    
                    {/* Subtitle */}
                    <p className="text-xl text-gray-700 mb-6 font-medium">
                      Exciting Rewards Are On Their Way
                    </p>
                    
                    {/* Description */}
                    <p className="text-base text-gray-600 mb-8 leading-relaxed">
                      We're preparing amazing tasks and rewards just for you. Complete challenges, earn points, and unlock exclusive benefits!
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Easy Tasks</h3>
                        <p className="text-sm text-gray-600">Simple challenges to complete</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Great Rewards</h3>
                        <p className="text-sm text-gray-600">Earn points and benefits</p>
                      </div>
                      <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="font-semibold text-gray-900 mb-2">Quick Approval</h3>
                        <p className="text-sm text-gray-600">Fast reward processing</p>
                      </div>
                    </div>

                    {/* CTA Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-full">
                      <span className="text-3xl animate-bounce">🎁</span>
                      <span className="text-sm font-semibold text-gray-700">Check back soon for updates!</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 justify-items-center">
              {rewardTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => handleTaskClick(task)}
                  className={`bg-white rounded-full p-6 text-center shadow-lg cursor-pointer transition-all hover:shadow-xl ${
                    task.completed ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                  }`}
                  style={{
                    width: '150px',
                    height: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: task.completed ? '2px solid #10B981' : '2px solid #E5E7EB'
                  }}
                >
                  <h3 className="font-semibold text-sm text-gray-900 mb-2">
                    {task.title}
                  </h3>
                  <p className="text-xs text-gray-600">${task.reward}</p>
                  {task.completed && (
                    <div className="mt-2">
                      <span className="text-green-600 text-xs">✓ Completed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )
          )}

          {activeTab === 'history' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reward History</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </div>
                ) : rewardHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No rewards earned yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Task
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {rewardHistory.map((reward) => (
                          <tr key={reward._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {reward.taskTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ${reward.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(reward.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(reward.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'requests' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Reward Requests</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                  </div>
                ) : rewardRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {rewardRequests.map((request) => (
                      <div key={request._id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-gray-900">{request.taskTitle}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">Amount: ${request.amount}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          Submitted: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.proofText && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">Proof:</p>
                            <p className="text-sm text-gray-700">{request.proofText}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Claim Modal */}
        {showClaimModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-700 font-semibold">Claim Reward</h3>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{selectedTask?.title}</h4>
                <p className="text-sm text-gray-600">Reward: ${selectedTask?.reward}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reward Type
                  </label>
                  <select
                    value={claimData.proofType}
                    onChange={(e) => setClaimData({ ...claimData, proofType: e.target.value })}
                    className="w-full px-3 py-2 border text-gray-700 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proof Description
                  </label>
                  <textarea
                    value={claimData.proofText}
                    onChange={(e) => setClaimData({ ...claimData, proofText: e.target.value })}
                    rows={3}
                    className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Describe how you completed this task..."
                  />
                </div>

                {claimData.proofType === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setClaimData({ ...claimData, proofImage: e.target.files[0] })}
                      className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}

                {claimData.proofType === 'audio' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Audio
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setClaimData({ ...claimData, proofAudio: e.target.files[0] })}
                      className="w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}

                {claimData.proofType === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setClaimData({ ...claimData, proofVideo: e.target.files[0] })}
                      className="w-full px-3 text-gray-700 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaimSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
   
  );
};

export default RewardsPage;
