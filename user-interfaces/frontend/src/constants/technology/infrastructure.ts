import { CardProps } from '@/components/Card'

export const InfrastructureCards: CardProps[] = [
  {
    title: 'Infrastructure',
    description: 'Provisioning, orchestration & scaling',
    listItems: [
      {
        text: 'Terraform',
        href: 'https://www.terraform.io/',
        role: 'Infrastructure as Code',
      },
      {
        text: 'Ansible',
        href: 'https://www.ansible.com/',
        role: 'Configuration Management',
      },
      {
        text: 'K3s (Kubernetes)',
        href: 'https://k3s.io/',
        role: 'Lightweight Kubernetes Distribution',
      },
      {
        text: 'Helm',
        href: 'https://helm.sh/',
        role: 'Kubernetes Package Manager',
      },
      {
        text: 'containerd',
        href: 'https://containerd.io/',
        role: 'Container Runtime',
      },
      {
        text: 'System Upgrade Controller',
        href: 'https://docs.k3s.io/upgrades/',
        role: 'Cluster Upgrade Automation',
      },
      {
        text: 'Rook',
        href: 'https://rook.io/',
        role: 'Cloud-Native Storage Orchestration',
      },
    ],
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Infrastructure.png',
  },
]
