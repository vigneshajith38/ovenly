import React, { useState } from 'react';
import { 
  X, Minus, Plus, ShoppingBag, CalendarClock, MapPin, 
  Navigation, Truck, Store, CheckCircle2, AlertCircle, 
  Crosshair, Loader2, ExternalLink, Check 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [orderType, setOrderType] = useState('porter'); // 'porter' | 'pickup'
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [shareOnWhatsApp, setShareOnWhatsApp] = useState(false);
  const [pickupNotes, setPickupNotes] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState(''); // 'success' | 'denied' | 'error' | 'unsupported' | ''
  const [formError, setFormError] = useState('');

  const handleGetLocation = async () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      return;
    }
    
    setIsLocating(true);
    setLocationStatus('');
    setFormError('');

    const tryGetPosition = (enableHighAccuracy) => {
      return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy,
            timeout: enableHighAccuracy ? 8000 : 7000,
            maximumAge: 60000
          }
        );
      });
    };

    let position = null;
    try {
      // 1. Try High accuracy GPS
      position = await tryGetPosition(true);
    } catch (err1) {
      console.warn("High accuracy geolocation failed, trying low accuracy fallback...", err1);
      if (err1.code === 1) { // PERMISSION_DENIED
        setIsLocating(false);
        setLocationStatus('denied');
        return;
      }
      try {
        // 2. Try Low accuracy (Cell tower / WiFi)
        position = await tryGetPosition(false);
      } catch (err2) {
        console.error("Low accuracy geolocation also failed:", err2);
        setIsLocating(false);
        if (err2.code === 1) {
          setLocationStatus('denied');
        } else {
          setLocationStatus('error');
        }
        return;
      }
    }

    if (position && position.coords) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const link = `https://maps.google.com/?q=${lat},${lng}`;
      setMapsLink(link);
      setShareOnWhatsApp(false);
      setLocationStatus('success');
      setIsLocating(false);

      // Attempt reverse geocoding to auto-fill address if empty
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.display_name && !deliveryAddress.trim()) {
            setDeliveryAddress(data.display_name);
          }
        }
      } catch (fetchErr) {
        console.warn("Reverse geocode silent error:", fetchErr);
      }
    } else {
      setIsLocating(false);
      setLocationStatus('error');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (orderType === 'porter' && !deliveryAddress.trim() && !mapsLink.trim() && !shareOnWhatsApp) {
      setFormError('Please enter your delivery address, use GPS, or select "Share location in WhatsApp".');
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
      } else if (shareOnWhatsApp) {
        message += `*Maps Location:* 📍 Will share live location directly in WhatsApp chat%0A`;
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

                  {/* Enhanced Location Section */}
                  <div className="cart-location-box">
                    <div className="location-box-header">
                      <span className="location-box-title">
                        <Navigation size={14} /> Pinpoint Location (For Porter Driver)
                      </span>
                      <button 
                        type="button"
                        onClick={handleGetLocation} 
                        disabled={isLocating}
                        className={`location-detect-pill ${isLocating ? 'loading' : ''}`}
                      >
                        {isLocating ? (
                          <>
                            <Loader2 size={13} className="spin-icon" />
                            <span>Locating...</span>
                          </>
                        ) : (
                          <>
                            <Crosshair size={13} />
                            <span>Detect My Location</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback states if GPS fails or succeeds */}
                    {locationStatus === 'success' && (
                      <div className="location-feedback success animate-fade-in">
                        <Check size={14} /> <span>Location captured successfully!</span>
                      </div>
                    )}

                    {(locationStatus === 'denied' || locationStatus === 'error' || locationStatus === 'unsupported') && (
                      <div className="location-feedback warning animate-fade-in">
                        <AlertCircle size={14} />
                        <span>
                          {locationStatus === 'denied' 
                            ? 'Location access was blocked by your browser settings.' 
                            : 'Could not fetch GPS location.'} You can use the option below!
                        </span>
                      </div>
                    )}

                    {/* Google Maps link input */}
                    <div className="maps-input-wrapper">
                      <input 
                        type="url" 
                        placeholder="Google Maps link (auto-filled or paste)"
                        value={mapsLink}
                        onChange={(e) => { 
                          setMapsLink(e.target.value); 
                          if (e.target.value) setShareOnWhatsApp(false);
                          if (formError) setFormError(''); 
                        }}
                      />
                      <a 
                        href="https://www.google.com/maps" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="open-maps-link"
                        title="Open Google Maps to copy link"
                      >
                        <ExternalLink size={14} /> Maps
                      </a>
                    </div>

                    {/* Super easy WhatsApp Location fallback */}
                    <div 
                      className={`wa-location-toggle ${shareOnWhatsApp ? 'active' : ''}`}
                      onClick={() => {
                        const next = !shareOnWhatsApp;
                        setShareOnWhatsApp(next);
                        if (next) {
                          setMapsLink('');
                          setLocationStatus('');
                          if (formError) setFormError('');
                        }
                      }}
                    >
                      <div className="wa-checkbox">
                        {shareOnWhatsApp ? <Check size={13} color="white" /> : null}
                      </div>
                      <div className="wa-location-text">
                        <strong>I'll share my live location directly in WhatsApp chat</strong>
                        <small>Easiest on phone: tap the paperclip/attachment icon in WhatsApp!</small>
                      </div>
                    </div>
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
