import React from 'react';

export interface WhatsAppIconProps {
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * 'white-on-green': Solid white speech bubble outline & telephone handset
   * 'badge': Official WhatsApp badge with green background circle, white speech bubble, and green handset
   * 'flat': Pure monochrome vector (uses fill/color specified)
   */
  variant?: 'white-on-green' | 'badge' | 'flat';
  color?: string;
}

// WhatsApp brand colors
export const WHATSAPP_GREEN = '#25D366';
export const WHATSAPP_TEAL_DARK = '#128C7E';
export const WHATSAPP_DARK_GREEN = '#075E54';

/**
 * Pixel-accurate, authentic WhatsApp brand logo SVG.
 * Sourced from the official Meta/WhatsApp brand guidelines.
 */
export const WhatsAppIcon: React.FC<WhatsAppIconProps> = ({
  size = 32,
  className = '',
  style,
  variant = 'white-on-green',
  color = '#ffffff',
}) => {
  // Pure monochrome or white-on-green vector:
  // Features the iconic WhatsApp speech bubble with bottom-left pointer tail
  // and the diagonally angled telephone handset with rounded receiver ends.
  if (variant === 'badge') {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width={size}
        height={size}
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
        aria-hidden="true"
      >
        <circle cx="24" cy="24" r="24" fill={WHATSAPP_GREEN} />
        <path
          fill="#ffffff"
          d="M24 8.5C15.44 8.5 8.5 15.44 8.5 24c0 2.74.71 5.39 2.07 7.74L8.5 39.5l8.03-2.02c2.26 1.23 4.8 1.88 7.47 1.88 8.56 0 15.5-6.94 15.5-15.5S32.56 8.5 24 8.5z"
        />
        <path
          fill={WHATSAPP_GREEN}
          d="M31.05 28.53c-.39-.2-2.31-1.14-2.67-1.27-.36-.13-.62-.2-.88.2-.26.39-1.01 1.27-1.24 1.53-.23.26-.46.3-.85.1-.39-.2-1.64-.6-3.13-1.93-1.16-1.03-1.94-2.31-2.17-2.7-.23-.39-.02-.6.17-.79.18-.18.39-.46.59-.69.2-.23.26-.39.39-.65.13-.26.07-.49-.03-.69-.1-.2-.88-2.12-1.21-2.91-.32-.77-.64-.67-.88-.68l-.75-.01c-.26 0-.68.1-1.04.49-.36.39-1.37 1.34-1.37 3.27s1.4 3.79 1.6 4.05c.2.26 2.75 4.2 6.66 5.89.93.4 1.66.64 2.22.82.93.3 1.78.26 2.45.16.75-.11 2.31-.94 2.64-1.85.33-.91.33-1.69.23-1.85-.1-.16-.36-.26-.75-.46z"
        />
      </svg>
    );
  }

  // Official WhatsApp vector mark (viewBox 0 0 24 24):
  // Clean single-path mark that works natively across all backgrounds and FABs.
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
};

export default WhatsAppIcon;
