import React from 'react';
import { Link } from 'react-router-dom';
import './CategoryCards.css';

const CategoryCards = () => {
  const categories = [
    { name: 'Cookies', id: 'cookie-tins', bg: 'var(--color-blush-pink)', rotate: '-2deg', icon: '🍪' },
    { name: 'Cupcakes', id: 'cupcakes', bg: 'var(--color-sage-green)', rotate: '1deg', icon: '🧁' },
    { name: 'Customize Tin', id: 'assorted', bg: 'var(--color-pale-peach)', rotate: '-1.5deg', icon: '✨' },
    { name: 'Brownies', id: 'brownies', bg: 'var(--color-butter-yellow)', rotate: '2deg', icon: '🍫' },
  ];

  return (
    <section className="category-section">
      <div className="container">
        <div className="category-row">
          {categories.map((cat, idx) => (
            <Link 
              key={idx} 
              to={`/shop?category=${cat.id}`}
              className="category-card" 
              style={{ 
                backgroundColor: cat.bg,
                transform: `rotate(${cat.rotate})`,
                textDecoration: 'none',
                color: 'inherit'
              }}
            >
              <div className="category-icon">{cat.icon}</div>
              <h3 className="handwritten">{cat.name}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryCards;
