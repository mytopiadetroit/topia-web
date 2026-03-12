import React, { useState, useEffect } from 'react'
import { Crown, Settings, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { fetchMySubscription, Api } from '../service/service'
import { useRouter } from 'next/router'

const preferenceOptions = [
  'Relaxation', 'Energy Boost', 'Focus Enhancement', 'Sleep Support',
  'Immune Support', 'Mood Enhancement', 'Creativity', 'Stress Relief'
]

const allergyOptions = [
  'Nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs', 'None'
]

export default function SubscriptionStatus({ user }) {
  const router = useRouter()
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showManage, setShowManage] = useState(false)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)
  const [editData, setEditData] = useState({
    preferences: [],
    allergies: [],
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  })

  useEffect(() => {
    if (user?.isTopiaCircleMember) {
      loadSubscription()
      checkPendingChanges()
    } else {
      setLoading(false)
    }
  }, [user])

  // Handle body scroll when modal opens/closes
  useEffect(() => {
    if (showManage) {
      // Calculate scrollbar width
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`)
      document.body.classList.add('modal-open')
    } else {
      document.body.classList.remove('modal-open')
      document.documentElement.style.removeProperty('--scrollbar-width')
    }
    
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('modal-open')
      document.documentElement.style.removeProperty('--scrollbar-width')
    }
  }, [showManage])

  const checkPendingChanges = async () => {
    try {
      const response = await Api('get', 'pending-changes/my-requests', null, router)
      if (response.success) {
        const pendingRequests = response.data.filter(r => r.status === 'pending' && r.changeType === 'subscription')
        setHasPendingChanges(pendingRequests.length > 0)
      }
    } catch (error) {
      console.error('Error checking pending changes:', error)
    }
  }

  const loadSubscription = async () => {
    try {
      const data = await fetchMySubscription()
      if (data.success) {
        setSubscription(data.data)
        setEditData({
          preferences: data.data.preferences || [],
          allergies: data.data.allergies || []
        })
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSubscription = async () => {
    if (hasPendingChanges) {
      toast.error('You already have a pending subscription change request. Please wait for admin approval.')
      return
    }

    try {
      const requestedData = {
        preferences: editData.preferences,
        allergies: editData.allergies,
        billingAddress: editData.billingAddress
      }
      
      const response = await Api('post', 'pending-changes', {
        changeType: 'subscription',
        requestedData
      }, router)

      if (response.success) {
        toast.success('Subscription change request submitted! Admin will review it.')
        setShowManage(false)
        setHasPendingChanges(true)
      } else {
        toast.error(response.message || 'Failed to submit change request')
      }
    } catch (error) {
      console.error('Error submitting change request:', error)
      toast.error('Failed to submit change request')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600/50 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-600/50 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!user?.isTopiaCircleMember) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Crown className="w-6 h-6 text-purple-400 mr-3" />
            <div>
              <h3 className="font-semibold text-white">Join Topia Circle</h3>
              <p className="text-sm text-gray-300">Unlock exclusive benefits and monthly boxes</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/topia-circle'}
            className="bg-transparent text-white border border-white/50 hover:border-white px-4 py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105"
          >
            Join Now
          </button>
        </div>
      </div>
    )
  }

  // Don't show subscription details if paused
  if (user?.subscriptionStatus === 'paused') {
    return null
  }

  return (
    <>
      <div className="bg-white/5 backdrop-blur-[1px] rounded-xl p-6 border border-gray-800/40">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Crown className="w-6 h-6 text-[#80A6F7] mr-3" />
            <div>
              <h3 className="font-semibold text-white">Topia Circle Member</h3>
              <p className="text-sm text-[#80A6F7] font-medium">Active Subscription</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditData({
                preferences: subscription.preferences || [],
                allergies: subscription.allergies || [],
                billingAddress: subscription.billingAddress || {
                  street: '',
                  city: '',
                  state: '',
                  zipCode: '',
                  country: 'USA'
                }
              })
              setShowManage(true)
            }}
            className="text-[#80A6F7] hover:text-cyan-400 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {subscription && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Monthly Price:</span>
                <p className="font-medium text-white">${subscription.monthlyPrice}</p>
              </div>
              <div>
                <span className="text-gray-400">Next Billing:</span>
                <p className="font-medium text-white">{formatDate(subscription.nextBillingDate)}</p>
              </div>
            </div>

            {subscription.currentBoxItems && subscription.currentBoxItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-2">This Month's Box:</h4>
                <div className="space-y-1">
                  {subscription.currentBoxItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-white/10 px-2 py-1 rounded">
                      <span className="font-medium text-white">{item.itemName}</span>
                      <span className="text-gray-400">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showManage && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B0F1A] border border-gray-700/50 rounded-xl max-w-2xl w-full flex flex-col my-8" style={{ maxHeight: '90vh' }}>
            <div className="flex items-center justify-between p-6 border-b border-gray-700/50 flex-shrink-0">
              <h2 className="text-xl font-semibold text-white">Manage Subscription</h2>
              <button
                onClick={() => setShowManage(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h3 className="font-medium text-white mb-3">Billing Address</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={editData.billingAddress.street}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, street: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-white/30 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={editData.billingAddress.city}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, city: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-white/30 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={editData.billingAddress.state}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, state: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-white/30 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={editData.billingAddress.zipCode}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, zipCode: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-white/30 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={editData.billingAddress.country}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, country: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-white/30 bg-white/10 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {subscription.currentBoxItems && subscription.currentBoxItems.length > 0 && (
                <div>
                  <h3 className="font-medium text-white mb-3">This Month's Box Items</h3>
                  <div className="bg-white/10 p-3 rounded-lg space-y-2 border border-purple-500/30">
                    {subscription.currentBoxItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-medium text-white">{item.itemName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-400">Qty: {item.quantity}</span>
                          {item.notes && (
                            <span className="text-xs text-gray-500 italic">({item.notes})</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400 mt-2">
                      These items are prepared by our team for your monthly pickup
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium text-white mb-3">Preferences</h3>
                <div className="grid grid-cols-2 gap-2">
                  {preferenceOptions.map(preference => (
                    <label key={preference} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.preferences.includes(preference)}
                        onChange={() => {
                          setEditData(prev => ({
                            ...prev,
                            preferences: prev.preferences.includes(preference)
                              ? prev.preferences.filter(p => p !== preference)
                              : [...prev.preferences, preference]
                          }))
                        }}
                        className="rounded border-gray-500 bg-white/10 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300">{preference}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-white mb-3">Allergies</h3>
                <div className="grid grid-cols-2 gap-2">
                  {allergyOptions.map(allergy => (
                    <label key={allergy} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editData.allergies.includes(allergy)}
                        onChange={() => {
                          setEditData(prev => ({
                            ...prev,
                            allergies: prev.allergies.includes(allergy)
                              ? prev.allergies.filter(a => a !== allergy)
                              : [...prev.allergies, allergy]
                          }))
                        }}
                        className="rounded border-gray-500 bg-white/10 text-red-500 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-300">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={updateSubscription}
                  className="flex-1 bg-transparent text-white border border-white/50 hover:border-white py-2 rounded-lg transition-all shadow-[0_0_10px_rgba(77,163,255,0.3)] hover:shadow-[0_0_15px_rgba(77,163,255,0.5)] transform hover:scale-105"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowManage(false)}
                  className="flex-1 bg-white/10 text-gray-300 border border-gray-600 py-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
