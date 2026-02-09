
import React from 'react';

export const AnimatedLogoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => {
  const strokeLength = 220; // Approximate length of the path

  const pathStyle = {
    strokeDasharray: strokeLength,
    strokeDashoffset: strokeLength,
    animation: `draw-stroke 1.5s 0.2s ease-in-out forwards`,
  };

  const fillStyleHat = {
    animation: `fill-in 0.5s 1.7s forwards`,
  };

  const fillStylePlay = {
    color: '#f43f5e', // text-rose-500
    animation: `fill-in 0.5s 1.7s forwards`,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      stroke="white"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <g style={fillStyleHat}>
        <path
          style={pathStyle}
          fill="transparent"
          d="M19.8 12.7c.1-.4.2-.8.2-1.2 0-3.5-2.6-6.5-6-6.5s-6 3-6 6.5c0 .4.1.8.2 1.2 M12 13V2 M12 2a2.5 2.5 0 0 1 2.5 2.5V7 M12 2a2.5 2.5 0 0 0-2.5 2.5V7"
        />
      </g>
      <g>
        <path
          style={{...pathStyle, stroke: '#f43f5e'}}
          fill="transparent"
          d="M10 9l5 3-5 3V9z" // Play button
        />
        <path
          style={pathStyle}
          fill="transparent"
          d="M16 16H8a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2z" // Hat band
        />
         <path
          style={{ ...fillStylePlay, animationDelay: '1.7s'}}
          fill="transparent"
          stroke="none"
          d="M10 9l5 3-5 3V9z"
        />
      </g>
    </svg>
  );
};
