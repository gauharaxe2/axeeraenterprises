import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';

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
        aria-label="Contact us on WhatsApp"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <MessageCircle size={30} fill="#ffffff" color="#25D366" />
      </a>
      {showTooltip && (
        <div className="whatsapp-tooltip">
          Book a Strategy Call / Instant Response
        </div>
      )}
    </>
  );
};
