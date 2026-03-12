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
    return localStorage.getItem('userToken') || sessionStorage.getItem('userToken');
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
    setShowFullscreen(false); 
    setFullscreenImage(null);  

  
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

  const openContentModal = async (contentItem) => {
   
    const slug = contentItem.slug || contentItem._id; 
    
   
    router.push(`/blog/${slug}`);
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
      const res = await fetch(`https://api.mypsyguide.io/api/content/public/${selectedContent._id}/${endpoint}`, {
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

    
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be')
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

   
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

      <div className="min-h-screen relative" style={{ background: 'transparent' }}>
        {/* Global Stars Animation */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="stars-container">
            {[...Array(60)].map((_, i) => (
              <div
                key={`global-star-${i}`}
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

    

        {/* Hero Section */}
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
                Resource Center
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-300">
                Discover mushroom education, guides, and insights from Shroom Topia Detroit.
              </p>

              <div className="max-w-2xl mx-auto mb-12">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search guide, strains, or topics"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="w-full pl-10 pr-4 py-4 bg-transparent border border-[#86D1F8] rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#86D1F8]/50 focus:border-[#86D1F8]"
                    style={{ borderWidth: '0.25px' }}
                  />
                </div>
              </div>

              <div className="mb-12">
                <div className="relative flex items-center justify-center mb-6">
                  <div className="w-20 lg:w-28 h-px bg-gradient-to-r from-transparent via-[#86D1F8] to-transparent opacity-60 mr-3"></div>
                  <h2 className="text-2xl font-bold text-white">Explore Topics</h2>
                  <div className="w-20 lg:w-28 h-px bg-gradient-to-r from-transparent via-[#86D1F8] to-transparent opacity-60 ml-3"></div>
                </div>
                <div className="flex flex-wrap justify-center gap-3">
                  <button 
                    onClick={() => handleFilterChange('category', 'Getting Started')}
                    className="px-6 py-3 bg-transparent border border-[#86D1F8] rounded-full text-white hover:bg-[#86D1F8]/10 transition-all"
                    style={{ borderWidth: '0.25px' }}
                  >
                    Getting Started
                  </button>
                  <button 
                    onClick={() => handleFilterChange('category', 'Microdosing')}
                    className="px-6 py-3 bg-transparent border border-[#86D1F8] rounded-full text-white hover:bg-[#86D1F8]/10 transition-all"
                    style={{ borderWidth: '0.25px' }}
                  >
                    Microdosing
                  </button>
                  <button 
                    onClick={() => handleFilterChange('category', 'Experience')}
                    className="px-6 py-3 bg-transparent border border-[#86D1F8] rounded-full text-white hover:bg-[#86D1F8]/10 transition-all"
                    style={{ borderWidth: '0.25px' }}
                  >
                    Experience
                  </button>
                  <button 
                    onClick={() => handleFilterChange('category', 'Safety')}
                    className="px-6 py-3 bg-transparent border border-[#86D1F8] rounded-full text-white hover:bg-[#86D1F8]/10 transition-all"
                    style={{ borderWidth: '0.25px' }}
                  >
                    Safety
                  </button>
                  <button 
                    onClick={() => handleFilterChange('category', 'Formats')}
                    className="px-6 py-3 bg-transparent border border-[#86D1F8] rounded-full text-white hover:bg-[#86D1F8]/10 transition-all"
                    style={{ borderWidth: '0.25px' }}
                  >
                    Formats <span className="text-xs opacity-70">(Capsules / Edibles / Dried)</span>
                  </button>
                </div>
              </div>
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-12">
                <div className="relative flex items-center justify-center mb-6 max-w-4xl mx-auto">
                  <div className="absolute left-4 lg:left-16 w-32 lg:w-48 h-px bg-gradient-to-r from-transparent via-[#86D1F8] to-transparent opacity-60"></div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-[0.5em] uppercase text-center text-white px-12 lg:px-20" style={{ textShadow: '0 0 20px rgba(255, 255, 255, 0.6)' }}>
                    Visual Guides
                  </h2>
                  <div className="absolute right-4 lg:right-16 w-32 lg:w-48 h-px bg-gradient-to-r from-transparent via-[#86D1F8] to-transparent opacity-60"></div>
                </div>
                <div
                  className="relative max-w-4xl mx-auto"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div
                    className="relative overflow-hidden rounded-2xl shadow-2xl bg-transparent border border-gray-800/40 cursor-pointer h-[500px] md:h-[1100px]"
                    onMouseEnter={() => setIsPaused(true)}
                    onMouseLeave={() => setIsPaused(false)}
                    onClick={() => handleImageClick(galleryImages[currentImageIndex], currentImageIndex)}
                  >
                    {galleryImages.map((image, index) => (
                      <div
                        key={image._id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'
                          }`}
                      >
                        <img
                          src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5000${image.imageUrl}`}
                          alt={image.title}
                          className="w-full h-full object-contain"
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

                  <div className="flex justify-center gap-3 mt-6 flex-wrap px-4">
                    {galleryImages.map((image, index) => (
                      <button
                        key={image._id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative overflow-hidden rounded-lg transition-all ${index === currentImageIndex
                            ? 'ring-4 ring-white scale-105'
                            : 'opacity-60 hover:opacity-100'
                          }`}
                        style={{ width: '120px', height: '80px' }}
                      >
                        <img
                          src={image.imageUrl.startsWith('http') ? image.imageUrl : `http://localhost:5000${image.imageUrl}`}
                          alt={image.title}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>

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

                <div className="text-center mt-6">
                  <button 
                    onClick={() => handleImageClick(galleryImages[currentImageIndex], currentImageIndex)}
                    className="inline-flex items-center text-white hover:text-cyan-400 transition-colors"
                  >
                    View Full Guide
                    <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative flex items-center justify-center mb-8">
            <div className="w-20 lg:w-28 h-px bg-gradient-to-r from-transparent via-[#86D1F8] to-transparent opacity-60 mr-3"></div>
            <h2 className="text-2xl md:text-3xl font-bold text-white text-center">Articles</h2>
            <div className="w-20 lg:w-28 h-px bg-gradient-to-r from-transparent via-[#86D1F8] to-transparent opacity-60 ml-3"></div>
          </div>
          
          <div className="flex flex-row gap-4 mb-8">
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="flex-1 px-6 py-3 border border-[#86D1F8] bg-transparent text-white rounded-full focus:ring-2 focus:ring-[#86D1F8]/30 focus:border-[#86D1F8]"
              style={{ 
                borderWidth: '0.25px',
                textAlign: 'left',
                paddingLeft: '24px'
              }}
            >
              <option value="" className="bg-gray-900 text-white">Filter by Topic</option>
              <option value="blog" className="bg-gray-900 text-white">Blog Posts</option>
              <option value="video" className="bg-gray-900 text-white">Videos</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="flex-1 px-6 py-3 border border-[#86D1F8] bg-transparent text-white rounded-full focus:ring-2 focus:ring-[#86D1F8]/30 focus:border-[#86D1F8]"
              style={{ 
                borderWidth: '0.25px',
                textAlign: 'left',
                paddingLeft: '24px'
              }}
            >
              <option value="" className="bg-gray-900 text-white">Content Type</option>
              {categories.map((category, index) => (
                <option key={index} value={category} className="bg-gray-900 text-white">
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="text-sm text-[#86D1F8] font-medium mb-8">
            {pagination.totalItems || 0} results found
          </div>

          {/* Content Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
            </div>
          ) : content.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-gray-400 text-6xl mb-4">📚</div>
              <h3 className="text-xl font-semibold text-white mb-2">No content found</h3>
              <p className="text-gray-300">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {content.map((item) => (
                <div
                  key={item._id}
                  className="bg-white/5 backdrop-blur-sm rounded-lg border border-gray-800/40 hover:border-gray-700/60 transition-all duration-300 overflow-hidden cursor-pointer group"
                  onClick={() => openContentModal(item)}
                >
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

                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-[#86D1F8] text-black">
                        {item.type === 'video' ? 'Video' : 'Article'}
                      </span>
                    </div>

                    {item.readTime > 0 && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-black/50 text-white px-2 py-1 text-xs rounded">
                          {item.readTime} min read
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="mb-2">
                      <span className="text-sm text-green-600 font-medium">
                        {item.category}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-cyan-400 transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
                      <div className="flex items-center space-x-4">
                        <span>👁 {item.views}</span>
                        <span>❤️ {item.likes}</span>
                      </div>
                      <span>{formatDate(item.publishedAt || item.createdAt)}</span>
                    </div>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openContentModal(item);
                      }}
                      className="w-full bg-transparent border border-[#86D1F8] text-[#86D1F8] py-2 px-4 rounded-lg hover:bg-[#86D1F8]/10 transition-all text-sm font-medium"
                      style={{ borderWidth: '0.25px' }}
                    >
                      Read Guide
                    </button>

                    {item.tags && item.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {item.tags.slice(0, 3).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-transparent border border-[#86D1F8] text-[#86D1F8] text-xs rounded"
                            style={{ borderWidth: '0.25px' }}
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
                      className={`px-4 py-2 text-sm font-medium rounded-lg ${page === pagination.currentPage
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
            <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg w-[95vw] h-[95vh] overflow-y-auto shadow-2xl border border-gray-800/40">
              {/* Modal Header */}
              <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/40 p-6 flex items-center justify-between z-10">
                <div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${selectedContent.type === 'video'
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
                        className="px-3 py-1 bg-transparent border border-cyan-400/40 text-cyan-400 text-sm rounded-full"
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
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
            onClick={closeFullscreen}
          >
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 z-10"
            >
              ×
            </button>

            {/* Previous Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = currentImageIndex === 0 ? galleryImages.length - 1 : currentImageIndex - 1;
                  setCurrentImageIndex(newIndex);
                  setFullscreenImage(galleryImages[newIndex]);
                }}
                className="absolute left-4 md:left-40 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all z-10 text-2xl"
              >
                ❮
              </button>
            )}

            {/* Next Button */}
            {galleryImages.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = (currentImageIndex + 1) % galleryImages.length;
                  setCurrentImageIndex(newIndex);
                  setFullscreenImage(galleryImages[newIndex]);
                }}
                className="absolute right-4 md:right-40 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-4 rounded-full backdrop-blur-sm transition-all z-10 text-2xl"
              >
                ❯
              </button>
            )}

            <div className="relative w-full h-full overflow-y-auto overflow-x-hidden p-8">
              <div className="flex flex-col items-center min-h-full">
                <img
                  src={fullscreenImage.imageUrl.startsWith('http') ? fullscreenImage.imageUrl : `http://localhost:5000${fullscreenImage.imageUrl}`}
                  alt={fullscreenImage.title}
                  className="w-full lg:w-auto"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    height: window.innerWidth <= 768 ? 'auto' : 'auto',
                    minHeight: window.innerWidth <= 768 ? '80vh' : 'auto',
                    minWidth: window.innerWidth > 1024 ? '900px' : 'auto',
                    maxWidth: window.innerWidth > 1024 ? '1400px' : '100%'
                  }}
                />
                <div className="mt-6 text-center max-w-3xl pb-8">
                  <h3 className="text-white text-xl md:text-2xl font-semibold mb-2">{fullscreenImage.title}</h3>
                  {fullscreenImage.description && (
                    <p className="text-white/80 text-sm md:text-base">{fullscreenImage.description}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ResourceCenter;
