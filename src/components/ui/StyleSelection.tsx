import { useState } from 'react';
import type { ConsultationStyle } from '../../types';
import { STYLE_OPTIONS } from '../../data/styleOptions';

interface StyleSelectionProps {
  selectedStyle?: ConsultationStyle;
  onStyleSelect: (style: ConsultationStyle) => void;
  className?: string;
}

export default function StyleSelection({ selectedStyle, onStyleSelect, className = '' }: StyleSelectionProps) {
  const [hoveredStyle, setHoveredStyle] = useState<ConsultationStyle | null>(null);

  return (
    <div className={`style-selection ${className}`}>
      <div className="style-selection__header">
        <h2 className="style-selection__title">Vyberte si svoj štýl</h2>
        <p className="style-selection__subtitle">
          Zvoľte esenciu vzhľadu, ktorý chcete dosiahnuť.
        </p>
      </div>

      <div className="style-selection__grid">
        {STYLE_OPTIONS.map((option) => (
          <button
            key={option.id}
            className={`style-option ${selectedStyle === option.id ? 'style-option--selected' : ''} ${hoveredStyle === option.id ? 'style-option--hovered' : ''}`}
            onClick={() => onStyleSelect(option.id)}
            onMouseEnter={() => setHoveredStyle(option.id)}
            onMouseLeave={() => setHoveredStyle(null)}
            aria-label={`Vybrať ${option.name} štýl`}
          >
            <div className="style-option__content">
              <div 
                className="style-option__icon"
                style={{ '--accent-color': option.accentColor } as React.CSSProperties}
              >
                <img 
                  src={option.icon} 
                  alt={`${option.name} icon`}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              
              <div className="style-option__text">
                <h3 className="style-option__name">{option.name}</h3>
                <p className="style-option__description">{option.description}</p>
              </div>
            </div>

            <div 
              className="style-option__border"
              style={{ '--accent-color': option.accentColor } as React.CSSProperties}
            />
          </button>
        ))}
      </div>
    </div>
  );
}