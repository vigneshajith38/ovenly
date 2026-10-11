import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, CalendarClock, MapPin, Navigation, Truck, Store, CheckCircle2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [orderType, setOrderType] = useState('porter'); // 'porter' | 'pickup'
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [pickupNotes, setPickupNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [formError, setFormError] = useState('');

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setMapsLink(`https://maps.google.com/?q=${lat},${lng}`);
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. You can paste a Google Maps link manually.");
        setIsLocating(false);
      }
    );
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (orderType === 'porter' && !deliveryAddress.trim() && !mapsLink.trim()) {
      setFormError('Please provide your delivery address or maps pin for Porter delivery.');
      return;
    }
    setFormError('');
    
    // Format message
    let message = `Hi Ovenly! I'd like to place an order:%0A%0A`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. *${encodeURIComponent(item.name)}* x${item.quantity}`;
      if (item.options) {
        message += ` (${encodeURIComponent(item.options)})`;
      }
      message += ` - ₹${item.price * item.quantity}%0A`;
    });
    
    message += `%0A*Total: ₹${cartTotal}*%0A`;
    message += `---------------------------%0A`;

    if (orderType === 'porter') {
      message += `*Fulfillment Method:* 🛵 Delivery via Porter%0A`;
      if (deliveryDate) {
        const formattedDate = new Date(deliveryDate).toLocaleString();
        message += `*Requested Delivery Time:* ${encodeURIComponent(formattedDate)}%0A`;
      }
      if (deliveryAddress) {
        message += `*Delivery Address:* ${encodeURIComponent(deliveryAddress)}%0A`;
      }
      if (mapsLink) {
        message += `*Maps Location:* ${encodeURIComponent(mapsLink)}%0A`;
      }
    } else {
      message += `*Fulfillment Method:* 🛍️ Self Pick up%0A`;
      if (deliveryDate) {
        const formattedDate = new Date(deliveryDate).toLocaleString();
        message += `*Requested Pickup Time:* ${encodeURIComponent(formattedDate)}%0A`;
      }
      if (pickupNotes) {
        message += `*Pickup Notes:* ${encodeURIComponent(pickupNotes)}%0A`;
      }
    }
    
    // Using user's requested number
    const whatsappUrl = `https://wa.me/919916693919?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!isCartOpen) return null;

  return (
    <div className="cart-overlay" onClick={() => setIsCartOpen(false)}>
      <div className="cart-drawer animate-slide-in" onClick={e => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Your Cart</h2>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <ShoppingBag size={48} color="#ccc" />
              <p>Your cart is empty.</p>
              <button className="btn btn-primary" onClick={() => setIsCartOpen(false)}>Continue Shopping</button>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="cart-item">
                <img src={item.image} alt={item.name} className="cart-item-image" />
                <div className="cart-item-details">
                  <h4>{item.name}</h4>
                  {item.options && <p className="cart-item-options">{item.options}</p>}
                  <p className="cart-item-price">₹{item.price * item.quantity}</p>
                  
                  <div className="cart-item-actions">
                    <div className="quantity-selector small">
                      <button onClick={() => updateQuantity(item.id, item.options, -1)}><Minus size={14}/></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.options, 1)}><Plus size={14}/></button>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id, item.options)}>Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {cart.length > 0 && (
          <div className="cart-footer">
            
            {/* Fulfillment Selection (Pick up or Porter) */}
            <div className="fulfillment-section">
              <label className="fulfillment-section-title">
                How would you like to receive your treats?
              </label>
              
              <div className="fulfillment-toggle-grid">
                <button
                  type="button"
                  className={`fulfillment-card ${orderType === 'porter' ? 'active' : ''}`}
                  onClick={() => { setOrderType('porter'); setFormError(''); }}
                >
                  <div className="fulfillment-card-top">
                    <div className="fulfillment-icon-box">
                      <Truck size={20} />
                    </div>
                    {orderType === 'porter' && <CheckCircle2 size={16} className="active-check" />}
                  </div>
                  <div className="fulfillment-card-info">
                    <strong className="fulfillment-title">Porter Delivery</strong>
                    <span className="fulfillment-sub">To your doorstep</span>
                  </div>
                </button>

                <button
                  type="button"
                  className={`fulfillment-card ${orderType === 'pickup' ? 'active' : ''}`}
                  onClick={() => { setOrderType('pickup'); setFormError(''); }}
                >
                  <div className="fulfillment-card-top">
                    <div className="fulfillment-icon-box">
                      <Store size={20} />
                    </div>
                    {orderType === 'pickup' && <CheckCircle2 size={16} className="active-check" />}
                  </div>
                  <div className="fulfillment-card-info">
                    <strong className="fulfillment-title">Self Pick up</strong>
                    <span className="fulfillment-sub">Collect at Ovenly</span>
                  </div>
                </button>
              </div>

              {/* Helpful context banner */}
              {orderType === 'porter' ? (
                <div className="fulfillment-hint-badge porter-hint">
                  🛵 <span><strong>Porter Delivery:</strong> We'll dispatch via Porter once freshly baked. Delivery fare as per actuals.</span>
                </div>
              ) : (
                <div className="fulfillment-hint-badge pickup-hint">
                  🛍️ <span><strong>Self Pick up:</strong> We'll share our kitchen pickup location & exact directions on WhatsApp!</span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {formError && (
              <div className="cart-error-banner animate-fade-in">
                <AlertCircle size={16} />
                <span>{formError}</span>
              </div>
            )}

            {/* Conditional Input Fields */}
            <div className="cart-inputs-container">
              
              {/* Date & Time */}
              <div className="cart-input-group">
                <label>
                  <CalendarClock size={14} /> 
                  {orderType === 'porter' ? 'Delivery Date & Time (Optional)' : 'Pickup Date & Time (Optional)'}
                </label>
                <input 
                  type="datetime-local" 
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              {/* Porter Specific: Address and Maps */}
              {orderType === 'porter' ? (
                <>
                  <div className="cart-input-group">
                    <label>
                      <MapPin size={14} /> Delivery Address <span className="req-star">*</span>
                    </label>
                    <textarea 
                      placeholder="Flat/House No, Apartment/Street, Area, Landmark"
                      value={deliveryAddress}
                      onChange={(e) => { setDeliveryAddress(e.target.value); if(formError) setFormError(''); }}
                      rows={2}
                    />
                  </div>

                  <div className="cart-input-group">
                    <label className="label-with-action">
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Navigation size={14} /> Maps Link (Optional)
                      </span>
                      <button 
                        type="button"
                        onClick={handleGetLocation} 
                        disabled={isLocating}
                        className="location-detect-btn"
                      >
                        {isLocating ? 'Locating...' : 'Use current location'}
                      </button>
                    </label>
                    <input 
                      type="url" 
                      placeholder="Paste Google Maps link"
                      value={mapsLink}
                      onChange={(e) => { setMapsLink(e.target.value); if(formError) setFormError(''); }}
                    />
                  </div>
                </>
              ) : (
                /* Pickup Specific: Notes */
                <div className="cart-input-group">
                  <label>
                    <MapPin size={14} /> Pickup Notes (Optional)
                  </label>
                  <input 
                    type="text"
                    placeholder="E.g., Special instructions or pickup preference"
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div className="cart-total-bar">
              <div className="cart-total-label">
                <span>Total:</span>
                <span className="fulfillment-badge-pill">
                  {orderType === 'porter' ? '🛵 Porter' : '🛍️ Pick up'}
                </span>
              </div>
              <span className="cart-total-amount">₹{cartTotal}</span>
            </div>

            <button className="btn btn-whatsapp cart-checkout-btn" onClick={handleCheckout}>
              Proceed with {orderType === 'porter' ? 'Porter Delivery' : 'Pick up'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
