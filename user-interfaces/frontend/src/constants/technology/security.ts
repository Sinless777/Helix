import { CardProps } from '@/components/Card'

export const SecurityCards: CardProps[] = [
  {
    title: 'Security & Compliance',
    description: 'Encryption, scanning, certificates',
    listItems: [
      {
        text: 'Vault',
        href: 'https://www.vaultproject.io/',
        role: 'Secrets Management',
      },
      {
        text: 'CertManager',
        href: 'https://cert-manager.io/',
        role: 'TLS Certificates',
      },
      {
        text: 'Trivy',
        href: 'https://aquasecurity.github.io/trivy/',
        role: 'Vulnerability Scanner',
      },
      {
        text: 'Falco ',
        href: 'https://falco.org/',
        role: 'Runtime Security Monitoring',
      },
      {
        text: 'Wuzzah',
        href: 'https://wuzzah.io/',
        role: 'Security Posture Management',
      },
      {
        text: 'KubeArmor',
        href: 'https://kubearmor.io/',
        role: 'Runtime Security Policy Enforcement',
      },
    ],
    image:
      'https://cdn.sinlessgamesllc.com/Helix-AI/images/Security-&-Compliance.png',
    // link: '/security',
    // buttonText: 'Learn More',
  },
]
