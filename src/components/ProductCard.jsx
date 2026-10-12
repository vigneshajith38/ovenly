import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

const DEFAULT_ASSORTED_FLAVOURS = [
  'Signature Chocolate Chip',
  'Double Chocolate Fudge',
  'Red Velvet White Choc',
  'Biscoff Lotus Swirl',
  'Nutty Walnut Crunch',
  'Salted Caramel Crisp'
];

const ProductCard = ({ product, cookieTinOptions = [] }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const cardRef = useRef(null);
  const { addToCart } = useCart();

  const isAssorted = product.is_custom_assorted || product.isCustomAssorted;
  const capacity = product.assorted_capacity || product.assortedCapacity || 3;

  // Assorted tin flavours
  const availableFlavours = (
    (cookieTinOptions && cookieTinOptions.length > 0 ? cookieTinOptions : null) ||
    product.assorted_flavours ||
    product.assortedFlavours ||
    DEFAULT_ASSORTED_FLAVOURS
  );

  // Assorted selected slots (array of flavours, max capacity)
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Regular customization options
  const [selectedCustomisation, setSelectedCustomisation] = useState(
    product.customisationOptions?.length > 0 ? product.customisationOptions[0] : ''
  );

  // Close when clicking outside
  useEffect(() => {
    if (!isPopoverOpen) return;
    const handleOutsideClick = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setIsPopoverOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isPopoverOpen]);

  const handleOpenPopover = (e) => {
    e.stopPropagation();
    if (!product.available) return;
    setIsPopoverOpen(true);
  };

  const handleClosePopover = (e) => {
    if (e) e.stopPropagation();
    setIsPopoverOpen(false);
  };

  // Toggle flavour in assorted slots
  const handleToggleFlavour = (flavour) => {
    const existingIndex = selectedSlots.indexOf(flavour);
    if (existingIndex > -1) {
      setSelectedSlots(selectedSlots.filter((_, idx) => idx !== existingIndex));
    } else {
      if (selectedSlots.length < capacity) {
        setSelectedSlots([...selectedSlots, flavour]);
      }
    }
  };

  const handleRemoveSlot = (index) => {
    setSelectedSlots(selectedSlots.filter((_, idx) => idx !== index));
  };

  const applyTop3Preset = (e) => {
    e.stopPropagation();
    setSelectedSlots(availableFlavours.slice(0, capacity));
  };

  const handleOrder = (e) => {
    e.stopPropagation();
    if (isAssorted && selectedSlots.length !== capacity) return;

    let finalOptions = '';
    if (isAssorted) {
      finalOptions = `Custom Assorted (${capacity} Flavours): ${selectedSlots.join(', ')}`;
    } else {
      finalOptions = selectedCustomisation || '';
    }

    addToCart(product, quantity, finalOptions);
    setJustAdded(true);
    setTimeout(() => {
      setJustAdded(false);
      setIsPopoverOpen(false);
    }, 800);
  };

  return (
    <div 
      ref={cardRef}
      className={`product-card ${isAssorted ? 'assorted-product-card' : ''} ${isPopoverOpen ? 'popover-active' : ''}`}
    >
      {/* Product Image: EXACT SAME FULL SIZE POLAROID PICTURE */}
      <div 
        className="product-image-container" 
        onClick={!isPopoverOpen ? handleOpenPopover : undefined}
      >
        <img src={product.image} alt={product.name} className="product-image" />
        {!product.available && <div className="product-overlay">Sold Out</div>}
        
        {isAssorted && !isPopoverOpen && (
          <div className="product-badges-container">
            <span className="assorted-badge">
              ✨ Pick Any 3 Flavours
            </span>
          </div>
        )}

        {/* When card is popped open: cute close button on the picture */}
        {isPopoverOpen && (
          <button 
            type="button" 
            className="card-pop-close-btn" 
            onClick={handleClosePopover} 
            aria-label="Close"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Product Info: Same Card Size, with Smooth Cart Expansion */}
      <div className="product-info">
        <h3 
          className="product-title" 
          onClick={!isPopoverOpen ? handleOpenPopover : undefined}
        >
          {product.name}
        </h3>

        {!isPopoverOpen ? (
          /* Normal Default State */
          <>
            <p className="product-desc">{product.description}</p>
            <div className="product-footer">
              <span className="product-price">₹{product.price}</span>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleOpenPopover}
                disabled={!product.available}
              >
                {product.available ? (isAssorted ? '✨ Pick 3 Flavours' : 'View Details') : 'Sold Out'}
              </button>
            </div>
          </>
        ) : (
          /* Popped Open State: Exact same card, exact same pic, cart details right here! */
          <div className="card-pop-details animate-fade-in" onClick={e => e.stopPropagation()}>
            {isAssorted ? (
              <div className="popover-assorted-builder">
                <div className="popover-assorted-header-row">
                  <span className="popover-assorted-label">Choose 3 Flavours:</span>
                  <button type="button" onClick={applyTop3Preset} className="popover-preset-chip">
                    <Sparkles size={11} /> Top 3 Mix
                  </button>
                </div>

                {/* 3 Visual Slots */}
                <div className="mini-slots-bar">
                  {Array.from({ length: capacity }).map((_, i) => {
                    const flv = selectedSlots[i];
                    return (
                      <div 
                        key={i} 
                        className={`mini-slot ${flv ? 'filled' : 'empty'}`}
                        onClick={() => flv && handleRemoveSlot(i)}
                        title={flv ? `Click to remove ${flv}` : 'Pick a flavour below'}
                      >
                        <span className="mini-slot-num">{i + 1}</span>
                        <span className="mini-slot-name">
                          {flv ? flv.replace(/ Cookie Tin| Cookies| Tin/gi, '') : '+ Pick'}
                        </span>
                        {flv && <span className="mini-slot-x">✕</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Clickable Flavour Chips */}
                <div className="mini-flavour-chips-grid">
                  {availableFlavours.map(f => {
                    const isSelected = selectedSlots.includes(f);
                    const cleanName = f.replace(/ Cookie Tin| Cookies| Tin/gi, '');
                    return (
                      <button
                        key={f}
                        type="button"
                        className={`mini-flavour-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => handleToggleFlavour(f)}
                      >
                        <span className="chip-indicator">{isSelected ? '✓' : '+'}</span>
                        <span className="chip-name">{cleanName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="card-pop-regular">
                <p className="product-desc pop-desc">{product.description}</p>
                {product.customisationOptions && product.customisationOptions.length > 0 && (
                  <div className="popover-options-group">
                    <span className="popover-opt-label">Options:</span>
                    <div className="popover-opt-chips">
                      {product.customisationOptions.map(opt => (
                        <button
                          key={opt}
                          type="button"
                          className={`popover-opt-btn ${selectedCustomisation === opt ? 'active' : ''}`}
                          onClick={() => setSelectedCustomisation(opt === selectedCustomisation ? '' : opt)}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Cart Details Footer: Quantity + Add to Cart - Zero Scrolling! */}
            <div className="card-pop-footer">
              <span className="product-price pop-price">₹{product.price}</span>

              <div className="popover-qty-selector">
                <button 
                  type="button" 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus size={13} />
                </button>
                <span className="popover-qty-val">{quantity}</span>
                <button 
                  type="button" 
                  onClick={() => setQuantity(quantity + 1)}
                  aria-label="Increase quantity"
                >
                  <Plus size={13} />
                </button>
              </div>

              <button
                type="button"
                className={`btn btn-primary pop-add-btn ${justAdded ? 'btn-added' : ''}`}
                onClick={handleOrder}
                disabled={isAssorted && selectedSlots.length !== capacity}
              >
                {justAdded ? (
                  <>
                    <Check size={15} /> Added!
                  </>
                ) : isAssorted && selectedSlots.length < capacity ? (
                  `Pick ${capacity - selectedSlots.length} more`
                ) : (
                  <>
                    <ShoppingBag size={14} /> Add • ₹{product.price * quantity}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
