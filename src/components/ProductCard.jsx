import React, { useState } from 'react';
import ProductModal from './ProductModal';
import './ProductCard.css';

const ProductCard = ({ product, cookieTinOptions = [] }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const isAssorted = product.is_custom_assorted || product.isCustomAssorted;

  return (
    <>
      <div className={`product-card ${isAssorted ? 'assorted-product-card' : ''}`}>
        <div className="product-image-container" onClick={handleOpenModal}>
          <img src={product.image} alt={product.name} className="product-image" />
          {!product.available && <div className="product-overlay">Sold Out</div>}
          
          {isAssorted && (
            <div className="product-badges-container">
              <span className="assorted-badge">
                ✨ Pick Any 3 Flavours
              </span>
            </div>
          )}
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
              {product.available ? (isAssorted ? '✨ Pick 3 Flavours' : 'View Details') : 'Sold Out'}
            </button>
          </div>
        </div>
      </div>
      
      {isModalOpen && (
        <ProductModal 
          product={product} 
          onClose={handleCloseModal} 
          cookieTinOptions={cookieTinOptions}
        />
      )}
    </>
  );
};

export default ProductCard;
