import React from 'react';

const Slider = ({ value, min, max, step = 1, onChange }) => {
  // Calculate percentage for the custom colored track
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <input 
      type="range" 
      min={min} 
      max={max} 
      step={step}
      value={value} 
      onChange={(e) => onChange(Number(e.target.value))}
      className="interactive-slider"
      style={{
        background: `linear-gradient(to right, var(--accent-color) 0%, var(--accent-color) ${percentage}%, rgba(255, 255, 255, 0.1) ${percentage}%, rgba(255, 255, 255, 0.1) 100%)`
      }}
    />
  );
};

export default Slider;
