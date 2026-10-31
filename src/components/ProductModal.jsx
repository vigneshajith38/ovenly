import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingBag, Plus, Minus, Check, Sparkles, Wheat } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductModal.css';

const DEFAULT_COOKIE_FLAVOURS = [
  'Signature Chocolate Chip',
  'Double Chocolate Fudge',
  'Red Velvet White Choc',
  'Biscoff Lotus Swirl',
  'Nutty Walnut Crunch',
  'Salted Caramel Crisp'
];

const DEFAULT_BROWNIE_FLAVOURS = [
  'Nutella',
  'Chocolate Ganache',
  'Biscoff'
];

const ProductModal = ({ product, onClose, cookieTinOptions = [], brownieOptions = [] }) => {
  const [quantity, setQuantity] = useState(1);
  const isBrownie = Boolean(
    (product.category && (product.category.toLowerCase().includes('brownie') || product.category === 'healthy-bakes')) ||
    (product.name && product.name.toLowerCase().includes('brownie'))
  );

  const isPackOf4 = Boolean(
    product.name && (product.name.toLowerCase().includes('pack of 4') || product.name.toLowerCase().includes('box of 4'))
  );

  const isPackOf1 = Boolean(
    product.name && (
      product.name.toLowerCase().includes('pack of 1') ||
      product.name.toLowerCase().includes('box of 1') ||
      product.name.toLowerCase().includes('single') ||
      product.name.toLowerCase().includes('1 piece') ||
      product.name.toLowerCase().includes('piece of 1')
    )
  );

  const isAssorted = product.is_custom_assorted || product.isCustomAssorted || isPackOf4 || isPackOf1 || isBrownie;
  const capacity = product.assorted_capacity || product.assortedCapacity || (isPackOf4 ? 4 : (isPackOf1 ? 1 : (isBrownie ? 1 : 3)));

  // Flour choice for all brownies & healthy bakes (Classic Maida vs Healthy Ragi)
  const hasFlourChoice = isBrownie || product.category === 'healthy-bakes' || product.has_flour_choice || product.hasFlourChoice;
  const flourOptions = product.flourOptions || ['Classic Maida', 'Healthy Ragi'];
  const [selectedFlour, setSelectedFlour] = useState('Classic Maida');

  // Piece count display
  const pieceCount = product.pieceCount || (isPackOf4 ? '4 Pieces (Pack of 4)' : (isPackOf1 ? '1 Piece (Pack of 1)' : (product.name?.includes('500g') ? '9 Pieces (500g Slab)' : (product.pieces ? `${product.pieces} Pieces` : (isBrownie ? '1 Piece' : null)))));
  
  // Available flavours: NEVER show cookies on brownies!
  const isCookieDefault = (arr) => Array.isArray(arr) && arr.includes('Signature Chocolate Chip');

  let availableFlavours = [];
  if (Array.isArray(product.assorted_flavours) && product.assorted_flavours.length > 0 && !(isBrownie && isCookieDefault(product.assorted_flavours))) {
    availableFlavours = product.assorted_flavours;
  } else if (Array.isArray(product.assortedFlavours) && product.assortedFlavours.length > 0 && !(isBrownie && isCookieDefault(product.assortedFlavours))) {
    availableFlavours = product.assortedFlavours;
  } else if (isBrownie) {
    availableFlavours = brownieOptions && brownieOptions.length > 0 ? brownieOptions : DEFAULT_BROWNIE_FLAVOURS;
  } else {
    availableFlavours = cookieTinOptions && cookieTinOptions.length > 0 ? cookieTinOptions : DEFAULT_COOKIE_FLAVOURS;
  }

  // Assorted flavour breakdown state: { [flavour]: count }
  const [flavourCounts, setFlavourCounts] = useState(() => {
    if (!isAssorted) return {};
    const initial = {};
    availableFlavours.forEach(f => { initial[f] = 0; });
    if (capacity === 1 && availableFlavours.length > 0) {
      const match = availableFlavours.find(f => 
        product.name && product.name.toLowerCase().includes(f.toLowerCase())
      );
      initial[match || availableFlavours[0]] = 1;
    }
    return initial;
  });

  // Regular customization options
  const [selectedCustomisation, setSelectedCustomisation] = useState(
    product.customisationOptions?.length > 0 ? product.customisationOptions[0] : ''
  );

  const { addToCart } = useCart();

  // Calculate total selected flavours for assorted box/tin
  const totalFlavoursSelected = isAssorted 
    ? Object.values(flavourCounts).reduce((sum, count) => sum + count, 0)
    : 0;

  // Build flat array of selected flavour slots
  const selectedSlots = [];
  if (isAssorted) {
    Object.entries(flavourCounts).forEach(([name, count]) => {
      for (let i = 0; i < count; i++) {
        selectedSlots.push(name);
      }
    });
  }

  const handleFlavourChange = (flavour, delta) => {
    if (capacity === 1) {
      // For pack of 1, selecting any flavour directly chooses that single flavour!
      const next = {};
      availableFlavours.forEach(f => { next[f] = f === flavour ? 1 : 0; });
      setFlavourCounts(next);
      return;
    }
    const current = flavourCounts[flavour] || 0;
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && totalFlavoursSelected >= capacity) return;

    setFlavourCounts(prev => ({
      ...prev,
      [flavour]: next
    }));
  };

  // Quick preset: Baker's Top Mix
  const applyBakersMix = () => {
    const next = {};
    availableFlavours.forEach(f => { next[f] = 0; });

    if (isBrownie && capacity === 4 && availableFlavours.length >= 3) {
      // 2 Classic Fudge + 1 Walnut + 1 Salted Caramel
      next[availableFlavours[0]] = 2;
      next[availableFlavours[1]] = 1;
      next[availableFlavours[2]] = 1;
    } else {
      availableFlavours.forEach((f, idx) => {
        next[f] = idx < capacity ? 1 : 0;
      });
    }
    setFlavourCounts(next);
  };

  // Clear all selections
  const clearSelection = () => {
    const next = {};
    availableFlavours.forEach(f => { next[f] = 0; });
    setFlavourCounts(next);
  };

  const handleOrder = () => {
    if (isAssorted && totalFlavoursSelected !== capacity) return;

    const parts = [];
    if (hasFlourChoice && selectedFlour) {
      parts.push(`Base: ${selectedFlour}`);
    }

    if (isAssorted) {
      if (capacity === 1) {
        const chosen = Object.entries(flavourCounts).find(([_, count]) => count > 0);
        parts.push(`Flavour: ${chosen ? chosen[0] : availableFlavours[0]}`);
      } else {
        const chosenList = Object.entries(flavourCounts)
          .filter(([_, count]) => count > 0)
          .map(([name, count]) => count > 1 ? `${count}x ${name}` : name);
        parts.push(`Custom Assorted (${capacity} ${isBrownie ? 'Pieces' : 'Flavours'}): ${chosenList.join(', ')}`);
      }
    } else if (selectedCustomisation) {
      parts.push(selectedCustomisation);
    }

    if (pieceCount && !isAssorted) {
      parts.push(pieceCount);
    }

    const finalOptions = parts.join(' • ');

    addToCart(product, quantity, finalOptions);
    onClose();
  };

  // Prevent background scrolling while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
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
              <div className="modal-meta-row">
                <span className="modal-price">₹{product.price}</span>
                {pieceCount && (
                  <span className="modal-piece-pill">
                    {isBrownie ? '🍫' : '📦'} {pieceCount}
                  </span>
                )}
              </div>
            </div>

            <p className="modal-desc">{product.longDescription || product.description}</p>
            
            {/* Flour Base Selection (Maida vs Ragi) for Brownies */}
            {hasFlourChoice && (
              <div className="modal-flour-section">
                <label className="modal-section-label">
                  <Wheat size={16} color="var(--color-caramel)" /> Choose Your Flour Base:
                </label>
                <div className="modal-flour-cards">
                  <button
                    type="button"
                    className={`modal-flour-card ${selectedFlour === 'Classic Maida' ? 'selected' : ''}`}
                    onClick={() => setSelectedFlour('Classic Maida')}
                  >
                    <div className="flour-card-header">
                      <span className="flour-emoji">🌾</span>
                      <strong className="flour-name">Classic Maida</strong>
                      {selectedFlour === 'Classic Maida' && <span className="flour-check">✓</span>}
                    </div>
                    <span className="flour-subtext">Ultra-Fudgy & Melty Traditional Texture</span>
                  </button>

                  <button
                    type="button"
                    className={`modal-flour-card ${selectedFlour === 'Healthy Ragi' ? 'selected' : ''}`}
                    onClick={() => setSelectedFlour('Healthy Ragi')}
                  >
                    <div className="flour-card-header">
                      <span className="flour-emoji">🌱</span>
                      <strong className="flour-name">Healthy Ragi</strong>
                      {selectedFlour === 'Healthy Ragi' && <span className="flour-check">✓</span>}
                    </div>
                    <span className="flour-subtext">Nutritious Finger Millet • Guilt-Free & Wholesome</span>
                  </button>
                </div>
              </div>
            )}

            {/* Custom Assorted Builder (For Brownie Box of 4 or Cookie Tins) */}
            {isAssorted ? (
              <div className="assorted-tin-builder">
                <div className="assorted-builder-header">
                  <div>
                    <label className="modal-section-label" style={{ marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Sparkles size={16} color="var(--color-caramel)" />
                      {capacity === 1 
                        ? 'Choose Your Brownie Flavour:' 
                        : (isBrownie 
                            ? `Choose Any ${capacity} Brownie Pieces (Pick from 3 Flavours)`
                            : `Choose Any ${capacity} Cookie Flavours`)}
                    </label>
                    <span className="assorted-progress-text">
                      {totalFlavoursSelected === capacity 
                        ? (capacity === 1 ? '✨ Flavour selected! Ready to order.' : `✨ All ${capacity} pieces chosen! Ready to order.`) 
                        : `${totalFlavoursSelected} of ${capacity} ${capacity === 1 ? 'flavour' : 'pieces'} chosen`}
                    </span>
                  </div>
                  {capacity > 1 && (
                    <div className="assorted-header-actions">
                      {totalFlavoursSelected > 0 && (
                        <button type="button" onClick={clearSelection} className="btn-clear-slots">
                          Clear
                        </button>
                      )}
                      <button type="button" onClick={applyBakersMix} className="btn-preset">
                        Top {capacity} Mix
                      </button>
                    </div>
                  )}
                </div>

                {/* Visual Flavour Slots */}
                <div 
                  className="assorted-slots-bar"
                  style={{ gridTemplateColumns: `repeat(${capacity}, 1fr)` }}
                >
                  {Array.from({ length: capacity }).map((_, i) => {
                    const flavour = selectedSlots[i];
                    return flavour ? (
                      <div 
                        key={i} 
                        className="assorted-slot filled"
                        onClick={() => handleFlavourChange(flavour, -1)}
                        title={`Click to remove ${flavour}`}
                      >
                        <span className="slot-badge">{isBrownie ? `Piece ${i + 1}` : `Flavour ${i + 1}`}</span>
                        <span className="slot-name">
                          {isBrownie ? '🍫' : '🍪'} {flavour.replace(/ Cookie Tin| Cookies| Tin| Brownie/gi, '').trim()}
                        </span>
                        <span className="slot-remove">✕</span>
                      </div>
                    ) : (
                      <div key={i} className="assorted-slot empty">
                        <span className="slot-badge">{isBrownie ? `Piece ${i + 1}` : `Flavour ${i + 1}`}</span>
                        <span className="slot-empty-text">+ Pick Below</span>
                      </div>
                    );
                  })}
                </div>

                {/* Flavour Rows with +/- Counters */}
                <div className="assorted-flavours-list">
                  {availableFlavours.map(flavour => {
                    const count = flavourCounts[flavour] || 0;
                    return (
                      <div 
                        key={flavour} 
                        className={`flavour-row ${count > 0 ? 'selected-row' : ''}`}
                        onClick={() => {
                          if (totalFlavoursSelected < capacity) {
                            handleFlavourChange(flavour, 1);
                          }
                        }}
                      >
                        <div className="flavour-info">
                          <span className="flavour-icon">{isBrownie ? '🍫' : '🍪'}</span>
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
                ? `Choose ${capacity - totalFlavoursSelected} more ${capacity - totalFlavoursSelected > 1 ? 'pieces' : 'piece'}`
                : (isAssorted 
                    ? (capacity === 1 
                        ? `Add Brownie (1 Piece) • ₹${product.price * quantity}` 
                        : `Add ${capacity}-${isBrownie ? 'Piece Brownie Box' : 'Flavour Assorted Tin'} • ₹${product.price * quantity}`) 
                    : `Add to Cart • ₹${product.price * quantity}`)}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductModal;
