import { CardProps } from '@/components/Card'


export const FrameworksCards: CardProps[] = [
  {
    title: 'Frameworks',
    description: 'Frontend, APIs & backend logic',
    listItems: [
      { text: 'Next.js', href: 'https://nextjs.org/', role: 'React Framework' },
      { text: 'React', href: 'https://reactjs.org/', role: 'UI Library' },
      { text: 'tRPC', href: 'https://trpc.io/', role: 'Type-safe APIs' },
      { text: 'NestJS', href: 'https://nestjs.com/', role: 'Scalable Node.js Backend' },
      { text: 'ExpressJS', href: 'https://expressjs.com/', role: 'Minimal Web Framework' },
      { text: 'MikroORM', href: 'https://mikro-orm.io/', role: 'TypeScript ORM' },
    ],
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Frameworks.png',
  },
]
