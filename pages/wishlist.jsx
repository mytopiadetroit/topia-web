import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Heart } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { useWishlist } from '../context/WishlistContext';
import { useApp } from '../context/AppContext';
import { toast } from 'react-toastify';

export default function WishlistPage() {
  const router = useRouter();
  const { isLoggedIn, loading: userLoading } = useUser();
  const { items, count, loading, remove } = useWishlist();
  const { addToCart, cart, updateCartItemQuantity } = useApp();

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    const stock = Number(product.stock || 0);
    const isAvailable = product.hasStock && stock > 0;
    if (isAvailable) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleQuantityChange = (product, newQuantity, e) => {
    if (e) e.stopPropagation();
    const stock = Number(product.stock || 0);
    const productId = product._id || product.id;
    if (newQuantity <= 0) {
      updateCartItemQuantity(productId, 0);
    } else if (stock > 0 && newQuantity > stock) {
      toast.error(`Only ${stock} items available in stock`);
    } else {
      updateCartItemQuantity(productId, newQuantity);
    }
  };

  useEffect(() => {
    if (!userLoading && !isLoggedIn) {
      router.push('/auth/login');
    }
  }, [userLoading, isLoggedIn, router]);

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#536690]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Heart className="w-7 h-7" style={{ color: '#80A6F7' }} fill="#80A6F7" />
            Wishlist
          </h1>
          <span className="text-gray-500">{count} items</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#536690]"></div>
          </div>
        ) : count === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">Your wishlist is empty.</p>
            <Link href="/menu" className="px-6 py-2 bg-[#536690] text-white rounded-full hover:bg-[#536690]">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((product) => {
              const stock = Number(product.stock || 0);
              const isOutOfStock = !product.hasStock || stock <= 0;
              const cartItem = cart.find((i) => (i.id || i._id) === (product._id || product.id));
              return (
                <div
                  key={product._id || product.id}
                  className="relative rounded-2xl border border-gray-200 hover:shadow-md transition-shadow bg-white overflow-hidden cursor-pointer"
                  onClick={() => router.push(`/productdetails?id=${product._id || product.id}`)}
                >
                  {/* Image + Stock overlay */}
                  <div className="bg-gray-50 aspect-[4/3] overflow-hidden relative">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200"></div>
                    )}
                    {isOutOfStock ? (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="text-2xl font-bold text-red-500 rotate-12 select-none text-center bg-white/90 px-4 py-2 rounded-lg">
                          Out of<br />Stock
                        </div>
                      </div>
                    ) : stock > 0 && stock < 5 ? (
                      <div className="absolute top-2 right-2 z-10">
                        <div className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Only {stock} left
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                        <p className="text-[#536690] font-bold">$ {product.price}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); remove(product._id || product.id); }}
                        className="p-2 rounded-full border hover:bg-gray-50"
                        title="Remove from wishlist"
                      >
                        <Heart className="w-5 h-5" style={{ color: '#80A6F7' }} fill="#80A6F7" />
                      </button>
                    </div>

                    {/* Cart controls */}
                    <div className="flex justify-center mt-4">
                      {cartItem ? (
                        <div className="flex items-center space-x-3" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center border border-gray-300 rounded-full bg-white">
                            <button 
                              onClick={(e) => handleQuantityChange(product, (cartItem.quantity || 0) - 1, e)}
                              className="p-2 hover:bg-gray-50 rounded-l-full transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-gray-600 hover:text-black" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14"/>
                              </svg>
                            </button>
                            <span className="px-3 py-1 text-sm text-gray-800 font-medium min-w-[2rem] text-center">
                              {cartItem.quantity}
                            </span>
                            <button 
                              onClick={(e) => handleQuantityChange(product, (cartItem.quantity || 0) + 1, e)}
                              disabled={isOutOfStock || (stock > 0 && (cartItem.quantity || 0) >= stock)}
                              className={`p-2 rounded-r-full transition-colors ${
                                isOutOfStock || (stock > 0 && (cartItem.quantity || 0) >= stock)
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" className={`w-4 h-4 ${
                                isOutOfStock || (stock > 0 && (cartItem.quantity || 0) >= stock)
                                  ? 'text-gray-400' 
                                  : 'text-gray-600 hover:text-black'
                              }`} fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 5v14M5 12h14"/>
                              </svg>
                            </button>
                          </div>
                        </div>
                      ) : isOutOfStock ? (
                        <button
                          className="w-[40%] py-2 px-4 rounded-4xl text-sm font-medium bg-gray-400 text-white cursor-not-allowed"
                          disabled={true}
                          onClick={(e) => e.stopPropagation()}
                        >
                          Out of Stock
                        </button>
                      ) : (
                        <button
                          className="w-[40%] py-2 px-4 rounded-4xl text-sm font-medium transition-colors bg-[#536690] text-white hover:bg-[#536690]"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
