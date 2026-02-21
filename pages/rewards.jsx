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
      pending: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
      approved: 'bg-green-500/20 text-green-300 border border-green-500/30',
      rejected: 'bg-red-500/20 text-red-300 border border-red-500/30'
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

        <div className="max-w-3xl mx-auto px-4 py-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Reward Center</h1>
            <p className="text-lg text-gray-300">
              {rewardTasks.length > 0 
                ? "Earn $15 for Every Stamp Collected and $1 for Each Check-in or Shared Experience!"
                : "Your gateway to exciting rewards and exclusive benefits"
              }
            </p>

            {/* Tabs - Only shown when there are visible tasks */}
            {rewardTasks.length > 0 && (
              <div className="flex justify-center mt-6">
                <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1 shadow-lg">
                  <button
                    onClick={() => setActiveTab('claim')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      activeTab === 'claim'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Claim Rewards
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      activeTab === 'history'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Reward History
                  </button>
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${
                      activeTab === 'requests'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                        : 'text-gray-300 hover:text-white'
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
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mb-4"></div>
                <p className="text-gray-300 text-lg">Loading your rewards...</p>
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
                    <h2 className="text-5xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Coming Soon!
                    </h2>
                    
                    {/* Subtitle */}
                    <p className="text-xl text-gray-300 mb-6 font-medium">
                      Exciting Rewards Are On Their Way
                    </p>
                    
                    {/* Description */}
                    <p className="text-base text-gray-400 mb-8 leading-relaxed">
                      We're preparing amazing tasks and rewards just for you. Complete challenges, earn points, and unlock exclusive benefits!
                    </p>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-shadow">
                        <div className="text-4xl mb-3">🎯</div>
                        <h3 className="font-semibold text-white mb-2">Easy Tasks</h3>
                        <p className="text-sm text-gray-400">Simple challenges to complete</p>
                      </div>
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-shadow">
                        <div className="text-4xl mb-3">💰</div>
                        <h3 className="font-semibold text-white mb-2">Great Rewards</h3>
                        <p className="text-sm text-gray-400">Earn points and benefits</p>
                      </div>
                      <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-xl shadow-lg hover:shadow-cyan-500/20 transition-shadow">
                        <div className="text-4xl mb-3">⚡</div>
                        <h3 className="font-semibold text-white mb-2">Quick Approval</h3>
                        <p className="text-sm text-gray-400">Fast reward processing</p>
                      </div>
                    </div>

                    {/* CTA Badge */}
                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500/10 border-2 border-cyan-400/30 rounded-full">
                      <span className="text-3xl animate-bounce">🎁</span>
                      <span className="text-sm font-semibold text-gray-300">Check back soon for updates!</span>
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
                  className={`bg-transparent text-white border-2 rounded-full p-6 text-center cursor-pointer transition-all duration-300 transform ${
                    task.completed 
                      ? 'border-white/50 opacity-50 cursor-not-allowed shadow-[0_8px_30px_rgba(77,163,255,0.5)]' 
                      : 'border-white/50 hover:border-white hover:scale-105 shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)]'
                  }`}
                  style={{
                    width: '150px',
                    height: '150px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}
                >
                  <h3 className="font-semibold text-sm text-white mb-2">
                    {task.title}
                  </h3>
                  <p className="text-xs text-gray-300">${task.reward}</p>
                  {task.completed && (
                    <div className="mt-2">
                      <span className="text-cyan-400 text-xs">✓ Completed</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            )
          )}

          {activeTab === 'history' && (
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Reward History</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  </div>
                ) : rewardHistory.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No rewards earned yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/10">
                      <thead className="bg-white/5">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Task
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-transparent divide-y divide-white/10">
                        {rewardHistory.map((reward) => (
                          <tr key={reward._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              {reward.taskTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                              ${reward.amount}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
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
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg shadow-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Reward Requests</h2>
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
                  </div>
                ) : rewardRequests.length === 0 ? (
                  <p className="text-gray-400 text-center py-8">No pending requests</p>
                ) : (
                  <div className="space-y-4">
                    {rewardRequests.map((request) => (
                      <div key={request._id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold text-white">{request.taskTitle}</h3>
                          {getStatusBadge(request.status)}
                        </div>
                        <p className="text-sm text-gray-300 mb-2">Amount: ${request.amount}</p>
                        <p className="text-sm text-gray-400 mb-2">
                          Submitted: {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                        {request.proofText && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-400">Proof:</p>
                            <p className="text-sm text-gray-300">{request.proofText}</p>
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
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-black/60 backdrop-blur-md border border-white/20 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-white font-semibold">Claim Reward</h3>
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-white">{selectedTask?.title}</h4>
                <p className="text-sm text-gray-300">Reward: ${selectedTask?.reward}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Reward Type
                  </label>
                  <select
                    value={claimData.proofType}
                    onChange={(e) => setClaimData({ ...claimData, proofType: e.target.value })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  >
                    <option value="text" className="bg-gray-900">Text</option>
                    <option value="image" className="bg-gray-900">Image</option>
                    <option value="audio" className="bg-gray-900">Audio</option>
                    <option value="video" className="bg-gray-900">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Proof Description
                  </label>
                  <textarea
                    value={claimData.proofText}
                    onChange={(e) => setClaimData({ ...claimData, proofText: e.target.value })}
                    rows={3}
                    className="w-full text-white px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    placeholder="Describe how you completed this task..."
                  />
                </div>

                {claimData.proofType === 'image' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setClaimData({ ...claimData, proofImage: e.target.files[0] })}
                      className="w-full text-white px-3 py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                )}

                {claimData.proofType === 'audio' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Audio
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setClaimData({ ...claimData, proofAudio: e.target.files[0] })}
                      className="w-full px-3 text-white py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                )}

                {claimData.proofType === 'video' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Upload Video
                    </label>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setClaimData({ ...claimData, proofVideo: e.target.files[0] })}
                      className="w-full px-3 text-white py-2 bg-white/10 border border-white/20 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowClaimModal(false)}
                  className="px-4 py-2 text-gray-300 border border-white/20 rounded-md hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaimSubmit}
                  disabled={loading}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 rounded-md hover:bg-cyan-500/30 disabled:opacity-50 transition-all shadow-lg shadow-cyan-500/20"
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
