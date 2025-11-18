import React from 'react';

interface UploadIconProps {
  color: string;
  size?: number;
  className?: string;
}

export const UploadIcon: React.FC<UploadIconProps> = ({ 
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
      d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" 
      fill={color}
    />
    <path 
      d="M12,11L16,15H13V19H11V15H8L12,11Z" 
      fill={color}
    />
  </svg>
);
