"use client";

import React from "react";
import { Box, Typography, Divider, useTheme } from "@mui/material";

export default function IntroductionPage() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: { xs: 3, md: 6 },
        maxWidth: "960px",
        mx: "auto",
        color: "#FAFAFA",
        lineHeight: 1.75,
      }}
    >
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
        Grand Vision: <span style={{ color: "#66CCFF" }}>Introduction</span>
      </Typography>

      <Typography variant="body1" paragraph sx={{ color: "#CCCCCC", mb: 4 }}>
        Helix AI aims to revolutionize human-computer collaboration by
        seamlessly blending state-of-the-art machine learning models with
        user-centric design. We envision a future where AI systems not only
        understand context and intent but also adapt in real-time to individual
        workflows and team dynamics. By harnessing modular architectures,
        open-source contributions, and transparent processes, Helix AI empowers
        developers, data scientists, and end‑users alike to co-create
        intelligent solutions that are trustworthy, customizable, and ethically
        grounded.
      </Typography>

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#66CCFF", fontWeight: 600 }}
      >
        Why Helix AI?
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: "#CCCCCC" }}>
        Imagine having a trusted partner that never stops learning—one that
        supercharges your own expertise instead of sidelining it. That’s Helix
        AI. Whether you’re a busy professional, a government strategist, or a
        military commander, Helix AI adapts to how you work, offering
        crystal-clear insights into every recommendation and safeguarding your
        sensitive data with iron-clad privacy and fairness controls.
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: "#CCCCCC" }}>
        No jargon. No hidden agendas. Just intelligent tools that watch what you
        do, learn from it, and help you make faster, smarter decisions—every
        time. From powering citizen services to optimizing defense operations,
        Helix AI is built on human-centered design, ensuring it’s as trustworthy
        as the people who use it. Ready to elevate your mission? Embrace Helix
        AI today—because the future belongs to teams that combine human
        brilliance with machine precision.
      </Typography>

      <Divider sx={{ my: 5, borderColor: "#333" }} />

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#66CCFF", fontWeight: 600 }}
      >
        Key Value Pillars
      </Typography>

      {[
        [
          "Adaptability",
          "Systems that dynamically tailor themselves to individual user workflows and preferences.",
        ],
        [
          "Transparency",
          "100% transparency: Interpretable models that provide actionable insights and clear reasoning paths.",
        ],
        [
          "Open Source",
          "All code and models released under permissive open source licenses to foster community collaboration.",
        ],
        [
          "Ethical Innovation",
          "Ensuring fairness, accountability, and user agency throughout development.",
        ],
        [
          "Security",
          "We aim to meet the rigorous security requirements of the world’s militaries.",
        ],
      ].map(([title, desc], i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, color: "#88CCFF" }}
          >
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: "#CCCCCC" }}>
            {desc}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 5, borderColor: "#333" }} />

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#66CCFF", fontWeight: 600 }}
      >
        Roadmap Phases
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: "#CCCCCC" }}>
        Our roadmap is divided into six progressive phases:
      </Typography>

      {[
        [
          "Foundation",
          "Establish core APIs, data pipelines, and foundational UI components.",
        ],
        [
          "Expansion",
          "Enhance model adaptability, introduce collaboration features, and scale infrastructure.",
        ],
        [
          "Maturity",
          "Refine transparency tools, optimize performance, and achieve enterprise-grade stability.",
        ],
        [
          "Collaboration",
          "Enable community-driven plugins and real-time multi-user collaboration.",
        ],
        [
          "Optimization",
          "Optimize inference latency, resource efficiency, and cost-effectiveness.",
        ],
        [
          "Enterprise",
          "Deliver enterprise-grade deployment, governance, and compliance tools.",
        ],
      ].map(([title, desc], i) => (
        <Box key={i} sx={{ mb: 3 }}>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, color: "#88CCFF" }}
          >
            Phase {i + 1}: {title}
          </Typography>
          <Typography variant="body1" sx={{ color: "#CCCCCC" }}>
            {desc}
          </Typography>
        </Box>
      ))}

      <Divider sx={{ my: 5, borderColor: "#333" }} />

      <Typography
        variant="h4"
        gutterBottom
        sx={{ color: "#66CCFF", fontWeight: 600 }}
      >
        Innovation Criteria
      </Typography>
      <Typography variant="body1" paragraph sx={{ color: "#CCCCCC" }}>
        To ensure alignment with our vision, every feature is evaluated against
        the following 20 criteria:
      </Typography>

      <Box component="ol" sx={{ pl: 3, color: "#CCCCCC" }}>
        {[
          "User Impact: Does it significantly improve productivity or decision-making?",
          "Explainability: Can users understand and trust the AI’s suggestions?",
          "Scalability: Is the solution designed to grow with diverse use cases and data volumes?",
          "Performance: Does it operate efficiently under expected loads?",
          "Usability: Is the interface intuitive and easy to navigate?",
          "Accessibility: Does it meet accessibility standards for all users?",
          "Security: Are user data and operations protected against threats?",
          "Privacy: Does it safeguard user information and comply with regulations?",
          "Interoperability: Can it integrate seamlessly with other systems?",
          "Maintainability: Is the codebase organized for easy updates and fixes?",
          "Extensibility: Can new features be added with minimal rework?",
          "Reliability: Does it function consistently under various conditions?",
          "Robustness: Can it handle unexpected inputs and errors gracefully?",
          "Flexibility: Is it adaptable to changing requirements?",
          "Cost-effectiveness: Does it provide value relative to its development and operational costs?",
          "Ethical Compliance: Does it adhere to ethical guidelines and standards?",
          "Transparency: Are all processes fully visible and documented?",
          "Auditability: Can actions and decisions be traced and reviewed?",
          "Community Engagement: Does it encourage contributions and feedback from users?",
          "Localization: Does it support multiple languages and regional settings?",
        ].map((text, idx) => (
          <li key={idx}>
            <Typography variant="body1" paragraph sx={{ color: "#CCCCCC" }}>
              {text}
            </Typography>
          </li>
        ))}
      </Box>
    </Box>
  );
}
