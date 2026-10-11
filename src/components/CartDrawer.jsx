import React, { useState } from 'react';
import { 
  X, Minus, Plus, ShoppingBag, CalendarClock, MapPin, 
  Navigation, Truck, Store, CheckCircle2, AlertCircle, 
  Crosshair, Loader2, ExternalLink, Check, Sparkles
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
  const [locationAccuracy, setLocationAccuracy] = useState(null); // in meters
  const [locationStatus, setLocationStatus] = useState(''); // 'success' | 'denied' | 'unavailable' | 'timeout' | ''
  const [locationErrorDetail, setLocationErrorDetail] = useState('');
  const [formError, setFormError] = useState('');

  // High-accuracy Progressive GPS tracking engine
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationErrorDetail('Geolocation is not supported by your browser.');
      setShareOnWhatsApp(true);
      return;
    }
    
    setIsLocating(true);
    setLocationStatus('');
    setLocationErrorDetail('');
    setLocationAccuracy(null);
    setFormError('');

    let bestCoords = null;
    let watchId = null;
    let timer = null;

    const stopTracking = (finalPosition) => {
      if (watchId !== null) {
        try { navigator.geolocation.clearWatch(watchId); } catch (_) {}
        watchId = null;
      }
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      setIsLocating(false);

      if (finalPosition && finalPosition.coords) {
        const { latitude: lat, longitude: lng, accuracy } = finalPosition.coords;
        const link = `https://maps.google.com/?q=${lat},${lng}`;
        setMapsLink(link);
        setLocationAccuracy(Math.round(accuracy));
        setShareOnWhatsApp(false);
        setLocationStatus('success');
        setLocationErrorDetail('');

        // Reverse geocoding with clean street & locality details
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data && data.address && !deliveryAddress.trim()) {
              const a = data.address;
              const streetParts = [
                a.house_number,
                a.road || a.pedestrian || a.suburb,
                a.neighbourhood || a.residential,
                a.city || a.town || a.city_district,
                a.postcode
              ].filter(Boolean);
              
              const cleanAddress = streetParts.length >= 2 
                ? streetParts.join(', ') 
                : (data.display_name || '');
                
              if (cleanAddress) {
                setDeliveryAddress(cleanAddress);
              }
            }
          })
          .catch((err) => console.warn('Reverse geocoding silent error:', err));
      } else {
        setLocationStatus('unavailable');
        setLocationErrorDetail("Couldn't achieve GPS satellite fix indoors. Switched to WhatsApp live location below!");
        setShareOnWhatsApp(true);
      }
    };

    // Watch position with maximumAge: 0 to force fresh satellite fix
    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const acc = pos.coords.accuracy;
          // Keep best accuracy reading
          if (!bestCoords || acc < bestCoords.coords.accuracy) {
            bestCoords = pos;
            setLocationAccuracy(Math.round(acc));
          }

          // If pinpoint GPS accuracy achieved (under 25 meters), lock in immediately!
          if (acc <= 25) {
            stopTracking(pos);
          }
        },
        (err) => {
          console.warn("watchPosition error:", err);
          if (err.code === 1) { // PERMISSION_DENIED
            stopTracking(null);
            setLocationStatus('denied');
            setLocationErrorDetail('Location permission was denied in your phone browser settings. Switched to WhatsApp live location below!');
            setShareOnWhatsApp(true);
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0, // Force fresh satellite fix, NEVER stale cell tower cache!
          timeout: 12000 // Allow up to 12s for mobile GPS satellites to lock
        }
      );

      // Safety timeout: after 9 seconds, take the best accuracy achieved so far
      timer = setTimeout(() => {
        if (bestCoords) {
          stopTracking(bestCoords);
        } else {
          // If no satellite reading yet, try a quick single low-accuracy snapshot as fallback
          navigator.geolocation.getCurrentPosition(
            (pos) => stopTracking(pos),
            (err) => {
              stopTracking(null);
              if (err.code === 1) {
                setLocationStatus('denied');
                setLocationErrorDetail('Location permission was denied in your browser settings.');
              } else if (err.code === 2) {
                setLocationStatus('unavailable');
                setLocationErrorDetail("Device GPS is turned off in settings. Switched to WhatsApp live location below!");
              } else {
                setLocationStatus('timeout');
                setLocationErrorDetail("GPS signal timed out indoors. Switched to WhatsApp live location below!");
              }
              setShareOnWhatsApp(true);
            },
            { enableHighAccuracy: false, timeout: 5000, maximumAge: 30000 }
          );
        }
      }, 9000);
    } catch (e) {
      console.error("Geolocation launch error:", e);
      stopTracking(null);
      setShareOnWhatsApp(true);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (orderType === 'porter' && !deliveryAddress.trim()) {
      setFormError('Please enter your delivery address (Flat / House No, Street, Area) for Porter.');
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
        const accText = locationAccuracy ? ` (GPS accuracy: ±${locationAccuracy}m)` : '';
        message += `*Maps Location:* ${encodeURIComponent(mapsLink)}${encodeURIComponent(accText)}%0A`;
      } else if (shareOnWhatsApp) {
        message += `*Maps Location:* 📍 Will share live location pin directly in this chat%0A`;
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
                      placeholder="House/Flat No, Building/Apartment, Street, Area, Landmark"
                      value={deliveryAddress}
                      onChange={(e) => { setDeliveryAddress(e.target.value); if(formError) setFormError(''); }}
                      rows={2}
                    />
                  </div>

                  {/* Enhanced High-Accuracy Location Section */}
                  <div className="cart-location-box">
                    <div className="location-box-header">
                      <span className="location-box-title">
                        <Navigation size={14} /> Map Location / Pin (Optional)
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
                            <span>
                              {locationAccuracy ? `Refining (±${locationAccuracy}m)...` : 'Acquiring GPS...'}
                            </span>
                          </>
                        ) : (
                          <>
                            <Crosshair size={13} />
                            <span>Detect Exact GPS</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback states if GPS succeeds */}
                    {locationStatus === 'success' && (
                      <div className="location-feedback success animate-fade-in">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={14} /> 
                          <div>
                            <strong>✓ Exact GPS Locked!</strong>
                            {locationAccuracy && (
                              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                                Satellite precision: ±{locationAccuracy}m
                              </div>
                            )}
                          </div>
                        </div>
                        {mapsLink && (
                          <a 
                            href={mapsLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn-preview-maps"
                            title="Verify pin on Google Maps"
                          >
                            <ExternalLink size={12} /> View Pin
                          </a>
                        )}
                      </div>
                    )}

                    {locationErrorDetail && (
                      <div className="location-feedback info animate-fade-in">
                        <Sparkles size={14} />
                        <span>{locationErrorDetail}</span>
                      </div>
                    )}

                    {/* Super easy WhatsApp Location fallback */}
                    <div 
                      className={`wa-location-toggle ${shareOnWhatsApp ? 'active' : ''}`}
                      onClick={() => {
                        const next = !shareOnWhatsApp;
                        setShareOnWhatsApp(next);
                        if (next) {
                          setMapsLink('');
                        }
                      }}
                    >
                      <div className="wa-checkbox">
                        {shareOnWhatsApp ? <Check size={13} color="white" /> : null}
                      </div>
                      <div className="wa-location-text">
                        <strong>Share live location pin directly on WhatsApp 📲</strong>
                        <small>Easiest on phone: just tap the paperclip icon in WhatsApp chat!</small>
                      </div>
                    </div>

                    {/* Google Maps link input */}
                    <div className="maps-input-wrapper">
                      <input 
                        type="url" 
                        placeholder="Or paste Google Maps link here..."
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
                        title="Open Google Maps to pick location"
                      >
                        <ExternalLink size={14} /> Maps App
                      </a>
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
