import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { itemCount, setIsCartOpen } = useCart();

  const toggleMenu = () => setIsOpen(!isOpen);
  
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        
        <div className="mobile-toggle" onClick={toggleMenu}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </div>

        <div className="nav-logo-container">
          <Link to="/" className="nav-logo" onClick={closeMenu}>
            <img src="/ovenly-logo.png" alt="Ovenly Logo" />
          </Link>
        </div>
        
        <ul className={`nav-links ${isOpen ? 'active' : ''}`}>
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active-link' : ''} onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/shop" className={location.pathname === '/shop' ? 'active-link' : ''} onClick={closeMenu}>
              Shop Treats
            </Link>
          </li>
          <li>
            <Link to="/gallery" className={location.pathname === '/gallery' ? 'active-link' : ''} onClick={closeMenu}>
              Our Bakes
            </Link>
          </li>
          <li>
            <Link to="/reviews" className={location.pathname === '/reviews' ? 'active-link' : ''} onClick={closeMenu}>
              Reviews & Love
            </Link>
          </li>
          <li>
            <Link to="/about" className={location.pathname === '/about' ? 'active-link' : ''} onClick={closeMenu}>
              About Us
            </Link>
          </li>
        </ul>
        
        <div className="nav-actions">
          <button className="cart-nav-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={24} color="var(--color-dark-chocolate)" />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
