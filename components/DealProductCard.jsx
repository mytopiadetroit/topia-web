// import { useState } from 'react';
// import { useRouter } from 'next/router';
// import { toast } from 'react-toastify';
// import { Tag } from 'lucide-react';

// export default function DealProductCard({ product, discount, addToCart, cart, updateCartItemQuantity }) {
//   const router = useRouter();
//   const [hoveredProductId, setHoveredProductId] = useState(null);

//   const colors = [
//     { bg: '#FEF3C7', color: '#92400E' },
//     { bg: '#DBEAFE', color: '#1E40AF' },
//     { bg: '#FCE7F3', color: '#9F1239' },
//     { bg: '#D1FAE5', color: '#065F46' },
//   ];

//   const handleProductClick = (product) => {
//     router.push(`/productdetails?id=${product._id}`);
//   };

//   // Check if product has variants
//   const hasVariants = product.hasVariants && product.variants && product.variants.length > 0;
  
//   // Check if product has flavors
//   const hasFlavors = product.flavors && product.flavors.length > 0 && product.flavors.some(f => f.isActive);

//   // For products with variants - HORIZONTAL LAYOUT
//   if (hasVariants) {
//     return (
//       <div
//         key={product._id}
//         className="relative rounded-3xl border-2 border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden cursor-pointer"
//         onClick={() => handleProductClick(product)}
//         onMouseEnter={() => setHoveredProductId(product._id)}
//         onMouseLeave={() => setHoveredProductId(null)}
//       >
//         {/* Discount Badge */}
//         <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 animate-pulse">
//           <Tag className="w-4 h-4" />
//           {discount}% OFF
//         </div>

//         {/* HORIZONTAL LAYOUT - Image Left, Details Right */}
//         <div className="flex flex-col lg:flex-row">
//           {/* Product Image - Left Side */}
//           <div className="w-full lg:w-2/5 h-64 lg:h-80 bg-gray-100 relative">
//             {product.images && product.images.length > 0 ? (
//               <img
//                 src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
//                 alt={product.name}
//                 className="w-full h-full object-cover"
//               />
//             ) : (
//               <div className="w-full h-full bg-gray-200"></div>
//             )}

//             {/* Out of Stock Overlay */}
//             {product.variants.every(v => Number(v.stock || 0) <= 0) && (
//               <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
//                 <div className="text-2xl font-bold text-white">
//                   Out of Stock
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Product Details - Right Side */}
//           <div className="w-full lg:w-3/5 p-6">
//             <h3 className="text-2xl font-bold text-gray-900 mb-3">{product.name}</h3>

//           {/* Intensity Bar */}
//           {product.intensity && (
//             <div className="mb-4">
//               <div className="flex items-center justify-between mb-1">
//                 <span className="text-sm text-gray-600">Intensity</span>
//                 <span className={`text-sm font-bold ${
//                   product.intensity <= 3 ? 'text-green-600' :
//                   product.intensity <= 7 ? 'text-yellow-600' : 'text-red-500'
//                 }`}>
//                   {product.intensity <= 3 ? 'Mild' : product.intensity <= 7 ? 'Medium' : 'Strong'} ({product.intensity}/10)
//                 </span>
//               </div>
//               <div className="w-full bg-gray-200 rounded-full h-2">
//                 <div
//                   className="h-2 rounded-full transition-all"
//                   style={{
//                     width: `${(product.intensity / 10) * 100}%`,
//                     backgroundColor: product.intensity <= 3 ? '#10B981' : product.intensity <= 7 ? '#F59E0B' : '#EF4444'
//                   }}
//                 ></div>
//               </div>
//             </div>
//           )}

//           {/* Review Tags */}
//           {product.reviewTags && product.reviewTags.length > 0 && (
//             <div className="flex flex-wrap gap-2 mb-4">
//               {product.reviewTags.slice(0, 3).map((tag, idx) => {
//                 const color = colors[idx % colors.length];
//                 return (
//                   <span
//                     key={tag._id}
//                     className="px-3 py-1 text-xs rounded-full font-medium"
//                     style={{ backgroundColor: color.bg, color: color.color }}
//                   >
//                     {tag.label}
//                   </span>
//                 );
//               })}
//             </div>
//           )}

//           {/* Variants - Inline Style */}
//           <div className="mt-4">
//             <div className="flex flex-wrap items-center gap-3">
//               {product.variants.map((variant) => {
//               const cartItem = cart.find((i) => {
//                 const isSameProduct = (i.id || i._id) === product._id;
//                 const isSameVariant = i.selectedVariant?._id === variant._id;
//                 return isSameProduct && isSameVariant;
//               });

//               const isInCart = cartItem && cartItem.quantity > 0;
//               const variantStock = Number(variant.stock || 0);
//               const isOutOfStock = variantStock <= 0;
              
