import React, { useState, useEffect } from 'react'
import { Crown, Settings, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { fetchMySubscription, updateMySubscription, fetchProductsForSubscription } from '../service/service'

export default function SubscriptionStatus({ user }) {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showManage, setShowManage] = useState(false)
  const [availableProducts, setAvailableProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [editData, setEditData] = useState({
    preferences: [],
    allergies: [],
    selectedProducts: []
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
          allergies: data.data.allergies || [],
          selectedProducts: data.data.selectedProducts || []
        })
      }
    } catch (error) {
      console.error('Error loading subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableProducts = async () => {
    try {
      setLoadingProducts(true)
      const data = await fetchProductsForSubscription()
      if (data.success) {
        setAvailableProducts(data.data || [])
      }
    } catch (error) {
      console.error('Error loading products:', error)
    } finally {
      setLoadingProducts(false)
    }
  }

  const updateSubscription = async () => {
    try {
      // Send all data including selectedProducts
      const updateData = {
        preferences: editData.preferences,
        allergies: editData.allergies,
        selectedProducts: editData.selectedProducts
      }
      
      console.log('🔄 Updating subscription with data:', updateData)
      
      const data = await updateMySubscription(updateData)
      if (data.success) {
        setSubscription(data.data)
        setShowManage(false)
        toast.success('Subscription updated successfully')
      } else {
        toast.error(data.message || 'Failed to update subscription')
      }
    } catch (error) {
      console.error('Error updating subscription:', error)
      toast.error('Failed to update subscription')
    }
  }

  const toggleProductSelection = (product) => {
    const isSelected = editData.selectedProducts.some(p => p._id === product._id)
    
    if (isSelected) {
      // Remove product
      setEditData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter(p => p._id !== product._id)
      }))
    } else {
      // Add product - use first variant price if main product price is 0 or not available
      let productPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0
      
      // If main product price is 0 and variants exist, use first variant price
      if (productPrice === 0 && product.hasVariants && product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0]
        productPrice = typeof firstVariant.price === 'number' ? firstVariant.price : parseFloat(firstVariant.price) || 0
      }
      
      const productData = {
        _id: product._id,
        productName: product.name || 'Unknown Product',
        productPrice: productPrice,
        type: 'product',
        productId: {
          _id: product._id,
          name: product.name || 'Unknown Product',
          price: productPrice
        }
      }
      setEditData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, productData]
      }))
    }
  }

  const toggleVariantSelection = (product, variant, variantIndex) => {
    const variantId = `${product._id}-variant-${variantIndex}`
    const isSelected = editData.selectedProducts.some(p => p._id === variantId)
    
    if (isSelected) {
      // Remove variant
      setEditData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter(p => p._id !== variantId)
      }))
    } else {
      // Add variant
      const variantData = {
        _id: variantId,
        productName: `${product.name} (${variant.size?.value}${variant.size?.unit})`,
        productPrice: typeof variant.price === 'number' ? variant.price : parseFloat(variant.price) || 0,
        type: 'variant',
        productId: {
          _id: product._id,
          name: product.name,
          price: product.price
        },
        variant: {
          size: variant.size,
          price: variant.price
        }
      }
      setEditData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, variantData]
      }))
    }
  }

  const toggleFlavorSelection = (product, flavor, flavorIndex) => {
    const flavorId = `${product._id}-flavor-${flavorIndex}`
    const isSelected = editData.selectedProducts.some(p => p._id === flavorId)
    
    if (isSelected) {
      // Remove flavor
      setEditData(prev => ({
        ...prev,
        selectedProducts: prev.selectedProducts.filter(p => p._id !== flavorId)
      }))
    } else {
      // Add flavor
      const flavorData = {
        _id: flavorId,
        productName: `${product.name} (${flavor.name})`,
        productPrice: typeof flavor.price === 'number' ? flavor.price : parseFloat(flavor.price) || 0,
        type: 'flavor',
        productId: {
          _id: product._id,
          name: product.name,
          price: product.price
        },
        flavor: {
          name: flavor.name,
          price: flavor.price
        }
      }
      setEditData(prev => ({
        ...prev,
        selectedProducts: [...prev.selectedProducts, flavorData]
      }))
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
              setShowManage(true)
              loadAvailableProducts()
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

            {/* Selected Products */}
            {subscription.selectedProducts && subscription.selectedProducts.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Selected Products:</h4>
                <div className="flex flex-wrap gap-2">
                  {subscription.selectedProducts.map((product, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      {product.productName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Current Month Box Items */}
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
        <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              {/* Product Selection */}
              <div>
                <h3 className="font-medium mb-3">Select Your Products</h3>
                {loadingProducts ? (
                  <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableProducts.map((product) => {
                      const isSelected = editData.selectedProducts.some(p => p._id === product._id)
                      return (
                        <div key={product._id} className="p-3 border border-gray-200 rounded-lg">
                          {/* Main Product */}
                          <label className="flex items-start space-x-3 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleProductSelection(product)}
                              className="mt-1 rounded border-gray-300 text-green-600 focus:ring-green-500 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  {product.images && product.images[0] ? (
                                    <img 
                                      src={product.images[0]} 
                                      alt={product.name || 'Product'}
                                      className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                    />
                                  ) : (
                                    <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                      <span className="text-xs text-gray-400">No Image</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-base font-medium text-gray-900 group-hover:text-green-600">
                                    {product.name || 'Unknown Product'}
                                  </h4>
                                  {product.price > 0 && (
                                    <p className="text-sm font-medium text-green-600">
                                      ${typeof product.price === 'number' ? product.price : parseFloat(product.price) || 0}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          </label>

                          {/* Variants */}
                          {product.hasVariants && product.variants && product.variants.length > 0 && (
                            <div className="mt-3 ml-9 space-y-2">
                              <p className="text-xs font-medium text-gray-500 uppercase">Sizes:</p>
                              {product.variants.map((variant, index) => {
                                const variantId = `${product._id}-variant-${index}`
                                const isVariantSelected = editData.selectedProducts.some(p => p._id === variantId)
                                return (
                                  <label key={variantId} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={isVariantSelected}
                                        onChange={() => toggleVariantSelection(product, variant, index)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                      />
                                      <span className="text-sm text-gray-700">
                                        {variant.size?.value}{variant.size?.unit}
                                      </span>
                                    </div>
                                    {variant.price > 0 && (
                                      <span className="text-sm font-medium text-green-600">
                                        ${variant.price}
                                      </span>
                                    )}
                                  </label>
                                )
                              })}
                            </div>
                          )}

                          {/* Flavors */}
                          {product.flavors && product.flavors.length > 0 && (
                            <div className="mt-3 ml-9 space-y-2">
                              <p className="text-xs font-medium text-gray-500 uppercase">Flavors:</p>
                              {product.flavors.filter(flavor => flavor.isActive).map((flavor, index) => {
                                const flavorId = `${product._id}-flavor-${index}`
                                const isFlavorSelected = editData.selectedProducts.some(p => p._id === flavorId)
                                return (
                                  <label key={flavorId} className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="checkbox"
                                        checked={isFlavorSelected}
                                        onChange={() => toggleFlavorSelection(product, flavor, index)}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                      />
                                      <span className="text-sm text-gray-700 truncate">
                                        {flavor.name}
                                      </span>
                                    </div>
                                    {flavor.price > 0 && (
                                      <span className="text-sm font-medium text-green-600">
                                        ${flavor.price}
                                      </span>
                                    )}
                                  </label>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
                
                {/* Selected Products Summary */}
                {editData.selectedProducts.length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h4 className="text-sm font-medium text-green-800 mb-2">Selected Products:</h4>
                    <div className="flex flex-wrap gap-2">
                      {editData.selectedProducts.map((product, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {product.productName} - ${product.productPrice}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Total: ${editData.selectedProducts.reduce((sum, p) => {
                        const price = typeof p.productPrice === 'number' ? p.productPrice : parseFloat(p.productPrice) || 0
                        return sum + price
                      }, 0)}
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Products Display - Keep for reference */}
              {subscription.selectedProducts && subscription.selectedProducts.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Current Selected Products</h3>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex flex-wrap gap-2">
                      {subscription.selectedProducts.map((product, index) => (
                        <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {product.productName} - ${product.productPrice}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Current Month Box Items */}
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
                      These items are prepared by our team for your monthly pickup.
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