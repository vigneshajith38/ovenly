import React from 'react';
import { 
  Cookie, 
  Heart, 
  Star, 
  Sparkles, 
  Flower2, 
  CakeSlice, 
  ChefHat, 
  Gift, 
  Croissant 
} from 'lucide-react';
import './Doodles.css';

// Base doodle style for Lucide icons to make them look hand-drawn
const DoodleIcon = ({ Icon, className, style }) => (
  <Icon 
    className={`doodle-icon ${className}`} 
    style={style} 
    strokeWidth={1.25} 
    stroke="currentColor" 
    fill="none" 
  />
);

export const DoodleCookie = ({ className, style }) => <DoodleIcon Icon={Cookie} className={className} style={style} />;
export const DoodleHeart = ({ className, style }) => <DoodleIcon Icon={Heart} className={className} style={style} />;
export const DoodleStar = ({ className, style }) => <DoodleIcon Icon={Star} className={className} style={style} />;
export const DoodleSparkle = ({ className, style }) => <DoodleIcon Icon={Sparkles} className={className} style={style} />;
export const DoodleFlower = ({ className, style }) => <DoodleIcon Icon={Flower2} className={className} style={style} />;
export const DoodleCupcake = ({ className, style }) => <DoodleIcon Icon={CakeSlice} className={className} style={style} />;
export const DoodleRollingPin = ({ className, style }) => <DoodleIcon Icon={ChefHat} className={className} style={style} />;
export const DoodleCroissant = ({ className, style }) => <DoodleIcon Icon={Croissant} className={className} style={style} />;
export const DoodleOvenMitt = ({ className, style }) => <DoodleIcon Icon={ChefHat} className={className} style={style} />;
export const DoodleBow = ({ className, style }) => <DoodleIcon Icon={Gift} className={className} style={style} />;


export const GlobalBackground = () => {
  return (
    <div className="global-doodles-container">
      {/* Corner Pastels */}
      <div className="corner-pastel corner-tl"></div>
      <div className="corner-pastel corner-tr"></div>
      <div className="corner-pastel corner-bl"></div>
      <div className="corner-pastel corner-br"></div>

      {/* Left Edge Doodles */}
      <DoodleCookie className="gdoodle gdoodle-left-1" />
      <DoodleHeart className="gdoodle gdoodle-left-2" />
      <DoodleStar className="gdoodle gdoodle-left-3" />
      <DoodleRollingPin className="gdoodle gdoodle-left-4" />
      <DoodleFlower className="gdoodle gdoodle-left-5" />
      <DoodleSparkle className="gdoodle gdoodle-left-6" />

      {/* Right Edge Doodles */}
      <DoodleCupcake className="gdoodle gdoodle-right-1" />
      <DoodleOvenMitt className="gdoodle gdoodle-right-2" />
      <DoodleHeart className="gdoodle gdoodle-right-3" />
      <DoodleCroissant className="gdoodle gdoodle-right-4" />
      <DoodleStar className="gdoodle gdoodle-right-5" />
      <DoodleOvenMitt className="gdoodle gdoodle-right-6" />
      <DoodleBow className="gdoodle gdoodle-right-7" />
    </div>
  );
};
