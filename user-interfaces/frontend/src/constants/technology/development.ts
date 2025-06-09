import { CardProps } from "@/components/Card";

export const DevelopmentCards: CardProps[] = [
  {
    title: "Development",
    description: "Modern CI/CD & GitOps workflows",
    listItems: [
      {
        text: "GitHub Actions",
        href: "https://github.com/features/actions",
        role: "CI/CD Automation",
      },
      { text: "FluxCD", href: "https://fluxcd.io/", role: "GitOps Tool" },
      {
        text: "ArgoCD",
        href: "https://argoproj.github.io/argo-cd/",
        role: "GitOps for Kubernetes",
      },
      { text: "GitHub", href: "https://github.com/", role: "Code Hosting" },
      { text: "GitLab", href: "https://gitlab.com/", role: "Code Hosting" },
      {
        text: "Terraform",
        href: "https://www.terraform.io/",
        role: "Infrastructure as Code",
      },
      {
        text: "Ansible",
        href: "https://www.ansible.com/",
        role: "Configuration Management",
      },
    ],
    image: "https://cdn.sinlessgamesllc.com/Helix-AI/images/Development.png",
    // link: '/development',
    // buttonText: 'Learn More',
  },
];
