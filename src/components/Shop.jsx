import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from './ProductCard';
import { supabase } from '../lib/supabase';
import { products as fallbackProducts } from '../data/products';
import './Shop.css';

const Shop = ({ featuredOnly = false }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialCategory = searchParams.get('category') || 'all';
  
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [dbProducts, setDbProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Update active category if URL changes
  useEffect(() => {
    const cat = new URLSearchParams(location.search).get('category');
    if (cat) {
      setActiveCategory(cat);
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!supabase) {
        setDbProducts(fallbackProducts);
        setLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_published', true)
          .order('display_order', { ascending: true })
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Map database fields to what ProductCard expects
        const formattedData = (data || []).map(p => ({
          ...p,
          image: p.image_path || p.image,
          available: p.is_available,
          isCustomAssorted: p.is_custom_assorted,
          assortedCapacity: p.assorted_capacity || 6,
          assortedFlavours: p.assorted_flavours
        }));
        
        setDbProducts(formattedData);
      } catch (err) {
        console.error('Error fetching products:', err);
        setDbProducts(fallbackProducts); // fallback on error
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  const displayProducts = featuredOnly 
    ? dbProducts.slice(0, 3) 
    : dbProducts.filter(p => {
        if (activeCategory === 'assorted') {
          return p.is_custom_assorted || p.isCustomAssorted;
        }
        return activeCategory === 'all' || p.category === activeCategory;
      });

  return (
    <div className={`shop-container ${featuredOnly ? '' : 'full-page-shop container animate-fade-in'}`}>
      {!featuredOnly && (
        <>
          <div className="shop-header">
            <h1 className="shop-title">Our Sweet Treats</h1>
            <p className="shop-subtitle handwritten-large">Freshly baked, beautifully packaged, perfectly delicious.</p>
          </div>
          
          <div className="category-filters">
            <button 
              className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
              onClick={() => setActiveCategory('all')}
            >
              All Treats
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'assorted' ? 'active' : ''}`}
              onClick={() => setActiveCategory('assorted')}
            >
              ✨ Customize Your Own
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'cookie-tins' ? 'active' : ''}`}
              onClick={() => setActiveCategory('cookie-tins')}
            >
              Cookie Tins
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'cupcakes' ? 'active' : ''}`}
              onClick={() => setActiveCategory('cupcakes')}
            >
              Cupcakes
            </button>
          </div>
        </>
      )}
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2rem', color: '#666' }}>
          Loading our treats...
        </div>
      ) : (
        <div className="products-grid">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      
      {!loading && displayProducts.length === 0 && (
        <div className="no-products">
          <p>No products available in this category right now. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default Shop;
