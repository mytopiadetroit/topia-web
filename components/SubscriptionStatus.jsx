import React, { useState, useEffect } from 'react'
import { Crown, Calendar, Settings, X } from 'lucide-react'
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
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-3/4"></div>
        </div>
      </div>
    )
  }

  if (!user?.isTopiaCircleMember) {
    return (
      <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Crown className="w-6 h-6 text-purple-600 mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Join Topia Circle</h3>
              <p className="text-sm text-gray-600">Unlock exclusive benefits and monthly boxes</p>
            </div>
          </div>
          <button
            onClick={() => window.location.href = '/topia-circle'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Join Now
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-xl p-6 border border-purple-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Crown className="w-6 h-6 text-[#80A6F7] mr-3" />
            <div>
              <h3 className="font-semibold text-gray-900">Topia Circle Member</h3>
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
            className="text-[#80A6F7] hover:text-blue-600"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {subscription && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Monthly Price:</span>
                <p className="font-medium">${subscription.monthlyPrice}</p>
              </div>
              <div>
                <span className="text-gray-600">Next Billing:</span>
                <p className="font-medium">{formatDate(subscription.nextBillingDate)}</p>
              </div>
            </div>

            {subscription.currentBoxItems && subscription.currentBoxItems.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">This Month's Box:</h4>
                <div className="space-y-1">
                  {subscription.currentBoxItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs bg-purple-50 px-2 py-1 rounded">
                      <span className="font-medium">{item.itemName}</span>
                      <span className="text-gray-600">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showManage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b flex-shrink-0">
              <h2 className="text-xl font-semibold">Manage Subscription</h2>
              <button
                onClick={() => setShowManage(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              <div>
                <h3 className="font-medium mb-3">Billing Address</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={editData.billingAddress.street}
                    onChange={(e) => setEditData(prev => ({
                      ...prev,
                      billingAddress: { ...prev.billingAddress, street: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border rounded-lg"
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
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={editData.billingAddress.state}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, state: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
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
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={editData.billingAddress.country}
                      onChange={(e) => setEditData(prev => ({
                        ...prev,
                        billingAddress: { ...prev.billingAddress, country: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {subscription.currentBoxItems && subscription.currentBoxItems.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">This Month's Box Items</h3>
                  <div className="bg-purple-50 p-3 rounded-lg space-y-2">
                    {subscription.currentBoxItems.map((item, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="font-medium">{item.itemName}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">Qty: {item.quantity}</span>
                          {item.notes && (
                            <span className="text-xs text-gray-500 italic">({item.notes})</span>
                          )}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500 mt-2">
                      These items are prepared by our team for your monthly pickup
                    </p>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-medium mb-3">Preferences</h3>
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{preference}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Allergies</h3>
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
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={updateSubscription}
                  className="flex-1 bg-[#80A6F7] text-white py-2 rounded-lg  transition-colors"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowManage(false)}
                  className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition-colors"
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
