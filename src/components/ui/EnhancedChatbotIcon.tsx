import React from "react";
import "./chatbot-icon-enhanced.svg";

interface EnhancedChatbotIconProps {
  size?: number;
  className?: string;
  animated?: boolean;
}

export const EnhancedChatbotIcon: React.FC<EnhancedChatbotIconProps> = ({
  size = 64,
  className = "",
  animated = true,
}) => {
  return (
    <div className={`inline-block ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        xmlns="http://www.w3.org/2000/svg"
        className={`transition-all duration-300 ${animated ? "hover:scale-110" : ""}`}
      >
        <defs>
          {/* Holografický gradient pro hlavní prvek */}
          <linearGradient id="hologramGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              style={{ stopColor: "#FFD700", stopOpacity: 0.9 }}
            />
            <stop
              offset="25%"
              style={{ stopColor: "#FFA500", stopOpacity: 0.8 }}
            />
            <stop
              offset="50%"
              style={{ stopColor: "#FF6B35", stopOpacity: 0.9 }}
            />
            <stop
              offset="75%"
              style={{ stopColor: "#F7931E", stopOpacity: 0.8 }}
            />
            <stop
              offset="100%"
              style={{ stopColor: "#FFD700", stopOpacity: 0.9 }}
            />
          </linearGradient>

          {/* Glassmorphism efekt */}
          <filter id="glassmorphism">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 3D stín efekt */}
          <filter id="shadow3d">
            <feDropShadow
              dx="2"
              dy="4"
              stdDeviation="3"
              floodColor="#000000"
              floodOpacity="0.3"
            />
            <feDropShadow
              dx="-1"
              dy="-1"
              stdDeviation="1"
              floodColor="#FFFFFF"
              floodOpacity="0.1"
            />
          </filter>

          {/* Vnitřní záře */}
          <filter id="innerGlow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="SourceGraphic" />
              <feMergeNode in="coloredBlur" />
            </feMerge>
          </filter>
        </defs>

        {/* Hlavní glassmorphism kruh */}
        <circle
          cx="32"
          cy="32"
          r="28"
          fill="url(#hologramGlow)"
          filter="url(#glassmorphism)"
          opacity="0.3"
          stroke="rgba(255,215,0,0.4)"
          strokeWidth="1"
        >
          {animated && (
            <animate
              attributeName="opacity"
              values="0.2;0.4;0.2"
              dur="3s"
              repeatCount="indefinite"
            />
          )}
        </circle>

        {/* Chat bublina - hlavní prvek */}
        <g transform="translate(20, 20)">
          {/* Chat bublina tělo */}
          <ellipse
            cx="12"
            cy="18"
            rx="18"
            ry="12"
            fill="url(#hologramGlow)"
            filter="url(#innerGlow)"
            opacity="0.8"
          />

          {/* Chat bublina špička */}
          <polygon
            points="8,26 12,30 16,26"
            fill="url(#hologramGlow)"
            opacity="0.8"
          />

          {/* Chat bublina vnitřní stín */}
          <ellipse
            cx="12"
            cy="18"
            rx="16"
            ry="10"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="0.5"
          />
        </g>

        {/* Nůžky jako AI/beauty symbol */}
        <g transform="translate(42, 18)" opacity="0.9">
          {/* Horní čepel nůžek */}
          <path
            d="M2,8 L8,2 L9,3 L3,9 Z"
            fill="url(#hologramGlow)"
            filter="url(#shadow3d)"
          />

          {/* Spodní čepel nůžek */}
          <path
            d="M2,10 L8,16 L7,17 L1,11 Z"
            fill="url(#hologramGlow)"
            filter="url(#shadow3d)"
          />

          {/* Šroub nůžek */}
          <circle cx="6" cy="8" r="1" fill="#FFD700" filter="url(#innerGlow)" />
        </g>

        {/* AI oko/indikátor */}
        <g transform="translate(16, 16)">
          {/* Oční duhovka */}
          <circle
            cx="0"
            cy="0"
            r="3"
            fill="radial-gradient(circle at 30% 30%, #FFE4B5, #B8860B)"
            filter="url(#innerGlow)"
          />

          {/* Oční zornička */}
          <circle cx="-0.5" cy="-0.5" r="1.5" fill="#8B4513" opacity="0.8" />

          {/* Oční odlesk */}
          <circle cx="-1" cy="-1" r="0.5" fill="#FFFFFF" opacity="0.6" />
        </g>

        {/* Dekorativní prvky - malé hvězdičky */}
        <g opacity="0.7">
          {/* Hvězdička 1 */}
          <g transform="translate(8, 8)">
            <path
              d="M0,-2 L0.5,-0.5 L2,0 L0.5,0.5 L0,2 L-0.5,0.5 L-2,0 L-0.5,-0.5 Z"
              fill="#FFD700"
              opacity="0.6"
            />
          </g>

          {/* Hvězdička 2 */}
          <g transform="translate(56, 12)">
            <path
              d="M0,-1 L0.3,-0.3 L1,0 L0.3,0.3 L0,1 L-0.3,0.3 L-1,0 L-0.3,-0.3 Z"
              fill="#FFA500"
              opacity="0.5"
            />
          </g>

          {/* Hvězdička 3 */}
          <g transform="translate(12, 52)">
            <path
              d="M0,-1 L0.3,-0.3 L1,0 L0.3,0.3 L0,1 L-0.3,0.3 L-1,0 L-0.3,-0.3 Z"
              fill="#FF6B35"
              opacity="0.4"
            />
          </g>
        </g>

        {/* Pulsující vnější kruh */}
        <circle
          cx="32"
          cy="32"
          r="30"
          fill="none"
          stroke="url(#hologramGlow)"
          strokeWidth="0.5"
          opacity="0.3"
        >
          {animated && (
            <>
              <animate
                attributeName="r"
                values="30;32;30"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.2;0.5;0.2"
                dur="2s"
                repeatCount="indefinite"
              />
            </>
          )}
        </circle>

        {/* Rotující gradient overlay */}
        <circle cx="32" cy="32" r="26" fill="url(#hologramGlow)" opacity="0.1">
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 32 32;360 32 32"
              dur="12s"
              repeatCount="indefinite"
            />
          )}
        </circle>
      </svg>
    </div>
  );
};
