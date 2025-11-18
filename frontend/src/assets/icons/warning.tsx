
import { BaseIconProps } from '@/utils/iconloader/types';

export default function WarningIcon({ 
  className = '', 
  color = 'currentColor', 
  size = '24px',
  ...props 
}: BaseIconProps) {
  return (
    <svg
      className={className}
      width={props.width || size}
      height={props.height || size}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
        fill={props.fill || color}
      />
    </svg>
  );
}
