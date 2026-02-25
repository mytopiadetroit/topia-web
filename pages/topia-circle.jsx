import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../context/UserContext'
import { Star, Check, CreditCard, Shield, Gift } from 'lucide-react'
import { toast } from 'react-toastify'
import { fetchSubscriptionSettings, createSubscription } from '../service/service'

export default function TopiaCircle() {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [formData, setFormData] = useState({
    preferences: [],
    allergies: [],
    paymentMethodId: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    }
  })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }
    loadSettings()
  }, [isLoggedIn])
        
  const loadSettings = async () => {
    try {
      const data = await fetchSubscriptionSettings()
      if (data.success) {
        setSettings(data.data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load subscription details')
    } finally {
      setLoading(false)
    }
  }

  const handlePreferenceChange = (preference) => {
    setFormData(prev => ({
      ...prev,
      preferences: prev.preferences.includes(preference)
        ? prev.preferences.filter(p => p !== preference)
        : [...prev.preferences, preference]
    }))
  }

  const handleAllergyChange = (allergy) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }))
  }

  const handleBillingAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value
      }
    }))
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!formData.paymentMethodId) {
      toast.error('Please add a payment method')
      return
    }

    if (!formData.billingAddress.street || !formData.billingAddress.city || !formData.billingAddress.zipCode) {
      toast.error('Please complete your billing address')
      return
    }

    try {
      setSubscribing(true)
      
      const data = await createSubscription(formData, router)
      
      if (data.success) {
        toast.success('Welcome to Topia Circle!')
        router.push('/profile')
      } else {
        toast.error(data.message || 'Failed to create subscription')
      }
    } catch (error) {
      console.error('Error creating subscription:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create subscription'
      toast.error(errorMessage)
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen relative flex items-center justify-center" style={{ background: 'transparent' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    )
  }

  const preferenceOptions = [
    'Relaxation', 'Energy Boost', 'Focus Enhancement', 'Sleep Support',
    'Immune Support', 'Mood Enhancement', 'Creativity', 'Stress Relief'
  ]

  const allergyOptions = [
    'Nuts', 'Dairy', 'Gluten', 'Soy', 'Shellfish', 'Eggs', 'None'
  ]

  return (
    <div className="min-h-screen relative" style={{ background: 'transparent' }}>
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#80A6F7] to-[#4A6DB5] rounded-full mb-4 sm:mb-6">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-3 sm:mb-4">
            Join The Topia Circle
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto px-2">
            {settings?.description}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
          {/* Pricing Card */}
          <div className="order-2 lg:order-1 bg-white/5 backdrop-blur-[1px] rounded-xl sm:rounded-2xl border border-gray-800/40 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#80A6F7] mb-2">
                $100
              </div>
              <div className="text-gray-300 text-sm sm:text-base">per month</div>
              <div className="text-xs sm:text-sm text-gray-400 mt-2">
                Monthly box pickup from store
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-100 sm:text-base">Exclusive monthly wellness box</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-100 sm:text-base">$200 worth of premium products</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-100 sm:text-base">Priority customer support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-100 sm:text-base">Member-only rewards & discounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm text-gray-100 sm:text-base">Curated by our expert team</span>
              </div>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-cyan-300">
                  <strong>Commitment:</strong> Minimum 2-month subscription required. 
                  You can cancel anytime after 2 months.
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="order-1 lg:order-2">
            <form onSubmit={handleSubscribe} className="space-y-4 sm:space-y-6">
              {/* Subscription Value Info */}
              <div className="bg-white/5 backdrop-blur-[1px] rounded-xl border border-gray-800/40 p-4 sm:p-6">
                <div className="text-center">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Your Monthly Box Value</h3>
                  <div className="flex items-center justify-center space-x-4 mb-3">
                    <div>
                      <p className="text-sm text-gray-300">You Pay</p>
                      <p className="text-2xl sm:text-3xl font-bold text-cyan-400">$100</p>
                    </div>
                    <div className="text-2xl text-gray-400">→</div>
                    <div>
                      <p className="text-sm text-gray-300">You Get</p>
                      <p className="text-2xl sm:text-3xl font-bold text-green-400">$200</p>
                    </div>
                  </div>
                  <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-400/30">
                    <p className="text-sm font-medium text-cyan-300">
                      🎉 Save 50% on premium products every month!
                    </p>
                    <p className="text-xs text-gray-300 mt-1">
                      Our team curates the best selection for your monthly box
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white/5 backdrop-blur-[1px] rounded-xl border border-gray-800/40 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <Gift className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Your Preferences
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {preferenceOptions.map(preference => (
                    <label key={preference} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.includes(preference)}
                        onChange={() => handlePreferenceChange(preference)}
                        className="rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-cyan-400"
                      />
                      <span className="text-sm text-white">{preference}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-white/5 backdrop-blur-[1px] rounded-xl border border-gray-800/40 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-500" />
                  Allergies & Restrictions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {allergyOptions.map(allergy => (
                    <label key={allergy} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allergies.includes(allergy)}
                        onChange={() => handleAllergyChange(allergy)}
                        className="rounded border-white/30 bg-white/10 text-red-400 focus:ring-red-400"
                      />
                      <span className="text-sm text-white">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white/5 backdrop-blur-[1px] rounded-xl border border-gray-800/40 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={formData.paymentMethodId}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethodId: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      required
                    />
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white/5 backdrop-blur-[1px] rounded-xl border border-gray-800/40 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-3 sm:mb-4 flex items-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                  Billing Address
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Street Address"
                    value={formData.billingAddress.street}
                    onChange={(e) => handleBillingAddressChange('street', e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="City"
                      value={formData.billingAddress.city}
                      onChange={(e) => handleBillingAddressChange('city', e.target.value)}
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={formData.billingAddress.state}
                      onChange={(e) => handleBillingAddressChange('state', e.target.value)}
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="ZIP Code"
                      value={formData.billingAddress.zipCode}
                      onChange={(e) => handleBillingAddressChange('zipCode', e.target.value)}
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-white/30 bg-white/10 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-sm sm:text-base text-white placeholder-gray-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Country"
                      value={formData.billingAddress.country}
                      disabled
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-white/30 rounded-lg bg-white/10 text-gray-300 text-sm sm:text-base"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={subscribing}
                className="w-full bg-transparent text-white border-2 border-white/50 hover:border-white py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base lg:text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(77,163,255,0.8)] hover:shadow-[0_12px_40px_rgba(77,163,255,1)]"
              >
                {subscribing ? 'Processing...' : 'Subscribe for $100/month'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
