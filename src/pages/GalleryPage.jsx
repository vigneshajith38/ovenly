import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Gallery.css';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchGalleryImages();

    // Safety timeout - if loading takes more than 8 seconds, stop and show empty state
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 8000);

    return () => clearTimeout(timeout);
  }, []);

  const fetchGalleryImages = async () => {
    // If supabase is not configured, show empty state immediately
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.storage
        .from('product-images')
        .list('gallery', {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      
      const files = (data || []).filter(
        file => file.name !== '.emptyFolderPlaceholder' && file.name !== 'gallery'
      );
      
      const imagesWithUrls = files.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(`gallery/${file.name}`);
        return { ...file, publicUrl };
      });
      
      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setErrorMsg(error.message || 'Could not load gallery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gallery-page animate-fade-in">
      <div className="gallery-header container">
        <div className="gallery-badge-wrapper" style={{ marginBottom: '15px' }}>
          <span className="handwritten" style={{ background: 'var(--color-pale-peach)', padding: '5px 15px', borderRadius: '50px', transform: 'rotate(-2deg)', display: 'inline-block' }}>Fresh out the oven</span>
        </div>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '3.5rem', color: 'var(--color-forest)', marginBottom: '15px' }}>Our Bakes</h1>
        <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '1.1rem', color: 'var(--color-dark-chocolate)' }}>A peek into our kitchen and the delicious treats we've been crafting for you.</p>
      </div>
      
      <div className="container" style={{ paddingBottom: '80px', marginTop: '40px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div className="gallery-loader">
              <span className="handwritten" style={{ fontSize: '1.8rem', color: 'var(--color-forest)' }}>Loading our bakes...</span>
            </div>
          </div>
        ) : errorMsg ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span className="handwritten" style={{ fontSize: '2rem', color: 'var(--color-cookie-brown)' }}>🍪</span>
            <p style={{ marginTop: '15px', color: 'var(--color-dark-chocolate)' }}>Oops! We couldn't load the gallery right now.</p>
            <p style={{ fontSize: '0.85rem', color: '#999' }}>{errorMsg}</p>
          </div>
        ) : images.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <span style={{ fontSize: '3rem' }}>🧁</span>
            <p className="handwritten" style={{ fontSize: '1.8rem', color: 'var(--color-forest)', marginTop: '15px' }}>
              Coming soon!
            </p>
            <p style={{ color: 'var(--color-dark-chocolate)', maxWidth: '400px', margin: '10px auto' }}>
              We're busy baking! Check back soon to see photos of our freshest creations.
            </p>
          </div>
        ) : (
          <div className="gallery-grid">
            {images.map((img, idx) => (
              <div key={img.name} className="gallery-item polaroid animate-slide-in" style={{ animationDelay: `${idx * 0.1}s`, transform: `rotate(${idx % 2 === 0 ? '-3deg' : '3deg'})`, margin: '15px auto', width: '100%', maxWidth: '300px' }}>
                <div className={`tape tape-${idx % 2 === 0 ? 'sage' : 'blue'}`}></div>
                <img src={img.publicUrl} alt="Ovenly bake" loading="lazy" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                <p className="handwritten" style={{ textAlign: 'center', marginTop: '15px', fontSize: '1.4rem', color: 'var(--color-forest)' }}>Made with love ♡</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
