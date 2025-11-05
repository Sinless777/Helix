// libs/shared/site-content/src/lib/about/index.ts

export interface AboutSection {
  title: string;
  icon?: string;
  paragraphs: string[];
}

export const AboutContent: AboutSection[] = [
  {
    title: '🌟 Who We Are',
    icon: '✨',
    paragraphs: [
      'Helix AI is your intelligent digital companion—designed to unify your tools, simplify your workflows, and empower your decisions through real-time insights and adaptive AI. We believe the future of productivity isn’t just about automation—it’s about intelligent assistance that understands your world and grows with you.',
      'Built with cutting-edge technologies like machine learning, deep neural networks, and reinforcement learning, Helix AI continuously learns from your preferences, infrastructure, and integrated platforms. Whether you’re managing cloud deployments, tracking analytics, or seeking real-time alerts, Helix AI becomes a natural extension of how you work and make decisions.',
      'Helix AI isn’t just another tool—it’s a trusted partner that helps you move faster, smarter, and with greater confidence across all your digital environments.',
    ],
  },
  {
    title: '🎯 Our Mission',
    icon: '🚀',
    paragraphs: [
      'Empowering humans through intelligent systems. Our mission is to radically simplify and elevate the way people engage with technology. Helix AI is more than a virtual assistant—it is a trusted digital companion that communicates naturally, acts intelligently, and adapts continuously.',
      'Built on a modern, cloud-native foundation and infused with advanced AI—including deep learning, live data feeds, and reinforcement learning—Helix automates everyday tasks, monitors infrastructure, and connects seamlessly to everything from social media to smart homes. And while it acts independently, Helix always puts the user first—requesting verification when it matters and staying transparent by design.',
      'Whether you’re deploying code, analyzing data, or dimming the lights in your living room, Helix exists to help you work faster, think clearer, and feel in control—all through a single, secure, conversational interface.',
    ],
  },
  {
    title: '🧬 Our Story',
    icon: '📖',
    paragraphs: [
      'Helix started with a simple question: What if your systems could talk to you? After over four years of research, design, and experimentation, Helix has grown from a bold idea into a deeply engineered AI assistant—built by developers tired of endless dashboards, alert fatigue, and siloed tools.',
      'Our vision was simple: make digital systems not only observable, but understandable—through conversation, automation, and context-aware intelligence. Helix brings that vision to life by turning infrastructure, data, and services into something you can talk to, trust, and act on. Built with heart and hardened by production realities, Helix is here to change how humans interact with the machines that run their lives.',
    ],
  },
  {
    title: '🧑‍💻 Meet the Team',
    icon: '👥',
    paragraphs: [
      'A tight-knit group of builders, thinkers, and technologists passionate about reimagining how humans and machines interact. From cloud architects and AI researchers to full-stack developers and UX designers, our team is united by one vision: to make digital assistance feel natural, intelligent, and truly personal.',
      '(Bios, photos, and more are available in our GitHub repository.)',
    ],
  },
];
