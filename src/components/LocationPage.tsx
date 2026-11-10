import React, { useEffect } from 'react';
import { Clock, ExternalLink, Mail, MapPin, Navigation, Phone } from 'lucide-react';
import { googleMapsDirectionsUrl, googleMapsEmbedUrl, googleMapsPlaceUrl } from '../utils/maps';
import { SITE_ORIGIN } from '../pageMeta';
import {
  EditorialHero,
  EditorialPage,
  EditorialSection,
  EditorialTopbar,
  openInApp
} from './editorial/Editorial';

interface LocationPageProps {
  address?: string;
  phone?: string;
  email?: string;
  onBackToHome: () => void;
  onContactClick: () => void;
}

function phoneNumbers(display: string): string[] {
  return display
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean);
}

function phoneHref(display: string): string {
  const compact = display.replace(/[^\d+]/g, '');
  return compact ? `tel:${compact}` : 'tel:+923157338694';
}

export const LocationPage: React.FC<LocationPageProps> = ({
  address = 'D-26, Wahdat Colony, Multan, 66000',
  phone = '+92-315-7338694 / +92-339-0096853',
  email = 'gauharaxe@outlook.com',
  onBackToHome,
  onContactClick
}) => {
  const numbers = phoneNumbers(phone);
  const embedUrl = googleMapsEmbedUrl(address);
  const placeUrl = googleMapsPlaceUrl(address);
  const directionsUrl = googleMapsDirectionsUrl(address);

  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'location-jsonld';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'ProfessionalService',
      name: "Axe's Era Enterprise",
      url: `${SITE_ORIGIN}/location`,
      email,
      telephone: phone.split('/')[0]?.trim() || phone,
      address: {
        '@type': 'PostalAddress',
        streetAddress: address,
        addressCountry: 'PK'
      }
    });
    document.head.appendChild(script);
    return () => {
      script.remove();
    };
  }, [address, email, phone]);

  return (
    <EditorialPage page="location">
      <EditorialTopbar
        crumb="Location"
        onBack={onBackToHome}
        action={
          <a
            href={directionsUrl}
            className="btn btn-primary editorial-top-action"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Navigation size={16} aria-hidden="true" /> Get directions
          </a>
        }
      />

      <EditorialHero
        eyebrow="Headquarters"
        title="Find Axe's Era Enterprise in Multan"
        description="The studio headquarters is D-26, Wahdat Colony, Multan. Google Maps below is pinned on that neighborhood."
      />

      <EditorialSection id="studio-map">
        <div className="location-layout">
          <div className="editorial-panel location-map-frame">
            <iframe
              className="location-map"
              title={`Google Maps pin for Axe's Era Enterprise at ${address}`}
              src={embedUrl}
              loading="eager"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="editorial-stack">
            <article className="editorial-panel padded">
              <h2>Pinned address</h2>
              <div className="contact-item" style={{ marginTop: '1rem' }}>
                <div className="contact-icon">
                  <MapPin size={22} aria-hidden="true" />
                </div>
                <div className="contact-text">
                  <h3>Office</h3>
                  <p>{address}</p>
                  <p>Registered headquarters, Pakistan</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Phone size={22} aria-hidden="true" />
                </div>
                <div className="contact-text">
                  <h3>Phone</h3>
                  <p>
                    {numbers.map((number, index) => (
                      <React.Fragment key={number}>
                        {index > 0 ? ' / ' : ''}
                        <a href={phoneHref(number)}>{number}</a>
                      </React.Fragment>
                    ))}
                  </p>
                  <p>Mon–Sat: 9:00 AM – 7:00 PM PKT</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Mail size={22} aria-hidden="true" />
                </div>
                <div className="contact-text">
                  <h3>Email</h3>
                  <p>
                    <a href={`mailto:${email}`}>{email}</a>
                  </p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <Clock size={22} aria-hidden="true" />
                </div>
                <div className="contact-text">
                  <h3>Hours</h3>
                  <p>Headquarters operating hours: 09:00 - 19:00 (PKT).</p>
                </div>
              </div>
            </article>

            <div className="editorial-cta-actions" style={{ justifyContent: 'flex-start' }}>
              <a className="btn btn-primary" href={placeUrl} target="_blank" rel="noopener noreferrer">
                Open in Google Maps <ExternalLink size={16} aria-hidden="true" />
              </a>
              <a className="btn btn-outline" href={directionsUrl} target="_blank" rel="noopener noreferrer">
                <Navigation size={16} aria-hidden="true" /> Directions
              </a>
              <a href="/contact" className="btn btn-outline" onClick={(event) => openInApp(event, onContactClick)}>
                Contact the studio
              </a>
            </div>
          </div>
        </div>
      </EditorialSection>
    </EditorialPage>
  );
};
