import { Project } from '../types';

export const projectsData: Project[] = [
  {
    id: 'global-trade-hub',
    slug: 'global-trade-hub',
    title: 'Global Trade Hub',
    subtitle: 'Modern B2B E-commerce Platform',
    category: 'ecommerce',
    projectType: 'case-study',
    status: 'live',
    featured: true,
    metric: '+150% Online Sales',
    link: 'https://globaltrade-hub.pages.dev/',
    imageUrl: 'https://i.postimg.cc/y3VDMzvZ/Screenshot-20260803-063256-2.jpg',
    description: 'Full-featured online store with inventory management, payment processing, and customer analytics.',
    clientName: 'Global Trade Hub International',
    industry: 'B2B Wholesale & Cross-Border Trade',
    timeline: '6 Weeks',
    role: 'Full-Stack Architecture, Catalog Engineering & Checkout Optimization',
    pricingModel: 'Bespoke Enterprise Client Deployment',
    overview:
      'Global Trade Hub was engineered to modernize bulk commercial ordering for regional and international suppliers. Visitors can browse multi-tier catalogs, inspect wholesale pricing breaks, manage cart quotations, and settle invoices securely at edge speed.',
    challenge:
      'Legacy supplier spreadsheets and slow multi-page portals caused cart abandonment above 60% and forced sales reps to reconcile bulk inventory counts manually over email and WhatsApp.',
    solution:
      'We designed a lightweight React commerce storefront backed by automated SKU inventory tracking, instant category filtering, streamlined checkout flows, and customer order analytics deployed on Cloudflare Pages.',
    keyFeatures: [
      'Real-time B2B catalog search and dynamic category filtering',
      'Automated stock level indicators and bulk order summaries',
      'Integrated multi-method payment gateway workflow',
      'Customer order analytics and conversion event telemetry'
    ],
    deliverables: [
      'Responsive B2B E-Commerce Web Application',
      'Inventory & Pricing Rules Engine',
      'Cloudflare Global Edge Deployment & SSL Setup'
    ],
    outcomes: [
      { value: '+150%', label: 'Online Sales Growth' },
      { value: '< 1.1s', label: 'First Contentful Paint' },
      { value: '99.9%', label: 'Edge Storefront Uptime' }
    ],
    architectureHighlights: [
      'Edge-first bundle splitting and compressed asset pipeline',
      'Modular product catalog state with instant client-side search',
      'Conversion-tested checkout flow reducing form friction'
    ],
    tags: ['React', 'E-commerce', 'Payment Gateway', 'B2B Portal']
  },
  {
    id: 'global-softwares-marketplace',
    slug: 'global-softwares-marketplace',
    title: 'Global Softwares Marketplace',
    subtitle: 'Premium software solutions marketplace',
    category: 'web',
    projectType: 'digital-product',
    status: 'live',
    featured: true,
    metric: '10k+ Active Users',
    link: 'https://webapp-a76.pages.dev',
    imageUrl: 'https://i.postimg.cc/64NrTSzC/Picsart-26-08-06-06-30-24-170.jpg',
    description: 'A multi-vendor marketplace connecting enterprise software vendors with global business buyers.',
    clientName: "Axe's Era Digital Products",
    industry: 'B2B SaaS & Software Distribution',
    timeline: '8 Weeks',
    role: 'Digital Product Strategy, Multi-Vendor Marketplace Architecture & UI',
    pricingModel: 'Marketplace Platform / SaaS Licensing',
    overview:
      'Global Softwares Marketplace is a curated digital product exchange built to bridge independent software creators and enterprise procurement teams. Organizations discover vetted tools, compare licensing models, and initiate onboarding in minutes.',
    challenge:
      'Independent software vendors struggled to build buyer trust on fragmented directories, while corporate buyers lacked standardized feature comparisons and verified deployment links.',
    solution:
      'Created a unified multi-vendor discovery platform featuring structured product taxonomy, instant vendor spotlight cards, buyer verification workflows, and global CDN hosting.',
    keyFeatures: [
      'Curated multi-vendor software catalog with category taxonomy',
      'Vendor storefront profiles with licensing and capability highlights',
      'Fast client-side search across SaaS, utilities, and enterprise tools',
      'Mobile-responsive discovery experience built on Cloudflare Edge'
    ],
    deliverables: [
      'Multi-Vendor Marketplace Frontend & Routing',
      'Vendor Listing Schema & Discovery UX',
      'Cloud Hosting & Global Performance Tuning'
    ],
    outcomes: [
      { value: '10k+', label: 'Active Monthly Users' },
      { value: '3.4x', label: 'Faster Software Discovery' },
      { value: '96', label: 'Performance Score' }
    ],
    architectureHighlights: [
      'Taxonomy-driven filtering with instant state updates',
      'Global Cloudflare Pages deployment for zero cold starts',
      'Clean separation of marketplace catalog data and UI views'
    ],
    tags: ['Marketplace', 'SaaS', 'Cloud Hosting', 'Digital Product']
  },
  {
    id: 'shopaxe-web-store',
    slug: 'shopaxe-web-store',
    title: 'Shopaxe Web Store',
    subtitle: 'Custom E-commerce Web Store',
    category: 'ecommerce',
    projectType: 'case-study',
    status: 'live',
    featured: false,
    metric: '3x Conversion Rate',
    link: 'https://shopaxe.netlify.app',
    imageUrl: 'https://i.postimg.cc/21Y4B0tC/Screenshot-20260817-091842-(1).jpg',
    description: 'Custom headless storefront engineered for ultra-fast checkout and mobile conversion.',
    clientName: 'Shopaxe Retail Flagship',
    industry: 'Direct-to-Consumer (D2C) Retail',
    timeline: '4 Weeks',
    role: 'Headless Storefront Engineering & Mobile CRO',
    pricingModel: 'Custom Headless Storefront Build',
    overview:
      'Shopaxe Web Store demonstrates our custom headless commerce architecture designed specifically for mobile-first shoppers. Every screen minimizes tap depth from landing hero to confirmed cart checkout.',
    challenge:
      'Generic template stores suffered from bloated scripts and sluggish mobile product transitions, hurting paid social ad ROAS.',
    solution:
      'Replaced heavy monolithic themes with a clean, custom-crafted storefront featuring persistent slide-out cart state, crisp product photography framing, and thumb-friendly mobile navigation.',
    keyFeatures: [
      'Zero-lag product browsing and instant variant selection',
      'Persistent slide-over shopping bag and rapid checkout summary',
      'Mobile-ergonomic product cards and trust badges',
      'Optimized hero merchandising for seasonal collections'
    ],
    deliverables: [
      'Custom Headless E-Commerce UI',
      'Interactive Cart & Checkout Funnel',
      'Mobile Conversion & Speed Audit'
    ],
    outcomes: [
      { value: '3x', label: 'Checkout Conversion Lift' },
      { value: '68%', label: 'Mobile Traffic Share' },
      { value: '< 1s', label: 'Interactive Load Time' }
    ],
    architectureHighlights: [
      'Lightweight DOM and minimal CSS payload',
      'Tailored visual hierarchy emphasizing product CTAs',
      'Cross-browser mobile responsiveness'
    ],
    tags: ['E-Commerce', 'Hosting', 'Tailored UI', 'Headless']
  },
  {
    id: 'shopaxe-shopify-store',
    slug: 'shopaxe-shopify-store',
    title: 'Shopaxe Web Store (Shopify)',
    subtitle: 'Shopify E-commerce Web Store',
    category: 'ecommerce',
    projectType: 'case-study',
    status: 'live',
    featured: true,
    metric: '3x Conversion Rate',
    link: 'https://shopaxe.store',
    imageUrl: 'https://i.postimg.cc/15mfc9vd/Gemini-Generated-Image-829szp829szp829s.jpg',
    description: 'Engineered on Shopify with custom Liquid templating, dynamic checkout flows, and automated inventory sync.',
    clientName: 'Shopaxe Store Production',
    industry: 'Omnichannel E-Commerce',
    timeline: '5 Weeks',
    role: 'Shopify Liquid Customization, Checkout UX & Inventory Automation',
    pricingModel: 'Shopify Enterprise Implementation',
    overview:
      'Built on Shopify for omnichannel scale, Shopaxe.store pairs Obsidian-and-Gold brand authority with custom Liquid sections, dynamic upsells, and automated warehouse inventory synchronization.',
    challenge:
      'Merchandising teams needed full visual control over promotional collections and dynamic shipping thresholds without risking theme breakage or app-bloat slowdowns.',
    solution:
      'Developed bespoke Shopify Liquid templates, modular schema sections for effortless store admin updates, and streamlined one-click dynamic checkout integration.',
    keyFeatures: [
      'Custom modular Shopify Liquid sections and collection grids',
      'Dynamic cart drawer with automated free-shipping progress cues',
      'Multi-channel inventory synchronization and webhook automation',
      'Structured SEO product schema and social OpenGraph tags'
    ],
    deliverables: [
      'Bespoke Shopify Liquid Theme Architecture',
      'Custom Product & Collection Merchandising',
      'Payment Gateway & Shipping Rule Configuration'
    ],
    outcomes: [
      { value: '3x', label: 'Conversion Velocity' },
      { value: '+42%', label: 'Average Order Value' },
      { value: '100%', label: 'Automated Inventory Sync' }
    ],
    architectureHighlights: [
      'Clean Liquid templating without heavy third-party script bloat',
      'Theme editor schema controls for non-technical store operators',
      'SEO-friendly canonical URLs and rich product snippets'
    ],
    tags: ['Shopify', 'Liquid', 'Conversion Rate Optimization']
  },
  {
    id: 'saas-dashboard',
    slug: 'saas-dashboard',
    title: 'SaaS Dashboard',
    subtitle: 'Analytics and Management Platform',
    category: 'saas',
    projectType: 'digital-product',
    status: 'live',
    featured: true,
    metric: '-40% Churn Rate',
    link: 'https://saasdashboard.ai.studio',
    imageUrl: 'https://i.postimg.cc/Ty8Bmv6y/Screenshot-20260817-091530.jpg',
    description: 'Real-time business analytics platform with responsive data visualization and automated team reporting capabilities.',
    clientName: "Axe's Era SaaS Suite",
    industry: 'B2B Analytics & Operations SaaS',
    timeline: '7 Weeks',
    role: 'Product Design, Real-Time Telemetry UX & Multi-Tenant Architecture',
    pricingModel: 'SaaS Subscription / White-Label License',
    overview:
      'Our flagship SaaS Dashboard digital product equips leadership and customer success teams with unified cohort health indicators, revenue analytics, and automated executive reporting in a single workspace.',
    challenge:
      'SaaS operators relied on disconnected spreadsheets and delayed weekly exports to spot at-risk accounts, leading to preventable subscription churn.',
    solution:
      'Built a real-time management cockpit with interactive KPI visualizations, role-based workspace controls, and automated scheduled stakeholder reports.',
    keyFeatures: [
      'Real-time MRR, cohort retention, and churn warning indicators',
      'Interactive responsive data visualizations across desktop & tablet',
      'Role-based workspace gates and executive summary exports',
      'Configurable alert thresholds for customer success teams'
    ],
    deliverables: [
      'Multi-Screen SaaS Analytics Web Application',
      'Modular Charting & KPI Component System',
      'Automated Team Reporting Workflows'
    ],
    outcomes: [
      { value: '-40%', label: 'Customer Churn Reduction' },
      { value: '5 hrs/wk', label: 'Reporting Time Saved' },
      { value: '99.95%', label: 'Platform Availability' }
    ],
    architectureHighlights: [
      'Reactive state synchronization for live dashboard widgets',
      'Accessible keyboard-friendly tables and high-contrast themes',
      'White-label ready modular component system'
    ],
    tags: ['Analytics', 'Real-time', 'Data Visualization', 'SaaS']
  },
  {
    id: 'estate-crm',
    slug: 'estate-crm',
    title: 'EstateCRM Platform',
    subtitle: 'Real Estate CRM & Operating System',
    category: 'saas',
    projectType: 'digital-product',
    status: 'live',
    featured: true,
    metric: '+240% Pipeline Velocity',
    link: 'https://real-estate-crm-ps3u.vercel.app/',
    imageUrl: '/images/estate-crm.png',
    description: 'All-in-one real estate CRM and business operating system engineered for brokerages and top-producing agents. Features lead capture pipelines, deal tracking, task workflows, and comprehensive analytics.',
    clientName: "Axe's Era Digital Products",
    industry: 'PropTech & Real Estate Brokerages',
    timeline: '10 Weeks',
    role: 'End-to-End Product Architecture, Next.js Engineering & Workflow Design',
    pricingModel: 'Per-Seat SaaS / Brokerage Enterprise License',
    overview:
      'EstateCRM Platform is an end-to-end real estate operating system crafted for modern brokerages and high-volume sales teams. It centralizes property inquiries, buyer qualification pipelines, agent task assignments, and commission forecasting under one roof.',
    challenge:
      'Brokerages lost qualified leads between WhatsApp chats, listing portals, and static spreadsheets with zero visibility into deal stages or follow-up accountability.',
    solution:
      'Engineered on Next.js with structured pipeline stages, instant lead assignment rules, daily agent action queues, and executive brokerage analytics deployed globally on Vercel.',
    keyFeatures: [
      'Visual drag-and-track buyer & seller deal pipelines',
      'Instant lead capture intake with automated follow-up tasks',
      'Agent productivity dashboards and commission projections',
      'Property portfolio directory with status tracking'
    ],
    deliverables: [
      'Full-Stack Next.js CRM Operating System',
      'Pipeline Analytics & Task Automation Engine',
      'Vercel Global Production Deployment'
    ],
    outcomes: [
      { value: '+240%', label: 'Deal Pipeline Velocity' },
      { value: '0', label: 'Dropped Inbound Leads' },
      { value: '4.9/5', label: 'Agent Adoption Rating' }
    ],
    architectureHighlights: [
      'Next.js App Router with fast optimistic UI interactions',
      'Normalized CRM domain model for contacts, deals, and tasks',
      'Responsive tablet & mobile field-agent workspace'
    ],
    tags: ['Real Estate', 'CRM', 'Next.js', 'Pipeline Analytics', 'SaaS']
  }
];
