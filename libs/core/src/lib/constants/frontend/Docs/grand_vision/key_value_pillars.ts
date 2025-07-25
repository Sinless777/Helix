// user-interfaces/frontend/src/constants/Docs/grand_vision/key_value_pillars.ts

export interface Pillars {
  title: string
  description: string
}

export const KeyValuePillars: Pillars[] = [
  {
    title: 'Adaptability',
    description:
      'Helix AI adapts continuously to each user’s behavior, workflow, and contextual environment. By leveraging machine learning feedback loops and user-centric design, the system refines itself over time to become more effective, intuitive, and personalized for every individual and team it supports.',
  },
  {
    title: 'Transparency',
    description:
      'All decision-making processes are observable and explainable. From model predictions to system actions, users are provided with traceable audit trails, clear visual explanations, and the ability to understand, challenge, or override AI behavior where appropriate.',
  },
  {
    title: 'Open Source',
    description:
      'We believe in building Helix AI in the open. All major components, including the models, orchestration logic, and observability tools, are released under permissive licenses to enable community-driven growth, collective innovation, and global trust through peer review.',
  },
  {
    title: 'Ethical Innovation',
    description:
      'Every aspect of Helix’s development is grounded in ethics: respecting human dignity, minimizing algorithmic harm, and upholding user agency. The project embraces multidisciplinary input from philosophy, law, and social science to shape responsible and equitable AI systems.',
  },
  {
    title: 'Security',
    description:
      'Helix is designed for the highest levels of operational security—adhering to military-grade standards such as NIST SP 800-53, HIPAA, and DISA STIG. Our systems implement zero-trust principles, role-based access controls, encrypted data paths, container isolation, and continuous threat monitoring.',
  },
]
