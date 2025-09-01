
import React from 'react';
import { LineageCrest } from '../types';
import { ICON_MAP } from '../lineageConstants';

interface LineageCrestDisplayProps {
  crest: LineageCrest;
}

const LineageCrestDisplay: React.FC<LineageCrestDisplayProps> = ({ crest }) => {
  const { icon, color1, color2, shape } = crest;

  const shapeClasses = shape === 'circle' ? 'rounded-full' : 'rounded-lg';
  
  // A simple way to create a pattern from two colors.
  // This creates a diagonal gradient.
  const backgroundStyle = {
    background: `linear-gradient(135deg, ${color1} 50%, ${color2} 50%)`,
  };

  return (
    <div 
        className={`w-16 h-16 p-1 bg-slate-600 shadow-lg ${shapeClasses}`}
        title="Brasão da Família"
    >
        <div 
            className={`w-full h-full flex items-center justify-center ${shapeClasses}`}
            style={backgroundStyle}
        >
            <div className="w-8 h-8 text-white drop-shadow-md">
                {ICON_MAP[icon] || null}
            </div>
        </div>
    </div>
  );
};

export default LineageCrestDisplay;