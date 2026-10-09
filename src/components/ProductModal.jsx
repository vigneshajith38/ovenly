import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductModal.css';

const ProductModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedCustomisation, setSelectedCustomisation] = useState(
    product.customisationOptions?.length > 0 ? product.customisationOptions[0] : ''
  );

  const { addToCart } = useCart();
  
  const handleOrder = () => {
    addToCart(product, quantity, selectedCustomisation);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={24} />
        </button>
        
        <div className="modal-grid">
          <div className="modal-image-container">
            <img src={product.image} alt={product.name} />
          </div>
          
          <div className="modal-details">
            <h2>{product.name}</h2>
            <p className="modal-price">₹{product.price}</p>
            <p className="modal-desc">{product.longDescription || product.description}</p>
            
            {product.customisationOptions && product.customisationOptions.length > 0 && (
              <div className="modal-options">
                <label>Options:</label>
                <div className="options-grid">
                  {product.customisationOptions.map(opt => (
                    <button
                      key={opt}
                      className={`option-btn ${selectedCustomisation === opt ? 'selected' : ''}`}
                      onClick={() => setSelectedCustomisation(opt)}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="modal-quantity">
              <label>Quantity:</label>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
            
            <button className="btn btn-primary modal-order-btn" onClick={handleOrder}>
              <ShoppingBag size={20} />
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
