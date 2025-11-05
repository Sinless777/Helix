type ContactOption = {
  title: string;
  description: string;
  link: string;
  buttonText: string;
  image?: string;
  bgColor?: string;
};

export const CONTACT_OPTIONS: ContactOption[] = [
  {
    title: 'Join Our Discord',
    description:
      'Connect with the community and get real-time support. Chat with the team, suggest ideas, and stay updated.',
    link: 'https://discord.gg/Za8MVstYnr',
    buttonText: 'Join Discord',
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Join-Our-Discord.png',
    bgColor: '#143256',
  },
  {
    title: 'Email Support',
    description:
      'Need help? Contact our support team directly. We typically respond within 24-48 hours.',
    link: 'mailto:support@helixaibot.com',
    buttonText: 'Send Email',
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Email-Support.png',
    bgColor: '#143256',
  },
  {
    title: 'Request a Feature',
    description:
      'Got an idea? Help shape the future of Helix AI by following our GitHub issue template.',
    link: 'https://github.com/SinLess-Games/Helix-AI/issues',
    buttonText: 'Submit Request',
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Request-a-Feature.png',
    bgColor: '#143256',
  },
  {
    title: 'Report a Bug',
    description:
      "Found something that doesn't work quite right? Let us know and we'll investigate promptly.",
    link: 'https://github.com/SinLess-Games/Helix-AI/issues/new?template=bug_report.md',
    buttonText: 'Report Bug',
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Report-a-Bug.png',
    bgColor: '#143256',
  },
  {
    title: 'Give Feedback',
    description:
      'Your opinion matters. Share your thoughts on your experience with Helix AI and help us improve.',
    link: 'https://docs.google.com/forms/d/e/1FAIpQLSd8dEXyqvkMrkt4YOHqTwYw620qBXbT3R9MnWjDHEdOeX4EnA/viewform?usp=sharing',
    buttonText: 'Leave Feedback',
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Give-Feedback.png',
    bgColor: '#143256',
  },
];
