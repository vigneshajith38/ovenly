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
        const formattedData = (data || []).map(p => {
          const isHealthy = Boolean(
            p.category === 'healthy-bakes' ||
            p.category === 'healthy' ||
            (p.name && (p.name.toLowerCase().includes('healthy') || p.name.toLowerCase().includes('ragi'))) ||
            (p.description && (p.description.toLowerCase().includes('healthy') || p.description.toLowerCase().includes('ragi')))
          );

          const isBrownie = Boolean(
            (p.category && (p.category.toLowerCase().includes('brownie') || p.category === 'healthy-bakes')) ||
            (p.name && p.name.toLowerCase().includes('brownie'))
          );

          const isPackOf4 = Boolean(
            p.name && (p.name.toLowerCase().includes('pack of 4') || p.name.toLowerCase().includes('box of 4'))
          );

          const isPackOf1 = Boolean(
            p.name && (
              p.name.toLowerCase().includes('pack of 1') ||
              p.name.toLowerCase().includes('box of 1') ||
              p.name.toLowerCase().includes('single') ||
              p.name.toLowerCase().includes('1 piece') ||
              p.name.toLowerCase().includes('piece of 1')
            )
          );

          // All brownies and healthy bakes are customizable even for pack of 1
          const isCustomAssorted = Boolean(
            p.is_custom_assorted || p.isCustomAssorted || isPackOf4 || isPackOf1 || isBrownie
          );

          let capacity = p.assorted_capacity || p.assortedCapacity;
          if (!capacity) {
            if (isPackOf4) capacity = 4;
            else if (isPackOf1) capacity = 1;
            else if (isBrownie) capacity = 1; // Default single brownie piece is 1
            else capacity = 3;
          }
          
          return {
            ...p,
            image: p.image_path || p.image,
            available: p.is_available,
            isBrownie,
            isHealthy,
            isPackOf1,
            isPackOf4,
            isCustomAssorted,
            assortedCapacity: capacity,
            assortedFlavours: p.assorted_flavours,
            pieceCount: p.piece_count || (isPackOf4 ? '4 Pieces (Pack of 4)' : (isPackOf1 ? '1 Piece (Pack of 1)' : (p.name?.includes('500g') ? '9 Pieces (500g Slab)' : (p.pieces ? `${p.pieces} Pieces` : (isBrownie ? '1 Piece' : undefined))))),
            pieces: p.pieces || (isPackOf4 ? 4 : (isPackOf1 ? 1 : (p.name?.includes('500g') ? 9 : undefined))),
            hasFlourChoice: isBrownie || isHealthy || p.has_flour_choice,
            flourOptions: ['Classic Maida', 'Healthy Ragi']
          };
        });
        
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
        const isBrownie = Boolean(
          (p.category && (p.category.toLowerCase().includes('brownie') || p.category === 'healthy-bakes')) ||
          (p.name && p.name.toLowerCase().includes('brownie'))
        );
        const isHealthy = Boolean(
          p.category === 'healthy-bakes' ||
          p.category === 'healthy' ||
          p.isHealthy ||
          (p.name && (p.name.toLowerCase().includes('healthy') || p.name.toLowerCase().includes('ragi'))) ||
          (p.description && (p.description.toLowerCase().includes('healthy') || p.description.toLowerCase().includes('ragi')))
        );

        if (activeCategory === 'healthy-bakes') {
          return isHealthy || p.category === 'healthy-bakes' || (isBrownie && p.hasFlourChoice);
        }
        if (activeCategory === 'cookie-tins') {
          return ((p.category === 'cookie-tins' || p.category === 'cookies' || p.isCustomAssorted || p.is_custom_assorted) && !isBrownie && p.category !== 'healthy-bakes');
        }
        if (activeCategory === 'cupcakes') {
          return p.category === 'cupcakes' || p.category === 'cupcake';
        }
        if (activeCategory === 'brownies') {
          return isBrownie;
        }
        return activeCategory === 'all' || p.category === activeCategory;
      });

  // Extract all available cookie tin flavour names from cookie tins
  const cookieTinOptions = dbProducts
    .filter(p => (p.category === 'cookie-tins') && !p.is_custom_assorted && !p.isCustomAssorted && !p.name?.toLowerCase().includes('brownie'))
    .map(p => {
      const clean = p.name.replace(/ Cookie Tin| Cookies| Tin/gi, '').trim();
      return clean.charAt(0).toUpperCase() + clean.slice(1);
    });

  // Extract brownie flavours from any brownie in database that has custom flavours, or fallback to default
  const customBrownieFlavours = dbProducts
    .filter(p => (p.category?.toLowerCase().includes('brownie') || p.name?.toLowerCase().includes('brownie') || p.category === 'healthy-bakes') && Array.isArray(p.assorted_flavours) && !p.assorted_flavours.includes('Signature Chocolate Chip'))
    .map(p => p.assorted_flavours)
    .flat();

  const brownieOptions = customBrownieFlavours.length > 0
    ? [...new Set(customBrownieFlavours.map(f => {
        const s = String(f).trim();
        return s.charAt(0).toUpperCase() + s.slice(1);
      }))]
    : ['Nutella', 'Chocolate Ganache', 'Biscoff'];

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
            <button 
              className={`filter-btn ${activeCategory === 'brownies' ? 'active' : ''}`}
              onClick={() => setActiveCategory('brownies')}
            >
              Brownies
            </button>
            <button 
              className={`filter-btn ${activeCategory === 'healthy-bakes' ? 'active' : ''}`}
              onClick={() => setActiveCategory('healthy-bakes')}
            >
              Healthy Bakes 🌱
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
            <ProductCard 
              key={product.id} 
              product={product} 
              cookieTinOptions={cookieTinOptions} 
              brownieOptions={brownieOptions}
            />
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
