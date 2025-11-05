// app/contact/layout.tsx

import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Contact Helix AI | Reach Out for Support, Sales & Partnerships',
  description:
    "Get in touch with the Helix AI team for product support, sales inquiries, or partnership opportunities. We're here to help you harness the power of adaptive AI in your workflows.",
  keywords: [
    'Contact Helix AI',
    'Helix AI support',
    'Helix AI sales',
    'AI partnership',
    'digital companion support',
    'adaptive AI inquiries',
    'workflow automation help',
  ],
  authors: [{ name: 'SinLess Games LLC', url: 'https://sinlessgamesllc.com' }],
  publisher: 'SinLess Games LLC',
  applicationName: 'Helix AI',
  robots: { index: true, follow: true },
  alternates: {
    canonical: 'https://helixai.com/contact',
  },
  openGraph: {
    title: 'Contact Helix AI | Reach Out for Support, Sales & Partnerships',
    description:
      "Get in touch with the Helix AI team for product support, sales inquiries, or partnership opportunities. We're here to help you harness the power of adaptive AI in your workflows.",
    url: 'https://helixai.com/contact',
    siteName: 'Helix AI',
    images: [
      {
        url: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_Contact_Card.png',
        width: 1200,
        height: 630,
        alt: 'Contact Helix AI',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Helix AI | Reach Out for Support, Sales & Partnerships',
    description:
      'Have questions or need help? Contact Helix AI for support, sales, or partnership opportunities. Our team is ready to assist you.',
    images: ['https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_Contact_Card.png'],
    site: '@Sinless777',
    creator: '@Sinless777',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <main id="contact" className="flex flex-col min-h-screen bg-black text-white">
      {children}
    </main>
  );
}
