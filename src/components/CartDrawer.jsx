import React from 'react';
import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

const CartDrawer = () => {
  const { cart, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, cartTotal } = useCart();

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
            <div className="cart-total">
              <span>Total:</span>
              <span>₹{cartTotal}</span>
            </div>
            <button className="btn btn-whatsapp cart-checkout-btn" onClick={handleCheckout}>
              Checkout on WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartDrawer;
