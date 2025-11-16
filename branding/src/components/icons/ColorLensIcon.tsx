import React from 'react';

interface ColorLensIconProps {
  color: string;
  size?: number;
  className?: string;
}

export const ColorLensIcon: React.FC<ColorLensIconProps> = ({ 
  color, 
  size = 24, 
  className = "mr-2" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    className={className}
  >
    <path 
      d="M12,3C16.97,3 21,7.03 21,12C21,13.66 20.33,15.66 19,16.5V17A1,1 0 0,1 18,18H15L14.5,21.5C14.5,21.78 14.22,22 14,22H10C9.78,22 9.5,21.78 9.5,21.5L9,18H6A1,1 0 0,1 5,17V16.5C3.67,15.66 3,13.66 3,12C3,7.03 7.03,3 12,3M7.5,7A1.5,1.5 0 0,0 6,8.5A1.5,1.5 0 0,0 7.5,10A1.5,1.5 0 0,0 9,8.5A1.5,1.5 0 0,0 7.5,7M16.5,7A1.5,1.5 0 0,0 15,8.5A1.5,1.5 0 0,0 16.5,10A1.5,1.5 0 0,0 18,8.5A1.5,1.5 0 0,0 16.5,7M12,13.5A1.5,1.5 0 0,0 10.5,15A1.5,1.5 0 0,0 12,16.5A1.5,1.5 0 0,0 13.5,15A1.5,1.5 0 0,0 12,13.5Z" 
      fill={color}
    />
  </svg>
);
