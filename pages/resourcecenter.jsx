import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { fetchGalleryImages } from '../service/service';
// Simple UUID generator for visitorId
const uuid = () =>
  'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

const getVisitorId = () => {
  if (typeof window === 'undefined') return null;
  let id = localStorage.getItem('visitorId');
  if (!id) {
    id = uuid();
    localStorage.setItem('visitorId', id);
  }
  return id;
};




const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }
  return null;
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};



const ResourceCenter = () => {
  const router = useRouter();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    category: '',
    search: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});
  const [categories, setCategories] = useState([]);
  const [selectedContent, setSelectedContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  
  // Gallery states
  const [galleryImages, setGalleryImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState(null);

  useEffect(() => {
    loadContent();
    loadCategories();
    loadGalleryImages();
  }, [filters]);

 useEffect(() => {
  if (galleryImages.length === 0 || isPaused || showFullscreen) return; // Add showFullscreen check
  
  const interval = setInterval(() => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  }, 2000);

  return () => clearInterval(interval);
}, [galleryImages.length, isPaused, showFullscreen]);

  const loadGalleryImages = async () => {
    try {
      const response = await fetchGalleryImages(router);
      if (response.success && response.data) {
        setGalleryImages(response.data);
      }
    } catch (error) {
      console.error('Error loading gallery images:', error);
    }
  };

const handleImageClick = (image, index) => {
  console.log('Clicked image index:', index);
  console.log('Clicked image:', image.title);
  
  setIsPaused(true);
  setShowFullscreen(false); // Add this
  setFullscreenImage(null);  // Add this - reset first
  
  // Use setTimeout to ensure state updates
  setTimeout(() => {
    setCurrentImageIndex(index);
    setFullscreenImage(image);
    setShowFullscreen(true);
    document.body.style.overflow = 'hidden';
  }, 0);
};

  const closeFullscreen = () => {
    setShowFullscreen(false);
    setFullscreenImage(null);
     setIsPaused(false);
    document.body.style.overflow = 'auto';
  };

const loadContent = async () => {
  try {
    setLoading(true);
    const queryParams = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key]) {
        queryParams.append(key, filters[key]);
      }
    });

    const response = await fetch(`https://api.mypsyguide.io/api/content/public?${queryParams}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    
    if (data.success) {
      setContent(data.data);
      setPagination(data.pagination);
    }
  } catch (error) {
    console.error('Error loading content:', error);
  } finally {
    setLoading(false);
  }
};

const loadCategories = async () => {
  try {
    const response = await fetch('https://api.mypsyguide.io/api/content/categories', {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    
    if (data.success) {
      setCategories(data.data);
    }
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1
    }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

const openContentModal = async (contentId) => {
  try {
    const response = await fetch(`https://api.mypsyguide.io/api/content/public/${contentId}`, {
      headers: getAuthHeaders()
    });
    const data = await response.json();
    
    if (data.success) {
      const detail = data.data;
      setSelectedContent(detail);
      setLikesCount(detail.likes || 0);
      setViewsCount(detail.views || 0);
      // determine liked if user is logged in and likedBy present
      try {
        const userDetail = JSON.parse(localStorage.getItem('userDetail') || 'null');
        const userId = userDetail?._id || userDetail?.id;
        const likedBy = detail.likedBy || [];
        const hasLiked = userId ? likedBy.some((u) => String(u) === String(userId)) : false;
        setLiked(!!hasLiked);
      } catch {}
      setShowModal(true);
      document.body.style.overflow = 'hidden';

      // Add unique view
      const visitorId = getVisitorId();
      if (visitorId) {
        try {
          const vRes = await fetch(`https://api.mypsyguide.io/api/content/public/${contentId}/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ visitorId })
          });
          const vData = await vRes.json();
          if (vData?.success && vData?.data?.views != null) {
            setViewsCount(vData.data.views);
          }
        } catch (e) {
          console.warn('View track failed', e);
        }
      }
    }
  } catch (error) {
    console.error('Error loading content details:', error);
  }
};

  const closeModal = () => {
    setShowModal(false);
    setSelectedContent(null);
    setLiked(false);
    setLikesCount(0);
    setViewsCount(0);
    document.body.style.overflow = 'unset';
  };

  const handleToggleLike = async () => {
    if (!selectedContent) return;
    const isLiking = !liked;
    try {
      const endpoint = isLiking ? 'like' : 'unlike';
      // "http://localhost:5000/api/";
      const res = await fetch(`https://api.mypsyguide.io/api/content/public/${selectedContent._id}/${endpoint}` , {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const j = await res.json();
      if (j?.success) {
        if (typeof j.data?.likes === 'number') setLikesCount(j.data.likes);
        setLiked(isLiking);
      } else if (res.status === 401) {
        // redirect to login if unauthorized
        router.push('/auth/login');
      }
    } catch (e) {
      console.error('Like toggle failed', e);
    }
  };

  const handleShare = async () => {
    if (!selectedContent) return;
    const shareUrl = window.location.href;
    const title = selectedContent.title;
    const text = selectedContent.description || 'Check this out!';
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard');
      }
    } catch (e) {
      console.warn('Share failed', e);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return '';
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    return url;
  };

  return (
    <>
      <Head>
        <title>Resource Center - ShroomTopia</title>
        <meta name="description" content="Explore our comprehensive collection of mushroom-related content, including blogs, videos, and educational resources." />
        <meta name="keywords" content="mushrooms, wellness, health, blogs, videos, resources" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#80A6F7] to-[#80A6F7] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Resource Center
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Discover the world of functional mushrooms through our curated collection of blogs, videos, and educational content
              </p>
              
              {/* Search Bar */}
              <div className="max-w-2xl border-white border-1 rounded-4xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search for content..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full px-6 py-4 text-gray-900 rounded-full text-lg focus:outline-none focus:ring-4 focus:ring-white/30"
                  />
                  <button className="absolute right-2 top-2 bg-white text-[#80A6F7] px-6 py-2 rounded-full  transition-colors">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Gallery Visual Guides Section */}
            {galleryImages.length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl md:text-3xl font-bold tracking-[0.5em] uppercase mb-6 text-center">
                  Visual Guides
                </h2>
                <div 
                  className="relative max-w-4xl mx-auto"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {/* Main Image Display */}
                  <div 
  className="relative overflow-hidden rounded-2xl shadow-2xl aspect-video bg-white/10 cursor-pointer"
  onMouseEnter={() => setIsPaused(true)}
  onMouseLeave={() => setIsPaused(false)}
  onClick={() => handleImageClick(galleryImages[currentImageIndex], currentImageIndex)} // Move onClick here
>
  {galleryImages.map((image, index) => (
    <div
      key={image._id}
      className={`absolute inset-0 transition-opacity duration-1000 ${
        index === currentImageIndex ? 'opacity-100' : 'opacity-0'
      }`}
      // Remove onClick from here
    >
      <img
        src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5000${image.imageUrl}`}
        alt={image.title}
        className="w-full h-full object-cover"
      />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                          <h3 className="text-white text-xl font-semibold">{image.title}</h3>
                          {image.description && (
                            <p className="text-white/90 text-sm mt-1">{image.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Carousel Indicators */}
                  <div className="flex justify-center gap-2 mt-4">
                    {galleryImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-8' 
                            : 'bg-white/40 w-2 hover:bg-white/60'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                 {galleryImages.length > 1 && (
  <>
    <button
      onClick={() => setCurrentImageIndex((prev) => 
        prev === 0 ? galleryImages.length - 1 : prev - 1
      )}
      className="absolute -left-3 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all"
    >
      ❮
    </button>
    <button
      onClick={() => setCurrentImageIndex((prev) => 
        (prev + 1) % galleryImages.length
      )}
      className="absolute -right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 md:p-3 rounded-full backdrop-blur-sm transition-all"
    >
      ❯
    </button>
  </>
)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="px-4 py-2 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Content Types</option>
                  <option value="blog">Blog Posts</option>
                  <option value="video">Videos</option>
                </select>
                
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-4 py-2 border text-gray-700  border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="text-sm text-gray-600">
                {pagination.totalItems || 0} results found
              </div>
            </div>
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {content.map((item) => (
                <div
                  key={item._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden cursor-pointer group"
                  onClick={() => openContentModal(item._id)}
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200">
                  {item.featuredImage ? (
  <img
    src={item.featuredImage}
    alt={item.title}
    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
  />
) : (
  <div className="w-full h-full flex items-center justify-center text-gray-400">
    {item.type === 'video' ? '🎥' : '📝'}
  </div>
)}
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        item.type === 'video' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type === 'video' ? 'Video' : 'Blog'}
                      </span>
                    </div>

                    {/* Read Time */}
                    {item.readTime > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/50 text-white px-2 py-1 text-xs rounded">
                          {item.readTime} min read
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-sm text-green-600 font-medium">
                        {item.category}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                      {item.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>👁 {item.views}</span>
                        <span>❤️ {item.likes}</span>
                      </div>
                      <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                    </div>

                    {/* Tags */}
                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.tags.length > 3 && (
                          <span className="text-xs text-gray-500">
                            +{item.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + Math.max(1, pagination.currentPage - 2);
                  if (page > pagination.totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${
                        page === pagination.currentPage
                          ? 'bg-green-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>

        {/* Content Modal */}
        {showModal && selectedContent && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-[95vw] h-[95vh] overflow-y-auto shadow-2xl">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b p-6 flex items-center justify-between z-10">
                <div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    selectedContent.type === 'video' 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedContent.type === 'video' ? 'Video' : 'Blog Post'}
                  </span>
                  <span className="ml-3 text-sm text-green-600 font-medium">
                    {selectedContent.category}
                  </span>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {selectedContent.title}
                </h1>

                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <span>By {selectedContent.author?.name}</span>
                  <span>{formatDate(selectedContent.publishedAt || selectedContent.createdAt)}</span>
                  <span>👁 {viewsCount} views</span>
                  <span>❤️ {likesCount} likes</span>
                  {selectedContent.readTime > 0 && (
                    <span>{selectedContent.readTime} min read</span>
                  )}
                </div>

                {/* Featured Image or Video */}
                {selectedContent.type === 'video' && selectedContent.videoUrl ? (
                  <div className="mb-6">
                    <iframe
                      src={getVideoEmbedUrl(selectedContent.videoUrl)}
                      className="w-full h-64 md:h-96 rounded-lg"
                      frameBorder="0"
                      allowFullScreen
                    ></iframe>
                  </div>
               ) : selectedContent.featuredImage ? (
  <div className="mb-6">
    <img
      src={selectedContent.featuredImage}
      alt={selectedContent.title}
      className="w-full h-auto rounded-lg"
    />
  </div>
) : null}

                {/* Description */}
                <div className="mb-6">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {selectedContent.description}
                  </p>
                </div>

                {/* Content */}
                <div className="prose prose-lg max-w-none mb-6">
                  <div 
                    className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                    dangerouslySetInnerHTML={{ __html: selectedContent.content.replace(/\n/g, '<br>') }}
                  />
                </div>

                {/* Tags */}
                {selectedContent.tags && selectedContent.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedContent.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4 pt-6 border-t">
                  <button onClick={handleToggleLike} className={`px-6 py-2 rounded-lg transition-colors ${liked ? 'bg-[#80A6F7] text-white hover:bg-[#6f93df]' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                    {liked ? '💙 Liked' : '❤️ Like'} ({likesCount})
                  </button>
                  <button onClick={handleShare} className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    📤 Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Image Modal */}
      {showFullscreen && fullscreenImage && (
  <div 
    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
    onClick={closeFullscreen}
  >
    <button
      onClick={closeFullscreen}
      className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
    >
      ×
    </button>
    <div className="relative max-w-7xl w-full h-full flex flex-col items-center justify-center">
      {console.log('RENDERING fullscreenImage:', fullscreenImage.title, fullscreenImage._id)}
      <img
        src={fullscreenImage.imageUrl.startsWith('http') ? fullscreenImage.imageUrl : `http://localhost:5000${fullscreenImage.imageUrl}`}
        alt={fullscreenImage.title}
        className="max-w-full max-h-[85vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <div className="mt-6 text-center">
        <h3 className="text-white text-2xl font-semibold mb-2">{fullscreenImage.title}</h3>
        {/* <p className="text-red-500">ID: {fullscreenImage._id}</p> */}
                {fullscreenImage.description && (
                  <p className="text-white/80 text-lg">{fullscreenImage.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResourceCenter;
