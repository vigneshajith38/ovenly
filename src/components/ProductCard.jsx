import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, X, Plus, Minus, Check, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

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

const ProductCard = ({ product, cookieTinOptions = [], brownieOptions = [] }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const cardRef = useRef(null);
  const { addToCart } = useCart();

  const hasVariants = Array.isArray(product.quantityVariants) && product.quantityVariants.length > 0;
  const [selectedVariant, setSelectedVariant] = useState(() => hasVariants ? product.quantityVariants[0] : null);

  useEffect(() => {
    if (hasVariants) {
      setSelectedVariant(product.quantityVariants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product.quantityVariants]);

  const activePrice = selectedVariant ? Number(selectedVariant.price) : Number(product.price);

  const isBrownie = Boolean(
    (product.category && product.category.toLowerCase().includes('brownie')) ||
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

  // ONLY treat as assorted if admin explicitly enabled it (true) or if null and explicitly named assorted
  const isAssorted = product.is_custom_assorted !== undefined && product.is_custom_assorted !== null
    ? Boolean(product.is_custom_assorted)
    : (product.isCustomAssorted !== undefined ? Boolean(product.isCustomAssorted) : Boolean(product.name && product.name.toLowerCase().includes('assorted')));

  const capacity = product.assorted_capacity || product.assortedCapacity || (isPackOf4 ? 4 : (isPackOf1 ? 1 : 3));

  // Flour choice for brownies OR if explicitly set by admin
  const hasFlourChoice = product.has_flour_choice !== undefined && product.has_flour_choice !== null
    ? Boolean(product.has_flour_choice)
    : (product.hasFlourChoice !== undefined ? Boolean(product.hasFlourChoice) : Boolean(isBrownie));
  const flourOptions = product.flourOptions || ['Classic Maida', 'Healthy Ragi'];
  const [selectedFlour, setSelectedFlour] = useState('Classic Maida');

  // Piece count display
  const pieceCount = product.pieceCount || (isPackOf4 ? '4 Pieces (Pack of 4)' : (isPackOf1 && isAssorted ? '1 Piece (Pack of 1)' : (product.name?.includes('500g') ? '9 Pieces (500g Slab)' : (product.pieces ? `${product.pieces} Pieces` : (isBrownie && isAssorted ? (capacity === 1 ? '1 Piece' : `${capacity} Pieces`) : null)))));

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

  // Assorted selected slots (array of flavours, up to capacity)
  const [selectedSlots, setSelectedSlots] = useState(() => {
    if (capacity === 1 && availableFlavours.length > 0) {
      const match = availableFlavours.find(f => 
        product.name && product.name.toLowerCase().includes(f.toLowerCase())
      );
      return [match || availableFlavours[0]];
    }
    return [];
  });

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
    // Ensure capacity 1 has a selected flavour on open
    if (capacity === 1 && selectedSlots.length === 0 && availableFlavours.length > 0) {
      const match = availableFlavours.find(f => 
        product.name && product.name.toLowerCase().includes(f.toLowerCase())
      );
      setSelectedSlots([match || availableFlavours[0]]);
    }
    setIsPopoverOpen(true);
  };

  const handleClosePopover = (e) => {
    if (e) e.stopPropagation();
    setIsPopoverOpen(false);
  };

  // Add or cycle flavour in assorted slots
  const handleToggleFlavour = (flavour) => {
    if (capacity === 1) {
      // For pack of 1, selecting any flavour directly chooses that single flavour!
      setSelectedSlots([flavour]);
      return;
    }
    if (selectedSlots.length < capacity) {
      // Add flavour to the next empty slot
      setSelectedSlots([...selectedSlots, flavour]);
    } else {
      // If full and this flavour is present, remove one instance of it
      if (selectedSlots.includes(flavour)) {
        const lastIdx = selectedSlots.lastIndexOf(flavour);
        setSelectedSlots(selectedSlots.filter((_, idx) => idx !== lastIdx));
      }
    }
  };

  const handleRemoveSlot = (index) => {
    setSelectedSlots(selectedSlots.filter((_, idx) => idx !== index));
  };

  // Top preset: intelligently distribute flavours to match capacity
  const applyTopPreset = (e) => {
    e.stopPropagation();
    if (isBrownie && capacity === 4 && availableFlavours.length >= 3) {
      setSelectedSlots([
        availableFlavours[0],
        availableFlavours[0],
        availableFlavours[1],
        availableFlavours[2]
      ]);
    } else {
      const preset = [];
      for (let i = 0; i < capacity; i++) {
        preset.push(availableFlavours[i % availableFlavours.length]);
      }
      setSelectedSlots(preset);
    }
  };

  const handleOrder = (e) => {
    e.stopPropagation();
    if (isAssorted && selectedSlots.length !== capacity) return;

    const parts = [];
    if (selectedVariant) {
      parts.push(`Size/Qty: ${selectedVariant.label}`);
    }

    if (hasFlourChoice && selectedFlour) {
      parts.push(`Base: ${selectedFlour}`);
    }

    if (isAssorted) {
      if (capacity === 1) {
        parts.push(`Flavour: ${selectedSlots[0] || availableFlavours[0]}`);
      } else {
        const countMap = {};
        selectedSlots.forEach(s => {
          countMap[s] = (countMap[s] || 0) + 1;
        });
        const breakdown = Object.entries(countMap)
          .map(([name, cnt]) => cnt > 1 ? `${cnt}x ${name}` : name)
          .join(', ');
        parts.push(`Custom Assorted (${capacity} ${isBrownie ? 'Pieces' : 'Flavours'}): ${breakdown}`);
      }
    } else if (selectedCustomisation) {
      parts.push(selectedCustomisation);
    }

    if (pieceCount && !isAssorted && !selectedVariant) {
      parts.push(pieceCount);
    }

    const finalOptions = parts.join(' • ');

    addToCart({ ...product, price: activePrice }, quantity, finalOptions);
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
      {/* Product Image */}
      <div 
        className="product-image-container" 
        onClick={!isPopoverOpen ? handleOpenPopover : undefined}
      >
        <img src={product.image} alt={product.name} className="product-image" />
        {!product.available && <div className="product-overlay">Sold Out</div>}
        
        {/* Badges on product image */}
        {!isPopoverOpen && (
          <div className="product-badges-container">
            {isAssorted ? (
              <span className="assorted-badge">
                {capacity === 1 
                  ? '✨ Customizable Flavour & Base' 
                  : `✨ Pick Any ${capacity} ${isBrownie ? 'Pieces' : 'Flavours'}`}
              </span>
            ) : pieceCount ? (
              <span className="piece-count-badge">
                {isBrownie ? '🍫' : '📦'} {pieceCount}
              </span>
            ) : null}
          </div>
        )}

        {/* Close button on image when popped open */}
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

      {/* Product Info */}
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
            
            {/* Quantity Variant Pills (e.g. 100g, 250g, 500g) */}
            {hasVariants && (
              <div className="card-variants-row" onClick={e => e.stopPropagation()}>
                <span className="card-variants-label">Size / Qty:</span>
                <div className="card-variants-pills">
                  {product.quantityVariants.map((v, i) => {
                    const isSelected = selectedVariant?.label === v.label;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`card-variant-btn ${isSelected ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVariant(v);
                        }}
                      >
                        {v.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Piece count pill if applicable */}
            {pieceCount && !hasVariants && (
              <div className="card-piece-info-row">
                <span className="card-piece-tag">
                  {isBrownie ? '🍫' : '📦'} {pieceCount}
                </span>
                {hasFlourChoice && (
                  <span className="card-flour-tag">
                    🌾 Choice of Maida / Ragi
                  </span>
                )}
              </div>
            )}

            <div className="product-footer">
              <span className="product-price">₹{activePrice}</span>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleOpenPopover}
                disabled={!product.available}
              >
                {product.available 
                  ? (isAssorted 
                      ? (capacity === 1 ? '✨ Customize (1 Piece)' : `✨ Pick ${capacity} ${isBrownie ? 'Pieces' : 'Flavours'}`) 
                      : (hasVariants ? '✨ Choose & Order' : 'View Details')) 
                  : 'Sold Out'}
              </button>
            </div>
          </>
        ) : (
          /* Popped Open Quick Builder / Customization State */
          <div className="card-pop-details animate-fade-in" onClick={e => e.stopPropagation()}>
            
            {/* Quantity Variant Selector inside Popover */}
            {hasVariants && (
              <div className="popover-variants-group">
                <span className="popover-variants-label">Select Quantity / Pack Size:</span>
                <div className="popover-variants-pills">
                  {product.quantityVariants.map((v, i) => {
                    const isSelected = selectedVariant?.label === v.label;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={`popover-variant-pill ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedVariant(v)}
                      >
                        <span className="pv-label">{v.label}</span>
                        <span className="pv-price">₹{v.price}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Flour Base Selector (Maida vs Ragi) for Brownies & Healthy Bakes */}
            {hasFlourChoice && (
              <div className="mini-flour-group">
                <span className="mini-flour-label">Flour Base:</span>
                <div className="mini-flour-pills">
                  {flourOptions.map(flour => (
                    <button
                      key={flour}
                      type="button"
                      className={`mini-flour-btn ${selectedFlour === flour ? 'active' : ''}`}
                      onClick={() => setSelectedFlour(flour)}
                    >
                      {flour === 'Healthy Ragi' ? '🌱' : '🌾'} {flour}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isAssorted ? (
              <div className="popover-assorted-builder">
                <div className="popover-assorted-header-row">
                  <span className="popover-assorted-label">
                    {capacity === 1 
                      ? 'Choose Your Brownie Flavour:' 
                      : `Choose ${capacity} ${isBrownie ? 'Pieces' : 'Flavours'}:`}
                  </span>
                  {capacity > 1 && (
                    <button type="button" onClick={applyTopPreset} className="popover-preset-chip">
                      <Sparkles size={11} /> Top {capacity} Mix
                    </button>
                  )}
                </div>

                {/* Visual Slots Bar or Single Flavour Preview */}
                {capacity === 1 ? (
                  <div className="mini-single-slot-preview">
                    <span className="mini-single-label">Selected Flavour:</span>
                    <span className="mini-single-value">
                      🍫 {selectedSlots[0] || 'Pick a flavour below'}
                    </span>
                  </div>
                ) : (
                  <div 
                    className="mini-slots-bar" 
                    style={{ gridTemplateColumns: `repeat(${capacity}, 1fr)` }}
                  >
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
                            {flv ? flv.replace(/ Cookie Tin| Cookies| Tin| Brownie/gi, '').trim() : '+ Pick'}
                          </span>
                          {flv && <span className="mini-slot-x">✕</span>}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Clickable Flavour Chips */}
                <div className="mini-flavour-chips-grid">
                  {availableFlavours.map(f => {
                    const isSelected = capacity === 1 
                      ? selectedSlots[0] === f 
                      : selectedSlots.filter(s => s === f).length > 0;
                    const count = selectedSlots.filter(s => s === f).length;
                    const cleanName = f.replace(/ Cookie Tin| Cookies| Tin| Brownie/gi, '').trim();
                    return (
                      <button
                        key={f}
                        type="button"
                        className={`mini-flavour-chip ${isSelected ? 'active' : ''}`}
                        onClick={() => handleToggleFlavour(f)}
                      >
                        <span className="chip-indicator">
                          {capacity === 1 ? (isSelected ? '✓' : '○') : (count > 0 ? count : '+')}
                        </span>
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

            {/* Cart Details Footer */}
            <div className="card-pop-footer">
              <span className="product-price pop-price">₹{activePrice}</span>

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
                    <ShoppingBag size={14} /> Add • ₹{activePrice * quantity}
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
