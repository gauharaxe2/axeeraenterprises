import { PolicyType } from '../types';

export interface PolicySection {
  id: string;
  title: string;
  paragraphs: string[];
  listItems?: string[];
  subsections?: {
    subtitle: string;
    content: string[];
  }[];
}

export interface PolicyDocument {
  id: PolicyType;
  title: string;
  badge: string;
  summary: string;
  lastUpdated: string;
  effectiveDate: string;
  sections: PolicySection[];
}

export const POLICIES_DATA: Record<PolicyType, PolicyDocument> = {
  'legal-notice': {
    id: 'legal-notice',
    title: 'Legal Notice (Impressum)',
    badge: 'Enterprise Identity & Disclosure',
    summary:
      'Official enterprise identification, regulatory disclosures, intellectual property rights, and liability limitations for Axe\'s Era Enterprise.',
    lastUpdated: 'March 2026',
    effectiveDate: 'January 1, 2024',
    sections: [
      {
        id: 'enterprise-identity',
        title: '1. Enterprise Identification & Ownership',
        paragraphs: [
          'This web platform and all associated digital products and client portals are owned and operated by Axe\'s Era Enterprise, a premier digital architecture agency.',
          'The agency operates under the visionary leadership and technical direction of its Founder & Principal Architect, Gauhar Axe (legal name: Gauhar Nadeem).'
        ],
        listItems: [
          'Enterprise Name: Axe\'s Era Enterprise',
          'Founder & CEO: Gauhar Axe (Gauhar Nadeem)',
          'Headquarters / Principal Address: D-26, Wahdat Colony, Multan, Punjab, 66000, Pakistan',
          'Primary Official Inquiries: gauharaxe@outlook.com',
          'Direct Phone Numbers: +92-315-7338694 / +92-339-0096853',
          'Direct Instant Messaging: WhatsApp Business (+92-315-7338694)',
          'Primary Portfolio Repositories & Profiles: GitHub, Upwork Enterprise, LinkedIn, X (@gauharaxe)'
        ]
      },
      {
        id: 'scope-of-activities',
        title: '2. Professional Scope of Activities',
        paragraphs: [
          'Axe\'s Era Enterprise provides high-end digital services to global companies, startups, and institutions, including but not limited to:',
          '• Full-Stack Custom Web Architecture (React, TypeScript, Next.js, Cloud Edge Hosting)\n• Native and Cross-Platform Mobile Applications (iOS, Android, React Native, Flutter)\n• Enterprise SaaS Dashboards and Real-Time Business Analytics Platforms\n• Brand Identity, Visual Design Systems, and Conversion-Rate Engineered Interfaces\n• Technical Search Engine Optimization (SEO) & Performance Engineering\n• Multi-Channel Digital Marketing & Growth Acceleration Consulting.'
        ]
      },
      {
        id: 'intellectual-property',
        title: '3. Intellectual Property Rights & Copyright',
        paragraphs: [
          'All contents published on this site—including but not limited to software code, architecture blueprints, text copy, graphic assets, interface components, logo marks, icons, and audio/visual materials—are the exclusive intellectual property of Axe\'s Era Enterprise and Gauhar Axe, unless otherwise explicitly noted.',
          'Any reproduction, distribution, modification, public display, or extraction of code or assets without prior explicit written authorization from Axe\'s Era Enterprise is strictly prohibited under international copyright treaties, trademark conventions, and intellectual property statutes.'
        ]
      },
      {
        id: 'liability-limitation',
        title: '4. Limitation of Liability for Digital Content',
        paragraphs: [
          'While Axe\'s Era Enterprise takes extreme care to ensure the accuracy, completeness, and continuous security of the information and software presented, all information is provided on an "as is" and "as available" basis without express or implied warranties of any kind.',
          'Axe\'s Era Enterprise shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from downtime, server latency, third-party software updates, or reliance upon the informational content presented on this website.'
        ]
      },
      {
        id: 'external-links',
        title: '5. External Links & Third-Party Platforms',
        paragraphs: [
          'Our website and case study demonstrations contain links to third-party web platforms (including cloud hosts like AWS, Google Cloud, Cloudflare, Netlify, Stripe Payments, Shopify, and social networks).',
          'Axe\'s Era Enterprise maintains no operational control over external websites and disclaims any responsibility for their content, availability, privacy practices, or commercial terms.'
        ]
      },
      {
        id: 'dispute-resolution',
        title: '6. Applicable Law & Good-Faith Dispute Resolution',
        paragraphs: [
          'Any legal inquiries, copyright claims, or disputes arising out of the use of Axe\'s Era Enterprise services or web content shall first be submitted in good faith directly to our legal contact at gauharaxe@outlook.com for amicable resolution prior to formal proceedings.',
          'Unless statutory laws prescribe otherwise, the governing law shall be the laws applicable in Multan, Punjab, Pakistan, along with internationally accepted commercial arbitration standards.'
        ]
      }
    ]
  },
  'privacy-policy': {
    id: 'privacy-policy',
    title: 'Privacy Policy',
    badge: 'Data Protection & Transparency',
    summary:
      'How Axe\'s Era Enterprise collects, protects, processes, and respects your personal information in compliance with GDPR, CCPA, and international privacy standards.',
    lastUpdated: 'March 2026',
    effectiveDate: 'January 1, 2024',
    sections: [
      {
        id: 'privacy-commitment',
        title: '1. Our Fundamental Commitment to Privacy',
        paragraphs: [
          'At Axe\'s Era Enterprise, your privacy is paramount. We treat client data, communication logs, and project specifications with the highest level of confidentiality and operational security.',
          'We do not sell, rent, lease, or trade personal data to third-party data brokers, marketing agencies, or unauthorized networks under any circumstances.'
        ]
      },
      {
        id: 'data-controller',
        title: '2. Data Controller Information',
        paragraphs: [
          'The Data Controller responsible for the processing of your personal data on this platform is:',
          'Axe\'s Era Enterprise\nAttention: Data Protection & Legal Compliance\nFounder: Gauhar Axe (Gauhar Nadeem)\nEmail: gauharaxe@outlook.com\nAddress: D-26, Wahdat Colony, Multan, Punjab, 66000, Pakistan'
        ]
      },
      {
        id: 'data-collection',
        title: '3. Categories of Information We Collect',
        paragraphs: [
          'We collect only the minimum necessary data required to deliver exceptional design, development, and consultation services:'
        ],
        listItems: [
          'Inquiry & Consultation Information: Your name, email address, company name, requested service tier, and project specifications submitted via our contact forms.',
          'Direct Communication Records: Email correspondence, messages sent to our official WhatsApp support lines (+92-315-7338694), and call notes.',
          'Technical & Usage Telemetry: Anonymized diagnostic logs, browser family, viewport resolution, device category, and referral sources to optimize performance.',
          'Client Project Assets: Brand guides, credentials, repository access, and content provided voluntarily under Non-Disclosure Agreements (NDA).'
        ]
      },
      {
        id: 'purpose-of-processing',
        title: '4. Legal Bases & Purposes for Data Processing',
        paragraphs: [
          'We process your data strictly on the following lawful bases under GDPR Article 6:',
          '• Contractual Necessity: To generate customized proposals, execute client agreements, architect digital products, and fulfill Statements of Work (SOW).\n• Legitimate Business Interests: To protect platform security, prevent fraudulent submissions, and enhance website responsiveness.\n• Legal Compliance: To maintain accurate business accounting, tax records, and regulatory disclosures.'
        ]
      },
      {
        id: 'sub-processors',
        title: '5. Trusted Infrastructure Partners & Sub-Processors',
        paragraphs: [
          'To ensure 99.9% uptime and enterprise-grade security, we partner with world-class cloud infrastructure providers that adhere to ISO/IEC 27001, SOC 2, and GDPR standards:'
        ],
        listItems: [
          'Amazon Web Services (AWS) & Google Cloud Platform: Secure cloud computing and database hosting.',
          'Cloudflare: DDoS mitigation, global edge caching, and SSL/TLS 1.3 encryption.',
          'Stripe Payments & Shopify Plus: PCI-DSS Level 1 compliant payment processing (Axe\'s Era never stores raw credit card numbers).',
          'GitHub Enterprise: Encrypted version control and private client code repositories.'
        ]
      },
      {
        id: 'cookies-policy',
        title: '6. Cookies & Client-Side Local Storage',
        paragraphs: [
          'We maintain a strict anti-tracking cookie policy. We only utilize:',
          '• Strictly Necessary Session Storage: To remember user interface preferences, session authentication states, and security tokens for authorized admin access.\n• Performance Caching: To store static vector assets and styles locally to accelerate page load times.',
          'We do not employ third-party cross-site behavioral tracking beacons or invasive fingerprinting scripts.'
        ]
      },
      {
        id: 'user-rights',
        title: '7. Your Global Privacy Rights (GDPR & CCPA)',
        paragraphs: [
          'Regardless of your geographic location, Axe\'s Era Enterprise extends comprehensive privacy rights to all visitors and clients:'
        ],
        listItems: [
          'Right to Access: You may request a complete copy of any personal information we hold concerning you.',
          'Right to Rectification: You may request immediate correction of inaccurate or incomplete records.',
          'Right to Erasure ("Right to Be Forgotten"): You may request full deletion of your contact records and consultation notes, subject to statutory accounting retention laws.',
          'Right to Restrict or Object: You may restrict the processing of your data or revoke prior consents at any time.',
          'Right to Data Portability: You may request your project specifications and data in a structured, machine-readable JSON format.'
        ]
      },
      {
        id: 'retention-security',
        title: '8. Data Retention & Rigorous Security Measures',
        paragraphs: [
          'We retain client inquiry records only for as long as necessary to facilitate ongoing business relationships or fulfill statutory audit requirements. Stored data is safeguarded with robust physical, electronic, and procedural barriers, including end-to-end encryption in transit (TLS 1.3) and restricted, key-based developer authentication.'
        ]
      },
      {
        id: 'contact-privacy',
        title: '9. How to Exercise Your Privacy Rights',
        paragraphs: [
          'To exercise any privacy right or submit a data inquiry, please write directly to Gauhar Axe at gauharaxe@outlook.com with the subject line "Data Privacy Request". We respond promptly within 48 business hours without fees.'
        ]
      }
    ]
  },
  'terms-of-service': {
    id: 'terms-of-service',
    title: 'Terms of Service',
    badge: 'Client Engagement & Agreement',
    summary:
      'Standard terms, project delivery milestones, intellectual property transfers, warranty periods, and commercial covenants governing Axe\'s Era Enterprise services.',
    lastUpdated: 'March 2026',
    effectiveDate: 'January 1, 2024',
    sections: [
      {
        id: 'agreement-scope',
        title: '1. Agreement & Acceptance of Terms',
        paragraphs: [
          'These Terms of Service ("Terms") constitute a legally binding agreement between you (the "Client", "Partner", or "User") and Axe\'s Era Enterprise ("Agency", "We", "Us"), founded by Gauhar Axe (Gauhar Nadeem).',
          'By accessing this website, requesting a project proposal, commissioning digital services, or executing a Statement of Work (SOW), you agree to be bound by these Terms in full.'
        ]
      },
      {
        id: 'services-deliverables',
        title: '2. Engagement Process & Statements of Work',
        paragraphs: [
          'All bespoke development and design engagements are governed by an agreed-upon Statement of Work (SOW), proposal document, or project milestones schedule.',
          'The SOW specifies technical deliverables, target milestones, revision parameters, approved technologies, and commercial pricing. Any modifications to the agreed project scope during development must be agreed upon in writing via an authorized Change Order.'
        ]
      },
      {
        id: 'client-obligations',
        title: '3. Client Obligations & Cooperation',
        paragraphs: [
          'Timely and successful execution depends upon active collaboration. The Client agrees to:'
        ],
        listItems: [
          'Provide necessary brand assets, copywriting, API keys, third-party credentials, and domain DNS access in a timely manner.',
          'Designate an authorized representative with the authority to approve milestone deliverables.',
          'Provide structured, actionable feedback within the review window specified in the SOW (typically within 3–5 business days).'
        ]
      },
      {
        id: 'payment-invoicing',
        title: '4. Commercial Fees, Deposits & Invoicing Terms',
        paragraphs: [
          'Unless otherwise specified in a custom agreement, agency services follow milestone-based billing:',
          '• Project Kickoff Deposit: Typically 30% to 50% due prior to commencement of architectural sprints.\n• Milestone Progress Invoices: Due upon presentation and review of defined functional deliverables.\n• Final Balance: Due prior to production deployment, domain transfer, or final source code repository release.',
          'Invoices are payable within 7 calendar days of issuance via approved channels (Stripe, direct bank wire, or verified freelance platform escrow such as Upwork Enterprise).'
        ]
      },
      {
        id: 'ip-ownership',
        title: '5. Intellectual Property & Code Ownership Transfer',
        paragraphs: [
          'Upon full settlement of all project invoices, Axe\'s Era Enterprise grants and transfers to the Client complete, unrestricted proprietary ownership of the bespoke source code, custom layouts, and final digital assets created specifically for the project.',
          'Axe\'s Era Enterprise retains ownership of proprietary agency starter kits, reusable libraries, and open-source tooling incorporated into the build. The Client receives a perpetual, royalty-free, worldwide license to utilize and modify such underlying components.',
          'Unless explicitly prohibited by a signed Non-Disclosure Agreement (NDA), Axe\'s Era Enterprise reserves the right to showcase the completed work, public URLs, and screenshots in its marketing portfolio, case studies, and client success stories.'
        ]
      },
      {
        id: 'revisions-warranty',
        title: '6. Revision Cycles & Post-Launch Warranty Period',
        paragraphs: [
          'Every standard contract includes up to two (2) consolidated rounds of aesthetic and functional revisions per milestone to ensure alignment with design specifications.',
          'Axe\'s Era Enterprise provides a complementary 30-day Post-Launch Warranty for all custom platforms, covering the identification and resolution of any software bugs, broken links, or performance anomalies arising directly from the delivered scope.',
          'The warranty does not cover issues caused by third-party hosting outages, unauthorized client code modifications, or subsequent browser/API breaking changes.'
        ]
      },
      {
        id: 'confidentiality-nda',
        title: '7. Mutual Confidentiality & Trade Secrets',
        paragraphs: [
          'Both parties agree to protect and maintain the strict confidentiality of proprietary information, trade secrets, customer databases, technical architectures, and unpublished financial data disclosed during the engagement.',
          'Confidentiality obligations survive the termination or completion of the project for a period of three (3) years.'
        ]
      },
      {
        id: 'termination-clauses',
        title: '8. Termination & Cancellation Procedures',
        paragraphs: [
          'Either party may terminate an engagement for convenience by providing fourteen (14) days written notice. In the event of termination, the Client shall pay Axe\'s Era Enterprise for all completed milestones and prorated hours accrued up to the effective termination date.',
          'Upon receipt of prorated payment, Axe\'s Era Enterprise will deliver all completed work files and assets in their current stage of completion.'
        ]
      },
      {
        id: 'limitation-liability-terms',
        title: '9. Warranties & Limitation of Total Liability',
        paragraphs: [
          'Axe\'s Era Enterprise delivers software engineered to modern security and performance benchmarks. However, to the maximum extent permitted by applicable law, neither party shall be liable for indirect, incidental, punitive, or consequential damages (including lost profits or lost business opportunities).',
          'The total aggregate liability of Axe\'s Era Enterprise arising from any contract or service shall not exceed the total fees paid by the Client to Axe\'s Era Enterprise for the specific service module in question during the prior six (6) months.'
        ]
      },
      {
        id: 'governing-jurisdiction',
        title: '10. Governing Jurisdiction & Legal Inquiries',
        paragraphs: [
          'These Terms are governed by commercial arbitration standards and applicable law in Multan, Pakistan. For questions regarding client contracts or Terms of Service, please contact gauharaxe@outlook.com or call +92-315-7338694.'
        ]
      }
    ]
  }
};
