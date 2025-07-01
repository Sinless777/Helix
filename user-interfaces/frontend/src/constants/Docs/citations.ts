// Type definitions for APA-style citations (allowing 'n.d.')

export type APACitation = {
  author: string; // e.g., "Smith, J., & Doe, A."
  year: string | number; // Publication year or "n.d." if not dated
  title: string; // Title of the work
  source: string; // Journal, book, website, or other source
  volume?: string | number; // Volume number if applicable
  issue?: string | number; // Issue number if applicable
  pages?: string; // Page range, e.g., "12–34"
  url?: string; // DOI, URL, or other identifier
  category:
    | "academic"
    | "legal"
    | "Third-Party Application"
    | "Programming Package"
    | "AI Model"
    | "AI Service"
    | "AI Platform"
    | "AI Framework"
    | "AI Library"
    | "AI Tool"
    | "AI API"
    | "AI SDK"
    | "AI Plugin"
    | "AI Extension"
    | "AI Component"
    | "AI System"
    | "AI Architecture"
    | "AI Design Pattern"
    | "AI Methodology"
    | "AI Approach"
    | "AI Technique";
};

/** Aggregated citation data for a page */
export interface CitationPageData {
  title: string;
  description?: string;
  citations: APACitation[];
}

/**
 * Complete list of citations in APA format
 */
