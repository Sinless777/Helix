import { CardProps } from '@/components/Card'

export const ToolsCards: CardProps[] = [
  {
    title: 'Dev Tools',
    description: 'Build, test, deploy',
    listItems: [
      { text: 'Docker', href: 'https://www.docker.com/', role: 'Containerization' },
      { text: 'go-task', href: 'https://taskfile.dev/', role: 'Task Runner' },
      { text: 'Postman', href: 'https://www.postman.com/', role: 'API Testing' },
    ],
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Dev-Tools.png',
    // link: '/tools',
    // buttonText: 'Learn More',
  },
]
