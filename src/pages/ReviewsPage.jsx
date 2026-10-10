import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Star, Upload, CheckCircle } from 'lucide-react';
import './ReviewsPage.css';

// SVG Doodles Components
const DoodleHeart = ({ className }) => (
  <svg className={`doodle ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 88C50 88 15 62 15 35C15 20 28 10 40 15C46 17 50 24 50 24C50 24 54 17 60 15C72 10 85 20 85 35C85 62 50 88 50 88Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoodleStar = ({ className }) => (
  <svg className={`doodle ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10L62 38L90 40L68 60L75 88L50 72L25 88L32 60L10 40L38 38L50 10Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoodleSparkle = ({ className }) => (
  <svg className={`doodle ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 10C50 35 65 50 90 50C65 50 50 65 50 90C50 65 35 50 10 50C35 50 50 35 50 10Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DoodleFlower = ({ className }) => (
  <svg className={`doodle ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="4"/>
    <path d="M50 25C40 10 60 10 50 25ZM75 50C90 40 90 60 75 50ZM50 75C60 90 40 90 50 75ZM25 50C10 60 10 40 25 50Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ReviewsPage = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [photo, setPhoto] = useState(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
    
    // Check if we need to scroll to the review form
    if (window.location.hash === '#write-review') {
      setTimeout(() => {
        const element = document.getElementById('write-review');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Wait for render
    }
  }, []);

  const fetchReviews = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setReviews(data || []);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }
    
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPEG, PNG, and WebP formats are supported');
      return;
    }
    
    setPhoto(file);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!consent) {
      setError('You must agree to the consent statement.');
      return;
    }
    if (reviewText.length < 10) {
      setError('Review must be at least 10 characters long.');
      return;
    }
    if (!supabase) {
      setError('Backend is not configured properly.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      let photoPath = null;

      if (photo) {
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        const filePath = `public/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('review-photos')
          .upload(filePath, photo);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('review-photos')
          .getPublicUrl(filePath);
          
        photoPath = publicUrl;
      }

      const { error: insertError } = await supabase
        .from('reviews')
        .insert([
          {
            customer_name: name,
            rating,
            review_text: reviewText,
            photo_path: photoPath,
            status: 'pending'
          }
        ]);

      if (insertError) throw insertError;

      setSubmitSuccess(true);
      setName('');
      setRating(5);
      setReviewText('');
      setPhoto(null);
      setConsent(false);
    } catch (err) {
      console.error('Submit error:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  // Distribution for summary strip
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (ratingCounts[r.rating] !== undefined) {
      ratingCounts[r.rating]++;
    }
  });

  // Masonry grid columns (simple approach for React without external libraries)
  const columns = { col1: [], col2: [], col3: [], col4: [] };
  reviews.forEach((review, index) => {
    const colIndex = (index % 4) + 1;
    columns[`col${colIndex}`].push(review);
  });

  // Scrapbook card classes
  const cardThemes = ['theme-blush', 'theme-peach', 'theme-yellow', 'theme-sage', 'theme-vanilla'];

  return (
    <div className="reviews-page animate-fade-in">
      
      {/* Decorative Hero */}
      <section className="reviews-hero">
        <div className="hero-decorations">
          <DoodleSparkle className="decor sparkle-1" />
          <DoodleHeart className="decor heart-1" />
          <DoodleFlower className="decor flower-1" />
          <DoodleStar className="decor star-1" />
          <svg className="decor arrow-1" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 90C30 90 70 60 85 20M85 20L65 20M85 20L85 40" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <div className="hero-content-wrapper">
          <div className="polaroid polaroid-left">
            <div className="tape"></div>
            <img src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=800" alt="Chocolate chip cookies" />
            <p className="handwritten">Good food, happy people</p>
          </div>

          <div className="hero-center">
            <h1>A Little Love from Our Customers ♡</h1>
            <p className="hero-subtitle">Sweet treats, happy hearts, and the loveliest little notes from our Ovenly family.</p>
            <a href="#write-review" className="btn btn-primary leave-love-btn">
              ♡ Leave Some Love
            </a>
          </div>

          <div className="polaroid polaroid-right">
            <div className="tape"></div>
            <img src="https://images.unsplash.com/photo-1605666807758-39e144426dd3?auto=format&fit=crop&q=80&w=800" alt="Brownies" />
            <p className="handwritten">made with love, shared with love</p>
          </div>
        </div>
      </section>

      {/* Summary Strip */}
      <section className="reviews-summary-strip">
        <div className="container">
          <div className="summary-panel">
            <div className="summary-left">
              <span className="rating-large">{averageRating}</span>
              <div className="stars">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star key={star} size={20} fill={star <= averageRating ? "var(--color-caramel)" : "none"} stroke="var(--color-caramel)" />
                ))}
              </div>
              <span className="review-count">{reviews.length} reviews</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-center">
              {[5, 4, 3, 2, 1].map(star => (
                <div key={star} className="rating-bar-row">
                  <span className="star-label">{star} <Star size={12} fill="var(--color-caramel)" stroke="var(--color-caramel)" /></span>
                  <div className="bar-track">
                    <div 
                      className="bar-fill" 
                      style={{ width: `${reviews.length > 0 ? (ratingCounts[star] / reviews.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="count-label">{ratingCounts[star]}</span>
                </div>
              ))}
            </div>

            <div className="summary-divider"></div>

            <div className="summary-right">
              <DoodleFlower className="summary-doodle" />
              <p className="handwritten summary-phrase">Real people, real moments</p>
            </div>
          </div>
        </div>
      </section>

      {/* Masonry Gallery */}
      <section className="reviews-gallery">
        <div className="container">
          {loading ? (
            <div className="loading-state">Gathering the love...</div>
          ) : reviews.length === 0 ? (
            <div className="empty-state">
              <p>No reviews yet. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="masonry-grid">
              {[columns.col1, columns.col2, columns.col3, columns.col4].map((column, colIdx) => (
                <div key={colIdx} className="masonry-column">
                  {column.map((review, idx) => {
                    const themeClass = cardThemes[(colIdx * column.length + idx) % cardThemes.length];
                    const rotationClass = `rotate-${(idx % 3) + 1}`;
                    
                    return (
                      <div key={review.id} className={`scrapbook-card ${themeClass} ${rotationClass}`}>
                        {idx % 3 === 0 && <div className="sticker-heart">♡</div>}
                        
                        {review.photo_path && (
                          <div className="card-photo">
                            <img src={review.photo_path} alt="Review" />
                          </div>
                        )}
                        
                        {!review.photo_path && idx % 4 === 0 && (
                          <div className="card-decorative-phrase">
                            <p className="handwritten">So sweet!</p>
                          </div>
                        )}
                        
                        <div className="card-content">
                          <div className="review-stars">
                            {[1, 2, 3, 4, 5].map(star => (
                              <Star key={star} size={14} fill={star <= review.rating ? "var(--color-caramel)" : "none"} stroke="var(--color-caramel)" />
                            ))}
                          </div>
                          
                          <p className="review-text">{review.review_text}</p>
                          
                          <div className="card-footer">
                            <span className="customer-name">{review.customer_name}</span>
                            <span className="review-date">{new Date(review.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Review Form - Journal Style */}
      <section id="write-review" className="review-submission">
        <div className="container">
          <div className="journal-page">
            <div className="journal-binding"></div>
            <div className="journal-decorations">
              <DoodleHeart className="journal-doodle heart" />
              <DoodleFlower className="journal-doodle flower" />
              <span className="handwritten journal-note">Share your sweet moments</span>
            </div>
            
            <div className="journal-content">
              <h2>Have a Little Love to Share? ♡</h2>
              <p className="journal-subtitle">Tell us what made your Ovenly moment special!</p>
              
              {submitSuccess ? (
                <div className="success-message">
                  <CheckCircle size={48} className="success-icon" />
                  <h3>Thank you!</h3>
                  <p className="handwritten">Your review is tucked away safely and will appear soon.</p>
                  <button className="btn btn-outline" onClick={() => setSubmitSuccess(false)}>Write another note</button>
                </div>
              ) : (
                <form className="review-form" onSubmit={handleSubmit}>
                  {error && <div className="error-message">{error}</div>}
                  
                  <div className="form-group">
                    <label>Your Name</label>
                    <input 
                      type="text" 
                      maxLength={80} 
                      required 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      placeholder="Jane Doe"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="rating-selector">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button 
                          type="button" 
                          key={star} 
                          className="star-btn"
                          onClick={() => setRating(star)}
                        >
                          <Star size={32} fill={star <= rating ? "var(--color-caramel)" : "none"} stroke="var(--color-caramel)" />
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Your Review</label>
                    <textarea 
                      required 
                      minLength={10} 
                      maxLength={1000} 
                      rows={5}
                      value={reviewText} 
                      onChange={e => setReviewText(e.target.value)} 
                      placeholder="I absolutely loved the..."
                    />
                    <span className="char-count">{reviewText.length}/1000</span>
                  </div>
                  
                  <div className="form-group">
                    <label>Add a Photo (Optional)</label>
                    <div className="file-upload">
                      <input 
                        type="file" 
                        id="photo-upload" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={handlePhotoChange}
                      />
                      <label htmlFor="photo-upload" className="file-label">
                        <Upload size={20} />
                        {photo ? photo.name : "Attach a memory (Max 5MB)"}
                      </label>
                    </div>
                  </div>
                  
                  <div className="form-group checkbox-group">
                    <input 
                      type="checkbox" 
                      id="consent" 
                      required 
                      checked={consent} 
                      onChange={e => setConsent(e.target.checked)} 
                    />
                    <label htmlFor="consent">
                      I confirm this review reflects my genuine experience and that I have permission to share any photo I upload.
                    </label>
                  </div>
                  
                  <button type="submit" className="btn btn-primary submit-btn" disabled={submitting}>
                    {submitting ? 'Sending love...' : 'Submit Review ♡'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReviewsPage;
