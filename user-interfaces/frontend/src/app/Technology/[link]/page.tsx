"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { technology } from "@frontend/constants";
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
} from "@mui/material";
import Header from "@frontend/components/Header";
import { headerProps } from "@frontend/constants/header";
import { CardProps, ListItemProps, HelixCard } from "@frontend/components/Card";

export default function TechnologyPage() {
  const router = useRouter();
  const params = useParams();
  const [error, setError] = useState(false);

  // Extract the "ai-tools" part from [...link]
  const raw = Array.isArray(params.link) ? params.link[0] : params.link ?? "";
  const routePath = `/Technology/${raw}`;
  const normalizedRoute = routePath.toLowerCase();

  console.log(
    "TechnologyPage",
    `raw link = ${raw}, routePath = ${routePath}, normalizedRoute = ${normalizedRoute}`
  );

  // Load and flatten all cards
  const technologyCards: CardProps[] = useMemo(() => {
    try {
      const cards = Object.values(technology).flat();
      console.log(
        "TechnologyPage",
        `Loaded ${cards.length} cards. Links: ${cards
          .map((c) => c.link)
          .join(", ")}`
      );
      return cards;
    } catch (e) {
      console.error("TechnologyPage", "Error loading cards:", e);
      setError(true);
      return [];
    }
  }, []);

  // Find the matching card by full path
  const technologyCard = useMemo(() => {
    const found = technologyCards.find(
      (card) => (card.link ?? "").toLowerCase() === normalizedRoute
    );
    console.log(
      "TechnologyPage",
      found
        ? `Found card: ${found.title}`
        : `No card matches normalizedRoute "${normalizedRoute}"`
    );
    if (!found) {
      setError(true);
    }
    return found;
  }, [technologyCards, normalizedRoute]);

  // If we hit an error and no card, redirect after a short delay
  useEffect(() => {
    if (error && !technologyCard) {
      console.warn(
        "TechnologyPage",
        "Redirecting to /Technology in 1.5s due to missing card"
      );
      const timer = setTimeout(() => router.push("/Technology"), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [error, technologyCard, router]);

  // Graceful fallback UI while redirect is pending or on error
  if (error || !technologyCard) {
    return (
      <Container maxWidth="md" sx={{ textAlign: "center", mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Oops — page not found
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          We couldn’t find a technology matching <strong>{raw}</strong>.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/Technology")}>
          Back to Technologies
        </Button>
      </Container>
    );
  }

  const { title, description, listItems } = technologyCard;

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Header {...headerProps} />

      <Container
        maxWidth="lg"
        sx={{
          pt: { xs: 4, md: 8, lg: 14 },
          pb: { xs: 6, md: 10 },
        }}
      >
        <Box mb={4} textAlign="center">
          <Typography variant="h3" component="h1" sx={{ color: "white" }}>
            {title}
          </Typography>
          {description && (
            <Typography variant="subtitle1" sx={{ color: "white" }}>
              {description}
            </Typography>
          )}
        </Box>

        <Grid 
          container 
          spacing={2} 
          columns={{ xs: 1, sm: 2, md: 4 }}
        >
          {listItems?.map((item: ListItemProps, idx: number) => (
            <Grid key={idx} size={1} sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              }}>
              <HelixCard
                title={item.text}
                image={item.image ?? ""}
                description={item.detailedDescription}
                link={item.href ?? ""}
                sx={{
                  maxHeight: 400
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
