import React, { useState, useEffect } from 'react'
import { Crown, Calendar, Settings, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { fetchMySubscription, updateMySubscription } from '../service/service'

export default function SubscriptionStatus({ user }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showManage, setShowManage] = useState(false)
  const [editData, setEditData] = useState({
    preferences: [],
    allergies: []
  })

  useEffect(() => {
    if (user?.isTopiaCircleMember) {
      loadSubscription()
    } else {
      setLoading(false)
    }
  }, [user])

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
    try {
      const updateData = {
        preferences: editData.preferences,
        allergies: editData.allergies
      }
      
      const data = await updateMySubscription(updateData)
      if (data.success) {
        setSubscription(data.data)
        setShowManage(false)
        toast.success('Preferences updated successfully')
      } else {
        toast.error(data.message || 'Failed to update preferences')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
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
            onClick={() => setShowManage(true)}
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
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Manage Subscription</h2>
              <button
                onClick={() => setShowManage(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {subscription.billingAddress && (
                <div>
                  <h3 className="font-medium mb-3">Billing Address</h3>
                  <div className="bg-gray-50 p-3 rounded-lg text-sm">
                    <p>{subscription.billingAddress.street}</p>
                    <p>{subscription.billingAddress.city}, {subscription.billingAddress.state} {subscription.billingAddress.zipCode}</p>
                    <p>{subscription.billingAddress.country}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Contact support to update billing address
                  </p>
                </div>
              )}

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
                <textarea
                  value={editData.preferences.join(', ')}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    preferences: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                  }))}
                  placeholder="Enter your preferences separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div>
                <h3 className="font-medium mb-3">Allergies</h3>
                <textarea
                  value={editData.allergies.join(', ')}
                  onChange={(e) => setEditData(prev => ({ 
                    ...prev, 
                    allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                  }))}
                  placeholder="Enter your allergies separated by commas"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={updateSubscription}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors"
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
