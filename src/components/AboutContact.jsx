import React from 'react';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { config } from '../data/products';
import './AboutContact.css';

const InstagramIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const AboutContact = () => {
  return (
    <div className="about-contact-page animate-fade-in">
      <div className="container">
        
        <div className="about-section">
          <div className="polaroid about-polaroid">
            <div className="tape tape-blue"></div>
            <img src="/ovenly-logo.png" alt="Ovenly Logo" className="about-logo-img" />
            <p className="handwritten">Our sweet story...</p>
          </div>
          
          <div className="about-text">
            <h2>About Ovenly</h2>
            <p>Welcome to Ovenly, where every treat is baked with love and a touch of magic. We believe that a good cookie or cupcake isn't just dessert; it's a moment of joy, a pause in a busy day, and a little piece of comfort.</p>
            <p>Our journey started with a simple passion for creating perfectly balanced, sinfully delicious treats. Today, we specialize in small-batch, handcrafted cookie tins and artisanal cupcakes, using only the finest ingredients.</p>
            <p>Whether you're treating yourself, celebrating a special occasion, or finding the perfect gift, we're here to make life a little sweeter.</p>
          </div>
        </div>

        <div className="contact-section">
          <h2>Get in Touch</h2>
          <p className="contact-intro handwritten-text">Have a custom order request, a question about our treats, or just want to say hi? We'd love to hear from you!</p>
          
          <div className="contact-grid">
            <div className="contact-card card-blush">
              <MessageCircle className="contact-icon" />
              <h3>WhatsApp Us</h3>
              <p>For quick orders and inquiries</p>
              <a href={`https://wa.me/${config.whatsappNumber}`} target="_blank" rel="noreferrer" className="contact-link">
                +91 {config.whatsappNumber.substring(2)}
              </a>
            </div>
            
            <div className="contact-card card-yellow">
              <InstagramIcon className="contact-icon" />
              <h3>Follow Us</h3>
              <p>See our latest bakes</p>
              <a href="https://www.instagram.com/ovenly_blr?srtk=MTB0cG9oMTFyODBi" target="_blank" rel="noreferrer" className="contact-link">
                @ovenly_blr
              </a>
            </div>
            
            <div className="contact-card card-peach">
              <Mail className="contact-icon" />
              <h3>Email Us</h3>
              <p>For bulk orders & events</p>
              <a href="mailto:hello@ovenly.in" className="contact-link">
                hello@ovenly.in
              </a>
            </div>
            
            <div className="contact-card card-sage">
              <MapPin className="contact-icon" />
              <h3>Location</h3>
              <p>Delivery available across</p>
              <span className="contact-link">
                Bangalore, India
              </span>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AboutContact;
