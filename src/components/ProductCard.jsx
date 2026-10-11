import React, { useState } from 'react';
import ProductModal from './ProductModal';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const dietary = product.dietary_type || product.dietaryType || 'eggless';
  const isAssorted = product.is_custom_assorted || product.isCustomAssorted;

  return (
    <>
      <div className="product-card">
        <div className="product-image-container" onClick={handleOpenModal}>
          <img src={product.image} alt={product.name} className="product-image" />
          {!product.available && <div className="product-overlay">Sold Out</div>}
          
          <div className="product-badges-container">
            {dietary === 'eggless' && (
              <span className="dietary-badge eggless-badge" title="100% Eggless">
                <span className="badge-dot dot-green"></span> Eggless
              </span>
            )}
            {dietary === 'contains_egg' && (
              <span className="dietary-badge egg-badge" title="Contains Egg">
                <span className="badge-dot dot-red"></span> With Egg
              </span>
            )}
            {dietary === 'choice' && (
              <span className="dietary-badge choice-badge" title="Choice of Eggless or With Egg">
                <span className="badge-dot dot-choice"></span> Eggless / Egg
              </span>
            )}
            {isAssorted && (
              <span className="assorted-badge">
                ✨ Customize
              </span>
            )}
          </div>
        </div>
        <div className="product-info">
          <h3 className="product-title" onClick={handleOpenModal}>{product.name}</h3>
          <p className="product-desc">{product.description}</p>
          <div className="product-footer">
            <span className="product-price">₹{product.price}</span>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={handleOpenModal}
              disabled={!product.available}
            >
              {product.available ? (isAssorted ? 'Build Tin' : 'View Details') : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ProductModal product={product} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default ProductCard;
