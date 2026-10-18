import React, { useState } from 'react';
import { 
  X, Minus, Plus, ShoppingBag, CalendarClock, MapPin, 
  Navigation, Truck, Store, CheckCircle2, AlertCircle, 
  Crosshair, Loader2, ExternalLink, Check, Sparkles, Clock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

// Helpers for 3-hour minimum baking & preparation time window
const getThreeHoursFromNow = () => new Date(Date.now() + 3 * 60 * 60 * 1000);

const formatToLocalDateTimeInput = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatReadableTime = (date) => {
  if (!date || isNaN(date.getTime())) return '';
  const now = new Date();
  const isToday = now.toDateString() === date.toDateString();

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const isTomorrow = tomorrow.toDateString() === date.toDateString();

  const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

  if (isToday) {
    return `Today at ${timeString}`;
  } else if (isTomorrow) {
    return `Tomorrow at ${timeString}`;
  } else {
    const dateString = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    return `${dateString} at ${timeString}`;
  }
};

const isBeforeThreeHours = (dateValue) => {
  if (!dateValue) return false;
  const time = new Date(dateValue).getTime();
  if (isNaN(time)) return false;
  const minAllowed = Date.now() + 3 * 60 * 60 * 1000;
  return time < minAllowed - 60000; // 1-minute buffer for clock precision
};

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
  const [timeWarning, setTimeWarning] = useState('');

  const handleDateChange = (val) => {
    setDeliveryDate(val);
    if (!val) {
      setTimeWarning('');
      if (formError && formError.toLowerCase().includes('preparation')) {
        setFormError('');
      }
      return;
    }

    if (isBeforeThreeHours(val)) {
      const minTimeStr = formatReadableTime(getThreeHoursFromNow());
      setTimeWarning(`Minimum 3 hours preparation time required! Our treats are baked fresh to order. Please select a time after ${minTimeStr}.`);
    } else {
      setTimeWarning('');
      if (formError && formError.toLowerCase().includes('preparation')) {
        setFormError('');
      }
    }
  };

  const handleDateFocus = () => {
    if (deliveryDate && isBeforeThreeHours(deliveryDate)) {
      const minTimeStr = formatReadableTime(getThreeHoursFromNow());
      setTimeWarning(`Minimum 3 hours preparation time required! Our treats are baked fresh to order. Please select a time after ${minTimeStr}.`);
    }
  };

  const handleSetEarliestTime = () => {
    const earliestDate = getThreeHoursFromNow();
    setDeliveryDate(formatToLocalDateTimeInput(earliestDate));
    setTimeWarning('');
    if (formError && formError.toLowerCase().includes('preparation')) {
      setFormError('');
    }
  };

  // Fast Two-Stage Progressive GPS engine (Instant fix + background refinement)
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('unsupported');
      setLocationErrorDetail('Geolocation is not supported by your browser. Please enter your address or share live location on WhatsApp.');
      setShareOnWhatsApp(true);
      return;
    }
    
    setIsLocating(true);
    setLocationStatus('');
    setLocationErrorDetail('');
    setFormError('');

    let activeWatchId = null;
    let fallbackTimer = null;
    let maxTimeoutTimer = null;
    let bestAccuracy = Infinity;
    let hasResolvedInitial = false;

    // Helper to safely reverse geocode with an AbortController timeout (4s)
    const fetchAddressReverse = (lat, lng) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
          signal: controller.signal
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            clearTimeout(timeoutId);
            if (data && data.address) {
              setDeliveryAddress((prev) => {
                if (prev && prev.trim().length > 0) return prev; // Do not overwrite user-typed address
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
                  
                return cleanAddress || prev;
              });
            }
          })
          .catch(() => {
            // Silently ignore reverse geocoding errors so map pin remains locked
          });
      } catch (_) {}
    };

    const cleanup = () => {
      if (activeWatchId !== null) {
        try { navigator.geolocation.clearWatch(activeWatchId); } catch (_) {}
        activeWatchId = null;
      }
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (maxTimeoutTimer) clearTimeout(maxTimeoutTimer);
      setIsLocating(false);
    };

    // Apply a valid position fix immediately
    const applyPositionFix = (pos, isInitial = false) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      const roundedAcc = Math.round(accuracy);
      
      // Update if this is our initial fix or if accuracy has sharpened
      if (!hasResolvedInitial || roundedAcc < bestAccuracy) {
        bestAccuracy = roundedAcc;
        const link = `https://www.google.com/maps?q=${lat},${lng}`;
        setMapsLink(link);
        setLocationAccuracy(roundedAcc);
        setLocationStatus('success');
        setLocationErrorDetail('');
        setShareOnWhatsApp(false); // GPS successfully locked, do not force WhatsApp
        
        if (!hasResolvedInitial) {
          fetchAddressReverse(lat, lng);
        }
      }

      hasResolvedInitial = true;

      // If pinpoint accuracy (<= 20m) achieved, stop active tracking immediately
      if (roundedAcc <= 20) {
        cleanup();
      }
    };

    // Stage 1: Immediate fast check with fresh cache allowance (60s).
    // Returns almost instantly (0.5s - 2s) on mobile phones indoors & outdoors using Wi-Fi / cell fusion!
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyPositionFix(pos, true);

        // If accuracy is already very sharp (<= 25m), finish right away
        if (pos.coords.accuracy <= 25) {
          cleanup();
          return;
        }

        // If indoor Wi-Fi/cell accuracy is acceptable (25m - 80m),
        // we've ALREADY locked the map pin! Now run a gentle background refinement
        // for up to 8s to see if satellites sharpen it further without blocking the user.
        try {
          activeWatchId = navigator.geolocation.watchPosition(
            (watchPos) => {
              applyPositionFix(watchPos, false);
            },
            () => {}, // Ignore intermediate watch errors since we already have a locked position
            {
              enableHighAccuracy: true,
              maximumAge: 0,
              timeout: 8000
            }
          );
        } catch (_) {}

        // Stop background refinement after 8 seconds
        fallbackTimer = setTimeout(() => {
          cleanup();
        }, 8000);
      },
      (err) => {
        // If user explicitly denied permission (code 1), stop immediately
        if (err.code === 1) { // PERMISSION_DENIED
          cleanup();
          setLocationStatus('denied');
          setLocationErrorDetail('Location permission was denied in your browser settings. You can share your live location directly on WhatsApp below!');
          setShareOnWhatsApp(true);
          return;
        }

        // If high accuracy failed or timed out (e.g. strict indoor environment),
        // Stage 2: Fallback to standard network/cell positioning immediately
        navigator.geolocation.getCurrentPosition(
          (fallbackPos) => {
            applyPositionFix(fallbackPos, true);
            cleanup();
          },
          (fallbackErr) => {
            cleanup();
            if (fallbackErr.code === 1) {
              setLocationStatus('denied');
              setLocationErrorDetail('Location permission was denied in your browser settings. Switched to WhatsApp live location below!');
              setShareOnWhatsApp(true);
            } else if (fallbackErr.code === 2) {
              setLocationStatus('unavailable');
              setLocationErrorDetail("Device GPS is turned off. Please turn on Location in phone settings or share via WhatsApp below.");
              setShareOnWhatsApp(true);
            } else {
              // Only trigger timeout if both high-accuracy AND network fallback completely failed after full cycle
              setLocationStatus('timeout');
              setLocationErrorDetail("GPS signal is weak indoors. You can share your live location pin on WhatsApp below or enter your address!");
              setShareOnWhatsApp(true);
            }
          },
          {
            enableHighAccuracy: false,
            timeout: 7000,
            maximumAge: 300000 // Accept up to 5 min network cache
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 6000,
        maximumAge: 60000 // Allow up to 1-minute fresh network/Wi-Fi fix for instant response
      }
    );

    // Global safety limit: Never let loading spinner spin for more than 12 seconds
    maxTimeoutTimer = setTimeout(() => {
      if (!hasResolvedInitial) {
        cleanup();
        setLocationStatus('timeout');
        setLocationErrorDetail("GPS signal is weak indoors. You can share your live location pin on WhatsApp below or enter your address!");
        setShareOnWhatsApp(true);
      } else {
        cleanup();
      }
    }, 12000);
  };


  const handleCheckout = () => {
    if (cart.length === 0) return;

    if (orderType === 'porter' && !deliveryAddress.trim()) {
      setFormError('Please enter your delivery address (Flat / House No, Street, Area) for Porter.');
      return;
    }

    // Minimum 3-hour preparation time validation
    if (deliveryDate && isBeforeThreeHours(deliveryDate)) {
      const minTimeStr = formatReadableTime(getThreeHoursFromNow());
      const prepError = `Minimum 3 hours preparation time required! Our treats are baked fresh to order. Earliest available ${orderType === 'porter' ? 'delivery' : 'pickup'} is after ${minTimeStr}.`;
      setTimeWarning(prepError);
      setFormError(prepError);
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
        const formattedDate = formatReadableTime(new Date(deliveryDate)) || new Date(deliveryDate).toLocaleString();
        message += `*Requested Delivery Time:* ${encodeURIComponent(formattedDate)}%0A`;
      } else {
        const earliestStr = formatReadableTime(getThreeHoursFromNow());
        message += `*Requested Delivery Time:* Earliest available (~${encodeURIComponent(earliestStr)}, min. 3 hrs prep)%0A`;
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
        const formattedDate = formatReadableTime(new Date(deliveryDate)) || new Date(deliveryDate).toLocaleString();
        message += `*Requested Pickup Time:* ${encodeURIComponent(formattedDate)}%0A`;
      } else {
        const earliestStr = formatReadableTime(getThreeHoursFromNow());
        message += `*Requested Pickup Time:* Earliest available (~${encodeURIComponent(earliestStr)}, min. 3 hrs prep)%0A`;
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
              
              {/* Date & Time with 3-Hour Minimum Preparation Notice */}
              <div className="cart-input-group timing-input-group">
                <div className="cart-input-header">
                  <label htmlFor="delivery-datetime-input">
                    <CalendarClock size={15} /> 
                    {orderType === 'porter' ? 'Delivery Date & Time' : 'Pickup Date & Time'}
                  </label>
                  <span className="prep-time-pill" title="All treats are baked fresh to order">
                    <Clock size={11} /> Min. 3h prep
                  </span>
                </div>

                <div className="datetime-field-wrapper">
                  <input 
                    id="delivery-datetime-input"
                    type="datetime-local" 
                    min={formatToLocalDateTimeInput(getThreeHoursFromNow())}
                    value={deliveryDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    onFocus={handleDateFocus}
                    className={`datetime-input ${timeWarning ? 'has-error' : ''}`}
                  />
                  <button 
                    type="button" 
                    className="btn-earliest-time"
                    onClick={handleSetEarliestTime}
                    title="Quickly select the earliest delivery slot (3 hours from now)"
                  >
                    ⚡ Earliest (+3h)
                  </button>
                </div>

                {/* Preparation Time Warning / Explanatory Notice */}
                {timeWarning ? (
                  <div className="time-warning-banner animate-fade-in" role="alert">
                    <AlertCircle size={16} className="time-warning-icon" />
                    <div className="time-warning-content">
                      <div className="time-warning-heading">Preparation Time Required</div>
                      <div className="time-warning-body">{timeWarning}</div>
                    </div>
                  </div>
                ) : (
                  <div className="time-helper-info">
                    <span>✨ Freshly baked to order. Earliest available: <strong>{formatReadableTime(getThreeHoursFromNow())}</strong></span>
                  </div>
                )}
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
                            <strong>
                              {locationAccuracy && locationAccuracy <= 25 
                                ? '✓ Exact GPS Locked!' 
                                : '✓ Location Pin Locked!'}
                            </strong>
                            {locationAccuracy && (
                              <div style={{ fontSize: '0.72rem', opacity: 0.9 }}>
                                Accuracy: ±{locationAccuracy}m {isLocating ? '(refining...)' : ''}
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
