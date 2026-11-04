import React, { useState } from 'react';
import { WhatsAppIcon } from './WhatsAppIcon';

interface WhatsAppButtonProps {
  whatsappNumber?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  whatsappNumber = '923157338694'
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const cleanNumber = whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <>
      <a
        href={`https://wa.me/${cleanNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-button"
        aria-label="Contact us on WhatsApp (+92-315-7338694)"
        title="Chat on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <WhatsAppIcon size={34} color="#ffffff" />
      </a>
      {showTooltip && (
        <div className="whatsapp-tooltip">
          Book a Strategy Call / Instant Response
        </div>
      )}
    </>
  );
};

export default WhatsAppButton;
