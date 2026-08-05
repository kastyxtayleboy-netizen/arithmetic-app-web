import React, { useState } from 'react';
import './Tooltip.css';

const Tooltip = ({ title, content, children, position = 'top', hideIcon = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="tooltip-container"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <div className="tooltip-trigger">
        {children}
        {!hideIcon && <span className="info-icon">?</span>}
      </div>
      
      {isVisible && (
        <div 
          className={`tooltip-content tooltip-content-${position} fade-in`}
          style={{ 
            backgroundColor: '#1A202C', 
            color: '#F3F4F6',
            border: '1px solid rgba(255,255,255,0.1)',
            opacity: 1, 
            boxShadow: '0 10px 25px rgba(0,0,0,0.9)'
          }}
        >
          {title && <h4 style={{ color: '#10B981', marginBottom: '6px' }}>{title}</h4>}
          <p style={{ margin: 0, fontSize: '0.85rem' }}>{content}</p>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
