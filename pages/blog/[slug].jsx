import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { fetchContentBySlug, addContentView, likeContent, unlikeContent } from '../../service/service';

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

const BlogDetail = () => {
  const router = useRouter();
  const { slug } = router.query; // Only use slug now
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);

  useEffect(() => {
    if (slug) {
      loadContent();
    }
  }, [slug]);

  const loadContent = async () => {
    try {
      setLoading(true);
      
      // Fetch by slug using service helper - SEO friendly!
      const data = await fetchContentBySlug(slug, router);

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
            const vData = await addContentView(detail._id, visitorId, router);
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
      const endpoint = isLiking ? likeContent : unlikeContent;
      const result = await endpoint(content._id, router);
      
      if (result?.success) {
        if (typeof result.data?.likes === 'number') setLikesCount(result.data.likes);
        setLiked(isLiking);
      }
    } catch (e) {
      console.error('Like toggle failed', e);
      if (e.response?.status === 401) {
        router.push('/auth/login');
      }
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
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
        
        <style>{`
          article * {
            color: white !important;
          }
          article p {
            color: #d1d5db !important;
          }
          article a {
            color: #22d3ee !important;
          }
          article a:hover {
            color: #67e8f9 !important;
          }
          article strong, article b {
            color: white !important;
          }
          article [style*="background"] {
            background: transparent !important;
          }
        `}</style>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>

        {/* Header */}
        <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link href="/resourcecenter" className="text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors">
              ← Back to Resource Center
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <article className="bg-black/40 backdrop-blur-md rounded-lg border border-white/10 p-8 shadow-lg shadow-cyan-500/10">
            {/* Type Badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                content.type === 'video'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
              }`}>
                {content.type === 'video' ? 'Video' : 'Blog Post'}
              </span>
              <span className="ml-3 text-sm text-cyan-400 font-medium">
                {content.category}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {content.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center space-x-6 text-sm text-gray-400 mb-6 pb-6 border-b border-white/10">
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
                  className="w-full h-64 md:h-96 rounded-lg border border-white/10"
                  style={{ border: 0 }}
                  allowFullScreen
                ></iframe>
              </div>
            ) : content.featuredImage ? (
              <div className="mb-8">
                <img
                  src={content.featuredImage}
                  alt={content.title}
                  className="w-full h-auto rounded-lg border border-white/10"
                />
              </div>
            ) : null}

            {/* Description */}
            {content.description && (
              <div className="mb-8">
                <p className="text-xl text-gray-300 leading-relaxed">
                  {content.description}
                </p>
              </div>
            )}

            {/* Content */}
            <div className="prose prose-lg prose-invert max-w-none mb-8">
              <div
                className="text-white leading-relaxed whitespace-pre-wrap [&_*]:text-white [&_h1]:text-white [&_h2]:text-white [&_h3]:text-white [&_h4]:text-white [&_h5]:text-white [&_h6]:text-white [&_p]:text-gray-200 [&_li]:text-gray-200 [&_span]:text-gray-200 [&_div]:text-gray-200 [&_a]:text-cyan-400 [&_a:hover]:text-cyan-300 [&_strong]:text-white [&_b]:text-white [&_em]:text-gray-300"
                dangerouslySetInnerHTML={{ __html: content.content.replace(/\n/g, '<br>') }}
              />
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8 pb-8 border-b border-white/10">
                {content.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-full border border-blue-500/30 hover:border-blue-400/50 transition-colors"
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
                className={`px-6 py-3 rounded-lg transition-all ${
                  liked 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 hover:border-cyan-400 shadow-lg shadow-cyan-500/20' 
                    : 'bg-white/10 text-white border border-white/20 hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20'
                }`}
              >
                {liked ? '💙 Liked' : '❤️ Like'} ({likesCount})
              </button>
              <button 
                onClick={handleShare} 
                className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-lg hover:border-cyan-400/50 hover:shadow-lg hover:shadow-cyan-500/20 transition-all"
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
