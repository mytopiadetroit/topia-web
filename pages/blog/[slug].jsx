import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

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

const BlogDetail = () => {
  const router = useRouter();
  const { slug, id } = router.query; // Get both slug and id from URL
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
    if (id) {
      // Use ID to fetch content (no backend changes needed!)
      loadContent();
    }
  }, [id]);

  const loadContent = async () => {
    try {
      setLoading(true);
      // Fetch by ID - existing endpoint
      const response = await fetch(`https://api.mypsyguide.io/api/content/public/${id}`, {
        headers: getAuthHeaders()
      });
      const data = await response.json();

      if (data.success) {
        const detail = data.data;
        setContent(detail);
        setLikesCount(detail.likes || 0);
        setViewsCount(detail.views || 0);
        
        // Check if user has liked
        try {
          const userDetail = JSON.parse(localStorage.getItem('userDetail') || 'null');
          const userId = userDetail?._id || userDetail?.id;
          const likedBy = detail.likedBy || [];
          const hasLiked = userId ? likedBy.some((u) => String(u) === String(userId)) : false;
          setLiked(!!hasLiked);
        } catch { }

        // Add unique view
        const visitorId = getVisitorId();
        if (visitorId) {
          try {
            const vRes = await fetch(`https://api.mypsyguide.io/api/content/public/${detail._id}/view`, {
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
      } else {
        // Content not found
        router.push('/resourcecenter');
      }
    } catch (error) {
      console.error('Error loading content:', error);
      router.push('/resourcecenter');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLike = async () => {
    if (!content) return;
    const isLiking = !liked;
    try {
      const endpoint = isLiking ? 'like' : 'unlike';
      const res = await fetch(`https://api.mypsyguide.io/api/content/public/${content._id}/${endpoint}`, {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const j = await res.json();
      if (j?.success) {
        if (typeof j.data?.likes === 'number') setLikesCount(j.data.likes);
        setLiked(isLiking);
      } else if (res.status === 401) {
        router.push('/auth/login');
      }
    } catch (e) {
      console.error('Like toggle failed', e);
    }
  };

  const handleShare = async () => {
    if (!content) return;
    const shareUrl = window.location.href;
    const title = content.title;
    const text = content.description || 'Check this out!';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <>
      <Head>
        <title>{content.title} - ShroomTopia Resource Center</title>
        <meta name="description" content={content.description || content.title} />
        <meta name="keywords" content={content.tags?.join(', ') || 'mushrooms, wellness, health'} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={content.title} />
        <meta property="og:description" content={content.description || content.title} />
        {content.featuredImage && <meta property="og:image" content={content.featuredImage} />}
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={content.title} />
        <meta name="twitter:description" content={content.description || content.title} />
        {content.featuredImage && <meta name="twitter:image" content={content.featuredImage} />}
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/resourcecenter" className="text-green-600 hover:text-green-700 flex items-center gap-2">
              ← Back to Resource Center
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg shadow-sm p-8">
            {/* Type Badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                content.type === 'video'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {content.type === 'video' ? 'Video' : 'Blog Post'}
              </span>
              <span className="ml-3 text-sm text-green-600 font-medium">
                {content.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {content.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6 pb-6 border-b">
              <span>By {content.author?.name}</span>
              <span>{formatDate(content.publishedAt || content.createdAt)}</span>
              <span>👁 {viewsCount} views</span>
              <span>❤️ {likesCount} likes</span>
              {content.readTime > 0 && (
                <span>{content.readTime} min read</span>
              )}
            </div>

            {/* Featured Image or Video */}
            {content.type === 'video' && content.videoUrl ? (
              <div className="mb-8">
                <iframe
                  src={getVideoEmbedUrl(content.videoUrl)}
                  className="w-full h-64 md:h-96 rounded-lg"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
              </div>
            ) : content.featuredImage ? (
              <div className="mb-8">
                <img
                  src={content.featuredImage}
                  alt={content.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>
            ) : null}

            {/* Description */}
            {content.description && (
              <div className="mb-8">
                <p className="text-xl text-gray-700 leading-relaxed">
                  {content.description}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg max-w-none mb-8">
              <div
                className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b">
                {content.tags.map((tag, index) => (
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
            <div className="flex justify-center space-x-4">
              <button 
                onClick={handleToggleLike} 
                className={`px-6 py-3 rounded-lg transition-colors ${
                  liked 
                    ? 'bg-[#80A6F7] text-white hover:bg-[#6f93df]' 
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {liked ? '💙 Liked' : '❤️ Like'} ({likesCount})
              </button>
              <button 
                onClick={handleShare} 
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                📤 Share
              </button>
            </div>
          </article>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;
