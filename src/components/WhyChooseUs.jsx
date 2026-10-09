import React from 'react';
import { Heart, Leaf, Sparkles, Smile } from 'lucide-react';
import { DoodleHeart, DoodleStar, DoodleFlower, DoodleBow } from './Doodles';
import './WhyChooseUs.css';

const WhyChooseUs = () => {
  const benefits = [
    { icon: <Heart size={32} />, text: 'Homemade with love' },
    { icon: <Leaf size={32} />, text: 'Premium ingredients' },
    { icon: <Sparkles size={32} />, text: 'Freshly Baked Daily' },
    { icon: <Smile size={32} />, text: 'Happiness in Every Bite' },
  ];

  return (
    <section className="why-choose-section">
      <div className="container">
        <div className="why-choose-panel">
          
          {/* Decorations */}
          <div className="tape tape-peach panel-tape"></div>
          <DoodleBow className="panel-doodle-bow" />
          <DoodleFlower className="panel-doodle-flower-1" />
          <DoodleFlower className="panel-doodle-flower-2" />
          <DoodleHeart className="panel-doodle-heart-1" />
          <DoodleStar className="panel-doodle-star-1" />
          
          <h2 className="why-choose-title">Why Choose Ovenly?</h2>
          
          <div className="benefits-grid">
            {benefits.map((b, idx) => (
              <div className="benefit-item" key={idx}>
                <div className="benefit-icon">
                  {b.icon}
                </div>
                <p className="benefit-text">{b.text}</p>
                {idx < benefits.length - 1 && <div className="benefit-divider"></div>}
              </div>
            ))}
          </div>
          
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
