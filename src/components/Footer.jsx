import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { config } from '../data/products';
import './Footer.css';

const InstagramIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const FooterDoodleHeart = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M50 88C50 88 15 62 15 35C15 20 28 10 40 15C46 17 50 24 50 24C50 24 54 17 60 15C72 10 85 20 85 35C85 62 50 88 50 88Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const FooterDoodleFlower = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="12" stroke="currentColor" strokeWidth="4"/>
    <path d="M50 25C40 10 60 10 50 25ZM75 50C90 40 90 60 75 50ZM50 75C60 90 40 90 50 75ZM25 50C10 60 10 40 25 50Z" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-decorations">
        <FooterDoodleHeart className="footer-doodle footer-heart" />
        <FooterDoodleFlower className="footer-doodle footer-flower" />
      </div>
      
      <div className="container footer-container">
        
        <div className="footer-left">
          <div className="footer-logo-wrapper">
            <img src="/ovenly-logo.png" alt="Ovenly Logo" className="footer-logo" />
          </div>
          <p className="footer-tagline">Sinfully Delicious</p>
        </div>
        
        <div className="footer-center">
          <ul className="footer-nav">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shop">Shop Treats</Link></li>
            <li><Link to="/reviews">Reviews</Link></li>
            <li><Link to="/about">About & Contact</Link></li>
          </ul>
        </div>
        
        <div className="footer-right">
          <div className="footer-badge">
            <span className="handwritten-badge">Life is better with cookies ♡</span>
          </div>
          <div className="social-links">
            <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noreferrer" aria-label="WhatsApp">
              <MessageCircle size={22} />
            </a>
            <a href="https://instagram.com/ovenly_treats" target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramIcon size={22} />
            </a>
            <a href="mailto:hello@ovenly.in" aria-label="Email">
              <Mail size={22} />
            </a>
          </div>
        </div>
        
      </div>
      <div className="footer-decorative-line">
        <svg viewBox="0 0 400 10" preserveAspectRatio="none">
          <path d="M5,5 Q200,-5 395,5" stroke="var(--color-pale-peach)" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.3" />
        </svg>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ovenly. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
