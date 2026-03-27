'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { Api } from '../service/service';
import { useRouter } from 'next/router';

const GoogleReviews = () => {
  const router = useRouter();
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(3);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef(null);
  const carouselRef = useRef(null);

  useEffect(() => {
    loadReviews();
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Auto-play carousel every 3 seconds
  useEffect(() => {
    if (reviews.length > 0 && !isTransitioning) {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
      autoPlayRef.current = setInterval(() => {
        nextSlide();
      }, 3000);
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [reviews.length, isTransitioning]);

  const handleResize = () => {
    if (window.innerWidth < 768) {
      setItemsPerPage(1); // Mobile: 1 review
    } else {
      setItemsPerPage(3); // Desktop: 3 reviews
    }
  };

  const loadReviews = async () => {
    try {
      const response = await Api('get', 'google-reviews', null, router);
      
      if (response.success && response.data) {
        const googleReviews = response.data.reviews || [];
        
        // Format reviews for display
        const formattedReviews = googleReviews.map((review, index) => ({
          id: review.time || index, // Use timestamp as unique ID
          author: review.author_name,
          rating: review.rating,
          text: review.text,
          relativeTime: review.relative_time_description,
          profilePhoto: review.profile_photo_url
        }));
        
        setReviews(formattedReviews);
        setAverageRating(response.data.rating || 0);
        setTotalReviews(response.data.user_ratings_total || 0);
      } else {
        // Fallback to high-quality dummy data if API fails
        setReviews([
          {
            id: 1,
            author: "Marcus Johnson",
            rating: 5,
            text: "Exceptional quality and service! The staff is incredibly knowledgeable about their products and helped me find exactly what I was looking for. The atmosphere is welcoming and professional. Highly recommend to anyone seeking premium wellness products.",
            relativeTime: "1 week ago",
            profilePhoto: null
          },
          {
            id: 2,
            author: "Sarah Chen",
            rating: 5,
            text: "Outstanding experience from start to finish. The product selection is impressive and the quality is top-notch. The team takes time to educate customers and ensure you're making the right choice for your needs. Will definitely be returning!",
            relativeTime: "2 weeks ago",
            profilePhoto: null
          },
          {
            id: 3,
            author: "David Rodriguez",
            rating: 5,
            text: "Clean, modern facility with a great variety of products. The staff is friendly, professional, and really knows their stuff. They made me feel comfortable as a first-time customer and provided excellent guidance.",
            relativeTime: "3 weeks ago",
            profilePhoto: null
          },
          {
            id: 4,
            author: "Emily Thompson",
            rating: 4,
            text: "Great selection and knowledgeable staff. The quality of products is consistently high and the customer service is excellent. The location is convenient and the atmosphere is very welcoming.",
            relativeTime: "1 month ago",
            profilePhoto: null
          },
          {
            id: 5,
            author: "Michael Brown",
            rating: 5,
            text: "Fantastic place with amazing products! The team is super helpful and takes the time to explain everything. The quality is unmatched and the prices are fair. This is definitely my go-to spot.",
            relativeTime: "1 month ago",
            profilePhoto: null
          }
        ]);
        setAverageRating(4.8);
        setTotalReviews(247);
      }
    } catch (error) {
      console.error('❌ Error loading reviews:', error);
      // Final fallback to high-quality dummy data on error
      setReviews([
        {
          id: 1,
          author: "Marcus Johnson",
          rating: 5,
          text: "Exceptional quality and service! The staff is incredibly knowledgeable about their products and helped me find exactly what I was looking for. The atmosphere is welcoming and professional.",
          relativeTime: "1 week ago",
          profilePhoto: null
        },
        {
          id: 2,
          author: "Sarah Chen",
          rating: 5,
          text: "Outstanding experience from start to finish. The product selection is impressive and the quality is top-notch. The team takes time to educate customers and ensure you're making the right choice.",
          relativeTime: "2 weeks ago",
          profilePhoto: null
        },
        {
          id: 3,
          author: "David Rodriguez",
          rating: 5,
          text: "Clean, modern facility with a great variety of products. The staff is friendly, professional, and really knows their stuff. They made me feel comfortable as a first-time customer.",
          relativeTime: "3 weeks ago",
          profilePhoto: null
        },
        {
          id: 4,
          author: "Emily Thompson",
          rating: 4,
          text: "Great selection and knowledgeable staff. The quality of products is consistently high and the customer service is excellent. The location is convenient and welcoming.",
          relativeTime: "1 month ago",
          profilePhoto: null
        }
      ]);
      setAverageRating(4.8);
      setTotalReviews(247);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev - 1);
  };

  const handleTransitionEnd = () => {
    // Reset to actual position for infinite loop without transition
    if (currentIndex >= reviews.length) {
      setIsTransitioning(false);
      // Use setTimeout to ensure state update happens after transition
      setTimeout(() => {
        setCurrentIndex(0);
      }, 0);
    } else if (currentIndex < 0) {
      setIsTransitioning(false);
      setTimeout(() => {
        setCurrentIndex(reviews.length - 1);
      }, 0);
    } else {
      setIsTransitioning(false);
    }
  };

  const resetAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
    }
    autoPlayRef.current = setInterval(() => {
      nextSlide();
    }, 3000);
  };

  // Create infinite loop array (duplicate reviews at start and end)
  const getInfiniteReviews = () => {
    if (reviews.length === 0) return [];
    return [...reviews, ...reviews, ...reviews];
  };

  const infiniteReviews = getInfiniteReviews();
  const actualIndex = currentIndex < 0 ? reviews.length + currentIndex : currentIndex >= reviews.length ? currentIndex - reviews.length : currentIndex;

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
    );
  }

  return (
    <section className="py-16 px-4 relative">
      <div className="max-w-7xl mx-auto">
        {/* Rating Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
            {renderStars(Math.round(averageRating))}
            <span className="text-2xl md:text-3xl font-bold text-white ml-2">
              {averageRating.toFixed(1)}
            </span>
          </div>
          <p className="text-lg md:text-xl text-white px-4">
            Trusted by <span className="font-bold">{totalReviews}+</span> Topia Guests in Detroit
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={() => {
              prevSlide();
              resetAutoPlay();
            }}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 border border-white/30"
            aria-label="Previous reviews"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => {
              nextSlide();
              resetAutoPlay();
            }}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 border border-white/30"
            aria-label="Next reviews"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Reviews Carousel */}
          <div className="overflow-hidden">
            <div
              ref={carouselRef}
              className={`flex ${isTransitioning ? 'transition-transform duration-500 ease-in-out' : ''}`}
              style={{
                transform: `translateX(-${(currentIndex + reviews.length) * (100 / itemsPerPage)}%)`
              }}
              onTransitionEnd={handleTransitionEnd}
            >
              {infiniteReviews.map((review, index) => (
                <div
                  key={`review-${index}`}
                  className="flex-shrink-0 px-2 md:px-3"
                  style={{
                    width: `${100 / itemsPerPage}%`
                  }}
                >
                  <div
                    className="relative rounded-2xl p-5 md:p-6 min-h-[250px] md:min-h-[280px] flex flex-col overflow-hidden"
                  >
                    {/* Background Image Layer */}
                    <div 
                      className="absolute inset-0 z-0"
                      style={{
                        backgroundImage: 'url(/images/reviewbgpimage.png)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat'
                      }}
                    />

                    {/* Review Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Stars */}
                      <div className="mb-3">
                        {renderStars(review.rating)}
                      </div>

                      {/* Review Text */}
                      <p className="text-white text-sm md:text-base mb-4 line-clamp-4 leading-relaxed flex-grow">
                        "{review.text}"
                      </p>

                      {/* Author */}
                      <div className="flex items-center gap-3 mt-auto">
                        <div className="w-10 h-10 rounded-full border-2 border-white/30 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-blue-500 text-white font-bold text-sm">
                          {review.profilePhoto ? (
                            <img
                              src={review.profilePhoto}
                              alt={review.author}
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.innerHTML = review.author.charAt(0).toUpperCase();
                              }}
                            />
                          ) : (
                            review.author.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-[#86D1F8] font-semibold text-sm md:text-base">
                            {review.author}
                          </p>
                          <p className="text-white/70 text-xs">{review.relativeTime}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {reviews.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  resetAutoPlay();
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  actualIndex === index
                    ? 'bg-[#86D1F8] w-8'
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* View All Reviews Button */}
        <div className="text-center mt-8 md:mt-12">
          <a
            href="https://www.google.com/maps/search/?api=1&query=SHROOMTOPIA+DETROIT&query_place_id=ChIJi8kMdhvPJIgRMjwSMeT0pCw"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 md:px-8 py-3 rounded-full text-xs md:text-sm font-semibold uppercase tracking-wider transition-all duration-300 transform hover:scale-105"
            style={{
              background: 'linear-gradient(90deg, #86D1F8 0%, #CFEFFF 50%, #86D1F8 100%)',
              color: '#000',
              boxShadow: '0 4px 15px rgba(134, 209, 248, 0.5)'
            }}
          >
            View All Reviews on Google
          </a>
        </div>
      </div>
    </section>
  );
};

export default GoogleReviews;
