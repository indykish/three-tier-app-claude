
import { BaseIconProps } from '@/utils/iconloader/types';

export default function FolderIcon({ 
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
        d="M10 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2h-8l-2-2z"
        fill={props.fill || color}
      />
    </svg>
  );
}
