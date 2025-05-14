import { CardProps } from '@/components/Card'

export const DataStorageCards: CardProps[] = [
  {
    title: 'Data & Messaging',
    description: 'Databases, object storage, brokers & caches',
    listItems: [
      { text: 'PostgreSQL', href: 'https://www.postgresql.org/', role: 'Relational Database' },
      { text: 'MongoDB', href: 'https://www.mongodb.com/', role: 'NoSQL Document Database' },
      { text: 'Redis', href: 'https://redis.io/', role: 'In-Memory Cache & Store' },
      { text: 'Kafka', href: 'https://kafka.apache.org/', role: 'Distributed Message Broker' },
      { text: 'RabbitMQ', href: 'https://www.rabbitmq.com/', role: 'Message Queue System' },
      { text: 'AWS S3', href: 'https://aws.amazon.com/s3/', role: 'Cloud Object Storage' },
      { text: 'Cloudflare R2', href: 'https://developers.cloudflare.com/r2/', role: 'S3-Compatible Object Storage' },
    ],
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/Data-&-Messaging.png',
    // link: '/data-storage',
    // buttonText: 'Learn More',
  },
]
