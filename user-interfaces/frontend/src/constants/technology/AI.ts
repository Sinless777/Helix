import { CardProps } from '@/components/Card'

export const AIToolsCards: CardProps[] = [
  {
    title: 'AI & ML',
    description: 'Machine learning, DNN & NLP',
    listItems: [
      { text: 'OpenAI', href: 'https://openai.com/', role: 'LLMs & APIs' },
      {
        text: 'Claude Sonnet',
        href: 'https://claude.ai/',
        role: 'Anthropic LLM',
      },
      {
        text: 'Hugging Face',
        href: 'https://huggingface.co/',
        role: 'Transformer Models',
      },
      {
        text: 'TensorFlow',
        href: 'https://www.tensorflow.org/',
        role: 'ML Framework',
      },
    ],
    image: 'https://cdn.sinlessgamesllc.com/Helix-AI/images/ai-tools.png',
  },
]
