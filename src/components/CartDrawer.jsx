import React, { useState } from 'react';
import { X, Minus, Plus, ShoppingBag, CalendarClock, MapPin, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [mapsLink, setMapsLink] = useState('');
  const [isLocating, setIsLocating] = useState(false);

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
    
    // Format message
    let message = `Hi Ovenly! I'd like to place an order:%0A%0A`;
    
    cart.forEach((item, index) => {
      message += `${index + 1}. *${item.name}* x${item.quantity}`;
      if (item.options) {
        message += ` (${item.options})`;
      }
      message += ` - ₹${item.price * item.quantity}%0A`;
    });
    
    message += `%0A*Total: ₹${cartTotal}*`;
    
    if (deliveryDate) {
      const formattedDate = new Date(deliveryDate).toLocaleString();
      message += `%0A%0A*Requested Time:*%0A${formattedDate}`;
    }
    
    if (deliveryAddress) {
      message += `%0A%0A*Delivery Address:*%0A${deliveryAddress}`;
    }
    
    if (mapsLink) {
      message += `%0A%0A*Maps Location:*%0A${mapsLink}`;
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
        
        <div className="cart-items" style={{ flex: 1, overflowY: 'auto' }}>
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
          <div className="cart-footer" style={{ borderTop: '2px solid var(--color-cream)', paddingTop: '15px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '15px' }}>
              <div className="cart-input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-forest)', fontWeight: '600', marginBottom: '4px' }}>
                  <CalendarClock size={14} /> Date & Time (Optional)
                </label>
                <input 
                  type="datetime-local" 
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
              </div>

              <div className="cart-input-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--color-forest)', fontWeight: '600', marginBottom: '4px' }}>
                  <MapPin size={14} /> Delivery Address (Optional)
                </label>
                <textarea 
                  placeholder="E.g., 123 Baker St, Apt 4B"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '0.9rem', resize: 'vertical', minHeight: '60px' }}
                />
              </div>

              <div className="cart-input-group">
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--color-forest)', fontWeight: '600', marginBottom: '4px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Navigation size={14} /> Maps Link (Optional)</span>
                  <button 
                    onClick={handleGetLocation} 
                    disabled={isLocating}
                    style={{ background: 'none', border: 'none', color: 'var(--color-cookie-brown)', fontSize: '0.75rem', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {isLocating ? 'Locating...' : 'Use current location'}
                  </button>
                </label>
                <input 
                  type="url" 
                  placeholder="Paste Google Maps link"
                  value={mapsLink}
                  onChange={(e) => setMapsLink(e.target.value)}
                  style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #ddd', fontFamily: 'inherit', fontSize: '0.9rem' }}
                />
              </div>
            </div>
            
            <div className="cart-total" style={{ marginBottom: '15px' }}>
              <span>Total:</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className="btn btn-whatsapp cart-checkout-btn" onClick={handleCheckout} style={{ width: '100%' }}>
              Checkout on WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
