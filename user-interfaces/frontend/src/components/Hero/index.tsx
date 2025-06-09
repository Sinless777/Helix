"use client";

import React from "react";
import Grid from "@mui/material/Grid";
import { Box, Typography } from "@mui/material";
import Image from "next/image";
import styles from "./hero.module.scss";
import { BotColors } from "@/constants/bot";
import HeroWaitlist from "@/components/Hero/hero-waitlist";

type HeroSectionProps = {
  title: string;
  subtitle: string;
  imageUrl: string;
  imageAlt?: string;
};

export const HeroSection: React.FC<HeroSectionProps> = ({
  title,
  subtitle,
  imageUrl,
  imageAlt = "Hero Image",
}) => {
  return (
    <Box
      className={styles.heroSection}
      sx={{
        px: { xs: "1.5rem", md: "4rem" },
        py: { xs: "3rem", md: "5rem" },
        mx: { xs: "1rem", md: "2rem" },
        borderRadius: "0.75rem",
        backgroundColor: "rgba(30, 30, 30, 0.7)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      {/* Updated Grid v2 usage: no item prop, use size for breakpoints */}
      <Grid container spacing={4} alignItems="center" sx={{ width: "100%" }}>
        {/* Image Column */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ textAlign: "center", p: { xs: 2, md: 0 } }}
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            width={400}
            height={400}
            priority
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </Grid>

        {/* Text Column */}
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{
            textAlign: { xs: "center", md: "left" },
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontWeight: "bold",
              color: BotColors.bot.pink.hex,
              fontSize: {
                xs: "1.75rem",
                sm: "2.25rem",
                md: "3rem",
                lg: "4rem",
              },
              textAlign: { xs: "center", md: "left" },
            }}
            gutterBottom
          >
            {title}
          </Typography>
          <Typography
            component="p"
            sx={{
              color: "#6a8db0",
              fontSize: { xs: "1rem", sm: "1.125rem", md: "1.25rem" },
              textAlign: { xs: "center", md: "left" },
            }}
          >
            {subtitle}
          </Typography>
        </Grid>

        {/* Waitlist Form */}
        <Grid size={12} sx={{ textAlign: "center" }}>
          <HeroWaitlist />
        </Grid>
      </Grid>
    </Box>
  );
};

export default HeroSection;
