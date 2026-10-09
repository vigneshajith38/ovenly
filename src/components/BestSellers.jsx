import React, { useState, useEffect } from 'react';
import { FaStar } from 'react-icons/fa';
import { ShoppingBag } from 'lucide-react';
import { DoodleHeart, DoodleSparkle, DoodleFlower } from './Doodles';
import { useCart } from '../context/CartContext';
import { supabase } from '../lib/supabase';
import './BestSellers.css';

const BestSellers = () => {
  const { addToCart } = useCart();
  const [bestSellers, setBestSellers] = useState([]);
  
  useEffect(() => {
    const fetchBestSellers = async () => {
      if (!supabase) return;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_published', true)
        .order('display_order', { ascending: true })
        .limit(3);
        
      if (!error && data) {
        setBestSellers(data.map(p => ({
          ...p,
          image: p.image_path,
          available: p.is_available
        })));
      }
    };
    fetchBestSellers();
  }, []);
  
  if (bestSellers.length === 0) return null;

  const colors = ['var(--color-blush-pink)', 'var(--color-butter-yellow)', 'var(--color-sage-green)'];

  return (
    <section className="bestsellers-section">
      <div className="container">
        <div className="bestsellers-header">
          <div className="header-decor-left">
            <DoodleSparkle className="bs-doodle-sparkle" />
          </div>
          <div className="header-text-container">
            <span className="handwritten bs-subtitle">Little bites of happiness</span>
            <h2 className="bs-title">Our ♡ Best Sellers</h2>
            <div className="bs-underline">
              <svg viewBox="0 0 200 10" preserveAspectRatio="none">
                <path d="M5,5 Q100,0 195,5" stroke="var(--color-forest)" strokeWidth="3" fill="none" strokeLinecap="round" />
              </svg>
            </div>
          </div>
          <div className="header-decor-right">
            <DoodleHeart className="bs-doodle-heart" />
            <DoodleFlower className="bs-doodle-flower" />
          </div>
        </div>

        <div className="bestsellers-grid">
          {bestSellers.map((product, idx) => (
            <div 
              key={product.id} 
              className="bs-card" 
              style={{ backgroundColor: colors[idx % colors.length] }}
            >
              <div className="bs-card-image-wrapper">
                <img src={product.image} alt={product.name} className="bs-card-image" />
                <div className="bs-card-badge">
                  <FaStar className="star-icon" /> 4.9
                </div>
              </div>
              <div className="bs-card-content">
                <h3 className="bs-card-title">{product.name}</h3>
                <p className="bs-card-price">₹{product.price}</p>
                <button 
                  onClick={() => addToCart(product, 1, product.customisationOptions?.[0] || '')}
                  className="btn btn-primary bs-whatsapp-btn"
                >
                  <ShoppingBag size={18} style={{ marginRight: '8px' }} />
                  Add to Cart
                </button>
              </div>
              <DoodleHeart className="bs-card-doodle" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
