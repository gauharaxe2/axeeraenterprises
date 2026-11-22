import React, { useEffect, useState } from 'react';
import { deriveInitials, sanitizeDisplayImageUrl } from '../utils/imageUpload';

interface ClientAvatarProps {
  name: string;
  initials?: string;
  imageUrl?: string;
  className?: string;
  size?: number;
}

export const ClientAvatar: React.FC<ClientAvatarProps> = ({
  name,
  initials,
  imageUrl,
  className = 'avatar-circle',
  size
}) => {
  const safeSrc = sanitizeDisplayImageUrl(imageUrl);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [safeSrc]);

  const showImage = Boolean(safeSrc) && !hasError;
  const fallbackText = deriveInitials(name, initials);

  const customStyle: React.CSSProperties | undefined = size
    ? {
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.max(11, Math.round(size * 0.34))}px`
      }
    : undefined;

  return (
    <span className={className} style={customStyle}>
      {showImage ? (
        <img
          src={safeSrc}
          alt={name || 'Client avatar'}
          onError={() => setHasError(true)}
        />
      ) : (
        <span aria-hidden="true">{fallbackText}</span>
      )}
    </span>
  );
};
