import { CardProps } from "@/components/Card";

export const ProgrammingLanguagesCards: CardProps[] = [
  {
    title: "Programming Languages",
    description:
      "The core languages that power Helix AI services, ranging from type‑safe web front‑ends to high‑performance systems and data‑science back‑ends.",
    listItems: [
      {
        text: "TypeScript 5.5",
        href: "https://www.typescriptlang.org/",
        role: "Typed JavaScript",
        detailedDescription:
          "TypeScript 5.5 (Apr 2025) adds exhaustiveness checking for switch expressions, auto‑narrowing on `const` JSX props, and incremental project references that cut monorepo builds by up to 35 %. It compiles to ES2024, integrating seamlessly with React 19 and Next.js 14 toolchains."
      },
      {
        text: "JavaScript (ES2024)",
        href: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
        role: "Web Runtime Language",
        detailedDescription:
          "ES2024 finalises explicit resource management (`using`), brings pipeline operator `|>`, and expands Temporal date‑time APIs. Modern bundlers like Vite 6 and Turbopack emit native top‑level await and module workers for faster, more secure client code."
      },
      {
        text: "Python 3.13",
        href: "https://www.python.org/",
        role: "AI & Data Science",
        detailedDescription:
          "Python 3.13 (Oct 2025 roadmap) introduces removing the Global Interpreter Lock (GIL) as an optional build, `f‑strings` with self‑doc expressions, and performance boosts from the no‑GIL specializing adaptive interpreter—keeping it the lingua franca for ML frameworks like TensorFlow and PyTorch."
      },
      {
        text: "Go 1.23",
        href: "https://go.dev/",
        role: "Cloud‑Native Systems",
        detailedDescription:
          "Go 1.23 (Aug 2025) stabilises the memory arena API, adds `try`‑syntax proposal experiments behind a build tag, and ships PGO‑guided inlining that improves server throughput by 8‑12 % in real‑world benchmarks like Caddy and Prometheus."
      },
      {
        text: "Rust 1.78",
        href: "https://www.rust-lang.org/",
        role: "Safe Systems Development",
        detailedDescription:
          "Rust 1.78 (Jul 2025) stabilises async traits, expands the borrow checker’s Polonius migration, and enables MIR inlining for 5 % smaller binaries. The `cargo nextest` profile is now shipped by default, streamlining CI for high‑concurrency back‑ends."
      },
      {
        text: "C# 13",
        href: "https://learn.microsoft.com/dotnet/csharp/whats-new/csharp-13",
        role: "Enterprise Applications",
        detailedDescription:
          "C# 13 (Nov 2024, .NET 9) debuts `params Span<T>` for zero‑alloc APIs, primary constructors for all types, and intercepted `await using` scopes, enabling safer high‑performance microservices on ASP.NET Core."
      },
      {
        text: "Ruby 4.0",
        href: "https://www.ruby-lang.org/en/",
        role: "Rapid Web Prototyping",
        detailedDescription:
          "Ruby 4.0 (Dec 2024) merges YJIT 3.0 with tiered native code caching, Fiber scheduler improvements, and built‑in Ractor debugger, delivering 2× faster Rails page renders while retaining the language’s developer‑friendly ergonomics."
      },
      {
        text: "Kotlin 2.0",
        href: "https://kotlinlang.org/",
        role: "Multiplatform Development",
        detailedDescription:
          "Kotlin 2.0 (Mar 2025) completes the K2 compiler rewrite, unlocks Lightning IR for 30 % faster incremental builds, and brings Compose Multiplatform to stable—allowing shared UI code across Android, iOS, Desktop, and Web targets."
      }
    ],
    image: "https://cdn.sinlessgamesllc.com/Helix-AI/images/technology/Programming-Languages.png",
    link: "/languages",
    buttonText: "Explore languages"
  }
];
