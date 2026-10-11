import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductModal.css';

const DEFAULT_ASSORTED_FLAVOURS = [
  'Signature Chocolate Chip',
  'Double Chocolate Fudge',
  'Red Velvet White Choc',
  'Biscoff Lotus Swirl',
  'Nutty Walnut Crunch',
  'Salted Caramel Crisp'
];

const ProductModal = ({ product, onClose, cookieTinOptions = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const isAssorted = product.is_custom_assorted || product.isCustomAssorted;
  const capacity = product.assorted_capacity || product.assortedCapacity || 3;
  
  // Parse flavours for assorted tin from cookie tin options
  const availableFlavours = (
    (cookieTinOptions && cookieTinOptions.length > 0 ? cookieTinOptions : null) ||
    product.assorted_flavours || 
    product.assortedFlavours || 
    DEFAULT_ASSORTED_FLAVOURS
  );

  // Assorted Tin flavour breakdown state: { [flavour]: count }
  const [flavourCounts, setFlavourCounts] = useState(() => {
    if (!isAssorted) return {};
    const initial = {};
    availableFlavours.forEach(f => { initial[f] = 0; });
    return initial;
  });

  // Regular customization options
  const [selectedCustomisation, setSelectedCustomisation] = useState(
    product.customisationOptions?.length > 0 ? product.customisationOptions[0] : ''
  );

  const { addToCart } = useCart();

  // Calculate total selected flavours for assorted tin
  const totalFlavoursSelected = isAssorted 
    ? Object.values(flavourCounts).reduce((sum, count) => sum + count, 0)
    : 0;

  // Build flat array of selected flavour slots (e.g. ['Signature Chocolate Chip', 'Double Chocolate Fudge'])
  const selectedSlots = [];
  if (isAssorted) {
    Object.entries(flavourCounts).forEach(([name, count]) => {
      for (let i = 0; i < count; i++) {
        selectedSlots.push(name);
      }
    });
  }

  const handleFlavourChange = (flavour, delta) => {
    const current = flavourCounts[flavour] || 0;
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && totalFlavoursSelected >= capacity) return;

    setFlavourCounts(prev => ({
      ...prev,
      [flavour]: next
    }));
  };

  // Quick preset: Baker's Top 3 Mix
  const applyBakersMix = () => {
    const next = {};
    availableFlavours.forEach((f, idx) => {
      next[f] = idx < capacity ? 1 : 0;
    });
    setFlavourCounts(next);
  };

  // Clear all selections
  const clearSelection = () => {
    const next = {};
    availableFlavours.forEach(f => { next[f] = 0; });
    setFlavourCounts(next);
  };

  const handleOrder = () => {
    let finalOptions = '';

    if (isAssorted) {
      if (totalFlavoursSelected !== capacity) return;
      
      const chosenList = Object.entries(flavourCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => count > 1 ? `${count}x ${name}` : name);
      
      finalOptions = `Custom Assorted (${capacity} Flavours): ${chosenList.join(', ')}`;
    } else {
      finalOptions = selectedCustomisation || '';
    }

    addToCart(product, quantity, finalOptions);
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
            <div className="modal-scrollable-body">
              <div className="modal-header-section">
                <h2>{product.name}</h2>
                <p className="modal-price">₹{product.price}</p>
              </div>

              <p className="modal-desc">{product.longDescription || product.description}</p>
              
              {/* Custom Assorted Tin Builder */}
              {isAssorted ? (
                <div className="assorted-tin-builder">
                  <div className="assorted-builder-header">
                    <div>
                      <label className="modal-section-label" style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Sparkles size={16} color="var(--color-caramel)" /> Choose Any {capacity} Cookie Flavours
                      </label>
                      <span className="assorted-progress-text">
                        {totalFlavoursSelected === capacity 
                          ? '✨ All 3 flavours chosen! Ready to order.' 
                          : `${totalFlavoursSelected} of ${capacity} flavours chosen`}
                      </span>
                    </div>
                    <div className="assorted-header-actions">
                      {totalFlavoursSelected > 0 && (
                        <button type="button" onClick={clearSelection} className="btn-clear-slots">
                          Clear
                        </button>
                      )}
                      <button type="button" onClick={applyBakersMix} className="btn-preset">
                        Top 3 Mix
                      </button>
                    </div>
                  </div>

                  {/* 3 Visual Flavour Slots */}
                  <div className="assorted-slots-bar three-slots">
                    {Array.from({ length: capacity }).map((_, i) => {
                      const flavour = selectedSlots[i];
                      return flavour ? (
                        <div 
                          key={i} 
                          className="assorted-slot filled"
                          onClick={() => handleFlavourChange(flavour, -1)}
                          title={`Click to remove ${flavour}`}
                        >
                          <span className="slot-badge">Flavour {i + 1}</span>
                          <span className="slot-name">🍪 {flavour}</span>
                          <span className="slot-remove">✕</span>
                        </div>
                      ) : (
                        <div key={i} className="assorted-slot empty">
                          <span className="slot-badge">Flavour {i + 1}</span>
                          <span className="slot-empty-text">+ Pick Below</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Cookie Tin Flavour Rows */}
                  <div className="assorted-flavours-list">
                    {availableFlavours.map(flavour => {
                      const count = flavourCounts[flavour] || 0;
                      return (
                        <div 
                          key={flavour} 
                          className={`flavour-row ${count > 0 ? 'selected-row' : ''}`}
                          onClick={() => {
                            if (count === 0 && totalFlavoursSelected < capacity) {
                              handleFlavourChange(flavour, 1);
                            }
                          }}
                        >
                          <div className="flavour-info">
                            <span className="flavour-icon">🍪</span>
                            <span className="flavour-name">{flavour}</span>
                          </div>
                          <div className="flavour-counter" onClick={e => e.stopPropagation()}>
                            <button 
                              type="button"
                              onClick={() => handleFlavourChange(flavour, -1)}
                              disabled={count === 0}
                              className="counter-btn"
                              aria-label={`Decrease ${flavour}`}
                            >
                              <Minus size={14} />
                            </button>
                            <span className="counter-val">{count}</span>
                            <button 
                              type="button"
                              onClick={() => handleFlavourChange(flavour, 1)}
                              disabled={totalFlavoursSelected >= capacity}
                              className="counter-btn"
                              aria-label={`Increase ${flavour}`}
                            >
                              <Plus size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                /* Regular customization options if any */
                product.customisationOptions && product.customisationOptions.length > 0 && (
                  <div className="modal-options">
                    <label className="modal-section-label">Options:</label>
                    <div className="options-grid">
                      {product.customisationOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          className={`option-btn ${selectedCustomisation === opt ? 'selected' : ''}`}
                          onClick={() => setSelectedCustomisation(opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
            
            {/* Sticky/Compact Footer Actions Bar */}
            <div className="modal-footer-actions">
              <div className="modal-quantity">
                <label className="modal-section-label desktop-only-label">Qty:</label>
                <div className="quantity-selector">
                  <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Decrease quantity">-</button>
                  <span>{quantity}</span>
                  <button type="button" onClick={() => setQuantity(quantity + 1)} aria-label="Increase quantity">+</button>
                </div>
              </div>
              
              <button 
                className="btn btn-primary modal-order-btn" 
                onClick={handleOrder}
                disabled={isAssorted && totalFlavoursSelected !== capacity}
              >
                <ShoppingBag size={18} />
                {isAssorted && totalFlavoursSelected < capacity
                  ? `Pick ${capacity - totalFlavoursSelected} more`
                  : (isAssorted ? `Add Assorted Tin • ₹${product.price * quantity}` : `Add to Cart • ₹${product.price * quantity}`)}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
