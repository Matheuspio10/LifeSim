import React from 'react';

interface CustomizableAvatarProps {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
  hairstyle: string;
  glasses: string;
  headwear: string;
}

const hairstylePaths: Record<string, JSX.Element> = {
    'curto': <path d="M4,8 h16 v-4 h-2 v-1 h-12 v1 h-2 z" />,
    'medio': <><path d="M4,8 h16 v-4 h-2 v-1 h-12 v1 h-2 z" /><path d="M4,9 h2 v2 h-2 z M18,9 h2 v2 h-2 z" /></>,
    'longo': <><path d="M4,8 h16 v-4 h-2 v-1 h-12 v1 h-2 z" /><path d="M4,9 h2 v6 h-2 z M18,9 h2 v6 h-2 z" /></>,
    'coque': <><path d="M4,8 h16 v-2 h-16 z" /><path d="M9,2 h6 v4 h-6 z" /></>,
    'careca': <></>,
    'crespo-curto': <path d="M6,8 C4,4 8,3 12,3 C16,3 20,4 18,8 Z" />,
    'afro-volumoso': <path d="M4,8 Q4,2 12,2 T20,8 V12 H4 Z" />,
    'trancas': <>
      <rect x="4" y="4" width="16" height="4" />
      <rect x="4" y="8" width="2" height="10" />
      <rect x="7" y="8" width="2" height="10" />
      <rect x="10" y="8" width="2" height="10" />
      <rect x="13" y="8" width="2" height="10" />
      <rect x="16" y="8" width="2" height="10" />
      <rect x="19" y="8" width="1" height="10" />
    </>,
    'rabo-de-cavalo': <><path d="M4,8 h16 v-4 h-2 v-1 h-12 v1 h-2 z" /><path d="M18,9 h2 v8 h-2 z" /></>,
    'sidecut': <><path d="M10,8 h10 v-4 h-2 v-1 h-8 z" /><path d="M4,8 h4 v8 h-4z" /></>,
    'topete': <path d="M9,4 C9,1 15,1 15,4 L18,8 H6 Z" />,
};

const glassesPaths: Record<string, JSX.Element> = {
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

const headwearPaths: Record<string, JSX.Element> = {
    'none': <></>,
    'bandana': <rect x="6" y="8" width="12" height="2" fill="#b91c1c" />,
    'beanie': <path d="M5,8 Q12,4 19,8 V6 Q12,2 5,6 Z" fill="#1d4ed8" />,
    'bow': <path d="M16,4 L18,6 L20,4 L18,2 Z" fill="#be185d" />,
};

const CustomizableAvatar: React.FC<CustomizableAvatarProps> = ({
  skinTone,
  hairColor,
  eyeColor,
  hairstyle,
  glasses,
  headwear,
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
      
      {/* Headwear */}
      <g>
        {headwearPaths[headwear]}
      </g>

      {/* Glasses */}
      <g>
        {glassesPaths[glasses]}
      </g>

    </svg>
  );
};

export default CustomizableAvatar;