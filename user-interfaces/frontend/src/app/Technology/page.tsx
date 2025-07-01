// src/app/Technology/page.tsx
"use client";

import React from "react";
import Script from "next/script";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Helix_Card, { CardProps } from "@frontend/components/Card";
import * as Constants from "@frontend/constants/technology";
import Header from "@frontend/components/Header";
import { headerProps } from "@frontend/constants/header";

export default function Technology() {
  const allCards: CardProps[] = Object.values(Constants).flat();

  // alphabetize cards by title
  allCards.sort((a, b) => a.title.localeCompare(b.title));

  return (
    <Box sx={{ position: "relative", minHeight: "100vh" }}>
      {/* Initialize AdSense slots */}
      <Script id="ads-init" strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>

      {/* Side Ad Slots */}
      {["left", "right"].map((side) => (
        <Box
          key={side}
          component="ins"
          className="adsbygoogle"
          sx={{
            position: "fixed",
            top: "50%",
            [side]: 0,
            transform: "translateY(-50%)",
            width: 120,
            height: 600,
            zIndex: 1000,
            display: { xs: "none", lg: "block" },
          }}
          data-ad-format="vertical"
          data-full-width-responsive="false"
        />
      ))}

      {/* Header */}
      <Header {...headerProps} />

      {/* Page Title */}
      <Box sx={{ pt: { xs: 4, md: 8, lg: 14 }, pb: { xs: 6, md: 10 } }}>
        <Typography
          variant="h3"
          component="h1"
          sx={{ textAlign: "center", fontWeight: "bold", color: "#fff" }}
        >
          Technology
        </Typography>
        <Typography
          variant="h5"
          component="p"
          sx={{ textAlign: "center", mt: 1, color: "#fff", padding: "2rem" }}
        >
          Helix AI is built on a foundation of modern, battle-tested
          technologies—each carefully chosen to ensure performance, reliability,
          scalability, and security. From cloud infrastructure and orchestration
          to real-time analytics, AI frameworks, and robust observability
          stacks, every tool in our ecosystem plays a strategic role. We
          leverage powerful third-party APIs and open-source libraries not only
          to accelerate innovation but to deliver a seamless, responsive, and
          intelligent experience to our users. Transparency is a core value at
          Helix; that&apos;s why we proudly share the technologies we rely on
          and link directly to their official documentation. Whether you&apos;re
          a developer, researcher, or simply curious, we invite you to explore
          the systems that power Helix. Behind every feature is a stack
          engineered to evolve, scale, and serve—because great technology should
          never be invisible, just intuitive.
        </Typography>
      </Box>

      {/* Cards Grid wrapped in Container for side gutters */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Grid container spacing={{ xs: 2, md: 4 }}>
          {allCards.map((card, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 6, md: 4 }}>
              <Helix_Card {...card} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
