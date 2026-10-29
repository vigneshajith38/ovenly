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
          const isBrownie = (
            (p.category && p.category.toLowerCase().includes('brownie')) ||
            (p.name && p.name.toLowerCase().includes('brownie'))
          );
          const isPackOf4 = p.name && (p.name.toLowerCase().includes('pack of 4') || p.name.toLowerCase().includes('box of 4'));
          
          return {
            ...p,
            image: p.image_path || p.image,
            available: p.is_available,
            isBrownie,
            isCustomAssorted: p.is_custom_assorted || isPackOf4,
            assortedCapacity: p.assorted_capacity || (isPackOf4 ? 4 : (isBrownie ? 3 : 3)),
            assortedFlavours: p.assorted_flavours,
            pieceCount: p.piece_count || (isPackOf4 ? '4 Pieces (Pack of 4)' : (p.name?.includes('500g') ? '9 Pieces (500g Slab)' : (p.pieces ? `${p.pieces} Pieces` : undefined))),
            pieces: p.pieces || (isPackOf4 ? 4 : (p.name?.includes('500g') ? 9 : undefined)),
            hasFlourChoice: isBrownie || p.has_flour_choice,
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
        const isBrownie = (
          (p.category && p.category.toLowerCase().includes('brownie')) ||
          (p.name && p.name.toLowerCase().includes('brownie'))
        );
        if (activeCategory === 'cookie-tins') {
          return ((p.category === 'cookie-tins' || p.category === 'cookies' || p.isCustomAssorted || p.is_custom_assorted) && !isBrownie);
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
    .filter(p => (p.category?.toLowerCase().includes('brownie') || p.name?.toLowerCase().includes('brownie')) && Array.isArray(p.assorted_flavours) && !p.assorted_flavours.includes('Signature Chocolate Chip'))
    .map(p => p.assorted_flavours)
    .flat();

  const brownieOptions = customBrownieFlavours.length > 0
    ? [...new Set(customBrownieFlavours)]
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
