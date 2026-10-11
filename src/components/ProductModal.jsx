import React, { useState } from 'react';
import { X, ShoppingBag, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductModal.css';

const DEFAULT_ASSORTED_FLAVOURS = [
  'Signature Choc Chip',
  'Double Chocolate Fudge',
  'Red Velvet White Choc',
  'Nutty Walnut Crunch',
  'Biscoff Lotus Swirl',
  'Salted Caramel Crisp'
];

const ProductModal = ({ product, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const dietary = product.dietary_type || product.dietaryType || 'eggless';
  const isAssorted = product.is_custom_assorted || product.isCustomAssorted;
  const capacity = product.assorted_capacity || product.assortedCapacity || 6;
  
  // Parse flavours for assorted tin
  const availableFlavours = (
    product.assorted_flavours || 
    product.assortedFlavours || 
    DEFAULT_ASSORTED_FLAVOURS
  );

  // Dietary choice state (Eggless vs With Egg)
  const [dietaryChoice, setDietaryChoice] = useState(
    dietary === 'contains_egg' ? 'With Egg' : 'Eggless'
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

  // Quick preset: Baker's mix (1 of each)
  const applyBakersMix = () => {
    const next = {};
    availableFlavours.forEach((f, idx) => {
      next[f] = idx < capacity ? 1 : 0;
    });
    setFlavourCounts(next);
  };

  const handleOrder = () => {
    let finalOptions = '';

    // Dietary prefix
    const dietaryTag = dietaryChoice === 'Eggless' ? '🟢 100% Eggless' : '🔴 With Egg';

    if (isAssorted) {
      if (totalFlavoursSelected !== capacity) return;
      
      const chosenList = Object.entries(flavourCounts)
        .filter(([_, count]) => count > 0)
        .map(([name, count]) => `${count}x ${name}`);
      
      finalOptions = `${dietaryTag} • Assorted: ${chosenList.join(', ')}`;
    } else {
      if (dietary === 'choice') {
        finalOptions = selectedCustomisation 
          ? `${dietaryTag} (${selectedCustomisation})`
          : dietaryTag;
      } else {
        const fixedTag = dietary === 'eggless' ? '🟢 100% Eggless' : '🔴 With Egg';
        finalOptions = selectedCustomisation ? `${fixedTag} • ${selectedCustomisation}` : fixedTag;
      }
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
            <div className="modal-header-section">
              <h2>{product.name}</h2>
              <p className="modal-price">₹{product.price}</p>
            </div>

            <p className="modal-desc">{product.longDescription || product.description}</p>
            
            {/* Dietary Selection (Egg vs Eggless) */}
            <div className="modal-dietary-box">
              <label className="modal-section-label">Dietary Preference:</label>
              {dietary === 'choice' ? (
                <div className="dietary-toggle-group">
                  <button
                    type="button"
                    className={`dietary-btn ${dietaryChoice === 'Eggless' ? 'active-eggless' : ''}`}
                    onClick={() => setDietaryChoice('Eggless')}
                  >
                    <span className="veg-badge-dot">🟢</span>
                    <span>100% Eggless</span>
                  </button>
                  <button
                    type="button"
                    className={`dietary-btn ${dietaryChoice === 'With Egg' ? 'active-egg' : ''}`}
                    onClick={() => setDietaryChoice('With Egg')}
                  >
                    <span className="nonveg-badge-dot">🔴</span>
                    <span>Contains Egg</span>
                  </button>
                </div>
              ) : (
                <div className="dietary-static-pill">
                  {dietary === 'eggless' ? (
                    <span className="eggless-pill">🟢 100% Eggless Recipe</span>
                  ) : (
                    <span className="egg-pill">🔴 Baked with Egg</span>
                  )}
                </div>
              )}
            </div>

            {/* Custom Assorted Tin Builder */}
            {isAssorted ? (
              <div className="assorted-tin-builder">
                <div className="assorted-builder-header">
                  <div>
                    <label className="modal-section-label" style={{ marginBottom: '2px' }}>
                      <Sparkles size={16} /> Choose Any {capacity} Flavours
                    </label>
                    <span className="assorted-progress-text">
                      {totalFlavoursSelected} of {capacity} cookies selected
                    </span>
                  </div>
                  <button type="button" onClick={applyBakersMix} className="btn-preset">
                    Baker's Mix (1 of each)
                  </button>
                </div>

                {/* Visual Slots tracker */}
                <div className="assorted-slots-bar">
                  {Array.from({ length: capacity }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`assorted-slot ${i < totalFlavoursSelected ? 'filled' : 'empty'}`}
                    >
                      {i < totalFlavoursSelected ? '🍪' : ''}
                    </div>
                  ))}
                </div>

                {/* Flavour Rows */}
                <div className="assorted-flavours-list">
                  {availableFlavours.map(flavour => {
                    const count = flavourCounts[flavour] || 0;
                    return (
                      <div key={flavour} className={`flavour-row ${count > 0 ? 'selected-row' : ''}`}>
                        <span className="flavour-name">{flavour}</span>
                        <div className="flavour-counter">
                          <button 
                            type="button"
                            onClick={() => handleFlavourChange(flavour, -1)}
                            disabled={count === 0}
                            className="counter-btn"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="counter-val">{count}</span>
                          <button 
                            type="button"
                            onClick={() => handleFlavourChange(flavour, 1)}
                            disabled={totalFlavoursSelected >= capacity}
                            className="counter-btn"
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
            
            {/* Quantity Selector */}
            <div className="modal-quantity">
              <label className="modal-section-label">Quantity:</label>
              <div className="quantity-selector">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
            
            {/* Add to Cart Button */}
            <button 
              className="btn btn-primary modal-order-btn" 
              onClick={handleOrder}
              disabled={isAssorted && totalFlavoursSelected !== capacity}
            >
              <ShoppingBag size={20} />
              {isAssorted && totalFlavoursSelected < capacity
                ? `Pick ${capacity - totalFlavoursSelected} more cookie${capacity - totalFlavoursSelected > 1 ? 's' : ''}`
                : `Add to Cart • ₹${product.price * quantity}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
