import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import './Gallery.css';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    if (!supabase) return setLoading(false);
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
      
      const files = (data || []).filter(file => file.name !== '.emptyFolderPlaceholder' && file.name !== 'gallery');
      
      const imagesWithUrls = files.map(file => {
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(`gallery/${file.name}`);
        return { ...file, publicUrl };
      });
      
      setImages(imagesWithUrls);
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setErrorMsg(error.message || 'Unknown error');
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
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading gallery...</div>
        ) : errorMsg ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Error loading gallery: {errorMsg}</div>
        ) : (
          <div className="gallery-grid">
            {images.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                <p>No photos have been uploaded yet. Check back soon!</p>
              </div>
            ) : (
              images.map((img, idx) => (
                <div key={img.name} className="gallery-item polaroid animate-slide-in" style={{ animationDelay: `${idx * 0.1}s`, transform: `rotate(${idx % 2 === 0 ? '-3deg' : '3deg'})`, margin: '15px auto', width: '100%', maxWidth: '300px' }}>
                  <div className={`tape tape-${idx % 2 === 0 ? 'sage' : 'blue'}`}></div>
                  <img src={img.publicUrl} alt="Ovenly bake" loading="lazy" style={{ width: '100%', height: '280px', objectFit: 'cover' }} />
                  <p className="handwritten" style={{ textAlign: 'center', marginTop: '15px', fontSize: '1.4rem', color: 'var(--color-forest)' }}>Made with love ♡</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryPage;
