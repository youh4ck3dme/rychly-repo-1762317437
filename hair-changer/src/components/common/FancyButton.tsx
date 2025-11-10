
import React, { useRef, useState, useEffect } from 'react';

interface FancyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Can add specific props here if needed, e.g., `variant`
}

const FancyButton: React.FC<FancyButtonProps> = ({ children, onClick, className = '', ...props }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([]);
  const [isActivatingGlow, setIsActivatingGlow] = useState(false);

  const handleInteractionStart = (event: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>) => {
    if (buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      let clientX, clientY;

      if ('touches' in event) { // TouchEvent
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
      } else { // MouseEvent
        clientX = event.clientX;
        clientY = event.clientY;
      }

      const x = clientX - buttonRect.left;
      const y = clientY - buttonRect.top;
      const id = Date.now();
      setRipples((prevRipples) => [...prevRipples, { x, y, id }]);
      setIsActivatingGlow(true);
    }
    onClick?.(event as any); // Pass through the event to the original onClick handler
  };

  const handleInteractionEnd = () => {
    setIsActivatingGlow(false);
  };

  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prevRipples) => prevRipples.slice(1));
      }, 600); // Match ripple-animation duration in styles.css
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  return (
    <button
      ref={buttonRef}
      className={`btn-primary ${className} ${isActivatingGlow ? 'btn-liquid-glow' : ''}`}
      onMouseDown={handleInteractionStart}
      onMouseUp={handleInteractionEnd}
      onMouseLeave={handleInteractionEnd}
      onTouchStart={handleInteractionStart}
      onTouchEnd={handleInteractionEnd}
      {...props}
    >
      <span className="button-content-wrapper">{children}</span> {/* Wrapper for content to ensure stacking */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="ripple-span"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
    </button>
  );
};

export default FancyButton;