//               // Calculate discounted price
//               const originalPrice = variant.price;
//               const discountedPrice = originalPrice - (originalPrice * discount / 100);

//               return (
//                 <div
//                   key={variant._id}
//                   className="relative border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white min-w-[110px]"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   {/* Add to Cart Button */}
//                   <div className="absolute -top-2 -right-2">
//                     {isInCart ? (
//                       <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             updateCartItemQuantity(product._id, cartItem.quantity - 1, variant);
//                           }}
//                           className="p-1 hover:bg-gray-50 rounded-l-full"
//                         >
//                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                             <path d="M5 12h14" />
//                           </svg>
//                         </button>
//                         <span className="px-2 text-xs font-bold">{cartItem.quantity}</span>
//                         <button
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             if (cartItem.quantity < variantStock) {
//                               updateCartItemQuantity(product._id, cartItem.quantity + 1, variant);
//                             } else {
//                               toast.error(`Only ${variantStock} available`);
//                             }
//                           }}
//                           disabled={cartItem.quantity >= variantStock}
//                           className="p-1 hover:bg-gray-50 rounded-r-full disabled:opacity-50"
//                         >
//                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                             <path d="M12 5v14M5 12h14" />
//                           </svg>
//                         </button>
//                       </div>
//                     ) : (
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           if (!isOutOfStock) {
//                             addToCart({ ...product, selectedVariant: variant }, 1);
//                             toast.success(`${product.name} added to cart!`);
//                           }
//                         }}
//                         disabled={isOutOfStock}
//                         className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
//                           isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
//                         }`}
//                       >
//                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
//                           <path d="M12 5v14M5 12h14" />
//                         </svg>
//                       </button>
//                     )}
//                   </div>

//                   {/* Size and Price */}
//                   <div className="flex flex-col">
//                     <span className="text-sm font-bold text-gray-900">
//                       {variant.size.value}{variant.size.unit === 'grams' ? 'G' : variant.size.unit}
//                     </span>
//                     <div className="flex items-center gap-2">
//                       <span className="text-base font-bold text-green-600">
//                         ${discountedPrice.toFixed(2)}
//                       </span>
//                       <span className="text-xs text-gray-400 line-through">
//                         ${originalPrice.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               );
//             })}
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // For products with flavors
//   if (hasFlavors) {
//     return (
//       <div
//         key={product._id}
//         className="relative rounded-3xl border-2 border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden cursor-pointer"
//         onClick={() => handleProductClick(product)}
//       >
//         {/* Discount Badge */}
//         <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 animate-pulse">
//           <Tag className="w-4 h-4" />
//           {discount}% OFF
//         </div>

//         {/* Product Image */}
//         <div className="relative h-64 bg-gray-100">
//           {product.images && product.images.length > 0 ? (
//             <img
//               src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
//               alt={product.name}
//               className="w-full h-full object-cover"
//             />
//           ) : (
//             <div className="w-full h-full bg-gray-200"></div>
//           )}
//         </div>

//         {/* Product Details */}
//         <div className="p-5">
//           <h3 className="text-xl font-bold text-gray-900 mb-3">{product.name}</h3>

//           {/* Flavors */}
//           <div className="space-y-2">
//             {product.flavors.filter(f => f.isActive).map((flavor) => {
//               const cartItem = cart.find((i) => {
//                 const isSameProduct = (i.id || i._id) === product._id;
//                 const isSameFlavor = i.selectedFlavor?._id === flavor._id;
//                 return isSameProduct && isSameFlavor;
//               });

//               const isInCart = cartItem && cartItem.quantity > 0;
//               const flavorStock = Number(flavor.stock || 0);
//               const isOutOfStock = flavorStock <= 0;
              
//               // Calculate discounted price
//               const originalPrice = flavor.price;
//               const discountedPrice = originalPrice - (originalPrice * discount / 100);

//               return (
//                 <div
//                   key={flavor._id}
//                   className="flex items-center justify-between border-2 border-gray-900 rounded-2xl px-4 py-3 bg-white"
//                   onClick={(e) => e.stopPropagation()}
//                 >
//                   <div className="flex-1">
//                     <div className="font-bold text-gray-900">{flavor.name}</div>
//                     <div className="flex items-center gap-2">
//                       <span className="text-base font-bold text-green-600">
//                         ${discountedPrice.toFixed(2)}
//                       </span>
//                       <span className="text-xs text-gray-400 line-through">
//                         ${originalPrice.toFixed(2)}
//                       </span>
//                     </div>
//                   </div>

//                   {/* Add to Cart */}
//                   {isInCart ? (
//                     <div className="flex items-center border-2 border-gray-900 rounded-full bg-white">
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           updateCartItemQuantity(product._id, cartItem.quantity - 1, null, flavor);
//                         }}
//                         className="p-1 hover:bg-gray-50 rounded-l-full"
//                       >
//                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                           <path d="M5 12h14" />
//                         </svg>
//                       </button>
//                       <span className="px-2 text-xs font-bold">{cartItem.quantity}</span>
//                       <button
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           if (cartItem.quantity < flavorStock) {
//                             updateCartItemQuantity(product._id, cartItem.quantity + 1, null, flavor);
//                           } else {
//                             toast.error(`Only ${flavorStock} available`);
//                           }
//                         }}
//                         disabled={cartItem.quantity >= flavorStock}
//                         className="p-1 hover:bg-gray-50 rounded-r-full disabled:opacity-50"
//                       >
//                         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                           <path d="M12 5v14M5 12h14" />
//                         </svg>
//                       </button>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         if (!isOutOfStock) {
//                           addToCart({ ...product, selectedFlavor: flavor }, 1);
//                           toast.success(`${product.name} - ${flavor.name} added!`);
//                         }
//                       }}
//                       disabled={isOutOfStock}
//                       className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
//                         isOutOfStock ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-900 hover:bg-gray-800'
//                       }`}
//                     >
//                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
//                         <path d="M12 5v14M5 12h14" />
//                       </svg>
//                     </button>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Simple product (no variants/flavors)
//   const originalPrice = product.price || 0;
//   const discountedPrice = originalPrice - (originalPrice * discount / 100);
//   const stock = Number(product.stock || 0);
//   const isOutOfStock = !product.hasStock || stock <= 0;

//   const cartItem = cart.find((i) => (i.id || i._id) === product._id);
//   const isInCart = cartItem && cartItem.quantity > 0;

//   return (
//     <div
//       className="relative rounded-3xl border-2 border-gray-200 hover:shadow-xl transition-all bg-white overflow-hidden cursor-pointer"
//       onClick={() => handleProductClick(product)}
//     >
//       {/* Discount Badge */}
//       <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2 animate-pulse">
//         <Tag className="w-4 h-4" />
//         {discount}% OFF
//       </div>

//       {/* Product Image */}
//       <div className="relative h-64 bg-gray-100">
//         {product.images && product.images.length > 0 ? (
//           <img
//             src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000${product.images[0]}`}
//             alt={product.name}
//             className="w-full h-full object-cover"
//           />
//         ) : (
//           <div className="w-full h-full bg-gray-200"></div>
//         )}

//         {isOutOfStock && (
//           <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/50">
//             <div className="text-2xl font-bold text-white">Out of Stock</div>
//           </div>
//         )}
//       </div>

//       {/* Product Details */}
//       <div className="p-5">
//         <h3 className="text-xl font-bold text-gray-900 mb-3">{product.name}</h3>

//         {/* Price */}
//         <div className="flex items-center gap-3 mb-4">
//           <span className="text-2xl font-bold text-green-600">
//             ${discountedPrice.toFixed(2)}
//           </span>
//           <span className="text-lg text-gray-400 line-through">
//             ${originalPrice.toFixed(2)}
//           </span>
//         </div>

//         {/* Add to Cart */}
//         <div onClick={(e) => e.stopPropagation()}>
//           {isInCart ? (
//             <div className="flex items-center justify-center border-2 border-gray-900 rounded-full bg-white py-2">
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   updateCartItemQuantity(product._id, cartItem.quantity - 1);
//                 }}
//                 className="px-4 hover:bg-gray-50"
//               >
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                   <path d="M5 12h14" />
//                 </svg>
//               </button>
//               <span className="px-4 font-bold">{cartItem.quantity}</span>
//               <button
//                 onClick={(e) => {
//                   e.stopPropagation();
//                   if (cartItem.quantity < stock) {
//                     updateCartItemQuantity(product._id, cartItem.quantity + 1);
//                   } else {
//                     toast.error(`Only ${stock} available`);
//                   }
//                 }}
//                 disabled={cartItem.quantity >= stock}
//                 className="px-4 hover:bg-gray-50 disabled:opacity-50"
//               >
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
//                   <path d="M12 5v14M5 12h14" />
//                 </svg>
//               </button>
//             </div>
//           ) : (
//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 if (!isOutOfStock) {
//                   addToCart(product, 1);
//                   toast.success(`${product.name} added to cart!`);
//                 }
//               }}
//               disabled={isOutOfStock}
//               className={`w-full py-3 rounded-full font-bold ${
//                 isOutOfStock
//                   ? 'bg-gray-300 cursor-not-allowed text-gray-500'
//                   : 'bg-gray-900 hover:bg-gray-800 text-white'
//               }`}
//             >
//               {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
//             </button>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