export const Citations: CitationPageData = {
  title: "Citations",
  description: `A curated compilation of all sources cited throughout this documentation, formatted in APA style to ensure consistency with academic and industry standards. Entries are organized alphabetically and include full publication details—author(s), year, title, source, volume/issue/pages when available, and direct URLs or DOIs for quick reference. This list supports rigorous source tracking, aiding both scholarly review and practical implementation.`,
  citations: [
    {
      author: "Benbasat, I., & Freedman, D.",
      year: 1997,
      title: "Interface design for open APIs",
      source: "Journal of Computer Science",
      volume: 12,
      issue: 3,
      pages: "233–245",
      category: "academic",
    },
    {
      author: "Docsy",
      year: 2023,
      title: "Docsy: Documentation Website Guide",
      source: "Docsy",
      url: "https://www.docsy.dev/docs/",
      category: "Third-Party Application",
    },
    {
      author: "Hugo",
      year: "n.d.",
      title: "Hugo Documentation",
      source: "Hugo",
      url: "https://gohugo.io/documentation/",
      category: "Third-Party Application",
    },
    {
      author: "Newman, S.",
      year: 2015,
      title: "Building Microservices",
      source: "O’Reilly Media",
      category: "academic",
    },
    {
      author: "Abadi, M., et al.",
      year: 2016,
      title:
        "TensorFlow: Large-scale machine learning on heterogeneous systems",
      source: "arXiv",
      volume: "1603.04467",
      category: "AI Framework",
    },
    {
      author: "Hunter, J. D.",
      year: 2007,
      title: "Matplotlib: A 2D graphics environment",
      source: "Computing in Science & Engineering",
      volume: 9,
      issue: 3,
      pages: "90–95",
      category: "Programming Package",
    },

    {
      author: "Sutton, R. S., & Barto, A. G.",
      year: 2018,
      title: "Reinforcement Learning: An Introduction (2nd ed.)",
      source: "MIT Press",
      category: "academic",
    },
    {
      author: "Turing, A. M.",
      year: 1950,
      title: "Computing machinery and intelligence",
      source: "Mind",
      volume: 59,
      issue: 236,
      pages: "433–460",
      category: "academic",
    },
    {
      author: "OpenAI",
      year: 2023,
      title: "ChatGPT: Large language models for conversation",
      source: "OpenAI",
      url: "https://openai.com/",
      category: "AI Service",
    },
    {
      author: "LangChain",
      year: 2023,
      title: "LangChain Documentation",
      source: "LangChain",
      url: "https://python.langchain.com/",
      category: "AI Framework",
    },
    {
      author: "Ollama",
      year: 2024,
      title: "On-device generative AI",
      source: "Ollama",
      url: "https://ollama.ai/",
      category: "AI Service",
    },

    {
      author: "Council of Europe",
      year: 1981,
      title:
        "Convention for the Protection of Individuals with Regard to Automatic Processing of Personal Data (ETS No. 108)",
      source: "Council of Europe",
      url: "https://www.coe.int/en/web/conventions/full-list/-/conventions/treaty/108",
      category: "legal",
    },
    {
      author: "Council of Europe",
      year: 2001,
      title: "Convention on Cybercrime (ETS No. 185)",
      source: "Council of Europe",
      url: "https://www.coe.int/en/web/conventions/full-list/-/conventions/treaty/185",
      category: "legal",
    },
    {
      author: "European Union",
      year: 2016,
      title: "Regulation (EU) 2016/679 (GDPR)",
      source: "EUR-Lex",
      url: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
      category: "legal",
    },
    {
      author: "African Union",
      year: 2014,
      title:
        "African Union Convention on Cyber Security and Personal Data Protection",
      source: "African Union",
      url: "https://au.int/en/treaties/african-union-convention-cyber-security-and-personal-data-protection",
      category: "legal",
    },

    {
      author: "Brazil",
      year: 2018,
      title: "Lei Geral de Proteção de Dados Pessoais (LGPD)",
      source: "Brazil",
      url: "https://lgpd-brazil.info/",
      category: "legal",
    },
    {
      author: "United States",
      year: 1996,
      title:
        "Health Insurance Portability and Accountability Act of 1996 (HIPAA)",
      source: "Public Law 104–191",
      url: "https://www.govinfo.gov/content/pkg/PLAW-104publ191/pdf/PLAW-104publ191.pdf",
      category: "legal",
    },
    {
      author: "United States",
      year: 1998,
      title: "Children’s Online Privacy Protection Act (COPPA)",
      source: "US Code Title 15, Chap. 91",
      url: "https://www.govinfo.gov/app/details/USCODE-2010-title15/USCODE-2010-title15-chap91",
      category: "legal",
    },
    {
      author: "United States",
      year: 2018,
      title: "California Consumer Privacy Act of 2018 (CCPA)",
      source: "California Legislature",
      url: "https://leginfo.legislature.ca.gov/faces/billTextClient.xhtml?bill_id=201720180AB375",
      category: "legal",
    },
    {
      author: "Canada",
      year: 2000,
      title:
        "Personal Information Protection and Electronic Documents Act (PIPEDA)",
      source: "Justice Laws Website",
      url: "https://laws-lois.justice.gc.ca/eng/acts/P-8.6/",
      category: "legal",
    },
    {
      author: "China",
      year: 2021,
      title:
        "Personal Information Protection Law of the People’s Republic of China",
      source: "National People’s Congress",
      url: "http://www.npc.gov.cn/englishnpc/c23934/202112/1c3b0c2e7f9c4a6f866f9e8a6f8898a6f.shtml",
      category: "legal",
    },
    {
      author: "India",
      year: 2023,
      title: "Digital Personal Data Protection Act, 2023",
      source: "Ministry of Electronics & IT, India",
      url: "https://www.meity.gov.in/writereaddata/files/Digital%20Personal%20Data%20Protection%20Act%2C%202023.pdf",
      category: "legal",
    },
    {
      author: "South Africa",
      year: 2013,
      title: "Protection of Personal Information Act (POPIA)",
      source: "Government of South Africa",
      url: "https://www.justice.gov.za/legislation/acts/2013-004.pdf",
      category: "legal",
    },
    {
      author: "United Kingdom",
      year: 2018,
      title: "Data Protection Act 2018",
      source: "Legislation.gov.uk",
      url: "https://www.legislation.gov.uk/ukpga/2018/12/contents/enacted",
      category: "legal",
    },
    {
      author: "Australia",
      year: 1988,
      title: "Privacy Act 1988",
      source: "Federal Register of Legislation",
      url: "https://www.legislation.gov.au/Series/C2004A03712",
      category: "legal",
    },

    {
      author: "United States",
      year: 2018,
      title: "50 U.S.C. § 3341. Security clearances",
      source: "US Code",
      url: "https://uscode.house.gov/view.xhtml?path=/prelim@title50/chapter45/subchapter3&edition=prelim",
      category: "legal",
    },
    {
      author: "United States",
      year: 2009,
      title:
        "Executive Order No. 13526: Classified National Security Information",
      source: "Federal Register, Vol. 75, No. 248",
      category: "legal",
    },
    {
      author: "Department of Defense",
      year: 2013,
      title: "National Industrial Security Program Operating Manual (NISPOM)",
      source: "DoD",
      category: "legal",
    },
    {
      author: "U.S. General Services Administration",
      year: "n.d.",
      title: "Federal Acquisition Regulation (48 C.F.R. Chapter 1)",
      source: "GSA",
      category: "legal",
    },
    {
      author: "U.S. Department of State",
      year: "n.d.",
      title: "Security Clearances",
      source: "U.S. Department of State",
      url: "https://www.state.gov/securityclearances",
      category: "legal",
    },

    {
      author: "Kardashev, N. S.",
      year: 1964,
      title: "Transmission of information by extraterrestrial civilizations",
      source: "Soviet Astronomy",
      volume: 8,
      issue: 2,
      pages: "217–221",
      category: "academic",
    },
    {
      author: "Shklovskiĭ, I. S., & Sagan, C.",
      year: 1966,
      title: "Intelligent Life in the Universe",
      source: "Holden-Day",
      category: "academic",
    },
    {
      author: "Vakoch, D., & Harrison, A. (Eds.)",
      year: 2011,
      title:
        "The Drake Equation: Estimating the Prevalence of Extraterrestrial Life through the Ages",
      source: "Cambridge University Press",
      category: "academic",
    },
    {
      author: "Davies, P. C. W.",
      year: 2010,
      title: "The Eerie Silence: Renewing Our Search for Alien Intelligence",
      source: "Houghton Mifflin Harcourt",
      category: "academic",
    },
    {
      author: "Tegmark, M.",
      year: 2003,
      title: "Parallel Universes",
      source: "Scientific American",
      volume: 288,
      issue: 5,
      pages: "40–51",
      category: "academic",
    },
    {
      author: "Ćirković, M. M.",
      year: 2018,
      title:
        "The Great Silence: Science and Philosophy of Fermi’s Paradox (3rd ed.)",
      source: "Oxford University Press",
      category: "academic",
    },
    {
      author: "What If",
      year: "2023, December 14",
      title: "The Kardashev Scale: Type I to Type VII Civilizations [Video]",
      source: "YouTube",
      url: "https://youtu.be/9J2K-KQ2psk",
      category: "Third-Party Application",
    },
    {
      author: "Wisdom for Life",
      year: 2021,
      title: "Fermi Paradox – Where are all the Aliens? [Video]",
      source: "YouTube",
      category: "Third-Party Application",
    },
    {
      author: "World Knowledge Forum",
      year: 2025,
      title: "The Ethics of AI │ Stuart J. Russell (UC Berkeley) [Video]",
      source: "YouTube",
      category: "Third-Party Application",
    },
  ],
};
