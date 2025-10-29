import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Api } from '../service/service';
import { useRouter } from 'next/router';
import { useUser } from './UserContext';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [items, setItems] = useState([]); // array of Product docs
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { isLoggedIn } = useUser();

  // Load wishlist after login
  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setItems([]);
    }
  }, [isLoggedIn]);

const fetchWishlist = async () => {
  try {
    setLoading(true);
    // ✅ Yahan populate add karo
    const res = await Api('GET', 'wishlist?populate=category,reviewTags', null, router);
    console.log("Wishlist fetch response:", res);
    if (res?.success) {
      setItems(res.data || []);
    }
  } catch (e) {
    // noop
  } finally {
    setLoading(false);
  }
};

  const add = async (productId) => {
    const res = await Api('POST', `wishlist/${productId}`, null, router);
    if (res?.success) setItems(res.data || []);
    return res;
  };

  const remove = async (productId) => {
    const res = await Api('DELETE', `wishlist/${productId}`, null, router);
    if (res?.success) setItems(res.data || []);
    return res;
  };

  const isInWishlist = (productId) => items?.some(p => (p._id || p.id) === productId);

  const toggle = async (product) => {
    const id = product._id || product.id;
    if (!id) return { success: false };
    if (isInWishlist(id)) {
      return await remove(id);
    } else {
      return await add(id);
    }
  };

  const value = useMemo(() => ({
    items,
    count: items?.length || 0,
    loading,
    fetchWishlist,
    add,
    remove,
    isInWishlist,
    toggle
  }), [items, loading]);

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};
