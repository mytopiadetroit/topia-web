import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { useUser } from '../context/UserContext'
import { Star, Check, CreditCard, Shield, Gift, Package } from 'lucide-react'
import { toast } from 'react-toastify'
import { fetchSubscriptionSettings, createSubscription, fetchProductsForSubscription } from '../service/service'

export default function TopiaCircle() {
  const router = useRouter()
  const { isLoggedIn } = useUser()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [subscribing, setSubscribing] = useState(false)
  const [products, setProducts] = useState([])
  const [selectedProducts, setSelectedProducts] = useState([])
  const [formData, setFormData] = useState({
    preferences: [],
    allergies: [],
    paymentMethodId: '',
    selectedProducts: []
  })

  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/auth/login')
      return
    }
    loadSettings()
    loadProducts()
  }, [isLoggedIn])

  const loadProducts = async () => {
    try {
      setProductsLoading(true)
      console.log('Fetching products using service...')
      
      const data = await fetchProductsForSubscription()
      console.log('API Response:', data)
      console.log('Total products in response:', data.data?.length)
      
      if (data.success && data.data) {
        const allProducts = data.data.filter(product => product.isActive !== false)
        console.log('Active products after filtering:', allProducts.length)
        
        const withoutPrice = allProducts.filter(product => !product.price || product.price <= 0)
        if (withoutPrice.length > 0) {
          console.log('Products without price:', withoutPrice.map(p => ({ name: p.name, price: p.price })))
        }
        
        setProducts(allProducts)
      } else {
        console.error('API call failed or no data:', data)
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setProductsLoading(false)
    }
  }

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

  const handleProductSelection = (productId) => {
    const updatedProducts = selectedProducts.includes(productId)
      ? selectedProducts.filter(id => id !== productId)
      : [...selectedProducts, productId]
    
    setSelectedProducts(updatedProducts)
    setFormData(prev => ({ ...prev, selectedProducts: updatedProducts }))
  }

  const handleAllergyChange = (allergy) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }))
  }

  const handleSubscribe = async (e) => {
    e.preventDefault()
    
    if (!formData.paymentMethodId) {
      toast.error('Please add a payment method')
      return
    }

    if (selectedProducts.length === 0) {
      toast.error('Please select at least one product for your monthly box')
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
      toast.error('Failed to create subscription')
    } finally {
      setSubscribing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 lg:mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#80A6F7] to-[#4A6DB5] rounded-full mb-4 sm:mb-6">
            <Star className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Join The Topia Circle
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-2">
            {settings?.description}
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
          {/* Pricing Card */}
          <div className="order-2 lg:order-1 bg-white rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-6 sm:mb-8">
              <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#80A6F7] mb-2">
                ${settings?.monthlyPrice}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">per month</div>
              <div className="text-xs sm:text-sm text-gray-500 mt-2">
                Monthly box pickup from store
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">Exclusive monthly wellness box</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">Personalized product selection</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">Priority customer support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">Member-only rewards & discounts</span>
              </div>
              <div className="flex items-center space-x-3">
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
                <span className="text-sm sm:text-base">Flexible box customization</span>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-yellow-800">
                  <strong>Commitment:</strong> Minimum 2-month subscription required. 
                  You can cancel anytime after 2 months.
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="order-1 lg:order-2">
            <form onSubmit={handleSubscribe} className="space-y-4 sm:space-y-6">
              {/* Products Section */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#80A6F7] flex-shrink-0" />
                  <h3 className="text-base sm:text-lg font-semibold">Select Products</h3>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  Choose products for your monthly box
                  <span className="block sm:inline sm:ml-2 mt-1 sm:mt-0">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {products.length} available
                    </span>
                  </span>
                </p>
                
                {/* Products List */}
                <div className="border border-gray-200 rounded-lg max-h-64 sm:max-h-80 overflow-y-auto">
                  {productsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                      <span className="ml-3 text-sm text-gray-600">Loading...</span>
                    </div>
                  ) : products.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No products available</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {products.map(product => (
                        <div key={product._id} className="p-3 sm:p-4">
                          {/* Main Product */}
                          <label className="flex items-start space-x-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleProductSelection(product._id)}
                              className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {product.images && product.images[0] ? (
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.name}
                                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                      <Package className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm sm:text-base font-medium text-gray-900 group-hover:text-green-600">
                                    {product.name}
                                  </h4>
                                  {/* Price hidden for subscription products */}
                                  {/* <p className="text-sm font-medium text-green-600">
                                    {product.price ? `$${product.price}` : 'Price not set'}
                                  </p> */}
                                </div>
                              </div>
                            </div>
                          </label>

                          {/* Variants */}
                          {product.hasVariants && product.variants && product.variants.length > 0 && (
                            <div className="mt-3 ml-6 sm:ml-9 space-y-2">
                              <p className="text-xs font-medium text-gray-500 uppercase">Sizes:</p>
                              {product.variants.map((variant, index) => (
                                <label key={`${product._id}-variant-${index}`} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedProducts.includes(`${product._id}-variant-${index}`)}
                                      onChange={() => handleProductSelection(`${product._id}-variant-${index}`)}
                                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-xs sm:text-sm text-gray-700">
                                      {variant.size.value}{variant.size.unit}
                                    </span>
                                  </div>
                                  {/* Variant price hidden */}
                                  {/* <span className="text-xs sm:text-sm font-medium text-green-600">
                                    ${variant.price}
                                  </span> */}
                                </label>
                              ))}
                            </div>
                          )}

                          {/* Flavors */}
                          {product.flavors && product.flavors.length > 0 && (
                            <div className="mt-3 ml-6 sm:ml-9 space-y-2">
                              <p className="text-xs font-medium text-gray-500 uppercase">Flavors:</p>
                              {product.flavors.filter(flavor => flavor.isActive).map((flavor, index) => (
                                <label key={`${product._id}-flavor-${index}`} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                                  <div className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedProducts.includes(`${product._id}-flavor-${index}`)}
                                      onChange={() => handleProductSelection(`${product._id}-flavor-${index}`)}
                                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-xs sm:text-sm text-gray-700 truncate">
                                      {flavor.name}
                                    </span>
                                  </div>
                                  {/* Flavor price hidden */}
                                  {/* <span className="text-xs sm:text-sm font-medium text-green-600 ml-2">
                                    ${flavor.price}
                                  </span> */}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Preferences */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
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
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{preference}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
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
                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                      />
                      <span className="text-sm">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                  Payment Method
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Card Number"
                    value={formData.paymentMethodId}
                    onChange={(e) => setFormData(prev => ({ ...prev, paymentMethodId: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    required
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="MM/YY"
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                    <input
                      type="text"
                      placeholder="CVV"
                      className="px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      required
                    />
                  </div>
                  <div className="text-xs text-gray-500 flex items-center space-x-1">
                    <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Your payment information is secure and encrypted</span>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={subscribing}
                className="w-full bg-[#80A6F7] text-white py-3 sm:py-4 rounded-xl font-semibold text-sm sm:text-base lg:text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {subscribing ? 'Processing...' : `Subscribe for $${settings?.monthlyPrice}/month`}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}