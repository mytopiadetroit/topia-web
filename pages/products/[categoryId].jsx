import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../../components/sidebar';
import { fetchProductsByCategory, fetchAllCategories, createProduct, updateProductOrder, toast } from '../../service/service';
import Swal from 'sweetalert2';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, TouchSensor } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// SortableItem component
export function SortableItem({ id, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <tr
        className="hover:bg-gray-50"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        {...listeners}
      >
        {children}
      </tr>
    </div>
  );
}
import { 
  Package, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  Filter,
  Download,
  MoreHorizontal,
  X,
  Mail,
  Phone,
  Calendar,
  User,
  Shield,
  ArrowLeft
} from 'lucide-react';

export default function ProductsByCategory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [productModalLoading, setProductModalLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    descriptionMain: '',
    descriptionDetails: '',
    primaryUse: 'therapeutic',
    hasStock: true,
    images: []
  });
  const [category, setCategory] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const { categoryId } = router.query;

  // Set up sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Handle drag end event
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex(item => item._id === active.id);
        const newIndex = items.findIndex(item => item._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Update order in the database
        updateProductOrderInDatabase(newItems);
        
        return newItems;
      });
    }
  };

  // Update product order in the database
  const updateProductOrderInDatabase = async (reorderedProducts) => {
    try {
      await Promise.all(
        reorderedProducts.map((product, index) => 
          updateProductOrder(product._id, index + 1, router)
        )
      );
      toast.success('Product order updated successfully');
    } catch (error) {
      console.error('Error updating product order:', error);
      toast.error('Failed to update product order');
      // Revert to previous state if update fails
      loadProducts();
    }
  };

  // Toggle reorder mode
  const toggleReorderMode = () => {
    setIsReordering(!isReordering);
  };

  useEffect(() => {
    if (categoryId) {
      loadProducts();
      loadCategoryInfo();
    }
  }, [categoryId]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetchProductsByCategory(categoryId, router);
      if (response.success) {
        setProducts(response.data || []);
      } else {
        toast.error('Failed to load products');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error loading products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategoryInfo = async () => {
    try {
      const response = await fetchAllCategories(router);
      if (response.success) {
        const categoryData = response.data.find(cat => cat._id === categoryId);
        setCategory(categoryData);
      }
    } catch (error) {
      console.error('Error loading category info:', error);
    }
  };

  const handleViewProduct = async (productId) => {
    try {
      setProductModalLoading(true);
      setShowProductModal(true);
      
      // For now, we'll use the product data from the list
      const product = products.find(p => p._id === productId);
      if (product) {
        setSelectedProduct(product);
      } else {
        toast.error('Product not found');
        setShowProductModal(false);
      }
    } catch (error) {
      console.error('Error loading product details:', error);
      toast.error('Error loading product details');
      setShowProductModal(false);
    } finally {
      setProductModalLoading(false);
    }
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
  };

  const handleEditProduct = (productId) => {
    Swal.fire({
      title: 'Edit Product',
      text: 'Edit functionality will be implemented soon!',
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        // Add delete API call here
        await Swal.fire(
          'Deleted!',
          'Product has been deleted.',
          'success'
        );
        loadProducts(); // Reload the list
      } catch (error) {
        console.error('Error deleting product:', error);
        Swal.fire(
          'Error!',
          'Failed to delete product.',
          'error'
        );
      }
    }
  };

  const openAddModal = () => {
    setForm({
      name: '',
      price: '',
      descriptionMain: '',
      descriptionDetails: '',
      primaryUse: 'therapeutic',
      hasStock: true,
      images: []
    });
    setShowAddModal(true);
  };

  const handleFileChange = (e) => {
    setForm(prev => ({ ...prev, images: Array.from(e.target.files || []) }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitAddProduct = async (e) => {
    e.preventDefault();
    if (!categoryId) return;
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('price', String(form.price));
      fd.append('primaryUse', form.primaryUse);
      fd.append('hasStock', String(form.hasStock));
      fd.append('category', categoryId);
      fd.append('description', JSON.stringify({ main: form.descriptionMain, details: form.descriptionDetails }));
      form.images.forEach((file) => fd.append('images', file));

      const res = await createProduct(fd, router);
      if (res?.success) {
        await Swal.fire({
          title: 'Success!',
          text: 'Product created successfully',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        setShowAddModal(false);
        await loadProducts();
      } else {
        Swal.fire({
          title: 'Error!',
          text: res?.message || 'Failed to create product',
          icon: 'error',
          confirmButtonText: 'OK'
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        title: 'Error!',
        text: 'Error creating product',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredProducts = products.filter(product => {
    return product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           product.description?.main?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 ml-[240px] p-8">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-[240px] p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <button
                  onClick={() => router.back()}
                  className="flex items-center text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </button>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                {category ? category.category : 'Products'}
              </h1>
              <p className="text-gray-600 mt-2">
                Manage products in {category ? category.category : 'this category'}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              {filteredProducts.length} of {products.length} products
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={filteredProducts.map(product => product._id)}
                  strategy={verticalListSortingStrategy}
                >
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <SortableItem key={product._id} id={product._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                              {product.images && product.images.length > 0 ? (
                                <img src={product.images[0]} alt={product.name} className="h-12 w-12 object-cover" />
                              ) : (
                                <Package className="h-6 w-6 text-gray-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500 line-clamp-1">{product.description?.main}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${product.hasStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.hasStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(product.createdAt)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleViewProduct(product._id)}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="View Product"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditProduct(product._id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Edit Product"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteProduct(product._id)}
                              className="text-red-600 hover:text-red-900 p-1"
                              title="Delete Product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </SortableItem>
                    ))}
                  </tbody>
                </SortableContext>
              </DndContext>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No products found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria.'
                : 'Get started by adding a new product.'
              }
            </p>
          </div>
        )}

        {/* Product Details Modal */}
        {showProductModal && selectedProduct && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Product Details</h2>
                <button
                  onClick={closeProductModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                {productModalLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Product Images */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-3">Product Images</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedProduct.images && selectedProduct.images.length > 0 ? (
                          selectedProduct.images.map((image, index) => (
                            <img
                              key={index}
                              src={image}
                              alt={`${selectedProduct.name} - Image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))
                        ) : (
                          <div className="col-span-2 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Product Information */}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {selectedProduct.name}
                        </h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatPrice(selectedProduct.price)}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Description</h4>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedProduct.description?.main}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Category</h4>
                          <p className="text-sm text-gray-900 mt-1">
                            {selectedProduct.category?.category || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Primary Use</h4>
                          <p className="text-sm text-gray-900 mt-1 capitalize">
                            {selectedProduct.primaryUse}
                          </p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Stock Status</h4>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            selectedProduct.hasStock 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {selectedProduct.hasStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>

                        {selectedProduct.tags && selectedProduct.tags.length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700">Tags</h4>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {selectedProduct.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <h4 className="text-sm font-medium text-gray-700">Created</h4>
                          <p className="text-sm text-gray-900 mt-1">
                            {formatDate(selectedProduct.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  onClick={closeProductModal}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeProductModal();
                    handleEditProduct(selectedProduct._id);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Add Product</h2>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={submitAddProduct} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Price</label>
                    <input type="number" name="price" value={form.price} onChange={handleChange} required min="0" step="0.01" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Main Description</label>
                  <textarea name="descriptionMain" value={form.descriptionMain} onChange={handleChange} required rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" />
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Detailed Description</label>
                  <textarea name="descriptionDetails" value={form.descriptionDetails} onChange={handleChange} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">Primary Use</label>
                    <select name="primaryUse" value={form.primaryUse} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700">
                      <option value="therapeutic">Therapeutic</option>
                      <option value="functional">Functional</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-2 mt-6">
                    <input id="hasStock" type="checkbox" name="hasStock" checked={form.hasStock} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                    <label htmlFor="hasStock" className="text-sm text-gray-700">In Stock</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-700 mb-1">Images</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    <p className="text-sm text-gray-600">Click to choose files or drag and drop</p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB each</p>
                    <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileChange} className="hidden" />
                    {form.images && form.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {form.images.map((file, idx) => (
                          <div key={idx} className="h-20 w-full bg-gray-100 rounded overflow-hidden flex items-center justify-center text-xs text-gray-500">
                            {file.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                  <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">
                    {saving ? 'Saving...' : 'Create Product'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
