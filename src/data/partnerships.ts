import { PartnershipItem, PartnerLogo } from '../types';

export const initialPartnerships: PartnershipItem[] = [
  {
    id: 'strategic-partners',
    title: 'Strategic Partners',
    description: 'We work closely with top-tier technology providers to ensure scalable and robust enterprise solutions.',
    icon: 'Handshake'
  },
  {
    id: 'technology-alliances',
    title: 'Technology Alliances',
    description: 'Leveraging cutting-edge cloud infrastructure, APIs, and modern frameworks from our trusted alliances.',
    icon: 'Network'
  },
  {
    id: 'global-network',
    title: 'Global Network',
    description: 'A worldwide network of professionals supporting our mission to drive digital transformation.',
    icon: 'Globe'
  }
];

export const initialPartnerLogos: PartnerLogo[] = [
  {
    id: 'logo-aws',
    name: 'Amazon Web Services',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg',
    websiteUrl: 'https://aws.amazon.com'
  },
  {
    id: 'logo-google',
    name: 'Google Cloud Platform',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg',
    websiteUrl: 'https://cloud.google.com'
  },
  {
    id: 'logo-stripe',
    name: 'Stripe Payments',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg',
    websiteUrl: 'https://stripe.com'
  },
  {
    id: 'logo-microsoft',
    name: 'Microsoft',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
    websiteUrl: 'https://microsoft.com'
  },
  {
    id: 'logo-shopify',
    name: 'Shopify Plus',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Shopify_logo_2018.svg',
    websiteUrl: 'https://shopify.com'
  },
  {
    id: 'logo-cloudflare',
    name: 'Cloudflare',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg',
    websiteUrl: 'https://cloudflare.com'
  },
  {
    id: 'logo-github',
    name: 'GitHub Enterprise',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/GitHub_Invertocat_Logo.svg',
    websiteUrl: 'https://github.com'
  }
];
