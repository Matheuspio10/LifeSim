import React from 'react';

interface CustomizableAvatarProps {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  hairstyle: string;
  accessory: string;
}

const hairstylePaths: Record<string, JSX.Element> = {
    'curto': <path d="M4,8 h16 v-4 h-2 v-1 h-12 v1 h-2 z" />,
    'medio': <>
        <path d="M4,8 h16 v-4 h-2 v-1 h-12 v1 h-2 z" />
        <path d="M4,9 h2 v2 h-2 z M18,9 h2 v2 h-2 z" />
    </>,
    'longo': <>
        <path d="M4,8 h16 v-4 h-2 v-1 h-12 v1 h-2 z" />
        <path d="M4,9 h2 v6 h-2 z M18,9 h2 v6 h-2 z" />
    </>,
    'coque': <>
        <path d="M4,8 h16 v-2 h-16 z" />
        <path d="M9,2 h6 v4 h-6 z" />
    </>,
    'careca': <></>
};

const accessoryPaths: Record<string, JSX.Element> = {
    'none': <></>,
    'oculos-redondo': <>
        <path d="M7,12 h4 v2 h-4 z" fill="#111827" />
        <path d="M13,12 h4 v2 h-4 z" fill="#111827" />
        <rect x="11" y="12" width="2" height="1" fill="#111827" />
    </>,
    'oculos-quadrado': <>
        <rect x="7" y="11" width="5" height="3" stroke="#111827" strokeWidth="1" fill="none" />
        <rect x="12" y="11" width="5" height="3" stroke="#111827" strokeWidth="1" fill="none" />
        <rect x="11" y="12" width="2" height="1" fill="#111827" />
    </>,
};

const CustomizableAvatar: React.FC<CustomizableAvatarProps> = ({
  skinTone,
  hairColor,
  eyeColor,
  hairstyle,
  accessory,
}) => {
  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 24 24" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges' }}
      className="transition-transform duration-300 transform group-hover:scale-110"
    >
      {/* Head */}
      <rect x="6" y="6" width="12" height="12" fill={skinTone} />
      
      {/* Hair */}
      <g fill={hairColor}>
        {hairstylePaths[hairstyle]}
      </g>
      
      {/* Eyes */}
      <rect x="8" y="11" width="2" height="2" fill={eyeColor} />
      <rect x="14" y="11" width="2" height="2" fill={eyeColor} />

      {/* Mouth */}
      <rect x="10" y="15" width="4" height="1" fill="#4a2a2a" />
      
      {/* Accessories */}
      <g>
        {accessoryPaths[accessory]}
      </g>

    </svg>
  );
};

export default CustomizableAvatar;
