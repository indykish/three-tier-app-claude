
import clsx from 'clsx';
import { IconProvider } from './IconProvider';
import { IconProps, IconSizes, ICON_SIZES } from './types';

// Main Icon component similar to the reference implementation
export function Icon(props: IconProps) {
  const { 
    className, 
    color = 'currentColor', 
    name, 
    size = 'md', 
    variant = 'outlined',
    category,
    ...rest 
  } = props;

  // Resolve size to pixel value
  const resolvedSize = typeof size === 'string' && size in ICON_SIZES 
    ? ICON_SIZES[size as IconSizes] 
    : size;

  if (!name) {
    console.warn('Icon component requires a name prop');
    return null;
  }

  return (
    <span
      className={clsx('icon-container', className, {
        [`icon-${variant}`]: variant,
        [`icon-${category}`]: category,
        [`icon-size-${size}`]: typeof size === 'string' && size in ICON_SIZES,
      })}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: resolvedSize,
        height: resolvedSize,
        color,
      }}
      {...rest}
    >
      <IconProvider
        iconName={name}
        size={resolvedSize}
        color={color}
        className="icon-svg"
      />
    </span>
  );
}

Icon.displayName = 'Icon';

// Export the main Icon component as default
export default Icon;
