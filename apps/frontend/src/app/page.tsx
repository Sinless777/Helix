'use client';

import { DevelopmentBanner, Header, HeroSection } from '@helix-ai/ui';
import { headerProps } from '../content/header';

const HERO_DATA = {
  title: 'Meet Helix AI — Your Intelligent Companion for a Smarter Digital Life',
  subtitle:
    'Seamlessly connect, automate, and analyze with an AI assistant built to simplify tasks, enhance productivity, and empower your decisions across every platform you use.',
  imageUrl: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Helix_Logo.png',
  imageAlt: 'Helix AI Visual',
} as const;

export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only fixed left-4 top-4 z-[60] rounded-md bg-white/10 px-3 py-2 text-sm backdrop-blur hover:bg-white/20"
      >
        Skip to content
      </a>

      <Header {...headerProps} pages={headerProps.pages} />
      <DevelopmentBanner sx={{ mb: 2 }} />

      <main
        id="main-content"
        className="flex-grow pt-20 sm:pt-24 md:pt-28 lg:pt-32 xl:pt-32 px-4 md:px-8"
      >
        <HeroSection
          title={HERO_DATA.title}
          subtitle={HERO_DATA.subtitle}
          imageUrl={HERO_DATA.imageUrl}
          imageAlt={HERO_DATA.imageAlt}
        />
      </main>
    </div>
  );
}
