import React, { useEffect, useState, useRef } from 'react';

const AnimatedNumber = ({ value, formatCurrency = true, currency = 'RUB' }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const displayValueRef = useRef(value);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const startValue = displayValueRef.current;
    const endValue = value;
    const duration = 500; // ms
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      const current = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(current);
      displayValueRef.current = current;

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        displayValueRef.current = endValue;
      }
    };

    if (startValue !== endValue) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [value]);

  const formatted = formatCurrency 
    ? new Intl.NumberFormat('ru-RU', { 
        style: 'currency', 
        currency: currency, 
        maximumFractionDigits: 0 
      }).format(Math.round(displayValue))
    : Math.round(displayValue);

  return <span>{formatted}</span>;
};

export default AnimatedNumber;
