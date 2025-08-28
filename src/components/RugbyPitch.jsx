import React from 'react';

const RugbyPitch = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 700 1000"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      <g transform="translate(350, 500) rotate(90) translate(-500, -350)">
        {/* Pitch background */}
        <rect width="1000" height="700" fill="#4CAF50" />

        {/* Pitch border */}
        <rect x="5" y="5" width="990" height="690" fill="none" stroke="white" strokeWidth="2" />

        {/* Halfway line */}
        <line x1="500" y1="5" x2="500" y2="695" stroke="white" strokeWidth="2" />

        {/* 22m lines */}
        <line x1="220" y1="5" x2="220" y2="695" stroke="white" strokeWidth="2" />
        <line x1="780" y1="5" x2="780" y2="695" stroke="white" strokeWidth="2" />

        {/* 10m lines (dashed) */}
        <line x1="400" y1="5" x2="400" y2="695" stroke="white" strokeWidth="2" strokeDasharray="10" />
        <line x1="600" y1="5" x2="600" y2="695" stroke="white" strokeWidth="2" strokeDasharray="10" />

        {/* 5m lines (dashed) */}
        <line x1="50" y1="5" x2="50" y2="695" stroke="white" strokeWidth="2" strokeDasharray="5" />
        <line x1="950" y1="5" x2="950" y2="695" stroke="white" strokeWidth="2" strokeDasharray="5" />

        {/* Goalposts */}
        <rect x="45" y="300" width="10" height="100" fill="white" />
        <rect x="945" y="300" width="10" height="100" fill="white" />
      </g>
    </svg>
  );
};

export default RugbyPitch;
