import React from 'react';
import { Link } from 'react-router-dom';
import { DoodleCupcake, DoodleHeart, DoodleFlower } from './Doodles';
import './CustomerLoveBanner.css';

const CustomerLoveBanner = () => {
  return (
    <section className="customer-love-section">
      <div className="container">
        <div className="love-banner">
          
          {/* Left: Polaroid */}
          <div className="love-banner-left">
            <div className="polaroid love-polaroid">
              <div className="tape tape-peach"></div>
              <img src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=400" alt="Fresh cookies" />
            </div>
            <p className="handwritten love-note-left">Real people, real moments ♡</p>
          </div>
          
          {/* Center: Text & CTA */}
          <div className="love-banner-center">
            <h2 className="love-banner-title">A Little Love from Our Customers ♡</h2>
            <Link to="/reviews" className="btn btn-primary love-banner-btn">
              Read Their Stories &rarr;
            </Link>
          </div>
          
          {/* Right: Doodles */}
          <div className="love-banner-right">
            <div className="love-doodles-cluster">
              <DoodleCupcake className="love-doodle-cupcake" />
              <DoodleHeart className="love-doodle-heart-1" />
              <DoodleHeart className="love-doodle-heart-2" />
              <DoodleFlower className="love-doodle-flower" />
            </div>
            <p className="handwritten love-note-right">Sweet words make our day</p>
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default CustomerLoveBanner;
